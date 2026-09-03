# Security Checklist

- [x] Gateway isolated from production Worker.
- [x] Read-only production posture.
- [x] Deploy endpoint blocked.
- [x] Rollback endpoint blocked.
- [x] No provider secrets in source.
- [x] Authentication required for protected endpoints.
- [x] CORS uses an explicit allowlist.
- [x] Codex task input length-limited.
- [ ] GitHub App installed with least privilege.
- [ ] Remote Devbox authenticated and connected.
- [ ] Cloudflare observability credentials connected.
- [ ] Automated tests executed in Devbox.
- [ ] Full Cloudflare/D1/R2 backup verified.
- [ ] Human approval gate implemented before production mutations.
