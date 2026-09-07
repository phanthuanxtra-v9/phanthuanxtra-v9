# PHAN THUẦN XTRA — CLOUDFLARE/GITHUB AUDIT HANDOFF

Date: 2026-09-08 (Vietnam, UTC+7)

## Purpose

This document is a handoff checkpoint for any AI/session taking over PHAN THUẦN XTRA. It records what has actually been verified in the GitHub repository and what still requires direct verification inside `dash.cloudflare.com`. It exists specifically to prevent duplicate, conflicting, or incorrect Cloudflare/GitHub configuration.

## Scope audited

Repository: `phanthuanxtra-v9/phanthuanxtra-v9`
Branch: `main`
Website: `https://phanthuanxtra.com`
Production Worker configured in repo: `phanthuanxtra-v2`

## VERIFIED FROM GITHUB — DO NOT RECREATE OR RENAME

### Cloudflare Worker configuration

`wrangler.json` currently declares:
- Worker name: `phanthuanxtra-v2`
- Entry: `src/entry.js`
- Assets: `./public` bound as `ASSETS`
- Observability: enabled
- Workers AI binding: `AI`
- Images binding: `IMAGES`
- AI Search remote namespace: `default`, binding `AI_SEARCH`
- R2 binding: `MEDIA` → bucket `phanthuanxtra-media`
- D1 binding: `DB` → database `phanthuanxtra-db`, database ID `8b6c0fc8-c278-4797-9cfa-3ec93d0c1b7d`
- Cache: enabled
- Current Worker cron: `*/5 * * * *`

Do NOT add another Worker, D1 database, R2 bucket, AI binding, or cron simply because a future AI does not know these already exist.

### Production deployment path

`.github/workflows/deploy-cloudflare.yml` is the repository's production deployment workflow.

It runs validation on push/PR and deploys production on push to `main` after validation. It uses GitHub secrets named:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

It performs:
1. npm install
2. JavaScript syntax/tests
3. Wrangler dry-run
4. remote D1 migrations
5. Cloudflare Worker deploy

Never put these secret values into source, documentation, issues, logs, or chat.

### Worker routing

`src/entry.js` is the active Worker entry and routes:
- website AI chat → `handleAiChat`
- Android App API → `handleAppApi`
- VIP Telegram → `handleVipTelegram`
- main Telegram router → `handleTelegramRouter`
- Telegram ingest → `handleTelegramIngest`
- media → `handleMediaApi`
- Telegram API → `handleTelegramApi`
- CMS → `handleCmsApi`

The Worker scheduled handler currently performs Telegram webhook self-healing and Telegram notification reconciliation. It is NOT currently a backup engine.

### Main Telegram route

The Worker code uses the main Telegram webhook URL:
`https://phanthuanxtra.com/api/telegram/webhook`

`src/telegram-router.js` is the vehicle-ingestion/Auto Bot path. Do not create a second `/api/telegram/auto-webhook` route merely because an old diagnostic expected it.

### VIP Telegram route

`src/vip-telegram.js` uses secret `TELEGRAM_VIP_BOT_TOKEN` and route:
`/api/telegram/vip-webhook`

It also supports an admin route for setting that webhook.

### Website Chat AI

`src/ai-chat.js` is the website Chat AI implementation and uses Cloudflare Workers AI model:
`@cf/meta/llama-3.2-3b-instruct`

The presence of website Chat AI does NOT by itself prove that `@phanthuanxtra_bot` is a Telegram bot integration. Do not invent a Telegram webhook or secret for it until source and real Telegram state are verified.

### Backup bot

`@phanthuanxtra2026_bot` is designated as the daily backup/disaster-recovery bot.

Required schedule: 07:00 Vietnam time (UTC+7) = 00:00 UTC.

Current GitHub source search found no implementation reference for the literal username `phanthuanxtra2026_bot` and no backup implementation matching `backup D1 R2`.

Therefore:
**BACKUP IS PLANNED, NOT IMPLEMENTED.**

Do not add a second backup system until the exact Cloudflare/GitHub execution architecture is verified.

## IMPORTANT FINDING — CURRENT DIAGNOSTIC WORKFLOW HAS A ROUTE MISMATCH

`.github/workflows/telegram-bots-diagnostic.yml` currently checks:
- `TELEGRAM_AUTO_BOT_TOKEN` and expects `/api/telegram/auto-webhook`
- `TELEGRAM_VIP_BOT_TOKEN` and expects `/api/telegram/vip-webhook`

The current Worker source instead shows the main Telegram route as `/api/telegram/webhook`.

Therefore the Auto diagnostic's expected route is stale/mismatched and must NOT be treated as proof that Auto Bot is broken or that a new route should be deployed.

Before changing it, verify the real `getMe`/`getWebhookInfo` result for the configured production token and map the token to the actual bot username.

## GITHUB IGNORANCE / BACKUP SAFETY NOTE

`.gitignore` contains:
`backup/d1/`

This means local D1 backup material under that path is intentionally ignored by Git. This is NOT proof that a production backup exists. Do not confuse an ignored local backup directory with an operational backup system.

## CLOUDFLARE DASHBOARD — NOT DIRECTLY VERIFIED IN THIS SESSION

There is currently no connected Cloudflare account/dashboard connector available to inspect the private `dash.cloudflare.com` account state directly.

Therefore the following MUST be checked in Cloudflare Dashboard before making configuration changes:
- Workers & Pages → exact production Worker and its Settings → Builds/Git repository connection.
- Git account/repository/branch connected to the Worker.
- Build command and deploy command.
- Production environment and deployment history.
- Worker bindings: D1, R2, AI, Images, AI Search, Assets.
- Worker secrets/variables names only (never paste secret values into chat).
- Cron triggers.
- Routes/custom domains for `phanthuanxtra.com`.
- R2 buckets and current contents/usage.
- D1 database identity, migrations and data.
- Workers Builds/API token configuration if configured.

Cloudflare's current documentation confirms that Workers Builds connects a Worker to a GitHub repository under Worker Settings → Builds, and that the Worker name in the dashboard must match the Wrangler `name` in the repository. citeturn0search2turn0search4

## NO-DUPLICATION RULE

Before any AI changes Cloudflare or GitHub:
1. Read `MASTER_CONTEXT_PHAN_THUAN.md`.
2. Read this audit handoff.
3. Inspect `wrangler.json`.
4. Inspect `.github/workflows/deploy-cloudflare.yml`.
5. Inspect current production workflow runs.
6. Verify Cloudflare Dashboard state for the exact Worker.
7. Compare dashboard state against repository state.
8. Only then propose a change.

Never create a new Worker merely because a similarly named Worker exists.
Never create a new D1 database merely because the database ID was not remembered.
Never create a new R2 bucket merely because media storage was not remembered.
Never add a second GitHub deployment workflow without proving the existing one is insufficient.
Never change the existing `*/5 * * * *` cron to `00:00` just to implement backup until the backup architecture is designed and existing Telegram scheduled duties are preserved.

## BACKUP DESIGN GATE

Before implementing `@phanthuanxtra2026_bot`, verify:
- exact Telegram secret name
- exact bot identity via `getMe`
- independent backup destination
- D1 export/backup mechanism
- R2 backup/replication strategy
- website/source recovery strategy
- retention policy
- checksum/integrity verification
- restore test procedure
- failure notification
- whether backup runs in GitHub Actions, Cloudflare Worker/Workflow, or another controlled environment

The bot itself must not be the only backup storage.

## CURRENT STATUS

| Area | Status | Evidence |
|---|---|---|
| Production Worker identity | VERIFIED IN GITHUB | `wrangler.json` |
| D1 identity | VERIFIED IN GITHUB | `wrangler.json` |
| R2 media identity | VERIFIED IN GITHUB | `wrangler.json` |
| AI / Images / AI Search bindings | VERIFIED IN GITHUB | `wrangler.json` |
| Production GitHub deploy workflow | VERIFIED IN GITHUB | `deploy-cloudflare.yml` |
| Existing Worker cron | VERIFIED IN GITHUB | `*/5 * * * *` |
| Website Chat AI | VERIFIED IN GITHUB | `src/ai-chat.js`, `src/entry.js` |
| VIP Telegram route | VERIFIED IN GITHUB | `src/vip-telegram.js` |
| Main Telegram route | VERIFIED IN GITHUB | `src/entry.js`, `src/telegram-router.js` |
| Auto diagnostic expected route | MISMATCH / NEEDS AUDIT | workflow vs source |
| `@phanthuanxtra2026_bot` implementation | NOT FOUND | GitHub code search |
| Cloudflare private dashboard state | NOT VERIFIED | no connected Cloudflare account connector |
| Daily backup operational | NO | implementation + restore E2E absent |

## HANDOFF

Next AI must NOT start coding backup or create Cloudflare resources yet.
First perform the Cloudflare Dashboard ↔ GitHub reconciliation and map the four Telegram bots to actual secrets/routes/functions.
Then design one backup architecture using the resources that already exist.

The user's explicit objective is to avoid duplicate/mistaken setup and preserve the ability for any AI to take over at any time.
