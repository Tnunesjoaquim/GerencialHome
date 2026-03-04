'use client';

import { Header } from '@/components/Header';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Bill {
  id: string;
  category: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'Pendente' | 'Pago' | 'Atrasado';
  icon: string;
}

export default function Financeiro() {
  const [bills, setBills] = useState<Bill[]>([
    { id: '1', category: 'Energia Elétrica', description: 'Enel - Ref. Out/23', amount: 245.90, dueDate: '2023-10-25', status: 'Pendente', icon: 'electric_bolt' },
    { id: '2', category: 'Internet Fibra', description: 'Vivo - Ref. Out/23', amount: 120.00, dueDate: '2023-10-10', status: 'Pago', icon: 'wifi' },
    { id: '3', category: 'Água e Esgoto', description: 'Sabesp - Ref. Set/23', amount: 150.00, dueDate: '2023-09-15', status: 'Atrasado', icon: 'water_drop' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [newBill, setNewBill] = useState<Omit<Bill, 'id' | 'status'>>({
    category: '',
    description: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    icon: 'payments'
  });

  // Calculate Summaries
  const stats = useMemo(() => {
    const total = bills.reduce((acc, b) => acc + b.amount, 0);
    const paid = bills.filter(b => b.status === 'Pago').reduce((acc, b) => acc + b.amount, 0);
    const overdue = bills.filter(b => b.status === 'Atrasado').reduce((acc, b) => acc + b.amount, 0);
    const overdueCount = bills.filter(b => b.status === 'Atrasado').length;
    const percentPaid = total > 0 ? Math.round((paid / total) * 100) : 0;

    return { total, paid, overdue, overdueCount, percentPaid };
  }, [bills]);

  const handleTogglePaid = (id: string) => {
    setBills(bills.map(b => {
      if (b.id === id) {
        const newStatus = b.status === 'Pago' ? 'Pendente' : 'Pago';
        return { ...b, status: newStatus as any };
      }
      return b;
    }));
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir esta conta?')) {
      setBills(bills.filter(b => b.id !== id));
    }
  };

  const handleSave = () => {
    if (!newBill.category || newBill.amount <= 0) return;

    if (editingBill) {
      setBills(bills.map(b => b.id === editingBill.id ? { ...editingBill, ...newBill } : b));
    } else {
      const billToAdd: Bill = {
        ...newBill,
        id: Math.random().toString(),
        status: 'Pendente'
      };
      setBills([...bills, billToAdd]);
    }

    setIsModalOpen(false);
    setEditingBill(null);
    setNewBill({ category: '', description: '', amount: 0, dueDate: new Date().toISOString().split('T')[0], icon: 'payments' });
  };

  const openEdit = (bill: Bill) => {
    setEditingBill(bill);
    setNewBill({
      category: bill.category,
      description: bill.description,
      amount: bill.amount,
      dueDate: bill.dueDate,
      icon: bill.icon
    });
    setIsModalOpen(true);
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      <Header activeTab="financeiro" />
      <main className="flex flex-1 flex-col px-4 md:px-10 py-6 max-w-[1440px] mx-auto w-full gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">Fluxo Financeiro</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">Controle rigoroso de entradas e saídas da residência.</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <button
              onClick={() => { setEditingBill(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-6 py-4 bg-primary text-slate-900 rounded-2xl font-black text-sm hover:brightness-110 transition-all shadow-xl shadow-primary/20 whitespace-nowrap uppercase tracking-widest active:scale-95"
            >
              <span className="material-symbols-outlined text-lg font-black">add_card</span>
              Nova Conta
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div whileHover={{ y: -5 }} className="p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between h-36 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] leading-none">Total à Pagar</span>
              <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined">account_balance_wallet</span>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                R$ {stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-400 mb-1 font-black uppercase">Mês Atual</span>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between h-36 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] leading-none">Total Pago</span>
              <div className="size-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500">
                <span className="material-symbols-outlined">task_alt</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl md:text-3xl font-black text-green-600 dark:text-green-400 tracking-tight">
                R$ {stats.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${stats.percentPaid}%` }} />
                </div>
                <span className="text-[10px] font-black text-green-500">{stats.percentPaid}%</span>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="p-6 rounded-[32px] border-2 border-red-500/20 bg-red-50/50 dark:bg-red-950/10 flex flex-col justify-between h-36 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-red-700/60 dark:text-red-400/60 text-[10px] font-black uppercase tracking-[0.2em] leading-none">Vencido / Atraso</span>
              <div className="size-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500">
                <span className="material-symbols-outlined animate-pulse">priority_high</span>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl md:text-3xl font-black text-red-700 dark:text-red-400 tracking-tight">
                R$ {stats.overdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-red-600/70 dark:text-red-400/70 mb-1 font-black uppercase tracking-widest">{stats.overdueCount} {stats.overdueCount === 1 ? 'CONTA' : 'CONTAS'}</span>
            </div>
          </motion.div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-hidden rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-x-auto scrollbar-thin mt-4">
          <table className="w-full text-left text-sm min-w-[900px]">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Descrição / Categoria</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Valor</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vencimento</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bills.map((bill) => (
                <tr key={bill.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group ${bill.status === 'Pago' ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`size-12 rounded-2xl flex items-center justify-center shadow-inner ${bill.status === 'Pago' ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-primary/10 text-primary'
                        }`}>
                        <span className="material-symbols-outlined text-2xl">{bill.icon}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-black text-slate-900 dark:text-white uppercase tracking-tight text-base ${bill.status === 'Pago' ? 'line-through decoration-slate-400' : ''}`}>
                          {bill.category}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bill.description}</span>
                      </div>
                    </div>
                  </td>
                  <td className={`px-8 py-5 font-black text-lg tracking-tighter ${bill.status === 'Atrasado' ? 'text-red-600' : bill.status === 'Pago' ? 'text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                    R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-5 text-slate-500 dark:text-slate-400 font-bold italic">
                    {new Date(bill.dueDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${bill.status === 'Pago'
                      ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900'
                      : bill.status === 'Atrasado'
                        ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900 animate-pulse'
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      }`}>
                      <span className={`size-2 rounded-full ${bill.status === 'Pago' ? 'bg-green-500' : bill.status === 'Atrasado' ? 'bg-red-500' : 'bg-slate-400'
                        }`} />
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleTogglePaid(bill.id)}
                        className={`size-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${bill.status === 'Pago'
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-green-500 border border-slate-200 dark:border-slate-700'
                          }`}
                        title={bill.status === 'Pago' ? 'Desmarcar' : 'Marcar como Pago'}
                      >
                        <span className="material-symbols-outlined font-black">{bill.status === 'Pago' ? 'undo' : 'check'}</span>
                      </button>
                      <button
                        onClick={() => openEdit(bill)}
                        className="size-10 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-primary transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100"
                      >
                        <span className="material-symbols-outlined text-lg font-black">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(bill.id)}
                        className="size-10 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-300 hover:text-red-500 transition-all flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100"
                      >
                        <span className="material-symbols-outlined text-lg font-black">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {bills.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest italic">Nenhuma conta lançada para este período.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL: Adicionar/Editar Conta */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-12 shadow-2xl overflow-y-auto max-h-[90vh] border border-white/20">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl">{editingBill ? 'edit_note' : 'add_card'}</span>
                </div>
                <h2 className="text-3xl font-black dark:text-white uppercase tracking-tight">{editingBill ? 'Ajustar Lançamento' : 'Novo Lançamento'}</h2>
                <p className="text-slate-400 text-sm font-bold mt-1">Preencha os dados financeiros com atenção.</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria do Gasto</label>
                  <input
                    className="w-full h-14 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold"
                    placeholder="Ex: Energia, Aluguel, Supermercado..."
                    value={newBill.category}
                    onChange={(e) => setNewBill({ ...newBill, category: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição Curta</label>
                  <input
                    className="w-full h-14 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold"
                    placeholder="Ex: Ref Outubro - Venc 25"
                    value={newBill.description}
                    onChange={(e) => setNewBill({ ...newBill, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor (R$)</label>
                    <input
                      type="number"
                      className="w-full h-14 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary dark:text-white font-black text-lg"
                      value={newBill.amount}
                      onChange={(e) => setNewBill({ ...newBill, amount: Number(e.target.value) })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Vencimento</label>
                    <input
                      type="date"
                      className="w-full h-14 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold"
                      value={newBill.dueDate}
                      onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-10">
                <button
                  onClick={handleSave}
                  className="w-full h-16 bg-primary text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  {editingBill ? 'Atualizar Dados' : 'Confirmar Lançamento'}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full h-14 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-black uppercase tracking-widest text-xs transition-colors"
                >
                  Calcelar Operação
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
