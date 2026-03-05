import { addDays } from 'date-fns';
import { PlanResult, PlanRow, SeasonPeriod, Strategy, CattleType } from '../types';
import { SUPPLEMENTS } from '../data/supplements';

export function buildPlan(
  initialWeight: number,
  startDate: Date,
  seasons: SeasonPeriod[],
  cattlePrice: number,
  arrobaPrice: number,
  fixedCosts: {
    pastureRent: number; // R$/month
    labor: number; // R$/month
    sanitary: number; // R$/head (total)
    mortality: number; // %
  },
  cattleType: CattleType = CattleType.ENGORDA,
  calfPrice: number = 0
): PlanResult {
  const rows: PlanRow[] = [];
  let currentWeight = initialWeight;
  let currentDate = startDate;
  let nutritionCost = 0;
  let totalDays = 0;

  for (const season of seasons) {
    let seasonWeight = currentWeight;
    let seasonDate = season.startDate;
    
    for (const strategy of season.strategies) {
      const supplement = SUPPLEMENTS.find(s => s.id === strategy.supplementId);
      const name = supplement ? supplement.name : 'Desconhecido';
      
      const consumptionPerDay = seasonWeight * (strategy.consumption / 100);
      const totalConsumption = consumptionPerDay * strategy.days;
      const costPeriod = totalConsumption * strategy.cost;
      const finalWeight = seasonWeight + (strategy.gmd * strategy.days);
      const endDate = addDays(seasonDate, strategy.days - 1);

      rows.push({
        nutrition: name,
        season: season.type,
        startDate: seasonDate,
        endDate,
        days: strategy.days,
        consumptionPerDay,
        totalConsumption,
        valueKg: strategy.cost,
        costPeriod,
        gmd: strategy.gmd,
        initialWeight: seasonWeight,
        finalWeight,
      });

      nutritionCost += costPeriod;
      totalDays += strategy.days;
      seasonWeight = finalWeight;
      seasonDate = addDays(endDate, 1);
    }
    
    currentWeight = seasonWeight;
    currentDate = seasonDate;
  }

  const totalMonths = totalDays / 30 || 0;
  const pastureTotal = fixedCosts.pastureRent * totalMonths;
  const laborTotal = fixedCosts.labor * totalMonths;
  const sanitaryTotal = fixedCosts.sanitary;
  
  const fixedCostsTotal = pastureTotal + laborTotal + sanitaryTotal;
  const investmentTotal = cattlePrice + nutritionCost + fixedCostsTotal;
  
  // Revenue calculation
  let potentialRevenue = 0;
  if (cattleType === CattleType.VACA_PARIDA) {
    potentialRevenue = (currentWeight / 30) * arrobaPrice + calfPrice;
  } else {
    potentialRevenue = (currentWeight / 30) * arrobaPrice;
  }

  const mortalityLoss = potentialRevenue * (fixedCosts.mortality / 100);
  const revenueTotal = potentialRevenue - mortalityLoss;

  const profitTotal = revenueTotal - investmentTotal;
  const profitPercent = investmentTotal > 0 ? (profitTotal / investmentTotal) * 100 : 0;
  const monthlyReturn = totalMonths > 0 ? profitPercent / totalMonths : 0;

  const arrobasProduced = (currentWeight - initialWeight) / 30;
  const profitPerArroba = arrobasProduced > 0 ? profitTotal / arrobasProduced : 0;

  return {
    rows,
    totalDays,
    totalCost: nutritionCost,
    pastureTotal,
    laborTotal,
    sanitaryTotal,
    mortalityLoss,
    fixedCostsTotal,
    investmentTotal,
    revenueTotal,
    profitTotal,
    profitPercent,
    monthlyReturn,
    profitPerArroba,
    finalWeight: currentWeight,
    endDate: rows.length > 0 ? rows[rows.length - 1].endDate : startDate,
  };
}
