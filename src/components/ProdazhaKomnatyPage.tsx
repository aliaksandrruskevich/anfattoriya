"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Shield, Award, CheckCircle2, ChevronDown, 
  Clock, FileText, Phone, Layers, Sparkles, Scale, 
  AlertTriangle, KeyRound, Check, Star, Calendar, Share2, 
  Bookmark, Send, MessageCircle, AlertCircle, Users
} from 'lucide-react';
import { PageId } from '../types';

interface ProdazhaKomnatyPageProps {
  activePage?: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
}

const displayFont = "'Cormorant Garamond', 'Georgia', serif";
const bodyFont = "'Raleway', system-ui, sans-serif";

const HERO_PHOTO = 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=1920';

const TOC_ITEMS = [
  { id: 'status', label: 'Правовой статус комнаты и доли' },
  { id: 'experience', label: 'Опыт «Фаттории» с 2022 года' },
  { id: 'preemption', label: 'Преимущественное право (ст. 253 ГК)' },
  { id: 'notification', label: 'Нотариальное извещение соседей' },
  { id: 'order', label: 'Определение порядка пользования' },
  { id: 'mistakes', label: 'Типичные ошибки продавцов' },
  { id: 'faq', label: 'Частые вопросы и ответы' },
];

export default function ProdazhaKomnatyPage({ navigateTo, handleAddLead }: ProdazhaKomnatyPageProps) {
  const [activeId, setActiveId] = useState<string>('status');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [leadSent, setLeadSent] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formShareSize, setFormShareSize] = useState('Выделенная комната');
  const [formNeighbors, setFormNeighbors] = useState('1 сособственник');

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
      formName.trim() || 'Продавец доли/комнаты',
      formPhone.trim(),
      `Продажа доли: ${formShareSize}. Ситуация: ${formNeighbors}`,
      'prodazha-komnaty-doli'
    );
    setLeadSent(true);
    setTimeout(() => {
      setLeadSent(false);
      setFormName('');
      setFormPhone('');
    }, 4500);
  };

  const faqItems = [
    {
      q: 'Что делать, если сосед категорически отказывается получать нотариальное извещение?',
      a: 'Это самая частая ситуация в нашей практике. Согласно статье 253 ГК Республики Беларусь и Инструкции о порядке совершения нотариальных действий, извещение направляется нотариусом заказным письмом с уведомлением о вручении по месту жительства сособственника. Если письмо возвращается за истечением срока хранения либо адресат уклоняется от получения, нотариус выдает официальное свидетельство о передаче заявления. На основании этого свидетельства договор купли-продажи успешно регистрируется в БТИ без согласия соседа.'
    },
    {
      q: 'Чем отличается продажа комнаты от продажи «идеальной доли»?',
      a: 'Комната в коммунальной квартире имеет отдельный технический паспорт и кадастровый номер. Доля (например, 1/2 или 3/8) — это право на часть в общей совместной собственности квартиры без жесткой привязки к конкретным стенам. Для комфортной продажи идеальной доли мы помогаем составить нотариальное соглашение об определении порядка пользования жилыми комнатами, что сразу повышает рыночную стоимость доли на 15–25%.'
    },
    {
      q: 'Почему нельзя оформлять продажу доли через договор дарения?',
      a: 'Многие недобросовестные посредники предлагают «подарить» долю постороннему лицу, чтобы обойти отказ соседей. Это мнимая (притворная) сделка. Сособственники имеют право в течение года подать иск в суд о переводе на себя прав покупателя либо о признании дарения недействительным. Продавец рискует остаться и без доли, и без денег. Мы работаем исключительно в рамках закона, гарантируя 100% юридическую защиту.'
    },
    {
      q: 'Каковы официальные тарифы на услуги агентства при продаже доли?',
      a: 'Тарифы регламентированы постановлением Совета Министров Республики Беларусь. Ставка комиссии составляет от 1.5% до 6% в зависимости от стоимости объекта. Оплата производится исключительно после завершения сделки в БТИ.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#171412]" style={{ fontFamily: bodyFont }}>
      
      {/* 1. EDITORIAL HERO BANNER (без фиолетовых фильтров) */}
      <section className="relative overflow-hidden bg-neutral-950 text-white min-h-[520px] lg:min-h-[620px] flex items-end">
        <img
          src={HERO_PHOTO}
          alt="Продажа комнат и долей в Минске"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/30" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 pt-32 pb-20 lg:pb-28 w-full">
          <div className="flex items-center gap-3 mb-6">
            
            <span className="text-white/40 text-xs">•</span>
            <span className="text-white/70 text-xs uppercase tracking-wider font-medium">Комнаты и доли</span>
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/25 text-white px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.25em] mb-6">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>АН «Фаттория» · Юридическая практика с 2022 года</span>
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
              Продажа комнат и долей в квартирах: соблюдение ст. 253 ГК РБ
            </h1>

            <p
              className="text-[17px] lg:text-[21px] font-light leading-relaxed max-w-3xl mb-8 text-white/90"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
            >
              Сложные разъезды, споры сособственников, официальное нотариальное извещение соседей и закрепление порядка пользования. С 2022 года юристы АН «Фаттория» успешно закрывают самые нестандартные сделки с долевой собственностью в Минске.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/20 text-[11px] uppercase tracking-[0.18em] text-white/80">
              <span className="inline-flex items-center gap-2 font-medium"><Calendar className="w-3.5 h-3.5 text-amber-400" /> С 2022 года в Минске</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium"><Scale className="w-3.5 h-3.5 text-sky-400" /> Статья 253 ГК РБ</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium"><Shield className="w-3.5 h-3.5 text-emerald-400" /> Нотариальные извещения</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium"><Clock className="w-3.5 h-3.5 text-amber-300" /> Срок извещения 30 дней</span>
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
                <Award className="w-4 h-4" /> Судебная практика с 2022
              </div>
              <p className="text-xs leading-relaxed text-stone-600">
                Более 90 сложных долевых сделок без единого судебного оспаривания со стороны сособственников.
              </p>
            </div>
          </aside>

          {/* Центральная колонка */}
          <main className="order-2 min-w-0 max-w-[880px] space-y-16">
            
            {/* 01: ПРАВОВОЙ СТАТУС */}
            <section id="status" className="scroll-mt-32">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                01 · Специфика долевой собственности
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 42px)', lineHeight: 1.15 }}
              >
                В чем главная сложность продажи комнат и долей
              </h2>
              <div className="prose text-stone-600 text-[16px] leading-relaxed font-light space-y-4">
                <p>
                  Продажа доли в праве общей долевой собственности — одна из наиболее деликатных и конфликтных сфер в недвижимости Беларуси. Часто собственники находятся в натянутых отношениях: бывшие супруги, наследники или чужие люди, получившие квадратные метры в результате сложных разъездов.
                </p>
                <p>
                  Главная задача риэлтера и юриста АН «Фаттория» — перевести эмоциональный конфликт в строго правовое русло, исключить манипуляции и обеспечить безукоризненное соблюдение гражданского и жилищного законодательства РБ.
                </p>
              </div>

              {/* Фото вставка */}
              <div className="my-8 rounded-3xl overflow-hidden border border-stone-200 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&q=80&w=1600"
                  alt="Интерьер изолированной комнаты"
                  className="w-full h-80 object-cover"
                />
                <div className="p-4 bg-stone-50 text-xs text-stone-500 flex items-center justify-between border-t border-stone-200">
                  <span>Изолированная комната 17.4 кв.м с балконом в 3-комнатной квартире, ул. Якуба Коласа</span>
                  <span className="font-semibold text-stone-700">Продана по полной стоимости</span>
                </div>
              </div>
            </section>

            {/* 02: ОПЫТ ФАТТОРИИ С 2022 ГОДА */}
            <section id="experience" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                02 · Практика АН «Фаттория»
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Практический опыт разрешения жилищных споров с 2022 года
              </h2>
              <div className="prose text-stone-600 text-[16px] leading-relaxed font-light space-y-4">
                <p>
                  С 2022 года агентство недвижимости «Фаттория» сформировало отдельное юридическое подразделение по сложным долевым объектам. Мы выступаем профессиональными медиаторами в переговорах между конфликтующими сособственниками.
                </p>
                <p>
                  В 70% случаев благодаря аргументированным переговорам нам удается убедить соседей продать квартиру целиком как единый объект. В результате каждый сособственник получает значительно больше денег, чем при раздельной продаже долей.
                </p>
              </div>
            </section>

            {/* 03: ПРЕИМУЩЕСТВЕННОЕ ПРАВО */}
            <section id="preemption" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                03 · Статья 253 ГК РБ
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Преимущественное право покупки: строгий законный порядок
              </h2>
              <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                <h4 className="text-stone-900 font-semibold text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-800" />
                  Суть статьи 253 Гражданского кодекса Республики Беларусь:
                </h4>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-light">
                  При продаже доли в праве общей собственности постороннему лицу остальные участники долевой собственности имеют преимущественное право покупки продаваемой доли по цене, за которую она продается, и на прочих равных условиях.
                </p>
                <div className="pt-2 text-xs text-stone-800 font-medium">
                  Срок на принятие решения сособственниками: ровно 1 месяц со дня получения извещения.
                </div>
              </div>
            </section>

            {/* 04: НОТАРИАЛЬНОЕ ИЗВЕЩЕНИЕ */}
            <section id="notification" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                04 · Нотариальная процедура
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Как правильно известить сособственников через нотариуса
              </h2>
              <div className="space-y-4">
                <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm flex items-start gap-4">
                  <span className="text-xl font-light text-amber-800 tabular-nums shrink-0 pt-0.5" style={{ fontFamily: displayFont }}>01</span>
                  <div>
                    <h4 className="font-semibold text-stone-900 text-sm mb-1">Составление заявления у нотариуса</h4>
                    <p className="text-xs text-stone-600 leading-relaxed font-light">В заявлении указывается точный размер доли, твердая цена в белорусских рублях и порядок расчетов.</p>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm flex items-start gap-4">
                  <span className="text-xl font-light text-amber-800 tabular-nums shrink-0 pt-0.5" style={{ fontFamily: displayFont }}>02</span>
                  <div>
                    <h4 className="font-semibold text-stone-900 text-sm mb-1">Направление заказного письма с уведомлением</h4>
                    <p className="text-xs text-stone-600 leading-relaxed font-light">Нотариус лично направляет официальное извещение заказной почтовой связью по всем известным адресам соседей.</p>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm flex items-start gap-4">
                  <span className="text-xl font-light text-amber-800 tabular-nums shrink-0 pt-0.5" style={{ fontFamily: displayFont }}>03</span>
                  <div>
                    <h4 className="font-semibold text-stone-900 text-sm mb-1">Получение свидетельства нотариуса</h4>
                    <p className="text-xs text-stone-600 leading-relaxed font-light">По истечении 30 дней при отсутствии согласия нотариус выдает гербовое свидетельство о передаче заявления, открывающее право продажи третьему лицу.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 05: ПОРЯДОК ПОЛЬЗОВАНИЯ */}
            <section id="order" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                05 · Соглашение
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Определение порядка пользования квартирой
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-6 font-light">
                Покупатель доли хочет четко понимать, в какой конкретно комнате он будет проживать и какие места общего пользования (кухня, санузел, коридор) остаются совместными.
              </p>
              <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 text-stone-700 text-xs sm:text-sm leading-relaxed font-light space-y-2">
                <p>• <strong>Добровольный порядок:</strong> нотариально удостоверенное соглашение между всеми сособственниками.</p>
                <p>• <strong>Судебный порядок:</strong> если соседи уклоняются от диалога, наши судебные юристы составляют исковое заявление и закрепляют порядок пользования через суд.</p>
              </div>
            </section>

            {/* 06: ОШИБКИ */}
            <section id="mistakes" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                06 · Предостережение
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Опасные ошибки продавцов долей
              </h2>
              <div className="space-y-3">
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-900 leading-relaxed font-light">
                    <strong>Занижение цены в извещении:</strong> если вы известили соседей по цене $15 000, а стороннему покупателю продали за $13 000 — сделка будет признана недействительной в суде в течение 3 месяцев.
                  </div>
                </div>
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-900 leading-relaxed font-light">
                    <strong>Попытка «дарения микродоли»:</strong> схема, при которой дарят 1/100 доли, а затем продают остаток без извещения соседей. Суды Республики Беларусь однозначно признают такие цепочки притворными.
                  </div>
                </div>
              </div>
            </section>

            {/* 07: FAQ */}
            <section id="faq" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                07 · Часто задаваемые вопросы
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Вопросы собственников долей и комнат
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
                Долевой отдел
              </div>
              <h3 className="text-stone-900 text-xl font-normal mb-2" style={{ fontFamily: displayFont }}>
                Консультация юриста по долям
              </h3>
              <p className="text-xs text-stone-500 mb-6 font-light leading-relaxed">
                Разберем вашу ситуацию с сособственниками и предложим законный план продажи.
              </p>

              {leadSent ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-semibold text-emerald-900 text-sm">Заявка принята!</div>
                  <p className="text-xs text-emerald-700 font-light">
                    Юрист по долевой собственности свяжется с вами в течение 10 минут.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Формат объекта
                    </label>
                    <select
                      value={formShareSize}
                      onChange={(e) => setFormShareSize(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                    >
                      <option value="Выделенная комната">Выделенная комната с техпаспортом</option>
                      <option value="Доля в квартире (1/2, 1/3, др)">Идеальная доля в квартире</option>
                      <option value="Разъезд всей квартиры">Разъезд / продажа квартиры целиком</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Отношения с соседями
                    </label>
                    <select
                      value={formNeighbors}
                      onChange={(e) => setFormNeighbors(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                    >
                      <option value="Конфликтные">Конфликтные / не идут на контакт</option>
                      <option value="Нейтральные">Нейтральные / готовы к диалогу</option>
                      <option value="Неизвестно где живут">Не проживают / местонахождение неизвестно</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Ваше имя
                    </label>
                    <input
                      type="text"
                      placeholder="Мария"
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
                    <span>Задать вопрос юристу</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

            <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-stone-200 shrink-0 border border-stone-300">
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200"
                    alt="Юрист по жилищному праву"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-stone-900 text-sm">Юрист по долям</div>
                  <div className="text-[11px] text-stone-500">АН «Фаттория» · Минск</div>
                </div>
              </div>
              <p className="text-xs text-stone-600 mb-4 font-light leading-relaxed">
                «Составлю юридически выверенное нотариальное извещение и защищу сделку от риска оспаривания в суде.»
              </p>
              <a
                href="tel:+375296380053"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-stone-300 hover:border-stone-400 rounded-xl text-xs font-semibold text-stone-900 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-amber-800" />
                <span>+375 29 638-00-53</span>
              </a>
            </div>

          </aside>

        </div>
      </div>

    </div>
  );
}
