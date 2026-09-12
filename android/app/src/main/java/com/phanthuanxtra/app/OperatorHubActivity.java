package com.phanthuanxtra.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

/** XTRA operator cockpit. No provider credentials are collected or stored here. */
public final class OperatorHubActivity extends Activity {
    private static final String CHAT_ORIGIN = "https://ask-ai-agent.phanthuanmodelactor.workers.dev";
    private static final String CHAT_URL = CHAT_ORIGIN + "/";
    private static final String SITE_URL = "https://phanthuanxtra.com/";
    private static final int BLACK = Color.rgb(5,5,5), CARBON = Color.rgb(16,18,20);
    private static final int GOLD = Color.rgb(212,175,55), SOFT_GOLD = Color.rgb(231,201,104);
    private static final int JADE = Color.rgb(0,168,132), WHITE = Color.rgb(244,245,242), SILVER = Color.rgb(169,175,181);
    private TextView status;

    @Override public void onCreate(Bundle state) { super.onCreate(state); build(); }

    private GradientDrawable bg(int color, float radius, int strokeColor, int strokeWidth) {
        GradientDrawable g = new GradientDrawable(); g.setColor(color); g.setCornerRadius(radius); if (strokeWidth > 0) g.setStroke(strokeWidth, strokeColor); return g;
    }
    private TextView text(String value, float size, int color) {
        TextView v = new TextView(this); v.setText(value); v.setTextSize(size); v.setTextColor(color); v.setPadding(4, 8, 4, 8); return v;
    }
    private Button button(String label, View.OnClickListener listener, boolean primary) {
        Button b = new Button(this); b.setText(label); b.setTextColor(primary ? BLACK : WHITE); b.setTextSize(13); b.setAllCaps(false);
        b.setGravity(Gravity.CENTER); b.setMinHeight(52); b.setPadding(12, 0, 12, 0); b.setOnClickListener(listener);
        b.setBackground(bg(primary ? GOLD : CARBON, 16, primary ? GOLD : Color.rgb(54,58,60), 1)); return b;
    }
    private void gap(LinearLayout root, int h) { TextView g = new TextView(this); root.addView(g, new LinearLayout.LayoutParams(1,h)); }
    private LinearLayout card() { LinearLayout c = new LinearLayout(this); c.setOrientation(LinearLayout.VERTICAL); c.setPadding(18,14,18,16); c.setBackground(bg(CARBON, 20, Color.rgb(43,46,48), 1)); return c; }

    private void build() {
        LinearLayout root = new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL); root.setPadding(16,18,16,10); root.setBackgroundColor(BLACK);
        LinearLayout head = new LinearLayout(this); head.setOrientation(LinearLayout.HORIZONTAL); head.setGravity(Gravity.CENTER_VERTICAL);
        TextView brand = text("PHAN THUẦN XTRA", 22, WHITE); brand.setTypeface(null, android.graphics.Typeface.BOLD); head.addView(brand, new LinearLayout.LayoutParams(0, -2, 1));
        TextView live = text("● LIVE", 12, JADE); live.setTypeface(null, android.graphics.Typeface.BOLD); head.addView(live); root.addView(head);
        root.addView(text("SHOWROOM COMMAND CENTER  •  PREMIUM OPERATIONS", 10, SOFT_GOLD)); gap(root,10);

        LinearLayout security = card();
        security.addView(text("SECURITY BOUNDARY", 11, SOFT_GOLD));
        security.addView(text("Credential management is disabled in this cockpit. Provider/API secrets are not collected, displayed, or stored by this screen.", 11, WHITE));
        security.addView(text("Use the authenticated APK management flow for application API access.", 10, SILVER));
        root.addView(security); gap(root,10);

        LinearLayout quick = card(); quick.addView(text("QUICK CONTROL", 11, SOFT_GOLD));
        quick.addView(button("QUẢN LÝ APK  ›", v -> startActivity(new Intent(this, MainActivity.class)), true)); gap(quick,6);
        quick.addView(button("PHANTHUANXTRA.COM  ↗", v -> startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(SITE_URL))), false));
        root.addView(quick); gap(root,10);

        LinearLayout aiHead = new LinearLayout(this); aiHead.setGravity(Gravity.CENTER_VERTICAL);
        TextView ai = text("ASK AI AGENT", 16, WHITE); ai.setTypeface(null, android.graphics.Typeface.BOLD); aiHead.addView(ai,new LinearLayout.LayoutParams(0,-2,1));
        aiHead.addView(text("● AI / JADE", 10, JADE)); root.addView(aiHead); root.addView(text("TRỢ LÝ ĐIỀU HÀNH XTRA",10,SILVER));
        WebView chat = new WebView(this);
        WebSettings ws = chat.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setBuiltInZoomControls(false);
        ws.setDisplayZoomControls(false);
        ws.setAllowFileAccess(false);
        ws.setAllowContentAccess(false);
        ws.setJavaScriptCanOpenWindowsAutomatically(false);
        ws.setSupportMultipleWindows(false);
        chat.setWebChromeClient(new WebChromeClient());
        chat.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !isAllowed(request.getUrl());
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return !isAllowed(Uri.parse(url));
            }
            private boolean isAllowed(Uri uri) {
                return "https".equalsIgnoreCase(uri.getScheme()) && CHAT_ORIGIN.equalsIgnoreCase(uri.getScheme() + "://" + uri.getHost());
            }
        });
        chat.setBackgroundColor(BLACK); chat.loadUrl(CHAT_URL);
        root.addView(chat,new LinearLayout.LayoutParams(-1,0,1));
        status=text("Sẵn sàng. Credential surface đã bị khóa; WebView chỉ cho phép origin AI đã cấu hình.",10,SILVER); status.setGravity(Gravity.CENTER_VERTICAL); root.addView(status);
        setContentView(root);
    }
}
