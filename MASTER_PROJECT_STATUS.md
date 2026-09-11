# PHAN THUẦN XTRA — MASTER PROJECT STATUS

> **DUY NHẤT — CANONICAL PROJECT STATUS / HANDOFF**
> Date: 2026-09-11 (UTC+7)
> Repository: `phanthuanxtra-v9/phanthuanxtra-v9`
> Branch: `main`

## 1. SOURCE OF TRUTH

This is the only project-status / continuity document. Current `main` source, current CI/CD evidence and current production/runtime evidence outrank historical notes. Do not create competing checkpoint/status Markdown files.

## 2. CURRENT ARCHITECTURE

- Main: `7f1347acede603826608dd0d5bdf6762fe425294` (PR #84 merge)
- Production Worker: `phanthuanxtra-v2`
- Entry: `src/entry.js`
- Website: `https://phanthuanxtra.com`
- Admin: `https://phanthuanxtra.com/admin`
- D1: `phanthuanxtra-db`
- R2: `phanthuanxtra-media`
- APK: `com.phanthuanxtra.app`, source version 1.2.0 / versionCode 3

## 3. UNIFIED AI-1 → AI-6 AUDIT RULE

AI-1 through AI-6 are one engineering/audit team using one source of truth, one production architecture and one release-gate chain. No secret guessing, no force-push, no unreviewed destructive production change, and no false GREEN claim.

## 4. CURRENT RELEASE EVIDENCE

### 4.1 PR #84 — MERGED / SOURCE GREEN

PR #84 `fix(admin): fail closed when D1 credential lookup throws` has been merged into `main`.

- Merge commit: `7f1347acede603826608dd0d5bdf6762fe425294`.
- CI checks before merge passed.
- The fix makes D1 credential lookup fail closed instead of allowing an uncaught exception to become HTTP 500.
- Regression coverage includes D1 lookup failure and bootstrap fallback behavior.

### 4.2 Production deployment — NOT YET PROVEN FOR #84

The repository deployment workflow is configured to deploy production only on a verified push to `main`. The workflow at the #84 merge commit confirms this trigger and keeps `workflow_dispatch` validation-only.

No post-merge production deployment run for commit `7f1347acede603826608dd0d5bdf6762fe425294` is currently evidenced in this session. The last known successful production deployment run was `34570211871`, which deployed an earlier commit in the D1 migration-drift remediation lineage.

Therefore **do not claim that #84 is deployed** until a deployment run explicitly proves the Worker was deployed from the #84 merge lineage.

### 4.3 Production smoke — RED / OLD EVIDENCE

Production Smoke run `34573941824` tested main commit `f5ac7d411c199a240cd263dbb0e409e3d113f8f6` and failed at the Admin authentication boundary because invalid credentials returned HTTP 500 instead of the required HTTP 401. Website, health, cars API, admin page and Worker basic smoke checks passed; downstream D1/R2/Gateway stages were skipped.

That smoke run predates PR #84 and therefore cannot validate the #84 fix.

## 5. RELEASE GATES STILL OPEN

1. Confirm post-merge production deployment of commit `7f1347a` or an explicitly equivalent deployed commit.
2. Production invalid Admin login → HTTP 401, never 500.
3. Valid Admin login → HTTP 200 + signed session.
4. Unauthenticated Admin dashboard → HTTP 401.
5. Authenticated Admin dashboard access.
6. Admin D1 create/read/delete E2E.
7. Admin R2 media write/read/delete E2E.
8. Developer Gateway health/auth/unified-AI production gate where configured.
9. Password-reset production E2E.
10. Fresh APK CI artifact/hash tied to current `main` plus S21 Ultra regression.
11. Telegram Auto Bot production E2E.
12. VIP webhook/idempotency production E2E.
13. Backup plus restore/readability evidence.
14. Only after all gates pass: cleanup stale branches/PRs/infrastructure with dependency evidence.

## 6. STALE PR POLICY

Open PRs that are substantially behind or diverged from current `main` must not be merged directly. In particular, stale Admin/AI/site/VIP PRs must first be rebased or reconciled against current `main`, revalidated by CI, and then reviewed for functional value.

## 7. SAFETY / CONTINUITY

- Never put secrets in chat, Markdown, GitHub issues, source or logs.
- Never force-push.
- Never delete a Worker, repo, branch, route or database without current dependency evidence.
- Never convert skipped tests or missing runtime evidence into GREEN.
- This file is the only canonical continuity document.
