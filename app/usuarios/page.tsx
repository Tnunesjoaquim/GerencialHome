'use client';

import { Header } from '@/components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getSelectedResidenceObj } from '../dashboard/actions';
import { createStaffAccount, removeUserFromResidence } from './actions';

interface Role {
  id: string;
  name: string;
  color: string;
}

// We map Discord-like roles visually
const RESIDENCE_ROLES = [
  { id: 'Admin', name: 'Administrador', color: '#16a34a' },
  { id: 'Staff', name: 'Membro (Staff)', color: '#3b82f6' }
];

interface UserProfile {
  id: string;
  full_name: string;
  nickname?: string;
  avatar_url?: string;
  email?: string; // We might not have email directly in profiles unless we join auth.users or store it
  roles: Role[];
  roleName: string; // Add roleName explicitly since it's now 1 role per residence
  initials: string;
  isPending?: boolean;
  inviteId?: string;
}

export default function Usuarios() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [residenceId, setResidenceId] = useState<string | null>(null);
  const [residenceOwnerId, setResidenceOwnerId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const supabase = createClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const [ownedResidences, setOwnedResidences] = useState<{id: string, name: string}[]>([]);
  const [formData, setFormData] = useState({
    full_name: '',
    nickname: '',
    email: '',
    password: '',
    role: 'Staff',
    residence_ids: [] as string[]
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const fetchUsersAndRoles = async () => {
    setLoading(true);

    const res = await getSelectedResidenceObj();
    if (!res?.id) return;
    setResidenceId(res.id);

    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData.user?.id;

    // 1. Fetch residence details to know the owner
    const { data: residenceInfo } = await supabase.from('residences').select('owner_id').eq('id', res.id).single();
    if (residenceInfo) {
      setResidenceOwnerId(residenceInfo.owner_id);
      setIsOwner(residenceInfo.owner_id === currentUserId);
    }

    // 2. Fetch the owner profile and their residences
    const { data: ownerProfile } = await supabase.from('user_profiles').select('*').eq('id', residenceInfo?.owner_id).single();

    const { data: myResidences } = await supabase.from('residences').select('id, name').eq('owner_id', currentUserId);
    if (myResidences) setOwnedResidences(myResidences);

    // 3. Fetch residence members and their profiles
    const { data: membersData } = await supabase
      .from('residence_members')
      .select(`
        role,
        user_profiles:user_id (*)
      `)
      .eq('residence_id', res.id);

    // Combine them
    const formattedUsers: UserProfile[] = [];

    if (ownerProfile) {
      formattedUsers.push({
        id: ownerProfile.id,
        full_name: ownerProfile.full_name,
        nickname: ownerProfile.nickname,
        avatar_url: ownerProfile.avatar_url,
        email: ownerProfile.email || 'Proprietário',
        roles: [{ id: 'Owner', name: 'Dono (Owner)', color: '#9333ea' }],
        roleName: 'Owner',
        initials: getInitials(ownerProfile.full_name)
      });
    }

    if (membersData) {
      membersData.forEach((m: any) => {
        const p = m.user_profiles;
        if (!p) return;

        const roleObj = RESIDENCE_ROLES.find(r => r.id === m.role) || { id: m.role, name: m.role, color: 'bg-slate-100 text-slate-700' };

        formattedUsers.push({
          id: p.id,
          full_name: p.full_name,
          nickname: p.nickname,
          avatar_url: p.avatar_url,
          email: p.email || 'Membro',
          roles: [roleObj],
          roleName: m.role,
          initials: getInitials(p.full_name)
        });
      });
    }

    // 4. Fetch pending invites
    const { data: invitesData } = await supabase
      .from('residence_invites')
      .select('*')
      .eq('residence_id', res.id);

    if (invitesData) {
      invitesData.forEach((invite: any) => {
        const roleObj = RESIDENCE_ROLES.find(r => r.id === invite.role) || { id: invite.role, name: invite.role, color: 'bg-slate-100 text-slate-700' };

        formattedUsers.push({
          id: invite.id, // we use the invite ID as the list key
          full_name: invite.email, // Display email as name for pending invites
          email: invite.email,
          roles: [roleObj],
          roleName: invite.role,
          initials: getInitials(invite.email),
          isPending: true,
          inviteId: invite.id
        });
      });
    }

    setUsers(formattedUsers.sort((a, b) => a.full_name.localeCompare(b.full_name)));
    setLoading(false);
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, [supabase]);

  const openEdit = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      nickname: user.nickname || '',
      email: '', // Don't allow editing email here yet
      password: '',
      role: user.roleName === 'Owner' ? 'Owner' : user.roleName,
      residence_ids: residenceId ? [residenceId] : []
    });
    setAvatarFile(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (editingUser && !editingUser.isPending && !formData.full_name) return;
    setIsUploading(true);

    if (editingUser) {
      // 1. Client-side Avatar Upload
      let uploadedAvatarUrl = editingUser.avatar_url;

      if (avatarFile) {
        const { data: authData } = await supabase.auth.getUser();
        const currentUserId = authData.user?.id;

        if (currentUserId) {
          const fileExt = avatarFile.name.split('.').pop();
          const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, avatarFile, { upsert: true });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);
            uploadedAvatarUrl = publicUrl;
          }
        }
      }

      // 2. Update Profile
      await supabase.from('user_profiles').update({
        full_name: formData.full_name,
        nickname: formData.nickname,
        avatar_url: uploadedAvatarUrl
      }).eq('id', editingUser.id);

      // 3. Update Role (Only if it's not the owner and role changed)
      if (editingUser.roleName !== 'Owner' && formData.role !== 'Owner') {
        await supabase.from('residence_members').update({ role: formData.role }).match({ residence_id: residenceId, user_id: editingUser.id });
      }
    } else {
      // Direct User Creation via Admin Server Action
      if (!formData.email || !formData.password || !formData.full_name) {
        alert("Preencha Nome Completo, E-mail e Senha para adicionar um colaborador.");
        setIsUploading(false);
        return;
      }

      const serverFormData = new FormData();
      serverFormData.append('full_name', formData.full_name);
      serverFormData.append('email', formData.email.toLowerCase().trim());
      serverFormData.append('password', formData.password);
      serverFormData.append('role', formData.role);
      serverFormData.append('residence_ids', JSON.stringify(formData.residence_ids.length > 0 ? formData.residence_ids : [residenceId]));
      if (avatarFile) {
        serverFormData.append('avatar', avatarFile);
      }

      try {
        const result = await createStaffAccount(serverFormData);

        if (result?.error) {
          alert("Erro ao criar usuário: " + result.error);
          setIsUploading(false);
          return;
        } else {
          if (result?.userExisted) {
              alert("Este e-mail já estava registrado no sistema. O usuário foi adicionado à residência com sucesso!");
          } else {
              alert("Usuário criado com sucesso e já possui acesso à residência!");
          }
        }
      } catch (err: any) {
        alert("Ocorreu um erro no servidor (provavelmente falta de variável de ambiente no Vercel). Detalhes: " + err.message);
        setIsUploading(false);
        return;
      }
    }

    setIsUploading(false);
    setIsModalOpen(false);
    setEditingUser(null);
    fetchUsersAndRoles();
  };

  const handleDelete = async (id: string, isPending?: boolean, inviteId?: string) => {
    if (confirm(isPending ? 'Tem certeza que deseja cancelar este convite?' : 'Tem certeza que deseja remover este usuário da residência?')) {
      if (isPending && inviteId) {
        await supabase.from('residence_invites').delete().eq('id', inviteId);
      } else {
        const res = await removeUserFromResidence(id, residenceId!);
        if (res?.error) {
          alert("Erro ao remover: " + res.error);
        }
      }
      fetchUsersAndRoles();
    }
  };

  const toggleRoleSelection = (roleId: string) => {
    // Only 'Admin' and 'Staff' allowed to be manually selected
    setFormData({
      ...formData,
      role: roleId
    });
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden transition-colors duration-300">
      <Header activeTab="usuarios" />
      <main className="flex-1 flex flex-col p-4 md:p-10 mx-auto w-full max-w-[1400px] gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">Gestão de Usuários</h1>
            <p className="text-slate-500 dark:text-zinc-400 text-sm md:text-base">Administre permissões e fluxos de trabalho da equipe centralizada (Estilo Discord).</p>
          </div>
          <button
            onClick={() => { 
                setEditingUser(null); 
                setFormData({
                    full_name: '',
                    nickname: '',
                    email: '',
                    password: '',
                    role: 'Staff',
                    residence_ids: residenceId ? [residenceId] : []
                });
                setIsModalOpen(true); 
            }}
            className="flex items-center justify-center gap-3 rounded-2xl h-14 px-8 bg-primary text-slate-900 text-sm font-black hover:brightness-110 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest active:scale-95 whitespace-nowrap"
          >
            <span className="material-symbols-outlined font-black">person_add</span>
            <span>Novo Colaborador</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Equipe</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{loading ? '-' : users.length}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Membros: Administrador</p>
              <p className="text-3xl font-black tracking-tight text-[#16a34a]">
                {loading ? '-' : users.filter(u => u.roleName === 'Owner' || u.roleName === 'Admin').length}
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Membros: Membro (Staff)</p>
              <p className="text-3xl font-black tracking-tight text-[#3b82f6]">
                {loading ? '-' : users.filter(u => u.roleName === 'Staff').length}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-x-auto scrollbar-thin mt-4">
          {/* Desktop Table (Hidden on Mobile) */}
          <table className="hidden md:table w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-800/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Colaborador</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Cargos (Roles)</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:-zinc-/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      {user.avatar_url ? (
                        <div className="size-10 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm">
                          <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="size-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-black text-xs text-slate-400 border border-slate-200 dark:border-zinc-700">{user.initials}</div>
                      )}
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tight block flex items-center gap-2">
                          {user.full_name}
                          {user.isPending && (
                            <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-200 dark:border-orange-800/50">
                              Pendente
                            </span>
                          )}
                        </span>
                        {user.nickname ? (
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold">@{user.nickname}</span>
                        ) : (
                          <span className="text-[10px] text-slate-400 block">{user.isPending ? user.email : user.id.substring(0, 8)}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-2">
                      {user.roles.length > 0 ? user.roles.map(r => (
                        <span key={r.id} style={{ borderColor: r.color, color: r.color, backgroundColor: `${r.color}15` }} className="px-3 py-1.5 rounded border text-[10px] font-black uppercase tracking-widest">
                          {r.name}
                        </span>
                      )) : <span className="text-xs italic text-slate-400">Sem Cargo</span>}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-3">
                      {true && !user.isPending && (
                        <button onClick={() => openEdit(user)} className="size-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 hover:text-primary transition-colors shadow-sm" title="Editar">
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                      )}
                      {true && user.roleName !== 'Owner' && (
                        <button onClick={() => handleDelete(user.id, user.isPending, user.inviteId)} className="size-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors shadow-sm" title={user.isPending ? "Cancelar Convite" : "Excluir"}>
                          <span className="material-symbols-outlined text-[16px]">{user.isPending ? 'cancel' : 'delete'}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Cards (Hidden on Desktop) */}
          <div className="md:hidden flex flex-col divide-y divide-slate-100 dark:divide-zinc-800">
            {users.map((user) => (
              <div key={user.id} className="flex flex-col gap-4 p-5 hover:bg-slate-50/50 dark:-zinc-/30 transition-colors">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  {user.avatar_url ? (
                    <div className="size-12 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm shrink-0">
                      <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="size-12 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-black text-sm text-slate-400 border border-slate-200 dark:border-zinc-700 shrink-0">{user.initials}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2 flex-wrap">
                      <span className="truncate">{user.full_name}</span>
                      {user.isPending && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-200 dark:border-orange-800/50">
                          Pendente
                        </span>
                      )}
                    </span>
                    {user.nickname ? (
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold truncate">@{user.nickname}</span>
                    ) : (
                      <span className="text-[10px] text-slate-400 block truncate">{user.isPending ? user.email : user.id.substring(0, 8)}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {user.roles.length > 0 ? user.roles.map(r => (
                    <span key={r.id} style={{ borderColor: r.color, color: r.color, backgroundColor: `${r.color}15` }} className="px-3 py-1 rounded border text-[10px] font-black uppercase tracking-widest">
                      {r.name}
                    </span>
                  )) : <span className="text-xs italic text-slate-400">Sem Cargo</span>}
                </div>

                <div className="flex justify-end gap-3 mt-1 pt-4 border-t border-slate-100 dark:border-zinc-800/50">
                  {true && !user.isPending && (
                    <button onClick={() => openEdit(user)} className="flex-1 h-10 px-4 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:text-primary transition-colors shadow-sm text-xs font-bold gap-2 uppercase tracking-widest" title="Editar">
                      <span className="material-symbols-outlined text-[16px]">edit</span> Editar
                    </button>
                  )}
                  {true && user.roleName !== 'Owner' && (
                    <button onClick={() => handleDelete(user.id, user.isPending, user.inviteId)} className="flex-1 h-10 px-4 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm text-xs font-bold gap-2 uppercase tracking-widest" title={user.isPending ? "Cancelar Convite" : "Excluir"}>
                      <span className="material-symbols-outlined text-[16px]">{user.isPending ? 'cancel' : 'delete'}</span> {user.isPending ? 'Cancelar' : 'Remover'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {users.length === 0 && !loading && (
            <div className="p-10 text-center text-slate-500 dark:text-zinc-400 font-bold">Nenhum colaborador carregado do banco de dados.</div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[32px] p-8 md:p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex flex-col items-center text-center mb-8 pb-6 border-b border-slate-100 dark:border-zinc-800">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{editingUser ? 'Ajustar Perfil e Cargos' : 'Novo Colaborador'}</h2>
                <p className="text-slate-400 text-sm font-bold mt-2">Gerencie permissões no formato Discord.</p>
              </div>

              <div className="flex flex-col gap-5 mt-6">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    {editingUser?.avatar_url || avatarFile ? (
                      <div
                        className="size-16 rounded-2xl bg-cover bg-center shadow-inner border border-slate-200 dark:border-zinc-700 shrink-0"
                        style={{ backgroundImage: `url(${avatarFile ? URL.createObjectURL(avatarFile) : editingUser?.avatar_url})` }}
                      />
                    ) : (
                      <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xl shrink-0 border border-primary/20">
                        {getInitials(formData.full_name || formData.email)}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 size-5 bg-green-500 border-2 border-white dark:border-zinc-800 rounded-full"></div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:-zinc- transition-colors px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300">
                      Alterar Imagem
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setAvatarFile(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome Completo</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full h-14 bg-slate-50 dark:bg-zinc-800 border-2 border-slate-100 dark:border-zinc-700 rounded-2xl px-5 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {editingUser && !editingUser.isPending ? (
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Apelido (Nickname)</label>
                    <input
                      type="text"
                      placeholder="@seunick"
                      value={formData.nickname}
                      onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                      className="w-full h-14 bg-slate-50 dark:bg-zinc-800 border-2 border-slate-100 dark:border-zinc-700 rounded-2xl px-5 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail de Acesso</label>
                      <input
                        type="email"
                        placeholder="email@exemplo.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full h-14 bg-slate-50 dark:bg-zinc-800 border-2 border-slate-100 dark:border-zinc-700 rounded-2xl px-5 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Senha de Acesso</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Defina uma senha"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full h-14 bg-slate-50 dark:bg-zinc-800 border-2 border-slate-100 dark:border-zinc-700 rounded-2xl px-5 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700"
                        >
                          <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Atribuir Cargos (Roles)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {editingUser?.roleName === 'Owner' ? (
                      <div className="sm:col-span-2 p-4 rounded-xl border-2 border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex items-center gap-4 opacity-75">
                        <div className="size-10 rounded-full flex items-center justify-center font-black" style={{ backgroundColor: `#9333ea20`, color: '#9333ea' }}>
                          <span className="material-symbols-outlined">shield_person</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">Dono (Owner)</h4>
                          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">O cargo principal não pode ser alterado através desta tela.</p>
                        </div>
                      </div>
                    ) : (
                      RESIDENCE_ROLES.map((role) => {
                        const isSelected = formData.role === role.id;
                        return (
                          <div
                            key={role.id}
                            onClick={() => toggleRoleSelection(role.id)}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                              ? 'border-primary bg-primary/5 dark:bg-primary/10'
                              : 'border-slate-200 dark:border-zinc-800 hover:border-primary/50 bg-white dark:bg-zinc-900'
                              }`}
                          >
                            <div className="size-10 rounded-full flex items-center justify-center font-black" style={{ backgroundColor: `${role.color}20`, color: role.color }}>
                              <span className="material-symbols-outlined">{role.id === 'Admin' ? 'shield_person' : 'person'}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-bold ${isSelected ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{role.name}</h4>
                            </div>
                            <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-slate-300 dark:border-zinc-700'}`}>
                              {isSelected && <span className="material-symbols-outlined text-white text-sm font-black">check</span>}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {!editingUser && ownedResidences.length > 0 && (
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Atribuir às Residências</label>
                    <div className="flex flex-col gap-2">
                      {ownedResidences.map(res => (
                        <label key={res.id} className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 dark:border-zinc-700 hover:border-primary/50 cursor-pointer bg-slate-50 dark:bg-zinc-900 transition-colors">
                          <input
                            type="checkbox"
                            className="size-5 rounded border-slate-300 text-primary focus:ring-primary"
                            checked={formData.residence_ids.includes(res.id)}
                            onChange={(e) => {
                              const newIds = e.target.checked
                                ? [...formData.residence_ids, res.id]
                                : formData.residence_ids.filter(id => id !== res.id);
                              setFormData({ ...formData, residence_ids: newIds });
                            }}
                          />
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{res.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <button onClick={handleSave} disabled={isUploading} className="w-full h-14 bg-primary text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isUploading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    "Salvar"
                  )}
                </button>
                <button onClick={() => setIsModalOpen(false)} disabled={isUploading} className="w-full h-14 bg-slate-100 dark:bg-zinc-800 text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 dark:-zinc- transition-all disabled:opacity-50">Cancelar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
