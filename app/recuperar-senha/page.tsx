'use client'

import { recoverPassword } from '@/app/login/actions'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function RecuperarSenhaContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')
    const message = searchParams.get('message')

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
                        <span className="material-symbols-outlined text-slate-950 font-black text-3xl">lock_reset</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter text-center">
                        Recuperar <span className="text-primary tracking-normal not-italic">Senha</span>
                    </h1>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium text-center mt-2">
                        Digite seu e-mail cadastrado para receber as instruções de recuperação.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold border border-red-100 dark:border-red-900/50 flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">error</span>
                        {error}
                    </div>
                )}
                {message && (
                    <div className="mb-6 p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-bold border border-green-100 dark:border-green-900/50 flex items-start gap-3">
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        {message}
                    </div>
                )}

                <form action={recoverPassword} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1" htmlFor="email">
                            E-mail da Conta
                        </label>
                        <input
                            className="h-14 px-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white shadow-sm font-medium"
                            id="email"
                            name="email"
                            type="email"
                            placeholder="nome@exemplo.com"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-2 h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-black tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-xl hover:shadow-2xl"
                    >
                        Enviar E-mail
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Voltar para o Login
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}

export default function RecuperarSenha() {
    return (
        <Suspense fallback={
            <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
                <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <RecuperarSenhaContent />
        </Suspense>
    )
}
