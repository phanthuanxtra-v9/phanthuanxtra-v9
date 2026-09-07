# AI Peer Continuity — PHAN THUẦN XTRA

## Decision

ChatGPT, Mistral, Gemma and Llama are treated as **co-equal project AI peers at the task/capability layer**. The purpose is continuity: when ChatGPT Free reaches a usage limit, another configured AI peer can continue the same project task without reconstructing the project from the beginning.

This does **not** mean sharing one provider credential. Each provider keeps its own API credential, while the Developer Gateway defines one common project capability contract.

## Common project capabilities

Every AI peer must be able to:

1. Read the authoritative Markdown checkpoints in GitHub.
2. Inspect the repository state and CI results.
3. Inspect the Developer Gateway and Cloudflare Worker configuration through the approved execution path.
4. Receive the same task instruction and task ID.
5. Audit, test, diagnose and propose concrete fixes.
6. Continue from the last recorded checkpoint instead of restarting the project.
7. Return structured evidence: files, tests, findings, proposed changes and blockers.
8. Hand off unfinished work to another AI peer using the same task record.

## Capability parity model

```text
                 AI PEER CAPABILITY CONTRACT
                            |
       +--------------------+--------------------+
       |                    |                    |
    ChatGPT              Mistral              Gemma/Llama
       |                    |                    |
       +--------------------+--------------------+
                            |
                     Developer Gateway
                            |
                GitHub task + checkpoint state
                            |
                 CI / review / production gate
                            |
                       Cloudflare
```

The parity is **operational**, not credential-sharing. A model must never receive another provider's API key or the production Cloudflare credential.

## Failover rule

When the current AI peer becomes unavailable or reaches a provider quota:

1. Preserve the current task ID.
2. Read `MASTER_CONTEXT_PHAN_THUAN.md` and this file.
3. Read the latest task/checkpoint Markdown.
4. Continue the same task with the next configured peer.
5. Do not repeat completed work unless verification is required.
6. Record the handoff and result in Markdown.
7. Production deployment remains behind the existing CI/Cloudflare gate.

Recommended order for general continuity:

```text
ChatGPT → Mistral → Gemma → Llama → ChatGPT
```

The order is not a quality ranking. The Gateway may route by task specialization or availability.

## Specialist routing

- **Mistral:** implementation/code/Cloudflare/API reasoning.
- **Gemma:** test, regression, Android/API acceptance.
- **Llama:** security, reliability, authorization, concurrency and blast-radius review.
- **ChatGPT:** architecture, cross-system audit, coordination and final verification when available.

All four remain peers for project continuity. Specialist routing only chooses the strongest default worker for a task.

## Work record

The authoritative state must remain in GitHub Markdown, not inside a single chat session. At minimum keep:

- `MASTER_CONTEXT_PHAN_THUAN.md` — project checkpoint.
- `developer-gateway/AI-PEER-CONTINUITY.md` — peer/failover contract.
- `developer-gateway/MULTI-AI-GATEWAY.md` — provider integration.
- Future task records should include task ID, current owner, completed steps, evidence, next step and blockers.

## Security boundary

AI peers must not receive raw production secrets in prompts or Markdown. Cloudflare API tokens, GitHub tokens, `APP_API_TOKEN`, provider keys and gateway authentication secrets remain in GitHub/Cloudflare secret stores.

GitHub Actions should grant only the permissions required by each job. Review jobs remain read-only; any write-capable executor must be isolated in its own job with explicit permissions.

## Current implementation status

- Multi-AI specialist workflow: implemented on the `feature/multi-ai-developer-gateway` branch.
- Provider credentials: configured only through GitHub/Cloudflare secret stores; never commit values.
- Production mutation by specialist workers: disabled.
- Common task/checkpoint contract: this document.
- Direct autonomous production deployment by an AI peer: **not enabled**.
- Cloudflare production deployment: remains behind the existing production CI gate.

## Next implementation gate

Upgrade the current reviewer-only workflow into a peer executor pipeline where an AI peer may propose a patch or PR through a constrained GitHub Actions executor. The executor must:

1. run in a separate job with explicit `contents: write` / `pull-requests: write` only when needed;
2. validate the generated change;
3. create/update a branch and PR rather than writing directly to `main`;
4. run the existing CI;
5. allow Cloudflare production deployment only after the existing production gate succeeds.

This is the mechanism that gives the non-ChatGPT peers practical continuity without handing production credentials directly to the model.
