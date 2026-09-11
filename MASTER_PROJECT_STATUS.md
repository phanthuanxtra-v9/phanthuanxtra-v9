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
- Current main HEAD: `555d2500269de5a423908e14ffe4eb43f91cfca8`
- Production Worker: `phanthuanxtra-v2`
- Worker entry: `src/entry.js`
- Website: `https://phanthuanxtra.com`
- Admin: `https://phanthuanxtra.com/admin`
- Android application ID: `com.phanthuanxtra.app`

## 3. UNIFIED AI-1 → AI-6 AUDIT COMMAND

AI-1, AI-2, AI-3, AI-4, AI-5 and AI-6 are one engineering/audit team, not six independent projects.

- **AI-1:** Telegram / Vehicle AI / ingestion and vehicle automation.
- **AI-2:** QA / regression / production gates / data integrity.
- **AI-3:** GitHub / CI-CD / repository integration.
- **AI-4:** OpenCode / implementation and code-level execution support.
- **AI-5:** ChatGPT lead / architecture, remediation and continuity.
- **AI-6:** Senior Auditor / independent evidence review and release-gate authority.

Operating rule: the six roles collaborate on the same source of truth, same production architecture and same release gates. No role may create a competing Worker, database, branch strategy, status document or secret configuration without evidence.

The project may use available **Cloudflare Workers AI / gateway execution capacity** for audit and remediation workloads. Any stated compute/AI capacity is a utilization target, not a fabricated quota or guarantee. The team must report actual execution evidence rather than claiming a fixed “10,000 neurons/day” quota unless Cloudflare provides that quota directly.

## 4. CLOUDFLARE / WORKERS AUDIT MODE

The canonical target is direct evidence against the live Cloudflare production architecture:

- Worker: `phanthuanxtra-v2`
- D1: `phanthuanxtra-db`
- R2: `phanthuanxtra-media`
- Workers AI binding: `AI`
- Images binding: `IMAGES`
- AI Search binding: `AI_SEARCH`
- Assets binding: `ASSETS`
- Cron: `*/5 * * * *`
- Entry: `src/entry.js`

Audit sequence:

1. Reconcile `wrangler.json` and Worker source with the intended production resources.
2. Verify GitHub Actions deploy/dry-run evidence.
3. Verify reachable production runtime endpoints.
4. Verify Admin authentication boundaries and authenticated CRUD/media E2E.
5. Verify D1/R2 behavior and idempotency where applicable.
6. Verify Worker/route/domain alignment before any cleanup.
7. Record blockers instead of converting missing runtime access into a false GREEN.

Current tooling limitation: this ChatGPT session has GitHub access but no Cloudflare management connector/dashboard mutation API. Therefore no Cloudflare secret, route, Worker setting, binding or production resource is to be guessed or changed from this status update. Public runtime evidence and repository/CI evidence may be audited; privileged Cloudflare mutation requires an available Cloudflare API connection.

## 5. ADMIN INCIDENT — REMEDIATION STATUS

The Admin authentication vulnerability was hardened with stateless HMAC-SHA-256 signed sessions.

- PR #72 merged: `0c211cd8de16ff4ad0fde5f458a4237f5f43126f`.
- Admin pipeline run `34560451685`: SUCCESS.
- PR #73 aligned Production Smoke with the hardened Admin login/session flow.
- PR #74 restored the canonical Admin route behavior.
- PR #75 removed the legacy `/admin` redirect asset and replaced it with a direct UTF-8 Admin login fallback.

The source-side Admin route remediation is complete. **Production Admin is not declared fully GREEN until fresh runtime evidence proves `/admin`, `/admin.html`, `/api/admin/login`, `/api/admin/dashboard`, authenticated D1 CRUD and authenticated R2 media paths.**

Required security behavior:
- Login requires `ADMIN_PASSWORD` and `ADMIN_TOKEN` server-side.
- Missing required secrets fail closed.
- Invalid/malformed/random/tampered/expired session tokens must return 401.
- Valid signed session permits protected Admin operations.
- No production secret is stored in source, Markdown, issues, logs or chat.

Known previous production observation: the live Admin UI reported **“Admin credentials chưa được cấu hình”**, indicating that the production runtime did not have the required `ADMIN_PASSWORD` available at that observation point. Do not infer the current secret state from source alone. Re-run the production smoke after the secret is correctly configured in the actual execution environments.

## 6. PRODUCTION SMOKE / CURRENT GATES

`.github/workflows/production-smoke.yml` currently checks:

- website `/`
- `/api/health`
- `/api/cars`
- `/admin.html`
- production Worker root
- Admin invalid-login boundary = 401
- Admin unauthenticated dashboard boundary = 401
- Developer Gateway health and unauthorized boundary
- configured unified-AI production test
- required `GATEWAY_READ_TOKEN`
- Admin D1 create/read/delete E2E
- required `ADMIN_PASSWORD`
- R2 write/read/delete E2E
- legacy `car-lx600.html` check intentionally removed because that page was explicitly deleted

A previous smoke run failed at the obsolete `car-lx600.html` HTTP-307 check; that dependency has now been removed from both production source and the smoke gate.

The production smoke workflow must remain a release gate. A skipped legacy-page check must never be interpreted as a production pass.

## 7. CAR-LX600 CLEANUP

`public/car-lx600.html` was intentionally removed from `main`:

- commit `7b380f832565afc51af4a72e79f82eb16b730263`
- smoke dependency removed in commit `bbba3086b5947568bf065cee85c85b5dda3a281a`

No future implementation should recreate this obsolete example page unless explicitly requested.

## 8. GOD'S EYE CLEANUP

The public **XTRA World Intelligence / God's Eye View** feature was explicitly removed.

- Removal merged through PR #78.
- Merge commit: `555d2500269de5a423908e14ffe4eb43f91cfca8`.
- Repository search confirmed no remaining `gods-eye` code reference at the time of the audit.

Do not restore this feature unless explicitly requested.

## 9. APK STATUS

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

## 10. BACKUP STATUS

Backup workflow exists with integrity-hardening code, but backup is **NOT OPERATIONALLY GREEN** until a real successful backup plus restore/readability test is evidenced.

Do not create a second backup workflow or repurpose the existing `*/5` Telegram self-healing cron.

## 11. TELEGRAM / AI RULES

- Auto webhook: `/api/telegram/webhook`.
- VIP webhook: `/api/telegram/vip-webhook`.
- Do not recreate stale `/api/telegram/auto-webhook`.
- Auto publish requires real `brand` + `model` and confidence `>= 0.85`.
- Duplicate processing must remain idempotent.
- Unknown AI questions must use human handoff rather than fabricated answers.
- PT Xtra media branding is a display/publish artifact; original R2 source media remains unchanged.

## 12. ACTIVE PR / WORKSTREAM RULE

Current work must continue through existing PRs where applicable rather than creating duplicate implementations. Recheck each PR against current `main` before merge.

Known workstreams include PR #53, #54, #55, #66 and #49, plus other currently open PRs discoverable from GitHub. Historical PR descriptions do not override current source or CI evidence.

Rule: **one logical task → one implementation path → one release gate.**

## 13. REQUIRED RELEASE GATES

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

## 14. NEXT EXECUTION ORDER — IMMEDIATE

1. Run the unified AI-1 → AI-6 audit against current `main` and the actual Cloudflare production architecture.
2. Re-run/inspect Production Smoke after the obsolete `car-lx600.html` gate removal.
3. Close the Admin production gate with fresh runtime evidence; if `ADMIN_PASSWORD` is missing, configure it in the proper secret stores without exposing it in chat.
4. Verify Worker/domain/route alignment before any destructive Cloudflare cleanup.
5. Verify fresh APK 1.2.0 artifact/hash and S21 regression.
6. Verify real backup + restore/readability.
7. Complete Auto Bot E2E, vehicle lookup E2E and VIP idempotency E2E where not independently proven.
8. Only after runtime gates are green, audit consolidation/cleanup of duplicate infrastructure.

## 15. DOCUMENTATION POLICY

**This file is the only project-status/handoff Markdown file.**

Superseded root project audit/checkpoint/status/handoff documents have been removed to prevent stale instructions from being followed.

Future substantive continuity updates must update this file rather than creating another project-status/checkpoint Markdown file.

## 16. SAFETY PRINCIPLE

- No secret guessing.
- No force-push.
- No unreviewed destructive production changes.
- No duplicate infrastructure from historical documentation.
- No false GREEN claim from CI/merge alone.
- Source + current CI + runtime evidence outrank historical documentation.
- When privileged Cloudflare access is unavailable, report that limitation explicitly rather than simulating a Cloudflare audit or mutation.
