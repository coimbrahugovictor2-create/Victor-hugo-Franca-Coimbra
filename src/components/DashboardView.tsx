import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Bus, 
  ShieldCheck, 
  ShieldAlert, 
  Calendar, 
  Tag, 
  Wrench,
  TrendingDown,
  Percent,
  TrendingUp,
  Award
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { Vehicle } from '../data/fleetData';

interface DashboardViewProps {
  fleet: Vehicle[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ fleet }) => {
  const stats = useMemo(() => {
    const total = fleet.length;
    let active = 0;
    let blocked = 0;
    let inMaintenance = 0;
    let reserved = 0;
    let totalAge = 0;
    
    // Brand counts
    const brandCountsObj: { [key: string]: number } = { "M. BENZ": 0, "SCANIA": 0, "VOLVO": 0 };
    // Classification/Classe breakdown
    const classObj: { [key: string]: number } = { "Executivo": 0, "Semi Leito": 0, "Leito Cama": 0, "Leito Total": 0 };
    // Carroceria / Body Type
    let ldCount = 0;
    let ddCount = 0;

    fleet.forEach(v => {
      // Calculate age relative to current year (2026)
      const age = 2026 - v.yearManufacture;
      totalAge += age >= 0 ? age : 0;

      // Brand count
      if (brandCountsObj[v.brand] !== undefined) {
        brandCountsObj[v.brand]++;
      }

      // Operational status
      if (v.statusOperacional === "ATIVO") {
        active++;
      } else if (v.statusOperacional === "MANUTENÇÃO") {
        inMaintenance++;
      } else if (v.statusOperacional === "RESERVADO") {
        reserved++;
      }

      // Check if blocked by documents or status
      const isDocBlocked = 
        v.situationAntt === "VENCIDO" || 
        v.situationAntt === "NÃO TEM VISTORIA" ||
        v.vistoria === "NÃO TEM VISTORIA" ||
        v.vistoria === "VENCIDO" ||
        v.statusOperacional === "INATIVO";
      
      if (isDocBlocked || v.statusOperacional === "MANUTENÇÃO") {
        blocked++;
      }

      // Class
      if (classObj[v.classification] !== undefined) {
        classObj[v.classification]++;
      }

      // LD vs DD
      const bodyStr = v.bodywork.toUpperCase();
      if (bodyStr.includes("LD") || bodyStr.includes("LOW")) {
        ldCount++;
      } else {
        ddCount++;
      }
    });

    const averageAge = Number((totalAge / total).toFixed(1));

    const brandChartData = Object.keys(brandCountsObj).map(key => ({
      name: key,
      value: brandCountsObj[key]
    }));

    const classChartData = Object.keys(classObj).map(key => ({
      name: key,
      value: classObj[key]
    }));

    // Calculate real-time operational vs maintenance stats
    const activePercentOfTotal = total > 0 ? Number(((active / total) * 100).toFixed(1)) : 0;
    const maintenancePercentOfTotal = total > 0 ? Number(((inMaintenance / total) * 100).toFixed(1)) : 0;
    const totalActiveAndMaintenance = active + inMaintenance;
    const activeVsMaintenanceRatio = totalActiveAndMaintenance > 0 
      ? Number(((active / totalActiveAndMaintenance) * 100).toFixed(1)) 
      : 0;

    return {
      total,
      active,
      blocked,
      inMaintenance,
      reserved,
      averageAge,
      ldCount,
      ddCount,
      brandChartData,
      classChartData,
      classObj,
      activePercentOfTotal,
      maintenancePercentOfTotal,
      activeVsMaintenanceRatio
    };
  }, [fleet]);

  const COLORS = ['#105d38', '#f0c808', '#1ea362', '#1e293b', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-white">
            Painel Operacional Liderança
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Gestão inteligente de frota, documentação e auditoria em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-primary/10 text-primary font-bold rounded-full text-xs flex items-center gap-1.5 ring-1 ring-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Sincronizado Liderança
          </span>
        </div>
      </div>

      {/* Grid Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex justify-between items-start"
        >
          <div className="space-y-2">
            <p className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Frota Cadastrada</p>
            <p className="text-3xl font-black text-slate-800 dark:text-white">{stats.total} <span className="text-sm font-semibold text-slate-500">veículos</span></p>
            <div className="text-xs text-slate-400">
              <span className="text-primary font-bold">{stats.classObj["Semi Leito"]}</span> Semi Leito • <span className="text-primary font-bold">{stats.classObj["Leito Cama"]}</span> Leito Cama
            </div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-primary">
            <Bus size={22} />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex justify-between items-start"
        >
          <div className="space-y-2">
            <p className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Ativos em Linha</p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.active} <span className="text-sm font-semibold text-slate-500">carros</span></p>
            <div className="text-xs text-slate-400">
              Disponibilidade operacional de <span className="text-emerald-600 font-bold">{((stats.active/stats.total)*100).toFixed(0)}%</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-600">
            <ShieldCheck size={22} />
          </div>
        </motion.div>

        {/* Card de Ocupação Total e Relação Operação vs. Manutenção */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between"
        >
          <div className="space-y-2 w-full">
            <p className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Ocupação Operacional</p>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {stats.activeVsMaintenanceRatio}%
              </p>
              <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/30 font-bold">
                ATIVO vs MANUT
              </span>
            </div>

            {/* Split Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden flex mt-1">
              <div 
                className="bg-emerald-500 h-full transition-all" 
                style={{ width: `${stats.activePercentOfTotal}%` }} 
                title={`Em Operação: ${stats.activePercentOfTotal}%`}
              />
              <div 
                className="bg-red-500 h-full transition-all" 
                style={{ width: `${stats.maintenancePercentOfTotal}%` }} 
                title={`Em Oficina: ${stats.maintenancePercentOfTotal}%`}
              />
              <div 
                className="bg-slate-200 dark:bg-slate-600 h-full transition-all" 
                style={{ width: `${Math.max(0, 100 - stats.activePercentOfTotal - stats.maintenancePercentOfTotal)}%` }} 
                title="Reservados / Outros"
              />
            </div>

            <div className="space-y-1 text-[10.5px] text-slate-400 pt-0.5">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Operação:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{stats.active} ({stats.activePercentOfTotal}%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Manutenção:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{stats.inMaintenance} ({stats.maintenancePercentOfTotal}%)</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex justify-between items-start"
        >
          <div className="space-y-2">
            <p className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Bloqueios & Alertas</p>
            <p className="text-3xl font-black text-red-500">{stats.blocked} <span className="text-sm font-semibold text-slate-500">bloqueados</span></p>
            <div className="text-xs text-slate-400">
              <span className="text-red-500 font-bold">{stats.inMaintenance}</span> em oficina • <span className="text-amber-500 font-bold">{stats.blocked - stats.inMaintenance}</span> por Docs/Vistoria
            </div>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-xl text-red-500">
            <ShieldAlert size={22} />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex justify-between items-start"
        >
          <div className="space-y-2">
            <p className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Idade Média Frota</p>
            <p className="text-3xl font-black text-slate-800 dark:text-white">{stats.averageAge} <span className="text-sm font-semibold text-slate-500">Anos</span></p>
            <div className="text-xs text-slate-400 flex items-center gap-1 text-emerald-600 font-semibold">
              <Award size={14} /> Excelente conservação de frota
            </div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-amber-500">
            <Calendar size={22} />
          </div>
        </motion.div>
      </div>

      {/* Grid de Gráficos e Distribuições */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Distribuição por Marcas */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Frota por Fabricante</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.brandChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.brandChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-around text-center text-xs">
            {stats.brandChartData.map((brand, i) => (
              <div key={brand.name}>
                <p className="font-extrabold text-slate-400">{brand.name}</p>
                <p className="text-lg font-black mt-1" style={{ color: COLORS[i % COLORS.length] }}>{brand.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tipo de Carroceria LD vs DD */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Carroceria do Ônibus</h2>
          <div className="h-60 flex flex-col justify-center space-y-6">
            <div>
              <div className="flex justify-between text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
                <span>Double Decker (DD)</span>
                <span>{stats.ddCount} carros ({stats.total > 0 ? ((stats.ddCount/stats.total)*100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: `${stats.total > 0 ? (stats.ddCount/stats.total)*100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
                <span>Low Driver (LD)</span>
                <span>{stats.ldCount} carros ({stats.total > 0 ? ((stats.ldCount/stats.total)*100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${stats.total > 0 ? (stats.ldCount/stats.total)*100 : 0}%` }}></div>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl flex items-center gap-3 mt-4 text-xs text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
            <TrendingUp size={16} className="text-primary flex-shrink-0" />
            <span>Predomínio de Double Decker (DD) nas rotas de longa distância nacionais Liderança.</span>
          </div>
        </div>

        {/* Distribuição por Classe de Serviço */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Classe de Serviço</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.classChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip cursor={{ fill: 'rgba(16, 93, 56, 0.04)' }} />
                <Bar dataKey="value" name="Quantidade" fill="#105d38" radius={[6, 6, 0, 0]}>
                  {stats.classChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
