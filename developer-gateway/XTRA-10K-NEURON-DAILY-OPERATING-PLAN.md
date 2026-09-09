# XTRA 10K-Neuron Daily Operating Plan

**Status:** ACTIVE BY USER DIRECTIVE
**Scope:** PHAN THUẦN XTRA / S21 Ultra Command Center / Developer Gateway / GitHub / Cloudflare / Telegram / APK
**Effective:** 2026-09-09

## 1. Operating directive

The project is to continuously make productive use of the user's available **10k-neuron daily AI capacity** until the user changes that requirement.

"10k neurons" is treated as an **available daily work budget/capacity**, not as a provider API quota that this repository can measure directly. The system must never fabricate usage numbers. Actual provider usage is reported only when provider telemetry is available.

Priority is productive project work, not artificial token burning.

## 2. Daily allocation policy

Use the available capacity flexibly across the highest-value unblocked tasks:

1. **S21 Ultra / APK Command Center — 25%**
   - UX, reliability, lifecycle, networking, token storage, vehicle operations.
   - Device/runtime validation when a physical device is available.

2. **Cloudflare / Gateway / backend — 25%**
   - Architecture audit, Worker/API correctness, observability, security, performance.
   - Production mutations remain behind existing gates.

3. **Telegram automation — 20%**
   - Auto Bot, Vehicle Lookup Bot, VIP Bot, webhook reliability, idempotency, media pipeline.
   - Never invent undocumented endpoints or schemas.

4. **QA / Security / reliability — 20%**
   - Regression analysis, auth, secrets, concurrency, failure recovery, blast-radius review.
   - Verify every claimed result with CI/runtime evidence.

5. **Architecture / documentation / handoff — 10%**
   - Checkpoints, task records, cross-AI handoff, dependency mapping, next-action queue.

These percentages are a starting policy, not a rigid quota. If one stream is blocked, capacity moves to another unblocked stream.

## 3. Multi-AI worker roles

- **ChatGPT:** architecture, cross-system audit, coordination, final verification.
- **Mistral:** implementation/code/Cloudflare/API reasoning.
- **Gemma:** regression, testing, Android/API acceptance.
- **Llama:** security, reliability, authorization, concurrency and blast-radius review.

Routing is task-based. No provider credential is shared between peers.

## 4. Work loop

Each worker/task must follow:

```text
READ CHECKPOINT
  -> AUDIT CURRENT STATE
  -> SELECT HIGHEST-VALUE UNBLOCKED TASK
  -> IMPLEMENT MINIMAL SAFE CHANGE
  -> TEST
  -> VERIFY WITH EVIDENCE
  -> RECORD CHECKPOINT
  -> HAND OFF / SELECT NEXT TASK
```

Completed work must not be repeated merely to consume capacity. Re-verification is allowed when it materially reduces risk.

## 5. Task record contract

Every substantial task must record:

- TASK_ID
- OWNER / SPECIALIST
- START_COMMIT
- OBJECTIVE
- CURRENT_STATE
- CHANGES
- TESTS
- EVIDENCE
- BLOCKERS
- NEXT_ACTION
- HANDOFF_TARGET

The authoritative state remains GitHub Markdown so another AI can continue without reconstructing the conversation.

## 6. S21 Ultra as system command center

Target operating model:

```text
                    S21 ULTRA
               XTRA COMMAND CENTER
                        |
          +-------------+-------------+
          |             |             |
       SYSTEM        VEHICLES      AI CONTROL
          |             |             |
       GitHub       Telegram       Gateway
          |             |             |
          +-------------+-------------+
                        |
                 Developer Gateway
                        |
              +---------+---------+
              |                   |
           GitHub             Cloudflare
           CI/PR              Workers/D1/R2
```

The APK may orchestrate approved capabilities but must not become a secret-sharing bridge. Tokens stay in secure stores and are never injected into WebView/chat prompts.

## 7. Safety gates

- Never commit real API tokens, provider keys or production credentials.
- Never expose production secrets to AI prompts, Markdown checkpoints or WebView.
- Never write directly to `main` from an autonomous specialist worker.
- Changes should use a branch + PR + CI.
- Production deployment remains behind the existing Cloudflare/CI production gate.
- Do not claim deployment, merge, production health or API success without evidence.
- Do not invent an API endpoint, database field, Worker binding or Cloudflare resource.
- Do not merge PR #51 without explicit human authorization.

## 8. Current launch queue

### P0 — Execute first

- Finish verification of reconciled APK branch `refactor/apk-architecture-v1` at commit `07b2575079f27f1d6ab56ee6840dae341f70909e`.
- Android CI evidence: run `34319625977` SUCCESS.
- Application validation: run `34319626002` SUCCESS.
- Cloudflare validation: run `34319625987` SUCCESS; production deployment correctly SKIPPED on refactor branch.
- Re-fetch PR #51 mergeability/status before any merge decision.

### P1 — S21 Command Center

- Complete runtime/regression audit of Operator Hub.
- Verify secure token persistence/clearing behavior.
- Verify MainActivity CRUD, gallery/edit, AI vehicle flow and navigation.
- Identify high-confidence UX/performance improvements without breaking the API contract.

### P2 — Automation

- Audit Auto Bot, Vehicle Lookup Bot and VIP Bot for single-flight/idempotency/retry behavior.
- Audit Telegram media → Vehicle AI → D1 → website publishing flow.
- Ensure `PT Xtra` plate transformation remains enforced before publishing.

### P3 — AI executor

- Upgrade reviewer/proposal workflow toward constrained peer executor.
- Executor creates/updates branch and PR, runs CI, and never receives production credentials.
- Preserve the existing production gate.

### P4 — Continuous improvement

- Security and reliability audit.
- Performance audit.
- Observability improvements.
- Documentation/checkpoint maintenance.
- Remove dead code only when verified safe.

## 9. Daily capacity policy

At the start of each work cycle:

1. Read this file and the latest project checkpoint.
2. Inspect GitHub branch/PR/CI state.
3. Inspect currently configured multi-AI capability and blockers.
4. Allocate available AI capacity to P0→P4, dynamically rebalancing around blockers.
5. Continue until the available daily capacity is productively exhausted **or** all currently safe/unblocked work is exhausted.
6. Record what was actually consumed/verified when telemetry exists; otherwise record work units, not fabricated neuron counts.

## 10. User change control

This plan stays active until the user explicitly changes the 10k-neuron requirement, allocation, priorities, or stop condition.

A user instruction such as `tiến hành`, `tiếp tục`, `làm ngay`, or `fix ngay` means continue the highest-priority unblocked work under this plan, subject to the safety/approval gates above.
