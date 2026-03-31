'use client';

import { Header } from '@/components/Header';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSelectedResidenceObj } from '../dashboard/actions';
import { createClient } from '@/utils/supabase/client';
import { CategoryModal } from '@/components/modals/CategoryModal';
import { ItemModal, ItemData } from '@/components/modals/ItemModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';

interface Item {
  id: string;
  name: string;
  unit: string;
  minStock: number;
  currentStock: number;
  expiry: string;
  responsible: string;
  obs: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  items: Item[];
}

export default function Estoque() {
  const [userRole, setUserRole] = useState<'ADMIN' | 'STAFF'>('STAFF');
  const [userName, setUserName] = useState<string>('Equipe');
  const [categories, setCategories] = useState<Category[]>([]);
  const [residence, setResidence] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    getSelectedResidenceObj().then(res => {
      setResidence(res);
      if (res?.id) fetchInventory(res.id);
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('user_profiles').select('role, full_name').eq('id', user.id).single().then(({ data }) => {
          if (data?.role) setUserRole(data.role as 'ADMIN' | 'STAFF');
          if (data?.full_name) setUserName(data.full_name);
        });
      }
    });
  }, []);

  const fetchInventory = async (rId: string) => {
    const { data: cats } = await supabase.from('inventory_categories').select('*').eq('residence_id', rId);
    if (!cats) return;

    const { data: items } = await supabase.from('inventory_items').select('*').in('category_id', cats.map((c: any) => c.id));

    setCategories(cats.map((c: any) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      items: (items || []).filter((i: any) => i.category_id === c.id).map((i: any) => ({
        id: i.id,
        name: i.name,
        unit: i.unit,
        minStock: Number(i.min_stock),
        currentStock: Number(i.current_stock),
        expiry: i.expiry || '',
        responsible: i.responsible,
        obs: i.obs || ''
      }))
    })));
  };

  const [activeCategoryModal, setActiveCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeItemModal, setActiveItemModal] = useState<{ categoryId: string | null }>({ categoryId: null });
  const [editingItem, setEditingItem] = useState<{ categoryId: string, item: Item } | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ categoryId: string; itemId: string; itemName: string } | null>(null);

  const [newCatName, setNewCatName] = useState('');
  const [newItemData, setNewItemData] = useState<Omit<Item, 'id'>>({
    name: '', unit: 'Unidade', minStock: 0, currentStock: 0, expiry: '', responsible: '', obs: ''
  });

  const handleAddCategory = async (catName: string) => {
    if (!catName || !residence?.id) return;

    if (editingCategory) {
      const { error } = await supabase.from('inventory_categories').update({ name: catName }).eq('id', editingCategory.id);
      if (!error) {
        setCategories(categories.map(cat => cat.id === editingCategory.id ? { ...cat, name: catName } : cat));
      }
      setEditingCategory(null);
    } else {
      const { data, error } = await supabase.from('inventory_categories').insert([{
        residence_id: residence.id,
        name: catName,
        icon: 'inventory_2'
      }]).select().single();

      if (!error && data) {
        const newCat: Category = {
          id: data.id,
          name: data.name,
          icon: data.icon,
          items: []
        };
        setCategories([...categories, newCat]);
      }
    }
    setNewCatName('');
    setActiveCategoryModal(false);
  };

  const handleDeleteCategory = async (catId: string) => {
    if (userRole !== 'ADMIN') return alert('Apenas administradores podem excluir categorias.');
    if (confirm('Deseja excluir esta categoria e todos os seus itens?')) {
      const { error } = await supabase.from('inventory_categories').delete().eq('id', catId);
      if (!error) setCategories(categories.filter(cat => cat.id !== catId));
    }
  };

  const handleAddItem = async (itemData: ItemData) => {
    if (!activeItemModal.categoryId || !itemData.name) return;

    if (editingItem) {
      const { error } = await supabase.from('inventory_items').update({
        name: itemData.name,
        unit: itemData.unit,
        min_stock: itemData.minStock,
        current_stock: itemData.currentStock,
        expiry: itemData.expiry,
        responsible: itemData.responsible,
        obs: itemData.obs
      }).eq('id', editingItem.item.id);

      if (!error) {
        const updatedItem: Item = { ...itemData, id: editingItem.item.id };
        setCategories(categories.map(cat =>
          cat.id === activeItemModal.categoryId
            ? { ...cat, items: cat.items.map(i => i.id === editingItem.item.id ? updatedItem : i) }
            : cat
        ));
      }
      setEditingItem(null);
    } else {
      const { data, error } = await supabase.from('inventory_items').insert([{
        category_id: activeItemModal.categoryId,
        name: itemData.name,
        unit: itemData.unit,
        min_stock: itemData.minStock,
        current_stock: itemData.currentStock,
        expiry: itemData.expiry,
        responsible: itemData.responsible,
        obs: itemData.obs
      }]).select().single();

      if (!error && data) {
        const newItem: Item = { ...itemData, id: data.id };
        setCategories(categories.map(cat =>
          cat.id === activeItemModal.categoryId
            ? { ...cat, items: [...cat.items, newItem] }
            : cat
        ));
      }
    }
    setActiveItemModal({ categoryId: null });
  };

  const openEditItem = (categoryId: string, item: Item) => {
    setEditingItem({ categoryId, item });
    setNewItemData({
      name: item.name,
      unit: item.unit,
      minStock: item.minStock,
      currentStock: item.currentStock,
      expiry: item.expiry,
      responsible: item.responsible,
      obs: item.obs
    });
    setActiveItemModal({ categoryId });
  };

  const handleDeleteItem = async () => {
    if (!deleteConfirmModal) return;
    const { categoryId: catId, itemId } = deleteConfirmModal;
    
    const { data: deletedRows, error } = await supabase.from('inventory_items').delete().eq('id', itemId).select();
    
    if (error) {
      console.error('Erro na exclusão:', error);
      alert('Erro ao excluir item: ' + error.message);
    } else if (deletedRows && deletedRows.length === 0) {
      alert('Não foi possível excluir. O item pode já ter sido excluído ou você não tem permissão.');
    } else {
      setCategories(categories.map(cat =>
        cat.id === catId ? { ...cat, items: cat.items.filter(i => i.id !== itemId) } : cat
      ));
    }
    setDeleteConfirmModal(null);
  };

  const handleDecreaseStock = async (categoryId: string, item: Item) => {
    if (item.currentStock <= 0) return;
    
    const newStock = item.currentStock - 1;
    
    // Optistic UI update for immediate feedback
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, items: cat.items.map(i => i.id === item.id ? { ...i, currentStock: newStock } : i) }
        : cat
    ));

    const { error } = await supabase.from('inventory_items').update({
      current_stock: newStock
    }).eq('id', item.id);

    if (error) {
      // Revert on error
      setCategories(categories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, items: cat.items.map(i => i.id === item.id ? { ...i, currentStock: item.currentStock } : i) }
          : cat
      ));
      alert('Erro ao atualizar estoque: ' + error.message);
    }
  };

  const formatExpiry = (dateStr: string) => {
    if (!dateStr) return '--';
    if (dateStr.includes('/')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const parseExpiryForInput = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const isExpired = (dateStr: string) => {
    if (!dateStr) return false;
    let y, m, d;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) [d, m, y] = parts;
    } else {
      const parts = dateStr.split('-');
      if (parts.length === 3) [y, m, d] = parts;
    }
    if (!y || !m || !d) return false;
    const expiryDate = new Date(Number(y), Number(m) - 1, Number(d));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expiryDate < today;
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      <Header activeTab="estoque" />

      <main className="flex-1 flex flex-col px-4 md:px-10 py-6 max-w-[1440px] mx-auto w-full gap-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
              Gestão de Estoque
            </h1>
            <p className="text-slate-500 dark:text-zinc-400 text-sm md:text-base">
              Controle total de suprimentos e reposição estratégica.
            </p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <button
              onClick={() => setActiveCategoryModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl font-bold text-sm hover:border-primary border border-slate-200 dark:border-zinc-700 transition-all shadow-sm whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-primary">category</span>
              Nova Categoria
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-slate-900 rounded-xl font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20 whitespace-nowrap">
              <span className="material-symbols-outlined">bolt</span>
              Entrada Rápida
            </button>
          </div>
        </div>

        {/* Categories Loop */}
        <div className="flex flex-col gap-10">
          {categories.map((category) => (
            <motion.section
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">{category.icon}</span>
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-white uppercase">{category.name}</h2>
                  <span className="bg-slate-100 dark:bg-zinc-800 text-slate-500 text-[10px] px-2 py-1 rounded-full font-bold">
                    {category.items.length} ITENS
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  {userRole === 'ADMIN' && (
                    <>
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setNewCatName(category.name);
                          setActiveCategoryModal(true);
                        }}
                        className="flex justify-center items-center size-8 text-slate-400 hover:text-primary transition-colors"
                        title="Editar Categoria"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="flex justify-center items-center size-8 text-slate-400 hover:text-red-500 transition-colors"
                        title="Excluir Categoria"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setNewItemData({ name: '', unit: 'Unidade', minStock: 0, currentStock: 0, expiry: '', responsible: 'João Silva', obs: '' });
                      setActiveItemModal({ categoryId: category.id });
                    }}
                    className="flex items-center gap-1 text-primary text-xs font-black uppercase hover:underline ml-2"
                  >
                    <span className="material-symbols-outlined text-sm">add</span> Adicionar Item
                  </button>
                </div>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden flex flex-col gap-4 mt-4">
                {category.items.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest italic border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl">
                    Nenhum item cadastrado nesta categoria.
                  </div>
                ) : (
                  category.items.map((item) => (
                    <div key={item.id} className="p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col gap-4 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1 pr-4">
                          <span className="font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{item.name}</span>
                          {item.obs && <span className="text-[10px] text-slate-400 italic font-medium">{item.obs}</span>}
                        </div>
                        <div className="flex flex-col gap-1 items-end mt-1 shrink-0">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Mínimo</span>
                          <span className="font-black text-slate-700 dark:text-zinc-300 leading-none">{item.minStock} {item.unit}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-2 bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800">
                        <div className="flex flex-col gap-1 justify-center items-start">
                          <span className={`px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest text-center ${item.currentStock <= item.minStock
                            ? 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900'
                            : 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-900'
                            }`}>
                            Estoque: {item.currentStock} {item.unit}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 items-end justify-center">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Vencimento</span>
                          <span className={`font-bold text-sm ${isExpired(item.expiry) ? 'text-red-500 animate-pulse' : 'text-slate-600 dark:text-zinc-400'}`}>{formatExpiry(item.expiry)}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary ring-2 ring-white dark:ring-zinc-900 shadow-sm">
                            {item.responsible.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase truncate max-w-[100px]">{item.responsible}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleDecreaseStock(category.id, item)} 
                            disabled={item.currentStock <= 0}
                            className="size-10 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-500 hover:text-orange-600 transition-colors flex items-center justify-center border border-orange-100 dark:border-orange-900/30 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Consumir 1 unidade"
                          >
                            <span className="material-symbols-outlined text-lg">remove</span>
                          </button>
                          <button onClick={() => openEditItem(category.id, item)} className="size-10 rounded-xl bg-white dark:bg-zinc-800 text-slate-400 hover:text-primary transition-colors flex items-center justify-center border border-slate-200 dark:border-zinc-700 shadow-sm">
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirmModal({ categoryId: category.id, itemId: item.id, itemName: item.name })}
                            className="size-10 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-400 hover:text-red-600 transition-colors flex items-center justify-center border border-red-100 dark:border-red-900/30 shadow-sm"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Responsive Table Container */}
              <div className="hidden md:block overflow-x-auto rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl scrollbar-thin mt-6">
                <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-zinc-800/30 text-slate-500 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-widest">
                      <th className="px-6 py-4">Produto</th>
                      <th className="px-6 py-4">Unidade</th>
                      <th className="px-6 py-4">Mínimo</th>
                      <th className="px-6 py-4">Atual</th>
                      <th className="px-6 py-4">Vencimento</th>
                      <th className="px-6 py-4">Responsável</th>
                      <th className="px-6 py-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {category.items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-slate-400 italic">Nenhum item cadastrado nesta categoria.</td>
                      </tr>
                    ) : (
                      category.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:-zinc-/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{item.name}</span>
                              <span className="text-[10px] text-slate-400 italic">{item.obs}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-zinc-400 font-medium">{item.unit}</td>
                          <td className="px-6 py-4 font-bold text-slate-400">{item.minStock}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full font-black text-xs ${item.currentStock <= item.minStock
                              ? 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                              : 'bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400'
                              }`}>
                              {item.currentStock}
                            </span>
                          </td>
                          <td className={`px-6 py-4 font-medium ${isExpired(item.expiry) ? 'text-red-500 font-bold animate-pulse' : 'text-slate-600 dark:text-zinc-400'}`}>
                            {formatExpiry(item.expiry)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary ring-2 ring-white dark:ring-zinc-800">
                                {item.responsible.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="text-slate-600 dark:text-zinc-300 font-medium">{item.responsible}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handleDecreaseStock(category.id, item)} 
                                  disabled={item.currentStock <= 0}
                                  className="size-8 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-orange-500 hover:text-orange-600 transition-colors flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Consumir 1 unidade"
                                >
                                  <span className="material-symbols-outlined text-lg">remove</span>
                                </button>
                                <button onClick={() => openEditItem(category.id, item)} className="size-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-primary transition-colors flex items-center justify-center shadow-sm">
                                  <span className="material-symbols-outlined text-lg">edit</span>
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmModal({ categoryId: category.id, itemId: item.id, itemName: item.name })}
                                  className="size-8 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-400 hover:text-red-600 transition-colors flex items-center justify-center shadow-sm"
                                >
                                  <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.section>
          ))}
        </div>
      </main>

            {/* MODAL: Nova Categoria */}
      <AnimatePresence>
        {activeCategoryModal && (
          <CategoryModal 
            initialName={newCatName} 
            onClose={() => setActiveCategoryModal(false)}
            onSave={(name) => {
               setNewCatName(name);
               handleAddCategory(name);
            }} 
          />
        )}
      </AnimatePresence>

      {/* MODAL: Novo Item */}
      <AnimatePresence>
        {activeItemModal.categoryId && (
          <ItemModal
            isEditing={!!editingItem}
            initialData={editingItem ? {
              name: editingItem.item.name,
              unit: editingItem.item.unit,
              minStock: editingItem.item.minStock,
              currentStock: editingItem.item.currentStock,
              expiry: editingItem.item.expiry,
              responsible: editingItem.item.responsible,
              obs: editingItem.item.obs
            } : undefined}
            defaultResponsible={userName}
            onClose={() => setActiveItemModal({ categoryId: null })}
            onSave={(data) => handleAddItem(data)}
          />
        )}
      </AnimatePresence>

      {/* MODAL: Excluir Item */}
      <AnimatePresence>
        {deleteConfirmModal && (
          <DeleteConfirmModal
            itemName={deleteConfirmModal.itemName}
            onClose={() => setDeleteConfirmModal(null)}
            onConfirm={handleDeleteItem}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
