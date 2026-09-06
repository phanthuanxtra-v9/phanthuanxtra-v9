CREATE TABLE IF NOT EXISTS vip_vehicle_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'collecting',
  source_count INTEGER NOT NULL DEFAULT 0,
  report_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_vip_vehicle_sessions_chat ON vip_vehicle_sessions(chat_id, updated_at);

CREATE TABLE IF NOT EXISTS vip_vehicle_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  source_type TEXT NOT NULL,
  telegram_file_id TEXT,
  text_content TEXT,
  source_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(session_id) REFERENCES vip_vehicle_sessions(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_vip_vehicle_sources_session ON vip_vehicle_sources(session_id, id);
