# PHAN THUẦN XTRA — CLOUDFLARE/GITHUB AUDIT HANDOFF

Date: 2026-09-08 (Vietnam, UTC+7)

## Purpose

This is the active handoff checkpoint for any AI/session taking over PHAN THUẦN XTRA. It records verified repository and CI state and prevents duplicate Cloudflare/GitHub configuration.

## Scope

Repository: `phanthuanxtra-v9/phanthuanxtra-v9`
Branch: `main`
Website: `https://phanthuanxtra.com`
Production Worker configured in repo: `phanthuanxtra-v2`

## VERIFIED — PRODUCTION CLOUDFLARE DEPLOYMENT CREDENTIAL PATH

The production workflow `.github/workflows/deploy-cloudflare.yml` uses exactly these GitHub Actions secret names:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The workflow passes those secrets to `cloudflare/wrangler-action@v3` for Wrangler dry-run, remote D1 migrations, and production deploy. Secret values are never stored in source or this document.

IMPORTANT: the GitHub connector cannot read or mutate GitHub Actions secret values. Therefore this checkpoint verifies the workflow contract and successful execution, but does not expose or claim to inspect the secret value itself.

## CREDENTIAL/DEPLOYMENT VERIFICATION

Known production deployment run `34090076816` was verified directly from GitHub Actions:
- `CI / Validate` → SUCCESS
- `Wrangler dry-run` → SUCCESS
- `Apply D1 migrations` → SUCCESS
- `Deploy to Cloudflare` → SUCCESS

This is strong evidence that the current `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` workflow path is operational for that deployment.

## LATEST AUDIT CONTINUATION CHECKPOINT

Latest code commit: `b5bace11f7246a9debe9acde18846059b22c2059` (`test(app-api): cover malformed car ID production gate`).

Audit found a reproducible production-facing routing defect in `src/app-api.js`: a malformed percent-encoded `/api/app/v1/cars/:id` path could make `decodeURIComponent()` throw, escaping the handler and becoming the Worker-level 500 response. The fix wraps car-ID decoding and returns HTTP 400 with `ID xe không hợp lệ` instead of allowing an uncaught exception.

A production-gate regression test was added in `tests/production-gates.test.mjs` for `/api/app/v1/cars/%E0%A4%A` with a valid API token.

Latest Android workflow run for the fix: `34207229206`. The `build-apk` job completed SUCCESS. Verified steps include the Production App API smoke test, Gradle assembleDebug, APK output verification, artifact upload, and all post-job cleanup steps.

The latest code push also triggers the existing production deployment workflow. The last independently verified production deployment remains run `34090076816` until a newer deploy run is directly observed as successful. No Cloudflare resource was recreated or duplicated.

## RUNTIME/ROUTING SOURCE AUDIT

`src/entry.js` currently routes requests through AI chat, admin, app API, VIP Telegram, Telegram lookup/router/ingest, media, Telegram API, CMS, then legacy fallback. The expected Auto Telegram webhook constant is `https://phanthuanxtra.com/api/telegram/webhook`.

The scheduled handler checks Telegram webhook status and self-heals the webhook when status is unavailable or the URL does not match the expected route, then reconciles Telegram notifications. This behavior is protected by the existing Worker cron and must not be duplicated by another cron/resource.

## PRODUCTION TEST GATES

`tests/production-gates.test.mjs` currently verifies:
- Telegram auto-publish requires brand + model identity and confidence >= 0.85.
- Unknown AI production questions are handed to a human instead of being answered by the AI model.
- Malformed app car IDs are rejected with HTTP 400 rather than becoming Worker-level 500 errors.

## CLOUDFLARE WORKER CONFIGURATION — DO NOT DUPLICATE

`wrangler.json` declares:
- Worker name: `phanthuanxtra-v2`
- Entry: `src/entry.js`
- Assets: `./public` → `ASSETS`
- Observability: enabled
- Workers AI binding: `AI`
- Images binding: `IMAGES`
- AI Search remote namespace: `default` → `AI_SEARCH`
- R2: `MEDIA` → `phanthuanxtra-media`
- D1: `DB` → `phanthuanxtra-db`, database ID `8b6c0fc8-c278-4797-9cfa-3ec93d0c1b7d`
- Cache: enabled
- Cron: `*/5 * * * *`

Do not create another Worker, D1 database, R2 bucket, AI binding, or cron from guesswork.

## TELEGRAM DIAGNOSTIC — ROUTE MISMATCH ALREADY FIXED IN SOURCE

Current `.github/workflows/telegram-bots-diagnostic.yml` checks:
- Auto bot expected route: `/api/telegram/webhook`
- Auto bot expected username: `phanthuanxtra_auto_bot`
- VIP bot expected route: `/api/telegram/vip-webhook`
- VIP bot expected username: `phanthuanxtra_vip_bot`

The previous stale `/api/telegram/auto-webhook` expectation is no longer present in the current workflow. Do not add that route back.

The diagnostic remains read-only: it performs `getMe` and `getWebhookInfo` and does not call `setWebhook` or mutate secrets.

## BACKUP BOT STATUS

`@phanthuanxtra2026_bot` remains PLANNED / NOT IMPLEMENTED.

Required schedule: 07:00 Vietnam time (00:00 UTC). Existing `*/5` Worker cron must not be repurposed because it currently supports Telegram webhook self-healing/notification reconciliation.

Before implementing backup, verify independent backup storage, D1 export/restore, R2 media backup, integrity/checksum verification, retention, failure notification, and a real restore test.

## NO-DUPLICATION RULE

1. Read `MASTER_CONTEXT_PHAN_THUAN.md`.
2. Read this handoff.
3. Inspect `wrangler.json`.
4. Inspect `.github/workflows/deploy-cloudflare.yml`.
5. Inspect current workflow runs.
6. Verify Cloudflare Dashboard state when private dashboard access is available.
7. Compare dashboard state with repository state.
8. Only then make infrastructure changes.

Never put production secrets in source, documentation, issues, logs, or chat.

## CURRENT STATUS

| Area | Status | Evidence |
|---|---|---|
| Active repository | VERIFIED | GitHub repo `phanthuanxtra-v9/phanthuanxtra-v9` |
| Production Worker identity | VERIFIED | `wrangler.json` |
| D1 identity | VERIFIED | `wrangler.json` |
| R2 media identity | VERIFIED | `wrangler.json` |
| Workers AI / Images / AI Search | VERIFIED | `wrangler.json` |
| Production GitHub deploy workflow | VERIFIED | `deploy-cloudflare.yml` |
| Cloudflare credential workflow path | OPERATIONAL | production run `34090076816` passed all deploy stages |
| Latest App API fix | COMMITTED | `b5bace11f7246a9debe9acde18846059b22c2059` |
| Latest APK validation | PASS | workflow run `34207229206` |
| Production App API smoke test | PASS | workflow run `34207229206` |
| Malformed car ID 500 defect | FIXED + REGRESSION TESTED | source + `production-gates.test.mjs` |
| Telegram Auto diagnostic route | FIXED | current diagnostic expects `/api/telegram/webhook` |
| Telegram VIP route | VERIFIED | current diagnostic + source |
| Existing Worker cron | VERIFIED | `*/5 * * * *` |
| Daily backup bot | NOT IMPLEMENTED | requires architecture + E2E |
| Cloudflare private dashboard | NOT DIRECTLY VERIFIED | no private dashboard connector |

## NEXT AI HANDOFF

Continue from commit `b5bace11f7246a9debe9acde18846059b22c2059` and this checkpoint. Do not rotate, recreate, rename, or duplicate Cloudflare resources merely because an older audit mentioned a credential failure.

Next priority: inspect the newest production deploy workflow result for this commit. If it passed, continue the production-facing API/workflow audit from this exact state. If it failed, inspect the failing job/log first and fix only the evidenced failure.

If a new credential must actually be rotated, perform that only through GitHub/Cloudflare settings; never paste the value into chat. The source workflow already uses the correct secret names.
