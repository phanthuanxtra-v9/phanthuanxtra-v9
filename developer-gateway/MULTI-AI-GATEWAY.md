# XTRA Unified AI Gateway

## Mục tiêu

PHAN THUẦN XTRA dùng **một AI logic duy nhất**. Người dùng, App và GitHub Actions không chọn AI1/AI2/AI3/AI4/AI5; mọi tác vụ đi vào `xtra-unified-ai`.

Các năng lực chuyên môn trước đây của AI1–AI5 được hợp nhất thành các **vai trò nội bộ**, không còn là các agent độc lập trong execution path:

- kiến trúc/điều phối và checkpoint
- implementation/code/Cloudflare/API
- test/regression/acceptance
- security/reliability
- inference/runtime/failover

**Cloudflare Workers AI** là inference engine của logical agent tại Developer Gateway.

Đây là hợp nhất ở tầng ứng dụng/orchestration, không phải ghép trọng số của nhiều model thành một neural model mới.

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

Gateway trả về một logical agent `xtra-unified-ai`, sử dụng binding `AI` của Cloudflare Workers AI. Production mutation vẫn bị khóa.

## Execution path duy nhất

```text
User / App / GitHub Actions
          |
          v
  XTRA Unified AI Gateway
          |
          v
 Cloudflare Workers AI
          |
          v
   xtra-unified-ai
          |
     +----+----+
     |         |
   audit     test/fix proposal
     |         |
     +----+----+
          |
          v
      GitHub CI
          |
          v
 Cloudflare production gate
```

Không còn đường chạy song song tới Mistral/Gemma/Llama trong workflow continuity.

## Cloudflare Workers AI

`developer-gateway/wrangler.jsonc` khai báo:

- `ai.binding = AI`
- `UNIFIED_AI_ENABLED=true`
- `UNIFIED_AI_MODEL=@cf/meta/llama-3.1-8b-instruct`
- `AI_PEER_POLICY_VERSION=2`

Không đưa API key hoặc token vào source. Workers AI dùng binding của Cloudflare.

## Continuity

Checkpoint chính vẫn nằm trong GitHub Markdown:

- `MASTER_CONTEXT_PHAN_THUAN.md`
- `developer-gateway/AI-PEER-CONTINUITY.md`
- file này
- GitHub Issue #65 cho blocker production deploy + Admin E2E

Mỗi task phải có task ID, bằng chứng, trạng thái, bước tiếp theo và blocker. AI tiếp theo chỉ tiếp tục từ checkpoint, không đoán lại trạng thái.

## Workflow

`.github/workflows/ai-peer-continuity.yml` hiện chạy **một job Unified AI**, gửi task tới `/v1/ai/unified` và không gọi API riêng của Mistral/Gemma/Llama.

`developer-gateway/multi-ai-review.mjs` được giữ tên để tương thích workflow cũ nhưng đã trở thành client của logical agent duy nhất. `independent_peer_workers=0` là invariant của execution path mới.

## Quy tắc an toàn

- Không expose secrets.
- Không tự bật production mutation từ endpoint AI.
- Không báo deploy/production green nếu chưa có bằng chứng từ CI và smoke/E2E test.
- Ưu tiên thay đổi nhỏ, có rollback, không phá Auto Bot/VIP Bot/Admin/APK/D1/R2.
- Thiếu credential không được coi là lý do để bịa kết quả.

## Trạng thái

Đã hợp nhất logic trên `main`:

- `d929d1c33becdc50acb1296f2d9054cd090ab774` — unified AI endpoint.
- `ff4d085abafd382028977a70fdd5b13a555a6d95` — workflow client collapsed to one logical AI.
- `ae0aab8399c1a252655a441c5ca4caa4d67ffa4f` — continuity workflow uses Unified AI only.

**Chưa gọi là production green**: cần deployment Cloudflare thành công và smoke test `/v1/ai/unified` thực tế.