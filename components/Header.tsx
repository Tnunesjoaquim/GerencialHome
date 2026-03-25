'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { logout } from '@/app/login/actions';

export function Header({ activeTab }: { activeTab: string }) {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [userProfile, setUserProfile] = useState<{ full_name: string; avatar_url: string | null; initials: string; role_name: string } | null>(null);
  const supabase = createClient();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const updateLastSeen = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id);
      }
    };
    if (mounted) {
      updateLastSeen();
    }
  }, [pathname, mounted, supabase]);

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select(`
        full_name,
        avatar_url,
        user_roles (
          roles (
            name
          )
        )
      `)
      .eq('id', user.id)
      .single();

    if (profile) {
      const getInitials = (name: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      };

      let roleName = 'Usuário';
      if (profile.user_roles && profile.user_roles.length > 0) {
        const rolesObj: any = profile.user_roles[0].roles;
        roleName = rolesObj?.name || 'Usuário';
      }

      setUserProfile({
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        initials: getInitials(profile.full_name),
        role_name: roleName
      });
    }
  };

  // Prevenir scroll quando o menu estiver aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', id: 'dashboard', icon: 'dashboard' },
    { href: '/estoque', label: 'Estoque', id: 'estoque', icon: 'inventory_2' },
    { href: '/financeiro', label: 'Financeiro', id: 'financeiro', icon: 'payments' },
    { href: '/calendario', label: 'Calendário', id: 'calendario', icon: 'calendar_month' },
    { href: '/usuarios', label: 'Usuários', id: 'usuarios', icon: 'manage_accounts' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 md:h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-[100] px-4 md:px-10 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="size-8 md:size-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-slate-950 font-black text-xl md:text-2xl">home_app_logo</span>
            </div>
            <h1 className="text-base md:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter hidden xs:block">
              Gerencial<span className="text-primary tracking-normal not-italic">Home</span>
            </h1>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${activeTab === link.id
                  ? 'text-primary bg-primary/5'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                {link.label}
                {activeTab === link.id && (
                  <motion.div
                    layoutId="headerActiveTab"
                    className="absolute bottom-0 left-3 right-3 h-1 bg-primary rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="size-10 md:size-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary/20 transition-all text-slate-600 dark:text-slate-300 group shadow-sm"
          >
            <span className="material-symbols-outlined group-active:rotate-90 transition-transform">
              {mounted ? (theme === 'dark' ? 'light_mode' : 'dark_mode') : 'dark_mode'}
            </span>
          </button>

          {/* Profile Menu Dropdown (Desktop) */}
          <div className="relative" ref={profileMenuRef}>
            <div 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="hidden sm:flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-700 ml-2 cursor-pointer relative"
            >
              {userProfile?.avatar_url ? (
                <div className="size-10 md:size-11 rounded-2xl bg-center bg-cover border-2 border-primary/20 hover:border-primary transition-colors" style={{ backgroundImage: `url(${userProfile.avatar_url})` }}></div>
              ) : (
                <div className="size-10 md:size-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors">
                  {userProfile?.initials || '??'}
                </div>
              )}
            </div>

            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-4 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-[200]"
                >
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col">
                    <span className="font-black text-slate-900 dark:text-white uppercase truncate text-sm">{userProfile?.full_name || 'Usuário'}</span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">{userProfile?.role_name}</span>
                  </div>
                  
                  <div className="flex flex-col p-2">
                    <Link 
                      href="/perfil" 
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold transition-colors text-sm"
                    >
                      <span className="material-symbols-outlined text-lg">manage_accounts</span>
                      Editar Perfil
                    </Link>
                    <Link 
                      href="/selecionar-residencia" 
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold transition-colors text-sm"
                    >
                      <span className="material-symbols-outlined text-lg">home_work</span>
                      Trocar Residência
                    </Link>
                  </div>
                  
                  <div className="border-t border-slate-100 dark:border-slate-800 p-2 flex flex-col pt-2">
                    <form action={logout}>
                      <button 
                        type="submit"
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-black transition-colors text-sm uppercase tracking-widest"
                      >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Sair da Conta
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden size-10 md:size-11 flex items-center justify-center rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 transition-all active:scale-90"
          >
            <span className="material-symbols-outlined font-black">menu</span>
          </button>
        </div>
      </header>

      {/* Spacer for Fixed Header */}
      <div className="h-16 md:h-20 w-full" />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[200] lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            {/* Content Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-[320px] bg-white dark:bg-slate-900 border-l border-white/10 shadow-2xl flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-950 font-black">home</span>
                  </div>
                  <span className="font-black text-slate-900 dark:text-white uppercase">Menu</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors"
                >
                  <span className="material-symbols-outlined font-black">close</span>
                </button>
              </div>

              {/* Sidebar Profile Card */}
              <div className="mx-6 mt-6 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                {userProfile?.avatar_url ? (
                  <div className="size-12 rounded-2xl bg-center bg-cover border-2 border-primary" style={{ backgroundImage: `url(${userProfile.avatar_url})` }}></div>
                ) : (
                  <div className="size-12 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-slate-500 dark:text-slate-400 border-2 border-primary">
                    {userProfile?.initials || '??'}
                  </div>
                )}
                <div>
                  <p className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-sm line-clamp-1">{userProfile?.full_name || 'Usuário'}</p>
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{userProfile?.role_name}</p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 p-6 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === link.id
                      ? 'bg-primary text-slate-900 shadow-lg shadow-primary/20 scale-[1.02]'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                  >
                    <span className="material-symbols-outlined text-xl">{link.icon}</span>
                    {link.label}
                    {activeTab === link.id && (
                      <span className="material-symbols-outlined ms-auto text-lg">check_circle</span>
                    )}
                  </Link>
                ))}
              </nav>

              {/* Sidebar Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full h-14 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 transition-colors"
                >
                  <span className="material-symbols-outlined">logout</span>
                  Sair das Residências
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
