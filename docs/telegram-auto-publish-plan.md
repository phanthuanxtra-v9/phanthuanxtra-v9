# Telegram Auto-Publish Plan

`@phanthuanxtra_auto_bot` is the primary vehicle intake channel.

Flow:

Telegram photo + caption -> webhook -> D1 inbox -> R2 media -> vehicle AI -> D1 draft -> publish gate -> cars/car_images -> website.

The bot does not need users to re-upload data when the Telegram update has already reached `telegram_inbox`. Existing pending photo inbox records can be reprocessed through the authenticated admin recovery endpoint.

Safety gates:
- real brand + model required
- AI confidence >= 0.85 for automatic publication
- deterministic car id `tg-<inboxId>`
- `telegram_posts.car_id` prevents duplicate publication
- original R2 media remains unchanged
- publication uses the PT Xtra branded media URL

Telegram Bot API does not provide arbitrary historical chat retrieval, so messages that never reached the webhook cannot be reconstructed from Telegram by the Worker.
