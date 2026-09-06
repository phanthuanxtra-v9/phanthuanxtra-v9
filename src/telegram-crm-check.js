export async function checkTelegramCrm(env, { sendTest = false } = {}) {
  const token = env.TELEGRAM_CRM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CRM_CHAT_ID;
  if (!token || !chatId) return { ok: false, configured: false };

  const call = async (method, payload) => {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload || {})
    });
    const data = await response.json().catch(() => ({}));
    return { response, data };
  };

  const me = await call('getMe');
  if (!me.response.ok || !me.data.ok) {
    return { ok: false, configured: true, tokenValid: false, error: String(me.data.description || `HTTP ${me.response.status}`) };
  }

  const chat = await call('getChat', { chat_id: chatId });
  if (!chat.response.ok || !chat.data.ok) {
    return { ok: false, configured: true, tokenValid: true, bot: { id: me.data.result.id, username: me.data.result.username }, chatValid: false, error: String(chat.data.description || `HTTP ${chat.response.status}`) };
  }

  let sent = false;
  if (sendTest) {
    const test = await call('sendMessage', {
      chat_id: chatId,
      text: '✅ PHAN THUẦN XTRA — Telegram CRM connection test\nBot: @' + String(me.data.result.username || '') + '\nWorker → Telegram Group: OK',
      disable_web_page_preview: true
    });
    sent = !!(test.response.ok && test.data.ok);
    if (!sent) return { ok: false, configured: true, tokenValid: true, chatValid: true, bot: { id: me.data.result.id, username: me.data.result.username }, chat: { id: chat.data.result.id, type: chat.data.result.type, title: chat.data.result.title }, sent: false, error: String(test.data.description || `HTTP ${test.response.status}`) };
  }

  return { ok: true, configured: true, tokenValid: true, chatValid: true, bot: { id: me.data.result.id, username: me.data.result.username }, chat: { id: chat.data.result.id, type: chat.data.result.type, title: chat.data.result.title }, sent };
}
