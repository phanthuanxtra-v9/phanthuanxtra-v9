# Full-System Backup

A production-safe backup must cover source, configuration, database, object storage metadata/content where permitted, deployment metadata and documentation.

## Backup scope

1. Git repository: all tracked source/configuration on the selected commit.
2. Cloudflare Worker configuration and deployment metadata.
3. D1 schema and migrations; production database export must be performed with authenticated Wrangler/Cloudflare access.
4. R2 object inventory and permitted object export.
5. DNS/route configuration metadata.
6. Gateway configuration and API contracts.
7. Secrets: record secret names only; NEVER export secret values into the backup or GitHub.

## Safety

- Backups must be timestamped.
- Verify archive integrity after creation.
- Store an offline/local encrypted copy before destructive changes.
- Do not place API tokens, private keys, passwords or secret values in this repository.
- A Git repository backup alone is NOT a full Cloudflare backup.

## Current phase

The gateway branch is not production and no production mutation is enabled. The actual Cloudflare/D1/R2 archive must be generated from an authenticated Cloudflare environment after the account credentials are connected.
