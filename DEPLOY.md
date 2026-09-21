# PB-03 · Deploy & GitHub

## Repo

https://github.com/thihx/pb03-inventory

## Host miễn phí đã chọn

| Thành phần | Host | Lý do |
|---|---|---|
| Source | **GitHub** | Lưu code khóa học |
| API + Website (1 URL) | **[Render.com](https://render.com) Free** | Chạy được Express + SQLite; GitHub Pages chỉ phục vụ file tĩnh, không chạy Node API |

> GitHub Pages / Cloudflare Pages = static only → không đủ cho PB-03.  
> Render Free: sleep ~15 phút không traffic; lần mở đầu có thể chờ 30–60s.

## Deploy 1 click (Render Blueprint)

1. Đăng nhập Render bằng GitHub: https://render.com  
2. Mở link Blueprint (đã gắn repo):  
   **https://render.com/deploy?repo=https://github.com/thihx/pb03-inventory**  
3. Chọn **Apply** / Create → đợi build (vài phút).  
4. URL public dạng: `https://pb03-inventory-xxxx.onrender.com`

File cấu hình sẵn: `render.yaml` + `Dockerfile` (dự phòng).

### Cấu hình thủ công (nếu không dùng Blueprint)

- **Root directory:** `.` (repo root)
- **Build:** `npm run install:all && npm run build`
- **Start:** `npm start`
- **Health check:** `/api/health`

## Tài khoản demo trên site đã deploy

- `clerk` / `Clerk@123`
- `manager` / `Manager@123`

SQLite trên Free tier reset khi redeploy — mỗi lần start sẽ seed lại user demo.
