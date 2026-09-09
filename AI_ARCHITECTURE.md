# PHAN THUẦN XTRA — AI Architecture Reference

Compact reference for AI integration decisions. Supplements, and does not override, authoritative project/security/handoff documents.

## AI provider policy
- **Workers AI:** preferred for workloads that fit Cloudflare-hosted models; keeps execution at the edge and avoids an external provider key.
- **OpenAI API:** use when required capabilities exceed Workers AI. The OpenAI key MUST stay in Cloudflare Worker Secrets/Secrets Store and MUST never be embedded in APK, WebView, source, logs, or client payloads.
- Select the provider per workload using verified capability, latency, current quota/cost, privacy, and operational requirements. Never assume current quota/pricing.

## Bindings
| Binding | Use | Rule |
|---|---|---|
| KV | Short-lived cache/config/session data | TTL cacheable data; never secrets. |
| D1 | Cars, chat/history, metadata, audit records | Authoritative structured state server-side. |
| R2 | Vehicle images, uploads, documents | Binary storage; metadata belongs in D1. |
| Queues | Heavy/async AI processing | Background jobs, retries, responsive requests. |
| Durable Objects | Stateful real-time conversations | Add only when conversation-level coordination is actually required. |

## Performance
- Cache safe repeatable AI responses in KV when freshness permits.
- Stream interactive AI output where the runtime/provider supports it.
- Use Queues for heavy AI/image/document work.
- Use R2 for binary objects and D1 for metadata/history.
- Keep routing and lightweight orchestration at Workers edge.

## Existing XTRA mapping
`User → App/Web/Telegram → App API → Developer Gateway → Production Worker → Cloudflare backend`

Vehicle pipeline:
`Telegram → webhook → telegram_inbox → R2/MEDIA → Vehicle AI → vehicle_ai_drafts → validation → D1 cars/car_images → website`

New AI integrations MUST preserve production guard, credential boundary, and multi-AI continuity. Production mutations remain gated. Do not put provider API keys in the Android APK.

## Change rule
Verify current code/bindings first; identify workload and failure mode; make the smallest safe change; test and record evidence; avoid duplicate services/repos when an existing component can own the responsibility.
