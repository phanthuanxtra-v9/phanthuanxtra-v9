const MAX_TEXT = 1800;

const clean = (value, max = MAX_TEXT) => String(value ?? "").trim().slice(0, max);

export async function notifyTelegramCrm(env, payload) {
  const token = env.TELEGRAM_CRM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CRM_CHAT_ID;
  if (!token || !chatId) return { sent: false, configured: false };

  const source = payload.source === "test-drive" ? "TEST DRIVE FORM" : "WEBSITE AI CHAT";
  const lines = [
    payload.source === "test-drive" ? "🚗 LEAD — TRẢI NGHIỆM LÁI THỬ" : "🤖 LEAD — AI CHAT",
    `SOURCE: ${source}`,
    payload.name ? `👤 Tên: ${clean(payload.name, 120)}` : null,
    payload.phone ? `📞 SĐT: ${clean(payload.phone, 30)}` : null,
    payload.car ? `🚘 Xe quan tâm: ${clean(payload.car, 160)}` : null,
    payload.preferredTime ? `📅 Thời gian: ${clean(payload.preferredTime, 120)}` : null,
    payload.location ? `📍 Khu vực: ${clean(payload.location, 160)}` : null,
    payload.message ? `💬 ${clean(payload.message)}` : null,
    payload.conversationId ? `🆔 Conversation: ${clean(payload.conversationId, 100)}` : null,
    "🔗 https://phanthuanxtra.com/"
  ].filter(Boolean).join("\n\n");

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines,
        disable_web_page_preview: true
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      console.warn("telegram_crm_notify", String(data.description || `HTTP ${response.status}`));
      return { sent: false, configured: true };
    }
    return { sent: true, configured: true };
  } catch (error) {
    console.warn("telegram_crm_notify", String(error?.message || error));
    return { sent: false, configured: true };
  }
}
