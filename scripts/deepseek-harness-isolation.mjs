import fs from 'node:fs';

const policy = JSON.parse(fs.readFileSync('tools/deepseek-harness.json', 'utf8'));

const required = {
  production_access: false,
  production_secrets: false,
  model_execution: false,
  allowed_profile: 'headless',
  integration: 'isolated-reasoning-evidence',
};

for (const [key, expected] of Object.entries(required)) {
  if (policy[key] !== expected) {
    throw new Error(`DeepSeek Harness isolation policy violation: ${key} must be ${JSON.stringify(expected)}`);
  }
}

if (!/^https:\/\/github\.com\/deepseek-ai\/deepseek-harness\.git$/.test(policy.upstream)) {
  throw new Error('DeepSeek Harness upstream must remain the official public repository');
}

if (!/^[0-9a-f]{40}$/.test(policy.commit)) {
  throw new Error('DeepSeek Harness revision must be pinned to an exact 40-character commit SHA');
}

const forbidden = [
  'ADMIN_PASSWORD',
  'ADMIN_TOKEN',
  'GATEWAY_READ_TOKEN',
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_WEBHOOK_SECRET',
  'VIP_WEBHOOK_SECRET',
  'DEEPSEEK_API_KEY',
  'SITE_URL',
  'WORKER_URL',
  'GATEWAY_URL',
];

for (const name of forbidden) {
  if (process.env[name]) {
    throw new Error(`DeepSeek Harness must not receive production-sensitive environment variable: ${name}`);
  }
}

console.log('DeepSeek Harness isolation policy: PASS');
console.log(`Pinned upstream commit: ${policy.commit}`);
console.log('Production access: false');
console.log('Production secrets: false');
console.log('Model execution: false');
console.log('Allowed profile: headless');
