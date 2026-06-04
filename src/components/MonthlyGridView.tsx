import React, { useState, useMemo, useRef } from 'react';
import { APPROVED_ROUTES_DATA, RouteLine } from '../data/routesData';
import { getPdfGridCell } from '../data/pdfGridEngine';
import { BrandLogo } from './BrandLogo';
import { Scale } from './ScheduleView';
import { Vehicle } from '../data/fleetData';
import { Driver } from './DriversView';
import { 
  Printer, 
  ArrowLeft, 
  Search, 
  Download, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  X,
  Plus,
  RefreshCw,
  Clock,
  MapPin,
  Check,
  Edit2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MonthlyGridViewProps {
  fleet: Vehicle[];
  drivers: Driver[];
  scales: Scale[];
  onUpdateScales: (newScales: Scale[]) => void;
  onClose: () => void;
}

export function MonthlyGridView({ 
  fleet, 
  drivers, 
  scales, 
  onUpdateScales, 
  onClose 
}: MonthlyGridViewProps) {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(6); // Default specifically and strictly to June (6) as requested
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'ALL' | 'MARLY' | 'LIDERANÇA' | 'JJ TUR'>('ALL');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [printScope, setPrintScope] = useState<'all' | 'week' | 'single'>('all');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [printOrientation, setPrintOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [selectedPrintDay, setSelectedPrintDay] = useState<number>(() => {
    try {
      return new Date().getDate();
    } catch (e) {
      return 1;
    }
  });
  
  // Interactive cell selection for quick editing
  const [editingCell, setEditingCell] = useState<{
    route: RouteLine;
    day: number;
    currentPrefix: string;
    liveScaleId?: string;
  } | null>(null);

  // States inside cell-edit dialog
  const [editPrefix, setEditPrefix] = useState('');
  const [editDriver, setEditDriver] = useState('');

  // Spreadsheet-style inline editor states
  const [activeCellEditor, setActiveCellEditor] = useState<{
    routeId: string;
    day: number;
  } | null>(null);
  const [inlineValue, setInlineValue] = useState('');

  // Predefined lists of months
  const MONTHS = [
    { value: 1, name: "Janeiro" },
    { value: 2, name: "Fevereiro" },
    { value: 3, name: "Março" },
    { value: 4, name: "Abril" },
    { value: 5, name: "Maio" },
    { value: 6, name: "Junho" },
    { value: 7, name: "Julho" },
    { value: 8, name: "Agosto" },
    { value: 9, name: "Setembro" },
    { value: 10, name: "Outubro" },
    { value: 11, name: "Novembro" },
    { value: 12, name: "Dezembro" }
  ];

  // Calculate days in the selected month
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Generate array [1, 2, ... daysInMonth]
  const daysArray = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  // Generate array of visible days (for screen viewing and printing)
  const visibleDays = useMemo(() => {
    if (printScope === 'single') {
      const fixedDay = selectedPrintDay > daysInMonth ? 1 : selectedPrintDay;
      return [fixedDay];
    }
    if (printScope === 'week') {
      const start = (selectedWeek - 1) * 7 + 1;
      const end = Math.min(start + 6, daysInMonth);
      const arr = [];
      for (let i = start; i <= end; i++) {
        arr.push(i);
      }
      return arr;
    }
    return daysArray;
  }, [printScope, selectedPrintDay, selectedWeek, daysArray, daysInMonth]);

  // Safely clamp selectedPrintDay if it exceeds the number of days in the newly selected month/year
  React.useEffect(() => {
    if (selectedPrintDay > daysInMonth) {
      setSelectedPrintDay(1);
    }
  }, [daysInMonth, selectedPrintDay]);

  // Map to count how many times each vehicle prefix is scheduled on each day of the month
  const dailyPrefixCounts = useMemo(() => {
    const counts: Record<number, Record<string, number>> = {};
    daysArray.forEach(day => {
      counts[day] = {};
    });

    APPROVED_ROUTES_DATA.forEach(route => {
      daysArray.forEach(day => {
        const cell = getPdfGridCell(route, day, selectedMonth, selectedYear, scales);
        const p = cell.prefix ? cell.prefix.trim().toUpperCase() : '';
        if (p && p !== 'CANC.' && p !== 'XXXXXXX') {
          counts[day][p] = (counts[day][p] || 0) + 1;
        }
      });
    });

    return counts;
  }, [scales, selectedMonth, selectedYear, daysArray]);

  // Group approved routes exactly like the PDF sections layout
  const gridGroups = useMemo(() => {
    // 1. MARLY (origin = GOIÂNIA, brand = MARLY, not extra)
    const marlyRegular = APPROVED_ROUTES_DATA.filter(r => r.origin === 'GOIÂNIA' && r.category === 'MARLY' && !r.isExtra);
    
    // 2. EXTRA under MARLY (category === EXTRA, destination corresponds to marly routes e.g. Porangatu, Caldas Novas)
    const marlyExtra = APPROVED_ROUTES_DATA.filter(r => r.origin === 'GOIÂNIA' && r.category === 'EXTRA' && (r.destination === 'PORANGATU' || r.destination === 'CALDAS NOVAS' || r.destination === 'CATALÃO'));
    
    // 3. LIDERANÇA (origin = GOIÂNIA, brand = LIDERANÇA, not extra)
    const liderancaRegular = APPROVED_ROUTES_DATA.filter(r => r.origin === 'GOIÂNIA' && r.category === 'LIDERANÇA' && !r.isExtra);
    
    // 4. EXTRA under LIDERANÇA (category === EXTRA, destination corresponds to lideranca routes e.g. Palmas)
    const liderancaExtra = APPROVED_ROUTES_DATA.filter(r => r.origin === 'GOIÂNIA' && r.category === 'EXTRA' && r.destination === 'PALMAS');
    
    // 5. JJ TUR (origin = GOIÂNIA, brand = JJ TUR, not extra)
    const jjTurRegular = APPROVED_ROUTES_DATA.filter(r => r.origin === 'GOIÂNIA' && r.category === 'JJ TUR' && !r.isExtra);

    // Filter rest of municipal departures
    const municipalDepartures = APPROVED_ROUTES_DATA.filter(r => r.origin !== 'GOIÂNIA');
    
    // Group municipal departures by origin
    const originGroupsMap: Record<string, RouteLine[]> = {};
    municipalDepartures.forEach(r => {
      if (!originGroupsMap[r.origin]) {
        originGroupsMap[r.origin] = [];
      }
      originGroupsMap[r.origin].push(r);
    });

    const groupsList: {
      id: string;
      title: string;
      type: 'marly' | 'lideranca' | 'jjtur' | 'extra' | 'city';
      items: RouteLine[];
    }[] = [
      { id: 'g-marly', title: 'MARLY', type: 'marly', items: marlyRegular },
      { id: 'g-marly-ex', title: 'EXTRA', type: 'extra', items: marlyExtra },
      { id: 'g-lideranca', title: 'LIDERANÇA', type: 'lideranca', items: liderancaRegular },
      { id: 'g-lideranca-ex', title: 'EXTRA', type: 'extra', items: liderancaExtra },
      { id: 'g-jjtur', title: 'JJ TUR', type: 'jjtur', items: jjTurRegular },
    ];

    // Add municipal groups
    Object.keys(originGroupsMap).forEach(origin => {
      groupsList.push({
        id: `g-city-${origin.toLowerCase().replace(/\s+/g, '-')}`,
        title: origin,
        type: 'city' as const,
        items: originGroupsMap[origin]
      });
    });

    return groupsList;
  }, []);

  // Filter groups search queries in real time
  const filteredGridGroups = useMemo(() => {
    return gridGroups.map(group => {
      const filteredItems = group.items.filter(item => {
        if (activeCategoryFilter !== 'ALL' && group.type !== 'city' && group.type !== 'extra') {
          if (group.title !== activeCategoryFilter) return false;
        }
        
        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase();
          const matchesDest = item.destination.toLowerCase().includes(query);
          const matchesOrigin = item.origin.toLowerCase().includes(query);
          const matchesTime = item.time.includes(query);
          const matchesRouteNum = item.routeNumber?.includes(query);
          return matchesDest || matchesOrigin || matchesTime || matchesRouteNum;
        }
        return true;
      });

      return {
        ...group,
        items: filteredItems
      };
    }).filter(group => group.items.length > 0);
  }, [gridGroups, searchQuery, activeCategoryFilter]);

  // Flat list of visible route ids for cell arrow navigation
  const flatRouteIds = useMemo(() => {
    const ids: string[] = [];
    filteredGridGroups.forEach(group => {
      group.items.forEach(route => {
        ids.push(route.id);
      });
    });
    return ids;
  }, [filteredGridGroups]);

  // Track if we are programmatically navigating to avoid race condition with onBlur
  const isNavigatingRef = useRef(false);

  const navigateToCell = (currentRoute: RouteLine, currentDay: number, direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'TAB' | 'SHIFT-TAB') => {
    const curRouteIdx = flatRouteIds.indexOf(currentRoute.id);
    if (curRouteIdx === -1) return;

    let nextRouteId = currentRoute.id;
    let nextDay = currentDay;

    if (direction === 'UP') {
      if (curRouteIdx > 0) {
        nextRouteId = flatRouteIds[curRouteIdx - 1];
      }
    } else if (direction === 'DOWN') {
      if (curRouteIdx < flatRouteIds.length - 1) {
        nextRouteId = flatRouteIds[curRouteIdx + 1];
      }
    } else if (direction === 'LEFT' || direction === 'SHIFT-TAB') {
      const idxInVisibleDays = visibleDays.indexOf(currentDay);
      if (idxInVisibleDays > 0) {
        nextDay = visibleDays[idxInVisibleDays - 1];
      } else if (curRouteIdx > 0) {
        nextRouteId = flatRouteIds[curRouteIdx - 1];
        nextDay = visibleDays[visibleDays.length - 1];
      }
    } else if (direction === 'RIGHT' || direction === 'TAB') {
      const idxInVisibleDays = visibleDays.indexOf(currentDay);
      if (idxInVisibleDays < visibleDays.length - 1) {
        nextDay = visibleDays[idxInVisibleDays + 1];
      } else if (curRouteIdx < flatRouteIds.length - 1) {
        nextRouteId = flatRouteIds[curRouteIdx + 1];
        nextDay = visibleDays[0];
      }
    }

    if (nextRouteId !== currentRoute.id || nextDay !== currentDay) {
      const nextRouteObj = APPROVED_ROUTES_DATA.find(r => r.id === nextRouteId);
      if (nextRouteObj) {
        isNavigatingRef.current = true;
        const nextCell = getPdfGridCell(nextRouteObj, nextDay, selectedMonth, selectedYear, scales);
        setActiveCellEditor({ routeId: nextRouteId, day: nextDay });
        setInlineValue(nextCell.prefix || '');
      }
    }
  };

  // Operational metrics for the chosen month and filtered routes
  const stats = useMemo(() => {
    let totalAssigned = 0;
    const uniqueVehicles = new Set<string>();
    const uniqueDrivers = new Set<string>();
    let totalSlots = 0;
    
    filteredGridGroups.forEach(group => {
      group.items.forEach(route => {
        daysArray.forEach(day => {
          totalSlots++;
          const cell = getPdfGridCell(route, day, selectedMonth, selectedYear, scales);
          const p = cell.prefix ? cell.prefix.trim().toUpperCase() : '';
          if (p && p !== 'CANC.' && p !== 'XXXXXXX') {
            totalAssigned++;
            uniqueVehicles.add(p);
            if (cell.driver && cell.driver.trim() !== '') {
              uniqueDrivers.add(cell.driver.trim());
            }
          }
        });
      });
    });

    const fillRate = totalSlots > 0 ? Math.round((totalAssigned / totalSlots) * 100) : 0;

    return {
      totalAssigned,
      activeVehiclesCount: uniqueVehicles.size,
      activeDriversCount: uniqueDrivers.size,
      fillRate,
      totalSlots
    };
  }, [filteredGridGroups, daysArray, selectedMonth, selectedYear, scales]);

  // Save inline value typed directly from the monthly grid cells
  const handleInlineSave = (route: RouteLine, day: number, newVal: string, liveScaleId: string | undefined): boolean => {
    const mm = selectedMonth < 10 ? `0${selectedMonth}` : `${selectedMonth}`;
    const dd = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${selectedYear}-${mm}-${dd}`;

    const normalizedPrefix = newVal.trim().toUpperCase();

    const isSpecial = normalizedPrefix === '' || normalizedPrefix === 'CANC.' || normalizedPrefix === 'XXXXXXX';
    const exists = fleet.some(v => v.prefix.toUpperCase() === normalizedPrefix);

    if (!isSpecial && !exists) {
      alert(`O prefixo "${newVal}" não está cadastrado na relação de frota!`);
      return false;
    }

    if (!isSpecial) {
      // Check for simultaneous double booking conflict
      const sameTimeClash = scales.find(s => 
        s.date === dateStr && 
        s.busPrefix && s.busPrefix.trim().toUpperCase() === normalizedPrefix && 
        s.id !== liveScaleId &&
        s.time === route.time
      );
      if (sameTimeClash) {
        alert(`[BLOQUEIO DE DUPLICIDADE SIMULTÂNEA] O veículo ${normalizedPrefix} já está cadastrado no dia ${dd}/${mm}/${selectedYear} às ${route.time}! (Rota: ${sameTimeClash.line}). Não é permitido escalar o mesmo veículo simultaneamente.`);
        return false;
      }

      // Check max 2 per day safety threshold limit
      const allocatedCount = scales.filter(s => 
        s.date === dateStr && 
        s.busPrefix && s.busPrefix.trim().toUpperCase() === normalizedPrefix && 
        s.id !== liveScaleId
      ).length;
      if (allocatedCount >= 2) {
        const matches = scales.filter(s => 
          s.date === dateStr && 
          s.busPrefix && s.busPrefix.trim().toUpperCase() === normalizedPrefix && 
          s.id !== liveScaleId
        );
        alert(`[BLOQUEIO DE SEGURANÇA] O carro ${normalizedPrefix} já está escalado 02 vezes neste mesmo dia (${dd}/${mm}/${selectedYear}) nas seguintes rotas:\n${matches.map(s => `• ${s.line} às ${s.time}`).join('\n')}\n\nPara garantir a segurança operacional e evitar fadiga, limite operacional de 2 turnos por dia por veículo foi atingido.`);
        return false;
      }
    }

    const matchedVehicle = fleet.find(v => v.prefix.toUpperCase() === normalizedPrefix);
    const busPlate = matchedVehicle ? matchedVehicle.plate : "---";
    const defaultDriver = "Motorista de Linha Regulamentar";

    if (liveScaleId) {
      const updated = scales.map(s => {
        if (s.id === liveScaleId) {
          const currentDriver = s.driverName || defaultDriver;
          return {
            ...s,
            busPrefix: normalizedPrefix,
            busPlate,
            driverName: normalizedPrefix === '' ? '' : currentDriver
          };
        }
        return s;
      });
      onUpdateScales(updated);
    } else {
      const newScale: Scale = {
        id: `S-MOD-${Date.now()}-${day}`,
        driverName: normalizedPrefix === '' ? '' : defaultDriver,
        line: `${route.origin} x ${route.destination}`,
        date: dateStr,
        time: route.time,
        busPrefix: normalizedPrefix,
        busPlate,
        classification: route.serviceType,
        isExtra: route.isExtra,
        routeId: route.id
      };
      onUpdateScales([...scales, newScale]);
    }

    return true;
  };

  // Open edit slideover
  const handleCellClick = (route: RouteLine, day: number, cellInfo: any) => {
    setEditingCell({
      route,
      day,
      currentPrefix: cellInfo.prefix,
      liveScaleId: cellInfo.id
    });
    setEditPrefix(cellInfo.prefix === 'XXXXXXX' || cellInfo.prefix === 'CANC.' ? '' : cellInfo.prefix);
    
    // Fill in existing driver if live, or default empty
    if (cellInfo.isLive && cellInfo.driver) {
      setEditDriver(cellInfo.driver);
    } else {
      setEditDriver('');
    }
  };

  // Save edited scale cell
  const handleSaveCell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCell) return;

    const { route, day, liveScaleId } = editingCell;
    const mm = selectedMonth < 10 ? `0${selectedMonth}` : `${selectedMonth}`;
    const dd = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${selectedYear}-${mm}-${dd}`;

    const normalizedPrefix = editPrefix.trim().toUpperCase();

    // Verification check: don't allow scaled fleet that is NOT in the relation
    const isSpecial = normalizedPrefix === '' || normalizedPrefix === 'CANC.' || normalizedPrefix === 'XXXXXXX';
    const exists = fleet.some(v => v.prefix.toUpperCase() === normalizedPrefix);

    if (!isSpecial && !exists) {
      alert(`O prefixo "${editPrefix}" não está cadastrado na relação de frota!`);
      return;
    }

    // Prevention of double-booking in Monthly Grid - allow up to 2, block on 3rd
    if (!isSpecial) {
      // Check for exact same time simultaneous schedule conflict
      const sameTimeClash = scales.find(s => 
        s.date === dateStr && 
        s.busPrefix && s.busPrefix.trim().toUpperCase() === normalizedPrefix && 
        s.id !== liveScaleId &&
        s.time === route.time
      );
      if (sameTimeClash) {
        alert(`[BLOQUEIO DE DUPLICIDADE SIMULTÂNEA] O veículo ${normalizedPrefix} já está cadastrado no dia ${dd}/${mm}/${selectedYear} às ${route.time}! (Rota: ${sameTimeClash.line}). Não é permitido escalar o mesmo veículo simultaneamente.`);
        return;
      }

      const allocatedCount = scales.filter(s => 
        s.date === dateStr && 
        s.busPrefix && s.busPrefix.trim().toUpperCase() === normalizedPrefix && 
        s.id !== liveScaleId
      ).length;
      if (allocatedCount >= 2) {
        const matches = scales.filter(s => 
          s.date === dateStr && 
          s.busPrefix && s.busPrefix.trim().toUpperCase() === normalizedPrefix && 
          s.id !== liveScaleId
        );
        alert(`[BLOQUEIO DE SEGURANÇA] O carro ${normalizedPrefix} já está escalado 02 vezes neste mesmo dia (${dd}/${mm}/${selectedYear}) nas seguintes rotas:\n${matches.map(s => `• ${s.line} às ${s.time}`).join('\n')}\n\nPara garantir a segurança operacional e evitar fadiga, limite operacional de 2 turnos por dia por veículo foi atingido.`);
        return;
      }
    }

    // Get vehicle plates
    const matchedVehicle = fleet.find(v => v.prefix.toUpperCase() === normalizedPrefix);
    const busPlate = matchedVehicle ? matchedVehicle.plate : "---";

    const defaultDriver = editDriver ? editDriver : "Motorista de Linha Regulamentar";

    if (liveScaleId) {
      // Update existing live scale
      const updated = scales.map(s => {
        if (s.id === liveScaleId) {
          return {
            ...s,
            busPrefix: normalizedPrefix,
            busPlate,
            driverName: defaultDriver
          };
        }
        return s;
      });
      onUpdateScales(updated);
    } else {
      // Create new live scale to override fallback
      const newScale: Scale = {
        id: `S-MOD-${Date.now()}-${day}`,
        driverName: defaultDriver,
        line: `${route.origin} x ${route.destination}`,
        date: dateStr,
        time: route.time,
        busPrefix: normalizedPrefix,
        busPlate,
        classification: route.serviceType,
        isExtra: route.isExtra,
        routeId: route.id
      };
      onUpdateScales([...scales, newScale]);
    }

    setEditingCell(null);
  };

  // Excluir Frota / Deixar Vazio
  const handleRemoveFleet = () => {
    if (!editingCell) return;

    const { liveScaleId, route, day } = editingCell;
    const mm = selectedMonth < 10 ? `0${selectedMonth}` : `${selectedMonth}`;
    const dd = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${selectedYear}-${mm}-${dd}`;

    if (liveScaleId) {
      const updated = scales.map(s => {
        if (s.id === liveScaleId) {
          return {
            ...s,
            busPrefix: "",
            busPlate: "---",
            driverName: ""
          };
        }
        return s;
      });
      onUpdateScales(updated);
    } else {
      const newScale: Scale = {
        id: `S-MOD-${Date.now()}-${day}`,
        driverName: "",
        line: `${route.origin} x ${route.destination}`,
        date: dateStr,
        time: route.time,
        busPrefix: "",
        busPlate: "---",
        classification: route.serviceType,
        isExtra: route.isExtra,
        routeId: route.id
      };
      onUpdateScales([...scales, newScale]);
    }

    setEditingCell(null);
  };

  // Clear live scale override to restore cancelled slot or natural fallback
  const handleClearCell = () => {
    if (!editingCell) return;

    const { liveScaleId, route, day } = editingCell;

    const mm = selectedMonth < 10 ? `0${selectedMonth}` : `${selectedMonth}`;
    const dd = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${selectedYear}-${mm}-${dd}`;
    
    // Filter out existing scale to overwrite it as CANC.
    const filteredScales = liveScaleId ? scales.filter(s => s.id !== liveScaleId) : scales;
    
    const canceledScale: Scale = {
      id: `S-MOD-${Date.now()}-${day}`,
      driverName: "CANC.",
      line: `${route.origin} x ${route.destination}`,
      date: dateStr,
      time: route.time,
      busPrefix: "CANC.",
      busPlate: "---",
      classification: route.serviceType,
      isExtra: route.isExtra,
      routeId: route.id
    };
    
    onUpdateScales([...filteredScales, canceledScale]);
    setEditingCell(null);
  };

  // Handle month click navigation
  const prevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  // Standalone offline HTML sheet downloader specifically for Chrome and high-quality printing/archiving
  const handleDownload = () => {
    const docElement = document.getElementById('monthly-grid-document');
    if (!docElement) return;

    // Get table HTML
    const documentHtml = docElement.outerHTML;
    
    // Create reference names
    const monthName = MONTHS.find(m => m.value === selectedMonth)?.name || 'mes';
    const filename = `escala_${monthName.toLowerCase()}_${selectedYear}${printScope === 'single' ? `_dia_${selectedPrintDay}` : ''}.html`;

    // Embed Tailwind CSS, print sheets, and offline support styles so Chrome parses it beautifully in premium resolution
    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Escala Comercial - ${monthName.toUpperCase()} / ${selectedYear}</title>
  <!-- Google Fonts for premium executive styling -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <!-- Tailwind CSS loaded safely via CDN to render offline exactly as the workspace -->
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      background-color: #f8fafc;
      color: #0f172a;
      font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
      padding: 30px;
      margin: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Ensure borders render crisp and dark like ink */
    table, th, td {
      border: 1px solid #cbd5e1 !important; /* light elegant borders */
    }

    #monthly-grid-document {
      background: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 12px;
      box-shadow: 0 4px 20px -2px rgba(0,0,0,0.06);
    }

    #download-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #022c22; /* rich dark emerald */
      color: #f8fafc;
      padding: 16px 28px;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      border: 1px solid #064e3b;
      font-family: sans-serif;
    }

    #btn-print {
      background: #fbbf24;
      color: #022c22;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 900;
      cursor: pointer;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      transition: all 0.2s ease;
      box-shadow: 0 4px 6px -1px rgba(251, 191, 36, 0.2);
    }
    #btn-print:hover {
      background: #f59e0b;
      transform: translateY(-1px);
    }

    @media print {
      body {
        background-color: white !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      #download-toolbar {
        display: none !important;
      }
      #monthly-grid-document {
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
        width: 100% !important;
        max-width: 100% !important;
        zoom: ${printOrientation === 'landscape' ? '65%' : '50%'} !important;
      }
      @page {
        size: ${printOrientation};
        margin: 5mm;
      }
    }
  </style>
</head>
<body>
  <div id="download-toolbar" class="no-print">
    <div>
      <h3 style="margin: 0; font-size: 13px; font-weight: 800; color: #fbbf24;">SISTEMA DE ESCALAS • GRUPO LIDERANÇA / MARLY</h3>
      <p style="margin: 2px 0 0 0; font-size: 10px; color: #a7f3d0;">Gerada em ${new Date().toLocaleDateString('pt-BR')} • Forço de Impressão Otimizado em Modo ${printOrientation === 'landscape' ? 'Paisagem' : 'Retrato'}</p>
    </div>
    <button id="btn-print" onclick="window.print()">
      🖨️ IMPRIMIR / SALVAR COMO PDF EM ${printOrientation === 'landscape' ? 'PAISAGEM' : 'RETRATO'}
    </button>
  </div>

  <div style="font-size: 11px;">
    ${documentHtml}
  </div>
</body>
</html>`;

    // Trigger local Chrome download blob
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="monthly-grid-root" className="fixed inset-0 z-50 overflow-y-auto bg-[#032413] flex flex-col no-print select-none text-white font-sans antialiased">
      {/* Dynamic Header Non-Print Section */}
      <div className="bg-[#042a16] p-4 border-b border-emerald-900/35 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2.5 bg-[#032413] hover:bg-[#05351c] text-amber-400 rounded-xl transition-all cursor-pointer border border-emerald-800/40 shadow-sm active:scale-95"
            title="Voltar à Escala Diária"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.2 text-[9px] bg-amber-400 text-slate-950 font-black tracking-widest rounded-full uppercase">PDF v2.6</span>
              <h1 className="text-sm md:text-base font-black tracking-tight uppercase">Grade Comercial Mensal de Tráfego</h1>
            </div>
            <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wide">Modelo Fiel ao Documento Impresso Oficial da ANTT</p>
          </div>
        </div>

        {/* Date Navigator slider with Month and Year Selectors */}
        <div className="flex items-center gap-2 bg-[#032413] border border-emerald-800/30 px-2.5 py-1 rounded-xl shadow-inner">
          <button 
            type="button" 
            onClick={prevMonth}
            className="p-1.5 hover:bg-[#05351c] text-emerald-350 hover:text-white cursor-pointer transition-colors rounded-lg"
            title="Mês Anterior"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="flex items-center gap-1.5 font-black text-xs select-none tracking-wider">
            <Calendar size={13} className="text-amber-400 mx-1 shrink-0" />
            
            {/* Seletor de Meses */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-[#042a16] text-[#fcb034] text-[11px] font-black border border-emerald-800/40 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400/50 uppercase cursor-pointer px-2 py-1"
              title="Seletor de Meses"
            >
              {MONTHS.map(m => (
                <option key={m.value} value={m.value} className="bg-[#032413] text-white">
                  {m.name.toUpperCase()}
                </option>
              ))}
            </select>

            {/* Seletor de Ano */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-[#042a16] text-amber-400 text-[11px] font-black border border-emerald-800/40 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400/50 uppercase cursor-pointer px-2 py-1"
              title="Seletor de Ano"
            >
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                <option key={y} value={y} className="bg-[#032413] text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button 
            type="button" 
            onClick={nextMonth}
            className="p-1.5 hover:bg-[#05351c] text-emerald-350 hover:text-white cursor-pointer transition-colors rounded-lg"
            title="Próximo Mês"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Action controllers */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Zoom Level controller */}
          <div className="flex items-center bg-[#032413] border border-emerald-800/30 rounded-xl px-2.5 py-1.5 text-xs font-bold shadow-md">
            <span className="text-[10px] text-emerald-300/80 mr-2 uppercase font-mono">ZOOM</span>
            <input 
              type="range" 
              min="50" 
              max="150" 
              step="5"
              value={zoomLevel} 
              onChange={(e) => setZoomLevel(Number(e.target.value))} 
              className="w-18 md:w-24 accent-amber-450 opacity-80 hover:opacity-100 transition-opacity cursor-pointer mr-2.5" 
            />
            <span className="text-[10px] font-mono min-w-[32px] text-right text-emerald-250">{zoomLevel}%</span>
          </div>

          {/* Scope selection */}
          <div className="flex items-center gap-2 bg-[#032413] border border-emerald-800/30 rounded-xl px-3 py-1.5 text-xs font-bold shadow-md">
            <span className="text-[10px] text-emerald-300/80 uppercase">Escopo:</span>
            <select
              value={printScope}
              onChange={(e) => setPrintScope(e.target.value as 'all' | 'week' | 'single')}
              className="bg-[#042a16] text-amber-400 text-[11px] font-black border border-emerald-800/40 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400/50 uppercase cursor-pointer"
            >
              <option value="all">Mês Todo 📅</option>
              <option value="week">Semanal (7 d) 🗓️</option>
              <option value="single">Diário (1 d) 🔍</option>
            </select>

            {printScope === 'week' && (
              <div className="flex items-center gap-1 border-l border-emerald-800/40 pl-2 ml-1">
                <span className="text-[10px] text-emerald-300/80 uppercase">Semana:</span>
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(Number(e.target.value))}
                  className="bg-[#042a16] text-amber-400 text-xs font-mono font-extrabold border border-emerald-800/40 rounded p-1 focus:outline-none w-28 cursor-pointer"
                >
                  <option value={1}>Semana 1 (1-7)</option>
                  <option value={2}>Semana 2 (8-14)</option>
                  <option value={3}>Semana 3 (15-21)</option>
                  <option value={4}>Semana 4 (22-28)</option>
                  {daysInMonth >= 29 && <option value={5}>Semana 5 (29-{daysInMonth})</option>}
                </select>
              </div>
            )}

            {printScope === 'single' && (
              <div className="flex items-center gap-1 border-l border-emerald-800/40 pl-2 ml-1">
                <span className="text-[10px] text-emerald-300/80 uppercase">Dia:</span>
                <select
                  value={selectedPrintDay}
                  onChange={(e) => setSelectedPrintDay(Number(e.target.value))}
                  className="bg-[#042a16] text-amber-400 text-xs font-mono font-extrabold border border-emerald-800/40 rounded p-1 focus:outline-none w-14 cursor-pointer"
                >
                  {daysArray.map(d => (
                    <option key={d} value={d}>
                      {d < 10 ? `0${d}` : d}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Formato Selection */}
          <div className="flex items-center gap-2 bg-[#032413] border border-emerald-800/30 rounded-xl px-3 py-1.5 text-xs font-bold shadow-md">
            <span className="text-[10px] text-emerald-300/80 uppercase">Orientação:</span>
            <select
              value={printOrientation}
              onChange={(e) => setPrintOrientation(e.target.value as 'landscape' | 'portrait')}
              className="bg-[#042a16] text-amber-400 text-[11px] font-black border border-emerald-800/40 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400/50 uppercase cursor-pointer"
              title="Orientação da página para o arquivo de impressão"
            >
              <option value="landscape">Paisagem 📐</option>
              <option value="portrait">Retrato 📄</option>
            </select>
          </div>

          <button 
            onClick={handleDownload}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-400/10 transition-all cursor-pointer active:scale-95"
            title={printScope === 'all' ? "Baixar a grade de todo o mês em formato HTML para o Chrome" : `Baixar apenas a escala do dia ${selectedPrintDay < 10 ? '0' + selectedPrintDay : selectedPrintDay}`}
          >
            <Download size={13} />
            <span>
              {printScope === 'all' ? 'Baixar Grade Comercial' : `Baixar Dia ${selectedPrintDay < 10 ? '0' + selectedPrintDay : selectedPrintDay}`}
            </span>
          </button>
        </div>
      </div>

      {/* Filter and Quick Helper Bar */}
      <div className="bg-[#032413] p-3 px-4 border-b border-emerald-900/35 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-bold grow-0 shrink-0">
        <div className="flex items-center gap-1.5 bg-[#042a16] p-1.5 rounded-xl border border-emerald-800/35 w-full md:w-auto">
          <Search size={14} className="text-emerald-400/80 ml-2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar Destino, Linha, Partida..."
            className="bg-transparent text-white placeholder-emerald-450 focus:outline-none w-full md:w-64 border-0 p-1 px-1.5 ml-1 font-bold"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="p-1 hover:bg-[#05351c] rounded text-emerald-300"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-emerald-300/80 font-bold uppercase tracking-widest mr-1.5 font-mono">Filtro Rápido:</span>
          {['ALL', 'MARLY', 'LIDERANÇA', 'JJ TUR'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeCategoryFilter === cat 
                  ? 'bg-amber-400 text-slate-950 shadow-md transform scale-102 font-black list-shadow' 
                  : 'bg-[#042a16] hover:bg-[#05351c] text-emerald-100 hover:text-white border border-emerald-800/30'
              }`}
            >
              {cat === 'ALL' ? 'VER TUDO' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="flex items-center gap-3 text-[10px] bg-[#042a16] border border-emerald-800/30 px-3 py-1.5 rounded-xl text-emerald-250">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span> Escala Programada</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#032413] border border-emerald-800/20 rounded-sm"></span> Horário Vago</span>
          </div>

          <button
            onClick={() => {
              if (window.confirm("Deseja realmente limpar TODAS as customizações de escala e começar do zero?")) {
                onUpdateScales([]);
              }
            }}
            className="px-3 py-1.5 bg-rose-955/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border border-rose-800/30 rounded-xl text-[10px] font-black cursor-pointer transition-all active:scale-95 flex items-center gap-1"
            title="Limpar todas as escalas programadas e começar do zero"
          >
            <Trash2 size={12} />
            <span>Limpar Todas as Escalas</span>
          </button>
        </div>
      </div>

      {/* Grid Canvas Wrapper */}
      <div className="flex-1 bg-[#032413] p-6 overflow-auto scrollbar-thin flex justify-start items-start">
        <div 
          id="monthly-grid-document"
          className="bg-white text-slate-900 border border-slate-300 p-8 shadow-2xl rounded-lg font-sans mx-auto transition-all duration-150 origin-top-left"
          style={{ 
            color: '#1e293b',
            zoom: `${zoomLevel}%`,
            width: '100%',
            maxWidth: '100%',
            overflowX: 'visible'
          } as React.CSSProperties}
        >
          {/* Header Identical to PDF - Customized with brand colors and Logo */}
          <div className="border-b-4 border-[#05351c] pb-4 mb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <BrandLogo size="md" textColor="dark" className="border-0 bg-transparent p-0 shadow-none dark:bg-transparent dark:border-0" />
              <div>
                <h1 className="text-lg md:text-xl font-black text-[#05351c] tracking-tight uppercase leading-none">EXPRESSO MARLY &amp; GRUPO LIDERANÇA</h1>
                <p className="text-[10px] font-mono tracking-widest text-[#05351c]/70 font-bold uppercase mt-1 leading-none">
                  SISTEMA INTEGRADO DE ESCALAS • GRADE MENSAL DE TRÁFEGO
                </p>
                <p className="text-[8px] text-slate-500 italic mt-0.5">Autorização Integrada Regulamentar ANTT • Horários Homologados</p>
              </div>
            </div>
            
            <div className="text-right font-mono text-[9px] text-slate-700 bg-emerald-50/45 p-2.5 rounded-lg border border-emerald-250 font-bold leading-normal">
              <p className="text-[#05351c] font-black">DOCUMENTO: GRADE-MENSAL-COMERCIAL</p>
              <p>MÊS DE REFERÊNCIA: <span className="font-extrabold text-amber-600">{MONTHS.find(m => m.value === selectedMonth)?.name.toUpperCase()} / {selectedYear}</span></p>
              <p>UTM DATA: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Real-time statistics indicator bar (Beautiful and Functional) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5 border border-slate-200 bg-slate-50 p-3 rounded-xl text-slate-800">
            <div className="flex items-center gap-3 p-1 px-2 border-r border-slate-200">
              <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg">
                <Calendar size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-black tracking-wider text-slate-400 font-mono">Partidas Ativas</span>
                <span className="text-xs font-black text-[#05351c] font-mono mt-0.5">
                  {stats.totalAssigned} <span className="text-[9px] font-normal text-slate-500">/ {stats.totalSlots} slots</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-1 px-2 border-r border-slate-200">
              <div className="p-2 bg-blue-50 text-blue-800 rounded-lg">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-black tracking-wider text-slate-400 font-mono">Frota Operando</span>
                <span className="text-xs font-black text-blue-900 font-mono mt-0.5">
                  {stats.activeVehiclesCount} <span className="text-[9px] font-normal text-slate-500">carros ativos</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-1 px-2 border-r border-slate-200">
              <div className="p-2 bg-indigo-50 text-indigo-800 rounded-lg">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-black tracking-wider text-slate-400 font-mono">Condutores Prontos</span>
                <span className="text-xs font-black text-indigo-900 font-mono mt-0.5">
                  {stats.activeDriversCount} <span className="text-[9px] font-normal text-slate-500">fichados</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-1 px-2">
              <div className="p-2 bg-amber-50 text-amber-800 rounded-lg">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-black tracking-wider text-slate-400 font-mono">Preenchimento Escala</span>
                <span className="text-xs font-black text-amber-700 font-mono mt-0.5">
                  {stats.fillRate}% <span className="text-[9px] font-normal text-slate-500">completo</span>
                </span>
              </div>
            </div>
          </div>

          {/* Core Table Grid with Dynamic Headers */}
          <div className="overflow-x-auto border-2 border-[#05351c] rounded shadow-sm">
            <table className={`min-w-max border-collapse text-[9px] text-[#05351c] leading-none ${
              printScope === 'single' ? 'w-auto' : 'w-full'
            }`}>
              <thead>
                {/* Headers */}
                <tr className="bg-[#05351c] text-white font-extrabold text-center uppercase tracking-wider border-b-2 border-[#032413] text-[8px]">
                  <th className="p-1 px-2 border-r border-slate-400 w-10 text-center font-black bg-[#032413] text-amber-300">#</th>
                  <th className="p-1 border-r border-slate-400 w-11 text-center font-black bg-[#032413] text-white">PARTIDA</th>
                  <th className="p-1 border-r border-slate-400 text-left px-2 font-black bg-[#032413] w-44 text-white">ORIGEM ➔ DESTINO</th>
                  
                  {/* Days columns headers */}
                  {visibleDays.map(dayNum => {
                    const dayFormatted = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                    const monthFormatted = selectedMonth < 10 ? `0${selectedMonth}` : `${selectedMonth}`;
                    return (
                      <th 
                        key={dayNum} 
                        className="p-1 border-r border-slate-400 font-black text-center text-white bg-[#05351c] min-w-[32px] max-w-[36px]"
                      >
                        {dayFormatted}/{monthFormatted}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-450 select-none">
                {filteredGridGroups.map((group) => {
                  // Colored header representing the company brand or origin municipality
                  let headerBg = 'bg-slate-200 text-slate-900';
                  if (group.type === 'marly') headerBg = 'bg-[#105d38] text-white font-black';
                  if (group.type === 'lideranca') headerBg = 'bg-[#05351c] text-amber-300 font-black border-y border-[#032413]';
                  if (group.type === 'jjtur') headerBg = 'bg-[#c1950e] text-white font-black';
                  if (group.type === 'extra') headerBg = 'bg-emerald-950 text-[#fffbeb] font-black border-y border-emerald-900';
                  if (group.type === 'city') headerBg = 'bg-amber-400 text-slate-950 font-black uppercase border-t-2 border-b-2 border-[#05351c]';

                  return (
                    <React.Fragment key={group.id}>
                      {/* Sub-Header Group Row */}
                      <tr className={`${headerBg} tracking-wider`}>
                        <td 
                          colSpan={3 + visibleDays.length} 
                          className="p-2 font-black text-[10px] text-left uppercase px-3 shadow-inner"
                        >
                          {group.type === 'city' ? `SAÍDAS DE: ${group.title}` : `LINHA DA EMPRESA: ${group.title} v2.5`}
                        </td>
                      </tr>

                      {/* Items of Group */}
                      {group.items.map((route) => {
                        // Create deterministic index line
                        const idxLabel = route.routeNumber || '--';

                        return (
                          <tr 
                            key={route.id} 
                            className="hover:bg-slate-50 transition-colors odd:bg-white even:bg-slate-50/50"
                          >
                            {/* Metadata */}
                            <td className="p-1 pt-1.5 pb-1.5 border-r border-slate-400 text-center font-bold bg-slate-200/50 text-slate-850 w-10 shrink-0">{idxLabel}</td>
                            <td className="p-1 border-r border-slate-400 text-center font-black bg-emerald-50/15 text-emerald-950 w-11 shrink-0">{route.time}</td>
                            <td className="p-1 px-2 border-r border-slate-400 font-extrabold text-slate-950 w-44 whitespace-nowrap overflow-hidden text-ellipsis leading-tight tracking-tight" title={`${route.origin} ➔ ${route.destination}`}>
                              {route.origin} ➔ {route.destination}
                            </td>

                            {/* Calendar columns mapping vehicle assign prefixes */}
                            {visibleDays.map((dayNum) => {
                              const cell = getPdfGridCell(route, dayNum, selectedMonth, selectedYear, scales);
                              
                              const hasPrefix = cell.prefix && cell.prefix.trim() !== '';
                              const isCanceled = cell.prefix === 'XXXXXXX' || cell.prefix === 'CANC.';
                              const isLive = cell.isLive;

                              // 1. Check if vehicle is in maintenance
                              const isMaintenance = !isCanceled && hasPrefix && fleet.some(v => 
                                v.prefix.toUpperCase() === cell.prefix.trim().toUpperCase() && 
                                v.statusOperacional === 'MANUTENÇÃO'
                              );

                              // 2. Check if vehicle is duplicate booked on that day
                              const isDoubleBooked = !isCanceled && hasPrefix && dailyPrefixCounts[dayNum]?.[cell.prefix.trim().toUpperCase()] > 1;

                              let cellBgClass = 'text-slate-900 bg-white hover:bg-amber-50 cursor-pointer';
                              let titleBadge = '';

                              if (isCanceled) {
                                cellBgClass = 'bg-red-100 text-red-700 font-black hover:bg-red-250 cursor-pointer border border-red-400';
                                titleBadge = ' [Cancelado]';
                              } else if (isMaintenance) {
                                cellBgClass = 'bg-red-600 text-white font-black hover:bg-red-700 border border-red-700 cursor-pointer';
                                titleBadge = ' [⚠️ EM MANUTENÇÃO]';
                              } else if (isDoubleBooked) {
                                cellBgClass = 'bg-amber-200 text-amber-950 font-black hover:bg-amber-300 border border-amber-500 cursor-pointer';
                                titleBadge = ' [⚠️ DUPLICADO NO DIA]';
                              } else if (isLive && hasPrefix) {
                                cellBgClass = 'bg-emerald-100 font-black text-emerald-950 shadow-inner ring-1 ring-emerald-500/30 hover:bg-emerald-200 cursor-pointer';
                                titleBadge = ' [Programado]';
                              } else if (hasPrefix) {
                                cellBgClass = 'bg-slate-50 text-slate-800 font-medium hover:bg-slate-200 cursor-pointer border border-slate-350';
                              }

                              const isEditingThisCell = activeCellEditor?.routeId === route.id && activeCellEditor?.day === dayNum;

                              return (
                                <td
                                  key={dayNum}
                                  onClick={(e) => {
                                    if (!isEditingThisCell) {
                                      setActiveCellEditor({ routeId: route.id, day: dayNum });
                                      setInlineValue(cell.prefix || '');
                                    }
                                  }}
                                  onDoubleClick={() => {
                                    handleCellClick(route, dayNum, cell);
                                  }}
                                  className={`border-r border-slate-400 text-center font-mono font-medium text-[8.5px] transition-all min-w-[32px] max-w-[36px] relative select-none ${
                                    isEditingThisCell ? 'p-0 ring-2 ring-amber-500 ring-inset bg-amber-50 z-20 shadow-lg' : `p-1 cursor-pointer ${cellBgClass}`
                                  }`}
                                  style={{ height: '32px' }}
                                  title={`[Clique Simples] Digitar Carro • [Duplo Clique] Editar Detalhes\nDia ${dayNum} - ${route.time} de ${route.origin} para ${route.destination}\nCarro: ${cell.prefix || 'Vago'}${cell.driver ? `\nMotorista: ${cell.driver}` : ''}${titleBadge}`}
                                >
                                  {isEditingThisCell ? (
                                    <input
                                      type="text"
                                      list="inline-fleet-datalist"
                                      value={inlineValue}
                                      onChange={(e) => setInlineValue(e.target.value.toUpperCase())}
                                      onFocus={(e) => e.target.select()}
                                      onBlur={() => {
                                        if (isNavigatingRef.current) {
                                          return;
                                        }
                                        const croppedVal = inlineValue.trim().toUpperCase();
                                        const originalVal = (cell.prefix || '').trim().toUpperCase();
                                        if (croppedVal !== originalVal) {
                                          handleInlineSave(route, dayNum, croppedVal, cell.id);
                                        }
                                        setActiveCellEditor(null);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          const croppedVal = inlineValue.trim().toUpperCase();
                                          const originalVal = (cell.prefix || '').trim().toUpperCase();
                                          let savedSuccessfully = true;
                                          if (croppedVal !== originalVal) {
                                            savedSuccessfully = handleInlineSave(route, dayNum, croppedVal, cell.id);
                                          }
                                          if (savedSuccessfully) {
                                            navigateToCell(route, dayNum, 'DOWN');
                                          }
                                        } else if (e.key === 'Tab') {
                                          e.preventDefault();
                                          const croppedVal = inlineValue.trim().toUpperCase();
                                          const originalVal = (cell.prefix || '').trim().toUpperCase();
                                          let savedSuccessfully = true;
                                          if (croppedVal !== originalVal) {
                                            savedSuccessfully = handleInlineSave(route, dayNum, croppedVal, cell.id);
                                          }
                                          if (savedSuccessfully) {
                                            navigateToCell(route, dayNum, e.shiftKey ? 'SHIFT-TAB' : 'TAB');
                                          }
                                        } else if (e.key === 'ArrowUp') {
                                          e.preventDefault();
                                          const croppedVal = inlineValue.trim().toUpperCase();
                                          const originalVal = (cell.prefix || '').trim().toUpperCase();
                                          let savedSuccessfully = true;
                                          if (croppedVal !== originalVal) {
                                            savedSuccessfully = handleInlineSave(route, dayNum, croppedVal, cell.id);
                                          }
                                          if (savedSuccessfully) {
                                            navigateToCell(route, dayNum, 'UP');
                                          }
                                        } else if (e.key === 'ArrowDown') {
                                          e.preventDefault();
                                          const croppedVal = inlineValue.trim().toUpperCase();
                                          const originalVal = (cell.prefix || '').trim().toUpperCase();
                                          let savedSuccessfully = true;
                                          if (croppedVal !== originalVal) {
                                            savedSuccessfully = handleInlineSave(route, dayNum, croppedVal, cell.id);
                                          }
                                          if (savedSuccessfully) {
                                            navigateToCell(route, dayNum, 'DOWN');
                                          }
                                        } else if (e.key === 'ArrowLeft') {
                                          const croppedVal = inlineValue.trim().toUpperCase();
                                          const originalVal = (cell.prefix || '').trim().toUpperCase();
                                          let savedSuccessfully = true;
                                          if (croppedVal !== originalVal) {
                                            savedSuccessfully = handleInlineSave(route, dayNum, croppedVal, cell.id);
                                          }
                                          if (savedSuccessfully) {
                                            navigateToCell(route, dayNum, 'LEFT');
                                          }
                                        } else if (e.key === 'ArrowRight') {
                                          const croppedVal = inlineValue.trim().toUpperCase();
                                          const originalVal = (cell.prefix || '').trim().toUpperCase();
                                          let savedSuccessfully = true;
                                          if (croppedVal !== originalVal) {
                                            savedSuccessfully = handleInlineSave(route, dayNum, croppedVal, cell.id);
                                          }
                                          if (savedSuccessfully) {
                                            navigateToCell(route, dayNum, 'RIGHT');
                                          }
                                        } else if (e.key === 'Escape') {
                                          e.preventDefault();
                                          setInlineValue(cell.prefix || '');
                                          setActiveCellEditor(null);
                                        }
                                      }}
                                      autoFocus
                                      className="w-full h-full text-center font-mono font-bold text-[9px] bg-white text-slate-900 border-0 outline-none p-0 focus:ring-0"
                                      style={{ border: 'none', outline: 'none' }}
                                    />
                                  ) : (
                                    cell.prefix || <span className="text-slate-300/40 font-bold">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <datalist id="inline-fleet-datalist">
            {fleet.map((v) => (
              <option key={v.prefix} value={v.prefix}>
                {v.prefix} - Placa: {v.plate} ({v.classification})
              </option>
            ))}
          </datalist>

          {/* Legends and Approval Fields (Highly elegant and professional for transport operations) */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-slate-200">
            {/* Status Legend List */}
            <div className="space-y-2 text-[8.5px]">
              <h4 className="font-extrabold text-[#05351c] uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span> Legenda de Segurança &amp; Conformidade ANTT
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-4 h-4 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded text-center leading-none font-bold text-[7.5px] py-0.5">1180</span>
                  <span><strong>Programado:</strong> Carro e motorista válidos definidos.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-4 h-4 bg-red-600 text-white border border-red-700 rounded text-center leading-none font-black text-[7.5px] py-0.5">1180</span>
                  <span><strong>Manutenção:</strong> Veículo impedido em oficina.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-4 h-4 bg-amber-200 text-amber-950 border border-amber-450 rounded text-center leading-none font-black text-[7.5px] py-0.5">1180</span>
                  <span><strong>Sobreposição:</strong> Duplicado na mesma data!</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-4 h-4 bg-red-100 text-red-700 border border-red-400 rounded text-center leading-none font-black text-[7.5px] py-0.5">CANC</span>
                  <span><strong>Cancelado:</strong> Viagem remarcada ou cancelada.</span>
                </div>
              </div>
            </div>

            {/* Print Signatures Block */}
            <div className="grid grid-cols-2 gap-4 text-center items-end">
              <div className="flex flex-col justify-end">
                <div className="w-full border-b border-dashed border-slate-400 h-6"></div>
                <span className="font-extrabold text-[#05351c] text-[8px] mt-1.5 uppercase leading-none">Supervisor de Tráfego</span>
                <span className="text-[7px] text-slate-500 font-mono mt-0.5">Controle Operacional Grupo Liderança</span>
              </div>
              <div className="flex flex-col justify-end">
                <div className="w-full border-b border-dashed border-slate-400 h-6"></div>
                <span className="font-extrabold text-[#05351c] text-[8px] mt-1.5 uppercase leading-none">Diretoria de Operações</span>
                <span className="text-[7px] text-slate-500 font-mono mt-0.5">Homologação de Escalas v2.6</span>
              </div>
            </div>
          </div>

          {/* Legal notes footer identical to PDF */}
          <div className="mt-8 border-t border-slate-300 pt-4 text-[8px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="font-bold">© GRUPO LIDERANÇA • EXPRESSO MARLY LTDA • JJ TURISMO. TODOS OS DIREITOS RESERVADOS.</p>
            <p className="font-mono uppercase font-black tracking-wide text-[7px] bg-slate-100 px-2 py-0.5 rounded border border-slate-350 select-none">
              GERADO AUTOMATICAMENTE • SISTEMA INTELIGENTE OPERACIONAL v2.6
            </p>
          </div>
        </div>
      </div>

      {/* QUICK ASSIGN CELL EDIT POPUP */}
      <AnimatePresence>
        {editingCell && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-55">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl max-w-md w-full text-left"
            >
              <div className="flex justify-between items-start pb-4 border-b border-slate-800 mb-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 px-2.2 text-[8px] bg-indigo-500 font-extrabold tracking-widest text-[9px] text-white rounded">
                      EDITAR ESCALA
                    </span>
                    <span className="text-[10px] text-slate-450 font-bold uppercase font-mono">
                      📅 {editingCell.day < 10 ? `0${editingCell.day}` : editingCell.day}/{selectedMonth < 10 ? `0${selectedMonth}` : selectedMonth}/{selectedYear}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-white mt-1 uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={14} className="text-amber-400 shrink-0" />
                    <span>{editingCell.route.origin} ➔ {editingCell.route.destination}</span>
                  </h3>
                </div>
                
                <button
                  onClick={() => setEditingCell(null)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveCell} className="space-y-4">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-amber-300" />
                  <span className="text-xs font-black text-slate-300">Horário da Viagem Regular:</span>
                  <span className="text-sm font-black text-white bg-slate-900 p-1 px-2 rounded border border-slate-800 font-mono ml-auto">
                    {editingCell.route.time}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {/* Select Prefix Vehicle */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Prefixo do Ônibus (Digite ou Selecione)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editPrefix}
                        onChange={(e) => setEditPrefix(e.target.value.toUpperCase())}
                        placeholder="Ex: 1180"
                        className="w-1/3 bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-center"
                        title="Digite o prefixo do carro desejado"
                      />
                      
                      <select
                        value={editPrefix}
                        onChange={(e) => setEditPrefix(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      >
                        <option value="">-- Ou escolha da lista --</option>
                        {fleet.map(v => (
                          <option key={v.prefix} value={v.prefix}>
                            🚗 {v.prefix} - Placa: {v.plate} ({v.classification}){v.statusOperacional === 'MANUTENÇÃO' ? ' (⚠️ MANUTENÇÃO)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Invalid fleet prefix restriction visual notice */}
                    {(() => {
                      const normalized = editPrefix.trim().toUpperCase();
                      const isSpecial = normalized === '' || normalized === 'CANC.' || normalized === 'XXXXXXX';
                      const exists = fleet.some(v => v.prefix.toUpperCase() === normalized);
                      
                      if (!isSpecial && !exists) {
                        return (
                          <p className="text-red-400 text-[10px] font-bold mt-1.5 uppercase font-mono animate-pulse">
                            ❌ Erro: O carro "{editPrefix}" não existe na lista de frota. Não será possível salvar!
                          </p>
                        );
                      }
                      
                      const matchedV = fleet.find(v => v.prefix.toUpperCase() === normalized);
                      if (matchedV?.statusOperacional === 'MANUTENÇÃO') {
                        return (
                          <p className="text-rose-500 text-[10px] font-bold mt-1.5 uppercase font-mono animate-pulse">
                            ⚠️ Alerta: Este veículo está em MANUTENÇÃO. Ele será destacado em Vermelho na tabela!
                          </p>
                        );
                      }

                      return null;
                    })()}
                  </div>

                  {/* Driver Name input */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Nome do Motorista Escalado
                    </label>
                    <input
                      type="text"
                      value={editDriver}
                      onChange={(e) => setEditDriver(e.target.value)}
                      placeholder="Ex: João da Silva Guia"
                      className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 placeholder-slate-650"
                    />
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="pt-4 border-t border-slate-880 flex flex-col sm:flex-row justify-between gap-2.5">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={handleRemoveFleet}
                      className="px-2.5 py-2.2 bg-amber-550/10 hover:bg-amber-600 hover:text-white border border-amber-550/20 text-amber-500 text-[10px] font-black rounded-xl cursor-pointer transition-colors flex items-center gap-1 shadow-sm active:scale-95"
                      title="Deixar o horário vago de carro e motorista (Excluir Frota)"
                    >
                      <Trash2 size={12} />
                      <span>Excluir Frota</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearCell}
                      className="px-2.5 py-2.2 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-rose-450 text-[10px] font-black rounded-xl cursor-pointer transition-colors flex items-center gap-1 shadow-sm active:scale-95"
                      title="Define este horário como indisponível/cancelado"
                    >
                      <X size={12} />
                      <span>Cancelar Linha</span>
                    </button>
                  </div>

                  <div className="flex gap-1.5 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingCell(null)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-350 text-xs font-black rounded-xl cursor-pointer transition-colors active:scale-95"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={(() => {
                        const normalized = editPrefix.trim().toUpperCase();
                        const isSpecial = normalized === '' || normalized === 'CANC.' || normalized === 'XXXXXXX';
                        const exists = fleet.some(v => v.prefix.toUpperCase() === normalized);
                        return !isSpecial && !exists;
                      })()}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:hover:bg-amber-500 disabled:cursor-not-allowed text-slate-950 text-xs font-black rounded-xl cursor-pointer shadow-lg shadow-amber-500/15 transition-all active:scale-95 flex items-center gap-1"
                    >
                      <Check size={12} className="stroke-[3]" />
                      <span>Salvar Escala</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Embedding dynamic media CSS rules specifically for custom print layout in Landscape/Portrait */}
      <style>{`
        @media print {
          /* Hide normal UI components */
          body * {
            visibility: hidden;
          }
          #monthly-grid-document, #monthly-grid-document * {
            visibility: visible;
          }
          #monthly-grid-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            zoom: ${printOrientation === 'landscape' ? '65%' : '50%'} !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print, #monthly-grid-root, header, nav, footer, button, .shrink-0 {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Set dynamic dimensions for sheet of paper based on user selection */
          @page {
            size: ${printOrientation};
            margin: 5mm;
          }
        }
      `}</style>
    </div>
  );
}
