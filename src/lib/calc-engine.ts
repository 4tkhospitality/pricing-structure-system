export interface TaxConfig {
  vatPercent: number; // e.g., 10 for 10%
  serviceChargePercent: number; // e.g., 5 for 5%
}

export interface Campaign {
  id?: string;
  name: string;
  discountValue: number; // Percentage, e.g., 15 for 15%
  calcType: 'ADDITIVE' | 'PROGRESSIVE';
  applyOrder: number;
  incompatibleWith?: string[]; // IDs of other campaigns
}

export interface PricingBreakdownItem {
  stageName: string;
  priceBefore: number;
  discountAmount: number;
  priceAfter: number;
  description: string;
}

/**
 * Vietnam Standard Calculation: 
 * Total Gross = Base * (1 + ServiceCharge) * (1 + VAT)
 */
export const calculateGrossFromBase = (base: number, config: TaxConfig) => {
  const serviceCharge = base * (config.serviceChargePercent / 100);
  const totalBeforeVat = base + serviceCharge;
  const vat = totalBeforeVat * (config.vatPercent / 100);
  return {
    serviceCharge,
    vat,
    totalGross: totalBeforeVat + vat
  };
};

/**
 * Calculates the Net Revenue from a BAR price considering stacked campaigns and taxes.
 * BAR -> Net
 */
export const calculateBarToNet = (
  barPrice: number,
  campaigns: Campaign[],
  taxConfig: TaxConfig
): { net: number; trace: PricingBreakdownItem[] } => {
  let currentPrice = barPrice;
  const trace: PricingBreakdownItem[] = [];

  // Sort campaigns by applyOrder
  const sortedCampaigns = [...campaigns].sort((a, b) => a.applyOrder - b.applyOrder);

  // Track active campaigns (filter incompatible ones)
  // For MVP: simply apply them in order. Incompatibility logic can be added here or in UI.

  let totalAdditiveDiscount = 0;

  sortedCampaigns.forEach(c => {
    const priceBefore = currentPrice;
    let discountAmount = 0;

    if (c.calcType === 'PROGRESSIVE') {
      discountAmount = currentPrice * (c.discountValue / 100);
      currentPrice -= discountAmount;
    } else {
      // Additive is usually calculated based on the ORIGINAL base price (BAR)
      discountAmount = barPrice * (c.discountValue / 100);
      currentPrice -= discountAmount;
    }

    trace.push({
      stageName: c.name,
      priceBefore,
      discountAmount,
      priceAfter: currentPrice,
      description: `${c.calcType} Discount ${c.discountValue}%`
    });
  });

  return { net: Math.round(currentPrice), trace };
};

/**
 * Calculates the BAR Display Price required to achieve a target Net.
 * Uses Binary Search (Numeric Solver) for accuracy in complex stacking.
 * Net -> BAR
 */
export const calculateNetToBar = (
  targetNet: number,
  campaigns: Campaign[],
  taxConfig: TaxConfig
): number => {
  // We want to find BAR such that calculateBarToNet(BAR, ...) == targetNet
  // The function is monotonic, so binary search works.

  let low = targetNet;
  let high = targetNet * 5; // Reasonable upper bound (80% discount max)
  let result = high;

  // 20 iterations for high precision (±0.0001% error)
  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2;
    const { net } = calculateBarToNet(mid, campaigns, taxConfig);

    if (net < targetNet) {
      low = mid;
    } else {
      high = mid;
      result = mid;
    }
  }

  return Math.round(result);
};

export const getPricingBreakdown = (
  barPrice: number,
  campaigns: Campaign[],
  taxConfig: TaxConfig
) => {
  const { net, trace } = calculateBarToNet(barPrice, campaigns, taxConfig);
  const { serviceCharge, vat, totalGross } = calculateGrossFromBase(barPrice, taxConfig);

  return {
    barPrice,
    netRevenue: net,
    trace,
    taxes: {
      serviceCharge,
      vat,
      totalGross
    }
  };
};
