import legacy from "./index.js";
import { handleCmsApi } from "./cms.js";
import { handleTelegramApi } from "./telegram.js";
import { handleTelegramIngest } from "./telegram-ingest.js";

export default {
  async fetch(request, env, ctx) {
    try {
      const ingestResponse = await handleTelegramIngest(request, env);
      if (ingestResponse) return ingestResponse;
      const telegramResponse = await handleTelegramApi(request, env);
      if (telegramResponse) return telegramResponse;
      const cmsResponse = await handleCmsApi(request, env);
      if (cmsResponse) return cmsResponse;
      return legacy.fetch(request, env, ctx);
    } catch (error) {
      console.error("telegram_or_worker_request", String(error?.message || error));
      return new Response(JSON.stringify({ok:false,error:"Internal Server Error"}),{status:500,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
    }
  }
};
