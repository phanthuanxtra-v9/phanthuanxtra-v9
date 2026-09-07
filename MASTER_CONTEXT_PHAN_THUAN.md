# MASTER CONTEXT — PHAN THUẦN XTRA

> **Purpose:** Single handoff/checkpoint document so any AI/session can resume PHAN THUẦN XTRA without reconstructing prior conversations.
>
> **Last updated:** 2026-09-07 (Vietnam, UTC+7)
> **Current milestone:** S21 Ultra physical production test PASSED; mobile management hardening is next, with Auto Bot + vehicle lookup + VIP E2E following. OpenCode Mobile/AI6 has been evaluated and approved as a parallel development/operations capability, not a blocker for the core product roadmap.
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

### Objective

Evaluate whether OpenCode Mobile should be added as a parallel capability while the PHAN THUẦN XTRA APK remains the primary operational application.

### Evidence

The user wants the S21 Ultra to eventually manage the PHAN THUẦN XTRA system from the finished APK, while also being able to work remotely with AI6 through OpenCode Mobile.

The current S21 Termux evidence shows:
- Node.js: `v24.17.0`
- architecture: `aarch64`
- Android kernel: `5.4.242-30958140-abG998NKSSCHZA9`
- `opencode` CLI is not installed on the S21.
- `127.0.0.1:4096` is not listening on the S21.

This does **not** prove that AI6/A16 lacks an OpenCode Server. It only proves the S21 itself is not currently running one.

### Architectural assessment

OpenCode Mobile should be treated as a **development/agent control client**, not as a replacement for the PHAN THUẦN XTRA APK.

Preferred conceptual topology:

```text
PHAN THUẦN XTRA APK
    → production/system operations on S21

OpenCode Mobile
    → remote development/AI6 control

AI6 / OpenCode Server
    → project execution environment

ChatGPT
    → architecture, audit, GitHub/Cloudflare verification and review

GitHub
    → source/change history and collaboration boundary
```

### Recommendation

**APPROVE as a parallel capability, NOT as a core-product blocker.**

Reasons:
1. It can improve remote development and AI-agent collaboration.
2. It does not need to replace the APK's operational functions.
3. It can coexist on S21 without changing the production API architecture.
4. It can be introduced without weakening production security.
5. It should connect to an OpenCode Server running on the actual AI6/A16 execution environment, not by assuming `127.0.0.1:4096` on the S21.
6. The exact AI6/A16 host, network path, authentication and server status remain to be verified.

### Security / isolation requirements

- Prefer private HTTPS connectivity (for example Tailscale or an equivalent private access layer) rather than exposing port 4096 directly to the public Internet.
- OpenCode server authentication must be enabled.
- Never place `APP_API_TOKEN`, Cloudflare tokens, GitHub tokens or other production secrets in source, commits, logs or chat.
- OpenCode access must not automatically gain production deployment/migration privileges.
- Keep production mutations behind the existing review/deploy controls.
- Do not make OpenCode Mobile a dependency of the PHAN THUẦN XTRA APK runtime.

### Decision boundary

OpenCode Mobile integration can proceed in parallel **after the actual AI6/A16 OpenCode Server endpoint is identified and verified**.

It must not delay:
- Mobile management hardening.
- Auto Bot E2E.
- Vehicle lookup bot E2E.
- VIP Bot idempotency E2E.
- Final production acceptance.

---

## 9. BOT ARCHITECTURE — OPERATIONAL OWNERSHIP

### `@phanthuanxtra_auto_bot`

**Primary mission:** NHẬP XE LÊN WEBSITE / VEHICLE INGESTION.

Responsibilities:
- Receive vehicle information/media from the configured intake source.
- Normalize and validate vehicle fields.
- Use Vehicle AI where appropriate for image/data analysis.
- Create/update vehicle inventory records.
- Persist vehicle images/media.
- Publish/update vehicle listings on `phanthuanxtra.com` according to business rules.
- Prevent duplicate/concurrent processing.
- Report failures without creating partial/duplicate vehicle records.

Existing related checkpoint:
`d7c5dd004ed39035932be76d5b87b8feefe1d823`

Message:
`fix: make Auto Bot bundle processing single-flight`

Required acceptance:
- Same bundle/event repeated → one effective vehicle-processing result.
- Concurrent duplicate events → one effective result.
- Vehicle data and media remain consistent.
- Production listing is verifiable after ingestion.

### `@phanthuanxtra_bot`

**Primary mission:** TRA CỨU THÔNG TIN XE.

Responsibilities:
- Search/query vehicle inventory.
- Return vehicle information accurately.
- Return vehicle registration/inspection information when that data is available in the system.
- Return vehicle images/media associated with the vehicle.
- Answer vehicle lookup requests without modifying inventory unless an explicitly authorized workflow requires it.
- Keep responses grounded in production data and clearly distinguish unavailable information.

### `VIP Bot`

Existing checkpoint:
`cb042effbd06c0bb49d35a314a6dcf58e790e86`

Message:
`fix: make VIP Bot Telegram inputs idempotent`

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
Full production acceptance               → FINAL

OpenCode Mobile + AI6                    → PARALLEL TOOLING
                                           (does not block the above)
```

Important: do not mark Auto Bot or lookup bot complete from source inspection alone. Execute and verify their real workflows and downstream production effects.

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

### Current documentation checkpoint
This revision records:
- S21 physical test as PASSED.
- Current core product roadmap.
- OpenCode Mobile/AI6 as approved parallel tooling.
- The requirement to verify the actual AI6/A16 server before configuring the mobile connection.

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

Latest production deployment run `34090076816`:
- CI syntax/tests → PASS
- Wrangler dry-run → PASS
- D1 migrations → PASS
- Worker deploy → PASS

Latest APK run `34090103902`:
- Gradle assembleDebug → PASS
- APK artifact upload → PASS
- Real S21 Ultra installation and production test → **USER-CONFIRMED PASS**

Remaining verification:
- Mobile CRUD hardening.
- Auto Bot single-flight E2E.
- Vehicle lookup bot E2E.
- VIP Bot idempotency E2E.
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

If no local clone exists, clone the repository using the authenticated GitHub CLI/account already configured on Windows, rather than inventing a path.

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
8. Verify VIP Bot idempotency E2E.
9. Run CI/tests.
10. Deploy only verified changes.
11. Verify production effects.
12. Perform final production acceptance.
13. Update this checkpoint and commit it.

### Parallel OpenCode/AI6 track
A. Identify the actual AI6/A16 execution host.
B. Verify whether OpenCode Server exists there.
C. If absent, install/configure the official OpenCode server on that host.
D. Verify `/global/health` and server authentication.
E. Establish private HTTPS connectivity for S21.
F. Add the connection to OpenCode Mobile.
G. Test remote session/project access.
H. Keep OpenCode permissions isolated from production deployment/migration controls.

The OpenCode track is **parallel tooling** and must not displace the core product acceptance sequence unless a verified dependency is discovered.

---

## 16. KNOWN RISKS / DO NOT ASSUME

1. Green CI/deploy does not by itself prove bot E2E behavior.
2. APK build success is now supplemented by a user-confirmed real S21 production test.
3. App API token must remain server-side/locally configured; never expose actual values.
4. Do not confuse `ADMIN_TOKEN` legacy admin routes with `APP_API_TOKEN` App API routes.
5. Do not delete or bypass D1 migrations.
6. Do not weaken production authentication.
7. Do not mark Auto Bot complete without duplicate/concurrency evidence.
8. Do not mark vehicle lookup bot complete without verified production vehicle data/image responses.
9. Do not claim website CRUD is complete until edit/delete/status/featured behavior is actually tested.
10. Do not assume `127.0.0.1:4096` on S21 represents the AI6/A16 OpenCode Server.
11. Do not install OpenCode CLI on S21 merely because the Mobile Client displays a localhost connection profile.
12. Do not expose OpenCode port 4096 directly to the public Internet without a deliberate security review.
13. Do not grant OpenCode automatic production deploy, migration or secret-management authority.

---

## 17. HANDOFF PROTOCOL FOR A NEW AI

1. Read this entire file.
2. Inspect current `main` HEAD.
3. Inspect latest GitHub Actions runs.
4. If production is green, do not re-solve old Cloudflare credential issues.
5. Start at the first unfinished item in Section 15.
6. Execute and verify it.
7. Update this checkpoint with date/time, commit SHA, workflow run, tests, production state, and next action.
8. Commit the checkpoint to `main`.
9. Report only verified facts and remaining blockers.
10. Treat OpenCode Mobile/AI6 as a parallel capability unless evidence proves a dependency.

---

## 18. CHECKPOINT HISTORY

### 2026-09-07 — Production credential recovery
- Cloudflare credentials corrected.
- D1 migration and Worker deployment restored.

### 2026-09-07 — Android App API integration
- Discovered `src/app-api.js` existed but was not wired into `src/index.js`.
- Fixed and deployed in `de33cfe2ce6b2e99bfa6f7b19f8aad91fabc2cd1`.
- Production run `34090076816` passed all deployment stages.

### 2026-09-07 — S21 Ultra admin APK expansion
- Added connection health check.
- Added dashboard.
- Added vehicle inventory.
- Added leads view.
- Added AI vehicle intake/upload/create flow.
- Added direct website opening.
- APK workflow `34090103902` passed.

### 2026-09-07 — S21 physical test + bot role update
- User confirmed APK installation and production test on physical S21 Ultra completed successfully.
- `@phanthuanxtra_auto_bot` role confirmed: vehicle ingestion/publishing to website.
- `@phanthuanxtra_bot` role confirmed: vehicle information lookup, registration/inspection data when available, and vehicle images.
- This checkpoint was updated so subsequent AIs can take over without reconstructing the conversation.

### 2026-09-07 — OpenCode Mobile / AI6 evaluation
- User proposed adding OpenCode Mobile so S21 can work remotely with AI6.
- S21 Termux verification showed Node.js `v24.17.0`, aarch64 Android, and no local `opencode` executable.
- Local S21 `127.0.0.1:4096` health/doc checks failed because no local server is listening.
- Assessment: OpenCode Mobile is useful as parallel development/agent tooling, but the actual AI6/A16 server endpoint must be identified before connection.
- Decision status: **APPROVED AS PARALLEL TOOLING; NOT CORE PRODUCT DEPENDENCY.**

---

## 19. CHECKPOINT

- Date: 2026-09-07
- Repository: `phanthuanxtra-v9/phanthuanxtra-v9`
- Branch: `main`
- Current known HEAD: `ff1541de88ff7497b44ebd9b7b7d86b6431ab7b6`
- Production Worker: `phanthuanxtra-v2`
- Production deployment recorded: `34090076816`
- APK workflow recorded: `34090103902`
- S21 physical test: USER-CONFIRMED PASS
- Core next action: mobile management hardening
- Parallel action: identify and securely connect OpenCode Mobile to the actual AI6/A16 OpenCode Server
- Blocked: live Cloudflare connector is not currently available to this AI session
- No production code/deployment was changed by this documentation update

---

## 20. ONE-LINE CURRENT STATE

**PHAN THUẦN XTRA production is recorded GREEN; S21 Ultra APK v1.1.0 has been physically installed and production-tested successfully; core work continues with mobile management hardening → Auto Bot E2E → vehicle lookup E2E → VIP Bot E2E → final acceptance, while OpenCode Mobile + AI6 is approved as a parallel development/operations capability pending verification of the actual AI6/A16 OpenCode Server endpoint.**
