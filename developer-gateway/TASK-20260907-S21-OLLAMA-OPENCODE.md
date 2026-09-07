# TASK-20260907-S21-OLLAMA-OPENCODE

## Purpose
Persistent handoff/checkpoint for the PHAN THUẦN XTRA V10 Android + S21 Ultra Termux + OpenCode + local Ollama work. Any AI peer can resume from this document without reconstructing the chat.

## Current owner
ChatGPT / Codex orchestration, with OpenCode Mobile as a parallel coding peer.

## Repository
- Repo: `phanthuanxtra-v9/phanthuanxtra-v9`
- Working branch: `feat/v10-s21-termux-opencode-android`
- Production branch: `main` — do not modify directly.
- Website: `https://phanthuanxtra.com`

## Non-negotiable rules
1. Never write directly to `main` for this task.
2. Do not deploy Cloudflare production while validating local AI tooling.
3. Never expose or commit secrets, tokens, provider keys or credentials.
4. Preserve D1 migrations and existing production functionality.
5. Do not claim APK/build/production success without evidence.
6. S21 Ultra + Termux commands must remain mobile-safe.
7. OpenCode Mobile is development/agent tooling, not a runtime dependency of the production APK.
8. Record meaningful progress here or in the authoritative project checkpoint before handoff.

## Verified project baseline
The authoritative `MASTER_CONTEXT_PHAN_THUAN.md` records:
- S21 Ultra physical APK gate: PASSED.
- Android app ID: `com.phanthuanxtra.app`.
- Current documented APK: version `1.1.0`, versionCode `2`.
- Production App API base: `https://phanthuanxtra.com/api/app/v1`.
- Production Worker: `phanthuanxtra-v2`.
- Next core product stage: mobile management hardening, followed by Auto Bot E2E, vehicle lookup E2E, VIP Bot idempotency E2E and final acceptance.
- OpenCode Mobile is approved as parallel tooling and must not block the APK roadmap.

## S21 Ultra / Termux environment — verified 2026-09-07
- OS inside proot: Debian GNU/Linux 13 (trixie), 13.6.
- Architecture: `aarch64`.
- Node.js: `v22.23.2`.
- npm: `10.9.8`.
- Git: `2.47.3`.
- OpenCode CLI: `1.18.29`.
- Wrangler: `4.127.1`.
- Termux host user: Android app user `u0_a202`.
- Repo path used from Termux: `/sdcard/phanthuanxtra-v9`.

## OpenCode server — verified
Termux Window 1 is running:
```text
opencode serve --hostname 127.0.0.1 --port 4096
```
Observed server endpoint:
`http://127.0.0.1:4096`

Initial warning observed: `OPENCODE_SERVER_PASSWORD` is not set. The server is therefore unsecured locally. Do not expose port 4096 publicly. Authentication/private network access must be enabled before any remote/public access.

## Ollama — verified
Termux Window 2 is running Ollama server:
- Ollama version: `0.30.10`.
- API: `127.0.0.1:11434`.
- CPU inference only; Ollama reported `total_vram=0 B`.
- RAM observed: total about `10.3 GiB`, available about `2.6 GiB` at measurement time.
- Swap observed: `3.0 GiB` total, about `1.3 GiB` available at measurement time.
- Root filesystem observed: `225G` total, `158G` used, `67G` available.

Ollama API from both Termux host and Debian/proot successfully returned the model list.

## Installed local model — verified
```text
phi3:mini
parameter size: 3.8B
quantization: Q4_0
model size: ~2.18 GB
context length: 131072
capability: completion
```

A real inference test succeeded with `ollama run phi3:mini`, but the Vietnamese response quality was poor/garbled. Treat Phi-3 Mini as a local fallback/fast model, not yet as the primary project reasoning model.

## OpenCode ↔ Ollama connectivity — verified
From Debian/proot, this command successfully returned the Termux-host Ollama model list:
```bash
curl -s http://127.0.0.1:11434/api/tags
```
Therefore the current environment allows OpenCode's Debian/proot runtime to reach the Ollama API on `127.0.0.1:11434`.

## OpenCode provider configuration — NOT YET COMPLETED
OpenCode model selector currently shows OpenCode Zen/OpenAI/Google/etc., but Ollama was not visible in the provider menu.
`~/.config/opencode` currently had no files when inspected.
No `opencode.json` has been created yet as of this checkpoint.

Do NOT guess or overwrite provider configuration. Next step is to use the actual OpenCode 1.18.29 configuration schema/docs and create a minimal Ollama provider configuration that preserves any existing project configuration.

## Model strategy
Because the S21 currently has only about 2.6 GiB available RAM and CPU-only inference:
- Keep only one substantial local model loaded at a time.
- Phi-3 Mini is already installed and verified.
- Do not pull Llama 3 8B, Mistral or Gemma locally until memory impact and quantization are assessed.
- Prefer cloud/API models for heavier coding/reasoning tasks.
- Desired peer roles remain compatible with the project continuity protocol: Mistral for implementation/API/Cloudflare reasoning; Gemma for tests/regression/Android/API acceptance; Llama for security/reliability review; ChatGPT for architecture/audit/final verification.

## Current three-window layout
- Window 1: OpenCode server on `127.0.0.1:4096` — KEEP RUNNING.
- Window 2: Ollama server on `127.0.0.1:11434` — KEEP RUNNING.
- Window 3: OpenCode CLI / Termux shell for project commands — ACTIVE.

## Immediate next actions
1. In Termux Window 3, inspect any project-level OpenCode config:
```bash
find /sdcard/phanthuanxtra-v9 -maxdepth 2 \( -name 'opencode.json' -o -name 'opencode.jsonc' \) -print
```
2. Inspect OpenCode 1.18.29 provider/config documentation or built-in schema.
3. Create the minimal Ollama provider config without overwriting unrelated settings.
4. Restart/reload OpenCode and verify `phi3:mini` appears as an Ollama model.
5. Run a short coding-oriented local inference test.
6. Only after local provider verification, evaluate whether a small additional model is safe on the S21.
7. Continue V10 Android mobile management hardening on the isolated branch.
8. Run tests/CI before proposing a PR.
9. Update this checkpoint with evidence before handing off.

## Handoff protocol
All AI peers must read:
- `MASTER_CONTEXT_PHAN_THUAN.md`
- `developer-gateway/AI-PEER-CONTINUITY.md`
- `developer-gateway/MULTI-AI-GATEWAY.md`
- this task checkpoint

Continue the same task ID. Do not restart completed work. Keep production behind the existing CI/review gate.

## Status summary
**V10 Android:** functional MVP already physically tested; mobile management hardening is the next core product stage.

**S21 local AI:** Ollama installed and working; Phi-3 Mini installed and inference verified.

**OpenCode:** CLI/server working; Ollama provider registration remains the immediate technical blocker.

**Cloudflare production:** not touched by this local AI setup.

**Handoff:** READY — another AI peer can resume from this document and the authoritative project checkpoints.
