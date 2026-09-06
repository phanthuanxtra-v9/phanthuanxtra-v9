CREATE TABLE IF NOT EXISTS vehicle_ai_drafts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inbox_id INTEGER NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  car_id TEXT,
  ai_json TEXT NOT NULL DEFAULT '{}',
  confidence REAL,
  missing_fields_json TEXT NOT NULL DEFAULT '[]',
  source_caption TEXT,
  source_file_path TEXT,
  error TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_vehicle_ai_drafts_status ON vehicle_ai_drafts(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_ai_drafts_car_id ON vehicle_ai_drafts(car_id);
