# PHAN THUẦN XTRA — SHARED AI WORK REGISTRY

> One operational registry for AI1–AI5 and any other coding agent. It prevents duplicate implementations, stale Markdown task execution, and duplicate infrastructure.

**Operational rule:** read this file first. `main` + current open PRs + this registry determine active work. Historical audit Markdown is evidence only; never execute an old `NEXT ACTION` automatically.

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
| Admin docs continuity | CLOSED/SUPERSEDED | PR #62 | Do not recreate/merge the stale docs snapshot. |
| Old checkpoint | HISTORICAL | PR #47 | Do not use as current state. |
| Old UI performance | OPEN | PR #1 | Inspect current main before duplicating any UI optimization. |
| Backup | IMPLEMENTED, NOT OPERATIONALLY PROVEN | `full-system-backup.yml`, `scripts/full-system-backup.mjs` | Verify real backup + restore/readability; do not create another backup workflow/bot/cron. |
| Telegram Auto | EXISTING | `/api/telegram/webhook` + existing self-heal | Do not add `/api/telegram/auto-webhook` from stale docs. |
| Telegram VIP | EXISTING | `/api/telegram/vip-webhook` | Do not create another VIP route/cron. |

## Single-instance Cloudflare rule
Existing verified infrastructure:
- Worker `phanthuanxtra-v2`
- D1 `phanthuanxtra-db`
- R2 `phanthuanxtra-media`
- Workers AI `AI`
- Images `IMAGES`
- AI Search `AI_SEARCH`
- Assets `ASSETS`
- Worker cron `*/5 * * * *`

Do not create duplicates unless direct evidence proves the existing resource cannot satisfy the requirement.

## Markdown authority
**Operational:**
- `AI-WORK-REGISTRY.md`
- `AI_AGENT_PROTOCOL.md`
- `AI-HANDOFF-CHECKPOINT.md`
- `MASTER_CONTEXT_PHAN_THUAN.md`
- `SECURITY.md` (security baseline; reconcile against current source)

**Requires reconciliation before use:**
- `ADMIN_AUDIT_CHECKPOINT.md`
- `PHAN_THUAN_XTRA_STATUS.md`
- `project-docs/PROJECT_STATE.md`
- `project-docs/AI_HANDOFF.md`

**Historical/read-only evidence:**
- `AUDIT_CHECKPOINT_2026-09-09_0859.md`
- `AUDIT_CHECKPOINT_2026-09-09_ADMIN.md`
- `AUDIT_CHECKPOINT_2026-09-09_API_GATE.md`
- `AUDIT_CHECKPOINT_2026-09-09_GATE.md`
- `AUDIT_CHECKPOINT_2026-09-09_GEV_NXDOMAIN.md`
- `AUDIT_CHECKPOINT_2026-09-09_REPO_CONSOLIDATION.md`
- `AUDIT_HANDOFF_2026-09-08.md`
- `AUDIT_SESSION_2026-09-08_0625.md`
- `AUDIT_SESSION_2026-09-08_1300.md`
- Android audit/design Markdown under `android/`.

## Stale/conflicting claims explicitly found
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
5. After meaningful work, update this registry or canonical handoff with branch/PR, files, commit, tests, production evidence, blocker and next owner.

## Current queue
1. Admin 403 edge/custom-domain/Access/WAF investigation.
2. Review PR #53 Admin hardening.
3. Review PR #54 plate branding + AI copy.
4. Review PR #55 dedicated pages.
5. Review PR #66 VIP document hardening.
6. Verify/extend PR #49 runtime health gate.
7. Verify existing backup + restore path.

## Last registry update
- Date: 2026-09-10
- Agent: ChatGPT
- Registry commit: `77f89909d97bb63e62f4343193d15341b7f9233c`
- Admin Cloudflare Version: `d32431ad-fb43-4ad9-83d5-27876cad7f1b`
- Blocker: public `/admin` = HTTP 403.
