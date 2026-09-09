# Audit Checkpoint — Post-Merge CI / Cloudflare / Repository Cleanup

**Date:** 2026-09-09
**Repository:** `phanthuanxtra-v9/phanthuanxtra-v9`

## Current authoritative state

- `main` is the authoritative production integration branch.
- Latest checkpoint update records the deep AI-1 → AI-5 overlap audit below.
- Production Worker remains `phanthuanxtra-v2`; last verified deployed Version ID: `a8ccd421-aa72-4665-8917-3232f3743e7c`.
- `phanthuanxtra.com` production Worker remains untouched by branch cleanup.
- `eye.phanthuanxtra.com` remains explicitly deferred; no DNS/HTTPS health claim is made.

## Completed cleanup

The approved cleanup batch was **12 branches**, not 11, and all 12 were deleted remotely and confirmed absent from `git branch -r` after `git fetch origin --prune`:

- `feature/mobile-bots-hardening-reconciled`
- `refactor/apk-xtra-command-ui-v2`
- `tmp/telegram-diagnostic-main-check`
- `tmp/telegram-diagnostic-main-check-2`
- `tmp/telegram-diagnostic-main-check-3`
- `tmp-xtra-ui`
- `tmp-xtra-ui-2`
- `tmp-xtra-ui3`
- `tmp-xtra-ui4`
- `tmp-xtra-ui5`
- `tmp-xtra-ui6`
- `tmp-xtra-ui-drawable`

## Deep AI-1 → AI-5 overlap audit

Method: direct branch-to-main comparisons plus pairwise comparisons across the AI branches. The purpose was to identify the canonical integration layer and prevent duplicate/cherry-pick/reintroduced work.

### Confirmed relationship

- **AI-1 `ai1/vip-vehicle-intelligence`** is the foundational VIP vehicle-intelligence layer, with its own implementation, documentation and tests.
- **AI-2 `ai2/tests-pt-xtra`** carries the shared PT-XTRA functional layer: plate branding, Telegram ingest, vehicle AI and regression tests.
- **AI-3 `ai3/data-r2-publish`** is effectively the AI-2 functional layer **plus** the dedicated `tests/plate-branding.test.mjs` regression coverage. The direct AI-2 → AI-3 comparison showed AI-3 ahead by 8 commits and the only additional file in that comparison was `tests/plate-branding.test.mjs`.
- **AI-4 `ai4/cloudflare-e2e`** is effectively the AI-3 layer plus a Cloudflare deployment workflow delta. The direct AI-3 → AI-4 comparison showed only a one-commit difference in the branch tips, with `.github/workflows/deploy-cloudflare.yml` as the unique AI-4 file relative to AI-3.
- **AI-5 `ai5/integration-e2e`** is not an independent functional layer: the direct AI-2 → AI-5 comparison was **identical** (`ahead_by=0`, `behind_by=0`, no changed files). AI-4 → AI-5 showed AI-5 behind by one commit with no unique files. Therefore AI-5 must not be merged separately as if it contained new functional work.

### Canonical chain decision

The effective development chain is:

`AI-1 core` → `AI-2 functional/test hardening` → `AI-3 + plate-branding regression` → `AI-4 Cloudflare CI delta`

with `AI-5` serving as a validation/integration branch whose current code is identical to AI-2 rather than a separate code layer.

**Decision:** do not blindly merge AI-1, AI-2, AI-3, AI-4 and AI-5 one-by-one. First reconcile the current `main` against the canonical functional changes. AI-3 is the strongest canonical candidate for the shared AI-2/AI-3 layer; AI-4's workflow change must be evaluated against the current `main` workflow before any integration because `main` has advanced substantially and may already contain a newer CI implementation. AI-5 should not be merged independently.

### Evidence commits inspected

- `8d6b35c408d2dd71c0f98c4a38f5b8d6b4c03122` — VIP vehicle intelligence handoff contract.
- `8f0d67695e2baef3a0ec3338ad13c8b02d0996d2` — Telegram publish fixtures updated for mandatory `plate_bbox`.
- `85f16a91aa2696e278a9231bf271f79e4a13291b` — R2 PT-XTRA plate-branding bbox regression test.
- `910a8aacdc50f6596aa322d609b2da46d0673e39` — CI inclusion of PT-XTRA plate-branding regression test.
- `121cd5ccf2f084010338544e6be022c8b1c032e1` — CI inclusion of VIP vehicle-intelligence tests.

## Current branch protection / retention

### RETAIN — open PRs / unique work

- `ai/ui-performance` — PR #1 OPEN; unique mobile performance changes. **RETAIN.**
- `audit/ai6-vip-document-ingestion-2026-09-06` — PR #37 OPEN; unique VIP Telegram document ingestion/R2 evidence work. **RETAIN.**
- `checkpoint/20260908-continuation` — PR #47 OPEN; unique checkpoint/handoff documentation. **RETAIN until disposition.**
- `codex/production-health-check` — PR #49 OPEN/DRAFT; unique production runtime health-check work. **RETAIN.**
- `unified-v2` — unique runtime/config/UI work. **RETAIN; high-priority review candidate.**
- `feature/developer-gateway` — unique developer-gateway work. **RETAIN.**
- `feature/ai-peer-executor-hardening` — retain pending current-tip/reference recheck.

### RETAIN — AI-1 → AI-5 until integration disposition

- `ai1/vip-vehicle-intelligence`
- `ai2/tests-pt-xtra`
- `ai3/data-r2-publish`
- `ai4/cloudflare-e2e`
- `ai5/integration-e2e`

No AI-1 → AI-5 branch was merged or deleted by this audit.

## Cleanup policy for the next phase

- AI-5 is the **first cleanup candidate within the AI-1 → AI-5 group**, but only after confirming there is no open PR/reference requiring it and after preserving its validation evidence.
- AI-4 is not a cleanup candidate until its CI delta is reconciled against current `main`.
- AI-3 remains the canonical candidate for the shared functional/test layer unless current-main comparison proves that those changes are already integrated or superseded.
- AI-2 must not be merged after AI-3 merely to reproduce the same core changes.
- AI-1 must be handled independently because its VIP intelligence implementation is not equivalent to the AI-2/AI-3 chain.
- Never delete an open-PR branch. Never use historical merge status alone; always compare the current branch tip and inspect references immediately before deletion.

## Upgrade boundary

Workers AI GLM-4.7 Flash is already integrated into main. Using the available Workers AI quota for an automated audit/triage executor would be a **new upgrade**, so it is not silently enabled.

## Safety boundaries

- Do not modify production Cloudflare bindings or `phanthuanxtra.com` during branch cleanup.
- Do not claim `eye.phanthuanxtra.com` healthy; DNS/HTTPS remains deferred.
- Legacy repository `phanthuanxtra-v9/phanthuanxtra` remains intact until Cloudflare Worker/custom-domain linkage is independently verified.
- No secrets or credentials are stored in this checkpoint.

## Handoff

Authoritative state: **12 cleanup branches deleted and verified → full branch inventory audited → open PRs protected → deep AI-1→AI-5 overlap established → AI-3 identified as canonical shared functional candidate → AI-4 isolated as CI delta requiring current-main reconciliation → AI-5 confirmed identical to AI-2 and marked first cleanup candidate after disposition → no destructive action taken on AI-1→AI-5.**