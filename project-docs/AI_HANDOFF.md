# AI HANDOFF

## Shared peer model
AI1, AI2, AI3, AI4 and AI5 are equal peer agents working on the same project. Role labels are specializations/perspectives, not authority or ownership.

## Completed checkpoint — 2026-09-06
- AI unknown-question mock-D1 blocker fixed and production-gate tested.
- Identity routing tightened.
- Unknown/out-of-scope AI Chat is handed to a human and does not call Workers AI.
- Telegram AI draft -> publish safety gate remains: real `brand` + `model` and confidence >= 0.85.
- Deterministic car IDs use `tg-<inboxId>`.
- Telegram duplicate protection remains enforced by `telegram_posts`.
- PT Xtra display branding is live for auto-published vehicle media.
- Cloudflare Images binding `IMAGES` transforms R2 media for `/media/<key>?branding=pt-xtra`.
- Auto-publish stores the branded media URL in `car_images`.
- Original R2 image is not modified.
- Branding is explicitly non-legal: `PT Xtra` is not a fabricated registration plate number.

## Verification
- Run #69: `34024070540` **success**.
- Validate job `101461868046` **success**.
- Tests: **15 passed, 0 failed**.
- Production-gate tests passed for Telegram auto-publish and AI human handoff.
- Production job `101461900700` **success**.
- D1 migrations: **No migrations to apply**.
- Production Worker: `phanthuanxtra-v2`.
- Production version: `6e8fe538-e817-4d0e-ba87-814f37cef1d0`.

## Safety boundary
- No missing vehicle facts are fabricated.
- No legal plate number is invented or overwritten.
- If the Images binding/overlay asset is unavailable, branded delivery fails closed.
- Original media remains accessible without `branding=pt-xtra`.
- Unknown AI questions are persisted and routed to human support instead of being answered by guesswork.

## Next agent
Read `PROJECT_STATE.md` and this file first. Run #69 is the current production verification checkpoint. Preserve Telegram idempotence, AI human-handoff behavior, and vehicle data integrity when extending the pipeline.


## ADMIN CONTINUITY — 2026-09-10
- `admin.phanthuanxtra.com` is the PHAN THUAN XTRA vehicle/content publishing Admin, not Ask AI Admin.
- Ask AI Admin remains `ask-ai-agent.phanthuanmodelactor.workers.dev/admin` and is a separate boundary.
- Do not invent credentials or Cloudflare resource mappings.
- Admin release gate: CI → deployment evidence → auth smoke test → CRUD/media/publish → public-site verification → security regression → Android/S21 regression.
- GitHub Environment `production` is now explicitly bound to the Cloudflare production deploy job by PR #61.
