# PB-03 · Deploy & GitHub

## Stack host miễn phí (đã chọn)

| Thành phần | Host | Ghi chú |
|---|---|---|
| **API + Website** (1 service) | [Render.com](https://render.com) Free | Express phục vụ luôn `apps/web/dist` |
| **Source** | GitHub | Repo công khai hoặc riêng |

> GitHub Pages chỉ host **static** — không chạy Express/SQLite. Vì vậy dùng **Render Free** cho cả web+API (một URL).

Render Free: service ngủ sau ~15 phút không traffic; request đầu có thể chậm 30–60s.

## 1) Đẩy lên GitHub

```bash
cd PB-03
git init
git add .
git commit -m "PB-03 Capstone: warehouse inventory MVP + artefacts"
gh repo create pb03-inventory --public --source=. --remote=origin --push
```

## 2) Deploy Render (1 click sau khi có repo)

1. Đăng ký https://render.com (đăng nhập bằng GitHub).
2. **New → Blueprint** → chọn repo `pb03-inventory` (file `render.yaml` đã có sẵn).
3. Apply → đợi build xong → mở URL dạng `https://pb03-inventory.onrender.com`.

Hoặc **New → Web Service** thủ công:

- Build: `npm run install:all && npm run build`
- Start: `npm start`
- Health: `/api/health`

## Tài khoản demo

- `clerk` / `Clerk@123`
- `manager` / `Manager@123`

SQLite trên Free tier **reset khi redeploy** — `npm start` luôn seed lại user demo.
