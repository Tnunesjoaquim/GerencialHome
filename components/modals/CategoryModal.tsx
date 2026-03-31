'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface CategoryModalProps {
  onClose: () => void;
  onSave: (name: string) => void;
  initialName?: string;
}

export function CategoryModal({ onClose, onSave, initialName = '' }: CategoryModalProps) {
  const [name, setName] = useState(initialName);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-2xl font-black mb-6 dark:text-white uppercase tracking-tight">{initialName ? 'Renomear Categoria' : 'Criar Nova Categoria'}</h2>
        <div className="flex flex-col gap-4">
          <input
            autoFocus
            className="w-full p-4 rounded-xl bg-slate-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-primary outline-none dark:text-white"
            placeholder="Nome da categoria (ex: Limpeza)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex gap-3 mt-4">
            <button onClick={onClose} className="flex-1 py-4 font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase text-xs">Cancelar</button>
            <button onClick={() => onSave(name)} className="flex-1 py-4 bg-primary text-slate-900 rounded-xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all text-xs uppercase">Confirmar</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
