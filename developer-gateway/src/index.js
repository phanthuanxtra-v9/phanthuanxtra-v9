const ALLOWED_ORIGINS = new Set((env => (env?.GATEWAY_ALLOWED_ORIGINS || '').split(',').map(v => v.trim()).filter(Boolean)))(globalThis.__gatewayEnv));

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers }
  });
}

function cors(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return {};
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-headers': 'authorization,content-type,x-request-id',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'vary': 'Origin'
  };
}

function unauthorized(headers) {
  return json({ ok: false, error: 'unauthorized' }, 401, headers);
}

function auth(request, env) {
  const expected = env.GATEWAY_READ_TOKEN;
  if (!expected) return false;
  const value = request.headers.get('Authorization') || '';
  return value === `Bearer ${expected}`;
}

export default {
  async fetch(request, env) {
    const headers = cors(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });

    const url = new URL(request.url);
    if (url.pathname === '/health' && request.method === 'GET') {
      return json({ ok: true, service: 'developer-gateway', mode: 'read-only', production_mutations: false }, 200, headers);
    }

    if (!auth(request, env)) return unauthorized(headers);

    if (request.method === 'GET' && url.pathname === '/v1/project/status') {
      return json({ ok: true, repository: 'phanthuanxtra-v9/phanthuanxtra-v9', branch: 'feature/developer-gateway', production_mutations: false }, 200, headers);
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
      const body = await request.json().catch(() => null);
      if (!body || typeof body.instruction !== 'string' || !body.instruction.trim()) {
        return json({ ok: false, error: 'instruction_required' }, 400, headers);
      }
      return json({ ok: true, accepted: true, mode: body.mode || 'audit', execution: 'pending-devbox-connection' }, 202, headers);
    }

    if (url.pathname === '/v1/production/deploy' || url.pathname === '/v1/production/rollback') {
      return json({ ok: false, error: 'production_mutation_disabled', message: 'Deployment and rollback are disabled in phase 1.' }, 403, headers);
    }

    return json({ ok: false, error: 'not_found' }, 404, headers);
  }
};
