# PHAN THUẦN XTRA — MASTER PROJECT STATUS

> **DUY NHẤT — CANONICAL PROJECT STATUS / HANDOFF**
> Date: 2026-09-11 (UTC+7)
> Repository: `phanthuanxtra-v9/phanthuanxtra-v9`
> Branch: `main`

## 1. SOURCE-OF-TRUTH RULE

This file is the single project-status and continuity document. When records conflict, use this priority:

1. Current `main` source/configuration.
2. Current GitHub Actions evidence.
3. Current open/merged PR state.
4. Current production/runtime evidence.
5. This file (`MASTER_PROJECT_STATUS.md`).

Historical Markdown/checkpoint files are no longer project instructions and must not be recreated as competing status documents.

## 2. CURRENT PROJECT

- Project: **PHAN THUẦN XTRA APK / PHAN THUẦN XTRA**
- Repository: `phanthuanxtra-v9/phanthuanxtra-v9`
- Branch: `main`
- Audited baseline: `6b91b28ac4eb8365fd3ad1fddbf106238abc4251`
- Production Worker: `phanthuanxtra-v2`
- Worker entry: `src/entry.js`
- Website: `https://phanthuanxtra.com`
- Admin: `https://phanthuanxtra.com/admin`
- Android application ID: `com.phanthuanxtra.app`

## 3. CLOUDFLARE ARCHITECTURE — VERIFIED IN REPOSITORY

`wrangler.json` is present on current `main`.

Single-instance production resources:
- Worker: `phanthuanxtra-v2`
- D1: `phanthuanxtra-db`
- R2: `phanthuanxtra-media`
- Workers AI: `AI`
- Images: `IMAGES`
- AI Search: `AI_SEARCH`
- Assets: `ASSETS`
- Cron: `*/5 * * * *`
- Entry: `src/entry.js`

Do not create duplicate Workers, D1 databases, R2 buckets, AI bindings or cron jobs without direct evidence that the existing resource cannot satisfy the requirement.

## 4. GITHUB / CI-CD

GitHub Actions is the deployment gate. Normal sequence:

`validation → dry-run → D1 migration when required → production deploy → runtime evidence`

A successful PR check is not proof that production was mutated.

No production secrets belong in source, Markdown, issues, logs or chat.

## 5. ADMIN / PRODUCTION STATUS

Admin authentication has been hardened with stateless HMAC-SHA-256 signed sessions.

- PR #72 merged: `0c211cd8de16ff4ad0fde5f458a4237f5f43126f`.
- Admin pipeline run `34560451685`: SUCCESS.
- PR #73 aligned Production Smoke with the hardened Admin login/session flow.
- Current production acceptance remains **NOT GREEN** until reachable runtime evidence confirms `/admin`, `/admin.html`, `/api/admin/dashboard`, authentication boundaries and authenticated CRUD/media paths.

Required security behavior:
- Login requires `ADMIN_PASSWORD` and `ADMIN_TOKEN` server-side.
- Missing required secrets fail closed.
- Invalid/malformed/random/tampered/expired session tokens must return 401.
- Valid signed session permits protected Admin operations.

## 6. APK STATUS

Current source:
- Application ID: `com.phanthuanxtra.app`
- Version: `1.2.0`
- versionCode: `3`
- minSdk: `26`
- targetSdk: `35`
- Production App API: `https://phanthuanxtra.com/api/app/v1`

**APK 1.2.0 source: PRESENT. Fresh independent CI artifact/hash + material S21 regression: NOT YET PROVEN by this audit.**

Do not call APK 1.2.0 release-ready until the intended build is independently evidenced and the required device gate is tied to that build.

### APK hardening queue
- Vehicle detail/edit.
- Create/update/delete.
- available/reserved/sold status.
- Explicit destructive confirmation.
- Featured toggle.
- Gallery/cover management.
- Lead status/note editing.
- Search/filter.
- Retry/offline/error UX.
- Token validation and clear auth failures.
- Production-safe validation before destructive operations.

## 7. BACKUP STATUS

Backup workflow exists with integrity-hardening code, but backup is **NOT OPERATIONALLY GREEN** until a real successful backup plus restore/readability test is evidenced.

Do not create a second backup workflow or repurpose the existing `*/5` Telegram self-healing cron.

## 8. TELEGRAM / AI RULES

- Auto webhook: `/api/telegram/webhook`.
- VIP webhook: `/api/telegram/vip-webhook`.
- Do not recreate stale `/api/telegram/auto-webhook`.
- Auto publish requires real `brand` + `model` and confidence `>= 0.85`.
- Duplicate processing must remain idempotent.
- Unknown AI questions must use human handoff rather than fabricated answers.
- PT Xtra media branding is a display/publish artifact; original R2 source media remains unchanged.

## 9. ACTIVE PR WORKSTREAMS

Current work must continue through existing PRs where applicable rather than creating duplicate implementations. Recheck each PR against current `main` before merge.

Known workstreams include PR #53, #54, #55, #66 and #49, plus other currently open PRs discoverable from GitHub. Historical PR descriptions do not override current source or CI evidence.

Rule: **one logical task → one implementation path → one release gate.**

## 10. REQUIRED RELEASE GATES

Production is GREEN only when applicable gates are all evidenced:

1. Current source commit identified.
2. Relevant CI validation passes.
3. Cloudflare dry-run/config validation passes.
4. D1 migration safety verified when migrations change.
5. Production deployment directly evidenced.
6. Reachable production runtime smoke/E2E passes.
7. Intended APK build and artifact hash recorded.
8. Required real-device APK regression passes.
9. Backup succeeds and restore/readability is verified.

## 11. NEXT EXECUTION ORDER

1. Verify newest production GitHub Actions result for current `main` and current Worker version.
2. Obtain reachable Admin runtime smoke/E2E; if 403 persists, investigate edge/custom-domain/Access/WAF/route behavior before changing Worker routing.
3. Obtain fresh APK 1.2.0 artifact/hash and repeat the material S21 gate.
4. Review existing PR #53/#54/#55/#66/#49 against current `main`; do not create competing implementations.
5. Verify real backup + restore/readability.
6. Complete Auto Bot E2E, vehicle lookup E2E and VIP idempotency E2E where not independently proven.
7. Audit GitHub/Cloudflare consolidation only after runtime gates permit cleanup.

## 12. DOCUMENTATION POLICY

**This file is the only project-status/handoff Markdown file.**

Superseded root project audit/checkpoint/status/handoff documents have been removed to prevent stale instructions from being followed.

`SECURITY.md` is retained separately as the repository security baseline. GitHub operational metadata such as `.github/pull_request_template.md` is not a project-status document.

Future substantive continuity updates must update this file rather than creating another project-status/checkpoint Markdown file.

## 13. SAFETY PRINCIPLE

- No secret guessing.
- No force-push.
- No unreviewed destructive production changes.
- No duplicate infrastructure from historical documentation.
- No false GREEN claim from CI/merge alone.
- Source + current CI + runtime evidence outrank historical documentation.
