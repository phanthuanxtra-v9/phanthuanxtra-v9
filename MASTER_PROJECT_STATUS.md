# PHAN THUẦN XTRA — MASTER PROJECT STATUS

> **DUY NHẤT — CANONICAL PROJECT STATUS / HANDOFF**
> Date: 2026-09-11 (UTC+7)
> Repository: `phanthuanxtra-v9/phanthuanxtra-v9`
> Branch: `main`

## 1. SOURCE OF TRUTH

This is the only project-status / continuity document. Current `main` source, current CI/CD evidence and current production/runtime evidence outrank historical notes. Do not create competing checkpoint/status Markdown files.

## 2. CURRENT ARCHITECTURE

- Main: `f5ac7d411c199a240cd263dbb0e409e3d113f8f6` (PR #83 merge)
- Production Worker: `phanthuanxtra-v2`
- Entry: `src/entry.js`
- Website: `https://phanthuanxtra.com`
- Admin: `https://phanthuanxtra.com/admin`
- D1: `phanthuanxtra-db`
- R2: `phanthuanxtra-media`
- APK: `com.phanthuanxtra.app`, source version 1.2.0 / versionCode 3

## 3. UNIFIED AI-1 → AI-6 AUDIT RULE

AI-1 through AI-6 are one engineering/audit team using one source of truth, one production architecture and one release-gate chain. No secret guessing, no force-push, no unreviewed destructive production change, and no false GREEN claim.

## 4. AUDIT CHAIN — CURRENT EVIDENCE

### 4.1 GitHub source / commit — GREEN

PR #82 `fix: canonicalize direct Admin asset` was merged successfully.

- Merge commit: `5fa34d0511e710794c2072d3de7d8d2d238dc9f0`
- `public/admin` SHA is exactly the same as canonical `public/admin.html`: `d1331862b0c5e74f2c22da70849b53c73c2f25f2`.
- `src/entry.js` explicitly canonicalizes `/admin` and `/admin/` to `/admin.html`, sets UTF-8 content type and `no-store`.

PR #83 was then merged as the evidence/status continuity update:
- Merge commit: `f5ac7d411c199a240cd263dbb0e409e3d113f8f6`.
- `MASTER_PROJECT_STATUS.md` remains the only canonical continuity document.

### 4.2 CI/CD — DEPLOYMENT GREEN / PRODUCTION SMOKE RED

Deploy workflow run `34570211871` successfully validated and deployed commit `d090744b757095d3e75160ebedaf69cecfea40f5` after the D1 migration-drift remediation. The production Worker deployment job completed successfully.

Production Smoke run `34573941824` was dispatched after the GitHub Actions `ADMIN_PASSWORD` secret was created. The job environment showed `ADMIN_PASSWORD: ***`, proving the GitHub secret is injected. Basic website, `/api/health`, `/api/cars`, `/admin.html`, and Worker smoke checks passed.

The Admin authentication boundary then failed because an invalid password returned **HTTP 500** instead of the required **HTTP 401**. All authenticated D1/R2/Gateway E2E stages were therefore skipped.

### 4.3 Admin login — ROOT CAUSE NARROWED / FIX PR OPEN

Runtime path is confirmed by current `main` source:

`src/entry.js` → `handleAppAdmin()` → `adminLogin()` → `verifyAdminPassword()` → D1 `admin_credentials` query.

`src/admin-password.js` on `main` performs:

`SELECT password_hash,salt FROM admin_credentials WHERE id=1`

outside the existing PBKDF2/base64 `try/catch`. If that D1 query throws because of a runtime database/schema/binding failure, the exception escapes `verifyAdminPassword()` and the Worker-level handler converts it to HTTP 500.

The exact underlying D1 exception text is **not yet independently captured** in this session because privileged Cloudflare runtime logs are unavailable. Therefore the audit does not claim a specific missing table/binding/migration error without evidence.

Remediation PR **#84** is open:
- Branch: `fix/admin-login-d1-fail-closed-v1`
- Current head: `e8c3ab0b515a7ddbeee4faf02858891dc7953ff3`
- Change: D1 credential lookup now fails closed (`false`) instead of throwing.
- Security behavior: when D1 credential storage is unavailable, the code does **not** fall back to `ADMIN_PASSWORD`; fallback remains only when the query succeeds and no persisted credential row exists.
- Regression tests cover D1 lookup failure and the intended bootstrap fallback.
- Admin CI and deploy validation were expanded to execute the Admin password regression suite.

PR #84 has **not been merged** and production has not been mutated by this remediation.

### 4.4 Credential model — SOURCE INCONSISTENCY DOCUMENTED

The Admin implementation intentionally has two credential layers:
- `ADMIN_PASSWORD` is the bootstrap fallback when `admin_credentials` has no row.
- D1 `admin_credentials` becomes the persisted password after recovery.
- `ADMIN_TOKEN` signs the Admin session token and authorizes password recovery.

`app-admin.js` currently requires both `ADMIN_PASSWORD` and `ADMIN_TOKEN` before invoking `verifyAdminPassword()`. This is a separate design inconsistency because `verifyAdminPassword()` already supports a D1 persisted password override. It is not being changed in PR #84 unless later runtime evidence proves it is part of the release blocker.

User has confirmed `ADMIN_TOKEN` was configured in Production and redeployed. This is user-provided configuration evidence; the secret value is neither requested nor exposed. This session has no privileged Cloudflare connector to independently enumerate Worker secrets.

### 4.5 Cloudflare production — DEPLOYMENT PROVEN / PRIVILEGED RUNTIME STATE PARTIALLY PROVEN

GitHub Actions proves Wrangler authentication, dry-run, migration/deploy execution and Worker deployment. Repository configuration identifies Worker `phanthuanxtra-v2`, D1 `phanthuanxtra-db`, R2 `phanthuanxtra-media`, AI/AI_SEARCH/IMAGES/ASSETS bindings and the expected cron.

This ChatGPT session has GitHub access but no privileged Cloudflare management connector. Do not guess or mutate Worker secrets/routes/bindings from ChatGPT.

### 4.6 Runtime `/admin` — NOT YET REPROVEN AFTER LATEST DEPLOY

PR #82 fixes the source asset divergence and was included in the deployed main lineage. Fresh post-deploy evidence for `/admin`, `/admin/`, and `/admin.html` is still required before declaring the Admin UI route GREEN.

### 4.7 Password reset — SOURCE GREEN / PRODUCTION BLOCKED

`public/admin.html` and `public/admin` contain the recovery UI. `src/admin-password.js` uses PBKDF2-SHA-256 with 120,000 iterations and a random 16-byte salt; plaintext passwords are not stored. `migrations/0013_admin_credentials.sql` creates the credential table. Production reset E2E is not proven.

### 4.8 Regression / release gates — OPEN

Still unproven:
- Invalid Admin login → 401 in production after remediation deployment.
- Valid Admin login → signed session and protected dashboard.
- Authenticated Admin D1 CRUD.
- Authenticated Admin R2 media write/read/delete.
- Gateway production smoke completion.
- Telegram Auto Bot production E2E.
- VIP webhook/idempotency production E2E.
- Fresh APK artifact/hash tied to a current CI run plus material S21 device regression.
- Real backup plus restore/readability test.

## 5. CURRENT BLOCKERS

1. **Production Admin invalid-credential boundary returns 500 instead of 401.** PR #84 is the controlled remediation.
2. **The exact underlying D1 runtime exception is not yet captured by privileged Cloudflare logs.** Do not invent its cause beyond the proven uncaught-query boundary.
3. **PR #84 is not merged; production remains RED.**
4. **Authenticated Admin D1/R2 E2E did not execute in the failed smoke run.**
5. **Password-reset E2E is not proven.**
6. **APK, Telegram/VIP production E2E and backup/restore gates remain open.**

## 6. IMMEDIATE EXECUTION ORDER

1. Complete CI/review validation for PR #84.
2. Only after CI is green, obtain merge confirmation before merging PR #84.
3. After merge, let the protected production deployment execute; then rerun Production Smoke.
4. Require Admin invalid-login 401, valid login/session, unauthenticated 401, authenticated dashboard, D1 CRUD and R2 CRUD to pass.
5. Run password-reset E2E using the live recovery path without revealing the recovery code.
6. Complete Telegram/VIP production E2E, APK artifact/device gate and backup restore/readability gate.
7. Only then perform duplicate infrastructure/branch/Worker cleanup.
8. Never declare Production GREEN from source presence or skipped tests alone.

## 7. SAFETY / CONTINUITY

- Never put secrets in chat, Markdown, GitHub issues, source or logs.
- Never force-push.
- Never delete a Worker, repo, branch, route or database without current dependency evidence.
- Never convert skipped tests or missing runtime evidence into GREEN.
- This file is the only canonical continuity document.
