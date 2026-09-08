# Workers AI CONNECTION AUDIT — 2026-09-08

## Dashboard evidence supplied in session
- Workers AI is available in the Cloudflare account.
- Daily usage shown: 0 / 10,000 neurons at the time of the supplied dashboard view.
- Text Generation cost metric shown: 398.79 neurons.

## Repository configuration
`wrangler.json` declares the existing Workers AI binding:

- binding: `AI`
- Worker: `phanthuanxtra-v2`
- entry: `src/entry.js`

No new Worker AI resource is required merely to connect the existing binding.

## Runtime usage
`src/ai-chat.js` already calls `env.AI.run(...)`.
Primary model:
`@cf/zai-org/glm-4.7-flash`

Fallback model:
`@cf/meta/llama-3.2-3b-instruct`

The primary model is attempted first and fallback is used only if the primary call fails. This is intentional to improve resilience without introducing an external paid API dependency.

## Vehicle AI
Vehicle processing also receives `env` and uses the existing AI-backed vehicle analysis path. The Auto Telegram flow stores the source image in existing R2, analyzes it, applies a confidence/plate gate, and only creates a PT Xtra publish image when the gate passes.

## Safety / release decision
Do not create a second AI binding or new AI service from guesswork. The existing `AI` binding is the correct integration point.

Workers AI Dashboard availability does NOT prove the production Worker version currently running has the latest GitHub source, because the latest production deployment was blocked at D1 authentication (`10000` / `9109`).

Therefore:
- Workers AI account availability: PASS based on user-supplied Dashboard evidence.
- Source binding: PASS.
- Source runtime integration: PASS.
- Latest source deployed to production: BLOCKED until Cloudflare/GitHub credential issue is repaired.
- Final APK release: remains blocked until production deployment and E2E checks pass.
