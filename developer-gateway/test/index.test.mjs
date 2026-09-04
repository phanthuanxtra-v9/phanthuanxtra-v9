import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const env = {
  GATEWAY_READ_TOKEN: 'test-token',
  GATEWAY_ALLOWED_ORIGINS: 'https://example.com',
  GITHUB_ACTIONS_DISPATCH_TOKEN: 'test-dispatch-token'
};

async function request(path, { method = 'GET', headers = {}, body } = {}) {
  const req = new Request(`https://gateway.example.com${path}`, { method, headers, body });
  return worker.fetch(req, env);
}

async function withGithubDispatchMock(callback) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init = {}) => {
    const url = String(input);
    const workflow = url.includes('/actions/workflows/codex-agent.yml/dispatches')
      ? 'codex-agent.yml'
      : url.includes('/actions/workflows/zero-cost-audit-test.yml/dispatches')
        ? 'zero-cost-audit-test.yml'
        : null;

    if (workflow) {
      assert.equal(init.method, 'POST');
      assert.match(init.headers.Authorization, /^Bearer /);
      const payload = JSON.parse(init.body);
      assert.equal(payload.ref, 'main');
      assert.ok(payload.inputs.task_id);
      assert.ok(payload.inputs.instruction);
      assert.ok(['audit', 'test', 'propose-fix'].includes(payload.inputs.mode));
      if (workflow === 'zero-cost-audit-test.yml') {
        assert.ok(['audit', 'test'].includes(payload.inputs.mode));
      }
      if (workflow === 'codex-agent.yml') {
        assert.equal(payload.inputs.mode, 'propose-fix');
      }
      return new Response(null, { status: 204 });
    }
    return originalFetch(input, init);
  };
  try {
    return await callback();
  } finally {
    globalThis.fetch = originalFetch;
  }
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

test('audit task is dispatched to zero-cost workflow', async () => {
  await withGithubDispatchMock(async () => {
    const response = await postTask({ instruction: 'Run an audit' });
    assert.equal(response.status, 202);
    const body = await response.json();
    assert.equal(body.ok, true);
    assert.equal(body.accepted, true);
    assert.equal(body.mode, 'audit');
    assert.equal(body.execution, 'github-actions-zero-cost');
    assert.equal(body.workflow, 'zero-cost-audit-test.yml');
    assert.match(body.task_id, /^[0-9a-f-]{36}$/);
  });
});

test('test task is dispatched to zero-cost workflow', async () => {
  await withGithubDispatchMock(async () => {
    const response = await postTask({ instruction: 'Run tests', repository: 'phanthuanxtra-v9/phanthuanxtra-v9', branch: 'main', mode: 'test' });
    assert.equal(response.status, 202);
    const body = await response.json();
    assert.equal(body.execution, 'github-actions-zero-cost');
    assert.equal(body.workflow, 'zero-cost-audit-test.yml');
  });
});

test('propose-fix task remains on Codex workflow', async () => {
  await withGithubDispatchMock(async () => {
    const response = await postTask({ instruction: 'Prepare a fix', mode: 'propose-fix' });
    assert.equal(response.status, 202);
    const body = await response.json();
    assert.equal(body.execution, 'github-actions-codex');
    assert.equal(body.workflow, 'codex-agent.yml');
  });
});

test('Codex task rejects repository outside the configured project', async () => {
  assert.equal((await postTask({ instruction: 'Run audit', repository: 'other/repo' })).status, 400);
});

test('Codex task rejects branch outside main', async () => {
  assert.equal((await postTask({ instruction: 'Run audit', branch: 'feature/other' })).status, 400);
});

test('Codex task rejects invalid mode', async () => {
  assert.equal((await postTask({ instruction: 'Run audit', mode: 'deploy' })).status, 400);
});

test('Codex task rejects instruction over 12000 characters', async () => {
  assert.equal((await postTask({ instruction: 'x'.repeat(12001) })).status, 400);
});

test('Codex task accepts instruction of exactly 12000 characters', async () => {
  await withGithubDispatchMock(async () => {
    assert.equal((await postTask({ instruction: 'x'.repeat(12000) })).status, 202);
  });
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

test('Codex task reports missing GitHub dispatch credential', async () => {
  const response = await worker.fetch(new Request('https://gateway.example.com/v1/codex/tasks', {
    method: 'POST',
    headers: { Authorization: 'Bearer test-token', 'Content-Type': 'application/json' },
    body: JSON.stringify({ instruction: 'Run audit' })
  }), { ...env, GITHUB_ACTIONS_DISPATCH_TOKEN: undefined });
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.error, 'github_dispatch_not_configured');
});

test('disallowed CORS preflight is rejected', async () => {
  const response = await request('/health', { method: 'OPTIONS', headers: { Origin: 'https://evil.example.com', 'Access-Control-Request-Method': 'GET' } });
  assert.equal(response.status, 403);
});

test('allowed CORS preflight succeeds', async () => {
  const response = await request('/health', { method: 'OPTIONS', headers: { Origin: 'https://example.com', 'Access-Control-Request-Method': 'GET' } });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://example.com');
});

test('production deploy remains blocked', async () => {
  assert.equal((await request('/v1/production/deploy', { method: 'POST', headers: { Authorization: 'Bearer test-token' } })).status, 403);
});

test('production rollback remains blocked', async () => {
  assert.equal((await request('/v1/production/rollback', { method: 'POST', headers: { Authorization: 'Bearer test-token' } })).status, 403);
});
