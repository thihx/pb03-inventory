# SPEC-PB03 — Software Requirements Specification (SRS)
> Capstone bước [1] · EX-01 · Telemetry: ~40 phút · PM-edit=5 · vòng=2

**Nguồn:** SCOPE-PB03.md · Brief PB-03

---

## 1. Roles

| Role | Mã | Mô tả |
|---|---|---|
| Thủ kho | `WAREHOUSE_CLERK` | Tạo phiếu nhập/xuất; xem tồn số lượng; không xem báo cáo giá trị; không CRUD danh mục; không tự duyệt điều chỉnh |
| Quản lý kho | `WAREHOUSE_MANAGER` | Toàn quyền MVP: CRUD danh mục, duyệt điều chỉnh, xem báo cáo số lượng + giá trị, xem audit |
| Hệ thống | `SYSTEM` | Ghi audit log tự động |

---

## 2. User stories MVP + Acceptance Criteria

### US-01 — Đăng nhập
**Là** nhân viên kho, **tôi muốn** đăng nhập tài khoản nội bộ, **để** hệ thống biết role của tôi.  
**MVP:** Yes

**AC (Given/When/Then)**
- Given tài khoản hợp lệ, When nhập đúng user/pass, Then nhận session/JWT và vào trang phù hợp role.
- Given sai mật khẩu, When đăng nhập, Then 401, không lộ “user có tồn tại hay không” khác biệt quá rõ.
- Given chưa đăng nhập, When gọi API nghiệp vụ, Then 401.

### US-02 — CRUD danh mục hàng (Quản lý)
**Là** Quản lý, **tôi muốn** thêm/sửa/xoá (soft) hàng hoá (mã, tên, đơn vị, tồn tối thiểu, giá vốn tùy chọn), **để** master data chuẩn.  
**MVP:** Yes

**AC**
- Given role Manager, When tạo hàng mã chưa trùng, Then 201 và xuất hiện trong danh sách.
- Given mã đã tồn tại, When tạo trùng, Then 409.
- Given role Clerk, When POST/PUT/DELETE product, Then 403.
- Given hàng đang có tồn > 0, When xoá cứng, Then **không cho** — chỉ soft-deactivate (negative).

### US-03 — Phiếu nhập kho
**Là** Thủ kho, **tôi muốn** tạo phiếu nhập nhiều dòng và xác nhận, **để** tồn tăng đúng.  
**MVP:** Yes

**AC**
- Given sản phẩm active, When xác nhận phiếu nhập số lượng > 0, Then tồn tăng đúng tổng dòng; có bản ghi lịch sử IN.
- Given số lượng ≤ 0, When xác nhận, Then 400.
- Given sản phẩm inactive, When thêm vào phiếu, Then 400.

### US-04 — Phiếu xuất kho + chặn quá tồn
**Là** Thủ kho, **tôi muốn** tạo phiếu xuất, **để** xuất hàng không vượt tồn.  
**MVP:** Yes

**AC**
- Given tồn đủ, When xác nhận xuất, Then tồn giảm; lịch sử OUT.
- Given tổng xuất > tồn hiện tại, When xác nhận, Then **409**, tồn **không đổi** (negative — cốt lõi đề).
- Given concurrent 2 phiếu xuất cùng SKU vượt tồn, Then tối đa 1 phiếu thành công; phiếu còn lại 409 (NFR consistency).

### US-05 — Điều chỉnh tồn có duyệt
**Là** Thủ kho, **tôi muốn** tạo yêu cầu điều chỉnh khi kiểm kê lệch, **để** sổ khớp thực tế có kiểm soát.  
**MVP:** Yes

**AC**
- Given Clerk tạo điều chỉnh, Then trạng thái `PENDING`, tồn **chưa** đổi.
- Given Manager duyệt, Then tồn cập nhật theo delta; audit ghi người duyệt.
- Given Manager từ chối, Then `REJECTED`, tồn không đổi.
- Given Clerk tự duyệt, Then 403 (negative).

### US-06 — Xem tồn & cảnh báo min
**Là** nhân viên kho, **tôi muốn** xem tồn hiện tại và hàng dưới mức tối thiểu, **để** biết cần nhập thêm.  
**MVP:** Yes

**AC**
- Given đã login, When mở màn tồn, Then thấy mã/tên/tồn/min; hàng `qty < min_stock` được đánh dấu.
- Clerk và Manager đều xem được **số lượng**.

### US-07 — Báo cáo NXT theo kỳ
**Là** Quản lý, **tôi muốn** báo cáo nhập–xuất–tồn theo khoảng ngày và xuất file, **để** đối soát.  
**MVP:** Yes

**AC**
- Given Manager, When chọn from–to, Then báo cáo có cột: tồn đầu, nhập, xuất, điều chỉnh, tồn cuối (theo số lượng).
- Given Clerk, When gọi báo cáo **giá trị**, Then 403.
- Given Manager, When xuất CSV/Excel, Then file tải được với cùng số liệu màn hình.

### US-08 — Audit / lịch sử giao dịch
**Là** Quản lý, **tôi muốn** xem ai tạo/sửa/duyệt gì lúc nào, **để** truy vết.  
**MVP:** Yes

**AC**
- Mọi xác nhận phiếu IN/OUT/ADJUST và CRUD product ghi `audit_logs` (actor, action, entity, at, payload tóm tắt).
- Clerk xem được lịch sử giao dịch **phiếu của kho** (số lượng); không xoá/sửa log.

---

## 3. NFR

| ID | Hạng mục | Tiêu chí đo |
|---|---|---|
| NFR-01 | Toàn vẹn tồn | Tồn = tổng biến động lịch sử; không âm sau mọi giao dịch thành công |
| NFR-02 | Đồng thời | ~20 user; xuất dùng transaction + row lock / optimistic version |
| NFR-03 | Audit | Mọi mutate ghi log; không cho user xoá log |
| NFR-04 | Bảo mật | HTTPS khi deploy; password hash (bcrypt); RBAC trên API |
| NFR-05 | Hiệu năng | Danh sách sản phẩm ≤ 5k SKU: list < 2s trên LAN nội bộ |
| NFR-06 | Khả dụng | MVP single instance chấp nhận; backup DB hằng ngày (ops) |

---

## 4. Use-case × Role

| Use-case | Clerk | Manager |
|---|:---:|:---:|
| Login | ✓ | ✓ |
| Xem danh mục | ✓ | ✓ |
| CRUD danh mục | ✗ | ✓ |
| Tạo/xác nhận phiếu nhập | ✓ | ✓ |
| Tạo/xác nhận phiếu xuất | ✓ | ✓ |
| Tạo yêu cầu điều chỉnh | ✓ | ✓ |
| Duyệt/từ chối điều chỉnh | ✗ | ✓ |
| Xem tồn số lượng | ✓ | ✓ |
| Báo cáo NXT số lượng | ✓ (read) | ✓ |
| Báo cáo giá trị / xuất file đầy đủ | ✗ | ✓ |
| Xem audit đầy đủ | ✗ | ✓ |

---

## 5. Hard-stop / stakeholder simulation (EX-01 bước 5)

**Stakeholder:** “Muốn quét barcode bằng điện thoại trong MVP.”  
**PM:** Out-of-scope (hardware + mobile). Phase 2. MVP nhập mã tay / chọn từ danh sách. Ghi vào SCOPE out-of-scope — **không** mở rộng 6 tuần.

---

## 🔒 Cổng hiểu

- **US-04 FAIL khi:** xuất 10 trong khi tồn 5 mà hệ thống vẫn 200 và tồn = -5.
- **Bổ sung negative:** AI chỉ viết happy-path CRUD product → thêm AC 403 cho Clerk + chặn xoá khi còn tồn.
