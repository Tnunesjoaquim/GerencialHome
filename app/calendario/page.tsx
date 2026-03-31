'use client';

import { Header } from '@/components/Header';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSelectedResidenceObj } from '../dashboard/actions';
import { createClient } from '@/utils/supabase/client';

interface Event {
  id: string;
  title: string;
  time: string;
  period: 'AM' | 'PM';
  tag: string;
  location: string;
  team: string;
  color: string;
  tagColor: string;
  date: string; // YYYY-MM-DD
}

export default function Calendario() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [residence, setResidence] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    getSelectedResidenceObj().then(res => {
      setResidence(res);
      if (res?.id) fetchEvents(res.id);
    });
  }, []);

  const fetchEvents = async (rId: string) => {
    const { data: eventsData } = await supabase.from('calendar_events').select('*').eq('residence_id', rId);
    if (!eventsData) return;

    setEvents(eventsData.map((e: any) => ({
      id: e.id,
      title: e.title,
      time: e.time,
      period: e.period,
      tag: e.tag,
      location: e.location || '',
      team: e.team || '',
      color: e.color,
      tagColor: e.tag_color,
      date: e.date
    })));
  };

  const [newEvent, setNewEvent] = useState<Omit<Event, 'id' | 'color' | 'tagColor'>>({
    title: '',
    time: '09:00',
    period: 'AM',
    tag: 'Geral',
    location: '',
    team: '',
    date: ''
  });

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [currentDate]);

  const filteredEvents = events.filter(e => e.date === selectedDate);

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date || !residence?.id) return;

    if (editingEvent) {
      const { error } = await supabase.from('calendar_events').update({
        title: newEvent.title,
        time: newEvent.time,
        period: newEvent.period,
        tag: newEvent.tag,
        location: newEvent.location,
        team: newEvent.team,
        date: newEvent.date
      }).eq('id', editingEvent.id);

      if (!error) {
        setEvents(events.map(e => e.id === editingEvent.id ? { ...editingEvent, ...newEvent } : e));
      }
      setEditingEvent(null);
    } else {
      const colors = ['border-primary', 'border-blue-500', 'border-orange-500', 'border-purple-500'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const defaultTagColor = 'bg-slate-100 dark:bg-zinc-800 text-slate-500';

      const { data, error } = await supabase.from('calendar_events').insert([{
        residence_id: residence.id,
        title: newEvent.title,
        time: newEvent.time,
        period: newEvent.period,
        tag: newEvent.tag,
        location: newEvent.location,
        team: newEvent.team,
        color: randomColor,
        tag_color: defaultTagColor,
        date: newEvent.date
      }]).select().single();

      if (!error && data) {
        const eventToAdd: Event = {
          ...newEvent,
          id: data.id,
          color: randomColor,
          tagColor: defaultTagColor,
        };
        setEvents([...events, eventToAdd]);
      }
    }

    setIsModalOpen(false);
    setNewEvent({ title: '', time: '09:00', period: 'AM', tag: 'Geral', location: '', team: '', date: selectedDate });
  };

  const openEditEvent = (ev: Event) => {
    setEditingEvent(ev);
    setNewEvent({
      title: ev.title,
      time: ev.time,
      period: ev.period,
      tag: ev.tag,
      location: ev.location,
      team: ev.team,
      date: ev.date
    });
    setIsModalOpen(true);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  };

  const formatDateString = (day: number) => {
    const y = currentDate.getFullYear();
    const m = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      <Header activeTab="calendario" />
      <main className="flex-1 flex flex-col p-4 md:p-10 mx-auto w-full max-w-[1440px] gap-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Calendar Sidebar */}
          <div className="w-full lg:w-[400px] flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-slate-200 dark:border-zinc-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-8 px-2">
                <button
                  onClick={() => changeMonth(-1)}
                  className="size-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-zinc-800 hover:bg-primary/20 transition-all text-slate-400 hover:text-primary"
                >
                  <span className="material-symbols-outlined font-black">chevron_left</span>
                </button>
                <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                  {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => changeMonth(1)}
                  className="size-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-zinc-800 hover:bg-primary/20 transition-all text-slate-400 hover:text-primary"
                >
                  <span className="material-symbols-outlined font-black">chevron_right</span>
                </button>
              </div>

              <div className="grid grid-cols-7 text-center mb-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                  <span key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} className="h-12" />;
                  const dateStr = formatDateString(day);
                  const isSelected = selectedDate === dateStr;
                  const hasEvents = events.some(e => e.date === dateStr);

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`h-12 w-full rounded-2xl text-sm font-black transition-all flex flex-col items-center justify-center relative group ${isSelected
                        ? 'bg-primary text-slate-900 shadow-lg shadow-primary/20 scale-105 z-10'
                        : 'hover:bg-primary/10 text-slate-600 dark:text-zinc-400'
                        }`}
                    >
                      {day}
                      {hasEvents && !isSelected && (
                        <div className="size-1 bg-primary rounded-full absolute bottom-2" />
                      )}
                      {isSelected && (
                        <motion.div layoutId="activeDay" className="absolute inset-0 border-2 border-slate-900 dark:border-white rounded-2xl pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 dark:bg-white text-white dark:text-zinc-900 p-8 rounded-[32px] shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-[-20px] right-[-20px] size-32 bg-primary blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-500 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm font-black">auto_awesome</span> Quick Info
              </h4>
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold opacity-70">Total de Eventos</span>
                  <span className="text-2xl font-black text-primary">{events.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold opacity-70">Próximo Mês</span>
                  <span className="text-sm font-black uppercase">Planejamento</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setNewEvent({ title: '', time: '09:00', period: 'AM', tag: 'Geral', location: '', team: '', date: selectedDate });
                  setIsModalOpen(true);
                }}
                className="w-full h-14 bg-primary text-slate-900 rounded-2xl mt-8 font-black uppercase tracking-widest text-xs hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/10"
              >
                Novo Compromisso
              </button>
            </motion.div>
          </div>

          {/* Timeline Section */}
          <div className="flex-1 flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-black text-primary uppercase tracking-widest ml-1">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long' })}
                </p>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </h2>
              </div>
            </div>

            <div className="flex flex-col gap-6 min-h-[400px]">
              <AnimatePresence mode="popLayout">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((ev, i) => (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className={`group relative flex items-start gap-4 md:gap-8 bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-l-[12px] ${ev.color} border-t border-r border-b border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden`}
                    >
                      <div className="flex flex-col items-center min-w-[70px] pt-1 border-r border-slate-100 dark:border-zinc-800 pr-6">
                        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{ev.time}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ev.period}</span>
                      </div>
                      <div className="flex-1 pr-20 md:pr-28">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase group-hover:text-primary transition-colors">{ev.title}</h4>
                          <span className={`text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest ${ev.tagColor}`}>{ev.tag}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
                            <span className="material-symbols-outlined text-sm font-black text-primary">location_on</span>
                            <span>{ev.location || 'Local não definido'}</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
                            <span className="material-symbols-outlined text-sm font-black text-primary">group</span>
                            <span>{ev.team || 'Equipe Geral'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditEvent(ev); }}
                          className="size-10 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all shadow-lg relative z-20 pointer-events-auto"
                        >
                          <span className="material-symbols-outlined font-black text-sm">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEventToDelete(ev);
                          }}
                          className="size-10 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg relative z-20 pointer-events-auto"
                        >
                          <span className="material-symbols-outlined font-black text-sm">delete</span>
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col items-center justify-center text-center p-10 border-4 border-dashed border-slate-100 dark:border-zinc-800 rounded-[40px]"
                  >
                    <div className="size-24 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-300 mb-6">
                      <span className="material-symbols-outlined text-5xl">event_busy</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Folga no Calendário!</h3>
                    <p className="text-slate-400 font-bold italic">Nenhum compromisso agendado para este dia.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL: Novo Evento */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[40px] p-8 md:p-12 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl">{editingEvent ? 'edit_calendar' : 'calendar_add_on'}</span>
                </div>
                <h2 className="text-3xl font-black dark:text-white uppercase tracking-tight">{editingEvent ? 'Editar Evento' : 'Novo Evento'}</h2>
                <p className="text-slate-400 text-sm font-bold mt-1">Sincronize as atividades da casa.</p>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título do Evento</label>
                  <input
                    autoFocus
                    className="w-full h-14 px-6 rounded-2xl bg-slate-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold"
                    placeholder="O que vamos fazer?"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Horário</label>
                    <input
                      type="time"
                      className="w-full h-14 px-6 rounded-2xl bg-slate-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary dark:text-white font-black"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">AM / PM</label>
                    <select
                      className="w-full h-14 px-6 rounded-2xl bg-slate-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary dark:text-white font-black"
                      value={newEvent.period}
                      onChange={(e) => setNewEvent({ ...newEvent, period: e.target.value as any })}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Localização</label>
                  <input
                    className="w-full h-14 px-6 rounded-2xl bg-slate-100 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold"
                    placeholder="Ex: Sala A, Google Meet..."
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-12">
                <button
                  onClick={handleAddEvent}
                  className="w-full h-16 bg-primary text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  {editingEvent ? 'Atualizar Evento' : 'Agendar Evento'}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full h-14 text-slate-400 hover:text-slate-600 dark:-zinc- font-black uppercase tracking-widest text-xs transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* MODAL: Confirmar Exclusão */}
      <AnimatePresence>
        {eventToDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setEventToDelete(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="size-16 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-4xl">warning</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Excluir Evento</h3>
                <p className="text-slate-500 dark:text-zinc-400 font-bold mb-4">
                  Tem certeza que deseja excluir o evento <span className="text-slate-900 dark:text-white">"{eventToDelete.title}"</span>? Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-4 w-full">
                  <button
                    onClick={() => setEventToDelete(null)}
                    className="flex-1 h-12 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-black uppercase tracking-widest text-xs rounded-xl hover:brightness-95 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      const id = eventToDelete.id;
                      setEventToDelete(null);
                      const { error } = await supabase.from('calendar_events').delete().eq('id', id);
                      if (error) {
                        alert('Erro ao excluir o evento: ' + error.message);
                      } else {
                        setEvents(prev => prev.filter(item => item.id !== id));
                      }
                    }}
                    className="flex-1 h-12 bg-red-500 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                  >
                    Excluir
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
