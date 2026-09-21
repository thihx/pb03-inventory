# WBS-PB03 — Work Breakdown (Rolling-Wave)
> Capstone bước [4] · EX-02 · Telemetry: ~30 phút · PM-edit=3

**Team:** 1 PM + 2 Dev · 6 tuần

---

## Wave 1 — grain TASK (0.5–2 ngày) — làm ngay

| ID | Task | Output | Phụ thuộc | Owner gợi ý |
|---|---|---|---|---|
| W1-01 | Khởi tạo monorepo api + web, script chạy local | repo chạy `npm start` | — | Dev1 |
| W1-02 | Schema DB + migration/seed 2 user + 3 product | DB file + seed | W1-01 | Dev1 |
| W1-03 | Auth login + JWT middleware | `/api/auth/login` | W1-02 | Dev2 |
| W1-04 | RBAC requireRole | 403 đúng role | W1-03 | Dev2 |
| W1-05 | API Products CRUD + chặn Clerk | US-02 AC | W1-04 | Dev1 |
| W1-06 | API Stock In (transaction + movement + audit) | US-03 | W1-05 | Dev1 |
| W1-07 | API Stock list + low-stock | US-06 | W1-06 | Dev2 |
| W1-08 | UI Login + layout 2 role | màn login | W1-03 | Dev2 |
| W1-09 | UI Products (Manager) + Stock view | màn chạy | W1-05,07,08 | Dev2 |
| W1-10 | UI Phiếu nhập | end-to-end WS | W1-06,09 | Dev2 |
| W1-11 | Test AC Walking Skeleton (happy + 401/403) | test xanh | W1-10 | Dev1 |
| W1-12 | **Sót kinh điển:** audit log ghi đủ actor | audit rows | W1-06 | Dev1 |

## Wave 2 — grain FEATURE

| ID | Feature | Ghi chú |
|---|---|---|
| W2-01 | Stock Out + chặn quá tồn + concurrent-safe | Cốt lõi đề |
| W2-02 | Adjust PENDING → approve/reject | Phân quyền |
| W2-03 | UI xuất + điều chỉnh | |
| W2-04 | Báo cáo NXT + CSV export | Trade-off: CSV thay Excel |
| W2-05 | Audit UI (Manager) | Sót hay quên |
| W2-06 | SIT/UAT full AC + phân quyền negative | |

## Wave 3+ — grain EPIC (thô, cố ý)

- EP-01 Harden PostgreSQL + Docker Compose prod-like
- EP-02 Excel (SheetJS/ExcelJS) thay CSV
- EP-03 LDAP/AD
- EP-04 Multi-warehouse (phase 2)

## Việc hay sót đã đưa vào WBS

- Phân quyền API (W1-04)
- Audit (W1-12, W2-05)
- Điều chỉnh tồn có duyệt (W2-02)
- Kiểm thử negative / insufficient stock (W2-01, W2-06)
- Export báo cáo (W2-04)

## 🔒 Cổng hiểu

- W1-06 xong → có API nhập làm tăng tồn trong 1 transaction; phụ thuộc Products + Auth.
- **Bắt sót AI:** bản AI đầu thiếu “audit cùng transaction” và “test 403 Clerk CRUD” → đã thêm W1-12, W1-11.
