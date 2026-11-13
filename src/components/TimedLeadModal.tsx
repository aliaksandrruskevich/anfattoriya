"use client";
'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, ShieldCheck, TrendingUp, CheckCircle, PhoneCall, Clock } from 'lucide-react';

interface TimedLeadModalProps {
  onAddLead: (name: string, phone: string, extra: string, source: string) => void;
}

export default function TimedLeadModal({ onAddLead }: TimedLeadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [propertyType, setPropertyType] = useState('1-комнатная квартира');
  const [district, setDistrict] = useState('');

  useEffect(() => {
    // Check if already shown in this session
    const hasShown = sessionStorage.getItem('fp_timed_lead_shown');
    if (hasShown) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem('fp_timed_lead_shown', 'true');
    }, 40000); // 40 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    const extra = `Тип: ${propertyType}${district ? `, Район: ${district}` : ''}`;
    onAddLead(name.trim() || 'Посетитель сайта', phone.trim(), extra, 'Всплывающее окно 40 сек (Выгодная продажа)');
    setIsSubmitted(true);

    setTimeout(() => {
      setIsSubmitted(false);
      setIsOpen(false);
    }, 3500);
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div 
        className="relative w-full max-w-[380px] max-h-[85vh] flex flex-col bg-neutral-950 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-white mx-2"
        style={{
          boxShadow: '0 20px 50px -10px rgba(217, 119, 6, 0.3), 0 0 30px rgba(0, 0, 0, 0.9)'
        }}
      >
        {/* Subtle decorative top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 shrink-0"></div>

        {/* Large, High-Contrast Close Button */}
        <button
          onClick={handleClose}
          type="button"
          className="absolute top-2 right-2 z-30 w-9 h-9 flex items-center justify-center rounded-full bg-stone-800/90 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-600/80 shadow-lg active:scale-95 transition-all cursor-pointer"
          title="Закрыть окно"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {isSubmitted ? (
          <div className="p-6 sm:p-8 text-center flex flex-col items-center justify-center animate-fade-in space-y-3">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1 border border-amber-500/40">
              <CheckCircle className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Raleway, sans-serif' }}>
              Заявка принята!
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-xs">
              Эксперт свяжется с вами в течение <span className="text-amber-400 font-semibold">10 минут</span> для согласования оценки и покупателей.
            </p>
            <button
              onClick={handleClose}
              className="mt-3 px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-stone-200 text-xs font-bold transition-all cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        ) : (
          <div className="p-5 sm:p-6 overflow-y-auto">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3 fill-amber-400" />
              <span>Экспресс-оценка</span>
            </div>

            {/* Title */}
            <h2 
              className="text-lg sm:text-xl font-extrabold text-white mb-1.5 pr-8 leading-snug" 
              style={{ fontFamily: 'Raleway, sans-serif' }}
            >
              Хотите выгодно продать квартиру в Минске?
            </h2>
            <p className="text-stone-300 text-xs mb-3.5 leading-relaxed">
              Узнайте реальную стоимость по базе БРТИ и получите покупателей агентства уже на этой неделе.
            </p>

            {/* Key Benefits (Compact) */}
            <div className="grid grid-cols-3 gap-1.5 mb-3.5 text-[10px]">
              <div className="bg-white/5 border border-white/10 rounded-lg p-1.5 flex flex-col items-center text-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-stone-300 font-medium leading-tight">Оценка 0 BYN</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-1.5 flex flex-col items-center text-center gap-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-stone-300 font-medium leading-tight">10 дней тест</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-1.5 flex flex-col items-center text-center gap-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-stone-300 font-medium leading-tight">Страховка</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5">
              <div>
                <label htmlFor="timed-lead-phone" className="block text-[10px] font-bold uppercase text-stone-400 tracking-wider mb-1">
                  Телефон <span className="text-amber-400">*</span>
                </label>
                <input
                  id="timed-lead-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+375 (29) 000-00-00"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 focus:border-amber-500 rounded-xl text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="timed-lead-name" className="block text-[10px] font-bold uppercase text-stone-400 tracking-wider mb-1">
                    Имя
                  </label>
                  <input
                    id="timed-lead-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ваше имя"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 focus:border-amber-500 rounded-xl text-white placeholder-stone-500 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="timed-lead-type" className="block text-[10px] font-bold uppercase text-stone-400 tracking-wider mb-1">
                    Объект
                  </label>
                  <select
                    id="timed-lead-type"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-2.5 py-2 bg-neutral-900 border border-neutral-700 focus:border-amber-500 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  >
                    <option value="1-комнатная квартира" className="bg-neutral-900">1к квартира</option>
                    <option value="2-комнатная квартира" className="bg-neutral-900">2к квартира</option>
                    <option value="3-комнатная квартира" className="bg-neutral-900">3к квартира</option>
                    <option value="4+ комнатная / дом" className="bg-neutral-900">4+ / Дом</option>
                    <option value="Коммерческое" className="bg-neutral-900">Коммерческое</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-1.5 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-md shadow-amber-500/25 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Получить оценку бесплатно</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full text-center text-[11px] text-stone-400 hover:text-stone-200 transition-colors py-1 cursor-pointer"
              >
                Нет, спасибо, я просто смотрю
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
