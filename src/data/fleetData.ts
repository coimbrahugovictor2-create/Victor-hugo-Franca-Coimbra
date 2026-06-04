export interface Vehicle {
  prefix: string;
  plate: string;
  renavam: string;
  unit: string; // e.g. "GOIÂNIA-GO"
  owner: string; // e.g. "VIAÇÃO RIO OESTE"
  possession: string; // e.g. "EXPRESSO MARLY", "LIDERANÇA TURISMO", "JJ TUR"
  classification: "Executivo" | "Semi Leito" | "Leito Cama" | "Leito Total";
  capacity: number;
  serviceType: string; // RODOVIARIO etc.
  brand: "M. BENZ" | "SCANIA" | "VOLVO";
  model: string; // e.g. "O 500 / 354 CV", "K 360 CV", "B11R 410 CV", "K 410", "K 500 C", "B460R", "O 500"
  transmissionType: "MANUAL" | "AUTOMATICO";
  axes: number; // 6 or 8
  euro: string; // "V" or "VI"
  yearManufacture: number;
  yearModel: number;
  chassis: string;
  color: string;
  bodywork: string; // "MARCOPOLO G7 LD", "MARCOPOLO NEW G7", etc.
  emplacamento: string;
  situationAntt: "APROVADO" | "VENCIDO" | "NÃO TEM VISTORIA";
  expiryAntt: string; // Date or "NÃO TEM"
  expiryCrono: string; // Date or "NÃO TEM"
  expiryArtran: string; // Date or "NÃO TEM"
  expiryAgr: string; // Date or "NÃO TEM"
  statusOperacional: "ATIVO" | "MANUTENÇÃO" | "INATIVO" | "RESERVADO";
  vistoria: "APROVADO" | "VENCIDO" | "NÃO TEM VISTORIA" | "NÃO TEM";
}

const COMPACT_DATA: any[] = [
  {p:"1180",pl:"PRB 9387",r:"01135520973",po:"EXPRESSO MARLY",cl:"Executivo",ca:48,b:"M. BENZ",m:"O 500 / 354 CV",ax:6,eu:"V",ym:2016,yo:2017,ch:"9BM634061GB034848",co:"BRANCA",by:"MARCOPOLO G7 LD",sa:"APROVADO",ea:"01/01/2027",ec:"23/01/2024",ey:"01/01/2026",vi:"APROVADO"},
  {p:"1190",pl:"PRB 9377",r:"01135518499",po:"EXPRESSO MARLY",cl:"Executivo",ca:48,b:"M. BENZ",m:"O 500 / 354 CV",ax:6,eu:"V",ym:2016,yo:2017,ch:"9BM634061HB046913",co:"BRANCA",by:"MARCOPOLO G7 LD",sa:"APROVADO",ea:"01/09/2026",ec:"27/01/2024",ey:"01/09/2026",vi:"APROVADO"},
  {p:"1250",pl:"PRX 1634",r:"01156661266",po:"LIDERANÇA TURISMO",cl:"Executivo",ca:48,b:"SCANIA",m:"K 360 CV",ax:6,eu:"V",ym:2018,yo:2018,ch:"9BSK6X200J3923703",co:"BRANCA",by:"MARCOPOLO G7 LD",sa:"APROVADO",ea:"01/08/2025",ec:"06/01/2024",ey:"01/08/2025",vi:"APROVADO"},
  {p:"1260",pl:"PQS 1007",r:"01191005477",po:"LIDERANÇA TURISMO",cl:"Executivo",ca:48,b:"M. BENZ",m:"O 500 / 354 CV",ax:6,eu:"V",ym:2019,yo:2020,ch:"9BM634061LB130281",co:"BRANCA",by:"MARCOPOLO NEW G7 LD",sa:"APROVADO",ea:"01/05/2025",ec:"01/01/2025",ey:"01/05/2025",vi:"APROVADO"},
  {p:"1320",pl:"PRL 5858",r:"01187190524",po:"EXPRESSO MARLY",cl:"Semi Leito",ca:56,b:"VOLVO",m:"B11R 410 CV",ax:6,eu:"V",ym:2019,yo:2020,ch:"9BVT2S929LE388712",co:"VERDE",by:"MARCOPOLO NEW G7",sa:"APROVADO",ea:"01/04/2025",ec:"04/01/2024",ey:"01/04/2025",vi:"APROVADO"},
  {p:"1330",pl:"QTN 7894",r:"01207302691",po:"EXPRESSO MARLY",cl:"Semi Leito",ca:56,b:"VOLVO",m:"B11R 410 CV",ax:6,eu:"V",ym:2019,yo:2020,ch:"9BVT2S923LE389273",co:"BRANCA",by:"MARCOPOLO NEW G7",sa:"APROVADO",ea:"01/01/2025",ec:"23/06/2024",ey:"01/11/2024",vi:"APROVADO"},
  {p:"1400",pl:"SCP 7J42",r:"01321016023",po:"LIDERANÇA TURISMO",cl:"Leito Total",ca:43,b:"SCANIA",m:"K 400 CV",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BSK6X200P4013994",co:"BRANCA",by:"MARCOPOLO G8 DD TOTAL",sa:"APROVADO",ea:"01/10/2026",ec:"20/04/2024",ey:"01/10/2026",vi:"APROVADO"},
  {p:"1410",pl:"SDI 1G44",r:"01321060103",po:"LIDERANÇA TURISMO",cl:"Leito Total",ca:43,b:"SCANIA",m:"K 400 CV",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BSK6X200N4011912",co:"BRANCA",by:"MARCOPOLO G8 DD TOTAL",sa:"APROVADO",ea:"01/10/2024",ec:"14/12/2024",ey:"01/10/2024",vi:"APROVADO"},
  {p:"1420",pl:"SCR 7E62",r:"01321015515",po:"LIDERANÇA TURISMO",cl:"Leito Total",ca:43,b:"SCANIA",m:"K 400 CV",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BSK6X200N4011882",co:"BRANCA",by:"MARCOPOLO G8 DD TOTAL",sa:"APROVADO",ea:"01/10/2024",ec:"20/04/2024",ey:"01/10/2024",vi:"APROVADO"},
  {p:"1430",pl:"SDC 6G84",r:"01324708163",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:56,b:"SCANIA",m:"K 400 CV",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BSK6X200N4011917",co:"BRANCA",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/10/2026",ec:"16/11/2024",ey:"01/10/2026",vi:"APROVADO"},
  {p:"1440",pl:"SBW 7G17",r:"01324051903",po:"LIDERANÇA TURISMO",cl:"Executivo",ca:46,b:"M. BENZ",m:"O 500 / 354 CV",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BM634061PB275166",co:"BRANCA",by:"MARCOPOLO G8 LD",sa:"APROVADO",ea:"01/10/2024",ec:"01/11/2024",ey:"01/10/2024",vi:"APROVADO"},
  {p:"1450",pl:"SBW 7G37",r:"01324051440",po:"LIDERANÇA TURISMO",cl:"Executivo",ca:46,b:"M. BENZ",m:"O 500 / 354 CV",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BM634061PB275023",co:"BRANCA",by:"MARCOPOLO G8 LD",sa:"APROVADO",ea:"01/10/2026",ec:"01/11/2024",ey:"01/10/2026",vi:"APROVADO"},
  {p:"1460",pl:"SCY 6B75",r:"01325044129",po:"LIDERANÇA TURISMO",cl:"Executivo",ca:46,b:"M. BENZ",m:"O 500 / 354 CV",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BM634061PM275021",co:"BRANCA",by:"MARCOPOLO G8 LD",sa:"APROVADO",ea:"01/10/2026",ec:"14/12/2024",ey:"01/10/2026",vi:"APROVADO"},
  {p:"1470",pl:"SCY 6B85",r:"01325044390",po:"LIDERANÇA TURISMO",cl:"Executivo",ca:46,b:"M. BENZ",m:"O 500 / 354 CV",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BM634061PM275030",co:"BRANCA",by:"MARCOPOLO G8 LD",sa:"APROVADO",ea:"01/12/2024",ec:"07/12/2024",ey:"01/12/2024",vi:"APROVADO"},
  {p:"1480",pl:"SCI 3J86",r:"01325043319",po:"EXPRESSO MARLY",cl:"Executivo",ca:46,b:"M. BENZ",m:"O 500 / 354 CV",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BM634061PB276605",co:"BRANCA",by:"MARCOPOLO G8 LD",sa:"APROVADO",ea:"01/01/2027",ec:"10/04/2024",ey:"01/01/2027",vi:"APROVADO"},
  {p:"1490",pl:"SCI 4C96",r:"01325043467",po:"EXPRESSO MARLY",cl:"Executivo",ca:46,b:"M. BENZ",m:"O 500 / 354 CV",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BM634061PB276612",co:"BRANCA",by:"MARCOPOLO G8 LD",sa:"APROVADO",ea:"01/09/2024",ec:"27/12/2024",ey:"01/09/2024",vi:"APROVADO"},
  {p:"1500",pl:"SCJ 2G76",r:"01333714936",po:"EXPRESSO MARLY",cl:"Semi Leito",ca:56,b:"M. BENZ",m:"O 500 / 354 CV",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BM634061PB282090",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/08/2025",ec:"20/04/2024",ey:"01/07/2024",vi:"APROVADO"},
  {p:"1515",pl:"SCF 7B18",r:"01323386616",po:"EXPRESSO MARLY",cl:"Semi Leito",ca:56,b:"M. BENZ",m:"O 500 / 354 CV",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BM634061PB282111",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/07/2025",ec:"21/12/2023",ey:"01/07/2025",vi:"APROVADO"},
  {p:"1520",pl:"SCE 4H55",r:"01319728836",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:63,b:"VOLVO",m:"B11R 450 CV",ax:8,eu:"V",ym:2021,yo:2022,ch:"9BVT2T12XNE390411",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/07/2025",ec:"05/05/2024",ey:"01/07/2025",vi:"APROVADO"},
  {p:"1540",pl:"SCH 9F78",r:"01345847880",po:"EXPRESSO MARLY",cl:"Semi Leito",ca:56,b:"M. BENZ",m:"O 500 / 354 CV",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BM634061PB304724",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/07/2025",ec:"21/12/2023",ey:"01/07/2025",vi:"APROVADO"},
  {p:"1550",pl:"SCH 9F28",r:"01345848339",po:"LIDERANÇA TURISMO",cl:"Leito Total",ca:43,b:"M. BENZ",m:"O 500 / 354 CV",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BM634061PB302868",co:"VERDE",by:"MARCOPOLO G8 DD TOTAL",sa:"APROVADO",ea:"01/10/2026",ec:"21/12/2023",ey:"01/10/2026",vi:"APROVADO"},
  {p:"1560",pl:"SCH 5H38",r:"01345848606",po:"LIDERANÇA TURISMO",cl:"Leito Total",ca:43,b:"M. BENZ",m:"O 500 / 354 CV",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BM634061PB303350",co:"VERDE",by:"MARCOPOLO G8 DD TOTAL",sa:"APROVADO",ea:"01/10/2026",ec:"21/12/2023",ey:"01/10/2026",vi:"APROVADO"},
  {p:"1570",pl:"SDB 5B08",r:"01345848053",po:"LIDERANÇA TURISMO",cl:"Leito Total",ca:43,b:"M. BENZ",m:"O 500 / 354 CV",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BM634061PB304611",co:"VERDE",by:"MARCOPOLO G8 DD TOTAL",sa:"APROVADO",ea:"01/11/2024",ec:"07/12/2023",ey:"01/11/2024",vi:"APROVADO"},
  {p:"1580",pl:"SCS 5G51",r:"01351656528",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:56,b:"SCANIA",m:"K 400 CV",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BSK6X200P4032298",co:"VERDE",by:"COMIL INVICTUS DD",sa:"APROVADO",ea:"01/01/2027",ec:"06/04/2024",ey:"01/01/2027",vi:"APROVADO"},
  {p:"1590",pl:"SCS 5E01",r:"01351656625",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:56,b:"SCANIA",m:"K 400 CV",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BSK6X200P4032952",co:"VERDE",by:"COMIL INVICTUS DD",sa:"APROVADO",ea:"01/01/2027",ec:"06/04/2024",ey:"01/01/2027",vi:"APROVADO"},
  {p:"1600",pl:"SCS 5E11",r:"01351657680",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:56,b:"SCANIA",m:"K 400 CV",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BSK6X200P4032960",co:"VERDE",by:"COMIL INVICTUS DD",sa:"APROVADO",ea:"01/01/2027",ec:"06/04/2024",ey:"01/01/2027",vi:"APROVADO"},
  {p:"1610",pl:"SDN 3G24",r:"01370177418",po:"LIDERANÇA TURISMO",cl:"Executivo",ca:46,b:"M. BENZ",m:"O 500 /381 CV",ax:6,eu:"VI",ym:2023,yo:2023,ch:"9BM634062RB334116",co:"VERDE",by:"MARCOPOLO G8 LD",sa:"NÃO TEM VISTORIA",ea:"01/10/2024",ec:"07/12/2024",ey:"01/10/2024",vi:"NÃO TEM VISTORIA"},
  {p:"1620",pl:"SDJ 5B84",r:"01370177922",po:"LIDERANÇA TURISMO",cl:"Executivo",ca:46,b:"M. BENZ",m:"O 500 /381 CV",ax:6,eu:"VI",ym:2023,yo:2023,ch:"9BM634062RB334961",co:"VERDE",by:"MARCOPOLO G8 LD",sa:"NÃO TEM VISTORIA",ea:"01/10/2024",ec:"07/12/2024",ey:"01/10/2024",vi:"NÃO TEM VISTORIA"},
  {p:"1630",pl:"SDH 7H14",r:"01370177760",po:"LIDERANÇA TURISMO",cl:"Executivo",ca:46,b:"M. BENZ",m:"O 500 /381 CV",ax:6,eu:"VI",ym:2023,yo:2023,ch:"9BM634062RB334465",co:"VERDE",by:"MARCOPOLO G8 LD",sa:"APROVADO",ea:"01/09/2026",ec:"01/12/2024",ey:"01/09/2026",vi:"APROVADO"},
  {p:"1640",pl:"SDH 7H24",r:"01370177574",po:"LIDERANÇA TURISMO",cl:"Executivo",ca:46,b:"M. BENZ",m:"O 500 /381 CV",ax:6,eu:"VI",ym:2023,yo:2023,ch:"9BM634062RB334124",co:"VERDE",by:"MARCOPOLO G8 LD",sa:"APROVADO",ea:"01/09/2026",ec:"01/12/2024",ey:"01/09/2026",vi:"APROVADO"},
  {p:"1650",pl:"SDL 2B85",r:"01371011432",po:"LIDERANÇA TURISMO",cl:"Executivo",ca:46,b:"M. BENZ",m:"O 500 /381 CV",ax:6,eu:"VI",ym:2023,yo:2023,ch:"9BM634062RB334536",co:"VERDE",by:"MARCOPOLO G8 LD",sa:"NÃO TEM VISTORIA",ea:"01/08/2025",ec:"02/12/2024",ey:"01/08/2025",vi:"NÃO TEM VISTORIA"},
  {p:"1660",pl:"SDM 0E35",r:"01371278412",po:"LIDERANÇA TURISMO",cl:"Executivo",ca:46,b:"M. BENZ",m:"O 500 /381 CV",ax:6,eu:"VI",ym:2023,yo:2023,ch:"9BM634062RB334527",co:"VERDE",by:"MARCOPOLO G8 LD",sa:"APROVADO",ea:"01/08/2025",ec:"03/12/2024",ey:"01/08/2025",vi:"APROVADO"},
  {p:"1670",pl:"SDL 4B35",r:"0137016306",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:56,b:"VOLVO",m:"B460R",ax:6,eu:"VI",ym:2023,yo:2023,ch:"9BVU3W526RE392126",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"NÃO TEM VISTORIA",ea:"01/10/2024",ec:"04/12/2024",ey:"01/10/2024",vi:"NÃO TEM VISTORIA"},
  {p:"1680",pl:"SDL 4B45",r:"01370163621",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:56,b:"VOLVO",m:"B460R",ax:6,eu:"VI",ym:2023,yo:2023,ch:"9BVU3W520RE392451",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/01/2027",ec:"07/12/2024",ey:"01/01/2027",vi:"APROVADO"},
  {p:"1690",pl:"SDB 0D98",r:"0137383374",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:64,b:"VOLVO",m:"B510R",ax:8,eu:"VI",ym:2023,yo:2023,ch:"9BVU3W523RE392178",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/09/2026",ec:"01/06/2025",ey:"01/09/2026",vi:"APROVADO"},
  {p:"1700",pl:"SCX 9D66",r:"01375653057",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:64,b:"SCANIA",m:"K 500 C",ax:8,eu:"VI",ym:2023,yo:2023,ch:"9BSK8X200R4094783",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/09/2026",ec:"12/01/2025",ey:"01/09/2026",vi:"APROVADO"},
  {p:"1710",pl:"SDK 7B87",r:"01386447124",po:"LIDERANÇA TURISMO",cl:"Leito Cama",ca:32,b:"SCANIA",m:"K410",ax:6,eu:"VI",ym:2024,yo:2024,ch:"9BSK6X200R4068184",co:"VERDE",by:"MARCOPOLO G8 LEITO CAMA",sa:"APROVADO",ea:"01/03/2027",ec:"01/07/2025",ey:"01/03/2027",vi:"APROVADO"},
  {p:"1720",pl:"SDK 7C17",r:"01386471701",po:"LIDERANÇA TURISMO",cl:"Leito Cama",ca:32,b:"SCANIA",m:"K410",ax:6,eu:"VI",ym:2024,yo:2024,ch:"9BSK6X200R4067366",co:"VERDE",by:"MARCOPOLO G8 LEITO CAMA",sa:"NÃO TEM VISTORIA",ea:"01/09/2025",ec:"01/07/2025",ey:"01/09/2025",vi:"NÃO TEM VISTORIA"},
  {p:"1730",pl:"SDL 3B77",r:"01386472147",po:"JJ TUR",cl:"Semi Leito",ca:56,b:"SCANIA",m:"K410",ax:6,eu:"VI",ym:2024,yo:2024,ch:"9BSK6X200R4066722",co:"VERDE",by:"MARCOPOLO G8 SEMI LEITO",sa:"APROVADO",ea:"01/03/2027",ec:"01/07/2025",ey:"01/03/2027",vi:"APROVADO"},
  {p:"1740",pl:"SDH 7F87",r:"01385085819",po:"JJ TUR",cl:"Semi Leito",ca:56,b:"SCANIA",m:"K410",ax:6,eu:"VI",ym:2024,yo:2024,ch:"9BSK6X200R4067353",co:"VERDE",by:"MARCOPOLO G8 SEMI LEITO",sa:"NÃO TEM VISTORIA",ea:"01/09/2025",ec:"01/07/2025",ey:"01/09/2025",vi:"NÃO TEM VISTORIA"},
  {p:"1750",pl:"SDL 3C27",r:"01386472902",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:56,b:"SCANIA",m:"K410",ax:6,eu:"VI",ym:2024,yo:2024,ch:"9BSK6X200R4068205",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/09/2025",ec:"01/07/2025",ey:"01/09/2025",vi:"APROVADO"},
  {p:"1760",pl:"SCD 3B94",r:"01401444589",po:"EXPRESSO MARLY",cl:"Semi Leito",ca:56,b:"SCANIA",m:"K 410",ax:6,eu:"VI",ym:2024,yo:2024,ch:"9BSK6X200R4068239",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/09/2025",ec:"01/08/2025",ey:"01/09/2025",vi:"APROVADO",ep:"GOIANIA-GO",ow:"EXPRESSO MARLY"},
  {p:"1770",pl:"SCD 3D34",r:"01401445621",po:"EXPRESSO MARLY",cl:"Semi Leito",ca:56,b:"SCANIA",m:"K 410",ax:6,eu:"VI",ym:2024,yo:2024,ch:"9BSK6X200R4068222",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/09/2025",ec:"01/08/2025",ey:"01/09/2025",vi:"APROVADO",ep:"GOIANIA-GO",ow:"EXPRESSO MARLY"},
  {p:"1780",pl:"SDK 6H37",r:"01386470489",po:"JJ TUR",cl:"Executivo",ca:46,b:"SCANIA",m:"K410",ax:6,eu:"VI",ym:2024,yo:2024,ch:"9BSK6X200R4068218",co:"VERDE",by:"MARCOPOLO G8 LD",sa:"NÃO TEM VISTORIA",ea:"01/09/2025",ec:"01/07/2025",ey:"01/09/2025",vi:"NÃO TEM VISTORIA"},
  {p:"1790",pl:"SDH 7G57",r:"01385086327",po:"JJ TUR",cl:"Executivo",ca:46,b:"SCANIA",m:"K410",ax:6,eu:"VI",ym:2024,yo:2024,ch:"9BSK6X200R4067377",co:"VERDE",by:"MARCOPOLO G8 LD",sa:"APROVADO",ea:"01/09/2025",ec:"01/07/2025",ey:"01/09/2025",vi:"APROVADO"},
  {p:"1800",pl:"SCW 9D76",r:"01375653499",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:64,b:"VOLVO",m:"B510R",ax:8,eu:"VI",ym:2023,yo:2024,ch:"9BVU3W521SE392358",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/09/2025",ec:"01/09/2025",ey:"01/09/2025",vi:"APROVADO"},
  {p:"1810",pl:"SDN 9C56",r:"01384396831",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:64,b:"VOLVO",m:"B510R",ax:8,eu:"VI",ym:2023,yo:2024,ch:"9BVU3W527SE392576",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/10/2025",ec:"01/09/2025",ey:"01/10/2025",vi:"APROVADO"},
  {p:"1820",pl:"SCM 1J84",r:"01397927337",po:"JJ TUR",cl:"Executivo",ca:46,b:"SCANIA",m:"K410",ax:6,eu:"VI",ym:2024,yo:2024,ch:"9BSK6X200R4067390",co:"VERDE",by:"MARCOPOLO G8 LD",sa:"NÃO TEM VISTORIA",ea:"01/10/2025",ec:"01/07/2025",ey:"01/10/2025",vi:"NÃO TEM VISTORIA"},
  {p:"1830",pl:"RCG 9I84",r:"01399426319",po:"JJ TUR",cl:"Executivo",ca:46,b:"SCANIA",m:"K410",ax:6,eu:"VI",ym:2024,yo:2024,ch:"9BSK6X200R4069598",co:"VERDE",by:"MARCOPOLO G8 LD",sa:"APROVADO",ea:"01/10/2025",ec:"01/07/2025",ey:"01/10/2025",vi:"APROVADO"},
  {p:"1840",pl:"SDL 2G39",r:"01418471131",po:"EXPRESSO MARLY",cl:"Semi Leito",ca:56,b:"VOLVO",m:"B460R",ax:6,eu:"VI",ym:2024,yo:2024,ch:"9BVU3W523SE392530",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/10/2025",ec:"01/09/2025",ey:"01/10/2025",vi:"APROVADO",ep:"GOIANIA-GO",ow:"EXPRESSO MARLY"},
  {p:"1850",pl:"SDL 2G49",r:"01418470543",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:56,b:"VOLVO",m:"B460R",ax:6,eu:"VI",ym:2024,yo:2024,ch:"9BVU3W521SE392539",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/10/2025",ec:"01/09/2025",ey:"01/10/2025",vi:"APROVADO"},
  {p:"1860",pl:"SDI 4E79",r:"01417794701",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:56,b:"VOLVO",m:"B460R",ax:6,eu:"VI",ym:2024,yo:2024,ch:"9BVU3W524SE392566",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"NÃO TEM VISTORIA",ea:"01/10/2025",ec:"01/09/2025",ey:"01/10/2025",vi:"NÃO TEM VISTORIA"},
  {p:"1870",pl:"SDH 0J09",r:"01417763230",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:56,b:"SCANIA",m:"K410",ax:6,eu:"VI",ym:2024,yo:2024,ch:"9BSK6X200S4078046",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"NÃO TEM VISTORIA",ea:"01/10/2025",ec:"01/09/2025",ey:"01/10/2025",vi:"NÃO TEM VISTORIA"},
  {p:"1880",pl:"SDP 9E59",r:"01417758318",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:56,b:"VOLVO",m:"B460R",ax:6,eu:"VI",ym:2024,yo:2024,ch:"9BVU3W529SE392305",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/09/2025",ec:"01/09/2025",ey:"01/09/2025",vi:"APROVADO"},
  {p:"1890",pl:"SDO 3J99",r:"01419636550",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:64,b:"VOLVO",m:"B510R",ax:8,eu:"VI",ym:2024,yo:2025,ch:"9BVU3W523SE393305",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"NÃO TEM VISTORIA",ea:"01/11/2025",ec:"01/11/2025",ey:"01/11/2025",vi:"NÃO TEM VISTORIA"},
  {p:"1900",pl:"SDF 9G79",r:"01419707342",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:64,b:"VOLVO",m:"B510R",ax:8,eu:"VI",ym:2024,yo:2025,ch:"9BVU3W527SE393307",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/09/2026",ec:"01/11/2025",ey:"01/09/2026",vi:"APROVADO"},
  {p:"1910",pl:"SDN 1C09",r:"01417074792",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:56,b:"SCANIA",m:"K410",ax:6,eu:"VI",ym:2024,yo:2024,ch:"9BSK6X200R4072243",co:"BRANCA",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"NÃO TEM VISTORIA",ea:"01/10/2025",ec:"01/12/2025",ey:"01/10/2025",vi:"NÃO TEM VISTORIA"},
  {p:"1920",pl:"SDG 8G27",r:"01417066919",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:56,b:"SCANIA",m:"K410",ax:6,eu:"VI",ym:2024,yo:2024,ch:"9BSK6X200R4072251",co:"BRANCA",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"NÃO TEM VISTORIA",ea:"01/10/2025",ec:"01/12/2025",ey:"01/10/2025",vi:"NÃO TEM VISTORIA"},
  {p:"1930",pl:"TGL 8E31",r:"01435824994",po:"LIDERANÇA TURISMO",cl:"Leito Cama",ca:32,b:"VOLVO",m:"B460R",ax:6,eu:"VI",ym:2025,yo:2025,ch:"9BVU3W527TE393454",co:"VERDE",by:"MARCOPOLO G8 LEITO CAMA",sa:"APROVADO",ea:"01/01/2027",ec:"01/05/2026",ey:"01/01/2027",vi:"APROVADO"},
  {p:"1940",pl:"TFP 3J87",r:"01441162213",po:"LIDERANÇA TURISMO",cl:"Executivo",ca:46,b:"SCANIA",m:"K410",ax:6,eu:"VI",ym:2024,yo:2025,ch:"9BSK6X200S4090432",co:"VERDE",by:"MARCOPOLO G8 LD",sa:"NÃO TEM VISTORIA",ea:"01/10/2025",ec:"01/09/2025",ey:"01/10/2025",vi:"NÃO TEM VISTORIA"},
  {p:"1950",pl:"TFZ 9I26",r:"01441161020",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:56,b:"VOLVO",m:"B460R",ax:6,eu:"VI",ym:2024,yo:2025,ch:"9BVU3W520SE393178",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/10/2025",ec:"01/09/2025",ey:"01/10/2025",vi:"APROVADO"},
  {p:"1960",pl:"SCI 4C36",r:"01325042860",po:"EXPRESSO MARLY",cl:"Executivo",ca:46,b:"M. BENZ",m:"O 500 / 354 CV",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BM634061PB276639",co:"BRANCA",by:"MARCOPOLO G8 LD",sa:"APROVADO",ea:"01/09/2024",ec:"01/12/2024",ey:"01/09/2024",vi:"APROVADO"},
  {p:"1970",pl:"TFM 0H22",r:"01434079527",po:"LIDERANÇA TURISMO",cl:"Executivo",ca:46,b:"SCANIA",m:"K410",ax:6,eu:"VI",ym:2025,yo:2025,ch:"9BSK6X200S4097172",co:"VERDE",by:"MARCOPOLO G8 LD",sa:"APROVADO",ea:"01/03/2027",ec:"01/11/2025",ey:"01/03/2027",vi:"APROVADO"},
  {p:"1980",pl:"TFV 0A32",r:"01434079926",po:"LIDERANÇA TURISMO",cl:"Executivo",ca:46,b:"SCANIA",m:"K410",ax:6,eu:"VI",ym:2025,yo:2025,ch:"9BSK6X200S4096403",co:"VERDE",by:"MARCOPOLO G8 LD",sa:"NÃO TEM VISTORIA",ea:"06/05/2026",ec:"NÃO TEM",ey:"06/05/2026",vi:"NÃO TEM VISTORIA"},
  {p:"1990",pl:"TFL 1E72",r:"01434079926",po:"LIDERANÇA TURISMO",cl:"Executivo",ca:46,b:"SCANIA",m:"K410",ax:6,eu:"VI",ym:2025,yo:2025,ch:"9BSK6X200S4096371",co:"VERDE",by:"MARCOPOLO G8 LD",sa:"APROVADO",ea:"01/03/2027",ec:"NÃO TEM",ey:"01/03/2027",vi:"APROVADO"},
  {p:"2000",pl:"TGL 8D51",r:"01441584065",po:"LIDERANÇA TURISMO",cl:"Leito Cama",ca:32,b:"VOLVO",m:"B460R",ax:6,eu:"VI",ym:2025,yo:2025,ch:"9BVU3W528TE393433",co:"VERDE",by:"MARCOPOLO G8 LEITO CAMA",sa:"APROVADO",ea:"01/01/2027",ec:"01/05/2026",ey:"01/01/2027",vi:"APROVADO"},
  {p:"2010",pl:"TGB 1C62",r:"01444724000",po:"EXPRESSO MARLY",cl:"Semi Leito",ca:56,b:"SCANIA",m:"K410",ax:6,eu:"VI",ym:2025,yo:2025,ch:"9BSK6X200S4097168",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/03/2027",ec:"NÃO TEM",ey:"01/03/2027",vi:"APROVADO",ow:"EXPRESSO MARLY"},
  {p:"2020",pl:"TFU 0H72",r:"01444841758",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:56,b:"SCANIA",m:"K410",ax:6,eu:"VI",ym:2025,yo:2025,ch:"9BSK6X200S4096352",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/03/2027",ec:"NÃO TEM",ey:"01/03/2027",vi:"APROVADO"},
  {p:"2030",pl:"TGB 5E52",r:"01444841192",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:56,b:"SCANIA",m:"K410",ax:6,eu:"VI",ym:2025,yo:2025,ch:"9BSK6X200S4096397",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/03/2027",ec:"NÃO TEM",ey:"01/03/2027",vi:"APROVADO"},
  {p:"2040",pl:"TFU 0G32",r:"01444841079",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:56,b:"SCANIA",m:"K410",ax:6,eu:"VI",ym:2025,yo:2025,ch:"9BSK6X200S4096389",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/03/2027",ec:"NÃO TEM",ey:"01/03/2027",vi:"APROVADO"},
  {p:"2050",pl:"TFV 6F32",r:"01444839192",po:"LIDERANÇA TURISMO",cl:"Leito Cama",ca:32,b:"SCANIA",m:"K410",ax:6,eu:"VI",ym:2025,yo:2025,ch:"9BSK6X200S4096387",co:"VERDE",by:"MARCOPOLO G8 LEITO CAMA",sa:"APROVADO",ea:"01/02/2027",ec:"NÃO TEM",ey:"01/02/2027",vi:"APROVADO"},
  {p:"2060",pl:"TGD 8I61",r:"01445947754",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:56,b:"VOLVO",m:"B460R",ax:6,eu:"VI",ym:2025,yo:2025,ch:"9BVU3W529TE393455",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/02/2027",ec:"NÃO TEM",ey:"01/02/2027",vi:"APROVADO"},
  {p:"2070",pl:"TFG 2I81",r:"01445947811",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:56,b:"VOLVO",m:"B460R",ax:6,eu:"VI",ym:2025,yo:2025,ch:"9BVU3W52TE393499",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/01/2027",ec:"NÃO TEM",ey:"01/01/2027",vi:"APROVADO"},
  {p:"3041",pl:"SCJ 6D10",r:"01336336301",po:"JJ TUR",cl:"Executivo",ca:46,b:"M. BENZ",m:"O 500 / 354 CV",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BM634061PB304620",co:"VERDE",by:"MARCOPOLO G8 LD",sa:"APROVADO",ea:"01/10/2026",ec:"01/08/2025",ey:"01/10/2026",vi:"APROVADO",ep:"ANAPOLIS-GO",ow:"JJ TUR"},
  {p:"3042",pl:"SCJ 2J40",r:"01336354698",po:"JJ TUR",cl:"Executivo",ca:46,b:"M. BENZ",m:"O 500",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BM634061PB303615",co:"CINZA",by:"MARCOPOLO G8 LD",sa:"APROVADO",ea:"01/05/2026",ec:"01/05/2026",ey:"01/05/2026",vi:"APROVADO",ep:"ANAPOLIS-GO",ow:"JJ TUR"},
  {p:"3043",pl:"SCJ 2J20",r:"01336354213",po:"JJ TUR",cl:"Executivo",ca:46,b:"M. BENZ",m:"O 500",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BM634061PB304740",co:"ROSA",by:"MARCOPOLO G8 LD",sa:"APROVADO",ea:"01/05/2026",ec:"01/05/2026",ey:"01/05/2026",vi:"APROVADO",ep:"ANAPOLIS-GO",ow:"JJ TUR"},
  {p:"3044",pl:"SCJ 6J40",r:"01336354485",po:"JJ TUR",cl:"Executivo",ca:46,b:"M. BENZ",m:"O 500",ax:6,eu:"V",ym:2022,yo:2023,ch:"9BM634061PB304623",co:"ROXO",by:"MARCOPOLO G8 LD",sa:"APROVADO",ea:"01/10/2026",ec:"01/05/2026",ey:"01/10/2026",vi:"APROVADO",ep:"ANAPOLIS-GO",ow:"JJ TUR"},
  {p:"3045",pl:"SDJ 4J50",r:"01336337718",po:"JJ TUR",cl:"Semi Leito",ca:56,b:"SCANIA",m:"K 400 CV",ax:8,eu:"V",ym:2022,yo:2023,ch:"9BSK8X200P4034507",co:"LARANJA",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/03/2027",ec:"01/01/2026",ey:"01/03/2027",vi:"APROVADO",ep:"ANÁPOLIS-GO",ow:"JJ TUR"},
  {p:"3046",pl:"SDJ 4J90",r:"01336340581",po:"JJ TUR",cl:"Semi Leito",ca:56,b:"SCANIA",m:"K 400 CV",ax:8,eu:"V",ym:2022,yo:2023,ch:"9BSK8X200P4034499",co:"AZUL",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/02/2027",ec:"01/01/2026",ey:"01/02/2027",vi:"APROVADO",ep:"ANÁPOLIS-GO",ow:"JJ TUR"},
  {p:"3048",pl:"TDH 4F42",r:"01448942263",po:"LIDERANÇA TURISMO",cl:"Semi Leito",ca:56,b:"SCANIA",m:"K 500 C",ax:8,eu:"VI",ym:2025,yo:2025,ch:"9BSK8X200T4115366",co:"VERDE",by:"MARCOPOLO G8 DD SEMI LEITO",sa:"APROVADO",ea:"01/05/2027",ec:"01/05/2027",ey:"01/05/2027",vi:"APROVADO"}
];

export const RAW_FLEET_DATA: Vehicle[] = COMPACT_DATA.map((item) => ({
  prefix: item.p,
  plate: item.pl,
  renavam: item.r,
  unit: item.un || "GOIÂNIA-GO",
  owner: item.ow || "VIAÇÃO RIO OESTE",
  possession: item.po,
  classification: item.cl,
  capacity: item.ca,
  serviceType: "RODOVIARIO",
  brand: item.b,
  model: item.m,
  transmissionType: item.b === "M. BENZ" ? "MANUAL" : "AUTOMATICO",
  axes: item.ax,
  euro: item.eu,
  yearManufacture: item.ym,
  yearModel: item.yo,
  chassis: item.ch,
  color: item.co,
  bodywork: item.by,
  emplacamento: item.ep || "PIRES DO RIO-GO",
  situationAntt: item.sa,
  expiryAntt: item.ea,
  expiryCrono: item.ec,
  expiryArtran: (item.sa === "APROVADO" && ["1520", "1690", "1700", "1730", "1740", "1750", "1800", "1810", "1820", "1830", "1840", "1880", "2010", "3041", "3042", "3043", "3045", "3046"].includes(item.p)) ? "REGULAR" : "NÃO TEM",
  expiryAgr: item.ey || item.ea,
  statusOperacional: "ATIVO",
  vistoria: item.vi || item.sa,
}));

export const FLEET_DATA = [...RAW_FLEET_DATA].sort((a, b) => {
  const numA = parseInt(a.prefix, 10);
  const numB = parseInt(b.prefix, 10);
  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }
  return a.prefix.localeCompare(b.prefix, undefined, { numeric: true });
});
