'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SubmitButton } from './SubmitButton';

interface Residence {
    id: string;
    name: string;
    address: string | null;
    number: string | null;
    photo_url: string | null;
}

interface EditResidenceButtonProps {
    house: Residence;
    onEditAction: (residenceId: string, formData: FormData) => Promise<void>;
}

export function EditResidenceButton({ house, onEditAction }: EditResidenceButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(true);
                }}
                title="Editar Residência"
                className="size-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
            >
                <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Editar Residência</h2>
                                    <button onClick={() => setIsOpen(false)} className="size-10 rounded-full hover:bg-slate-100 dark:-zinc-[800] flex items-center justify-center transition-colors">
                                        <span className="material-symbols-outlined text-slate-500">close</span>
                                    </button>
                                </div>

                                <form 
                                    action={async (formData) => {
                                        await onEditAction(house.id, formData);
                                        setIsOpen(false);
                                    }} 
                                    className="flex flex-col gap-4"
                                >
                                    <div className="relative mb-2">
                                        <input type="file" name="photo" accept="image/*" className="hidden" id={`photo-upload-${house.id}`} />
                                        <label htmlFor={`photo-upload-${house.id}`} className="flex items-center justify-center gap-2 h-16 rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-950 text-slate-500 hover:text-primary hover:border-primary font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer group shadow-sm">
                                            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">add_photo_alternate</span>
                                            <span>Alterar Foto</span>
                                        </label>
                                    </div>

                                    <input
                                        className="h-14 px-5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white shadow-sm font-medium text-sm"
                                        name="residenceName"
                                        type="text"
                                        defaultValue={house.name}
                                        placeholder="Nome (ex: Casa Veraneio)"
                                        required
                                    />

                                    <div className="flex gap-3">
                                        <input
                                            className="flex-1 w-full min-w-0 h-14 px-5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white shadow-sm font-medium text-sm"
                                            name="address"
                                            type="text"
                                            defaultValue={house.address || ''}
                                            placeholder="Endereço principal"
                                        />
                                        <input
                                            className="w-28 shrink-0 h-14 px-5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white shadow-sm font-medium text-sm"
                                            name="number"
                                            type="text"
                                            defaultValue={house.number || ''}
                                            placeholder="Número"
                                        />
                                    </div>
                                    <div className="mt-4">
                                        <SubmitButton />
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
