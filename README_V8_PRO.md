# PHAN THUAN XTRA — V8 PRO

Cloudflare Workers + Static Assets + optional D1 data layer. The public website works immediately from `public/`. D1 is an upgrade path for persistent inventory and leads.

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
