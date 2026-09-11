# PHAN THUẦN XTRA — MASTER PROJECT STATUS

> **DUY NHẤT — CANONICAL PROJECT STATUS / HANDOFF**
> Date: 2026-09-11 (UTC+7)
> Repository: `phanthuanxtra-v9/phanthuanxtra-v9`
> Branch: `main`

## 1. SOURCE OF TRUTH

This is the only project-status / continuity document. Current `main` source, current CI/CD evidence and current production/runtime evidence outrank historical notes. Do not create competing checkpoint/status Markdown files.

## 2. CURRENT ARCHITECTURE

- Main: `5fa34d0511e710794c2072d3de7d8d2d238dc9f0` (PR #82 merge)
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
- Head before merge: `c85020cf0af52d29000815b6c9b1ef1029972df5`
- `public/admin` SHA is now exactly the same as canonical `public/admin.html`: `d1331862b0c5e74f2c22da70849b53c73c2f25f2`.
- `src/entry.js` explicitly canonicalizes `/admin` and `/admin/` to `/admin.html`, sets UTF-8 content type and `no-store`.

Conclusion: source remediation matches the observed `/admin` legacy-asset incident.

### 4.2 CI/CD — GREEN for deployment, RED for production smoke

Deploy workflow run `34571728581` / run #348:
- CI / Validate: SUCCESS.
- Cloudflare production deploy job: SUCCESS.
- Main commit deployed by the workflow: `5fa34d0511e710794c2072d3de7d8d2d238dc9f0`.

Production Smoke run `34571728614` / run #15:
- FAILED.
- Website and production Worker basic smoke: SUCCESS.
- Failure occurred at `Smoke admin authentication boundary`.
- All later smoke/E2E steps were skipped because of this failure.

Therefore deployment is proven, but the production release gate is NOT GREEN.

### 4.3 Cloudflare production — DEPLOYMENT PROVEN / PRIVILEGED CONFIGURATION NOT FULLY PROVEN

GitHub Actions proves Wrangler authentication, dry-run and production deployment completed successfully. Repository configuration identifies Worker `phanthuanxtra-v2`, D1 `phanthuanxtra-db`, R2 `phanthuanxtra-media`, AI/AI_SEARCH/IMAGES/ASSETS bindings and the expected cron.

This ChatGPT session has GitHub access but no privileged Cloudflare management connector. Therefore Worker secrets/routes/version configuration must not be guessed or mutated from ChatGPT.

Known security blocker from prior authorized inspection remains material: Admin requires both `ADMIN_PASSWORD` and `ADMIN_TOKEN`. The previously inspected production secret inventory contained `ADMIN_PASSWORD` but did not contain `ADMIN_TOKEN`. This is consistent with the production smoke failure at the Admin authentication boundary. Fresh Cloudflare secret inventory is required before declaring the blocker resolved.

### 4.4 Runtime `/admin` — NOT YET REPROVEN AFTER DEPLOY

The previous runtime evidence established:
- `/admin` was serving the legacy 1277-byte `public/admin` asset.
- `/admin/` and `/admin.html` served the canonical 6341-byte Admin UI.
- The previous `/admin` response had public cache semantics; `/admin/` had `no-store`.
- The bytes were valid UTF-8; the apparent mojibake was not the root cause.

PR #82 fixes the source asset divergence and was deployed. However, fresh post-deploy HTTP evidence for all three URLs is still required. This environment cannot directly resolve the production hostname, so no post-deploy runtime GREEN claim is made without evidence.

### 4.5 Security E2E — BLOCKED / NOT PROVEN

Source review confirms:
- `src/admin-auth.js` issues and verifies HMAC-SHA-256 signed Admin session tokens with a 60-minute TTL.
- malformed/random/tampered/expired tokens are rejected.
- `src/app-admin.js` requires both `ADMIN_PASSWORD` and `ADMIN_TOKEN` for login.
- protected Admin routes require a valid signed session.
- Admin D1 CRUD and R2 media E2E exist in `production-smoke.yml`.

Production smoke did not reach authenticated D1/R2 E2E because the Admin authentication boundary failed first.

### 4.6 Password reset — SOURCE GREEN / PRODUCTION BLOCKED

`public/admin.html` and `public/admin` both contain `Quên mật khẩu?` and the recovery form.

`src/admin-password.js` uses PBKDF2-SHA-256 with 120,000 iterations and a random 16-byte salt; plaintext passwords are not stored.

`migrations/0013_admin_credentials.sql` creates the D1 credential table.

`POST /api/admin/forgot-password` requires the server-side `ADMIN_TOKEN`, validates the recovery code and stores only the password hash/salt.

Production reset E2E is NOT proven because the required recovery secret is not yet independently confirmed in the live Worker.

### 4.7 Regression — PARTIALLY PROVEN / GATES REMAIN

CI test suite includes Telegram, AI chat, PT Xtra media/plate, production-gates and VIP vehicle intelligence tests. Production smoke also contains Gateway, Admin D1 and R2 E2E gates, but these were skipped after the Admin boundary failure.

Still unproven by this audit:
- Telegram Auto Bot production E2E.
- VIP webhook/idempotency production E2E.
- Developer Gateway production smoke completion for this release.
- Fresh APK 1.2.0 artifact/hash tied to a current CI run plus material S21 device regression.
- Real backup plus restore/readability test.

Do not mark these GREEN from source presence alone.

## 5. CURRENT BLOCKERS

1. **ADMIN_TOKEN live configuration is not independently proven.** Do not guess or expose it.
2. **Production Smoke #15 failed at Admin authentication boundary.**
3. **Post-deploy `/admin`, `/admin/`, `/admin.html` runtime evidence is still required.**
4. **Authenticated Admin D1/R2 E2E did not execute in the failed smoke run.**
5. **Password-reset E2E is not proven.**
6. **APK, Telegram/VIP production E2E and backup/restore gates remain open.**

## 6. IMMEDIATE EXECUTION ORDER

1. Obtain fresh authorized Cloudflare secret/config evidence for `ADMIN_TOKEN` without exposing the value.
2. If missing, configure it through the authorized Cloudflare secret-management path; do not store it in GitHub files, Markdown, issues or chat.
3. Re-run Production Smoke and require the Admin boundary, D1 CRUD and R2 CRUD gates to pass.
4. Recheck `/admin`, `/admin/`, `/admin.html` from a network with production DNS access and record status/content-type/cache behavior.
5. Run password-reset E2E using the live recovery path without revealing the recovery code.
6. Complete Telegram/VIP production E2E, APK artifact/device gate and backup restore/readability gate.
7. Only then perform duplicate infrastructure/branch/Worker cleanup.

## 7. SAFETY / CONTINUITY

- Never put secrets in chat, Markdown, GitHub issues, source or logs.
- Never force-push.
- Never delete a Worker, repo, branch, route or database without current dependency evidence.
- Never convert skipped tests or missing runtime evidence into GREEN.
- This file is the only canonical continuity document.
