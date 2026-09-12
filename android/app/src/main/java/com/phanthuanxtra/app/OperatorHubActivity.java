package com.phanthuanxtra.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

/** XTRA premium operator cockpit. Control-plane credentials are server-side only. */
public final class OperatorHubActivity extends Activity {
    private static final String CHAT_URL =
            "https://ask-ai-agent.phanthuanmodelactor.workers.dev/";
    private static final String CHAT_HOST =
            "ask-ai-agent.phanthuanmodelactor.workers.dev";

    private static final int BLACK = Color.rgb(5,5,5);
    private static final int CARBON = Color.rgb(16,18,20);
    private static final int GRAPHITE = Color.rgb(26,29,32);
    private static final int GOLD = Color.rgb(212,175,55);
    private static final int SOFT_GOLD = Color.rgb(231,201,104);
    private static final int JADE = Color.rgb(0,168,132);
    private static final int WHITE = Color.rgb(244,245,242);
    private static final int SILVER = Color.rgb(169,175,181);

    private TextView status;

    @Override
    public void onCreate(Bundle state) {
        super.onCreate(state);

        // Remove legacy on-device Cloudflare/GitHub credentials from older APK versions.
        new SecureTokenStore(this).clearAll();

        build();
    }

    private GradientDrawable bg(int color, float radius,
                                int strokeColor, int strokeWidth) {
        GradientDrawable g = new GradientDrawable();
        g.setColor(color);
        g.setCornerRadius(radius);
        if (strokeWidth > 0) g.setStroke(strokeWidth, strokeColor);
        return g;
    }

    private TextView text(String value, float size, int color) {
        TextView v = new TextView(this);
        v.setText(value);
        v.setTextSize(size);
        v.setTextColor(color);
        v.setPadding(4, 8, 4, 8);
        return v;
    }

    private Button button(String label, View.OnClickListener listener,
                          boolean primary) {
        Button b = new Button(this);
        b.setText(label);
        b.setTextColor(primary ? BLACK : WHITE);
        b.setTextSize(13);
        b.setAllCaps(false);
        b.setGravity(Gravity.CENTER);
        b.setMinHeight(52);
        b.setPadding(12, 0, 12, 0);
        b.setOnClickListener(listener);
        b.setBackground(bg(
                primary ? GOLD : CARBON,
                16,
                primary ? GOLD : Color.rgb(54,58,60),
                1
        ));
        return b;
    }

    private void gap(LinearLayout root, int h) {
        TextView g = new TextView(this);
        root.addView(g, new LinearLayout.LayoutParams(1, h));
    }

    private LinearLayout card() {
        LinearLayout c = new LinearLayout(this);
        c.setOrientation(LinearLayout.VERTICAL);
        c.setPadding(18,14,18,16);
        c.setBackground(bg(
                CARBON, 20, Color.rgb(43,46,48), 1
        ));
        return c;
    }

    private void build() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(16,18,16,10);
        root.setBackgroundColor(BLACK);

        LinearLayout head = new LinearLayout(this);
        head.setOrientation(LinearLayout.HORIZONTAL);
        head.setGravity(Gravity.CENTER_VERTICAL);

        TextView brand = text("PHAN THUẦN XTRA", 22, WHITE);
        brand.setTypeface(null, android.graphics.Typeface.BOLD);
        head.addView(brand, new LinearLayout.LayoutParams(0,-2,1));

        TextView live = text("● LIVE", 12, JADE);
        live.setTypeface(null, android.graphics.Typeface.BOLD);
        head.addView(live);
        root.addView(head);

        TextView rule = text(
                "SHOWROOM COMMAND CENTER  •  PREMIUM OPERATIONS",
                10, SOFT_GOLD
        );
        root.addView(rule);
        gap(root,10);

        LinearLayout security = card();
        security.addView(text("SECURE CONTROL PLANE", 11, SOFT_GOLD));
        security.addView(text(
                "Cloudflare/GitHub master credentials không được lưu trên APK.",
                11, WHITE
        ));
        security.addView(text(
                "Mọi thao tác control-plane phải đi qua production server-side authorization.",
                10, SILVER
        ));
        security.addView(text(
                "Legacy credentials trên thiết bị đã được purge.",
                10, JADE
        ));
        root.addView(security);
        gap(root,10);

        LinearLayout quick = card();
        quick.addView(text("QUICK CONTROL", 11, SOFT_GOLD));

        Button manage = button(
                "QUẢN LÝ APK  ›",
                v -> startActivity(new Intent(this, MainActivity.class)),
                true
        );
        quick.addView(manage);
        gap(quick,6);

        Button site = button(
                "PHANTHUANXTRA.COM  ↗",
                v -> startActivity(new Intent(
                        Intent.ACTION_VIEW,
                        Uri.parse("https://phanthuanxtra.com/")
                )),
                false
        );
        quick.addView(site);
        root.addView(quick);
        gap(root,10);

        LinearLayout aiHead = new LinearLayout(this);
        aiHead.setGravity(Gravity.CENTER_VERTICAL);

        TextView ai = text("ASK AI AGENT", 16, WHITE);
        ai.setTypeface(null, android.graphics.Typeface.BOLD);
        aiHead.addView(ai, new LinearLayout.LayoutParams(0,-2,1));
        aiHead.addView(text("● AI / JADE", 10, JADE));

        root.addView(aiHead);
        root.addView(text(
                "TRỢ LÝ ĐIỀU HÀNH XTRA", 10, SILVER
        ));

        WebView chat = new WebView(this);
        WebSettings ws = chat.getSettings();

        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setBuiltInZoomControls(false);
        ws.setDisplayZoomControls(false);

        ws.setAllowFileAccess(false);
        ws.setAllowContentAccess(false);
        ws.setAllowFileAccessFromFileURLs(false);
        ws.setAllowUniversalAccessFromFileURLs(false);
        ws.setMixedContentMode(
                WebSettings.MIXED_CONTENT_NEVER_ALLOW
        );

        CookieManager.getInstance()
                .setAcceptThirdPartyCookies(chat, false);

        chat.setWebChromeClient(new WebChromeClient());

        chat.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(
                    WebView view, WebResourceRequest request) {
                return handleNavigation(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(
                    WebView view, String url) {
                return handleNavigation(Uri.parse(url));
            }

            private boolean handleNavigation(Uri uri) {
                if (uri == null) return true;

                boolean allowed =
                        "https".equalsIgnoreCase(uri.getScheme())
                        && CHAT_HOST.equalsIgnoreCase(uri.getHost());

                if (allowed) {
                    return false;
                }

                String scheme = uri.getScheme();
                boolean externalHttp =
                        "https".equalsIgnoreCase(scheme)
                        || "http".equalsIgnoreCase(scheme);

                if (!externalHttp) {
                    setStatus("Liên kết không được phép.");
                    return true;
                }

                try {
                    startActivity(new Intent(
                            Intent.ACTION_VIEW, uri
                    ));
                } catch (Exception ignored) {
                    setStatus("Không thể mở liên kết ngoài.");
                }

                return true;
            }
        });

        chat.setBackgroundColor(BLACK);
        chat.loadUrl(CHAT_URL);

        root.addView(
                chat,
                new LinearLayout.LayoutParams(-1,0,1)
        );

        status = text(
                "Sẵn sàng. Control-plane credentials không nằm trên APK.",
                10, SILVER
        );
        status.setGravity(Gravity.CENTER_VERTICAL);
        root.addView(status);

        setContentView(root);
    }

    private void setStatus(String value) {
        if (status != null) status.setText(value);
    }
}
