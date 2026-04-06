'use client'

import { login, signup } from './actions'
import { motion, AnimatePresence } from 'framer-motion'
import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTheme } from '@/hooks/useTheme'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

function LoginContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    const [isLogin, setIsLogin] = useState(true)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const { theme, toggleTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleGoogleLogin = async () => {
        const supabase = createClient()
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        })
    }

    useEffect(() => { setMounted(true) }, [])

    // For signup, we don't strictly need to upload the file here on the client because 
    // we can pass it via FormData to our server action. 
    // Wait, the signup action currently doesn't handle the photo upload.
    // Let's just keep it simple without the avatar first, or we can add it and handle it in actions.ts.
    // The user instruction: "Update /login page with a "Cadastrar" (First Access) form (Name, Email, Passwords, optional Avatar)."

    return (
        <div className="min-h-screen w-full flex bg-slate-50 dark:bg-zinc-950 font-sans selection:bg-primary/30">
            {/* Left Side - Image/Branding (Hidden on small screens) */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent z-10" />
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

                <motion.div
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
                </motion.div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto max-h-screen scrollbar-thin">
                {mounted && (
                    <button 
                        onClick={toggleTheme} 
                        className="absolute top-6 right-6 p-3 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors z-50 flex items-center justify-center"
                        title="Alternar Modo Noturno"
                    >
                        <span className="material-symbols-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                    </button>
                )}
                <div className="w-full max-w-[400px] py-10">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex flex-col items-center mb-10">
                        <div className="size-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 mb-4">
                            <span className="material-symbols-outlined text-slate-950 font-black text-3xl">home_app_logo</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                            Gerencial<span className="text-primary tracking-normal not-italic">Home</span>
                        </h1>
                    </div>

                    <div className="mb-8 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? "loginHeader" : "signupHeader"}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                                    {isLogin ? "Seja bem vindo" : "Criar sua Conta"}
                                </h2>
                                <p className="text-slate-500 dark:text-zinc-400 font-medium">
                                    {isLogin
                                        ? "Use suas credenciais para acessar o painel de controle."
                                        : "Preencha seus dados para seu primeiro acesso ao sistema."}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold border border-red-100 dark:border-red-900/50 flex items-center gap-3 animate-in fade-in zoom-in slide-in-from-top-2 duration-300">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    {/* Toggle Switch */}
                    <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-2xl mb-8 relative">
                        <div
                            className="absolute bg-white dark:bg-zinc-800 h-[calc(100%-8px)] rounded-xl shadow-sm transition-all duration-300 ease-out top-1"
                            style={{
                                left: isLogin ? '4px' : 'calc(50% + 2px)',
                                width: 'calc(50% - 6px)'
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 relative z-10 h-10 text-xs font-black uppercase tracking-widest transition-colors ${isLogin ? 'text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:-zinc-'}`}
                        >
                            Entrar
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 relative z-10 h-10 text-xs font-black uppercase tracking-widest transition-colors ${!isLogin ? 'text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:-zinc-'}`}
                        >
                            Cadastrar
                        </button>
                    </div>

                    <form className="flex flex-col gap-5">
                        <AnimatePresence mode="popLayout">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col gap-5 overflow-hidden"
                                >
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                                            Avatar / Foto (Opcional)
                                        </label>
                                        <div className="flex items-center gap-4 mb-2">
                                            {avatarFile ? (
                                                <div
                                                    className="size-16 rounded-2xl bg-cover bg-center shadow-inner border border-slate-200 dark:border-zinc-700 shrink-0"
                                                    style={{ backgroundImage: `url(${URL.createObjectURL(avatarFile)})` }}
                                                />
                                            ) : (
                                                <div className="size-16 rounded-2xl bg-slate-50 dark:bg-zinc-900 border-2 border-dashed border-slate-200 dark:border-zinc-800 text-slate-400 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined">add_a_photo</span>
                                                </div>
                                            )}
                                            <input type="file" name="avatar" id="avatar-upload" className="hidden" accept="image/*" onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setAvatarFile(e.target.files[0]);
                                                }
                                            }} />
                                            <label htmlFor="avatar-upload" className="cursor-pointer bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:-zinc- text-slate-600 dark:text-zinc-300 px-4 py-2 rounded-xl text-xs font-bold transition-colors">
                                                Escolher Foto
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1" htmlFor="name">
                                            Nome Completo
                                        </label>
                                        <input
                                            className="h-14 px-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white shadow-sm font-medium"
                                            id="name"
                                            name="name"
                                            type="text"
                                            placeholder="Seu nome completo"
                                            required={!isLogin}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1" htmlFor="email">
                                Email
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

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500" htmlFor="access_key">
                                    Senha
                                </label>
                                {isLogin && (
                                    <Link href="/recuperar-senha" className="text-xs font-bold text-primary hover:underline">Esqueceu?</Link>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    className="w-full h-14 pl-5 pr-14 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white shadow-sm font-medium"
                                    id="access_key"
                                    name="access_key"
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

                        <AnimatePresence mode="popLayout">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col gap-2 overflow-hidden"
                                >
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 mt-3" htmlFor="confirm_access_key">
                                            Confirmar Senha
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <input
                                            className="w-full h-14 pl-5 pr-14 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 dark:text-white shadow-sm font-medium"
                                            id="confirm_access_key"
                                            name="confirm_access_key"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                            required={!isLogin}
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
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            formAction={isLogin ? login : signup}
                            className="mt-6 h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-black tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-xl hover:shadow-2xl"
                        >
                            {isLogin ? "Autenticar" : "Criar Conta"}
                        </button>

                        <div className="relative flex items-center my-4">
                            <div className="flex-grow border-t border-slate-200 dark:border-zinc-800"></div>
                            <span className="shrink-0 text-xs text-slate-400 font-medium px-4 uppercase tracking-widest">ou</span>
                            <div className="flex-grow border-t border-slate-200 dark:border-zinc-800"></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 font-bold tracking-wide flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-zinc-800/80 hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Entrar com Google
                        </button>
                    </form>

                    <div className="mt-12 text-center pb-8">
                        <p className="text-xs text-slate-400 font-medium tracking-wide">
                            Gerencial Home Secured Network &copy; {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
                <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}
