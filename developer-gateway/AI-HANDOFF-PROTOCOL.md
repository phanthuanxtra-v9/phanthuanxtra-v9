# PHAN THUẦN XTRA — AI HANDOFF PROTOCOL

**Status:** Authoritative project operating protocol
**Scope:** ChatGPT/Codex, GitHub Copilot, Mistral, Gemma, Llama and future approved AI peers

## 1. Purpose

This protocol makes project work persistent across AI sessions, providers, devices and usage limits. No AI peer should need to reconstruct the PHAN THUẦN XTRA project from memory when another peer can continue it.

## 2. Source of truth

Before meaningful work, every AI peer MUST read, in this order:

1. `developer-gateway/TASK-LEDGER.md`
2. `MASTER_CONTEXT_PHAN_THUAN.md`
3. `developer-gateway/AI-PEER-CONTINUITY.md`
4. `developer-gateway/MULTI-AI-GATEWAY.md`
5. Relevant task files, CI workflows and code referenced by the current ledger entry

If the ledger and a chat message disagree, the peer must verify the repository state before changing anything.

## 3. Stable task identity

Every meaningful task MUST have a stable `TASK-ID`.

A peer taking over work MUST preserve the existing task ID. It MUST NOT create a replacement task merely because the previous peer stopped, reached quota or changed provider.

Suggested format:

`TASK-YYYYMMDD-SHORT-NAME`

## 4. Start-of-session procedure

Before editing:

1. Read the current ledger.
2. Identify the latest active task ID.
3. Identify the latest verified commit/branch/PR.
4. Read the stated next action and blockers.
5. Inspect the relevant files and CI status.
6. State internally what is already complete so completed work is not repeated.

## 5. Work rules

AI peers MUST:

- continue from the latest verified checkpoint;
- make the smallest safe change that solves the stated task;
- work on a non-`main` branch for repository mutations;
- prefer a PR for reviewable changes;
- run relevant tests/checks before handoff;
- record evidence using commit SHA, PR number, CI result or other verifiable repository state;
- never claim a change is complete without verification;
- never expose or write provider keys, GitHub tokens, Cloudflare tokens, passwords or other secrets into prompts, Markdown, source or logs.

AI peers MUST NOT:

- force-push or rewrite history unless explicitly authorized;
- deploy to production merely to test an AI change;
- bypass CI, review rules or the existing Production Gate;
- modify production credentials;
- silently discard previous ledger history.

## 6. Handoff procedure

When stopping, reaching quota, becoming unavailable or transferring work:

1. Keep the same `TASK-ID`.
2. Record the latest verified checkpoint.
3. Record completed actions.
4. Record evidence.
5. Record the exact next action.
6. Record blockers and assumptions.
7. Record `Production mutation: NOT ATTEMPTED` unless a separately authorized production mutation was actually verified.
8. Append a new entry to `developer-gateway/TASK-LEDGER.md`.

The next peer starts by reading that entry and continues from its `Next action`.

## 7. Mandatory handoff template

Append this structure to `developer-gateway/TASK-LEDGER.md`:

```text
## HANDOFF-<DATE>-<TASK-ID>-<SEQUENCE>

**Date/time (UTC):** <timestamp>
**Current AI peer:** <ChatGPT|Copilot|Mistral|Gemma|Llama>
**Task ID:** <stable task id>
**Current checkpoint:** <branch / commit / PR>

**Objective:** <one clear sentence>

**Completed actions:**
1. <action>
2. <action>

**Evidence:**
- <verified commit / PR / CI / file>

**Next action:**
1. <exact next step>
2. <exact verification>

**Blockers:**
- <blocker or None>

**Production mutation:** NOT ATTEMPTED
```

## 8. Peer failover order

Default continuity order:

`ChatGPT → GitHub Copilot → Mistral → Gemma → Llama → ChatGPT`

This is a continuity order, not a quality ranking. Task-specialist routing may select a different peer when appropriate.

## 9. Role boundaries

- **ChatGPT/Codex:** architecture, orchestration, cross-system reasoning and final verification.
- **GitHub Copilot:** repository-native coding, review and GitHub workflow assistance.
- **Mistral:** implementation, API and Cloudflare reasoning.
- **Gemma:** tests, regression and Android/API acceptance.
- **Llama:** security, reliability, authorization, concurrency and blast-radius review.

Any peer may identify a better approach, but the task ID and handoff state remain shared.

## 10. Production safety

AI peers operate in a development/review boundary by default.

The production path is:

`AI change → isolated branch → PR → CI → review/Production Gate → Cloudflare production`

No peer may treat a successful local test or generated patch as production approval.

## 11. Recovery rule

If a peer encounters an error or incomplete state:

- do not erase the failed evidence;
- record the failure and exact error;
- preserve the task ID;
- identify the safest next diagnostic step;
- hand off to the next peer if necessary.

## 12. Definition of continuity

A task is considered continuously recoverable only when another peer can read the repository and determine:

- what the task is;
- what has already been done;
- what commit/branch/PR is authoritative;
- what evidence exists;
- what remains to do;
- what is blocked;
- whether production was touched.

If any of these are missing, the current peer must repair the handoff record before stopping.

## 13. Permanent rule

**The repository is the long-term memory. The task ID is the identity. The ledger is the handoff. The PR is the review boundary. CI is the verification boundary. The Production Gate is the deployment boundary.**
