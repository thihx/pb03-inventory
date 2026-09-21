# VIVA-NOTES-PB03 — Gợi ý bảo vệ

## Câu hỏi dự kiến & câu trả lời ngắn

**Vì sao không Spring Boot đúng brief?**  
Capstone ưu tiên lát cắt chạy + đúng nghiệp vụ phân quyền/tồn trong thời gian ngắn. ARCH ghi nợ port; API contract & schema giữ nguyên khi đổi stack.

**Chỗ AI sai và bạn sửa?**  
(1) Clerk CRUD danh mục → chỉ Manager. (2) Report trả giá trị cho Clerk → strip. (3) Adjust đổi tồn ngay → PENDING + approve.

**Nếu thêm barcode?**  
Out-of-scope; cần mobile + hardware → phase 2, mở lại EST/WBS, không nhồi MVP 6 tuần.

**Nếu đổi ràng buộc: cho phép tồn âm có PO?**  
Đổi US-04 + bỏ 409 hard-block → thành warning + quyền Manager; phải sửa test & risk R01.
