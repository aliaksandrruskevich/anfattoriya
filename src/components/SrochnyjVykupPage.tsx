'use client';

import React, { useState } from 'react';
import { PageId } from '../types';
import PageHero from './PageHero';
import { 
  Zap, ShieldCheck, DollarSign, Clock, CheckCircle2, 
  AlertCircle, PhoneCall, ArrowRight, Building2, Coins
} from 'lucide-react';
import { Reveal } from './DesignSystem';

interface SrochnyjVykupPageProps {
  activePage: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
}

export default function SrochnyjVykupPage({ activePage, navigateTo, handleAddLead }: SrochnyjVykupPageProps) {
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [reason, setReason] = useState('Срочно нужны деньги');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    handleAddLead(
      name.trim() || 'Клиент срочного выкупа',
      phone.trim(),
      `Заявка на срочный выкуп: адрес ${address || 'не указан'}, причина: ${reason}`,
      'Срочный выкуп квартир'
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
                <Zap className="w-4 h-4 text-purple-400" />
                Выкуп за собственные средства компании
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Срочный выкуп квартир в Минске и Минском районе за 24–48 часов
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Покупаем квартиры, комнаты и доли за собственные средства без ожидания покупателей с ипотеками. Аванс в день обращения до <span className="text-purple-400 font-bold">$10,000</span>, выплата до 90% рыночной стоимости. Решаем проблемы с залогами, долгами по ЖКХ и сложными документами.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10 text-stone-200">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">до 90%</div>
                <div className="text-xs text-stone-400 mt-1">От рыночной стоимости</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">24 часа</div>
                <div className="text-xs text-stone-400 mt-1">Срок выхода на сделку</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">В день звонка</div>
                <div className="text-xs text-stone-400 mt-1">Аванс наличными или на счет</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">100%</div>
                <div className="text-xs text-stone-400 mt-1">Погашение долгов за наш счет</div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Express Valuation Form */}
        <Reveal>
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xl max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900">
                Экспресс-оценка стоимости выкупа за 15 минут
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">
                Укажите адрес квартиры — наш эксперт рассчитает сумму выкупа и согласует аванс
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold">Заявка на срочный выкуп принята!</h4>
                <p className="text-xs text-emerald-700">
                  Руководитель отдела выкупа свяжется с вами в течение 10 минут с готовым финансовым предложением.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">Адрес квартиры / дома</label>
                  <input 
                    type="text" 
                    required
                    placeholder="г. Минск, ул. ..." 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                  />
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
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">Телефон для связи *</label>
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

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">Особенности ситуации</label>
                  <select 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                  >
                    <option value="Срочно нужны деньги">Срочно нужны деньги (чистая продажа)</option>
                    <option value="Есть долги по коммунальным платежам">Есть долги по коммунальным платежам</option>
                    <option value="Квартира в залоге / ипотеке">Квартира в залоге / ипотеке</option>
                    <option value="Срочный переезд в другую страну">Срочный переезд в другую страну</option>
                    <option value="Продажа доли / комнаты">Продажа доли / комнаты с соседями</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Coins className="w-4 h-4" />
                  Узнать сумму выкупа за 15 минут
                </button>
              </form>
            )}
          </div>
        </Reveal>

        {/* Comparison Table */}
        <Reveal>
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-neutral-900 text-center">
              Срочный выкуп или обычная продажа: сравнение
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-3xl border border-stone-200 overflow-hidden text-sm shadow-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-700 text-left">
                    <th className="p-4 font-bold">Параметр</th>
                    <th className="p-4 font-bold text-purple-700 bg-purple-50/70">Срочный выкуп АН Фаттория</th>
                    <th className="p-4 font-bold text-stone-500">Обычная продажа на рынке</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700 text-xs sm:text-sm">
                  <tr>
                    <td className="p-4 font-medium">Срок получения денег</td>
                    <td className="p-4 font-bold text-purple-700 bg-purple-50/40">1–2 дня</td>
                    <td className="p-4 text-stone-500">1–4 месяца</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Показы квартиры</td>
                    <td className="p-4 font-bold text-purple-700 bg-purple-50/40">1 визит нашего оценщика</td>
                    <td className="p-4 text-stone-500">15–30 показов посторонним людям</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Долги по ЖКХ и залоги</td>
                    <td className="p-4 font-bold text-purple-700 bg-purple-50/40">Погашаем мы сразу</td>
                    <td className="p-4 text-stone-500">Собственник обязан погасить сам</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Оформление документов</td>
                    <td className="p-4 font-bold text-purple-700 bg-purple-50/40">Берем на себя под ключ</td>
                    <td className="p-4 text-stone-500">Сбор справок по инстанциям</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Риск срыва сделки</td>
                    <td className="p-4 font-bold text-purple-700 bg-purple-50/40">0% (деньги на расчетном счете)</td>
                    <td className="p-4 text-stone-500">Отказ банка покупателя в кредите</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>

      </div>
    </div>
  );
}
