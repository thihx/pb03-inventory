# RISK-PB03 — Risk Register
> Capstone bước [6a] · EX-04 · Telemetry: ~20 phút · PM-edit=2

| ID | Rủi ro | P | I | Mitigation | Owner |
|---|---|:---:|:---:|---|---|
| R01 | Xuất concurrent → tồn âm | M | H | Transaction + check tồn trong txn; test 409 | Dev1 |
| R02 | Clerk thấy giá trị tồn / cost | M | H | RBAC API + strip field; test 403 | Dev2 |
| R03 | Điều chỉnh không duyệt vẫn đổi tồn | L | H | Status machine PENDING→APPROVED | Dev1 |
| R04 | Master data bẩn (Clerk sửa danh mục) | M | M | Chỉ Manager CRUD (D4) | PM |
| R05 | Scope creep barcode | H | M | Hard-stop theo SCOPE; ghi phase 2 | PM |
| R06 | **AI hallucination** số liệu báo cáo weekly | H | M | Telemetry giờ thật; cấm số không nguồn | PM |
| R07 | **AI lộ dữ liệu** vào prompt (dump DB prod) | M | H | Chỉ dùng seed giả; không dán PII thật | All |
| R08 | **Rubber-stamp** code phân quyền | H | H | Dev Book + test negative bắt buộc | PM |
| R09 | Ước lượng report NXT sai | M | M | Spike 0.5d; dual-check mẫu Excel cũ | Dev2 |
| R10 | Mất audit / user xoá log | L | H | Không API delete audit; DB permission | Dev1 |

**Thang:** P/I = L/M/H.

## 🔒 Cổng hiểu

- R02 nếu chỉ ẩn nút UI mà API vẫn trả `unit_cost` → lộ tài chính nội bộ.
- **Bắt AI:** bản risk đầu thiếu nhóm rủi ro AI (R06–R08) → đã bổ sung.
