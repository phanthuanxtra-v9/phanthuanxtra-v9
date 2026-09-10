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
- Admin route fix đã được merge vào `main` tại merge commit `fc1617479aefa0e9b98b4afe1624f5b01b338187`.
- `src/entry.js` trên `main` đã có route trực tiếp `/admin` và `/admin/` → `admin.html`, loại bỏ redirect trung gian.
- GitHub Actions **push deployment đã thực sự chạy và thành công**.
- Cloudflare Worker `phanthuanxtra-v2` **đã deploy thành công**.
- Cloudflare Version ID đã xác minh: `d32431ad-fb43-4ad9-83d5-27876cad7f1b`.
- Live production `https://phanthuanxtra.com/admin` sau deployment **vẫn trả HTTP 403**.
- Vì vậy không được đánh dấu production GREEN: GitHub deploy = GREEN, Cloudflare Worker deploy = GREEN, production `/admin` = RED/BLOCKED.
- Ranh giới điều tra hiện tại nằm ở lớp Cloudflare custom-domain/edge/Access/WAF/route behavior hoặc lớp trước Worker; chưa có bằng chứng để kết luận chính xác rule nào.

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
- `LAST_COMMIT`: `fc1617479aefa0e9b98b4afe1624f5b01b338187` (Admin route fix merged)
- `COMPLETED`: Admin route fix merged; real GitHub Actions push deployment and Cloudflare Worker deployment verified.
- `VERIFIED`: Cloudflare Version ID `d32431ad-fb43-4ad9-83d5-27876cad7f1b`; live `/admin` still HTTP 403.
- `BLOCKERS`: Chưa có Cloudflare API/dashboard connector trong phiên này để kiểm tra trực tiếp custom-domain, Access, WAF/security rules và Worker route mapping.
- `NEXT_ACTION`: Khi có Cloudflare access, audit edge/custom-domain/Access/WAF/route mapping cho `/admin`; retest `/admin` và `/admin.html`; chỉ đánh dấu production GREEN khi live endpoint trả response đúng.

## 12. IMPORTANT SECURITY NOTE
Never place actual `ADMIN_TOKEN`, Cloudflare API tokens, GitHub PATs, Telegram bot tokens, OpenAI keys or other secrets in this file. Use GitHub/Cloudflare secret stores and reference only variable names.

## 13. DEPLOYMENT CONFIGURATION CORRECTION — 2026-09-10
- Earlier handoff text incorrectly stated that no Wrangler configuration existed at repository root.
- Later direct inspection verified `wrangler.json` exists on `main` and defines Worker `phanthuanxtra-v2`, static assets, Workers AI binding, R2 `MEDIA`, D1 `DB`, and observability.
- The earlier “no wrangler config” statement is superseded and must not be used by future AIs.

## 14. HANDOFF FOR NEXT AI — 2026-09-10
**Current truth:** code fix is merged and deployment is verified, but the public `/admin` endpoint remains blocked with HTTP 403.

**Do not:** repeat the Worker route fix without first checking the Cloudflare edge/custom-domain path; do not claim production GREEN.

**Do next:** inspect the Cloudflare layer responsible for the 403, verify `/admin` and `/admin.html`, then continue Admin CMS hardening (including server-side token validation) only after the route is reachable.
