import { handleAiChat } from "./ai-chat.js";

const clean = v => String(v ?? "").trim();

export async function handleTelegramAiChat(request, env) {
  const url = new URL(request.url);
  if (url.pathname !== "/api/telegram/ai-webhook") return null;
  if (request.method !== "POST") return new Response(JSON.stringify({ ok:false, error:"Method Not Allowed" }), { status:405, headers:{"content-type":"application/json"} });
  if (!env.TELEGRAM_CHAT_BOT_TOKEN) return new Response(JSON.stringify({ ok:false, error:"TELEGRAM_CHAT_BOT_TOKEN is not configured" }), { status:503, headers:{"content-type":"application/json"} });
  const secret = env.TELEGRAM_CHAT_WEBHOOK_SECRET;
  if (secret && request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== secret) return new Response(JSON.stringify({ ok:false, error:"Unauthorized" }), { status:401, headers:{"content-type":"application/json"} });
  const update = await request.json().catch(() => null);
  const message = update?.message || update?.edited_message || null;
  if (!message?.chat?.id) return new Response(JSON.stringify({ok:true,ignored:true}), {headers:{"content-type":"application/json"}});
  const text = clean(message.text || message.caption);
  if (!text) return new Response(JSON.stringify({ok:true,ignored:true}), {headers:{"content-type":"application/json"}});
  const chatId = String(message.chat.id);
  const body = { message:text, conversation_id:`telegram:${chatId}`, visitor_id:`telegram:${chatId}`, channel:"telegram" };
  const aiRequest = new Request(new URL("/api/ai-chat", request.url), { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify(body) });
  const aiResponse = await handleAiChat(aiRequest, env);
  const result = await aiResponse.json().catch(() => ({ok:false}));
  const reply = clean(result.reply);
  if (reply) {
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_CHAT_BOT_TOKEN}/sendMessage`, { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({chat_id:chatId, reply_to_message_id:Number(message.message_id||0), text:reply}) });
  }
  return new Response(JSON.stringify({ok:true, conversation_id:result.conversation_id || `telegram:${chatId}`, replied:Boolean(reply)}), {headers:{"content-type":"application/json"}});
}

export async function setTelegramAiWebhook(env, webhookUrl) {
  if (!env.TELEGRAM_CHAT_BOT_TOKEN) throw new Error("TELEGRAM_CHAT_BOT_TOKEN is not configured");
  const payload = { url:webhookUrl, allowed_updates:["message","edited_message"] };
  if (env.TELEGRAM_CHAT_WEBHOOK_SECRET) payload.secret_token = env.TELEGRAM_CHAT_WEBHOOK_SECRET;
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_CHAT_BOT_TOKEN}/setWebhook`, { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify(payload) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.description || "Telegram AI webhook setup failed");
  return data.result;
}
