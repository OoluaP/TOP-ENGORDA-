import React, { useState, useEffect } from 'react';
import { Supplement, Strategy, SeasonType } from '../types';
import { SUPPLEMENTS } from '../data/supplements';
import { X } from 'lucide-react';

interface AddStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (strategy: Strategy) => void;
  maxDays: number;
  seasonType: SeasonType;
  editingStrategy?: Strategy;
}

export default function AddStrategyModal({
  isOpen,
  onClose,
  onSave,
  maxDays,
  seasonType,
  editingStrategy,
}: AddStrategyModalProps) {
  const [supplementId, setSupplementId] = useState(SUPPLEMENTS[0].id);
  const [consumption, setConsumption] = useState(SUPPLEMENTS[0].defaultConsumption);
  const [cost, setCost] = useState(SUPPLEMENTS[0].defaultCost);
  const [days, setDays] = useState(1);
  const [gmd, setGmd] = useState(0);

  useEffect(() => {
    if (editingStrategy) {
      setSupplementId(editingStrategy.supplementId);
      setConsumption(editingStrategy.consumption);
      setCost(editingStrategy.cost);
      setDays(editingStrategy.days);
      setGmd(editingStrategy.gmd);
    } else {
      const first = SUPPLEMENTS[0];
      setSupplementId(first.id);
      setConsumption(first.defaultConsumption);
      setCost(first.defaultCost);
      const defaultGmd = seasonType === SeasonType.AGUAS ? first.defaultGMD_Aguas : first.defaultGMD_Seca;
      setGmd(defaultGmd);
      setDays(1);
    }
  }, [editingStrategy, isOpen, seasonType]);

  const handleSupplementChange = (id: string) => {
    const supp = SUPPLEMENTS.find((s) => s.id === id);
    if (supp) {
      setSupplementId(id);
      setConsumption(supp.defaultConsumption);
      setCost(supp.defaultCost);
      const defaultGmd = seasonType === SeasonType.AGUAS ? supp.defaultGMD_Aguas : supp.defaultGMD_Seca;
      setGmd(defaultGmd);
    }
  };

  const handleSave = () => {
    if (days > maxDays) {
      alert(`O número de dias (${days}) excede o limite da estação (${maxDays} dias restantes).`);
      return;
    }
    if (days <= 0) {
      alert('O número de dias deve ser maior que zero.');
      return;
    }

    onSave({
      id: editingStrategy?.id || Math.random().toString(36).substr(2, 9),
      supplementId,
      consumption,
      cost,
      days: Math.floor(days),
      gmd,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-zinc-900">
            {editingStrategy ? 'Editar Estratégia' : 'Adicionar Suplementação 🌽'}
          </h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-zinc-100">
            <X className="h-6 w-6 text-zinc-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Suplemento</label>
            <select
              value={supplementId}
              onChange={(e) => handleSupplementChange(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 p-3 focus:border-emerald-500 focus:outline-none sm:p-2"
            >
              {SUPPLEMENTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Consumo (% PV)</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.001"
                value={consumption}
                onChange={(e) => setConsumption(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-zinc-300 p-3 focus:border-emerald-500 focus:outline-none sm:p-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Custo (R$/kg)</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-zinc-300 p-3 focus:border-emerald-500 focus:outline-none sm:p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Dias</label>
              <input
                type="number"
                inputMode="numeric"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-zinc-300 p-3 focus:border-emerald-500 focus:outline-none sm:p-2"
              />
              <p className="mt-1 text-[10px] text-zinc-500">Máx: {maxDays} dias</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">GMD (kg/dia)</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={gmd}
                onChange={(e) => setGmd(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-zinc-300 p-3 focus:border-emerald-500 focus:outline-none sm:p-2"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-300 py-3 font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
