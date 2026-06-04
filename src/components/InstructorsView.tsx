import React, { useState } from 'react';
import { Award, Plus, Search, Star, StarOff, Sparkles, User, FileText, CheckCircle } from 'lucide-react';

export interface PracticalTest {
  id: string;
  studentName: string;
  instructorName: string;
  date: string;
  busPrefix: string;
  gradeTheoretical: number;
  gradePractical: number;
  finalGrade: number;
  status: "APROVADO" | "RECUPERACAO" | "REPROVADO";
  notes: string;
}

interface InstructorsViewProps {
  tests: PracticalTest[];
  onUpdateTests: (updatedTests: PracticalTest[]) => void;
}

export const InstructorsView: React.FC<InstructorsViewProps> = ({ tests, onUpdateTests }) => {

  const [searchQuery, setSearchQuery] = useState('');
  const [isTestOpen, setIsTestOpen] = useState(false);

  // New test state
  const [newStudent, setNewStudent] = useState('');
  const [instructor, setInstructor] = useState('Instrutor Geraldo');
  const [custBus, setCustBus] = useState('1180');
  const [theoryGrade, setTheoryGrade] = useState('8.5');
  const [pracGrade, setPracGrade] = useState('9.0');
  const [testNotes, setTestNotes] = useState('');

  const filteredTests = tests.filter(t => 
    t.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.instructorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent) return;

    const tGrade = Number(theoryGrade) || 0;
    const pGrade = Number(pracGrade) || 0;
    const fGrade = Number(((tGrade + pGrade) / 2).toFixed(1));

    let stat: "APROVADO" | "RECUPERACAO" | "REPROVADO" = "APROVADO";
    if (fGrade < 6.0) stat = "REPROVADO";
    else if (fGrade < 7.5) stat = "RECUPERACAO";

    const created: PracticalTest = {
      id: "TEST-" + Math.floor(403 + Math.random() * 900),
      studentName: newStudent,
      instructorName: instructor,
      date: new Date().toISOString().split('T')[0],
      busPrefix: custBus,
      gradeTheoretical: tGrade,
      gradePractical: pGrade,
      finalGrade: fGrade,
      status: stat,
      notes: testNotes || "Realizou o teste com comportamento defensivo exemplar."
    };

    onUpdateTests([...tests, created]);
    setIsTestOpen(false);
    setNewStudent('');
    setTestNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-white">
            Avaliação de Instrutores (Testes de Direção)
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Ficha de avaliação prática do motorista, direção defensiva, notas de direção e avalições teóricas.
          </p>
        </div>
        <button 
          onClick={() => setIsTestOpen(true)}
          className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-md flex items-center gap-2 font-bold cursor-pointer transition-all active:scale-95"
        >
          <Plus size={20} /> Registrar Novo Teste
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Pesquisar teste..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
          />
        </div>
        <span className="text-xs font-extrabold text-slate-400">
          Mostrando {filteredTests.length} testes de direção executados e indexados pela Liderança.
        </span>
      </div>

      {/* Tests grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTests.map((test) => (
          <div key={test.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="p-1 px-1.5 bg-slate-100 dark:bg-slate-700 text-[10px] rounded font-mono font-black text-slate-500 dark:text-white">{test.id}</span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1.5">{test.studentName}</h3>
                <p className="text-xs text-slate-400 font-semibold">{test.instructorName} • {test.date}</p>
              </div>
              <span className={`px-2.5 py-1 text-xs rounded-lg font-black tracking-wide ${
                test.status === "APROVADO" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40" : "bg-red-100 text-red-700 dark:bg-red-950/40"
              }`}>
                {test.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center text-xs font-bold">
              <div>
                <p className="text-[10px] text-slate-400 font-bold">TEÓRICO</p>
                <p className="text-slate-800 dark:text-white font-black mt-1 text-base">{test.gradeTheoretical}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold">PRÁTICO</p>
                <p className="text-slate-800 dark:text-white font-black mt-1 text-base">{test.gradePractical}</p>
              </div>
              <div className="border-l dark:border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold">MÉDIA FINAL</p>
                <p className="text-primary font-black mt-1 text-base">{test.finalGrade}</p>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-xl text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed border border-indigo-100/40">
              <span className="font-extrabold text-indigo-700 dark:text-indigo-400">Observações: </span>
              {test.notes}
            </div>
          </div>
        ))}
      </div>

      {/* New Test Modal */}
      {isTestOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddTest} className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full space-y-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="text-primary animate-pulse" />
              <span>Registrar Ficha de Direção</span>
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Nome do Aluno Motorista *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Nome completo do piloto"
                  value={newStudent}
                  onChange={(e) => setNewStudent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none font-semibold dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Instrutor Avaliador</label>
                <input 
                  type="text" 
                  required
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none font-semibold dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1 font-mono uppercase">Nota Teórica (0-10)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    max="10" 
                    value={theoryGrade}
                    onChange={(e) => setTheoryGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none font-semibold dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1 font-mono uppercase">Nota Prática (0-10)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    max="10" 
                    value={pracGrade}
                    onChange={(e) => setPracGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none font-semibold dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Observações / Desempenho Físico e Manobras</label>
                <textarea 
                  rows={3}
                  placeholder="Ex: Teve ótimo controle do torque em aclives..."
                  value={testNotes}
                  onChange={(e) => setTestNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl outline-none font-medium dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 text-xs">
              <button 
                type="button" 
                onClick={() => setIsTestOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-white rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold cursor-pointer"
              >
                Salvar Teste Dir.
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
