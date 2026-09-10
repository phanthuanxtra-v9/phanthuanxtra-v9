# PHAN THUẦN XTRA — AI HANDOFF CHECKPOINT

> Canonical handoff for AI1–AI5, Workers AI, Cloudflare Dashboard Ask AI and other coding agents.

## CURRENT VERIFIED STATE — 2026-09-10
- Repository: `phanthuanxtra-v9/phanthuanxtra-v9`
- Branch: `main`
- Production Worker: `phanthuanxtra-v2`
- Production domain: `https://phanthuanxtra.com/`
- PR #70: MERGED.
- PR #70 merge commit: `92adf1495459e28b918d77c61700a1de7c2a7113`.
- Post-merge GitHub Actions: CI/Validate SUCCESS; Deploy production Worker SUCCESS.
- Latest verified Cloudflare Version ID from the immediately preceding production deployment: `95f7d512-4f27-4336-a4a2-570583e195cf`.
- Admin vehicle CRUD is connected to the shared vehicle/AI/PT Xtra branding path; do not create a second plate-branding pipeline.

## PRODUCTION VERIFICATION STATUS
- Production deploy is verified through GitHub Actions.
- Direct HTTP smoke test from the current execution environment is **NOT AVAILABLE** because DNS resolution for `phanthuanxtra.com` fails in this environment (`curl: Could not resolve host`).
- Therefore `/admin`, `/admin.html`, and `/api/admin/dashboard` are **NOT currently verified from this environment** after the PR #70 deployment.
- Historical evidence recorded HTTP 403 on public `/admin`; this remains an unresolved production verification item until a direct reachable test confirms the current state.
- Do not claim Admin production GREEN until a reachable external HTTP test confirms `/admin` and the relevant Admin API paths.

## AI COORDINATION HARD GATE
Every AI participant must read, in order, before analysis or implementation:
1. `AI-WORK-REGISTRY.md`
2. `AI_AGENT_PROTOCOL.md`
3. `AI-HANDOFF-CHECKPOINT.md`
4. `MASTER_CONTEXT_PHAN_THUAN.md`
5. Relevant current PR/main source and workflows.

This applies to AI1–AI5, Cloudflare Workers AI model invocations, Cloudflare Dashboard Ask AI at `dash.cloudflare.com`, and other coding agents. If current coordination context cannot be supplied/read, the AI is advisory only and must not create a competing implementation path.

## ONE-TASK / ONE-OWNER / ONE-RELEASE-GATE
- Search current open PRs before starting work.
- Continue an existing owner/path instead of creating a duplicate.
- Do not create duplicate Workers, routes, workflows, migrations or AI pipelines without direct evidence that the existing resource cannot satisfy the requirement.
- Historical Markdown is evidence only; never execute an old `NEXT ACTION` automatically.

## ADMIN — THREE UPLOAD PATHS, ONE AI BRANDING PIPELINE
All three vehicle-upload paths must converge on the same trusted processing path:
- Android APK → shared Vehicle/Plate AI → PT Xtra branded publish artifact → publish.
- Telegram Auto Bot → shared Vehicle/Plate AI → PT Xtra branded publish artifact → publish.
- Admin CMS → shared Vehicle/Plate AI → PT Xtra branded publish artifact → publish.

For an image where a plate is visible and confidently detected, the publish artifact must replace the visible plate with `PT Xtra` / `PT XTRA` according to the current branding implementation. The original must not be used as the public artifact. If required branding evidence is missing for a case that requires branding, publishing must be blocked. Images with no visible plate (for example interior shots) must not be incorrectly blocked solely because no plate exists.

Do not create a second Admin-specific masking AI. Reuse the existing Vehicle AI and PT Xtra image-branding implementation.

## TELEGRAM
- Auto Bot route: `/api/telegram/webhook`.
- VIP Bot route: `/api/telegram/vip-webhook`.
- Do not recreate stale `/api/telegram/auto-webhook`.
- Auto publish target flow: Telegram → inbox/R2 → Vehicle AI → validation → D1/R2 → website → notification.

## WEBSITE / CONTENT
- Vehicle posts must use their dedicated vehicle page/route.
- Other project content areas must retain their dedicated routes/pages; do not duplicate existing page implementations.

## APK — CURRENT PROJECT PROGRESS
### Latest recorded verified APK milestone
- Application ID: `com.phanthuanxtra.app`
- APK version: `1.1.0`
- `versionCode`: `2`
- `minSdk`: `26`
- `targetSdk`: `35`
- INTERNET permission: enabled.
- Android App API base: `https://phanthuanxtra.com/api/app/v1`
- Latest recorded APK source commit: `d3859fc06b5a5c69218883699b4c994558567e02`.
- Latest recorded Android workflow run: `34090103902` (run number `14`).
- Recorded build result: **SUCCESS**.
- Recorded artifact: `phanthuanxtra-apk-debug`.
- Recorded artifact ID: `10006523773`.
- Recorded artifact digest: `sha256:60193bf938a38800e0d5d16be5e51e9be72291cd602cafcd88986220535ca76a`.
- Real-device gate: **S21 Ultra installation + production test USER-CONFIRMED PASS**.

### APK capabilities recorded as implemented
- Save APP API token locally.
- Connection/health check.
- Dashboard.
- Vehicle inventory (`KHO XE`).
- Leads/customer list (`KHÁCH HÀNG / LEADS`).
- Add vehicle using photo picker + Vehicle AI.
- Upload vehicle image to production media storage.
- Create vehicle record in production D1 through App API.
- Open `phanthuanxtra.com` directly.

### APK architecture / release rules
- APK must consume the same production API/AI contract as Admin and Telegram flows.
- Plate detection/branding logic must remain in the shared vehicle pipeline; do not fork a second APK-specific masking AI.
- Production APK releases remain subject to GitHub Actions validation/build gates.
- A successful CI build alone does **not** equal real-device acceptance; S21 Ultra installation and production exercise must be verified separately.
- Current APK milestone is an operational MVP/management foundation, not the final management feature set.

### APK next-stage hardening
- Vehicle detail/edit form.
- Create/update/delete vehicle workflow.
- Status changes: available / reserved / sold.
- Delete with explicit confirmation.
- Featured toggle.
- Image gallery management.
- Lead status and note editing.
- Search/filter.
- Retry/offline/error UX.
- Token validation and clearer authentication failure messages.
- Production-safe validation before destructive operations.
- End-to-end verification against the current production Worker after each material API/pipeline change.

### APK verification boundary
- The repository records the latest APK build and the user-confirmed S21 Ultra production test above.
- This checkpoint does **not** claim a new APK build/deployment on 2026-09-10 unless a new GitHub Actions run is independently verified.
- Any AI continuing APK work must first inspect current `main`, relevant Android source/workflows and open PR ownership before changing code.

## CLOUDFARE RESOURCES — SINGLE INSTANCE
Verified resource names:
- Worker: `phanthuanxtra-v2`
- D1: `phanthuanxtra-db`
- R2: `phanthuanxtra-media`
- Workers AI binding: `AI`
- Images: `IMAGES`
- AI Search: `AI_SEARCH`
- Assets: `ASSETS`
- Worker cron: `*/5 * * * *`

## OPEN / NEXT WORK — DO NOT DUPLICATE
1. **Production Admin verification:** obtain a reachable external HTTP test for `/admin`, `/admin.html`, `/api/admin/dashboard`, and Admin upload flow. If 403 persists, investigate Cloudflare custom-domain/edge/Access/WAF/route behavior before changing Worker route code again.
2. **Admin hardening:** continue existing PR/main path; no second CMS implementation.
3. **PT Xtra plate + AI sales copy:** continue existing implementation path; no second branding/copy pipeline.
4. **Dedicated pages:** continue existing PR #55 path.
5. **VIP document ingestion:** continue existing PR #66 path; PR #37 is superseded.
6. **Production runtime health:** continue PR #49 path.
7. **APK:** continue mobile management hardening on the existing APK/App API path; preserve the verified S21 Ultra gate and shared production API/AI contract.
8. **Backup:** verify real backup + restore/readability; do not create another backup workflow.

## SECURITY
Never place actual ADMIN_TOKEN, Cloudflare API tokens, GitHub PATs, Telegram bot tokens, OpenAI keys or other secrets in Markdown. Store secrets in the appropriate secret manager and record only variable names/purpose.

## LAST HANDOFF
- `LAST_UPDATE_UTC`: 2026-09-10
- `LAST_AI`: ChatGPT
- `LAST_COMMIT`: documentation update following `92adf1495459e28b918d77c61700a1de7c2a7113`
- `COMPLETED`: PR #70 merged; Admin CRUD connected to shared AI/PT Xtra pipeline; production deployment verified through GitHub Actions; APK progress and latest recorded S21 Ultra gate documented in this checkpoint.
- `VERIFIED`: CI/Validate SUCCESS; production Worker deployment SUCCESS; current Cloudflare version evidence `95f7d512-4f27-4336-a4a2-570583e195cf`; latest recorded APK build SUCCESS and S21 Ultra production test USER-CONFIRMED PASS.
- `BLOCKERS`: Current execution environment cannot resolve `phanthuanxtra.com`, so direct HTTP production verification cannot be completed here. Historical `/admin` 403 remains unresolved until externally reachable smoke test.
- `NEXT_ACTION`: Continue existing APK management-hardening path in parallel with production Admin verification and existing PR workstreams. Do not create a duplicate APK/API/AI pipeline.
