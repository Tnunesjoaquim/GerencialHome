'use client';

import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getSelectedResidenceObj } from './actions';
import { createClient } from '@/utils/supabase/client';

export default function Dashboard() {
  const [residence, setResidence] = useState('Buscando...');
  const [userName, setUserName] = useState('...');
  const [financeStats, setFinanceStats] = useState({ total: 0, paid: 0, overdue: 0, overdueCount: 0, percentPaid: 0 });
  const [inventoryStats, setInventoryStats] = useState({ totalItems: 0, lowStock: 0, expiringSoon: 0 });
  const [nextEvent, setNextEvent] = useState<any>(null);
  const [overdueBills, setOverdueBills] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [expiredItems, setExpiredItems] = useState<any[]>([]);
  const [teamStats, setTeamStats] = useState({ total: 0, online: 1 });
  const supabase = createClient();

  useEffect(() => {
    const initDashboard = async () => {
      const res = await getSelectedResidenceObj();
      if (res) {
        setResidence(res.name);
        if (res.id) {
          fetchFinance(res.id);
          fetchInventory(res.id);
          fetchCalendar(res.id);
          fetchTeam(res.id);
        }
      } else {
        setResidence('Casa Principal');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('user_profiles').select('full_name').eq('id', user.id).single();
        if (data && data.full_name) {
          setUserName(data.full_name.split(' ')[0]); // Get first name
        }
      }
    };
    initDashboard();
  }, []);

  const fetchFinance = async (rId: string) => {
    const { data, error } = await supabase.from('financial_transactions').select('*').eq('residence_id', rId);
    if (!error && data) {
      const today = new Date().toISOString().split('T')[0];
      
      const processedData = data.map(b => {
        // Se a conta estiver pendente e a data limite já passou, trate como Atrasado na interface
        if (b.status === 'Pendente' && b.due_date < today) {
          return { ...b, status: 'Atrasado' };
        }
        return b;
      });

      const total = processedData.reduce((acc, b) => acc + Number(b.amount), 0);
      const paid = processedData.filter(b => b.status === 'Pago').reduce((acc, b) => acc + Number(b.amount), 0);
      const overdue = processedData.filter(b => b.status === 'Atrasado').reduce((acc, b) => acc + Number(b.amount), 0);
      const overdueCount = processedData.filter(b => b.status === 'Atrasado').length;
      const percentPaid = total > 0 ? Math.round((paid / total) * 100) : 0;
      
      setFinanceStats({ total, paid, overdue, overdueCount, percentPaid });
      setOverdueBills(processedData.filter(b => b.status === 'Atrasado'));
    }
  };

  const fetchInventory = async (rId: string) => {
    const { data: cats } = await supabase.from('inventory_categories').select('id').eq('residence_id', rId);
    if (cats && cats.length > 0) {
      const cbIds = cats.map(c => c.id);
      const { data: items } = await supabase.from('inventory_items').select('*').in('category_id', cbIds);
      if (items) {
        const totalItems = items.length;
        const lowStock = items.filter(i => Number(i.current_stock) <= Number(i.min_stock)).length;
        const isExpired = (dateStr: string) => {
          if (!dateStr) return false;
          let y, m, d;
          if (dateStr.includes('/')) {
             const parts = dateStr.split('/');
             if (parts.length === 3) [d, m, y] = parts;
          } else {
             const parts = dateStr.split('-');
             if (parts.length === 3) [y, m, d] = parts;
          }
          if (!y || !m || !d) return false;
          const expiryDate = new Date(Number(y), Number(m) - 1, Number(d));
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return expiryDate < today;
        };

        const expiringItemsList = items.filter(i => isExpired(i.expiry));
        const expiringSoon = expiringItemsList.length;

        setInventoryStats({ totalItems, lowStock, expiringSoon });
        setLowStockItems(items.filter(i => Number(i.current_stock) <= Number(i.min_stock)));
        setExpiredItems(expiringItemsList);
      }
    } else {
      setInventoryStats({ totalItems: 0, lowStock: 0, expiringSoon: 0 });
      setLowStockItems([]);
      setExpiredItems([]);
    }
  };

  const fetchCalendar = async (rId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('residence_id', rId)
      .gte('date', today)
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(1)
      .single();

    if (!error && data) {
      setNextEvent(data);
    } else {
      setNextEvent(null);
    }
  };

  const fetchTeam = async (rId: string) => {
    const { data: resData } = await supabase.from('residences').select('owner_id').eq('id', rId).single();
    if (!resData) return;
    
    const { data: members } = await supabase.from('residence_members').select('user_id').eq('residence_id', rId);
    
    const userIds = [resData.owner_id];
    if (members) {
      members.forEach((m: any) => userIds.push(m.user_id));
    }
    
    const uniqueIds = Array.from(new Set(userIds));
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: profiles } = await supabase.from('user_profiles').select('id, last_seen').in('id', uniqueIds);
    
    let total = uniqueIds.length;
    let online = 0;
    
    if (profiles) {
      profiles.forEach((p: any) => {
        if (p.last_seen && p.last_seen > fiveMinutesAgo) {
          online++;
        }
      });
    }
    
    setTeamStats({ total, online: online === 0 ? 1 : online });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      <Header activeTab="dashboard" />

      <main className="flex-1 flex flex-col p-4 md:p-10 mx-auto w-full max-w-[1400px]">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex flex-col gap-8"
        >
          {/* Welcome Header */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
                Olá, {userName}! 👋
              </h1>
              <p className="text-slate-500 dark:text-zinc-400 text-base md:text-lg">
                Aqui está o resumo da <span className="text-primary font-bold">{residence}</span> para hoje.
              </p>
            </div>

            {/* NOVO: Botão Selecionar Residência */}
            <Link
              href="/selecionar-residencia"
              className="group flex items-center gap-2 px-5 py-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl hover:border-primary transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-primary group-hover:rotate-180 transition-transform">swap_horiz</span>
              <span className="font-bold text-sm text-slate-700 dark:text-zinc-300">Trocar Residência</span>
            </Link>
          </motion.div>

          {/* Key Stats Grid - AUTO-RESPONSIVO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Financial Card */}
            <Link href="/financeiro" className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-2xl relative">
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col gap-4 relative overflow-hidden group h-full cursor-pointer hover:border-primary/50"
              >
                <div className="flex justify-between items-start z-10">
                  <div className="size-12 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  {financeStats.overdueCount > 0 ? (
                    <span className="text-[10px] font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                      {financeStats.overdueCount} {financeStats.overdueCount === 1 ? 'conta atrasada' : 'contas atrasadas'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-green-500 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                      Contas em dia
                    </span>
                  )}
                </div>
                <div className="z-10">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Saldo Mensal</p>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-1">R$ {financeStats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${financeStats.percentPaid}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">{financeStats.percentPaid}% DESPESAS PAGAS</p>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-[100px]">account_balance_wallet</span>
                </div>
              </motion.div>
            </Link>

            {/* Inventory Card */}
            <Link href="/estoque" className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-2xl relative">
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col gap-4 relative overflow-hidden group h-full cursor-pointer hover:border-primary/50"
              >
                <div className="flex justify-between items-start z-10">
                  <div className="size-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                    <span className="material-symbols-outlined">inventory_2</span>
                  </div>
                  {inventoryStats.lowStock > 0 && (
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">
                      {inventoryStats.lowStock} {inventoryStats.lowStock === 1 ? 'baixo' : 'baixos'}
                    </span>
                  )}
                </div>
                <div className="z-10">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Estoque Geral</p>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-1">{inventoryStats.totalItems} {inventoryStats.totalItems === 1 ? 'Item' : 'Itens'}</h3>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium">VENCIMENTOS: <span className="font-bold text-red-500">{inventoryStats.expiringSoon}</span></p>
                  <span className="text-primary text-xs font-bold flex items-center gap-1 mt-4 hover:underline">
                    Ver inventário <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </span>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-[100px]">shopping_cart</span>
                </div>
              </motion.div>
            </Link>

            {/* Calendar Card */}
            <Link href="/calendario" className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-2xl relative">
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col gap-4 relative overflow-hidden group h-full cursor-pointer hover:border-primary/50"
              >
                <div className="flex justify-between items-start z-10">
                  <div className="size-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <span className="material-symbols-outlined">event</span>
                  </div>
                  {nextEvent && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${nextEvent.tag_color || 'bg-slate-100 dark:bg-zinc-800 text-slate-500'}`}>
                      {nextEvent.tag}
                    </span>
                  )}
                </div>
                <div className="z-10">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Próximo</p>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mt-1 leading-tight line-clamp-1">
                    {nextEvent ? nextEvent.title : 'Sem Eventos'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {nextEvent
                      ? `${new Date(nextEvent.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} às `
                      : ''}
                    <span className="font-bold text-primary">{nextEvent ? `${nextEvent.time} ${nextEvent.period}` : 'Agende o próximo'}</span>
                  </p>
                  <div className="flex -space-x-2 mt-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="size-8 rounded-full border-2 border-white dark:border-zinc-900 bg-slate-200 bg-cover shadow-sm" style={{ backgroundImage: `url(https://i.pravatar.cc/150?u=${i})` }} />
                    ))}
                    <div className="size-8 rounded-full border-2 border-white dark:border-zinc-900 bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">+2</div>
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-[100px]">calendar_month</span>
                </div>
              </motion.div>
            </Link>

            {/* Team Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col gap-4 relative overflow-hidden group"
            >
              <div className="flex justify-between items-start z-10">
                <div className="size-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <span className="material-symbols-outlined">group</span>
                </div>
              </div>
              <div className="z-10">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Time Ativo</p>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-1">{teamStats.online} {teamStats.online === 1 ? 'Logado' : 'Logados'}</h3>
                <p className="text-[10px] text-slate-500 mt-2 font-medium">TOTAL: {teamStats.total} {teamStats.total === 1 ? 'USUÁRIO' : 'USUÁRIOS'}</p>
                <div className="flex items-center gap-2 mt-4 text-green-500">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-[10px] font-bold uppercase">Online Now</span>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-[100px]">badge</span>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <motion.section variants={itemVariants} className="lg:col-span-2 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-black flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">rocket_launch</span> Atalhos
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/estoque" className="group">
                  <div className="bg-white dark:bg-zinc-900 p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-primary/50 transition-all flex items-center gap-4 h-full">
                    <div className="size-12 md:size-14 rounded-xl bg-slate-100 dark:bg-zinc-800 group-hover:bg-primary/20 transition-colors flex items-center justify-center text-slate-600 dark:text-zinc-400 group-hover:text-primary">
                      <span className="material-symbols-outlined text-2xl md:text-3xl">add_shopping_cart</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base md:text-lg group-hover:text-primary transition-colors">Nova Compra</h4>
                      <p className="text-xs text-slate-500">Atualizar estoque</p>
                    </div>
                  </div>
                </Link>
                <Link href="/financeiro" className="group">
                  <div className="bg-white dark:bg-zinc-900 p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-primary/50 transition-all flex items-center gap-4 h-full">
                    <div className="size-12 md:size-14 rounded-xl bg-slate-100 dark:bg-zinc-800 group-hover:bg-primary/20 transition-colors flex items-center justify-center text-slate-600 dark:text-zinc-400 group-hover:text-primary">
                      <span className="material-symbols-outlined text-2xl md:text-3xl">receipt_long</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base md:text-lg group-hover:text-primary transition-colors">Pagar Contas</h4>
                      <p className="text-xs text-slate-500">Evite juros e multas</p>
                    </div>
                  </div>
                </Link>
                <Link href="/calendario" className="group">
                  <div className="bg-white dark:bg-zinc-900 p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-primary/50 transition-all flex items-center gap-4 h-full">
                    <div className="size-12 md:size-14 rounded-xl bg-slate-100 dark:bg-zinc-800 group-hover:bg-primary/20 transition-colors flex items-center justify-center text-slate-600 dark:text-zinc-400 group-hover:text-primary">
                      <span className="material-symbols-outlined text-2xl md:text-3xl">event_available</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base md:text-lg group-hover:text-primary transition-colors">Novo Evento</h4>
                      <p className="text-xs text-slate-500">Agendar atividades</p>
                    </div>
                  </div>
                </Link>
                <Link href="/usuarios" className="group">
                  <div className="bg-white dark:bg-zinc-900 p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-primary/50 transition-all flex items-center gap-4 h-full">
                    <div className="size-12 md:size-14 rounded-xl bg-slate-100 dark:bg-zinc-800 group-hover:bg-primary/20 transition-colors flex items-center justify-center text-slate-600 dark:text-zinc-400 group-hover:text-primary">
                      <span className="material-symbols-outlined text-2xl md:text-3xl">manage_accounts</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base md:text-lg group-hover:text-primary transition-colors">Gestão de Usuários</h4>
                      <p className="text-xs text-slate-500">Permissões e acessos</p>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.section>

            {/* Task Summary / Notifications */}
            <motion.section variants={itemVariants} className="flex flex-col gap-6">
              <h2 className="text-xl md:text-2xl font-black flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">notifications_active</span> Notificações
              </h2>
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xl">
                {overdueBills.length === 0 && lowStockItems.length === 0 && expiredItems.length === 0 ? (
                  <div className="p-6 text-center">
                    <span className="material-symbols-outlined text-4xl text-green-500 mb-2 mt-4">check_circle</span>
                    <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">Tudo em dia!</p>
                    <p className="text-xs text-slate-500 mt-1 mb-4">Nenhuma notificação pendente.</p>
                  </div>
                ) : (
                  <>
                    {overdueBills.map((bill, idx) => (
                      <div key={`fin-${bill.id || idx}`} className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-3 bg-red-50 dark:bg-red-950/20">
                        <span className="material-symbols-outlined text-red-500">error</span>
                        <div>
                          <p className="text-sm font-bold text-red-700 dark:text-red-400">{bill.category || 'Conta'} Vencida!</p>
                          <p className="text-xs text-red-600 dark:text-red-500/70 line-clamp-1">
                            Venceu em {bill.due_date ? new Date(bill.due_date + 'T00:00:00').toLocaleDateString('pt-BR') : 'Data Indefinida'} (R$ {Number(bill.amount).toLocaleString('pt-BR', {minimumFractionDigits: 2})})
                          </p>
                        </div>
                      </div>
                    ))}
                    {lowStockItems.map((item, idx) => (
                      <div key={`inv-${item.id || idx}`} className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-3">
                        <span className="material-symbols-outlined text-orange-500">shopping_cart_checkout</span>
                        <div>
                          <p className="text-sm font-bold">Estoque Baixo</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{item.name} está no fim ({item.current_stock} restante).</p>
                        </div>
                      </div>
                    ))}
                    {expiredItems.map((item, idx) => (
                      <div key={`exp-${item.id || idx}`} className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-3 bg-red-50 dark:bg-red-950/20">
                        <span className="material-symbols-outlined text-red-500">event_busy</span>
                        <div>
                          <p className="text-sm font-bold text-red-700 dark:text-red-400">Produto Vencido!</p>
                          <p className="text-xs text-red-600 dark:text-red-500/70 line-clamp-1">
                            {item.name} venceu em {item.expiry.includes('-') ? item.expiry.split('-').reverse().join('/') : item.expiry}.
                          </p>
                        </div>
                      </div>
                    ))}
                    <button className="w-full py-4 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:-zinc- transition-colors uppercase tracking-widest bg-slate-50/50 dark:bg-zinc-800/20">
                      Limpar notificações
                    </button>
                  </>
                )}
              </div>
            </motion.section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
