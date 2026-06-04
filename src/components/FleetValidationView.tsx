import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight, 
  Check, 
  Trash2, 
  UploadCloud, 
  FileText, 
  History, 
  Layers,
  Sparkles,
  ClipboardCheck,
  Eye,
  XCircle,
  Clock
} from 'lucide-react';
import { Vehicle, RAW_FLEET_DATA } from '../data/fleetData';

interface FleetValidationViewProps {
  fleet: Vehicle[];
  onUpdateFleet: (newFleet: Vehicle[]) => void;
}

interface ValidationIssue {
  id: string;
  prefix: string;
  field: string;
  severity: 'CRITICAL' | 'WARNING';
  type: 'DUPLICATED_PREFIX' | 'DUPLICATED_PLATE' | 'DUPLICATED_CHASSIS' | 'INVALID_PREFIX' | 'GHOST_VEHICLE' | 'COLUMN_DISPLACEMENT' | 'INVALID_CHASSIS' | 'UNSTANDARDIZED' | 'DOC_INCONSISTENCY';
  description: string;
  expected: string;
  found: string;
}

interface CorrectionLog {
  id: string;
  timestamp: string;
  prefix: string;
  type: string;
  description: string;
}

// 20 Official vehicles from PDF (immutable baseline)
const OFFICIAL_PDF_DATA = RAW_FLEET_DATA;

// Simulated "Imported with Errors" fleet data
const DIRTY_IMPORTED_FLEET: Vehicle[] = [
  // 1. Correct
  {
    prefix: "1180",
    plate: "PRB 9387",
    renavam: "01135520973",
    unit: "GOIÂNIA-GO",
    owner: "VIAÇÃO RIO OESTE",
    possession: "EXPRESSO MARLY",
    classification: "Executivo",
    capacity: 48,
    serviceType: "RODOVIARIO",
    brand: "M. BENZ",
    model: "O 500 / 354 CV",
    transmissionType: "MANUAL",
    axes: 6,
    euro: "V",
    yearManufacture: 2016,
    yearModel: 2017,
    chassis: "9BM634061GB034848",
    color: "BRANCA",
    bodywork: "MARCOPOLO G7 LD",
    emplacamento: "PIRES DO RIO-GO",
    situationAntt: "APROVADO",
    expiryAntt: "01/01/2027",
    expiryCrono: "23/01/2024",
    expiryArtran: "NÃO TEM",
    expiryAgr: "01/01/2026",
    statusOperacional: "ATIVO",
    vistoria: "APROVADO",
  },
  // 2. Unstandardized plate (lowercase) and unstandardized color
  {
    prefix: "1190",
    plate: "prb 9377", // lowercase
    renavam: "01135518499",
    unit: "GOIÂNIA-GO",
    owner: "VIAÇÃO RIO OESTE",
    possession: "EXPRESSO MARLY",
    classification: "Executivo",
    capacity: 48,
    serviceType: "RODOVIARIO",
    brand: "M. BENZ",
    model: "O 500 / 354 CV",
    transmissionType: "MANUAL",
    axes: 6,
    euro: "V",
    yearManufacture: 2016,
    yearModel: 2017,
    chassis: "9BM634061HB046913",
    color: "branca", // lowercase
    bodywork: "MARCOPOLO G7 LD",
    emplacamento: "PIRES DO RIO-GO",
    situationAntt: "APROVADO",
    expiryAntt: "01/09/2026",
    expiryCrono: "27/01/2024",
    expiryArtran: "NÃO TEM",
    expiryAgr: "01/09/2026",
    statusOperacional: "ATIVO",
    vistoria: "APROVADO",
  },
  // 3. Alphanumeric bad prefix "125O" (with letter O) instead of 1250, and missing space in plate
  {
    prefix: "125O", // Letter O instead of 0
    plate: "PRX1634", // Missing space
    renavam: "01156661266",
    unit: "GOIÂNIA-GO",
    owner: "VIAÇÃO RIO OESTE",
    possession: "LIDERANÇA TURISMO",
    classification: "Executivo",
    capacity: 48,
    serviceType: "RODOVIARIO",
    brand: "SCANIA",
    model: "K 360 CV",
    transmissionType: "AUTOMATICO",
    axes: 6,
    euro: "V",
    yearManufacture: 2018,
    yearModel: 2018,
    chassis: "9BSK6X200J3923703",
    color: "BRANCA",
    bodywork: "MARCOPOLO G7 LD",
    emplacamento: "PIRES DO RIO-GO",
    situationAntt: "APROVADO",
    expiryAntt: "01/08/2025",
    expiryCrono: "06/01/2024",
    expiryArtran: "NÃO TEM",
    expiryAgr: "01/08/2025",
    statusOperacional: "ATIVO",
    vistoria: "APROVADO",
  },
  // 4. Duplicate prefix 1180 with fake vehicle data (duplicity bug)
  {
    prefix: "1180", // DUPLICATE prefix with different data
    plate: "FLA 5F89",
    renavam: "01132223334",
    unit: "PIRES DO RIO-GO",
    owner: "EMPRESA TURISMO GHOST",
    possession: "EXPRESSO MARLY",
    classification: "Executivo",
    capacity: 44,
    serviceType: "RODOVIARIO",
    brand: "VOLVO",
    model: "B11R 410 CV",
    transmissionType: "AUTOMATICO",
    axes: 6,
    euro: "V",
    yearManufacture: 2018,
    yearModel: 2019,
    chassis: "9BVT2SXYZLE321456",
    color: "VERDE",
    bodywork: "MARCOPOLO G7 LD",
    emplacamento: "PIRES DO RIO-GO",
    situationAntt: "VENCIDO",
    expiryAntt: "01/01/2024",
    expiryCrono: "23/01/2024",
    expiryArtran: "NÃO TEM",
    expiryAgr: "01/01/2024",
    statusOperacional: "ATIVO",
    vistoria: "VENCIDO",
  },
  // 5. Ghost Vehicle "9999" (does not exist in original PDF)
  {
    prefix: "9999", // GHOST
    plate: "GHO 5T99",
    renavam: "01999999999",
    unit: "GOIÂNIA-GO",
    owner: "VEÍCULO INEXISTENTE",
    possession: "JJ TUR",
    classification: "Executivo",
    capacity: 48,
    serviceType: "RODOVIARIO",
    brand: "VOLVO",
    model: "FANTASMA G8",
    transmissionType: "AUTOMATICO",
    axes: 6,
    euro: "VI",
    yearManufacture: 2024,
    yearModel: 2024,
    chassis: "9BMGHOSTVEHICLE999",
    color: "AZUL",
    bodywork: "COMIL INVICTUS DD",
    emplacamento: "ANÁPOLIS-GO",
    situationAntt: "NÃO TEM VISTORIA",
    expiryAntt: "NÃO TEM",
    expiryCrono: "01/01/2026",
    expiryArtran: "NÃO TEM",
    expiryAgr: "NÃO TEM",
    statusOperacional: "RESERVADO",
    vistoria: "NÃO TEM VISTORIA",
  },
  // 6. Data column displacement (brand name lara, bodywork swap with chassi, capacity as 0)
  {
    prefix: "1320",
    plate: "PRL 5858",
    renavam: "01187190524",
    unit: "GOIÂNIA-GO",
    owner: "VIAÇÃO RIO OESTE",
    possession: "EXPRESSO MARLY",
    classification: "Semi Leito",
    capacity: 0, // DISPLACED: Capacity is 0
    serviceType: "RODOVIARIO",
    brand: "VOLVO",
    model: "B11R 410 CV",
    transmissionType: "AUTOMATICO",
    axes: 6,
    euro: "V",
    yearManufacture: 2019,
    yearModel: 2020,
    chassis: "MARCOPOLO NEW G7", // DISPLACED: Chassis contains bodywork text!
    color: "VERDE",
    bodywork: "9BVT2S929LE388712", // DISPLACED: Bodywork contains chassis!
    emplacamento: "PIRES DO RIO-GO",
    situationAntt: "APROVADO",
    expiryAntt: "01/04/2025",
    expiryCrono: "04/01/2024",
    expiryArtran: "NÃO TEM",
    expiryAgr: "01/04/2025",
    statusOperacional: "ATIVO",
    vistoria: "APROVADO",
  },
  // 7. Duplicate plate "QTN 7894" used on prefix 1330 and prefix 8888
  {
    prefix: "1330",
    plate: "QTN 7894",
    renavam: "01207302691",
    unit: "GOIÂNIA-GO",
    owner: "VIAÇÃO RIO OESTE",
    possession: "EXPRESSO MARLY",
    classification: "Semi Leito",
    capacity: 56,
    serviceType: "RODOVIARIO",
    brand: "VOLVO",
    model: "B11R 410 CV",
    transmissionType: "AUTOMATICO",
    axes: 6,
    euro: "V",
    yearManufacture: 2019,
    yearModel: 2020,
    chassis: "9BVT2S923LE389273",
    color: "BRANCA",
    bodywork: "MARCOPOLO NEW G7",
    emplacamento: "PIRES DO RIO-GO",
    situationAntt: "APROVADO",
    expiryAntt: "01/01/2025",
    expiryCrono: "23/06/2024",
    expiryArtran: "NÃO TEM",
    expiryAgr: "01/11/2024",
    statusOperacional: "ATIVO",
    vistoria: "APROVADO",
  },
  {
    prefix: "8888", // GHOST duplicate plate
    plate: "QTN 7894", // DUPLICATE plate
    renavam: "01207555555",
    unit: "PICO DO RIO-GO",
    owner: "FANTASMA DO G8",
    possession: "JJ TUR",
    classification: "Leito Total",
    capacity: 50,
    serviceType: "RODOVIARIO",
    brand: "VOLVO",
    model: "B11R",
    transmissionType: "AUTOMATICO",
    axes: 8,
    euro: "VI",
    yearManufacture: 2023,
    yearModel: 2024,
    chassis: "9BVT99999LE389273",
    color: "AZUL",
    bodywork: "MARCOPOLO G8 DD",
    emplacamento: "PIRES DO RIO-GO",
    situationAntt: "APROVADO",
    expiryAntt: "01/01/2026",
    expiryCrono: "23/06/2024",
    expiryArtran: "NÃO TEM",
    expiryAgr: "01/01/2026",
    statusOperacional: "ATIVO",
    vistoria: "APROVADO",
  },
  // 8. Correct ones to fill up a bit
  {
    prefix: "1400",
    plate: "SCP 7J42",
    renavam: "01321016023",
    unit: "GOIÂNIA-GO",
    owner: "VIAÇÃO RIO OESTE",
    possession: "LIDERANÇA TURISMO",
    classification: "Leito Total",
    capacity: 43,
    serviceType: "RODOVIARIO",
    brand: "SCANIA",
    model: "K 400 CV",
    transmissionType: "AUTOMATICO",
    axes: 6,
    euro: "V",
    yearManufacture: 2022,
    yearModel: 2023,
    chassis: "9BSK6X200P4013994",
    color: "BRANCA",
    bodywork: "MARCOPOLO G8 DD TOTAL",
    emplacamento: "PIRES DO RIO-GO",
    situationAntt: "APROVADO",
    expiryAntt: "01/10/2026",
    expiryCrono: "20/04/2024",
    expiryArtran: "NÃO TEM",
    expiryAgr: "01/10/2026",
    statusOperacional: "ATIVO",
    vistoria: "APROVADO",
  },
  {
    prefix: "1410",
    plate: "SDI 1G44",
    renavam: "01321060103",
    unit: "GOIÂNIA-GO",
    owner: "VIAÇÃO RIO OESTE",
    possession: "LIDERANÇA TURISMO",
    classification: "Leito Total",
    capacity: 43,
    serviceType: "RODOVIARIO",
    brand: "SCANIA",
    model: "K 400 CV",
    transmissionType: "AUTOMATICO",
    axes: 6,
    euro: "V",
    yearManufacture: 2022,
    yearModel: 2023,
    chassis: "9BSK6X200N4011912",
    color: "BRANCA",
    bodywork: "MARCOPOLO G8 DD TOTAL",
    emplacamento: "PIRES DO RIO-GO",
    situationAntt: "APROVADO",
    expiryAntt: "01/10/2024",
    expiryCrono: "14/12/2024",
    expiryArtran: "NÃO TEM",
    expiryAgr: "01/10/2024",
    statusOperacional: "ATIVO",
    vistoria: "APROVADO",
  },
];

export const FleetValidationView: React.FC<FleetValidationViewProps> = ({ fleet, onUpdateFleet }) => {
  const [activeTab, setActiveTab] = useState<'PANEL' | 'COMPARISON' | 'LOGS' | 'IMPORT_BLOCKER'>('PANEL');
  const [logs, setLogs] = useState<CorrectionLog[]>(() => {
    const cached = localStorage.getItem('bc_correction_logs');
    return cached ? JSON.parse(cached) : [
      {
        id: 'log-1',
        timestamp: '27/05/2026 09:12:00',
        prefix: 'SISTEMA',
        type: 'INCIALIZAÇÃO',
        description: 'Auditor de Frota inicializado com sucesso. Base oficial carregada para auditoria.'
      }
    ];
  });

  // Simulated drag and drop import blocker variables
  const [importLogs, setImportLogs] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<'IDLE' | 'SCANNING' | 'BLOCKED' | 'SUCCESS'>('IDLE');
  const [selectedFile, setSelectedFile] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('bc_correction_logs', JSON.stringify(logs));
  }, [logs]);

  // Evaluate the entire "current" fleet against official PDF records and rules
  const validationResult = useMemo(() => {
    const issues: ValidationIssue[] = [];
    const prefixMap = new Map<string, Vehicle[]>();
    const plateMap = new Map<string, Vehicle[]>();
    const chassisMap = new Map<string, Vehicle[]>();

    // Map through the system fleet and build indexes for duplicate check
    fleet.forEach(v => {
      // Normalize values for indexing
      const normPrefix = v.prefix.trim();
      const normPlate = v.plate.trim().toUpperCase();
      const normChassis = v.chassis.trim().toUpperCase();

      if (!prefixMap.has(normPrefix)) prefixMap.set(normPrefix, []);
      prefixMap.get(normPrefix)!.push(v);

      if (normPlate) {
        if (!plateMap.has(normPlate)) plateMap.set(normPlate, []);
        plateMap.get(normPlate)!.push(v);
      }

      if (normChassis) {
        if (!chassisMap.has(normChassis)) chassisMap.set(normChassis, []);
        chassisMap.get(normChassis)!.push(v);
      }
    });

    fleet.forEach(v => {
      const normPrefix = v.prefix.trim();
      const normPlate = v.plate.trim().toUpperCase();
      const normChassis = v.chassis.trim().toUpperCase();

      // Rule 1: Prefixo inválido (non-numeric or contains letters like O instead of 0)
      const hasLetterO = /[a-zA-Z]/i.test(v.prefix);
      const isNumeric = /^\d+$/.test(v.prefix);
      if (v.prefix === '' || hasLetterO || !isNumeric) {
        let correctionMsg = "Modificar para numérico puro.";
        if (hasLetterO) {
          correctionMsg = `Substituir letras por números correspondentes (ex: 'O' -> '0').`;
        }
        issues.push({
          id: `inv-prefix-${v.prefix}-${v.plate}`,
          prefix: v.prefix,
          field: 'prefix',
          severity: 'CRITICAL',
          type: 'INVALID_PREFIX',
          description: `Prefixo '${v.prefix}' contém caracteres alfabéticos ou inválidos. Prefixo deve ser numérico rígido.`,
          expected: v.prefix.toUpperCase().replace(/O/g, '0').replace(/L/g, '1').replace(/I/g, '1'),
          found: v.prefix
        });
      }

      // Rule 2: Prefixo duplicado
      const prefixVehicles = prefixMap.get(normPrefix) || [];
      if (prefixVehicles.length > 1) {
        const otherPlates = prefixVehicles.filter(item => item.plate !== v.plate).map(item => item.plate);
        issues.push({
          id: `dup-prefix-${v.prefix}-${v.plate}`,
          prefix: v.prefix,
          field: 'prefix',
          severity: 'CRITICAL',
          type: 'DUPLICATED_PREFIX',
          description: `Prefixo duplicado! Prefixos repetidos no banco de dados com placas diferentes (${v.plate} e ${otherPlates.join(', ')}).`,
          expected: "Prefixo Único",
          found: `Prefixo ${v.prefix} repetido`
        });
      }

      // Rule 3: Placa repetida
      const plateVehicles = plateMap.get(normPlate) || [];
      if (plateVehicles.length > 1) {
        const otherPrefixes = plateVehicles.filter(item => item.prefix !== v.prefix).map(item => item.prefix);
        issues.push({
          id: `dup-plate-${v.prefix}-${v.plate}`,
          prefix: v.prefix,
          field: 'plate',
          severity: 'CRITICAL',
          type: 'DUPLICATED_PLATE',
          description: `Placa repetida! A placa '${v.plate}' está vinculada a múltiplos veículos (Prefixos: ${v.prefix} e ${otherPrefixes.join(', ')}).`,
          expected: "Placa única no sistema",
          found: `Placa repetida`
        });
      }

      // Rule 4: Chassis repetido
      const chassisVehicles = chassisMap.get(normChassis) || [];
      if (chassisVehicles.length > 1 && normChassis !== 'NÃO TEM' && normChassis !== '') {
        const otherPrefixes = chassisVehicles.filter(item => item.prefix !== v.prefix).map(item => item.prefix);
        issues.push({
          id: `dup-chassis-${v.prefix}-${v.chassis}`,
          prefix: v.prefix,
          field: 'chassis',
          severity: 'CRITICAL',
          type: 'DUPLICATED_CHASSIS',
          description: `Chassi duplicado! O chassi '${v.chassis}' foi registrado em mais de um veículo (Prefixos: ${v.prefix} e ${otherPrefixes.join(', ')}).`,
          expected: "Chassi único (número identificador de fábrica)",
          found: `Chassi repetido`
        });
      }

      // Rule 5: Veículo Fantasma (not in original PDF database at all)
      // Check if prefix corresponds to any vehicle in OFFICIAL_PDF_DATA
      const cleanNumericPrefix = v.prefix.replace(/O/g, '0').replace(/L/g, '1');
      const pdfMatches = OFFICIAL_PDF_DATA.find(pdf => pdf.prefix === cleanNumericPrefix || pdf.plate.replace(/\s/g, '').toUpperCase() === normPlate.replace(/\s/g, ''));
      if (!pdfMatches) {
        issues.push({
          id: `ghost-${v.prefix}-${v.plate}`,
          prefix: v.prefix,
          field: 'prefix',
          severity: 'CRITICAL',
          type: 'GHOST_VEHICLE',
          description: `Veículo fantasma detectado! Prefixo '${v.prefix}' (Placa: ${v.plate}) não consta na relação oficial do PDF original da frota Liderança.`,
          expected: "Excluir ou transferir para indevido",
          found: `Inexistente no PDF oficial`
        });
      }

      // Rule 6: Deslocamento de dados (e.g. chassis is short or has bodywork text like "MARCOPOLO", capacity is 0, etc.)
      const isChassisDisplaced = v.chassis.includes("MARCOPOLO") || v.chassis.includes("COMIL") || v.chassis.length < 10;
      const isBodyworkDisplaced = /^[0-9A-Z]{17}$/.test(v.bodywork); // If bodywork looks like a chassis
      if (isChassisDisplaced || isBodyworkDisplaced || v.capacity === 0) {
        issues.push({
          id: `displ-${v.prefix}-${v.plate}`,
          prefix: v.prefix,
          field: isChassisDisplaced ? 'chassis' : (isBodyworkDisplaced ? 'bodywork' : 'capacity'),
          severity: 'CRITICAL',
          type: 'COLUMN_DISPLACEMENT',
          description: `Deslocamento de dados entre colunas! Chassi/Carroceria foram lidos na ordem errada ou capacidade foi importada vazia (zero).`,
          expected: `Alinhamento horizontal correto das colunas do PDF`,
          found: `Dados deslocados (Chassi: '${v.chassis}', Carroceria: '${v.bodywork}', Cap: ${v.capacity})`
        });
      }

      // Rule 7: Unstandardized details (lowercase letters)
      const hasLowercasePlate = /[a-z]/.test(v.plate);
      const hasLowercaseColor = /[a-z]/.test(v.color);
      const plateFormatBad = !v.plate.includes(" ") && v.plate.length === 7;
      if (hasLowercasePlate || hasLowercaseColor || plateFormatBad) {
        let expectedPlate = v.plate.toUpperCase();
        if (plateFormatBad) {
          expectedPlate = expectedPlate.slice(0, 3) + " " + expectedPlate.slice(3);
        }
        issues.push({
          id: `unstand-${v.prefix}-${v.plate}`,
          prefix: v.prefix,
          field: hasLowercasePlate || plateFormatBad ? 'plate' : 'color',
          severity: 'WARNING',
          type: 'UNSTANDARDIZED',
          description: `Inconsistência de formatação. O campo ${hasLowercasePlate || plateFormatBad ? 'Placa' : 'Cor'} não está padronizado.`,
          expected: hasLowercasePlate || plateFormatBad ? expectedPlate : v.color.toUpperCase(),
          found: hasLowercasePlate || plateFormatBad ? v.plate : v.color
        });
      }
    });

    return issues;
  }, [fleet]);

  // Filter categories
  const duplicateErrors = validationResult.filter(i => i.type === 'DUPLICATED_PREFIX' || i.type === 'DUPLICATED_PLATE' || i.type === 'DUPLICATED_CHASSIS');
  const invalidPrefixErrors = validationResult.filter(i => i.type === 'INVALID_PREFIX');
  const ghostErrors = validationResult.filter(i => i.type === 'GHOST_VEHICLE');
  const displacementErrors = validationResult.filter(i => i.type === 'COLUMN_DISPLACEMENT');
  const formatErrors = validationResult.filter(i => i.type === 'UNSTANDARDIZED');

  // Triggering Auto correction
  const handleAutoCorrection = () => {
    // Correct the fleet by mapping to OFFICIAL_PDF_DATA
    // 1. We remove any vehicle that is a Ghost vehicle (ie, doesn't match prefix or plate in OFFICIAL_PDF_DATA)
    // 2. We resolve duplicates by reverting fields to their official PDF definitions
    // 3. We correct unstandardized fields (to UPPERCASE and spacing)
    // 4. We fix column displacement using official mappings

    const newLogs: CorrectionLog[] = [];
    const timestampStr = new Date().toLocaleString('pt-BR');

    // Filter and restore or fix
    const correctedFleet: Vehicle[] = [];

    // Map each official vehicle and check if we have any matching in current fleet, 
    // or simply rebuild the database perfectly identical to OFFICIAL_PDF_DATA, 
    // which guarantees that ALL vehicles are exactly the real ones in the PDF!
    // But to make it seem interactive, we will "heal" the existing ones or restore them.
    
    // Let's analyze what needs logs
    // Let's inspect the current fleet and see what fixes we can log:
    fleet.forEach(v => {
      const normPrefix = v.prefix.trim();
      // Test if ghost
      const cleanNumericPrefix = v.prefix.replace(/O/g, '0').replace(/L/g, '1');
      const normPlate = v.plate.trim().toUpperCase().replace(/\s/g, '');
      const officialMatch = OFFICIAL_PDF_DATA.find(pdf => pdf.prefix === cleanNumericPrefix || pdf.plate.trim().toUpperCase().replace(/\s/g, '') === normPlate);

      if (!officialMatch) {
         // Log the removal of Ghost vehicle
         newLogs.push({
           id: `corr-log-ghost-${Date.now()}-${v.prefix}`,
           timestamp: timestampStr,
           prefix: v.prefix,
           type: 'REMOÇÃO',
           description: `Removido veículo fantasma prefixo '${v.prefix}' (Placa: ${v.plate}) por não constar no PDF de frota oficial.`
         });
         return; // Skip/Remove this vehicle!
      }

      // Check if duplicate of prefix (we only restore the official one, skipping the duplicates)
      const alreadyAdded = correctedFleet.some(f => f.prefix === officialMatch.prefix);
      if (alreadyAdded) {
        newLogs.push({
          id: `corr-log-dup-${Date.now()}-${v.prefix}`,
          timestamp: timestampStr,
          prefix: v.prefix,
          type: 'REMOÇÃO_DUPLICIDADE',
          description: `Discarregada duplicata indevida para prefixo '${v.prefix}' (Placa: ${v.plate}) mantendo somente o registro oficial do PDF.`
        });
        return; // Skip duplicate!
      }

      // Check differences and fix them
      let fixedVehicle = { ...officialMatch }; // Revert to official PDF data to guarantee absolute truth!
      
      if (v.prefix !== officialMatch.prefix) {
        newLogs.push({
          id: `corr-log-prefix-${Date.now()}-${v.prefix}`,
          timestamp: timestampStr,
          prefix: officialMatch.prefix,
          type: 'CORREÇÃO_PREFIXO',
          description: `Corrigido erro OCR do prefixo '${v.prefix}' para o número correto '${officialMatch.prefix}'.`
        });
      }

      if (v.plate !== officialMatch.plate) {
        newLogs.push({
          id: `corr-log-plate-${Date.now()}-${officialMatch.prefix}`,
          timestamp: timestampStr,
          prefix: officialMatch.prefix,
          type: 'PADRONIZAÇÃO_PLACA',
          description: `Padronizada placa do veículo prefixo '${officialMatch.prefix}' de '${v.plate}' para '${officialMatch.plate}' (Maiúsculo e espaçamento oficial).`
        });
      }

      if (v.capacity !== officialMatch.capacity || v.bodywork !== officialMatch.bodywork || v.chassis !== officialMatch.chassis) {
        if (v.capacity === 0 || v.chassis.includes("MARCOPOLO")) {
          newLogs.push({
            id: `corr-log-displ-${Date.now()}-${officialMatch.prefix}`,
            timestamp: timestampStr,
            prefix: officialMatch.prefix,
            type: 'REORGANIZAÇÃO_COLUNAS',
            description: `Corrigido deslocamento de dados horizontal. Chassi, Carroceria e Capacidade reestruturados conforme as colunas reais do PDF.`
          });
        }
      }

      if (v.color !== officialMatch.color) {
        newLogs.push({
          id: `corr-log-color-${Date.now()}-${officialMatch.prefix}`,
          timestamp: timestampStr,
          prefix: officialMatch.prefix,
          type: 'PADRONIZAÇÃO_ATRIBUTO',
          description: `Padronizado atributo de cor do veículo prefixo '${officialMatch.prefix}' para letras maiúsculas (${officialMatch.color}).`
        });
      }

      correctedFleet.push(fixedVehicle);
    });

    // Make sure we bring back any missing official vehicle from the PDF as well
    OFFICIAL_PDF_DATA.forEach(official => {
      const exists = correctedFleet.some(f => f.prefix === official.prefix);
      if (!exists) {
        correctedFleet.push({ ...official });
        newLogs.push({
          id: `corr-log-restore-${Date.now()}-${official.prefix}`,
          timestamp: timestampStr,
          prefix: official.prefix,
          type: 'RESTAURAÇÃO',
          description: `Restaurado veículo prefixo '${official.prefix}' (Placa: ${official.plate}) que estava omitido ou com dados perdidos no banco de dados.`
        });
      }
    });

    // Sort corrected fleet by numeric prefix
    correctedFleet.sort((a,b) => parseInt(a.prefix) - parseInt(b.prefix));

    onUpdateFleet(correctedFleet);
    setLogs(prev => [...newLogs, ...prev]);

    // Show a success message
    alert("FROTA SANADA COM SUCESSO!\n\nForam aplicadas correções automáticas alinhando os dados do sistema 100% com o PDF oficial da Relação de Frota:\n- Letras de leitura errada no prefixo corrigidas;\n- Registros fantasmas eliminados;\n- Duplicidades expurgadas;\n- Deslocamentos horizontais de colunas ajustados;\n- Placas e cores padronizadas.");
  };

  // Seed with Dirty Data for Demo
  const handleSeedDirtyData = () => {
    onUpdateFleet(DIRTY_IMPORTED_FLEET);
    setLogs(prev => [
      {
        id: `seed-log-${Date.now()}`,
        timestamp: new Date().toLocaleString('pt-BR'),
        prefix: 'SISTEMA',
        type: 'CARGA_AUDITORIA',
        description: 'Simulação ativada. Injetada réplica corrompida do banco de dados contendo 8 distorções severas de importação (OCR corrompido, deslocamento, fantasmas, duplicados).'
      },
      ...prev
    ]);
  };

  const handleClearLogs = () => {
    setLogs([
      {
        id: 'log-1',
        timestamp: new Date().toLocaleString('pt-BR'),
        prefix: 'SISTEMA',
        type: 'LIMPEZA',
        description: 'Histórico de auditorias limpo pelo operador.'
      }
    ]);
  };

  // Simulated drag-and-drop secure importer blocker
  const handleSimulateFileImport = (fileName: string, isCorrupted: boolean) => {
    setSelectedFile(fileName);
    setIsImporting(true);
    setImportLogs([]);
    setImportStatus('SCANNING');

    let currentStep = 0;
    const logsList = [
      `[INFO] Iniciando leitura do documento: "${fileName}"`,
      `[INFO] Detectando layout de tabela horizontal... OK`,
      `[INFO] Analisando linhas de metadados da frota da empresa...`,
      `[CONFERÊNCIA] Verificando cabeçalho estrutural de colunas: PREFIXO | PLACA | FABRICANTE | CHASSI | DOCUMENTO...`
    ];

    const timer = setInterval(() => {
      if (currentStep < logsList.length) {
        setImportLogs(prev => [...prev, logsList[currentStep]]);
        currentStep++;
      } else {
        clearInterval(timer);
        if (isCorrupted) {
          setImportLogs(prev => [
            ...prev,
            `[ERRO CRÍTICO] Linha 8: Prefixo 'A118' inválido encontrado (Alfanumérico detectado).`,
            `[ERRO CRÍTICO] Linha 14: Deslocamento estrutural detectado na coluna CARROCERIA! O texto '9BM6340...' foi encontrado onde deveria estar a 'CARROCERIA'. Colunas deslocadas.`,
            `[ALERT] Registro Fantasma: Prefixo '9999' não correspondente com a autenticação ANTT do Grupo Liderança.`,
            `[BLOQUEADO] Estrutura da tabela corrompida ou dados inconsistentes!`,
            `[SEGURANÇA] IMPORTAÇÃO ABORTADA AUTOMATICAMENTE. O banco de dados existente foi preservado intacto para evitar contaminação.`
          ]);
          setImportStatus('BLOCKED');
        } else {
          setImportLogs(prev => [
            ...prev,
            `[OK] Linha 1 a 20 validadas horizontalmente por coluna. Cabeçalho intacto.`,
            `[OK] Todos os 20 prefixos são numéricos puros.`,
            `[OK] Todas as placas validadas com padrão Mercosul/Brasil (AAA 1111 / AAA 1A11).`,
            `[OK] Ausência total de registros fantasmas fora do PDF original.`,
            `[Sucesso] Validação superada! Dados seguros para sincronização imediata.`,
            `[FINALIZADO] Importação concluída. Banco de dados atualizado com 100% de integridade documental.`
          ]);
          setImportStatus('SUCCESS');
          // Sincronizar com dados limpos
          onUpdateFleet(OFFICIAL_PDF_DATA);
        }
        setIsImporting(false);
      }
    }, 650);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-850">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black bg-emerald-500 text-slate-950 animate-pulse tracking-wider">Módulo de Segurança Máxima</span>
            <span className="text-slate-400 text-xs font-mono">• Versão 3.2 (OCR Inteligente)</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Validação & Auditoria da Frota
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Mapeamento analítico em tempo real, prevenção de registros fantasmas e auto-correção linha por linha do PDF de frotas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSeedDirtyData}
            className="p-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-xl text-xs font-bold border border-amber-500/30 transition-all cursor-pointer flex items-center gap-1.5"
            title="Injetar dados com erros para ver o funcionamento do painel"
          >
            <RefreshCw size={14} /> Carregar Simulação (Injetar Erros)
          </button>
          
          <button
            onClick={handleAutoCorrection}
            disabled={validationResult.length === 0}
            className={`p-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-lg ${
              validationResult.length > 0 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/20 hover:-translate-y-0.5' 
                : 'bg-slate-800 text-slate-500 border border-slate-700/80 cursor-not-allowed'
            }`}
          >
            <Sparkles size={14} className={validationResult.length > 0 ? 'animate-bounce' : ''} />
            Corrigir Inconsistências Automaticamente
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('PANEL')}
          className={`px-4 py-2.5 text-xs font-black transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'PANEL'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ClipboardCheck size={16} /> PAINEL DE VALIDAÇÃO
        </button>
        <button
          onClick={() => setActiveTab('COMPARISON')}
          className={`px-4 py-2.5 text-xs font-black transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'COMPARISON'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Eye size={16} /> COMPARAÇÃO VISUAL (PDF ORIGINAL VS IMPORTADO)
        </button>
        <button
          onClick={() => setActiveTab('IMPORT_BLOCKER')}
          className={`px-4 py-2.5 text-xs font-black transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'IMPORT_BLOCKER'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UploadCloud size={16} /> VALIDAÇÃO ANTECIPADA (BLOQUEADOR DE ERROS)
        </button>
        <button
          onClick={() => setActiveTab('LOGS')}
          className={`px-4 py-2.5 text-xs font-black transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'LOGS'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <History size={16} /> REGISTRO DE ALTERAÇÕES ({logs.length})
        </button>
      </div>

      {activeTab === 'PANEL' && (
        <div className="space-y-6">
          {/* Validation Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Total Registros Lidos</span>
                <p className="text-3xl font-black text-slate-950 dark:text-white">{fleet.length}</p>
                <span className="text-[10px] font-bold text-slate-500 block">Frota atual no sistema</span>
              </div>
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500">
                <Layers size={22} />
              </div>
            </div>

            <div className={`p-5 rounded-3xl border flex items-center justify-between shadow-sm transition-colors ${
              validationResult.length > 0
                ? 'bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-400'
                : 'bg-emerald-50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-400'
            }`}>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Inconsistências Críticas</span>
                <p className="text-3xl font-black">{validationResult.length}</p>
                <span className="text-[10px] font-bold block">
                  {validationResult.length > 0 ? "Corrija antes que afete tráfego ANTT" : "Frota 100% auditada e segura"}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                validationResult.length > 0 
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-500' 
                  : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500'
              }`}>
                {validationResult.length > 0 ? <ShieldAlert size={22} className="animate-bounce" /> : <ShieldCheck size={22} />}
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Veículos Fantasmas</span>
                <p className="text-3xl font-black text-slate-950 dark:text-white">{ghostErrors.length}</p>
                <span className="text-[10px] font-bold text-slate-400 block">Prefixo inexistente no PDF</span>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                ghostErrors.length > 0 ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                <AlertTriangle size={22} />
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono font-bold">Chassis/Placa Repetidos</span>
                <p className="text-3xl font-black text-slate-950 dark:text-white">
                  {duplicateErrors.length}
                </p>
                <span className="text-[10px] font-bold text-slate-400 block">Duplicidade no banco</span>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                duplicateErrors.length > 0 ? 'bg-rose-100 dark:bg-rose-950/30 text-rose-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                <AlertCircle size={22} />
              </div>
            </div>
          </div>

          {/* Quick Resolution Notice */}
          {validationResult.length > 0 ? (
            <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/60 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex gap-3">
                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">Atenção: Inconsistências Ativas no Banco Liderança</h4>
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                    Detectados prefixos inválidos extraídos incorretamente por OCR ou duplicidades de placas. Para repadronizar todos os dados no formato oficial do PDF anterior, clique em "Corrigir inconsistências automaticamente".
                  </p>
                </div>
              </div>
              <button
                onClick={handleAutoCorrection}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-xs transition-colors shadow shadow-amber-500/10 cursor-pointer text-center"
              >
                Resolver Tudo Agora
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900 p-5 rounded-3xl flex gap-3.5 items-center">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Base de Dados Higienizada e Homologada</h4>
                <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
                  Não foram detectados prefixos corrompidos, placas duplicadas ou veículos fora de linha. Os chassis estão válidos e com alinhamento horizontal perfeitamente condizente com a tabela de Frota.
                </p>
              </div>
            </div>
          )}

          {/* Grid Section: List of Inconsistencies and Details */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers size={16} className="text-primary" /> Relatório Analítico de Anomalias ({validationResult.length} itens)
            </h3>
            
            {validationResult.length === 0 ? (
              <div className="py-12 flex flex-col items-center text-center space-y-2">
                <CheckCircle size={40} className="text-green-500 animate-pulse" />
                <p className="font-black text-xs text-slate-800 dark:text-white uppercase tracking-widest mt-2">Nenhuma anomalia encontrada!</p>
                <p className="text-[11px] text-slate-500 max-w-md font-medium">
                  A auditoria concluiu com êxito. Todo o cadastro herda o padrão estrutural estipulado da Relação de Frota do Grupo Liderança.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-extrabold h-9">
                    <tr>
                      <th className="p-2.5 pl-4">VEÍCULO / PREFIXO</th>
                      <th className="p-2.5">SITUAÇÃO DO CAMPO</th>
                      <th className="p-2.5">GRAVIDADE</th>
                      <th className="p-2.5">DESCRIÇÃO DA ANOMALIA</th>
                      <th className="p-2.5">VALOR EXTRAÍDO (OCR)</th>
                      <th className="p-2.5">APLICAÇÃO CORRETA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold dark:text-slate-300">
                    {validationResult.map((issue) => (
                      <tr key={issue.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 pl-4 font-black text-slate-950 dark:text-white flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
                            {issue.prefix || 'N/A'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="uppercase font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-black">
                            {issue.field}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            issue.severity === 'CRITICAL' 
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/20' 
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/20'
                          }`}>
                            {issue.severity === 'CRITICAL' ? 'CRÍTICA' : 'PREVENÇÃO'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">{issue.description}</td>
                        <td className="p-3 font-mono text-red-500 bg-red-500/5 font-extrabold">{issue.found}</td>
                        <td className="p-3 font-mono text-emerald-500 bg-emerald-500/5 font-extrabold">
                          <div className="flex items-center gap-1">
                            <Check size={12} />
                            <span>{issue.expected}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'COMPARISON' && (
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest font-mono">Tabela de Confrontração Técnica</h4>
              <p className="text-[11px] text-slate-500 font-semibold">
                Análise de conformidade visual. Esquerda: Dados extraídos diretamente do PDF Oficial. Direita: Banco de dados presente hoje no sistema.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-100 text-red-700 text-[10px] font-bold">● Diferenças destacadas</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-green-100 text-green-700 text-[10px] font-bold">✔ OK / Sincronizado</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side: Immutable PDF Original Data */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 space-y-3 shadow-sm">
              <div className="flex justify-between items-center bg-sky-50 dark:bg-sky-950/20 p-2.5 rounded-2xl px-4">
                <span className="text-xs font-black text-sky-800 dark:text-sky-400 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={15} /> 1. PDF RELAÇÃO DE FROTA OFICIAL (ORIGINAL LIDERANÇA)
                </span>
                <span className="bg-sky-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded font-mono">ARQUIVO DE FÉ PÚBLICA</span>
              </div>

              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-[10px] text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-extrabold py-2 sticky top-0">
                    <tr>
                      <th className="p-2 pl-3">PREFIXO</th>
                      <th className="p-2">PLACA</th>
                      <th className="p-2">MARCA</th>
                      <th className="p-2">CHASSI</th>
                      <th className="p-2">CAP</th>
                      <th className="p-2">CARROCERIA</th>
                      <th className="p-2">COR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold dark:text-slate-400">
                    {OFFICIAL_PDF_DATA.map((o) => (
                      <tr key={o.prefix} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 h-8">
                        <td className="p-2 pl-3 font-extrabold text-slate-900 dark:text-white font-mono bg-sky-500/5">{o.prefix}</td>
                        <td className="p-2 font-mono">{o.plate}</td>
                        <td className="p-2 font-bold">{o.brand}</td>
                        <td className="p-2 font-mono text-[9px] text-slate-550">{o.chassis}</td>
                        <td className="p-2 font-black">{o.capacity}</td>
                        <td className="p-2">{o.bodywork}</td>
                        <td className="p-2 font-extrabold">{o.color}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right side: Current System state with highlights in red */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 space-y-3 shadow-sm">
              <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-2.5 rounded-2xl px-4">
                <span className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <ClipboardCheck size={15} /> 2. DADOS PRESENTES NO BANCO DE DADOS (IMPORTADO)
                </span>
                <span className="bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded font-mono">DADOS DO SISTEMA</span>
              </div>

              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-[10px] text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-extrabold py-2 sticky top-0">
                    <tr>
                      <th className="p-2 pl-3">PREFIXO</th>
                      <th className="p-2">PLACA</th>
                      <th className="p-2">MARCA</th>
                      <th className="p-2">CHASSI</th>
                      <th className="p-2">CAP</th>
                      <th className="p-2">CARROCERIA</th>
                      <th className="p-2">COR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold dark:text-slate-300">
                    {fleet.map((v) => {
                      // Compare this vehicle component-by-component with corresponding official matching
                      const cleanNumericPrefix = v.prefix.replace(/O/g, '0').replace(/L/g, '1');
                      const normPlate = v.plate.trim().toUpperCase().replace(/\s/g, '');
                      
                      const matchesOfficial = OFFICIAL_PDF_DATA.find(o => o.prefix === cleanNumericPrefix || o.plate.trim().toUpperCase().replace(/\s/g, '') === normPlate);
                      
                      const isGhost = !matchesOfficial;
                      const hasBadPrefix = v.prefix !== matchesOfficial?.prefix;
                      const hasBadPlate = v.plate !== matchesOfficial?.plate;
                      const hasBadChassis = v.chassis !== matchesOfficial?.chassis;
                      const hasBadCapacity = v.capacity !== matchesOfficial?.capacity;
                      const hasBadBodywork = v.bodywork !== matchesOfficial?.bodywork;
                      const hasBadColor = v.color !== matchesOfficial?.color;

                      return (
                        <tr key={v.prefix + '-' + v.plate} className={`hover:bg-slate-50 dark:hover:bg-slate-800/20 h-8 ${
                          isGhost ? 'bg-red-500/10 dark:bg-red-950/20' : ''
                        }`}>
                          {/* Prefix Cell */}
                          <td className={`p-2 pl-3 font-mono font-extrabold ${
                            isGhost || hasBadPrefix ? 'text-red-500 font-black bg-red-1050/10' : 'text-emerald-600'
                          }`}>
                            {v.prefix} {isGhost && <span className="text-[7px] bg-red-500 text-white rounded font-sans px-1 ml-1 scale-75">FANTASMA</span>}
                          </td>
                          {/* Plate Cell */}
                          <td className={`p-2 font-mono ${
                            hasBadPlate ? 'text-red-500 font-black bg-red-500/5 decoration-red-500 line-through' : ''
                          }`}>
                            {v.plate}
                          </td>
                          {/* Brand Cell */}
                          <td className="p-2">{v.brand}</td>
                          {/* Chassis Cell */}
                          <td className={`p-2 font-mono text-[9px] ${
                            hasBadChassis ? 'text-red-500 font-black bg-red-500/5' : 'text-slate-500'
                          }`}>
                            {v.chassis}
                          </td>
                          {/* Capacity Cell */}
                          <td className={`p-2 font-black ${
                            hasBadCapacity ? 'text-red-500 bg-red-550/10 font-bold' : ''
                          }`}>
                            {v.capacity}
                          </td>
                          {/* Bodywork Cell */}
                          <td className={`p-2 ${
                            hasBadBodywork ? 'text-red-500 font-black bg-red-500/5' : ''
                          }`}>
                            {v.bodywork}
                          </td>
                          {/* Color Cell */}
                          <td className={`p-2 font-extrabold ${
                            hasBadColor ? 'text-red-500 bg-red-500/5' : ''
                          }`}>
                            {v.color}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'IMPORT_BLOCKER' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File input simulation / upload card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-4 shadow-sm lg:col-span-1">
            <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <UploadCloud size={16} className="text-primary" /> Teste de Validador
            </h3>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              O sistema simula um barramento inteligente para impedir futuras importações de planilhas Excel ou PDFs mal formatados do Grupo Liderança. Se houver divergência estrutural, a ação é bloqueada no ato.
            </p>

            <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3.5 bg-slate-50 dark:bg-slate-950">
              <UploadCloud className="text-indigo-400 shrink-0" size={32} />
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-800 dark:text-slate-200">Arraste a relação de frotas (.pdf ou .xlsx)</p>
                <p className="text-[10px] text-slate-400 font-mono">Formatos aceitos: PDF nativo ou Excel gerencial</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-black text-slate-450 tracking-wider font-mono">Relações prontas para testar:</span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  disabled={isImporting}
                  onClick={() => handleSimulateFileImport('Frota_Lideranca_Oficial_Verificado.pdf', false)}
                  className="px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100 hover:border-emerald-250 rounded-xl text-left font-black text-[11px] leading-tight flex justify-between items-center cursor-pointer transition-colors"
                >
                  <div>
                    <p>Frota_Lideranca_Oficial.pdf</p>
                    <span className="text-[9px] font-bold text-emerald-600 block mt-0.5">✔ Dados puros e homologados</span>
                  </div>
                  <ArrowRight size={14} className="text-emerald-500" />
                </button>

                <button
                  type="button"
                  disabled={isImporting}
                  onClick={() => handleSimulateFileImport('Frota_Corrompida_OCR.pdf', true)}
                  className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-100 hover:border-rose-250 rounded-xl text-left font-black text-[11px] leading-tight flex justify-between items-center cursor-pointer transition-colors"
                >
                  <div>
                    <p>Frota_Corrompida_OCR.pdf</p>
                    <span className="text-[9px] font-bold text-rose-600 block mt-0.5">❌ Prefixo 'A118', colunas deslocadas</span>
                  </div>
                  <ArrowRight size={14} className="text-rose-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Secure interactive console display */}
          <div className="bg-theme dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h3 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-widest font-mono flex items-center gap-1.5 white">
                <span>TERMINAL DO BARRAMENTO DE IMPORTAÇÃO</span>
                {importStatus === 'SCANNING' && <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>}
                {importStatus === 'BLOCKED' && <span className="px-1.5 py-0.5 rounded bg-red-500 text-white font-sans font-black text-[8px]">RECUSADO</span>}
                {importStatus === 'SUCCESS' && <span className="px-1.5 py-0.5 rounded bg-emerald-555 text-slate-950 font-sans font-black text-[8px] bg-emerald-400">APROVADO</span>}
              </h3>
              {selectedFile && <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-850 p-1 px-2.5 rounded">{selectedFile}</span>}
            </div>

            <div className="bg-slate-950 dark:bg-slate-950 text-slate-300 font-mono text-[11px] p-5 rounded-2xl min-h-[300px] overflow-y-auto border border-slate-900 space-y-2 leading-relaxed">
              {importLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-20">
                  <PlaySimulateOverlay />
                  <p className="text-center font-bold">Terminal aguardando carga de arquivo.</p>
                  <p className="text-[10px] text-center max-w-sm">Escolha uma das simulações de PDF ao lado esquerdo para iniciar a varredura e conferência de segurança.</p>
                </div>
              ) : (
                importLogs.map((logStr, idx) => {
                  let textClass = "text-slate-300";
                  if (logStr.includes("[ERRO CRÍTICO]")) textClass = "text-red-400 font-black animate-pulse";
                  else if (logStr.includes("[ALERT]")) textClass = "text-amber-400 font-black";
                  else if (logStr.includes("[OK]")) textClass = "text-emerald-400 font-bold";
                  else if (logStr.includes("[BLOQUEADO]")) textClass = "text-red-500 font-black text-xs";
                  else if (logStr.includes("[Sucesso]")) textClass = "text-emerald-300 font-black";
                  else if (logStr.includes("[INFO]")) textClass = "text-sky-400";

                  return (
                    <div key={idx} className={`${textClass} border-b border-white/5 pb-1`}>
                      <span className="text-slate-500 mr-2">[{new Date().toLocaleTimeString('pt-BR')}]</span>
                      {logStr}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <History size={16} className="text-primary" /> Histórico de Auditorias e Correções de Frota
            </h3>
            <button
              onClick={handleClearLogs}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-red-500 rounded-lg text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={13} /> Limpar Registro
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-extrabold h-9">
                <tr>
                  <th className="p-2.5 pl-4">DATA & HORA CORREÇÃO</th>
                  <th className="p-2.5">PREFIXO ALVO</th>
                  <th className="p-2.5">CATEGORIA DA AÇÃO</th>
                  <th className="p-2.5">DESCRIÇÃO HISTÓRICA DO AJUSTE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold dark:text-slate-350">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/20 text-slate-700 dark:text-slate-300">
                    <td className="p-3 pl-4 font-mono text-[10px] text-slate-400 flex items-center gap-1.5">
                      <Clock size={12} />
                      <span>{log.timestamp}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {log.prefix}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        log.type.includes('REMOÇÃO') 
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20' 
                          : log.type.includes('CORREÇÃO') 
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20'
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="p-3 leading-relaxed font-semibold">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple visual decoration for placeholder state in terminal
const PlaySimulateOverlay = () => (
  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 shadow shadow-indigo-500/20 animate-pulse text-indigo-400">
    <Eye size={20} />
  </div>
);
