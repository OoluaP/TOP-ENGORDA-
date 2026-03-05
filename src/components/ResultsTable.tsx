import React from 'react';
import { PlanResult } from '../types';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ResultsTableProps {
  result: PlanResult;
}

export default function ResultsTable({ result }: ResultsTableProps) {
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text('TOP ENGORDA+', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Relatório de Simulação Nutricional e Financeira', 14, 27);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 32);

    // 1. Planilha de Nutrição
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('1. Planejamento Nutricional', 14, 45);

    const nutritionHeaders = [['Nutrição', 'Estação', 'Dias', 'Início', 'Fim', 'GMD', 'Peso Final', 'Custo']];
    const nutritionData = result.rows.map(row => [
      row.nutrition,
      row.season,
      row.days,
      format(row.startDate, 'dd/MM'),
      format(row.endDate, 'dd/MM'),
      `${row.gmd.toFixed(3)}kg`,
      `${row.finalWeight.toFixed(1)}kg`,
      `R$ ${row.costPeriod.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 50,
      head: nutritionHeaders,
      body: nutritionData,
      theme: 'striped',
      headStyles: { fillColor: [5, 150, 105] },
      styles: { fontSize: 8 },
    });

    // 2. Relatório de Gastos e Investimento
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('2. Resumo de Gastos e Investimento', 14, finalY);

    const expenseData = [
      ['Custo com Nutrição', `R$ ${result.totalCost.toFixed(2)}`],
      ['Aluguel de Pasto', `R$ ${result.pastureTotal.toFixed(2)}`],
      ['Mão de Obra', `R$ ${result.laborTotal.toFixed(2)}`],
      ['Custos Sanitários (Remédios)', `R$ ${result.sanitaryTotal.toFixed(2)}`],
      ['Risco de Mortalidade (Perda)', `R$ ${result.mortalityLoss.toFixed(2)}`],
      ['---', '---'],
      ['INVESTIMENTO TOTAL', `R$ ${result.investmentTotal.toFixed(2)}`],
    ];

    autoTable(doc, {
      startY: finalY + 5,
      body: expenseData,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { halign: 'right' }
      }
    });

    // 3. Indicadores de Performance
    const indicatorsY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('3. Indicadores de Performance', 14, indicatorsY);

    const performanceData = [
      ['Peso Final Estimado', `${result.finalWeight.toFixed(2)} kg`],
      ['Receita Bruta Estimada', `R$ ${result.revenueTotal.toFixed(2)}`],
      ['Lucro Líquido Total', `R$ ${result.profitTotal.toFixed(2)}`],
      ['Rendimento sobre Investimento', `${result.profitPercent.toFixed(2)}%`],
      ['Retorno Mensal Médio', `${result.monthlyReturn.toFixed(2)}% /mês`],
    ];

    autoTable(doc, {
      startY: indicatorsY + 5,
      body: performanceData,
      theme: 'grid',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { halign: 'right', fontStyle: 'bold' }
      }
    });

    doc.save(`relatorio_top_engorda_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  if (result.rows.length === 0) return null;

  return (
    <div className="mt-4 space-y-6 sm:mt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl">Relatório Consolidado</h2>
        <button
          onClick={exportToPDF}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-6 py-4 text-base font-bold text-white transition-all hover:bg-emerald-700 active:scale-[0.98] shadow-xl shadow-emerald-200 sm:w-auto sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm sm:shadow-lg sm:shadow-emerald-100"
        >
          <FileText className="h-5 w-5 sm:h-4 w-4" />
          Exportar PDF
        </button>
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs font-bold uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Nutrição | Estação</th>
              <th className="px-4 py-3">Período / Dias</th>
              <th className="px-4 py-3">Consumo/Dia</th>
              <th className="px-4 py-3">Consumo Total</th>
              <th className="px-4 py-3">Custo Período</th>
              <th className="px-4 py-3">Peso Final</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {result.rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-zinc-50/50">
                <td className="px-4 py-4">
                  <div className="font-bold text-zinc-900">{row.nutrition}</div>
                  <div className="text-xs text-zinc-500">{row.season}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-zinc-700">
                    {format(row.startDate, 'dd/MM')} - {format(row.endDate, 'dd/MM')}
                  </div>
                  <div className="text-xs font-bold text-zinc-400">{row.days} dias</div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-mono text-zinc-700">{row.consumptionPerDay.toFixed(3)} kg</div>
                  <div className="text-xs text-zinc-400">{row.valueKg.toFixed(2)} R$/kg</div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-mono font-bold text-zinc-900">{row.totalConsumption.toFixed(2)} kg</div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-mono font-bold text-emerald-600">R$ {row.costPeriod.toFixed(2)}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-mono font-bold text-zinc-900">{row.finalWeight.toFixed(2)} kg</div>
                  <div className="text-xs text-zinc-400">GMD: {row.gmd}kg</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Plan Cards */}
      <div className="space-y-3 sm:hidden">
        {result.rows.map((row, idx) => (
          <div key={idx} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between border-b border-zinc-100 pb-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-zinc-900 line-clamp-2">{row.nutrition}</p>
                <p className="text-[10px] font-bold uppercase text-zinc-400">{row.season}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-600">R$ {row.costPeriod.toFixed(2)}</p>
                <p className="text-[10px] text-zinc-400">{row.days} dias</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase text-zinc-400">Período</p>
                <p className="text-xs text-zinc-700">{format(row.startDate, 'dd/MM')} a {format(row.endDate, 'dd/MM')}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-zinc-400">Consumo Total</p>
                <p className="text-xs text-zinc-700">{row.totalConsumption.toFixed(2)} kg</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-zinc-400">GMD</p>
                <p className="text-xs text-zinc-700">{row.gmd.toFixed(3)} kg/dia</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-zinc-400">Peso Saída</p>
                <p className="text-xs font-bold text-zinc-900">{row.finalWeight.toFixed(1)} kg</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl bg-zinc-900 p-3 text-white sm:p-4">
          <p className="text-[9px] font-bold uppercase text-zinc-400 sm:text-[10px]">Investimento</p>
          <p className="text-lg font-bold sm:text-xl">R$ {result.investmentTotal.toFixed(0)}</p>
        </div>
        <div className="rounded-2xl bg-emerald-600 p-3 text-white sm:p-4">
          <p className="text-[9px] font-bold uppercase text-emerald-200 sm:text-[10px]">Lucro Total</p>
          <p className="text-lg font-bold sm:text-xl">R$ {result.profitTotal.toFixed(0)}</p>
        </div>
        <div className="rounded-2xl bg-blue-600 p-3 text-white sm:p-4">
          <p className="text-[9px] font-bold uppercase text-blue-200 sm:text-[10px]">Rendimento</p>
          <p className="text-lg font-bold sm:text-xl">{result.profitPercent.toFixed(1)}%</p>
        </div>
        <div className="rounded-2xl bg-purple-600 p-3 text-white sm:p-4">
          <p className="text-[9px] font-bold uppercase text-purple-200 sm:text-[10px]">Mensal</p>
          <p className="text-lg font-bold sm:text-xl">{result.monthlyReturn.toFixed(2)}%</p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 sm:mb-4 sm:text-sm sm:text-zinc-900">Detalhamento Financeiro</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6">
          <div>
            <p className="text-[9px] font-bold uppercase text-zinc-400 sm:text-xs sm:text-zinc-500">Custo Nutrição</p>
            <p className="text-sm font-bold text-zinc-900 sm:text-lg">R$ {result.totalCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase text-zinc-400 sm:text-xs sm:text-zinc-500">Custos Fixos</p>
            <p className="text-sm font-bold text-zinc-900 sm:text-lg">R$ {result.fixedCostsTotal.toFixed(2)}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-[9px] font-bold uppercase text-zinc-400 sm:text-xs sm:text-zinc-500">Receita Bruta</p>
            <p className="text-sm font-bold text-emerald-600 sm:text-lg">R$ {result.revenueTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
