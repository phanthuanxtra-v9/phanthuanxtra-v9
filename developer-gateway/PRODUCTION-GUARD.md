# Production Guard

Phase 1 policy for `phanthuanxtra-developer-gateway`.

## Allowed

- Health checks
- GitHub repository/branch/CI status
- Devbox connectivity status
- Cloudflare observability summaries
- Codex task requests in audit/test/propose-fix modes

## Explicitly blocked

- Production deploy
- Production rollback
- Deleting Workers, D1 databases, R2 buckets or DNS records
- Database writes through the gateway
- Secret retrieval
- Arbitrary command execution from APK input

## Approval gate

Any future production mutation must require an explicit human approval step and a server-side capability flag. Never treat an APK request alone as approval.

## Secret handling

Provider tokens and credentials must be stored outside Git and outside the APK. Logs returned to clients must be redacted.
