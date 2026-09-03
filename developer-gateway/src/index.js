const MAX_TASK_BODY_BYTES = 64 * 1024;
const MAX_INSTRUCTION_LENGTH = 12_000;
const TASK_MODES = new Set(['audit', 'test', 'propose-fix']);
const TASK_FIELDS = new Set(['instruction', 'mode']);
const encoder = new TextEncoder();

const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });

function cors(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return null;
  const allowed = new Set();
  for (const raw of String(env.GATEWAY_ALLOWED_ORIGINS || '').split(',')) {
    try { const url = new URL(raw.trim()); if ((url.protocol === 'https:' || url.protocol === 'http:') && url.origin === raw.trim()) allowed.add(url.origin); } catch { /* malformed configured origin is denied */ }
  }
  if (!allowed.has(origin)) return null;
  return { 'access-control-allow-origin': origin, 'access-control-allow-headers': 'authorization,content-type,x-request-id', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-max-age': '600', vary: 'Origin' };
}

async function tokenMatches(value, expected) {
  if (!expected) return false;
  const left = encoder.encode(value || ''), right = encoder.encode(expected);
  const length = Math.max(left.length, right.length, 1);
  let difference = left.length ^ right.length;
  for (let i = 0; i < length; i += 1) difference |= (left[i] || 0) ^ (right[i] || 0);
  return difference === 0;
}

async function authorized(request, env) {
  const header = request.headers.get('Authorization') || '';
  return tokenMatches(header.startsWith('Bearer ') ? header.slice(7) : '', env.GATEWAY_READ_TOKEN);
}

async function readLimitedJson(request) {
  const declared = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(declared) && declared > MAX_TASK_BODY_BYTES) return { error: 'request_too_large' };
  if (!request.body) return { error: 'invalid_json' };
  const reader = request.body.getReader(), chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_TASK_BODY_BYTES) { await reader.cancel(); return { error: 'request_too_large' }; }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return { value: JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) };
  } catch { return { error: 'invalid_json' }; }
}

export function createInMemoryRateLimiter({ limit = 10, windowMs = 60_000 } = {}) {
  const buckets = new Map();
  return { async check(key, now = Date.now()) {
    const previous = buckets.get(key);
    const bucket = !previous || now - previous.startedAt >= windowMs ? { startedAt: now, count: 0 } : previous;
    bucket.count += 1; buckets.set(key, bucket);
    return { allowed: bucket.count <= limit, retryAfter: Math.max(1, Math.ceil((windowMs - (now - bucket.startedAt)) / 1000)) };
  }};
}
const localLimiter = createInMemoryRateLimiter();
async function checkRateLimit(request, env) {
  const limiter = env.RATE_LIMITER && typeof env.RATE_LIMITER.check === 'function' ? env.RATE_LIMITER : env.GATEWAY_ALLOW_LOCAL_RATE_LIMITER === 'true' ? localLimiter : null;
  if (!limiter) return { unavailable: true };
  return limiter.check(`codex-tasks:${request.headers.get('CF-Connecting-IP') || 'unknown'}`);
}

function validateTask(body) {
  if (!body || Array.isArray(body) || typeof body !== 'object') return { error: 'invalid_request' };
  if (Object.keys(body).some(key => !TASK_FIELDS.has(key))) return { error: 'unexpected_field' };
  if (typeof body.instruction !== 'string' || !body.instruction.trim()) return { error: 'instruction_required' };
  const instruction = body.instruction.trim();
  if (instruction.length > MAX_INSTRUCTION_LENGTH) return { error: 'instruction_too_long' };
  const mode = body.mode === undefined ? 'audit' : body.mode;
  if (typeof mode !== 'string' || !TASK_MODES.has(mode)) return { error: 'invalid_mode' };
  return { value: { mode } };
}

const validationStatus = { request_too_large: 413, invalid_json: 400, invalid_request: 400, unexpected_field: 400, instruction_required: 400, instruction_too_long: 400, invalid_mode: 400 };

export default { async fetch(request, env) {
  const headers = cors(request, env) || {};
  if (request.method === 'OPTIONS') return request.headers.get('Origin') && !headers['access-control-allow-origin'] ? json({ ok: false, error: 'origin_not_allowed' }, 403) : new Response(null, { status: 204, headers });
  const url = new URL(request.url);
  if (url.pathname === '/health' && request.method === 'GET') return json({ ok: true, service: 'developer-gateway', mode: 'read-only', production_mutations: false }, 200, headers);
  if (!(await authorized(request, env))) return json({ ok: false, error: 'unauthorized' }, 401, headers);
  if (request.method === 'GET' && url.pathname === '/v1/project/status') return json({ ok: true, repository: 'phanthuanxtra-v9/phanthuanxtra-v9', branch: 'feature/developer-gateway', production_mutations: false }, 200, headers);
  if (request.method === 'GET' && url.pathname === '/v1/github/status') return json({ ok: true, provider: 'github', access: 'not_connected' }, 200, headers);
  if (request.method === 'GET' && url.pathname === '/v1/devbox/status') return json({ ok: true, provider: 'remote-devbox', status: 'not_connected' }, 200, headers);
  if (request.method === 'GET' && url.pathname === '/v1/cloudflare/observability') return json({ ok: true, provider: 'cloudflare', status: 'not_connected', secrets_exposed: false }, 200, headers);
  if (url.pathname === '/v1/codex/tasks') {
    if (request.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405, { ...headers, Allow: 'POST' });
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type') || '')) return json({ ok: false, error: 'content_type_required' }, 415, headers);
    const rate = await checkRateLimit(request, env);
    if (rate.unavailable) return json({ ok: false, error: 'rate_limit_unavailable' }, 503, headers);
    if (!rate.allowed) return json({ ok: false, error: 'rate_limited' }, 429, { ...headers, 'retry-after': String(rate.retryAfter) });
    const parsed = await readLimitedJson(request); if (parsed.error) return json({ ok: false, error: parsed.error }, validationStatus[parsed.error], headers);
    const task = validateTask(parsed.value); if (task.error) return json({ ok: false, error: task.error }, validationStatus[task.error], headers);
    // This is intentionally an acknowledgement only. It executes no command, fetch, file, or provider operation.
    return json({ ok: true, accepted: true, mode: task.value.mode, execution: 'not_connected' }, 202, headers);
  }
  if (url.pathname === '/v1/production/deploy' || url.pathname === '/v1/production/rollback') return json({ ok: false, error: 'production_mutation_disabled' }, 403, headers);
  return json({ ok: false, error: 'not_found' }, 404, headers);
}};
