# PROJECT STATE

## Current checkpoint — 2026-09-06

### Telegram Auto Post + AI Chat human handoff
- Telegram vehicle ingest is connected to the automatic draft -> publish path.
- Auto-publish requires real AI `brand` + `model` and confidence >= 0.85.
- Deterministic vehicle IDs use `tg-<inboxId>`.
- `telegram_posts.car_id` remains the final duplicate-protection gate.
- Auto-published vehicle media uses `/media/<key>?branding=pt-xtra`.
- Original R2 source media is not modified.
- AI Chat unknown/out-of-scope questions are handed to a human, persisted in `ai_unknown_questions`, and routed to the CRM Telegram notification path when configured.
- Production-gate tests explicitly verify that unknown AI Chat does not call Workers AI and that Telegram auto-publish refuses missing identity/low confidence.

### PT Xtra image-branding implementation
- Added `public/branding/pt-xtra-plate.svg` as a display branding overlay, not a legal registration plate.
- Cloudflare Images binding `IMAGES` transforms R2 media for `/media/<key>?branding=pt-xtra`.
- Original source image remains unchanged in R2.
- If the Images binding or overlay asset is unavailable, branded delivery fails closed.
- Workers Cache is enabled for repeat transformed-image requests.

### CI / production evidence
- Run #69: `34024070540` — **success**.
- Head commit tested/deployed: `bd743df1d7f45fdac7e37c23a142fd91b928c7b2`.
- Validate job `101461868046`: **success**.
- Tests: **15 passed, 0 failed**.
- Production-gate tests passed for Telegram auto-publish and AI unknown -> human handoff.
- Wrangler dry-run passed with `env.IMAGES` binding visible.
- Production job `101461900700`: **success**.
- D1 remote migrations: **No migrations to apply**.
- Production Worker: `phanthuanxtra-v2`.
- Deployed production version: `6e8fe538-e817-4d0e-ba87-814f37cef1d0`.
- Production URL: `https://phanthuanxtra-v2.phanthuanmodelactor.workers.dev`.

### Safety
- `PT Xtra` is branding/display text only.
- The system never invents or overwrites a real legal registration plate number in vehicle data.
- No AI-generated vehicle facts are added by the branding layer.
- Unknown AI questions do not get an AI-generated answer; they are routed to human support.

### Agent model
AI1–AI5 are equal peer agents. Specializations are perspectives, not hierarchy or ownership.


## Admin publishing boundary — 2026-09-10
- Canonical publishing Admin: `https://admin.phanthuanxtra.com/`.
- Ask AI Admin is separate: `https://ask-ai-agent.phanthuanmodelactor.workers.dev/admin`.
- Treat them as separate applications/security boundaries.
- Current Admin work must be evidence-driven: domain mapping, runtime deployment, API, D1/R2, authentication, publishing, security, UX, tests, and Android/S21 regression.
- Do not claim Admin production health or credentials without direct evidence.
