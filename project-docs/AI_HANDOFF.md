# AI HANDOFF

## Shared peer model
AI1, AI2, AI3, AI4 and AI5 are equal peer agents working on the same project. Role labels are specializations/perspectives, not authority or ownership.

## Completed checkpoint — 2026-09-06
- AI unknown-question mock-D1 blocker fixed with optional `r?.meta?.last_row_id` handling.
- Identity routing tightened so a customer's name mention does not incorrectly classify an unrelated request as an identity question.
- Telegram AI draft -> publish is connected behind a safety gate: real `brand` + `model` and confidence >= 0.85.
- Deterministic car IDs use `tg-<inboxId>`.
- R2 media is retained and served via `/media/<key>`; the vehicle row gets a public HTTPS `car_images` URL.
- `telegram_posts` is the final idempotency gate. A second publish returns `duplicate:true` without another Telegram send.
- Tests cover confidence gating and duplicate protection.
- CI Run #58 (`34023110015`) is green.
  - Validate: `101459199272` success.
  - Production: `101459235528` success.
  - D1 migrations: no migrations pending.
- Production Worker deployment succeeded.
  - Worker: `phanthuanxtra-v2`
  - Version: `ee69e468-dfc9-45d9-987d-8b2a2e268817`

## Current safety boundary
- No missing vehicle facts are fabricated.
- No legal license plate number is invented.
- Source image remains unchanged in R2.
- The current auto-publish flow does not synthesize a license-plate overlay; any future overlay must use explicit real vehicle data or clearly non-legal branding.

## Next agent
Start by reading `PROJECT_STATE.md` and this file. Do not restart the project. Continue from the green production checkpoint, and only make changes that preserve the current idempotence and data-integrity guarantees.
