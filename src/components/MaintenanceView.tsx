import React, { useState, useMemo } from 'react';
import { 
  Bus, 
  Wrench, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  User, 
  Plus, 
  DollarSign,
  Download
} from 'lucide-react';
import { Vehicle } from '../data/fleetData';

interface MaintenanceViewProps {
  fleet: Vehicle[];
  onUpdateFleet: (updatedFleet: Vehicle[]) => void;
}

export interface MaintenanceTask {
  id: string;
  prefix: string;
  type: "PREVENTIVA" | "CORRETIVA";
  description: string;
  startDate: string;
  cost: number;
  mechanic: string;
}

export interface ArchivedMaintenanceReport {
  id: string;
  timestamp: string;
  activeCount: number;
  completedCount: number;
  overallCost: number;
  htmlContent: string;
}

interface MaintenanceViewProps {
  fleet: Vehicle[];
  onUpdateFleet: (updatedFleet: Vehicle[]) => void;
  tasks: MaintenanceTask[];
  onUpdateTasks: (updatedTasks: MaintenanceTask[]) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({ fleet, onUpdateFleet, tasks, onUpdateTasks }) => {

  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  
  // New Task State
  const [selectedPrefix, setSelectedPrefix] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<"PREVENTIVA" | "CORRETIVA">("PREVENTIVA");
  const [cost, setCost] = useState('800');
  const [mechanic, setMechanic] = useState('Mário Oficina');

  // Load and save historic resolved/completed tasks
  const [completedTasks, setCompletedTasks] = useState<MaintenanceTask[]>(() => {
    const cached = localStorage.getItem('bc_completed_tasks');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (err) {
        console.error("Failed to parse cached completed tasks:", err);
      }
    }
    return [
      {
        id: "MNT-198",
        prefix: "1250",
        type: "PREVENTIVA",
        description: "Revisão preventiva periódica de freios e pneus dianteiros.",
        startDate: "2026-05-15",
        cost: 1600,
        mechanic: "Mário Oficina"
      },
      {
        id: "MNT-199",
        prefix: "1610",
        type: "CORRETIVA",
        description: "Substituição emergencial do alternador e correia do ventilador.",
        startDate: "2026-05-20",
        cost: 950,
        mechanic: "Rodrigo Eletricista"
      }
    ];
  });

  const [archivedReports, setArchivedReports] = useState<ArchivedMaintenanceReport[]>(() => {
    const cached = localStorage.getItem('bc_maintenance_printed_archive');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (err) {
        console.error("Failed to parse cached maintenance report archive:", err);
      }
    }
    return [];
  });

  const inMaintenanceVehicles = useMemo(() => {
    return fleet.filter(v => v.statusOperacional === "MANUTENÇÃO");
  }, [fleet]);

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrefix) return;

    const created: MaintenanceTask = {
      id: "MNT-" + Math.floor(203 + Math.random() * 900),
      prefix: selectedPrefix,
      type,
      description,
      startDate: new Date().toISOString().split('T')[0],
      cost: Number(cost) || 0,
      mechanic
    };

    onUpdateTasks([...tasks, created]);
    
    // Automatically flag that vehicle as in "MANUTENÇÃO" state in fleet data
    const updatedFleet = fleet.map(v => 
      v.prefix === selectedPrefix 
        ? { ...v, statusOperacional: "MANUTENÇÃO" as const } 
        : v
    );
    onUpdateFleet(updatedFleet);

    setIsNewTaskOpen(false);
    setSelectedPrefix('');
    setDescription('');
  };

  const handleFinishTask = (taskId: string, prefix: string) => {
    const taskToComplete = tasks.find(t => t.id === taskId);
    if (taskToComplete) {
      const updatedCompleted = [...completedTasks, taskToComplete];
      setCompletedTasks(updatedCompleted);
      localStorage.setItem('bc_completed_tasks', JSON.stringify(updatedCompleted));
    }

    onUpdateTasks(tasks.filter(t => t.id !== taskId));
    
    // Switch vehicle back to "ATIVO"
    const updatedFleet = fleet.map(v => 
      v.prefix === prefix 
        ? { ...v, statusOperacional: "ATIVO" as const } 
        : v
    );
    onUpdateFleet(updatedFleet);
  };

  const downloadOccurrencesPDF = () => {
    const totalActiveTasks = tasks.length;
    const totalActiveCost = tasks.reduce((acc, t) => acc + t.cost, 0);
    const totalCompletedTasks = completedTasks.length;
    const totalCompletedCost = completedTasks.reduce((acc, t) => acc + t.cost, 0);
    const overallCost = totalActiveCost + totalCompletedCost;

    const groupTasksByDate = (tasksList: MaintenanceTask[]) => {
      const groups: { [key: string]: MaintenanceTask[] } = {};
      tasksList.forEach(t => {
        const d = t.startDate || "Sem Data";
        if (!groups[d]) groups[d] = [];
        groups[d].push(t);
      });
      return Object.keys(groups).sort((a,b) => b.localeCompare(a)).map(d => ({
        date: d,
        items: groups[d]
      }));
    };

    const formatDateBrLocal = (dateStr: string) => {
      if (!dateStr) return "Sem Data";
      if (dateStr.includes('/')) return dateStr;
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    };

    const activeGroups = groupTasksByDate(tasks);
    const completedGroups = groupTasksByDate(completedTasks);

    const activeRowsHtml = activeGroups.length === 0
      ? `<div style="text-align: center; color: #94a3b8; font-style: italic; padding: 25px; border: 2px dashed #cbd5e1; border-radius: 12px; background-color: #f8fafc;">Nenhum veículo em oficina no momento.</div>`
      : activeGroups.map(group => {
          const rows = group.items.map(t => {
            const car = fleet.find(v => v.prefix === t.prefix);
            return `
              <tr>
                <td class="font-mono font-bold" style="text-align: center; font-weight: 700;">${t.id}</td>
                <td class="font-mono font-black" style="color: #0f172a; text-align: center; font-weight: 955; font-size: 13px;">${t.prefix}</td>
                <td class="font-mono font-bold" style="text-align: center;">${car ? car.plate : 'N/A'}</td>
                <td><span class="badge-${t.type === 'PREVENTIVA' ? 'preventiva' : 'corretiva'}">${t.type}</span></td>
                <td style="font-weight: 650; line-height: 1.35; color: #012;">${t.description}</td>
                <td style="font-weight: 500;">${t.mechanic}</td>
                <td class="font-mono font-black" style="text-align: right; color: #c2410c; font-weight: 800;">R$ ${t.cost.toLocaleString('pt-BR')}</td>
              </tr>
            `;
          }).join('');

          return `
            <div class="day-group" style="margin-top: 15px; page-break-inside: avoid; break-inside: avoid;">
              <h4 style="margin: 0 0 10px 0; color: #0f172a; border-bottom: 2px solid #94a3b8; padding-bottom: 5px; font-weight: 950; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">
                📅 Entrada em ${formatDateBrLocal(group.date)}
              </h4>
              <table class="data-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #f1f5f9; text-align: left; font-weight: bold; border-bottom: 1px solid #cbd5e1;">
                    <th style="padding: 10px; width: 80px; text-align: center; background-color: #1e293b !important; color: white !important;">REF#</th>
                    <th style="padding: 10px; width: 80px; text-align: center; background-color: #1e293b !important; color: white !important;">CARRO</th>
                    <th style="padding: 10px; width: 100px; text-align: center; background-color: #1e293b !important; color: white !important;">PLACA</th>
                    <th style="padding: 10px; width: 110px; background-color: #1e293b !important; color: white !important;">MANUTENÇÃO</th>
                    <th style="padding: 10px; background-color: #1e293b !important; color: white !important;">DESCRIÇÃO OPERACIONAL</th>
                    <th style="padding: 10px; width: 140px; background-color: #1e293b !important; color: white !important;">MECÂNICO RESP.</th>
                    <th style="padding: 10px; width: 110px; text-align: right; background-color: #1e293b !important; color: white !important;">CUSTO ESTIMADO</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </div>
          `;
        }).join('');

    const completedRowsHtml = completedGroups.length === 0
      ? `<div style="text-align: center; color: #94a3b8; font-style: italic; padding: 25px; border: 2px dashed #cbd5e1; border-radius: 12px; background-color: #f8fafc;">Nenhuma ocorrência concluída em arquivo.</div>`
      : completedGroups.map(group => {
          const rows = group.items.map(t => {
            const car = fleet.find(v => v.prefix === t.prefix);
            return `
              <tr>
                <td class="font-mono font-bold" style="text-align: center; font-weight: 700;">${t.id}</td>
                <td class="font-mono font-black" style="color: #0f172a; text-align: center; font-weight: 955; font-size: 13px;">${t.prefix}</td>
                <td class="font-mono font-bold" style="text-align: center;">${car ? car.plate : 'N/A'}</td>
                <td><span class="badge-${t.type === 'PREVENTIVA' ? 'preventiva' : 'corretiva'}">${t.type}</span></td>
                <td style="font-weight: 505; line-height: 1.35; color: #334155;">${t.description}</td>
                <td style="font-weight: 500;">${t.mechanic}</td>
                <td class="font-mono font-bold" style="text-align: right; color: #059669; font-weight: 800;">R$ ${t.cost.toLocaleString('pt-BR')}</td>
              </tr>
            `;
          }).join('');

          return `
            <div class="day-group" style="margin-top: 15px; page-break-inside: avoid; break-inside: avoid;">
              <h4 style="margin: 0 0 10px 0; color: #0f172a; border-bottom: 2px solid #94a3b8; padding-bottom: 5px; font-weight: 955; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">
                📅 Liberado em ${formatDateBrLocal(group.date)}
              </h4>
              <table class="data-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #f1f5f9; text-align: left; font-weight: bold; border-bottom: 1px solid #cbd5e1;">
                    <th style="padding: 10px; width: 80px; text-align: center; background-color: #1e293b !important; color: white !important;">REF#</th>
                    <th style="padding: 10px; width: 80px; text-align: center; background-color: #1e293b !important; color: white !important;">CARRO</th>
                    <th style="padding: 10px; width: 100px; text-align: center; background-color: #1e293b !important; color: white !important;">PLACA</th>
                    <th style="padding: 10px; width: 110px; background-color: #1e293b !important; color: white !important;">MANUTENÇÃO</th>
                    <th style="padding: 10px; background-color: #1e293b !important; color: white !important;">DESCRIÇÃO TÉCNICA EXECUTADA</th>
                    <th style="padding: 10px; width: 140px; background-color: #1e293b !important; color: white !important;">PROFISSIONAL RESP.</th>
                    <th style="padding: 10px; width: 110px; text-align: right; background-color: #1e293b !important; color: white !important;">CUSTO TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </div>
          `;
        }).join('');

    const todayStr = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const serializedHTML = `
<!DOCTYPE html>
<html lang="pt-BR" class="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Oficina & Controle de Ocorrências - Liderança</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@700;850&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      background-color: #f1f5f9 !important;
      color: #0f172a !important;
      padding: 30px 15px !important;
      margin: 0 !important;
    }
    #print-container {
      background: #ffffff !important;
      max-width: 1000px !important;
      margin: 0 auto !important;
      padding: 35px 40px !important;
      border-radius: 20px !important;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
      border: 1px solid #e2e8f0 !important;
    }
    @media print {
      body {
        background-color: #ffffff !important;
        padding: 0 !important;
      }
      #print-container {
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
        max-width: 100% !important;
      }
      @page {
        size: A4 portrait;
        margin: 12mm 10mm 12mm 10mm;
      }
      .no-print {
        display: none !important;
      }
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }
    .header-table td {
      border: none !important;
      padding: 0 !important;
      vertical-align: middle;
    }
    .brand-logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-text {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: #0f172a;
    }
    .brand-text .highlight {
      color: #105d38;
    }
    .report-title-section {
      text-align: right;
    }
    .report-title {
      font-size: 15px;
      font-weight: 950;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #0f172a;
      margin: 0 0 4px 0;
    }
    .report-sub {
      font-size: 10px;
      font-weight: 800;
      color: #64748b;
      margin: 0;
    }
    .divider {
      height: 4px;
      background-color: #1e293b;
      margin-bottom: 25px;
      border-radius: 2px;
    }
    .summary-grid {
      display: grid;
      grid-template-cols: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 30px;
    }
    .summary-card {
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 14px 16px;
      border-radius: 12px;
    }
    .summary-card h4 {
      margin: 0;
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.05em;
    }
    .summary-card p {
      margin: 6px 0 0 0;
      font-size: 20px;
      font-weight: 900;
      color: #0f172a;
    }
    .section-title {
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #0f172a;
      border-bottom: 2px solid #cbd5e1;
      padding-bottom: 6px;
      margin-top: 30px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .section-count {
      font-size: 10px;
      font-weight: 900;
      background-color: #e2e8f0;
      color: #1e293b;
      padding: 2px 8px;
      border-radius: 9999px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-bottom: 10px;
    }
    table.data-table th {
      background-color: #1e293b;
      color: #ffffff;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.05em;
      padding: 10px 12px;
      border: 1px solid #1e293b;
      text-align: left;
    }
    table.data-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      border-left: 1px solid #f1f5f9;
      border-right: 1px solid #f1f5f9;
      color: #334155;
      font-weight: 600;
      vertical-align: middle;
    }
    table.data-table tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    .font-mono {
      font-family: 'JetBrains Mono', monospace !important;
    }
    .font-bold {
      font-weight: 750 !important;
    }
    .font-black {
      font-weight: 900 !important;
    }
    .badge-preventiva {
      background-color: #f0fdf4;
      color: #15803d;
      border: 1px solid #bbf7d0;
      padding: 2.5px 7px;
      font-size: 9.5px;
      font-weight: 850;
      border-radius: 6px;
    }
    .badge-corretiva {
      background-color: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
      padding: 2.5px 7px;
      font-size: 9.5px;
      font-weight: 850;
      border-radius: 6px;
    }
    .download-notice {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
      padding: 15px;
      border-radius: 12px;
      text-align: center;
      margin-top: 30px;
    }
    .download-notice p {
      margin: 0 0 10px 0;
      font-weight: 700;
      font-size: 13px;
    }
    .btn-print {
      padding: 10px 24px;
      background: #105d38;
      color: white;
      border: none;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      transition: opacity 0.2s;
    }
    .btn-print:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div id="print-container">
    <table class="header-table">
      <tr>
        <td>
          <div class="brand-logo-container">
            <svg viewBox="0 0 100 100" style="width: 38px; height: 38px;" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M74.8 44.4C78.3 46.5 78.3 51.5 74.8 53.6L32.8 78.9C29.2 81.1 24.5 78.5 24.5 74.3V23.7C24.5 19.5 29.2 16.9 32.8 19.1L74.8 44.4Z" fill="#edd116" />
              <path d="M36 31V65C36 67.2 37.8 69 40 69H55" stroke="#105d38" stroke-width="9.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="brand-text">
              IDER<span class="highlight">Λ</span>NÇ<span class="highlight">Λ</span>
            </span>
          </div>
        </td>
        <td class="report-title-section">
          <h1 class="report-title">Oficina &amp; Ocorrências Tecnológicas</h1>
          <p class="report-sub">Emissão Digital: ${todayStr}</p>
        </td>
      </tr>
    </table>

    <div class="divider"></div>

    <div class="summary-grid">
      <div class="summary-card">
        <h4>Ativos na Oficina</h4>
        <p>${totalActiveTasks} veículos</p>
      </div>
      <div class="summary-card">
        <h4>Histórico Resolvido</h4>
        <p>${totalCompletedTasks} ordens</p>
      </div>
      <div class="summary-card">
        <h4>Orçamento Oficina</h4>
        <p style="color: #c2410c;">R$ ${totalActiveCost.toLocaleString('pt-BR')}</p>
      </div>
      <div class="summary-card">
        <h4>Custo Acumulado</h4>
        <p style="color: #059669;">R$ ${overallCost.toLocaleString('pt-BR')}</p>
      </div>
    </div>

    <div class="section-title">
      <span>1. Ativos Atualmente na Oficina (Bloqueados nas Escalas)</span>
      <span class="section-count">${totalActiveTasks} veículos</span>
    </div>

    ${activeRowsHtml}

    <div class="section-title" style="margin-top: 40px;">
      <span>2. Histórico de Ocorrências Concluídas e Liberadas</span>
      <span class="section-count">${totalCompletedTasks} ordens</span>
    </div>

    ${completedRowsHtml}

    <div class="no-print download-notice">
      <p>Este arquivo foi gerado para contornar sandboxing de iFrames e permitir a impressão completa.</p>
      <button class="btn-print" onclick="window.print()">
        🖨️ Abrir Diálogo de Impressão (Salvar como PDF)
      </button>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>
    `;

    const blob = new Blob([serializedHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `ocorrencias_oficina_lideranca_${today}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-white">
            Oficina & Manutenção Integrada
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Programação mecânica e controle de custos de manutenção de veículos em tempo real.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            type="button"
            onClick={downloadOccurrencesPDF}
            className="px-5 py-3 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl shadow-sm flex items-center gap-2 font-bold cursor-pointer transition-all active:scale-95"
            title="Baixar relatório completo de ocorrências (ativas e históricas) formatado para PDF"
          >
            <Download size={20} className="text-emerald-600 dark:text-emerald-400" />
            Baixar Ocorrências (PDF)
          </button>
          <button 
            type="button"
            onClick={() => setIsNewTaskOpen(true)}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-md flex items-center gap-2 font-bold cursor-pointer transition-all active:scale-95"
          >
            <Plus size={20} /> Registrar Entrada na Oficina
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Vehicles in maintenance */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Carros atualmente na Oficina ({inMaintenanceVehicles.length})</h2>
            <span className="text-xs text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">
              Bloqueados automaticamente em escalas
            </span>
          </div>

          <div className="space-y-3">
            {tasks.map(task => {
              const car = fleet.find(v => v.prefix === task.prefix);
              return (
                <div key={task.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/30 text-orange-500 rounded-xl mt-1 sm:mt-0">
                      <Wrench size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1 px-1.5 bg-slate-200 dark:bg-slate-700 font-mono text-xs rounded font-bold dark:text-white">
                          Carro {task.prefix} {car ? `(${car.plate})` : ''}
                        </span>
                        <span className={`text-[10px] font-bold px-2 rounded-full ${
                          task.type === "PREVENTIVA" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30" : "bg-red-100 text-red-800 dark:bg-red-950/30"
                        }`}>
                          {task.type}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white mt-2">{task.description}</p>
                      <p className="text-xs text-slate-500 font-semibold flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1"><User size={13} /> Mecânico: {task.mechanic}</span>
                        <span className="flex items-center gap-1"><Calendar size={13} /> Entrada: {task.startDate}</span>
                        <span className="flex items-center gap-1 text-emerald-600 font-extrabold"><DollarSign size={13} /> Custo: R$ {task.cost.toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleFinishTask(task.id, task.prefix)}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <CheckCircle size={14} /> Liberar Veículo
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cost Analysis & Report Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Relatório & Custos</h2>
          
          <div className="p-4 bg-orange-50 dark:bg-orange-950/25 text-orange-700 dark:text-orange-300 rounded-xl space-y-1.5 border border-orange-200 dark:border-orange-900/40">
            <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              Ativas na Oficina
            </h4>
            <p className="text-3xl font-black">R$ {tasks.reduce((acc, t) => acc + t.cost, 0).toLocaleString()}</p>
            <p className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">Orçamento total das ordens de serviço ativas atualmente.</p>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/25 text-emerald-700 dark:text-emerald-300 rounded-xl space-y-1.5 border border-emerald-200 dark:border-emerald-900/40">
            <h4 className="text-xs font-black uppercase tracking-wider">Histórico Concluído</h4>
            <div className="flex justify-between items-baseline">
              <p className="text-3xl font-black">R$ {completedTasks.reduce((acc, t) => acc + t.cost, 0).toLocaleString()}</p>
              <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 px-1.5 py-0.5 rounded text-emerald-800 dark:text-emerald-200">
                {completedTasks.length} registradas
              </span>
            </div>
            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Total acumulado de ordens concluídas.</p>
          </div>

          {/* Quick Stats list / Recent Completed Occurrences */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Últimas Concluídas</h3>
            <div className="text-xs space-y-2 max-h-56 overflow-y-auto pr-1">
              {completedTasks.length === 0 ? (
                <p className="text-slate-400 dark:text-slate-500 italic text-[11px]">Nenhuma concluída recentemente.</p>
              ) : (
                completedTasks.slice(-3).reverse().map((t) => {
                  const car = fleet.find(v => v.prefix === t.prefix);
                  return (
                    <div key={t.id} className="p-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-mono font-bold text-slate-800 dark:text-white">Carro {t.prefix}</span>
                        <span className="text-slate-400 dark:text-slate-500 font-semibold">{t.startDate}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 font-bold leading-tight line-clamp-1 text-[11px]" title={t.description}>{t.description}</p>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
                        <span className="truncate">{t.mechanic}</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">R$ {t.cost.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* CREATE TASK MODAL */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveTask} className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full space-y-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Lançar Ordem de Serviço (OS)</h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1 font-mono uppercase">Escolher Veículo para Oficina *</label>
                <select 
                  required
                  value={selectedPrefix}
                  onChange={(e) => setSelectedPrefix(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none font-semibold dark:text-white"
                >
                  <option value="">Selecione pelo prefixo...</option>
                  {fleet.filter(v => v.statusOperacional !== "MANUTENÇÃO").map(v => (
                    <option key={v.prefix} value={v.prefix}>ID {v.prefix} - {v.bodywork} ({v.plate})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Tipo de Manutenção</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none font-semibold dark:text-white"
                >
                  <option value="PREVENTIVA">Preventiva (Geral / Óleo / Filtros)</option>
                  <option value="CORRETIVA">Corretiva (Urgência / Reparo / Mecânica)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Breve Descrição do Problema *</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Ex: Regulagem de turbina ou vazamento no radiador."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none font-medium dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Orçamento R$</label>
                  <input 
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none font-semibold dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Mecânico Responsável</label>
                  <input 
                    type="text"
                    value={mechanic}
                    onChange={(e) => setMechanic(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none font-semibold dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 text-xs">
              <button 
                type="button" 
                onClick={() => setIsNewTaskOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-white rounded-xl font-bold cursor-pointer"
              >
                Voltar
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold cursor-pointer"
              >
                Bloquear e Enviar OS
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
