import { APPROVED_ROUTES_DATA, RouteLine } from './routesData';

// Generate default prefixes to use in the deterministic generator
const FLEET_PREFIXES = [
  "1180", "1190", "1250", "1260", "1320", "1330", "1400", "1410", "1420", "1430",
  "1440", "1450", "1460", "1470", "1480", "1490", "1500", "1515", "1520", "1540",
  "1550", "1560", "1570", "1580", "1590", "1600", "1610", "1620", "1630", "1640",
  "1650", "1660", "1670", "1680", "1690", "1700", "1710", "1720", "1730", "1740",
  "1750", "1760", "1770", "1780", "1790", "1800", "1810", "1820", "1830", "1840",
  "1850", "1860", "1870", "1880", "1890", "1900", "1910", "1920", "1930", "1940",
  "1950", "1960", "1970", "1980", "1990", "2000", "2010", "2020", "2030"
];

// Seeded random helper to generate clean deterministic data that looks styled
function getSeededValue(routeId: string, dayNum: number): string {
  // Hash function to get a consistent number for the same routeId + day
  let hash = 0;
  const str = routeId + dayNum.toString();
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  
  const absHash = Math.abs(hash);
  
  // Decide if this slot is empty (XXXXXXX) or cancelled (CANC.)
  // Let's make around 12% of cells XXXXXXX and 5% CANC.
  const roll = absHash % 100;
  if (roll < 8) return "XXXXXXX";
  if (roll >= 8 && roll < 12) return "CANC.";
  
  // Choose a prefix from our fleet at random but deterministic
  const prefixIdx = absHash % FLEET_PREFIXES.length;
  return FLEET_PREFIXES[prefixIdx];
}

// Exactly represent the first few days of the OCR to match the PDF on screen perfectly
const OCR_PRESETS: Record<string, string[]> = {
  "R-01": ["1440", "1260", "1440", "1180", "1440", "1180", "1440", "1180", "1620", "1180"],
  "R-02": ["1540", "1330", "1540", "1540", "1850", "1500", "1500", "1500", "1500", "1500"],
  "R-03": ["1180", "1190", "1490", "1260", "1190", "1600", "1260", "1190", "1600", "1600"],
  "R-04": ["1600", "1320", "1190", "1600", "1260", "1190", "1600", "1470", "1190/1480", "1460"],
  "R-05": ["1480", "1180", "1610", "1490", "1640", "1620", "1820", "1260", "1450", "1540"],
  "R-06": ["1680", "1580", "1520", "1680", "1320", "1590", "1540", "1320", "1590", "1580"],
  "R-07": ["1840", "1840", "1840", "1840", "1840", "1840", "1840", "1840", "1840", "1840"],
  "R-08": ["1770", "1770", "1770", "1770", "1770", "1770", "1770", "1770", "1770", "1770"],
  "R-09": ["1580", "1500", "1500", "1500", "1680", "1540", "1320", "1580", "1580", "1590"],
  "R-10": ["1250", "1250", "1250", "1250", "1250", "1250", "1480", "1250", "1490", "1490"],
  "R-15": ["1780", "1830", "XXXXXXX", "1950", "1820/1630", "1960", "1640", "1990", "1820", "1630"],
  "R-16": ["1860", "2070", "2030", "2000", "2070", "1910", "1750", "1860", "2060", "1920"],
  "R-17": ["1900", "XXXXXXX", "XXXXXXX", "XXXXXXX", "2050", "2030", "XXXXXXX", "1880", "XXXXXXX", "1740"],
  "R-18": ["1940", "1660", "XXXXXXX", "1990", "1650", "1790", "1660", "1970", "1610", "1450"],
  "R-24": ["1890", "3046", "2060", "3045", "1890", "1810", "3046", "3045", "1890", "1690"],
  "R-25": ["3044", "3041", "XXXXXXX", "3042", "1940", "3044", "3041", "3042", "1790", "3044"]
};

// Return cell value. If there's a live database scale for this route & day, it overrides fallback data.
export function getPdfGridCell(route: RouteLine, day: number, month: number, year: number, liveScales: any[]): { 
  prefix: string; 
  id?: string;
  isLive: boolean; 
  driver?: string;
} {
  // Format target date as YYYY-MM-DD
  const mm = month < 10 ? `0${month}` : `${month}`;
  const dd = day < 10 ? `0${day}` : `${day}`;
  const targetDateStr = `${year}-${mm}-${dd}`;
  
  // Look for a live scale where:
  // 1. Departure time matches
  // & 2. Origin matches
  // & 3. Destination matches
  // & 4. Date matches
  const liveScale = liveScales.find(s => {
    // Standardize comparison
    const sDate = s.date; // "2026-04-01" or similar
    const sTime = s.time; // "06:00"
    
    // Check if line contains origin and destination
    const matchesLine = (
      s.line && s.line.toLowerCase().includes(route.origin.toLowerCase()) && 
      s.line.toLowerCase().includes(route.destination.toLowerCase())
    ) || (s.routeId === route.id);
    
    return sDate === targetDateStr && sTime === route.time && matchesLine;
  });
  
  if (liveScale) {
    return {
      prefix: liveScale.busPrefix,
      id: liveScale.id,
      isLive: true,
      driver: liveScale.driverName || liveScale.driversList?.join(' / ')
    };
  }
  
  // Return empty string as unassigned for the user to edit from scratch
  return {
    prefix: "",
    isLive: false
  };
}
