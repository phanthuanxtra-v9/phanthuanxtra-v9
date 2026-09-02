import v2 from "./v2-production.js";
import { handleCmsApi } from "./cms.js";

export default {
  async fetch(request, env, ctx) {
    const cmsResponse = await handleCmsApi(request, env);
    if (cmsResponse) return cmsResponse;

    return v2.fetch(request, env, ctx);
  },

  async scheduled(event, env, ctx) {
    if (typeof v2.scheduled === "function") {
      return v2.scheduled(event, env, ctx);
    }
  }
};
