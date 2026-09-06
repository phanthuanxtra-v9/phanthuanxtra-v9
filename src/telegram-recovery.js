// Reserved module for authenticated Telegram inbox recovery.
// Functional recovery logic is kept in src/telegram-ingest.js so the webhook
// and recovery path share the same processing and publication gates.
export const TELEGRAM_RECOVERY_VERSION = "1.0";
