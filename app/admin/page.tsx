'use client';

import { Header } from '@/components/Header';
import { motion } from 'framer-motion';

export default function Admin() {
  const users = [
    { name: 'João Silva', email: 'joao@exemplo.com', role: 'Admin', houses: 'Casa Norte, Casa Sul', initials: 'JS' },
    { name: 'Maria Costa', email: 'maria@exemplo.com', role: 'Staff', houses: 'Casa Leste', initials: 'MC' },
    { name: 'Ricardo Lopes', email: 'ricardo@exemplo.com', role: 'Staff', houses: 'Casa Oeste', initials: 'RL' },
    { name: 'Ana Sousa', email: 'ana@exemplo.com', role: 'Admin', houses: 'Todas', initials: 'AS' },
  ];

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden transition-colors duration-300">
      <Header activeTab="admin" />
      <main className="flex-1 flex flex-col p-4 md:p-10 mx-auto w-full max-w-[1400px] gap-8">
        {/* Page Title & Action */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">Gestão Staff</h1>
            <p className="text-slate-500 dark:text-zinc-400 text-sm md:text-base">Administre permissões e fluxos de trabalho da equipe centralizada.</p>
          </div>
          <button className="flex items-center justify-center gap-3 rounded-2xl h-14 px-8 bg-primary text-slate-900 text-sm font-black hover:brightness-110 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest active:scale-95 whitespace-nowrap">
            <span className="material-symbols-outlined font-black">person_add</span>
            <span>Novo Colaborador</span>
          </button>
        </div>

        {/* Stats Summary - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Equipe</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">124</p>
            </div>
            <div className="absolute right-[-10px] bottom-[-10px] opacity-10 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[80px]">groups</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Admins</p>
              <p className="text-3xl font-black text-primary tracking-tight">12</p>
            </div>
            <div className="absolute right-[-10px] bottom-[-10px] opacity-10 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[80px]">verified_user</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-primary/10 dark:border-primary/20 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Ativos Agora</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">89</p>
            </div>
            <div className="absolute right-[-10px] bottom-[-10px] opacity-10 group-hover:scale-110 transition-transform text-primary">
              <span className="material-symbols-outlined text-[80px]">bolt</span>
            </div>
          </motion.div>
        </div>

        {/* User Table - Responsive Scroll */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-800/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Colaborador</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Contato</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Permissão</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Casas Vinculadas</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {users.map((user, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:-zinc-/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-black text-xs text-slate-400 group-hover:text-primary transition-colors border border-slate-200 dark:border-zinc-700">{user.initials}</div>
                      <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-slate-500 dark:text-zinc-400 font-medium">{user.email}</td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${user.role === 'Admin'
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 border-slate-200 dark:border-zinc-700'
                        }`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-slate-500 dark:text-zinc-400 font-bold italic text-xs">{user.houses}</td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-primary hover:underline font-black text-xs uppercase tracking-widest">Ajustar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Integration Call to Action */}
        <motion.div
          whileHover={{ y: -5 }}
          className="mt-8 p-10 rounded-[40px] bg-slate-900 dark:bg-white text-white dark:text-zinc-900 border-2 border-primary/20 flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary opacity-5 animate-pulse"></div>
          <div className="size-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-6 ring-4 ring-primary/10">
            <span className="material-symbols-outlined text-4xl font-bold">webhook</span>
          </div>
          <h2 className="text-2xl font-black mb-3 uppercase tracking-tight">API & Webhooks Industriais</h2>
          <p className="text-slate-400 dark:text-zinc-500 max-w-xl mb-8 font-medium italic">Integre eventos de staff com seus sistemas externos automaticamente. Arquitetura robusta para notificações em tempo real.</p>
          <button className="px-10 py-4 rounded-2xl bg-primary text-slate-900 font-black text-sm hover:brightness-110 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest active:scale-95">
            Configurar Endpoint PRO
          </button>
        </motion.div>
      </main>
    </div>
  );
}
