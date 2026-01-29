# Phase 02: Stacking Validation Logic
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Xây dựng hàm `validateAgodaStack` để kiểm tra tính hợp lệ của danh sách khuyến mãi đang active.

## Requirements
- Không cho phép > 1 Seasonal.
- Không cho phép > 1 Targeted trong cùng subCategory.
- Clamp tổng discount (Additive) <= 80%.
- Xử lý CustomizedPromotion stacking logic.

## Implementation Steps
1. [ ] Tạo file `src/lib/promotions/agodaValidator.ts`.
2. [ ] Implement hàm `validateAgodaStack(promotions: PromotionInstance[])`.
