# Security Checklist

## Implemented locally

- [x] Isolated, read-only gateway with deploy/rollback hard blocks.
- [x] Bearer-token authentication without hard-coded secrets and constant-time-style comparison.
- [x] Exact-origin CORS allowlist, `Vary: Origin`, no credentialed wildcard.
- [x] Streamed 64 KiB request-body cap; strict JSON/schema/mode validation.
- [x] No shell, arbitrary fetch, repository-file, or provider operation in the gateway.
- [x] Provider-independent rate-limit interface; missing provider fails task submission closed.
- [x] Local tests cover authentication, CORS, validation, and blocked mutations.

## Required for production

- [ ] Distributed rate limiting (for example Durable Object/KV/WAF design) and monitoring.
- [ ] GitHub/Devbox/observability identities with least privilege, after separate approval.
- [ ] Independent production test and backup/restore verification.
- [ ] Human approval and server-side capability design before any mutation feature.
