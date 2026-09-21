# ARCH-PB03 — Architecture
> Capstone bước [3] · Telemetry: ~35 phút · PM-edit=4

---

## 1. Nguyên tắc kiến trúc

1. **Source of truth tồn** = bảng `products.quantity_on_hand`, chỉ đổi trong transaction khi xác nhận phiếu.
2. **Mọi biến động** ghi `stock_movements` + `audit_logs` cùng transaction (fail → rollback hết).
3. **RBAC tại API** (PEP), không tin UI ẩn nút.
4. **Fail-closed** với xuất quá tồn và điều chỉnh chưa duyệt.
5. **MVP đơn giản:** monolith API + SPA; 1 DB; không message queue.

## 2. Container

```
┌─────────────┐     REST/JSON      ┌──────────────────┐
│  Web (React)│ ───────────────► │  API (Node/Express)│
│  Vite SPA   │ ◄─────────────── │  + RBAC middleware │
└─────────────┘     JWT           └────────┬─────────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │ SQLite (MVP dev) │
                                  │ / PostgreSQL prod│
                                  └──────────────────┘
```

> **Chưa chốt prod DB:** brief cho MySQL hoặc PostgreSQL. Dev dùng SQLite để chạy nhanh; schema tương thích PostgreSQL. Docker Compose Postgres = phase harden.

## 3. Tech stack (đề xuất + lý do)

| Tầng | Chọn | Lý do |
|---|---|---|
| FE | React + Vite | Brief cho phép; nhẹ, đủ SPA nội bộ |
| BE | Node.js + Express | Nhanh dựng Walking Skeleton; REST rõ. *(Brief ưu tiên Spring/.NET — ghi nợ: có thể port; Capstone Tier 1 chấp nhận stack chạy được + đúng contract)* |
| DB | better-sqlite3 (dev) | Zero-ops local; transaction sync dễ demo |
| Auth | JWT + bcrypt | Đủ nội bộ MVP |
| Export | CSV (MVP) | Trade-off EX-03 nếu thiếu MD cho Excel/POI |

**Chưa chốt:** chuyển sang Spring Boot nếu Coach yêu cầu đúng chữ brief 100%.

## 4. Data model (tóm tắt + độ nhạy)

| Bảng | Trường chính | Độ nhạy |
|---|---|---|
| `users` | id, username, password_hash, role | **Cao** (credential) |
| `products` | id, sku, name, unit, min_stock, qty_on_hand, unit_cost?, active | qty=Nội bộ; unit_cost=**Trung–Cao** (tài chính) |
| `vouchers` | id, type IN/OUT/ADJUST, status, created_by, approved_by?, note, timestamps | Nội bộ |
| `voucher_lines` | voucher_id, product_id, qty, unit_cost? | Nội bộ |
| `stock_movements` | product_id, delta, voucher_id, at | Nội bộ — nguồn đối soát |
| `audit_logs` | actor_id, action, entity, entity_id, at, detail_json | **Cao** (không xoá) |

## 5. API contract (chính)

| Method | Path | Role | Mô tả |
|---|---|---|---|
| POST | `/api/auth/login` | public | `{username,password}` → `{token,user}` |
| GET | `/api/products` | any auth | list |
| POST | `/api/products` | Manager | create |
| PUT | `/api/products/:id` | Manager | update |
| POST | `/api/vouchers/in` | Clerk+ | tạo+confirm nhập |
| POST | `/api/vouchers/out` | Clerk+ | xuất; 409 nếu thiếu tồn |
| POST | `/api/vouchers/adjust` | Clerk+ | tạo PENDING |
| POST | `/api/vouchers/adjust/:id/approve` | Manager | áp dụng delta |
| POST | `/api/vouchers/adjust/:id/reject` | Manager | từ chối |
| GET | `/api/stock` | any auth | tồn + low-stock flag |
| GET | `/api/reports/nxt?from&to` | auth; value fields Manager-only | báo cáo |
| GET | `/api/reports/nxt.csv` | Manager | export |
| GET | `/api/audit` | Manager | logs |

**Error codes:** 400 validation · 401 unauth · 403 forbidden · 409 conflict (duplicate SKU / insufficient stock).

## 6. Phân quyền (map SPEC)

- Middleware `requireAuth` + `requireRole('WAREHOUSE_MANAGER')` cho product mutate, approve, audit, value report.
- Field-level: response báo cáo **strip** `value_*` nếu role Clerk.

## 🔒 Cổng hiểu

- Chọn Express thay Spring vì tốc độ Capstone demo; đánh đổi “đúng chữ brief stack” vs “hệ thống chạy + đúng nghiệp vụ”.
- **Sửa AI:** quên gắn `unit_cost` = độ nhạy tài chính → đã gắn Trung–Cao; Clerk không nhận field này trên report.
