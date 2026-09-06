# AI HANDOFF

## Shared peer model
AI1, AI2, AI3, AI4 and AI5 are equal peer agents working on the same project. Role labels are specializations/perspectives, not authority or ownership.

## Completed checkpoint — 2026-09-06
- AI unknown-question mock-D1 blocker fixed with optional `r?.meta?.last_row_id` handling.
- Identity routing tightened so a customer's name mention does not incorrectly classify an unrelated request as an identity question.
- Telegram AI draft -> publish is connected behind a safety gate: real `brand` + `model` and confidence >= 0.85.
- Deterministic car IDs use `tg-<inboxId>`.
- R2 media is retained and served via `/media/<key>`.
- `telegram_posts` is the final idempotency gate. A second publish returns `duplicate:true` without another Telegram send.
- PT Xtra branding layer added for vehicle media: `/media/<key>?branding=pt-xtra`.
- `public/branding/pt-xtra-plate.svg` is the display plate asset.
- Cloudflare Images binding `IMAGES` is enabled and the branded path transforms the R2 source without mutating the original object.
- Auto-publish now stores/uses the branded media URL for Telegram vehicle posts.
- Branding is explicitly non-legal: `PT Xtra` is not a fabricated registration plate number.
- Added tests: `tests/pt-xtra-media.test.mjs` and `tests/pt-xtra-plate.test.mjs`.
- CI workflow updated to execute the new branding tests.

## Verification state
- Previous production checkpoint was green: Run #58 `34023110015`, Worker version `ee69e468-dfc9-45d9-987d-8b2a2e268817`.
- New branding implementation is on main and has triggered a new CI/deploy cycle.
- Do not claim the new branding feature is production-active until the new run has a successful validate job and successful production deploy.

## Safety boundary
- No missing vehicle facts are fabricated.
- No legal license plate number is invented or overwritten.
- Original R2 image remains unchanged.
- If image transformation infrastructure is unavailable, branded delivery fails closed rather than silently publishing the unbranded vehicle image.

## Next agent
Read `PROJECT_STATE.md` and this file first. Check the latest GitHub Actions run for the newest main commit. If validate and production both succeed, record the run/job/version evidence here and in `PROJECT_STATE.md`. Do not restart the project or undo valid changes.
