"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Star, Users, ShieldCheck, Camera, TrendingUp, CheckCircle, XCircle,
  Award, BarChart3, MessageSquare, Zap, Scale, Quote, Calculator,
  ClipboardList, Handshake, FileCheck, ArrowRight, Plus, Minus, Calendar,
  Building2, Clock, Share2, Bookmark, Phone, Send, MessageCircle, Sparkles,
} from 'lucide-react';
import { PageId } from '../types';

interface TrialPeriodPageProps {
  activePage?: PageId;
  navigateTo?: (pageId: PageId, q?: string) => void;
  handleAddLead?: (name: string, phone: string, comment: string, source: string) => void;
}

const displayFont = "'Cormorant Garamond', 'Georgia', serif";
const bodyFont = "'Raleway', system-ui, sans-serif";

const HERO_PHOTO = '/photo/stati.jpg';

const TOC_ITEMS = [
  { id: 'trust', label: 'Почему владельцы выбирают нас' },
  { id: 'included', label: 'Что вы получите' },
  { id: 'timeline', label: 'Ваш путь к продаже' },
  { id: 'marketing', label: 'Маркетинговая система' },
  { id: 'expertise', label: 'Экспертиза' },
  { id: 'presentation', label: 'Презентация объекта' },
  { id: 'faq', label: 'Часто задаваемые вопросы' },
];

export default function TrialPeriodPage({ navigateTo = () => {}, handleAddLead = () => {} }: TrialPeriodPageProps) {
  const [activeId, setActiveId] = useState<string>('trust');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [leadSent, setLeadSent] = useState(false);

  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');

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
      formName.trim() || 'Клиент тест-драйва',
      formPhone.trim(),
      'Программа: Тест-драйв (10 дней)',
      'trial-period'
    );
    setLeadSent(true);
    setTimeout(() => {
      setLeadSent(false);
      setFormName('');
      setFormPhone('');
    }, 4500);
  };

  const trustCards = [
    { icon: <BarChart3 className="w-6 h-6" />, title: 'Экспертная оценка стоимости', desc: 'Анализируем район, аналоги продаж, спрос покупателей, сезонность и рыночную ситуацию.' },
    { icon: <Camera className="w-6 h-6" />, title: 'Премиальное представление', desc: 'Профессиональный фотограф, видео, планировка, продающий текст и продвижение на площадках.' },
    { icon: <Users className="w-6 h-6" />, title: 'Персональный менеджер', desc: 'Один специалист отвечает за весь процесс продажи. Вы не теряете нить сделки.' },
  ];

  const included = [
    { icon: <Zap className="w-5 h-5" />, title: 'Анализ рынка', sub: 'Глубокий разбор цены' },
    { icon: <Camera className="w-5 h-5" />, title: 'Фото / видео', sub: 'Премиальный контент' },
    { icon: <TrendingUp className="w-5 h-5" />, title: 'Реклама', sub: '8+ площадок' },
    { icon: <MessageSquare className="w-5 h-5" />, title: 'Переговоры', sub: 'Защита вашей цены' },
  ];

  const timeline = [
    { icon: <Calculator className="w-5 h-5" />, day: 'День 1', title: 'Встреча и стратегия', items: ['Анализ объекта', 'Оценка стоимости', 'План продажи'] },
    { icon: <ClipboardList className="w-5 h-5" />, day: 'Дни 1-2', title: 'Подготовка объекта', items: ['Фото и видео', 'Продающее описание', 'Рекламная стратегия'] },
    { icon: <Handshake className="w-5 h-5" />, day: 'Дни 2-4', title: 'Поиск покупателей', items: ['Запуск рекламы', 'Звонки и показы', 'Переговоры об оффере'] },
  ];

  const expertise = [
    { icon: <Award className="w-6 h-6" />, title: 'Аттестованные эксперты', desc: 'Каждый специалист имеет государственную аттестацию и многолетний опыт в недвижимости Минска.' },
    { icon: <Scale className="w-6 h-6" />, title: 'Юридическая поддержка', desc: 'Полное сопровождение сделки, проверка документов и защита ваших интересов на каждом этапе.' },
    { icon: <FileCheck className="w-6 h-6" />, title: 'Контроль качества', desc: 'Служба контроля качества лично следит за каждым этапом вашей сделки.' },
  ];

  const faqItems = [
    { q: 'Можно ли отказаться после тест-драйва?', a: 'Да. Вы получаете объективную картину рынка без обязательств. Программа создана, чтобы дать вам полную прозрачность и уверенность перед принятием решения.' },
    { q: 'Почему вы можете продать дороже?', a: 'Потому что мы не просто публикуем объявления, а создаём конкуренцию между покупателями. Закрытые данные рынка, эксклюзивный маркетинг и тактика переговоров защищают вашу цену.' },
    { q: 'Зачем нужен риэлтер, если есть площадки объявлений?', a: 'Площадки дают просмотры. Эксперт создаёт сделку — превращает холодные просмотры в реальные офферы, отсеивает несерьёзных клиентов и ведёт переговоры до конца.' },
    { q: 'Что входит в премиальную программу?', a: 'Глубокий анализ объекта, премиальная фото- и видеосъёмка, стратегия создания спроса, реклама на 8+ площадках, полное юридическое сопровождение и личный менеджер на всех этапах.' },
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#171412]" style={{ fontFamily: bodyFont }}>

      {/* HERO BANNER */}
      <section className="relative overflow-hidden bg-neutral-950 text-white min-h-[520px] lg:min-h-[620px] flex items-end">
        <img
          src={HERO_PHOTO}
          alt="Тест-драйв услуг агентства недвижимости"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/30" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-900/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 pt-32 pb-20 lg:pb-28 w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-white/40 text-xs">•</span>
            <span className="text-white/70 text-xs uppercase tracking-wider font-medium">Тест-драйв услуг</span>
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/25 text-white px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.25em] mb-6">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>АН «Фаттория» · Тест-драйв 10 дней</span>
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
              Продайте недвижимость максимально выгодно
            </h1>

            <p
              className="text-[17px] lg:text-[21px] font-light leading-relaxed max-w-3xl mb-8 text-white/90"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
            >
              За 10 дней узнайте реальную цену вашего объекта и получите первые предложения от покупателей — с персональной стратегией, аналитикой рынка и командой экспертов.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/20 text-[11px] uppercase tracking-[0.18em] text-white/80">
              <span className="inline-flex items-center gap-2 font-medium">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                0 руб. до сделки
              </span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                Юридическая чистота
              </span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium">
                <Users className="w-3.5 h-3.5 text-purple-300" />
                Персональный риэлтер
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
                {TOC_ITEMS.map((item, i) => {
                  const on = activeId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                      className="flex w-full items-start gap-2.5 text-left text-[13px] leading-snug py-2 px-2.5 rounded-lg transition-all hover:text-stone-900 cursor-pointer"
                      style={on ? { color: '#171412', background: '#F5F3FF', fontWeight: 600 } : { color: '#6B645C' }}
                    >
                      <span className="mt-[2px] text-[10px] font-semibold tabular-nums text-purple-700">
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
                  className="flex-1 py-2 px-3 text-[11px] font-semibold uppercase tracking-wider rounded-xl border border-stone-300 bg-white hover:border-purple-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-purple-600 text-purple-600' : 'text-stone-600'}`} />
                  <span>{bookmarked ? 'В закладках' : 'Сохранить'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-2 px-3 text-[11px] font-semibold uppercase tracking-wider rounded-xl border border-stone-300 bg-white hover:border-purple-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-stone-600" />
                  <span>{shareCopied ? 'Скопировано' : 'Поделиться'}</span>
                </button>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-purple-50 to-stone-100 rounded-2xl border border-purple-200/70 text-stone-800">
              <div className="flex items-center gap-2 text-purple-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Award className="w-4 h-4" /> Тест-драйв
              </div>
              <p className="text-xs leading-relaxed text-stone-600">
                Программа для собственников, которые хотят увидеть результат до подписания договора.
              </p>
            </div>
          </aside>

          {/* Центральная колонка */}
          <main className="order-2 min-w-0 max-w-[880px] space-y-16">

            {/* 01: ДОВЕРИЕ */}
            <section id="trust" className="scroll-mt-32">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                01 · Почему владельцы выбирают нас
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 42px)', lineHeight: 1.15 }}
              >
                Программа, которой доверяют
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Мы не просто публикуем объявления — мы создаём условия, при которых покупатели начинают конкурировать за ваш объект.
              </p>

              <div className="space-y-4">
                {trustCards.map((c, i) => (
                  <div key={i} className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm flex items-start gap-4 hover:shadow-md hover:border-purple-200 transition-all">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-purple-50 border border-purple-200 text-purple-700">
                      {c.icon}
                    </div>
                    <div>
                      <h4 className="text-stone-900 font-semibold text-base mb-1">{c.title}</h4>
                      <p className="text-stone-600 text-sm leading-relaxed font-light">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 02: ЧТО ВХОДИТ */}
            <section id="included" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                02 · Что входит за 10 дней
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Что вы получите
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Концентрат премиальных услуг, который показывает полную картину рынка ещё до решения о продаже.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {included.map((it, i) => (
                  <div key={i} className="p-5 bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all">
                    <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center mb-3 text-purple-700">
                      {it.icon}
                    </div>
                    <div className="text-stone-900 font-semibold text-sm">{it.title}</div>
                    <div className="text-stone-400 text-xs mt-1 font-light">{it.sub}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* 03: ПУТЬ К ПРОДАЖЕ */}
            <section id="timeline" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                03 · От встречи до сделки
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Ваш путь к продаже
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {timeline.map((step, i) => (
                  <div key={i} className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-purple-50 border border-purple-200 text-purple-700">
                        {step.icon}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-700">{step.day}</span>
                    </div>
                    <h4 className="text-stone-900 text-base font-semibold mb-3">{step.title}</h4>
                    <ul className="space-y-2">
                      {step.items.map((it, j) => (
                        <li key={j} className="flex items-center gap-2.5 text-sm text-stone-600 font-light">
                          <CheckCircle className="w-4 h-4 shrink-0 text-purple-600" /> {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* 04: МАРКЕТИНГ */}
            <section id="marketing" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                04 · Маркетинговая система
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Создаём спрос, а не просто показы
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Мы не размещаем объявления — мы выстраиваем стратегию, которая заставляет покупателей конкурировать за ваш объект.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: <Camera className="w-5 h-5" />, label: 'Фото' },
                  { icon: <BarChart3 className="w-5 h-5" />, label: 'Аналитика' },
                  { icon: <TrendingUp className="w-5 h-5" />, label: '8+ площадок' },
                  { icon: <Users className="w-5 h-5" />, label: 'Целевые показы' },
                ].map((it, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-purple-200 transition-all">
                    <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center mb-2 text-purple-700">
                      {it.icon}
                    </div>
                    <div className="text-stone-900 text-sm font-medium">{it.label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* 05: ЭКСПЕРТИЗА */}
            <section id="expertise" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                05 · Кому вы доверяете сделку
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Экспертиза, которой можно верить
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {expertise.map((item, i) => (
                  <div key={i} className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center mb-4 bg-[#141312] text-purple-300">
                      {item.icon}
                    </div>
                    <h3 className="text-stone-900 mb-2 text-sm font-semibold uppercase tracking-wider">{item.title}</h3>
                    <p className="text-sm text-stone-600 leading-relaxed font-light">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 06: ПРЕЗЕНТАЦИЯ */}
            <section id="presentation" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                06 · Презентация объекта
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Как мы превращаем недвижимость в спрос
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-6 font-light">
                Каждый объект получает индивидуальную стратегию презентации — визуальный образ, который привлекает именно вашего покупателя.
              </p>
              <div className="space-y-2.5 text-sm text-stone-700 font-light">
                {['Профессиональная фото- и видеосъёмка', 'Визуализация и планировки', 'Продающий текст и описание'].map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 shrink-0 text-purple-600" /> {t}
                  </div>
                ))}
              </div>
            </section>

            {/* 07: FAQ */}
            <section id="faq" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                07 · Часто задаваемые вопросы
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Вопросы о тест-драйве
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
                        {isOpen
                          ? <Minus className="w-4 h-4 text-purple-600 shrink-0" />
                          : <Plus className="w-4 h-4 text-stone-500 shrink-0" />}
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
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-purple-700 mb-2">
                Тест-драйв услуг
              </div>
              <h3 className="text-stone-900 text-xl font-normal mb-2" style={{ fontFamily: displayFont }}>
                Получить стратегию
              </h3>
              <p className="text-xs text-stone-500 mb-6 font-light leading-relaxed">
                Оставьте контактный номер — специалист свяжется и расскажет, как проходит программа.
              </p>

              {leadSent ? (
                <div className="p-5 bg-purple-50 border border-purple-200 rounded-2xl text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-purple-600 mx-auto" />
                  <div className="font-semibold text-purple-900 text-sm">Заявка принята!</div>
                  <p className="text-xs text-purple-700 font-light">
                    Мы свяжемся с вами в ближайшее время.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Ваше имя
                    </label>
                    <input
                      type="text"
                      placeholder="Ваше имя"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
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
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-600/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Получить стратегию</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-stone-100 rounded-3xl border border-purple-200/70">
              <div className="flex items-center gap-2 text-purple-800 text-[11px] font-bold uppercase tracking-wider mb-3">
                <Phone className="w-4 h-4" /> Прямая связь
              </div>
              <a
                href="tel:+375296380053"
                className="text-sm font-mono font-bold text-stone-900 hover:text-purple-800 transition-colors"
              >
                +375 29 638-00-53
              </a>
              <p className="text-[11px] text-stone-500 mt-2 font-light">
                г. Минск, ул. Репина, д. 4, пом. 458
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-stone-50 to-stone-100 rounded-3xl border border-stone-200">
              <div className="flex items-center gap-2 text-stone-700 text-[11px] font-bold uppercase tracking-wider mb-3">
                <Clock className="w-4 h-4" /> Режим работы
              </div>
              <div className="space-y-1.5 text-xs text-stone-600">
                <p className="flex justify-between">
                  <span>пн–пт</span>
                  <span className="font-medium text-stone-900">9:00 — 21:00</span>
                </p>
                <p className="flex justify-between">
                  <span>сб</span>
                  <span className="font-medium text-stone-900">10:00 — 15:00</span>
                </p>
                <p className="flex justify-between">
                  <span>вс</span>
                  <span className="font-medium text-stone-900">по записи</span>
                </p>
              </div>
            </div>

          </aside>

        </div>
      </div>

    </div>
  );
}