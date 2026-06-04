import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Bus, 
  Users, 
  Wrench, 
  FileText, 
  LayoutDashboard, 
  LogOut, 
  Search, 
  UserCheck, 
  Bell,
  Settings,
  HardDrive,
  BarChart3,
  Moon,
  Sun,
  Shield,
  HelpCircle,
  Menu,
  ChevronRight,
  Sparkles,
  Compass,
  X,
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  Lock,
  ShieldAlert,
  Trash2,
  Plus,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Import our central database types and modular views
import { FLEET_DATA, Vehicle } from './data/fleetData';
import { DashboardView } from './components/DashboardView';
import { FleetView } from './components/FleetView';
import { ScheduleView, Scale } from './components/ScheduleView';
import { ReportsView } from './components/ReportsView';
import { DriversView, Driver } from './components/DriversView';
import { MaintenanceView, MaintenanceTask } from './components/MaintenanceView';
import { DocumentsView } from './components/DocumentsView';
import { InstructorsView, PracticalTest } from './components/InstructorsView';
import { DriveView } from './components/DriveView';
import { FleetValidationView } from './components/FleetValidationView';
import { BrandLogo } from './components/BrandLogo';

interface SidebarItemProps {
  to: string;
  icon: any;
  label: string;
  active: boolean;
}

interface CustomAdmin {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'consulta';
  createdAt: string;
}

const SidebarItem = ({ to, icon: Icon, label, active }: SidebarItemProps) => (
  <Link 
    to={to} 
    className={cn(
      "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group font-bold text-xs select-none",
      active 
        ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20" 
        : "text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white"
    )}
  >
    <div className="flex items-center gap-3">
      <Icon size={16} className={cn(active ? "text-slate-950 animate-pulse" : "text-amber-400 group-hover:text-amber-300")} />
      <span>{label}</span>
    </div>
    {active && <ChevronRight size={14} className="opacity-70" />}
  </Link>
);

export default function App() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState('');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [backupMessage, setBackupMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });
  const [accessDeniedOpen, setAccessDeniedOpen] = useState(false);
  const [isAccessControlOpen, setIsAccessControlOpen] = useState(false);
  const [customAdmins, setCustomAdmins] = useState<CustomAdmin[]>(() => {
    const saved = localStorage.getItem('bc_custom_admins');
    return saved ? JSON.parse(saved) : [
      { id: '1', username: 'marly_admin', password: 'marly_tráfego', role: 'admin', createdAt: '04/06/2026' },
      { id: '2', username: 'jjtur_admin', password: 'jjtur_tráfego', role: 'admin', createdAt: '04/06/2026' }
    ];
  });

  const isAdmin = user === 'lideranca_admin' || user === 'admin' || customAdmins.some(
    (adm) => adm.username.trim().toLowerCase() === user.trim().toLowerCase() && adm.role === 'admin'
  );

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleExportBackup = () => {
    const backupKeys = [
      'bc_fleet',
      'bc_drivers',
      'bc_maintenance_tasks',
      'bc_completed_tasks',
      'bc_practical_tests',
      'bc_scales',
      'bc_printed_scales_archive',
      'v2_audit_logs',
      'v2_extras',
      'v2_tourism',
      'bc_correction_logs',
      'bc_maintenance_printed_archive',
      'bc_logo_size',
      'bc_theme'
    ];

    const backupData: Record<string, string | null> = {};
    backupKeys.forEach(key => {
      backupData[key] = localStorage.getItem(key);
    });

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Lideranca_Marly_JJTur_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setBackupMessage({ text: 'Backup exportado com sucesso! Salve o arquivo com segurança.', type: 'success' });
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) {
      setAccessDeniedOpen(true);
      return;
    }
    setBackupMessage({ text: '', type: '' });
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        let importedCount = 0;
        Object.entries(parsed).forEach(([key, val]) => {
          if (val !== null && typeof val === 'string') {
            localStorage.setItem(key, val);
            importedCount++;
          }
        });

        if (importedCount > 0) {
          setBackupMessage({ text: 'Banco de dados sincronizado e importado com sucesso! Recarregando sistema...', type: 'success' });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setBackupMessage({ text: 'Nenhum dado válido encontrado no arquivo de backup.', type: 'error' });
        }
      } catch (err) {
        setBackupMessage({ text: 'Erro ao decodificar o arquivo de backup. Verifique se o arquivo JSON está íntegro.', type: 'error' });
      }
    };
    fileReader.readAsText(file);
  };

  const handleResetToDefault = () => {
    if (!isAdmin) {
      setAccessDeniedOpen(true);
      return;
    }
    if (window.confirm("Atenção: Isso irá apagar todas as modificações atuais e retornar às listas originais de fábrica do Grupo Liderança. Deseja continuar?")) {
      const backupKeys = [
        'bc_fleet',
        'bc_drivers',
        'bc_maintenance_tasks',
        'bc_completed_tasks',
        'bc_practical_tests',
        'bc_scales',
        'bc_printed_scales_archive',
        'v2_audit_logs',
        'v2_extras',
        'v2_tourism',
        'bc_correction_logs',
        'bc_maintenance_printed_archive',
        'bc_logo_size'
      ];
      backupKeys.forEach(k => localStorage.removeItem(k));
      setBackupMessage({ text: 'Configurações resetadas com sucesso! Recarregando sistema...', type: 'success' });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  // Ground Reality Fleet Central State (allows instant synchronization between tabs!)
  const [fleet, setFleet] = useState<Vehicle[]>(() => {
    const cached = localStorage.getItem('bc_fleet');
    const rawList = cached ? JSON.parse(cached) : FLEET_DATA;
    return [...rawList].sort((a, b) => {
      const numA = parseInt(a.prefix, 10);
      const numB = parseInt(b.prefix, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.prefix.localeCompare(b.prefix, undefined, { numeric: true });
    });
  });

  const handleUpdateFleet = (newFleet: Vehicle[]) => {
    if (!isAdmin) {
      setAccessDeniedOpen(true);
      return;
    }
    const sorted = [...newFleet].sort((a, b) => {
      const numA = parseInt(a.prefix, 10);
      const numB = parseInt(b.prefix, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.prefix.localeCompare(b.prefix, undefined, { numeric: true });
    });
    setFleet(sorted);
    localStorage.setItem('bc_fleet', JSON.stringify(sorted));
  };

  const hasDuplicatePrefix = React.useMemo(() => {
    const prefixes = fleet.map(v => v.prefix);
    return prefixes.some((p, index) => prefixes.indexOf(p) !== index);
  }, [fleet]);

  // Drivers Master State with localStorage Persistence
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const cached = localStorage.getItem('bc_drivers');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (err) {
        console.error("Failed to parse cached drivers:", err);
      }
    }
    const defaultDrivers: Driver[] = [
      { id: "M-101", name: "Almir Sater", phone: "(62) 99823-1122", cnh: "482390132", cnhCategory: "D", cnhExpiry: "2027-10-14", unidade: "Goiânia-GO", status: "ATIVO", testGrade: 9.5 },
      { id: "M-102", name: "Ronaldo Lemos", phone: "(62) 98121-5500", cnh: "102930219", cnhCategory: "E", cnhExpiry: "2026-04-12", unidade: "Goiânia-GO", status: "ATIVO", testGrade: 8.8 },
      { id: "M-103", name: "Sebastião Silveira", phone: "(64) 99312-4422", cnh: "992318021", cnhCategory: "E", cnhExpiry: "2025-01-30", unidade: "Pires do Rio-GO", status: "ATIVO", testGrade: 9.0 },
      { id: "M-104", name: "Thiago Ramos", phone: "(62) 98723-8899", cnh: "389201932", cnhCategory: "D", cnhExpiry: "2024-11-20", status: "FERIAS", unidade: "Anápolis-GO", testGrade: 7.5 }
    ];
    localStorage.setItem('bc_drivers', JSON.stringify(defaultDrivers));
    return defaultDrivers;
  });

  const handleUpdateDrivers = (newDrivers: Driver[]) => {
    if (!isAdmin) {
      setAccessDeniedOpen(true);
      return;
    }
    setDrivers(newDrivers);
    localStorage.setItem('bc_drivers', JSON.stringify(newDrivers));
  };

  // Maintenance OS Master State with localStorage Persistence
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(() => {
    const cached = localStorage.getItem('bc_maintenance_tasks');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (err) {
        console.error("Failed to parse cached maintenance tasks:", err);
      }
    }
    const defaultTasks: MaintenanceTask[] = [
      {
        id: "MNT-201",
        prefix: "1610",
        type: "PREVENTIVA",
        description: "Troca de óleo de motor e filtros de ar de cabine.",
        startDate: "2026-05-26",
        cost: 1200,
        mechanic: "Mário Oficina"
      },
      {
        id: "MNT-202",
        prefix: "3045",
        type: "CORRETIVA",
        description: "Revisão geral do sistema de ar condicionado do piso superior.",
        startDate: "2026-05-27",
        cost: 2500,
        mechanic: "Rodrigo Eletricista"
      }
    ];
    localStorage.setItem('bc_maintenance_tasks', JSON.stringify(defaultTasks));
    return defaultTasks;
  });

  const handleUpdateMaintenanceTasks = (newTasks: MaintenanceTask[]) => {
    if (!isAdmin) {
      setAccessDeniedOpen(true);
      return;
    }
    setMaintenanceTasks(newTasks);
    localStorage.setItem('bc_maintenance_tasks', JSON.stringify(newTasks));
  };

  // Instructor Practical Evaluation Master State with localStorage Persistence
  const [instructorTests, setInstructorTests] = useState<PracticalTest[]>(() => {
    const cached = localStorage.getItem('bc_practical_tests');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (err) {
        console.error("Failed to parse cached practical tests:", err);
      }
    }
    const defaultTests: PracticalTest[] = [
      {
        id: "TEST-401",
        studentName: "Almir Sater",
        instructorName: "Instrutor Geraldo",
        date: "2026-05-12",
        busPrefix: "1180",
        gradeTheoretical: 9.2,
        gradePractical: 9.8,
        finalGrade: 9.5,
        status: "APROVADO",
        notes: "Incrível controle de embreagem e curvas de raio curto com ônibus 6x2 de 14 metros."
      },
      {
        id: "TEST-402",
        studentName: "Thiago Ramos",
        instructorName: "Instrutor Geraldo",
        date: "2026-05-20",
        busPrefix: "1400",
        gradeTheoretical: 8.0,
        gradePractical: 7.0,
        finalGrade: 7.5,
        status: "APROVADO",
        notes: "Teve dificuldade com o freio retarder no Double Decker nas descidas íngremes. Requer atenção."
      }
    ];
    localStorage.setItem('bc_practical_tests', JSON.stringify(defaultTests));
    return defaultTests;
  });

  const handleUpdateInstructorTests = (newTests: PracticalTest[]) => {
    if (!isAdmin) {
      setAccessDeniedOpen(true);
      return;
    }
    setInstructorTests(newTests);
    localStorage.setItem('bc_practical_tests', JSON.stringify(newTests));
  };

  // Operational Traffic Scale Master State with localStorage Persistence
  const [scales, setScales] = useState<Scale[]>(() => {
    const cached = localStorage.getItem('bc_scales');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (err) {
        console.error("Failed to parse cached scales:", err);
      }
    }
    const defaultScales: Scale[] = [];
    localStorage.setItem('bc_scales', JSON.stringify(defaultScales));
    return defaultScales;
  });

  const handleUpdateScales = (newScales: Scale[]) => {
    if (!isAdmin) {
      setAccessDeniedOpen(true);
      return;
    }
    // Synchronize 12:00 GYN-PORANGATU with 23:59 PORANGATU-GYN
    const syncPorangatuScales = (currentScales: Scale[]): Scale[] => {
      const gynToPorangatu12Map = new Map<string, { busPrefix: string; busPlate: string }>();

      currentScales.forEach(s => {
        const is12 = s.time === '12:00' || s.time === '12h00';
        const isRouteR07 = s.routeId === 'R-07';
        const isLineGynPrtg = s.line && s.line.toUpperCase().includes('GOI') && s.line.toUpperCase().includes('PORANGATU');
        const l = s.line ? s.line.toUpperCase() : '';
        const startsGyn = l.includes('GOI') || l.includes('GYN');
        const endsPrtg = l.includes('PORANGATU');
        
        const isGynPrtg12 = isRouteR07 || (isLineGynPrtg && is12 && startsGyn && endsPrtg && (l.indexOf('GOI') < l.indexOf('PORANGATU') || l.indexOf('GYN') < l.indexOf('PORANGATU')));
        
        if (isGynPrtg12 && s.busPrefix) {
          gynToPorangatu12Map.set(s.date, { busPrefix: s.busPrefix, busPlate: s.busPlate || '' });
        }
      });

      let updated = [...currentScales];

      gynToPorangatu12Map.forEach((vehicleInfo, date) => {
        const isTargetScaleIndex = updated.findIndex(s => {
          if (s.date !== date) return false;
          const is2359 = s.time === '23:59' || s.time === '23h59';
          const isRouteR31 = s.routeId === 'R-31';
          const isLinePrtgGyn = s.line && s.line.toUpperCase().includes('PORANGATU') && s.line.toUpperCase().includes('GOI');
          const l = s.line ? s.line.toUpperCase() : '';
          const startsPrtg = l.includes('PORANGATU');
          const endsGyn = l.includes('GOI') || l.includes('GYN');
          
          return isRouteR31 || (isLinePrtgGyn && is2359 && startsPrtg && endsGyn && l.indexOf('PORANGATU') < (l.indexOf('GOI') !== -1 ? l.indexOf('GOI') : l.indexOf('GYN')));
        });

        if (isTargetScaleIndex !== -1) {
          if (updated[isTargetScaleIndex].busPrefix !== vehicleInfo.busPrefix) {
            updated[isTargetScaleIndex] = {
              ...updated[isTargetScaleIndex],
              busPrefix: vehicleInfo.busPrefix,
              busPlate: vehicleInfo.busPlate
            };
          }
        } else {
          const isSpecial = vehicleInfo.busPrefix === '' || vehicleInfo.busPrefix === 'CANC.' || vehicleInfo.busPrefix === 'XXXXXXX';
          if (!isSpecial) {
            const newTargetScale: Scale = {
              id: "S-AUTO-" + date + "-R31-" + Math.floor(Math.random() * 1000),
              driverName: "SEM MOTORISTA ESCALADO",
              driversList: [],
              line: "PORANGATU x GOIÂNIA",
              date: date,
              time: "23:59",
              busPrefix: vehicleInfo.busPrefix,
              busPlate: vehicleInfo.busPlate || "---",
              classification: "Executivo",
              isExtra: false,
              routeId: "R-31"
            };
            updated.push(newTargetScale);
          }
        }
      });

      updated = updated.map(s => {
        const is2359 = s.time === '23:59' || s.time === '23h59';
        const isRouteR31 = s.routeId === 'R-31';
        const isLinePrtgGyn = s.line && s.line.toUpperCase().includes('PORANGATU') && s.line.toUpperCase().includes('GOI');
        const l = s.line ? s.line.toUpperCase() : '';
        const startsPrtg = l.includes('PORANGATU');
        const endsGyn = l.includes('GOI') || l.includes('GYN');
        
        const isPrtgGyn2359 = isRouteR31 || (isLinePrtgGyn && is2359 && startsPrtg && endsGyn && l.indexOf('PORANGATU') < (l.indexOf('GOI') !== -1 ? l.indexOf('GOI') : l.indexOf('GYN')));
        
        if (isPrtgGyn2359) {
          const sourceScale = currentScales.find(src => {
            if (src.date !== s.date) return false;
            const is12 = src.time === '12:00' || src.time === '12h00';
            const isRouteR07 = src.routeId === 'R-07';
            const isLineGynPrtg = src.line && src.line.toUpperCase().includes('GOI') && src.line.toUpperCase().includes('PORANGATU');
            const sl = src.line ? src.line.toUpperCase() : '';
            const startsGyn = sl.includes('GOI') || sl.includes('GYN');
            const endsPrtg = sl.includes('PORANGATU');
            return isRouteR07 || (isLineGynPrtg && is12 && startsGyn && endsPrtg && (sl.indexOf('GOI') < sl.indexOf('PORANGATU') || sl.indexOf('GYN') < sl.indexOf('PORANGATU')));
          });

          if (sourceScale) {
            if (s.busPrefix !== sourceScale.busPrefix) {
              return {
                ...s,
                busPrefix: sourceScale.busPrefix,
                busPlate: sourceScale.busPlate
              };
            }
          }
        }
        return s;
      });

      return updated;
    };

    const syncedScales = syncPorangatuScales(newScales);
    setScales(syncedScales);
    localStorage.setItem('bc_scales', JSON.stringify(syncedScales));
  };

  const [logoSize, setLogoSize] = useState<'sm' | 'md' | 'lg'>(() => {
    const saved = localStorage.getItem('bc_logo_size');
    return (saved as any) || 'md';
  });

  const handleUpdateLogoSize = (size: 'sm' | 'md' | 'lg') => {
    setLogoSize(size);
    localStorage.setItem('bc_logo_size', size);
  };

  const toggleDarkMode = () => {
    setThemeMode((prev) => {
      const target = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('bc_theme', target);
      return target;
    });
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('bc_user');
    if (savedUser) {
      setUser(savedUser);
      setIsAuthenticated(true);
    }
    const savedTheme = localStorage.getItem('bc_theme');
    if (savedTheme === 'dark') {
      setThemeMode('dark');
    }
  }, []);

  // Centralized automatic reload hook - Runs every 2 minutes & Syncs multi-tabs instantly
  useEffect(() => {
    const reloadStatesFromLocalStorage = () => {
      // 1. Synchronize Fleet State
      const cachedFleet = localStorage.getItem('bc_fleet');
      if (cachedFleet) {
        try {
          const rawList = JSON.parse(cachedFleet);
          const sorted = [...rawList].sort((a, b) => {
            const numA = parseInt(a.prefix, 10);
            const numB = parseInt(b.prefix, 10);
            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
            }
            return a.prefix.localeCompare(b.prefix, undefined, { numeric: true });
          });
          setFleet(sorted);
        } catch (err) {
          console.error("Auto-sync: failed to parse fleet:", err);
        }
      }

      // 2. Synchronize Drivers State
      const cachedDrivers = localStorage.getItem('bc_drivers');
      if (cachedDrivers) {
        try {
          setDrivers(JSON.parse(cachedDrivers));
        } catch (err) {
          console.error("Auto-sync: failed to parse drivers:", err);
        }
      }

      // 3. Synchronize Maintenance Tasks State
      const cachedTasks = localStorage.getItem('bc_maintenance_tasks');
      if (cachedTasks) {
        try {
          setMaintenanceTasks(JSON.parse(cachedTasks));
        } catch (err) {
          console.error("Auto-sync: failed to parse maintenance tasks:", err);
        }
      }

      // 4. Synchronize Practical Evaluation Instructor Tests
      const cachedTests = localStorage.getItem('bc_practical_tests');
      if (cachedTests) {
        try {
          setInstructorTests(JSON.parse(cachedTests));
        } catch (err) {
          console.error("Auto-sync: failed to parse practical tests:", err);
        }
      }

      // 5. Synchronize Traffic Scales
      const cachedScales = localStorage.getItem('bc_scales');
      if (cachedScales) {
        try {
          setScales(JSON.parse(cachedScales));
        } catch (err) {
          console.error("Auto-sync: failed to parse scales:", err);
        }
      }
    };

    // Keep an active interval running every 2 minutes (120,000 miliseconds)
    const syncInterval = setInterval(reloadStatesFromLocalStorage, 120000);

    // Also support instant real-time multi-tab cross-synchronization when a change is committed!
    const handleCrossTabSync = (e: StorageEvent) => {
      const liveSyncKeys = ['bc_fleet', 'bc_drivers', 'bc_maintenance_tasks', 'bc_practical_tests', 'bc_scales'];
      if (e.key && liveSyncKeys.includes(e.key)) {
        reloadStatesFromLocalStorage();
      }
    };

    window.addEventListener('storage', handleCrossTabSync);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('storage', handleCrossTabSync);
    };
  }, []);

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    setUser(username);
    localStorage.setItem('bc_user', username);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser('');
    localStorage.removeItem('bc_user');
  };

  return (
    <div className={cn(themeMode === 'dark' ? 'dark' : '')}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
          {!isAuthenticated ? (
            <LoginPage onLogin={handleLogin} customAdmins={customAdmins} />
          ) : (
            <div className="flex min-h-screen">
              {/* Sidebar do Grupo Liderança */}
              <aside className="w-64 bg-[#05351c] dark:bg-[#032e18] border-r border-[#032413] hidden lg:flex flex-col sticky top-0 h-screen select-none text-white">
                <div className="p-6 flex flex-col gap-1 mb-2">
                  <BrandLogo size={logoSize} textColor="light" className="BrandLogo" hasDuplicatePrefix={hasDuplicatePrefix} />
                  <span className={cn(
                    "text-[8px] font-black text-amber-400 uppercase tracking-[0.1em] -mt-1 font-mono transition-all duration-300 block leading-tight",
                    logoSize === 'sm' ? "ml-7" : logoSize === 'md' ? "ml-11" : "ml-[3.65rem] -mt-2"
                  )}>
                    Grupo Liderança <span className="text-emerald-500/50 font-normal">/</span> Expresso Marly <span className="text-emerald-500/50 font-normal">/</span> JJ Tur
                  </span>
                </div>
                
                <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                  <SidebarItem to="/" icon={LayoutDashboard} label="Painel Geral" active={location.pathname === "/"} />
                  <SidebarItem to="/frota" icon={Bus} label="Controle de Frota" active={location.pathname === "/frota"} />
                  <SidebarItem to="/escala" icon={UserCheck} label="Escala de Tráfego" active={location.pathname === "/escala"} />
                  <SidebarItem to="/motoristas" icon={Users} label="Motoristas" active={location.pathname === "/motoristas"} />
                  <SidebarItem to="/manutencao" icon={Wrench} label="Oficina & OS" active={location.pathname === "/manutencao"} />
                  <SidebarItem to="/documentos" icon={FileText} label="Documentos & ANTT" active={location.pathname === "/documentos"} />
                  <SidebarItem to="/instrutoria" icon={Users} label="Testes de Direção" active={location.pathname === "/instrutoria"} />
                  <SidebarItem to="/relatorios" icon={BarChart3} label="Relatórios" active={location.pathname === "/relatorios"} />
                  <SidebarItem to="/validacao" icon={Shield} label="Validação da Frota" active={location.pathname === "/validacao"} />
                  <SidebarItem to="/drive" icon={HardDrive} label="Google Drive" active={location.pathname === "/drive"} />
                </nav>

                 <div className="p-4 border-t border-emerald-900/30 space-y-3">
                  {/* Tamanho do Logo Dinâmico Selector */}
                  <div className="px-3 py-1 space-y-1.5 select-none font-sans">
                    <span className="text-[10px] font-black text-emerald-300/60 uppercase tracking-widest block font-mono">Tamanho do Logo</span>
                    <div className="grid grid-cols-3 gap-1 bg-[#032413] p-1 rounded-xl border border-[#0d4e2d]">
                      <button 
                        onClick={() => handleUpdateLogoSize('sm')}
                        className={cn(
                          "py-1 text-[10px] font-black rounded-lg text-center cursor-pointer transition-all",
                          logoSize === 'sm' 
                            ? "bg-amber-400 text-slate-950 shadow-sm border border-amber-300/20"
                            : "text-emerald-200 hover:text-white"
                        )}
                      >
                        Pequeno
                      </button>
                      <button 
                        onClick={() => handleUpdateLogoSize('md')}
                        className={cn(
                          "py-1 text-[10px] font-black rounded-lg text-center cursor-pointer transition-all",
                          logoSize === 'md' 
                            ? "bg-amber-400 text-slate-950 shadow-sm border border-amber-300/20"
                            : "text-emerald-200 hover:text-white"
                        )}
                      >
                        Médio
                      </button>
                      <button 
                        onClick={() => handleUpdateLogoSize('lg')}
                        className={cn(
                          "py-1 text-[10px] font-black rounded-lg text-center cursor-pointer transition-all",
                          logoSize === 'lg' 
                            ? "bg-amber-400 text-slate-950 shadow-sm border border-amber-300/20"
                            : "text-emerald-200 hover:text-white"
                        )}
                      >
                        Grande
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!isAdmin) {
                        setAccessDeniedOpen(true);
                      } else {
                        setIsAccessControlOpen(true);
                      }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-emerald-100 hover:bg-emerald-900/50 rounded-xl cursor-pointer transition-all"
                  >
                    <Shield size={16} className="text-amber-450" />
                    <span>Controle de Acesso</span>
                  </button>
                  <button 
                    onClick={toggleDarkMode}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-emerald-100/90 hover:bg-emerald-900/50 rounded-xl cursor-pointer transition-all"
                  >
                    <span>Modo Escuro</span>
                    {themeMode === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-yellow-300" />}
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 transition-all rounded-xl cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Desconectar Sessão</span>
                  </button>
                </div>
              </aside>

              {/* Main Area */}
              <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-[#05351c] text-white border-b border-[#042a16] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
                  <div className="flex items-center gap-3 lg:hidden">
                    <button 
                      onClick={() => setMobileMenuOpen(true)}
                      className="p-2 hover:bg-emerald-900/50 rounded-xl text-white outline-none active:scale-95 transition-all cursor-pointer"
                      title="Abrir Menu"
                    >
                      <Menu size={22} className="text-amber-400" />
                    </button>
                    <BrandLogo size="sm" textColor="light" className="BrandLogo" hasDuplicatePrefix={hasDuplicatePrefix} />
                  </div>
                  <div className="flex-1 hidden lg:block">
                    <span className="text-xs font-extrabold tracking-widest text-amber-400 uppercase font-mono">
                      Controle Centralizado e Monitoramento
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => {
                        if (!isAdmin) {
                          setAccessDeniedOpen(true);
                        } else {
                          setIsAccessControlOpen(true);
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-750 text-emerald-50 rounded-xl text-[11px] font-black shadow-md border border-emerald-700/55 active:scale-95 transition-all cursor-pointer select-none"
                      title="Gerenciar novos administradores ou consulta"
                    >
                      <Shield size={13} className="text-amber-450" />
                      <span className="hidden sm:inline">Controle de Acesso</span>
                      <span className="sm:hidden">Acesso</span>
                    </button>
                    <button 
                      onClick={() => setIsBackupOpen(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-[11px] font-black shadow-md border border-amber-300/20 active:scale-95 transition-all cursor-pointer select-none"
                      title="Sincronizar ou fazer backup de dados"
                    >
                      <RefreshCw size={13} className="text-slate-950 animate-spin" style={{ animationDuration: '6s' }} />
                      <span className="hidden sm:inline">Sincronizar Banco</span>
                      <span className="sm:hidden">Sincronizar</span>
                    </button>
                    <div className="h-8 w-[1px] bg-emerald-800/40"></div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-extrabold text-emerald-50">{isAdmin ? 'Administrador' : 'Leitor Consulta'}</p>
                        <p className="text-[10px] text-amber-400 font-extrabold tracking-wider uppercase flex items-center gap-1 justify-end">
                          {isAdmin ? (
                            <>
                              <Shield size={10} className="text-emerald-400" />
                              <span>Operador Master</span>
                            </>
                          ) : (
                            <>
                              <Lock size={10} className="text-amber-400" />
                              <span>Somente Leitura</span>
                            </>
                          )}
                        </p>
                      </div>
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center font-black border text-sm select-none",
                        isAdmin 
                          ? "bg-amber-400 text-slate-950 border-amber-300/20" 
                          : "bg-[#032413] text-emerald-200 border-emerald-800/40"
                      )}>
                        {isAdmin ? 'A' : 'C'}
                      </div>
                    </div>
                  </div>
                </header>

                {!isAdmin && (
                  <div className="bg-amber-400 text-slate-900 font-bold py-2 px-4 text-[10px] sm:text-xs text-center flex items-center justify-center gap-2 border-b border-amber-300 shadow-inner select-none">
                    <Lock size={12} />
                    <span>MODO DE CONSULTA ATIVO (SOMENTE LEITURA). Alterações nas escalas, ônibus, motoristas e manutenções estão desabilitadas.</span>
                  </div>
                )}

                {/* Mobile Drawer (iOS & Android optimised) */}
                <AnimatePresence>
                  {mobileMenuOpen && (
                    <>
                      {/* Backdrop overlay */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                      />

                      {/* Sliding view drawer */}
                      <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="fixed inset-y-0 left-0 w-72 bg-[#05351c] dark:bg-[#032e18] border-r border-[#032413] z-50 flex flex-col lg:hidden text-white shadow-2xl"
                      >
                        {/* Drawer Header style */}
                        <div className="p-4 flex items-center justify-between border-b border-emerald-950">
                          <div className="flex flex-col">
                            <BrandLogo size="sm" textColor="light" className="BrandLogo" hasDuplicatePrefix={hasDuplicatePrefix} />
                            <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest font-mono mt-0.5">
                              Grupo Liderança
                            </span>
                          </div>
                          <button 
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-2 hover:bg-emerald-900/50 rounded-xl text-emerald-100 outline-none hover:text-white cursor-pointer active:scale-95 transition-all"
                          >
                            <X size={20} />
                          </button>
                        </div>

                        {/* Nav item contents */}
                        <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
                          <SidebarItem to="/" icon={LayoutDashboard} label="Painel Geral" active={location.pathname === "/"} />
                          <SidebarItem to="/frota" icon={Bus} label="Controle de Frota" active={location.pathname === "/frota"} />
                          <SidebarItem to="/escala" icon={UserCheck} label="Escala de Tráfego" active={location.pathname === "/escala"} />
                          <SidebarItem to="/motoristas" icon={Users} label="Motoristas" active={location.pathname === "/motoristas"} />
                          <SidebarItem to="/manutencao" icon={Wrench} label="Oficina & OS" active={location.pathname === "/manutencao"} />
                          <SidebarItem to="/documentos" icon={FileText} label="Documentos & ANTT" active={location.pathname === "/documentos"} />
                          <SidebarItem to="/instrutoria" icon={Users} label="Testes de Direção" active={location.pathname === "/instrutoria"} />
                          <SidebarItem to="/relatorios" icon={BarChart3} label="Relatórios" active={location.pathname === "/relatorios"} />
                          <SidebarItem to="/validacao" icon={Shield} label="Validação da Frota" active={location.pathname === "/validacao"} />
                          <SidebarItem to="/drive" icon={HardDrive} label="Google Drive" active={location.pathname === "/drive"} />
                        </nav>

                        {/* DarkMode/Logout drawer footbar */}
                        <div className="p-4 border-t border-emerald-900/30 space-y-3">
                          <button 
                            onClick={() => {
                              setMobileMenuOpen(false);
                              if (!isAdmin) {
                                setAccessDeniedOpen(true);
                              } else {
                                setIsAccessControlOpen(true);
                              }
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-emerald-100/90 hover:bg-emerald-900/50 rounded-xl cursor-pointer transition-all"
                          >
                            <Shield size={16} className="text-amber-450" />
                            <span>Controle de Acesso</span>
                          </button>
                          <button 
                            onClick={() => {
                              toggleDarkMode();
                            }}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-emerald-100/90 hover:bg-emerald-900/50 rounded-xl cursor-pointer transition-all"
                          >
                            <span>Modo Escuro</span>
                            {themeMode === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-yellow-300" />}
                          </button>
                          <button 
                            onClick={() => {
                              setMobileMenuOpen(false);
                              handleLogout();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 transition-all rounded-xl cursor-pointer"
                          >
                            <LogOut size={16} />
                            <span>Desconectar Sessão</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                <main className="flex-1 p-6 overflow-x-hidden md:p-8">
                  <AnimatePresence mode="wait">
                    <Routes location={location}>
                       <Route path="/" element={<AnimatedPage pageKey={location.pathname}><DashboardView fleet={fleet} /></AnimatedPage>} />
                      <Route path="/frota" element={<AnimatedPage pageKey={location.pathname}><FleetView fleet={fleet} onUpdateFleet={handleUpdateFleet} /></AnimatedPage>} />
                      <Route path="/escala" element={<AnimatedPage pageKey={location.pathname}><ScheduleView fleet={fleet} scales={scales} onUpdateScales={handleUpdateScales} drivers={drivers} /></AnimatedPage>} />
                      <Route path="/motoristas" element={<AnimatedPage pageKey={location.pathname}><DriversView drivers={drivers} onUpdateDrivers={handleUpdateDrivers} /></AnimatedPage>} />
                      <Route path="/manutencao" element={<AnimatedPage pageKey={location.pathname}><MaintenanceView fleet={fleet} onUpdateFleet={handleUpdateFleet} tasks={maintenanceTasks} onUpdateTasks={handleUpdateMaintenanceTasks} /></AnimatedPage>} />
                      <Route path="/documentos" element={<AnimatedPage pageKey={location.pathname}><DocumentsView fleet={fleet} onUpdateFleet={handleUpdateFleet} /></AnimatedPage>} />
                      <Route path="/instrutoria" element={<AnimatedPage pageKey={location.pathname}><InstructorsView tests={instructorTests} onUpdateTests={handleUpdateInstructorTests} /></AnimatedPage>} />
                      <Route path="/relatorios" element={<AnimatedPage pageKey={location.pathname}><ReportsView fleet={fleet} /></AnimatedPage>} />
                      <Route path="/validacao" element={<AnimatedPage pageKey={location.pathname}><FleetValidationView fleet={fleet} onUpdateFleet={handleUpdateFleet} /></AnimatedPage>} />
                      <Route path="/drive" element={<AnimatedPage pageKey={location.pathname}><DriveView /></AnimatedPage>} />
                      <Route path="*" element={<AnimatedPage pageKey={location.pathname}><DashboardView fleet={fleet} /></AnimatedPage>} />
                    </Routes>
                  </AnimatePresence>
                </main>
              </div>
            </div>
          )}

          {/* Backup Database Sync Center Overlay Modal */}
          <AnimatePresence>
            {isBackupOpen && (
              <>
                {/* Backdrop overlay */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    setIsBackupOpen(false);
                    setBackupMessage({ text: '', type: '' });
                  }}
                  className="fixed inset-0 bg-black/70 z-[1001]"
                />

                {/* Modal box */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl z-[1002] shadow-2xl p-6 overflow-hidden text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto"
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
                        <HardDrive size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-950 dark:text-white">Central de Sincronização</h3>
                        <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Grupo Liderança / Marly / JJ Tur</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setIsBackupOpen(false);
                        setBackupMessage({ text: '', type: '' });
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Informational Help Alert */}
                  <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    <span className="font-extrabold block mb-1">💡 Como funciona a Sincronização?</span>
                    Como este aplicativo funciona de forma segura off-line, os dados cadastrados (ônibus, escalas de tráfego, manutenções, motoristas) ficam guardados no seu navegador. 
                    Gere o arquivo de backup abaixo para transferir todos os dados facilmente entre seu notebook, computador, celular ou links publicados!
                  </div>

                  {/* Action panels */}
                  <div className="mt-5 space-y-4">
                    {/* Status Feedback Message Banner */}
                    {backupMessage.text && (
                      <div className={cn(
                        "p-3 rounded-xl border flex items-center gap-2 text-xs font-bold animate-pulse",
                        backupMessage.type === 'success' 
                          ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400" 
                          : "bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400"
                      )}>
                        <CheckCircle size={16} className="flex-shrink-0" />
                        <span>{backupMessage.text}</span>
                      </div>
                    )}

                    {/* Step 1: Export */}
                    <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-950 dark:text-white">1. Exportar Banco de Dados</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">Gere um arquivo de segurança no formato JSON com todos os seus ônibus e escalas.</p>
                      </div>
                      <button 
                        onClick={handleExportBackup}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
                      >
                        <Download size={14} />
                        <span>Baixar Backup</span>
                      </button>
                    </div>

                    {/* Step 2: Import */}
                    <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                      <div className="mb-3">
                        <h4 className="text-sm font-bold text-slate-950 dark:text-white">2. Importar Banco de Dados</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">Importe seu arquivo JSON para sincronizar celulares, notebooks ou links publicados.</p>
                      </div>
                      <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#05351c] hover:bg-emerald-900 text-white rounded-xl text-xs font-black shadow-sm border border-[#042a16] transition-all cursor-pointer select-none active:scale-95 text-center">
                        <Upload size={14} />
                        <span>Selecionar Arquivo .json</span>
                        <input 
                          type="file" 
                          accept=".json" 
                          onChange={handleImportBackup} 
                          className="hidden" 
                        />
                      </label>
                    </div>

                    {/* Step 3: Reset */}
                    <div className="pt-2 flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Problemas com alterações?</span>
                      <button 
                        onClick={handleResetToDefault}
                        className="text-rose-500 hover:text-rose-600 font-extrabold hover:underline cursor-pointer"
                      >
                        Restaurar Padrão de Fábrica
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Access Denied Warning Overlay Modal */}
          <AnimatePresence>
            {accessDeniedOpen && (
              <>
                {/* Backdrop overlay */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setAccessDeniedOpen(false)}
                  className="fixed inset-0 bg-black/70 z-[1001]"
                />

                {/* Modal box */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl z-[1002] shadow-2xl p-6 overflow-hidden text-slate-800 dark:text-slate-100 max-h-[90vh]"
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                        <ShieldAlert size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-rose-600 dark:text-rose-400">Acesso Restrito</h3>
                        <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Modo Consulta (Somente Leitura)</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAccessDeniedOpen(false)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="mt-5 text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500">
                      <Lock size={28} className="animate-bounce" style={{ animationDuration: '2.5s' }} />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">Ação Bloqueada no Perfil Atual</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
                        Infelizmente, esta sessão está utilizando o perfil de <span className="font-bold text-amber-500">Leitor Consulta</span>. 
                        Apenas usuários administradores autenticados podem inserir ou atualizar escalas de tráfego, ônibus da frota, motoristas ou registrar ordens de serviço.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                    <button 
                      onClick={() => {
                        setAccessDeniedOpen(false);
                        handleLogout();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Entrar como Admin</span>
                    </button>
                    <button 
                      onClick={() => setAccessDeniedOpen(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Continuar lendo
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Access Control Center Overlay Modal */}
          <AnimatePresence>
            {isAccessControlOpen && (
              <AccessControlModal 
                isOpen={isAccessControlOpen} 
                onClose={() => setIsAccessControlOpen(false)} 
                customAdmins={customAdmins} 
                onUpdateCustomAdmins={(updated) => {
                  setCustomAdmins(updated);
                  localStorage.setItem('bc_custom_admins', JSON.stringify(updated));
                }}
                currentUser={user}
              />
            )}
          </AnimatePresence>
      </div>
      <SpeedInsights />
    </div>
  );
}

const AnimatedPage = ({ children, pageKey }: { children: React.ReactNode; pageKey?: string }) => (
  <motion.div
    key={pageKey}
    initial={{ opacity: 0, y: 12, scale: 0.995 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -12, scale: 0.995 }}
    transition={{ duration: 0.18, ease: "easeInOut" }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

interface AccessControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  customAdmins: CustomAdmin[];
  onUpdateCustomAdmins: (updated: CustomAdmin[]) => void;
  currentUser: string;
}

const AccessControlModal = ({ 
  onClose, 
  customAdmins, 
  onUpdateCustomAdmins, 
  currentUser 
}: AccessControlModalProps) => {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'consulta'>('admin');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const formattedUser = newUsername.trim();
    if (!formattedUser) {
      setFormError('O nome de usuário não pode estar vazio.');
      return;
    }

    if (!newPassword.trim()) {
      setFormError('A senha não pode estar vazia.');
      return;
    }

    const lowerUser = formattedUser.toLowerCase();
    if (lowerUser === 'lideranca_admin' || lowerUser === 'admin' || lowerUser === 'leitor_lideranca' || lowerUser === 'consulta' || lowerUser === 'leitor') {
      setFormError('Este nome de usuário é nativo do sistema e não pode ser duplicado.');
      return;
    }

    if (customAdmins.some((adm) => adm.username.toLowerCase() === lowerUser)) {
      setFormError('Este nome de usuário já está sendo utilizado.');
      return;
    }

    const newUser: CustomAdmin = {
      id: Math.random().toString(36).substring(2, 9),
      username: formattedUser,
      password: newPassword,
      role: newRole,
      createdAt: new Date().toLocaleDateString('pt-BR')
    };

    const updated = [...customAdmins, newUser];
    onUpdateCustomAdmins(updated);

    setNewUsername('');
    setNewPassword('');
    setFormSuccess(`Usuário "${formattedUser}" cadastrado com sucesso!`);
    
    setTimeout(() => setFormSuccess(''), 4000);
  };

  const handleDeleteUser = (id: string, usernameToRemove: string) => {
    if (usernameToRemove.toLowerCase() === currentUser.toLowerCase()) {
      alert('Você não pode remover o próprio usuário que está conectado no momento.');
      return;
    }
    if (window.confirm(`Tem certeza que deseja remover o usuário "${usernameToRemove}"?`)) {
      const updated = customAdmins.filter(adm => adm.id !== id);
      onUpdateCustomAdmins(updated);
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 z-[1001]"
      />

      {/* Modal box */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[720px] bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl z-[1002] shadow-2xl p-6 text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 dark:text-white">Gerenciamento de Administradores</h3>
              <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Controle de Acesso • Grupo Liderança</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-5">
          {/* Side A: Form */}
          <form onSubmit={handleAddUser} className="md:col-span-5 space-y-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 pb-5 md:pb-0 md:pr-6">
            <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider">Novo Acesso</h4>
            
            {formError && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl text-[11px] font-bold">
                ⚠️ {formError}
              </div>
            )}

            {formSuccess && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-[11px] font-bold">
                ✓ {formSuccess}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-350 uppercase tracking-widest mb-1">Nome de Usuário</label>
              <input 
                type="text" 
                placeholder="Ex: marly_fiscal"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-400/20 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-350 uppercase tracking-widest mb-1">Senha</label>
              <input 
                type="password" 
                placeholder="Senha de entrada"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-400/20 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-350 uppercase tracking-widest mb-1">Perfil de Permissão</label>
              <select 
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-400/20 dark:text-white font-bold cursor-pointer"
              >
                <option value="admin">Administrador (Escrita total)</option>
                <option value="consulta">Leitor Consulta (Apenas Leitura)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl font-black text-[11px] shadow-md hover:shadow-amber-400/10 transition-all select-none cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus size={13} />
              <span>Conceder Acesso</span>
            </button>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 leading-relaxed font-mono">
              <strong>Info:</strong> Administradores têm controle total para modificar as escalas, motoristas e frota de ônibus. Leitores têm atualização constante em modo de visualização.
            </div>
          </form>

          {/* Side B: List of administrators */}
          <div className="md:col-span-7 space-y-4">
            <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider flex items-center gap-2">
              <span>Usuários com Acesso Autorizado</span>
              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/30 text-[9px] font-bold rounded-full text-amber-600 dark:text-amber-400">
                {2 + customAdmins.length} Ativos
              </span>
            </h4>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
              {/* Built-in 1: Admin */}
              <div className="p-3 bg-amber-500/5 dark:bg-amber-400/5 rounded-2xl border border-amber-305/20 dark:border-amber-400/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center">
                    <Shield size={14} />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-950 dark:text-white flex items-center gap-1.5">
                      <span>lideranca_admin</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 dark:bg-amber-900 border border-amber-300 dark:border-amber-700 font-extrabold text-[#7a5a04] dark:text-amber-300 rounded uppercase">Built-in</span>
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono">Administrador Master do Sistema</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#428131] font-bold">Nativo</span>
                </div>
              </div>

              {/* Built-in 2: Reader */}
              <div className="p-3 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-2xl border border-emerald-305/20 dark:border-emerald-400/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#032413] text-emerald-200 flex items-center justify-center">
                    <Lock size={14} />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-950 dark:text-white flex items-center gap-1.5">
                      <span>leitor_lideranca</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-900 border border-emerald-300 dark:border-emerald-800 font-extrabold text-[#115e34] dark:text-emerald-300 rounded uppercase">Built-in</span>
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono">Espelho de Trânsito para Consulta</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#428131] font-bold">Nativo</span>
                </div>
              </div>

              {/* Custom ones */}
              {customAdmins.map((adm) => (
                <div key={adm.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 group transition-all hover:bg-slate-100 dark:hover:bg-slate-900">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-900 text-slate-650 dark:text-slate-300 flex items-center justify-center">
                      {adm.role === 'admin' ? <Shield size={14} className="text-amber-500" /> : <Lock size={14} className="text-emerald-500" />}
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-950 dark:text-white">
                        {adm.username}
                      </h5>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Senha: <span className="text-slate-400 dark:text-slate-650 font-sans">•••</span> ({adm.password}) • {adm.createdAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-1.5 py-0.2 font-bold uppercase rounded ${
                      adm.role === 'admin' 
                        ? 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900' 
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-250 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900'
                    }`}>
                      {adm.role === 'admin' ? 'Administrador' : 'Leitor'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(adm.id, adm.username)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg opacity-80 hover:opacity-100 transition-all cursor-pointer dark:bg-rose-950/20 dark:hover:bg-rose-900/30"
                      title="Excluir Usuário"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {customAdmins.length === 0 && (
                <div className="text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
                  <p className="text-xs">Nenhum administrador customizado cadastrado ainda.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

const LoginPage = ({ onLogin, customAdmins }: { onLogin: (user: string) => void, customAdmins: CustomAdmin[] }) => {
  const [username, setUsername] = useState('lideranca_admin');
  const [password, setPassword] = useState('lideranca_tráfego');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'consulta'>('admin');

  useEffect(() => {
    if (selectedRole === 'admin') {
      setUsername('lideranca_admin');
      setPassword('lideranca_tráfego');
    } else {
      setUsername('leitor_lideranca');
      setPassword('lideranca_consulta');
    }
    setErrorMsg('');
  }, [selectedRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    
    // Check if there is a match in our customAdmins list
    const matchedCustomAdmin = customAdmins.find(
      (adm) => adm.username.trim().toLowerCase() === cleanUser
    );

    if (cleanUser === 'lideranca_admin' || cleanUser === 'admin') {
      if (password === 'lideranca_tráfego') {
        onLogin('lideranca_admin');
      } else {
        setErrorMsg('Senha incorreta para o perfil de Administrador.');
      }
    } else if (matchedCustomAdmin) {
      if (matchedCustomAdmin.password === password) {
        onLogin(matchedCustomAdmin.username);
      } else {
        setErrorMsg(`Senha incorreta para o usuário "${matchedCustomAdmin.username}".`);
      }
    } else if (cleanUser === 'leitor_lideranca' || cleanUser === 'lideranca_consulta' || cleanUser === 'consulta' || cleanUser === 'leitor') {
      if (password === 'lideranca_consulta' || password === 'consulta_tráfego' || password === 'lideranca_consulta_senha') {
        onLogin('leitor_lideranca');
      } else {
        setErrorMsg('Senha incorreta para o perfil de Consulta.');
      }
    } else {
      // Allow general fallback for testing
      onLogin(username);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950/95 flex items-center justify-center p-4 relative overflow-hidden text-slate-100">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#edd116]/25 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#1ea362]/40 rounded-full blur-3xl"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#05351c] border border-emerald-800/30 rounded-3xl p-8 relative z-10 shadow-2xl space-y-6"
      >
        <div className="flex flex-col items-center select-none">
          <BrandLogo size="lg" textColor="light" className="mb-2" />
          <p className="text-amber-400 text-[10px] font-bold uppercase tracking-[0.2em] font-mono text-center">Gestão Integrada de Tráfego</p>
        </div>

        {/* Perfil selector tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#032413] rounded-xl self-center border border-emerald-800/30">
          <button
            type="button"
            onClick={() => setSelectedRole('admin')}
            className={cn(
              "py-2 sm:py-2.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none",
              selectedRole === 'admin' 
                ? "bg-amber-400 text-slate-950 font-black shadow-md border border-amber-300/10" 
                : "text-emerald-300 hover:text-emerald-100"
            )}
          >
            <Shield size={12} />
            <span>Administrador</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('consulta')}
            className={cn(
              "py-2 sm:py-2.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none",
              selectedRole === 'consulta' 
                ? "bg-amber-400 text-slate-950 font-black shadow-md border border-amber-300/10" 
                : "text-emerald-300 hover:text-emerald-100"
            )}
          >
            <Lock size={12} />
            <span>Leitor Consulta</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-xl text-xs font-bold leading-relaxed text-center animate-pulse">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-1.5 ml-1">Nome de Usuário</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full pl-4 pr-4 py-3 bg-[#032413] border border-emerald-800/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400/20 text-white font-bold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-1.5 ml-1">Senha de Entrada</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-4 pr-4 py-3 bg-[#032413] border border-emerald-800/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400/20 text-white font-bold"
            />
          </div>

          <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-900/40 text-[11px] text-emerald-200 leading-relaxed font-mono">
            <strong>💡 Perfil:</strong> {selectedRole === 'admin' ? 'Acesso total de Administrador para criar, editar ou excluir de escalas, frotas e motoristas.' : 'Acesso de Leitor para carregar e acompanhar atualizações a cada 2 minutos.'}
          </div>

          <button 
            type="submit"
            className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl font-black shadow-lg shadow-amber-400/25 transition-all select-none cursor-pointer text-xs flex items-center justify-center gap-2"
          >
            {selectedRole === 'admin' ? <Shield size={14} /> : <Lock size={14} />}
            <span>Acessar como {selectedRole === 'admin' ? 'Administrador' : 'Leitor Consulta'}</span>
          </button>
        </form>

        <p className="text-center text-[10px] text-emerald-300/40 font-mono">
          Terminal Homologado ANTT • Grupo Liderança • Expresso Marly • JJ Tur v2.5
        </p>
      </motion.div>
    </div>
  );
};
