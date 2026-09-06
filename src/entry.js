import legacy from "./index.js";
import { handleCmsApi } from "./cms.js";
import { handleTelegramApi } from "./telegram.js";
import { handleTelegramIngest, setTelegramWebhook, getTelegramWebhookStatus } from "./telegram-ingest.js";
import { handleMediaApi } from "./media.js";
import { handleAiChat } from "./ai-chat.js";
import { handleTelegramRouter } from "./telegram-router.js";
import { reconcileTelegramNotifications } from "./telegram-notifications.js";

const TELEGRAM_WEBHOOK_URL="https://phanthuanxtra.com/api/telegram/webhook";

export default {
  async fetch(request, env, ctx) {
    try {
      const aiChatResponse = await handleAiChat(request, env);
      if (aiChatResponse) return aiChatResponse;
      const telegramRouterResponse = await handleTelegramRouter(request, env, ctx);
      if (telegramRouterResponse) return telegramRouterResponse;
      const ingestResponse = await handleTelegramIngest(request, env, ctx);
      if (ingestResponse) return ingestResponse;
      const mediaResponse = await handleMediaApi(request, env);
      if (mediaResponse) return mediaResponse;
      const telegramResponse = await handleTelegramApi(request, env);
      if (telegramResponse) return telegramResponse;
      const cmsResponse = await handleCmsApi(request, env);
      if (cmsResponse) return cmsResponse;
      return legacy.fetch(request, env, ctx);
    } catch (error) {
      console.error("telegram_or_worker_request", String(error?.message || error));
      return new Response(JSON.stringify({ok:false,error:"Internal Server Error"}),{status:500,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
    }
  },

  async scheduled(controller, env, ctx) {
    try {
      const status=await getTelegramWebhookStatus(env,TELEGRAM_WEBHOOK_URL);
      console.log("telegram_webhook_status",JSON.stringify(status));
      if(!status.ok||!status.url_matches_expected){
        const result=await setTelegramWebhook(env,TELEGRAM_WEBHOOK_URL);
        console.log("telegram_webhook_self_heal_ok",JSON.stringify({url:TELEGRAM_WEBHOOK_URL,result,reason:status.ok?"url_mismatch":"status_unavailable"}));
        const verified=await getTelegramWebhookStatus(env,TELEGRAM_WEBHOOK_URL);
        console.log("telegram_webhook_post_heal_status",JSON.stringify(verified));
      }
    } catch (error) {
      console.error("telegram_webhook_self_heal_failed",String(error?.message||error));
    }
    try {
      const result=await reconcileTelegramNotifications(env);
      console.log("telegram_notifications_reconcile",JSON.stringify(result));
    } catch (error) {
      console.error("telegram_notifications_reconcile_failed",String(error?.message||error));
    }
  }
};