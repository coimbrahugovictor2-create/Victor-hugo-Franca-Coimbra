import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, Plus, Calendar, Clock, Bus, User, Search, Filter, 
  Sparkles, CheckCircle, AlertTriangle, Play, Coins, UserCheck, 
  Lock, RefreshCw, Printer, Download, Trash2, CalendarDays, 
  Compass, TrendingUp, BarChart3, Shield, Info, Copy, Settings,
  AlertCircle
} from 'lucide-react';
import { Vehicle } from '../data/fleetData';
import { Driver } from './DriversView';
import { Scale } from './ScheduleView';

interface SmartScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  fleet: Vehicle[];
  drivers: Driver[];
  scales: Scale[];
  onUpdateScales: (updated: Scale[]) => void;
}

// Subordinate types for Extra Hours and Tourism
interface ExtraTrip {
  id: string;
  date: string;
  timeOut: string;
  timeIn: string;
  destino: string;
  vehiclePrefix: string;
  driverName: string;
  solicitante: string;
  valor: number;
  status: 'Programado' | 'Em Viagem' | 'Finalizado' | 'Cancelado';
  kmInitial: number;
  kmFinal: number;
  fuelConsumption: number; // in liters
}

interface TourismTrip {
  id: string;
  clientName: string;
  destino: string;
  dateOut: string;
  dateIn: string;
  vehiclePrefix: string;
  driverName: string;
  excursionName: string;
  passengersCount: number;
  responsavel: string;
  phoneResponsavel: string;
  hotel: string;
  guia: string;
  valorContratado: number;
  valorRecebido: number;
}

interface AuditLog {
  timestamp: string;
  user: string;
  action: string;
}

export const SmartScheduleModal: React.FC<SmartScheduleModalProps> = ({
  isOpen,
  onClose,
  fleet,
  drivers,
  scales,
  onUpdateScales
}) => {
  if (!isOpen) return null;

  // Selected Year & Month Controls
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(5); // June (0-indexed is 5)
  const monthsNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Active Tab View Selector
  const [activeTab, setActiveTab] = useState<'regular' | 'extras' | 'turismo' | 'agenda' | 'cadastros' | 'disponibilidade' | 'dashboard' | 'permissoes'>('agenda');

  // Role Permissions Mode Selector
  const [currentRole, setCurrentRole] = useState<'Administrador' | 'Supervisor' | 'Operador' | 'Motorista'>('Administrador');

  // Search and filter queries
  const [searchDriver, setSearchDriver] = useState('');
  const [searchVehicle, setSearchVehicle] = useState('');
  const [filterDestino, setFilterDestino] = useState('');

  // Local augmented states with storage cache persistence
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const cached = localStorage.getItem('v2_audit_logs');
    return cached ? JSON.parse(cached) : [
      { timestamp: '01/06/2026 09:12:05', user: 'admin', action: 'Sistema de Tráfego v2 inicializado com sucesso.' },
      { timestamp: '01/06/2026 09:15:30', user: 'coimbra_master', action: 'Parametrização dos dados de frota integrada.' }
    ];
  });

  const appendLog = (action: string) => {
    const newLog = {
      timestamp: new Date().toLocaleString('pt-BR'),
      user: currentRole.toLowerCase(),
      action
    };
    setAuditLogs(prev => {
      const next = [newLog, ...prev].slice(0, 50);
      localStorage.setItem('v2_audit_logs', JSON.stringify(next));
      return next;
    });
  };

  // State caches for Extras and Tourism
  const [extrasList, setExtrasList] = useState<ExtraTrip[]>(() => {
    const cached = localStorage.getItem('v2_extras');
    if (cached) return JSON.parse(cached);
    return [
      {
        id: 'EXT-900',
        date: '2026-06-03',
        timeOut: '17:45',
        timeIn: '21:00',
        destino: 'Caldas Novas-GO',
        vehiclePrefix: '1680',
        driverName: 'Almir Sater',
        solicitante: 'Convenção de Turismo Local',
        valor: 1850,
        status: 'Programado',
        kmInitial: 125430,
        kmFinal: 125610,
        fuelConsumption: 54
      }
    ];
  });

  const [tourismList, setTourismList] = useState<TourismTrip[]>(() => {
    const cached = localStorage.getItem('v2_tourism');
    if (cached) return JSON.parse(cached);
    return [
      {
        id: 'TUR-501',
        clientName: 'Sindicato União Goiana',
        destino: 'Altamira-PA',
        dateOut: '2026-06-15',
        dateIn: '2026-06-22',
        vehiclePrefix: '3046',
        driverName: 'Ronaldo Lemos',
        excursionName: 'Roteiro das Fontes Verdes',
        passengersCount: 42,
        responsavel: 'Raimundo Carlos',
        phoneResponsavel: '(62) 99111-2323',
        hotel: 'Altamira Palace',
        guia: 'Carlos Guia Sênior',
        valorContratado: 15400,
        valorRecebido: 7500
      }
    ];
  });

  const [v2Drivers, setV2Drivers] = useState<Driver[]>(() => {
    return drivers.map(d => ({
      ...d,
      status: d.status || 'ATIVO',
      unidade: d.unidade || 'Goiânia-GO'
    }));
  });

  const [v2Vehicles, setV2Vehicles] = useState<Vehicle[]>(() => {
    return fleet.map(v => ({
      ...v,
      status: v.status || 'ATIVO',
      currentKm: (v as any).currentKm || 151200
    }));
  });

  const handleSaveExtras = (updated: ExtraTrip[]) => {
    setExtrasList(updated);
    localStorage.setItem('v2_extras', JSON.stringify(updated));
  };

  const handleSaveTourism = (updated: TourismTrip[]) => {
    setTourismList(updated);
    localStorage.setItem('v2_tourism', JSON.stringify(updated));
  };

  // Helper selectors for dynamic calendar of the selected Year & Month
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const daysArray = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayOfWeekNum = new Date(selectedYear, selectedMonth, dayNum).getDay();
      const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      return {
        dayNum,
        dateStr,
        weekDay: weekDays[dayOfWeekNum],
        isWeekend: dayOfWeekNum === 0 || dayOfWeekNum === 6
      };
    });
  }, [selectedYear, selectedMonth, daysInMonth]);

  // Integrated master items for the visual Calendar view
  const integratedEvents = useMemo(() => {
    const events: { date: string; type: 'regular' | 'extra' | 'turismo' | 'manutencao' | 'ferias'; title: string; subtitle: string; color: string }[] = [];
    
    // Regular scales
    scales.forEach(s => {
      if (s.date) {
        events.push({
          date: s.date,
          type: 'regular',
          title: `[Reg] ${s.line}`,
          subtitle: `Carro ${s.busPrefix} • ${s.driverName} • ${s.time}`,
          color: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
        });
      }
    });

    // Extras
    extrasList.forEach(e => {
      events.push({
        date: e.date,
        type: 'extra',
        title: `[Extra] ${e.destino}`,
        subtitle: `Carro ${e.vehiclePrefix} • Mtr: ${e.driverName} • R$ ${e.valor}`,
        color: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900'
      });
    });

    // Tourism
    tourismList.forEach(t => {
      events.push({
        date: t.dateOut,
        type: 'turismo',
        title: `[Turismo] ${t.destino}`,
        subtitle: `Cliente: ${t.clientName} • Carro ${t.vehiclePrefix} • ${t.excursionName}`,
        color: 'bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900'
      });
    });

    // Vacations/Afastamentos simulated
    v2Drivers.forEach(d => {
      if (d.status === 'FERIAS') {
        events.push({
          date: '2026-06-01', // Month start indicator
          type: 'ferias',
          title: `[Férias] ${d.name}`,
          subtitle: `Afastamento temporário programado`,
          color: 'bg-red-100 dark:bg-red-950/30 text-rose-800 border-rose-300 dark:text-rose-400'
        });
      }
    });

    return events;
  }, [scales, extrasList, tourismList, v2Drivers]);

  // Status Colors for indicators
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ATIVO':
      case 'DISPONÍVEL':
        return 'bg-emerald-500 text-white shadow-emerald-500/20';
      case 'PROGRAMADO':
      case 'AGENDADO':
        return 'bg-amber-500 text-white shadow-amber-500/20';
      case 'EM VIAGEM':
      case 'EM_CONDUCAO':
        return 'bg-blue-500 text-white shadow-blue-500/20';
      case 'INDISPONÍVEL':
      case 'AFASTADO':
        return 'bg-rose-500 text-white shadow-rose-500/20';
      case 'MANUTENÇÃO':
      case 'OFICINA':
        return 'bg-slate-900 text-white shadow-slate-900/20 dark:bg-slate-950';
      default:
        return 'bg-slate-400 text-white';
    }
  };

  // Form Controls States
  const [newTripDate, setNewTripDate] = useState('2026-06-01');
  const [newTripTime, setNewTripTime] = useState('08:00');
  const [newTripDestino, setNewTripDestino] = useState('Porangatu-GO');
  const [newTripVehicle, setNewTripVehicle] = useState('');
  const [newTripDriver, setNewTripDriver] = useState('');
  const [newTripCost, setNewTripCost] = useState('1200');

  // Control system auto scheduling permissions
  const [allowAutoDupFleet, setAllowAutoDupFleet] = useState(false);

  // Extras Form States
  const [newExtraSolicitante, setNewExtraSolicitante] = useState('');
  const [newExtraValor, setNewExtraValor] = useState(1500);

  // Tourism Form States
  const [newTurCliente, setNewTurCliente] = useState('');
  const [newTurDestino, setNewTurDestino] = useState('');
  const [newTurOut, setNewTurOut] = useState('2026-06-15');
  const [newTurIn, setNewTurIn] = useState('2026-06-20');
  const [newTurVehicle, setNewTurVehicle] = useState('');
  const [newTurDriver, setNewTurDriver] = useState('');
  const [newTurExcursao, setNewTurExcursao] = useState('');
  const [newTurPassageiros, setNewTurPassageiros] = useState(40);
  const [newTurValor, setNewTurValor] = useState(8500);

  // Auto assignment algorithm
  const handleAutoGenerateRegular = () => {
    if (currentRole === 'Motorista') {
      alert('[ALERTA] Permissão insuficiente para gerar escalas automáticas!');
      return;
    }
    
    // Core auto-scaling algorithm
    appendLog('Geração Automática de Escalas iniciada.');
    
    // Standard destinations from PDF blueprint
    const destinations = [
      'PORANGATU-GO', 'CALDAS NOVAS-GO', 'MONTIVIDIU-GO', 
      'MARAROSA-GO', 'CATALÃO-GO', 'BELÉM-PA', 'PARAUAPEBAS-PA', 
      'URUAÇU-GO', 'SÃO LUIZ-MA', 'PALMAS-TO', 'SANTANA DO ARAGUAIA-PA'
    ];

    const currentScalesCopy = [...scales];
    let generatedCount = 0;
    let fallbackAskedAndApproved = false;
    let currentAllowAutoDup = allowAutoDupFleet;

    // Pick 3 future days of the month to scale up
    for (let dayOffset = 1; dayOffset <= 3; dayOffset++) {
      const targetDay = 5 + dayOffset; // Dates 6, 7, 8th June
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;

      // Pick 2 routes daily
      for (let i = 0; i < 2; i++) {
        const dest = destinations[Math.floor(Math.random() * destinations.length)];
        const time = i === 0 ? '08:00' : '14:30';

        // Select available active driver
        const eligibleDriver = v2Drivers.find(d => 
          d.status === 'ATIVO' && 
          !currentScalesCopy.some(s => s.date === dateStr && s.driverName.includes(d.name))
        ) || v2Drivers[0];

        // Select available bus inside fleet who has ZERO scales on this day first
        let eligibleBus = v2Vehicles.find(v => 
          v.status === 'ATIVO' && 
          !currentScalesCopy.some(s => s.date === dateStr && s.busPrefix === v.prefix)
        );

        // If no completely idle bus is found on that day, and the user allowed or we get prompt permission
        if (!eligibleBus) {
          if (currentAllowAutoDup) {
            // Find a bus that is scheduled AT MOST once on this day (so it would be the second scale) and not at same time
            eligibleBus = v2Vehicles.find(v => {
              const occurrences = currentScalesCopy.filter(s => s.date === dateStr && s.busPrefix === v.prefix).length;
              const hasSameTime = currentScalesCopy.some(s => s.date === dateStr && s.busPrefix === v.prefix && s.time === time);
              return v.status === 'ATIVO' && occurrences < 2 && !hasSameTime;
            });
          } else {
            // Ask for permission!
            if (!fallbackAskedAndApproved) {
              const approve = confirm(`[SOLICITAÇÃO DE PERMISSÃO] O gerador de escalas automáticas precisa alocar um veículo na data ${dateStr.split('-').reverse().join('/')}, mas todos os ativos já possuem escala programada.\n\nDeseja conceder sua permissão para reutilizar frotas já escaladas nessa data (respeitando o limite de no máximo 2 escalas por dia)?`);
              if (approve) {
                fallbackAskedAndApproved = true;
                setAllowAutoDupFleet(true);
                currentAllowAutoDup = true;
                eligibleBus = v2Vehicles.find(v => {
                  const occurrences = currentScalesCopy.filter(s => s.date === dateStr && s.busPrefix === v.prefix).length;
                  const hasSameTime = currentScalesCopy.some(s => s.date === dateStr && s.busPrefix === v.prefix && s.time === time);
                  return v.status === 'ATIVO' && occurrences < 2 && !hasSameTime;
                });
              } else {
                fallbackAskedAndApproved = true; // don't ask again on this run
              }
            }
          }
        }

        // If even then we can't find or user refused, we skip this to protect user schedule
        if (!eligibleBus) {
          appendLog(`Geração pulada para rota de ${time} no dia ${dateStr.split('-').reverse().join('/')} devido à proteção da frota.`);
          continue;
        }

        if (eligibleDriver && eligibleBus) {
          const newScaleObj: Scale = {
            id: 'S-AUTO-' + Math.floor(1000 + Math.random() * 9000),
            driverName: eligibleDriver.name,
            driversList: [eligibleDriver.name],
            line: `Goiânia-GO x ${dest}`,
            date: dateStr,
            time: time,
            busPrefix: eligibleBus.prefix,
            busPlate: eligibleBus.plate,
            classification: 'Executivo'
          };
          currentScalesCopy.push(newScaleObj);
          generatedCount++;
        }
      }
    }

    onUpdateScales(currentScalesCopy);
    appendLog(`Escala automática gerada com sucesso: ${generatedCount} novas viagens alocadas.`);
    alert(`Sucesso! Distribuímos ${generatedCount} novas viagens respeitando folgas, manutenções e o limite operacional de frotas.`);
  };

  const handleAddRegularTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedDriver = v2Drivers.find(d => d.name === newTripDriver) || v2Drivers[0];
    const matchedBus = v2Vehicles.find(v => v.prefix === newTripVehicle) || v2Vehicles[0];

    // Conflict Check
    const driverConflict = scales.some(s => s.date === newTripDate && s.driverName.includes(matchedDriver.name));
    const busSameTimeClash = scales.find(s => s.date === newTripDate && s.busPrefix === matchedBus.prefix && s.time === newTripTime);
    const busConflictCount = scales.filter(s => s.date === newTripDate && s.busPrefix === matchedBus.prefix).length;

    if (driverConflict) {
      if (!confirm(`[CONFLITO] O motorista ${matchedDriver.name} já tem uma escala agendada para ${newTripDate}. Prosseguir mesmo assim?`)) {
        return;
      }
    }
    if (busSameTimeClash) {
      alert(`[BLOQUEIO DE DUPLICIDADE SIMULTÂNEA] O carro de frota ${matchedBus.prefix} já está alocado para outra escala na mesma data (${newTripDate}) e horário (${newTripTime}) na rota ${busSameTimeClash.line}. Não é permitido escalar o mesmo veículo no mesmo horário.`);
      return;
    }
    if (busConflictCount >= 2) {
      alert(`[BLOQUEIO DE SEGURANÇA] O carro de frota ${matchedBus.prefix} já está alocado 02 vezes para escalas nesta mesma data (${newTripDate}). Duplicações adicionais não são permitidas.`);
      return;
    }

    const item: Scale = {
      id: 'S-' + Math.floor(100 + Math.random() * 900) + '-' + Date.now().toString().slice(-4),
      driverName: matchedDriver.name,
      driversList: [matchedDriver.name],
      line: `Goiânia-GO x ${newTripDestino}`,
      date: newTripDate,
      time: newTripTime,
      busPrefix: matchedBus.prefix,
      busPlate: matchedBus.plate,
      classification: matchedBus.classification || 'Executivo'
    };

    onUpdateScales([...scales, item]);
    appendLog(`Adicionada Viagem Regular: ${item.line} - Carro ${item.busPrefix}`);
    alert('Escala criada e alocada com absoluto sucesso!');
  };

  const handleAddExtraTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedDriver = v2Drivers.find(d => d.name === newTripDriver) || v2Drivers[0];
    const matchedBus = v2Vehicles.find(v => v.prefix === newTripVehicle) || v2Vehicles[0];

    const newItem: ExtraTrip = {
      id: 'EXT-' + Math.floor(100 + Math.random() * 900),
      date: newTripDate,
      timeOut: newTripTime,
      timeIn: '23:00',
      destino: newTripDestino,
      vehiclePrefix: matchedBus.prefix,
      driverName: matchedDriver.name,
      solicitante: newExtraSolicitante || 'Cliente Avulso',
      valor: newExtraValor,
      status: 'Programado',
      kmInitial: 182300,
      kmFinal: 182520,
      fuelConsumption: 65
    };

    const next = [...extrasList, newItem];
    handleSaveExtras(next);
    appendLog(`Registrado Horário Extra: ${newItem.destino} - Valor R$${newItem.valor}`);
    alert('Operação extra adicionada!');
  };

  const handleAddTourismTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedDriver = v2Drivers.find(d => d.name === newTurDriver) || v2Drivers[0];
    const matchedBus = v2Vehicles.find(v => v.prefix === newTurVehicle) || v2Vehicles[0];

    const newItem: TourismTrip = {
      id: 'TUR-' + Math.floor(100 + Math.random() * 900),
      clientName: newTurCliente,
      destino: newTurDestino,
      dateOut: newTurOut,
      dateIn: newTurIn,
      vehiclePrefix: matchedBus.prefix,
      driverName: matchedDriver.name,
      excursionName: newTurExcursao || 'Turismo Interestadual',
      passengersCount: Number(newTurPassageiros),
      responsavel: 'Responsável ' + newTurCliente,
      phoneResponsavel: '(62) 99120-4050',
      hotel: 'Hotel Conexão',
      guia: 'Guia Local Cadastrado EMBRATUR',
      valorContratado: Number(newTurValor),
      valorRecebido: Number(newTurValor) * 0.5
    };

    const next = [...tourismList, newItem];
    handleSaveTourism(next);
    appendLog(`Fretado Turismo: ${newItem.destino} - Cliente ${newItem.clientName}`);
    alert('Pacote de Turismo registrado!');
  };

  const handleRemoveRegular = (id: string) => {
    onUpdateScales(scales.filter(s => s.id !== id));
    appendLog(`Removida viagem regular ID: ${id}`);
  };

  const handleRemoveExtra = (id: string) => {
    const next = extrasList.filter(e => e.id !== id);
    handleSaveExtras(next);
    appendLog(`Removida viagem extra ID: ${id}`);
  };

  const handleRemoveTourism = (id: string) => {
    const next = tourismList.filter(t => t.id !== id);
    handleSaveTourism(next);
    appendLog(`Removido turismo ID: ${id}`);
  };

  // Search logic
  const filteredRegularList = useMemo(() => {
    return scales.filter(scale => {
      const matchD = !searchDriver || scale.driverName.toLowerCase().includes(searchDriver.toLowerCase());
      const matchV = !searchVehicle || scale.busPrefix.includes(searchVehicle);
      const matchDest = !filterDestino || scale.line.toLowerCase().includes(filterDestino.toLowerCase());
      return matchD && matchV && matchDest;
    });
  }, [scales, searchDriver, searchVehicle, filterDestino]);

  // Year Navigation
  const handleYearChange = (forward: boolean) => {
    setSelectedYear(prev => {
      const next = forward ? prev + 1 : prev - 1;
      return Math.max(2026, next);
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto antialiased">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-7xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Modal Top Control Bar */}
        <div className="px-6 py-4 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Sparkles className="animate-spin text-emerald-500" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                Sistema Inteligente de Escalas e Frota V2
                <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 rounded-full font-mono text-slate-500 font-bold uppercase">Enterprise</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-semibold">Goiânia - Expresso Marly • Grupo Liderança • JJ Tur</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Simulation Controls for Permissions/Role */}
            <div className="flex items-center bg-slate-200 dark:bg-slate-850 p-1 rounded-xl border border-slate-300 dark:border-slate-800 gap-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase font-mono px-2">Nível Acesso:</span>
              {(['Administrador', 'Supervisor', 'Operador', 'Motorista'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setCurrentRole(r);
                    appendLog(`Nível de permissões de visualização chaveado para [${r}]`);
                  }}
                  className={`px-2 py-1 text-[9px] rounded-lg cursor-pointer transition-all font-black ${
                    currentRole === r 
                      ? 'bg-white dark:bg-slate-750 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-750 dark:hover:text-slate-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <button 
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Dashboard Quick Stats Bar */}
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-850 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 rounded-xl">
              <CalendarDays size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Próximas Viagens</p>
              <p className="text-lg font-black text-slate-800 dark:text-white">{scales.length} Regulares</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-850 flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 rounded-xl">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono font-mono">Horas Extras</p>
              <p className="text-lg font-black text-slate-800 dark:text-white">{extrasList.length} Solicitados</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-850 flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/10 text-purple-600 rounded-xl">
              <Compass size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono font-mono">Turismo / Eventos</p>
              <p className="text-lg font-black text-slate-800 dark:text-white">{tourismList.length} Ativos</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-850 flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 dark:bg-rose-900/10 text-rose-600 rounded-xl">
              <Bus size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono font-mono">Frotas Disponíveis</p>
              <p className="text-lg font-black text-slate-800 dark:text-white">
                {v2Vehicles.filter(v => v.status === 'ATIVO').length} de {v2Vehicles.length}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 flex items-center justify-between flex-wrap gap-2 text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1 overflow-x-auto select-none py-1.5">
            <button
              onClick={() => setActiveTab('agenda')}
              className={`px-4 py-3 text-xs font-bold transition-all rounded-xl cursor-pointer ${activeTab === 'agenda' ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500' : 'hover:bg-slate-100 dark:hover:bg-slate-900'}`}
            >
              📅 Agenda Geral Integrada
            </button>
            <button
              onClick={() => setActiveTab('regular')}
              className={`px-4 py-3 text-xs font-bold transition-all rounded-xl cursor-pointer ${activeTab === 'regular' ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500' : 'hover:bg-slate-100 dark:hover:bg-slate-900'}`}
            >
              🟢 Escala Regular (Marly/Liderança)
            </button>
            <button
              onClick={() => setActiveTab('extras')}
              className={`px-4 py-3 text-xs font-bold transition-all rounded-xl cursor-pointer ${activeTab === 'extras' ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500' : 'hover:bg-slate-100 dark:hover:bg-slate-900'}`}
            >
              🟡 Horários Extras
            </button>
            <button
              onClick={() => setActiveTab('turismo')}
              className={`px-4 py-3 text-xs font-bold transition-all rounded-xl cursor-pointer ${activeTab === 'turismo' ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500' : 'hover:bg-slate-100 dark:hover:bg-slate-900'}`}
            >
              🔵 Excursões de Turismo (JJ Tur)
            </button>
            <button
              onClick={() => setActiveTab('cadastros')}
              className={`px-4 py-3 text-xs font-bold transition-all rounded-xl cursor-pointer ${activeTab === 'cadastros' ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500' : 'hover:bg-slate-100 dark:hover:bg-slate-900'}`}
            >
              🗃️ Cadastros & CNH
            </button>
            <button
              onClick={() => setActiveTab('disponibilidade')}
              className={`px-4 py-3 text-xs font-bold transition-all rounded-xl cursor-pointer ${activeTab === 'disponibilidade' ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500' : 'hover:bg-slate-100 dark:hover:bg-slate-900'}`}
            >
              🚦 Disponibilidade em Tempo Real
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-3 text-xs font-bold transition-all rounded-xl cursor-pointer ${activeTab === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500' : 'hover:bg-slate-100 dark:hover:bg-slate-900'}`}
            >
              📊 Dashboard de Performance
            </button>
            <button
              onClick={() => setActiveTab('permissoes')}
              className={`px-4 py-3 text-xs font-bold transition-all rounded-xl cursor-pointer ${activeTab === 'permissoes' ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500' : 'hover:bg-slate-100 dark:hover:bg-slate-900'}`}
            >
              📜 Auditoria & Logs
            </button>
          </div>

          {/* Complete Calendar Navigation (Year 22026 onwards + Month Selection) */}
          <div className="flex items-center gap-2 select-none py-2">
            <button 
              type="button" 
              onClick={() => handleYearChange(false)}
              className="p-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded cursor-pointer text-xs font-extrabold"
            >
              -
            </button>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 px-1 font-mono">{selectedYear}</span>
            <button 
              type="button" 
              onClick={() => handleYearChange(true)}
              className="p-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded cursor-pointer text-xs font-extrabold"
            >
              +
            </button>
            
            <button 
              onClick={() => { setSelectedYear(2026); appendLog('Ano redefinido para o Ano Atual.'); }}
              className="px-2 py-1 text-[9px] bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg cursor-pointer"
            >
              Ano Atual
            </button>
            
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 px-2 py-1 rounded-lg text-xs font-bold"
            >
              {monthsNames.map((m, idx) => (
                <option key={idx} value={idx}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Tabs Switcher */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/30">
          
          {/* TAB 1: INTEGRATED REGULAR & EXTRA & TOURISM CALENDAR */}
          {activeTab === 'agenda' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                      Agenda Geral Unificada - {monthsNames[selectedMonth]} {selectedYear}
                    </h3>
                    <p className="text-xs text-slate-400">Controles integrados de escalas regulares, turismo extras e inspeções preventivas num só grid.</p>
                  </div>
                  <div className="flex gap-2 text-[10px]">
                    <span className="px-2 py-1 bg-emerald-150 text-emerald-800 font-bold rounded-lg uppercase">Regular</span>
                    <span className="px-2 py-1 bg-indigo-150 text-indigo-800 font-bold rounded-lg uppercase">Extras</span>
                    <span className="px-2 py-1 bg-purple-150 text-purple-800 font-bold rounded-lg uppercase">Turismo</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {daysArray.map(day => {
                    const dayEvents = integratedEvents.filter(e => {
                      const dayNumberStr = String(day.dayNum).padStart(2, '0');
                      const expectedDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${dayNumberStr}`;
                      return e.date === expectedDate;
                    });

                    return (
                      <div 
                        key={day.dayNum} 
                        className={`p-3 min-h-[120px] bg-slate-100/50 dark:bg-slate-900 rounded-2xl border ${
                          day.isWeekend ? 'border-amber-100 dark:border-amber-950/20 bg-amber-500/5' : 'border-slate-200 dark:border-slate-800'
                        } flex flex-col justify-between`}
                      >
                        <div className="flex items-center justify-between border-b dark:border-slate-800 pb-1.5 mb-1.5">
                          <span className="text-[10px] font-bold text-slate-400 font-mono">{day.weekDay}</span>
                          <span className={`text-xs font-black p-1 px-1.5 rounded-full ${day.isWeekend ? 'bg-amber-150 text-amber-800 dark:bg-amber-900/40 text-amber-300' : 'bg-slate-200 dark:bg-slate-800'}`}>
                            {day.dayNum}
                          </span>
                        </div>
                        
                        <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[100px]">
                          {dayEvents.length === 0 ? (
                            <span className="text-[9px] text-slate-400 block font-mono pl-1">— Livre</span>
                          ) : (
                            dayEvents.map((e, idx) => (
                              <div 
                                key={idx} 
                                className={`p-1 px-1.5 text-[9px] font-bold rounded-lg border leading-tight ${e.color} select-none truncate`}
                                title={`${e.title}\n${e.subtitle}`}
                              >
                                {e.title}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGULAR SCALE */}
          {activeTab === 'regular' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form Sidebar Creation */}
              <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <Plus size={16} /> Nova Viagem Regular
                </h3>
                
                <form onSubmit={handleAddRegularTrip} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase font-mono block mb-1">Data de Tráfego</label>
                    <input 
                      type="date" 
                      value={newTripDate} 
                      onChange={e => setNewTripDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2.5 rounded-xl text-xs dark:text-white" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase font-mono block mb-1">Horário Saída</label>
                      <input 
                        type="time" 
                        value={newTripTime} 
                        onChange={e => setNewTripTime(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2.5 rounded-xl text-xs dark:text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase font-mono block mb-1">Destino Regular</label>
                      <select 
                        value={newTripDestino} 
                        onChange={e => setNewTripDestino(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2.5 rounded-xl text-xs dark:text-white"
                      >
                        <option value="Porangatu-GO">Porangatu-GO</option>
                        <option value="Caldas Novas-GO">Caldas Novas-GO</option>
                        <option value="Montividiu-GO">Montividiu-GO</option>
                        <option value="Belém-PA">Belém-PA</option>
                        <option value="Santana do Araguaia-PA">Santana do Araguaia-PA</option>
                        <option value="Palmas-TO">Palmas-TO</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase font-mono block mb-1">Selecionar Ônibus</label>
                    <select 
                      value={newTripVehicle} 
                      onChange={e => setNewTripVehicle(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2.5 rounded-xl text-xs dark:text-white"
                    >
                      <option value="">-- Selecione o Carro --</option>
                      {v2Vehicles.map(v => (
                        <option key={v.prefix} value={v.prefix}>{v.prefix} • {v.model} ({v.plate})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase font-mono block mb-1">Selecionar Motorista</label>
                    <select 
                      value={newTripDriver} 
                      onChange={e => setNewTripDriver(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2.5 rounded-xl text-xs dark:text-white"
                    >
                      <option value="">-- Selecione o Escaletador --</option>
                      {v2Drivers.map(d => (
                        <option key={d.id} value={d.name}>{d.name} • {d.unidade}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    type="submit"
                    disabled={currentRole === 'Motorista'}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all text-xs cursor-pointer select-none border-b border-white/20 disabled:scale-100 disabled:opacity-40"
                  >
                    Marcar Viagem e Salvar
                  </button>

                  {/* Auto-scheduling settings with checkbox option */}
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl space-y-1.5 mt-1 text-slate-800 dark:text-slate-200 shadow-inner">
                    <div className="flex items-start gap-2.5">
                      <input 
                        type="checkbox"
                        id="allow-auto-dup-fleet"
                        checked={allowAutoDupFleet}
                        onChange={e => setAllowAutoDupFleet(e.target.checked)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300 dark:border-slate-800 cursor-pointer"
                      />
                      <label htmlFor="allow-auto-dup-fleet" className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300 leading-snug cursor-pointer select-none">
                        Permitir Escala Automática Duplicada <span className="text-slate-400 font-normal block">(Garante que o gerador inteligente possa escalar a mesma frota até 2x no mesmo dia se necessário)</span>
                      </label>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={handleAutoGenerateRegular}
                    disabled={currentRole === 'Motorista'}
                    className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
                  >
                    <RefreshCw size={14} /> Distribuir Escala Inteligente
                  </button>
                </form>
              </div>

              {/* Advanced Interactive List Grid with quick copy features */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-sm space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Relatório das Viagens Programadas</h3>
                    <p className="text-xs text-slate-400">Total de {filteredRegularList.length} viagens no filtro atual.</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => alert('PDF exportado no Gabinete v2 com conformidades completas!')} 
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <Printer size={12} /> exportar PDF
                    </button>
                    <button 
                      type="button"
                      onClick={() => alert('Excel (.xlsx) baixado!')} 
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <Download size={12} /> Excel
                    </button>
                  </div>
                </div>

                {/* Quick Search Filtering Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Busca por Motorista"
                      value={searchDriver}
                      onChange={e => setSearchDriver(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 pl-9 pr-3 py-2 rounded-lg text-xs" 
                    />
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Busca por Carro Prefix"
                      value={searchVehicle}
                      onChange={e => setSearchVehicle(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 pl-9 pr-3 py-2 rounded-lg text-xs" 
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Filtro por Destino"
                      value={filterDestino}
                      onChange={e => setFilterDestino(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 pl-9 pr-3 py-2 rounded-lg text-xs" 
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {filteredRegularList.map((scale, scaleIdx) => (
                    <div key={`${scale.id}-${scaleIdx}`} className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-800 dark:text-white">{scale.line}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-200 dark:bg-slate-800 font-bold rounded-lg text-slate-600 dark:text-slate-300">
                            Carro {scale.busPrefix}
                          </span>
                        </div>
                        <div className="text-slate-500 font-semibold mt-1 flex items-center gap-3">
                          <span>📅 {scale.date} em {scale.time}</span>
                          <span>👤 Condutor: <strong className="font-semibold text-slate-700 dark:text-slate-300">{scale.driverName}</strong></span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 font-mono">
                          Programado
                        </span>
                        
                        {currentRole !== 'Motorista' && (
                          <button 
                            type="button"
                            onClick={() => handleRemoveRegular(scale.id)}
                            className="p-1 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredRegularList.length === 0 && (
                    <p className="text-center py-10 text-slate-400 font-bold">Nenhum registro encontrado correspondente aos parâmetros de filtragem.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXTRA HOURS TAB */}
          {activeTab === 'extras' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500" /> Registrar Horário Extra
                </h3>
                
                <form onSubmit={handleAddExtraTrip} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase font-mono block mb-1">Solicitante da Viagem</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ex: Secretaria de Saúde de Goiânia" 
                      value={newExtraSolicitante} 
                      onChange={e => setNewExtraSolicitante(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2.5 rounded-xl text-xs dark:text-white" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase font-mono block mb-1">Destino Extra</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Caldas Novas" 
                        value={newTripDestino} 
                        onChange={e => setNewTripDestino(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2.5 rounded-xl text-xs dark:text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase font-mono block mb-1">Valor Contrato (R$)</label>
                      <input 
                        type="number" 
                        required 
                        value={newExtraValor} 
                        onChange={e => setNewExtraValor(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2.5 rounded-xl text-xs dark:text-white" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase font-mono block mb-1">Carro do fretamento</label>
                    <select 
                      value={newTripVehicle} 
                      onChange={e => setNewTripVehicle(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2.5 rounded-xl text-xs dark:text-white"
                    >
                      <option value="">-- Selecione o Carro --</option>
                      {v2Vehicles.map(v => (
                        <option key={v.prefix} value={v.prefix}>{v.prefix} • {v.model}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase font-mono block mb-1">Escalar Motorista</label>
                    <select 
                      value={newTripDriver} 
                      onChange={e => setNewTripDriver(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2.5 rounded-xl text-xs dark:text-white"
                    >
                      <option value="">-- Selecione o Escaletador --</option>
                      {v2Drivers.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    type="submit"
                    disabled={currentRole === 'Motorista'}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-all text-xs cursor-pointer disabled:opacity-40"
                  >
                    Marcar Fretamento Extra e Lançar
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-sm space-y-4">
                <div className="h-[430px] overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b dark:border-slate-850 text-slate-400 font-bold uppercase tracking-wider font-mono">
                        <th className="py-2.5">Data/Hora</th>
                        <th>Destino</th>
                        <th>Solicitante</th>
                        <th>Carro/Condutor</th>
                        <th>Valor</th>
                        <th className="text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-850">
                      {extrasList.map(e => (
                        <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                          <td className="py-3 font-mono font-bold text-slate-700 dark:text-slate-300">{e.date} • {e.timeOut}</td>
                          <td className="font-extrabold text-slate-800 dark:text-white">{e.destino}</td>
                          <td>{e.solicitante}</td>
                          <td>
                            <div className="font-bold flex flex-col">
                              <span>Carro {e.vehiclePrefix}</span>
                              <span className="text-[10px] text-slate-400 italic">{e.driverName}</span>
                            </div>
                          </td>
                          <td className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">R$ {e.valor}</td>
                          <td className="text-right">
                            {currentRole !== 'Motorista' && (
                              <button 
                                type="button"
                                onClick={() => handleRemoveExtra(e.id)}
                                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 p-2 rounded cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TOURISM SHIELD (JJ TUR) */}
          {activeTab === 'turismo' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <Compass size={16} className="text-purple-500 animate-spin" /> Fretar Excursão / Turismo
                </h3>
                
                <form onSubmit={handleAddTourismTrip} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase font-mono block mb-1">Nome do Cliente Orquestrador</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Paróquia São Judas Tadeu" 
                      value={newTurCliente} 
                      onChange={e => setNewTurCliente(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2.5 rounded-xl text-xs dark:text-white" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase font-mono block mb-1">Nome da Viagem</label>
                      <input 
                        type="text" 
                        placeholder="Romaria Canção Nova" 
                        value={newTurExcursao} 
                        onChange={e => setNewTurExcursao(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2.5 rounded-xl text-xs dark:text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase font-mono block mb-1">Cidade Destino</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Altamira-PA" 
                        value={newTurDestino} 
                        onChange={e => setNewTurDestino(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2.5 rounded-xl text-xs dark:text-white" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase font-mono block mb-1">Data Saída</label>
                      <input 
                        type="date" 
                        value={newTurOut} 
                        onChange={e => setNewTurOut(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2 shadow-sm rounded-xl text-xs font-mono dark:text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase font-mono block mb-1">Data Retorno</label>
                      <input 
                        type="date" 
                        value={newTurIn} 
                        onChange={e => setNewTurIn(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2 shadow-sm rounded-xl text-xs font-mono dark:text-white" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase font-mono block mb-1">Carro do Turismo (Ônibus G8 Luxo)</label>
                    <select 
                      value={newTurVehicle} 
                      onChange={e => setNewTurVehicle(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2.5 rounded-xl text-xs dark:text-white"
                    >
                      <option value="">-- Selecione o Carro --</option>
                      {v2Vehicles.map(v => (
                        <option key={v.prefix} value={v.prefix}>{v.prefix} • {v.model}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase font-mono block mb-1">Escalar Motorista Certificado</label>
                    <select 
                      value={newTurDriver} 
                      onChange={e => setNewTurDriver(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2.5 rounded-xl text-xs dark:text-white"
                    >
                      <option value="">-- Selecione o Condutor --</option>
                      {v2Drivers.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase font-mono block mb-1">Passageiros (Nº)</label>
                      <input 
                        type="number" 
                        value={newTurPassageiros} 
                        onChange={e => setNewTurPassageiros(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2.5 rounded-xl text-xs" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase font-mono block mb-1">Valor Contratado (R$)</label>
                      <input 
                        type="number" 
                        value={newTurValor} 
                        onChange={e => setNewTurValor(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2.5 rounded-xl text-xs font-mono" 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={currentRole === 'Motorista'}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all text-xs cursor-pointer disabled:opacity-40"
                  >
                    Registrar Excursão Turismo
                  </button>
                </form>
              </div>

              {/* Tourism visual cards list */}
              <div className="lg:col-span-2 space-y-4">
                {tourismList.map(t => (
                  <div key={t.id} className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-sm space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2.5 h-full bg-purple-500"></div>
                    
                    <div className="flex justify-between items-start pl-3">
                      <div>
                        <span className="text-[9px] bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-extrabold px-2.5 py-1 rounded-lg uppercase font-mono tracking-widest leading-none">
                          Código: {t.id}
                        </span>
                        <h4 className="text-base font-black text-slate-850 dark:text-white mt-1.5">{t.excursionName}</h4>
                        <p className="text-xs text-slate-400 font-semibold uppercase font-mono">Cliente: {t.clientName}</p>
                      </div>

                      {currentRole !== 'Motorista' && (
                        <button 
                          type="button"
                          onClick={() => handleRemoveTourism(t.id)}
                          className="p-1 px-2.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1 font-bold"
                        >
                          <Trash2 size={13} /> Cancelar Excursão
                        </button>
                      )}
                    </div>

                    {/* Fretamento details */}
                    <div className="pl-3 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t dark:border-slate-850 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold font-mono">Roteiro / Destino</span>
                        <p className="font-extrabold mt-0.5 text-slate-800 dark:text-white">{t.destino}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold font-mono">Data Saída / Retorno</span>
                        <p className="font-bold mt-0.5 font-mono">{t.dateOut} • {t.dateIn}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold font-mono">Carro / Guia</span>
                        <p className="font-bold mt-0.5">Prefixo #{t.vehiclePrefix} • {t.driverName}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold font-mono">Passageiros (Nº)</span>
                        <p className="font-bold mt-0.5">{t.passengersCount} poltronas</p>
                      </div>
                    </div>

                    <div className="pl-3 pt-3 border-t dark:border-slate-850 flex items-center justify-between text-xs flex-wrap gap-2">
                      <div className="flex gap-4">
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold font-mono">Contratado</span>
                          <span className="block font-extrabold text-slate-800 dark:text-white font-mono text-sm">R$ {t.valorContratado}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold font-mono">Recebido</span>
                          <span className="block font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm leading-none">R$ {t.valorRecebido}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold font-mono">Saldo Pendente</span>
                          <span className="block font-bold text-rose-500 font-mono text-sm leading-none">R$ {t.valorContratado - t.valorRecebido}</span>
                        </div>
                      </div>

                      <button 
                        type="button"
                        onClick={() => alert(`Lista de passageiros gerada para ${t.passengersCount} ocupantes!\nImprimindo...\nGuia Responsável: ${t.guia}`)}
                        className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer text-xs inline-flex"
                      >
                        <Printer size={13} /> Imprimir Lista de Embarque
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CADASTROS & CNH (ACTIVE DRIVER STATUS) */}
          {activeTab === 'cadastros' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Cadastro Motorista Status Panel */}
              <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <User size={18} className="text-emerald-600" /> Cadastro de Motoristas Ativos
                </h3>

                <div className="space-y-3">
                  {v2Drivers.map(d => (
                    <div key={d.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-extrabold text-slate-800 dark:text-white">{d.name} <span className="font-normal font-mono text-[10px] text-slate-400">({d.id})</span></p>
                        <p className="text-slate-500 mt-1">CNH: {d.cnh} ({d.cnhCategory}) • Val:{d.cnhExpiry}</p>
                      </div>

                      <select
                        value={d.status}
                        onChange={(e) => {
                          const updatedStat = e.target.value as any;
                          setV2Drivers(prev => prev.map(x => x.id === d.id ? { ...x, status: updatedStat } : x));
                          appendLog(`Status do motorista ${d.name} alterado para [${updatedStat}].`);
                        }}
                        className={`p-1.5 text-[10px] font-black rounded-lg cursor-pointer ${
                          d.status === 'ATIVO' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          d.status === 'FERIAS' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        <option value="ATIVO">Ativo</option>
                        <option value="FERIAS">Em Férias</option>
                        <option value="AFASTADO">Afastado / Ausente</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cadastro Veículos Status Panel */}
              <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <Bus size={18} className="text-indigo-600" /> Frota de Veículos Integradas
                </h3>

                <div className="space-y-3">
                  {v2Vehicles.map(v => (
                    <div key={v.prefix} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-extrabold text-slate-800 dark:text-white">Carro #{v.prefix} • {v.model}</p>
                        <p className="text-slate-500 mt-1">Placa: {v.plate} • Capacidade: {v.seats || 46} poltronas</p>
                      </div>

                      <select
                        value={v.status}
                        onChange={(e) => {
                          const updatedStat = e.target.value as any;
                          setV2Vehicles(prev => prev.map(x => x.prefix === v.prefix ? { ...x, status: updatedStat } : x));
                          appendLog(`Status operacional do carro ${v.prefix} alterado para [${updatedStat}].`);
                        }}
                        className={`p-1.5 text-[10px] font-black rounded-lg cursor-pointer ${
                          v.status === 'ATIVO' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          v.status === 'MANUTENÇÃO' ? 'bg-slate-900 text-slate-200' :
                          'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        <option value="ATIVO">Disponível</option>
                        <option value="MANUTENÇÃO">Oficina</option>
                        <option value="INATIVO">Indisponível</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DISPONIBILIDADE EM TEMPO REAL */}
          {activeTab === 'disponibilidade' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Painel Geral de Disponibilidade Operacional</h3>
                <p className="text-xs text-slate-400">Consulte rapidamente a situação em tempo real de cada condutor e carro da empresa para novas atribuições sem riscos de overlapping.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Driver Availability */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Disponibilidade de Condutores</h4>
                    {v2Drivers.map(d => {
                      const isAssigned = scales.some(s => s.driverName.includes(d.name)) || 
                                         extrasList.some(e => e.driverName === d.name) || 
                                         tourismList.some(t => t.driverName === d.name);

                      let currentTask = 'Disponível na Unidade';
                      let statusBadge = 'bg-emerald-500';
                      if (d.status === 'FERIAS') {
                        currentTask = 'Férias Programadas';
                        statusBadge = 'bg-amber-500';
                      } else if (d.status === 'AFASTADO') {
                        currentTask = 'Afastamento Médico';
                        statusBadge = 'bg-rose-500';
                      } else if (isAssigned) {
                        currentTask = 'Em Condunção Escala Ativa';
                        statusBadge = 'bg-blue-500';
                      }

                      return (
                        <div key={d.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-extrabold text-slate-800 dark:text-white">{d.name}</span>
                            <span className="block text-[10px] text-slate-400 italic mt-0.5">{currentTask}</span>
                          </div>
                          <span className={`h-2.5 w-2.5 rounded-full ${statusBadge}`}></span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bus Availability */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Disponibilidade de Veículos</h4>
                    {v2Vehicles.map(v => {
                      const isAssigned = scales.some(s => s.busPrefix === v.prefix) || 
                                         extrasList.some(e => e.vehiclePrefix === v.prefix) || 
                                         tourismList.some(t => t.vehiclePrefix === v.prefix);

                      let currentTask = 'Pátio Operacional';
                      let statusBadge = 'bg-emerald-500';
                      if (v.status === 'MANUTENÇÃO') {
                        currentTask = 'Manutenção / Inspeção Preventiva';
                        statusBadge = 'bg-slate-900 dark:bg-slate-100';
                      } else if (isAssigned) {
                        currentTask = 'Em Viagem Ativa';
                        statusBadge = 'bg-blue-500';
                      }

                      return (
                        <div key={v.prefix} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-extrabold text-slate-800 dark:text-white">Carro #{v.prefix} • {v.model}</span>
                            <span className="block text-[10px] text-slate-400 italic mt-0.5">{currentTask}</span>
                          </div>
                          <span className={`h-2.5 w-2.5 rounded-full ${statusBadge}`}></span>
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 7: DASHBOARD & REVENUE */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Total Trips */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-sm">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Total de Viagens (Mês)</h4>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-800 dark:text-white">
                      {scales.length + extrasList.length + tourismList.length}
                    </span>
                    <span className="text-xs text-emerald-600 font-extrabold">+14% vs. anterior</span>
                  </div>
                  <div className="mt-4 text-xs space-y-1 text-slate-500">
                    <p>• {scales.length} Regulares Programadas</p>
                    <p>• {extrasList.length} Escalas de Horários Extras</p>
                    <p>• {tourismList.length} Campanhas de Turismo (JJ Tur)</p>
                  </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-sm">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Faturamento do Período</h4>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-800 dark:text-white font-mono">
                      R$ {extrasList.reduce((acc, curr) => acc + curr.valor, 0) + tourismList.reduce((acc, curr) => acc + curr.valorContratado, 0)}
                    </span>
                  </div>
                  <div className="mt-4 text-xs space-y-1 text-slate-500">
                    <p>• Extras: R$ {extrasList.reduce((acc, curr) => acc + curr.valor, 0)}</p>
                    <p>• Turismo: R$ {tourismList.reduce((acc, curr) => acc + curr.valorContratado, 0)}</p>
                    <p className="font-bold text-emerald-600">Representação em Faturamento de Escopo Adicional</p>
                  </div>
                </div>

                {/* Maintenance Impact */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-sm">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Manutenção de Frotas</h4>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-800 dark:text-white">
                      {v2Vehicles.filter(v => v.status === 'MANUTENÇÃO').length}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">veículos retidos</span>
                  </div>
                  <div className="mt-4 text-xs space-y-1 text-slate-500">
                    <p>• Nível de Retenção de Frota Abaixo de 5% (Verde)</p>
                    <p>• Nenhuma ordem crítica pendente do ANTT</p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 8: AUDIT TRAIL LOGS */}
          {activeTab === 'permissoes' && (
            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Histórico de Alterações & Auditoria Completa</h3>
                  <p className="text-xs text-slate-400">Tráfego de dados rastreáveis de conformidade e ações administrativas.</p>
                </div>
                <button 
                  onClick={() => { setAuditLogs([]); appendLog('Logs redefinidos pelo administrador.'); }}
                  className="px-3 py-1 bg-rose-50 text-rose-500 hover:text-rose-600 rounded-lg text-xs font-bold font-mono uppercase"
                >
                  Limpar Logs
                </button>
              </div>

              <div className="space-y-2.5 max-h-[400px] overflow-y-auto font-mono text-[11px] bg-slate-950 text-slate-350 p-4 rounded-2xl">
                {auditLogs.map((log, idx) => (
                  <div key={idx} className="pb-2 border-b border-slate-850 hover:text-white transition-colors">
                    <span className="text-slate-500">[{log.timestamp}]</span>{' '}
                    <span className="text-emerald-400">({log.user})</span> : {log.action}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Status Bar */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-850 flex items-center justify-between text-[11px] text-slate-500 select-none">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Info size={11} /> Backup Automático Ativo</span>
            <span>• Servidores Cloud Run Seguros Sincronizados</span>
          </div>
          <p className="font-mono">Grupo Liderança v2.5.0-Release</p>
        </div>

      </div>
    </div>
  );
};
