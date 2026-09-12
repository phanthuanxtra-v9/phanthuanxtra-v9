# PHAN THUẦN XTRA — MASTER PROJECT STATUS

> **DUY NHẤT — CANONICAL PROJECT STATUS / HANDOFF**  
> Date: 2026-09-12 (UTC+7)  
> Repository: `phanthuanxtra-v9/phanthuanxtra-v9`  
> Main source: `9783abb9ca783c18ec674edf15ca9e98cdde0aa2`  
> Production deployment remains separately tracked below and is not implied by the current main source SHA.

## 1. SOURCE OF TRUTH
Current `main` source, CI/CD evidence, production/runtime evidence and this file are authoritative. Do not create competing checkpoint/status Markdown files.

## 2. PROJECT COMPLETION MANDATE
Complete `phanthuanxtra.com` and the AI PT.XTRA APK as one integrated production system. AI agents operate as one engineering/audit team. No secret guessing, force-push, unreviewed destructive production change, or false GREEN claim.

## 3. UNIFIED RELEASE WORKFLOW
`AI agents → GitHub branch/PR → CI/audit → protected main → Cloudflare deployment → production runtime verification → production E2E → APK/device verification`

## 4. CURRENT ARCHITECTURE
- Main source: `9783abb9ca783c18ec674edf15ca9e98cdde0aa2`
- Production Worker: `phanthuanxtra-v2`
- Entry: `src/entry.js`
- Website: `https://phanthuanxtra.com`
- Admin: `https://phanthuanxtra.com/admin`
- D1: `phanthuanxtra-db`
- R2: `phanthuanxtra-media`
- Workers AI: website `/api/ai-chat` and Developer Gateway `/v1/ai/unified`
- APK: `com.phanthuanxtra.app`, source version 1.2.0 / versionCode 3

## 5. VERIFIED RELEASE EVIDENCE
### 5.1 Production API baseline — VERIFIED GREEN
Fresh production smoke run `34659917286` verified:
- Website HTTP 200
- `/api/health` HTTP 200
- `/api/cars` HTTP 200
- `/admin.html` HTTP 200
- Production Worker HTTP 200
- Invalid Admin login boundary HTTP 401
- Unauthenticated Admin dashboard boundary HTTP 401

### 5.2 Developer Gateway authentication — VERIFIED GREEN
Fresh smoke evidence verified:
- Gateway `/health` HTTP 200
- Gateway unauthenticated boundary HTTP 401
- Authenticated `/v1/ai/unified` succeeded

### 5.3 Workers AI model — VERIFIED GREEN
Fresh authenticated Gateway evidence returned:
- `ok: true`
- `logical_agent: xtra-unified-ai`
- `engine: cloudflare-workers-ai`
- active model: `@cf/meta/llama-3.1-8b-instruct-fast`
- `production_mutation: false`

Website AI path is configured for the faster `@cf/zai-org/glm-4.7-flash` primary model with `@cf/meta/llama-3.2-3b-instruct` fallback, bounded history/output and a short in-memory response cache. Audit found no evidence that further acceleration is worth weakening current safety/grounding gates.

### 5.4 Current production deployment — VERIFIED
Current reported production evidence:
- Deployment SHA: `b593b713b871b241303201e5c88276ca8718c384`
- Cloudflare Version: `c728d389-2373-4785-a2fa-19183dbc2a89`
- Wrangler: `4.121.0`
- Production deployment: proven

### 5.5 Admin + D1/R2 production E2E — RED / CURRENT BLOCKER
Current valid Admin login is **not proven**. D1 E2E and R2 E2E have not run. Production remains RED until valid Admin authentication and the downstream E2E gates are freshly proven.

### 5.6 Admin recovery deployment gate — IMPLEMENTED
- Canonical production asset gate is present in `production-asset-gate.yml`.
- It verifies `/admin.html`, `/admin-recovery.html`, and `/api/health` from production.
- PR #97 (`test: add production asset delivery gate`) is **MERGED** as `d2f0538b7e8ca4bfc552c7ecca30968d80e316dc`.
- This gate is evidence-producing infrastructure; it does not itself prove a passing runtime result.
- No secret values were exposed or committed.

### 5.7 Production GREEN — NOT REACHED
Production remains **RED**. Current deployment is proven, but valid Admin login, authenticated dashboard access, D1 E2E, R2 E2E, password-reset E2E and the remaining release gates are not complete.

## 6. SINGLE EXECUTION QUEUE / OWNERSHIP
### QUEUE-01 — Admin production E2E
**Status:** OPEN / READY TO DISPATCH / highest priority. Execute only this queue: verify current production asset delivery, resolve the valid Admin credential-store mismatch without exposing or guessing secrets, then rerun valid Admin + D1 + R2 E2E.

### QUEUE-02 — Gateway/AI production E2E
**Status:** BASELINE VERIFIED; do not broaden Gateway work until QUEUE-01 release baseline is green.

### QUEUE-03 — PR #66 VIP hardening
**Status:** OPEN; reconcile against current main before merge.

### QUEUE-04 — APK production readiness
**Status:** OPEN; fresh artifact/hash + S21 Ultra regression.

### QUEUE-05 — Telegram/VIP production E2E
**Status:** OPEN; execute after API/Gateway baseline.

### QUEUE-06 — Backup/restore
**Status:** OPEN.

### QUEUE-07 — Final cleanup + GREEN gate
**Status:** OPEN / last.

### 6.1 — DUAL WORKERS AI REASONING MODEL — ESTABLISHED
This is now the canonical future AI operating model for XTRA and is to be used immediately for reasoning/audit work while remaining isolated from production mutation until its safety gates pass.

**Single queue rule:** QUEUE-01 remains the only execution queue. Deep and Wide reasoning may be logically independent, but they must never perform conflicting repository or production mutations in parallel.

**DEEP AI — root-cause / verification role**
- Preferred Workers AI model: `@cf/nvidia/nemotron-3-120b-a12b`
- Responsibilities: root-cause analysis, security review, architecture consistency, hidden failure modes, evidence validation, adversarial checking.

**WIDE AI — broad-scan / alternatives role**
- Preferred Workers AI model: `@cf/zai-org/glm-4.7-flash`
- Responsibilities: broad dependency scan, regression risks, alternative explanations, overlooked edge cases, implementation options and cross-component impact.

**Fallback**
- `@cf/google/gemma-4-26b-a4b-it` may be used as a fallback/recovery reasoning model when appropriate.

**Daily Free quota guard**
- Target ceiling: 10,000 Workers AI Neurons/day total across the XTRA reasoning layer.
- Do not assume 10,000 Neurons per model; the budget is shared.
- Reserve a portion of the daily budget for retries, fallback and production diagnosis.
- No quota exhaustion may be allowed to interfere with Admin/D1/R2 release verification.

**Arbitration protocol**
`Task → Deep analysis + Wide scan → evidence comparison → conflict resolution → one execution plan → test → verify → status update`

The two roles are reasoning peers, not two independent deployers. No AI reasoning result is itself production evidence.

**Production safety gate**
The dual-AI layer must first be designed and tested so that it cannot weaken, bypass, rate-limit, mutate or otherwise interfere with the Admin authentication, D1 CRUD or R2 write/read/delete E2E gates. Only after isolated validation is complete may the AI layer be promoted into production execution paths.

**Neutron / Work AI transparency**
The project records the desired 10,000-Neuron/day Workers AI budget and two-role model here. The current engineering tool environment does not expose a control that can provision two ChatGPT Work AI instances or allocate a Neutron budget directly; therefore no false claim of resource provisioning is made. The XTRA implementation target is the Cloudflare Workers AI two-role architecture above.

## 7. RELEASE GATES
1. Current main deployed to production. **VERIFIED for the previously proven deployment; current main source is tracked separately above.**
2. Invalid Admin login → HTTP 401, never 500. **VERIFIED in latest baseline**.
3. Valid Admin login → HTTP 200 + signed session. **CURRENTLY RED / NOT PROVEN**.
4. Unauthenticated dashboard → HTTP 401. **VERIFIED in latest baseline**.
5. Authenticated dashboard access. **NOT PROVEN**.
6. D1 create/read/delete E2E. **NOT RUN**.
7. R2 write/read/delete E2E. **NOT RUN**.
8. Password reset production E2E. **NOT COMPLETE**.
9. Gateway/AI production gate. **VERIFIED**.
10. Dual Workers AI layer isolated validation against Admin/D1/R2 non-interference. **NOT RUN / BLOCKED FROM PRODUCTION PROMOTION**.
11. Fresh APK artifact/hash + S21 Ultra regression. **OPEN**.
12. Telegram Auto Bot production E2E. **OPEN**.
13. VIP webhook/idempotency production E2E. **OPEN**.
14. Backup + restore/readability evidence. **OPEN**.
15. Final security/UX/maintainability/testability audit. **OPEN**.
16. Only then declare **PRODUCTION GREEN / COMPLETE**.

## 8. CHANGE LOG — CANONICAL
### 2026-09-12 — S21 Ultra / Termux Wrangler limitation recorded
- Read `MASTER_PROJECT_STATUS.md` before status update.
- Recorded the operational limitation: on the Samsung S21 Ultra via Termux, Wrangler is practically unusable for the project's Cloudflare deployment/verification workflow.
- Cloudflare Wrangler deployment and credential verification should therefore be treated as CI/GitHub Actions operations rather than depending on local Wrangler execution on the S21 Ultra.
- This note does not change the single-queue rule, production gates, or GREEN criteria.
- This change updates only `MASTER_PROJECT_STATUS.md`; no competing checkpoint Markdown was created.

### 2026-09-12 — Dual Workers AI reasoning baseline established
- Read `MASTER_PROJECT_STATUS.md` before work.
- Established the XTRA dual-role reasoning model: Deep AI + Wide AI, with one execution queue only.
- Preferred Deep model: `@cf/nvidia/nemotron-3-120b-a12b`.
- Preferred Wide model: `@cf/zai-org/glm-4.7-flash`.
- Recorded Gemma 4 26B as fallback.
- Recorded the shared 10,000-Neuron/day Free budget target with an explicit reserve; no claim that two ChatGPT Work AI instances or Neutron resources were provisioned.
- Added the production safety gate: the AI layer must prove non-interference with Admin authentication, D1 CRUD and R2 E2E before production promotion.
- This change updates only `MASTER_PROJECT_STATUS.md`; no competing checkpoint Markdown was created.
- QUEUE-01 remains the sole active execution queue.

### 2026-09-12 — Production deployment evidence synchronized
- Read `MASTER_PROJECT_STATUS.md` before status work.
- Synchronized canonical `main` source to `9783abb9ca783c18ec674edf15ca9e98cdde0aa2` after merged PR #117; production deployment evidence remains separately tracked at `b593b713b871b241303201e5c88276ca8718c384` until a new deployment is proven.
- Recorded current proven Cloudflare Version `c728d389-2373-4785-a2fa-19183dbc2a89` and Wrangler `4.121.0`.
- Confirmed production deployment is proven, while valid Admin login, D1 E2E and R2 E2E remain unproven.
- Kept Production GREEN **RED**; no skipped or missing evidence was converted to GREEN.
- Confirmed QUEUE-01 remains the single active recovery queue.

### 2026-09-12 — Production-facing audit / asset delivery hardening
- Read `MASTER_PROJECT_STATUS.md` before audit work.
- Audited canonical Worker entry/static asset flow, Admin recovery path, Admin auth, App API, CMS API, media path, Workers AI path, production smoke workflow and Cloudflare deploy workflow.
- Confirmed `public/admin-recovery.html` exists in canonical main while production previously returned 404 for that asset.
- Confirmed migration `0010_admin_recovery_rotation.sql` is recorded in production D1 runtime evidence.
- Added PR #97 `test: add production asset delivery gate`, checking production `/admin.html`, `/admin-recovery.html` and `/api/health` so asset/source drift becomes a failing production gate instead of silent runtime drift.
- PR #97 is **MERGED** as `d2f0538b7e8ca4bfc552c7ecca30968d80e316dc`.
- No secret values were exposed or committed.

### 2026-09-12 — Gateway credential + Workers AI production repair
- Read `MASTER_PROJECT_STATUS.md` before the repair workflow.
- Fixed production Gateway credential-source alignment via PR #91.
- Production Gateway deployment synchronizes the `GATEWAY_READ_TOKEN` secret before deploy.
- Fixed deprecated Workers AI model via PR #93: `@cf/meta/llama-3.1-8b-instruct` → `@cf/meta/llama-3.1-8b-instruct-fast`.
- Fresh authenticated Gateway smoke passed with the active model.
- Fresh Admin/D1 gate remained RED because valid Admin login returned HTTP 401.
- No secret value was exposed or committed.

### 2026-09-12 — Production API + Workers AI audit / PR #90
- Read `MASTER_PROJECT_STATUS.md` before changes.
- PR #90 hardened the production R2 DELETE contract and serialized AI Unified Executor work through the canonical status file/queue rules.

## 9. SAFETY / CONTINUITY
- Never put secrets in chat, Markdown, GitHub issues, source or logs.
- Never force-push.
- Never delete production infrastructure without current dependency evidence.
- Never convert skipped tests or missing runtime evidence into GREEN.
- One team, one queue, one canonical status file: `MASTER_PROJECT_STATUS.md`.
- The obsolete repository `phanthuanxtra-v9/phanthuanxtra` is excluded from all audit/deploy/repair/CI/E2E workflows.

## 10. NEXT CHECKPOINT
**Current task:** QUEUE-01 / Admin production E2E.  
**Immediate operating mode:** use the Deep + Wide reasoning protocol for analysis, but keep execution serialized through QUEUE-01.  
**Next exact action:** obtain fresh valid Admin authentication evidence; only after valid Admin succeeds, run D1 create/read/delete and R2 write/read/delete E2E in the same queue. In parallel conceptually, audit the future dual-AI layer for non-interference, but do not promote it into production until its isolation gate passes. Production remains RED until the complete release-gate chain passes.
