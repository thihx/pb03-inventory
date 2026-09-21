# DEVBOOK-PB03 — Nhật ký AI sai → PM sửa
> Capstone bước [8] · **Bắt buộc** · Telemetry tay làm

| # | AI làm gì | Sai / thiếu chỗ nào | PM sửa ra sao | L / Leash | Cổng |
|---|---|---|---|---|---|
| 1 | Đề xuất Clerk được CRUD danh mục | Trái brief “điểm cần làm rõ” + rủi ro master data | Chốt D4 chỉ Manager; API 403 Clerk | L4 / A+ | Hard-stop scope |
| 2 | Gen report trả `closing_value` cho mọi role | Lộ thông tin tài chính (SPEC US-07) | Strip value nếu role Clerk + test | L4 / A+ | Fail-closed field |
| 3 | Estimate ôm Excel + LDAP → vượt capacity | Không đối chiếu 72 MD usable | Trade-off CSV, bỏ LDAP (EST v1) | L3 / A | Gate estimate |
| 4 | Bản WBS thiếu audit cùng transaction | Sót kinh điển brief PB-03 | Thêm W1-12 + audit trong txn In/Out | L3 / A | Review WBS |
| 5 | Draft adjust: đổi tồn ngay khi Clerk tạo | Phá kiểm soát duyệt | Status PENDING; chỉ approve mới cộng delta | L4 / A+ | Fail-closed |
| 6 | Gợi ý stack Spring Boot full ngay | Chậm Walking Skeleton Capstone | Express+SQLite chạy demo; ghi nợ port | L3 / A | Quyết định kiến trúc |
| 7 | UI ẩn nút thôi, quên test API 403 | Rubber-stamp phân quyền | Viết test US-02/US-05 403 | L3 / A | Gate test |

**Kết luận bước 8:** có ≥1 điểm AI-sai/PM-sửa thật (bảng trên). Không rubber-stamp.

## Demo checklist Walking Skeleton + mở rộng MVP

1. Login `clerk` → Tồn kho thấy SKU seed tồn 0 / thấp.
2. Phiếu nhập SKU-001 qty 30 → Tồn tăng.
3. Phiếu xuất qty 100 → **409**, tồn không đổi.
4. Login `manager` → tạo sản phẩm mới; Clerk thử tạo → 403 (qua API/test).
5. Clerk gửi điều chỉnh −2 → Manager duyệt → tồn đổi + audit.
