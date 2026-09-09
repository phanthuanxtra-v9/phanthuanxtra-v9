# Workers AI 10K Neuron Execution Contract

Owner directive: use the available daily Workers AI capacity for useful workloads until the owner changes the requirement.

## Operational meaning

The repository does not generate synthetic traffic to consume quota. Instead, real production and engineering tasks that benefit from inference should prefer Workers AI.

## Current model contract

- Primary: `@cf/zai-org/glm-4.7-flash`
- Fallback: `@cf/meta/llama-3.2-3b-instruct`
- Invocation: native Worker binding `env.AI.run()`

Cloudflare documents GLM-4.7-Flash as a fast multilingual model with reasoning and tool-calling support and a 131,072-token context window.

## Execution policy

- Prefer one high-value inference over repeated equivalent calls.
- Use deterministic code for deterministic validation.
- Use AI for interpretation, classification, synthesis and reasoning.
- Reuse retrieved context instead of repeating retrieval/inference unnecessarily.
- Keep prompts and history bounded.
- Preserve fallback behavior.
- Record meaningful AI architecture changes in the handoff checkpoint.

## Safety boundary

This contract does not authorize changes to Cloudflare credentials, secrets, domain routes, billing, or account configuration. It authorizes only repository-side use of the existing Workers AI binding and verified model contract.
