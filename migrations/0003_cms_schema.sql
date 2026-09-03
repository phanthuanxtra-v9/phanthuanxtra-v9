-- Apply through the controlled D1 migration workflow only; never from a request handler.
-- Before applying to an existing environment, compare its schema: earlier application versions
-- may have added these columns at runtime, which requires an operator-reviewed migration plan.
ALTER TABLE cars ADD COLUMN featured INTEGER NOT NULL DEFAULT 0;
ALTER TABLE cars ADD COLUMN cover_image TEXT DEFAULT '';
ALTER TABLE leads ADD COLUMN status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE leads ADD COLUMN note TEXT DEFAULT '';
ALTER TABLE leads ADD COLUMN updated_at TEXT;
CREATE TABLE IF NOT EXISTS car_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  car_id TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_car_images_car_sort ON car_images(car_id, sort_order);
CREATE TABLE IF NOT EXISTS cms_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  summary TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_cms_audit_created ON cms_audit_log(created_at);
