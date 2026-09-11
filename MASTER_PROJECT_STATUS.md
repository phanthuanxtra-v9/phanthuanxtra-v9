# PHAN THUẦN XTRA — MASTER PROJECT STATUS

> **DUY NHẤT — CANONICAL PROJECT STATUS / HANDOFF**  
> Date: 2026-09-11 (UTC+7)  
> Repository: `phanthuanxtra-v9/phanthuanxtra-v9`  
> Branch: `main`

## 1. SOURCE OF TRUTH

This is the only project-status / continuity document. Current `main` source, current CI/CD evidence and current production/runtime evidence outrank historical notes. Do not create competing checkpoint/status Markdown files.

## 2. PROJECT COMPLETION MANDATE

The objective is to complete `phanthuanxtra.com` and the AI PT.XTRA APK as one integrated production system.

AI-1 through AI-6 operate as one engineering/audit team. Evidence is shared through GitHub source, PRs, CI/CD, production runtime checks and this file. No secret guessing, no force-push, no unreviewed destructive production change, and no false GREEN claim.

## 3. UNIFIED RELEASE WORKFLOW

`AI agents → GitHub branch/PR → CI/audit → protected main → Cloudflare deployment → production runtime verification → production E2E → APK/device verification`

Cloudflare AI/AI Gateway/Workflows may be used where configured and useful, but they never replace runtime evidence. Audit must prefer zero-cost repository/CI/runtime evidence over paid API calls when equivalent evidence exists.

## 4. CURRENT ARCHITECTURE

- Main: `7f1347acede603826608dd0d5bdf6762fe425294` (PR #84 merge)
- Production Worker: `phanthuanxtra-v2`
- Entry: `src/entry.js`
- Website: `https://phanthuanxtra.com`
- Admin: `https://phanthuanxtra.com/admin`
- D1: `phanthuanxtra-db`
- R2: `phanthuanxtra-media`
- APK: `com.phanthuanxtra.app`, source version 1.2.0 / versionCode 3

## 5. VERIFIED RELEASE EVIDENCE

### 5.1 Source / Admin security — GREEN

PR #82 canonicalized the direct Admin asset path. PR #84 hardened Admin credential verification so a D1 credential-store exception fails closed instead of escaping as HTTP 500.

- PR #84 merge commit: `7f1347acede603826608dd0d5bdf6762fe425294`
- PR #84 CI checks passed before merge.
- D1 lookup failure returns authentication failure; it does not fall back to `ADMIN_PASSWORD` during a D1 outage.
- Regression coverage includes D1 lookup failure and bootstrap fallback behavior.

### 5.2 Production deployment — NOT YET PROVEN FOR PR #84

The last independently recorded successful production deployment was workflow `34570211871`, which deployed an earlier commit in the D1 migration-drift remediation lineage.

No post-merge deployment run for `7f1347a` has yet been evidenced in this audit session. Therefore the PR #84 code must not be considered production-deployed until a deployment run explicitly proves it.

### 5.3 Production smoke — RED / PRE-FIX EVIDENCE

Production Smoke run `34573941824` injected the GitHub Actions `ADMIN_PASSWORD` secret and passed basic website, `/api/health`, `/api/cars`, `/admin.html` and Worker checks. It then failed because invalid Admin credentials returned HTTP 500 instead of required HTTP 401. Downstream D1/R2/Gateway E2E stages were skipped.

This smoke run predates PR #84 and therefore cannot validate the fix.

### 5.4 Cloudflare runtime evidence — PARTIAL

GitHub Actions provides evidence for Wrangler authentication and repository-controlled deployment steps. This ChatGPT session does not have a privileged Cloudflare management connector for independent secret/route/binding enumeration. Do not guess or mutate Cloudflare secrets, routes or bindings without evidence.

### 5.5 Admin runtime — OPEN

Fresh post-PR #84 production evidence is required for `/admin`, `/admin/` and `/admin.html`, including correct UTF-8 content, canonical asset behavior and cache headers.

### 5.6 Password reset — SOURCE GREEN / PRODUCTION OPEN

Admin recovery uses PBKDF2-SHA-256 with 120,000 iterations and a random 16-byte salt. Plaintext passwords are not stored. Migration `0013_admin_credentials.sql` creates the credential table. Production recovery E2E remains unproven.

## 6. PRODUCTION RELEASE GATES — OPEN

1. Post-merge production deployment of `7f1347a` or an explicitly equivalent deployed commit.
2. Invalid Admin login → HTTP 401, never 500.
3. Valid Admin login → HTTP 200 + signed session.
4. Unauthenticated Admin dashboard → HTTP 401.
5. Authenticated Admin dashboard access.
6. Admin D1 create/read/delete E2E.
7. Admin R2 media write/read/delete E2E.
8. Developer Gateway health/auth/unified-AI production gate where configured.
9. Password-reset production E2E.
10. Fresh APK CI artifact/hash tied to current main plus S21 Ultra regression.
11. Telegram Auto Bot production E2E.
12. VIP webhook/idempotency production E2E.
13. Backup plus restore/readability evidence.
14. Only after all gates pass: stale PR/branch/infrastructure cleanup with dependency evidence.

## 7. STALE PR POLICY

Stale or highly diverged PRs must not be merged directly. Useful work must first be reconciled against current `main`, revalidated by CI, and reviewed for compatibility, security, maintainability and production value.

## 8. EXECUTION PRIORITIES

1. Prove deployment of PR #84 to production.
2. Run fresh production smoke and close Admin 401/login/session/D1/R2 gates.
3. Close password-reset production E2E.
4. Audit Gateway and AI production paths.
5. Audit and validate APK artifact plus real-device regression.
6. Validate Telegram Auto Bot and VIP webhook/idempotency in production.
7. Execute backup/restore/readability verification.
8. Reconcile valuable stale PRs only after the production baseline is stable.
9. Cleanup duplicate branches/workers/infrastructure only with current dependency evidence.
10. Declare **PRODUCTION GREEN / COMPLETE** only when every required gate has current evidence.

## 9. SAFETY / CONTINUITY

- Never put secrets in chat, Markdown, GitHub issues, source or logs.
- Never force-push.
- Never delete a Worker, repo, branch, route or database without current dependency evidence.
- Never convert skipped tests or missing runtime evidence into GREEN.
- This file is the only canonical continuity document.
