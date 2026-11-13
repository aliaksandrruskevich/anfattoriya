"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, RefreshCcw, LogIn, Plus } from 'lucide-react';
import { fetchUpcomingEvents, CalendarEvent } from '../lib/googleCalendar';
import { googleSignIn, getCachedToken } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import ScheduleMeetingModal from './ScheduleMeetingModal';

export default function CalendarTab() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(getCachedToken());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadEvents = async (accessToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUpcomingEvents(accessToken);
      setEvents(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const activeToken = getCachedToken();
    if (activeToken) {
      setToken(activeToken);
      loadEvents(activeToken);
    }
  }, []);

  const handleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        loadEvents(result.accessToken);
      }
    } catch (err: any) {
      setError('Не удалось авторизоваться в Google');
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] space-y-6 text-center">
        <div className="p-4 bg-purple-50 rounded-full">
          <Calendar className="w-12 h-12 text-purple-600" />
        </div>
        <div className="max-w-md">
          <h3 className="text-xl font-black text-neutral-900 mb-2">Синхронизация с Календарем</h3>
          <p className="text-sm text-stone-500 font-medium">
            Подключите свой Google Календарь, чтобы видеть расписание встреч, показов и звонков прямо в CRM.
          </p>
        </div>
        <button
          onClick={handleSignIn}
          className="flex items-center gap-3 px-8 py-4 bg-neutral-950 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-neutral-800 transition-all shadow-xl shadow-black/10"
        >
          <LogIn className="w-4 h-4" />
          Войти через Google
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-neutral-900 tracking-tight">Расписание и Встречи</h2>
          <p className="text-xs text-stone-500 font-medium">Ваши события из Google Календаря</p>
        </div>
        <div className="flex gap-2">
           <button
            onClick={() => loadEvents(token)}
            disabled={loading}
            className="p-2.5 bg-white border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-500 text-neutral-950 rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-purple-600 transition-all shadow-lg shadow-purple-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Создать событие
          </button>
        </div>
      </div>

      {isCreateModalOpen && (
        <ScheduleMeetingModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            if (token) {
              loadEvents(token);
            }
          }}
        />
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {events.map((event, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              key={event.id}
              className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-stone-100 rounded-xl text-stone-600 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-black text-stone-400 bg-stone-100 px-2 py-0.5 rounded uppercase">
                  {new Date(event.start.dateTime).toLocaleDateString('ru-RU')}
                </span>
              </div>

              <h4 className="text-sm font-black text-neutral-900 mb-2 line-clamp-2">{event.summary}</h4>
              
              <div className="space-y-2 mt-4 pt-4 border-t border-stone-100">
                <div className="flex items-center gap-2 text-[11px] text-stone-500 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(event.start.dateTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} 
                  {' — '}
                  {new Date(event.end.dateTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 font-bold">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!loading && events.length === 0 && (
          <div className="col-span-full py-12 text-center bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
            <p className="text-stone-400 font-black uppercase text-[10px] tracking-[0.2em]">Нет запланированных событий</p>
          </div>
        )}
      </div>
    </div>
  );
}
