# PHAN THUẦN XTRA — SHARED AI WORK REGISTRY

> One operational registry for AI1–AI5, Cloudflare Workers AI, and any other coding agent. It prevents duplicate implementations, stale Markdown task execution, and duplicate infrastructure.

**HARD RULE: every AI participant, including every Workers AI model invocation, must read this registry before analysis or implementation.** `main` + current open PRs + this registry determine active work. Historical Markdown is evidence only; never execute an old `NEXT ACTION` automatically.

## Mandatory AI preflight
1. Read `AI-WORK-REGISTRY.md` first.
2. Read `AI_AGENT_PROTOCOL.md`.
3. Read current handoff/context: `AI-HANDOFF-CHECKPOINT.md` and `MASTER_CONTEXT_PHAN_THUAN.md`.
4. Reconcile relevant project-state/handoff documents against current `main`.
5. Check current `main` and relevant open PRs for an existing implementation owner.
6. Only then inspect/modify code or infrastructure.

**Workers AI gate:** before a Workers AI model is used to make an implementation decision, the current registry + protocol context must be supplied to that model. If the context cannot be supplied/read, the model is advisory only and must not create a new implementation path.

## Current truth
- Repository: `phanthuanxtra-v9/phanthuanxtra-v9`
- Production Worker: `phanthuanxtra-v2`
- Admin route fix merged at `fc1617479aefa0e9b98b4afe1624f5b01b338187`.
- Admin route deployment verified; Cloudflare Version ID `d32431ad-fb43-4ad9-83d5-27876cad7f1b`.
- Public `/admin` still returns HTTP 403. Admin production is **NOT GREEN**.
- Do not repeat the Worker route fix before checking Cloudflare edge/custom-domain/Access/WAF/route behavior.

## Active work — do not duplicate
| Area | Status | Existing path | Next AI rule |
|---|---|---|---|
| Admin 403 | BLOCKED | merged route fix; live 403 | Edge/custom-domain/Access/WAF investigation only. |
| Admin CMS hardening | OPEN | PR #53 | Review/rebase against current main; no second Admin implementation. |
| PT Xtra plate + AI sales copy | OPEN | PR #54 | Review existing implementation; no second branding/copy pipeline. |
| Vehicle + ecosystem pages | OPEN | PR #55 | Review existing dedicated routes; no duplicate pages. |
| VIP document ingestion | OPEN/newer | PR #66 | Use PR #66/current main; PR #37 is superseded. |
| Production runtime health | OPEN/DRAFT | PR #49 | Review/extend PR #49; no second health workflow. |
| Admin docs continuity | SUPERSEDED | PR #62 | Do not merge/recreate the stale docs snapshot; close only after confirming no unique content remains. |
| Old checkpoint | HISTORICAL | PR #47 | Do not use as current state. |
| Old UI performance | OPEN | PR #1 | Inspect current main before duplicating any UI optimization. |
| Backup | IMPLEMENTED, NOT OPERATIONALLY PROVEN | `full-system-backup.yml`, `scripts/full-system-backup.mjs` | Verify real backup + restore/readability; do not create another backup workflow/bot/cron. |
| Telegram Auto | EXISTING | `/api/telegram/webhook` + existing self-heal | Do not add `/api/telegram/auto-webhook` from stale docs. |
| Telegram VIP | EXISTING | `/api/telegram/vip-webhook` | Do not create another VIP route/cron. |

## Single-instance Cloudflare rule
Existing verified infrastructure: Worker `phanthuanxtra-v2`; D1 `phanthuanxtra-db`; R2 `phanthuanxtra-media`; Workers AI `AI`; Images `IMAGES`; AI Search `AI_SEARCH`; Assets `ASSETS`; Worker cron `*/5 * * * *`.

Do not create duplicates unless direct evidence proves the existing resource cannot satisfy the requirement.

## Markdown authority
**Operational:** `AI-WORK-REGISTRY.md`, `AI_AGENT_PROTOCOL.md`, `AI-HANDOFF-CHECKPOINT.md`, `MASTER_CONTEXT_PHAN_THUAN.md`, `SECURITY.md` (reconcile security baseline against current source).

**Requires reconciliation before use:** `ADMIN_AUDIT_CHECKPOINT.md`, `PHAN_THUAN_XTRA_STATUS.md`, `project-docs/PROJECT_STATE.md`, `project-docs/AI_HANDOFF.md`.

**Historical/read-only evidence:** root audit/checkpoint/session Markdown from 2026-09-08/09 and Android audit/design Markdown under `android/`.

## Stale/conflicting claims found
- `ADMIN_AUDIT_CHECKPOINT.md`: old `ADMIN_TOKEN` model and obsolete claim that Wrangler config is absent.
- `PHAN_THUAN_XTRA_STATUS.md`: stale latest commit/deployment state.
- `project-docs/PROJECT_STATE.md`: dated 2026-09-06; older deployment evidence.
- `AUDIT_SESSION_2026-09-08_0625.md`: obsolete `/api/telegram/auto-webhook` expectation.
- `AUDIT_CHECKPOINT_2026-09-09_REPO_CONSOLIDATION.md`: old PR #51 state.

## Collision protocol
1. Read this registry.
2. Search open PRs for the same logical feature/files.
3. If a PR already owns the task, review/continue it; do not start a competing implementation.
4. One logical task → one active implementation path → one release gate.
5. After meaningful work, update this registry or canonical handoff with branch/PR, files, commit, tests, production evidence, blocker and next owner/action.

## Current queue
1. Admin 403 edge/custom-domain/Access/WAF investigation.
2. Review PR #53 Admin hardening.
3. Review PR #54 plate branding + AI copy.
4. Review PR #55 dedicated pages.
5. Review PR #66 VIP document hardening.
6. Verify/extend PR #49 production runtime health gate.
7. Verify existing backup + restore path.

## Last registry update
- Date: 2026-09-10
- Agent: ChatGPT
- Protocol enforcement commit: `c78c7482d8a10f79167e12bdeb34e0c0f12614a7`
- Registry checkpoint: pending this update
- Admin Cloudflare Version: `d32431ad-fb43-4ad9-83d5-27876cad7f1b`
- Blocker: public `/admin` = HTTP 403.
