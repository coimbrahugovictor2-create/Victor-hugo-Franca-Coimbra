import React, { useState, useMemo } from 'react';
import { Search, Folder, FileText, Image, Globe, Shield, ExternalLink, HardDrive } from 'lucide-react';

interface DriveFile {
  id: string;
  name: string;
  type: "PDF" | "XLSX" | "IMAGE" | "LINK";
  size: string;
  lastModified: string;
  owner: string;
  url: string;
}

const DRIVE_FILES: DriveFile[] = [
  {
    id: "GDF-01",
    name: "Relatório Completo de Frota Liderança.xlsx",
    type: "XLSX",
    size: "2.4 MB",
    lastModified: "2026-05-20",
    owner: "Diretoria Liderança",
    url: "https://drive.google.com/open?id=lideranca_frota_completa"
  },
  {
    id: "GDF-02",
    name: "Certificação Autorização ANTT 2026 - Viagens Interestaduais.pdf",
    type: "PDF",
    size: "1.8 MB",
    lastModified: "2026-04-15",
    owner: "Regulatório Tráfego",
    url: "https://drive.google.com/open?id=antt_cert_2026"
  },
  {
    id: "GDF-03",
    name: "Laudos Aferição Cronotacógrafos M. BENZ Geral.pdf",
    type: "PDF",
    size: "820 KB",
    lastModified: "2026-03-10",
    owner: "Oficina Liderança",
    url: "https://drive.google.com/open?id=crono_mbenz_laudos"
  },
  {
    id: "GDF-04",
    name: "Plano de Manutenção Primitivo Scania K360 K400.pdf",
    type: "PDF",
    size: "4.1 MB",
    lastModified: "2025-11-05",
    owner: "Oficina Liderança",
    url: "https://drive.google.com/open?id=plano_scania_k"
  },
  {
    id: "GDF-05",
    name: "Selo ANTT Cadastral Carro 1180 PRB9387.pdf",
    type: "PDF",
    size: "450 KB",
    lastModified: "2026-01-22",
    owner: "Regulatório Tráfego",
    url: "https://drive.google.com/open?id=selo_antt_1180"
  },
  {
    id: "GDF-06",
    name: "Selo ANTT Cadastral Carro 1250 PRX1634.pdf",
    type: "PDF",
    size: "440 KB",
    lastModified: "2026-01-22",
    owner: "Regulatório Tráfego",
    url: "https://drive.google.com/open?id=selo_antt_1250"
  }
];

export const DriveView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = useMemo(() => {
    return DRIVE_FILES.filter(f => 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.owner.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-white flex items-center gap-2">
          <HardDrive className="text-primary" />
          <span>Buscas Integradas do Google Drive</span>
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Pesquise e gerencie documentos oficiais, selos ANTT, vistorias e laudos unificados armazenados na nuvem.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar arquivos e documentos nos repositórios da Liderança..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl outline-none text-xs font-semibold focus:ring-2 focus:ring-primary/25 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {filteredFiles.length === 0 ? (
            <p className="col-span-2 text-center py-12 text-slate-400 font-bold">Nenhum documento sincronizado do Drive localmente do termo pesquisado.</p>
          ) : (
            filteredFiles.map(file => (
              <div key={file.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border dark:border-slate-800 flex justify-between gap-4 hover:border-primary/30 transition-all group">
                <div className="flex gap-3">
                  <div className="p-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl flex-shrink-0 flex items-center justify-center">
                    {file.type === "PDF" && <FileText className="text-red-500" size={24} />}
                    {file.type === "XLSX" && <Folder className="text-emerald-500" size={24} />}
                    {file.type === "IMAGE" && <Image className="text-blue-500" size={24} />}
                    {file.type === "LINK" && <Globe className="text-indigo-500" size={24} />}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors">{file.name}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">{file.owner} • {file.size} • Modificado em {file.lastModified}</p>
                  </div>
                </div>
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 border dark:border-slate-700 hover:border-primary/40 rounded-xl flex-shrink-0 flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm bg-white dark:bg-slate-800 self-center"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
