# AI Agent Protocol — PHAN THUẦN XTRA

## 1. Purpose

This repository is a shared codebase worked on by the owner, Arena Agent, GPT-5.6 Luna, and peer AI agents (AI1–AI5), including AI inference executed through Cloudflare Workers AI. All agents are peers. No agent is the owner or architectural authority by default.

The goal is to make changes safely, reproducibly, and without overwriting valid work from another agent.

## 2. Mandatory preflight / source of truth

The source of truth is the Git repository and the current state of `main` plus its pull requests.

**HARD COORDINATION GATE — applies to EVERY AI, including every Cloudflare Workers AI model invocation:**

Before an AI is allowed to analyze a task, propose an implementation, modify code, create a branch, or mutate infrastructure, it MUST first read:

1. `AI-WORK-REGISTRY.md` — mandatory first read for collision control and active ownership;
2. `AI_AGENT_PROTOCOL.md` — this protocol;
3. `AI-HANDOFF-CHECKPOINT.md`;
4. `MASTER_CONTEXT_PHAN_THUAN.md`;
5. any applicable current-state documents listed below;
6. the current `main` state and relevant open PRs before implementation.

For Workers AI specifically, the registry/protocol context MUST be supplied to the model as part of the AI task context before inference is used for implementation decisions. A Workers AI call that has not received the current coordination context MUST NOT be treated as an implementation authority.

Then read, when present and relevant:

- `project-docs/PROJECT_STATE.md` (reconcile against current main because it may be historical)
- `project-docs/AI_HANDOFF.md` (reconcile against current main)
- `TODO.md`
- `CHANGELOG.md`
- `BUGS.md`
- `ARCHITECTURE.md`
- `DEPLOYMENT.md`

Historical audit/session Markdown is evidence, not an executable task queue. Never execute an old document's `NEXT ACTION` merely because it exists.

Never assume an old conversation or an old task description is newer than the repository.

### Preflight failure rule

If `AI-WORK-REGISTRY.md` cannot be read, is stale/unavailable, or conflicts materially with current `main`/open PR state, the AI MUST STOP implementation and perform reconciliation first. It may report the discrepancy, but must not create a competing implementation based on an unverified assumption.

## 3. Agent roles

### Owner

The owner defines product intent and gives final approval for material production changes.

### Arena Agent

Arena is a coding agent. It may inspect code, implement changes, add tests, run tests in its sandbox, create a branch, commit, push, and open a pull request.

Arena must not deploy production directly and must not push directly to `main` for normal development work.

### GPT-5.6 Luna

GPT-5.6 Luna acts as reviewer/integration controller: inspect diffs, reason about architecture and security, verify CI, identify regressions, and decide whether a PR is ready for merge when explicitly authorized.

### AI1–AI5 and Workers AI

AI1–AI5 and any Cloudflare Workers AI model are peer participants. Their labels/models describe perspectives or execution engines, not ownership. Every participant is bound by the same mandatory preflight gate and collision protocol.

Workers AI may analyze, classify, draft, review, or recommend, but it must not independently create a second implementation path when the registry/open PR state already identifies an owner. Production mutations remain subject to the repository's CI/CD and approval gates.

## 4. Standard development flow

Use this flow for normal code changes:

```text
READ AI-WORK-REGISTRY
  -> READ AI_AGENT_PROTOCOL
  -> READ CURRENT HANDOFF / MASTER CONTEXT
  -> CHECK GIT/PR STATE
  -> CHECK FOR EXISTING OWNER/PR
  -> INSPECT CODE
  -> IDENTIFY DONE VS MISSING
  -> CREATE BRANCH ONLY IF NO EXISTING IMPLEMENTATION PATH
  -> IMPLEMENT
  -> ADD/UPDATE TESTS
  -> RUN RELEVANT TESTS
  -> COMMIT
  -> PUSH
  -> OPEN/UPDATE PR
  -> GITHUB ACTIONS
  -> REVIEW
  -> MERGE ONLY WHEN GATES PASS
  -> PRODUCTION DEPLOY VIA GITHUB ACTIONS
  -> UPDATE AI-WORK-REGISTRY + HANDOFF
```

Do not restart completed work merely because a task was reopened in conversation.

## 5. Branch rules

- `main` is the production source of truth.
- Normal development must use a topic branch and pull request.
- Recommended prefixes: `feat/`, `fix/`, `ui/`, `refactor/`, `perf/`, `test/`, `security/`, `docs/`, `chore/`.
- Never force-push `main`.
- Never delete or rewrite another agent's branch without explicit authorization.
- Do not work on the same logical task in multiple branches simultaneously unless explicitly coordinated.
- If an existing PR already owns the logical task, review/update that path instead of creating a competing implementation.

## 6. Pull request rules

A PR should contain one coherent logical change whenever practical.

The PR description must explain:

1. what changed;
2. why it changed;
3. tests added/updated;
4. tests executed;
5. production impact;
6. migrations/configuration changes, if any;
7. security or secret implications, if any.

Do not merge a PR merely because the code looks correct. Required CI must pass on the latest PR commit.

## 7. CI/CD rules

GitHub Actions is the authoritative CI/CD gate.

For this project:

- PR changes must run validation tests and Wrangler dry-run validation.
- Pushes to `main` may deploy production only after validation succeeds.
- Production deployment must occur through GitHub Actions.
- Do not use local Wrangler on Android/Termux for production deployment.
- D1 production migrations must be applied by the production workflow.
- A failed or missing required check blocks merge.

The workflow must keep validation and production deployment as separate jobs, with production depending on successful validation.

## 8. Required validation expectations

At minimum, relevant changes must preserve:

- JavaScript syntax validation;
- automated Node tests;
- production-gate tests;
- Wrangler dry-run validation;
- D1 migration safety;
- binding/configuration correctness.

If a change affects Telegram, AI Chat, media/branding, D1, or deployment configuration, add or update regression tests.

## 9. Telegram auto-publish safety

Vehicle auto-publish is allowed only when the AI extraction has reliable vehicle identity, including real `brand` and `model`, and meets the configured confidence threshold (currently `>= 0.85`).

Never fabricate vehicle information to satisfy a missing field.

Preserve idempotence:

- duplicate Telegram webhook deliveries must not create duplicate vehicles/posts;
- `telegram_posts` is the final publication gate;
- deterministic Telegram-ingest vehicle IDs must remain stable;
- failed publication must remain observable and retryable.

A real production Telegram post must never be created solely to make CI appear green.

## 10. AI Chat safety

Unknown or out-of-scope questions must be handed to a human when reliable knowledge is unavailable.

The expected behavior is:

```text
UNKNOWN
 -> do not invent an answer
 -> persist unknown question
 -> request/accept contact information
 -> route to CRM when configured
 -> human follow-up
```

Regression tests must verify that the unknown/human-handoff path does not call the model as though it has authoritative knowledge.

## 11. Vehicle data integrity

The vehicle catalog must contain real known data only.

Do not create fake cars, prices, mileage, specifications, ownership history, legal registration numbers, or customer information for testing.

Use mocks/fixtures for automated tests.

## 12. PT Xtra media branding

PT Xtra branding is a display/marketing overlay, not a legal vehicle registration number.

The original R2 vehicle image must remain unchanged. Branding transformations must fail closed when required transformation resources are unavailable, rather than silently producing an unsafe/unbranded publication.

Never claim an official Vietnamese registration-plate font or legal plate format unless it has been verified from an authoritative source.

## 13. Secrets and credentials

Never commit or expose:

- Cloudflare API tokens;
- GitHub tokens/PATs;
- Telegram bot tokens;
- CMS API keys;
- gateway tokens;
- customer credentials or private data.

Use GitHub Actions Secrets, Cloudflare Secrets, or other approved secret stores.

Never ask the owner to paste a secret into a public issue, PR, source file, or agent prompt.

## 14. Database/migration rules

Before changing migrations:

1. inspect the current migration sequence;
2. ensure the migration is additive and deterministic where possible;
3. verify the application code matches the schema;
4. add regression tests;
5. let GitHub Actions apply production migrations.

Never edit an already-applied production migration to change its historical meaning. Create a new migration instead.

## 15. Documentation/handoff

After a meaningful implementation change, update the relevant project state/handoff documentation.

A handoff should state:

- current commit/branch;
- completed work;
- tests and results;
- remaining risks;
- next recommended action.

**For cross-AI coordination, update `AI-WORK-REGISTRY.md` with the logical workstream, branch/PR, files touched, evidence, blocker and next owner/action.**
