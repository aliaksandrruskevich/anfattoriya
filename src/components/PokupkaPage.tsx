'use client';

import React, { useState } from 'react';
import { PageId, Agent } from '../types';
import PageHero from './PageHero';
import { 
  ShieldCheck, Search, Scale, FileText, CheckCircle2, 
  HelpCircle, PhoneCall, Building2, UserCheck, ArrowRight,
  BadgeCheck, Clock, Landmark
} from 'lucide-react';
import { Reveal } from './DesignSystem';

interface PokupkaPageProps {
  activePage: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
  agentsList?: Agent[];
}

export default function PokupkaPage({ activePage, navigateTo, handleAddLead, agentsList = [] }: PokupkaPageProps) {
  const [propertyType, setPropertyType] = useState('1-комнатная');
  const [budget, setBudget] = useState('до $60,000');
  const [district, setDistrict] = useState('Любой район');
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadComment, setLeadComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadPhone.trim()) return;
    handleAddLead(
      leadName.trim() || 'Покупатель',
      leadPhone.trim(),
      `Заявка на подбор: ${propertyType}, бюджет ${budget}, район ${district}. Примечание: ${leadComment}`,
      'Страница покупки недвижимости'
    );
    setSubmitted(true);
  };

  const FAQS = [
    {
      q: 'Какие скрытые риски существуют при покупке квартиры на вторичном рынке?',
      a: 'Основные риски — появление неучтенных наследников, выписанные в места лишения свободы или интернаты граждане, нарушение прав несовершеннолетних при приватизации, недееспособность продавца на момент сделки или скрытые долги по коммунальным платежам. Наш юридический отдел проверяет объект по архивам БРТИ и паспортных столов с 1991 года.'
    },
    {
      q: 'Как работает страхование сделки Белгосстрах?',
      a: 'Деятельность агентства «АН Фаттория» официально застрахована в Белгосстрах в соответствии с законодательством Республики Беларусь. В случае судебного спора или признания сделки недействительной по вине продавца, государственная страховая компания возмещает клиенту полную стоимость объекта.'
    },
    {
      q: 'Помогаете ли вы с оформлением партнерского кредита на покупку?',
      a: 'Да. Мы сотрудничаем со всеми ведущими банками Беларуси (Беларусбанк, Приорбанк, БелВЭБ, Сбер Банк, БТА Банк). Наш ипотечный брокер бесплатно рассчитает максимальную сумму кредита, поможет собрать пакет документов и согласует объект с банком в кратчайшие сроки.'
    },
    {
      q: 'Сколько стоят услуги агентства для покупателя?',
      a: 'Тарифы на риэлтерские услуги в Республике Беларусь строго регламентированы Постановлением Совета Министров РБ № 754. Стоимость подбора объекта и полного юридического сопровождения фиксирована и оплачивается исключительно по факту успешной регистрации сделки в БРТИ.'
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
        
        {/* Top Guarantee Banner */}
        <Reveal>
          <div className="bg-gradient-to-r from-neutral-900 via-purple-950 to-neutral-900 text-white rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Юридическая безопасность Минюста РБ
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Безопасная покупка квартиры в Минске с гарантией Белгосстрах
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Защищаем ваши деньги и права на жилье. Проверяем историю каждого объекта с 1991 года, организуем безопасные расчеты, аргументированно снижаем цену продавца на переговорах и сопровождаем сделку до вручения ключей.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-2xl font-black text-purple-400">100%</div>
                <div className="text-xs text-stone-300 mt-1">Архивная проверка истории</div>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-2xl font-black text-purple-400">20+ лет</div>
                <div className="text-xs text-stone-300 mt-1">Опыт аттестованных юристов</div>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-2xl font-black text-purple-400">0 руб.</div>
                <div className="text-xs text-stone-300 mt-1">Предоплата за подбор жилья</div>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-2xl font-black text-purple-400">Белгосстрах</div>
                <div className="text-xs text-stone-300 mt-1">Государственный полис защиты</div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Property Request Finder Form */}
        <Reveal>
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xl space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 flex items-center gap-2">
                  <Search className="w-6 h-6 text-purple-600" />
                  Заявка на персональный подбор квартиры
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Укажите ваши параметры — мы подберём лучшие варианты из актуального каталога и новых предложений собственников
                </p>
              </div>
              <button 
                onClick={() => navigateTo('catalog')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-3.5 py-2 rounded-xl transition-colors cursor-pointer w-fit"
              >
                Смотреть весь каталог объектов <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {submitted ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-bold">Спасибо! Заявка успешно отправлена</h4>
                <p className="text-sm text-emerald-700 max-w-md mx-auto">
                  Дежурный специалист по покупке недвижимости свяжется с вами в течение 15 минут с готовой выборкой объектов.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2 uppercase">Количество комнат</label>
                    <select 
                      value={propertyType} 
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                    >
                      <option value="1-комнатная">1-комнатная / студия</option>
                      <option value="2-комнатная">2-комнатная / евро-двушка</option>
                      <option value="3-комнатная">3-комнатная</option>
                      <option value="4-комнатная+">4-комнатная и более</option>
                      <option value="Коттедж или дом">Загородный дом / коттедж</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2 uppercase">Планируемый бюджет</label>
                    <select 
                      value={budget} 
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                    >
                      <option value="до $45,000">до $45,000</option>
                      <option value="от $45,000 до $65,000">от $45,000 до $65,000</option>
                      <option value="от $65,000 до $90,000">от $65,000 до $90,000</option>
                      <option value="от $90,000 до $130,000">от $90,000 до $130,000</option>
                      <option value="более $130,000">более $130,000 (премиум)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2 uppercase">Район Минска</label>
                    <select 
                      value={district} 
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                    >
                      <option value="Любой район">Любой район Минска</option>
                      <option value="Центральный">Центральный район</option>
                      <option value="Советский">Советский район</option>
                      <option value="Первомайский">Первомайский район</option>
                      <option value="Московский">Московский район</option>
                      <option value="Фрунзенский">Фрунзенский район</option>
                      <option value="Ленинский">Ленинский район</option>
                      <option value="Октябрьский">Октябрьский (Минск-Мир)</option>
                      <option value="Заводской">Заводской район</option>
                      <option value="Минский район">Минский район (пригород)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2 uppercase">Ваше имя</label>
                    <input 
                      type="text" 
                      placeholder="Иван" 
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2 uppercase">Телефон для связи *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="+375 29 000-00-00" 
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2 uppercase">Пожелания к объекту</label>
                    <input 
                      type="text" 
                      placeholder="Рядом с метро, высокий этаж..." 
                      value={leadComment}
                      onChange={(e) => setLeadComment(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  Подобрать варианты недвижимости без комиссии
                </button>
              </form>
            )}
          </div>
        </Reveal>

        {/* 6 Steps of Safe Purchase */}
        <Reveal>
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                Этапы безопасной покупки квартиры в АН Фаттория
              </h3>
              <p className="text-sm text-stone-500">
                От первого звонка до получения зарегистрированного свидетельства о праве собственности
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  title: 'Консультация и подбор',
                  desc: 'Формируем точные критерии: бюджет, планировка, инфраструктура. Подбираем актуальные варианты сразу после проверки документов.'
                },
                {
                  step: '02',
                  title: 'Организация показов',
                  desc: 'Согласуем просмотры в удобное для вас время. Риэлтер сопровождает на каждом объекте, выявляя скрытые недостатки ремонта и дома.'
                },
                {
                  step: '03',
                  title: 'Профессиональный торг',
                  desc: 'Наши специалисты знают реальные цены завершённых сделок и аргументированно снижают стоимость объекта в среднем на 3–7% в пользу покупателя.'
                },
                {
                  step: '04',
                  title: 'Архивная проверка истории',
                  desc: 'Запрашиваем полные расширенные выписки БРТИ с 1991 года, проверяем законность приватизации, отсутствие скрытых наследников и арестов.'
                },
                {
                  step: '05',
                  title: 'Безопасные расчеты',
                  desc: 'Помогаем с открытием счетов, валютно-обменными операциями по льготному курсу или банковскими ячейками для безопасной передачи денег.'
                },
                {
                  step: '06',
                  title: 'Регистрация и передача ключей',
                  desc: 'Удостоверение договора у государственного регистратора, подписание передаточного акта и контроль погашения коммунальных задолженностей.'
                }
              ].map((item) => (
                <div key={item.step} className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-lg border border-purple-100">
                    {item.step}
                  </div>
                  <h4 className="text-base font-bold text-neutral-900">{item.title}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Legal Checklist Box */}
        <Reveal>
          <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 border border-white/10 space-y-8">
            <div className="max-w-3xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Чеклист экспертной проверки</span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                Что мы проверяем перед тем, как вы внесете задаток
              </h3>
              <p className="text-xs sm:text-sm text-stone-400">
                Каждый пункт фиксируется в официальном юридическом заключении агентства
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-stone-300">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Дееспособность продавца
                </div>
                <p className="text-stone-400 leading-relaxed">
                  Проверяем отсутствие учета в психоневрологическом и наркологическом диспансерах.
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Права несовершеннолетних
                </div>
                <p className="text-stone-400 leading-relaxed">
                  Контролируем разрешения органов опеки и попечительства при участии детей в сделке.
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Архив выписанных лиц
                </div>
                <p className="text-stone-400 leading-relaxed">
                  Исключаем риск прав временно выписанных граждан (служба в армии, МЛС, стационары).
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Согласия супругов
                </div>
                <p className="text-stone-400 leading-relaxed">
                  Нотариальные согласия действующих и бывших супругов на отчуждение совместного имущества.
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Обременения и запреты
                </div>
                <p className="text-stone-400 leading-relaxed">
                  Проверка залогов по кредитам, ипотекам, арестов судебных исполнителей (ОПИ).
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Задолженности по ЖКХ
                </div>
                <p className="text-stone-400 leading-relaxed">
                  Проверка справок из РСЦ о нулевых остатках по коммунальным платежам и капремонту.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* FAQ Accordion */}
        <Reveal>
          <div className="space-y-6 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-neutral-900 text-center">
              Часто задаваемые вопросы при покупке недвижимости
            </h3>
            <div className="space-y-3">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div 
                    key={idx} 
                    className="border border-stone-200 rounded-2xl bg-white overflow-hidden transition-all shadow-xs"
                  >
                    <button 
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-5 text-left font-bold text-sm text-neutral-900 flex justify-between items-center gap-4 hover:text-purple-600 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <span className={`text-lg transition-transform ${isOpen ? 'rotate-45 text-purple-600' : 'text-stone-400'}`}>+</span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

      </div>
    </div>
  );
}
