# Telegram Auto/VIP Token Separation Audit — 2026-09-08

## Scope
Audit only. No secret values were accessed, exposed, changed, or replaced.

## Verified GitHub source state

Repository search found no literal values for:
- TELEGRAM_BOT_TOKEN
- TELEGRAM_AUTO_BOT_TOKEN
- TELEGRAM_VIP_BOT_TOKEN
- TELEGRAM_CHAT_BOT_TOKEN

This is expected: secret values must not be committed to source.

## Runtime diagnostic evidence

Telegram Bots Diagnostic run #5 succeeded on `main`.

The workflow confirmed both Auto and VIP credential inputs were available to the diagnostic job. Telegram API returned `ok: true` for both credentials.

The diagnostic deliberately masks identity fields in its output (`id`, `username`, etc. appear as null), so this run proves token acceptance but does NOT prove which Telegram username each token belongs to.

`getWebhookInfo` showed:
- Auto: webhook not configured; expected `/api/telegram/webhook`
- VIP: webhook not configured; expected `/api/telegram/vip-webhook`
- Both: pending updates 0
- Both: no recent Telegram webhook error

## Separation conclusion

There is no evidence in GitHub source of token duplication. However, GitHub Secrets values are not readable through the available GitHub connector, and the diagnostic masks Telegram identity. Therefore it is NOT possible to prove from current evidence that `TELEGRAM_AUTO_BOT_TOKEN` differs from `TELEGRAM_BOT_TOKEN`, nor that it maps specifically to `@phanthuanxtra_auto_bot`.

Likewise, the available evidence establishes that the VIP credential is accepted by Telegram, but does not expose its username.

## Required safe verification

The next diagnostic should compare only non-secret Telegram identity fingerprints, e.g. bot username and numeric bot ID, returned by `getMe`, while never printing the token itself. The expected identities are:

- Auto token → `@phanthuanxtra_auto_bot`
- VIP token → `@phanthuanxtra_vip_bot`

If `TELEGRAM_BOT_TOKEN` is also retained as a legacy/production Auto credential, it should be checked separately. Do not replace or delete it until the live webhook and production path have been migrated and verified.

## Production mutation status

No Telegram `setWebhook` call was made during this audit. No Cloudflare secret was changed. No Worker/D1/R2 resource was created or modified.

## Handoff

This file intentionally records the evidence boundary so a later AI can continue without assuming that token names imply bot identity.