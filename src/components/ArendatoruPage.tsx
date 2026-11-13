'use client';

import React, { useState } from 'react';
import { PageId } from '../types';
import PageHero from './PageHero';
import { 
  Key, ShieldCheck, Search, CheckCircle2, 
  Clock, PhoneCall, ArrowRight, Building, FileCheck
} from 'lucide-react';
import { Reveal } from './DesignSystem';

interface ArendatoruPageProps {
  activePage: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
}

export default function ArendatoruPage({ activePage, navigateTo, handleAddLead }: ArendatoruPageProps) {
  const [propertyType, setPropertyType] = useState('1-комнатная квартира');
  const [budget, setBudget] = useState('до $350');
  const [district, setDistrict] = useState('Рядом с метро');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    handleAddLead(
      name.trim() || 'Арендатор',
      phone.trim(),
      `Заявка на аренду: ${propertyType}, бюджет ${budget}, район ${district}`,
      'Услуги арендатору'
    );
    setSubmitted(true);
  };

  return (
    <div className="space-y-12 animate-fade-in font-sans">
      <PageHero 
        activePage={activePage} 
        navigateTo={navigateTo} 
        handleAddLead={handleAddLead} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-6">
        
        {/* Banner */}
        <Reveal>
          <div className="bg-gradient-to-br from-neutral-900 via-stone-900 to-purple-950 text-white rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30">
                <Key className="w-4 h-4 text-purple-400" />
                Безопасная аренда в Минске
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Подбор и безопасная аренда квартир и помещений
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Поможем снять квартиру, коттедж или офис в любом районе Минска. Проверяем документы собственника, отсутствие скрытых арестов и долгов по ЖКХ, составляем официальный типовой договор найма с подробным актом описи мебели и техники.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10 text-stone-200">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">от 24 ч.</div>
                <div className="text-xs text-stone-400 mt-1">Срок подбора жилья</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">100%</div>
                <div className="text-xs text-stone-400 mt-1">Проверка прав собственности</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">Договор</div>
                <div className="text-xs text-stone-400 mt-1">Официальная регистрация в РСЦ</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">0 руб.</div>
                <div className="text-xs text-stone-400 mt-1">Оплата только по факту заселения</div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Lead Form */}
        <Reveal>
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xl space-y-8 max-w-3xl mx-auto">
            <div className="border-b border-stone-100 pb-4 text-center space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900">
                Заявка на подбор жилья в аренду
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">
                Подберем проверенные варианты без риска внезапного выселения или скрытых комиссий
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold">Заявка на аренду принята!</h4>
                <p className="text-xs text-emerald-700">
                  Агент по аренде свяжется с вами и предложит доступные варианты квартир.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">Тип объекта</label>
                    <select 
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                    >
                      <option value="1-комнатная квартира">1-комнатная квартира</option>
                      <option value="2-комнатная квартира">2-комнатная квартира</option>
                      <option value="3-комнатная квартира">3-комнатная квартира</option>
                      <option value="Комната / студия">Комната / студия</option>
                      <option value="Коммерческое помещение">Коммерческое помещение</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">Бюджет в месяц</label>
                    <select 
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                    >
                      <option value="до $250">до $250 (эконом)</option>
                      <option value="от $250 до $400">от $250 до $400 (стандарт)</option>
                      <option value="от $400 до $600">от $400 до $600 (комфорт)</option>
                      <option value="более $600">более $600 (бизнес/премиум)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">Локация</label>
                    <select 
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                    >
                      <option value="Рядом с метро">Рядом с метро (до 10 мин)</option>
                      <option value="Центр Минска">Центр Минска</option>
                      <option value="Минск-Мир">Минск-Мир</option>
                      <option value="Любой район">Любой район</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">Ваше имя</label>
                    <input 
                      type="text" 
                      placeholder="Иван" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">Телефон *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="+375 29 000-00-00" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  Подобрать жилье в аренду
                </button>
              </form>
            )}
          </div>
        </Reveal>

      </div>
    </div>
  );
}
