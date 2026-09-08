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

Latest observed repository commit: `f0b5ad900d910409d6d7087b25c6d2e58cbd2af0` (`docs: reconcile Cloudflare credential and Telegram diagnostic state`).

Latest Android workflow run observed: `34206165145`, based on the checkpoint commit. Its `build-apk` job completed successfully. Verified steps include the Production App API smoke test, Gradle assembleDebug, APK output verification, and artifact upload.

The previously verified production deployment remains the authoritative production deployment evidence until a newer production deploy run is observed. No infrastructure resource was recreated or duplicated during this audit continuation.

## RUNTIME/ROUTING SOURCE AUDIT

`src/entry.js` currently routes requests through AI chat, admin, app API, VIP Telegram, Telegram lookup/router/ingest, media, Telegram API, CMS, then legacy fallback. The expected Auto Telegram webhook constant is `https://phanthuanxtra.com/api/telegram/webhook`.

The scheduled handler checks Telegram webhook status and self-heals the webhook when status is unavailable or the URL does not match the expected route, then reconciles Telegram notifications. This behavior is protected by the existing Worker cron and must not be duplicated by another cron/resource.

## PRODUCTION TEST GATES

`tests/production-gates.test.mjs` currently verifies:
- Telegram auto-publish requires brand + model identity and confidence >= 0.85.
- Unknown AI production questions are handed to a human instead of being answered by the AI model.

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
| Latest APK validation | PASS | workflow run `34206165145` |
| Production App API smoke test | PASS | APK workflow run `34206165145` |
| Telegram Auto diagnostic route | FIXED | current diagnostic expects `/api/telegram/webhook` |
| Telegram VIP route | VERIFIED | current diagnostic + source |
| Existing Worker cron | VERIFIED | `*/5 * * * *` |
| Daily backup bot | NOT IMPLEMENTED | requires architecture + E2E |
| Cloudflare private dashboard | NOT DIRECTLY VERIFIED | no private dashboard connector |

## NEXT AI HANDOFF

Continue from this exact repository state. Do not rotate, recreate, rename, or duplicate Cloudflare resources merely because an older audit mentioned a credential failure. First inspect the latest production workflow run before changing credentials.

If a new credential must actually be rotated, perform that only through GitHub/Cloudflare settings; never paste the value into chat. The source workflow already uses the correct secret names.

Next audit priority: inspect current production-facing source/API routes and all non-doc GitHub workflow health; fix only reproducible defects, then validate and checkpoint the resulting commit here.
