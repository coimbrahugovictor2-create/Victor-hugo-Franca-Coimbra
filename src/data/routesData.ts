export interface RouteLine {
  id: string;
  routeNumber?: string;
  origin: string;
  destination: string;
  time: string;
  category: 'MARLY' | 'LIDERANÇA' | 'JJ TUR' | 'EXTRA';
  isExtra: boolean;
  serviceType: 'Executivo' | 'Leito Total' | 'Leito Cama' | 'Semi Leito';
}

export const APPROVED_ROUTES_DATA: RouteLine[] = [
  // ORIGEM: GOIÂNIA - MARLY
  { id: "R-01", routeNumber: "01", origin: "GOIÂNIA", destination: "PORANGATU", time: "06:00", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-02", routeNumber: "02", origin: "GOIÂNIA", destination: "CALDAS NOVAS", time: "06:45", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-03", routeNumber: "03", origin: "GOIÂNIA", destination: "MONTIVIDIU", time: "08:00", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-04", routeNumber: "04", origin: "GOIÂNIA", destination: "PORANGATU", time: "09:00", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-05", routeNumber: "05", origin: "GOIÂNIA", destination: "MARAROSA", time: "11:00", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-06", routeNumber: "06", origin: "GOIÂNIA", destination: "CALDAS NOVAS", time: "11:30", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-07", routeNumber: "07", origin: "GOIÂNIA", destination: "PORANGATU", time: "12:00", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-08", routeNumber: "08", origin: "GOIÂNIA", destination: "CATALÃO", time: "12:30", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-09", routeNumber: "09", origin: "GOIÂNIA", destination: "CALDAS NOVAS", time: "14:30", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-10", routeNumber: "10", origin: "GOIÂNIA", destination: "URUAÇU", time: "15:00", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-11", routeNumber: "11", origin: "GOIÂNIA", destination: "CALDAS NOVAS", time: "17:30", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-12", routeNumber: "12", origin: "GOIÂNIA", destination: "SANTANA DO ARAGUAIA", time: "18:30", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-13", routeNumber: "13", origin: "GOIÂNIA", destination: "PORANGATU", time: "21:00", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-14", routeNumber: "14", origin: "GOIÂNIA", destination: "PORANGATU", time: "23:59", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  
  // GOIÂNIA - MARLY EXTRA
  { id: "R-MX-01", origin: "GOIÂNIA", destination: "PORANGATU", time: "23:45", category: "EXTRA", isExtra: true, serviceType: "Executivo" },
  { id: "R-MX-02", origin: "GOIÂNIA", destination: "PORANGATU", time: "18:35", category: "EXTRA", isExtra: true, serviceType: "Executivo" },
  { id: "R-MX-03", origin: "GOIÂNIA", destination: "CALDAS NOVAS", time: "09:00", category: "EXTRA", isExtra: true, serviceType: "Executivo" },
  { id: "R-MX-04", origin: "GOIÂNIA", destination: "CATALÃO", time: "14:30", category: "EXTRA", isExtra: true, serviceType: "Executivo" },
  { id: "R-MX-05", origin: "GOIÂNIA", destination: "CALDAS NOVAS", time: "09:00", category: "EXTRA", isExtra: true, serviceType: "Executivo" }, // Duplicado intencionalmente
  { id: "R-MX-06", origin: "GOIÂNIA", destination: "CALDAS NOVAS", time: "17:45", category: "EXTRA", isExtra: true, serviceType: "Executivo" },
  { id: "R-MX-07", origin: "GOIÂNIA", destination: "PORANGATU", time: "23:45", category: "EXTRA", isExtra: true, serviceType: "Executivo" }, // Duplicado intencionalmente

  // ORIGEM: GOIÂNIA - LIDERANÇA
  { id: "R-15", routeNumber: "15", origin: "GOIÂNIA", destination: "BELÉM", time: "10:00", category: "LIDERANÇA", isExtra: false, serviceType: "Executivo" },
  { id: "R-16", routeNumber: "16", origin: "GOIÂNIA", destination: "PARAUAPEBAS", time: "11:00", category: "LIDERANÇA", isExtra: false, serviceType: "Executivo" },
  { id: "R-17", routeNumber: "17", origin: "GOIÂNIA", destination: "IMPERATRIZ", time: "12:00", category: "LIDERANÇA", isExtra: false, serviceType: "Executivo" },
  { id: "R-18", routeNumber: "18", origin: "GOIÂNIA", destination: "PARAUAPEBAS", time: "17:00", category: "LIDERANÇA", isExtra: false, serviceType: "Executivo" },
  { id: "R-19", routeNumber: "19", origin: "GOIÂNIA", destination: "SÃO LUIZ", time: "18:00", category: "LIDERANÇA", isExtra: false, serviceType: "Executivo" },
  { id: "R-20", routeNumber: "20", origin: "GOIÂNIA", destination: "PALMAS", time: "19:00", category: "LIDERANÇA", isExtra: false, serviceType: "Executivo" },
  { id: "R-21", routeNumber: "21", origin: "GOIÂNIA", destination: "PALMAS", time: "19:15", category: "LIDERANÇA", isExtra: false, serviceType: "Executivo" },
  { id: "R-22", routeNumber: "22", origin: "GOIÂNIA", destination: "PALMAS", time: "19:30", category: "LIDERANÇA", isExtra: false, serviceType: "Executivo" },
  { id: "R-23", routeNumber: "23", origin: "GOIÂNIA", destination: "BELÉM", time: "20:00", category: "LIDERANÇA", isExtra: false, serviceType: "Executivo" },

  // GOIÂNIA - LIDERANÇA EXTRA
  { id: "R-LX-01", origin: "GOIÂNIA", destination: "PALMAS", time: "19:45", category: "EXTRA", isExtra: true, serviceType: "Executivo" },
  { id: "R-LX-02", origin: "GOIÂNIA", destination: "PALMAS", time: "19:45", category: "EXTRA", isExtra: true, serviceType: "Executivo" }, // Duplicado intencionalmente
  { id: "R-LX-03", origin: "GOIÂNIA", destination: "PALMAS", time: "19:45", category: "EXTRA", isExtra: true, serviceType: "Executivo" }, // Duplicado intencionalmente
  { id: "R-LX-04", origin: "GOIÂNIA", destination: "PALMAS", time: "19:45", category: "EXTRA", isExtra: true, serviceType: "Executivo" }, // Duplicado intencionalmente

  // ORIGEM: GOIÂNIA - JJ TUR
  { id: "R-24", routeNumber: "24", origin: "GOIÂNIA", destination: "ALTAMIRA", time: "14:00", category: "JJ TUR", isExtra: false, serviceType: "Executivo" },
  { id: "R-25", routeNumber: "25", origin: "GOIÂNIA", destination: "MARABÁ", time: "20:30", category: "JJ TUR", isExtra: false, serviceType: "Executivo" },

  // ORIGEM: PORANGATU
  { id: "R-27", routeNumber: "27", origin: "PORANGATU", destination: "GOIÂNIA", time: "06:30", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-28", routeNumber: "28", origin: "PORANGATU", destination: "GOIÂNIA", time: "12:00", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-29", routeNumber: "29", origin: "PORANGATU", destination: "GOIÂNIA", time: "12:30", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-30", routeNumber: "30", origin: "PORANGATU", destination: "GOIÂNIA", time: "23:00", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-31", routeNumber: "31", origin: "PORANGATU", destination: "GOIÂNIA", time: "23:59", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-PX-01", origin: "PORANGATU", destination: "GOIÂNIA", time: "23:45", category: "EXTRA", isExtra: true, serviceType: "Executivo" },

  // ORIGEM: URUAÇU
  { id: "R-32", routeNumber: "32", origin: "URUAÇU", destination: "GOIÂNIA", time: "06:00", category: "MARLY", isExtra: false, serviceType: "Executivo" },

  // ORIGEM: MARAROSA
  { id: "R-33", routeNumber: "33", origin: "MARAROSA", destination: "GOIÂNIA", time: "06:00", category: "MARLY", isExtra: false, serviceType: "Executivo" },

  // ORIGEM: MONTVIDIU
  { id: "R-34", routeNumber: "34", origin: "MONTVIDIU", destination: "GOIÂNIA", time: "21:00", category: "MARLY", isExtra: false, serviceType: "Executivo" },

  // ORIGEM: CALDAS NOVAS
  { id: "R-35", routeNumber: "35", origin: "CALDAS NOVAS", destination: "GOIÂNIA", time: "07:00", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-36", routeNumber: "36", origin: "CALDAS NOVAS", destination: "GOIÂNIA", time: "12:30", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-37", routeNumber: "37", origin: "CALDAS NOVAS", destination: "GOIÂNIA", time: "18:30", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-CX-01", origin: "CALDAS NOVAS", destination: "GOIÂNIA", time: "18:35", category: "EXTRA", isExtra: true, serviceType: "Executivo" },
  { id: "R-CX-02", origin: "CALDAS NOVAS", destination: "GOIÂNIA", time: "18:35", category: "EXTRA", isExtra: true, serviceType: "Executivo" }, // Duplicado intencionalmente

  // ORIGEM: CATALÃO
  { id: "R-38", routeNumber: "38", origin: "CATALÃO", destination: "GOIÂNIA", time: "05:00", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-39", routeNumber: "39", origin: "CATALÃO", destination: "GOIÂNIA", time: "07:00", category: "MARLY", isExtra: false, serviceType: "Executivo" },
  { id: "R-TX-01", origin: "CATALÃO", destination: "GOIÂNIA", time: "19:30", category: "EXTRA", isExtra: true, serviceType: "Executivo" },

  // ORIGEM: CERES
  { id: "R-40", routeNumber: "40", origin: "CERES", destination: "GOIÂNIA", time: "06:30", category: "MARLY", isExtra: false, serviceType: "Executivo" },

  // ORIGEM: SANTANA DO ARAGUAIA
  { id: "R-40-B", routeNumber: "40", origin: "SANTANA DO ARAGUAIA", destination: "GOIÂNIA", time: "09:00", category: "MARLY", isExtra: false, serviceType: "Executivo" },

  // ORIGEM: PALMAS
  { id: "R-41", routeNumber: "41", origin: "PALMAS", destination: "GOIÂNIA", time: "18:30", category: "LIDERANÇA", isExtra: false, serviceType: "Executivo" }, // EXEC
  { id: "R-42", routeNumber: "42", origin: "PALMAS", destination: "GOIÂNIA", time: "19:15", category: "LIDERANÇA", isExtra: false, serviceType: "Leito Total" }, // LEITO T.
  { id: "R-43", routeNumber: "43", origin: "PALMAS", destination: "GOIÂNIA", time: "19:30", category: "LIDERANÇA", isExtra: false, serviceType: "Leito Cama" }, // CAMA
  { id: "R-PAX-01", origin: "PALMAS", destination: "GOIÂNIA", time: "19:45", category: "EXTRA", isExtra: true, serviceType: "Executivo" }, // EXEC
  { id: "R-PAX-02", origin: "PALMAS", destination: "GOIÂNIA", time: "20:00", category: "EXTRA", isExtra: true, serviceType: "Executivo" }, // EXEC
  { id: "R-PAX-03", origin: "PALMAS", destination: "GOIÂNIA", time: "19:45", category: "EXTRA", isExtra: true, serviceType: "Executivo" }, // EXEC - Duplicado intencionalmente
  { id: "R-PAX-04", origin: "PALMAS", destination: "GOIÂNIA", time: "19:45", category: "EXTRA", isExtra: true, serviceType: "Executivo" }, // EXEC - Duplicado intencionalmente

  // ORIGEM: IMPERATRIZ
  { id: "R-44", routeNumber: "44", origin: "IMPERATRIZ", destination: "GOIÂNIA", time: "12:30", category: "LIDERANÇA", isExtra: false, serviceType: "Executivo" },
  { id: "R-IX-01", origin: "IMPERATRIZ", destination: "SÃO LUIZ", time: "20:30", category: "EXTRA", isExtra: true, serviceType: "Executivo" },

  // ORIGEM: PARAUAPEBAS
  { id: "R-45", routeNumber: "45", origin: "PARAUAPEBAS", destination: "GOIÂNIA", time: "06:30", category: "LIDERANÇA", isExtra: false, serviceType: "Executivo" },
  { id: "R-46", routeNumber: "46", origin: "PARAUAPEBAS", destination: "GOIÂNIA", time: "12:00", category: "LIDERANÇA", isExtra: false, serviceType: "Executivo" },

  // ORIGEM: SÃO LUIZ
  { id: "R-47", routeNumber: "47", origin: "SÃO LUIZ", destination: "GOIÂNIA", time: "19:00", category: "LIDERANÇA", isExtra: false, serviceType: "Executivo" },
  { id: "R-SLX-01", origin: "SÃO LUIZ", destination: "SÃO LUIZ", time: "19:15", category: "EXTRA", isExtra: true, serviceType: "Executivo" },

  // ORIGEM: BELÉM
  { id: "R-48", routeNumber: "48", origin: "BELÉM", destination: "GOIÂNIA", time: "09:00", category: "LIDERANÇA", isExtra: false, serviceType: "Executivo" },
  { id: "R-49", routeNumber: "49", origin: "BELÉM", destination: "ALTAMIRA", time: "18:00", category: "LIDERANÇA", isExtra: false, serviceType: "Executivo" },
  { id: "R-50", routeNumber: "50", origin: "BELÉM", destination: "CONCEIÇÃO DO ARAGUAIA", time: "18:30", category: "LIDERANÇA", isExtra: false, serviceType: "Executivo" },
  { id: "R-51", routeNumber: "51", origin: "BELÉM", destination: "GOIÂNIA", time: "19:00", category: "LIDERANÇA", isExtra: false, serviceType: "Executivo" },
  { id: "R-52", routeNumber: "52", origin: "BELÉM", destination: "CANAÃ DOS CARAJÁS", time: "19:30", category: "LIDERANÇA", isExtra: false, serviceType: "Executivo" },

  // ORIGEM: CONCEIÇÃO DO ARAGUAIA
  { id: "R-53", routeNumber: "53", origin: "CONCEIÇÃO DO ARAGUAIA", destination: "BELÉM", time: "09:00", category: "LIDERANÇA", isExtra: false, serviceType: "Executivo" },

  // ORIGEM: CANAÃ DOS CARAJÁS
  { id: "R-54", routeNumber: "54", origin: "CANAÃ DOS CARAJÁS", destination: "MARABÁ", time: "18:40", category: "LIDERANÇA", isExtra: false, serviceType: "Executivo" },

  // ORIGEM: ALTAMIRA
  { id: "R-55", routeNumber: "55", origin: "ALTAMIRA", destination: "GOIÂNIA", time: "17:00", category: "LIDERANÇA", isExtra: false, serviceType: "Executivo" },
  { id: "R-56", routeNumber: "56", origin: "ALTAMIRA", destination: "BELÉM", time: "18:00", category: "JJ TUR", isExtra: false, serviceType: "Executivo" },
  { id: "R-57", routeNumber: "57", origin: "ALTAMIRA", destination: "MARABÁ / GOIÂNIA", time: "20:00", category: "JJ TUR", isExtra: false, serviceType: "Executivo" }
];
