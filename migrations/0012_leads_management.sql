-- Add operational lead-management fields without changing existing lead data.
ALTER TABLE leads ADD COLUMN status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE leads ADD COLUMN note TEXT NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads(status, created_at DESC);
