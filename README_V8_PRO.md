# PHAN THUAN XTRA — V8 PRO — LEGACY / ARCHIVE

> **LƯU Ý 2026-09-07:** Đây là tài liệu lịch sử của V8 PRO. **Không dùng file này làm nguồn hướng dẫn triển khai hiện tại.** Không chạy các lệnh Wrangler cũ trong file này trên S21 Ultra.

## Nguồn bàn giao hiện tại
Nguồn ưu tiên cho công việc hiện tại là:

1. `MASTER_CONTEXT_PHAN_THUAN.md` — trạng thái dự án tổng thể.
2. `developer-gateway/AI-PEER-CONTINUITY.md` — giao thức bàn giao giữa các AI peer.
3. `developer-gateway/TASK-20260907-S21-OLLAMA-OPENCODE.md` — checkpoint S21 + OpenCode + Ollama + Cloudflare AI hiện tại.
4. Branch làm việc: `feat/v10-s21-termux-opencode-android`.
5. Production branch: `main` — không sửa trực tiếp.

## Phạm vi của tài liệu này
V8 PRO ghi lại kiến trúc nền tảng ban đầu: Cloudflare Workers + Static Assets + D1 tùy chọn. Website có thể hoạt động từ `public/`, còn D1 là lớp dữ liệu lâu dài.

Các hướng dẫn cũ về `npx wrangler login`, `npm run deploy`, tạo D1 thủ công hoặc đường dẫn cũ trong file này chỉ có giá trị tham khảo lịch sử. Quy trình hiện tại dùng **GitHub Actions / Cloudflare Workers Builds** cho CI/CD từ xa; S21 Ultra không phải máy deploy production.

## Hiện trạng V10 liên quan
- Repository: `phanthuanxtra-v9/phanthuanxtra-v9`.
- Website: `https://phanthuanxtra.com`.
- S21 Ultra đã vượt qua gate kiểm thử APK vật lý theo `MASTER_CONTEXT_PHAN_THUAN.md`.
- OpenCode 1.18.29 chạy trong Debian/proot trên S21.
- Ollama 0.30.10 chạy trên Termux host.
- `phi3:mini` đã kết nối được với OpenCode nhưng không hỗ trợ tools; không dùng làm coding-agent chính.
- Không tải thêm Llama/Mistral/Gemma 7–8B local khi RAM S21 đang thiếu.
- Workers AI + AI Gateway là tầng AI cloud ưu tiên cho các tác vụ nặng.

## Dữ liệu lịch sử cần bảo vệ
`public/data/cars.json` là fallback inventory lịch sử. Không xóa nếu chưa có kế hoạch migration được phê duyệt.

## Quy tắc an toàn
- Không commit Cloudflare API token, mật khẩu, database credential hoặc provider key.
- Không sửa/deploy trực tiếp `main` trong công việc V10.
- Không xóa các D1 migration hiện có.
- Không coi tài liệu V8 này là trạng thái production hiện tại.
- Trước mọi thay đổi, đọc `MASTER_CONTEXT_PHAN_THUAN.md` và checkpoint V10.

## Handoff checklist lịch sử
Nếu cần phục hồi hoặc nghiên cứu V8:
1. Đọc file này để hiểu bối cảnh lịch sử.
2. Kiểm tra branch và `git status`.
3. Đối chiếu cấu hình hiện tại thay vì sao chép nguyên lệnh V8.
4. Bảo toàn `public/data/cars.json`.
5. Ghi mọi thay đổi quan trọng vào checkpoint V10.

**Kết luận:** `README_V8_PRO.md` vẫn được giữ để truy vết lịch sử, nhưng **không phải tài liệu điều hành chính của V10**.
