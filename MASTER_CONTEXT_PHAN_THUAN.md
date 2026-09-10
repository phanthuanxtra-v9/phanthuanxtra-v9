# MASTER CONTEXT — PHAN THUẦN XTRA

> **Purpose:** Single handoff/checkpoint document so any AI/session can resume PHAN THUẦN XTRA without reconstructing prior conversations.
>
> **Last updated:** 2026-09-08 (Vietnam, UTC+7)
> **Current milestone:** S21 Ultra physical production test PASSED. Core roadmap continues with mobile management hardening, Auto Bot E2E, vehicle lookup E2E and VIP E2E. New operational requirement: `@phanthuanxtra2026_bot` is reserved as the daily website/data backup and disaster-recovery bot.
> **Rule:** Do not regress working production code or remove/skip D1 migrations merely to make CI green.

---

## 1. PROJECT IDENTITY

**Project:** PHAN THUẦN XTRA

**Primary repository:** `phanthuanxtra-v9/phanthuanxtra-v9`

**Production Worker:** `phanthuanxtra-v2`

**Developer Gateway:** `phanthuanxtra-developer-gateway`

**Gateway URL:** `https://phanthuanxtra-developer-gateway.phanthuanmodelactor.workers.dev`

**Website:** `https://phanthuanxtra.com`

**Default branch:** `main`

**GitHub repository:** `https://github.com/phanthuanxtra-v9/phanthuanxtra-v9`

---

## 2. OPERATING RULES FOR ANY AI

1. Continue from this file first; treat it as the authoritative handoff checkpoint.
2. Execute, verify, then report. User prefers direct execution and says “tiến hành ngay”.
3. Work in Vietnamese unless requested otherwise.
4. Be an intellectual sparring partner: test assumptions, identify risks, provide counterpoints, prioritize truth over agreement.
5. Never claim success without checking actual repo/CI/production state.
6. Never ask the user to paste Cloudflare API tokens, passwords, GitHub tokens, or other secrets into chat.
7. Windows 10 → PowerShell commands. S21 Ultra → Termux-compatible commands.
8. Do not remove/bypass D1 migrations to hide failures.
9. Preserve existing production functionality while making fixes.
10. When a milestone materially changes, update this file and commit it.
11. Prefer direct GitHub/repo/workflow inspection over assumptions.
12. Real-device testing is complete only when the user confirms the S21 Ultra has installed and exercised the APK.
13. Tooling such as OpenCode Mobile must support the project; it must not silently become a prerequisite for the production APK.
14. Never store Telegram bot tokens or other production secrets in this document, source code, commits, logs, or chat.
15. Backup implementation must be verified before being declared operational; documentation alone is not proof of a working backup.

---

## 3. CURRENT PRODUCTION CHECKPOINT — 2026-09-07

### STATUS: GREEN / DEPLOYED

Production deployment after Android API integration:
- Run: `34090076816`
- Head SHA: `de33cfe2ce6b2e99bfa6f7b19f8aad91fabc2cd1`
- CI / Validate → SUCCESS
- Wrangler dry-run → SUCCESS
- D1 migrations → SUCCESS
- Deploy to Cloudflare → SUCCESS

Production Worker is deployed with the Android App API integration.

---

## 4. ANDROID/PRODUCTION DISCOVERY + FIX

The repository contains `src/app-api.js` implementing the Android App API, including health, dashboard, cars, media, vehicle AI and leads endpoints.

The APK targets:
`https://phanthuanxtra.com/api/app/v1`

The production Worker previously failed to dispatch this API because `src/index.js` did not call `handleAppApi()`.

Fix commit:
`de33cfe2ce6b2e99bfa6f7b19f8aad91fabc2cd1`

Message:
`fix: wire Android app API into production Worker`

The fix passed CI, D1 migration and production Worker deployment.

---

## 5. S21 ULTRA ADMIN APK — VERIFIED

### App identity
- Application ID: `com.phanthuanxtra.app`
- Version: `1.1.0`
- versionCode: `2`
- minSdk: `26`
- targetSdk: `35`
- INTERNET permission enabled.

### Latest APK source
Commit:
`d3859fc06b5a5c69218883699b4c994558567e02`

The APK provides:
- Save APP API token locally.
- Connection/health check.
- Dashboard.
- Vehicle inventory (`KHO XE`).
- Leads/customer list (`KHÁCH HÀNG / LEADS`).
- Add vehicle using photo picker + Vehicle AI.
- Upload vehicle image to production media storage.
- Create vehicle record in production D1 through App API.
- Open `phanthuanxtra.com` directly.

Android API base:
`https://phanthuanxtra.com/api/app/v1`

### Latest APK workflow
- Run: `34090103902`
- Run number: `14`
- Head SHA: `d3859fc06b5a5c69218883699b4c994558567e02`
- Build: SUCCESS
- Artifact: `phanthuanxtra-apk-debug`
- Artifact ID: `10006523773`
- Artifact digest: `sha256:60193bf938a38800e0d5d16be5e51e9be72291cd602cafcd88986220535ca76a`

### PHYSICAL S21 ULTRA GATE — PASSED

User confirmed that the APK was installed on the real S21 Ultra, the production test was completed successfully, and additional fixes/upgrades are now requested.

Therefore the previous physical-device gate is no longer blocking the roadmap.

---

## 6. PRODUCTION APP API

Source:
`src/app-api.js`

Authentication:
- `Authorization: Bearer <APP_API_TOKEN>`
- Worker environment must provide `APP_API_TOKEN`.
- Never store or expose the actual token in this checkpoint.

Endpoints currently implemented:

```text
GET  /api/app/v1/health
GET  /api/app/v1/dashboard
GET  /api/app/v1/cars
GET  /api/app/v1/cars/:id
POST /api/app/v1/cars
PUT  /api/app/v1/cars/:id
POST /api/app/v1/media
POST /api/app/v1/vehicle/analyze
GET  /api/app/v1/leads
```

The App API uses D1 for vehicle/lead data and media storage for uploaded images.

---

## 7. MOBILE MANAGEMENT HARDENING — NEXT CORE PRODUCT STAGE

The current APK is functional and physically tested. Next implementation should strengthen it into the operational management app:

- Vehicle detail/edit form.
- Create/update/delete vehicle workflow.
- Status changes: available / reserved / sold.
- Delete with explicit confirmation.
- Featured toggle.
- Image gallery management.
- Lead status and note editing.
- Search/filter.
- Retry/offline/error UX.
- Token validation and clearer authentication failure messages.
- Production-safe validation before destructive operations.

Do not remove working MVP functions while adding these capabilities.

**Product direction:** PHAN THUẦN XTRA is the project and the APK/application name. Do not invent a separate product name for the APK.

---

## 8. OPEN CODE MOBILE / AI6 — EVALUATION CHECKPOINT

OpenCode Mobile is approved as parallel development/agent-control tooling, not a core-product blocker. The actual AI6/A16 OpenCode Server endpoint, authentication and private network path remain to be verified.

Security requirements:
- Prefer private HTTPS connectivity rather than exposing port 4096 publicly.
- Authentication enabled.
- No production secrets in source, commits, logs or chat.
- No automatic production deployment/migration privileges.
- Keep production mutations behind review/deploy controls.

---

## 9. BOT ARCHITECTURE — OPERATIONAL OWNERSHIP

### `@phanthuanxtra_auto_bot`

**Primary mission:** NHẬP XE LÊN WEBSITE / VEHICLE INGESTION.

Responsibilities:
- Receive vehicle information/media.
- Normalize and validate vehicle fields.
- Use Vehicle AI where appropriate.
- Create/update vehicle inventory records.
- Persist vehicle images/media.
- Publish/update vehicle listings according to business rules.
- Prevent duplicate/concurrent processing.
- Report failures without partial/duplicate vehicle records.

Existing related checkpoint:
`d7c5dd004ed39035932be76d5b87b8feefe1d823`

Required acceptance:
- Repeated/concurrent duplicate events → one effective processing result.
- Vehicle data and media remain consistent.
- Production listing is verifiable after ingestion.

### `@phanthuanxtra2026_bot`

**Primary mission: DAILY BACKUP / DISASTER RECOVERY.**

**Fixed schedule:** every day at **07:00 Vietnam time (UTC+7)**, equivalent to **00:00 UTC**.

Backup scope must cover the complete operational website/data state, subject to platform API/storage limitations:
- Website source/deployment assets needed to reconstruct the production site.
- D1 database `phanthuanxtra-db` including schema/data required for recovery.
- R2 media bucket `phanthuanxtra-media` and associated media inventory.
- Wrangler configuration and D1 migration history needed for reconstruction.
- Backup manifest with timestamp, component status, object/file counts where available, and integrity/checksum information where practical.

Required workflow:
```text
07:00 VN
  ↓
Backup Engine
  ↓
Website + D1 + R2 + recovery metadata
  ↓
Integrity verification
  ↓
Immutable/versioned backup record
  ↓
@phanthuanxtra2026_bot
  ↓
Telegram SUCCESS / FAILED report
```

Operational requirements:
- Backup must be independent enough to remain useful if the production Worker has a failure.
- Do not use the Telegram bot itself as the only backup storage.
- Never expose or commit the bot token.
- Fail loudly if any critical component cannot be backed up.
- Prefer versioned/date-stamped backup paths so one failed run does not overwrite the previous good backup.
- Retention policy must be defined before production rollout; recommended starting point is daily backups with multiple recovery points rather than a single rolling copy.
- A backup is **NOT operational** until a real backup has completed successfully and a restore/readability test has been verified.

Current status:
**PLANNED / NOT YET IMPLEMENTED.**

Important current evidence:
- `wrangler.json` currently defines Worker `phanthuanxtra-v2`, D1 `phanthuanxtra-db`, and R2 bucket `phanthuanxtra-media`.
- Existing Worker scheduled execution is currently `*/5 * * * *` and is used for Telegram webhook self-healing/notification reconciliation; do not silently repurpose it for the backup system.
- No Telegram token or backup credential is recorded here.

### `@phanthuanxtra_bot`

**Primary mission:** TRA CỨU THÔNG TIN XE.

Responsibilities:
- Search/query vehicle inventory.
- Return vehicle information accurately.
- Return registration/inspection information when available.
- Return associated vehicle images/media.
- Keep lookup grounded in production data.
- Do not modify inventory unless explicitly authorized.

### `@phanthuanxtra_vip_bot`

**Primary mission:** VIP VEHICLE INTELLIGENCE / ORIGIN & MODIFICATION ANALYSIS.

Existing checkpoint:
`cb042effbd06c0bb49d35a314a6dcf58e790e86`

Required acceptance:
- Repeated Telegram events do not create duplicate downstream side effects.
- VIP intake/session/media persistence remains idempotent.

---

## 10. BOT E2E ROADMAP

```text
S21 physical test                         → DONE
        ↓
Mobile management hardening              → NEXT CORE PRODUCT
        ↓
@phanthuanxtra_auto_bot                  → vehicle ingestion
        ↓
Auto Bot duplicate/concurrency E2E       → VERIFY
        ↓
@phanthuanxtra_bot                       → vehicle lookup
        ↓
Lookup data/image/registration E2E        → VERIFY
        ↓
VIP Bot idempotency E2E                  → VERIFY
        ↓
@phanthuanxtra2026_bot                   → daily backup implementation
        ↓
Backup + restore E2E                     → VERIFY
        ↓
Full production acceptance               → FINAL
```

The backup bot may be implemented in parallel, but it must not be declared complete from configuration/source inspection alone. The acceptance gate is a successful scheduled-equivalent backup plus verified restore/readability and a Telegram success report.

---

## 11. IMPORTANT GIT CHECKPOINTS

### APK MVP
`cde5084e0838f0869529884f29e3ea14c307004e`

### Android workflow
`643e0ea9ced74ad6518d292dadcf2bb73fecc404`

### APK 1.1.0 / versionCode 2
`19325b9c41168f05de98dee38734abfa39a65d88`

### Auto Bot single-flight
`d7c5dd004ed39035932be76d5b87b8feefe1d823`

### VIP Bot idempotency
`cb042effbd06c0bb49d35a314a6dcf58e790e86`

### Production App API integration
`de33cfe2ce6b2e99bfa6f7b19f8aad91fabc2cd1`

### S21 admin app expansion
`d3859fc06b5a5c69218883699b4c994558567e02`

### Current documentation update
This revision records the new operational ownership of `@phanthuanxtra2026_bot` as the daily 07:00 Vietnam-time backup/disaster-recovery bot. The implementation itself remains pending until source, storage, schedule, credentials and restore E2E are implemented and verified.

---

## 12. D1 MIGRATIONS — DO NOT DELETE/BYPASS

- `0001_init.sql`
- `0002_posts.sql`
- `0003_reconcile_cars.sql`
- `0004_telegram_posts.sql`
- `0005_telegram_inbox.sql`
- `0006_vehicle_ai_drafts.sql`
- `0007_ai_chat.sql`
- `0008_telegram_chat_bots.sql`
- `0009_ai_unknown_questions.sql`
- `0010_telegram_notifications.sql`
- `0011_vip_vehicle_intelligence.sql`

Production migration is currently passing.

---

## 13. TEST / CI STATE

Latest known production deployment run `34090076816`:
- CI syntax/tests → PASS
- Wrangler dry-run → PASS
- D1 migrations → PASS
- Worker deploy → PASS

Latest known APK run `34090103902`:
- Gradle assembleDebug → PASS
- APK artifact upload → PASS
- Real S21 Ultra installation and production test → USER-CONFIRMED PASS

Remaining verification:
- Mobile CRUD hardening.
- Auto Bot single-flight E2E.
- Vehicle lookup bot E2E.
- VIP Bot idempotency E2E.
- `@phanthuanxtra2026_bot` backup implementation and restore E2E.
- Final production acceptance.
- AI6/OpenCode Server endpoint and secure connectivity verification.

---

## 14. WINDOWS 10 POWERSHELL WORKSPACE

The user's current PowerShell prompt is:
`PS C:\Windows\system32>`

Do not assume the local clone path. Locate the actual clone first, then run Git commands from that directory.

Recommended safe discovery command:

```powershell
Get-ChildItem -Path $HOME -Directory -Recurse -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -eq 'phanthuanxtra-v9' } |
  Select-Object -ExpandProperty FullName
```

If the clone is found, enter that exact directory and verify:

```powershell
cd "<FOUND_PATH>"
git status
git remote -v
git branch --show-current
git log -5 --oneline
```

Never paste secrets/tokens into PowerShell output or chat.

---

## 15. CURRENT EXECUTION PLAN

### Core product critical path
1. Locate/verify Windows 10 local repository.
2. Inspect current `main` HEAD and working tree.
3. Implement mobile management hardening only where source/production evidence requires it.
4. Inspect Auto Bot implementation, tests and workflow.
5. Strengthen missing Auto Bot regression/E2E coverage.
6. Inspect `@phanthuanxtra_bot` lookup implementation, tests and workflow.
7. Strengthen lookup E2E coverage.
8. Inspect VIP Bot implementation and complete real idempotency E2E.
9. Implement `@phanthuanxtra2026_bot` backup engine, independent backup storage, 07:00 VN schedule, integrity verification and Telegram reporting.
10. Execute a real backup and a restore/readability test before declaring backup operational.
11. Run final production acceptance.

### Backup implementation design gate
Before writing production code, verify:
- exact Telegram token secret name for `@phanthuanxtra2026_bot`;
- exact Worker/cron ownership;
- D1 export/backup mechanism available to the chosen execution environment;
- R2 replication/export strategy;
- website/source recovery strategy;
- independent backup destination and retention;
- failure notification path;
- restore procedure and test fixture.

Do not invent unsupported Cloudflare APIs. If a platform capability is unavailable directly from the Worker runtime, use a controlled scheduled GitHub/Cloudflare job with least-privilege credentials rather than pretending the Worker can perform it.

### Production safety
- No secret values in source/docs/chat.
- No direct production mutation from S21/Termux.
- Production changes go through GitHub/CI/Cloudflare deployment controls.
- Do not call Telegram `setWebhook` or mutate Cloudflare configuration merely during diagnosis unless explicitly authorized.
- Never mark a backup as successful merely because files were copied; verify readability/integrity and, for a recovery milestone, restore a test copy.


## HANDOFF-20260910-ADMIN-CONTINUITY
**Current AI:** ChatGPT

**Admin boundary correction:**
- `admin.phanthuanxtra.com` = PHAN THUAN XTRA Content/Admin Portal for vehicle listings and website publishing.
- `ask-ai-agent.phanthuanmodelactor.workers.dev/admin` = Ask AI Admin; it is a separate AI operations surface.
- Do not merge these domains, routes, authentication models, or runtime assumptions.

**Current CI/security work:**
- PR #61 adds `environment: production` to the Cloudflare production deploy job so GitHub Environment `production` controls production mutation.
- Owner reports production environment and repository Cloudflare secrets exist; secret values must never enter Markdown.

**Admin production acceptance:**
`admin domain → DNS/custom domain → Worker/Pages → auth → Admin API → D1/R2 → publish → public site → Android/S21`

**Evidence boundary:** direct runtime/domain mapping for `admin.phanthuanxtra.com` is not yet independently verified in the current tool session. Do not invent Worker, binding, credential, or deployment information.

**Next actions:** verify PR #61 CI; then use fresh production evidence to trace Admin runtime/API/security/UX and update this handoff after each meaningful change.
