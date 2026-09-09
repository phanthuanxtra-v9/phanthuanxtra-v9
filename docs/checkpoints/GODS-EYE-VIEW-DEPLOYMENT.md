# PHAN THUẦN XTRA — God's Eye View deployment checkpoint

**Checkpoint date:** 2026-09-09
**Branch:** `feat/gods-eye-view-dedicated-worker`
**Target:** `https://eye.phanthuanxtra.com/`
**Upstream:** `bilawalsidhu/gods-eye-view`
**Pinned upstream release:** `v0.1.1`
**Pinned upstream commit:** `65bc522f49dc1166eca533996be8e789ad36cfe5`

## Current verified state

- Repository: `phanthuanxtra-v9/phanthuanxtra-v9`
- Main production Worker remains `phanthuanxtra-v2` and is not modified by this deployment configuration.
- Existing production Wrangler config remains `wrangler.json` at repository root.
- Existing production deployment workflow remains `.github/workflows/deploy-cloudflare.yml`.
- GitHub Actions Cloudflare secrets are present in the repository: `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`.
- A separate Wrangler configuration was added at `apps/gods-eye-view/wrangler.jsonc`.
- The dedicated Worker name is `phanthuanxtra-gods-eye-view`.
- The dedicated hostname is configured as a Cloudflare Custom Domain: `eye.phanthuanxtra.com`.
- The deployment workflow fetches the upstream source at an immutable commit, installs its locked dependencies, builds with Vite, performs a Wrangler dry-run, deploys, and then performs an HTTP production smoke test.

## Important architecture decision

God's Eye View is deployed as an isolated static-assets Worker. Its upstream application is built during GitHub Actions rather than copied into the production application source tree. This keeps the main Worker isolated and makes the upstream commit explicit and auditable.

## Verification still required

This checkpoint intentionally does **not** claim production deployment success yet. The branch must pass GitHub Actions and the resulting Worker must be verified at `https://eye.phanthuanxtra.com/` before the change is merged to `main`.

## Handoff

1. Review the branch and PR.
2. Run the dedicated GitHub Actions workflow after merge (or via the configured push trigger).
3. Verify the Worker deployment and Custom Domain.
4. Verify the endpoint returns the built God's Eye View application.
5. Record the successful workflow run, deployed commit, and endpoint verification in this checkpoint.

## Security / credential rule

Cloudflare credentials are GitHub Actions secrets only. Never paste `CLOUDFLARE_API_TOKEN` into chat, source files, workflow YAML, or logs.
