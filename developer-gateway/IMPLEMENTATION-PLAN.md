# Implementation Plan

## Phase 1 — control plane foundation

- Gateway Worker scaffold
- API contracts
- Read-only authentication
- Explicit CORS allowlist
- Production deploy/rollback hard block
- No secret values in Git

## Phase 2 — integrations

- GitHub App with least privilege
- Remote Devbox identity and task queue
- Codex task execution adapter
- Cloudflare observability adapter

## Phase 3 — backup

- Export repository state
- Capture Worker/D1/R2/DNS metadata
- Export D1 data using authenticated tooling
- Inventory/export R2 objects where permitted
- Produce timestamped, integrity-checked archive
- Encrypt and store outside Git

## Phase 4 — controlled production

- Human approval gate
- Deploy to staging first
- Health checks
- Production deploy capability enabled only after approval
- Rollback capability enabled only after approval
