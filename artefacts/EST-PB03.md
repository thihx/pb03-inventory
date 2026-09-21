# EST-PB03 — Estimation (EX-03)
> Capstone bước [5] · Telemetry: ~25 phút · PM-edit=4 · **có vòng trade-off**

**Capacity:** 3 người × 6 tuần = 90 MD lịch · trừ 20% meeting/clinic ≈ **72 MD usable**.

Đơn vị: **MD** (người-ngày ≈ 6–7 giờ hiệu dụng).

---

## 1. Wave 1 estimates

| Task | Lạc quan | Khả dĩ | Bi quan | Giả định |
|---|---:|---:|---:|---|
| W1-01 Scaffold | 0.5 | 1 | 1.5 | template quen |
| W1-02 Schema+seed | 0.5 | 1 | 2 | SQLite |
| W1-03 Auth JWT | 0.5 | 1 | 2 | không LDAP |
| W1-04 RBAC | 0.25 | 0.5 | 1 | 2 role |
| W1-05 Products API | 0.5 | 1 | 2 | soft delete |
| W1-06 Stock In txn | 1 | 2 | 3 | audit cùng txn |
| W1-07 Stock list | 0.25 | 0.5 | 1 | |
| W1-08–10 UI WS | 2 | 3.5 | 5 | form đơn giản |
| W1-11 Tests | 0.5 | 1 | 2 | |
| W1-12 Audit polish | 0.25 | 0.5 | 1 | |
| **Cộng W1 (khả dĩ)** | | **~12 MD** | | |

## 2. Wave 2 (feature-level)

| Feature | Khả dĩ (MD) | Ghi chú |
|---|---:|---|
| W2-01 Stock Out + lock | 3 | rủi ro ước lượng cao |
| W2-02 Adjust approve | 2.5 | |
| W2-03 UI out+adjust | 3 | |
| W2-04 Report + **CSV** | 2 | đã cắt Excel |
| W2-05 Audit UI | 1.5 | |
| W2-06 SIT/UAT | 3 | |
| PM artefacts + viva prep | 4 | SCOPE…RTM |
| Buffer tích hợp/rework | 5 | |
| **Cộng W2+** | **~24** | |
| **Tổng khả dĩ W1+W2** | **~36 MD** | << 72 → **khớp mốc** |

## 3. Ba task rủi ro ước lượng cao nhất

1. **W2-01 concurrent stock out** — dễ underestimate race.
2. **W2-04 báo cáo NXT đúng tồn đầu/cuối** — logic kỳ kế toán dễ sai.
3. **UI end-to-end** — rework AC phân quyền.

## 4. Trade-off bắt buộc (EX-03 bước 4)

**Đối chiếu:** bản estimate v0 (ôm Excel POI-style + LDAP stub + multi-warehouse prep) ≈ **85 MD** > 72 usable.

| Cắt / đổi | Tiết kiệm | Quyết định |
|---|---:|---|
| Excel → **CSV** | ~3 MD | Chốt MVP |
| LDAP stub → bỏ | ~4 MD | Phase 2 |
| Multi-wh prep → bỏ | ~5 MD | D2 |
| **Diff scope** | | Cập nhật SCOPE D1/D5 + ARCH export CSV |

**EST v1 sau cắt:** ~36 MD core + buffer → **đạt** trong 6 tuần (còn room clinic/rework).

## 🔒 Cổng hiểu

- Con số W1-06 = 2 MD dựa trên giả định “1 txn gồm voucher + lines + movement + audit + update qty”.
- **Bác số AI:** AI bảo “UI toàn bộ 1 ngày” không giả định → buộc khoảng 2 / 3.5 / 5.
