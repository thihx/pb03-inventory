# MODULEMAP-PB03 — Module Map & phân tầng
> Capstone bước [2] · Telemetry: ~20 phút · PM-edit=2

---

## 1. Layer 0 — Móng ẩn (làm trước)

| Module | Trách nhiệm | Bắt buộc trước bề mặt? |
|---|---|---|
| **M0-Auth** | Login, JWT/session, password hash | Có |
| **M0-RBAC** | Role Clerk/Manager, guard API | Có |
| **M0-DataModel** | Schema products, stock, vouchers, audit | Có |
| **M0-Audit** | Ghi log mọi mutate | Có (cùng nhịp giao dịch) |
| **M0-Gateway/API** | REST conventions, error codes | Có |

## 2. Module bề mặt (người dùng thấy)

| Module | Stories | Phụ thuộc móng |
|---|---|---|
| **M1-Products** | US-02 | M0-* |
| **M2-StockIn** | US-03 | M0 + M1 |
| **M3-StockOut** | US-04 | M0 + M1 + tồn |
| **M4-Adjust** | US-05 | M0 + tồn + RBAC Manager |
| **M5-StockView** | US-06 | M0 + tồn |
| **M6-Reports** | US-07 | M0 + lịch sử |
| **M7-AuditUI** | US-08 | M0-Audit |

## 3. Scope MVP — thứ tự làm

```
Wave 0/1: M0 (Auth+RBAC+Schema+Audit) 
       → M1 Products 
       → M2 StockIn + M5 StockView   ← lát cắt dọc #1
       → M3 StockOut (chặn quá tồn)
       → M4 Adjust (duyệt)
       → M6 Reports (CSV)
       → M7 AuditUI
```

## 4. Ứng viên lát cắt dọc (Walking Skeleton)

**Tên:** `WS-Login→Product→StockIn→Xem tồn`

Đi xuyên:
1. Auth login (Clerk)
2. Manager seed/tạo 1 sản phẩm (hoặc seed)
3. API + UI tạo phiếu nhập 1 dòng → xác nhận
4. Màn tồn hiện số mới + audit có bản ghi

**Cố tình mỏng:** chưa gồm xuất/điều chỉnh/báo cáo (làm ngay sau khi skeleton xanh).

## 🔒 Cổng hiểu

- **Móng phải xong trước:** không có RBAC + transaction tồn thì UI phiếu xuất “đẹp” vẫn sai nghiệp vụ.
- **Sửa AI:** AI xếp “Reports” vào Layer 0 → **sai**; báo cáo là bề mặt, phụ thuộc lịch sử giao dịch.
