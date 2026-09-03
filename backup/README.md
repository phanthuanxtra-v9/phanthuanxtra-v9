# Full-System Backup

A repository snapshot is not a verified production backup.

## Required archive scope

- Selected Git commit, Worker source, Wrangler configuration, migrations, API contracts and documentation.
- Worker deployment/version metadata and routes.
- D1 schema and separately authenticated D1 data export.
- R2 inventory and permitted object content export.
- DNS and route metadata.
- Secret names only—never secret values, tokens, passwords or private keys.

## Required procedure

Create a timestamped archive outside Git, record cryptographic hashes, encrypt it, retain an offline/local copy, and document restore verification against a non-production target. Record operator, source commit, tool versions, scope exclusions, hash and restore result.

Cloudflare exports and restoration require separately approved authenticated access. This repository makes no claim those steps occurred.
