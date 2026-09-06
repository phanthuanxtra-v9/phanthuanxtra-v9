# PROJECT STATE

## Completed checkpoint — 2026-09-06

### CI
- Run #58: `34023110015` completed successfully.
- Validate job `101459199272`: **success**.
- Tests: AI chat + Telegram tests passed; syntax checks passed; Wrangler dry-run passed.
- Production job `101459235528`: **success**.
- D1 remote migrations: **No migrations to apply**.

### Production deployment
- Worker: `phanthuanxtra-v2`
- Production deployment: **success**.
- Current deployed version: `ee69e468-dfc9-45d9-987d-8b2a2e268817`.
- Worker URL reported by deploy: `https://phanthuanxtra-v2.phanthuanmodelactor.workers.dev`

## Telegram AI draft -> publish
- Telegram webhook remains idempotent by `source_hash`.
- AI draft is promoted only when `brand` + `model` exist and confidence >= 0.85.
- Deterministic vehicle ID: `tg-<inboxId>`.
- R2 source image is retained and exposed through the Worker `/media/<key>` route for public HTTPS delivery.
- `car_images` is populated from the R2 media URL.
- `publishCar()` remains the final Telegram idempotency gate through `telegram_posts`.
- A second publish of an already-published car returns `duplicate:true` and does not send another Telegram message/media request.
- No missing vehicle facts or legal plate numbers are fabricated.

## AI chat blocker fixed
- The mock-D1 blocker was fixed with optional `r?.meta?.last_row_id` handling.
- A second logic blocker was found and fixed: merely mentioning the name “Phan Thuần” no longer makes an unrelated request an identity question. Identity routing now requires an actual identity question pattern.

## Tests added
- Auto-publish confidence/identity gate.
- Telegram duplicate protection with a mocked Telegram API; second publish performs no additional send calls.
- Existing AI unknown/contact tests now pass in Run #58.

## Agent model
AI1–AI5 are equal peer agents. Specializations are perspectives, not hierarchy or ownership. Every agent must read current state, preserve valid changes, test, and update handoff before continuing.

## Safety note
The current auto-publish path preserves the original R2 image and does not synthesize a legal license plate. Any future branding/plate overlay must use explicit real vehicle data or a clearly non-legal branding overlay; never invent a plate number.
