# SIT-UAT-PB03 — Test & Gate
> Capstone bước [9] · Fail-closed · Telemetry: chạy `npm test` + manual UI

## SIT (API) — kết quả máy

Lệnh: `cd apps/api && npm test`  
**Kết quả:** 5/5 PASS (2026-09-21)

| Case | AC | Kết quả | Ghi chú |
|---|---|---|---|
| Clerk POST product | US-02 403 | PASS | |
| Stock in +10 | US-03 | PASS | |
| Out vượt tồn → 409, qty giữ | US-04 | PASS | **cốt lõi** |
| Clerk approve adjust 403; Manager OK | US-05 | PASS | |
| Clerk report không có closing_value | US-07 | PASS | |

## UAT (UI) — kịch bản thủ công

| # | Given / When / Then | Status |
|---|---|---|
| U1 | Login clerk đúng → vào shell đúng role | PASS (manual) |
| U2 | Nhập phiếu → màn Tồn tăng sau refresh | PASS |
| U3 | Xuất quá tồn → hiện lỗi 409 | PASS |
| U4 | Manager tải CSV báo cáo | PASS |
| U5 | Clerk không thấy tab Danh mục / Audit | PASS |
| U6 | “Gần đúng”: xuất đúng bằng tồn → phải 200 | PASS (cổng giữ đúng biên) |

## Defect còn mở (không giấu)

| ID | Mô tả | Mức | Xử lý |
|---|---|---|---|
| D1 | Dropdown phiếu chưa reload tồn sau giao dịch | Low | Refresh tab / reload products — backlog |
| D2 | NXT opening_qty là xấp xỉ MVP | Med | Ghi chú UI; harden Wave 3 |
| D3 | Stack chưa phải Spring/.NET đúng chữ brief | Med | Chấp nhận Capstone + ARCH ghi nợ |

**Cổng:** AC lát cắt + negative phân quyền **đóng** — không tạm cho qua case 409.
