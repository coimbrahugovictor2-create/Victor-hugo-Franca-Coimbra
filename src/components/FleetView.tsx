import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Trash2, 
  Edit, 
  Eye, 
  Plus, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Users,
  Calendar,
  Layers,
  Fuel,
  Info,
  ShieldAlert,
  Save,
  Wrench,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Vehicle } from '../data/fleetData';

interface FleetViewProps {
  fleet: Vehicle[];
  onUpdateFleet: (updatedFleet: Vehicle[]) => void;
}

export const FleetView: React.FC<FleetViewProps> = ({ fleet, onUpdateFleet }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('TODAS');
  const [filterClass, setFilterClass] = useState('TODAS');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [filterAntt, setFilterAntt] = useState('TODOS');

  // Selected Vehicle for Single Card View (Cadastro Inteligente)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    brand: "SCANIA",
    classification: "Semi Leito",
    transmissionType: "AUTOMATICO",
    statusOperacional: "ATIVO",
    situationAntt: "APROVADO",
    capacity: 56,
    euro: "VI",
    color: "VERDE",
    axes: 8,
    unit: "GOIÂNIA-GO",
    possession: "LIDERANÇA TURISMO"
  });

  const [validationError, setValidationError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editOriginalPrefix, setEditOriginalPrefix] = useState<string>('');

  // States for inline direct editing of the vehicle prefix in the ficha técnica
  const [isEditingPrefixInline, setIsEditingPrefixInline] = useState(false);
  const [tempPrefix, setTempPrefix] = useState('');
  const [inlineError, setInlineError] = useState('');

  // Extract unique classifications and brands
  const brands = ["TODAS", "M. BENZ", "SCANIA", "VOLVO"];
  const classifications = ["TODAS", "Executivo", "Semi Leito", "Leito Cama", "Leito Total"];

  // Helper status color calculation
  const getStatusColor = (v: Vehicle) => {
    if (v.statusOperacional === "INATIVO") return "bg-red-500";
    if (v.statusOperacional === "MANUTENÇÃO") return "bg-orange-500";
    if (v.statusOperacional === "RESERVADO") return "bg-blue-500";
    
    // Check documents
    if (v.situationAntt === "VENCIDO" || v.vistoria === "VENCIDO") return "bg-red-500";
    if (v.situationAntt === "NÃO TEM VISTORIA" || v.vistoria === "NÃO TEM VISTORIA") return "bg-red-500 border border-double border-white";
    
    // Near expiry warnings (Yellow) - we consider Cronotacógrafo dates or AGR
    if (v.expiryCrono && v.expiryCrono.includes("2024")) return "bg-amber-500 text-white animate-pulse";
    
    return "bg-green-500";
  };

  const getStatusText = (v: Vehicle) => {
    if (v.statusOperacional === "MANUTENÇÃO") return "Manutenção";
    if (v.statusOperacional === "INATIVO") return "Inativo";
    if (v.statusOperacional === "RESERVADO") return "Reservado";
    if (v.situationAntt === "VENCIDO" || v.vistoria === "VENCIDO") return "Bloqueado (Documentos)";
    if (v.situationAntt === "NÃO TEM VISTORIA" || v.vistoria === "NÃO TEM VISTORIA") return "Bloqueado (Sem Vistoria)";
    if (v.expiryCrono && v.expiryCrono.includes("2024")) return "Alerta (Crono Vencendo)";
    return "Liberado";
  };

  const filteredFleet = useMemo(() => {
    return fleet.filter(v => {
      const matchSearch = 
        v.prefix.toLowerCase().includes(searchTerm.toLowerCase()) || 
        v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.chassis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.bodywork.toLowerCase().includes(searchTerm.toLowerCase());

      const matchBrand = filterBrand === "TODAS" || v.brand === filterBrand;
      const matchClass = filterClass === "TODAS" || v.classification === filterClass;
      
      let matchStatus = true;
      if (filterStatus !== "TODOS") {
        if (filterStatus === "LIBERADO") {
          matchStatus = v.statusOperacional === "ATIVO" && v.situationAntt === "APROVADO";
        } else if (filterStatus === "BLOQUEADO") {
          matchStatus = 
            v.statusOperacional === "INATIVO" || 
            v.situationAntt === "VENCIDO" || 
            v.situationAntt === "NÃO TEM VISTORIA";
        } else {
          matchStatus = v.statusOperacional === filterStatus;
        }
      }

      let matchAntt = true;
      if (filterAntt !== "TODOS") {
        matchAntt = v.situationAntt === filterAntt;
      }

      return matchSearch && matchBrand && matchClass && matchStatus && matchAntt;
    });
  }, [fleet, searchTerm, filterBrand, filterClass, filterStatus, filterAntt]);

  // Handle Add Vehicle with protection against duplicate and autosave simulation
  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.prefix || !newVehicle.plate || !newVehicle.renavam) {
      setValidationError("Preencha todos os campos obrigatórios (Prefixo, Placa e Renavam).");
      return;
    }

    // Check duplicate plate
    const duplicatePlate = fleet.some(v => v.plate.trim().toUpperCase() === newVehicle.plate.trim().toUpperCase());
    if (duplicatePlate) {
      setValidationError("Duplicidade de Placa encontrada! Já existe veículo com esta Placa.");
      return;
    }

    const created: Vehicle = {
      prefix: newVehicle.prefix,
      plate: newVehicle.plate.toUpperCase(),
      renavam: newVehicle.renavam,
      unit: newVehicle.unit || "GOIÂNIA-GO",
      owner: newVehicle.owner || "VIAÇÃO RIO OESTE",
      possession: newVehicle.possession || "LIDERANÇA TURISMO",
      classification: (newVehicle.classification as any) || "Semi Leito",
      capacity: Number(newVehicle.capacity) || 56,
      serviceType: "RODOVIARIO",
      brand: (newVehicle.brand as any) || "SCANIA",
      model: newVehicle.model || "K 400 CV",
      transmissionType: (newVehicle.transmissionType as any) || "AUTOMATICO",
      axes: Number(newVehicle.axes) || 8,
      euro: (newVehicle.euro as any) || "VI",
      yearManufacture: Number(newVehicle.yearManufacture) || 2024,
      yearModel: Number(newVehicle.yearModel) || 2024,
      chassis: newVehicle.chassis || "9BSX" + Math.floor(Math.random() * 9000000),
      color: newVehicle.color || "VERDE",
      bodywork: newVehicle.bodywork || "MARCOPOLO G8 DD SEMI LEITO",
      emplacamento: newVehicle.emplacamento || "PIRES DO RIO-GO",
      situationAntt: (newVehicle.situationAntt as any) || "APROVADO",
      expiryAntt: newVehicle.expiryAntt || "01/12/2026",
      expiryCrono: newVehicle.expiryCrono || "15/10/2026",
      expiryArtran: newVehicle.expiryArtran || "NÃO TEM",
      expiryAgr: newVehicle.expiryAgr || "01/12/2026",
      statusOperacional: (newVehicle.statusOperacional as any) || "ATIVO",
      vistoria: newVehicle.situationAntt === "NÃO TEM VISTORIA" ? "NÃO TEM VISTORIA" : "APROVADO"
    };

    const newFleet = [created, ...fleet];
    onUpdateFleet(newFleet);
    setIsAddModalOpen(false);
    setNewVehicle({
      brand: "SCANIA",
      classification: "Semi Leito",
      transmissionType: "AUTOMATICO",
      statusOperacional: "ATIVO",
      situationAntt: "APROVADO",
      capacity: 56,
      euro: "VI",
      color: "VERDE",
      axes: 8,
      unit: "GOIÂNIA-GO",
      possession: "LIDERANÇA TURISMO"
    });
    setValidationError('');
  };

  const handleDeleteVehicle = (prefix: string) => {
    if (confirm(`Tem certeza que deseja excluir o carro prefixo ${prefix}?`)) {
      const updated = fleet.filter(v => v.prefix !== prefix);
      onUpdateFleet(updated);
      if (selectedVehicle?.prefix === prefix) {
        setSelectedVehicle(null);
      }
    }
  };

  const handleEditVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    if (!editingVehicle.prefix || !editingVehicle.plate || !editingVehicle.renavam) {
      setValidationError("Preencha todos os campos obrigatórios (Prefixo, Placa e Renavam).");
      return;
    }

    const newPrefix = editingVehicle.prefix.trim();

    // Check if newPrefix is numeric
    const isNumeric = /^\d+$/.test(newPrefix);
    if (!isNumeric) {
      setValidationError("O prefixo deve ser exclusivamente numérico.");
      return;
    }

    // Duplicidade de prefixo permitida (não bloqueante)
    if (fleet.some(v => v.plate.trim().toUpperCase() === editingVehicle.plate.trim().toUpperCase() && v.prefix !== editOriginalPrefix)) {
      setValidationError("Duplicidade de Placa encontrada! Já existe um veículo com esta Placa.");
      return;
    }

    // Prepare updated vehicle
    const updated: Vehicle = {
      ...editingVehicle,
      prefix: newPrefix,
      plate: editingVehicle.plate.toUpperCase(),
      capacity: Number(editingVehicle.capacity) || 56,
      axes: Number(editingVehicle.axes) || 8,
      yearManufacture: Number(editingVehicle.yearManufacture) || 2024,
      yearModel: Number(editingVehicle.yearModel) || 2024,
    };

    const updatedFleet = fleet.map(v => v.prefix === editOriginalPrefix ? updated : v);

    // Propagate changes to scales (escalas vinculadas) in raw localStorage cache
    if (newPrefix !== editOriginalPrefix) {
      try {
        const cachedRaw = localStorage.getItem('bc_scales');
        if (cachedRaw) {
          const scalesList = JSON.parse(cachedRaw);
          if (Array.isArray(scalesList)) {
            const updatedScales = scalesList.map(s => {
              if (s.busPrefix === editOriginalPrefix) {
                return { 
                  ...s, 
                  busPrefix: newPrefix,
                  busPlate: updated.plate,
                  classification: updated.classification
                };
              }
              return s;
            });
            localStorage.setItem('bc_scales', JSON.stringify(updatedScales));
          }
        }
      } catch (err) {
        console.error("Erro ao sincronizar escalas vinculadas no modal:", err);
      }
    }

    onUpdateFleet(updatedFleet);
    setIsEditModalOpen(false);
    
    // Also update selectedVehicle if it was the edited one
    if (selectedVehicle?.prefix === editOriginalPrefix) {
      setSelectedVehicle(updated);
    }
    
    setEditingVehicle(null);
    setValidationError('');
  };

  const handleInlinePrefixSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedVehicle) return;

    const newPrefix = tempPrefix.trim();
    const oldPrefix = selectedVehicle.prefix;

    if (!newPrefix) {
      setInlineError("O prefixo não pode ser vazio.");
      return;
    }

    const isNumeric = /^\d+$/.test(newPrefix);
    if (!isNumeric) {
      setInlineError("O prefixo deve ser exclusivamente numérico.");
      return;
    }

    // Duplicidade de prefixo permitida (não bloqueante)

    // Process update in fleet list
    const updatedVehicleState = { ...selectedVehicle, prefix: newPrefix };
    const updatedFleet = fleet.map(v => v.prefix === oldPrefix ? updatedVehicleState : v);

    // Update scales (escalas vinculadas) in raw localStorage cache
    if (newPrefix !== oldPrefix) {
      try {
        const cachedRaw = localStorage.getItem('bc_scales');
        if (cachedRaw) {
          const scalesList = JSON.parse(cachedRaw);
          if (Array.isArray(scalesList)) {
            const updatedScales = scalesList.map(s => {
              if (s.busPrefix === oldPrefix) {
                return { 
                  ...s, 
                  busPrefix: newPrefix,
                  busPlate: selectedVehicle.plate,
                  classification: selectedVehicle.classification
                };
              }
              return s;
            });
            localStorage.setItem('bc_scales', JSON.stringify(updatedScales));
          }
        }
      } catch (err) {
        console.error("Erro ao sincronizar escalas vinculadas via edição direta:", err);
      }
    }

    onUpdateFleet(updatedFleet);
    setSelectedVehicle(updatedVehicleState);
    setIsEditingPrefixInline(false);
    setInlineError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-white">
            Cadastro e Filtre de Frota
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Visualização completa de todos os 80 veículos do Grupo Liderança de forma inteligente.
          </p>
        </div>
        <div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-md flex items-center gap-2 font-bold cursor-pointer transition-all active:scale-95"
          >
            <Plus size={20} /> Cadastrar Novo Veículo ID
          </button>
        </div>
      </div>

      {/* FILTROS AVANÇADOS */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-4">
        <div className="flex items-center gap-2 text-slate-800 dark:text-white font-extrabold text-sm border-b border-slate-100 dark:border-slate-700/50 pb-2">
          <Filter size={18} className="text-primary" />
          <span>Filtros do Tráfego & Direção</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          
          {/* Busca por placa ou prefixo */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Prefixo, placa, carroceria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
            />
          </div>

          {/* Filtro Fabricante */}
          <div>
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
            >
              <option value="TODAS">Fabricante (TODAS)</option>
              <option value="M. BENZ">Mercedes-Benz</option>
              <option value="SCANIA">Scania</option>
              <option value="VOLVO">Volvo</option>
            </select>
          </div>

          {/* Filtro Classe */}
          <div>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
            >
              <option value="TODAS">Classe (TODAS)</option>
              <option value="Executivo">Executivo</option>
              <option value="Semi Leito">Semi Leito</option>
              <option value="Leito Cama">Leito Cama</option>
              <option value="Leito Total">Leito Total</option>
            </select>
          </div>

          {/* Filtro Status Operacional */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
            >
              <option value="TODOS">Bloqueios & Liberações</option>
              <option value="LIBERADO">Liberado (Ativos e Ok)</option>
              <option value="BLOQUEADO">Bloqueado Operacional</option>
              <option value="ATIVO">Status: Ativo</option>
              <option value="MANUTENÇÃO">Status: Oficina/Manutenção</option>
              <option value="RESERVADO">Status: Reservado</option>
            </select>
          </div>

          {/* Filtro Situação ANTT */}
          <div>
            <select
              value={filterAntt}
              onChange={(e) => setFilterAntt(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
            >
              <option value="TODOS">ANTT Vistorias (TODOS)</option>
              <option value="APROVADO">Regular (Vistoriado)</option>
              <option value="NÃO TEM VISTORIA">Bloqueados: NÃO TEM VISTORIA</option>
              <option value="VENCIDO">Bloqueados: ANTT VENCIDO</option>
            </select>
          </div>

        </div>
      </div>

      {/* LISTA PRINCIPAL DA FROTA */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Tabela de Carros */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 flex-wrap gap-2">
            <span className="text-sm font-bold text-slate-800 dark:text-white">Relação Operacional ({filteredFleet.length} veículos localizados)</span>
            <div className="flex gap-2 items-center text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Liberados</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Oficina</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> Bloqueados</span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left ml-0 mr-0 border-spacing-0 border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900/40 text-xs font-extrabold text-slate-500 uppercase tracking-widest sticky top-0 h-11 border-b dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-center w-12">STATUS</th>
                  <th className="px-4 py-3">PREFIXO</th>
                  <th className="px-4 py-3">MARCA/FABRICANTE</th>
                  <th className="px-4 py-3">PLACA/RENAVAM</th>
                  <th className="px-4 py-3">CLASSE/EIXOS</th>
                  <th className="px-4 py-3">VISTORIA / ANTT</th>
                  <th className="px-4 py-3 text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {filteredFleet.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-slate-400 font-bold">
                      Nenhum veículo encontrado correspondendo aos filtros avançados.
                    </td>
                  </tr>
                ) : (
                  filteredFleet.map((v) => (
                    <tr 
                      key={`${v.prefix}-${v.plate}`} 
                      className={`hover:bg-primary/5 dark:hover:bg-primary/15 transition-colors cursor-pointer ${selectedVehicle?.prefix === v.prefix ? 'bg-primary/10 dark:bg-primary/20' : ''}`}
                      onClick={() => setSelectedVehicle(v)}
                    >
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block w-4 h-4 rounded-full ${getStatusColor(v)} shadow-sm`} title={getStatusText(v)}></span>
                      </td>
                      <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">
                        {(() => {
                          const isDup = fleet.filter(x => x.prefix === v.prefix).length > 1;
                          return (
                            <span className={`p-1 px-1.5 rounded font-mono block w-fit text-sm border transition-colors ${
                              isDup 
                                ? 'bg-rose-50 text-red-600 border-red-300 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900 font-extrabold animate-pulse' 
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border-transparent'
                            }`} title={isDup ? "Prefixo em Duplicidade" : undefined}>
                              {v.prefix}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-extrabold text-slate-800 dark:text-white">{v.bodywork}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-mono">{v.brand} {v.model}</p>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <p className="text-slate-800 dark:text-white font-bold">{v.plate}</p>
                        <p className="text-[10px] text-slate-400">{v.renavam}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800 dark:text-white">{v.classification}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{v.capacity} Lugares • {v.axes} Eixos</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className={`font-extrabold ${v.situationAntt === 'APROVADO' ? 'text-green-600' : 'text-red-500 animate-pulse'}`}>
                          {v.situationAntt}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">Exp: {v.expiryAntt}</p>
                      </td>
                       <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                         <div className="flex gap-2 justify-end">
                           <button 
                             className="p-1.5 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300 hover:text-primary rounded-lg transition-colors cursor-pointer"
                             onClick={() => setSelectedVehicle(v)}
                             title="Ver Cadastro Individual"
                           >
                             <Eye size={14} />
                           </button>
                           <button 
                             className="p-1.5 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                             onClick={() => {
                               setEditingVehicle(v);
                               setEditOriginalPrefix(v.prefix);
                               setIsEditModalOpen(true);
                             }}
                             title="Editar Veículo"
                           >
                             <Edit size={14} />
                           </button>
                           <button 
                             className="p-1.5 bg-slate-50 dark:bg-slate-700 hover:bg-red-50 text-slate-600 dark:text-slate-300 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                             onClick={() => handleDeleteVehicle(v.prefix)}
                             title="Remover"
                           >
                             <Trash2 size={14} />
                           </button>
                         </div>
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cadastro Inteligente - Ficha Individual (Cadastro Individual de Frota) */}
        <div>
          {selectedVehicle ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6 space-y-6 sticky top-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">PREFIXO OPERACIONAL</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] text-white font-bold uppercase ${getStatusColor(selectedVehicle)}`}>
                      {getStatusText(selectedVehicle)}
                    </span>
                  </div>
                  {isEditingPrefixInline ? (
                    <form onSubmit={handleInlinePrefixSave} className="mt-1 flex flex-col gap-1 select-none">
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="text"
                          value={tempPrefix}
                          onChange={(e) => {
                            setTempPrefix(e.target.value);
                            setInlineError('');
                          }}
                          className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-950 border dark:border-slate-700 rounded-lg text-sm outline-none font-bold focus:ring-2 focus:ring-primary/20 dark:text-white font-mono"
                          placeholder="Ficha"
                          autoFocus
                        />
                        <button 
                          type="submit"
                          className="p-1.5 bg-[#105d38] hover:bg-[#1ea362] text-white rounded-lg transition-colors cursor-pointer"
                          title="Confirmar Prefixo"
                        >
                          <Save size={13} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            setIsEditingPrefixInline(false);
                            setInlineError('');
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 rounded-lg transition-colors cursor-pointer text-xs font-bold"
                          title="Cancelar"
                        >
                          ✕
                        </button>
                      </div>
                      {inlineError && (
                        <p className="text-[10px] text-red-500 font-bold max-w-[200px] leading-tight animate-fade-in">{inlineError}</p>
                      )}
                    </form>
                  ) : (
                    <div className="flex items-center gap-2 mt-1 group select-none">
                      {(() => {
                        const isDup = fleet.filter(x => x.prefix === selectedVehicle.prefix).length > 1;
                        return (
                          <>
                            <h2 className={`text-3xl font-black ${
                              isDup ? 'text-red-650 dark:text-red-400' : 'text-slate-900 dark:text-white'
                            }`}>
                              {selectedVehicle.prefix}
                            </h2>
                            {isDup && (
                              <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded tracking-wider uppercase animate-pulse">
                                Duplicado
                              </span>
                            )}
                          </>
                        );
                      })()}
                      <button
                        onClick={() => {
                          setTempPrefix(selectedVehicle.prefix);
                          setIsEditingPrefixInline(true);
                          setInlineError('');
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                        title="Editar Prefixo Direto"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-right flex flex-col items-end gap-1.5">
                  <span className="text-xs font-extrabold font-mono uppercase bg-slate-100 dark:bg-slate-700 p-1 rounded px-2 dark:text-white">{selectedVehicle.plate}</span>
                  <button
                    onClick={() => {
                      setEditingVehicle(selectedVehicle);
                      setEditOriginalPrefix(selectedVehicle.prefix);
                      setIsEditModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-[10px] font-extrabold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 p-1 px-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit size={11} /> Editar Ficha / Prefixo
                  </button>
                </div>
              </div>

              {/* Ficha Individual */}
              <div className="space-y-4">
                
                {/* Informações mecânicas */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-3 dark:border dark:border-slate-700/50">
                  <h3 className="text-xs font-black uppercase text-slate-500 font-mono tracking-wider flex items-center gap-1.5">
                    <Fuel size={14} className="text-primary" />
                    <span>Mecânica & Modelo</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                    <div>
                      <p className="text-slate-400 font-bold text-[10px]">VEÍCULO:</p>
                      <p className="font-extrabold text-slate-800 dark:text-white">{selectedVehicle.bodywork}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold text-[10px]">CHASSI:</p>
                      <p className="font-semibold text-slate-800 dark:text-white font-mono">{selectedVehicle.chassis}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold text-[10px]">FABRICANTE CHASSI:</p>
                      <p className="font-bold text-slate-800 dark:text-white">{selectedVehicle.brand} ({selectedVehicle.model})</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold text-[10px]">CÂMBIO / MOTOR:</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedVehicle.transmissionType} • Euro {selectedVehicle.euro}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold text-[10px]">ANO FAB/MODELO:</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedVehicle.yearManufacture} / {selectedVehicle.yearModel}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold text-[10px]">CAPACIDADE:</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{selectedVehicle.capacity} Lugares • {selectedVehicle.axes} Eixos</p>
                    </div>
                  </div>
                </div>

                {/* Documentação e Vencimentos em Alerta */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-3 dark:border dark:border-slate-700/50">
                  <h3 className="text-xs font-black uppercase text-slate-500 font-mono tracking-wider flex items-center gap-1.5">
                    <Calendar size={14} className="text-amber-500" />
                    <span>Vencimentos de Documentação</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                      <span className="font-extrabold">Cadastro ANTT</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedVehicle.situationAntt === 'APROVADO' ? 'bg-green-100 text-green-700 dark:bg-green-950/30' : 'bg-red-100 text-red-700 dark:bg-red-950/30 animate-pulse'}`}>
                        {selectedVehicle.situationAntt} ({selectedVehicle.expiryAntt})
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                      <span className="font-extrabold">Aferição Cronotacógrafo</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedVehicle.expiryCrono.includes('2024') ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 font-bold animate-pulse' : 'bg-green-100 text-green-700 dark:bg-green-950/30'}`}>
                        Venc: {selectedVehicle.expiryCrono}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                      <span className="font-extrabold">Vistoria AGR / Cad.</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedVehicle.expiryAgr === 'NÃO TEM' || selectedVehicle.expiryAgr.includes('2024') ? 'bg-red-100 text-red-700 dark:bg-red-950/30' : 'bg-green-100 text-green-700 dark:bg-green-950/30'}`}>
                        Venc: {selectedVehicle.expiryAgr}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                      <span className="font-extrabold">Situação ARTRAN</span>
                      <span className="font-semibold text-slate-500 dark:text-slate-400 font-mono">{selectedVehicle.expiryArtran}</span>
                    </div>
                  </div>
                </div>

                {/* Auditoria / Bloqueio Manual */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-3 dark:border dark:border-slate-700/50">
                  <h3 className="text-xs font-black uppercase text-slate-500 font-mono tracking-wider flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-red-500" />
                    <span>Bloqueios & Auditoria Operacional</span>
                  </h3>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Mude o status operacional nas oficinas ou reserve o veículo:</span>
                    <div className="flex gap-2">
                      {["ATIVO", "MANUTENÇÃO", "INATIVO", "RESERVADO"].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            const updated = fleet.map(v => v.prefix === selectedVehicle.prefix ? { ...v, statusOperacional: status as any } : v);
                            onUpdateFleet(updated);
                            setSelectedVehicle({ ...selectedVehicle, statusOperacional: status as any });
                          }}
                          className={`text-[10px] px-2.5 py-1.5 rounded-lg font-bold flex-1 cursor-pointer transition-colors ${
                            selectedVehicle.statusOperacional === status
                              ? "bg-primary text-white shadow"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border dark:border-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-12 text-center text-slate-400 sticky top-6">
              <Info size={40} className="mx-auto mb-4 opacity-30 text-primary" />
              <p className="font-bold">Nenhum veículo selecionado</p>
              <p className="text-xs mt-1">Clique em qualquer carro da relação de frota para carregar o seu Cadastro Inteligente detalhado.</p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL CADASTRAR VEÍCULO */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="text-primary animate-pulse" />
                  <span>Cadastrar Veículo - Grupo Liderança</span>
                </h2>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {validationError && (
                <div className="bg-red-50 dark:bg-red-950/30 text-red-600 text-xs p-4 rounded-xl mb-4 font-bold border border-red-200 dark:border-red-900">
                  {validationError}
                </div>
              )}

              <form onSubmit={handleAddVehicle} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Prefix Operational *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 2110"
                      value={newVehicle.prefix || ''}
                      onChange={(e) => setNewVehicle({ ...newVehicle, prefix: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Placa *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: SND 4390"
                      value={newVehicle.plate || ''}
                      onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Renavam *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 013442381"
                      value={newVehicle.renavam || ''}
                      onChange={(e) => setNewVehicle({ ...newVehicle, renavam: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fabricante</label>
                    <select
                      value={newVehicle.brand}
                      onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    >
                      <option value="SCANIA">Scania</option>
                      <option value="M. BENZ">Mercedes-Benz</option>
                      <option value="VOLVO">Volvo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Classe de Serviço</label>
                    <select
                      value={newVehicle.classification}
                      onChange={(e) => setNewVehicle({ ...newVehicle, classification: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    >
                      <option value="Executivo">Executivo</option>
                      <option value="Semi Leito">Semi Leito</option>
                      <option value="Leito Cama">Leito Cama</option>
                      <option value="Leito Total">Leito Total</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Câmbio</label>
                    <select
                      value={newVehicle.transmissionType}
                      onChange={(e) => setNewVehicle({ ...newVehicle, transmissionType: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    >
                      <option value="AUTOMATICO">Automático</option>
                      <option value="MANUAL">Manual</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Carroceria / Modelo</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Marcopolo G8 DD"
                      value={newVehicle.bodywork || 'MARCOPOLO G8 DD'}
                      onChange={(e) => setNewVehicle({ ...newVehicle, bodywork: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Unidade / Filial</label>
                    <input 
                      type="text" 
                      placeholder="Ex: GOIÂNIA-GO"
                      value={newVehicle.unit || 'GOIÂNIA-GO'}
                      onChange={(e) => setNewVehicle({ ...newVehicle, unit: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Chassis</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 9BSK6X200..."
                      value={newVehicle.chassis || ''}
                      onChange={(e) => setNewVehicle({ ...newVehicle, chassis: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vencimento ANTT</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 01/12/2026"
                      value={newVehicle.expiryAntt || '01/12/2026'}
                      onChange={(e) => setNewVehicle({ ...newVehicle, expiryAntt: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vencimento Cronotacógrafo</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 15/10/2026"
                      value={newVehicle.expiryCrono || '15/10/2026'}
                      onChange={(e) => setNewVehicle({ ...newVehicle, expiryCrono: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t dark:border-slate-700">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 rounded-xl text-sm font-bold cursor-pointer transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <Save size={16} /> Salvar Ficha Relação
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL EDITAR VEÍCULO */}
      <AnimatePresence>
        {isEditModalOpen && editingVehicle && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit className="text-primary" />
                  <span>Editar Veículo - Prefixo {editOriginalPrefix}</span>
                </h2>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {validationError && (
                <div className="bg-red-50 dark:bg-red-950/30 text-red-600 text-xs p-4 rounded-xl mb-4 font-bold border border-red-200 dark:border-red-900">
                  {validationError}
                </div>
              )}

              <form onSubmit={handleEditVehicle} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Prefixo Operacional *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 2110"
                      value={editingVehicle.prefix || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, prefix: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Placa *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: SND 4390"
                      value={editingVehicle.plate || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, plate: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Renavam *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 013442381"
                      value={editingVehicle.renavam || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, renavam: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fabricante</label>
                    <select
                      value={editingVehicle.brand}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, brand: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    >
                      <option value="SCANIA">Scania</option>
                      <option value="M. BENZ">Mercedes-Benz</option>
                      <option value="VOLVO">Volvo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Classe de Serviço</label>
                    <select
                      value={editingVehicle.classification}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, classification: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    >
                      <option value="Executivo">Executivo</option>
                      <option value="Semi Leito">Semi Leito</option>
                      <option value="Leito Cama">Leito Cama</option>
                      <option value="Leito Total">Leito Total</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Câmbio</label>
                    <select
                      value={editingVehicle.transmissionType}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, transmissionType: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    >
                      <option value="AUTOMATICO">Automático</option>
                      <option value="MANUAL">Manual</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Carroceria / Modelo</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Marcopolo G8 DD"
                      value={editingVehicle.bodywork || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, bodywork: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Unidade / Filial</label>
                    <input 
                      type="text" 
                      placeholder="Ex: GOIÂNIA-GO"
                      value={editingVehicle.unit || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, unit: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Chassis</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 9BSK6X200..."
                      value={editingVehicle.chassis || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, chassis: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Capacidade</label>
                    <input 
                      type="number" 
                      value={editingVehicle.capacity || 0}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, capacity: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Eixos</label>
                    <input 
                      type="number" 
                      value={editingVehicle.axes || 0}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, axes: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ano Fabric.</label>
                    <input 
                      type="number" 
                      value={editingVehicle.yearManufacture || 0}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, yearManufacture: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ano Modelo</label>
                    <input 
                      type="number" 
                      value={editingVehicle.yearModel || 0}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, yearModel: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vencimento ANTT</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 01/12/2026"
                      value={editingVehicle.expiryAntt || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, expiryAntt: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vencimento Cronotacógrafo</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 15/10/2026"
                      value={editingVehicle.expiryCrono || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, expiryCrono: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Situação ANTT</label>
                    <select
                      value={editingVehicle.situationAntt}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, situationAntt: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    >
                      <option value="APROVADO">APROVADO</option>
                      <option value="VENCIDO">VENCIDO</option>
                      <option value="NÃO TEM VISTORIA">NÃO TEM VISTORIA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vistoria</label>
                    <select
                      value={editingVehicle.vistoria}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, vistoria: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    >
                      <option value="APROVADO">APROVADO</option>
                      <option value="VENCIDO">VENCIDO</option>
                      <option value="NÃO TEM VISTORIA">NÃO TEM VISTORIA</option>
                      <option value="NÃO TEM">NÃO TEM</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t dark:border-slate-700">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 rounded-xl text-sm font-bold cursor-pointer transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <Save size={16} /> Salvar Alterações
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
