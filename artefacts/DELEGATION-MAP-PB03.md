# DELEGATION-MAP-PB03 — Ủy quyền AI (Leash)
> Capstone bước [6b] · EX-06 · Telemetry: ~15 phút · PM-edit=3

**Thang:** L0–L5 · **Leash A ≈ L3** (tới bản nháp, người duyệt nội dung) · **Leash A+ ≈ L4** (fail-closed, chờ người duyệt mới merge/áp dụng).

| Loại việc | Mức L | Leash | Cổng |
|---|---|---|---|
| Sinh SCRATCH UI layout, copy nhãn | L2–L3 | **A** | PM duyệt nhìn |
| CRUD danh mục (code gen) | L3 | **A** | Review diff + test |
| Phiếu nhập/xuất **logic tồn** | L3–L4 | **A+** | PM/Dev duyệt txn & AC 409 |
| Schema migration / đổi constraint | L4 | **A+** | Fail-closed: không chạy migrate tới khi duyệt |
| Phân quyền RBAC, seed user/password | L4 | **A+** | Duyệt role matrix |
| Điều chỉnh tồn + approve API | L4 | **A+** | Duyệt state machine |
| Báo cáo có cột giá trị | L4 | **A+** | Kiểm strip field Clerk |
| Viết test negative | L3 | **A** | PM xác nhận map AC |
| Weekly report số liệu | L2 | **A** | **Cấm bịa**; chỉ số telemetry tay |
| Commit message / README | L2 | **A** | Skim |

### Quy tắc cứng

1. Việc đụng **tồn kho / tiền / phân quyền / schema** → **A+**, mặc định cổng **đóng**.
2. AI đề xuất “tạm cho qua test fail” → **hard-stop**.
3. Mọi A+ ghi 1 dòng vào DEVBOOK (AI làm gì → PM quyết gì).

## 🔒 Cổng hiểu

- **Vì sao approve adjust = A+:** nếu để A, AI có thể cho Clerk tự duyệt → phá kiểm soát gian lận tồn (R03).
- **Sửa AI:** AI xếp “RBAC middleware” = Leash A → **đổi thành A+**.
