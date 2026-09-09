# PHAN THUẦN XTRA — AI Architecture Reference

## Purpose
Compact reference for AI integration decisions. It supplements, and does not override, the authoritative project, security, and handoff documents.

## Preferred AI execution
1. **Workers AI** — preferred when the workload can be served by Cloudflare-hosted models: edge execution, no external API key, and a simpler secret boundary.
2. **OpenAI API** — use when model/capability requirements exceed Workers AI. The OpenAI key MUST remain in Cloudflare Worker Secrets/Secrets Store and MUST never be embedded in APK, WebView, source, logs, or client payloads.

Choose per task based on model capability, latency, quota/cost, privacy, and operational complexity. Do not assume quota or pricing without current provider verification.

## Cloudflare bindings
| Binding | Primary use | Policy |
|---|---|---|
| KV | Short-lived response/config/session cache | Use TTL for cacheable data; never cache secrets. |
| D1 | Cars, chat/history, application metadata, audit records | Keep authoritative application state server-side. |
| R2 | Vehicle images, uploaded documents/media | Prefer R2 for large objects; avoid duplicating binary data in D1. |
| Queues | Long-running/async AI processing | Use for heavy jobs and retries; keep user-facing requests responsive. |
| Durable Objects | Stateful real-time conversations | Introduce only where per-conversation coordination/state is actually required. |

## Performance pattern
- **Cache:** KV for safe, deterministic/repeatable responses where freshness permits.
- **Streaming:** stream AI output to the client for interactive chat where the provider/runtime supports it.
- **Async:** Queues for heavy AI/image/document pipelines.
- **Storage:** R2 for binaries; D1 for metadata/history.
- **Edge:** keep request routing and lightweight orchestration in Workers.

## Application mapping
Existing architecture remains:
`User → App/Web/Telegram → App API → Developer Gateway → Production Worker → Cloudflare backend`

Vehicle pipeline remains:
`Telegram → webhook → telegram_inbox → R2/MEDIA → Vehicle AI → vehicle_ai_drafts → validation → D1 cars/car_images → website`

Any new AI integration must preserve the existing production guard, credential boundary, and multi-AI continuity rules. Production mutations remain gated; never add an API key to the Android APK merely to call an AI provider.

## Decision rule
Before adding a binding/provider:
1. Verify current production code and existing bindings.
2. Identify the exact workload and failure mode.
3. Prefer the smallest architecture that solves it.
4. Add tests/observability and update the checkpoint.
5. Do not create duplicate services/repos when an existing component can safely own the responsibility.
