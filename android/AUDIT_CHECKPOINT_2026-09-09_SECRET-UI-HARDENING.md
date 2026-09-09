# PHAN THUẦN XTRA — SECRET UI HARDENING CHECKPOINT

Date: 2026-09-09
Branch: `refactor/apk-architecture-v1`
Task: `TASK-SEC-UI-002`

## Verified findings

During continuation audit of PR #51, two credential-display risks were found:

1. `OperatorHubActivity` loaded decrypted Cloudflare/GitHub tokens directly into visible password fields on launch.
2. `MainActivity` loaded the decrypted APP API token directly into its visible password field on launch.

Although the fields used password input, this still exposed the stored secret value to the active UI and made screenshots/screen sharing unnecessarily risky.

## Corrective changes

- `OperatorHubActivity.java` no longer places stored provider token values into UI fields.
- Stored provider credentials are represented only by a non-secret `ĐÃ LƯU` hint.
- Saving a blank provider field preserves the existing encrypted credential instead of clearing it.
- After save, fields are cleared and the UI remains non-secret.
- Explicit per-provider delete buttons remain available.
- `MainActivity.java` no longer places the stored APP API token into the UI field on launch.
- A saved-token hint is shown without revealing the secret.
- Saving a blank APP API field preserves the existing credential.
- Explicit `XÓA TOKEN` remains the only clear action.
- Existing `AuthStore` / `SecureTokenStore` Android Keystore + AES/GCM storage remains unchanged.
- Provider credentials remain prohibited from WebView/chat injection.

## CI state

The latest hardening commits are:

- `c9192392a9523d9198c96f7e8c39ac43843e96e8` — Cloudflare production gate + scoped credential handling.
- `d4ff54072c5dcbe5aed50bf03da4eb91da375024` — Operator Hub secret UI hardening.
- `0552892d05fe876f85538c6650ff8a9bd3e577c7` — MainActivity secret UI hardening.

At checkpoint creation, GitHub's commit-run query had not yet returned new PR workflow runs for `0552892d...`; therefore no new CI pass is claimed for this head.

## Cloudflare production gate decision

`deploy-cloudflare.yml` was corrected so production mutation occurs only on a verified push to `main`. `workflow_dispatch` is validation-only and cannot bypass the production gate.

Cloudflare credentials are now selected and scoped inside the relevant shell step rather than persisted through `$GITHUB_ENV`. The selected primary/backup token is not written to repository files or checkpoints.

## Next action

1. Re-check GitHub Actions for the latest branch head.
2. Inspect Android build/application validation and Cloudflare validation results.
3. If CI is green, continue API-contract regression audit, especially the image-upload → vehicle-create failure path and PUT field preservation.
4. Physical S21 Ultra regression remains required before declaring runtime readiness.
5. PR #51 remains OPEN/DRAFT/NOT MERGED; do not merge without explicit human authorization.

## Handoff rule

Do not repeat the credential-display audit unless new code reintroduces secret values into UI, WebView, logs, source, artifacts or checkpoints.