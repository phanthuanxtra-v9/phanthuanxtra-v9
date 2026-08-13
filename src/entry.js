import legacy from "./index.js";
import { handleCmsApi } from "./cms.js";

export default {
  async fetch(request, env, ctx) {
    const cmsResponse = await handleCmsApi(request, env);
    if (cmsResponse) return cmsResponse;
    return legacy.fetch(request, env, ctx);
  }
};
