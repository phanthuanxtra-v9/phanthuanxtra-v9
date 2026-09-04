import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const env = {
  GATEWAY_READ_TOKEN: 'test-token',
  GATEWAY_ALLOWED_ORIGINS: 'https://example.com'
};

async function request(path, { method = 'GET', headers = {}, body } = {}) {
  const req = new Request(`https://gateway.example.com${path}`, { method, headers, body });
  return worker.fetch(req, env);
}

test('health is public', async () => {
  const response = await request('/health');
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.production_mutations, false);
});

test('protected endpoint rejects missing authentication', async () => {
  assert.equal((await request('/v1/project/status')).status, 401);
});

test('valid authentication allows protected endpoint', async () => {
  assert.equal((await request('/v1/project/status', { headers: { Authorization: 'Bearer test-token' } })).status, 200);
});

test('invalid authentication is rejected', async () => {
  assert.equal((await request('/v1/project/status', { headers: { Authorization: 'Bearer wrong-token' } })).status, 401);
});

function postTask(body, headers = {}) {
  return request('/v1/codex/tasks', {
    method: 'POST',
    headers: { Authorization: 'Bearer test-token', 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });
}

test('valid Codex task is accepted', async () => {
  const response = await postTask({ instruction: 'Run an audit' });
  assert.equal(response.status, 202);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.accepted, true);
  assert.equal(body.mode, 'audit');
});

test('Codex task accepts supported mode and fields', async () => {
  const response = await postTask({
    instruction: 'Run tests',
    repository: 'phanthuanxtra-v9/phanthuanxtra-v9',
    branch: 'feature/developer-gateway-clean',
    mode: 'test'
  });
  assert.equal(response.status, 202);
});

test('Codex task rejects invalid mode', async () => {
  assert.equal((await postTask({ instruction: 'Run audit', mode: 'deploy' })).status, 400);
});

test('Codex task rejects instruction over 12000 characters', async () => {
  assert.equal((await postTask({ instruction: 'x'.repeat(12001) })).status, 400);
});

test('Codex task accepts instruction of exactly 12000 characters', async () => {
  assert.equal((await postTask({ instruction: 'x'.repeat(12000) })).status, 202);
});

test('Codex task rejects unexpected fields', async () => {
  assert.equal((await postTask({ instruction: 'Run audit', unexpected: true })).status, 400);
});

test('Codex task requires JSON content type', async () => {
  const response = await request('/v1/codex/tasks', {
    method: 'POST',
    headers: { Authorization: 'Bearer test-token' },
    body: JSON.stringify({ instruction: 'Run audit' })
  });
  assert.equal(response.status, 415);
});

test('disallowed CORS preflight is rejected', async () => {
  const response = await request('/health', {
    method: 'OPTIONS',
    headers: { Origin: 'https://evil.example.com', 'Access-Control-Request-Method': 'GET' }
  });
  assert.equal(response.status, 403);
});

test('allowed CORS preflight succeeds', async () => {
  const response = await request('/health', {
    method: 'OPTIONS',
    headers: { Origin: 'https://example.com', 'Access-Control-Request-Method': 'GET' }
  });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://example.com');
});

test('production deploy remains blocked', async () => {
  assert.equal((await request('/v1/production/deploy', { method: 'POST', headers: { Authorization: 'Bearer test-token' } })).status, 403);
});

test('production rollback remains blocked', async () => {
  assert.equal((await request('/v1/production/rollback', { method: 'POST', headers: { Authorization: 'Bearer test-token' } })).status, 403);
});
