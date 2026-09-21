# SCOPE-PB03 — Làm rõ phạm vi MVP
> Capstone Playbook bước [0] · Đề PB-03 · Hệ thống quản lý kho nội bộ  
> Telemetry: tool=Cursor · est token≈8k · thời gian≈25 phút · vòng lặp=1 · PM-edit=3

---

## 1. Problem statement

Công ty phân phối đang theo dõi nhập–xuất–tồn bằng Excel: tồn thực tế lệch sổ, sai sót khi nhập liệu, khó truy vết ai sửa gì. Cần **web nội bộ** để Thủ kho ghi phiếu nhập/xuất đúng tồn, Quản lý xem báo cáo & duyệt điều chỉnh, mọi thao tác có nhật ký kiểm toán.

## 2. Quyết định nền (kiểu D1/D2)

| Mã | Quyết định | Chốt |
|---|---|---|
| **D1** | MVP **standalone** — không tích hợp kế toán / ERP / barcode | Phase 2 mới xét |
| **D2** | **1 kho duy nhất** trong MVP | Nhiều chi nhánh = out-of-scope |
| **D3** | Điều chỉnh tồn (kiểm kê lệch) **bắt buộc có người duyệt (Quản lý)** | Brief thiếu → PM chốt |
| **D4** | CRUD danh mục hàng: **chỉ Quản lý** tạo/sửa/xoá; Thủ kho chỉ đọc | Brief mơ hồ → PM chốt |
| **D5** | “Báo cáo tài chính tổng” = báo cáo có **thành tiền / giá trị tồn**; Thủ kho chỉ xem **số lượng** | Làm rõ phân quyền |

## 3. Giả định đã chốt

1. Đăng nhập bằng tài khoản nội bộ (user/password); LDAP/AD = phase sau.
2. Đơn vị tính: chuỗi tự do (pcs, thùng, kg…) — chưa chuẩn hoá UoM phức tạp.
3. Phiếu nhập/xuất: nhiều dòng; khi **xác nhận** mới cập nhật tồn (không nháp tạm tính).
4. Xuất quá tồn → **chặn cứng** (HTTP 409), không cho âm.
5. Xuất Excel: MVP dùng **CSV** nếu estimate vượt (trade-off sẵn); ưu tiên Excel nếu còn capacity.
6. ~20 user đồng thời; deploy Docker on-prem hoặc cloud nội bộ.
7. Team: 1 PM + 2 Dev · **6 tuần** · capacity ≈ **90 MD** (3×30, trừ buffer meeting ≈ 75–80 MD usable).

## 4. In-scope MVP

- Danh mục hàng hoá (CRUD theo D4)
- Phiếu nhập kho (nhiều dòng) → tăng tồn
- Phiếu xuất kho → giảm tồn, chặn quá tồn
- Phiếu điều chỉnh tồn (kiểm kê) + duyệt bởi Quản lý
- Xem tồn hiện tại + cảnh báo dưới mức tối thiểu
- Lịch sử giao dịch / audit log
- Báo cáo nhập–xuất–tồn theo kỳ (số lượng; giá trị chỉ Quản lý)
- Phân quyền 2 role: `WAREHOUSE_CLERK` · `WAREHOUSE_MANAGER`

## 5. Out-of-scope (cố tình bỏ)

| Bỏ | Vì sao bỏ được |
|---|---|
| Nhiều kho / chi nhánh | D2; phức tạp transfer |
| Barcode / quét mobile | Hardware + app riêng |
| Tích hợp kế toán | D1 |
| Dự báo nhu cầu | Analytics nâng cao |
| LDAP/AD | Auth đơn giản đủ cho pilot nội bộ |
| Đa ngôn ngữ | User nội bộ VN |

## 6. Câu hỏi mở còn lại (không chặn MVP)

- Có cần số lô / hạn dùng? → **Không** trong MVP (giả định).
- Giá vốn nhập có bắt buộc trên phiếu? → **Tuỳ chọn**; báo cáo giá trị chỉ tính khi có giá.

## 🔒 Cổng hiểu (PM)

- **MVP cố tình bỏ:** barcode, nhiều kho, kế toán — vì 6 tuần / 3 người và brief đã out-of-scope.
- **Sửa giả định AI:** AI từng đề xuất “Thủ kho được CRUD danh mục” → **không đồng ý**; chốt D4 chỉ Quản lý sửa danh mục (giảm rủi ro master data bẩn).
