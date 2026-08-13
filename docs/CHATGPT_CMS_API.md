# ChatGPT CMS API

## Mục đích

CMS API cho phép trợ lý AI thao tác **nội dung website** Phan Thuần Xtra mà không cần quyền quản trị DNS/Cloudflare account.

API chạy trên Worker và lưu dữ liệu trong D1.

## Bảo mật

Tạo một secret riêng trên Cloudflare Worker:

```bash
npx wrangler secret put CMS_API_KEY
```

Không commit secret vào GitHub và không dùng token trong URL.

Authorization:

```http
Authorization: Bearer <CMS_API_KEY>
```

Các thao tác xóa còn yêu cầu:

```http
X-CMS-Confirm: delete
```

## Endpoint

- `GET /api/cms/v1/health`
- `GET /api/cms/v1/dashboard`
- `GET /api/cms/v1/cars`
- `GET /api/cms/v1/cars/{id}`
- `POST /api/cms/v1/cars`
- `PUT /api/cms/v1/cars/{id}`
- `DELETE /api/cms/v1/cars/{id}`
- `GET /api/cms/v1/leads`
- `PUT /api/cms/v1/leads/{id}`
- `DELETE /api/cms/v1/leads/{id}`
- `GET /api/cms/v1/audit`

OpenAPI: `docs/chatgpt-cms-openapi.yaml`

## Ví dụ đăng xe

```json
{
  "id": "lexus-lx600-urban-2024",
  "brand": "Lexus",
  "model": "LX600 Urban",
  "year": 2024,
  "mileage": 12000,
  "price": 7800000000,
  "fuel": "V6 3.4 Twin Turbo",
  "category": "suv",
  "color": "Trắng",
  "status": "available",
  "featured": true,
  "description": "Xe chính chủ, hồ sơ rõ ràng.",
  "features": ["4WD", "7 chỗ", "TSS"],
  "images": [
    {"url":"https://example.com/lx600-1.jpg", "is_cover":true},
    {"url":"https://example.com/lx600-2.jpg"}
  ]
}
```

## Lưu ý về upload ảnh

Phiên bản CMS API này nhận **URL ảnh** và quản lý thứ tự/ảnh bìa. Không lưu binary ảnh trực tiếp vào D1. Khi triển khai Cloudflare R2/Images, có thể bổ sung endpoint upload riêng và trả về URL CDN.

## Kết nối với ChatGPT

ChatGPT cần một Action/connector có khả năng gọi OpenAPI endpoint này và lưu `CMS_API_KEY` dưới dạng secret. Việc cài code API **không tự động cấp quyền cho ChatGPT**; bước kết nối Action/connector vẫn cần được cấu hình ở phía ChatGPT nếu giao diện/tài khoản hỗ trợ.
