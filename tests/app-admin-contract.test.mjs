import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/app-admin.js',import.meta.url),'utf8');
const migration=fs.readFileSync(new URL('../migrations/0012_leads_management.sql',import.meta.url),'utf8');

test('app admin exposes authenticated lead CRUD contract',()=>{
  assert.match(source,/APP_API_TOKEN/);
  assert.match(source,/GET/);
  assert.match(source,/PUT/);
  assert.match(source,/DELETE/);
  assert.match(source,/status/);
  assert.match(source,/note/);
  assert.match(source,/updated_at/);
  assert.match(source,/Không tìm thấy lead/);
});

test('lead management migration adds operational fields without dropping data',()=>{
  assert.match(migration,/ALTER TABLE leads ADD COLUMN status/);
  assert.match(migration,/ALTER TABLE leads ADD COLUMN note/);
  assert.match(migration,/ALTER TABLE leads ADD COLUMN updated_at/);
  assert.doesNotMatch(migration,/DROP TABLE|DROP COLUMN/);
});
