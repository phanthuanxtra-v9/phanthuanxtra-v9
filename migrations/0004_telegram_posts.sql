-- Telegram auto-post state and canonical vehicle image records.
-- Safe to apply through the controlled D1 migration workflow.
CREATE TABLE IF NOT EXISTS car_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  car_id TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_car_images_car_id ON car_images(car_id);

CREATE TABLE IF NOT EXISTS telegram_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  car_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  telegram_message_ids TEXT DEFAULT '[]',
  last_error TEXT,
  published_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_telegram_posts_status ON telegram_posts(status);
