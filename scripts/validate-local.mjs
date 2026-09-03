import { readFile } from 'node:fs/promises';
const readJson = async file => JSON.parse(await readFile(file, 'utf8'));
const packageJson = await readJson('package.json');
const worker = await readJson('wrangler.json');
const contract = await readJson('developer-gateway/api-contract.json');
const gatewayConfig = JSON.parse((await readFile('developer-gateway/wrangler.jsonc', 'utf8')).split('\n').filter(line => !line.trim().startsWith('//')).join('\n'));
if (/wrangler\s+deploy|--dry-run/.test(packageJson.scripts.check || '')) throw new Error('check must not invoke Wrangler deployment');
if (!worker.main || !gatewayConfig.main || !contract.paths['/v1/codex/tasks']) throw new Error('required local configuration is incomplete');
console.log('local configuration validation passed');
