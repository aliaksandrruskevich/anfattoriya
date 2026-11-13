'use client';

import React, { useState } from 'react';
import { PageId } from '../types';
import PageHero from './PageHero';
import { 
  TrendingUp, ShieldCheck, Key, Building2, 
  Coins, CheckCircle2, ChevronRight, Calculator,
  ArrowRight, PhoneCall, Award
} from 'lucide-react';
import { Reveal } from './DesignSystem';

interface Props { 
  activePage: PageId; 
  navigateTo: (p: PageId) => void; 
  handleAddLead: (n: string, ph: string, e: string, s: string) => void; 
}

export default function PokupkaDlyaArendyPage({ activePage, navigateTo, handleAddLead }: Props) {
  const [budget, setBudget] = useState(65000);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Estimated ROI calculation
  const estimatedRentUSD = Math.round((budget * 0.08) / 12);
  const estimatedAnnualYieldUSD = Math.round(budget * 0.082);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadPhone.trim()) return;
    handleAddLead(
      leadName.trim() || 'Инвестор',
      leadPhone.trim(),
      `Покупка под аренду: бюджет $${budget.toLocaleString()}, доход ~$${estimatedRentUSD}/мес`,
      'Покупка для аренды'
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
        
        {/* Intro Banner */}
        <Reveal>
          <div className="bg-gradient-to-br from-neutral-900 via-stone-900 to-purple-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="max-w-3xl space-y-5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30">
                <TrendingUp className="w-3.5 h-3.5" />
                Инвестиционная недвижимость в Минске
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Покупка недвижимости для стабильного арендного дохода
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Подбираем ликвидные 1-2 комнатные квартиры и коммерческие помещения с расчетной доходностью от <span className="text-purple-400 font-bold">7.5% до 11% годовых</span>. Обеспечиваем полное сопровождение: от анализа локации и покупки до ремонта, комплектации и заселения платежеспособных арендаторов.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10 text-stone-200">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">8.2%</div>
                <div className="text-xs text-stone-400 mt-1">Средняя доходность годовых</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">7-14 дн.</div>
                <div className="text-xs text-stone-400 mt-1">Срок сдачи объекта</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">100%</div>
                <div className="text-xs text-stone-400 mt-1">Проверка арендаторов</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">0 руб.</div>
                <div className="text-xs text-stone-400 mt-1">Комиссия при подборе под ключ</div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Investment Calculator */}
        <Reveal>
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xl space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 flex items-center gap-2">
                  <Calculator className="w-6 h-6 text-purple-600" />
                  Экспресс-расчет доходности аренды
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Рассчитайте потенциальный арендный доход в зависимости от бюджета покупки
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-stone-100 text-stone-600 rounded-full w-fit">
                Рыночные ставки 2026
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-stone-700">Бюджет покупки недвижимости:</span>
                    <span className="text-lg font-black text-purple-600">${budget.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min={35000} 
                    max={250000} 
                    step={2500} 
                    value={budget} 
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full h-2.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-[11px] text-stone-400 mt-1 font-mono">
                    <span>$35,000 (студия)</span>
                    <span>$100,000 (евродвушка)</span>
                    <span>$250,000+ (премиум)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
                    <span className="text-xs font-bold text-purple-900 uppercase">Ориентировочная аренда:</span>
                    <div className="text-2xl sm:text-3xl font-black text-purple-600 mt-1">
                      ${estimatedRentUSD} <span className="text-xs font-normal text-purple-800">/ месяц</span>
                    </div>
                    <span className="text-[11px] text-purple-700 mt-0.5 block">
                      ≈ {(estimatedRentUSD * 3.3).toLocaleString()} BYN
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                    <span className="text-xs font-bold text-stone-700 uppercase">Годовой валовой доход:</span>
                    <div className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
                      ${estimatedAnnualYieldUSD.toLocaleString()} <span className="text-xs font-normal text-stone-500">/ год</span>
                    </div>
                    <span className="text-[11px] text-stone-500 mt-0.5 block">
                      Срок окупаемости ≈ 11.5–12.5 лет
                    </span>
                  </div>
                </div>
              </div>

              {/* Consultation Lead Box */}
              <div className="lg:col-span-5 bg-stone-50 p-6 rounded-2xl border border-stone-200">
                <h4 className="text-base font-bold text-neutral-900 mb-2">
                  Получить подборку доходных объектов
                </h4>
                <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                  Наш эксперт пришлет список из 3–5 реальных квартир с готовыми арендаторами или высоким спросом на сдачу.
                </p>

                {submitted ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center text-sm font-bold">
                    ✓ Заявка принята! Риэлтер свяжется с вами в течение 15 минут.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Ваше имя" 
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                    />
                    <input 
                      type="tel" 
                      required
                      placeholder="Телефон (+375...)" 
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                    />
                    <button 
                      type="submit"
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      <PhoneCall className="w-4 h-4" />
                      Получить инвестиционный расчет
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Steps of Investment Process */}
        <Reveal>
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                Как мы работаем с инвесторами
              </h3>
              <p className="text-sm text-stone-500">
                Полный цикл услуг от выбора района до перечисления арендных платежей на ваш счет
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-black text-lg">
                  01
                </div>
                <h4 className="text-lg font-bold text-neutral-900">Анализ рынка и выбор объекта</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Оцениваем плотность аренды у метро, рядом с вузами или бизнес-центрами. Проверяем юридическую чистоту истории квартиры с 1991 года.
                </p>
                <ul className="text-xs text-stone-500 space-y-1.5 pt-2">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" /> Районы с постоянным дефицитом аренды</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" /> Торг с продавцом до 5–10% в вашу пользу</li>
                </ul>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-black text-lg">
                  02
                </div>
                <h4 className="text-lg font-bold text-neutral-900">Безопасная сделка и оформление</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Полная регистрация договора в БРТИ, расчет через банковскую ячейку или аккредитив. Сделка застрахована государственной гарантией Белгосстрах.
                </p>
                <ul className="text-xs text-stone-500 space-y-1.5 pt-2">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" /> Защита от скрытых наследников и долгов</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" /> Возможность удаленной покупки по доверенности</li>
                </ul>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-black text-lg">
                  03
                </div>
                <h4 className="text-lg font-bold text-neutral-900">Сдача и доверительное управление</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Находим платежеспособных арендаторов за 7–14 дней. Заключаем официальный договор найма с актом описи имущества и залоговым депозитом.
                </p>
                <ul className="text-xs text-stone-500 space-y-1.5 pt-2">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" /> Проверка кредитной истории и работы жильцов</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" /> Контроль коммунальных платежей и сохранности</li>
                </ul>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Strategies Section */}
        <Reveal>
          <div className="bg-stone-50 rounded-3xl p-8 sm:p-10 border border-stone-200 space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900">
              Популярные инвестиционные стратегии в Минске
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                <h4 className="font-bold text-neutral-900 text-base">Долгосрочная аренда (1-к / евродвушки)</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Стабильный пассивный доход без временных затрат. Наиболее востребованы квартиры у станций метро: Малиновка, Каменная Горка, Уручье, Восток.
                </p>
                <div className="text-xs font-bold text-purple-600 pt-2 border-t border-stone-100">
                  Доходность: 7.0% – 8.5% годовых
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                <h4 className="font-bold text-neutral-900 text-base">Коммерческие помещения (Street Retail)</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Помещения на первых этажах новостроек (Минск-Мир, Новая Боровая, Левада) под кофейни, аптеки, пункты выдачи заказов.
                </p>
                <div className="text-xs font-bold text-purple-600 pt-2 border-t border-stone-100">
                  Доходность: 8.5% – 11.0% годовых
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                <h4 className="font-bold text-neutral-900 text-base">Квартиры для IT и экспатов</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Стильные квартиры с дизайнерским ремонтом и техникой премиум-класса. Сдаются сотрудникам международных компаний с оплатой по безналичному расчету.
                </p>
                <div className="text-xs font-bold text-purple-600 pt-2 border-t border-stone-100">
                  Ставки: $450 – $950 / месяц
                </div>
              </div>
            </div>
          </div>
        </Reveal>

      </div>
    </div>
  );
}
