CREATE TABLE IF NOT EXISTS telegram_notification_cursor (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  last_audit_id INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO telegram_notification_cursor (id,last_audit_id) VALUES (1,0);
