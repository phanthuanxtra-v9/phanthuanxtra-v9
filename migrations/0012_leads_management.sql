-- Add operational lead-management fields without changing existing lead data.
-- SQLite/D1 does not allow non-constant defaults in ALTER TABLE ADD COLUMN.
ALTER TABLE leads ADD COLUMN status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE leads ADD COLUMN note TEXT NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
UPDATE leads SET updated_at=created_at WHERE updated_at='';
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads(status, created_at DESC);
