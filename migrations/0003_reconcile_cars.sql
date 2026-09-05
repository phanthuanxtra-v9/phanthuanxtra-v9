-- Reconcile legacy production cars schema with the canonical CMS schema.
-- Production cars is currently empty. Preserve the legacy table for rollback/audit.
-- Apply only through the controlled D1 migration workflow.

ALTER TABLE cars RENAME TO cars_legacy_pre_canonical;

CREATE TABLE cars (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  mileage INTEGER DEFAULT 0,
  price INTEGER DEFAULT 0,
  fuel TEXT,
  category TEXT,
  color TEXT,
  status TEXT DEFAULT 'available',
  description TEXT,
  images_json TEXT DEFAULT '[]',
  features_json TEXT DEFAULT '[]',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  featured INTEGER NOT NULL DEFAULT 0,
  cover_image TEXT DEFAULT ''
);

CREATE INDEX idx_cars_brand ON cars(brand);
CREATE INDEX idx_cars_status ON cars(status);
