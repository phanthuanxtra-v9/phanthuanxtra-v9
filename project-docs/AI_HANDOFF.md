# AI HANDOFF

## Shared peer model
AI1, AI2, AI3, AI4 and AI5 are equal peer agents working on the same project. Role labels are specializations/perspectives, not authority or ownership.

## Completed in this cycle
- Fixed the AI unknown-question CI blocker by making the D1 `run()` result access optional (`r?.meta?.last_row_id`).
- Completed missing-contact persistence for pending AI unknown questions.
- Connected Telegram vehicle AI drafts to a guarded auto-publish path.
- Auto-publish requires real `brand` + `model` and confidence >= 0.85.
- Deterministic car IDs use the Telegram inbox ID (`tg-<inboxId>`), preventing duplicate car records on webhook retries.
- Stored R2 vehicle media is exposed through `/media/<key>` and referenced as a public HTTPS `car_images.url` for Telegram media delivery.
- `telegram_posts` remains the final idempotency gate; a second publish returns `duplicate:true` without another Telegram send.
- Added tests for confidence gating and duplicate protection.

## Remaining verification gate
- GitHub Actions must finish green for the latest main commit.
- Production deployment must complete successfully and provide a Cloudflare Worker version/deployment record.
- Runtime auto-publish should only be enabled after CI passes.

## Safety
- No legal license plate number is invented.
- No missing vehicle facts are fabricated.
- Source image is preserved in R2; the current auto-publish path does not synthesize or alter a plate.
- Existing Telegram webhook idempotence remains based on `source_hash`.

## Next agent
Read `PROJECT_STATE.md`, inspect the latest CI run, verify production deployment, then update both shared docs with concrete run/job/version evidence. Do not restart or overwrite valid work.
