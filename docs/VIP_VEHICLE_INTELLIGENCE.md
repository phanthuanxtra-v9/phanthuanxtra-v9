# VIP Vehicle Intelligence — AI handoff contract

## Purpose

`@phanthuanxtra_vip_bot` is a separate intelligence workflow. It accepts vehicle photos, registration/inspection documents, VIN/identifier images, and text, then produces a detailed vehicle report.

## Five-AI handoff

- **AI1 — Telegram:** receives and bundles media/text for the VIP bot.
- **AI2 — Vehicle Vision:** identifies make/model/visual form and visible modifications.
- **AI3 — Data/Media:** preserves originals and document evidence in R2/D1; never overwrites source evidence with branded media.
- **AI4 — External Intelligence:** calls the documented ask-ai-agent API when its request/response contract is available; secrets stay in Worker bindings.
- **AI5 — Cross Validation:** reconciles claims and produces the final report, including conflicts and `needs_review`.

## Identity vs current form

Never equate current styling with production identity. The normalized result separates:

- `vehicle_identity.production_year`: documentary/identifier evidence.
- `current_form`: `original | facelift | up_form | modified | uncertain`.
- `modifications`: observed or documented changes.
- `conflicts`: incompatible claims across sources.
- `needs_review`: explicit uncertainty gate.

A facelift/up-form vehicle must not be reported as a newer production year merely because its exterior resembles the newer model.

## External ask-ai-agent integration

The repository contains a safe adapter boundary in `src/vip-vehicle-intelligence.js`. It intentionally does **not** invent an undocumented endpoint, HTTP method, authentication scheme, or response schema for the external Worker URL. Before enabling live calls, document the external API contract and map its response into `normalizeVipSource()`.

Only non-secret vehicle/document data may be sent. Never send `TELEGRAM_BOT_TOKEN`, `ADMIN_TOKEN`, webhook secrets, Cloudflare API tokens, or other credentials to the external agent.

## Acceptance checklist

- [ ] VIP Telegram webhook is configured for `@phanthuanxtra_vip_bot` using its own secret/token binding.
- [ ] Photo/document/text intake is independently testable.
- [ ] Original media and evidence are preserved.
- [ ] External ask-ai-agent API contract is documented and integration tested.
- [ ] Original identity and current form are reported separately.
- [ ] Conflicts produce `needs_review` instead of silent selection.
- [ ] CI passes.
- [ ] Production deployment passes.
- [ ] Telegram E2E is verified with an actual test message.

## Current implementation checkpoint

Issue #31: VIP Vehicle Intelligence multi-AI document and image cross-validation.

The normalization/cross-validation core and regression tests are implemented on branch `ai1/vip-vehicle-intelligence`. Live Telegram wiring and external-agent calls remain gated on the documented API contract and production verification.
