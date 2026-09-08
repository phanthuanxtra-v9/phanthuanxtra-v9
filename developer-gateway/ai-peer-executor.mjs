import process from 'node:process';

const instruction = process.env.MULTI_AI_INSTRUCTION?.trim();
const taskId = process.env.TASK_ID?.trim();
const agent = process.env.AI_PEER_AGENT?.trim();
const checkpoint = process.env.TASK_CHECKPOINT?.trim() || '';

if (!instruction) throw new Error('MULTI_AI_INSTRUCTION is required');
if (!taskId) throw new Error('TASK_ID is required');
if (!agent || !['mistral', 'gemma', 'llama'].includes(agent)) {
  throw new Error('AI_PEER_AGENT must be mistral, gemma or llama');
}

const configs = {
  mistral: {
    baseUrl: 'https://api.mistral.ai/v1',
    key: process.env.MISTRAL_API_KEY,
    model: process.env.MISTRAL_MODEL || 'mistral-large-latest',
    role: 'implementation engineer'
  },
  gemma: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    key: process.env.GEMINI_API_KEY,
    model: process.env.GEMMA_MODEL || 'gemma-4-31b-it',
    role: 'test and regression engineer'
  },
  llama: {
    baseUrl: process.env.LLAMA_BASE_URL,
    key: process.env.LLAMA_API_KEY,
    model: process.env.LLAMA_MODEL || 'llama',
    role: 'security and reliability engineer'
  }
};

const cfg = configs[agent];
if (!cfg.key || !cfg.baseUrl) throw new Error(`${agent} provider is not configured`);

const system = `You are the ${cfg.role} in the PHAN THUAN XTRA AI Peer Executor.
You operate on an isolated non-main GitHub Actions branch, never production.
Continue the existing task from the supplied checkpoint; do not restart completed work.
Produce ONLY a minimal safe unified diff implementing the requested task.
Never modify .github/workflows, GitHub policy, Wrangler/Cloudflare configuration, secrets, credentials, deployment gates, or production controls.
Do not invent files, test results, API responses, or credentials.
Return exactly:
BEGIN_SUMMARY
<short summary>
END_SUMMARY
BEGIN_PATCH
<unified diff suitable for git apply>
END_PATCH
If no safe patch is possible, return an empty patch and explain why.
Repository: phanthuanxtra-v9/phanthuanxtra-v9
Task ID: ${taskId}`;

const user = `CHECKPOINT:\n${checkpoint}\n\nTASK INSTRUCTION:\n${instruction}`;
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), Number(process.env.MULTI_AI_TIMEOUT_MS || 90000));

try {
  const response = await fetch(`${cfg.baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    signal: controller.signal,
    headers: {
      authorization: `Bearer ${cfg.key}`,
      'content-type': 'application/json',
      'user-agent': 'phanthuanxtra-ai-peer-executor'
    },
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0,
      max_tokens: 8000,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    })
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${text.slice(0, 2000)}`);
  const body = JSON.parse(text);
  const content = body?.choices?.[0]?.message?.content || '';
  const summary = content.match(/BEGIN_SUMMARY\s*([\s\S]*?)\s*END_SUMMARY/i)?.[1]?.trim() || '';
  const patch = content.match(/BEGIN_PATCH\s*([\s\S]*?)\s*END_PATCH/i)?.[1]?.trim() || '';
  if (!summary && !patch) throw new Error('Peer response did not contain the required executor structure');
  console.log(JSON.stringify({
    schema: 'phanthuanxtra.ai-peer-executor.v1',
    task_id: taskId,
    agent,
    model: cfg.model,
    generated_at: new Date().toISOString(),
    production_mutation: false,
    summary,
    patch
  }));
} finally {
  clearTimeout(timeout);
}
