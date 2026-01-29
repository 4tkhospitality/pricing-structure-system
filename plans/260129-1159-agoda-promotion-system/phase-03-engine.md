# Phase 03: Bi-directional Calculation Engine
Status: ⬜ Pending
Dependencies: Phase 01, Phase 02

## Objective
Nâng cấp bộ máy tính toán để hỗ trợ 2 hướng tính giá và các mode PROGRESSIVE/ADDITIVE của Agoda.

## Implementation Steps
1. [ ] Tạo file `src/lib/calculators/agodaEngine.ts`.
2. [ ] Viết hàm `calculateNetToBar(netTarget, commission, promotions, mode)`.
3. [ ] Viết hàm `calculateBarToNet(bar, commission, promotions, mode)`.
4. [ ] Trả về object chứa kết quả cuối và mảng trace các bước.
