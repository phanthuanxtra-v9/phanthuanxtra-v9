CREATE TABLE IF NOT EXISTS telegram_inbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_hash TEXT NOT NULL UNIQUE,
  chat_id TEXT NOT NULL,
  message_id INTEGER NOT NULL,
  file_id TEXT NOT NULL,
  file_unique_id TEXT,
  file_path TEXT,
  caption TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  car_id TEXT,
  processed_image_url TEXT,
  error TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_telegram_inbox_status ON telegram_inbox(status);
CREATE INDEX IF NOT EXISTS idx_telegram_inbox_car_id ON telegram_inbox(car_id);
