package com.phanthuanxtra.app;

import android.app.Activity;
import android.os.Bundle;
import android.text.InputType;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;

/** Secure operator hub. Cloudflare/GitHub credentials are stored locally only and are not injected into WebView. */
public final class OperatorHubActivity extends Activity {
    private static final String CHAT_URL = "https://ask-ai-agent.phanthuanmodelactor.workers.dev/";
    private SecureTokenStore tokenStore;
    private EditText cloudflareToken, githubToken;
    private TextView status;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        tokenStore = new SecureTokenStore(this);
        build();
    }

    private TextView text(String value, float size) {
        TextView v = new TextView(this);
        v.setText(value); v.setTextSize(size); v.setPadding(8, 10, 8, 10);
        return v;
    }

    private EditText secretField(String hint, String value) {
        EditText e = new EditText(this);
        e.setHint(hint); e.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
        e.setText(value == null ? "" : value);
        return e;
    }

    private Button button(String label, View.OnClickListener listener) {
        Button b = new Button(this); b.setText(label); b.setOnClickListener(listener); return b;
    }

    private void build() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL); root.setPadding(20, 20, 20, 12);
        root.addView(text("PHAN THUẦN XTRA\nQUẢN LÝ PHANTHUANXTRA.COM", 20));
        root.addView(text("CẤU HÌNH HỆ THỐNG", 16));

        cloudflareToken = secretField("Cloudflare API token", tokenStore.getCloudflare());
        githubToken = secretField("GitHub token", tokenStore.getGitHub());
        root.addView(cloudflareToken);
        root.addView(githubToken);
        root.addView(button("LƯU TOKEN", v -> saveTokens()));
        root.addView(button("XÓA TOKEN CLOUDFLARE", v -> { tokenStore.clearCloudflare(); cloudflareToken.setText(""); setStatus("Đã xóa Cloudflare token khỏi thiết bị."); }));
        root.addView(button("XÓA TOKEN GITHUB", v -> { tokenStore.clearGitHub(); githubToken.setText(""); setStatus("Đã xóa GitHub token khỏi thiết bị."); }));
        root.addView(text("Bảo mật: token được mã hóa bằng Android Keystore và KHÔNG được tự động gửi vào Chat/WebView.", 13));

        root.addView(button("MỞ QUẢN LÝ APK", v -> startActivity(new Intent(this, MainActivity.class))));
        root.addView(button("MỞ PHANTHUANXTRA.COM", v -> startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://phanthuanxtra.com/")))));

        root.addView(text("ASK AI AGENT", 17));
        WebView chat = new WebView(this);
        WebSettings ws = chat.getSettings(); ws.setJavaScriptEnabled(true); ws.setDomStorageEnabled(true); ws.setBuiltInZoomControls(false); ws.setDisplayZoomControls(false);
        chat.setWebChromeClient(new WebChromeClient());
        chat.setBackgroundColor(Color.TRANSPARENT);
        chat.loadUrl(CHAT_URL);
        root.addView(chat, new LinearLayout.LayoutParams(-1, 0, 1));

        status = text("Sẵn sàng.", 13);
        root.addView(status);
        setContentView(root);
    }

    private void saveTokens() {
        try {
            tokenStore.saveCloudflare(cloudflareToken.getText().toString());
            tokenStore.saveGitHub(githubToken.getText().toString());
            setStatus("Đã lưu Cloudflare + GitHub token an toàn trên thiết bị.");
        } catch (Exception e) { setStatus("Không thể lưu token: " + e.getMessage()); }
    }

    private void setStatus(String value) { if (status != null) status.setText(value); }
}
