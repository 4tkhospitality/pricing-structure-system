import { calculateNetToBar, calculateBarToNet, calculateGrossFromBase, TaxConfig, Campaign } from './calc-engine';

const taxConfig: TaxConfig = {
    vatPercent: 10,
    serviceChargePercent: 5
};

const campaigns: Campaign[] = [
    { name: 'Early Bird (EB-14)', discountValue: 15, calcType: 'PROGRESSIVE', applyOrder: 1 },
    { name: 'Mobile Rate', discountValue: 10, calcType: 'PROGRESSIVE', applyOrder: 2 }
];

console.log('--- TEST 1: Net to BAR (Progressive) ---');
const targetNet = 1000000;
const barResult = calculateNetToBar(targetNet, campaigns, taxConfig);
console.log(`Target Net: ${targetNet} VND`);
console.log(`Calculated BAR (Display Price): ${barResult} VND`);

console.log('--- TEST 2: BAR to Net (Verification) ---');
const { net: netCalculated } = calculateBarToNet(barResult, campaigns, taxConfig);
console.log(`From BAR ${barResult}, calculated Net: ${netCalculated} VND`);

console.log('--- TEST 3: Additive Discounts (Agoda Style) ---');
const agodaCampaigns: Campaign[] = [
    { name: 'Campaign A', discountValue: 10, calcType: 'ADDITIVE', applyOrder: 1 },
    { name: 'Campaign B', discountValue: 5, calcType: 'ADDITIVE', applyOrder: 2 }
];
const barAgoda = calculateNetToBar(targetNet, agodaCampaigns, taxConfig);
console.log(`Calculated BAR (Agoda Style): ${barAgoda} VND`);
const { net: netAgoda } = calculateBarToNet(barAgoda, agodaCampaigns, taxConfig);
console.log(`From BAR ${barAgoda}, calculated Net: ${netAgoda} VND`);

console.log('--- TEST 4: Vietnam Tax Breakdown ---');
const breakdown = calculateGrossFromBase(barResult, taxConfig);
console.log(`Total Price for Customer (including 10% VAT, 5% Service): ${breakdown.totalGross} VND`);
console.log(`VAT: ${breakdown.vat} VND`);
console.log(`Service Charge: ${breakdown.serviceCharge} VND`);
