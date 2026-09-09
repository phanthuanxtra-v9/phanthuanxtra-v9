import test from 'node:test';
import assert from 'node:assert/strict';
import gateway, { createInMemoryRateLimiter } from '../developer-gateway/src/index.js';

const env = {
  GATEWAY_READ_TOKEN: 'local-test-token',
  GATEWAY_ALLOWED_ORIGINS: 'https://app.example.test',
  GATEWAY_ALLOW_LOCAL_RATE_LIMITER: 'true',
  GITHUB_ACTIONS_DISPATCH_TOKEN: 'dispatch-token'
};

let requestNumber = 0;
const call = async (path, init = {}, overrides = {}) => {
  requestNumber += 1;
  const headers = new Headers(init.headers || {});
  headers.set('CF-Connecting-IP', `198.51.100.${requestNumber}`);
  return gateway.fetch(new Request(`https://gateway.example.test${path}`, { ...init, headers }), { ...env, ...overrides });
};
const auth = { Authorization: 'Bearer local-test-token' };

test('gateway rejects unauthorized status access', async () => {
  const response = await call('/v1/project/status');
  assert.equal(response.status, 401);
});

test('gateway exposes only hard-pinned project and branch', async () => {
  const response = await call('/v1/project/status', { headers: auth });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.repository, 'phanthuanxtra-v9/phanthuanxtra-v9');
  assert.equal(body.branch, 'main');
  assert.equal(body.production_mutations, false);
});

test('task validation rejects malformed, oversized, and unsupported requests', async () => {
  const cases = [
    [{ body: '{', headers: { ...auth, 'Content-Type': 'application/json' } }, 400],
    [{ body: '{}', headers: { ...auth, 'Content-Type': 'application/json' } }, 400],
    [{ body: JSON.stringify({ instruction: 'x', mode: 'deploy' }), headers: { ...auth, 'Content-Type': 'application/json' } }, 400],
    [{ body: JSON.stringify({ instruction: 'x' }), headers: auth }, 415],
    [{ body: JSON.stringify({ instruction: 'x'.repeat(70000) }), headers: { ...auth, 'Content-Type': 'application/json' } }, 413]
  ];
  for (const [init, status] of cases) assert.equal((await call('/v1/codex/tasks', { method: 'POST', ...init })).status, status);
});

test('task endpoint rejects non-POST and production mutation stays blocked', async () => {
  const get = await call('/v1/codex/tasks', { headers: auth });
  assert.equal(get.status, 405);
  const deploy = await call('/v1/production/deploy', { method: 'POST', headers: auth });
  assert.equal(deploy.status, 403);
});

test('cors allows exact configured origin and denies arbitrary origins', async () => {
  const allowed = await call('/health', { headers: { Origin: 'https://app.example.test' } });
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://app.example.test');
  const denied = await call('/health', { headers: { Origin: 'https://evil.example.test' } });
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
  const preflight = await call('/health', { method: 'OPTIONS', headers: { Origin: 'https://evil.example.test' } });
  assert.equal(preflight.status, 403);
});

test('in-memory limiter enforces the bounded task budget', async () => {
  const limiter = createInMemoryRateLimiter({ limit: 2, windowMs: 60000 });
  assert.equal((await limiter.check('same-client', 1000)).allowed, true);
  assert.equal((await limiter.check('same-client', 1001)).allowed, true);
  const blocked = await limiter.check('same-client', 1002);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfter >= 1);
  assert.equal((await limiter.check('other-client', 1002)).allowed, true);
});
