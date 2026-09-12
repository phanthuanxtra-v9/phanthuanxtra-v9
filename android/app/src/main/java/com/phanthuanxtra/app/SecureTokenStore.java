package com.phanthuanxtra.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;

import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/** Encrypted local storage for optional operator credentials. Tokens never leave the device automatically. */
public final class SecureTokenStore {
    private static final String KEYSTORE = "AndroidKeyStore";
    private static final String KEY_ALIAS = "phanthuanxtra_operator_tokens_v1";
    private static final String PREFS = "secure_operator_tokens";
    private static final String CF_TOKEN = "cloudflare_token";
    private static final String CF_IV = "cloudflare_iv";
    private static final String GH_TOKEN = "github_token";
    private static final String GH_IV = "github_iv";

    private final SharedPreferences prefs;

    public SecureTokenStore(Context context) {
        prefs = context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    private SecretKey key() throws Exception {
        KeyStore ks = KeyStore.getInstance(KEYSTORE);
        ks.load(null);
        if (!ks.containsAlias(KEY_ALIAS)) {
            KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, KEYSTORE);
            generator.init(new KeyGenParameterSpec.Builder(KEY_ALIAS,
                    KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                    .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                    .setUserAuthenticationRequired(false)
                    .build());
            generator.generateKey();
        }
        return ((KeyStore.SecretKeyEntry) ks.getEntry(KEY_ALIAS, null)).getSecretKey();
    }

    public synchronized void saveCloudflare(String token) throws Exception { save(CF_TOKEN, CF_IV, token); }
    public synchronized void saveGitHub(String token) throws Exception { save(GH_TOKEN, GH_IV, token); }
    public synchronized String getCloudflare() { return get(CF_TOKEN, CF_IV); }
    public synchronized String getGitHub() { return get(GH_TOKEN, GH_IV); }
    public synchronized void clearCloudflare() { clear(CF_TOKEN, CF_IV); }
    public synchronized void clearGitHub() { clear(GH_TOKEN, GH_IV); }
    public synchronized void clearAll() {
        clearCloudflare();
        clearGitHub();
    }

    private void save(String valueKey, String ivKey, String token) throws Exception {
        String value = token == null ? "" : token.trim();
        if (value.isEmpty()) { clear(valueKey, ivKey); return; }
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, key());
        prefs.edit()
                .putString(valueKey, Base64.encodeToString(cipher.doFinal(value.getBytes(StandardCharsets.UTF_8)), Base64.NO_WRAP))
                .putString(ivKey, Base64.encodeToString(cipher.getIV(), Base64.NO_WRAP))
                .apply();
    }

    private String get(String valueKey, String ivKey) {
        try {
            String encoded = prefs.getString(valueKey, "");
            String encodedIv = prefs.getString(ivKey, "");
            if (encoded.isEmpty() || encodedIv.isEmpty()) return "";
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key(), new GCMParameterSpec(128, Base64.decode(encodedIv, Base64.NO_WRAP)));
            return new String(cipher.doFinal(Base64.decode(encoded, Base64.NO_WRAP)), StandardCharsets.UTF_8);
        } catch (Exception e) {
            clear(valueKey, ivKey);
            return "";
        }
    }

    private void clear(String valueKey, String ivKey) {
        prefs.edit().remove(valueKey).remove(ivKey).apply();
    }
}
