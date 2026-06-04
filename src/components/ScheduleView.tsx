import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Bus, 
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingDown,
  ChevronRight,
  Sparkles,
  UserCheck,
  ShieldAlert,
  Save,
  Trash2,
  Map,
  Filter,
  Printer,
  Download,
  ExternalLink,
  Minus,
  Maximize2,
  Minimize2,
  X,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { Vehicle } from '../data/fleetData';
import { Driver } from './DriversView';
import { APPROVED_ROUTES_DATA, RouteLine } from '../data/routesData';
import { BrandLogo } from './BrandLogo';
import { SmartScheduleModal } from './SmartScheduleModal';
import { MonthlyGridView } from './MonthlyGridView';

export interface Scale {
  id: string;
  driverName: string; // The joined names of all drivers (up to 6)
  driversList?: string[]; // Array of driver names configured for this scale (up to 6)
  line: string; // e.g. "Goiânia-GO x Brasília-DF"
  date: string;
  time: string;
  busPrefix: string;
  busPlate: string;
  classification: string;
  isExtra?: boolean;
  routeNumber?: string;
  routeId?: string;
  serviceType?: string;
}

export interface ArchivedScaleSheet {
  id: string;
  timestamp: string; // "DD/MM/YYYY HH:MM:SS"
  dates: string[];   // ["2026-05-28", "2026-05-29"]
  scalesCount: number;
  scalesList: Scale[];
  title: string;
}

interface EditableCarroCellProps {
  scale: Scale;
  fleet: Vehicle[];
  onUpdateScaleFields: (scaleId: string, updatedFields: Partial<Scale>) => void;
  isMaintenance: boolean;
  isDoubleBooked: boolean;
}

const EditableCarroCell: React.FC<EditableCarroCellProps> = ({ 
  scale, 
  fleet, 
  onUpdateScaleFields,
  isMaintenance,
  isDoubleBooked
}) => {
  const [val, setVal] = useState(scale.busPrefix || '');

  useEffect(() => {
    setVal(scale.busPrefix || '');
  }, [scale.busPrefix]);

  const handleCommit = (newVal: string) => {
    const normalized = newVal.trim().toUpperCase();
    
    if (normalized === '') {
      onUpdateScaleFields(scale.id, {
        busPrefix: '',
        busPlate: '---'
      });
      return;
    }

    const matchedVeh = fleet.find(v => v.prefix.toUpperCase() === normalized);

    onUpdateScaleFields(scale.id, {
      busPrefix: normalized,
      busPlate: matchedVeh ? matchedVeh.plate : '---'
    });
  };

  const handleClear = () => {
    setVal('');
    onUpdateScaleFields(scale.id, {
      busPrefix: '',
      busPlate: '---'
    });
  };

  const normalizedVal = val.trim().toUpperCase();
  const isSpecialVal = normalizedVal === '' || normalizedVal === 'CANC.' || normalizedVal === 'XXXXXXX';
  const isInvalidPrefix = !isSpecialVal && !fleet.some(v => v.prefix.toUpperCase() === normalizedVal);

  let inputBgClass = 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-350';
  if (isInvalidPrefix) {
    inputBgClass = 'bg-rose-500 text-white border-rose-600 placeholder-rose-200 font-extrabold animate-pulse';
  } else if (isMaintenance) {
    inputBgClass = 'bg-red-700 text-white border-red-800 placeholder-red-300';
  } else if (isDoubleBooked) {
    inputBgClass = 'bg-amber-100 text-amber-950 border-amber-400 placeholder-amber-700 font-extrabold';
  }

  return (
    <div className="flex items-center justify-center gap-1 w-full max-w-[125px] mx-auto">
      <input
        type="text"
        data-scale-input="carro"
        value={val}
        onChange={(e) => setVal(e.target.value.toUpperCase())}
        onBlur={(e) => handleCommit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            if (e.key === 'Tab' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
            }
            handleCommit(e.target.value);
            
            const target = e.currentTarget;
            setTimeout(() => {
              const allInputs = Array.from(document.querySelectorAll('input[data-scale-input="carro"]')) as HTMLInputElement[];
              const currentIndex = allInputs.indexOf(target);
              if (currentIndex !== -1) {
                let step = 1;
                if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
                  step = -1;
                }
                const nextInput = allInputs[currentIndex + step];
                if (nextInput) {
                  nextInput.focus();
                  nextInput.select();
                }
              } else if (e.key === 'Enter') {
                target.blur();
              }
            }, 50);
          }
        }}
        placeholder="vago"
        className={`w-14 text-center font-mono font-bold text-[11px] p-0.5 rounded border shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500/50 print:border-none print:shadow-none print:bg-transparent ${inputBgClass}`}
        title={isInvalidPrefix ? "Aviso: Este prefixo NÃO existe na base de dados de frota!" : undefined}
      />
      {val !== '' && (
        <button
          type="button"
          onClick={handleClear}
          className="p-0.5 hover:bg-rose-100 text-rose-600 hover:text-rose-800 rounded transition-colors cursor-pointer select-none no-print shadow-sm border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-705 shrink-0"
          title="Excluir Frota (deixa vago)"
        >
          <Trash2 size={10} className="stroke-[2.5]" />
        </button>
      )}
    </div>
  );
};

interface ScheduleViewProps {
  fleet: Vehicle[];
  scales: Scale[];
  onUpdateScales: (updatedScales: Scale[]) => void;
  drivers: Driver[];
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ fleet, scales, onUpdateScales, drivers }) => {
  const handleUpdateScalesState = (updated: Scale[]) => {
    onUpdateScales(updated);
  };

  const handleUpdateScaleFields = (scaleId: string, updatedFields: Partial<Scale>) => {
    let date = selectedGridDate;
    let time = "";
    let line = "";
    let classification = "Executivo";
    let isExtra = false;
    let routeId = "";

    const targetScale = scales.find(s => s.id === scaleId);
    if (targetScale) {
      date = targetScale.date;
      time = targetScale.time;
      line = targetScale.line;
      classification = targetScale.classification || "Executivo";
      isExtra = !!targetScale.isExtra;
      routeId = targetScale.routeId || "";
    } else if (scaleId.startsWith("auto-vago-")) {
      const match = scaleId.match(/^auto-vago-(.+)-(\d{4}-\d{2}-\d{2})$/);
      if (match) {
        routeId = match[1];
        date = match[2];
        const route = APPROVED_ROUTES_DATA.find(r => r.id === routeId);
        if (route) {
          time = route.time;
          line = `${route.origin} x ${route.destination}`;
          classification = route.serviceType;
          isExtra = route.isExtra;
        }
      }
    }

    if (updatedFields.busPrefix) {
      const newPrefix = updatedFields.busPrefix.trim().toUpperCase();
      const isSpecial = newPrefix === '' || newPrefix === 'CANC.' || newPrefix === 'XXXXXXX';
      
      if (!isSpecial) {
        // 1. Same-time simultaneous clash prevention
        const sameTimeClash = scales.find(s => 
          s.id !== scaleId &&
          s.date === date &&
          s.time && s.time.trim() === time.trim() &&
          s.busPrefix && s.busPrefix.trim().toUpperCase() === newPrefix
        );
        if (sameTimeClash) {
          alert(`[BLOQUEIO DE DUPLICIDADE SIMULTÂNEA] O veículo ${newPrefix} já está cadastrado no dia ${date.split('-').reverse().join('/')} às ${time}! (Rota: ${sameTimeClash.line}). Não é permitido escalar o mesmo veículo simultaneamente.`);
          return;
        }
        
        // 2. Check if vehicle is in maintenance
        const isMaintenance = fleet.some(v => 
          v.prefix.toUpperCase() === newPrefix && 
          v.statusOperacional === 'MANUTENÇÃO'
        );
        if (isMaintenance) {
          alert(`[BLOQUEIO DE MANUTENÇÃO] O veículo ${newPrefix} está em Manutenção/Oficina e não pode ser escalado!`);
          return;
        }

        // 3. Limit of 2 times per day limit check
        const allocatedCount = scales.filter(s => 
          s.id !== scaleId &&
          s.date === date && 
          s.busPrefix && s.busPrefix.trim().toUpperCase() === newPrefix
        ).length;
        if (allocatedCount >= 2) {
          alert(`[BLOQUEIO DE SEGURANÇA] O veículo ${newPrefix} já está escalado 02 vezes no dia ${date.split('-').reverse().join('/')}! Não é permitido alocações adicionais.`);
          return;
        }
      }
    }

    let updated: Scale[];
    const exists = scales.some(s => s.id === scaleId);

    if (exists) {
      updated = scales.map(s => {
        if (s.id === scaleId) {
          return {
            ...s,
            ...updatedFields
          };
        }
        return s;
      });
    } else {
      // Create new live scale override to persist the change from vacant/virtual state
      const newScale: Scale = {
        id: "S-MOD-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
        driverName: "SEM MOTORISTA ESCALADO",
        driversList: [],
        line: line || "Linha Regular de Ônibus",
        date: date,
        time: time || "12:00",
        busPrefix: updatedFields.busPrefix || "",
        busPlate: updatedFields.busPlate || "---",
        classification: classification,
        isExtra: isExtra,
        routeId: routeId || undefined,
        ...updatedFields
      };
      updated = [...scales, newScale];
    }

    onUpdateScales(updated);
  };

  const [isNewScaleOpen, setIsNewScaleOpen] = useState(false);
  const [isSmartSystemOpen, setIsSmartSystemOpen] = useState(false);
  const [isMonthlyGridOpen, setIsMonthlyGridOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  const handleClosePrintModal = () => {
    setIsPrintModalOpen(false);
    setIsMinimized(false);
    setIsMaximized(false);
    setZoomLevel(100);
  };

  // States for Archived Scales PDF copies
  const [archivedSheets, setArchivedSheets] = useState<ArchivedScaleSheet[]>(() => {
    const cached = localStorage.getItem('bc_printed_scales_archive');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Erro ao carregar escala arquivada de localStorage:", e);
      }
    }
    return [];
  });
  const [restoredScalesOverride, setRestoredScalesOverride] = useState<Scale[] | null>(null);

  const formatDateBrGeneral = (dateStr: string) => {
    if (!dateStr) return "Sem Data";
    if (dateStr.includes('/')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Group all active scales by date for the main UI list & sort them chronologically
  const generalScalesByDate = useMemo(() => {
    const groups: { [key: string]: Scale[] } = {};
    scales.forEach(scale => {
      const d = scale.date || "Sem Data";
      if (!groups[d]) groups[d] = [];
      groups[d].push(scale);
    });
    return Object.keys(groups).sort().map(d => ({
      date: d,
      items: groups[d].sort((a, b) => a.time.localeCompare(b.time))
    }));
  }, [scales]);

  const handleSaveDayScales = (dateToArchive: string, dayScales: Scale[]) => {
    if (dayScales.length === 0) return;
    
    const formatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
    const timestampStr = formatter.format(new Date());
    
    const formattedDate = formatDateBrGeneral(dateToArchive);
    
    const newSheet: ArchivedScaleSheet = {
      id: "ARC-" + Date.now() + "-" + Math.floor(Math.random() * 100),
      timestamp: timestampStr,
      dates: [dateToArchive],
      scalesCount: dayScales.length,
      scalesList: dayScales,
      title: `Escala Diária - ${formattedDate}`
    };
    
    setArchivedSheets(prev => {
      const updated = [newSheet, ...prev];
      localStorage.setItem('bc_printed_scales_archive', JSON.stringify(updated));
      return updated;
    });
    
    alert(`Sucesso! Escala do dia ${formattedDate} foi salva no arquivo de escalas salvas.`);
  };

  const handleOverwriteWithSavedSheet = (sheet: ArchivedScaleSheet) => {
    if (confirm(`Deseja substituir TODAS as escalas ativas atuais do sistema pelas escalas contidas em "${sheet.title}"?`)) {
      handleUpdateScalesState(sheet.scalesList);
      setRestoredScalesOverride(null);
      alert(`Escalas do dia restauradas com sucesso como escalas ativas para edição!`);
    }
  };

  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      setIsInIframe(true);
    }
  }, []);
  
  const printSheetRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printSheetRef,
    documentTitle: 'Escala_Grupo_Lideranca',
    onBeforePrint: async () => {
      console.log('[Print Debug] Evento: onBeforePrint iniciado. Carregando estilos e conteúdo...');
    },
    onAfterPrint: () => {
      console.log('[Print Debug] Evento: onAfterPrint concluído com sucesso.');
    },
    onPrintError: (errorLocation, error) => {
      console.error(`[Print Debug] Erro do react-to-print detectado em "${errorLocation}":`, error);
    }
  });

  const handleArchivePrint = (currentScalesToArchive: Scale[]) => {
    if (currentScalesToArchive.length === 0) return;
    const uniqueDates = Array.from(new Set(currentScalesToArchive.map(s => s.date))).sort();
    
    const formatDateBrLocal = (dateStr: string) => {
      if (!dateStr) return "Sem Data";
      if (dateStr.includes('/')) return dateStr;
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    };

    const formatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
    const timestampStr = formatter.format(new Date());
    
    const newSheet: ArchivedScaleSheet = {
      id: "ARC-" + Date.now(),
      timestamp: timestampStr,
      dates: uniqueDates,
      scalesCount: currentScalesToArchive.length,
      scalesList: currentScalesToArchive,
      title: uniqueDates.length > 0 
        ? `Escala de ${uniqueDates.map(d => formatDateBrLocal(d)).join(' / ')}` 
        : `Escala Avulsa Sem Data`
    };
    
    setArchivedSheets(prev => {
      const updated = [newSheet, ...prev];
      localStorage.setItem('bc_printed_scales_archive', JSON.stringify(updated));
      return updated;
    });
  };

  const triggerPrint = () => {
    console.log('[Print Debug] Botão imprimir acionado - executando window.print().');

    if (!printSheetRef.current) {
      console.warn('[Print Debug] Atenção: printSheetRef.current está nulo (null). O wrapper de impressão não foi renderizado ou encontrado no DOM.');
    }

    // Salvar no histórico de escalas impressas automaticamente
    handleArchivePrint(restoredScalesOverride || filteredPrintScales);

    try {
      console.log('[Print Debug] Disparando window.print()...');
      window.print();
    } catch (error) {
      console.error('[Print Debug] Exceção capturada ao tentar executar window.print():', error);
    }
  };

  const downloadPDFDirectly = async (orientation: 'portrait' | 'landscape' = 'landscape') => {
    const element = printSheetRef.current;
    if (!element) {
      alert("Nenhum conteúdo pronto para exportação!");
      return;
    }

    // Salvar no histórico de escalas impressas automaticamente
    handleArchivePrint(restoredScalesOverride || filteredPrintScales);

    setIsGeneratingPDF(true);

    const originalZoom = element.style.zoom;
    element.style.zoom = '100%';

    // Linear-time O(N) parser to replace oklch color values with hex/rgba dynamically
    const replaceOklch = (str: any): any => {
      if (typeof str !== 'string' || !str.includes('oklch')) return str;
      return str.replace(/oklch\(([^)]+)\)/gi, (match, content) => {
        try {
          const parts = content.split('/');
          const colorsPart = parts[0].trim();
          const alphaPart = parts[1] ? parts[1].trim() : null;

          const colorValues = colorsPart.split(/[\s,]+/);
          if (colorValues.length < 3) return '#334155';

          const lStr = colorValues[0];
          const hStr = colorValues[2];

          let l = parseFloat(lStr);
          if (lStr.includes('%')) l = l / 100;

          const h = parseFloat(hStr) || 0;

          let a = 1;
          if (alphaPart) {
            a = parseFloat(alphaPart);
            if (alphaPart.includes('%')) a = a / 100;
          }

          let hex = '#64748b'; // default gray

          if (l < 0.18) {
            hex = '#0f172a'; // slate-900 / dark text
          } else if (l > 0.88) {
            hex = '#ffffff'; // white background
          } else {
            if (h >= 100 && h <= 180) {
              hex = l < 0.5 ? '#105d38' : '#1ea362'; // Lideran Verde / Light Verde
            } else if (h >= 35 && h < 100) {
              hex = '#f59e0b'; // Amber yellow
            } else if (h < 35 || h > 320) {
              hex = '#dc2626'; // Red alert
            } else if (h >= 180 && h <= 250) {
              hex = '#2563eb'; // Blue info
            } else {
              if (l < 0.4) hex = '#334155';
              else if (l < 0.6) hex = '#64748b';
              else hex = '#cbd5e1';
            }
          }

          if (a < 1) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${a})`;
          }
          return hex;
        } catch (e) {
          return '#334155';
        }
      });
    };

    const originalGetComputedStyle = window.getComputedStyle;
    const styleProxyCache = new globalThis.WeakMap<any, any>();
    
    // Set of color property names that may contain oklch styles
    const colorProps = new globalThis.Set([
      'color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderOutlineColor',
      'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'outlineColor', 'fill', 'stroke',
      'background-color', 'border-color', 'border-top-color', 'border-right-color', 
      'border-bottom-color', 'border-left-color', 'outline-color'
    ]);

    const originalStylesMap = new globalThis.Map<HTMLStyleElement, string>();
    const inlineStylesBackup = new globalThis.Map<HTMLElement, string>();

    // Store descriptors to completely restore them in finally
    let originalStyleSheetsDescriptor: PropertyDescriptor | undefined;
    let originalCssRulesDescriptor: PropertyDescriptor | undefined;

    try {
      // 1. Temporarily backup and replace any oklch occurrences inside stylesheet tags
      const styleElements = Array.from(document.querySelectorAll('style'));
      styleElements.forEach(style => {
        try {
          if (style.textContent && style.textContent.includes('oklch')) {
            originalStylesMap.set(style, style.textContent);
            style.textContent = replaceOklch(style.textContent);
          }
        } catch (e) {
          console.warn("Could not backup or adjust style tag:", e);
        }
      });

      // 2. Backup and replace any inline oklch styles directly in element attributes
      const backupAndSanitizeInlineStyles = (el: HTMLElement) => {
        try {
          const styleAttr = el.getAttribute('style');
          if (styleAttr && styleAttr.includes('oklch')) {
            inlineStylesBackup.set(el, styleAttr);
            el.setAttribute('style', replaceOklch(styleAttr));
          }
          
          el.querySelectorAll('*').forEach(child => {
            const childHtml = child as HTMLElement;
            const childStyleAttr = childHtml.getAttribute('style');
            if (childStyleAttr && childStyleAttr.includes('oklch')) {
              inlineStylesBackup.set(childHtml, childStyleAttr);
              childHtml.setAttribute('style', replaceOklch(childStyleAttr));
            }
          });
        } catch (e) {}
      };
      
      backupAndSanitizeInlineStyles(element);

      // 3. Intercept document.styleSheets and CSSStyleSheet.prototype.cssRules to bypass oklch parsing crashes
      try {
        originalStyleSheetsDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'styleSheets');
        Object.defineProperty(document, 'styleSheets', {
          get() {
            return [];
          },
          configurable: true
        });
      } catch (e) {
        console.warn("Could not intercept document.styleSheets:", e);
      }

      try {
        originalCssRulesDescriptor = Object.getOwnPropertyDescriptor(CSSStyleSheet.prototype, 'cssRules');
        Object.defineProperty(CSSStyleSheet.prototype, 'cssRules', {
          get() {
            return [];
          },
          configurable: true
        });
      } catch (e) {
        console.warn("Could not intercept CSSStyleSheet.prototype.cssRules:", e);
      }

      // 4. High-performance window.getComputedStyle interceptor with caching to avoid re-binding and redundant regex tests
      window.getComputedStyle = function(el, pseudoElt) {
        const style = originalGetComputedStyle(el, pseudoElt);
        if (!style) return style;

        let cached = styleProxyCache.get(style);
        if (cached) return cached;

        const fnCache = new globalThis.Map<any, any>();

        const proxy = new Proxy(style, {
          get(target, prop) {
            if (prop === 'getPropertyValue') {
              let bound = fnCache.get(prop);
              if (!bound) {
                bound = function(propertyName: string) {
                  const val = target.getPropertyValue(propertyName);
                  if (typeof val === 'string' && val.includes('oklch')) {
                    return replaceOklch(val);
                  }
                  return val;
                };
                fnCache.set(prop, bound);
              }
              return bound;
            }

            const val = (target as any)[prop];

            if (typeof prop === 'string' && colorProps.has(prop)) {
              if (typeof val === 'string' && val.includes('oklch')) {
                return replaceOklch(val);
              }
              return val;
            }

            if (typeof val === 'function') {
              let bound = fnCache.get(prop);
              if (!bound) {
                bound = val.bind(target);
                fnCache.set(prop, bound);
              }
              return bound;
            }

            return val;
          }
        });

        styleProxyCache.set(style, proxy);
        return proxy;
      };

      // Carrega o motor de PDF via script externo assíncrono para imunidade total contra travamentos do empacotador (Vite)
      const html2pdfLib = await new Promise<any>((resolve, reject) => {
        if ((window as any).html2pdf) {
          resolve((window as any).html2pdf);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => {
          setTimeout(() => {
            if ((window as any).html2pdf) {
              resolve((window as any).html2pdf);
            } else {
              reject(new Error("A ferramenta de PDF foi carregada, mas não inicializou no navegador."));
            }
          }, 50);
        };
        script.onerror = () => {
          reject(new Error("Erro ao carregar o motor de PDF do CDN. Verifique sua conexão com a internet."));
        };
        document.head.appendChild(script);
      });

      const opt = {
        margin:       [10, 8, 10, 8],
        filename:     `Escala_Grupo_Lideranca_${new Date().toISOString().split('T')[0]}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
          scale: 1.5, // Ultra-stable 1.5 scale factor for fast execution without memory/thread locks
          useCORS: true, 
          logging: false,
          backgroundColor: '#ffffff'
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: orientation }
      };

      await html2pdfLib().from(element).set(opt).save();
    } catch (err: any) {
      console.error("[PDF Engine Error]", err);
      alert(err.message || "Erro ao baixar a escala em PDF.");
    } finally {
      // Restore CSSStyleSheet.prototype.cssRules
      try {
        if (originalCssRulesDescriptor) {
          Object.defineProperty(CSSStyleSheet.prototype, 'cssRules', originalCssRulesDescriptor);
        } else {
          delete (CSSStyleSheet.prototype as any).cssRules;
        }
      } catch (e) {
        console.warn("Could not restore CSSStyleSheet.cssRules descriptor:", e);
      }

      // Restore document.styleSheets
      try {
        if (originalStyleSheetsDescriptor) {
          Object.defineProperty(document, 'styleSheets', originalStyleSheetsDescriptor);
        } else {
          delete (document as any).styleSheets;
        }
      } catch (e) {
        console.warn("Could not restore document.styleSheets descriptor:", e);
      }

      // Restore original browser methods
      window.getComputedStyle = originalGetComputedStyle;

      // Restore style elements value mapping
      originalStylesMap.forEach((originalText, styleEl) => {
        try {
          styleEl.textContent = originalText;
        } catch (e) {
          console.warn("Could not restore original stylesheet text:", e);
        }
      });

      // Restore inline style attributes
      inlineStylesBackup.forEach((originalStyle, el) => {
        try {
          el.setAttribute('style', originalStyle);
        } catch (e) {}
      });

      if (element) {
        element.style.zoom = originalZoom;
      }
      setIsGeneratingPDF(false);
    }
  };
  
  // Scale Form State
  const [scaleDrivers, setScaleDrivers] = useState<string[]>(['']);
  const [line, setLine] = useState('Goiânia-GO x Brasília-DF');
  const [date, setDate] = useState('2026-06-01');
  const [time, setTime] = useState('08:00');
  const [selectedPrefix, setSelectedPrefix] = useState('');
  const [scaleSearchQuery, setScaleSearchQuery] = useState('');

  // New States for Approved Routes Integration
  const [localRouteSearch, setLocalRouteSearch] = useState('');
  const [isExtraScale, setIsExtraScale] = useState(false);
  const [scaleRouteNumber, setScaleRouteNumber] = useState('');
  const [panelOriginFilter, setPanelOriginFilter] = useState('TODOS');
  const [panelCategoryFilter, setPanelCategoryFilter] = useState('TODOS');
  const [panelSearchQuery, setPanelSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'programmed' | 'daily_grid'>('daily_grid');
  const [selectedGridDate, setSelectedGridDate] = useState<string>('2026-06-01');

  // States for PDF Print modal filtering and customization
  const [printScaleType, setPrintScaleType] = useState<'ALL' | 'REGULAR' | 'EXTRA'>('ALL');
  const [printSearch, setPrintSearch] = useState('');
  const [printCity, setPrintCity] = useState('TODOS');
  const [printScope, setPrintScope] = useState<'ALL' | 'SINGLE'>('ALL');
  const [printSelectedDate, setPrintSelectedDate] = useState<string>('');
  const [printOrientation, setPrintOrientation] = useState<'portrait' | 'landscape'>('landscape');

  // Dynamically calculate unique dates in scales for targeted daily printing
  const uniquePrintDates = useMemo(() => {
    const datesSet = new Set<string>();
    scales.forEach(s => {
      if (s.date) {
        datesSet.add(s.date);
      }
    });
    return Array.from(datesSet).sort();
  }, [scales]);

  // Synchronize printSelectedDate with available scale list dates
  useEffect(() => {
    if (uniquePrintDates.length > 0 && (!printSelectedDate || !uniquePrintDates.includes(printSelectedDate))) {
      setPrintSelectedDate(uniquePrintDates[0]);
    }
  }, [uniquePrintDates, printSelectedDate]);

  // Dynamically calculate unique cities/regions in scales for targeted printing
  const uniquePrintCities = useMemo(() => {
    const citiesSet = new Set<string>();
    scales.forEach(s => {
      const parts = s.line.split(/[x\-]/);
      parts.forEach(p => {
        const cleaned = p.trim().replace(/\-[A-Z]{2}$/i, '').trim();
        if (cleaned && cleaned.length > 3) {
          citiesSet.add(cleaned);
        }
      });
    });
    return Array.from(citiesSet).sort((a, b) => a.localeCompare(b));
  }, [scales]);

  // Live filter for the PDF sheet
  const filteredPrintScales = useMemo(() => {
    return scales.filter(scale => {
      // 0. Filter by Print Mode (Single Day vs. All)
      if (printScope === 'SINGLE' && scale.date !== printSelectedDate) return false;

      // 1. Filter by Scale Classification Type (Regular vs Extra)
      if (printScaleType === 'REGULAR' && scale.isExtra) return false;
      if (printScaleType === 'EXTRA' && !scale.isExtra) return false;

      // 2. Filter by City / Origin-Dest Region
      if (printCity !== 'TODOS' && !scale.line.toLowerCase().includes(printCity.toLowerCase())) return false;

      // 3. Search text query filter
      if (printSearch.trim() !== '') {
        const q = printSearch.toLowerCase();
        const pfx = scale.busPrefix.toLowerCase().includes(q);
        const plt = scale.busPlate.toLowerCase().includes(q);
        const lne = scale.line.toLowerCase().includes(q);
        const cls = (scale.classification || '').toLowerCase().includes(q);
        const drv = scale.driversList 
          ? scale.driversList.some(d => d.toLowerCase().includes(q)) 
          : (scale.driverName || '').toLowerCase().includes(q);

        return pfx || plt || lne || cls || drv;
      }

      return true;
    });
  }, [scales, printScope, printSelectedDate, printScaleType, printSearch, printCity]);

  // Map to count how many times each vehicle prefix is scheduled on each specific date
  const dailyPrefixCounts = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    scales.forEach(s => {
      const d = s.date;
      const p = s.busPrefix ? s.busPrefix.trim().toUpperCase() : '';
      if (d && p && p !== 'CANC.' && p !== 'XXXXXXX') {
        if (!counts[d]) counts[d] = {};
        counts[d][p] = (counts[d][p] || 0) + 1;
      }
    });
    return counts;
  }, [scales]);

  // Active/Restored scales selected for current print
  const currentPrintScales = restoredScalesOverride || filteredPrintScales;

  // Group scales by date & sort them
  const scalesByDate = useMemo(() => {
    const groups: { [key: string]: Scale[] } = {};
    currentPrintScales.forEach(scale => {
      const d = scale.date || "Sem Data";
      if (!groups[d]) groups[d] = [];
      groups[d].push(scale);
    });
    return Object.keys(groups).sort().map(d => ({
      date: d,
      items: groups[d]
    }));
  }, [currentPrintScales]);

  // Selected vehicle analysis
  const matchingVehicle = useMemo(() => {
    if (!selectedPrefix) return null;
    return fleet.find(v => v.prefix === selectedPrefix) || null;
  }, [selectedPrefix, fleet]);

  // Calculate if the cronotacógrafo of the vehicle is expiring within 30 days or is already expired
  const getCronoDetails = (v: Vehicle) => {
    if (!v.expiryCrono || v.expiryCrono === "NÃO TEM") {
      return { isExpiringSoon: false, isAlreadyExpired: false, daysRemaining: null, formattedDate: v.expiryCrono };
    }
    
    const parts = v.expiryCrono.split('/');
    if (parts.length !== 3) {
      return { isExpiringSoon: false, isAlreadyExpired: false, daysRemaining: null, formattedDate: v.expiryCrono };
    }
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-based month
    const year = parseInt(parts[2], 10);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return { isExpiringSoon: false, isAlreadyExpired: false, daysRemaining: null, formattedDate: v.expiryCrono };
    }
    
    const expiryDate = new Date(year, month, day);
    const baseDate = new Date("2026-05-27T19:13:52Z");
    baseDate.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    
    const diffTime = expiryDate.getTime() - baseDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // "estiver vencendo nos próximos 30 dias" -> 0 to 30 days remaining
    const isExpiringSoon = diffDays >= 0 && diffDays <= 30;
    const isAlreadyExpired = diffDays < 0;
    
    return {
      isExpiringSoon,
      isAlreadyExpired,
      daysRemaining: diffDays,
      formattedDate: v.expiryCrono
    };
  };

  // Is vehicle blocked based on Liderança operational blocking rules
  const blockCheck = useMemo(() => {
    if (!matchingVehicle) return null;
    
    const isMaintenance = matchingVehicle.statusOperacional === "MANUTENÇÃO";
    const isInactive = matchingVehicle.statusOperacional === "INATIVO";
    const isAnttExpired = matchingVehicle.situationAntt === "VENCIDO";
    const isMissingVistoria = matchingVehicle.situationAntt === "NÃO TEM VISTORIA" || matchingVehicle.vistoria === "NÃO TEM VISTORIA";
    
    if (isMaintenance) {
      return {
        isBlocked: true,
        reason: "Veículo em Oficina / Manutenção Corretiva."
      };
    }
    if (isInactive) {
      return {
        isBlocked: true,
        reason: "Veículo Inativo por tempo indeterminado."
      };
    }
    if (isAnttExpired) {
      return {
        isBlocked: true,
        reason: "Vistoria ANTT Vencida. Impedido de transitar."
      };
    }
    if (isMissingVistoria) {
      return {
        isBlocked: true,
        reason: "Veículo cadastrado como 'NÃO TEM VISTORIA'."
      };
    }

    // Check if the vehicle is already scheduled on the exact same date and time (Simultaneous clash prevention)
    const sameTimeClash = scales.find(s => 
      s.date === date && 
      s.busPrefix && s.busPrefix.trim().toUpperCase() === matchingVehicle.prefix.trim().toUpperCase() &&
      s.time === time
    );
    if (sameTimeClash) {
      return {
        isBlocked: true,
        reason: `Este veículo (${matchingVehicle.prefix}) já está escalado no dia ${date.split('-').reverse().join('/')} às ${time}! (Rota: ${sameTimeClash.line}). Não é permitido duplicidade simultânea no mesmo horário.`
      };
    }

    // Check if the vehicle is already allocated/scheduled on this DATE
    const allocatedCount = scales.filter(s => s.date === date && s.busPrefix && s.busPrefix.trim().toUpperCase() === matchingVehicle.prefix.trim().toUpperCase()).length;
    if (allocatedCount >= 2) {
      const match = scales.find(s => s.date === date && s.busPrefix && s.busPrefix.trim().toUpperCase() === matchingVehicle.prefix.trim().toUpperCase());
      return {
        isBlocked: true,
        reason: `Este veículo (${matchingVehicle.prefix}) já está escalado 02 vezes no dia ${date.split('-').reverse().join('/')}! (Rotas: ${scales.filter(s => s.date === date && s.busPrefix && s.busPrefix.trim().toUpperCase() === matchingVehicle.prefix.trim().toUpperCase()).map(s => `${s.line} às ${s.time}`).join(' | ')}).`
      };
    }
    
    return {
      isBlocked: false,
      reason: "Veículo Ativo e Regularizado."
    };
  }, [matchingVehicle, scales, date, time]);

  // Operational filters to pick only allowed vehicles
  const [typeFilter, setTypeFilter] = useState('TODOS');
  const [brandFilter, setBrandFilter] = useState('TODOS');

  // Filter candidates for Autocomplete/Dropdown
  const candidateVehicles = useMemo(() => {
    return fleet.filter(v => {
      const matchesSearch = 
        v.prefix.includes(scaleSearchQuery) || 
        v.plate.toLowerCase().includes(scaleSearchQuery.toLowerCase());
      
      const matchesType = typeFilter === "TODOS" || v.classification === typeFilter;
      const matchesBrand = brandFilter === "TODOS" || v.brand === brandFilter;

      return matchesSearch && matchesType && matchesBrand;
    });
  }, [fleet, scaleSearchQuery, typeFilter, brandFilter]);

  // Filter and sort the approved routes database based on modal search
  const filteredModalRoutes = useMemo(() => {
    let filtered = APPROVED_ROUTES_DATA;
    if (localRouteSearch.trim()) {
      const searchStr = localRouteSearch.toLowerCase();
      filtered = filtered.filter(r => 
        r.origin.toLowerCase().includes(searchStr) ||
        r.destination.toLowerCase().includes(searchStr) ||
        r.category.toLowerCase().includes(searchStr) ||
        (r.routeNumber && r.routeNumber.includes(searchStr))
      );
    }
    // Maintain chronological sorting!
    return [...filtered].sort((a, b) => a.time.localeCompare(b.time));
  }, [localRouteSearch]);

  // Filter and sort the approved routes database based on main dashboard panel filters
  const filteredPanelRoutes = useMemo(() => {
    let result = APPROVED_ROUTES_DATA;
    
    if (panelOriginFilter !== 'TODOS') {
      result = result.filter(r => r.origin === panelOriginFilter);
    }
    
    if (panelCategoryFilter !== 'TODOS') {
      result = result.filter(r => r.category === panelCategoryFilter);
    }
    
    if (panelSearchQuery.trim()) {
      const q = panelSearchQuery.toLowerCase();
      result = result.filter(r => 
        r.origin.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.time.includes(q)
      );
    }
    
    // Ordered chronologically by departure hour!
    return [...result].sort((a, b) => a.time.localeCompare(b.time));
  }, [panelOriginFilter, panelCategoryFilter, panelSearchQuery]);

  // Group or retrieve daily scales for the selected calendar day based on APPROVED_ROUTES_DATA combined with live scales override.
  const dailyGridScales = useMemo(() => {
    if (viewMode !== 'daily_grid' || !selectedGridDate) return [];

    return filteredPanelRoutes.map(route => {
      // Find matches in the live scales array for the specific date & route
      const liveScale = scales.find(s => {
        if (s.date !== selectedGridDate) return false;
        
        // Match by route ID if defined, otherwise by time + origin/destination
        if (s.routeId && s.routeId === route.id) return true;
        
        const standardComparison = s.time === route.time;
        if (!standardComparison) return false;
        
        const originNorm = route.origin.toLowerCase().trim();
        const destNorm = route.destination.toLowerCase().trim();
        const lineNorm = s.line ? s.line.toLowerCase() : '';
        
        return lineNorm.includes(originNorm) && lineNorm.includes(destNorm);
      });

      if (liveScale) {
        return {
          ...liveScale,
          isLiveOverride: true,
          routeInfo: route
        };
      }

      // Return a virtual/empty placeholder scale representing this vacant schedule of the day!
      return {
        id: `auto-vago-${route.id}-${selectedGridDate}`,
        driverName: "SEM MOTORISTA ESCALADO",
        driversList: [],
        line: `${route.origin} x ${route.destination}`,
        date: selectedGridDate,
        time: route.time,
        busPrefix: "CANC.", // Display as vacant/not set yet
        busPlate: "---",
        classification: route.serviceType,
        isExtra: route.isExtra,
        routeId: route.id,
        isLiveOverride: false,
        routeInfo: route
      };
    });
  }, [viewMode, selectedGridDate, filteredPanelRoutes, scales]);

  // Unique list of origins for filtering
  const uniqueOrigins = useMemo(() => {
    return Array.from(new Set(APPROVED_ROUTES_DATA.map(r => r.origin))).sort();
  }, []);

  const handleSaveScale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchingVehicle) return;

    if (blockCheck?.isBlocked) {
      alert(`[BLOQUEIO DE SEGURANÇA] Impedido de salvar escala: ${blockCheck.reason}`);
      return;
    }

    const activeDrivers = scaleDrivers.filter(d => d.trim() !== '');
    if (activeDrivers.length === 0) {
      alert("Por favor, adicione pelo menos um motorista à escala.");
      return;
    }

    const createdScale: Scale = {
      id: "S-" + Math.floor(100 + Math.random() * 900) + "-" + Date.now().toString().slice(-6),
      driverName: activeDrivers.join(', '),
      driversList: activeDrivers,
      line,
      date,
      time,
      busPrefix: matchingVehicle.prefix,
      busPlate: matchingVehicle.plate,
      classification: matchingVehicle.classification,
      isExtra: isExtraScale,
      routeNumber: scaleRouteNumber
    };

    handleUpdateScalesState([...scales, createdScale]);
    setIsNewScaleOpen(false);
    setScaleDrivers(['']);
    setSelectedPrefix('');
    setScaleSearchQuery('');
    setIsExtraScale(false);
    setScaleRouteNumber('');
  };

  const handleDeleteScale = (id: string) => {
    handleUpdateScalesState(scales.filter(s => s.id !== id));
  };

  return (
    <div className="ScheduleView space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-white">
            Escala Operacional Inteligente
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Controle de viagens impedindo automaticamente o tráfego de frotas com inconformidades.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => setIsSmartSystemOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-emerald-500/20 flex items-center gap-2 font-bold cursor-pointer transition-all active:scale-95"
            title="Abrir o Painel de Turismo e Horário Extra (Extras, Turismo, Agenda Geral e Automação)"
          >
            <Sparkles size={18} className="text-amber-300 animate-pulse" />
            <span>Turismo e Horário Extra</span>
          </button>
          <button 
            onClick={() => setIsMonthlyGridOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 text-white rounded-xl shadow-lg hover:shadow-orange-500/20 flex items-center gap-2 font-bold cursor-pointer transition-all active:scale-95"
            title="Abrir as Escalas de Horários com visualização idêntica ao PDF de 20 páginas"
          >
            <Sparkles size={18} className="text-yellow-200 animate-pulse" />
            <span>Escalas de Horários</span>
          </button>
          <button 
            onClick={() => setIsPrintModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 via-emerald-600 to-green-700 text-white rounded-xl shadow-lg hover:shadow-emerald-500/20 flex items-center gap-2 font-bold cursor-pointer transition-all active:scale-95 border border-emerald-500/20"
            title="Abrir Centro de Impressão e Relatórios de Viagens (Imprimir / Exportar)"
          >
            <Printer size={18} className="text-emerald-100" />
            <span>Imprimir Escala</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Próximas viagens escaladas */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b dark:border-slate-750 pb-3 gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Escalas Operacionais Ativas</h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider font-mono">Divisão e controle por dias de tráfego</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl flex gap-1 border dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode('daily_grid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'daily_grid'
                      ? 'bg-emerald-600 text-white shadow-md font-black'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                  }`}
                >
                  Grade do Dia
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('programmed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'programmed'
                      ? 'bg-emerald-600 text-white shadow-md font-black'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                  }`}
                >
                  Programadas
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'daily_grid' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-2xl border border-emerald-500/10 dark:border-emerald-500/5 gap-3 animate-fade-in">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">Visualizar Dia da Grade:</span>
                <input
                  type="date"
                  value={selectedGridDate}
                  onChange={(e) => setSelectedGridDate(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 px-3 text-xs font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-white cursor-pointer shadow-sm"
                />
              </div>
              <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold px-3 py-1 rounded-lg font-mono">
                📅 Quadro Comercial de Escalas do Dia
              </span>
            </div>
          )}
          
          <div className="space-y-6 max-h-[550px] overflow-y-auto pr-1">
            {viewMode === 'programmed' ? (
              scales.length === 0 ? (
                <p className="text-center py-10 text-slate-400 font-bold">Nenhuma viagem escalada para o período.</p>
              ) : (
                generalScalesByDate.map(group => {
                  const formattedDate = formatDateBrGeneral(group.date);
                  return (
                    <div key={group.date} className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="font-extrabold text-xs text-slate-700 dark:text-slate-350 flex items-center gap-1.5 font-mono">
                          <span>📅 DIA {formattedDate}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold rounded-full">
                            {group.items.length} {group.items.length === 1 ? 'escala' : 'escalas'}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSaveDayScales(group.date, group.items)}
                          className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-extrabold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-700 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer transition-all hover:text-emerald-600 dark:hover:text-emerald-400 hover:scale-102"
                          title="Salvar esta escala diária no gabinete permanente"
                        >
                          <Save size={11} className="text-emerald-500" />
                          <span>Salvar Dia</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {group.items.map((scale, index) => (
                          <div key={`${scale.id}-${index}`} className="p-4 bg-white dark:bg-slate-900/80 hover:bg-slate-100/50 dark:hover:bg-slate-900/90 rounded-xl border border-slate-100 dark:border-slate-850 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm animate-fade-in">
                            <div className="flex items-start gap-4">
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-primary rounded-xl mt-1 sm:mt-0 shrink-0">
                                <Bus size={22} className="text-emerald-600" />
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {(() => {
                                    const isDup = fleet.filter(x => x.prefix === scale.busPrefix).length > 1;
                                    return (
                                      <span className={`p-1 px-1.5 font-mono text-xs rounded font-bold border transition-colors ${
                                        isDup 
                                          ? 'bg-rose-50 text-red-650 border-red-300 dark:bg-rose-950/20 dark:text-red-400 dark:border-red-900 animate-pulse'
                                          : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white border-transparent'
                                      }`}>
                                        Carro {scale.busPrefix}
                                      </span>
                                    );
                                  })()}
                                  <span className="text-xs text-slate-400 font-bold uppercase">{scale.busPlate}</span>
                                  {scale.routeNumber && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 font-bold rounded text-slate-500 dark:text-slate-300">
                                      Linha #{scale.routeNumber}
                                    </span>
                                  )}
                                  {scale.isExtra && (
                                    <span className="text-[9px] font-black bg-purple-500 text-white px-2 py-0.5 rounded uppercase tracking-wider animate-pulse flex items-center gap-0.5">
                                      <Sparkles size={8} /> Viagem Extra
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-base font-extrabold text-slate-800 dark:text-white mt-1">{scale.line}</h4>
                                <p className="text-xs text-slate-500 font-semibold flex items-center gap-3 mt-1 flex-wrap">
                                  <span className="flex items-center gap-1"><Calendar size={13} /> {scale.date}</span>
                                  <span className="flex items-center gap-1"><Clock size={13} /> {scale.time}</span>
                                </p>
                                
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {scale.driversList && scale.driversList.length > 0 ? (
                                    scale.driversList.map((d, index) => (
                                      <span key={index} className="px-2 py-0.5 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 rounded-lg text-[10px] font-extrabold flex items-center gap-1">
                                        <User size={10} className="text-primary" /> {d} {index === 0 ? <span className="text-[8px] text-primary uppercase font-black tracking-wider">(Titular)</span> : <span className="text-[8px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">(Auxiliar)</span>}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="px-2 py-0.5 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 rounded-lg text-[10px] font-extrabold flex items-center gap-1">
                                      <User size={10} className="text-primary" /> {scale.driverName} <span className="text-[8px] text-primary uppercase font-black tracking-wider">(Titular)</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800 justify-between sm:justify-start">
                              <span className="px-2.5 py-1 bg-primary/10 text-primary font-extrabold rounded-lg text-xs">
                                {scale.classification}
                              </span>
                              <button 
                                onClick={() => handleDeleteScale(scale.id)}
                                className="text-red-500 hover:text-red-650 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-colors"
                                title="Excluir Escala"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              /* MODO GRADE DO DIA - UNIFICADO COM AS ESCALAS DE HORÁRIOS */
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/80 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="font-extrabold text-xs text-slate-700 dark:text-slate-350 flex items-center gap-1.5 font-mono">
                    <span>📅 QUADRO DE HORÁRIOS: DIA {formatDateBrGeneral(selectedGridDate)}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-extrabold rounded-full">
                      {dailyGridScales.length} partidas ativas de horários
                    </span>
                  </span>
                  {dailyGridScales.filter(x => x.isLiveOverride).length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleSaveDayScales(selectedGridDate, dailyGridScales.filter(x => x.isLiveOverride))}
                      className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-extrabold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-700 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer transition-all hover:text-emerald-600 dark:hover:text-emerald-400 hover:scale-102"
                      title="Salvar apenas as escalas preenchidas deste dia no arquivo"
                    >
                      <Save size={11} className="text-emerald-500" />
                      <span>Salvar Dia ({dailyGridScales.filter(x => x.isLiveOverride).length})</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {dailyGridScales.length === 0 ? (
                    <p className="text-center py-8 text-slate-400 font-bold">Nenhum horário correspondente aos filtros neste dia.</p>
                  ) : (
                    dailyGridScales.map((scale, index) => {
                      const isVago = !scale.isLiveOverride;
                      const route = scale.routeInfo;
                      return (
                        <div 
                          key={`${scale.id}-${index}`} 
                          className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm ${
                            isVago 
                              ? 'bg-white/40 dark:bg-slate-900/20 border-dashed border-slate-200 dark:border-slate-800' 
                              : 'bg-white dark:bg-slate-900/85 border-slate-100 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl mt-1 sm:mt-0 shrink-0 ${
                              isVago 
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' 
                                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600'
                            }`}>
                              <Bus size={22} />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                {!isVago ? (
                                  <>
                                    {(() => {
                                      const isDup = fleet.filter(x => x.prefix === scale.busPrefix).length > 1;
                                      return (
                                        <span className={`p-1 px-1.5 font-mono text-xs rounded font-bold border transition-colors ${
                                          isDup 
                                            ? 'bg-rose-50 text-red-655 border-red-350 dark:bg-rose-950/20 dark:text-red-400 dark:border-red-900 animate-pulse'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white border-transparent'
                                        }`}>
                                          Carro {scale.busPrefix}
                                        </span>
                                      );
                                    })()}
                                    <span className="text-xs text-slate-400 font-bold uppercase">{scale.busPlate}</span>
                                  </>
                                ) : (
                                  <span className="p-1 px-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-mono text-xs rounded font-bold border border-transparent">
                                    Carro Pendente
                                  </span>
                                )}
                                
                                {route?.routeNumber && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 font-bold rounded text-slate-500 dark:text-slate-300">
                                    Linha #{route.routeNumber}
                                  </span>
                                )}
                                {route?.category && (
                                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                    route.category === 'MARLY' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/50' :
                                    route.category === 'LIDERANÇA' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/50 dark:bg-indigo-950/20 dark:text-indigo-455 dark:border-indigo-900/50' :
                                    route.category === 'JJ TUR' ? 'bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-455 dark:border-amber-900/50' :
                                    'bg-purple-50 text-purple-700 border border-purple-200/50 dark:bg-purple-950/20 dark:text-purple-455 dark:border-purple-900/50'
                                  }`}>
                                    {route.category}
                                  </span>
                                )}
                                {route?.isExtra && (
                                  <span className="text-[9px] font-black bg-purple-500 text-white px-2 py-0.5 rounded uppercase tracking-wider animate-pulse flex items-center gap-0.5">
                                    <Sparkles size={8} /> Viagem Extra
                                  </span>
                                )}
                              </div>
                              
                              <h4 className={`text-base font-extrabold mt-1 ${isVago ? 'text-slate-400 dark:text-slate-500 font-semibold' : 'text-slate-800 dark:text-white'}`}>{scale.line}</h4>
                              
                              <p className="text-xs text-slate-400 font-semibold flex items-center gap-3 mt-1 flex-wrap font-mono">
                                <span className="flex items-center gap-1"><Calendar size={13} /> {scale.date}</span>
                                <span className="flex items-center gap-1"><Clock size={13} /> {scale.time}</span>
                              </p>
                              
                              {/* Driver Assignment details */}
                              <div className="mt-2.5">
                                {!isVago ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {scale.driversList && scale.driversList.length > 0 ? (
                                      scale.driversList.map((d, index) => (
                                        <span key={index} className="px-2 py-0.5 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 rounded-lg text-[10px] font-extrabold flex items-center gap-1">
                                          <User size={10} className="text-primary" /> {d} {index === 0 ? <span className="text-[8px] text-primary uppercase font-black tracking-wider">(Titular)</span> : <span className="text-[8px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">(Auxiliar)</span>}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="px-2 py-0.5 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 rounded-lg text-[10px] font-extrabold flex items-center gap-1">
                                        <User size={10} className="text-primary" /> {scale.driverName} <span className="text-[8px] text-primary uppercase font-black tracking-wider">(Titular)</span>
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-lg text-[10px] font-extrabold inline-flex items-center gap-1">
                                    ⚠️ Motorista Pendente
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800 justify-between sm:justify-start">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                              isVago 
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' 
                                : 'bg-primary/10 text-primary'
                            }`}>
                              {scale.classification}
                            </span>
                            
                            {isVago ? (
                              <button 
                                onClick={() => {
                                  if (route) {
                                    setLine(`${route.origin} x ${route.destination}`);
                                    setTime(route.time);
                                    setIsExtraScale(route.isExtra);
                                    setScaleRouteNumber(route.routeNumber || '');
                                    setDate(selectedGridDate);
                                    setIsNewScaleOpen(true);
                                  }
                                }}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 font-black text-xs rounded-xl border border-emerald-200/50 dark:border-emerald-900/50 cursor-pointer flex items-center gap-1.5 transition-all hover:scale-102"
                                title="Criar escala para este horário vago do dia"
                              >
                                <Plus size={12} />
                                <span>Escalar</span>
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleDeleteScale(scale.id)}
                                className="text-red-500 hover:text-red-650 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-colors"
                                title="Remover Escala"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coluna Lateral de Auditoria e Escalas Salvas */}
        <div className="space-y-6">
          {/* Quadro informativo de segurança */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ShieldAlert size={18} className="text-red-500 animate-pulse" />
              <span>Auditoria de Segurança ANTT</span>
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              O algoritmo de tráfego do Grupo Liderança não permite a escalabilidade de veículos sem as vistorias ANTT válidas ou em conserto mecânico.
            </p>
            <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-200 dark:border-red-900/50 space-y-1.5">
              <h4 className="text-xs font-black text-red-700 dark:text-red-400 uppercase tracking-wider">Restrições ativas</h4>
              <ul className="text-xs text-red-600 dark:text-red-300 space-y-1.5 list-disc list-inside font-bold">
                <li>"NÃO TEM VISTORIA" no cadastro</li>
                <li>Selo ANTT fora da validade</li>
                <li>Prefixo operacional em manutenção</li>
                <li>Status inativo no Almoxarifado</li>
              </ul>
            </div>
          </div>

          {/* Gabinete de Escalas Salvas / Arquivo de Escalas por Dia */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b dark:border-slate-750 pb-2">
              <h2 className="text-md font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="text-base">📂</span>
                <span>Gabinete de Escalas Salvas</span>
              </h2>
              <div className="flex items-center gap-2">
                {archivedSheets.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Deseja realmente apagar todo o histórico de escalas salvas e impressas? Esta ação é irreversível.")) {
                        setArchivedSheets([]);
                        localStorage.removeItem('bc_printed_scales_archive');
                        setRestoredScalesOverride(null);
                      }
                    }}
                    className="text-[10px] text-red-650 hover:text-red-750 dark:text-red-400 dark:hover:text-red-350 hover:underline font-extrabold transition-all cursor-pointer flex items-center gap-1 bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded border border-red-200/50 dark:border-red-900/30"
                    title="Remover todo o Histórico"
                  >
                    🗑️ Limpar tudo
                  </button>
                )}
                <span className="text-[10px] bg-emerald-55 border border-emerald-200 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-450 dark:border-emerald-900 font-extrabold px-2 py-0.5 rounded-full font-mono">
                  {archivedSheets.length} DIA{archivedSheets.length === 1 ? '' : 'S'}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-450 leading-relaxed font-semibold">
              Cada cópia salva do dia armazena uma versão offline das escalas operacionais. Use para re-imprimir ou restaurar escalas de datas anteriores.
            </p>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
              {archivedSheets.length === 0 ? (
                <div className="p-5 text-center text-slate-400 border-2 border-dashed border-slate-150 dark:border-slate-705 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20">
                  <span className="text-2xl block mb-1">📁</span>
                  <p className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Nenhum dia arquivado ainda.</p>
                  <p className="text-[10px] text-slate-450 font-bold mt-1 leading-snug">Ao lado de cada dia nas escalas ativas, clique em "Salvar Dia" para guardar cópias permanentes aqui.</p>
                </div>
              ) : (
                archivedSheets.map(sheet => {
                  const isSelected = restoredScalesOverride && restoredScalesOverride.length === sheet.scalesList.length && restoredScalesOverride[0]?.id === sheet.scalesList[0]?.id;
                  return (
                    <div 
                      key={sheet.id}
                      className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                        isSelected 
                          ? 'bg-emerald-50/60 border-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-800 ring-2 ring-emerald-400/20 shadow-sm' 
                          : 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-750 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-extrabold text-slate-850 dark:text-slate-200 line-clamp-1 block text-xs leading-tight" title={sheet.title}>
                            {sheet.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("Deseja realmente apagar esta cópia salva do seu arquivo histórico?")) {
                                setArchivedSheets(prev => {
                                  const updated = prev.filter(x => x.id !== sheet.id);
                                  localStorage.setItem('bc_printed_scales_archive', JSON.stringify(updated));
                                  return updated;
                                });
                                if (isSelected) setRestoredScalesOverride(null);
                              }
                            }}
                            className="text-slate-400 hover:text-red-500 font-bold p-0.5 ml-1 select-none cursor-pointer text-xs"
                            title="Excluir Cópia"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1 font-mono">🕒 Registro: {sheet.timestamp}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                          🚌 {sheet.scalesCount} {sheet.scalesCount === 1 ? 'viagem cadastrada' : 'viagens cadastradas'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-200/50 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setRestoredScalesOverride(null);
                            } else {
                              setRestoredScalesOverride(sheet.scalesList);
                              setIsPrintModalOpen(true);
                            }
                          }}
                          className={`py-1.5 px-2 rounded-lg text-center font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
                          }`}
                          title="Visualizar na folha oficial de impressão PDF"
                        >
                          {isSelected ? '✓ No PDF' : '👁️ Ver PDF'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOverwriteWithSavedSheet(sheet)}
                          className="py-1.5 px-2 rounded-lg text-center font-extrabold text-[10px] uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-950/60 transition-all cursor-pointer"
                          title="Fazer esta escala salva se tornar a escala de trabalho ativa novamente"
                        >
                          🔄 Restaurar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* PAINEL DE LINHAS E HORÁRIOS HOMOLOGADOS */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b dark:border-slate-700 pb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Map size={22} className="text-primary" />
              <span>Painel de Linhas &amp; Horários Homologados (Dicionário ANTT)</span>
            </h2>
            <p className="text-xs text-slate-400 font-bold mt-1">
              Catálogo regional de itinerários aprovados para Expresso Marly, Grupo Liderança e JJ Tur.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-slate-500 bg-slate-100 dark:bg-slate-700/50 dark:text-slate-300 px-3 py-1 rounded-full font-mono">
              Total: {APPROVED_ROUTES_DATA.length} Itinerários Regulamentados
            </span>
          </div>
        </div>

        {/* Filtros Inteligentes do Painel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Busca por Itinerário */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Pesquisa Rápida</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Ex: Goiânia, 06:00, Porangatu, etc..."
                value={panelSearchQuery}
                onChange={(e) => setPanelSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Origem / Cidade */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Filtro por Origem/Cidade</label>
            <select
              value={panelOriginFilter}
              onChange={(e) => setPanelOriginFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-xs outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
            >
              <option value="TODOS">Todas as Origens ({uniqueOrigins.length})</option>
              {uniqueOrigins.map(origin => (
                <option key={origin} value={origin}>{origin}</option>
              ))}
            </select>
          </div>

          {/* Categoria / Empresa */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Filtro por Categoria</label>
            <div className="flex gap-1.5 flex-wrap">
              {['TODOS', 'MARLY', 'LIDERANÇA', 'JJ TUR', 'EXTRA'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPanelCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    panelCategoryFilter === cat 
                      ? "bg-primary text-white" 
                      : "bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid de Itinerários Encontrados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin">
          {filteredPanelRoutes.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 font-bold">
              Nenhuma rota homologada corresponde aos filtros informados.
            </div>
          ) : (
            filteredPanelRoutes.map((r, idx) => {
              return (
                <div 
                  key={r.id + "-" + idx}
                  className="p-4 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100/50 dark:hover:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between gap-3 transition-colors group"
                >
                  <div>
                    {/* Linha superior: Hora e Categoria */}
                    <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-black text-primary font-mono tracking-tight bg-primary/5 dark:bg-primary/10 px-2.5 py-1 rounded-lg">
                          {r.time}
                        </span>
                        {r.routeNumber && (
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-700 font-mono px-2 py-0.5 rounded text-slate-500 dark:text-slate-400 font-bold">
                            Linha #{r.routeNumber}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${
                          r.category === 'MARLY' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800' :
                          r.category === 'LIDERANÇA' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-800' :
                          r.category === 'JJ TUR' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800' :
                          'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800'
                        }`}>
                          {r.category}
                        </span>
                        {r.isExtra && (
                          <span className="text-[8px] font-black bg-purple-500 text-white px-1.5 py-1 rounded-md tracking-wider uppercase animate-pulse">
                            EXTRA
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Cidade de Origem & Destino */}
                    <div className="mt-3">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Rota Operacional</div>
                      <div className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5 group-hover:text-primary transition-colors flex-wrap">
                        <span>{r.origin}</span>
                        <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        <span>{r.destination}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-1.5 items-center flex-wrap">
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold px-2 py-0.5 rounded-lg border dark:border-slate-750">
                        {r.serviceType}
                      </span>
                      {r.isExtra && (
                        <span className="text-[9px] bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 font-extrabold px-2 py-0.5 rounded-lg border border-purple-200/30 dark:border-purple-900/30">
                          Viagem Extra Vinculada
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ação de Agendamento Rápido */}
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setLine(`${r.origin} x ${r.destination}`);
                        setTime(r.time);
                        setIsExtraScale(r.isExtra);
                        setScaleRouteNumber(r.routeNumber || '');
                        setIsNewScaleOpen(true);
                      }}
                      className="w-full py-2 bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 hover:bg-primary/10 text-slate-700 dark:text-slate-350 hover:text-primary dark:hover:text-white border border-slate-200/55 dark:border-slate-700/50 rounded-xl text-[11px] font-extrabold cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Plus size={12} /> Escalar Nova Viagem para Rota
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL CRIAR ESCALA */}
      <AnimatePresence>
        {isNewScaleOpen && (
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
                  <span>Montar Escala de Linha</span>
                </h2>
                <button 
                  onClick={() => setIsNewScaleOpen(false)}
                  className="font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveScale} className="space-y-6">
                {/* Linha Operacional Regulamentada */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Linha e Rota Operacional *</label>
                    <span className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1">
                      <Sparkles size={11} className="text-primary" /> Sugestões de Horários Homologados
                    </span>
                  </div>

                  {/* Campo Pesquisa de Rotas integradas ou Digitação Manual */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Caminho / Linha</span>
                      <input 
                        type="text" 
                        placeholder="Ex: GOIÂNIA-GO x PORANGATU"
                        value={line}
                        onChange={(e) => {
                          setLine(e.target.value);
                          // Encontrar se é uma rota aprovada para sincronizar metadados
                          const found = APPROVED_ROUTES_DATA.find(r => `${r.origin} x ${r.destination}` === e.target.value);
                          if (found) {
                            setTime(found.time);
                            setIsExtraScale(found.isExtra);
                            setScaleRouteNumber(found.routeNumber || '');
                          }
                        }}
                        required
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Tipo de Serviço</span>
                      <div className="flex gap-2 items-center h-10">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isExtraScale} 
                            onChange={(e) => setIsExtraScale(e.target.checked)}
                            className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                          />
                          <span>Viagem Extra</span>
                        </label>
                        {scaleRouteNumber && (
                          <span className="text-[10px] font-mono px-2 py-1 bg-slate-100 dark:bg-slate-700 font-bold rounded text-slate-500 dark:text-slate-300">
                            Linha #{scaleRouteNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rápido Buscador de Horários/Linhas */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border dark:border-slate-700/50 space-y-3">
                    <div className="flex justify-between items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Buscar do Catálogo de Horários (Marly / Liderança / JJ)</span>
                      <input 
                        type="text" 
                        placeholder="Pesquisar por origem, destino ou empresa..."
                        value={localRouteSearch}
                        onChange={(e) => setLocalRouteSearch(e.target.value)}
                        className="px-3 py-1 bg-white dark:bg-slate-850 border dark:border-slate-700 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/10 dark:text-white"
                      />
                    </div>

                    <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                      {filteredModalRoutes.length === 0 ? (
                        <p className="text-[11px] text-slate-400 font-bold py-2 text-center">Nenhuma rota regulamentada encontrada.</p>
                      ) : (
                        filteredModalRoutes.map((r) => {
                          const routeStr = `${r.origin} x ${r.destination}`;
                          const isSelected = line === routeStr && time === r.time;
                          return (
                            <div 
                              key={r.id}
                              onClick={() => {
                                setLine(routeStr);
                                setTime(r.time);
                                setIsExtraScale(r.isExtra);
                                setScaleRouteNumber(r.routeNumber || '');
                              }}
                              className={`p-2 border rounded-xl flex items-center justify-between text-xs font-bold cursor-pointer transition-all ${
                                isSelected 
                                  ? "bg-primary/10 border-primary text-primary" 
                                  : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
                                  {r.time}
                                </span>
                                {r.routeNumber && (
                                  <span className="text-[9px] text-slate-400 font-mono">#{r.routeNumber}</span>
                                )}
                                <span>{r.origin} ➔ {r.destination}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                                  r.category === 'MARLY' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800' :
                                  r.category === 'LIDERANÇA' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-800' :
                                  r.category === 'JJ TUR' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800' :
                                  'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800'
                                }`}>
                                  {r.category}
                                </span>
                                {r.isExtra && (
                                  <span className="text-[8px] font-black bg-purple-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                    EXTRA
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Motoristas da Escala (Suporta de 1 até 6 Motoristas) */}
                <div className="space-y-4 p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border dark:border-slate-700/50">
                  <div className="flex justify-between items-center pb-2 border-b dark:border-slate-700/50">
                    <div>
                      <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Escala Multi-Motorista (Grupo Liderança / Expresso Marly / JJ Tur)
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold">
                        Permite escalar de 1 até 6 motoristas na mesma rota se necessário.
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-primary px-3 py-1 bg-primary/10 rounded-full font-mono">
                      {scaleDrivers.length} / 6
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {scaleDrivers.map((drvName, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <span className="text-[11px] font-extrabold text-slate-400 w-20">
                          {idx === 0 ? "Titular:" : `Co-Piloto ${idx}:`}
                        </span>
                        <div className="flex-1 relative">
                          <input 
                            type="text" 
                            list={`drivers-list-${idx}`}
                            placeholder="Selecione ou digite o nome do motorista..."
                            value={drvName}
                            onChange={(e) => {
                              const updated = [...scaleDrivers];
                              updated[idx] = e.target.value;
                              setScaleDrivers(updated);
                            }}
                            required
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                          />
                          <datalist id={`drivers-list-${idx}`}>
                            {drivers && drivers.map(d => (
                              <option key={d.id} value={d.name}>{d.name} ({d.unidade})</option>
                            ))}
                          </datalist>
                        </div>
                        {scaleDrivers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setScaleDrivers(scaleDrivers.filter((_, i) => i !== idx));
                            }}
                            className="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl cursor-pointer transition-colors"
                            title="Remover motorista desta posição"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {scaleDrivers.length < 6 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setScaleDrivers([...scaleDrivers, '']);
                      }}
                      className="w-full py-2.5 border-2 border-dashed border-primary/25 hover:border-primary/50 text-primary hover:text-primary-dark font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer bg-white dark:bg-slate-800 transition-colors"
                    >
                      <Plus size={14} /> Adicionar Motorista Auxiliar / Co-piloto
                    </button>
                  ) : (
                    <p className="text-[10px] text-amber-500 dark:text-amber-400 font-bold text-center bg-amber-50 dark:bg-amber-950/20 py-1.5 rounded-lg border border-amber-250/20">
                      ⚠️ Limite de segurança atingido. Máximo de 6 motoristas permitidos por veículo na ANTT.
                    </p>
                  )}
                </div>

                {/* Data e Hora */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Data Viagem *</label>
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Horário Partida *</label>
                    <input 
                      type="time" 
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-sm outline-none font-semibold focus:ring-2 focus:ring-primary/20 dark:text-white"
                    />
                  </div>
                </div>

                {/* Seletor com Busca de Veículos Ativos e Bloqueio Automático */}
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border dark:border-slate-700/50">
                  <div className="flex justify-between items-center border-b dark:border-slate-700 pb-2 flex-wrap gap-2">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Escala Inteligente de Veículo</span>
                    <div className="flex gap-2 text-[10px] font-bold">
                      <select 
                        value={typeFilter} 
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="bg-white dark:bg-slate-800 p-1 border dark:border-slate-700 rounded dark:text-white"
                      >
                        <option value="TODOS">Todas Classes</option>
                        <option value="Executivo">Executivo</option>
                        <option value="Semi Leito">Semi Leito</option>
                        <option value="Leito Cama">Leito Cama</option>
                        <option value="Leito Total">Leito Total</option>
                      </select>
                    </div>
                  </div>

                  {/* Input de Pesquisa Rápida */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text"
                      placeholder="Pesquisar por prefixo ou placa do ônibus..."
                      value={scaleSearchQuery}
                      onChange={(e) => setScaleSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
                    />
                  </div>

                  {/* Candidates List with autocomplete style */}
                  <div className="max-h-36 overflow-y-auto border border-slate-100 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 p-2 space-y-1">
                    {candidateVehicles.slice(0, 10).map((v) => {
                      const isMaintenance = v.statusOperacional === "MANUTENÇÃO";
                      const isDocFail = v.situationAntt === "VENCIDO" || v.situationAntt === "NÃO TEM VISTORIA";
                      const isRestricted = isMaintenance || isDocFail;
                      const crono = getCronoDetails(v);

                      return (
                        <div 
                          key={`${v.prefix}-${v.plate}`}
                          onClick={() => setSelectedPrefix(v.prefix)}
                          className={`flex justify-between items-center p-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            selectedPrefix === v.prefix 
                              ? "bg-primary text-white" 
                              : "hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {(() => {
                            const isDup = fleet.filter(x => x.prefix === v.prefix).length > 1;
                            const isSelected = selectedPrefix === v.prefix;
                            return (
                              <div className="flex items-center gap-1.5">
                                <span className={`font-mono transition-colors ${
                                  isDup && !isSelected 
                                    ? "text-red-500 font-black animate-pulse" 
                                    : ""
                                }`}>
                                  Prefixo: {v.prefix} ({v.plate}) {isDup && "⚠️ [Duplicado]"}
                                </span>
                                {crono.isExpiringSoon && (
                                  <span className="text-amber-500 flex items-center" title={`Crono vencendo em ${crono.daysRemaining} dias (${crono.formattedDate})`}>
                                    <AlertTriangle size={13} className="animate-pulse" />
                                  </span>
                                )}
                                {crono.isAlreadyExpired && (
                                  <span className="text-rose-500 flex items-center" title={`Crono VENCIDO (${crono.formattedDate})`}>
                                    <AlertTriangle size={13} />
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                          <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                            {v.classification} • {isRestricted ? "⚠️ Bloqueável" : "Regular"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SINALIZADORES DE ALERTA DO BLOQUEIO AUTOMÁTICO */}
                {matchingVehicle && (
                  <div className="space-y-2">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl flex items-start gap-3 border ${
                        blockCheck?.isBlocked 
                          ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900" 
                          : "bg-green-50 dark:bg-green-950/25 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50"
                      }`}
                    >
                      {blockCheck?.isBlocked ? (
                        <XCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5 animate-bounce" />
                      ) : (
                        <CheckCircle size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-extrabold text-sm uppercase tracking-wider">
                          {blockCheck?.isBlocked ? "Escala Impedida por Bloqueio ANTT" : "Frota Aprovada e Liberada"}
                        </h4>
                        <p className="text-xs font-medium mt-1">
                          {blockCheck?.reason}
                        </p>
                      </div>
                    </motion.div>

                    {/* ALERTA CRONOTACÓGRAFO VENCENDO NOS PRÓXIMOS 30 DIAS */}
                    {(() => {
                      const crono = getCronoDetails(matchingVehicle);
                      if (crono.isExpiringSoon) {
                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-start gap-3 text-xs shadow-sm"
                          >
                            <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
                            <div>
                              <span className="font-bold uppercase tracking-wider block text-[10px] text-amber-700 dark:text-amber-400">Aviso de Cronotacógrafo Próximo do Vencimento</span>
                              <p className="font-semibold mt-0.5 text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                                O instrumento cronotacógrafo deste veículo ({matchingVehicle.prefix}) vence em <strong>{crono.daysRemaining} dias</strong> (Data: {crono.formattedDate}). Programe a renovação brevemente.
                              </p>
                            </div>
                          </motion.div>
                        );
                      }
                      if (crono.isAlreadyExpired) {
                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 rounded-xl flex items-start gap-3 text-xs shadow-sm"
                          >
                            <AlertTriangle size={18} className="text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5 animate-bounce" />
                            <div>
                              <span className="font-bold uppercase tracking-wider block text-[10px] text-rose-700 dark:text-rose-400">Aviso de Cronotacógrafo VENCIDO</span>
                              <p className="font-semibold mt-0.5 text-[11px] leading-relaxed text-rose-800 dark:text-rose-300">
                                O instrumento cronotacógrafo deste veículo ({matchingVehicle.prefix}) já está <strong>VENCIDO</strong> desde {crono.formattedDate}. Recomenda-se a imediata regularização técnica.
                              </p>
                            </div>
                          </motion.div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}

                {/* Botões do Formulário */}
                <div className="flex gap-3 justify-end pt-4 border-t dark:border-slate-700">
                  <button 
                    type="button"
                    onClick={() => setIsNewScaleOpen(false)}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 rounded-xl text-sm font-bold cursor-pointer transition-all"
                  >
                    Retroceder
                  </button>
                  <button 
                    type="submit"
                    disabled={blockCheck?.isBlocked === true || scaleDrivers.filter(d => d.trim() !== '').length === 0 || !selectedPrefix}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <Save size={16} /> Salvar Escala no Tráfego
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE VISUALIZAÇÃO E IMPRESSÃO EM PDF */}
      <AnimatePresence>
        {isPrintModalOpen && !isMinimized && (
          <div className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 select-none overflow-y-auto print-modal-overlay ${isMaximized ? 'p-0' : 'p-4'}`}>
            <style>{`
              @media print {
                @page {
                  size: A4 ${printOrientation};
                  margin: 12mm 10mm 12mm 10mm;
                }
                /* Hide standard application panels and background overlays on native print page */
                body * {
                  visibility: hidden;
                }
                #print-ready-sheet-wrapper, #print-ready-sheet-wrapper * {
                  visibility: visible;
                }
                #print-ready-sheet-wrapper {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  display: block !important;
                  width: 100% !important;
                  height: auto !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  border: none !important;
                  box-shadow: none !important;
                  background: white !important;
                  color: #000000 !important;
                }
                header, nav, aside, footer, .no-print, button, .app-sidebar, .app-header {
                  display: none !important;
                  visibility: hidden !important;
                }
                body, html, #root {
                  background: white !important;
                  color: #000000 !important;
                  height: auto !important;
                  overflow: visible !important;
                }
                tr {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                }
                /* Avoid splitting signature blocks between pages */
                .signature-block-print {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                }
                .BrandLogo {
                  width: 80px !important;
                  max-width: 80px !important;
                  min-width: 80px !important;
                  height: auto !important;
                  display: flex !important;
                  flex-direction: row !important;
                  align-items: center !important;
                  justify-content: flex-start !important;
                  background: transparent !important;
                  background-color: transparent !important;
                  border: none !important;
                  outline: none !important;
                  padding: 0 !important;
                  padding-left: 0 !important;
                  padding-right: 0 !important;
                  padding-top: 0 !important;
                  padding-bottom: 0 !important;
                  margin: 0 !important;
                  margin-left: 0 !important;
                  margin-right: 0 !important;
                  margin-top: 0 !important;
                  margin-bottom: 0 !important;
                  box-shadow: none !important;
                  transform: none !important;
                  transition: none !important;
                  animation: none !important;
                }
                .BrandLogo:hover {
                  transform: none !important;
                  animation: none !important;
                  box-shadow: none !important;
                }
                .BrandLogo svg, .BrandLogo img {
                  width: 24px !important;
                  height: 24px !important;
                  min-width: 24px !important;
                  min-height: 24px !important;
                  max-width: 24px !important;
                  max-height: 24px !important;
                  transform: none !important;
                  animation: none !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
                .BrandLogo span {
                  font-size: 11px !important;
                  line-height: normal !important;
                  letter-spacing: 0.05em !important;
                  color: #0f172a !important;
                  transform: none !important;
                  animation: none !important;
                  font-weight: 800 !important;
                }
              }
            `}</style>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-slate-100 dark:bg-slate-900 flex flex-col shadow-2xl border dark:border-slate-800 transition-all duration-200 ${
                isMaximized ? 'w-screen h-screen max-w-none max-h-screen rounded-none border-none' : 'rounded-3xl max-w-5xl w-full max-h-[95vh]'
              }`}
            >
              {/* Barra de Título Exclusiva de Janela (Estilo Utilitário Premium) */}
              <div className={`no-print select-none px-4 py-2 bg-slate-900 dark:bg-slate-950 text-slate-300 text-[11px] font-mono font-bold flex justify-between items-center border-b border-slate-950 ${isMaximized ? 'rounded-none' : 'rounded-t-3xl'}`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">📄</span>
                  <span className="tracking-wide">Gabinete de Saída (Impressor de Escalas)</span>
                  {isMaximized && (
                    <span className="text-[9px] bg-slate-800 text-slate-200 border border-slate-700 font-extrabold px-1.5 rounded uppercase tracking-widest animate-pulse ml-2">
                      Tela Cheia
                    </span>
                  )}
                </div>
                
                {/* Botões de Controle de Janela (Janela Operacional) */}
                <div className="flex items-center gap-2">
                  {/* Minimizar */}
                  <button
                    type="button"
                    onClick={() => setIsMinimized(true)}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors flex items-center justify-center cursor-pointer"
                    title="Minimizar (reduzir à bandeja)"
                  >
                    <Minus size={13} className="stroke-[2.5]" />
                  </button>
                  
                  {/* Maximizar / Restaurar */}
                  <button
                    type="button"
                    onClick={() => setIsMaximized(!isMaximized)}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors flex items-center justify-center cursor-pointer"
                    title={isMaximized ? "Restaurar tamanho padrão" : "Maximizar em tela cheia"}
                  >
                    {isMaximized ? (
                      <Minimize2 size={13} className="stroke-[2.5]" />
                    ) : (
                      <Maximize2 size={13} className="stroke-[2.5]" />
                    )}
                  </button>
                  
                  {/* Fechar */}
                  <button
                    type="button"
                    onClick={handleClosePrintModal}
                    className="p-1 text-slate-400 hover:text-white hover:bg-rose-600 rounded transition-colors flex items-center justify-center cursor-pointer"
                    title="Fechar Janela"
                  >
                    <X size={13} className="stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Barra de Ações Superior (Não sai na impressão) */}
              <div className="p-4 bg-white dark:bg-slate-850 border-b dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-t-none no-print">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-primary dark:text-emerald-400 rounded-xl">
                    <Printer size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800 dark:text-white">Impressão e Exportação de Escalas (PDF)</h3>
                    <p className="text-[11px] text-slate-450 font-bold">Use os filtros em tempo real abaixo para lapidar e personalizar o documento oficial antes de imprimir.</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Controles de Zoom Operacionais */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-1 gap-1 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors flex items-center justify-center"
                      title="Diminuir Zoom (-10%)"
                    >
                      <ZoomOut size={14} className="stroke-[2.5]" />
                    </button>
                    <span className="text-[11px] font-mono font-black text-slate-700 dark:text-slate-200 px-1 min-w-[45px] text-center select-none">
                      {zoomLevel}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(prev => Math.min(200, prev + 10))}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors flex items-center justify-center"
                      title="Aumentar Zoom (+10%)"
                    >
                      <ZoomIn size={14} className="stroke-[2.5]" />
                    </button>
                    {zoomLevel !== 100 && (
                      <button
                        type="button"
                        onClick={() => setZoomLevel(100)}
                        className="px-2 py-1 text-[9px] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg cursor-pointer transition-colors font-extrabold uppercase"
                        title="Restaurar tamanho original (100%)"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerPrint()}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl shadow-lg flex items-center gap-2 text-xs font-black cursor-pointer transition-all active:scale-95 border border-emerald-500/25"
                    title="Imprimir Escala (Dispara a impressação nativa ou gera PDF)"
                  >
                    <Printer size={15} className="text-emerald-100" />
                    <span>Imprimir Escala (Impressora)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadPDFDirectly('landscape')}
                    disabled={isGeneratingPDF}
                    className={`px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-black cursor-pointer transition-all active:scale-95 text-white ${
                      isGeneratingPDF 
                        ? 'bg-emerald-700/60 cursor-not-allowed animate-pulse' 
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                    title="Baixar em orientação Paisagem (melhor para tabelas largas)"
                  >
                    <Download size={15} className={isGeneratingPDF ? "animate-bounce" : ""} />
                    <span>{isGeneratingPDF ? 'Gerando PDF...' : 'Baixar PDF Paisagem'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadPDFDirectly('portrait')}
                    disabled={isGeneratingPDF}
                    className={`px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-150 flex items-center gap-2 text-xs font-bold cursor-pointer transition-all active:scale-95 disabled:opacity-40`}
                    title="Baixar em orientação Retrato padrão"
                  >
                    <Download size={15} />
                    <span>Baixar PDF Retrato</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClosePrintModal}
                    className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-250 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-black rounded-xl cursor-pointer transition-all border dark:border-slate-750"
                  >
                    Fechar Visualização
                  </button>
                </div>
              </div>

              {/* Filtros em Tempo Real do PDF (NÃO IMPRIMÍVEIS) */}
              <div className="p-4 mt-2 bg-slate-50 dark:bg-slate-800/60 border-b dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs font-bold no-print">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pesquisa Operacional (Busca Dinâmica)</label>
                  <input
                    type="text"
                    value={printSearch}
                    onChange={(e) => setPrintSearch(e.target.value)}
                    placeholder="Filtrar por Carro, Placa, Linha, Motorista..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/25"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">Filtrar Categoria</label>
                  <select
                    value={printScaleType}
                    onChange={(e) => setPrintScaleType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/25"
                  >
                    <option value="ALL">Todas as Escalas (Regulares & Extras)</option>
                    <option value="REGULAR">Apenas Escalas Regulares (Linha Fixa)</option>
                    <option value="EXTRA">Apenas Escalas Extras (Viagens de Reforço)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">Origem ou Cidade Corrente</label>
                  <select
                    value={printCity}
                    onChange={(e) => setPrintCity(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/25"
                  >
                    <option value="TODOS">Todas as Cidades e Regiões</option>
                    {uniquePrintCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">Modo de Impressão</label>
                  <select
                    value={printScope}
                    onChange={(e) => setPrintScope(e.target.value as 'ALL' | 'SINGLE')}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/25 font-bold"
                  >
                    <option value="ALL">Todo Período (Mês)</option>
                    <option value="SINGLE">Dia Único</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">Orientação da Página</label>
                  <select
                    value={printOrientation}
                    onChange={(e) => setPrintOrientation(e.target.value as 'portrait' | 'landscape')}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/25 font-bold"
                  >
                    <option value="landscape">Paisagem (Horizontal)</option>
                    <option value="portrait">Retrato (Vertical)</option>
                  </select>
                </div>

                {printScope === 'SINGLE' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">Data Escolhida</label>
                    <select
                      value={printSelectedDate}
                      onChange={(e) => setPrintSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-850 dark:text-emerald-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/25 font-black uppercase"
                    >
                      {uniquePrintDates.length === 0 ? (
                        <option value="">Nenhuma Data Ativa</option>
                      ) : (
                        uniquePrintDates.map(dateStr => {
                          const parts = dateStr.split('-');
                          const formattedBrDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
                          return (
                            <option key={dateStr} value={dateStr}>
                              {formattedBrDate}
                            </option>
                          );
                        })
                      )}
                    </select>
                  </div>
                )}
              </div>

              {/* HISTÓRICO E ARQUIVO DE ESCALAS SALVAS NA NUVEM LOCAL */}
              {archivedSheets.length > 0 && (
                <div className="mx-6 mt-3 p-4 bg-white dark:bg-slate-850 rounded-2xl border dark:border-slate-800 text-xs no-print shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📂</span>
                      <div>
                        <h4 className="font-extrabold text-slate-800 dark:text-white">Histórico de Escalas Salvas &amp; Impressas ({archivedSheets.length})</h4>
                        <p className="text-[10px] text-slate-450 font-bold">Cada escala impressa ou baixada gera uma cópia histórica que você pode revisar, carregar ou re-imprimir a qualquer momento.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {restoredScalesOverride ? (
                        <button
                          type="button"
                          onClick={() => setRestoredScalesOverride(null)}
                          className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 font-extrabold rounded-lg hover:bg-rose-105 transition-colors cursor-pointer flex items-center gap-1 shadow-sm text-[11px]"
                        >
                          ← Voltar à Escala Atual
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full uppercase tracking-wider">Mostrando Escala Dinâmica</span>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Deseja realmente apagar todo o histórico de escalas salvas e impressas? Esta ação é irreversível.")) {
                            setArchivedSheets([]);
                            localStorage.removeItem('bc_printed_scales_archive');
                            setRestoredScalesOverride(null);
                          }
                        }}
                        className="px-3 py-1.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 font-extrabold rounded-lg hover:bg-red-100 transition-colors cursor-pointer flex items-center gap-1 shadow-sm text-[11px]"
                      >
                        🗑️ Limpar Histórico de Escalas
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[160px] overflow-y-auto scrollbar-thin pr-1">
                    {archivedSheets.map(sheet => {
                      const isSelected = restoredScalesOverride && restoredScalesOverride.length === sheet.scalesList.length && restoredScalesOverride[0]?.id === sheet.scalesList[0]?.id;
                      return (
                        <div 
                          key={sheet.id} 
                          className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                            isSelected 
                              ? 'bg-emerald-50/70 border-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-800 ring-2 ring-emerald-400/20 shadow-sm' 
                              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-extrabold text-slate-800 dark:text-slate-205 line-clamp-1 block text-[11px] leading-tight" title={sheet.title}>
                                {sheet.title}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm("Deseja realmente excluir este relatório do histórico permanente?")) {
                                    setArchivedSheets(prev => {
                                      const updated = prev.filter(x => x.id !== sheet.id);
                                      localStorage.setItem('bc_printed_scales_archive', JSON.stringify(updated));
                                      return updated;
                                    });
                                    if (isSelected) {
                                      setRestoredScalesOverride(null);
                                    }
                                  }
                                }}
                                className="text-slate-400 hover:text-red-500 font-bold p-0.5 ml-1 select-none cursor-pointer"
                                title="Excluir do Histórico"
                              >
                                ✕
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-450 mt-1 font-mono">{sheet.timestamp}</p>
                            <p className="text-[10px] text-slate-600 dark:text-slate-350 font-bold shrink-0 mt-0.5">
                              📦 {sheet.scalesCount} escalas registradas
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setRestoredScalesOverride(isSelected ? null : sheet.scalesList);
                            }}
                            className={`w-full py-1.5 rounded-lg text-center font-extrabold text-[10px] transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                            }`}
                          >
                            {isSelected ? '✓ Visualizando Cópia' : '📂 Carregar no Preview'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Folha de Papel Preview (Rolável em tela, formatada para impressora) */}
              <div className="p-6 overflow-y-auto flex justify-center bg-slate-200 dark:bg-slate-900/60 flex-1 scrollbar-thin">
                <div 
                  id="print-ready-sheet-wrapper" 
                  ref={printSheetRef}
                  className="w-full max-w-4xl bg-white text-slate-900 p-8 shadow-md rounded-lg border border-slate-300 font-sans leading-normal text-left text-xs space-y-6 transition-all duration-150 ease-out"
                  style={{ 
                    color: '#0f172a',
                    zoom: `${zoomLevel}%`
                  } as React.CSSProperties}
                >
                  {/* Cabeçalho do Documento */}
                  <div className="border-b-4 border-emerald-950 pb-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      {/* Logo Oficial e Identidade Visual do Grupo Liderança */}
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <BrandLogo size="md" className="BrandLogo border-0 bg-transparent p-0 shadow-none dark:bg-transparent dark:border-0" />
                        </div>
                        <div>
                          <h1 className="text-xl font-black tracking-tight text-emerald-950 uppercase leading-none">GRUPO LIDERANÇA</h1>
                          <p className="text-[9px] font-mono tracking-widest text-slate-550 font-bold uppercase mt-1">
                            EXPRESSO MARLY • GRUPO LIDERANÇA • JJ TURISMO
                          </p>
                          <p className="text-[8px] text-slate-450 font-bold tracking-tight uppercase leading-none mt-0.5">
                            TRANSPORTE RODOVIÁRIO DE PASSAGEIROS • AUTORIZAÇÃO INTEGRADA ANTT
                          </p>
                          <h2 className="text-sm font-black text-slate-900 mt-2 uppercase tracking-wide">
                            RELAÇÃO REGULAMENTAR DE TRÁFEGO • ESCALA OFICIAL
                          </h2>
                        </div>
                      </div>

                      {/* Metadados de Auditoria */}
                      <div className="text-right text-[10px] font-mono leading-relaxed font-bold text-slate-700 bg-slate-100/90 p-2.5 rounded-lg border border-slate-300">
                        <p className="text-emerald-950 font-black">REGISTRO: DIÁRIO-ESCALA-01</p>
                        <p>GERADO EM: {new Date().toLocaleDateString('pt-BR')} - {new Date().toLocaleTimeString('pt-BR')}</p>
                        <p>UNIDADE: SUPERINTENDÊNCIA DE TRÁFEGO</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase">SISTEMA DE CONTROLE INTELIGENTE DE ESCALAS</p>
                      </div>
                    </div>
                  </div>

                  {/* Resumo da Frota e Alertas */}
                  <div className="grid grid-cols-4 gap-4 bg-slate-100 p-3.5 rounded-xl border-2 border-slate-400">
                    <div className="text-center">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Escalas Ativas</span>
                      <span className="text-xl font-black text-emerald-950">
                        {filteredPrintScales.length === scales.length ? scales.length : `${filteredPrintScales.length} de ${scales.length}`}
                      </span>
                    </div>
                    <div className="text-center border-l-2 border-slate-400">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Ônibus Cadastrados</span>
                      <span className="text-xl font-black text-slate-900">{fleet.length}</span>
                    </div>
                    <div className="text-center border-l-2 border-slate-400">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Linhas Atendidas</span>
                      <span className="text-xl font-black text-indigo-950">{APPROVED_ROUTES_DATA.length}</span>
                    </div>
                    <div className="text-center border-l-2 border-slate-400">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Motoristas Ativos</span>
                      <span className="text-xl font-black text-slate-900">{drivers.length}</span>
                    </div>
                  </div>

                  {/* SEÇÃO 1: ESCALAS OPERACIONAIS ATIVAS */}
                  <div className="space-y-4">
                    <div className="border-b-2 border-slate-800 bg-emerald-950/5 p-2 rounded border-emerald-900/35 flex justify-between items-center">
                      <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wider">1. Relação de Escalas Selecionadas</h3>
                      <span className="text-[10px] font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-400">Total listado: {currentPrintScales.length} escalas</span>
                    </div>

                    {scalesByDate.length === 0 ? (
                      <p className="py-8 text-center text-slate-500 font-bold border-2 border-dashed border-slate-400 rounded-lg bg-slate-50 leading-relaxed">
                        Nenhuma escala coincide com os filtros aplicados.<br/>
                        <span className="text-[10px] text-slate-400">Ajuste os filtros de pesquisa operacionais no menu superior.</span>
                      </p>
                    ) : (
                      <div className="space-y-8 print:space-y-0">
                        {scalesByDate.map((group, groupIdx) => {
                          const formatDateBrLocal = (dateStr: string) => {
                            if (!dateStr) return "Sem Data";
                            if (dateStr.includes('/')) return dateStr;
                            const parts = dateStr.split('-');
                            if (parts.length === 3) {
                              return `${parts[2]}/${parts[1]}/${parts[0]}`;
                            }
                            return dateStr;
                          };

                          return (
                            <div 
                              key={group.date || groupIdx} 
                              className="date-section border border-slate-200 rounded-xl p-4 bg-slate-50/50 print:border-0 print:p-0 print:bg-transparent"
                            >
                              <div className="border-b border-slate-400 pb-1 mb-3 flex justify-between items-center bg-slate-100 p-2 rounded print:bg-transparent print:p-0 print:border-slate-800">
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                  📅 Escalas do Dia {formatDateBrLocal(group.date)}
                                </h4>
                                <span className="text-[10px] font-bold text-slate-600 uppercase print:text-black font-mono bg-white px-2 py-0.5 rounded border border-slate-300 print:border-0 print:bg-transparent">
                                  {group.items.length} viagem(ns)
                                </span>
                              </div>

                               <table className="w-full border-collapse border-2 border-slate-800 text-[11px] text-slate-900 mb-2">
                                <thead>
                                  <tr className="bg-slate-800 text-white font-black text-left border-b-2 border-slate-900">
                                    <th className="p-2 border border-slate-400 font-black w-32 text-center text-white tracking-wider">CARRO</th>
                                    <th className="p-2 border border-slate-400 font-black w-24 text-center text-white tracking-wider">PLACA</th>
                                    <th className="p-2 border border-slate-400 font-black flex-1 text-white tracking-wider">ITINERÁRIO / LINHA</th>
                                    <th className="p-2 border border-slate-400 font-black w-18 text-center text-white tracking-wider">PARTIDA</th>
                                    <th className="p-2 border border-slate-400 font-black w-22 text-center text-white tracking-wider">DATA</th>
                                    <th className="p-2 border border-slate-400 font-black w-48 text-white tracking-wider">MOTORISTAS ESCALADOS</th>
                                    <th className="p-2 border border-slate-400 font-black w-20 text-white tracking-wider">SERVIÇO</th>
                                    <th className="p-2 border border-slate-400 font-black w-16 text-center text-white tracking-wider">TIPO</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-450 font-medium">
                                  {group.items.map((scale, i) => {
                                    const isMaintenance = scale.busPrefix && fleet.some(v => 
                                      v.prefix.toUpperCase() === scale.busPrefix.trim().toUpperCase() && 
                                      v.statusOperacional === 'MANUTENÇÃO'
                                    );

                                    const isDoubleBooked = scale.date && scale.busPrefix && 
                                      dailyPrefixCounts[scale.date]?.[scale.busPrefix.trim().toUpperCase()] > 1;

                                    const scalePrefix = scale.busPrefix?.trim().toUpperCase() || '';
                                    const isSpecialScalePrefix = scalePrefix === '' || scalePrefix === 'CANC.' || scalePrefix === 'XXXXXXX';
                                    const isInvalidPrefix = !isSpecialScalePrefix && !fleet.some(v => v.prefix.toUpperCase() === scalePrefix);

                                    let cellBgClass = 'bg-slate-100/40 text-slate-950';
                                    if (isInvalidPrefix) {
                                      cellBgClass = 'bg-red-500 text-white font-black border-red-600 animate-pulse';
                                    } else if (scalePrefix === 'CANC.' || scalePrefix === 'XXXXXXX') {
                                      cellBgClass = 'bg-red-100 text-red-750 font-black border border-red-400';
                                    } else if (isMaintenance) {
                                      cellBgClass = 'bg-red-600 text-white font-black';
                                    } else if (isDoubleBooked) {
                                      cellBgClass = 'bg-amber-200 text-amber-950 font-black border-amber-300';
                                    }

                                    // Rule: check if any assigned driver is double-booked on another route at the same date & time.
                                    const scaleDrivers = (scale.driversList && scale.driversList.length > 0)
                                      ? scale.driversList.map(d => d.trim().toUpperCase()).filter(Boolean)
                                      : (scale.driverName ? scale.driverName.split('/').map(d => d.trim().toUpperCase()).filter(Boolean) : []);

                                    const isDriverDoubleBooked = !!scale.date && !!scale.time && scaleDrivers.some(driver => {
                                      const dUpper = driver.trim().toUpperCase();
                                      if (!dUpper || 
                                          dUpper === 'VAGO' || 
                                          dUpper === 'RESERVA' || 
                                          dUpper === 'A DEFINIR' || 
                                          dUpper === 'FOLGA' || 
                                          dUpper === 'SEM MOTORISTA' || 
                                          dUpper === 'N/A' || 
                                          dUpper === 'AGUARDANDO') {
                                        return false;
                                      }
                                      return scales.some(s => {
                                        if (s.id === scale.id) return false;
                                        if (s.date !== scale.date || s.time !== scale.time) return false;
                                        const otherDrivers = (s.driversList && s.driversList.length > 0)
                                          ? s.driversList.map(d => d.trim().toUpperCase()).filter(Boolean)
                                          : (s.driverName ? s.driverName.split('/').map(d => d.trim().toUpperCase()).filter(Boolean) : []);
                                        return otherDrivers.some(od => od === dUpper);
                                      });
                                    });

                                    return (
                                      <tr 
                                        key={`${scale.id || 'scale'}-${i}`} 
                                        className={`transition-colors ${
                                          isDriverDoubleBooked 
                                            ? 'bg-yellow-100 text-slate-950 font-bold border-y-2 border-yellow-400' 
                                            : 'odd:bg-slate-100/70 even:bg-white hover:bg-slate-55'
                                        }`}
                                        style={isDriverDoubleBooked ? { backgroundColor: '#fef08a' } : undefined}
                                      >
                                        <td className={`p-1 border border-slate-400 font-mono text-center text-xs ${isDriverDoubleBooked ? 'bg-[#fef08a]/30 text-slate-950 font-black' : cellBgClass}`} style={{ verticalAlign: 'middle', backgroundColor: isDriverDoubleBooked ? '#fef08a' : undefined }}>
                                          <EditableCarroCell
                                            scale={scale}
                                            fleet={fleet}
                                            onUpdateScaleFields={handleUpdateScaleFields}
                                            isMaintenance={!!isMaintenance}
                                            isDoubleBooked={!!isDoubleBooked}
                                          />
                                        </td>
                                        <td className={`p-2 border border-slate-400 font-mono font-black text-center text-slate-950 uppercase ${isDriverDoubleBooked ? 'bg-[#fef08a]/30' : 'bg-slate-100/40'}`} style={{ backgroundColor: isDriverDoubleBooked ? '#fef08a' : undefined }}>{scale.busPlate}</td>
                                        <td className="p-2 border border-slate-400 font-bold text-slate-950" style={{ backgroundColor: isDriverDoubleBooked ? '#fef08a' : undefined }}>{scale.line}</td>
                                        <td className={`p-2 border border-slate-400 font-mono font-black text-center text-xs ${isDriverDoubleBooked ? 'bg-[#fef08a]/40 text-emerald-950' : 'text-emerald-950 bg-emerald-100/40'}`} style={{ backgroundColor: isDriverDoubleBooked ? '#fef08a' : undefined }}>{scale.time}</td>
                                        <td className="p-2 border border-slate-400 font-mono text-center text-slate-900">{scale.date}</td>
                                        <td className="p-2 border border-slate-400 text-[10px] leading-tight text-slate-950 font-black">
                                          {scale.driversList && scale.driversList.length > 0 ? (
                                            scale.driversList.join(' / ')
                                          ) : (
                                            scale.driverName
                                          )}
                                        </td>
                                        <td className="p-2 border border-slate-400 font-black text-slate-900">{scale.classification}</td>
                                        <td className="p-2 border border-slate-400 font-black text-center">
                                          {scale.isExtra ? (
                                            <span className="px-1.5 py-0.5 bg-purple-200 text-purple-950 rounded text-[8px] uppercase tracking-wider font-extrabold border border-purple-400">EXTRA</span>
                                          ) : (
                                            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-950 rounded text-[8px] uppercase tracking-wider font-extrabold border border-slate-400">REG</span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* SEÇÃO 2: DICIONÁRIO DE HORÁRIOS E LINHAS HOMOLOGADAS ANTT */}
                  <div className="space-y-2">
                    <div className="border-b-2 border-slate-850 pb-1 flex justify-between items-center">
                      <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">2. Dicionário de Linhas &amp; Itinerários Homologados (ANTT)</h3>
                      <span className="text-[10px] font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-400">Grade Regional: {APPROVED_ROUTES_DATA.length} Horários</span>
                    </div>

                    <div className="relative">
                      <table className="w-full border-collapse border-2 border-slate-850 text-[10px] text-slate-900">
                        <thead>
                          <tr className="bg-slate-800 text-white font-black text-left border-b-2 border-slate-900">
                            <th className="p-2 border border-slate-400 font-black w-20 text-white tracking-wider text-center">HORÁRIO</th>
                            <th className="p-2 border border-slate-400 font-black w-24 text-white tracking-wider text-center">LINHA #</th>
                            <th className="p-2 border border-slate-400 font-black text-white tracking-wider">ITINERÁRIO ORIGEM</th>
                            <th className="p-2 border border-slate-400 font-black text-white tracking-wider">DESTINO OPERACIONAL</th>
                            <th className="p-2 border border-slate-400 font-black w-36 text-white tracking-wider">EMPRESA / CATEGORIA</th>
                            <th className="p-2 border border-slate-400 font-black w-24 text-white tracking-wider">TIPO SERVIÇO</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-400 font-medium text-slate-900">
                          {APPROVED_ROUTES_DATA.map((r, i) => (
                            <tr key={r.id || i} className="odd:bg-slate-100/70 even:bg-white hover:bg-slate-55 transition-colors">
                              <td className="p-2 border border-slate-400 font-mono font-extrabold text-center text-emerald-950 bg-emerald-50/25">{r.time}</td>
                              <td className="p-2 border border-slate-400 font-mono font-bold text-center text-slate-600">#{r.routeNumber || 'N/A'}</td>
                              <td className="p-2 border border-slate-400 font-extrabold text-slate-950">{r.origin}</td>
                              <td className="p-2 border border-slate-400 font-extrabold text-slate-950">{r.destination}</td>
                              <td className="p-2 border border-slate-400 font-black uppercase text-[9px] text-slate-800">{r.category}</td>
                              <td className="p-2 border border-slate-400 font-extrabold text-slate-700">{r.serviceType}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SEÇÃO 3: AUDITORIA OPERACIONAL E DISPONIBILIDADE DA FROTA */}
                  <div className="space-y-2">
                    <div className="border-b-2 border-slate-850 pb-1">
                      <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">3. Auditoria e Disponibilidade Física da Frota</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-[10px]">
                      <div>
                        <table className="w-full border-2 border-slate-850 font-medium text-slate-900">
                          <thead>
                            <tr className="bg-slate-800 text-white font-black text-left border-b-2 border-slate-900">
                              <th className="p-2 border border-slate-400 text-white text-left">FROTA REGIONAL POR STATUS</th>
                              <th className="p-2 border border-slate-400 text-white text-right w-24">QUANTIDADE</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-400">
                            <tr className="bg-white">
                              <td className="p-2 font-bold text-slate-950">Em Operação Normal / Ativos</td>
                              <td className="p-2 text-right font-black text-emerald-900 bg-emerald-50/40 border-l border-slate-400">
                                {fleet.filter(v => v.statusOperacional === "ATIVO").length}
                              </td>
                            </tr>
                            <tr className="bg-slate-100/70">
                              <td className="p-2 font-bold text-slate-950">Oficina / Em Manutenção Preventiva</td>
                              <td className="p-2 text-right font-black text-amber-955 bg-amber-50/30 border-l border-slate-400">
                                {fleet.filter(v => v.statusOperacional === "MANUTENÇÃO").length}
                              </td>
                            </tr>
                            <tr className="bg-white">
                              <td className="p-2 font-bold text-slate-950">Frota Reserva Técnica</td>
                              <td className="p-2 text-right font-black text-indigo-950 bg-indigo-50/30 border-l border-slate-400">
                                {fleet.filter(v => v.statusOperacional === "RESERVADO").length}
                              </td>
                            </tr>
                            <tr className="bg-slate-100/70">
                              <td className="p-2 font-bold text-slate-950">Frota Inativa / Descomissionamento</td>
                              <td className="p-2 text-right font-black text-red-950 bg-red-50/30 border-l border-slate-400">
                                {fleet.filter(v => v.statusOperacional === "INATIVO").length}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="space-y-2 text-slate-700 border-2 border-slate-400 bg-slate-50 p-3 rounded-lg leading-relaxed text-[10px]">
                        <h4 className="font-extrabold text-slate-950 uppercase tracking-widest text-[9px] border-b border-slate-400 pb-1">DIRETRIZES DE SEGURANÇA INTEGRADA ANTT</h4>
                        <p>
                          Este relatório oficial de tráfego é emitido de acordo com a Relação Regulamentar de Frota homologada via PDF pelo Grupo Liderança de Transportes.
                        </p>
                        <p>
                          Ônibus que apresentarem <strong>Prefixo Operacional Duplicado</strong> deverão ser reparados no banco de dados para evitar autuações fiscais nas rodovias interestaduais. As viagens cujas vistorias ANTT ou Cronotacógrafo estejam com prazos vencidos são automaticamente travadas pelo validador do sistema de despacho.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Campo de Assinaturas / Autenticação Física */}
                  <div className="pt-8 grid grid-cols-2 gap-12 text-center text-[10px] font-bold text-slate-700 mr-2 ml-2 signature-block-print">
                    <div className="space-y-1">
                      <div className="border-b border-slate-400 w-full h-8"></div>
                      <p className="uppercase mt-1 text-slate-800">COORDENAÇÃO DE TRÁFEGO E ESCALA</p>
                      <p className="text-[8px] text-slate-500 font-mono">Assinatura do Despachante Autorizado</p>
                    </div>
                    <div className="space-y-1">
                      <div className="border-b border-slate-400 w-full h-8"></div>
                      <p className="uppercase mt-1 text-slate-800">INSPETORIA DE SEGURANÇA E REGULARIDADE</p>
                      <p className="text-[8px] text-slate-500 font-mono">Vistoria e Liberação ANTT / Cronotacógrafo</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SmartScheduleModal 
        isOpen={isSmartSystemOpen}
        onClose={() => setIsSmartSystemOpen(false)}
        fleet={fleet}
        drivers={drivers}
        scales={scales}
        onUpdateScales={handleUpdateScalesState}
      />

      {isMonthlyGridOpen && (
        <MonthlyGridView 
          fleet={fleet}
          drivers={drivers}
          scales={scales}
          onUpdateScales={handleUpdateScalesState}
          onClose={() => setIsMonthlyGridOpen(false)}
        />
      )}

      {/* Floating minimized tray for scale print option */}
      {isPrintModalOpen && isMinimized && (
        <div className="fixed bottom-6 right-6 bg-white dark:bg-slate-800 border-2 border-emerald-500 shadow-2xl rounded-2xl p-4 z-50 flex items-center gap-4 animate-bounce no-print max-w-sm">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
              <Printer size={16} className="animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 block truncate max-w-[180px]">
                Impressão de Escalas {restoredScalesOverride ? "(Gabinete)" : ""}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold">
                Minimizado • Clique em Restaurar
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 border-l pl-3 border-slate-200 dark:border-slate-700">
            <button 
              type="button"
              onClick={() => setIsMinimized(false)}
              className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
              title="Restaurar / Maximizar Janela"
            >
              <Maximize2 size={13} />
              <span>Restaurar</span>
            </button>
            <button 
              type="button"
              onClick={handleClosePrintModal}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0"
              title="Fechar Janela"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
