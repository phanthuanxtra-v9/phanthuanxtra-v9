import process from 'node:process';

const instruction = process.env.MULTI_AI_INSTRUCTION?.trim();
const taskId = process.env.TASK_ID?.trim() || 'unknown';
const checkpoint = process.env.TASK_CHECKPOINT?.trim() || '';
const gatewayUrl = (process.env.UNIFIED_AI_GATEWAY_URL || 'https://phanthuanxtra-developer-gateway.phanthuanmodelactor.workers.dev').replace(/\/$/, '');
const gatewayToken = process.env.GATEWAY_READ_TOKEN?.trim();

if (!instruction) throw new Error('MULTI_AI_INSTRUCTION is required');
if (!gatewayToken) throw new Error('GATEWAY_READ_TOKEN is required');
if (!checkpoint) throw new Error('TASK_CHECKPOINT is required');

const timeoutMs = Number(process.env.MULTI_AI_TIMEOUT_MS || 30000);
if (!Number.isFinite(timeoutMs) || timeoutMs < 5000 || timeoutMs > 120000) {
  throw new Error('MULTI_AI_TIMEOUT_MS must be between 5000 and 120000');
}

// The canonical checkpoint is always read in full by the workflow, but the
// Gateway currently rejects context longer than 12,000 characters. Preserve
// both the opening project identity/rules and the latest gate/evidence tail
// while keeping a conservative payload budget for the audit call.
const maxContextChars = 11000;
const context = checkpoint.length <= maxContextChars
  ? checkpoint
  : `${checkpoint.slice(0, 5500)}\n\n[... canonical checkpoint middle omitted only for inference payload; full file was read by the workflow ...]\n\n${checkpoint.slice(-5500)}`;

const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), timeoutMs);

try {
  const response = await fetch(`${gatewayUrl}/v1/ai/unified`, {
    method: 'POST',
    signal: controller.signal,
    headers: {
      authorization: `Bearer ${gatewayToken}`,
      'content-type': 'application/json',
      'user-agent': 'phanthuanxtra-unified-ai-executor'
    },
    body: JSON.stringify({
      task_id: taskId,
      mode: 'audit',
      context,
      instruction
    })
  });

  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { raw: text }; }

  if (!response.ok || body?.ok !== true) {
    throw new Error(`Unified AI HTTP ${response.status}: ${String(JSON.stringify(body)).slice(0, 4000)}`);
  }
  if (body.logical_agent !== 'xtra-unified-ai') throw new Error('Unexpected logical agent');
  if (body.engine !== 'cloudflare-workers-ai') throw new Error('Unexpected inference engine');
  if (body.production_mutation !== false) throw new Error('Production mutation must remain false');

  console.log(JSON.stringify({
    schema: 'phanthuanxtra.ai-unified-executor.v2',
    task_id: taskId,
    logical_agent: body.logical_agent,
    engine: body.engine,
    model: body.model || null,
    production_mutation: false,
    independent_peer_workers: 0,
    response: String(body.response || '').slice(0, 12000)
  }, null, 2));
} finally {
  clearTimeout(timer);
}
