# Developer Gateway

Developer Control Plane for phanthuanxtra.com.

## Architecture

S21 Ultra / Developer APK -> Developer Gateway -> Codex/Remote Devbox, GitHub, Cloudflare Observability.

Production Worker, D1 and R2 remain isolated. This branch does not enable automatic production deploys.

## Security baseline

- Gateway is read-only by default.
- No Cloudflare, GitHub, OpenAI, or production secrets are stored in source code.
- `deploy` and `rollback` are reserved capabilities and MUST remain disabled until an explicit approval workflow exists.
- Gateway must authenticate every request and enforce a deny-by-default route policy.
- Never expose raw provider tokens, secrets, D1 credentials, or internal logs containing secrets to the APK.
- Prefer short-lived credentials and provider-side scoped permissions.

## Planned integrations

1. GitHub App: repository metadata, branches, PRs and CI status with least privilege.
2. Remote Devbox/Codex: task dispatch through an authenticated internal interface.
3. Cloudflare Observability: Worker status/log summaries without exposing secrets.
4. Production deployment: disabled in phase 1.

## API

See `developer-gateway/api-contract.json`.
