import { Supplement } from '../types';

export const SUPPLEMENTS: Supplement[] = [
  {
    id: 'sal-60p',
    name: 'Sal Mineral 60P',
    defaultConsumption: 0.025,
    defaultCost: 3.80,
    defaultGMD_Aguas: 0.50,
    defaultGMD_Seca: -0.10,
  },
  {
    id: 'sal-flavomicina',
    name: 'Sal Adensado (Flavomicina)',
    defaultConsumption: 0.05,
    defaultCost: 3.33,
    defaultGMD_Aguas: 0.60,
    defaultGMD_Seca: 0.15,
  },
  {
    id: 'proteinado-01',
    name: 'Proteinado 0.1% PV',
    defaultConsumption: 0.10,
    defaultCost: 2.13,
    defaultGMD_Aguas: 0.75,
    defaultGMD_Seca: 0.35,
  },
  {
    id: 'proteinado-03',
    name: 'Proteinado 0.3% PV',
    defaultConsumption: 0.30,
    defaultCost: 2.03,
    defaultGMD_Aguas: 0.70,
    defaultGMD_Seca: 0.40,
  },
  {
    id: 'proteico-05',
    name: 'Proteico Energético 0.5% PV',
    defaultConsumption: 0.50,
    defaultCost: 2.00,
    defaultGMD_Aguas: 0.85,
    defaultGMD_Seca: 0.55,
  },
  {
    id: 'racao-1',
    name: 'Ração 1% PV (TIP)',
    defaultConsumption: 1.00,
    defaultCost: 1.76,
    defaultGMD_Aguas: 1.00,
    defaultGMD_Seca: 0.70,
  },
];
