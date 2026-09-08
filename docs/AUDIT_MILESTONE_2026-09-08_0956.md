# PHAN THUẦN XTRA — AUDIT MILESTONE

Date: 2026-09-08 (Vietnam, UTC+7)
Repository: `phanthuanxtra-v9/phanthuanxtra-v9`
Branch: `main`

## 1. Audit rule

Continue from `AUDIT_SESSION_2026-09-08_0625.md`, `AUDIT_HANDOFF_2026-09-08.md`, `MASTER_CONTEXT_PHAN_THUAN.md`, and current GitHub source. Do not invent Cloudflare resources, bot identities, secrets, routes, schedules, or production state.

## 2. Four-bot business ownership confirmed by owner

1. `@phanthuanxtra_auto_bot` — vehicle intake. Receive vehicle information/images, automatically replace the visible license-plate region with `PT Xtra`, then publish to `phanthuanxtra.com` subject to existing AI identity/confidence gates.
2. `@phanthuanxtra2026_bot` — daily website/data disaster-recovery backup at 07:00 Vietnam time (00:00 UTC).
3. `@phanthuanxtra_bot` — AI chat associated with the website's bottom-right chat experience. Must not be conflated with Auto Bot or VIP Bot.
4. `@phanthuanxtra_vip_bot` — independent vehicle intelligence/lookup workflow for vehicle information, images, production identity, facelift/up-form/modification analysis. It must not publish inventory to the website automatically.

## 3. Cloudflare Dashboard evidence supplied by owner

On Worker `phanthuanxtra-v2` → Settings → Variables and Secrets:

- `TELEGRAM_BOT_TOKEN` — PRESENT
- `TELEGRAM_AUTO_BOT_TOKEN` — ABSENT
- `TELEGRAM_VIP_BOT_TOKEN` — ABSENT

Absence of a secret name proves only that the named secret is not configured on the inspected Worker environment; it does not prove that a Telegram bot account does not exist.

## 4. Auto Bot source verification

`src/telegram-router.js` is the `/api/telegram/webhook` implementation. It uses `TELEGRAM_BOT_TOKEN`, stores Telegram inbox data in D1, stores original media in R2, runs Vehicle AI, requires real `brand` + `model` and confidence >= 0.85 for automatic publication, creates deterministic `tg-<inboxId>` vehicle IDs, and uses `telegram_posts` for publication duplicate protection.

The source supports the owner-defined Auto Bot flow without requiring a new `/api/telegram/auto-webhook` route.

## 5. PT Xtra branding verification

`src/vehicle-ai.js` extracts a normalized `plate_bbox` only when the license-plate region can be identified with sufficient confidence. `src/plate-branding.js` fails closed when the bounding box or required bindings are unavailable. `public/branding/pt-xtra-plate.svg` contains the opaque `PT Xtra` display overlay. Original source media remains stored separately.

## 6. VIP Bot source verification

`src/vip-telegram.js` requires `TELEGRAM_VIP_BOT_TOKEN` and handles `/api/telegram/vip-webhook`. It persists VIP sessions and source evidence in D1 and can store received media in R2. It explicitly does not automatically publish vehicles to the website.

Migration `0011_vip_vehicle_intelligence.sql` provides `vip_vehicle_sessions` and `vip_vehicle_sources`.

VIP code architecture exists, but production operation is NOT VERIFIED because the inspected Worker lacks the required token and Telegram identity/webhook evidence is not yet available.

## 7. Website AI Chat verification

`src/ai-chat.js` implements `POST /api/ai-chat`, loads the current vehicle catalog from D1, uses Workers AI model `@cf/meta/llama-3.2-3b-instruct`, and queries AI Search namespaces `ai-search-mcp` and `ai-search-auto` when available. `public/script.js` exposes the website bottom-right AI chat UI.

The source also contains a distinct Telegram path `/api/telegram/ai-webhook` requiring `TELEGRAM_CHAT_BOT_TOKEN`. It is NOT assumed to be `@phanthuanxtra_bot` until production identity/secret evidence is verified.

## 8. Backup verification

`backup/README.md` defines full-system backup scope: Git source/configuration, Worker/deployment metadata, D1 schema/data, R2 inventory/content where permitted, DNS/routes metadata, gateway/API contracts, and secret names only. Git alone is not a full Cloudflare backup.

No implementation matching `@phanthuanxtra2026_bot` and the required 07:00 Vietnam schedule is verified. Backup remains PLANNED / NOT OPERATIONAL.

The existing Worker cron remains `*/5 * * * *` and is used for Telegram webhook self-healing and notification reconciliation. It must not be repurposed for backup without a design preserving those duties.

## 9. CI/CD incident and remediation

The audit checkpoint commit itself triggered production deployment because `.github/workflows/deploy-cloudflare.yml` previously ran on every push to `main`. The resulting production run was `34182869129`; validation, dry-run, D1 migration and deployment jobs completed successfully.

This was an unintended CI behavior for documentation-only audit work. No application code change was intended by that checkpoint commit.

Remediation was committed as:

`6a320b7da23c15d2fdcf949c5142d09cec69daa9` — `ci: prevent documentation-only commits from deploying production`

The workflow now ignores documentation-only pushes (`**/*.md`, `docs/**`, `AUDIT_*.md`, and `backup/README.md`) at the workflow trigger level. Production deployment still occurs only for applicable `main` pushes after validation. This prevents future audit/checkpoint documentation commits from deploying the Worker.

The remediation itself is a CI safety/control change. Its production effect must be verified from the subsequent GitHub Actions evidence; no claim of Cloudflare state is inferred from Git alone.

## 10. Important findings

### P0 — VIP production secret/configuration gap

`src/vip-telegram.js` requires `TELEGRAM_VIP_BOT_TOKEN`; the inspected Worker does not contain it. VIP production operation is therefore not verified.

### P1 — Website Telegram chat identity unresolved

The product owner identifies `@phanthuanxtra_bot` as website AI chat, while source contains `TELEGRAM_CHAT_BOT_TOKEN` and `/api/telegram/ai-webhook`. Production identity is not assumed without evidence.

### P1 — CRM notification secret names need reconciliation

`src/telegram-crm-notify.js` uses `TELEGRAM_CRM_BOT_TOKEN` and `TELEGRAM_CRM_CHAT_ID`; these are separate notification infrastructure and must not be confused with the four business bots.

### P1 — Auto Bot production identity needs Telegram evidence

Production source uses `TELEGRAM_BOT_TOKEN`, but the actual Telegram username associated with that token and its `getWebhookInfo` result have not been directly verified in this audit.

### P1 — Backup architecture is not ready to implement safely

Destination, retention, restore procedure, integrity verification, schedule mechanism, failure notification and credentials must be evidenced before implementation. Do not add a second cron/Worker merely to satisfy the schedule.

## 11. Next verification sequence

1. Verify Cloudflare bindings: `DB`, `MEDIA`, `AI`, `IMAGES`, `AI_SEARCH`, `ASSETS`.
2. Verify Cron, Domains/Routes, Builds/GitHub connection, deployment history, D1 identity and R2 identity.
3. Check only secret names for `TELEGRAM_CHAT_BOT_TOKEN`, `TELEGRAM_CRM_BOT_TOKEN`, `TELEGRAM_CRM_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_CHAT_WEBHOOK_SECRET`, `TELEGRAM_VIP_WEBHOOK_SECRET`, `ADMIN_TOKEN`, and `APP_API_TOKEN`.
4. Run existing Telegram diagnostic only when its GitHub Actions secret prerequisites are confirmed; capture `getMe` and `getWebhookInfo` without exposing tokens.
5. Reconcile Auto/VIP/Chat identities and choose the smallest justified production configuration change.
6. Design backup only after destination/retention/restore/integrity/notification requirements are evidenced.

## 12. Change safety

No Telegram `setWebhook`, secret value mutation, new Worker, new D1/R2 resource, or destructive operation was performed by this audit. The only repository changes were audit documentation and the CI trigger guard described above.

This file is the current handoff evidence for the next AI and should be read together with the earlier checkpoint files and current GitHub source.
