-- Telegram separate-message bundling for auto bot and AI-chat bot conversation bridge.
ALTER TABLE telegram_inbox ADD COLUMN media_group_id TEXT;
ALTER TABLE telegram_inbox ADD COLUMN bundle_key TEXT;
ALTER TABLE telegram_inbox ADD COLUMN bundle_status TEXT NOT NULL DEFAULT 'pending';
CREATE INDEX IF NOT EXISTS idx_telegram_inbox_bundle ON telegram_inbox(bundle_key);
CREATE INDEX IF NOT EXISTS idx_telegram_inbox_chat_created ON telegram_inbox(chat_id,created_at);
