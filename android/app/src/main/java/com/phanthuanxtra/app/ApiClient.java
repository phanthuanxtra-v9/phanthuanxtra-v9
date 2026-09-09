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
        boolean publicEndpoint = path.equals("/health") || path.endsWith("/health");
        String token = authStore.get();
        if (!publicEndpoint && token.isEmpty()) throw new Exception("Chưa nhập APP API token");

        HttpURLConnection connection = (HttpURLConnection) new URL(baseUrl + path).openConnection();
        connection.setRequestMethod(method);
        connection.setConnectTimeout(20000);
        connection.setReadTimeout(60000);
        connection.setRequestProperty("Accept", "application/json");
        if (!token.isEmpty()) connection.setRequestProperty("Authorization", "Bearer " + token);
        if (raw != null || json != null) {
            connection.setDoOutput(true);
            connection.setRequestProperty("Content-Type", contentType == null ? "application/json" : contentType);
            try (OutputStream out = connection.getOutputStream()) {
                if (raw != null) out.write(raw);
                else out.write(json.getBytes(StandardCharsets.UTF_8));
            }
        }
        int code = connection.getResponseCode();
        String body = read(code >= 400 ? connection.getErrorStream() : connection.getInputStream());
        connection.disconnect();
        return code + "\n" + body;
    }

    /**
     * Checked request boundary. GET/health requests may retry transient failures with
     * bounded exponential backoff. Non-idempotent writes are never retried automatically.
     */
    public String requestChecked(String method, String path, String json, byte[] raw, String contentType) throws Exception {
        final boolean retryable = "GET".equalsIgnoreCase(method);
        int attempts = retryable ? 3 : 1;
        long delay = 500L;
        Exception lastError = null;
        for (int attempt = 1; attempt <= attempts; attempt++) {
            try {
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
                Thread.sleep(delay);
                delay *= 2L;
            }
        }
        throw lastError == null ? new Exception("API request failed") : lastError;
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
            while ((line = reader.readLine()) != null) result.append(line).append('\n');
        }
        return result.toString();
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
