import process from 'node:process';

const instruction = process.env.MULTI_AI_INSTRUCTION?.trim();
const taskId = process.env.TASK_ID?.trim() || 'unknown';

if (!instruction) {
  throw new Error('MULTI_AI_INSTRUCTION is required');
}

const timeoutMs = Number(process.env.MULTI_AI_TIMEOUT_MS || 30000);
const maxOutputChars = Number(process.env.MULTI_AI_MAX_OUTPUT_CHARS || 12000);

function clip(value) {
  return String(value ?? '').slice(0, maxOutputChars);
}

async function requestJson(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const text = await response.text();
    let body;
    try { body = JSON.parse(text); } catch { body = { raw: text }; }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${clip(JSON.stringify(body))}`);
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}

async function openAiCompatible({ name, baseUrl, apiKey, model, system }) {
  if (!baseUrl || !apiKey) {
    return { name, status: 'not_configured' };
  }
  const url = `${baseUrl.replace(/\\/$/, '')}/chat/completions`;
  try {
    const body = await requestJson(url, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
        'user-agent': 'phanthuanxtra-multi-ai-worker'
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        max_tokens: 1800,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: instruction }
        ]
      })
    });
    const content = body?.choices?.[0]?.message?.content ?? body?.output?.[0]?.content ?? '';
    return { name, status: 'ok', model, response: clip(content) };
  } catch (error) {
    return { name, status: 'error', model, error: clip(error.message) };
  }
}

const common = `You are a specialist reviewer for the PHAN THUAN XTRA production repository.\nDo not modify files, deploy production, expose secrets, or invent test results.\nReturn concise findings with severity (critical/high/medium/low), evidence, and a concrete recommendation.\nRepository: phanthuanxtra-v9/phanthuanxtra-v9.`;

const workers = [
  openAiCompatible({
    name: 'mistral-code-engineer',
    baseUrl: 'https://api.mistral.ai/v1',
    apiKey: process.env.MISTRAL_API_KEY,
    model: process.env.MISTRAL_MODEL || 'mistral-large-latest',
    system: `${common}\nRole: code engineer. Focus on JavaScript, Cloudflare Workers, APIs, tests, race conditions, and minimal safe patches.`
  }),
  openAiCompatible({
    name: 'gemma-test-engineer',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMMA_MODEL || 'gemma-4-31b-it',
    system: `${common}\nRole: test engineer. Focus on regression coverage, edge cases, API contracts, Android integration, and reproducible acceptance tests.`
  }),
  openAiCompatible({
    name: 'llama-security-reviewer',
    baseUrl: process.env.LLAMA_BASE_URL,
    apiKey: process.env.LLAMA_API_KEY,
    model: process.env.LLAMA_MODEL || 'llama',
    system: `${common}\nRole: independent security and reliability reviewer. Focus on authentication, authorization, secret handling, prompt injection, idempotency, concurrency, and production blast radius.`
  })
];

const results = await Promise.all(workers);
const configured = results.filter(item => item.status !== 'not_configured').length;
const successful = results.filter(item => item.status === 'ok').length;

const report = {
  schema: 'phanthuanxtra.multi-ai-review.v1',
  task_id: taskId,
  generated_at: new Date().toISOString(),
  configured_workers: configured,
  successful_workers: successful,
  production_mutation: false,
  openai_calls: 0,
  workers: results
};

console.log(JSON.stringify(report, null, 2));
