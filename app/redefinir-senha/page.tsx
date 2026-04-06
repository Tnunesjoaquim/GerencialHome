'use client'

import { updatePassword } from '@/app/login/actions'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function RedefinirSenhaContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    return (
        <div className="min-h-screen w-full flex bg-slate-50 dark:bg-zinc-950 font-sans selection:bg-primary/30 items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[400px]"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="size-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 mb-4">
                        <span className="material-symbols-outlined text-slate-950 font-black text-3xl">key</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter text-center">
                        Nova <span className="text-primary tracking-normal not-italic">Senha</span>
                    </h1>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium text-center mt-2">
                        Digite sua nova senha abaixo para acessar seu painel.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold border border-red-100 dark:border-red-900/50 flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">error</span>
                        {error}
                    </div>
                )}

                <form action={updatePassword} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1" htmlFor="password">
                            Nova Senha
                        </label>
                        <div className="relative">
                            <input
                                className="w-full h-14 pl-5 pr-14 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white shadow-sm font-medium"
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors flex items-center justify-center p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/80"
                                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                            >
                                <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1" htmlFor="confirm_password">
                            Confirmar Nova Senha
                        </label>
                        <div className="relative">
                            <input
                                className="w-full h-14 pl-5 pr-14 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white shadow-sm font-medium"
                                id="confirm_password"
                                name="confirm_password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors flex items-center justify-center p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/80"
                                title={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                            >
                                <span className="material-symbols-outlined text-lg">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="mt-4 h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-black tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-xl hover:shadow-2xl"
                    >
                        Redefinir Senha
                    </button>
                </form>
            </motion.div>
        </div>
    )
}

export default function RedefinirSenha() {
    return (
        <Suspense fallback={
            <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
                <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <RedefinirSenhaContent />
        </Suspense>
    )
}
