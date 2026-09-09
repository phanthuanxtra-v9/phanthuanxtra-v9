# Workers AI Acceleration — 2026-09-09

## Verified production model path

`src/ai-chat.js` on `main` currently selects:

- Primary: `@cf/zai-org/glm-4.7-flash`
- Fallback: `@cf/meta/llama-3.2-3b-instruct`

The primary call uses the native Workers AI binding `env.AI.run(...)`.

## Why this is the correct acceleration path

Cloudflare documents GLM-4.7-Flash as a fast multilingual model with a 131,072-token context window, reasoning and multi-turn tool calling. Workers AI runs models on Cloudflare's serverless GPU network and supports invocation through Workers AI bindings.

The project therefore does not need a new provider credential to accelerate the existing AI path.

## Neuron utilization

The dashboard state reported by the operator is `Neurons used today: 0/10k`. This is treated as available daily capacity, not as a reason to introduce wasteful duplicate inference.

Use the available capacity for measured production-value tasks:

- AI chat reasoning
- vehicle intelligence classification/interpretation
- structured validation assistance
- future agent/tool calls after repository-backed contracts are defined

Avoid:

- duplicate A1-A5 inference passes
- speculative background loops
- repeated retries without backoff
- inference on requests that can be answered deterministically

## Latency strategy

1. Keep the primary model on Workers AI.
2. Prefer direct `env.AI` binding calls inside the Worker.
3. Stream responses for interactive paths when the endpoint contract permits it.
4. Bound prompt/history sizes to avoid unnecessary inference cost and latency.
5. Keep fallback only for primary inference failures.
6. Measure before changing model selection.

## Current limitation

The GitHub-connected environment can inspect and modify repository code, but it cannot directly read the operator's private Cloudflare dashboard usage counter. The reported `0/10k` value is therefore recorded as operator-provided runtime state; no fabricated usage figure is asserted.

## Safety

No Cloudflare tokens, account IDs, secrets, routes, domains or production bindings are changed by this document.
