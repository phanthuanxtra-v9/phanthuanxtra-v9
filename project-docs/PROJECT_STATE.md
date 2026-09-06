# PROJECT STATE

## Current objective
Finish the production-safe Telegram vehicle pipeline and CI/deployment verification.

## Current state
- AI1-AI5 are peer agents working on the same codebase; no agent is hierarchical owner.
- Main branch currently contains the AI chat scope tightening and Telegram draft pipeline.
- Telegram ingest stores source images in R2 and creates `vehicle_ai_drafts`; it does not yet auto-publish.
- Telegram publisher has idempotent `telegram_posts` protection: published posts are returned as duplicates unless forced; pending posts younger than 5 minutes are rejected.
- Latest known CI blocker is the AI unknown-question mock D1 result shape (`r.meta` is accessed when the mock returns undefined).

## Safety decisions
- Auto-publish only when AI extraction has `brand` + `model` and confidence >= 0.85.
- Never fabricate year, mileage, price, fuel, color, options, plate number, or other missing vehicle data.
- Source image is preserved; no synthetic/legal license plate is invented.
- Duplicate Telegram webhook deliveries are deduplicated by `telegram_inbox.source_hash`.
- Telegram post idempotence is enforced by unique `telegram_posts.car_id` plus status checks.

## Acceptance gates
1. Node test suite green.
2. Telegram draft -> cars -> car_images -> publish path covered by tests.
3. Duplicate publish returns `duplicate:true` and does not send another Telegram media/message call.
4. GitHub Actions validate job green.
5. Production job green and Cloudflare deployment/version recorded.
6. This file and `AI_HANDOFF.md` updated with final evidence.
