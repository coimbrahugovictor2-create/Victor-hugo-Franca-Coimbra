import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Calendar, 
  ShieldAlert, 
  AlertCircle, 
  Clock, 
  Search, 
  Edit2, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Filter, 
  FileText,
  TrendingUp,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Vehicle } from '../data/fleetData';

interface DocumentsViewProps {
  fleet: Vehicle[];
  onUpdateFleet?: (newFleet: Vehicle[]) => void;
}

// Utility to parse brazilian date DD/MM/AAAA
const parseDDBrazilianDate = (dateStr: string): Date | null => {
  if (!dateStr || dateStr === "NÃO TEM" || dateStr === "---" || dateStr.trim() === "") return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  return null;
};

export const DocumentsView: React.FC<DocumentsViewProps> = ({ fleet, onUpdateFleet }) => {
  // Navigation / search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'EXPIRED_ANTT' | 'EXPIRED_CRONO' | 'OK'>('ALL');
  const [selectedPossession, setSelectedPossession] = useState<string>('ALL');
  
  // Slideover edit state
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // Drawer draft values
  const [draftSituationAntt, setDraftSituationAntt] = useState<"APROVADO" | "VENCIDO" | "NÃO TEM VISTORIA">("APROVADO");
  const [draftExpiryAntt, setDraftExpiryAntt] = useState("");
  const [draftExpiryCrono, setDraftExpiryCrono] = useState("");
  const [draftExpiryAgr, setDraftExpiryAgr] = useState("");
  const [draftExpiryArtran, setDraftExpiryArtran] = useState("");
  const [draftVistoria, setDraftVistoria] = useState<"APROVADO" | "VENCIDO" | "NÃO TEM VISTORIA" | "NÃO TEM">("APROVADO");
  
  // Notification banner
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // June 4, 2026 is considered "Today" based on platform parameters
  const currentToday = useMemo(() => new Date(2026, 5, 4), []);

  // Check if a document date is expired
  const checkExpired = (dateStr: string): boolean => {
    const d = parseDDBrazilianDate(dateStr);
    if (!d) return false;
    return d < currentToday;
  };

  // Check if a document is expiring soon (within next 45 days)
  const checkExpiringSoon = (dateStr: string): boolean => {
    const d = parseDDBrazilianDate(dateStr);
    if (!d) return false;
    const diffTime = d.getTime() - currentToday.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 45;
  };

  // Open the drawer with the vehicle loaded
  const handleOpenEdit = (v: Vehicle) => {
    setSelectedVehicle(v);
    setDraftSituationAntt(v.situationAntt);
    setDraftExpiryAntt(v.expiryAntt || "");
    setDraftExpiryCrono(v.expiryCrono || "");
    setDraftExpiryAgr(v.expiryAgr || "");
    setDraftExpiryArtran(v.expiryArtran || "");
    setDraftVistoria(v.vistoria || "NÃO TEM");
  };

  // Perform quick renew simulation
  const handleExpressRenew = () => {
    // Set expiry dates to 1 and 2 years from today respectively
    setDraftSituationAntt("APROVADO");
    setDraftExpiryAntt("10/06/2028");
    setDraftExpiryCrono("25/08/2027");
    setDraftExpiryAgr("30/09/2027");
    setDraftExpiryArtran("12/10/2027");
    setDraftVistoria("APROVADO");
    
    // Tiny alert helper
    const btn = document.querySelector("#renew-sparkle-btn");
    if (btn) {
      btn.classList.add("scale-95", "bg-emerald-700");
      setTimeout(() => btn.classList.remove("scale-95", "bg-emerald-700"), 150);
    }
  };

  // Save drafts back to fleet list
  const handleSaveDocDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !onUpdateFleet) return;

    const updatedFleet = fleet.map(v => {
      if (v.prefix === selectedVehicle.prefix) {
        return {
          ...v,
          situationAntt: draftSituationAntt,
          expiryAntt: draftExpiryAntt || "NÃO TEM",
          expiryCrono: draftExpiryCrono || "NÃO TEM",
          expiryAgr: draftExpiryAgr || "NÃO TEM",
          expiryArtran: draftExpiryArtran || "NÃO TEM",
          vistoria: draftVistoria
        };
      }
      return v;
    });

    onUpdateFleet(updatedFleet);
    
    setSuccessMsg(`Documentos do veículo ${selectedVehicle.prefix} atualizados com sucesso!`);
    setSelectedVehicle(null);
    
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  // Document statistics
  const summary = useMemo(() => {
    let expiredAntt = 0;
    let expiredCrono = 0;
    let missingVistoria = 0;
    let expiringSoonCount = 0;
    let perfectConformity = 0;

    fleet.forEach(v => {
      const isAnttExp = v.situationAntt === "VENCIDO" || checkExpired(v.situationAntt) || checkExpired(v.expiryAntt);
      const isCronoExp = checkExpired(v.expiryCrono);
      const isAgrExp = checkExpired(v.expiryAgr);
      const isArtranExp = checkExpired(v.expiryArtran);
      const hasNoVistoria = v.vistoria === "NÃO TEM VISTORIA" || v.situationAntt === "NÃO TEM VISTORIA";

      const isExpiringSoon = 
        checkExpiringSoon(v.expiryAntt) || 
        checkExpiringSoon(v.expiryCrono) || 
        checkExpiringSoon(v.expiryAgr) || 
        checkExpiringSoon(v.expiryArtran);

      if (isAnttExp) expiredAntt++;
      if (isCronoExp) expiredCrono++;
      if (hasNoVistoria) missingVistoria++;
      if (isExpiringSoon) expiringSoonCount++;

      const hasAlert = isAnttExp || isCronoExp || isAgrExp || isArtranExp || hasNoVistoria;
      if (!hasAlert) {
        perfectConformity++;
      }
    });

    const conformityRate = fleet.length ? Math.round((perfectConformity / fleet.length) * 100) : 100;

    return {
      expiredAntt,
      expiredCrono,
      missingVistoria,
      expiringSoonCount,
      perfectConformity,
      conformityRate,
      totalAlerts: expiredAntt + expiredCrono + missingVistoria
    };
  }, [fleet, currentToday]);

  // Filtered vehicles list
  const filteredFleetList = useMemo(() => {
    return fleet.filter(v => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        v.prefix.toLowerCase().includes(q) ||
        v.plate.toLowerCase().includes(q) ||
        v.owner.toLowerCase().includes(q) ||
        (v.renavam && v.renavam.toLowerCase().includes(q));

      // 2. Possession Filter
      const matchesPossession = selectedPossession === 'ALL' || v.possession === selectedPossession;

      if (!matchesSearch || !matchesPossession) return false;

      // 3. Document/Status alerts filter
      const isAnttExp = v.situationAntt === "VENCIDO" || checkExpired(v.expiryAntt);
      const isCronoExp = checkExpired(v.expiryCrono);
      const isAgrExp = checkExpired(v.expiryAgr);
      const isArtranExp = checkExpired(v.expiryArtran);
      const hasNoVistoria = v.vistoria === "NÃO TEM VISTORIA" || v.situationAntt === "NÃO TEM VISTORIA";
      
      const hasAnyIssue = isAnttExp || isCronoExp || isAgrExp || isArtranExp || hasNoVistoria;

      if (statusFilter === 'PENDING') {
        return hasAnyIssue;
      }
      if (statusFilter === 'EXPIRED_ANTT') {
        return isAnttExp;
      }
      if (statusFilter === 'EXPIRED_CRONO') {
        return isCronoExp;
      }
      if (statusFilter === 'OK') {
        return !hasAnyIssue;
      }

      return true;
    });
  }, [fleet, searchQuery, statusFilter, selectedPossession, currentToday]);

  return (
    <div className="space-y-6">
      {/* Upper header action area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-white flex items-center gap-2">
            <ShieldCheck className="text-emerald-500 stroke-[2.5] w-8 h-8" />
            Certidões, Auditoria & Licenciamento
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Controle preventivo e corretivo das certidões obrigatórias ANTT, AGR, ARTRAN de tráfego, vistorias e selos de cronotacógrafo.
          </p>
        </div>

        {/* Global Score Indicator */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-slate-800 dark:to-slate-900/40 p-4 rounded-2xl border border-emerald-500/10 dark:border-emerald-500/20 flex items-center gap-3 shrink-0 shadow-sm">
          <div className="bg-emerald-500 text-white rounded-xl p-2.5 shadow-md shadow-emerald-500/20">
            <TrendingUp size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Índice de Conformidade</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{summary.conformityRate}%</span>
              <span className="text-[10px] font-bold text-slate-500">em dia</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pop up success handler */}
      {successMsg && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl text-emerald-800 text-xs font-semibold shadow-sm flex items-center justify-between animate-fadeIn dark:bg-emerald-950/20 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Direct Quick Stat Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Box ANTT */}
        <div 
          onClick={() => setStatusFilter("EXPIRED_ANTT")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between ${
            statusFilter === "EXPIRED_ANTT"
              ? "bg-red-50 dark:bg-red-950/40 border-red-400 ring-2 ring-red-400/20 shadow-md"
              : "bg-white dark:bg-slate-800 border-slate-200/60 dark:border-slate-700 hover:shadow-md"
          }`}
        >
          <div>
            <p className="text-[10px] font-black text-red-500 uppercase tracking-wider">ANTT Expirada / Bloqueada</p>
            <p className="text-3xl font-black text-red-800 dark:text-red-400 mt-1">{summary.expiredAntt} carros</p>
            <span className="text-[10px] font-medium text-slate-400">Irregularidades cadastrais</span>
          </div>
          <ShieldAlert className="text-red-500 stroke-[2]" size={36} />
        </div>

        {/* Box Cronotacógrafo */}
        <div 
          onClick={() => setStatusFilter("EXPIRED_CRONO")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between ${
            statusFilter === "EXPIRED_CRONO"
              ? "bg-amber-50 dark:bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/20 shadow-md"
              : "bg-white dark:bg-slate-800 border-slate-200/60 dark:border-slate-700 hover:shadow-md"
          }`}
        >
          <div>
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider">Cronotacógrafo Vencidos</p>
            <p className="text-3xl font-black text-amber-800 dark:text-amber-400 mt-1">{summary.expiredCrono} carros</p>
            <span className="text-[10px] font-medium text-slate-400">Selo Inmetro vencido</span>
          </div>
          <Clock className="text-amber-500 stroke-[2]" size={36} />
        </div>

        {/* Box Vistoria */}
        <div 
          onClick={() => setStatusFilter("PENDING")}
          className="p-5 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 hover:shadow-md transition-all rounded-2xl flex items-center justify-between cursor-pointer"
        >
          <div>
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-wider">Sem Vistoria de Órgão</p>
            <p className="text-3xl font-black text-rose-800 dark:text-rose-400 mt-1">{summary.missingVistoria} carros</p>
            <span className="text-[10px] font-medium text-slate-400">Laudo pendente de envio</span>
          </div>
          <AlertCircle className="text-rose-500 stroke-[2]" size={36} />
        </div>

        {/* Box Expiring Soon */}
        <div className="p-5 bg-teal-50/50 dark:bg-teal-950/10 border border-teal-200/50 dark:border-teal-900/40 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-wider">Avisos de Vencimento Próximo</p>
            <p className="text-3xl font-black text-teal-800 dark:text-teal-300 mt-1">{summary.expiringSoonCount} carros</p>
            <span className="text-[10px] font-medium text-slate-400">Próximos 45 dias</span>
          </div>
          <Calendar className="text-teal-500 stroke-[2]" size={36} />
        </div>
      </div>

      {/* Main Filter & Work Area Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side Filter Panel & Search */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-250/50 dark:border-slate-700/60 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Filter size={16} className="text-slate-400" />
              Filtros Avançados
            </h3>
            <button 
              onClick={() => {
                setStatusFilter('ALL');
                setSelectedPossession('ALL');
                setSearchQuery('');
              }}
              title="Limpar todos os filtros"
              className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors dark:hover:bg-slate-700"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Search box input */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-200 uppercase tracking-wider">Buscar por Texto</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Prefixo, placa, Renavam..."
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>

          {/* Filter standard radio category */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-200 uppercase tracking-wider block">Empresa de Frota</label>
            <div className="flex flex-col gap-1.5">
              {[
                { value: 'ALL', name: "Todas as Frotas" },
                { value: 'EXPRESSO MARLY', name: "Expresso Marly" },
                { value: 'LIDERANÇA TURISMO', name: "Liderança Turismo" },
                { value: 'JJ TUR', name: "JJ Tur" }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedPossession(opt.value)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    selectedPossession === opt.value
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{opt.name}</span>
                  <span className="text-[9px] opacity-70">
                    ({opt.value === 'ALL' ? fleet.length : fleet.filter(x => x.possession === opt.value).length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter document status selector */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-200 uppercase tracking-wider block">Foco de Análise</label>
            <div className="space-y-1.5">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  statusFilter === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>Exibir Todos</span>
                <span className="text-xs">📂</span>
              </button>

              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  statusFilter === 'PENDING'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>Com Qualquer Alerta</span>
                <span className="bg-rose-100 dark:bg-red-950 text-rose-800 dark:text-rose-100 px-1.5 py-0.5 rounded-md text-[9px]">
                  {fleet.length - summary.perfectConformity}
                </span>
              </button>

              <button
                onClick={() => setStatusFilter('OK')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  statusFilter === 'OK'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>Conformidade Total (Ok)</span>
                <span className="bg-emerald-100 dark:bg-emerald-955 text-emerald-800 dark:text-emerald-100 px-1.5 py-0.5 rounded-md text-[9px]">
                  {summary.perfectConformity}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Complete Datatable */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-700 shadow-sm overflow-hidden select-none">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/40">
            <div>
              <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1">
                <FileText size={16} className="text-emerald-500" />
                Matriz de Conformidade de Tráfego ({filteredFleetList.length} veículos)
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                Clique em qualquer linha ou no botão de edição para abrir o editor e regularizar vencimentos.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-extrabold h-10 border-b border-slate-200/50 dark:border-slate-700">
                <tr>
                  <th className="p-3 pl-5 text-[10px] uppercase tracking-wider">Prefixo</th>
                  <th className="p-3 text-[10px] uppercase tracking-wider">Chassi/Placa</th>
                  <th className="p-3 text-[10px] uppercase tracking-wider">Situação ANTT</th>
                  <th className="p-3 text-[10px] uppercase tracking-wider">Cronotacógrafo</th>
                  <th className="p-3 text-[10px] uppercase tracking-wider">Cert. AGR</th>
                  <th className="p-3 text-[10px] uppercase tracking-wider">Laudo ARTRAN</th>
                  <th className="p-3 text-center text-[10px] uppercase tracking-wider w-16">Editar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-semibold text-slate-800 dark:text-slate-300">
                {filteredFleetList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                      Nenhum veículo encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredFleetList.map((v) => {
                    const isAnttExp = v.situationAntt === "VENCIDO" || checkExpired(v.expiryAntt);
                    const isCronoExp = checkExpired(v.expiryCrono);
                    const isAgrExp = checkExpired(v.expiryAgr);
                    const isArtranExp = checkExpired(v.expiryArtran);
                    
                    const isAnttSoon = checkExpiringSoon(v.expiryAntt);
                    const isCronoSoon = checkExpiringSoon(v.expiryCrono);
                    const isAgrSoon = checkExpiringSoon(v.expiryAgr);

                    return (
                      <tr 
                        key={v.prefix} 
                        onClick={() => handleOpenEdit(v)}
                        className="group hover:bg-slate-50 dark:hover:bg-slate-750/30 transition-colors cursor-pointer"
                      >
                        {/* PREFIX AND BRAND EMBLEM */}
                        <td className="p-3 pl-5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold font-mono text-xs text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                              {v.prefix}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">{v.possession.split(' ')[0]}</span>
                          </div>
                        </td>

                        {/* PLATE AND RENAVAM */}
                        <td className="p-3">
                          <div className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">{v.plate}</div>
                          <div className="text-[9px] text-slate-400 leading-3 font-normal font-mono">Ren: {v.renavam || "N/D"}</div>
                        </td>

                        {/* ANTT STATUS */}
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            {isAnttExp ? (
                              <span className="inline-flex items-center gap-0.5 bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 text-[10px] px-2 py-0.5 rounded-lg font-black uppercase">
                                <AlertCircle size={10} /> Vencido
                              </span>
                            ) : isAnttSoon ? (
                              <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-lg font-black uppercase">
                                <Clock size={10} /> Urgente
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-lg font-black uppercase">
                                <ShieldCheck size={10} /> Aprovado
                              </span>
                            )}
                          </div>
                          <div className="text-[9.5px] font-mono text-slate-500 mt-0.5 font-bold">Venc: {v.expiryAntt}</div>
                        </td>

                        {/* CRONOTACÓGRAFO INMETRO SELO */}
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            {isCronoExp ? (
                              <span className="text-red-600 dark:text-red-400 text-[10.5px] font-mono flex items-center gap-0.5 font-bold">
                                ⚠️ Vala Vencida
                              </span>
                            ) : isCronoSoon ? (
                              <span className="text-amber-500 font-mono text-[10.5px] flex items-center gap-0.5 font-bold">
                                ⏳ Expirando
                              </span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px] flex items-center gap-0.5">
                                ✓ Em dia
                              </span>
                            )}
                          </div>
                          <div className="text-[9.5px] font-mono text-slate-500 mt-0.5">Selo: {v.expiryCrono}</div>
                        </td>

                        {/* AGR STATUS */}
                        <td className="p-3 text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                          <span className={isAgrExp ? "text-red-500 font-black" : isAgrSoon ? "text-amber-500" : ""}>
                            {v.expiryAgr}
                          </span>
                        </td>

                        {/* ARTRAN LAUDO */}
                        <td className="p-3 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                          <span className={isArtranExp ? "text-red-500 font-black" : ""}>
                            {v.expiryArtran}
                          </span>
                        </td>

                        {/* EDIT BUTTON ACTION ICON */}
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenEdit(v)}
                            className="bg-slate-50 hover:bg-emerald-50 dark:bg-slate-700 dark:hover:bg-slate-600 p-2 rounded-xl text-slate-500 hover:text-emerald-600 dark:text-slate-300 transition-all shadow-sm border border-slate-200/60 dark:border-slate-600 inline-flex items-center justify-center cursor-pointer"
                            title="Editar Documentações e Prazos"
                          >
                            <Edit2 size={13} className="stroke-[2.5]" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide-over interactive Document Editor Panel */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end select-none">
          {/* Backdrop blur overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedVehicle(null)}
          />

          {/* Drawer container body */}
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col animate-slideLeft z-10 border-l border-slate-200 dark:border-slate-800">
            
            {/* Header drawer info */}
            <div className="p-6 bg-gradient-to-r from-emerald-800 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 border border-emerald-500/30 text-white rounded-xl p-2 font-mono font-black text-lg">
                  {selectedVehicle.prefix}
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Editar Documentação de Tráfego</h3>
                  <p className="text-[11px] text-emerald-300 font-medium">Placa: {selectedVehicle.plate} • Renavam: {selectedVehicle.renavam || "N/A"}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedVehicle(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/85 transition-colors cursor-pointer"
              >
                <X size={18} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Quick Helper Express Option */}
            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-emerald-600 dark:text-emerald-400 stroke-[2.5] w-5 h-5 animate-bounce" />
                <div>
                  <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-300">Renovação Expressa Automática?</h4>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400/80 font-semibold">Simular aprovação imediata e renovar válidas por 12 meses.</p>
                </div>
              </div>
              <button
                id="renew-sparkle-btn"
                type="button"
                onClick={handleExpressRenew}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-2xs font-extrabold shadow-sm flex items-center gap-1 transition-all uppercase tracking-wider cursor-pointer transform hover:scale-105"
              >
                Simular Renovação
              </button>
            </div>

            {/* Form body container */}
            <form onSubmit={handleSaveDocDraft} className="flex-1 overflow-y-auto p-6 space-y-5">
              
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3.5">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1 border-b border-slate-200/50 pb-1.5">
                  <ShieldAlert size={14} className="text-emerald-500" />
                  Geral & ANTT
                </h4>
                
                {/* ANTT Situation Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Situação ANTT</label>
                    <select
                      value={draftSituationAntt}
                      onChange={(e) => setDraftSituationAntt(e.target.value as any)}
                      className="w-full text-xs font-bold p-2 bg-white dark:bg-slate-800 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none cursor-pointer"
                    >
                      <option value="APROVADO">✓ Aprovado</option>
                      <option value="VENCIDO">✗ Vencido / Bloqueado</option>
                      <option value="NÃO TEM VISTORIA">⚠ Sem Vistoria</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Vencimento ANTT</label>
                    <input
                      type="text"
                      value={draftExpiryAntt}
                      onChange={(e) => setDraftExpiryAntt(e.target.value)}
                      placeholder="DD/MM/AAAA"
                      className="w-full text-xs font-bold p-2 bg-white dark:bg-slate-800 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Inmetro Cronotacografo details */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1 border-b border-slate-200/50 pb-1.5">
                  <Clock size={14} className="text-amber-500" />
                  Selo de Cronotacógrafo Inmetro
                </h4>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase block">Data de Validade Recalibração</label>
                  <input
                    type="text"
                    value={draftExpiryCrono}
                    onChange={(e) => setDraftExpiryCrono(e.target.value)}
                    placeholder="DD/MM/AAAA ou NÃO TEM"
                    className="w-full text-xs font-bold p-2 bg-white dark:bg-slate-800 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                  />
                  <p className="text-[9px] text-slate-400 font-medium leading-tight">Obrigatório a cada 2 anos pela autoridade de rodovias federais.</p>
                </div>
              </div>

              {/* AGR e ARTRAN estadual */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1 border-b border-slate-200/50 pb-1.5">
                  <AlertTriangle size={14} className="text-blue-500" />
                  Certidões Estaduais (AGR & ARTRAN)
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Validade AGR (Goiás)</label>
                    <input
                      type="text"
                      value={draftExpiryAgr}
                      onChange={(e) => setDraftExpiryAgr(e.target.value)}
                      placeholder="DD/MM/AAAA ou NÃO TEM"
                      className="w-full text-xs font-bold p-2 bg-white dark:bg-slate-800 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Validade ARTRAN</label>
                    <input
                      type="text"
                      value={draftExpiryArtran}
                      onChange={(e) => setDraftExpiryArtran(e.target.value)}
                      placeholder="DD/MM/AAAA ou NÃO TEM"
                      className="w-full text-xs font-bold p-2 bg-white dark:bg-slate-800 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Vistoria de Fábrica details */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1 border-b border-slate-200/50 pb-1.5">
                  <CheckCircle2 size={14} className="text-teal-600" />
                  Laudo Técnico de Inspeção Preventiva
                </h4>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Status Vistoria Física</label>
                  <select
                    value={draftVistoria}
                    onChange={(e) => setDraftVistoria(e.target.value as any)}
                    className="w-full text-xs font-bold p-2 bg-white dark:bg-slate-800 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="APROVADO">✓ Aprovado Geral</option>
                    <option value="VENCIDO">✗ Vencido</option>
                    <option value="NÃO TEM VISTORIA">⚠ Sem Vistoria Física</option>
                    <option value="NÃO TEM">NÃO TEM</option>
                  </select>
                </div>
              </div>

            </form>

            {/* Sticky bottom save drawer details */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/70 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setSelectedVehicle(null)}
                className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-150 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              
              <button
                type="button"
                onClick={handleSaveDocDraft}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/10 hover:shadow-lg cursor-pointer"
              >
                Salvar Alterações
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
