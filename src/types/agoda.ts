export enum PromotionGroup {
    SEASONAL = 'SEASONAL',
    ESSENTIAL = 'ESSENTIAL',
    TARGETED = 'TARGETED'
}

export enum TargetSubCategory {
    PRODUCT = 'PRODUCT',
    LOYALTY = 'LOYALTY',
    GEOGRAPHY = 'GEOGRAPHY',
    PLATFORM = 'PLATFORM',
    BEDS_NETWORK = 'BEDS_NETWORK'
}

export enum CalculationMode {
    PROGRESSIVE = 'PROGRESSIVE',
    ADDITIVE = 'ADDITIVE'
}

export interface PromotionTemplate {
    id: string;
    name: string;
    group: PromotionGroup;
    subCategory?: TargetSubCategory;
    defaultPercent: number | null;
    description?: string;
}

export interface PromotionInstance extends PromotionTemplate {
    instanceId: string; // Unique for this instance
    percent: number;
    isEnabled: boolean;
    allowStackWithOtherEssential?: boolean; // For customized essential
    applyOrder: number;
}

export interface AgodaPricingSettings {
    commission: number;
    calcMode: CalculationMode;
    promotions: PromotionInstance[];
}

export interface CalculationTraceStep {
    stepName: string;
    percent: number;
    priceAfterStep: number;
    cumulativeDiscountVsBAR: number;
}

export interface CalculationResult {
    finalPrice: number;
    trace: CalculationTraceStep[];
    totalDiscountMultiplier: number; // For progressive
    totalDiscountSum: number; // For additive
    isValid: boolean;
    errors: string[];
}
