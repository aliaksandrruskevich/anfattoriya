"use client";
import React, { useEffect, useState } from 'react';
import {
  ArrowRightLeft, Home, Wallet, ShieldCheck, Users, Clock,
  Building2, FileText, TrendingUp, Award, CheckCircle2, Zap, Layers,
  ArrowLeftRight, Scale, Briefcase, PhoneCall, Search, Handshake,
  FileCheck, KeyRound, AlertTriangle, Landmark, Plus, Minus, HelpCircle,
  ArrowRight, Share2, Bookmark, Phone, Sparkles, CheckCircle, Calendar,
} from 'lucide-react';
import { PageId } from '../types';

interface Props {
  activePage: PageId;
  navigateTo: (p: PageId) => void;
  handleAddLead: (n: string, ph: string, e: string, s: string) => void;
}

const displayFont = "'Cormorant Garamond', 'Georgia', serif";
const bodyFont = "'Raleway', system-ui, sans-serif";

const HERO_PHOTO = '/photo/header.jpg';

const TOC_ITEMS = [
  { id: 'services', label: 'Схемы обмена' },
  { id: 'how', label: 'Как проходит обмен' },
  { id: 'expertise', label: 'Юридическая экспертиза' },
  { id: 'risks', label: 'Риски и защита' },
  { id: 'cases', label: 'Примеры обменов' },
  { id: 'trust', label: 'Почему нам доверяют' },
  { id: 'faq', label: 'Частые вопросы' },
];

export default function ObmenNedvizhimostiPage({ activePage, navigateTo, handleAddLead }: Props) {
  const [activeId, setActiveId] = useState<string>('services');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [leadSent, setLeadSent] = useState(false);

  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formType, setFormType] = useState('Разъезд (одну на две)');

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
      formName.trim() || 'Клиент по обмену',
      formPhone.trim(),
      `Тип обмена: ${formType}`,
      'obmen-nedvizhimosti'
    );
    setLeadSent(true);
    setTimeout(() => {
      setLeadSent(false);
      setFormName('');
      setFormPhone('');
    }, 4500);
  };

  const services = [
    {
      icon: <ArrowLeftRight className="w-6 h-6" />,
      title: 'Прямой обмен (мена)',
      desc: 'Два собственника обмениваются объектами по одному договору. Если объекты неравнозначны — оформляем доплату.',
      badge: 'Стандартная схема',
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: 'Разъезд (альтернатива)',
      desc: 'Одновременная продажа одного объекта и покупка другого. В цепочке может быть 3–5 квартир. Все договоры в один день.',
      badge: 'Сложные цепочки',
    },
    {
      icon: <Wallet className="w-6 h-6" />,
      title: 'Обмен с доплатой',
      desc: 'Самый популярный вариант. Продажа своей квартиры и покупка другой с использованием вырученных средств плюс доплата.',
      badge: 'С доплатой',
    },
    {
      icon: <Home className="w-6 h-6" />,
      title: 'Город на загород',
      desc: 'Обмен квартиры в Минске на дом, дачу или участок с пересчётом стоимости и юридической проверкой земли.',
      badge: 'Город ↔ загород',
    },
  ];

  const steps = [
    { icon: <PhoneCall className="w-5 h-5" />, title: 'Консультация и подбор схемы', desc: 'Разбираем вашу ситуацию — сколько сторон в цепочке, какие сроки и бюджет доплаты нужны.' },
    { icon: <Search className="w-5 h-5" />, title: 'Поиск встречных вариантов', desc: 'Подбираем объекты под каждую сторону цепочки одновременно по актуальному каталогу и новым предложениям собственников.' },
    { icon: <Scale className="w-5 h-5" />, title: 'Оценка и расчёт доплаты', desc: 'Независимая оценка всех объектов цепочки, точный расчёт равноценности и доплаты.' },
    { icon: <FileCheck className="w-5 h-5" />, title: 'Юридическая проверка', desc: 'Каждый объект в цепочке проходит отдельную проверку чистоты — риск оценивается по слабому звену.' },
    { icon: <Handshake className="w-5 h-5" />, title: 'Синхронное подписание', desc: 'Все договоры цепочки подписываются в один день, чтобы никто не остался без жилья и без денег.' },
    { icon: <KeyRound className="w-5 h-5" />, title: 'Расчёты и передача ключей', desc: 'Аккредитивы или банковские ячейки, регистрация переходов права, передаточные акты по каждому объекту.' },
  ];

  const risks = [
    { risk: 'Цепочка рвётся на середине пути', fix: 'Все договоры подписываются синхронно, в один день — ни одна сторона не остаётся без вариантов.' },
    { risk: 'Потеря денег при расчётах между сторонами', fix: 'Только банковские ячейки и аккредитивы — доступ к деньгам только после регистрации перехода права.' },
    { risk: 'Юридическая нечистота одного объекта тянет всю цепочку', fix: 'Каждый объект в цепочке проверяется юристом отдельно, до включения в схему обмена.' },
    { risk: 'Несовпадение сроков освобождения жилья', fix: 'График освобождения согласуется письменно с каждой стороной заранее, до подписания.' },
    { risk: 'Спор о неравноценности объектов', fix: 'Независимая оценка каждого объекта и прозрачный расчёт доплаты, зафиксированный в договоре.' },
  ];

  const cases = [
    { title: 'Разъезд после развода', from: '3-комнатная в Уручье', to: '2 однокомнатные, Малиновка и Серебрянка', time: '19 дней', note: 'Цепочка из 3 сторон, синхронное подписание в один день.' },
    { title: 'Съезд молодой семьи', from: 'Две однокомнатные квартиры', to: '3-комнатная в центре с доплатой', time: '26 дней', note: 'Родители переехали в квартиру детей, доплата закрыта за счёт продажи.' },
    { title: 'Город на загород', from: '2-комнатная квартира в Минске', to: 'Дом с участком в 20 км от города', time: '31 день', note: 'Дополнительная проверка земельного участка и коммуникаций.' },
  ];

  const faqItems = [
    { q: 'Нужно ли платить налог при обмене квартиры?', a: 'Зависит от того, единственное ли это жильё и сколько лет оно в собственности. На бесплатной консультации юрист рассчитает именно вашу ситуацию с учётом всех сторон цепочки.' },
    { q: 'Можно ли обменять квартиру с непогашенной ипотекой?', a: 'Да, но потребуется согласие банка-залогодержателя. Мы сопровождаем и эту часть сделки — согласовываем схему с банком до начала поиска вариантов.' },
    { q: 'Сколько времени занимает цепочка из 4–5 квартир?', a: 'Средний срок — 26 дней, минимальный — 2 дня. Точный срок зависит от скорости подбора встречных вариантов и готовности документов у каждой стороны.' },
    { q: 'Что будет, если один из участников цепочки передумает?', a: 'До подписания договоров любая сторона может выйти — но мы заранее фиксируем намерения авансовыми соглашениями, чтобы снизить этот риск для всех участников.' },
    { q: 'Как рассчитывается доплата при неравноценном обмене?', a: 'На основе независимой оценки каждого объекта по реестру реальных сделок НКА и БРТИ — не по объявлениям. Разница фиксируется в договоре мены.' },
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#171412]" style={{ fontFamily: bodyFont }}>

      {/* HERO BANNER */}
      <section className="relative overflow-hidden bg-neutral-950 text-white min-h-[520px] lg:min-h-[620px] flex items-end">
        <img
          src={HERO_PHOTO}
          alt="Обмен недвижимости и сложные разъезды"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/30" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 pt-32 pb-20 lg:pb-28 w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-white/40 text-xs">•</span>
            <span className="text-white/70 text-xs uppercase tracking-wider font-medium">Обмен жилья</span>
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/25 text-white px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.25em] mb-6">
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>АН «Фаттория» · Премиальный сервис обмена</span>
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
              Обмен недвижимости и сложные разъезды в Минске
            </h1>

            <p
              className="text-[17px] lg:text-[21px] font-light leading-relaxed max-w-3xl mb-8 text-white/90"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
            >
              Поможем разъехаться, съехаться, обменять квартиру в Минске на загородный дом с одновременным юридическим оформлением.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/20 text-[11px] uppercase tracking-[0.18em] text-white/80">
              <span className="inline-flex items-center gap-2 font-medium"><ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> 100% юридическая защита</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium"><Wallet className="w-3.5 h-3.5 text-emerald-400" /> 0 руб. предоплаты</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium"><Clock className="w-3.5 h-3.5 text-sky-400" /> Поддержка 24/7</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium"><Building2 className="w-3.5 h-3.5 text-amber-300" /> Сопровождение БРТИ</span>
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
                <Award className="w-4 h-4" /> Обмен с 2022 года
              </div>
              <p className="text-xs leading-relaxed text-stone-600">
                1424+ клиентов выбрали нас для своих сделок. Средний срок — 26 дней, минимальный — 2 дня.
              </p>
            </div>
          </aside>

          {/* Центральная колонка */}
          <main className="order-2 min-w-0 max-w-[880px] space-y-16">

            {/* 01: СХЕМЫ ОБМЕНА */}
            <section id="services" className="scroll-mt-32">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                01 · Схемы обмена
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 42px)', lineHeight: 1.15 }}
              >
                Что мы решаем
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Сложные цепочки, альтернативы, обмены с доплатой — любой сценарий разъезда, съезда или встречной сделки.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((item, i) => (
                  <div key={i} className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center mb-4 bg-amber-50 text-amber-800">
                      {item.icon}
                    </div>
                    <div className="inline-block text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-3 bg-amber-50 text-amber-800">
                      {item.badge}
                    </div>
                    <h3 className="text-stone-900 font-semibold text-lg mb-2" style={{ fontFamily: displayFont, fontWeight: 400 }}>{item.title}</h3>
                    <p className="text-stone-600 text-sm leading-relaxed font-light">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 02: КАК ПРОХОДИТ ОБМЕН */}
            <section id="how" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                02 · От консультации до ключей
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Как проходит обмен
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Каждый шаг зафиксирован и согласован со всеми сторонами цепочки заранее.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {steps.map((step, i) => (
                  <div key={i} className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-amber-50 text-amber-800">
                        {step.icon}
                      </div>
                      <span className="text-3xl font-light" style={{ fontFamily: displayFont, color: 'rgba(146, 64, 14, 0.35)' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="text-stone-900 font-semibold text-[15px] mb-2">{step.title}</h3>
                    <p className="text-stone-600 text-sm leading-relaxed font-light">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 03: ЮРИДИЧЕСКАЯ ЭКСПЕРТИЗА */}
            <section id="expertise" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                03 · Юридическая экспертиза
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Обмен с доплатой: схемы, риски и безопасность
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Обмен (разъезд) квартир — одна из самых сложных риэлторских операций, требующая синхронизации интересов нескольких сторон. Наши специалисты провели десятки успешных обменных сделок любой сложности.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-stone-200 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-amber-800" />
                  <div>
                    <span className="text-stone-900 font-semibold">Банковские ячейки и аккредитивы</span>
                    <p className="text-sm text-stone-600 mt-1 font-light">Все расчёты проводятся только через защищённые финансовые инструменты.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-stone-200 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-amber-800" />
                  <div>
                    <span className="text-stone-900 font-semibold">Синхронизация сделок</span>
                    <p className="text-sm text-stone-600 mt-1 font-light">Договоры подписываются в один день, чтобы исключить риски отмены.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 04: РИСКИ */}
            <section id="risks" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                04 · Честно о сложностях
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Риски обмена и как мы их закрываем
              </h2>

              <div className="border border-stone-200 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-2 text-xs font-bold uppercase tracking-wider bg-stone-50">
                  <div className="p-4 lg:p-5 text-stone-500 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5" /> Типичный риск
                  </div>
                  <div className="p-4 lg:p-5 border-l border-stone-200 flex items-center gap-2 text-amber-800">
                    <ShieldCheck className="w-3.5 h-3.5" /> Как мы защищаем сделку
                  </div>
                </div>
                {risks.map((row, i) => (
                  <div key={i} className="grid grid-cols-2 text-sm bg-white">
                    <div className="p-4 lg:p-5 text-stone-700 border-t border-stone-100">{row.risk}</div>
                    <div className="p-4 lg:p-5 border-t border-l border-stone-100 text-stone-600">{row.fix}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* 05: ПРИМЕРЫ ОБМЕНОВ */}
            <section id="cases" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                05 · Из практики агентства
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Примеры обменов
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cases.map((c, i) => (
                  <div key={i} className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm">
                    <h3 className="text-stone-900 font-semibold text-[15px] mb-4">{c.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-stone-500 mb-2">
                      <span className="shrink-0 font-semibold text-amber-800">Было:</span>
                      <span>{c.from}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-500 mb-4">
                      <ArrowLeftRight className="w-3.5 h-3.5 shrink-0 text-amber-800" />
                      <span>{c.to}</span>
                    </div>
                    <p className="text-stone-500 text-xs leading-relaxed mb-4 font-light">{c.note}</p>
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider pt-4 border-t border-stone-100 text-amber-800">
                      <Clock className="w-3.5 h-3.5" /> {c.time} на сделку
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 06: ПОЧЕМУ НАМ ДОВЕРЯЮТ */}
            <section id="trust" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                06 · Надёжность и опыт
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Почему нам доверяют
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: <ShieldCheck className="w-5 h-5" />, title: 'Надёжность', desc: 'С 2022 года на рынке недвижимости Минска и Беларуси.' },
                  { icon: <Clock className="w-5 h-5" />, title: 'Скорость', desc: 'Средний срок — 26 дней. Минимальный — 2 дня.' },
                  { icon: <Users className="w-5 h-5" />, title: 'Доверие', desc: '1424+ клиентов выбрали нас для своих сделок.' },
                  { icon: <Award className="w-5 h-5" />, title: 'Безопасность', desc: '0 оспоренных сделок за всю историю компании.' },
                  { icon: <Building2 className="w-5 h-5" />, title: 'Законность', desc: 'Нотариус, БРТИ, Белгосстрах. Полное юридическое сопровождение.' },
                  { icon: <TrendingUp className="w-5 h-5" />, title: 'Тарифы', desc: 'По ставкам Минюста РБ. Прозрачные и фиксированные.' },
                ].map((item, i) => (
                  <div key={i} className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center mb-3 bg-amber-50 text-amber-800">
                      {item.icon}
                    </div>
                    <h3 className="text-stone-900 font-semibold text-sm mb-1.5">{item.title}</h3>
                    <p className="text-stone-600 text-xs leading-relaxed font-light">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 07: FAQ */}
            <section id="faq" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                07 · Остались вопросы?
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Частые вопросы об обмене
              </h2>

              <div className="space-y-3">
                {faqItems.map((item, i) => {
                  const isOpen = openFaq === i;
                  return (
                    <div
                      key={i}
                      className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm transition-all"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/80 transition-colors"
                      >
                        <span className="font-semibold text-stone-900 text-sm sm:text-base leading-snug">
                          {item.q}
                        </span>
                        {isOpen
                          ? <Minus className="w-4 h-4 text-amber-800 shrink-0" />
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
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-800 mb-2">
                Первая консультация бесплатна
              </div>
              <h3 className="text-stone-900 text-xl font-normal mb-2" style={{ fontFamily: displayFont }}>
                Подобрать схему обмена
              </h3>
              <p className="text-xs text-stone-500 mb-6 font-light leading-relaxed">
                Оставьте заявку — специалист по обменам разберёт вашу ситуацию и предложит оптимальную схему.
              </p>

              {leadSent ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-semibold text-emerald-900 text-sm">Заявка принята!</div>
                  <p className="text-xs text-emerald-700 font-light">
                    Специалист свяжется с вами в течение 15 минут.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Тип обмена
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                    >
                      <option value="Разъезд (одну на две)">Разъезд (одну на две)</option>
                      <option value="Съезд (две на одну)">Съезд (две на одну)</option>
                      <option value="Прямой обмен (мена)">Прямой обмен (мена)</option>
                      <option value="Обмен с доплатой">Обмен с доплатой</option>
                      <option value="Город на загород">Город на загород</option>
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
                    <span>Подобрать схему</span>
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