import test from 'node:test';
import assert from 'node:assert/strict';
import gateway from '../developer-gateway/src/index.js';

const env = { GATEWAY_READ_TOKEN: 'local-test-token', GATEWAY_ALLOWED_ORIGINS: 'https://app.example.test', GATEWAY_ALLOW_LOCAL_RATE_LIMITER: 'true' };
let requestNumber = 0;
const call = async (path, init = {}, overrides = {}) => {
  requestNumber += 1;
  const headers = new Headers(init.headers || {});
  headers.set('CF-Connecting-IP', `198.51.100.${requestNumber}`);
  return gateway.fetch(new Request(`https://gateway.example.test${path}`, { ...init, headers }), { ...env, ...overrides });
};
const auth = { Authorization: 'Bearer local-test-token' };

test('gateway rejects unauthorized requests without echoing credentials', async () => {
  const response = await call('/v1/project/status');
  assert.equal(response.status, 401); assert.deepEqual(await response.json(), { ok: false, error: 'unauthorized' });
});
test('gateway accepts authorized read-only status', async () => {
  const response = await call('/v1/project/status', { headers: auth });
  assert.equal(response.status, 200); assert.equal((await response.json()).production_mutations, false);
});
test('task validation rejects invalid JSON, missing/empty instruction, invalid mode, and content type', async () => {
  for (const init of [
    { body: '{', headers: { ...auth, 'Content-Type': 'application/json' } },
    { body: '{}', headers: { ...auth, 'Content-Type': 'application/json' } },
    { body: JSON.stringify({ instruction: '  ' }), headers: { ...auth, 'Content-Type': 'application/json' } },
    { body: JSON.stringify({ instruction: 'x', mode: 'deploy' }), headers: { ...auth, 'Content-Type': 'application/json' } },
    { body: JSON.stringify({ instruction: 'x' }), headers: auth }
  ]) { const response = await call('/v1/codex/tasks', { method: 'POST', ...init }); assert.ok([400, 415].includes(response.status)); }
});
test('task validation enforces instruction and streamed body limits', async () => {
  let response = await call('/v1/codex/tasks', { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ instruction: 'x'.repeat(12001) }) });
  assert.equal(response.status, 400); assert.equal((await response.json()).error, 'instruction_too_long');
  response = await call('/v1/codex/tasks', { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ instruction: 'x'.repeat(70_000) }) });
  assert.equal(response.status, 413);
});
test('task accepts only documented modes and is non-executing', async () => {
  const response = await call('/v1/codex/tasks', { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ instruction: 'audit local source', mode: 'test' }) });
  assert.equal(response.status, 202); assert.deepEqual(await response.json(), { ok: true, accepted: true, mode: 'test', execution: 'not_connected' });
});
test('CORS denies arbitrary origins and allows exact configured origin', async () => {
  let response = await call('/health', { headers: { Origin: 'https://evil.example.test' } }); assert.equal(response.headers.get('access-control-allow-origin'), null);
  response = await call('/health', { headers: { Origin: 'https://app.example.test' } }); assert.equal(response.headers.get('access-control-allow-origin'), 'https://app.example.test'); assert.equal(response.headers.get('vary'), 'Origin');
  response = await call('/health', { method: 'OPTIONS', headers: { Origin: 'https://evil.example.test' } }); assert.equal(response.status, 403);
  response = await call('/health', { method: 'OPTIONS', headers: { Origin: 'https://app.example.test' } }); assert.equal(response.status, 204);
});
test('production deploy and rollback remain blocked', async () => {
  for (const path of ['/v1/production/deploy', '/v1/production/rollback']) { const response = await call(path, { method: 'POST', headers: auth }); assert.equal(response.status, 403); assert.equal((await response.json()).error, 'production_mutation_disabled'); }
});
test('gateway source has no command or arbitrary network executor', async () => {
  const source = await (await import('node:fs/promises')).readFile(new URL('../developer-gateway/src/index.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /child_process|execSync|spawnSync|new Function|eval\(|await fetch\(/);
});
