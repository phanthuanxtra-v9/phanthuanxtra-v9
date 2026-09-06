# VIP Vehicle Intelligence

## Purpose
`@phanthuanxtra_vip_bot` is a separate intelligence workflow. It does not publish cars to the website automatically.

Inputs: vehicle photos, registration documents, inspection documents, VIN/chassis/engine identifiers and text.

## Non-negotiable identity rule
**Current visual form is not the same thing as original vehicle identity.**

A vehicle can be an original 2021 vehicle that has been facelifted, up-formed, or modified to resemble a later model. Documentary/VIN evidence is used for production identity; images describe the current form.

Possible form states: `original`, `facelift`, `up_form`, `modified`, `uncertain`.

## Current implementation
- deterministic source normalization and cross-validation in `src/vip-vehicle-intelligence.js`
- D1 session/source storage in migration `0011_vip_vehicle_intelligence.sql`
- Telegram VIP intake route: `/api/telegram/vip-webhook`
- authenticated webhook setup route: `/api/admin/telegram/vip-webhook`
- photo analysis uses the existing vehicle-image AI pipeline and stores source evidence in R2 when `MEDIA` is available
- no website auto-publish from the VIP workflow

## External ask-ai-agent
The external Worker URL is intentionally not called with an invented API contract. `buildAskAiAgentRequest()` defines the normalized request boundary. Live calls must be enabled only after the external Worker exposes a documented endpoint/authentication contract. Never put bot tokens or document secrets into the request body or logs.

## Required production bindings/secrets
- `TELEGRAM_VIP_BOT_TOKEN`
- `TELEGRAM_VIP_WEBHOOK_SECRET` (recommended)
- existing `ADMIN_TOKEN`
- existing `DB` and `MEDIA`

## Five-AI handoff
- AI1: Telegram VIP intake + adapter boundary
- AI2: regression tests and production gates
- AI3: D1/R2 source persistence and document/media handling
- AI4: Cloudflare bindings, secrets and deployment verification
- AI5: end-to-end Telegram verification and final integration review

Completion standard remains: CODE -> TEST -> CI PASS -> REVIEW -> MERGE -> PRODUCTION DEPLOY -> PRODUCTION EVIDENCE -> DOCUMENTED STATE.
