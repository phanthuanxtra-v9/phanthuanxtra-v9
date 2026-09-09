const MAX_TASK_BODY_BYTES = 64 * 1024;
const MAX_INSTRUCTION_LENGTH = 12000;
const REPOSITORY = 'phanthuanxtra-v9/phanthuanxtra-v9';
const DEFAULT_BRANCH = 'main';
const CODEX_WORKFLOW = 'codex-agent.yml';
const ZERO_COST_WORKFLOW = 'zero-cost-audit-test.yml';
const MODES = new Set(['audit', 'test', 'propose-fix']);
const encoder = new TextEncoder();

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers }
  });
}

function cors(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return {};
  const allowed = new Set();
  for (const raw of String(env.GATEWAY_ALLOWED_ORIGINS || '').split(',')) {
    const value = raw.trim();
    try {
      const parsed = new URL(value);
      if ((parsed.protocol === 'https:' || parsed.protocol === 'http:') && parsed.origin === value) allowed.add(parsed.origin);
    } catch { /* deny malformed configured origins */ }
  }
  if (!allowed.has(origin)) return {};
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-headers': 'authorization,content-type,x-request-id',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-max-age': '600',
    vary: 'Origin'
  };
}

function constantTimeEqual(a, b) {
  const left = encoder.encode(a || ''), right = encoder.encode(b || '');
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length, 1);
  for (let index = 0; index < length; index += 1) difference |= (left[index] || 0) ^ (right[index] || 0);
  return difference === 0;
}

function authenticate(request, env) {
  const expected = env.GATEWAY_READ_TOKEN;
  if (!expected) return false;
  const authorization = request.headers.get('Authorization') || '';
  return constantTimeEqual(authorization.startsWith('Bearer ') ? authorization.slice(7) : '', expected);
}

function productionMutationsEnabled(env) { return env.PRODUCTION_MUTATIONS_ENABLED === 'true'; }
function workflowForMode(mode) { return mode === 'propose-fix' ? CODEX_WORKFLOW : ZERO_COST_WORKFLOW; }
function validRepository(value) { return value === undefined || value === REPOSITORY; }
function validBranch(value) { return value === undefined || value === DEFAULT_BRANCH; }

export function createInMemoryRateLimiter({ limit = 10, windowMs = 60000 } = {}) {
  const buckets = new Map();
  return {
    async check(key, now = Date.now()) {
      const previous = buckets.get(key);
      const bucket = !previous || now - previous.startedAt >= windowMs ? { startedAt: now, count: 0 } : previous;
      bucket.count += 1;
      buckets.set(key, bucket);
      return { allowed: bucket.count <= limit, retryAfter: Math.max(1, Math.ceil((windowMs - (now - bucket.startedAt)) / 1000)) };
    }
  };
}

const localLimiter = createInMemoryRateLimiter();
async function checkRateLimit(request, env) {
  const limiter = env.RATE_LIMITER && typeof env.RATE_LIMITER.check === 'function'
    ? env.RATE_LIMITER
    : env.GATEWAY_ALLOW_LOCAL_RATE_LIMITER === 'true' ? localLimiter : null;
  if (!limiter) return { unavailable: true };
  return limiter.check(`codex-tasks:${request.headers.get('CF-Connecting-IP') || 'unknown'}`);
}

async function readLimitedJson(request) {
  const declared = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(declared) && declared > MAX_TASK_BODY_BYTES) return { error: 'request_too_large' };
  if (!request.body) return { error: 'invalid_json' };
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_TASK_BODY_BYTES) {
        await reader.cancel();
        return { error: 'request_too_large' };
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return { value: JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) };
  } catch {
    return { error: 'invalid_json' };
  }
}

async function dispatchTask(env, task) {
  const token = env.GITHUB_ACTIONS_DISPATCH_TOKEN;
  if (!token) return { ok: false, error: 'github_dispatch_not_configured' };
  const workflow = workflowForMode(task.mode);
  const response = await fetch(`https://api.github.com/repos/${REPOSITORY}/actions/workflows/${workflow}/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'phanthuanxtra-developer-gateway',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ref: DEFAULT_BRANCH, inputs: { instruction: task.instruction, mode: task.mode, task_id: task.taskId } })
  });
  if (response.status === 204) return { ok: true, workflow };
  return { ok: false, error: 'github_dispatch_failed', status: response.status, detail: (await response.text().catch(() => '')).slice(0, 500) };
}

export default {
  async fetch(request, env) {
    const headers = cors(request, env);
    const origin = request.headers.get('Origin');
    if (request.method === 'OPTIONS') {
      if (origin && !headers['access-control-allow-origin']) return json({ ok: false, error: 'cors_origin_denied' }, 403);
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);
    if (url.pathname === '/health' && request.method === 'GET') {
      return json({ ok: true, service: 'developer-gateway', mode: env.GATEWAY_MODE || 'readonly', production_mutations: productionMutationsEnabled(env) }, 200, headers);
    }
    if (!authenticate(request, env)) return json({ ok: false, error: 'unauthorized' }, 401, headers);

    if (request.method === 'GET' && url.pathname === '/v1/project/status') return json({ ok: true, repository: REPOSITORY, branch: DEFAULT_BRANCH, production_mutations: productionMutationsEnabled(env) }, 200, headers);
    if (request.method === 'GET' && url.pathname === '/v1/github/status') return json({ ok: true, provider: 'github', repository: REPOSITORY, branch: DEFAULT_BRANCH, access: env.GITHUB_ACTIONS_DISPATCH_TOKEN ? 'configured' : 'pending-github-dispatch-credential', workflow: CODEX_WORKFLOW, zero_cost_workflow: ZERO_COST_WORKFLOW }, 200, headers);
    if (request.method === 'GET' && url.pathname === '/v1/devbox/status') return json({ ok: true, provider: 'github-actions-codex-runner', status: 'not-required-for-phase-2a' }, 200, headers);
    if (request.method === 'GET' && url.pathname === '/v1/cloudflare/observability') return json({ ok: true, provider: 'cloudflare', status: 'pending-cloudflare-credentials', secrets_exposed: false }, 200, headers);

    if (url.pathname === '/v1/codex/tasks') {
      if (request.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405, { ...headers, Allow: 'POST' });
      if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type') || '')) return json({ ok: false, error: 'content_type_required' }, 415, headers);
      const rate = await checkRateLimit(request, env);
      if (rate.unavailable) return json({ ok: false, error: 'rate_limit_unavailable' }, 503, headers);
      if (!rate.allowed) return json({ ok: false, error: 'rate_limited' }, 429, { ...headers, 'retry-after': String(rate.retryAfter) });
      const parsed = await readLimitedJson(request);
      if (parsed.error) return json({ ok: false, error: parsed.error }, parsed.error === 'request_too_large' ? 413 : 400, headers);
      const body = parsed.value;
      if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ ok: false, error: 'invalid_json' }, 400, headers);
      const allowedFields = new Set(['instruction', 'repository', 'branch', 'mode']);
      if (Object.keys(body).some(key => !allowedFields.has(key))) return json({ ok: false, error: 'unexpected_field' }, 400, headers);
      if (typeof body.instruction !== 'string' || !body.instruction.trim()) return json({ ok: false, error: 'instruction_required' }, 400, headers);
      if (body.instruction.length > MAX_INSTRUCTION_LENGTH) return json({ ok: false, error: 'instruction_too_long', max_length: MAX_INSTRUCTION_LENGTH }, 400, headers);
      if (body.repository !== undefined && (typeof body.repository !== 'string' || body.repository.length > 200 || !validRepository(body.repository))) return json({ ok: false, error: 'invalid_repository' }, 400, headers);
      if (body.branch !== undefined && (typeof body.branch !== 'string' || body.branch.length > 200 || !validBranch(body.branch))) return json({ ok: false, error: 'invalid_branch' }, 400, headers);
      if (body.mode !== undefined && (typeof body.mode !== 'string' || !MODES.has(body.mode))) return json({ ok: false, error: 'invalid_mode' }, 400, headers);

      const task = { taskId: crypto.randomUUID(), instruction: body.instruction.trim(), mode: body.mode || 'audit' };
      const dispatched = await dispatchTask(env, task);
      if (!dispatched.ok) {
        const status = dispatched.error === 'github_dispatch_not_configured' ? 503 : 502;
        return json({ ok: false, task_id: task.taskId, ...dispatched }, status, headers);
      }
      return json({ ok: true, accepted: true, task_id: task.taskId, mode: task.mode, repository: REPOSITORY, branch: DEFAULT_BRANCH, execution: task.mode === 'propose-fix' ? 'github-actions-codex' : 'github-actions-zero-cost', workflow: dispatched.workflow }, 202, headers);
    }

    if (url.pathname === '/v1/production/deploy' || url.pathname === '/v1/production/rollback') return json({ ok: false, error: 'production_mutation_disabled', message: 'Deployment and rollback are disabled in Phase 2A.' }, 403, headers);
    return json({ ok: false, error: 'not_found' }, 404, headers);
  }
};