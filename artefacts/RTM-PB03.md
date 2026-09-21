# RTM-PB03 — Requirements Traceability Matrix
> Capstone bước [10a] · EX-05

| Story | Spec | Design | Code | Test | Status |
|---|---|---|---|---|---|
| US-01 Login | SPEC | ARCH Auth | `POST /api/auth/login` + Login UI | manual U1 | Covered |
| US-02 Products CRUD | SPEC | M1 + RBAC | `products` routes + ProductsView | test 403 Clerk | Covered |
| US-03 Stock In | SPEC | M2 | `POST /vouchers/in` + VoucherForm | test US-03 | Covered |
| US-04 Stock Out + block | SPEC | M3 | `POST /vouchers/out` | test 409 | Covered |
| US-05 Adjust approve | SPEC | M4 | adjust + approve/reject UI | test US-05 | Covered |
| US-06 Stock view / low | SPEC | M5 | `GET /stock` + StockView | manual | Covered |
| US-07 Report + CSV | SPEC | M6 | `/reports/nxt` + csv | test strip value | Covered |
| US-08 Audit | SPEC | M7 | `GET /audit` + AuditView | manual Manager | Covered |
| NFR-01 No negative stock | SPEC | ARCH txn | out check in txn | test 409 | Covered |
| NFR-03 Audit mutate | SPEC | M0-Audit | `audit()` calls | code review | Covered |

**Không còn story MVP mồ côi.**

## 🔒 Cổng hiểu

Ví dụ truy vết: **US-04** → SPEC AC 409 → `confirmStockVoucher('OUT')` check `quantity_on_hand` → test `stock out beyond on-hand`.
