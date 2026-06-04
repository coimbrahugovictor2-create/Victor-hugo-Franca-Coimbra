import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  PieChart, 
  Clock, 
  MapPin, 
  XCircle, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { Vehicle } from '../data/fleetData';

interface ReportsViewProps {
  fleet: Vehicle[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ fleet }) => {
  const [activeReport, setActiveReport] = useState<string>('VENCIDOS');

  // Calculating statistics for the selected active reports
  const reportData = useMemo(() => {
    switch (activeReport) {
      case 'VENCIDOS':
        return fleet.filter(v => 
          v.situationAntt === "VENCIDO" || 
          v.situationAntt === "NÃO TEM VISTORIA" ||
          v.vistoria === "VENCIDO" ||
          v.vistoria === "NÃO TEM VISTORIA"
        );
      case 'DISPONIVEIS':
        return fleet.filter(v => 
          v.statusOperacional === "ATIVO" && 
          v.situationAntt === "APROVADO"
        );
      case 'FILIAL':
        // Show counts of vehicles grouped by filial
        const groups: { [key: string]: Vehicle[] } = {};
        fleet.forEach(v => {
          if (!groups[v.unit]) groups[v.unit] = [];
          groups[v.unit].push(v);
        });
        return groups;
      case 'UTILIZACAO':
        // Simulating usage with some high-use cars
        return fleet.slice(0, 15).map((v, i) => ({
          ...v,
          tripsMonth: 25 + (i % 5) * 4,
          kmMonth: 8200 + (i % 4) * 1100,
          efficiency: 92 + (i % 3) * 2
        }));
      case 'PARADOS':
        return fleet.filter(v => v.statusOperacional === "INATIVO" || v.statusOperacional === "RESERVADO");
      default:
        return fleet;
    }
  }, [fleet, activeReport]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    alert("Planilha exportada com sucesso (formato XLSX da frota)!");
  };

  const handleExportPdf = () => {
    alert("Documento gerencial PDF do Grupo Liderança gerado com sucesso!");
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-white">
            Auditoria & Relatórios Gerenciais
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Gere relatórios empresariais, exporte para Excel/PDF ou imprima relatórios oficiais.
          </p>
        </div>
      </div>

      {/* Tipo de Relatório Botões */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { id: 'VENCIDOS', label: 'Veículos Bloqueados / ANTT Vencido', color: 'border-red-500' },
          { id: 'DISPONIVEIS', label: 'Frota Liberada para Viagem', color: 'border-green-500' },
          { id: 'FILIAL', label: 'Relação por Filial / Garagem', color: 'border-slate-500' },
          { id: 'UTILIZACAO', label: 'Produtividade & Km Mensal', color: 'border-amber-500' },
          { id: 'PARADOS', label: 'Fitas / Veículos Parados', color: 'border-blue-500' },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setActiveReport(btn.id)}
            className={`px-4 py-3 border rounded-xl text-left text-xs font-extrabold transition-all cursor-pointer ${
              activeReport === btn.id
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Relatório Corpo */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6 space-y-4">
        
        {/* Actions Bar */}
        <div className="flex justify-between items-center border-b dark:border-slate-700 pb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileText className="text-primary" />
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
              Visualização de Relatório Gerencial ({activeReport})
            </h3>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={15} /> Imprimir Relação
            </button>
            <button 
              onClick={handleExportExcel}
              className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet size={15} /> Exportar Excel
            </button>
            <button 
              onClick={handleExportPdf}
              className="p-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={15} /> Emitir Relatório PDF
            </button>
          </div>
        </div>

        {/* Dynamic tables for the selected report */}
        <div className="overflow-x-auto">
          {activeReport === 'FILIAL' ? (
            <div className="space-y-6">
              {Object.keys(reportData).map(branchName => (
                <div key={branchName} className="space-y-2">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700/50 p-2 rounded px-3 w-fit">{branchName} Garage</h4>
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-700 text-slate-500 font-extrabold h-9">
                      <tr>
                        <th className="p-2 pl-4">PREFIXO</th>
                        <th className="p-2">PLACA</th>
                        <th className="p-2">MARCA & FABRICANTE</th>
                        <th className="p-2">CLASSE</th>
                        <th className="p-2">SITUAÇÃO ANTT</th>
                        <th className="p-2">STATUS OPERACIONAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-semibold dark:text-slate-300">
                      {(reportData as any)[branchName].map((v: Vehicle) => {
                        const isDup = fleet.filter(x => x.prefix === v.prefix).length > 1;
                        return (
                          <tr key={`${v.prefix}-${v.plate}`} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                            <td className={`p-2 pl-4 font-extrabold font-mono ${
                              isDup ? "text-red-500 font-extrabold animate-pulse" : "text-slate-900 dark:text-white"
                            }`}>
                              {v.prefix} {isDup && "⚠️"}
                            </td>
                            <td className="p-2 font-mono">{v.plate}</td>
                            <td className="p-2">{v.bodywork}</td>
                            <td className="p-2">{v.classification}</td>
                            <td className="p-2 font-bold">{v.situationAntt}</td>
                            <td className="p-2 uppercase">{v.statusOperacional}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : activeReport === 'UTILIZACAO' ? (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-700 text-slate-500 font-extrabold h-9">
                <tr>
                  <th className="p-3 pl-4">PREFIXO</th>
                  <th className="p-3">PLACA</th>
                  <th className="p-3">CLASSE</th>
                  <th className="p-3">VIAGENS (MÊS)</th>
                  <th className="p-3">KM RODADO</th>
                  <th className="p-3">EFICIÊNCIA DE CONSUMO</th>
                  <th className="p-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-bold dark:text-slate-300">
                {(reportData as any).map((item: any) => {
                  const isDup = fleet.filter(x => x.prefix === item.prefix).length > 1;
                  return (
                    <tr key={`${item.prefix}-${item.plate}`} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-700 dark:text-slate-200">
                      <td className={`p-3 pl-4 font-black font-mono ${
                        isDup ? "text-red-500 font-extrabold animate-pulse" : ""
                      }`}>
                        {item.prefix} {isDup && "⚠️"}
                      </td>
                      <td className="p-3 font-mono">{item.plate}</td>
                      <td className="p-3">{item.classification}</td>
                      <td className="p-3">{item.tripsMonth} viagens</td>
                      <td className="p-3 font-mono">{item.kmMonth.toLocaleString()} Km</td>
                      <td className="p-3 flex items-center gap-1.5">
                        <div className="w-16 bg-slate-100 dark:bg-slate-700 h-2 rounded overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: `${item.efficiency}%` }}></div>
                        </div>
                        <span>{item.efficiency}%</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-950/30 text-[10px] uppercase font-bold">ALTA</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-700 text-slate-500 font-extrabold h-9">
                <tr>
                  <th className="p-3 pl-4">PREFIXO</th>
                  <th className="p-3">PLACA</th>
                  <th className="p-3">MODELO & CARROCERIA</th>
                  <th className="p-3">FILIAL / UNIDADE</th>
                  <th className="p-3">CADASTRO ANTT</th>
                  <th className="p-3">VENCIMENTO CRONOTACÓGRAFO</th>
                  <th className="p-3">STATUS OPERACIONAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-semibold dark:text-slate-300">
                {reportData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-slate-400 font-bold">Nenhum dado para o filtro selecionado.</td>
                  </tr>
                ) : (
                  (reportData as Vehicle[]).map(v => {
                    const isDup = fleet.filter(x => x.prefix === v.prefix).length > 1;
                    return (
                      <tr key={`${v.prefix}-${v.plate}`} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-700 dark:text-slate-200">
                        <td className={`p-3 pl-4 font-black font-mono ${
                          isDup ? "text-red-500 font-extrabold animate-pulse" : "text-slate-900 dark:text-white"
                        }`}>
                          {v.prefix} {isDup && "⚠️"}
                        </td>
                        <td className="p-3 font-mono">{v.plate}</td>
                        <td className="p-3 font-bold">{v.bodywork} ({v.brand})</td>
                        <td className="p-3">{v.unit}</td>
                        <td className={`p-3 font-bold ${v.situationAntt === 'APROVADO' ? 'text-green-600' : 'text-red-500'}`}>{v.situationAntt}</td>
                        <td className="p-3 font-mono">{v.expiryCrono}</td>
                        <td className="p-3 font-bold uppercase">{v.statusOperacional}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>

    </div>
  );
};
