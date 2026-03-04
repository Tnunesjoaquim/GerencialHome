'use client';

import { Header } from '@/components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface Role {
  id: string;
  name: string;
  color: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  email?: string; // We might not have email directly in profiles unless we join auth.users or store it
  houses: string[];
  roles: Role[];
  initials: string;
}

export default function Usuarios() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    houses: '',
    selectedRoles: [] as string[]
  });

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const fetchUsersAndRoles = async () => {
    setLoading(true);
    // Fetch Roles
    const { data: rolesData } = await supabase.from('roles').select('*');
    if (rolesData) setAvailableRoles(rolesData);

    // Fetch Profiles with their assigned roles 
    // Note: Since auth.users is protected, we display what we have in profiles
    const { data: profilesData } = await supabase
      .from('user_profiles')
      .select(`
        id,
        full_name,
        houses,
        user_roles (
          role_id,
          roles ( id, name, color )
        )
      `);

    if (profilesData) {
      const formattedUsers: UserProfile[] = profilesData.map((p: any) => {
        const userRoles = p.user_roles?.map((ur: any) => ur.roles).filter(Boolean) || [];
        return {
          id: p.id,
          full_name: p.full_name,
          email: 'usuario@auth.local', // Placeholder as auth.users is not exposed by default
          houses: p.houses || [],
          roles: userRoles,
          initials: getInitials(p.full_name)
        };
      });
      setUsers(formattedUsers);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, [supabase]);

  const openEdit = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      houses: user.houses.join(', '),
      selectedRoles: user.roles.map(r => r.id),
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.full_name) return;

    const parsedHouses = formData.houses.split(',').map(h => h.trim()).filter(Boolean);

    if (editingUser) {
      // 1. Update Profile
      await supabase.from('user_profiles').update({
        full_name: formData.full_name,
        houses: parsedHouses
      }).eq('id', editingUser.id);

      // 2. Update Roles (Delete all current, then insert new)
      await supabase.from('user_roles').delete().eq('user_id', editingUser.id);

      if (formData.selectedRoles.length > 0) {
        const newRoles = formData.selectedRoles.map(rId => ({
          user_id: editingUser.id,
          role_id: rId
        }));
        await supabase.from('user_roles').insert(newRoles);
      }
    } else {
      // Create new invite logic would go here. For now, we only edit existing profiles.
      alert("Para criar um novo colaborador, ele deve se cadastrar via tela de Login primeiro. Convites em breve.");
    }

    setIsModalOpen(false);
    setEditingUser(null);
    fetchUsersAndRoles();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover as permissões deste usuário? Isso excluirá o perfil dele.')) {
      await supabase.from('user_profiles').delete().eq('id', id);
      fetchUsersAndRoles();
    }
  };

  const toggleRoleSelection = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(roleId)
        ? prev.selectedRoles.filter(id => id !== roleId)
        : [...prev.selectedRoles, roleId]
    }));
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden transition-colors duration-300">
      <Header activeTab="usuarios" />
      <main className="flex-1 flex flex-col p-4 md:p-10 mx-auto w-full max-w-[1400px] gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">Gestão de Usuários</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">Administre permissões e fluxos de trabalho da equipe centralizada (Estilo Discord).</p>
          </div>
          <button
            onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-3 rounded-2xl h-14 px-8 bg-primary text-slate-900 text-sm font-black hover:brightness-110 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest active:scale-95 whitespace-nowrap"
          >
            <span className="material-symbols-outlined font-black">person_add</span>
            <span>Novo Colaborador</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Equipe</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{loading ? '-' : users.length}</p>
            </div>
          </motion.div>

          {availableRoles.slice(0, 2).map((role, i) => (
            <motion.div key={role.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * (i + 1) }} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Membros: {role.name}</p>
                <p className="text-3xl font-black tracking-tight" style={{ color: role.color }}>
                  {loading ? '-' : users.filter(u => u.roles.some(r => r.id === role.id)).length}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-x-auto scrollbar-thin mt-4">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Colaborador</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Cargos (Roles)</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Casas Vinculadas</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-400 border border-slate-200 dark:border-slate-700">{user.initials}</div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tight block">{user.full_name}</span>
                        <span className="text-[10px] text-slate-400">{user.id.substring(0, 8)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-2">
                      {user.roles.length > 0 ? user.roles.map(r => (
                        <span key={r.id} style={{ borderColor: r.color, color: r.color, backgroundColor: `${r.color}15` }} className="px-3 py-1 rounded border text-[10px] font-black uppercase tracking-widest">
                          {r.name}
                        </span>
                      )) : <span className="text-xs italic text-slate-400">Sem Cargo</span>}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-slate-500 dark:text-slate-400 font-bold text-xs">{user.houses.join(', ') || 'Nenhuma'}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => openEdit(user)} className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary transition-colors shadow-sm" title="Editar">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors shadow-sm" title="Excluir">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !loading && (
            <div className="p-10 text-center text-slate-500 dark:text-slate-400 font-bold">Nenhum colaborador carregado do banco de dados.</div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex flex-col items-center text-center mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{editingUser ? 'Ajustar Perfil e Cargos' : 'Novo Colaborador'}</h2>
                <p className="text-slate-400 text-sm font-bold mt-2">Gerencie permissões no formato Discord.</p>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome Completo</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full h-14 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Atribuir Cargos (Roles)</label>
                  <div className="flex flex-wrap gap-2 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    {availableRoles.map(role => {
                      const isSelected = formData.selectedRoles.includes(role.id);
                      return (
                        <button
                          key={role.id}
                          onClick={() => toggleRoleSelection(role.id)}
                          style={{
                            borderColor: role.color,
                            backgroundColor: isSelected ? role.color : 'transparent',
                            color: isSelected ? '#fff' : role.color
                          }}
                          className={`px-3 py-1.5 rounded-lg border-2 text-xs font-black uppercase tracking-widest transition-all ${isSelected ? 'shadow-md scale-105' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                        >
                          {role.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Casas Vinculadas (Separadas por vírgula)</label>
                  <input
                    type="text"
                    value={formData.houses}
                    onChange={(e) => setFormData({ ...formData, houses: e.target.value })}
                    className="w-full h-14 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <button onClick={handleSave} className="w-full h-14 bg-primary text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-xl">Salvar</button>
                <button onClick={() => setIsModalOpen(false)} className="w-full h-14 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Cancelar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
