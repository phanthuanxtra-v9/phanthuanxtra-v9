# PHAN THUẦN XTRA — MASTER PROJECT STATUS

> Canonical consolidated status after Cloudflare + GitHub + Markdown reconciliation.
> Date: 2026-09-11 (UTC+7)
> Audit branch: `docs/master-project-status-2026-09-11`
> Source baseline: current `main` at `6b91b28ac4eb8365fd3ad1fddbf106238abc4251`.

## 1. SOURCE-OF-TRUTH RULE

Priority when records conflict:

1. Current `main` source/configuration.
2. Current GitHub Actions workflow evidence.
3. Current open/merged PR state.
4. Current production/runtime evidence.
5. Canonical coordination documents (`AI-WORK-REGISTRY.md`, `AI_AGENT_PROTOCOL.md`, `AI-HANDOFF-CHECKPOINT.md`).
6. Historical Markdown checkpoints only as evidence/history; never execute an old `NEXT ACTION` automatically.

This rule is necessary because several Markdown checkpoints contain deliberately historical states that are now contradicted by newer source or newer checkpoints.

## 2. CURRENT REPOSITORY

- Repository: `phanthuanxtra-v9/phanthuanxtra-v9`
- Branch: `main`
- Current audited commit: `6b91b28ac4eb8365fd3ad1fddbf106238abc4251`
- Latest commit message: `docs: update APK project progress checkpoint`
- Production Worker: `phanthuanxtra-v2`
- Worker entry: `src/entry.js`
- Website: `https://phanthuanxtra.com`

## 3. CLOUDFLARE ARCHITECTURE — VERIFIED IN REPOSITORY

`wrangler.json` is present on current `main`; older documentation claiming the Wrangler configuration is absent is stale.

Configured single-instance resources:

- Worker: `phanthuanxtra-v2`
- D1: `phanthuanxtra-db`
- R2: `phanthuanxtra-media`
- Workers AI binding: `AI`
- Images binding: `IMAGES`
- AI Search binding: `AI_SEARCH`
- Assets binding: `ASSETS`
- Cron: `*/5 * * * *`
- Entry: `src/entry.js`

No duplicate Worker/D1/R2/AI/cron should be created to solve an evidence problem.

## 4. GITHUB / CI-CD BOUNDARY

GitHub Actions remains the deployment gate. The intended sequence is validation → dry-run → migration when needed → production deploy.

Current Android workflow also performs a production App API health check before building the APK.

The repository explicitly forbids treating a successful PR validation as proof that production was mutated.

## 5. ADMIN / PRODUCTION STATUS

PR #70 is confirmed merged with merge commit:
`92adf1495459e28b918d77c61700a1de7c2a7113`.

PR #70 connected `/api/admin/cars` vehicle CRUD to the existing shared CMS/PT Xtra AI pipeline instead of creating a second vehicle/AI implementation.

However, production Admin is NOT GREEN until reachable external runtime evidence confirms `/admin`, `/admin.html`, `/api/admin/dashboard` and the relevant authenticated CRUD/upload paths.

Historical and current checkpoints record a production `/admin` HTTP 403 and an environment limitation preventing direct DNS/HTTP verification from the current execution environment. Do not convert CI deployment success into Admin runtime acceptance.

## 6. APK — CURRENT SOURCE VS DOCUMENTED MILESTONE

Current source is:

- Application ID: `com.phanthuanxtra.app`
- Version: `1.2.0`
- versionCode: `3`
- minSdk: `26`
- targetSdk: `35`
- Production App API: `https://phanthuanxtra.com/api/app/v1`

The latest explicitly documented artifact evidence in the canonical handoff is still APK `1.1.0`, versionCode `2`, workflow run `34090103902`, artifact digest `sha256:60193bf938a38800e0d5d16be5e51e9be72291cd602cafcd88986220535ca76a`, with user-confirmed S21 Ultra production testing.

Therefore the correct status is:

**APK 1.2.0 source: PRESENT. APK 1.2.0 independent CI artifact + hash + fresh device regression: NOT YET PROVEN by the current audit.**

Do not claim 1.2.0 release readiness until a fresh build is independently observed and the device gate is repeated/explicitly tied to that build where material changes require it.

### APK remaining product hardening

- Vehicle detail/edit.
- Create/update/delete workflow.
- available/reserved/sold status.
- Explicit destructive confirmation.
- Featured toggle.
- Gallery/cover management.
- Lead status/note editing.
- Search/filter.
- Retry/offline/error UX.
- Token validation and clear auth failures.
- Production-safe validation before destructive operations.

## 7. BACKUP — NOT GREEN

The backup workflow exists and has integrity-hardening code, but the project must not call backup operational until a real successful backup plus restore/readability test is verified.

The canonical registry currently classifies backup as implemented but not operationally proven; older Master Context text still says the backup bot is planned/not implemented. Source/workflow evidence must decide the implementation question, while the acceptance rule remains the same: real backup + restore/readability.

Do not create a second backup workflow or repurpose the existing `*/5` Telegram self-healing cron.

## 8. TELEGRAM / AI

Verified architectural rules:

- Auto webhook: `/api/telegram/webhook`
- VIP webhook: `/api/telegram/vip-webhook`
- Stale `/api/telegram/auto-webhook` must not be recreated.
- Auto publish requires real vehicle identity (`brand` + `model`) and confidence threshold `>= 0.85`.
- Duplicate protection uses deterministic processing / `telegram_posts` gate.
- Unknown AI questions must go to human handoff rather than fabricated model answers.
- PT Xtra media branding is a display/publish artifact; original R2 source media remains unchanged.

## 9. ACTIVE OPEN PR WORKSTREAMS

Current GitHub open PR inventory includes:

- #53 — Admin CMS hardening.
- #54 — PT Xtra plate branding + AI sales copy.
- #55 — dedicated vehicle/ecosystem pages.
- #66 — VIP document ingestion hardening on current main.
- #49 — production runtime health gate.
- #62 — documentation synchronization; must be reconciled against newer canonical state before use.
- #47 — historical checkpoint; do not merge blindly.
- #37 — superseded VIP implementation; do not merge directly when #66 is the current path.
- #1 — older mobile UI performance work; inspect current main before adopting anything.

Rule: one logical task → one owner/path → one release gate. Do not fork duplicate implementations.

## 10. CRITICAL AUDIT FINDINGS

### P0 — Production acceptance evidence gap
CI/deployment evidence and runtime acceptance are different things. Admin runtime remains unverified from the current environment; this blocks a full GREEN declaration.

### P0 — Backup recovery acceptance gap
Backup is not operational until restore/readability is demonstrated.

### P1 — APK 1.2.0 release evidence gap
Source says 1.2.0/versionCode 3, while the latest explicitly recorded artifact is 1.1.0/versionCode 2. Fresh CI artifact/device evidence is required.

### P1 — Documentation drift
Multiple historical Markdown files describe older PRs, routes, credential states, APK versions, and backup status. They must not be treated as executable task queues. This file is intended to consolidate the reconciled state.

### P1 — Credential/deployment evidence must be time-bounded
A historical Cloudflare credential failure must not be treated as current if a later successful production deployment exists. Conversely, a historical successful deployment must not be treated as proof that the current source is deployed.

### P1 — APK operator credential architecture
The Android operator path includes secure local credential storage for sensitive provider credentials. This is better than plaintext storage but remains a security architecture surface: production APK distribution should minimize privileged Cloudflare/GitHub credentials and prefer narrow server-side capabilities where possible.

## 11. REQUIRED RELEASE GATES

A production release is GREEN only when all applicable gates are true:

1. Current source is identified by commit SHA.
2. Relevant CI validation passes on that source.
3. Cloudflare dry-run/config validation passes.
4. D1 migration safety is verified when migrations change.
5. Production deployment is directly evidenced.
6. Reachable production runtime smoke/E2E passes.
7. APK builds from the intended source and artifact hash is recorded.
8. Real-device APK testing is tied to the intended release where required.
9. Backup has a real successful run and restore/readability evidence.

## 12. NEXT EXECUTION ORDER

1. Verify newest production GitHub Actions result for current `main` and current production Worker version.
2. Obtain reachable external Admin runtime smoke/E2E; investigate edge/custom-domain/Access/WAF if 403 persists.
3. Obtain fresh APK 1.2.0 CI artifact/hash and repeat the material S21 gate.
4. Finish/review existing PR #53/#54/#55/#66/#49 rather than creating competing implementations.
5. Verify real backup + restore/readability and only then mark backup operational.
6. Complete Auto Bot E2E, vehicle lookup E2E and VIP idempotency E2E where not already independently proven.
7. Reconcile and reduce stale Markdown/checkpoint duplication after the above evidence is consolidated.

## 13. AUDIT PRINCIPLE

**No document can promote an unverified state to GREEN.**

Source + CI + runtime evidence outrank historical Markdown claims. This document is the consolidation target; once merged, future checkpoints should update this file instead of creating another competing project-status document.
