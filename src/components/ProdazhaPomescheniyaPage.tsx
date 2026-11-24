"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Shield, Award, CheckCircle2, ChevronDown,
  Clock, FileText, Phone, Building2, Store, Warehouse,
  TrendingUp, BarChart3, Calculator, Scale, Sparkles,
  Calendar, Share2, Bookmark, CheckCircle, Send, MessageCircle
} from 'lucide-react';
import type { Agent, PageId, Property } from '../types';
import ActiveSalePropertiesSection from './ActiveSalePropertiesSection';

interface ProdazhaPomescheniyaPageProps {
  activePage?: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
  properties?: Property[];
  agents?: Agent[];
}

const displayFont = "'Cormorant Garamond', 'Georgia', serif";
const bodyFont = "'Raleway', system-ui, sans-serif";

const HERO_PHOTO = '/photo/hero-office.jpg';

const TOC_ITEMS = [
  { id: 'active-objects', label: 'Актуальные помещения в продаже' },
  { id: 'segments', label: 'Сегменты коммерции' },
  { id: 'experience', label: 'Опыт «Фаттории» с 2022 года' },
  { id: 'investors', label: 'Подбор целевых покупателей' },
  { id: 'faq', label: 'Частые вопросы продавцов' },
];

export default function ProdazhaPomescheniyaPage({
  navigateTo,
  handleAddLead,
  properties = [],
  agents = [],
}: ProdazhaPomescheniyaPageProps) {
  const [activeId, setActiveId] = useState<string>('active-objects');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [leadSent, setLeadSent] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formType, setFormType] = useState('Торговое помещение (Street Retail)');
  const [formArea, setFormArea] = useState('50 - 150 кв.м');

  useEffect(() => {
    const els = TOC_ITEMS.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { rootMargin: '-15% 0px -65% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPhone.trim()) return;
    handleAddLead(
      formName.trim() || 'Продавец коммерческой недвижимости',
      formPhone.trim(),
      `Коммерческая продажа: ${formType}. Площадь: ${formArea}`,
      'prodazha-pomescheniya'
    );
    setLeadSent(true);
    setTimeout(() => {
      setLeadSent(false);
      setFormName('');
      setFormPhone('');
    }, 4500);
  };

  const commercialSegments = [
    {
      title: 'Street Retail (Торговые помещения)',
      desc: 'Первые линии центральных проспектов и жилых массивов с удобной логистикой и высоким трафиком. Помещения под торговлю, аптеки, сервис и общепит.',
      photo: '/photo/hero-building.jpg',
      tag: 'Высокий пешеходный трафик'
    },
    {
      title: 'Офисы и бизнес-центры',
      desc: 'Офисные блоки и отдельные административные помещения в деловых районах Минска. Продажа этажами, блоками и отдельными кабинетами.',
      photo: '/photo/hero-office.jpg',
      tag: 'Деловые локации Минска'
    },
    {
      title: 'Склады и логистические комплексы',
      desc: 'Отапливаемые и сухие склады в районе МКАД и промузлах. Проверка подъездных путей, инженерных сетей, мощностей и целевого назначения.',
      photo: '/photo/hero-construction.jpg',
      tag: 'Логистика у МКАД'
    },
    {
      title: 'Готовый арендный бизнес (ГАБ)',
      desc: 'Коммерческие помещения с действующими арендаторами и прозрачной историей договорных отношений и платежей.',
      photo: '/photo/hero-coworking.jpg',
      tag: 'Действующие арендаторы'
    }
  ];

  const faqItems = [
    {
      q: 'Как быстро АН «Фаттория» находит покупателя на коммерческий объект?',
      a: 'Средний срок сделки в нашем агентстве — 26 дней, минимальный — 2 дня. Благодаря системной работе с частными и корпоративными инвесторами с 2022 года, предложения о продаже качественного готового бизнеса мы первично презентуем целевым покупателям без публичного демпинга.'
    },
    {
      q: 'Как вы защищаете конфиденциальность продажи готового бизнеса?',
      a: 'Мы понимаем, что публичные объявления о продаже могут встревожить арендаторов или контрагентов. Поэтому мы проводим закрытый маркетинг: инвесторы получают доступ к детальной финансовой отчетности только после подписания соглашения о неразглашении (NDA).'
    },
    {
      q: 'Каковы официальные тарифы агентства при продаже коммерции?',
      a: 'Тарифы регламентированы постановлением Совета Министров Республики Беларусь и составляют от 1.5% до 6% в зависимости от стоимости объекта. Оплата производится исключительно после регистрации перехода права собственности в БТИ.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#171412]" style={{ fontFamily: bodyFont }}>

      {/* 1. EDITORIAL HERO BANNER */}
      <section className="relative overflow-hidden bg-neutral-950 text-white min-h-[520px] lg:min-h-[620px] flex items-end">
        <img
          src={HERO_PHOTO}
          alt="Продажа коммерческой недвижимости в Минске"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/30" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 pt-32 pb-20 lg:pb-28 w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-white/40 text-xs">•</span>
            <span className="text-white/70 text-xs uppercase tracking-wider font-medium">Коммерческая</span>
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/25 text-white px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.25em] mb-6">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>АН «Фаттория» · Коммерческий брокеридж с 2022 года</span>
            </div>

            <h1
              className="text-white mb-6 font-normal tracking-tight"
              style={{
                fontFamily: displayFont,
                fontSize: 'clamp(34px, 5.2vw, 64px)',
                lineHeight: 1.08,
                textShadow: '0 4px 24px rgba(0,0,0,0.85)'
              }}
            >
              Продажа коммерческой недвижимости и готового арендного бизнеса в Минске
            </h1>

            <p
              className="text-[17px] lg:text-[21px] font-light leading-relaxed max-w-3xl mb-8 text-white/90"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
            >
              Офисы, street retail, торговые площади, склады и помещения для бизнеса в Минске и области. С 2022 года АН «Фаттория» организует профессиональную продажу коммерческих объектов, юридическую проверку и сопровождение сделок.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/20 text-[11px] uppercase tracking-[0.18em] text-white/80">
              <span className="inline-flex items-center gap-2 font-medium"><Calendar className="w-3.5 h-3.5 text-amber-400" /> Практика с 2022 года</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium"><TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Аудит арендных договоров</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium"><Scale className="w-3.5 h-3.5 text-sky-400" /> Тарифы Минюста 1.5%–6%</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium"><Shield className="w-3.5 h-3.5 text-amber-300" /> Юридическая чистота сделки</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ELEVATED EDITORIAL SHEET */}
      <div className="relative -mt-10 lg:-mt-14 rounded-t-[36px] lg:rounded-t-[50px] bg-white border-t border-[#E7E2DA] shadow-2xl z-20">
        <div className="max-w-[1520px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_340px] gap-10 xl:gap-14 pt-12 lg:pt-16 pb-20">

          {/* Левая колонка */}
          <aside className="lg:sticky lg:top-28 lg:h-fit space-y-6 order-1">
            <div className="bg-stone-50/90 p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] mb-4 pb-3 border-b border-stone-200 text-stone-900">
                Содержание раздела
              </div>
              <nav className="space-y-1">
                {TOC_ITEMS.map((item, i) => {
                  const on = activeId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                      className="flex w-full items-start gap-2.5 text-left text-[13px] leading-snug py-2 px-2.5 rounded-lg transition-all hover:text-stone-900 cursor-pointer"
                      style={on ? { color: '#171412', background: '#EAE6DF', fontWeight: 600 } : { color: '#6B645C' }}
                    >
                      <span className="mt-[2px] text-[10px] font-semibold tabular-nums text-amber-800">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-800">
                Быстрые действия
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  className="flex-1 py-2 px-3 text-[11px] font-semibold uppercase tracking-wider rounded-xl border border-stone-300 bg-white hover:border-stone-400 transition-all flex items-center justify-center gap-1.5"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-600 text-amber-600' : 'text-stone-600'}`} />
                  <span>{bookmarked ? 'В закладках' : 'Сохранить'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-2 px-3 text-[11px] font-semibold uppercase tracking-wider rounded-xl border border-stone-300 bg-white hover:border-stone-400 transition-all flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-stone-600" />
                  <span>{shareCopied ? 'Скопировано' : 'Поделиться'}</span>
                </button>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-amber-50 to-stone-100 rounded-2xl border border-amber-200/70 text-stone-800">
              <div className="flex items-center gap-2 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Award className="w-4 h-4" /> B2B экспертиза с 2022
              </div>
              <p className="text-xs leading-relaxed text-stone-600">
                1424+ клиентов выбрали нас для своих сделок. Юридическое структурирование договоров купли-продажи и налоговый аудит.
              </p>
            </div>
          </aside>

          {/* Центральная колонка */}
          <main className="order-2 min-w-0 max-w-[880px] space-y-16">

            <ActiveSalePropertiesSection
              id="active-objects"
              sectionNumber="01"
              eyebrow="Коммерческие объекты с Realt.by"
              title="Действующие коммерческие помещения в продаже"
              subtitle="Офисы, торговые площади, склады, производственные и сервисные объекты в актуальной продаже."
              category="commercial"
              properties={properties}
              agents={agents}
              onRequestConsultation={() =>
                document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })
              }
            />

            {/* 02: СЕГМЕНТЫ */}
            <section id="segments" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                02 · Классификация активов
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 42px)', lineHeight: 1.15 }}
              >
                Коммерческие помещения любого назначения в Минске
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                В коммерческой недвижимости покупают не квадратные метры, а будущий арендный доход и капитализацию. Мы упаковываем объект в формат инвестиционного актива, понятного инвесторам и фондам.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {commercialSegments.map((seg, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col"
                  >
                    <div className="relative h-48 overflow-hidden bg-stone-100">
                      <img
                        src={seg.photo}
                        alt={seg.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <span className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                        {seg.tag}
                      </span>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-stone-900 font-semibold text-lg mb-2">
                          {seg.title}
                        </h3>
                        <p className="text-stone-600 text-xs leading-relaxed font-light mb-4">
                          {seg.desc}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setFormType(seg.title);
                          document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-[11px] font-bold uppercase tracking-wider text-amber-800 hover:text-amber-900 text-left pt-3 border-t border-stone-100 flex items-center justify-between"
                      >
                        <span>Оценить объект</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 02: ОПЫТ ФАТТОРИИ С 2022 ГОДА */}
            <section id="experience" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                03 · Практика
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Коммерческое направление АН «Фаттория» с 2022 года
              </h2>
              <div className="prose text-stone-600 text-[16px] leading-relaxed font-light space-y-4">
                <p>
                  С 2022 года риэлтеры коммерческого департамента АН «Фаттория» сопровождают сделки купли-продажи нежилого фонда между юридическими и физическими лицами. Мы понимаем строгие требования корпоративных стандартов, проверки контрагентов и валютного законодательства РБ.
                </p>
                <p>
                  Каждый выставленный объект проходит финансово-правовой аудит: проверка прав на земельный участок под зданием, анализ договоров аренды на предмет безусловности индексации ставки и штрафных санкций, а также проверка отсутствия залогов в реестре движимого и недвижимого имущества.
                </p>
              </div>

              {/* Фото вставка */}
              <div className="my-8 rounded-3xl overflow-hidden border border-stone-200 shadow-md">
                <img
                  src="/photo/hero-architecture.jpg"
                  alt="Бизнес-центры и коммерческая недвижимость Минска"
                  className="w-full h-80 object-cover"
                />
                <div className="p-4 bg-stone-50 text-xs text-stone-500 flex items-center justify-between border-t border-stone-200">
                  <span>Бизнес-центры и коммерческие помещения Минска: правовой и финансовый аудит</span>
                  <span className="font-semibold text-stone-700">Сопровождение сделки</span>
                </div>
              </div>
            </section>

            {/* 03: ЦЕЛЕВЫЕ ПОКУПАТЕЛИ */}
            <section id="investors" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                04 · Прямые покупатели
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Целевые покупатели коммерческой недвижимости
              </h2>
              <div className="prose text-stone-600 text-[16px] leading-relaxed font-light space-y-4">
                <p>
                  С 2022 года АН «Фаттория» работает с корпоративными покупателями, представителями бизнеса и частными инвесторами в Беларуси, подбирая ликвидные офисные, торговые и складские помещения под конкретные задачи.
                </p>
                <p>
                  Если вам важна деликатность продажи действующего объекта или бизнеса, мы организуем предварительные переговоры с целевыми покупателями без лишнего информационного шума.
                </p>
              </div>
            </section>

            {/* 04: FAQ */}
            <section id="faq" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                05 · Часто задаваемые вопросы
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Вопросы собственников коммерческих площадей
              </h2>

              <div className="space-y-3">
                {faqItems.map((item, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border border-stone-200 overflow-hidden transition-all shadow-sm"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/80 transition-colors"
                      >
                        <span className="font-semibold text-stone-900 text-sm sm:text-base leading-snug">
                          {item.q}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-stone-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-800' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-stone-600 text-sm leading-relaxed font-light border-t border-stone-100">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

          </main>

          {/* Правая колонка */}
          <aside className="order-3 lg:col-start-2 xl:col-start-3 xl:row-start-1 xl:sticky xl:top-28 xl:h-fit space-y-6">

            <div id="lead-form" className="p-7 bg-white rounded-3xl border border-stone-200 shadow-md">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-800 mb-2">
                Коммерческий отдел
              </div>
              <h3 className="text-stone-900 text-xl font-normal mb-2" style={{ fontFamily: displayFont }}>
                Оценка коммерческого объекта
              </h3>
              <p className="text-xs text-stone-500 mb-6 font-light leading-relaxed">
                Расчет рыночной цены и подбор инвесторов.
              </p>

              {leadSent ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-semibold text-emerald-900 text-sm">Заявка принята!</div>
                  <p className="text-xs text-emerald-700 font-light">
                    Коммерческий брокер свяжется с вами в течение 10 минут.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Тип недвижимости
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                    >
                      <option value="Торговое помещение (Street Retail)">Торговое (Street Retail)</option>
                      <option value="Офис / Офисный блок">Офис / БЦ</option>
                      <option value="Склад / Производство">Склад / Производство</option>
                      <option value="Готовый арендный бизнес">Готовый арендный бизнес (ГАБ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Примерная площадь
                    </label>
                    <select
                      value={formArea}
                      onChange={(e) => setFormArea(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                    >
                      <option value="до 50 кв.м">до 50 кв.м</option>
                      <option value="50 - 150 кв.м">50 - 150 кв.м</option>
                      <option value="150 - 500 кв.м">150 - 500 кв.м</option>
                      <option value="более 500 кв.м">более 500 кв.м</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Контактное лицо
                    </label>
                    <input
                      type="text"
                      placeholder="Алексей"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Телефон <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+375 (29) 000-00-00"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Заказать аудит объекта</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

          </aside>

        </div>
      </div>

    </div>
  );
}