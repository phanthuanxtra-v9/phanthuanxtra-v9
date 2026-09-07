# TASK-20260907-V8-README-AUDIT

## Purpose
Clarify whether `README_V8_PRO.md` is relevant to the current V10 S21/OpenCode/Cloudflare AI work.

## Finding
`README_V8_PRO.md` is a historical V8 PRO handoff document. It is not the authoritative operational guide for V10. Its old deployment commands referenced local Wrangler usage and the earlier architecture, so they must not be copied into the current S21 workflow.

## Action completed
On branch `feat/v10-s21-termux-opencode-android`, the README was explicitly relabeled **LEGACY / ARCHIVE** and now points agents to:
- `MASTER_CONTEXT_PHAN_THUAN.md`
- `developer-gateway/AI-PEER-CONTINUITY.md`
- `developer-gateway/TASK-20260907-S21-OLLAMA-OPENCODE.md`

Commit: `3dfa3ddfcf1921da848455159e16c81a959619de`.

## Current operational decision
- S21 is the OpenCode Mobile/Web + local Ollama control/development station.
- Do not depend on Wrangler running on S21 for production CI/CD.
- Use GitHub Actions / Cloudflare Workers Builds for remote Cloudflare CI/CD.
- Keep production deployment behind existing validation and `main` gate.
- Keep `phi3:mini` as lightweight local fallback; it does not support OpenCode tools.
- Do not pull additional 7–8B local models while S21 RAM/swap is under pressure.
- Use Cloudflare Workers AI / AI Gateway for heavier cloud inference.

## AI implementation audit
`wrangler.json` already contains the Workers AI binding `AI` and the remote AI Search binding `AI_SEARCH`.
`src/ai-chat.js` currently calls Workers AI directly with model ID `@cf/meta/llama-3.1-8b-instruct`.
The current Cloudflare catalog marks that exact model ID deprecated. The active `@cf/meta/llama-3.1-8b-instruct-fast` remains available, and `@cf/meta/llama-3.2-3b-instruct` is an active multilingual model. Current Cloudflare docs should be checked before final model selection.

## Next action
Replace the deprecated AI-chat model on the V10 branch with a currently supported model, add a small routing/fallback abstraction, and test it in GitHub Actions without deploying production. Prefer a low-cost/fast model for routine showroom chat and reserve function-calling/reasoning models for explicit agent tasks.
