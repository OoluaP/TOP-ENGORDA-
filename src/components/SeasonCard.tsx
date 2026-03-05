import React from 'react';
import { SeasonPeriod, Strategy, SeasonType } from '../types';
import { SUPPLEMENTS } from '../data/supplements';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, Edit2, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface SeasonCardProps {
  season: SeasonPeriod;
  onAddStrategy: () => void;
  onEditStrategy: (strategy: Strategy) => void;
  onRemoveStrategy: (strategyId: string) => void;
  onMoveStrategy: (strategyId: string, direction: 'up' | 'down') => void;
}

export default function SeasonCard({
  season,
  onAddStrategy,
  onEditStrategy,
  onRemoveStrategy,
  onMoveStrategy,
}: SeasonCardProps) {
  const usedDays = season.strategies.reduce((acc, s) => acc + s.days, 0);
  const remainingDays = season.totalDays - usedDays;

  const isAguas = season.type === SeasonType.AGUAS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`overflow-hidden rounded-2xl border ${
        isAguas ? 'border-emerald-100 bg-emerald-50/30' : 'border-amber-100 bg-amber-50/30'
      } shadow-sm`}
    >
      <div className={`px-4 py-3 flex items-center justify-between sm:py-3 ${
        isAguas ? 'bg-emerald-100/50' : 'bg-amber-100/50'
      }`}>
        <div>
          <h3 className={`text-base font-bold sm:text-lg ${isAguas ? 'text-emerald-900' : 'text-amber-900'}`}>
            {season.type}
          </h3>
          <p className="text-[10px] text-zinc-600 sm:text-xs">
            {format(season.startDate, 'dd/MM/yy')} até {format(season.endDate, 'dd/MM/yy')} ({season.totalDays} dias)
          </p>
        </div>
        <div className="text-right">
          <p className={`text-[10px] font-bold uppercase sm:text-sm ${remainingDays === 0 ? 'text-zinc-400' : 'text-zinc-700'}`}>
            {remainingDays} dias livres
          </p>
        </div>
      </div>

      <div className="p-3.5 space-y-3 sm:p-4">
        {season.strategies.map((strategy, index) => {
          const supplement = SUPPLEMENTS.find((s) => s.id === strategy.supplementId);
          return (
            <div
              key={strategy.id}
              className="group flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm transition-all active:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between sm:p-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 sm:items-center sm:justify-start">
                  <span className="text-xs font-bold text-zinc-900 sm:text-sm line-clamp-2 sm:line-clamp-1 leading-tight">
                    {supplement?.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold text-zinc-500 uppercase sm:px-2 sm:text-[10px]">
                    {strategy.days}d
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-zinc-500 sm:mt-1 sm:text-xs">
                  <span className="whitespace-nowrap">{strategy.consumption}% PV</span>
                  <span className="whitespace-nowrap">{strategy.gmd}kg GMD</span>
                  <span className="whitespace-nowrap">R$ {strategy.cost}/kg</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1 border-t border-zinc-50 pt-2 sm:border-0 sm:pt-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onMoveStrategy(strategy.id, 'up')}
                  disabled={index === 0}
                  className="p-1.5 text-zinc-300 hover:text-zinc-600 disabled:opacity-10 sm:p-1"
                >
                  <ArrowUp className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                </button>
                <button
                  onClick={() => onMoveStrategy(strategy.id, 'down')}
                  disabled={index === season.strategies.length - 1}
                  className="p-1.5 text-zinc-300 hover:text-zinc-600 disabled:opacity-10 sm:p-1"
                >
                  <ArrowDown className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                </button>
                <button
                  onClick={() => onEditStrategy(strategy)}
                  className="p-1.5 text-emerald-500 hover:text-emerald-700 sm:p-1"
                >
                  <Edit2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                </button>
                <button
                  onClick={() => onRemoveStrategy(strategy.id)}
                  className="p-1.5 text-red-400 hover:text-red-600 sm:p-1"
                >
                  <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {remainingDays > 0 && (
          <button
            onClick={onAddStrategy}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-4 text-sm font-bold transition-all active:scale-[0.98] sm:py-3 ${
              isAguas
                ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-100/50'
                : 'border-amber-200 text-amber-600 hover:bg-amber-100/50'
            }`}
          >
            <Plus className="h-5 w-5 sm:h-4 w-4" />
            🌽 Adicionar estratégia
          </button>
        )}
      </div>
    </motion.div>
  );
}
