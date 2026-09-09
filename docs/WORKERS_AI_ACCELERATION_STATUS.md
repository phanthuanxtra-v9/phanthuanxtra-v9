# Workers AI Acceleration Status — 2026-09-09

Status: ACTIVE.

The owner has directed that the available daily Workers AI Neuron capacity be used as fully as practical for useful workloads until the requirement changes.

Current verified production path:

- `src/ai-chat.js`
- primary `@cf/zai-org/glm-4.7-flash`
- fallback `@cf/meta/llama-3.2-3b-instruct`
- native `env.AI.run()` binding

The current dashboard value reported by the owner is `0/10k Neurons used today`.

This branch does not fabricate Cloudflare dashboard telemetry. It records the owner-reported value and applies it as an execution directive.

No credential, secret, route, domain or production configuration has been changed.
