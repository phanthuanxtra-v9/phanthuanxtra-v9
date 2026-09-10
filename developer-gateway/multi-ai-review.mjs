import process from 'node:process';

const instruction = process.env.MULTI_AI_INSTRUCTION?.trim();
const taskId = process.env.TASK_ID?.trim() || 'unknown';
const gatewayUrl = (process.env.UNIFIED_AI_GATEWAY_URL || 'https://phanthuanxtra-developer-gateway.phanthuanmodelactor.workers.dev').replace(/\/$/, '');
const gatewayToken = process.env.GATEWAY_READ_TOKEN?.trim();

if (!instruction) throw new Error('MULTI_AI_INSTRUCTION is required');
if (!gatewayToken) throw new Error('GATEWAY_READ_TOKEN is required');

const timeoutMs = Number(process.env.MULTI_AI_TIMEOUT_MS || 30000);
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), timeoutMs);

try {
  const response = await fetch(`${gatewayUrl}/v1/ai/unified`, {
    method: 'POST',
    signal: controller.signal,
    headers: {
      authorization: `Bearer ${gatewayToken}`,
      'content-type': 'application/json',
      'user-agent': 'phanthuanxtra-unified-ai-worker'
    },
    body: JSON.stringify({
      task_id: taskId,
      mode: 'audit',
      instruction
    })
  });

  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { raw: text }; }

  if (!response.ok || body?.ok !== true) {
    throw new Error(`Unified AI HTTP ${response.status}: ${String(JSON.stringify(body)).slice(0, 4000)}`);
  }

  const report = {
    schema: 'phanthuanxtra.unified-ai-review.v1',
    task_id: taskId,
    logical_agent: body.logical_agent || 'xtra-unified-ai',
    engine: body.engine || 'cloudflare-workers-ai',
    model: body.model || null,
    production_mutation: false,
    independent_peer_workers: 0,
    response: String(body.response || '').slice(0, 12000)
  };

  console.log(JSON.stringify(report, null, 2));
} finally {
  clearTimeout(timer);
}
