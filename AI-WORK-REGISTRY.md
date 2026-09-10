# PHAN THUẦN XTRA — SHARED AI WORK REGISTRY

> **Purpose:** one operational registry for AI1–AI5 and any other coding agent. This file prevents two agents from implementing the same logical task, reusing stale Markdown instructions, or recreating existing infrastructure.
>
> **Rule:** `main` + open PRs + this registry are the operational coordination source. Historical audit files are evidence only unless explicitly marked ACTIVE below.

## 1. READ ORDER — MANDATORY

Before changing code, infrastructure, workflow, Telegram, AI, Admin, Android or production configuration:

1. `AI-WORK-REGISTRY.md` — active work ownership / collision control.
2. `AI_AGENT_PROTOCOL.md` — engineering, CI/CD, security and completion rules.
3. `AI-HANDOFF-CHECKPOINT.md` — latest cross-AI handoff and verified production evidence.
4. `MASTER_CONTEXT_PHAN_THUAN.md` — product architecture and long-term roadmap.
5. Relevant historical checkpoint(s) listed below only for evidence/background.
6. Inspect current `main`, open PRs and actual source/workflow before acting.

If two documents conflict, prefer current repository/source/CI evidence; do not execute an old document's `NEXT ACTION` automatically.

## 2. CURRENT MAINLINE TRUTH

- Repository: `phanthuanxtra-v9/phanthuanxtra-v9`
- Production Worker: `phanthuanxtra-v2`
- Mainline contains Admin `/admin` route fix merge `fc1617479aefa0e9b98b4afe1624f5b01b338187`.
- Latest coordination commit: `9bace7f2435c1d84494aa75a23e18982ea8e8651`.
- Cloudflare deployment for the Admin route fix was independently verified successful with Version ID `d32431ad-fb43-4ad9-83d5-27876cad7f1b`.
- Public `https://phanthuanxtra.com/admin` still returns HTTP 403 after that deployment. **Production is therefore not GREEN for Admin.**
- Do not repeat the Worker `/admin` route-code fix before checking the Cloudflare edge/custom-domain/Access/WAF/route layer.

## 3. ACTIVE WORKSTREAMS — DO NOT DUPLICATE

| Workstream | Current owner/status | Existing work / PR | Rule for next AI |
|---|---|---|---|
| Admin production 403 | **BLOCKED / NEXT: Release+Production** | merged `fc161747...`; live 403 | Investigate Cloudflare edge/custom-domain/Access/WAF/route. Do not recreate `/admin` Worker fix. |
| Admin CMS hardening | **OPEN** | PR #53 `feat/admin-console-production-hardening` | Review/compare with current `main` before writing Admin UI code. |
| PT Xtra plate branding + AI sales copy | **OPEN** | PR #54 `feat/ai-plate-branding-and-copy` | Treat as existing implementation. Do not build a second branding/copy pipeline on `main` without comparing PR #54. |
| Dedicated website detail/ecosystem pages | **OPEN** | PR #55 `feat/site-detail-pages` | Existing scope covers vehicle detail + 4 ecosystem areas. Do not create duplicate routes/pages. |
| VIP document ingestion | **OPEN / newer** | PR #66 `fix(vip): harden Telegram document ingestion on current main` | PR #66 supersedes the older PR #37 scope. Do not implement a second VIP document-ingestion path. |
| Production runtime health gate | **OPEN / DRAFT** | PR #49 | Existing CI/runtime-health work. Do not create another mandatory production health workflow without comparing PR #49. |
| Docs/Admin continuity | **CLOSED / SUPERSEDED** | PR #62 | Closed as superseded after newer mainline registry/handoff updates. Do not recreate the same docs sync PR. |
| Old VIP document ingestion | **SUPERSEDED** | PR #37 | Use PR #66/current-main reconciliation instead. |
| Old checkpoint documentation | **HISTORICAL** | PR #47 | Do not use its old roadmap/state as current truth. |
| Old UI performance | **OPEN / HISTORICAL SCOPE** | PR #1 | Do not duplicate its changes; inspect whether current main already contains equivalent behavior before touching UI performance. |
| Daily backup | **IMPLEMENTATION EXISTS; OPERATIONALITY UNPROVEN** | `full-system-backup.yml`, `scripts/full-system-backup.mjs`, `AUDIT_SESSION_2026-09-08_1300.md` | Do not create another backup workflow/bot/cron. First verify a real successful backup + restore/readability. |
| Telegram Auto Bot | **EXISTING PIPELINE** | `/api/telegram/webhook`, existing scheduled self-heal | Do not add `/api/telegram/auto-webhook` merely because an old checkpoint says so. Verify current workflow/source first. |
| Telegram VIP Bot | **EXISTING PIPELINE** | `/api/telegram/vip-webhook` | Do not create another VIP webhook/cron. |

## 4. CLOUDFLARE INFRASTRUCTURE — SINGLE INSTANCE RULE

Existing verified configuration includes:

- Worker: `phanthuanxtra-v2`
- D1: `phanthuanxtra-db`
- R2: `phanthuanxtra-media`
- Workers AI binding: `AI`
- Images binding: `IMAGES`
- AI Search binding: `AI_SEARCH`
- Assets: `ASSETS`
- Existing Worker cron: `*/5 * * * *`

Never create a second Worker, D1, R2, AI binding, Images binding, AI Search namespace, or cron to solve an issue unless direct evidence proves the existing resource cannot satisfy the requirement.

## 5. MARKDOWN DOCUMENT CLASSIFICATION

### Authoritative / operational
- `AI-WORK-REGISTRY.md` — collision control and active work ownership.
- `AI_AGENT_PROTOCOL.md` — agent rules, CI/CD, security and completion standard.
- `AI-HANDOFF-CHECKPOINT.md` — current cross-AI handoff and verified production evidence.
- `MASTER_CONTEXT_PHAN_THUAN.md` — product/architecture context; update when milestones materially change.
- `SECURITY.md` — security baseline, but reconcile it with current source before relying on historical starter-package statements.

### Project-state documents requiring reconciliation before use
- `project-docs/PROJECT_STATE.md`
- `project-docs/AI_HANDOFF.md`
- `PHAN_THUAN_XTRA_STATUS.md`
- `ADMIN_AUDIT_CHECKPOINT.md`

These contain useful evidence but currently include older commit/deployment/auth statements. Do not execute their `NEXT`/remaining-task lists as if they were current without comparing `main`.

### Historical audit/evidence — READ ONLY unless updating as part of a deliberate documentation cleanup
- `AUDIT_CHECKPOINT_2026-09-09_0859.md`
- `AUDIT_CHECKPOINT_2026-09-09_ADMIN.md`
- `AUDIT_CHECKPOINT_2026-09-09_API_GATE.md`
- `AUDIT_CHECKPOINT_2026-09-09_GATE.md`
- `AUDIT_CHECKPOINT_2026-09-09_GEV_NXDOMAIN.md`
- `AUDIT_CHECKPOINT_2026-09-09_REPO_CONSOLIDATION.md`
- `AUDIT_HANDOFF_2026-09-08.md`
- `AUDIT_SESSION_2026-09-08_0625.md`
- `AUDIT_SESSION_2026-09-08_1300.md`
- Android audit/design Markdown under `android/`, including `AUDIT_CHECKPOINT_2026-09-09_COMMAND_CENTER.md`, `AUDIT_CHECKPOINT_2026-09-09_SECRET-UI-HARDENING.md`, `AUDIT_CHECKPOINT_2026-09-09_XTRA_UI.md`, and `DESIGN_XTRA.md`.

Historical files are not deleted solely because they are old. Their evidence must be reconciled against current source/CI/production before reuse.

## 6. KNOWN STALE/CONFLICTING CLAIMS FOUND IN MARKDOWN

1. `ADMIN_AUDIT_CHECKPOINT.md` still describes old `ADMIN_TOKEN` authorization and says no Wrangler config exists. Current source has the newer Admin password/login flow and `wrangler.json` exists. This document must not drive new work without reconciliation.
2. `PHAN_THUAN_XTRA_STATUS.md` says latest commit is `7b89d47` and calls Admin migration completed; it is stale relative to current `main` and must not be used as a deployment checkpoint.
3. `MASTER_CONTEXT_PHAN_THUAN.md` is dated 2026-09-08 and contains older roadmap/status sections; it remains product context, not a substitute for current `main`/CI evidence.
4. `project-docs/PROJECT_STATE.md` is dated 2026-09-06 and contains older deployment evidence; treat it as historical until refreshed.
5. `AUDIT_SESSION_2026-09-08_0625.md` contains the obsolete diagnostic expectation `/api/telegram/auto-webhook`; current routing uses `/api/telegram/webhook`. Do not reintroduce the old route.
6. `AUDIT_CHECKPOINT_2026-09-09_REPO_CONSOLIDATION.md` says PR #51 is open/draft; this is historical and must not be used as current release state.
7. `AUDIT_HANDOFF_2026-09-08.md` contains useful anti-duplication infrastructure rules, but its deployment commit/run references are historical.

## 7. AGENT COLLISION PROTOCOL

Before starting a logical task:

1. Search this registry for the workstream.
2. Search open PRs for the same files/feature.
3. If an existing PR already owns the logical change, **review/continue that work instead of starting a second implementation**.
4. If another AI has an active branch/PR for the same logical area, do not create a competing branch unless explicitly required to reconcile or replace it.
5. Record the selected PR/branch in the registry before substantial implementation.
6. After completion, record commit, tests, deployment evidence and the next owner/action.

### Collision rule
**One logical task → one active implementation path → one release gate.**

Different AIs may review the same work, but they must not independently implement the same logical change.

## 8. PRODUCTION MUTATION RULE

Production changes go through GitHub Actions. Do not use local Wrangler on Android/Termux. Never claim production GREEN from a commit alone. Required evidence remains: code → test → CI → merge → deployment → live verification.

## 9. CURRENT NEXT ACTION QUEUE

Priority 1 — **Admin 403:** Cloudflare edge/custom-domain/Access/WAF/route investigation; no duplicate Worker route implementation.

Priority 2 — **Review existing PR #53:** compare Admin hardening against current `main`; do not duplicate already-landed route/login behavior.

Priority 3 — **Review PR #54:** determine whether PT Xtra plate branding + AI sales copy can be merged/rebased as the single vehicle-publishing implementation.

Priority 4 — **Review PR #55:** dedicated vehicle + four ecosystem pages; avoid duplicate routes.

Priority 5 — **Review PR #66:** VIP document hardening; reconcile with current main and older PR #37.

Priority 6 — **Verify PR #49:** production runtime verification capability; do not create a second health-check workflow.

Priority 7 — **Backup:** run/verify the existing full-system backup path and restore/readability; do not create another scheduler/bot.

## 10. UPDATE RULE

Every AI that makes a meaningful change must update this registry or the canonical handoff with:

- date/time;
- AI/agent role;
- branch/PR;
- logical workstream;
- files touched;
- commit SHA;
- tests/CI evidence;
- production evidence if applicable;
- blocker;
- next owner/action.

No secret values. No unsupported deployment claims.

## 11. LAST REGISTRY UPDATE

- Date: 2026-09-10
- Agent: ChatGPT
- Mainline coordination commit: `9bace7f2435c1d84494aa75a23e18982ea8e8651`
- Admin production deployment evidence: Cloudflare Version `d32431ad-fb43-4ad9-83d5-27876cad7f1b`
- Current blocker: public `/admin` returns HTTP 403.
- Next owner: Release/Production AI (or any AI with Cloudflare edge access) to inspect the edge/custom-domain path before any further Admin route-code changes.
