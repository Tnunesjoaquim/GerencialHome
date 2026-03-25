'use client';

import { motion } from 'framer-motion';

interface DeleteConfirmModalProps {
  itemName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({ itemName, onClose, onConfirm }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl text-center">
        
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl text-red-500">warning</span>
        </div>
        
        <h2 className="text-2xl font-black mb-2 dark:text-white uppercase tracking-tight">Excluir Produto</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Tem certeza que deseja excluir o item <strong className="text-slate-800 dark:text-slate-200">{itemName}</strong> do estoque? Esta ação não pode ser desfeita.
        </p>
        
        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 py-4 font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors uppercase text-xs"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            className="flex-1 py-4 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 active:scale-95 transition-all text-xs uppercase"
          >
            Sim, Excluir
          </button>
        </div>
      </motion.div>
    </div>
  );
}
