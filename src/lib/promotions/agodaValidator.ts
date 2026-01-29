import { PromotionInstance, PromotionGroup, TargetSubCategory } from "@/types/agoda";

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export function validateAgodaStack(promotions: PromotionInstance[]): ValidationResult {
    const activePromos = promotions.filter(p => p.isEnabled);
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Seasonal Rule: Max 1 enabled
    const seasonalCount = activePromos.filter(p => p.group === PromotionGroup.SEASONAL).length;
    if (seasonalCount > 1) {
        errors.push("Seasonal promotions không stack với nhau. Chỉ được chọn 1 chiến dịch Seasonal.");
    }

    // 2. Targeted Rule: Max 1 enabled per subCategory
    const targetedPromos = activePromos.filter(p => p.group === PromotionGroup.TARGETED);
    const subCategoryCounts: Record<string, number> = {};

    targetedPromos.forEach(p => {
        if (p.subCategory) {
            subCategoryCounts[p.subCategory] = (subCategoryCounts[p.subCategory] || 0) + 1;
        }
    });

    Object.entries(subCategoryCounts).forEach(([subCat, count]) => {
        if (count > 1) {
            errors.push(`Targeted promotions nhóm ${subCat} không được stack với nhau. Chỉ chọn 1.`);
        }
    });

    // 3. Essential & Customized Stacking
    const customizedPromo = activePromos.find(p => p.id === 'agoda-essential-customized');
    const otherEssentials = activePromos.filter(p =>
        p.group === PromotionGroup.ESSENTIAL &&
        p.id !== 'agoda-essential-customized'
    );

    if (customizedPromo && customizedPromo.allowStackWithOtherEssential === false) {
        if (otherEssentials.length > 0) {
            warnings.push("Customized Promotion đang được cấu hình không stack với các Essential khác. Các Essential khác sẽ bị bỏ qua.");
        }
    }

    // 4. Hard Clamps: Total Additive discount <= 80% (Check logic in calculator engine usually, but good to have here too)
    const totalAdditive = activePromos.reduce((sum, p) => sum + p.percent, 0);
    if (totalAdditive > 80) {
        errors.push("Tổng giảm giá (Additive) không được vượt quá 80%.");
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
