import { login, signup } from './actions'
import { motion } from 'framer-motion'
import * as mot from 'framer-motion/client'

export default function LoginPage({
    searchParams,
}: {
    searchParams: { error?: string }
}) {
    return (
        <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 font-sans selection:bg-primary/30">
            {/* Left Side - Image/Branding (Hidden on small screens) */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent z-10" />
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

                <mot.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="z-20 text-center flex flex-col items-center"
                >
                    <div className="size-24 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 mb-8 border border-white/10">
                        <span className="material-symbols-outlined text-slate-950 font-black text-5xl">home_app_logo</span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-4">
                        Gerencial<span className="text-primary tracking-normal not-italic">Home</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium max-w-sm">
                        Gestão unificada, inteligente e adaptável para sua residência premium.
                    </p>
                </mot.div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
                <div className="w-full max-w-[400px]">
                    {/* Mobile Header (Only visible when Left Side is hidden) */}
                    <div className="lg:hidden flex flex-col items-center mb-10">
                        <div className="size-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 mb-4">
                            <span className="material-symbols-outlined text-slate-950 font-black text-3xl">home_app_logo</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                            Gerencial<span className="text-primary tracking-normal not-italic">Home</span>
                        </h1>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Bem-vindo de volta</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Use suas credenciais para acessar o painel de controle.</p>
                    </div>

                    {searchParams?.error && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold border border-red-100 dark:border-red-900/50 flex items-center gap-3 animate-in fade-in zoom-in slide-in-from-top-2 duration-300">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {searchParams.error}
                        </div>
                    )}

                    <form className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1" htmlFor="email">
                                Email
                            </label>
                            <input
                                className="h-14 px-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white shadow-sm font-medium"
                                id="email"
                                name="email"
                                type="email"
                                placeholder="nome@empresa.com"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500" htmlFor="password">
                                    Senha
                                </label>
                                <a href="#" className="text-xs font-bold text-primary hover:underline">Esqueceu?</a>
                            </div>
                            <input
                                className="h-14 px-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white shadow-sm font-medium"
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            formAction={login}
                            className="mt-4 h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-xl hover:shadow-2xl"
                        >
                            Autenticar
                        </button>
                        <button
                            formAction={signup}
                            className="h-14 rounded-2xl bg-transparent border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-black tracking-widest uppercase hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
                        >
                            Criar Conta Inicial
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-xs text-slate-400 font-medium tracking-wide">
                            Gerencial Home Secured Network &copy; {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
