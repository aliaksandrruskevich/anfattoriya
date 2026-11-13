"use client";
import React, { useState } from 'react';
import { Calendar, Clock, MapPin, X, CheckCircle, AlertCircle } from 'lucide-react';
import { createMeetingEvent } from '../lib/googleCalendar';
import { getCachedToken } from '../lib/firebase';
import { Lead } from '../types';

interface ScheduleMeetingModalProps {
  lead?: Lead | null;
  onClose: () => void;
  onSuccess: (eventLink: string) => void;
}

export default function ScheduleMeetingModal({ lead, onClose, onSuccess }: ScheduleMeetingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [summary, setSummary] = useState(lead ? `Показ объекта: ${lead.name}` : 'Новая встреча / показ');
  const [description, setDescription] = useState(lead ? `Встреча с клиентом ${lead.name} (${lead.phone})\nОбъект: ${lead.typeOrPrice || ''}` : '');
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [duration, setDuration] = useState(60);
  const [location, setLocation] = useState(lead?.typeOrPrice || '');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getCachedToken();
    if (!token) {
      setError('Необходимо войти через Google в разделе "Календарь"');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const event = await createMeetingEvent(token, {
        summary,
        description,
        startTime,
        durationMinutes: duration,
        location
      });
      onSuccess(event.id);
    } catch (err: any) {
      setError(err.message || 'Ошибка при создании встречи');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-stone-200">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 text-neutral-950 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-neutral-900 tracking-tight">Запланировать встречу</h3>
              <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Синхронизация с Google Календарем</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Название события</label>
            <input 
              type="text" 
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-neutral-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
              placeholder="Напр: Показ квартиры на Победителей"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Дата и время</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-stone-400 pointer-events-none" />
                <input 
                  type="datetime-local" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-neutral-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Длительность (мин)</label>
              <select 
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-neutral-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all cursor-pointer"
              >
                <option value={15}>15 минут</option>
                <option value={30}>30 минут</option>
                <option value={45}>45 минут</option>
                <option value={60}>1 час</option>
                <option value={90}>1.5 часа</option>
                <option value={120}>2 часа</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Место проведения</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-stone-400 pointer-events-none" />
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-neutral-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                placeholder="Адрес или ссылка на карту"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Описание / Заметки</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-neutral-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all resize-none"
              placeholder="Дополнительная информация для календаря..."
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-[11px] font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-stone-200 text-stone-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-stone-50 transition-all"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-neutral-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Подтвердить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
