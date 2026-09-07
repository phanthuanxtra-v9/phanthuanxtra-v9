# Multi-AI Developer Gateway

## Purpose

Reduce dependence on any single chat session by running specialist AI reviews through GitHub Actions while keeping GitHub and Cloudflare production mutations behind existing gates.

## Specialists

- **Mistral** — code engineering: Cloudflare Workers, JavaScript, API contracts, race conditions, minimal patches.
- **Gemma** — test engineering: regression tests, edge cases, Android/API acceptance coverage.
- **Llama** — independent security/reliability review: auth, secrets, prompt injection, idempotency, concurrency, blast radius.

The workers are advisory. They do not receive GitHub write credentials and do not deploy production.

## Execution path

```text
Developer Gateway
      |
      | authenticated task dispatch
      v
GitHub Actions / Zero-Cost workflow
      |
      +---- Mistral code review
      +---- Gemma test review
      +---- Llama security review
      |
      v
JSON artifact + GitHub Actions summary
      |
      v
Lead review / Codex / human approval
      |
      v
existing CI -> production gate -> Cloudflare
```

## Activation

The existing Developer Gateway already dispatches `zero-cost-audit-test.yml` for `audit` and `test` modes. A task becomes a Multi-AI task when its instruction starts with:

```text
MULTI_AI:
```

Example instruction:

```text
MULTI_AI: Audit the S21 admin app API integration, Auto Bot single-flight behavior, VIP Bot idempotency, and identify only high-confidence fixes. Do not modify production.
```

## GitHub configuration

Add these **repository/environment secrets** without putting values in source code or chat:

- `MISTRAL_API_KEY`
- `GEMINI_API_KEY`
- `LLAMA_API_KEY`

Recommended repository/environment variables:

- `MISTRAL_MODEL` — default `mistral-large-latest`
- `GEMMA_MODEL` — default `gemma-4-31b-it`
- `LLAMA_BASE_URL` — OpenAI-compatible endpoint hosting the selected Llama model
- `LLAMA_MODEL` — model identifier for that endpoint

Llama is deliberately provider-neutral because the hosting endpoint can change; the gateway only needs an OpenAI-compatible `/chat/completions` interface.

## Cost control

- OpenAI API calls: 0 in this worker.
- Production deploy/rollback: never attempted by this worker.
- Mistral/Gemini/Llama calls are only made when the Multi-AI prefix is explicitly used.
- Missing provider credentials produce `not_configured` instead of failing the whole architecture.
- Review output is retained as a short-lived GitHub Actions artifact.

Gemma 4 is currently listed by Google as free on the Gemini API pricing page. Mistral Studio provides API access and free-mode availability can depend on the current account/plan, so usage limits must be treated as provider-side constraints rather than assumed to be unlimited.

## Security boundary

AI workers are **reviewers, not deployers**. They receive task text and provider credentials only. They do not receive `CLOUDFLARE_API_TOKEN`, production database credentials, or GitHub write tokens. Existing production deploy/rollback guards remain unchanged.
