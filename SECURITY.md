# Security baseline

- Static assets are public by design.
- Secrets must be stored in Cloudflare Worker secrets, never in HTML/JS.
- D1 bindings are server-side only.
- CRUD/admin endpoints are intentionally not enabled in this starter package until authentication is configured.
- Use Cloudflare Turnstile + rate limiting for public lead forms before production.
