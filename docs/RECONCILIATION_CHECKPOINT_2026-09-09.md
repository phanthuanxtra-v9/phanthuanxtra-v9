# Code-Level Reconciliation Checkpoint — 2026-09-09

Repository: `phanthuanxtra-v9/phanthuanxtra-v9`
Working branch: `refactor/ai-core-consolidation`
Authoritative production branch: `main`

## Scope completed

Reconciled the current Developer Gateway against the historical `feature/developer-gateway` and `feature/ai-peer-executor-hardening` branches, and inspected `unified-v2` at file level before cleanup.

## Developer Gateway decision

Current `main` already contains the important live Gateway architecture from the historical branch: hard-pinned repository/branch, authenticated access, exact-origin CORS, workflow dispatch for `audit`/`test`/`propose-fix`, production deploy/rollback denial, and secret non-disclosure.

The historical `feature/developer-gateway` contained additional defensive controls that were not present in current `main`: bounded streamed request bodies, explicit rate limiting, stricter configured-origin parsing, `405` handling for the task endpoint, and focused validation tests.

These controls were reconciled onto this isolated branch without copying the old branch wholesale.

### Implemented commit

- `b28c65fb42a2e4f5e1b613ef4ea4711dc89f9419` — Gateway request-size/rate-limit/CORS hardening.
- `68b19e390fd7b9ac2ccb556ebb02dbe45c81e1e4` — deterministic Developer Gateway regression tests.

### Safety properties preserved

- Repository remains hard-pinned to `phanthuanxtra-v9/phanthuanxtra-v9`.
- Execution branch remains hard-pinned to `main` for dispatched tasks.
- Production deploy and rollback remain blocked.
- GitHub dispatch credential is only used for the explicit workflow dispatch path.
- No Cloudflare binding, route, secret, credential, or production configuration was changed.

## AI Peer Executor decision

The current `main` `developer-gateway/ai-peer-executor.mjs` is byte-identical to the historical `feature/ai-peer-executor-hardening` copy inspected during this pass. No duplicate executor merge is required.

The current `main` AI Peer Executor workflow was also inspected against the historical hardening branch. Its constrained execution model remains the canonical implementation: non-main checkpoint checkout, provider allow-list, structured summary/patch output, patch validation, sensitive-path rejection, repository checks, isolated branch/PR creation, and explicit prohibition of production mutation.

Therefore the historical AI Peer Executor branch contains no additional runtime code that should be copied wholesale into the consolidation branch.

## unified-v2 decision

`main` versus `unified-v2` is a heavily diverged comparison (`main` was ahead by 2 and behind by 395 at audit time). The branch contains a substantial historical `src/v2-production.js`, but file inspection shows it is a legacy monolithic Worker architecture using the old Llama model, KV-backed customer/session state, inline HTML, Telegram configuration endpoints, and broad CORS.

That architecture is not suitable for blind reintegration into the current production architecture. Its functional ideas must only be recovered individually if a current-main capability gap is demonstrated.

Decision: **do not merge `unified-v2` wholesale**. Preserve it for historical reference until a separate capability-gap audit proves that any specific feature is still missing.

## Cleanup candidates verified

- `ai5/integration-e2e`: branch still exists; open-PR query returned `[]`. It is eligible for the next destructive cleanup batch because pairwise audit already established it is identical to AI-2 and has no independent functional delta.
- `feature/developer-gateway-clean`: branch still exists; open-PR query returned `[]`. Current-main comparison showed `ahead_by=0`, so it has no unique commits relative to current `main` and is eligible for cleanup.

The current GitHub connector exposes no remote branch-delete mutation. **No deletion is falsely claimed.** The exact local Git deletion commands are retained for the operator checkpoint.

## Next cleanup batch

After this reconciliation checkpoint, the next batch should remove only:

1. `ai5/integration-e2e`
2. `feature/developer-gateway-clean`

Before each deletion, re-check branch existence and open PR state. Never delete an open-PR branch.

Suggested operator commands from the repository checkout:

```powershell
git fetch origin --prune
git push origin --delete ai5/integration-e2e
git push origin --delete feature/developer-gateway-clean
git fetch origin --prune
git branch -r
```

## Blockers / protected operations

- Merging `refactor/ai-core-consolidation` into `main` remains a protected operation and requires explicit merge authorization/independent review.
- Remote branch deletion cannot be executed through the currently exposed GitHub connector.
- No Cloudflare or production mutation was attempted.
