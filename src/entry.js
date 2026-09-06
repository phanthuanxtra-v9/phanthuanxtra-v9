import legacy from "./index.js";
import { handleCmsApi } from "./cms.js";
import { handleTelegramApi } from "./telegram.js";

export default {
  async fetch(request, env, ctx) {
    const telegramResponse = await handleTelegramApi(request, env);
    if (telegramResponse) return telegramResponse;
    const cmsResponse = await handleCmsApi(request, env);
    if (cmsResponse) return cmsResponse;
    return legacy.fetch(request, env, ctx);
  }
};
