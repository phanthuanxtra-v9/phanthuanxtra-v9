const MAX_INSTRUCTION_LENGTH = 12000;
const MODES = new Set(['audit', 'test', 'propose-fix']);

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers }
  });
}

function cors(request, env) {
  const allowed = new Set((env.GATEWAY_ALLOWED_ORIGINS || '').split(',').map(v => v.trim()).filter(Boolean));
  const origin = request.headers.get('Origin');
  if (!origin || !allowed.has(origin)) return {};
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-headers': 'authorization,content-type,x-request-id',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'vary': 'Origin'
  };
}

function constantTimeEqual(a, b) {
  const encoder = new TextEncoder();
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  let diff = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    diff |= (left[i] || 0) ^ (right[i] || 0);
  }
  return diff === 0;
}

function unauthorized(headers) {
  return json({ ok: false, error: 'unauthorized' }, 401, headers);
}

function auth(request, env) {
  const expected = env.GATEWAY_READ_TOKEN;
  if (!expected) return false;
  const value = request.headers.get('Authorization') || '';
  return constantTimeEqual(value, `Bearer ${expected}`);
}

export default {
  async fetch(request, env) {
    const headers = cors(request, env);
    const origin = request.headers.get('Origin');

    if (request.method === 'OPTIONS') {
      if (origin && !headers['access-control-allow-origin']) {
        return json({ ok: false, error: 'cors_origin_denied' }, 403);
      }
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);
    if (url.pathname === '/health' && request.method === 'GET') {
      return json({ ok: true, service: 'developer-gateway', mode: 'read-only', production_mutations: false }, 200, headers);
    }

    if (!auth(request, env)) return unauthorized(headers);

    if (request.method === 'GET' && url.pathname === '/v1/project/status') {
      return json({ ok: true, repository: 'phanthuanxtra-v9/phanthuanxtra-v9', branch: 'feature/developer-gateway-clean', production_mutations: false }, 200, headers);
    }

    if (request.method === 'GET' && url.pathname === '/v1/github/status') {
      return json({ ok: true, provider: 'github', repository: 'phanthuanxtra-v9/phanthuanxtra-v9', access: 'pending-github-app' }, 200, headers);
    }

    if (request.method === 'GET' && url.pathname === '/v1/devbox/status') {
      return json({ ok: true, provider: 'remote-devbox', status: 'pending-connection' }, 200, headers);
    }

    if (request.method === 'GET' && url.pathname === '/v1/cloudflare/observability') {
      return json({ ok: true, provider: 'cloudflare', status: 'pending-cloudflare-credentials', secrets_exposed: false }, 200, headers);
    }

    if (request.method === 'POST' && url.pathname === '/v1/codex/tasks') {
      if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
        return json({ ok: false, error: 'content_type_required' }, 415, headers);
      }
      const body = await request.json().catch(() => null);
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return json({ ok: false, error: 'invalid_json' }, 400, headers);
      }
      const allowedFields = new Set(['instruction', 'repository', 'branch', 'mode']);
      if (Object.keys(body).some(key => !allowedFields.has(key))) {
        return json({ ok: false, error: 'unexpected_field' }, 400, headers);
      }
      if (typeof body.instruction !== 'string' || !body.instruction.trim()) {
        return json({ ok: false, error: 'instruction_required' }, 400, headers);
      }
      if (body.instruction.length > MAX_INSTRUCTION_LENGTH) {
        return json({ ok: false, error: 'instruction_too_long' }, 400, headers);
      }
      if (body.repository !== undefined && (typeof body.repository !== 'string' || body.repository.length > 200)) {
        return json({ ok: false, error: 'invalid_repository' }, 400, headers);
      }
      if (body.branch !== undefined && (typeof body.branch !== 'string' || body.branch.length > 200)) {
        return json({ ok: false, error: 'invalid_branch' }, 400, headers);
      }
      if (body.mode !== undefined && (typeof body.mode !== 'string' || !MODES.has(body.mode))) {
        return json({ ok: false, error: 'invalid_mode' }, 400, headers);
      }
      return json({ ok: true, accepted: true, mode: body.mode || 'audit', execution: 'pending-devbox-connection' }, 202, headers);
    }

    if (url.pathname === '/v1/production/deploy' || url.pathname === '/v1/production/rollback') {
      return json({ ok: false, error: 'production_mutation_disabled', message: 'Deployment and rollback are disabled in phase 1.' }, 403, headers);
    }

    return json({ ok: false, error: 'not_found' }, 404, headers);
  }
};
