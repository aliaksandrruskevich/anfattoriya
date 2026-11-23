"use client";
import React, { useEffect, useState } from 'react';
import {
  Scale, ClipboardCheck, FileSignature, Search, Calculator, FileText, Award,
  Building2, TrendingUp, ShieldCheck, Users, Clock, CheckCircle, Zap,
  ArrowRight, Share2, Bookmark, Phone, Layers,
  MapPin, Home as HomeIcon,
} from 'lucide-react';

const displayFont = "'Cormorant Garamond', 'Georgia', serif";
const bodyFont = "'Raleway', system-ui, sans-serif";

const HERO_PHOTO = '/photo/rielter.jpg';

const TOC_ITEMS_BASE = [
  { id: 'methodology', label: 'Как мы оцениваем' },
  { id: 'factors', label: 'Что учитывает эксперт' },
  { id: 'usecases', label: 'Когда необходима оценка' },
  { id: 'formats', label: 'Форматы оценки' },
  { id: 'trust', label: 'Почему нам доверяют' },
];

interface OcenkaPageProps {
  activePage?: string;
  navigateTo?: (pageId: any, queryParam?: string) => void;
  handleAddLead?: (name: string, phone: string, typeOrPrice: string, formName: string) => void;
}

// ============================================================
// Данные страницы оценки квартиры
// ============================================================
const KVARTIRA_DATA = {
  title: 'Оценка квартиры',
  subtitle: 'Профессиональная оценка жилой недвижимости',
  h1: 'Оценка квартиры в Минске и районе',
  bannerDesc:
    'Официальное определение рыночной стоимости квартиры на основе реальной базы сделок БРТИ. Бесплатная экспресс-оценка или полный отчёт для суда и банка.',
  icon: <Building2 className="w-3.5 h-3.5 text-amber-400" />,
  factors: [
    {
      icon: <MapPin className="w-5 h-5" />,
      title: 'Локация и транспорт',
      desc: 'Близость к метро, престижность района, удалённость от центра, экология.',
    },
    {
      icon: <HomeIcon className="w-5 h-5" />,
      title: 'Параметры квартиры',
      desc: 'Этаж, площадь, планировка, высота потолков, состояние ремонта.',
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Сделки БРТИ',
      desc: 'Сравнение с завершёнными сделками в вашем микрорайоне за последние 3 месяца.',
    },
  ],
};

export default function OcenkaPage({
  activePage = 'ocenka-kvartiry',
  navigateTo = () => {},
  handleAddLead = () => {},
}: OcenkaPageProps) {
  const [activeId, setActiveId] = useState<string>('methodology');
  const [bookmarked, setBookmarked] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formType, setFormType] = useState('Квартира');

  // Данные страницы (только оценка квартиры)
  const data = KVARTIRA_DATA;

  useEffect(() => {
    if (document.getElementById('hp-fonts')) return;
    const link = document.createElement('link');
    link.id = 'hp-fonts';
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Raleway:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const els = TOC_ITEMS_BASE.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
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
      formName.trim() || 'Клиент оценки',
      formPhone.trim(),
      `Оценка: ${formType}`,
      `${data.title}: форма`
    );
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormName('');
      setFormPhone('');
    }, 4500);
  };

  const stats = [
    { value: '100%', label: 'точность данных БРТИ' },
    { value: '15 мин.', label: 'экспресс-оценка' },
    { value: '3 дня', label: 'срок экспертизы' },
    { value: 'СТБ', label: 'государственный стандарт' },
  ];

  const steps = [
    {
      icon: <Search className="w-5 h-5" />,
      title: 'Анализ рынка',
      desc: 'Сравниваем объект с реальными завершёнными сделками купли-продажи аналогичных объектов за последние 3 месяца. Используем данные реестра сделок БРТИ и НКА.',
    },
    {
      icon: <Calculator className="w-5 h-5" />,
      title: 'Расчёт стоимости',
      desc: 'Применяем три метода оценки: сравнительный (аналоги), доходный (для коммерческой) и затратный. Выводим средневзвешенную рыночную стоимость.',
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'Оформление заключения',
      desc: 'Готовим официальный Отчёт об оценке по стандартам СТБ. Документ имеет полную юридическую силу для судов, банков, нотариусов.',
    },
  ];

  const useCases = [
    {
      icon: <Scale className="w-5 h-5" />,
      title: 'Раздел имущества и суды',
      desc: 'Официальное заключение является юридическим документом для судов РБ при разделе имущества, наследовании или спорах.',
    },
    {
      icon: <ClipboardCheck className="w-5 h-5" />,
      title: 'Кредитование и ипотека',
      desc: 'Оценка необходима банкам (Беларусбанк, Белагропромбанк, Приорбанк) при оформлении залога.',
    },
    {
      icon: <FileSignature className="w-5 h-5" />,
      title: 'Сделки купли-продажи',
      desc: 'Помогает не занизить стоимость и обосновать цену перед покупателем на основе данных БРТИ.',
    },
  ];

  const trust = [
    { icon: <ShieldCheck className="w-5 h-5" />, title: 'Надёжность', desc: 'Профессиональное агентство недвижимости Минска и Беларуси.' },
    { icon: <Clock className="w-5 h-5" />, title: 'Скорость', desc: 'Экспресс — 15 минут. Полный отчёт — 1–3 рабочих дня.' },
    { icon: <Users className="w-5 h-5" />, title: 'Доверие', desc: 'Индивидуальный расчет и детальное обоснование каждого отчета.' },
    { icon: <Award className="w-5 h-5" />, title: 'Безопасность', desc: 'Полная юридическая экспертиза и лицензированная деятельность.' },
    { icon: <Building2 className="w-5 h-5" />, title: 'Законность', desc: 'Нотариус, БРТИ, Белгосстрах. Полное сопровождение.' },
    { icon: <TrendingUp className="w-5 h-5" />, title: 'Аналитика', desc: 'Актуальная база цен реальных завершенных сделок.' },
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#171412]" style={{ fontFamily: bodyFont }}>

      {/* HERO BANNER */}
      <section className="relative overflow-hidden bg-neutral-950 text-white min-h-[520px] lg:min-h-[620px] flex items-end">
        <img
          src={HERO_PHOTO}
          alt={data.title}
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/30" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 pt-32 pb-20 lg:pb-28 w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-white/40 text-xs">•</span>
            <span className="text-white/70 text-xs uppercase tracking-wider font-medium">Экспертная оценка</span>
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/25 text-white px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.25em] mb-6">
              {data.icon}
              <span>АН «Фаттория» · {data.title}</span>
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
              {data.h1}
            </h1>

            <p
              className="text-[17px] lg:text-[21px] font-light leading-relaxed max-w-3xl mb-8 text-white/90"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
            >
              {data.bannerDesc}
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/20 text-[11px] uppercase tracking-[0.18em] text-white/80">
              <span className="inline-flex items-center gap-2 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> 100% точность данных БРТИ
              </span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> Экспресс — 15 минут
              </span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium">
                <Award className="w-3.5 h-3.5 text-sky-400" /> Стандарт СТБ
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* EDITORIAL SHEET */}
      <div className="relative -mt-10 lg:-mt-14 rounded-t-[36px] lg:rounded-t-[50px] bg-white border-t border-[#E7E2DA] shadow-2xl z-20">
        <div className="max-w-[1520px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_340px] gap-10 xl:gap-14 pt-12 lg:pt-16 pb-20">

          {/* Левая колонка */}
          <aside className="lg:sticky lg:top-28 lg:h-fit space-y-6 order-1">
            <div className="bg-stone-50/90 p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] mb-4 pb-3 border-b border-stone-200 text-stone-900">
                Содержание
              </div>
              <nav className="space-y-1">
                {TOC_ITEMS_BASE.map((item, i) => {
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
                  className="flex-1 py-2 px-3 text-[11px] font-semibold uppercase tracking-wider rounded-xl border border-stone-300 bg-white hover:border-stone-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-600 text-amber-600' : 'text-stone-600'}`} />
                  <span>{bookmarked ? 'В закладках' : 'Сохранить'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-2 px-3 text-[11px] font-semibold uppercase tracking-wider rounded-xl border border-stone-300 bg-white hover:border-stone-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-stone-600" />
                  <span>{shareCopied ? 'Скопировано' : 'Поделиться'}</span>
                </button>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-amber-50 to-stone-100 rounded-2xl border border-amber-200/70 text-stone-800">
              <div className="flex items-center gap-2 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Award className="w-4 h-4" /> Оценка от агентства
              </div>
              <p className="text-xs leading-relaxed text-stone-600">
                Экспресс — 15 минут бесплатно. Официальный отчёт — 1–3 рабочих дня, стандарт СТБ, юридическая сила для суда и банка.
              </p>
            </div>
          </aside>

          {/* Центральная колонка */}
          <main className="order-2 min-w-0 max-w-[880px] space-y-16">

            {/* 01: МЕТОДОЛОГИЯ */}
            <section id="methodology" className="scroll-mt-32">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                01 · Методология
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 42px)', lineHeight: 1.15 }}
              >
                Как мы оцениваем
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                {data.subtitle}
              </p>

              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-amber-50 text-amber-800">
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-light" style={{ fontFamily: displayFont, color: 'rgba(146, 64, 14, 0.35)' }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-stone-900 font-semibold text-base">{step.title}</h3>
                      </div>
                      <p className="text-sm text-stone-600 leading-relaxed font-light">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 02: ФАКТОРЫ */}
            <section id="factors" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                02 · Аналитика
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Что учитывает эксперт
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Ключевые факторы, влияющие на стоимость объекта.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.factors.map((item, i) => (
                  <div key={i} className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 bg-amber-50 text-amber-800">
                      {item.icon}
                    </div>
                    <h3 className="text-stone-900 font-semibold text-base mb-2">{item.title}</h3>
                    <p className="text-sm text-stone-600 leading-relaxed font-light">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 03: КОГДА НУЖНА ОЦЕНКА */}
            <section id="usecases" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                03 · Применение
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Когда необходима оценка
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Ситуации, в которых требуется официальное заключение.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {useCases.map((item, i) => (
                  <div key={i} className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 bg-stone-900 text-amber-50">
                      {item.icon}
                    </div>
                    <h3 className="text-stone-900 font-semibold text-base mb-2">{item.title}</h3>
                    <p className="text-sm text-stone-600 leading-relaxed font-light">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 04: ФОРМАТЫ */}
            <section id="formats" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                04 · Варианты
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Выберите формат оценки
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Два варианта — от быстрой консультации до официального заключения.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm">
                  <div className="text-[11px] font-bold uppercase tracking-wider mb-4 text-amber-800">
                    Бесплатно
                  </div>
                  <h3 className="text-stone-900 mb-3" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: '24px' }}>
                    Экспресс-оценка риэлтора
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed mb-6 font-light">
                    За 15–30 минут по телефону или в офисе. Анализируем текущие предложения и недавние сделки. Подходит для планирования продажи.
                  </p>
                  <div className="space-y-3 text-sm text-stone-700">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 shrink-0 text-amber-800" /> Время: 15 минут
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 shrink-0 text-amber-800" /> Стоимость: бесплатно
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 shrink-0 text-amber-800" /> Документы: не требуются
                    </div>
                    <div className="flex items-center gap-3 text-stone-400">
                      <Zap className="w-4 h-4 shrink-0" /> Юридическая сила: справочно
                    </div>
                  </div>
                </div>

                <div className="p-7 bg-white rounded-3xl border border-amber-200 shadow-md">
                  <div className="text-[11px] font-bold uppercase tracking-wider mb-4 text-amber-800">
                    Госстандарт
                  </div>
                  <h3 className="text-stone-900 mb-3" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: '24px' }}>
                    Официальная экспертиза
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed mb-6 font-light">
                    С выездом оценщика, актом осмотра, фотофиксацией и официальным Заключением по стандартам СТБ.
                  </p>
                  <div className="space-y-3 text-sm text-stone-700">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 shrink-0 text-amber-800" /> Время: 1–3 рабочих дня
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 shrink-0 text-amber-800" /> Стоимость: по тарифам
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 shrink-0 text-amber-800" /> Документы: техпаспорт, свидетельство
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 shrink-0 text-amber-800" /> Юридическая сила: полная
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 05: ДОВЕРИЕ */}
            <section id="trust" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                05 · Репутация и гарантии
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Почему нам доверяют
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trust.map((item, i) => (
                  <div key={i} className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center mb-3 bg-amber-50 text-amber-800">
                      {item.icon}
                    </div>
                    <h3 className="text-stone-900 font-semibold text-sm mb-1.5">{item.title}</h3>
                    <p className="text-xs text-stone-600 leading-relaxed font-light">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

          </main>

          {/* Правая колонка */}
          <aside className="order-3 lg:col-start-2 xl:col-start-3 xl:row-start-1 xl:sticky xl:top-28 xl:h-fit space-y-6">

            <div id="lead-form" className="p-7 bg-white rounded-3xl border border-stone-200 shadow-md">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-800 mb-2">
                Экспертная оценка
              </div>
              <h3 className="text-stone-900 text-xl font-normal mb-2" style={{ fontFamily: displayFont }}>
                Получить оценку
              </h3>
              <p className="text-xs text-stone-500 mb-6 font-light leading-relaxed">
                Оставьте контакт — экспресс-оценка бесплатно, в течение 15 минут.
              </p>

              {submitted ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-semibold text-emerald-900 text-sm">Заявка принята!</div>
                  <p className="text-xs text-emerald-700 font-light">
                    Специалист свяжется с вами для уточнения деталей.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Тип объекта
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                    >
                      <option value="Квартира">Квартира</option>
                      <option value="Дом / Дача">Дом / Дача</option>
                      <option value="Коммерческая">Коммерческая</option>
                      <option value="Участок">Участок</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Ваше имя
                    </label>
                    <input
                      type="text"
                      placeholder="Ваше имя"
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
                    <span>Получить оценку</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

            <div className="p-6 bg-gradient-to-br from-amber-50 to-stone-100 rounded-3xl border border-amber-200/70">
              <div className="flex items-center gap-2 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Phone className="w-4 h-4" /> Прямая связь
              </div>
              <a
                href="tel:+375296380053"
                className="text-sm font-mono font-bold text-stone-900 hover:text-amber-800 transition-colors"
              >
                +375 29 638-00-53
              </a>
              <p className="text-[11px] text-stone-500 mt-2 font-light">
                г. Минск, ул. Репина, д. 4, пом. 458
              </p>
            </div>

          </aside>

        </div>
      </div>

    </div>
  );
}