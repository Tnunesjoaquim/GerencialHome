'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export interface ItemData {
  name: string;
  unit: string;
  minStock: number;
  currentStock: number;
  expiry: string;
  responsible: string;
  obs: string;
}

interface ItemModalProps {
  onClose: () => void;
  onSave: (data: ItemData) => void;
  initialData?: ItemData;
  isEditing?: boolean;
  defaultResponsible?: string;
}

export function ItemModal({ onClose, onSave, initialData, isEditing = false, defaultResponsible = '' }: ItemModalProps) {
  const [data, setData] = useState<ItemData>(initialData || {
    name: '', unit: 'Unidade', minStock: 0, currentStock: 0, expiry: '', responsible: defaultResponsible, obs: ''
  });

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    } else {
      setData(prev => ({ ...prev, responsible: defaultResponsible }));
    }
  }, [initialData, defaultResponsible]);

  const parseExpiryForInput = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-black mb-6 dark:text-white uppercase tracking-tight">{isEditing ? 'Editar Item' : 'Adicionar Item'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Nome do Produto</label>
            <input className="w-full p-4 rounded-xl bg-slate-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary dark:text-white" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Unidade</label>
            <select
              className="w-full p-4 rounded-xl bg-slate-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary dark:text-white appearance-none cursor-pointer font-bold text-sm"
              value={data.unit}
              onChange={(e) => setData({ ...data, unit: e.target.value })}
            >
              <option value="Unidade">Unidade</option>
              <option value="KG">KG</option>
              <option value="Gramas">Gramas</option>
              <option value="Peso">Peso</option>
              <option value="Litros">Litros</option>
              <option value="ML">ML</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Estoque Min.</label>
            <input type="number" className="w-full p-4 rounded-xl bg-slate-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary dark:text-white" value={data.minStock} onChange={(e) => setData({ ...data, minStock: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Estoque Atual</label>
            <input type="number" className="w-full p-4 rounded-xl bg-slate-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary dark:text-white" value={data.currentStock} onChange={(e) => setData({ ...data, currentStock: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Vencimento</label>
            <input type="date" className="w-full p-4 rounded-xl bg-slate-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary dark:text-white" value={parseExpiryForInput(data.expiry)} onChange={(e) => setData({ ...data, expiry: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Responsável</label>
            <input type="text" className="w-full p-4 rounded-xl bg-slate-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary dark:text-white" placeholder="Nome do Responsável" value={data.responsible} onChange={(e) => setData({ ...data, responsible: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Observações</label>
            <input className="w-full p-4 rounded-xl bg-slate-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary dark:text-white" placeholder="Opcional..." value={data.obs} onChange={(e) => setData({ ...data, obs: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-4 font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase text-xs">Descartar</button>
          <button onClick={() => { onSave(data); }} className="flex-1 py-4 bg-primary text-slate-900 rounded-xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all text-xs uppercase">Salvar Produto</button>
        </div>
      </motion.div>
    </div>
  );
}
