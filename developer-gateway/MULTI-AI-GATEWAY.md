# XTRA Unified AI Gateway

## Mục tiêu

PHAN THUẦN XTRA dùng **một giao diện AI logic duy nhất** thay vì buộc người dùng chọn AI1/AI2/AI3/AI4/AI5. Các năng lực chuyên môn được hợp nhất thành một task contract và một gateway:

- **ChatGPT** — điều phối, kiến trúc, đối chiếu checkpoint và xác minh cuối.
- **Mistral** — code/Cloudflare/API implementation.
- **Gemma** — test, regression, edge cases, Android/API acceptance.
- **Llama** — security/reliability, auth, secrets, idempotency, concurrency.
- **Cloudflare Workers AI** — inference engine tại gateway, fallback/runtime AI và xử lý tác vụ hợp nhất.

Đây là **hợp nhất ở tầng ứng dụng/orchestration**, không phải ghép trọng số của năm mô hình thành một model mới. Người dùng chỉ cần giao việc cho `xtra-unified-ai`; gateway chịu trách nhiệm chọn engine và vai trò.

## Endpoint hợp nhất

`POST /v1/ai/unified`

Yêu cầu Bearer `GATEWAY_READ_TOKEN` và JSON:

```json
{
  "instruction": "Audit và tiếp tục task TASK-123...",
  "context": "Checkpoint hoặc bằng chứng liên quan",
  "mode": "audit",
  "task_id": "TASK-123"
}
```

Gateway trả về một logical agent `xtra-unified-ai` và hiện tại sử dụng binding `AI` của Cloudflare Workers AI làm inference engine. Production mutation vẫn bị khóa.

## Cloudflare Workers AI

`developer-gateway/wrangler.jsonc` khai báo:

- `ai.binding = AI`
- `UNIFIED_AI_ENABLED=true`
- `UNIFIED_AI_MODEL=@cf/meta/llama-3.1-8b-instruct`
- `AI_PEER_POLICY_VERSION=2`

Không đưa API key hoặc token vào source. Workers AI dùng binding của Cloudflare; các provider peer bên ngoài tiếp tục dùng secret riêng khi workflow Multi-AI được gọi.

## Continuity

Checkpoint chính vẫn nằm trong GitHub Markdown:

- `MASTER_CONTEXT_PHAN_THUAN.md`
- `developer-gateway/AI-PEER-CONTINUITY.md`
- file này
- GitHub Issue #65 cho blocker production deploy + Admin E2E

Mỗi task phải có task ID, bằng chứng, trạng thái, bước tiếp theo và blocker. AI tiếp theo chỉ tiếp tục từ checkpoint, không đoán lại trạng thái.

## Execution model

```text
                  User / App / ChatGPT
                         |
                         v
                XTRA Unified AI Gateway
                         |
          +--------------+--------------+
          |              |              |
       Cloudflare      Peer roles     GitHub CI
       Workers AI   Mistral/Gemma/Llama   + Codex
          |              |              |
          +--------------+--------------+
                         |
                         v
                one logical XTRA AI
                         |
                  audit / test / fix
                         |
                         v
                    PR + CI gate
                         |
                         v
                   Cloudflare deploy
```

## Quy tắc an toàn

- Không expose secrets.
- Không tự bật production mutation từ endpoint AI.
- Không báo deploy/production green nếu chưa có bằng chứng từ CI và smoke/E2E test.
- Ưu tiên thay đổi nhỏ, có rollback, không phá Auto Bot/VIP Bot/Admin/APK/D1/R2.
- Peer AI có thể không được cấu hình; thiếu credential không được coi là lý do để bịa kết quả.

## Trạng thái hiện tại

Đã commit lớp hợp nhất vào `main`:

- `f7164d555893fd905baf913779ec7c255b5654d5` — bind Cloudflare Workers AI.
- `d929d1c33becdc50acb1296f2d9054cd090ab774` — unified AI endpoint.

**Chưa được gọi là production green** cho đến khi Cloudflare deployment chạy thành công và endpoint `/v1/ai/unified` được smoke test thực tế.
