# Multi-AI Developer Gateway

## Purpose

Make PHAN THUẦN XTRA resilient to ChatGPT usage limits by giving ChatGPT, Mistral, Gemma and Llama a common project task contract. The non-ChatGPT workers can continue audits, tests, diagnosis and handoff from the same GitHub checkpoint instead of starting over.

## Peer model

The four AI systems are **co-equal at the project capability layer**, but they do not share provider credentials.

- **ChatGPT** — architecture, cross-system audit, coordination and final verification when available.
- **Mistral** — implementation/code/Cloudflare/API reasoning.
- **Gemma** — test engineering: regression, edge cases, Android/API acceptance.
- **Llama** — security/reliability: auth, secrets, prompt injection, idempotency, concurrency, blast radius.

Specialist routing is a default, not a permission boundary.

## Continuity

Authoritative handoff state is stored in GitHub Markdown:

- `MASTER_CONTEXT_PHAN_THUAN.md`
- `developer-gateway/AI-PEER-CONTINUITY.md`
- `developer-gateway/MULTI-AI-GATEWAY.md`

Every task carries a task ID and must report completed work, evidence, next step and blockers. If ChatGPT reaches a quota, the next configured peer continues the same task ID and reads the same checkpoint.

## Execution path

```text
AI peer (ChatGPT / Mistral / Gemma / Llama)
                  |
                  v
         Developer Gateway
                  |
                  v
      GitHub task + checkpoint
                  |
        +---------+---------+
        |         |         |
     Mistral   Gemma     Llama
        |         |         |
        +---------+---------+
                  |
                  v
          Review / proposal
                  |
                  v
        constrained executor
                  |
                  v
             PR + CI
                  |
                  v
       existing production gate
                  |
                  v
             Cloudflare
```

The current implementation is the review/proposal stage. Direct autonomous production mutation remains disabled.

## Activation

The existing Developer Gateway dispatches `zero-cost-audit-test.yml` for `audit` and `test` modes. A task becomes a Multi-AI task when its instruction starts with:

```text
MULTI_AI:
```

Example:

```text
MULTI_AI: Continue task TASK-123 from MASTER_CONTEXT_PHAN_THUAN.md. Audit the S21 admin app, Auto Bot single-flight behavior and VIP Bot idempotency. Return evidence and high-confidence fixes only.
```

## GitHub configuration

Repository/environment secrets:

- `MISTRAL_API_KEY`
- `GEMINI_API_KEY`
- `LLAMA_API_KEY`

Repository/environment variables:

- `MISTRAL_MODEL` — default `mistral-large-latest`
- `GEMMA_MODEL` — default `gemma-4-31b-it`
- `LLAMA_BASE_URL` — OpenAI-compatible endpoint hosting the selected Llama model
- `LLAMA_MODEL` — model identifier for that endpoint

Do not put secret values in source, Markdown or chat.

## Cost and availability

- OpenAI API calls: 0 in this worker.
- Provider calls occur only for explicit Multi-AI tasks.
- Missing provider credentials produce `not_configured` rather than stopping all peers.
- Review output is retained as a short-lived GitHub Actions artifact.
- Provider free tiers/quotas are external constraints; the continuity architecture must not assume unlimited free usage.

## Security boundary

AI peers receive only the credentials required for their provider API call. They do **not** receive `CLOUDFLARE_API_TOKEN`, production database credentials, or raw production secrets.

The future executor is the component that may receive narrowly scoped GitHub write permission, and it must create/update a branch and PR rather than writing directly to `main`. Production deployment stays behind the existing CI/Cloudflare gate.

## Cloudflare

`developer-gateway/wrangler.jsonc` now declares the non-secret peer continuity flags:

- `AI_PEER_FAILOVER_ENABLED=true`
- `AI_PEER_POLICY_VERSION=1`

These are configuration flags only. Authentication secrets and provider credentials remain Cloudflare/GitHub secrets. Cloudflare recommends encrypted Worker secrets for API keys and auth tokens rather than plaintext variables.
