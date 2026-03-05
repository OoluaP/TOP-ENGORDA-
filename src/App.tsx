import React, { useState, useEffect, useMemo } from 'react';
import { format, startOfDay } from 'date-fns';
import { Calculator, RefreshCcw, Calendar, Weight, TrendingUp, Info, ChevronDown } from 'lucide-react';
import { SeasonPeriod, Strategy, PlanResult, SeasonType, CattleType } from './types';
import { getFirstSeason, getNextSeason } from './utils/seasonCalendar';
import { buildPlan } from './utils/calcPlan';
import SeasonCard from './components/SeasonCard';
import AddStrategyModal from './components/AddStrategyModal';
import ResultsTable from './components/ResultsTable';

export default function App() {
  // Cattle Type State
  const [cattleType, setCattleType] = useState<CattleType>(CattleType.ENGORDA);

  // Animal Data State
  const [initialWeight, setInitialWeight] = useState<number>(330);
  const [targetWeight, setTargetWeight] = useState<number>(570);
  const [cattlePrice, setCattlePrice] = useState<number>(3700);
  const [arrobaPrice, setArrobaPrice] = useState<number>(300);
  const [calfPrice, setCalfPrice] = useState<number>(2300);
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // Fixed Costs State
  const [activeTab, setActiveTab] = useState<'animal' | 'costs'>('animal');
  const [pastureRent, setPastureRent] = useState<number>(50);
  const [labor, setLabor] = useState<number>(20);
  const [sanitary, setSanitary] = useState<number>(40);
  const [mortality, setMortality] = useState<number>(1);

  // Handle Cattle Type Change
  const handleCattleTypeChange = (type: CattleType) => {
    setCattleType(type);
    if (type === CattleType.RECRIA) {
      setInitialWeight(210);
      setTargetWeight(330);
      setCattlePrice(2500);
      setPastureRent(50);
      setLabor(20);
      setSanitary(40);
      setMortality(1);
    } else if (type === CattleType.ENGORDA) {
      setInitialWeight(330);
      setTargetWeight(570);
      setCattlePrice(3700);
      setPastureRent(50);
      setLabor(20);
      setSanitary(40);
      setMortality(1);
    } else if (type === CattleType.VACA_PARIDA) {
      setInitialWeight(360);
      setTargetWeight(420);
      setCattlePrice(5000);
      setCalfPrice(2300);
      setPastureRent(70);
      setLabor(15);
      setSanitary(30);
      setMortality(1.5);
    }
  };

  // Seasons and Strategies State
  const [seasons, setSeasons] = useState<SeasonPeriod[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSeasonId, setActiveSeasonId] = useState<string | null>(null);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | undefined>(undefined);

  // Initialize Seasons
  useEffect(() => {
    const date = startOfDay(new Date(startDate));
    setSeasons([getFirstSeason(date)]);
  }, [startDate]);

  const planResult = useMemo(() => {
    return buildPlan(
      initialWeight, 
      startOfDay(new Date(startDate)), 
      seasons,
      cattlePrice,
      arrobaPrice,
      { pastureRent, labor, sanitary, mortality },
      cattleType,
      calfPrice
    );
  }, [initialWeight, startDate, seasons, cattlePrice, arrobaPrice, pastureRent, labor, sanitary, mortality, cattleType, calfPrice]);

  const handleAddStrategy = (seasonId: string) => {
    setActiveSeasonId(seasonId);
    setEditingStrategy(undefined);
    setIsModalOpen(true);
  };

  const handleEditStrategy = (seasonId: string, strategy: Strategy) => {
    setActiveSeasonId(seasonId);
    setEditingStrategy(strategy);
    setIsModalOpen(true);
  };

  const handleSaveStrategy = (strategy: Strategy) => {
    if (!activeSeasonId) return;

    setSeasons(prev => {
      const newSeasons = prev.map(s => {
        if (s.id !== activeSeasonId) return s;

        const existingIndex = s.strategies.findIndex(st => st.id === strategy.id);
        let newStrategies = [...s.strategies];

        if (existingIndex >= 0) {
          newStrategies[existingIndex] = strategy;
        } else {
          newStrategies.push(strategy);
        }

        return { ...s, strategies: newStrategies };
      });

      // Check if we need to add a new season
      const lastSeason = newSeasons[newSeasons.length - 1];
      const usedDays = lastSeason.strategies.reduce((acc, st) => acc + st.days, 0);
      
      if (usedDays === lastSeason.totalDays) {
        newSeasons.push(getNextSeason(lastSeason));
      }

      return newSeasons;
    });
  };

  const handleRemoveStrategy = (seasonId: string, strategyId: string) => {
    setSeasons(prev => {
      let newSeasons = prev.map(s => {
        if (s.id !== seasonId) return s;
        return { ...s, strategies: s.strategies.filter(st => st.id !== strategyId) };
      });

      // Cleanup: if we have multiple seasons and the last one is empty 
      // AND the one before it is not full, we could potentially remove it.
      for (let i = newSeasons.length - 1; i > 0; i--) {
        const current = newSeasons[i];
        const previous = newSeasons[i-1];
        const prevUsedDays = previous.strategies.reduce((acc, st) => acc + st.days, 0);
        
        if (current.strategies.length === 0 && prevUsedDays < previous.totalDays) {
          newSeasons.splice(i, 1);
        } else {
          break;
        }
      }

      return newSeasons;
    });
  };

  const handleMoveStrategy = (seasonId: string, strategyId: string, direction: 'up' | 'down') => {
    setSeasons(prev => prev.map(s => {
      if (s.id !== seasonId) return s;
      const index = s.strategies.findIndex(st => st.id === strategyId);
      if (index === -1) return s;

      const newStrategies = [...s.strategies];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (targetIndex >= 0 && targetIndex < newStrategies.length) {
        [newStrategies[index], newStrategies[targetIndex]] = [newStrategies[targetIndex], newStrategies[index]];
      }
      
      return { ...s, strategies: newStrategies };
    }));
  };

  const handleReset = () => {
    if (confirm('Deseja resetar toda a simulação?')) {
      setCattleType(CattleType.ENGORDA);
      setInitialWeight(330);
      setTargetWeight(570);
      setCattlePrice(3700);
      setArrobaPrice(300);
      setCalfPrice(2300);
      setPastureRent(50);
      setLabor(20);
      setSanitary(40);
      setMortality(1);
      setStartDate(format(new Date(), 'yyyy-MM-dd'));
      setSeasons([getFirstSeason(startOfDay(new Date()))]);
    }
  };

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const activeSeason = seasons.find(s => s.id === activeSeasonId);
  const usedDaysInActiveSeason = activeSeason?.strategies.reduce((acc, s) => {
    if (editingStrategy && s.id === editingStrategy.id) return acc;
    return acc + s.days;
  }, 0) || 0;
  const maxDaysForModal = (activeSeason?.totalDays || 0) - usedDaysInActiveSeason;

  return (
    <div className="min-h-screen bg-zinc-50 pb-12 font-sans text-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white sm:h-10 sm:w-10 sm:rounded-xl">
              <Calculator className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-none sm:text-lg">TOP ENGORDA+</h1>
              <p className="hidden text-[10px] font-bold uppercase tracking-wider text-zinc-400 sm:block">Nutrição & Viabilidade</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)}
                className="flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-600 transition-all active:scale-95 hover:bg-zinc-50 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
              >
                Voltar
              </button>
            )}
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-600 transition-all active:scale-95 hover:bg-zinc-50 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
            >
              <RefreshCcw className="h-3.5 w-3.5 sm:h-4 w-4" />
              <span className="hidden sm:inline">Resetar</span>
            </button>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-1 w-full bg-zinc-100">
          <div 
            className="h-full bg-emerald-600 transition-all duration-500" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-4 sm:pt-8">
        {/* Step 1: Animal Data + Fixed Costs */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Dados Iniciais</h2>
              <p className="text-sm text-zinc-500">Configure as informações do animal e os custos fixos da operação.</p>
            </div>

            <div className="mx-auto max-w-2xl">
              <section className="rounded-3xl border border-zinc-200 bg-white p-2 shadow-sm">
                <div className="flex gap-1 rounded-2xl bg-zinc-100 p-1">
                  <button
                    onClick={() => setActiveTab('animal')}
                    className={`flex-1 rounded-xl py-3 text-xs font-bold transition-all active:scale-[0.98] ${
                      activeTab === 'animal' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    Animal
                  </button>
                  <button
                    onClick={() => setActiveTab('costs')}
                    className={`flex-1 rounded-xl py-3 text-xs font-bold transition-all active:scale-[0.98] ${
                      activeTab === 'costs' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    Custos Fixos
                  </button>
                </div>

                <div className="p-4 pt-6">
                  {activeTab === 'animal' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase text-zinc-400">Tipo de Gado</label>
                        <div className="relative">
                          <select
                            value={cattleType}
                            onChange={(e) => handleCattleTypeChange(e.target.value as CattleType)}
                            className="w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50 p-4 font-bold focus:border-emerald-500 focus:bg-white focus:outline-none"
                          >
                            {Object.values(CattleType).map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase text-zinc-400">
                            {cattleType === CattleType.VACA_PARIDA ? 'Peso Entrada' : 'Peso Inicial'}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              inputMode="numeric"
                              value={initialWeight}
                              onChange={(e) => setInitialWeight(parseFloat(e.target.value) || 0)}
                              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 font-bold focus:border-emerald-500 focus:bg-white focus:outline-none"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">kg</span>
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase text-zinc-400">
                            {cattleType === CattleType.VACA_PARIDA ? 'Peso Saída' : 'Peso Alvo'}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              inputMode="numeric"
                              value={targetWeight}
                              onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
                              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 font-bold focus:border-emerald-500 focus:bg-white focus:outline-none"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">kg</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase text-zinc-400">
                            {cattleType === CattleType.VACA_PARIDA ? 'Preço Vaca' : 'Preço Compra'}
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">R$</span>
                            <input
                              type="number"
                              inputMode="numeric"
                              value={cattlePrice}
                              onChange={(e) => setCattlePrice(parseFloat(e.target.value) || 0)}
                              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 pl-10 font-bold focus:border-emerald-500 focus:bg-white focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase text-zinc-400">Preço @ Venda</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">R$</span>
                            <input
                              type="number"
                              inputMode="numeric"
                              value={arrobaPrice}
                              onChange={(e) => setArrobaPrice(parseFloat(e.target.value) || 0)}
                              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 pl-10 font-bold focus:border-emerald-500 focus:bg-white focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {cattleType === CattleType.VACA_PARIDA && (
                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase text-zinc-400">Preço Bezerro</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">R$</span>
                            <input
                              type="number"
                              inputMode="numeric"
                              value={calfPrice}
                              onChange={(e) => setCalfPrice(parseFloat(e.target.value) || 0)}
                              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 pl-10 font-bold focus:border-emerald-500 focus:bg-white focus:outline-none"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase text-zinc-400">Data de Início</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 pl-12 font-bold focus:border-emerald-500 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase text-zinc-400">Aluguel Pasto (R$/mês)</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={pastureRent}
                          onChange={(e) => setPastureRent(parseFloat(e.target.value) || 0)}
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 font-bold focus:border-emerald-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase text-zinc-400">Mão de Obra (R$/mês)</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={labor}
                          onChange={(e) => setLabor(parseFloat(e.target.value) || 0)}
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 font-bold focus:border-emerald-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase text-zinc-400">Sanitário (R$/cabeça)</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={sanitary}
                          onChange={(e) => setSanitary(parseFloat(e.target.value) || 0)}
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 font-bold focus:border-emerald-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase text-zinc-400">Mortalidade (%)</label>
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.1"
                          value={mortality}
                          onChange={(e) => setMortality(parseFloat(e.target.value) || 0)}
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 font-bold focus:border-emerald-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <button
                onClick={() => setStep(2)}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 py-5 text-lg font-bold text-white shadow-xl shadow-emerald-200 transition-all active:scale-[0.98] hover:bg-emerald-700"
              >
                Adicionar estratégia nutricional
                <TrendingUp className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Nutritional Strategies */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Estratégias Nutricionais</h2>
              <p className="text-sm text-zinc-500">Defina os produtos e o tempo de trato para cada estação.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {seasons.map((season) => (
                <div key={season.id}>
                  <SeasonCard
                    season={season}
                    onAddStrategy={() => handleAddStrategy(season.id)}
                    onEditStrategy={(strategy) => handleEditStrategy(season.id, strategy)}
                    onRemoveStrategy={(id) => handleRemoveStrategy(season.id, id)}
                    onMoveStrategy={(id, dir) => handleMoveStrategy(season.id, id, dir)}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-zinc-100 p-5 text-zinc-600 sm:p-4">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400" />
              <div className="text-xs leading-relaxed">
                <p className="mb-1 font-bold text-zinc-500 uppercase tracking-wider">Calendário Automático</p>
                <p>
                  <strong className="text-zinc-900">ÁGUAS:</strong> 15/12 a 15/05 <br/>
                  <strong className="text-zinc-900">SECA:</strong> 16/05 a 14/12
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 py-5 text-lg font-bold text-white shadow-xl shadow-emerald-200 transition-all active:scale-[0.98] hover:bg-emerald-700"
            >
              Conferir resultado
              <Calculator className="h-6 w-6" />
            </button>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Resultados Finais</h2>
              <p className="text-sm text-zinc-500">Confira a viabilidade financeira e o desempenho estimado.</p>
            </div>

            <section className="rounded-3xl bg-emerald-600 p-8 text-white shadow-xl shadow-emerald-200">
              <div className="flex items-center gap-6">
                <div className="rounded-2xl bg-white/20 p-4">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">Estimativa Final</p>
                  <p className="text-4xl font-black">{planResult.finalWeight.toFixed(1)} kg</p>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-8 border-t border-white/10 pt-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">Investimento</p>
                  <p className="text-2xl font-bold">R$ {planResult.investmentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">Lucro Estimado</p>
                  <p className="text-2xl font-bold text-emerald-100">R$ {planResult.profitTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
                </div>
              </div>
            </section>

            <div id="results-section">
              <ResultsTable result={planResult} />
            </div>

            <button
              onClick={() => setStep(1)}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-zinc-200 py-4 text-sm font-bold text-zinc-600 transition-all active:scale-[0.98] hover:bg-zinc-50"
            >
              Ajustar dados da simulação
            </button>
          </div>
        )}
      </main>

      <AddStrategyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStrategy}
        maxDays={maxDaysForModal}
        seasonType={activeSeason?.type || SeasonType.AGUAS}
        editingStrategy={editingStrategy}
      />
    </div>
  );
}
