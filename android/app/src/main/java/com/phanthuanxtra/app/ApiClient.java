package com.phanthuanxtra.app;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/** Centralized HTTP boundary for the Android app API. */
public final class ApiClient {
    private final String baseUrl;
    private final AuthStore authStore;

    public ApiClient(String baseUrl, AuthStore authStore) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.authStore = authStore;
    }

    /** Raw compatibility method: returns HTTP status followed by a newline and response body. */
    public String request(String method, String path, String json, byte[] raw, String contentType) throws Exception {
        checkInterrupted();
        boolean publicEndpoint = path.equals("/health") || path.endsWith("/health");
        String token = authStore.get();
        if (!publicEndpoint && token.isEmpty()) throw new Exception("Chưa nhập APP API token");

        HttpURLConnection connection = open(method, path, contentType, token);
        try {
            checkInterrupted();
            if (raw != null || json != null) {
                connection.setDoOutput(true);
                try (OutputStream out = connection.getOutputStream()) {
                    checkInterrupted();
                    if (raw != null) out.write(raw);
                    else out.write(json.getBytes(StandardCharsets.UTF_8));
                }
            }
            checkInterrupted();
            return finish(connection);
        } finally {
            connection.disconnect();
        }
    }

    /**
     * Streaming request boundary for binary uploads. The payload is never materialized as a
     * byte[] by this class. A fixed content length is preferred so HttpURLConnection can avoid
     * buffering the request body; callers must enforce their own maximum payload size.
     */
    public String requestStream(String method, String path, InputStream raw, long contentLength, String contentType) throws Exception {
        if (raw == null) throw new IllegalArgumentException("raw input is null");
        checkInterrupted();
        boolean publicEndpoint = path.equals("/health") || path.endsWith("/health");
        String token = authStore.get();
        if (!publicEndpoint && token.isEmpty()) throw new Exception("Chưa nhập APP API token");

        HttpURLConnection connection = open(method, path, contentType, token);
        try {
            connection.setDoOutput(true);
            if (contentLength >= 0) connection.setFixedLengthStreamingMode(contentLength);
            else connection.setChunkedStreamingMode(8192);
            try (InputStream in = raw; OutputStream out = connection.getOutputStream()) {
                byte[] buffer = new byte[8192];
                int n;
                while ((n = in.read(buffer)) != -1) {
                    checkInterrupted();
                    out.write(buffer, 0, n);
                }
            }
            checkInterrupted();
            return finish(connection);
        } finally {
            connection.disconnect();
        }
    }

    /** Checked request boundary. GET requests may retry transient failures; writes never retry. */
    public String requestChecked(String method, String path, String json, byte[] raw, String contentType) throws Exception {
        final boolean retryable = "GET".equalsIgnoreCase(method);
        int attempts = retryable ? 3 : 1;
        long delay = 500L;
        Exception lastError = null;
        for (int attempt = 1; attempt <= attempts; attempt++) {
            try {
                checkInterrupted();
                String response = request(method, path, json, raw, contentType);
                int code = statusCode(response);
                if (code >= 200 && code < 300) return body(response);
                if (retryable && isTransient(code) && attempt < attempts) {
                    Thread.sleep(delay);
                    delay *= 2L;
                    continue;
                }
                throw new ApiException(code, body(response));
            } catch (ApiException e) {
                throw e;
            } catch (Exception e) {
                lastError = e;
                if (!retryable || attempt == attempts) throw e;
                checkInterrupted();
                Thread.sleep(delay);
                delay *= 2L;
            }
        }
        throw lastError == null ? new Exception("API request failed") : lastError;
    }

    /** Streaming binary requests are intentionally not retried because they are writes. */
    public String requestCheckedStream(String method, String path, InputStream raw, long contentLength, String contentType) throws Exception {
        checkInterrupted();
        String response = requestStream(method, path, raw, contentLength, contentType);
        checkInterrupted();
        int code = statusCode(response);
        if (code >= 200 && code < 300) return body(response);
        throw new ApiException(code, body(response));
    }

    private HttpURLConnection open(String method, String path, String contentType, String token) throws Exception {
        checkInterrupted();
        HttpURLConnection connection = (HttpURLConnection) new URL(baseUrl + path).openConnection();
        connection.setRequestMethod(method);
        connection.setConnectTimeout(20000);
        connection.setReadTimeout(60000);
        connection.setRequestProperty("Accept", "application/json");
        if (!token.isEmpty()) connection.setRequestProperty("Authorization", "Bearer " + token);
        if (contentType != null) connection.setRequestProperty("Content-Type", contentType);
        return connection;
    }

    private String finish(HttpURLConnection connection) throws Exception {
        try {
            checkInterrupted();
            int code = connection.getResponseCode();
            checkInterrupted();
            String body = read(code >= 400 ? connection.getErrorStream() : connection.getInputStream());
            checkInterrupted();
            return code + "\n" + body;
        } finally {
            connection.disconnect();
        }
    }

    private boolean isTransient(int code) {
        return code == 408 || code == 429 || code >= 500;
    }

    private int statusCode(String response) throws Exception {
        int newline = response.indexOf('\n');
        if (newline <= 0) throw new Exception("API response không hợp lệ");
        return Integer.parseInt(response.substring(0, newline).trim());
    }

    private String body(String response) {
        int newline = response.indexOf('\n');
        return newline < 0 ? "" : response.substring(newline + 1);
    }

    private String read(InputStream input) throws Exception {
        if (input == null) return "";
        StringBuilder result = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                checkInterrupted();
                result.append(line).append('\n');
            }
        }
        return result.toString();
    }

    private void checkInterrupted() throws OperationCancelledException {
        if (Thread.currentThread().isInterrupted()) throw new OperationCancelledException();
    }

    public static final class OperationCancelledException extends Exception {
        public OperationCancelledException() {
            super("API operation cancelled");
        }
    }

    public static final class ApiException extends Exception {
        public final int statusCode;
        public final String responseBody;

        public ApiException(int statusCode, String responseBody) {
            super("API HTTP " + statusCode + (responseBody.isEmpty() ? "" : ": " + responseBody.trim()));
            this.statusCode = statusCode;
            this.responseBody = responseBody;
        }
    }
}
