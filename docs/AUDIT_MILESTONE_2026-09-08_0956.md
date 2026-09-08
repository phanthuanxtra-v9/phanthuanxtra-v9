# PHAN THUẦN XTRA — AUDIT MILESTONE

Date: 2026-09-08 (Vietnam, UTC+7)
Time observed: ~09:56
Repository: `phanthuanxtra-v9/phanthuanxtra-v9`
Branch: `main`
Observed HEAD: `553a9db70f169b730eed093e213cb62ac80b53d7`

## 1. Audit rule

Continue from `AUDIT_SESSION_2026-09-08_0625.md`, `AUDIT_HANDOFF_2026-09-08.md`, `MASTER_CONTEXT_PHAN_THUAN.md`, and current GitHub source. Do not invent Cloudflare resources, bot identities, secrets, routes, schedules, or production state.

No production deploy, Cloudflare mutation, Telegram `setWebhook`, D1 migration, or secret mutation was performed during this audit.

## 2. Four-bot business ownership confirmed by owner

1. `@phanthuanxtra_auto_bot` — vehicle intake. Receive vehicle information/images, automatically replace the visible license-plate region with `PT Xtra`, then publish to `phanthuanxtra.com` subject to the existing AI identity/confidence gates.
2. `@phanthuanxtra2026_bot` — daily website/data disaster-recovery backup at 07:00 Vietnam time (00:00 UTC).
3. `@phanthuanxtra_bot` — AI chat associated with the website's bottom-right chat experience. This must not be conflated with Auto Bot or VIP Bot.
4. `@phanthuanxtra_vip_bot` — independent vehicle intelligence/lookup workflow for vehicle information, images, production identity, facelift/up-form/modification analysis. It must not publish inventory to the website automatically.

## 3. Cloudflare Dashboard evidence supplied by owner

On Worker `phanthuanxtra-v2` → Settings → Variables and Secrets, the owner verified:

- `TELEGRAM_BOT_TOKEN` — PRESENT
- `TELEGRAM_AUTO_BOT_TOKEN` — ABSENT
- `TELEGRAM_VIP_BOT_TOKEN` — ABSENT

Do not interpret absence of a secret name alone as proof of a missing Telegram bot account. It proves only that the named secret is not configured on this inspected Worker environment.

## 4. Auto Bot source verification

`src/telegram-router.js` is the active `/api/telegram/webhook` implementation from the current Worker entry order. It uses `TELEGRAM_BOT_TOKEN`, stores the Telegram inbox in D1, stores original media in R2, runs Vehicle AI, requires real `brand` + `model` and confidence >= 0.85 for automatic publication, creates a deterministic `tg-<inboxId>` vehicle ID, and uses `telegram_posts` as publication duplicate protection.

The current source supports the owner-defined Auto Bot flow without requiring a new `/api/telegram/auto-webhook` route.

## 5. PT Xtra branding verification

`src/vehicle-ai.js` extracts a normalized `plate_bbox` only when the license-plate region can be identified with sufficient confidence; otherwise it returns null. `src/plate-branding.js` fails closed when the bounding box or required `IMAGES`, `MEDIA`, or `ASSETS` binding is unavailable.

`public/branding/pt-xtra-plate.svg` is an opaque display overlay containing `PT Xtra`. The original source media remains stored separately. This is branding/display treatment, not a legal Vietnamese registration plate.

## 6. VIP Bot source verification

`src/vip-telegram.js` requires `TELEGRAM_VIP_BOT_TOKEN` and handles `/api/telegram/vip-webhook`. It persists VIP sessions and source evidence in D1 and can store received media in R2. It explicitly tells users that VIP analysis does not automatically publish vehicles to the website.

Migration `0011_vip_vehicle_intelligence.sql` provides `vip_vehicle_sessions` and `vip_vehicle_sources` with session/source indexing and cascading source cleanup.

Therefore the code architecture for VIP exists, but production operation cannot be claimed until the required secret and real Telegram webhook identity are verified.

## 7. Website AI Chat verification

`src/ai-chat.js` implements `POST /api/ai-chat`, loads current vehicle catalog from D1, uses Workers AI model `@cf/meta/llama-3.2-3b-instruct`, and queries configured AI Search namespaces `ai-search-mcp` and `ai-search-auto` when available.

`public/script.js` currently exposes the website bottom-right AI chat UI and calls `/api/ai-chat` directly.

`src/telegram-router.js` also contains a separate Telegram AI webhook path `/api/telegram/ai-webhook` requiring `TELEGRAM_CHAT_BOT_TOKEN`. This is a distinct code path and must not be assumed to be the website bot without production secret/webhook verification.

## 8. Backup verification

`backup/README.md` defines the required full-system backup scope: Git source/configuration, Cloudflare Worker/deployment metadata, D1 schema/data, R2 inventory/content where permitted, routes/DNS metadata, gateway contracts, and secret names only.

`.gitignore` excludes `backup/d1/`; this is not evidence of an operational backup.

No implementation matching `@phanthuanxtra2026_bot` and the required 07:00 Vietnam schedule has been verified in the current source. Backup remains PLANNED / NOT OPERATIONAL.

The existing Worker cron in `wrangler.json` remains `*/5 * * * *` and the scheduled handler is used for Telegram webhook self-healing and notification reconciliation. It must not be repurposed for backup without a separate architecture that preserves those duties.

## 9. CI/CD and continuity verification

`.github/workflows/deploy-cloudflare.yml` remains the production deployment gate. It validates JavaScript/tests, performs Wrangler dry-run, applies remote D1 migrations, and deploys only from `main` after validation.

`.github/workflows/telegram-bots-diagnostic.yml` was fixed in commit `553a9db70f169b730eed093e213cb62ac80b53d7` (`fix telegram bot diagnostic route/token alignment`). The current workflow uses GitHub-hosted `ubuntu-latest`, expects Auto at `/api/telegram/webhook` and VIP at `/api/telegram/vip-webhook`, and explicitly performs diagnostic-only operations without `setWebhook` or deployment.

No self-hosted runner is required for this workflow.

`developer-gateway/src/index.js` hard-pins repository `phanthuanxtra-v9/phanthuanxtra-v9` and branch `main`; audit/test execution is routed through GitHub Actions and production deploy/rollback endpoints remain disabled in that gateway phase.

## 10. Important findings requiring next verification

### P0 — VIP production secret/configuration gap

`src/vip-telegram.js` requires `TELEGRAM_VIP_BOT_TOKEN`, while the inspected `phanthuanxtra-v2` Worker does not have that secret. VIP code exists, but VIP production operation is not verified.

### P1 — Website Telegram chat identity is unresolved

The source contains `TELEGRAM_CHAT_BOT_TOKEN` and `/api/telegram/ai-webhook`, while the owner's product definition says `@phanthuanxtra_bot` is the website AI chat. The website UI itself works through `/api/ai-chat` and does not require that Telegram path. Production identity and secret state must be reconciled before treating the Telegram AI path as operational.

### P1 — CRM notification secret names need reconciliation

`src/telegram-crm-notify.js` uses `TELEGRAM_CRM_BOT_TOKEN` and `TELEGRAM_CRM_CHAT_ID`. These are separate from the four business bots and should be audited as notification infrastructure, not confused with the website chat bot.

### P1 — Auto Bot production identity still needs Telegram `getMe`/`getWebhookInfo` evidence

The current Worker source correctly uses `TELEGRAM_BOT_TOKEN`. The actual Telegram bot username associated with that token and its webhook URL have not been directly verified in this session.

### P1 — Backup architecture is not yet implementable from evidence alone

Before creating anything, verify destination, retention, restore procedure, integrity verification, schedule execution mechanism, failure notification, and credentials. Do not add a second cron or Worker merely to satisfy the requirement.

## 11. Recommended next actions

1. Verify Cloudflare Dashboard bindings for the existing Worker: `DB`, `MEDIA`, `AI`, `IMAGES`, `AI_SEARCH`, `ASSETS`.
2. Verify Cloudflare Cron, Domains/Routes, Builds/GitHub connection, deployment history, D1 identity, and R2 bucket identity.
3. In the Worker Variables and Secrets screen, check only secret NAMES (never values) for `TELEGRAM_CHAT_BOT_TOKEN`, `TELEGRAM_CRM_BOT_TOKEN`, `TELEGRAM_CRM_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_CHAT_WEBHOOK_SECRET`, `TELEGRAM_VIP_WEBHOOK_SECRET`, `ADMIN_TOKEN`, and `APP_API_TOKEN`.
4. Run the existing GitHub Telegram diagnostic only after confirming GitHub has the required diagnostic secrets; capture `getMe` and `getWebhookInfo` results without exposing tokens.
5. Then reconcile Auto/VIP/Chat identities and decide the smallest justified production configuration change.
6. Only after bot identity and Cloudflare state are reconciled, design the backup implementation.

## 12. No-change statement

This milestone records verified state and findings. It does not claim that missing VIP/Chat/backup configuration is fixed. No production configuration was mutated. The next AI can resume from this file without relying on chat history.
