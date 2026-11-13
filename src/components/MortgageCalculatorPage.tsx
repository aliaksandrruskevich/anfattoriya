'use client';

import React, { useState } from 'react';
import { PageId } from '../types';
import PageHero from './PageHero';
import MortgageCalculator from './MortgageCalculator';
import { 
  Landmark, ShieldCheck, Calculator, CheckCircle2, 
  HelpCircle, PhoneCall, Percent, FileCheck
} from 'lucide-react';
import { Reveal } from './DesignSystem';

interface MortgageCalculatorPageProps {
  activePage: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
}

export default function MortgageCalculatorPage({ activePage, navigateTo, handleAddLead }: MortgageCalculatorPageProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [income, setIncome] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    handleAddLead(
      name.trim() || 'Клиент ипотеки',
      phone.trim(),
      `Заявка на одобрение кредита: доход ${income || 'не указан'}`,
      'Ипотечный калькулятор'
    );
    setSubmitted(true);
  };

  const BANK_PROGRAMS = [
    {
      bank: 'ОАО «АСБ Беларусбанк»',
      program: 'Ипотека Экспресс (вторичное жилье)',
      rate: 'от 14.5% годовых',
      term: 'до 20 лет',
      maxFinancing: 'до 90% стоимости объекта',
      feature: 'Возможность привлечения совокупного дохода близких родственников'
    },
    {
      bank: 'ОАО «Приорбанк»',
      program: 'Кредит на покупку недвижимости',
      rate: 'от 14.7% годовых',
      term: 'до 15 лет',
      maxFinancing: 'до 80% стоимости объекта',
      feature: 'Быстрое предварительное решение за 24 часа по 2 документам'
    },
    {
      bank: 'ОАО «Банк БелВЭБ»',
      program: 'Новостройка и вторичный рынок',
      rate: 'от 14.9% годовых',
      term: 'до 20 лет',
      maxFinancing: 'до 90% стоимости объекта',
      feature: 'Досрочное погашение без штрафов и комиссий с 1 месяца'
    }
  ];

  return (
    <div className="space-y-12 animate-fade-in font-sans">
      <PageHero 
        activePage={activePage} 
        navigateTo={navigateTo} 
        handleAddLead={handleAddLead} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-6">
        
        {/* Hero Section */}
        <Reveal>
          <div className="bg-gradient-to-br from-neutral-900 via-stone-900 to-purple-950 text-white rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30">
                <Landmark className="w-4 h-4 text-purple-400" />
                Партнерские ипотечные программы Беларуси 2026
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Ипотечный калькулятор и одобрение кредита на жилье
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Поможем подобрать самую выгодную процентную ставку, рассчитаем ежемесячные платежи, проверим вашу кредитную историю и согласуем объект в банке с вероятностью одобрения <span className="text-purple-400 font-bold">96%</span>.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10 text-stone-200">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">от 14.5%</div>
                <div className="text-xs text-stone-400 mt-1">Процентная ставка банков</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">до 90%</div>
                <div className="text-xs text-stone-400 mt-1">Финансирование покупки</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">до 20 лет</div>
                <div className="text-xs text-stone-400 mt-1">Срок кредитования</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">Бесплатно</div>
                <div className="text-xs text-stone-400 mt-1">Помощь ипотечного брокера</div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Embedded Calculator Card */}
        <Reveal>
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xl space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 flex items-center gap-2">
                <Calculator className="w-6 h-6 text-purple-600" />
                Интерактивный расчет ежемесячного платежа
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Изменяйте стоимость жилья, первоначальный взнос и срок кредита для расчета платежей
              </p>
            </div>
            
            <MortgageCalculator />
          </div>
        </Reveal>

        {/* Bank Program Comparison */}
        <Reveal>
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-neutral-900 text-center">
              Актуальные кредитные программы банков-партнеров
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {BANK_PROGRAMS.map((prog, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">
                      Банк-партнер
                    </span>
                    <h4 className="font-bold text-neutral-900 text-lg">{prog.bank}</h4>
                    <p className="text-xs font-semibold text-stone-700">{prog.program}</p>

                    <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Ставка:</span>
                        <span className="font-bold text-purple-600">{prog.rate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Срок:</span>
                        <span className="font-bold text-neutral-800">{prog.term}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Покрытие:</span>
                        <span className="font-bold text-neutral-800">{prog.maxFinancing}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-100 italic">
                    💡 {prog.feature}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Mortgage Broker Lead Assistance */}
        <Reveal>
          <div className="bg-stone-50 rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-lg max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900">
                Бесплатная консультация ипотечного брокера
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">
                Рассчитаем максимальную сумму кредита, на которую вы можете рассчитывать с учетом вашего дохода
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold">Заявка на консультацию принята!</h4>
                <p className="text-xs text-emerald-700">
                  Наш ипотечный специалист свяжется с вами в течение 15 минут.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">Ваше имя</label>
                    <input 
                      type="text" 
                      placeholder="Иван" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
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
                      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">Примерный среднемесячный доход семьи (BYN)</label>
                  <input 
                    type="text" 
                    placeholder="Например: 2,800 BYN" 
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  Рассчитать одобрение кредита бесплатно
                </button>
              </form>
            )}
          </div>
        </Reveal>

      </div>
    </div>
  );
}
