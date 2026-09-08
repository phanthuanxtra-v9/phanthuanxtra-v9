# PHAN THUẦN XTRA — APP API / APK 1.2.0 AUDIT CHECKPOINT

Date: 2026-09-08 (UTC+7)
Branch: `main`

## Verified findings

1. APK 1.2.0 source is versionCode 3 / versionName 1.2.0.
2. APK workflow run #97 / ID `34203790849` completed **SUCCESS**.
3. Production App API health smoke test completed **SUCCESS** in the APK workflow.
4. Gradle assembleDebug, APK output verification and artifact upload completed **SUCCESS**.
5. APK artifact ID `10046897695` is available; GitHub artifact digest is `sha256:16d4cbc3cc6b89d5d6dfb04fa6eb77f7205b56a2a795207eb781b9c8847c624c`.
6. Downloaded APK payload was independently verified as a valid ZIP entry and SHA-256 `3fcfcf4a85ae72dc761cded5ed56834ff06687950cf08edac7d233dfa3f6cd01`.

## Real source defect found and fixed

The APK already exposes Dashboard and Leads, but current `src/app-api.js` did not route `/api/app/v1/leads`. Its Dashboard query also referenced `leads.status`, while migration `0001_init.sql` defines `leads` without a `status` column.

Evidence:
- `migrations/0001_init.sql` defines `leads(id,name,phone,car_id,message,created_at)`.
- `src/app-api.js` queried `leads WHERE status='new'` and returned 404 for `/leads`.

Minimal fix:
- Added `src/app-admin.js` for schema-safe authenticated Dashboard and Leads endpoints.
- Updated `src/entry.js` to dispatch that handler before `handleAppApi`.
- Leads now supports GET/search over fields that actually exist in D1.
- Dashboard now reports cars/leads/sold/reserved and explicitly marks lead-status support as unavailable rather than inventing a status model.
- No D1 schema mutation was introduced.

Commits:
- `ca8396b5accc9f11d8b9a75d21124e82e577e6c5`
- `67f742b4b30adffebd57b33370c10376c6a33a4a`

## CI hardening

`deploy-cloudflare.yml` was updated to syntax-check both `src/app-api.js` and the new `src/app-admin.js` before deployment.

Commit:
`a4f9a25e068a06f9dfa9ccb1f7c61c42f5fd861c`

Application validation for this commit:
- JavaScript syntax/tests: **SUCCESS**
- Wrangler dry-run: **SUCCESS**

## Production deployment blocker — direct evidence

Deploy workflow run #187 / ID `34203790812`:
- CI / Validate: **SUCCESS**
- Wrangler dry-run: **SUCCESS**
- D1 migrations: **FAILURE**
- Cloudflare Worker deploy: **SKIPPED**

Exact failure category from the workflow log:
- Cloudflare D1 API authentication error, code `10000`.
- Follow-up account authentication failure, code `9109`.

Therefore:
**The new App API fix has NOT been deployed to production yet.**

Do NOT change the code to work around this. Do NOT create a new D1. The blocker is the existing GitHub Actions Cloudflare credential/permission state and must be repaired through the authorized secret/Cloudflare account configuration path.

## Current APK status

APK 1.2.0 is **BUILD-VERIFIED** and the production App API health gate is **PASS**.

The APK should not yet be called fully production-complete because the corresponding Worker App API fix is not deployed due to the Cloudflare D1 authentication blocker. The user's master checkpoint separately records that the physical S21 Ultra production test has already passed.

## Telegram status

Auto/VIP source and diagnostic routing have been audited. No new Telegram runtime health claim is made because the current GitHub connector does not expose workflow dispatch. No webhook or Telegram secret was changed.

## Next mandatory action

1. Repair/verify the existing Cloudflare API token permissions used by GitHub Actions; never expose the token value.
2. Rerun the production workflow and require D1 migration + Worker deploy success.
3. Verify `/api/app/v1/health`, `/dashboard`, and `/leads` against production after deployment.
4. Verify APK 1.2.0 against the deployed API.
5. Continue Auto Bot/VIP Bot E2E only after the production API gate is green.

## Safety

No new Worker, D1, R2, binding, route, cron, Telegram webhook, or secret was invented or created.
