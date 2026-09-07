# MASTER CONTEXT — PHAN THUẦN XTRA

> **Purpose:** Single handoff/checkpoint document so any AI/session can resume PHAN THUẦN XTRA without reconstructing prior conversations.
>
> **Last updated:** 2026-09-07 (Vietnam, UTC+7)
> **Current milestone:** Production credential/deployment blocker RESOLVED.
> **Rule:** Do not regress working production code or remove/skip D1 migrations merely to make CI green.

---

## 1. PROJECT IDENTITY

**Project:** PHAN THUẦN XTRA

**Primary repository:** `phanthuanxtra-v9/phanthuanxtra-v9`

**Production Worker:** `phanthuanxtra-v2`

**Developer Gateway:** `phanthuanxtra-developer-gateway`

**Gateway URL:** `https://phanthuanxtra-developer-gateway.phanthuanmodelactor.workers.dev`

**Default branch:** `main`

**GitHub repository:** `https://github.com/phanthuanxtra-v9/phanthuanxtra-v9`

---

## 2. OPERATING RULES FOR ANY AI

1. **Continue from this file first.** Treat it as the current project state, not as a generic plan.
2. **Execute, verify, then report.** User prefers direct execution and says “tiến hành ngay”.
3. Work in Vietnamese unless the user requests another language.
4. Be an intellectual sparring partner: test assumptions, identify risks, give counterpoints, prioritize truth over agreement.
5. Do not claim success without checking the actual repo/CI/production state.
6. Never ask the user to paste Cloudflare API tokens, passwords, GitHub tokens, or other secrets into chat.
7. If a local command is needed:
   - Windows 10 → provide **PowerShell** commands.
   - S21 Ultra → provide **Termux-compatible** commands.
8. Do not remove or bypass D1 migrations to hide deployment failures.
9. Preserve existing production functionality while making fixes.
10. When a milestone materially changes, update this file and commit it so another AI can resume immediately.
11. Prefer direct GitHub/repo/workflow inspection over assumptions.
12. User expects work to continue until the current milestone is genuinely complete.

---

## 3. CURRENT PRODUCTION CHECKPOINT — 2026-09-07

### STATUS: GREEN / DEPLOYED

The previous production pipeline failed because the GitHub Actions Cloudflare credential was invalid/incorrect for the production operation.

Original failure:
- Workflow run: `34085914775`
- Job: `Deploy production Worker (Production)`
- Failed step: `Apply D1 migrations`
- Cloudflare errors: `Authentication error [10000]`, `Invalid access token [9109]`
- `Deploy to Cloudflare` was skipped because D1 migration failed.

Resolution:
- A new Cloudflare API token was created/verified locally by the user.
- Token verification returned `success: true`, status `active`.
- The token successfully accessed the correct Cloudflare account and could list the target D1 database.
- Correct Cloudflare Account ID:
  `5f35d608938abe622b694bab3af1319c`
- GitHub Actions Environment `production` contains:
  - `CLOUDFLARE_ACCOUNT_ID`
  - `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID` was updated using GitHub CLI.
- The failed workflow was rerun.

### VERIFIED RERUN RESULT

Workflow run `34085914775` latest attempt:

- `CI / Validate` → **SUCCESS**
- `Wrangler dry-run` → **SUCCESS**
- `Apply D1 migrations` → **SUCCESS**
- `Deploy to Cloudflare` → **SUCCESS**
- Production Worker deployment → **SUCCESS**

This is the authoritative current production checkpoint.

**Do not reopen the credential issue unless a future deployment reproduces it.**

---

## 4. IMPORTANT GIT / CODE CHECKPOINTS

Known commits in chronological project progress:

### APK MVP
- `cde5084e0838f0869529884f29e3ea14c307004e`
- Message: `feat: APK MVP with authenticated app API (#39)`

### Android workflow
- `643e0ea9ced74ad6518d292dadcf2bb73fecc404`
- Adds `.github/workflows/android-apk.yml`
- `workflow_dispatch`
- `permissions: contents: read`
- Builds `android/app/build/outputs/apk/debug/app-debug.apk`
- Artifact: `phanthuanxtra-apk-debug`

### APK 1.1.0 / versionCode 2
- `19325b9c41168f05de98dee38734abfa39a65d88`

### Auto Bot
- `d7c5dd004ed39035932be76d5b87b8feefe1d823`
- Message: `fix: make Auto Bot bundle processing single-flight`
- Purpose: prevent concurrent/duplicate bundle processing.

### VIP Bot
- `cb042effbdc06d0bb49d35a314a6dcf58e790e86`
- Message: `fix: make VIP Bot Telegram inputs idempotent`
- This is the current known project head used for the latest APK/production workflow.

---

## 5. LATEST APK CHECKPOINT

Latest Android workflow:
- Run: `34085914792`
- Head SHA: `cb042effbdc06d0bb49d35a314a6dcf58e790e86`
- APK build: **SUCCESS**
- Artifact: `phanthuanxtra-apk-debug`
- Latest known APK SHA-256:
  `36ed5e292bad1c85dd2273ecb5cb47a52c4d17a2c8b10b9d3cf87caf6969a2b9`

Earlier APK artifact SHA-256:
`3cada4ffffae284c8ba25d8033ecdadc748b82bb0cbbb62d5f782b497544dd85`

Next requirement is not merely building APK: it is **real device installation + production connection + real-world testing**.

---

## 6. PRODUCTION WORKFLOW

Workflow file:
`.github/workflows/deploy-cloudflare.yml`

Current design:
1. `workflow_dispatch`, pull request, and push to `main` triggers.
2. `CI / Validate` runs Node 24, `npm ci`, syntax/tests, and Wrangler dry-run.
3. Production deploy job uses GitHub Environment `production`.
4. Environment secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
5. Production sequence:
   - Wrangler dry-run
   - `d1 migrations apply phanthuanxtra-db --remote`
   - Cloudflare Worker deploy

Current credential state: **working**.

---

## 7. D1 MIGRATIONS — DO NOT DELETE/BYPASS

Known migrations:

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

Historical successful production runs indicated the database had previously been up to date. The recent failure was credential-related, not evidence that migrations were wrong.

Current latest rerun proves D1 migrations can execute successfully with the corrected production credentials.

---

## 8. TEST COVERAGE / RECENT FIXES

Recent CI validation has included:

- JavaScript syntax checks/tests
- Wrangler dry-run validation
- Telegram caption Unicode and real vehicle fields
- AI draft identity/confidence gating
- Immediate webhook receipt
- Branding not being used as the identity gate
- Telegram duplicate protection

Recent production behavior fixes:

- Auto Bot bundle processing made **single-flight**.
- VIP Bot Telegram inputs made **idempotent**.

Important follow-up: ensure dedicated regression tests exist for the exact Auto Bot single-flight behavior and VIP Bot idempotency behavior; fixes exist, but earlier inspection did not show explicit new dedicated tests for both.

---

## 9. CURRENT EXECUTION ROADMAP

The previous requested sequence is:

```text
1. App API tối thiểu
        ↓
2. Android APK MVP
        ↓
3. Kết nối production
        ↓
4. Build APK
        ↓
5. Test thực tế
        ↓
6. Hoàn thiện Auto Bot + VIP Bot
```

Current position:

```text
1. App API tối thiểu       → DONE / existing MVP
2. Android APK MVP         → DONE / build successful
3. Production credentials  → DONE
4. Production deploy       → DONE / verified green
5. APK real-device test    → NEXT
6. Auto Bot + VIP Bot      → continue hardening + real tests
```

---

## 10. IMMEDIATE NEXT ACTIONS

Do these in order; do not skip verification:

### A. Verify production after the successful deployment
- Inspect latest GitHub Actions run and confirm both validation and deployment remain green.
- Confirm deployed Worker is the expected production Worker.
- If a production health/API endpoint exists in the repo, test it.

### B. APK real-device validation
- Obtain/download the latest successful `phanthuanxtra-apk-debug` artifact.
- Install on Android/S21 Ultra when user is ready.
- Verify authenticated app API connection against production.
- Test login/authentication, API calls, and failure handling.
- Record exact build/version/hash used.

### C. Auto Bot validation
- Inspect current Auto Bot processing path.
- Verify single-flight behavior under duplicate/concurrent Telegram inputs.
- Verify no duplicate vehicle/post processing.
- Add targeted regression tests if missing.

### D. VIP Bot validation
- Verify Telegram input idempotency.
- Send the same event/input more than once in a controlled test and verify exactly-once effective processing.
- Verify notification/chat/vehicle intelligence paths do not duplicate side effects.
- Add targeted regression tests if missing.

### E. Production smoke test
- After code changes, run CI.
- Run D1 migrations only through the normal migration mechanism.
- Deploy Worker through the production workflow.
- Verify production endpoints after deployment.

---

## 11. CLOUDFLARE CREDENTIAL FACTS

Correct account:
- Account ID: `5f35d608938abe622b694bab3af1319c`
- Account name previously returned: `Phanthuanmodelactor@gmail.com's Account`
- Account type: `standard`

Token verification previously returned:
- status: `active`
- success: `true`
- Cloudflare message: `This API Token is valid and active`

The token was also able to list the target D1 database in the correct account.

Never store the actual token in this file.

Expected Cloudflare permissions for production deployment:
- Account → D1 → Edit
- Account → Workers Scripts → Edit

---

## 12. GITHUB CLI STATE

GitHub CLI was installed on Windows 10:
- `gh version 2.100.0 (2026-09-03)`

The user successfully completed `gh auth login` using the web browser flow.

Useful commands:

```powershell
gh auth status
gh repo view phanthuanxtra-v9/phanthuanxtra-v9
gh secret list --repo phanthuanxtra-v9/phanthuanxtra-v9 --env production
```

Never output or request secret values.

---

## 13. REPOSITORY / PERMISSION FACTS

Repository:
`phanthuanxtra-v9/phanthuanxtra-v9`

Default branch:
`main`

Repository visibility:
`public`

Current GitHub connector permissions previously verified:
- admin: true
- maintain: true
- pull: true
- push: true
- triage: true

Repository setting previously observed:
- `allow_auto_merge: false`
- `allow_merge_commit: true`
- `allow_rebase_merge: true`
- `allow_squash_merge: true`
- `allow_update_branch: false`

These settings are not currently the production blocker.

---

## 14. KNOWN RISKS / DO NOT ASSUME

1. **Green deployment does not equal fully tested product.** Real Android and Telegram tests are still required.
2. **APK build success does not prove production connectivity.** Install and exercise the APK.
3. **D1 migration success does not prove every application query works.** Run smoke tests.
4. **Auto Bot single-flight fix does not automatically prove exactly-once business behavior.** Test duplicates/concurrency.
5. **VIP Bot idempotency fix does not automatically prove every downstream side effect is idempotent.** Test the full path.
6. Do not replace production secrets with guesses.
7. Do not weaken permissions or delete migrations merely to obtain a green workflow.
8. Do not assume the latest APK hash remains current after a new build; record the new hash after every release candidate.

---

## 15. HANDOFF PROTOCOL FOR A NEW AI

When a new AI/session starts:

1. Read this entire file.
2. Inspect `main` and compare the current HEAD with the latest checkpoint above.
3. Inspect latest GitHub Actions runs.
4. If production is green, do **not** waste time re-solving the old Cloudflare credential problem.
5. Determine which item in Section 10 is the next unfinished milestone.
6. Execute the next verifiable task.
7. Update this file with:
   - date/time
   - new commit SHA
   - workflow run ID
   - test result
   - production status
   - next action
8. Commit the updated checkpoint to `main`.
9. Report only verified facts and remaining blockers.

---

## 16. CHECKPOINT HISTORY

### 2026-09-07 — Production credential/deploy recovery
- Cloudflare token verified active.
- Correct Cloudflare account identified.
- GitHub production Account ID secret updated.
- Failed workflow `34085914775` rerun.
- D1 migration passed.
- Cloudflare Worker deployment passed.
- Production pipeline restored to green.
- Next focus: real APK + production integration testing, then Auto Bot/VIP Bot hardening.

---

## 17. ONE-LINE CURRENT STATE

**PHAN THUẦN XTRA production is GREEN and deployed; Cloudflare credential/D1 deployment blocker is RESOLVED; APK build is GREEN; next work is real-device production integration testing followed by Auto Bot single-flight and VIP Bot idempotency end-to-end validation.**
