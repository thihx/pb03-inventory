# PB-03 — Hệ thống quản lý kho nội bộ

Capstone Customer Zero (PM AI Bootcamp) theo *Capstone Playbook* (bước 0→10 + VIVA).

## Deploy miễn phí (GitHub + Render)

Chi tiết: [`DEPLOY.md`](./DEPLOY.md)

- **GitHub** — source code  
- **Render Free** — 1 Web Service chạy API + website (cùng URL)

## Chạy local

```bash
# Terminal 1 — API
cd apps/api
npm install
npm run seed
npm start

# Terminal 2 — Web
cd apps/web
npm install
npm run dev
```

- Web: http://localhost:5173  
- API: http://localhost:4003/api/health  

**Tài khoản demo**

| User | Pass | Role |
|---|---|---|
| `clerk` | `Clerk@123` | Thủ kho |
| `manager` | `Manager@123` | Quản lý |

## Artefacts

Xem `artefacts/` (SCOPE → … → RTM/WEEKLY).

## Test API

```bash
cd apps/api
npm test
```
