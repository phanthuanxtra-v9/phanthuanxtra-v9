# PHAN THUẦN XTRA — AI HANDOFF CHECKPOINT

> Mục đích: mọi AI tiếp theo có thể mở file này và tiếp quản công việc ngay, không cần hỏi lại lịch sử.

## 1. DỰ ÁN
- Repository: `phanthuanxtra-v9/phanthuanxtra-v9`
- Production domain: `https://phanthuanxtra.com/`
- Production Worker: `phanthuanxtra-v2`
- Branch chính: `main`
- Kiến trúc chuẩn: User → Website/App/Telegram → App API → Developer Gateway → Production Worker → D1/R2/Workers AI → Website.

## 2. NGUYÊN TẮC BẮT BUỘC CHO AI TIẾP QUẢN
1. **Verify before claim**: không ghi “đã xong”, “production GREEN”, “deploy thành công”, “API hoạt động” nếu chưa có bằng chứng kiểm tra thực tế.
2. Khi được yêu cầu `tiến hành ngay`, `làm ngay`, `tiếp tục`, `fix ngay`: nếu có quyền và công cụ thì thực thi → kiểm tra → sửa tiếp nếu lỗi → xác minh production.
3. Không đoán cấu hình Cloudflare, secrets, binding, API hoặc endpoint. Phải đọc repo/workflow/config thực tế trước.
4. Không yêu cầu người dùng lặp lại thông tin đã có trong checkpoint này trừ khi thông tin đã thay đổi hoặc thiếu quyền xác thực.
5. Không dùng ADMIN_TOKEN, API key, secret hoặc credential trong file `.md`. Chỉ ghi tên biến/mục đích, không ghi giá trị.
6. Mỗi AI sau khi làm việc phải cập nhật checkpoint này hoặc file handoff tương ứng với: thời điểm, commit SHA, việc đã làm, test/evidence, blocker, bước tiếp theo.

## 3. MÔ HÌNH AI 5 VAI TRÒ
Các AI có thể thay phiên nhau. AI nhận việc phải đọc checkpoint trước.

- **AI1 — Executor**: triển khai/fix code, CI/CD, Telegram Auto Bot.
- **AI2 — Auditor**: audit kiến trúc, security, API, D1/R2, regression.
- **AI3 — AI/Content**: Chat AI, Workers AI, nhận diện xe/ảnh, sinh nội dung.
- **AI4 — Frontend/Admin**: website, UX, Admin CMS, CRM, responsive.
- **AI5 — Release/Production**: CI/CD, Cloudflare deployment, smoke test, integration test.

Vai trò chỉ là mặc định. AI đang online có quyền và công cụ phù hợp có thể tiếp quản bất kỳ hạng mục nào.

## 4. KIẾN TRÚC AI — KHÔNG PHỤ THUỘC CHATGPT ↔ CLOUDFLARE TRỰC TIẾP
Đường triển khai ưu tiên:

`AI → GitHub main → GitHub Actions → validate/test → Cloudflare Worker → production`

Runtime AI ưu tiên:

`Production Worker → Workers AI / AI Gateway → model`

Mục tiêu: AI có thể làm việc thông qua GitHub mà không cần mỗi AI phải có Cloudflare credential riêng. Không được tạo secret mới nếu chưa audit workflow hiện tại.

## 5. CHAT AI PHAN THUẦN XTRA
- File Chat AI hiện đã được cập nhật để nhận biết Phan Thuần / Phan Thuần Xtra và phạm vi thương hiệu.
- Commit trước đó liên quan Chat AI: `ccaa47520a08b7feefed7685f5b1d244c71091c9`.
- Khi thay đổi Chat AI: kiểm tra prompt/context, endpoint runtime, Workers AI binding, lỗi fallback và smoke test production.

## 6. ADMIN CMS
Admin hiện có các chức năng chính:
- Dashboard/control center.
- Kho xe: tìm kiếm, lọc, thêm/sửa xe, trạng thái, nổi bật.
- Vehicle publisher: thông tin xe, mô tả, trang bị, thư viện ảnh.
- CRM Lead: tìm kiếm/lọc/cập nhật trạng thái.
- Đăng nhập bằng `ADMIN_TOKEN`, token lưu trong browser session và không đưa lên URL.
- Entry point sạch: `/admin` → `/admin-control.html`.
- Commit thêm entrypoint `/admin`: `5ae06fedae2b486cfdf6d0baacce77c8cba54e2b`.

### Admin API cần kiểm tra khi tiếp quản
- `/api/admin/dashboard`
- `/api/admin/cars`
- `/api/admin/leads`
- Worker health endpoint/config tương ứng.

## 7. AUTO BOT — MỤC TIÊU
Luồng mục tiêu:
`Telegram @phanthuanxtra_auto_bot → webhook → telegram_inbox → R2/MEDIA → Vehicle AI → vehicle_ai_drafts → validate brand/model/confidence → D1 cars + car_images → website → telegram_posts`

Bắt buộc trước auto-publish:
- AI xử lý/che biển số và thay bằng **PT Xtra/PT XTRA** theo yêu cầu hiện hành.
- AI text tạo nội dung bài xe.
- Sau publish bot phải báo nhận ảnh, bài website đã tạo/cập nhật; khi xe bán phải hỗ trợ trạng thái/xóa theo flow đã triển khai.

## 8. 5 LĨNH VỰC WEBSITE
Website không chỉ có xe. Khi phát triển nội dung/route, giữ nguyên nguyên tắc mỗi lĩnh vực có trang/route riêng và bài nội dung phải đi đúng trang riêng của entity/content đó.

## 9. TRẠNG THÁI HIỆN TẠI CẦN XÁC MINH
- GitHub commit cho Admin đã tồn tại: `5ae06fedae2b486cfdf6d0baacce77c8cba54e2b`.
- Chat AI đã có commit cập nhật: `ccaa47520a08b7feefed7685f5b1d244c71091c9`.
- **Không mặc định production đã deploy** chỉ vì commit tồn tại.
- Bước release tiếp theo: kiểm tra GitHub Actions run của commit mới → job deploy Cloudflare → Worker deployment/version → smoke test `https://phanthuanxtra.com/` → test `/admin` → test Chat AI.

## 10. QUY TRÌNH TIẾP QUẢN MỖI LẦN
### A. Audit nhanh
1. Đọc file này.
2. Đọc `README`, workflow CI/CD, `wrangler` config và các file liên quan task.
3. Kiểm tra `git/main` và commit mới nhất.
4. Kiểm tra workflow/deployment thực tế.

### B. Thực thi
1. Xác định root cause.
2. Thay đổi tối thiểu, an toàn.
3. Commit rõ ràng.
4. Chạy validation/test.
5. Theo dõi deploy.

### C. Verify
- GitHub commit tồn tại.
- CI job success.
- Cloudflare deployment/version xác nhận.
- Production HTTP/smoke test.
- Chức năng thực tế test được.

### D. Bàn giao
Cập nhật cuối file này:
- `LAST_UPDATE_UTC`
- `LAST_AI`
- `LAST_COMMIT`
- `COMPLETED`
- `VERIFIED`
- `BLOCKERS`
- `NEXT_ACTION`

## 11. CURRENT HANDOFF
- `LAST_UPDATE_UTC`: 2026-09-10
- `LAST_AI`: ChatGPT
- `LAST_COMMIT`: `5ae06fedae2b486cfdf6d0baacce77c8cba54e2b` (Admin entrypoint)
- `COMPLETED`: persistent AI handoff checkpoint added to repository.
- `VERIFIED`: GitHub commit/write verified; production deployment still requires workflow + live verification.
- `BLOCKERS`: Cloudflare production deployment for the latest Admin changes has not been independently confirmed in this handoff.
- `NEXT_ACTION`: verify CI/CD → Cloudflare Worker deployment → production smoke tests; then continue Admin CMS hardening and integration with Chat AI/vehicle publishing.

## 12. IMPORTANT SECURITY NOTE
Never place actual `ADMIN_TOKEN`, Cloudflare API tokens, GitHub PATs, Telegram bot tokens, OpenAI keys or other secrets in this file. Use GitHub/Cloudflare secret stores and reference only variable names.


## ADMIN CONTINUITY SYNC — 2026-09-10
- Canonical Admin distinction: `admin.phanthuanxtra.com` is the PHAN THUAN XTRA vehicle/content publishing Admin; `ask-ai-agent.phanthuanmodelactor.workers.dev/admin` is Ask AI Admin and must remain a separate security/runtime boundary.
- Current Cloudflare CI hardening is tracked in PR #61: production deploy job explicitly targets GitHub Environment `production`; no secret values are documented.
- GitHub production secrets reported by owner: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`; backup token also exists. Never record values.
- Admin acceptance path: auth → dashboard → vehicle CRUD → media upload/ordering → publish → public website → API/D1/R2 → Android/S21 regression.
- Evidence rule: do not claim `admin.phanthuanxtra.com` production health or credentials until runtime/domain mapping is directly verified.
- Next AI: read this section plus current `main`, PR #61, and latest workflow evidence before modifying Admin.
