
export enum SeasonType {
  AGUAS = 'ÁGUAS',
  SECA = 'SECA',
}

export enum CattleType {
  RECRIA = 'Recria',
  ENGORDA = 'Engorda',
  VACA_PARIDA = 'Vaca Parida',
}

export interface Supplement {
  id: string;
  name: string;
  defaultConsumption: number; // % of PV
  defaultCost: number; // R$/kg
  defaultGMD_Aguas: number; // kg/day
  defaultGMD_Seca: number; // kg/day
}

export interface Strategy {
  id: string;
  supplementId: string;
  consumption: number; // % of PV
  cost: number; // R$/kg
  days: number;
  gmd: number; // kg/day
}

export interface SeasonPeriod {
  id: string;
  type: SeasonType;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  strategies: Strategy[];
}

export interface PlanRow {
  nutrition: string;
  season: SeasonType;
  startDate: Date;
  endDate: Date;
  days: number;
  consumptionPerDay: number;
  totalConsumption: number;
  valueKg: number;
  costPeriod: number;
  gmd: number;
  initialWeight: number;
  finalWeight: number;
}

export interface PlanResult {
  rows: PlanRow[];
  totalDays: number;
  totalCost: number; // Nutrition cost only
  pastureTotal: number;
  laborTotal: number;
  sanitaryTotal: number;
  mortalityLoss: number;
  fixedCostsTotal: number;
  investmentTotal: number;
  revenueTotal: number;
  profitTotal: number;
  profitPercent: number;
  monthlyReturn: number;
  profitPerArroba: number;
  finalWeight: number;
  endDate: Date;
}
