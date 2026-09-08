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

A later documentation-only commit `7f87adebadf404c161a31570cf2c6f6e974041a7` did not change production code and the production workflow intentionally ignores documentation-only changes.

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

Current `.github/workflows/telegram-bots-diagnostic.yml` now checks:
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
| Production Worker identity | VERIFIED | `wrangler.json` |
| D1 identity | VERIFIED | `wrangler.json` |
| R2 media identity | VERIFIED | `wrangler.json` |
| Workers AI / Images / AI Search | VERIFIED | `wrangler.json` |
| Production GitHub deploy workflow | VERIFIED | `deploy-cloudflare.yml` |
| Cloudflare credential workflow path | OPERATIONAL | production run `34090076816` passed all deploy stages |
| Telegram Auto diagnostic route | FIXED | current diagnostic expects `/api/telegram/webhook` |
| Telegram VIP route | VERIFIED | current diagnostic + source |
| Existing Worker cron | VERIFIED | `*/5 * * * *` |
| Daily backup bot | NOT IMPLEMENTED | requires architecture + E2E |
| Cloudflare private dashboard | NOT DIRECTLY VERIFIED | no private dashboard connector |

## NEXT AI HANDOFF

Continue from the current repository state. Do not rotate, recreate, rename, or duplicate Cloudflare resources merely because an older audit mentioned a credential failure. First inspect the latest production workflow run before changing credentials.

If a new credential must actually be rotated, perform that only through GitHub/Cloudflare settings; never paste the value into chat. The source workflow already uses the correct secret names.
