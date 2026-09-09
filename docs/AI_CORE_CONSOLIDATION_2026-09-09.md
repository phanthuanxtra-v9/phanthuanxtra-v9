# AI Core Consolidation — A1 → A5

Date: 2026-09-09
Repository: `phanthuanxtra-v9/phanthuanxtra-v9`
Base: `main`
Working branch: `refactor/ai-core-consolidation`

## Objective

Consolidate the historical AI-1 → AI-5 development branches into one production architecture without replaying historical commits or introducing duplicate implementations.

## Evidence-based decision

The current `main` branch already contains the evolved implementations of the historical A1/A2/A3 work:

- Workers AI primary model: `@cf/zai-org/glm-4.7-flash`.
- Workers AI fallback: `@cf/meta/llama-3.2-3b-instruct`.
- Vehicle intelligence is already present in the current production codebase.
- Telegram ingestion, vehicle analysis, R2 media and PT Xtra plate branding are already present.
- PT Xtra plate-branding regression coverage already exists on `main`.
- Historical AI-5 was not an independent functional delta from AI-2.
- Historical AI-4 mainly contributed CI/validation deltas that must be reconciled against the current production workflow rather than copied wholesale.

Therefore the consolidation is architectural, not a five-way merge.

## Target architecture

```text
                    MAIN / PRODUCTION
                           |
             +-------------+-------------+
             |                           |
      Vehicle Intelligence        Data / Media Core
             |                           |
             +-------------+-------------+
                           |
                    Validation / CI
                           |
                 Cross-validation tests
```

### Layer 1 — Vehicle Intelligence Core

Authoritative implementation comes from current `main`, not the historical AI-1 branch. Preserve identity normalization, vehicle form/state analysis, evidence handling and conflict detection already present in production.

### Layer 2 — Vehicle Data / Media Core

Keep the production implementations for Telegram ingest, vehicle AI, PT Xtra plate branding, R2/media persistence and catalog integration. Do not reintroduce historical duplicate files from AI-2/AI-3.

### Layer 3 — Validation / CI

Keep production regression tests and CI gates. Reconcile useful historical AI-4 checks with the current workflow only where a check is still absent. Do not restore an obsolete workflow wholesale.

### Cross-validation

AI-5 is treated as historical validation lineage, not a separate runtime engine. Its useful tests/evidence remain in the canonical test suite; the branch itself must not be merged as a second implementation.

## Workers AI acceleration policy

Workers AI is the native inference engine for the production AI path. The current code uses `@cf/zai-org/glm-4.7-flash` as primary. Cloudflare documents GLM-4.7-Flash as a fast multilingual model with tool calling, reasoning and a 131,072-token context window.

Acceleration rules:

1. Prefer the `env.AI` binding over REST calls for Worker-internal inference.
2. Keep inference at the edge; do not introduce an external model hop for normal production chat.
3. Preserve streaming-capable paths where latency benefits from time-to-first-token.
4. Keep the fallback model for resilience; never silently remove fallback coverage.
5. Do not spend neurons on redundant historical-branch replay or duplicate AI passes.
6. Use Workers AI selectively for high-value runtime tasks: chat reasoning, vehicle interpretation, validation assistance and structured classification.
7. Do not create speculative model bindings, secrets or model IDs without evidence from the repository/Cloudflare configuration.

## Safety gates

- No Cloudflare credential changes.
- No secret rotation.
- No domain/route changes.
- No production deletion.
- No destructive branch deletion in this consolidation branch.
- No blind merge of AI-1 → AI-5 historical branches.

## Next execution sequence

1. Compare current production AI/vehicle/data/CI files against the historical A1-A5 deltas.
2. Extract only genuinely missing functionality.
3. Add regression coverage for any extracted functionality.
4. Run repository CI and Cloudflare dry-run validation.
5. Open a PR from this branch.
6. Merge only after the independent-review requirement is satisfied.
7. After the merged state is verified, clean historical A1-A5 branches that have no remaining unique value.

## Current status

**IN PROGRESS — consolidation branch created.**

No historical A1-A5 branch has been merged into this branch. The production `main` remains authoritative.
