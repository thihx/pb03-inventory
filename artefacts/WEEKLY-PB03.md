# WEEKLY-PB03 + Telemetry
> Capstone bước [10b] · EX-05 · **Giờ người thật, không suy từ token**

## Telemetry (reconcile tay)

| Hạng mục | Giá trị | Nguồn |
|---|---|---|
| Thời gian ngồi máy (session này) | **~3.5 giờ** | Đồng hồ làm việc |
| Est truyền thống (không AI) cho cùng scope MVP mỏng | ~24–28 giờ | EST W1+core W2 rút |
| **Nén** (truyền thống ÷ thật) | ~7× | 26 / 3.5 |
| Token (est) | ~120k | Cursor usage ước lượng — **không dùng để chấm** |
| Số vòng lặp plan→gate | 4 | |
| **PM-edit** (chỗ sửa AI) | **7** | DEVBOOK #1–7 |
| Rework sau test | 0 fail | npm test 5/5 |

> Cấm bịa: không có “tỷ lệ phân quyền sai %” hay “số lượt điều chỉnh / tuần” vì chưa có prod telemetry — ghi **N/A**.

## Weekly Report

**Tiến độ**
- Artefacts [0]–[10] đủ trong `artefacts/`.
- Hệ thống chạy: API + React SPA; Walking Skeleton + Out/Adjust/Report/Audit.
- Test API xanh 5/5.

**Rủi ro**
- D2 logic NXT opening xấp xỉ — chấp nhận MVP, cần chốt kỳ kế toán nếu pilot thật.
- D3 lệch stack brief (Spring/.NET) — sẵn sàng giải thích ở viva.

**Quyết định cần Coach**
1. Xác nhận Tier 1 với Express+SQLite có chấp nhận thay Spring không?
2. Có yêu cầu port PostgreSQL+Docker trước viva không?

## Chuẩn bị VIVA (3 cổng)

1. Điểm năng lực — tự đánh giá có Dev Book + RTM + hệ thống chạy.
2. **Demo** luồng clerk nhập → xuất 409 → manager duyệt adjust.
3. Trả lời: vì sao A+ cho approve/RBAC; chỗ AI sai đã sửa (DEVBOOK).
