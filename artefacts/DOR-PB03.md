# DOR-PB03 — Definition of Ready (Walking Skeleton)
> Capstone bước [7] · Telemetry: ~15 phút · PM-edit=1

## Lát cắt dọc đã chốt

**WS-01:** Login → (seed/Manager) Product → Stock In confirm → Stock view (+ audit row)

Tầng xuyên: **M0 Auth/RBAC/Schema/Audit → API Products+In → UI Login/In/Stock**.

---

## Checklist DoR

| # | Mục | Status | Ghi chú |
|---|---|---|---|
| 1 | Spec stories US-01,02,03,06 có AC đo được | **PASS** | SPEC-PB03 |
| 2 | Data model products/vouchers/movements/audit | **PASS** | ARCH |
| 3 | API contract login/products/in/stock | **PASS** | ARCH §5 |
| 4 | Module map xác định móng trước | **PASS** | MODULEMAP |
| 5 | WBS Wave 1 task đủ mỏng | **PASS** | W1-01…12 |
| 6 | Estimate trong capacity | **PASS** | EST sau trade-off |
| 7 | Risk + Delegation (A+ cho tồn/RBAC) | **PASS** | |
| 8 | Leash & cổng cho WS-01 rõ | **PASS** | logic In = A+ |
| 9 | Seed data demo sẵn kế hoạch | **PASS** | manager/clerk + 3 SKU |
| 10 | Out-of-scope không lẫn vào WS | **PASS** | không barcode |

**Kết luận DoR: PASS toàn bộ → được BUILD bước [8].**

## Definition of Done (WS-01)

- Demo: login clerk → nhập phiếu → tồn tăng trên UI.
- Test: insufficient không nằm trong WS-01 nhưng smoke 401/403 có.
- DEVBOOK có ≥1 mục AI-sai/PM-sửa.

## 🔒 Cổng hiểu

- Lát cắt đi: Auth → DB product → API In txn → UI.
- Nếu thiếu mục 3 (API contract) mà build → rework field name loạn; vì vậy DoR bắt buộc PASS trước code.
