# SPEC: Agoda Promotion Library & Stacking System

## 1. Executive Summary
Hệ thống quản lý khuyến mãi tập trung cho Agoda, tuân thủ các quy tắc stacking thực tế của Agoda và tích hợp sâu vào bộ máy tính toán giá.

## 2. Data Models & Types

### Enums
- `PromotionGroup`: `SEASONAL`, `ESSENTIAL`, `TARGETED`
- `TargetSubCategory`: `PRODUCT`, `LOYALTY`, `GEOGRAPHY`, `PLATFORM`, `BEDS_NETWORK`
- `CalculationMode`: `PROGRESSIVE`, `ADDITIVE`

### Interface: PromotionInstance
```typescript
interface PromotionInstance {
  id: string;
  templateId: string;
  name: string;
  group: PromotionGroup;
  subCategory?: TargetSubCategory;
  percent: number; // 0-100
  isEnabled: boolean;
  allowStackWithOtherEssential?: boolean; // For customized
}
```

## 3. Stacking Rules (The Logic)
- **Seasonal:** Max 1 enabled.
- **Targeted:** Max 1 enabled per `subCategory`.
- **Essential:** Multiple enabled. 
- **Customized Toggle:** If `allowStackWithOtherEssential` is false, it disables others (or vice versa).
- **Hard Clamps:** Total additive discount <= 80%.

## 4. Calculation Engine Integrations

### Hướng A (Net -> BAR)
1. `grossNeeded = netTarget / (1 - (commission / 100))`
2. Apply discounts:
   - Progressive: `barNeeded = grossNeeded / product(1 - d_i/100)`
   - Additive: `barNeeded = grossNeeded / (1 - sum(d_i/100))`
3. Result: `barNeeded`

### Hướng B (BAR -> Net)
1. Apply discounts:
   - Progressive: `grossAfterDiscount = bar * product(1 - d_i/100)`
   - Additive: `grossAfterDiscount = bar * (1 - sum(d_i/100))`
2. `netFinal = grossAfterDiscount * (1 - (commission / 100))`
3. Result: `netFinal`

## 5. UI Components Hierarchy
- `AgodaPricingTab`: Container chính
- `AgodaPromotionPanel`: Accordion chia 3 nhóm (Seasonal, Essential, Targeted)
- `PromotionPickerModal`: Browser để add promotion mới
- `CalculationTrace`: Bảng diễn giải từng bước

## 6. Persistence
- Lưu vào Supabase Table: `HotelSettings` (hoặc JSON column trong campaign data).
- Key Format: `ota_pricing_agoda_v1`.
