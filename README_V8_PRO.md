# PHAN THUAN XTRA — V8 PRO

Cloudflare Workers + Static Assets + optional D1 data layer. The public website works immediately from `public/`. D1 is an upgrade path for persistent inventory and leads.

## Current handoff status — 2026-09-07

This section is the shared handoff note for anyone taking over work on the project.

### Local project
- Project root: `/mnt/sdcard/phanthuanxtra-v9`
- Git repository: **YES** (`.git/` exists)
- GitHub repository: `phanthuanxtra-v9/phanthuanxtra-v9`
- Default branch: `main`
- Current project structure includes `src/`, `public/`, `scripts/`, `migrations/`, `package.json`, `package-lock.json`, and `wrangler.json`.

### Git ownership issue on Android/SD card
The repository is currently blocked by Git's `safe.directory` ownership check when accessed from the local environment. The observed error is:

`fatal: detected dubious ownership in repository at '/mnt/sdcard/phanthuanxtra-v9'`

Before running normal Git commands locally, add the repository as a trusted safe directory:

```bash
git config --global --add safe.directory /mnt/sdcard/phanthuanxtra-v9
```

Then verify:

```bash
cd /mnt/sdcard/phanthuanxtra-v9
git status
git branch --show-current
git log -5 --oneline
```

This is a Git ownership/trust check, not evidence that the repository itself is corrupted.

### Important handoff rule
Use this file as the first handoff checkpoint. Before making changes, check `git status`, current branch, and recent commits. Do not assume the local SD-card checkout is synchronized with GitHub.

## Deploy
1. Install Node.js 20+.
2. `npm install`
3. `npx wrangler login`
4. `npm run dev`
5. Create D1: `npx wrangler d1 create phanthuanxtra`
6. Put the returned database_id into `wrangler.json`.
7. `npx wrangler d1 migrations apply phanthuanxtra --remote`
8. `npm run deploy`

The website is designed so D1 can be absent: `/api/cars` falls back to `public/data/cars.json`, and lead submission returns demo-mode status until D1 is connected.

## Existing inventory
The current V6 inventory is preserved in `public/data/cars.json`. Do not delete it. It is the fallback data source and can be migrated into D1 later.

## Production notes
- Never put Cloudflare API tokens, passwords, or database credentials in `public/`.
- Add admin authentication before exposing CRUD endpoints.
- Add Turnstile and rate limiting before production lead forms.
- Keep database backups/export before schema changes.
- Do not commit secrets, tokens, `.env` files, or credentials to GitHub.

## Handoff checklist

For the next person/agent:

1. Read this file first.
2. Check the GitHub `main` branch before changing files.
3. On the SD-card checkout, resolve the `safe.directory` warning if it appears.
4. Run `git status` and confirm the working tree state.
5. Inspect `package.json` and `wrangler.json` before deployment-related work.
6. Preserve `public/data/cars.json` unless there is an explicit migration plan.
7. Keep Cloudflare secrets out of the repository.
8. Record important deployment, migration, testing, or blocking-status changes back in this document so the next worker can continue without repeating discovery.
