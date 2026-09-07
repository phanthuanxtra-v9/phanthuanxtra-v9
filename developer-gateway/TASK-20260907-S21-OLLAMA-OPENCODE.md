# TASK-20260907-S21-OLLAMA-OPENCODE

## Purpose
Persistent handoff/checkpoint for the PHAN THUẦN XTRA V10 Android + S21 Ultra + OpenCode + Ollama + Cloudflare Workers AI work. Any AI peer can resume from this document without reconstructing the chat.

## Current owner
ChatGPT / Codex orchestration, with OpenCode Mobile/Web as a parallel coding/control peer.

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
7. OpenCode Mobile/Web is development/agent tooling, not a runtime dependency of the production APK.
8. OpenCode must not receive unrestricted production deploy/migration authority.
9. Record meaningful progress here or in the authoritative project checkpoint before handoff.

## Verified project baseline
The authoritative `MASTER_CONTEXT_PHAN_THUAN.md` records:
- S21 Ultra physical APK gate: PASSED.
- Android app ID: `com.phanthuanxtra.app`.
- Current documented APK: version `1.1.0`, versionCode `2`.
- Production App API base: `https://phanthuanxtra.com/api/app/v1`.
- Production Worker: `phanthuanxtra-v2`.
- Next core product stage: mobile management hardening, followed by Auto Bot E2E, vehicle lookup E2E, VIP Bot idempotency E2E and final acceptance.
- OpenCode Mobile/Web is approved as parallel tooling and must not block the APK roadmap.

## S21 Ultra / Termux environment — verified 2026-09-07
- OS inside proot: Debian GNU/Linux 13 (trixie), 13.6.
- Architecture: `aarch64`.
- Node.js: `v22.23.2`.
- npm: `10.9.8`.
- Git: `2.47.3`.
- OpenCode CLI: `1.18.29`.
- Wrangler was previously installed in the Debian environment, but the operational decision is: **do not depend on Wrangler on the S21 for Cloudflare production work**. Use GitHub Actions / Cloudflare Workers Builds for remote CI/CD.
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
- Latest memory observation while Phi-3 was loaded: total about `10 GiB`, available about `1.4 GiB`.
- Swap: `3.0 GiB` total, about `2.8 GiB` used / `161 MiB` free at latest measurement.
- Root filesystem: `225G` total, `160G` used, `65G` available.

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

A real inference test succeeded with `ollama run phi3:mini`. OpenCode also discovers it as `ollama/phi3:mini` after provider configuration. However, the model does **not support tools**, so OpenCode `build` and `plan` agents reject it with:
`registry.ollama.ai/library/phi3:mini does not support tools`.

Treat Phi-3 Mini as a local lightweight/fallback model, not the primary OpenCode coding agent.

## OpenCode ↔ Ollama connectivity — VERIFIED
From Debian/proot:
```bash
curl -s http://127.0.0.1:11434/api/tags
```
returns `phi3:mini`.

OpenCode model discovery:
```text
ollama/phi3:mini
```
Therefore OpenCode 1.18.29 can reach the Termux-host Ollama service.

## OpenCode provider configuration — VERIFIED
Global OpenCode config is:
`/root/.config/opencode/opencode.jsonc`

The configuration preserves the existing permission policy and Cloudflare MCP and now includes an Ollama provider using the OpenAI-compatible endpoint:
`http://127.0.0.1:11434/v1`

A backup was created before configuration changes.

Current limitation is model capability, not connectivity: `phi3:mini` has completion capability but no tool support.

## S21 memory strategy — DECIDED
Latest process inspection showed the Ollama `llama-server` for Phi-3 using roughly 3.6 GiB RSS. OpenCode itself was only about 46 MiB RSS. The S21 had only about 1.4 GiB available RAM and 161 MiB free swap at the latest measurement.

Therefore:
- Do **not** pull Llama 3 8B, Mistral 7B or Gemma 7B locally at this stage.
- Keep Phi-3 Mini installed but do not keep multiple large models resident simultaneously.
- Prefer Cloudflare Workers AI / AI Gateway / external cloud providers for heavier reasoning and coding tasks.
- If another local agent model is evaluated later, it must be selected by tool-calling support + measured RAM impact, not by model name alone.

## Cloudflare Workers AI strategy — DECIDED
Cloudflare Workers AI currently provides a free allocation of **10,000 Neurons per day** per account; limits reset daily at 00:00 UTC. Workers Paid retains the 10,000 free Neurons/day and bills additional usage. Current Cloudflare documentation should be treated as authoritative for model availability and pricing.

The project should exploit this edge AI capacity instead of overloading the S21. Target architecture:
```text
S21 Chrome / OpenCode Mobile-Web
        |
        v
GitHub branch / PR
        |
GitHub Actions or Cloudflare Workers Builds
        |
Cloudflare Worker
        |
AI Gateway / Workers AI
        |
Llama / Gemma / Mistral or current supported equivalents
        |
D1 / R2 / AI Search / application tools
```

Important: do not assume that old Llama 3 / Gemma / Mistral model IDs remain current. Check the current Cloudflare model catalog before implementation. Prefer a currently supported model with function/tool calling when the task requires agentic behavior.

## Cloudflare CI/CD strategy — DECIDED
The repository already has `.github/workflows/deploy-cloudflare.yml`.

Verified workflow behavior:
- `pull_request` and `workflow_dispatch` run validation/dry-run only.
- Production deployment runs only for a push to `main` after validation.
- Cloudflare credentials are referenced through GitHub Secrets.
- D1 migrations and production deployment are not executed by this S21/OpenCode local-AI setup.

Therefore the S21 does not need to run Wrangler for production deployment. GitHub Actions is the remote execution environment for Wrangler and Cloudflare CI/CD.

## OpenCode Mobile/Web — DECIDED
OpenCode Mobile/Web should be used on the S21 as a **development/control client**, not as a production runtime and not as the place where heavy models are hosted.

Recommended responsibilities:
- inspect repository;
- plan/code/review on isolated branches;
- monitor GitHub Actions;
- interact with local Ollama when useful;
- use cloud AI for heavy tasks;
- never receive unrestricted production deployment or destructive D1 permissions.

The existing OpenCode server is bound to `127.0.0.1:4096` and must remain private until authentication/private networking is configured.

## Current three-window layout
- Window 1: OpenCode server on `127.0.0.1:4096` — KEEP RUNNING.
- Window 2: Ollama server on `127.0.0.1:11434` — KEEP RUNNING.
- Window 3: OpenCode CLI / Termux shell for project commands — ACTIVE.

## Completed in this checkpoint
- Confirmed OpenCode 1.18.29 installation inside Debian/proot.
- Confirmed existing OpenCode global config and preserved it via backup.
- Confirmed Debian/proot can reach Termux Ollama.
- Registered Ollama provider in OpenCode.
- Confirmed `ollama/phi3:mini` appears in `opencode models ollama`.
- Tested OpenCode `build` and `plan`; both correctly reject Phi-3 because it lacks tool support.
- Measured S21 RAM pressure and identified the Ollama `llama-server` as the dominant model process.
- Decided against loading additional 7–8B local models.
- Decided Cloudflare Workers AI + AI Gateway should provide the heavier cloud inference layer.
- Decided GitHub Actions / Workers Builds should provide remote Cloudflare CI/CD rather than relying on S21 Wrangler.

## Immediate next actions
1. Do not pull another local model yet.
2. Configure OpenCode server authentication before any remote/public access.
3. On the isolated V10 branch, inspect the existing Worker AI/chat implementation and current Cloudflare bindings before adding a new AI router.
4. Verify which current Workers AI models are actually available to this Cloudflare account; prefer supported function/tool-calling models for agent tasks.
5. Design a non-production AI Gateway/Workers AI route with explicit rate/usage controls and no production secret exposure.
6. Add tests for AI routing/fallback behavior before any production deployment.
7. Continue V10 Android mobile management hardening in parallel.
8. Run CI and review the branch before proposing a PR.
9. Update this checkpoint with evidence before handoff.

## Handoff protocol
All AI peers must read:
- `MASTER_CONTEXT_PHAN_THUAN.md`
- `developer-gateway/AI-PEER-CONTINUITY.md`
- `developer-gateway/MULTI-AI-GATEWAY.md`
- this task checkpoint

Continue the same task ID. Do not restart completed work. Keep production behind the existing CI/review gate.

## Status summary
**V10 Android:** functional MVP already physically tested; mobile management hardening remains the next core product stage.

**S21 local AI:** Ollama 0.30.10 working; Phi-3 Mini installed; OpenCode provider connected; Phi-3 is completion-only and not suitable as the OpenCode tool-using agent.

**OpenCode:** CLI/server working; Ollama provider registration verified. Server authentication is the remaining security item before remote/public access.

**Cloudflare AI:** Workers AI 10,000 free Neurons/day should be used as the heavy cloud inference layer; model selection must follow the current Cloudflare catalog.

**Cloudflare CI/CD:** existing GitHub Actions workflow already keeps production deployment on `main`; S21 should not be the production deployment machine.

**Production:** not changed by this local AI setup.

**Handoff:** READY — this document now records the verified S21/Ollama/OpenCode state, the Cloudflare AI strategy, the CI/CD strategy and the exact next actions for another AI peer.
