'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Residence {
  id: string;
  name: string;
  address: string;
  image: string;
}

export default function SelectResidence() {
  const [residences, setResidences] = useState<Residence[]>([
    {
      id: '1',
      name: 'Casa de Praia',
      address: 'Ilhabela, SP',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGP21bTwfp1bOVdLxyJ1w5BapKgCewOyIUuppoeFRcJf7s6-SP5iVdF0jj-cb9vrmVoXZ7r9NtYjEcXBxH9Jl_UlXGTsDyS3bv6dJmAVfSw6iKRHut-HxuoH8ZfFj4bfNmR3GAOyQjuX0EfN0KbOPC-TuDEPTWYEXh7h3gXtydUDh0SXYyajdgEyy46cVAhXRGhC5xxLqdlKKYNeaxwVvIPWoGz-QuNU7CBNEoSimYF7QjL77tEk0UsHFKda4TpSwpYRL-322fW8A',
    },
    {
      id: '2',
      name: 'Apartamento SP',
      address: 'Vila Olímpia, São Paulo',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUMW2pvmp-2yl16-jHn70LQYt7tKjic8nCNsLxWd5z3vM1P1m6y_iC7LxNaDB8ST2cWe4U1uvBjEMtVcMBQ6sdOzIG50E-Uj17M0PA2QF8bzqdLcH0-QQgIaQbrD2xuZfzirZRMsP_uwcBK3pgJuWIrPtykHGojx9QNVnCOWejSlchAYJnMfDXCmm-pt5__U1rYLiWih4vLNCWkJjxhObLmvi5aJ0yDPo0B4iYKb0h720q2gmcob08BWexvWCehwyE8pN4Sp2wqPM',
    },
    {
      id: '3',
      name: 'Casa Principal',
      address: 'Jardins, São Paulo',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsn13ygkXA6r42NRhIYqSQ6ZIk27HvTALkMS1PtMbYZE4CEtVMPq1H1dU6r6HqiyTwkgw_H4WCpzBSNm9A4H_7FnJFT9tkeryrKn5I69vONJ6-Ao6G9eYnpK6JJceG7CUCo3ZkzTZ9XLQM_71dlz550P8wOQUFHKO0ei7Y0GeBwxw85CZNYt2AI6BuokjhHwhPdyOniAdCXra5iT3CGGZT9ukIAUyB_PJDf9BcV9-uD953Xzt-D8VMayFMvtTU3l0My2oiwtjtYyw',
    },
    {
      id: '4',
      name: 'Sítio Interior',
      address: 'Atibaia, SP',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkduHlQEJz3IidAcfQn1t_PUAmD4FsHOHm2Ch3zEbMrSdrP9SZSKOA1U-Q9SD1tigzX3B5C5Jhm6hEIyCFKyVjHOepud0Mipy1Cj0A0sGhVeaZ4DFq7ealapXCuJLQKAZJyaeKsONqyjpTVe0PMC7UeFiHXiiRHr5-5SkTYy5I3Z8eN-8vkPzgkIKkXo1W3DWHG_hw1sqKUhrZbrnTQ-iXQL07xDrDMadlW41s_e5r1qe-8FjY6eHMpBjjybwSCOxxTmKnX6m27Oo',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResidence, setEditingResidence] = useState<Residence | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', image: '' });
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mock address autocomplete logic
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, address: value });
    if (value.length > 3) {
      const mocks = [
        `${value}, São Paulo, SP`,
        `${value}, Rio de Janeiro, RJ`,
        `${value}, Belo Horizonte, MG`,
        `${value}, Curitiba, PR`,
      ];
      setAddressSuggestions(mocks);
      setShowSuggestions(true);
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const openModal = (residence?: Residence) => {
    if (residence) {
      setEditingResidence(residence);
      setFormData({ name: residence.name, address: residence.address, image: residence.image });
    } else {
      setEditingResidence(null);
      setFormData({ name: '', address: '', image: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingResidence) {
      setResidences(residences.map(r => r.id === editingResidence.id ? { ...r, ...formData } : r));
    } else {
      setResidences([...residences, { ...formData, id: Math.random().toString() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta residência?')) {
      setResidences(residences.filter(r => r.id !== id));
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 px-6 py-4 lg:px-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-slate-900 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined font-bold">home_work</span>
          </div>
          <h2 className="text-slate-900 dark:text-white text-xl font-black leading-tight tracking-tight">Gerencial Home</h2>
        </div>
        <div className="flex gap-3">
          <button className="flex size-10 cursor-pointer items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="flex size-10 cursor-pointer items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      <main className="flex flex-1 justify-center py-10 px-6 lg:px-20">
        <div className="flex flex-col max-w-[1200px] flex-1 gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">Selecione a Residência</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-normal">Escolha qual imóvel você deseja gerenciar agora</p>
          </div>

          <div className="w-full">
            <div className="relative flex items-center w-full group">
              <div className="absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                className="block w-full pl-12 pr-4 py-4 rounded-xl border-none bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-primary text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all"
                placeholder="Buscar residência pelo nome ou localização..."
                type="text"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {residences.map((residence) => (
                <motion.div
                  key={residence.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-md hover:shadow-2xl transition-all border border-slate-100 dark:border-slate-800 h-full"
                >
                  <div className="w-full aspect-video bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url("${residence.image}")` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => openModal(residence)}
                          className="flex-1 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-white/30 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span> Editar
                        </button>
                        <button
                          onClick={() => handleDelete(residence.id)}
                          className="flex-1 py-2 bg-red-500/20 backdrop-blur-md text-red-200 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-red-500/40 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span> Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col gap-4 flex-1">
                    <div className="flex-1">
                      <h3 className="text-slate-900 dark:text-white text-xl font-black">{residence.name}</h3>
                      <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-sm mt-1">
                        <span className="material-symbols-outlined text-sm text-primary">location_on</span> {residence.address}
                      </p>
                    </div>
                    <Link href="/dashboard" className="w-full py-4 bg-primary text-slate-900 font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                      Entrar no Dashboard <span className="material-symbols-outlined text-lg">login</span>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add New Card */}
            <motion.div
              layout
              whileHover={{ scale: 1.02 }}
              onClick={() => openModal()}
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary/40 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer min-h-[350px]"
            >
              <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:rotate-90 transition-transform">
                <span className="material-symbols-outlined text-3xl text-primary font-bold">add</span>
              </div>
              <p className="text-slate-900 dark:text-white font-black text-xl">Nova Residência</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center mt-2 px-4 italic">Cadastre um novo imóvel para começar a gerenciar.</p>
            </motion.div>
          </div>
        </div>
      </main>

      <footer className="px-6 lg:px-20 py-8 text-center bg-slate-50 dark:bg-slate-900/50">
        <p className="text-slate-400 text-sm font-medium">© 2024 HomeManager PRO. Luxo e eficiência na sua palma.</p>
      </footer>

      {/* Modern Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    {editingResidence ? 'Editar Residência' : 'Cadastrar Residência'}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Apelido do Imóvel</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">home</span>
                      <input
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="Ex: Casa de Campo"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Endereço (Auto-complete)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">pin_drop</span>
                      <input
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="Digite o endereço..."
                        value={formData.address}
                        onChange={handleAddressChange}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      />
                      {showSuggestions && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-10 overflow-hidden animate-in fade-in slide-in-from-top-2">
                          {addressSuggestions.map((s, i) => (
                            <button
                              key={i}
                              className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors text-sm flex items-center gap-2"
                              onClick={() => {
                                setFormData({ ...formData, address: s });
                                setShowSuggestions(false);
                              }}
                            >
                              <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-tighter">URL da Imagem</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">image</span>
                      <input
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="https://..."
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      />
                    </div>
                  </div>

                  {formData.image && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-center">
                      <p className="text-xs text-slate-400 mb-2">Pré-visualização:</p>
                      <div className="w-full h-32 rounded-xl bg-cover bg-center border border-slate-200 dark:border-slate-800" style={{ backgroundImage: `url(${formData.image})` }} />
                    </motion.div>
                  )}
                </div>

                <div className="mt-10 flex gap-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:brightness-95 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-4 rounded-xl font-bold bg-primary text-slate-900 shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    Salvar Residência
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
