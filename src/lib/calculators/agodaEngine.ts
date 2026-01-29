import {
    CalculationMode,
    PromotionInstance,
    CalculationResult,
    CalculationTraceStep,
    PromotionGroup
} from "@/types/agoda";
import { validateAgodaStack } from "../promotions/agodaValidator";

export function calculateNetToBar(
    netTarget: number,
    commission: number,
    promotions: PromotionInstance[],
    mode: CalculationMode
): CalculationResult {
    const validation = validateAgodaStack(promotions);
    const activePromos = promotions.filter(p => {
        if (!p.isEnabled) return false;
        // Special case for Customized non-stacking
        const customized = promotions.find(cp => cp.id === 'agoda-essential-customized' && cp.isEnabled);
        if (customized && customized.allowStackWithOtherEssential === false) {
            if (p.group === PromotionGroup.ESSENTIAL && p.id !== 'agoda-essential-customized') {
                return false;
            }
        }
        return true;
    }).sort((a, b) => a.applyOrder - b.applyOrder);

    const trace: CalculationTraceStep[] = [];
    const errors = [...validation.errors];

    // Step 1: Gross Needed before discounts
    const commissionMultiplier = 1 - (commission / 100);
    if (commissionMultiplier <= 0) {
        errors.push("Hoa hồng quá lớn (>100%), không thể tính ngược giá BAR.");
        return { finalPrice: 0, trace, totalDiscountMultiplier: 1, totalDiscountSum: 0, isValid: false, errors };
    }

    const grossNeeded = netTarget / commissionMultiplier;

    // Step 2: Apply promotions reverse
    let currentPrice = grossNeeded;
    let multiplier = 1;
    let sumDiscount = 0;

    if (mode === CalculationMode.PROGRESSIVE) {
        // Reverse Progressive: BAR = Gross / Π(1 - d_i)
        activePromos.forEach(p => {
            const pMultiplier = 1 - (p.percent / 100);
            multiplier *= pMultiplier;
        });

        if (multiplier <= 0) {
            errors.push("Tổng khuyến mãi triệt tiêu giá bán (>=100%).");
            return { finalPrice: 0, trace, totalDiscountMultiplier: multiplier, totalDiscountSum: 0, isValid: false, errors };
        }

        currentPrice = grossNeeded / multiplier;

        // Trace calculation forward to show steps
        let tracePrice = currentPrice;
        activePromos.forEach(p => {
            const stepDiscount = tracePrice * (p.percent / 100);
            tracePrice -= stepDiscount;
            trace.push({
                stepName: p.name,
                percent: p.percent,
                priceAfterStep: tracePrice,
                cumulativeDiscountVsBAR: ((currentPrice - tracePrice) / currentPrice) * 100
            });
        });

    } else {
        // Reverse Additive: BAR = Gross / (1 - Σ d_i)
        sumDiscount = activePromos.reduce((s, p) => s + (p.percent / 100), 0);
        if (sumDiscount >= 0.8) {
            errors.push("Tổng khuyến mãi quá cao (>= 80% BAR).");
        }

        const divisor = 1 - sumDiscount;
        if (divisor <= 0) {
            errors.push("Tổng khuyến mãi triệt tiêu giá bán (>=100%).");
            return { finalPrice: 0, trace, totalDiscountMultiplier: 1, totalDiscountSum: sumDiscount * 100, isValid: false, errors };
        }

        currentPrice = grossNeeded / divisor;

        // Trace for Additive
        let cumulativePercent = 0;
        activePromos.forEach(p => {
            cumulativePercent += p.percent;
            const stepPrice = currentPrice * (1 - cumulativePercent / 100);
            trace.push({
                stepName: p.name,
                percent: p.percent,
                priceAfterStep: stepPrice,
                cumulativeDiscountVsBAR: cumulativePercent
            });
        });
    }

    return {
        finalPrice: Math.round(currentPrice),
        trace,
        totalDiscountMultiplier: multiplier,
        totalDiscountSum: sumDiscount * 100,
        isValid: errors.length === 0,
        errors
    };
}

export function calculateBarToNet(
    bar: number,
    commission: number,
    promotions: PromotionInstance[],
    mode: CalculationMode
): CalculationResult {
    const validation = validateAgodaStack(promotions);
    const activePromos = promotions.filter(p => {
        if (!p.isEnabled) return false;
        const customized = promotions.find(cp => cp.id === 'agoda-essential-customized' && cp.isEnabled);
        if (customized && customized.allowStackWithOtherEssential === false) {
            if (p.group === PromotionGroup.ESSENTIAL && p.id !== 'agoda-essential-customized') {
                return false;
            }
        }
        return true;
    }).sort((a, b) => a.applyOrder - b.applyOrder);

    const trace: CalculationTraceStep[] = [];
    let currentPrice = bar;
    let multiplier = 1;
    let sumDiscount = 0;

    if (mode === CalculationMode.PROGRESSIVE) {
        activePromos.forEach(p => {
            const discount = currentPrice * (p.percent / 100);
            currentPrice -= discount;
            multiplier *= (1 - (p.percent / 100));
            trace.push({
                stepName: p.name,
                percent: p.percent,
                priceAfterStep: currentPrice,
                cumulativeDiscountVsBAR: ((bar - currentPrice) / bar) * 100
            });
        });
    } else {
        let cumulativePercent = 0;
        activePromos.forEach(p => {
            cumulativePercent += p.percent;
            sumDiscount += (p.percent / 100);
            currentPrice = bar * (1 - cumulativePercent / 100);
            trace.push({
                stepName: p.name,
                percent: p.percent,
                priceAfterStep: currentPrice,
                cumulativeDiscountVsBAR: cumulativePercent
            });
        });
    }

    const netFinal = currentPrice * (1 - (commission / 100));

    return {
        finalPrice: Math.round(netFinal),
        trace,
        totalDiscountMultiplier: multiplier,
        totalDiscountSum: Math.min(sumDiscount * 100, 100),
        isValid: validation.isValid,
        errors: validation.errors
    };
}
