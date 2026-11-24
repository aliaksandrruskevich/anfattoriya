"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Shield, Award, CheckCircle2, ChevronDown,
  Clock, FileText, Phone, Home, Sparkles, Scale,
  Compass, MapPin, Trees, SunMedium, Camera, Eye,
  Check, Star, Calendar, Share2, Bookmark, Send, MessageCircle, CheckCircle
} from 'lucide-react';
import type { Agent, PageId, Property } from '../types';
import ActiveSalePropertiesSection from './ActiveSalePropertiesSection';

interface ProdazhaDomaPageProps {
  activePage?: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
  properties?: Property[];
  agents?: Agent[];
}

const displayFont = "'Cormorant Garamond', 'Georgia', serif";
const bodyFont = "'Raleway', system-ui, sans-serif";

const HERO_PHOTO = '/photo/hero-house.jpg';

const TOC_ITEMS = [
  { id: 'active-objects', label: 'Актуальные дома и участки в продаже' },
  { id: 'categories', label: 'Категории загородных объектов' },
  { id: 'experience', label: 'Опыт «Фаттории» с 2022 года' },
  { id: 'audit', label: 'Земельный и технический аудит' },
  { id: 'documents', label: 'Документы на дом и землю' },
  { id: 'seasonality', label: 'Сезонность и стратегия цены' },
  { id: 'faq', label: 'Частые вопросы продавцов' },
];

export default function ProdazhaDomaPage({
  navigateTo,
  handleAddLead,
  properties = [],
  agents = [],
}: ProdazhaDomaPageProps) {
  const [activeId, setActiveId] = useState<string>('active-objects');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [leadSent, setLeadSent] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formHouseType, setFormHouseType] = useState('Коттедж');
  const [formDistance, setFormDistance] = useState('до 15 км от МКАД');

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
      formName.trim() || 'Продавец загородной недвижимости',
      formPhone.trim(),
      `Продажа загородного объекта: ${formHouseType}. Удаленность: ${formDistance}`,
      'prodazha-doma-dachi'
    );
    setLeadSent(true);
    setTimeout(() => {
      setLeadSent(false);
      setFormName('');
      setFormPhone('');
    }, 4500);
  };

  const houseCategories = [
    {
      title: 'Коттеджи и усадьбы',
      desc: 'Минский район и область: Дроздово, Цна, Колодищи, Тарасово, Ратомка, Заславль. Аудит ввода в эксплуатацию, инженерных сетей, газовых ТУ и документов на участок.',
      photo: '/photo/hero-cottage.jpg',
      tag: 'Локации Минского района'
    },
    {
      title: 'Дачи в садовых товариществах (СТ)',
      desc: 'Сезонные и круглогодичные дома в СТ. Проверка устава товарищества, членских взносов, границ по кадастру, мощности электросети и водоснабжения.',
      photo: '/photo/dom.jpg',
      tag: 'СТ и дачные массивы'
    },
    {
      title: 'Земельные участки под ИЖС',
      desc: 'Участки для строительства и обслуживания жилого дома. Проверка правового статуса (частная собственность, ПНВ, аренда), охранных зон ЛЭП и газопроводов.',
      photo: '/photo/hero-land.jpg',
      tag: 'Юридический статус земли'
    },
    {
      title: 'Таунхаусы и блокированные дома',
      desc: 'Современный загородный формат с собственным участком. Проверка выделения долей, порядка пользования придомовой территорией и коммуникациями.',
      photo: '/photo/hero-house.jpg',
      tag: 'Блокированная застройка'
    }
  ];

  const auditPoints = [
    {
      title: 'Земельный статус и границы по GPS',
      desc: 'Сверяем фактический забор с координатами Национального кадастрового агентства. Выявляем самовольные захваты и наложения на соседские участки до выхода на сделку.'
    },
    {
      title: 'Инженерные сети и технические условия',
      desc: 'Проверяем проекты газификации, акты ввода, выделенные электрические мощности (кВт), паспорт скважины, глубину и анализ воды, тип и состояние канализации.'
    },
    {
      title: 'Статус консервации незавершенных строений',
      desc: 'В рамках Указа Президента № 87 консервация недостроя возможна на строго ограниченный срок. Мы оформляем акты консервации и продлеваем сроки строительства без штрафов.'
    }
  ];

  const faqItems = [
    {
      q: 'Можно ли продать участок, если дом еще не введен в эксплуатацию?',
      a: 'Согласно законодательству Республики Беларусь, пустой земельный участок, полученный гражданином как состоящим на учете нуждающихся, не может быть отчужден до завершения строительства жилого дома (либо требуется соблюдение 5-летнего моратория и согласование исполкома). Если же дом законсервирован как незавершенное законсервированное капитальное строение (НЗКС) и зарегистрирован в БТИ, сделка купли-продажи полностью законна. Юристы АН «Фаттория» оформляют такие консервации под ключ.'
    },
    {
      q: 'Чем отличается продажа земли в частной собственности и пожизненном наследуемом владении (ПНВ)?',
      a: 'При частной собственности отчуждается как сам дом, так и земельный участок по единому договору. При праве пожизненного наследуемого владения (ПНВ) в договоре продается капитальное строение, а право ПНВ на землю переходит к покупателю автоматически в силу статьи 55 Кодекса о земле РБ. Мы проверяем все документы в исполкоме и кадастре.'
    },
    {
      q: 'В какое время года выгоднее продавать дом или дачу?',
      a: 'Активный спрос на дачи и загородные дома традиционно приходится на весенне-летний период и начало осени. Однако подготовленный дом с отоплением, полным пакетом документов и качественной фотосъёмкой находит покупателя в любой сезон года.'
    },
    {
      q: 'Какова комиссия агентства при продаже загородной недвижимости?',
      a: 'Комиссия регулируется законодательством РБ и постановлением Совета Министров. Ставка составляет от 1.5% до 6% в зависимости от цены объекта. Оплата производится исключительно после регистрации договора в БТИ.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#171412]" style={{ fontFamily: bodyFont }}>

      {/* 1. EDITORIAL HERO BANNER */}
      <section className="relative overflow-hidden bg-neutral-950 text-white min-h-[520px] lg:min-h-[620px] flex items-end">
        <img
          src={HERO_PHOTO}
          alt="Продажа домов и дач в Беларуси"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/30" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 pt-32 pb-20 lg:pb-28 w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-white/40 text-xs">•</span>
            <span className="text-white/70 text-xs uppercase tracking-wider font-medium">Дома и участки</span>
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/25 text-white px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.25em] mb-6">
              <Trees className="w-3.5 h-3.5 text-amber-400" />
              <span>АН «Фаттория» · Загородная недвижимость с 2022 года</span>
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
              Продажа домов, коттеджей, дач и участков в Минском районе и Беларуси
            </h1>

            <p
              className="text-[17px] lg:text-[21px] font-light leading-relaxed max-w-3xl mb-8 text-white/90"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
            >
              Аудит земельного статуса, коммуникаций и строений. Проводим полную предпродажную подготовку и сопровождение сделок с загородной недвижимостью с 2022 года.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/20 text-[11px] uppercase tracking-[0.18em] text-white/80">
              <span className="inline-flex items-center gap-2 font-medium"><Calendar className="w-3.5 h-3.5 text-amber-400" /> На рынке с 2022 года</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium"><Compass className="w-3.5 h-3.5 text-emerald-400" /> Аудит границ по кадастру</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium"><Scale className="w-3.5 h-3.5 text-amber-300" /> Комиссия Минюста 1.5%–6%</span>
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
                <Award className="w-4 h-4" /> Минский район с 2022 года
              </div>
              <p className="text-xs leading-relaxed text-stone-600">
                1424+ клиентов выбрали нас для своих сделок с 2022 года. Проверка земли, отсутствие скрытых сервитутов и гарантия кадастровых границ.
              </p>
            </div>
          </aside>

          {/* Центральная колонка */}
          <main className="order-2 min-w-0 max-w-[880px] space-y-16">

            <ActiveSalePropertiesSection
              id="active-objects"
              sectionNumber="01"
              eyebrow="Загородные объекты с Realt.by"
              title="Действующие дома, коттеджи, дачи и участки в продаже"
              subtitle="Все действующие предложения загородной недвижимости и земельных участков агентства АН «Фаттория» на продажу."
              category="house_plot"
              properties={properties}
              agents={agents}
              onRequestConsultation={() =>
                document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })
              }
            />

            {/* 02: КАТЕГОРИИ */}
            <section id="categories" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                02 · Классификация загородных объектов
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 42px)', lineHeight: 1.15 }}
              >
                Коттеджи, дачи и участки: нюансы каждого формата
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                В загородной недвижимости 80% успеха зависит от юридического статуса земли и прозрачности коммуникаций. Покупатели боятся недостроев и скрытых дефектов, поэтому мы готовим объект так, чтобы у них не оставалось сомнений.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {houseCategories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col"
                  >
                    <div className="relative h-48 overflow-hidden bg-stone-100">
                      <img
                        src={cat.photo}
                        alt={cat.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <span className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                        {cat.tag}
                      </span>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-stone-900 font-semibold text-lg mb-2">
                          {cat.title}
                        </h3>
                        <p className="text-stone-600 text-xs leading-relaxed font-light mb-4">
                          {cat.desc}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setFormHouseType(cat.title);
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
                АН «Фаттория»: загородное направление с 2022 года
              </h2>
              <div className="prose text-stone-600 text-[16px] leading-relaxed font-light space-y-4">
                <p>
                  Загородное направление АН «Фаттория» развивается с 2022 года. За этот период мы накопили колоссальный опыт работы с сельскими исполнительными комитетами, садовыми товариществами Минского, Смолевичского, Дзержинского и Логойского районов.
                </p>
                <p>
                  Мы знаем особенности каждого направления: престижность и развитость инфраструктуры Мядельского и Молодечненского шоссе, живописность Логойского тракта, удобство выезда по Московской и Гродненской трассам. Мы не просто продаем стены — мы продаем образ жизни на природе.
                </p>
              </div>
            </section>

            {/* 03: АУДИТ */}
            <section id="audit" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                04 · Предпродажная проверка
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Земельный и технический аудит объекта
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Чтобы покупатель не потребовал расторжения договора из-за наложения границ забора или отсутствия разрешения на газ, мы проводим сплошной юридический и технический аудит до старта показов.
              </p>

              <div className="space-y-4">
                {auditPoints.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm flex items-start gap-4"
                  >
                    <CheckCircle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-stone-900 font-semibold text-base mb-1">
                        {pt.title}
                      </h4>
                      <p className="text-stone-600 text-sm leading-relaxed font-light">
                        {pt.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 04: АЭРОСЪЕМКА */}
            <section id="drone" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                05 · Продвижение
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Профессиональная презентация загородного объекта
              </h2>
              <div className="prose text-stone-600 text-[16px] leading-relaxed font-light space-y-4">
                <p>
                  С земли невозможно оценить прелесть загородного участка: близость соснового бора, водохранилища или удобный выезд на скоростную трассу. Профессиональный дрон поднимается на высоту птичьего полета и показывает объект в окружении природы.
                </p>
                <p>
                  Качественные фотографии участка, дома и подъездных путей наглядно демонстрируют достоинства объекта покупателям из Минска и других городов ещё до выезда на просмотр.
                </p>
              </div>
            </section>

            {/* 05: ДОКУМЕНТЫ */}
            <section id="documents" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                06 · Пакет документов
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Что необходимо подготовить для сделки в БТИ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-2">
                  <div className="font-semibold text-stone-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-800" /> На земельный участок
                  </div>
                  <ul className="text-xs text-stone-600 space-y-1.5 font-light leading-relaxed">
                    <li>• Свидетельство о государственной регистрации на землю</li>
                    <li>• Земельно-кадастровый план с фиксированными границами</li>
                    <li>• Справка об отсутствии задолженностей по земельному налогу</li>
                  </ul>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-2">
                  <div className="font-semibold text-stone-900 text-sm flex items-center gap-2">
                    <Home className="w-4 h-4 text-amber-800" /> На жилой дом / дачу
                  </div>
                  <ul className="text-xs text-stone-600 space-y-1.5 font-light leading-relaxed">
                    <li>• Технический паспорт на строение (актуальный)</li>
                    <li>• Свидетельство о праве собственности на дом</li>
                    <li>• Справка из СТ (для дач) об отсутствии долгов по взносам</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 06: СЕЗОННОСТЬ */}
            <section id="seasonality" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                07 · Маркетинговая стратегия
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Сезонность продаж загородной недвижимости в Беларуси
              </h2>
              <div className="prose text-stone-600 text-[16px] leading-relaxed font-light space-y-4">
                <p>
                  Многие продавцы ждут мая, чтобы выставить дом на продажу. Это стратегическая ошибка: в мае рынок перенасыщен предложениями, и внимание покупателей рассеивается.
                </p>
                <p>
                  Самые выгодные сделки заключаются ранней весной (февраль — апрель), когда покупатели активно ищут объект к новому дачному сезону при минимальной конкуренции других продавцов. Эксперты АН «Фаттория» готовят маркетинговую кампанию заранее, чтобы встретить пик спроса во всеоружии.
                </p>
              </div>
            </section>

            {/* 07: FAQ */}
            <section id="faq" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                08 · Часто задаваемые вопросы
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Вопросы собственников загородных домов
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
                Загородный отдел
              </div>
              <h3 className="text-stone-900 text-xl font-normal mb-2" style={{ fontFamily: displayFont }}>
                Оценка дома или дачи
              </h3>
              <p className="text-xs text-stone-500 mb-6 font-light leading-relaxed">
                Выезд эксперта по Минскому району и оперативный расчет рыночной стоимости.
              </p>

              {leadSent ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-semibold text-emerald-900 text-sm">Заявка принята!</div>
                  <p className="text-xs text-emerald-700 font-light">
                    Специалист загородного отдела свяжется с вами в течение 10 минут.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Тип объекта
                    </label>
                    <select
                      value={formHouseType}
                      onChange={(e) => setFormHouseType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                    >
                      <option value="Коттедж">Коттедж для постоянного проживания</option>
                      <option value="Дача в СТ">Дача в садовом товариществе</option>
                      <option value="Земельный участок">Земельный участок (ИЖС/ЛПХ)</option>
                      <option value="Незавершенный дом">Недострой (законсервированный)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Удаленность от МКАД
                    </label>
                    <select
                      value={formDistance}
                      onChange={(e) => setFormDistance(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                    >
                      <option value="до 10 км">до 10 км от МКАД</option>
                      <option value="10 - 25 км">10 - 25 км от МКАД</option>
                      <option value="25 - 50 км">25 - 50 км от МКАД</option>
                      <option value="более 50 км">более 50 км от МКАД</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Ваше имя
                    </label>
                    <input
                      type="text"
                      placeholder="Сергей"
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
                    <span>Заказать оценку дома</span>
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