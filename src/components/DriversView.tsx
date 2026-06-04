import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Award, 
  Plus, 
  Search,
  CheckCircle,
  FileText,
  Briefcase
} from 'lucide-react';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  cnh: string;
  cnhCategory: string;
  cnhExpiry: string;
  unidade: string;
  status: "ATIVO" | "FERIAS" | "AFASTADO";
  testGrade: number; // Linked with Instructors testing
}

interface DriversViewProps {
  drivers: Driver[];
  onUpdateDrivers: (drivers: Driver[]) => void;
}

export const DriversView: React.FC<DriversViewProps> = ({ drivers, onUpdateDrivers }) => {
  const [search, setSearch] = useState('');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newDriver, setNewDriver] = useState<Partial<Driver>>({ status: "ATIVO", cnhCategory: "E" });

  const filtered = drivers.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.unidade.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.cnh) return;

    const created: Driver = {
      id: "M-" + Math.floor(105 + Math.random() * 900),
      name: newDriver.name,
      phone: newDriver.phone || "(62) 99900-1122",
      cnh: newDriver.cnh,
      cnhCategory: newDriver.cnhCategory || "E",
      cnhExpiry: newDriver.cnhExpiry || "2028-12-01",
      unidade: newDriver.unidade || "Goiânia-GO",
      status: (newDriver.status as any) || "ATIVO",
      testGrade: 8.0
    };

    onUpdateDrivers([...drivers, created]);
    setIsNewOpen(false);
    setNewDriver({ status: "ATIVO", cnhCategory: "E" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-white">
            Gestão de Motoristas
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Controle de habilitações (CNH), validades, avaliações teóricas e filiais associadas.
          </p>
        </div>
        <button 
          onClick={() => setIsNewOpen(true)}
          className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-md flex items-center gap-2 font-bold cursor-pointer transition-all active:scale-95"
        >
          <Plus size={20} /> Cadastrar Motorista
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Pesquisar motorista..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
          />
        </div>
        <div className="text-xs font-bold text-slate-400">
          Mostrando {filtered.length} de {drivers.length} motoristas operacionais da Liderança
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(d => (
          <div key={d.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-1 px-2 bg-slate-100 dark:bg-slate-700 rounded text-xs font-black text-slate-500 dark:text-white font-mono">{d.id}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  d.status === 'ATIVO' ? 'bg-green-100 text-green-700 dark:bg-green-950/30' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30'
                }`}>{d.status}</span>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{d.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 font-semibold"><MapPin size={12} /> Unidade: {d.unidade}</p>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <p>CNH: <strong className="font-mono">{d.cnh} ({d.cnhCategory})</strong></p>
                <p>Vencimento: <strong>{d.cnhExpiry}</strong></p>
                <p className="col-span-2">Telefone: <strong>{d.phone}</strong></p>
              </div>
            </div>
            <div className="flex flex-col justify-between items-end">
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400">Média Teste Dir.</p>
                <div className="flex items-center gap-1 text-emerald-600 font-black text-lg mt-0.5 justify-end">
                  <Award size={18} /> {d.testGrade.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isNewOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAdd} className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full space-y-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Cadastrar Novo Motorista</h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Nome Completo *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Nome do motorista"
                  value={newDriver.name || ''}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none font-semibold dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Habilitação CNH *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Número de registro"
                  value={newDriver.cnh || ''}
                  onChange={(e) => setNewDriver({ ...newDriver, cnh: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none font-semibold dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Categoria</label>
                  <select 
                    value={newDriver.cnhCategory}
                    onChange={(e) => setNewDriver({ ...newDriver, cnhCategory: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none font-semibold dark:text-white"
                  >
                    <option value="D">D</option>
                    <option value="E">E</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Vencimento CNH</label>
                  <input 
                    type="date" 
                    value={newDriver.cnhExpiry || ''}
                    onChange={(e) => setNewDriver({ ...newDriver, cnhExpiry: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none font-semibold dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Unidade / Garage</label>
                <input 
                  type="text" 
                  placeholder="Ex: Goiânia-GO"
                  value={newDriver.unidade || ''}
                  onChange={(e) => setNewDriver({ ...newDriver, unidade: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none font-semibold dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 text-xs">
              <button 
                type="button" 
                onClick={() => setIsNewOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-white rounded-xl font-bold cursor-pointer"
              >
                Voltar
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold cursor-pointer shadow"
              >
                Salvar Habilitação
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
