# Production Guard

The gateway is an isolated, read-only acknowledgement service. It cannot deploy, roll back, execute commands, fetch user URLs, read/write repository files, mutate Cloudflare/D1/R2/DNS, retrieve secrets, or dispatch tasks. `/v1/production/deploy` and `/v1/production/rollback` always return `403`.

`POST /v1/codex/tasks` validates JSON (64 KiB maximum), accepts only `instruction` (maximum 12,000 characters) and optional mode `audit`, `test`, or `propose-fix`, then returns a non-executing acknowledgement.

Authenticated task submission fails closed with `503` unless a distributed rate-limit provider is attached. The in-memory test limiter is explicitly non-distributed and must never be represented as production protection. Future mutation capability requires a separate human approval workflow and server-side capability, neither of which exists here.
