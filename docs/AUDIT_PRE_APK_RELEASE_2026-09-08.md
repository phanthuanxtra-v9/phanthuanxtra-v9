# PHAN THUẦN XTRA — PRE-APK RELEASE AUDIT

Date: 2026-09-08 (UTC+7)
Repository: `phanthuanxtra-v9/phanthuanxtra-v9`

## 1. RELEASE GATE

**Status: BLOCKED — DO NOT export/release a new production APK yet.**

Reason: the latest production deployment attempt failed at D1 migrations because the existing GitHub Actions Cloudflare credential returned Cloudflare API authentication errors `10000` / `9109`. The Worker deploy was therefore skipped. Source fixes exist in GitHub but are not proven deployed to production.

No workaround is allowed: do not skip migrations, create a new D1, create a new Worker, invent bindings, or replace production resources by guesswork.

## 2. CLOUDFLARE WORKER / BINDINGS — SOURCE OF TRUTH

Current declared Worker: `phanthuanxtra-v2`.
Entry: `src/entry.js`.
Assets: `ASSETS` -> `./public`.
Workers AI: `AI`.
Images: `IMAGES`.
AI Search: `AI_SEARCH` -> remote namespace `default`.
R2: `MEDIA` -> `phanthuanxtra-media`.
D1: `DB` -> `phanthuanxtra-db`, database ID `8b6c0fc8-c278-4797-9cfa-3ec93d0c1b7d`.
Cache: enabled.
Cron: `*/5 * * * *`.

Source evidence: `wrangler.json`.

**Cloudflare Dashboard private state remains UNVERIFIED in this session.** Source configuration must not be treated as proof that the Dashboard has the same bindings, routes, secrets, cron trigger, build settings, or deployment version.

## 3. ROUTING

`src/entry.js` currently dispatches:
- `/api/ai-chat` via AI chat handler.
- `/api/app/v1/*` via App API/admin handlers.
- `/api/telegram/webhook` via Auto/vehicle ingestion router.
- `/api/telegram/ai-webhook` via Telegram AI chat.
- `/api/telegram/lookup-webhook` via vehicle lookup bot.
- `/api/telegram/vip-webhook` via VIP bot.
- media/CMS/legacy routes.

Scheduled execution currently performs Telegram webhook self-healing and Telegram notification reconciliation. **Do not repurpose the existing 5-minute cron for backup without a separate architecture audit.**

## 4. FOUR TELEGRAM BOT ROLES — IMPORTANT RECONCILIATION

The project documentation names four operational bot roles:

1. `@phanthuanxtra_auto_bot` — vehicle ingestion / website publishing.
   - Source route: `/api/telegram/webhook`.
   - Uses `TELEGRAM_BOT_TOKEN`.
   - Uses D1 + R2 + Vehicle AI.
   - Has single-flight/bundle processing logic intended to prevent duplicate concurrent processing.

2. `@phanthuanxtra_bot` — vehicle lookup.
   - Source route: `/api/telegram/lookup-webhook`.
   - Uses `TELEGRAM_LOOKUP_BOT_TOKEN`.
   - Read-only against production D1 inventory.

3. `@phanthuanxtra_vip_bot` — VIP vehicle intelligence.
   - Source route: `/api/telegram/vip-webhook`.
   - Uses `TELEGRAM_VIP_BOT_TOKEN`.
   - Uses D1/R2 and Vehicle AI/VIP intelligence.
   - Explicitly does not auto-publish vehicles.
   - Includes source deduplication/idempotency logic.

4. `@phanthuanxtra2026_bot` — designated daily backup/disaster-recovery bot.
   - Required schedule: 07:00 Vietnam / 00:00 UTC.
   - **Current repository evidence says PLANNED / NOT YET OPERATIONALLY VERIFIED.**
   - A documentation statement that it is an operational fourth bot is not sufficient proof of a working backup/restore system.
   - Do not falsely mark this bot green until a real backup, integrity check, restore/readability test, and Telegram success report are verified.

Therefore, the accurate release status is **3 bot paths implemented/verified in source + 1 backup bot role planned/not yet operationally proven**, not “4 bots fully production-verified”.

## 5. AI VEHICLE / LICENSE-PLATE PROCESSING

Auto ingestion source currently:
1. receive photo + vehicle information;
2. bundle/deduplicate Telegram input;
3. download source image from Telegram;
4. store source image in R2;
5. run Vehicle AI analysis;
6. persist `vehicle_ai_drafts` in D1;
7. if confidence/plate gate fails, keep a review draft and do not fabricate/publish;
8. if gate passes, generate PT Xtra plate-branded publish image;
9. promote/publish the draft;
10. report the result back to Telegram.

The implementation explicitly separates current vehicle form from original production year and refuses to fabricate uncertain information.

VIP processing separately collects vehicle images/documents/text, stores evidence, builds a report, and flags conflicts/review requirements.

## 6. APK STATUS

Latest known source APK:
- Application ID: `com.phanthuanxtra.app`
- Version: `1.2.0`
- versionCode: `3`
- target SDK: 35
- production API base: `https://phanthuanxtra.com/api/app/v1`

Latest known successful APK workflow:
- Run `34203790849` (#97)
- artifact ID `10046897695`
- artifact digest `sha256:16d4cbc3cc6b89d5d6dfb04fa6eb77f7205b56a2a795207eb781b9c8847c624c`
- downloaded APK SHA-256 `3fcfcf4a85ae72dc761cded5ed56834ff06687950cf08edac7d233dfa3f6cd01`

The APK build itself is green, but the new App API source fix is not yet proven deployed because production deploy is blocked at D1 authentication. Therefore this audit does **not** authorize exporting a new final production APK.

## 7. APP API DEFECT/FIX THAT MUST BE DEPLOYED FIRST

D1 schema `leads` has no `status` field. The previous dashboard query referenced `leads.status`, and `/api/app/v1/leads` was not dispatched correctly.

Fixes added:
- `src/app-admin.js`
- `src/entry.js` dispatch for App Admin before App API
- deploy workflow syntax checks for `src/app-api.js` and `src/app-admin.js`

The fix deliberately uses only existing D1 schema and reports `leadStatusSupported: false` instead of inventing a status model.

Relevant commits:
- `ca8396b5accc9f11d8b9a75d21124e82e577e6c5`
- `67f742b4b30adffebd57b33370c10376c6a33a4a`
- `a4f9a25e068a06f9dfa9ccb1f7c61c42f5fd861c`

## 8. MANDATORY RELEASE SEQUENCE

1. Repair/verify the existing GitHub Actions Cloudflare API credential and permissions — without sharing the secret in chat.
2. Rerun production deploy.
3. Require: CI PASS + Wrangler dry-run PASS + D1 migrations PASS + Worker deploy PASS.
4. Verify production `/api/app/v1/health`.
5. Verify dashboard/leads using authorized production credentials without exposing them.
6. Verify APK 1.2.0 against the deployed API.
7. Run Telegram Auto E2E.
8. Run vehicle lookup E2E.
9. Run VIP E2E/idempotency test.
10. Implement and verify the fourth backup bot if “4 bots active” is a hard release requirement.
11. Only then build/export the next APK release.

## 9. NON-NEGOTIABLE

No production green claim is valid while the Cloudflare D1 authentication blocker remains.
No new Worker/D1/R2/binding may be created from assumptions.
No Telegram token may be written to source, docs, logs, commits, or chat.
No APK release should be presented as final until its target production API and required bot paths are verified.
