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

    private String read(InputStream input) throws Exception {
        if (input == null) return "";
        StringBuilder result = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) result.append(line).append('\n');
        }
        return result.toString();
    }
}
