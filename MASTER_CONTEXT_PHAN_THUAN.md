# MASTER CONTEXT — PHAN THUẦN XTRA

> **Purpose:** Single handoff/checkpoint document so any AI/session can resume PHAN THUẦN XTRA without reconstructing prior conversations.
>
> **Last updated:** 2026-09-07 (Vietnam, UTC+7)
> **Current milestone:** S21 Ultra production-admin APK integrated with phanthuanxtra.com backend; production deployment GREEN.
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
12. Real-device testing cannot be truthfully marked complete until the S21 Ultra has installed and exercised the APK.

---

## 3. CURRENT PRODUCTION CHECKPOINT — 2026-09-07

### STATUS: GREEN / DEPLOYED

The previous Cloudflare production credential problem is resolved.

Historical failure:
- Workflow `34085914775`
- `Apply D1 migrations` failed with Cloudflare `10000` / `9109`.

Resolution:
- New Cloudflare token verified active.
- Correct account ID: `5f35d608938abe622b694bab3af1319c`.
- GitHub production environment secrets were corrected.

### CURRENT VERIFIED DEPLOYMENT

Production workflow after Android API integration:
- Run: `34090076816`
- Head SHA: `de33cfe2ce6b2e99bfa6f7b19f8aad91fabc2cd1`
- `CI / Validate` → **SUCCESS**
- Wrangler dry-run → **SUCCESS**
- `Apply D1 migrations` → **SUCCESS**
- `Deploy to Cloudflare` → **SUCCESS**

Therefore the production Worker is deployed with the Android App API integration.

---

## 4. CRITICAL ANDROID/PRODUCTION DISCOVERY + FIX

### Discovery
The repository already contained `src/app-api.js` implementing:
- `/api/app/v1/health`
- authenticated `/api/app/v1/dashboard`
- authenticated `/api/app/v1/cars`
- authenticated `/api/app/v1/cars/:id`
- authenticated `/api/app/v1/media`
- authenticated `/api/app/v1/vehicle/analyze`
- authenticated `/api/app/v1/leads`

The Android APK already targeted:
`https://phanthuanxtra.com/api/app/v1`

However, the production Worker entrypoint `src/index.js` did **not** import/call `handleAppApi` before the fix. This meant the APK's intended API surface was not actually wired into the Worker request dispatcher.

### Fix
Commit:
`de33cfe2ce6b2e99bfa6f7b19f8aad91fabc2cd1`

Message:
`fix: wire Android app API into production Worker`

Changes:
- imported `handleAppApi` from `./app-api.js`
- routed `handleAppApi(r,e)` from the Worker fetch handler before the legacy admin/static routes.

This commit passed CI, D1 migration, and production Worker deployment.

---

## 5. S21 ULTRA ADMIN APK — CURRENT BUILD

### App identity
- Application ID: `com.phanthuanxtra.app`
- Version: `1.1.0`
- versionCode: `2`
- minSdk: `26`
- targetSdk: `35`
- INTERNET permission enabled.

### Current APK feature set
Commit:
`d3859fc06b5a5c69218883699b4c994558567e02`

Message:
`feat: expand S21 admin app for website management`

The APK now provides:
- Save APP API token locally in app preferences.
- Connection/health check.
- Dashboard.
- Vehicle inventory (`KHO XE`).
- Leads/customer list (`KHÁCH HÀNG / LEADS`).
- Add vehicle using photo picker + Vehicle AI.
- Upload vehicle image to production media storage.
- Create vehicle record in production D1 through App API.
- Open `phanthuanxtra.com` directly from the app.

Android API base:
`https://phanthuanxtra.com/api/app/v1`

### Latest APK workflow
- Run: `34090103902`
- Run number: `14`
- Head SHA: `d3859fc06b5a5c69218883699b4c994558567e02`
- Build: **SUCCESS**
- Artifact: `phanthuanxtra-apk-debug`
- Artifact ID: `10006523773`
- Artifact digest: `sha256:60193bf938a38800e0d5d16be5e51e9be72291cd602cafcd88986220535ca76a`
- Artifact is not expired.

### Important distinction
**APK build is GREEN, but real S21 Ultra installation/execution is still the remaining physical-device gate.** Do not mark that step DONE without an actual device test.

---

## 6. ANDROID SOURCE CHECKPOINT

`android/app/build.gradle` currently defines:
- namespace `com.phanthuanxtra.app`
- compileSdk 35
- minSdk 26
- targetSdk 35
- versionCode 2
- versionName `1.1.0`

`AndroidManifest.xml` includes INTERNET permission and launcher activity.

`MainActivity.java` currently targets the production App API and provides the S21 management actions described above.

---

## 7. PRODUCTION APP API

Source:
`src/app-api.js`

Authentication:
- `Authorization: Bearer <APP_API_TOKEN>`
- Worker environment must provide `APP_API_TOKEN`.
- Never store or expose the actual token in this checkpoint.

Endpoints implemented:

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

The App API uses D1 for vehicle/lead data and MEDIA storage for uploaded images.

---

## 8. IMPORTANT GIT CHECKPOINTS

### APK MVP
`cde5084e0838f0869529884f29e3ea14c307004e`

### Android workflow
`643e0ea9ced74ad6518d292dadcf2bb73fecc404`

### APK 1.1.0 / versionCode 2
`19325b9c41168f05de98dee38734abfa39a65d88`

### Auto Bot
`d7c5dd004ed39035932be76d5b87b8feefe1d823`

Message: `fix: make Auto Bot bundle processing single-flight`

### VIP Bot
`cb042effbdc06d0bb49d35a314a6dcf58e790e86`

Message: `fix: make VIP Bot Telegram inputs idempotent`

### Production App API integration
`de33cfe2ce6b2e99bfa6f7b19f8aad91fabc2cd1`

### S21 admin app expansion
`d3859fc06b5a5c69218883699b4c994558567e02`

---

## 9. D1 MIGRATIONS — DO NOT DELETE/BYPASS

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

## 10. TEST / CI STATE

Latest production deployment run `34090076816`:
- CI syntax/tests → PASS
- Wrangler dry-run → PASS
- D1 migrations → PASS
- Worker deploy → PASS

Latest APK run `34090103902`:
- Gradle assembleDebug → PASS
- APK artifact upload → PASS

Existing tests/validation cover:
- Telegram caption Unicode and real vehicle fields
- AI draft identity/confidence gating
- Immediate webhook receipt
- Branding not being an identity gate
- Telegram duplicate protection
- JavaScript syntax/tests
- Wrangler dry-run

Remaining testing gap:
- Dedicated regression tests should be strengthened for Auto Bot single-flight and VIP Bot idempotency.
- Real S21 Ultra end-to-end test is still required.

---

## 11. CURRENT EXECUTION ROADMAP

```text
1. App API tối thiểu                 → DONE
2. Android APK MVP                   → DONE
3. Production API integration        → DONE
4. Production Worker deployment     → DONE / GREEN
5. S21 Ultra APK build               → DONE / GREEN
6. S21 Ultra installation            → NEXT PHYSICAL GATE
7. S21 production API smoke test     → NEXT
8. Add/edit/delete vehicle workflow  → NEXT HARDENING
9. Leads workflow                    → NEXT HARDENING
10. Auto Bot single-flight E2E       → NEXT
11. VIP Bot idempotency E2E          → NEXT
12. Final production acceptance      → FINAL
```

---

## 12. IMMEDIATE NEXT ACTIONS

### A. S21 Ultra
1. Obtain artifact `phanthuanxtra-apk-debug` from workflow `34090103902`.
2. Install on S21 Ultra.
3. Enter the APP API token locally; never send it to chat.
4. Press `KIỂM TRA KẾT NỐI`.
5. Press `DASHBOARD`.
6. Press `KHO XE`.
7. Press `KHÁCH HÀNG / LEADS`.
8. Test `THÊM XE + AI` with a real vehicle photo.
9. Verify the newly created vehicle appears on the website.
10. Open `PHANTHUANXTRA.COM` from the app and confirm the listing is visible.

### B. Website management hardening
The current APK is an admin MVP. Next implementation should add:
- vehicle detail/edit form
- status changes: available/reserved/sold
- delete with confirmation
- featured toggle
- image gallery management
- lead status/note editing
- search/filter
- retry/offline/error UX
- token validation and clearer auth failure messages

### C. Auto Bot
- Add/verify explicit concurrent duplicate regression tests.
- Verify one bundle produces one effective processing result.

### D. VIP Bot
- Add/verify explicit repeated Telegram event regression tests.
- Verify downstream side effects remain idempotent.

### E. Final production acceptance
- CI green.
- D1 migrations green.
- Worker deploy green.
- S21 real-device tests green.
- Website listing CRUD verified.
- Auto Bot E2E verified.
- VIP Bot E2E verified.

---

## 13. CLOUDFLARE CREDENTIAL FACTS

Correct account ID:
`5f35d608938abe622b694bab3af1319c`

Token was verified active and successfully used by production GitHub Actions.

Expected production permissions:
- Account → D1 → Edit
- Account → Workers Scripts → Edit

Never store actual token values in this file.

---

## 14. GITHUB CLI STATE

Windows 10:
`gh version 2.100.0 (2026-09-03)`

GitHub CLI browser authentication completed successfully.

Useful commands:

```powershell
gh auth status
gh repo view phanthuanxtra-v9/phanthuanxtra-v9
gh secret list --repo phanthuanxtra-v9/phanthuanxtra-v9 --env production
```

Never output secret values.

---

## 15. KNOWN RISKS / DO NOT ASSUME

1. Green CI/deploy does not equal real S21 device success.
2. APK build success does not prove authentication or API behavior on-device.
3. The App API token must exist in the Worker environment; never hard-code it in the APK.
4. Do not confuse `ADMIN_TOKEN` legacy admin routes with `APP_API_TOKEN` App API routes.
5. Do not delete or bypass D1 migrations.
6. Do not weaken production authentication merely to simplify mobile testing.
7. Do not mark Auto Bot/VIP Bot complete without duplicate/concurrency evidence.
8. Do not claim website CRUD is complete until edit/delete/status/featured behavior is actually tested.

---

## 16. HANDOFF PROTOCOL FOR A NEW AI

1. Read this entire file.
2. Inspect current `main` HEAD.
3. Inspect latest GitHub Actions runs.
4. If production is green, do not re-solve the old Cloudflare credential issue.
5. Start at the first unfinished item in Section 11.
6. Execute and verify it.
7. Update this checkpoint with date/time, commit SHA, workflow run, tests, production state, and next action.
8. Commit the checkpoint to `main`.
9. Report only verified facts and remaining blockers.

---

## 17. CHECKPOINT HISTORY

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
- APK artifact digest:
  `sha256:60193bf938a38800e0d5d16be5e51e9be72291cd602cafcd88986220535ca76a`

---

## 18. ONE-LINE CURRENT STATE

**PHAN THUẦN XTRA production is GREEN; the S21 Ultra admin APK is built and connected to the production App API; next gate is physical S21 installation + real production smoke test, then complete mobile CRUD and Auto Bot/VIP Bot end-to-end acceptance.**
