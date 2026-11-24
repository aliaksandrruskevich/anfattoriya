"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Shield, Award, CheckCircle2, ChevronDown, 
  Clock, FileText, Phone, Building2, Home, Sparkles, Scale, 
  AlertTriangle, KeyRound, Check, Star, Calendar, Share2, 
  Bookmark, TrendingUp, Users, CheckCircle, Send, MessageCircle,
  Camera, Eye, Layers, Compass
} from 'lucide-react';
import type { Agent, PageId, Property } from '../types';
import { isRealtorAgent } from '@/lib/agentUtils';
import { getAgentUrl } from '@/lib/routes';
import { AgentBrandAvatar } from './AgentBrandAvatar';
import ActiveSalePropertiesSection from './ActiveSalePropertiesSection';

interface ProdazhaKvartiryPageProps {
  activePage?: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
  properties?: Property[];
  agents?: Agent[];
}

const displayFont = "'Cormorant Garamond', 'Georgia', serif";
const bodyFont = "'Raleway', system-ui, sans-serif";

const HERO_PHOTO = '/photo/hero-apartment.jpg';

const TOC_ITEMS = [
  { id: 'active-objects', label: 'Актуальные квартиры в продаже' },
  { id: 'segments', label: 'Сегменты квартир в Минске' },
  { id: 'history', label: 'Опыт «Фаттории» с 2022 года' },
  { id: 'staging', label: 'Хоум-стейджинг и фотосет' },
  { id: 'chains', label: 'Альтернативные сделки (цепочки)' },
  { id: 'documents', label: 'Документы для сделки' },
  { id: 'pricing', label: 'Ценовая стратегия и защита торга' },
  { id: 'faq', label: 'Вопросы и ответы' },
];

export default function ProdazhaKvartiryPage({
  navigateTo,
  handleAddLead,
  properties = [],
  agents = [],
}: ProdazhaKvartiryPageProps) {
  const [activeId, setActiveId] = useState<string>('active-objects');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [leadSent, setLeadSent] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const realtors = agents.filter(isRealtorAgent);
  const featuredRealtor = realtors.find((a) => a.specialization === 'sale') || realtors[0];

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRooms, setFormRooms] = useState('2-комнатная');
  const [formDistrict, setFormDistrict] = useState('');

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
      formName.trim() || 'Продавец квартиры',
      formPhone.trim(),
      `Продажа квартиры: ${formRooms}. Район: ${formDistrict || 'Минск'}.`,
      'prodazha-kvartiry'
    );
    setLeadSent(true);
    setTimeout(() => {
      setLeadSent(false);
      setFormName('');
      setFormPhone('');
      setFormDistrict('');
    }, 4500);
  };

  const apartmentSegments = [
    {
      title: 'Вторичный фонд и чешские проекты',
      desc: 'Панельные и кирпичные дома во Фрунзенском, Заводском, Советском и Московском районах. Глубокий архивный аудит приватизации, выписанных несовершеннолетних и отказников.',
      photo: '/photo/hero-building.jpg',
      tag: 'Проверка истории с 1990-х'
    },
    {
      title: 'Современные жилые комплексы (Новостройки)',
      desc: 'Минск-Мир, Новая Боровая, Левада, Маяк Минска, Парк Челюскинцев, D3. Продажа видовых квартир с дизайнерским ремонтом и квартир под чистовую отделку.',
      photo: '/photo/hero-flat.jpg',
      tag: 'Презентация инфраструктуры и видов'
    },
    {
      title: 'Сталинки в историческом центре',
      desc: 'Проспект Независимости, Карла Маркса, Ленина, площадь Победы. Высокие потолки 3.2 м, толстые кирпичные стены, согласование перепланировок в охранных зонах.',
      photo: '/photo/hero-architecture.jpg',
      tag: 'Исторический центр Минска'
    },
    {
      title: 'Элитные пентхаусы и клубные дома',
      desc: 'Индивидуальные показы для проверенных покупателей с полным юридическим и финансовым сопровождением сделки.',
      photo: '/photo/hero-interior.jpg',
      tag: 'Конфиденциальные сделки'
    }
  ];

  const stagingPrinciples = [
    {
      step: '01',
      title: 'Деперсонализация и расхламление',
      desc: 'Убираем личные фото, магниты, лишнюю мелкую мебель. Покупатель должен примерять будущее жилье на себя, а не чувствовать неловкость в чужих стенах.'
    },
    {
      step: '02',
      title: 'Световой баланс и нейтральная цветовая температура',
      desc: 'Заменяем тусклые и разномастные лампы на чистый дневной свет 4000K. Съемка в часы максимального естественного освещения визуально расширяет метраж.'
    },
    {
      step: '03',
      title: 'Текстильные акценты и свежесть',
      desc: 'Однотонные пледы, фактурные подушки, живые растения и аккуратная геометрия пространства создают ощущение опрятности бизнес-класса.'
    },
    {
      step: '04',
      title: 'Интерактивный 3D-тур 360°',
      desc: 'Позволяет иногородним покупателям и экспатам детально изучить планировку онлайн, отсекая нецелевые визиты зевак.'
    }
  ];

  const documents = [
    { name: 'Технический паспорт жилого помещения', note: 'Актуальный план без неузаконенных переносов мокрых зон' },
    { name: 'Свидетельство о государственной регистрации', note: 'Оригинал из БТИ, подтверждающий запись в ЕГРНИ' },
    { name: 'Правоустанавливающий документ', note: 'Договор купли-продажи, приватизации, дарения либо свидетельство о наследстве' },
    { name: 'Копия лицевого счета (справка о составе семьи)', note: 'Выдается в РСЦ, подтверждает отсутствие коммунальных долгов и круг зарегистрированных' },
    { name: 'Нотариальное согласие супруга(и)', note: 'Обязательно, если квартира нажита в период брака (ст. 23 КоБС Республики Беларусь)' },
    { name: 'Согласие органов опеки и попечительства', note: 'Требуется при наличии несовершеннолетних собственников или членов семьи' }
  ];

  const faqItems = [
    {
      q: 'Сколько времени занимает продажа квартиры с АН «Фаттория»?',
      a: 'Средний срок продажи в нашем агентстве — 26 дней, минимальный — 2 дня. За счет качественного хоум-стейджинга, приоритетного размещения на ключевых порталах и работы с актуальными заявками покупателей мы закрываем сделки оперативно и без потери в цене.'
    },
    {
      q: 'Какова комиссия агентства при продаже квартиры?',
      a: 'Размер комиссии строго регламентирован постановлением Совета Министров Республики Беларусь и составляет от 1.5% до 6% в зависимости от стоимости объекта. Точная сумма рассчитывается при заключении официального договора на риэлтерские услуги. Оплата производится исключительно после завершения сделки и регистрации перехода права в БТИ.'
    },
    {
      q: 'Как агентство защищает продавца от рисков неплатежа?',
      a: 'Мы исключаем любые передачи наличных средств вне официальных банковских процедур. Расчеты производятся через банковские аккредитивы, сейфовые ячейки или безналичные банковские переводы в белорусских рублях с обязательной фиксацией в договоре купли-продажи. Переход права регистрируется только после выполнения финансовых обязательств.'
    },
    {
      q: 'Что делать, если в квартире сделана перепланировка?',
      a: 'Штатные специалисты АН «Фаттория» проведут аудит изменений. Если перепланировка допустима (например, объединение санузла или перенос ненесущей перегородки), мы поможем оперативно согласовать ее в администрации района до сделки, либо оформим сделку с соблюдением требований законодательства.'
    },
    {
      q: 'Работаете ли вы с квартирами с непогашенным льготным кредитом?',
      a: 'Да. С 2022 года мы регулярно сопровождаем сделки по отчуждению квартир, построенных с привлечением льготных кредитов (по Указам № 13, 240). Мы помогаем получить официальное разрешение исполкома на досрочное отчуждение и согласовать погашение задолженности перед банком.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#171412]" style={{ fontFamily: bodyFont }}>
      
      {/* 1. EDITORIAL HERO BANNER (без фиолетовых фильтров) */}
      <section className="relative overflow-hidden bg-neutral-950 text-white min-h-[520px] lg:min-h-[620px] flex items-end">
        <img
          src={HERO_PHOTO}
          alt="Продажа квартир в Минске"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/30" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 pt-32 pb-20 lg:pb-28 w-full">
          <div className="flex items-center gap-3 mb-6">
            
            <span className="text-white/40 text-xs">•</span>
            <span className="text-white/70 text-xs uppercase tracking-wider font-medium">Квартиры</span>
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/25 text-white px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.25em] mb-6">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>АН «Фаттория» · С 2022 года в Минске</span>
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
              Продажа квартир в Минске: вторичный фонд, новостройки и премиум-сегмент
            </h1>

            <p
              className="text-[17px] lg:text-[21px] font-light leading-relaxed max-w-3xl mb-8 text-white/90"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
            >
              Продадим вашу квартиру по максимальной рыночной цене без нервов и риска. 1424+ клиентов выбрали нас для своих сделок. Средний срок — 26 дней, минимальный — 2 дня. Профессиональный хоум-стейджинг, персональный подбор покупателей и государственные тарифы Минюста РБ (от 1.5% до 6%).
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/20 text-[11px] uppercase tracking-[0.18em] text-white/80">
              <span className="inline-flex items-center gap-2 font-medium"><Calendar className="w-3.5 h-3.5 text-amber-400" /> Опыт с 2022 года</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium"><Clock className="w-3.5 h-3.5 text-amber-300" /> Средний срок — 26 дней (мин. 2 дня)</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium"><Shield className="w-3.5 h-3.5 text-emerald-400" /> Гарантия безопасности БТИ</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium"><Scale className="w-3.5 h-3.5 text-sky-400" /> Тариф Минюста 1.5%–6%</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ELEVATED EDITORIAL SHEET */}
      <div className="relative -mt-10 lg:-mt-14 rounded-t-[36px] lg:rounded-t-[50px] bg-white border-t border-[#E7E2DA] shadow-2xl z-20">
        <div className="max-w-[1520px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_340px] gap-10 xl:gap-14 pt-12 lg:pt-16 pb-20">
          
          {/* Левая колонка: Содержание */}
          <aside className="lg:sticky lg:top-28 lg:h-fit space-y-6 order-1">
            <div className="bg-stone-50/90 p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] mb-4 pb-3 border-b border-stone-200 text-stone-900">
                Содержание страницы
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

            {/* Быстрые действия */}
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
                <Award className="w-4 h-4" /> Статистика с 2022 года
              </div>
              <p className="text-xs leading-relaxed text-stone-600">
                1424+ клиентов выбрали нас для своих сделок. Средний срок — 26 дней, минимальный — 2 дня.
              </p>
            </div>
          </aside>

          {/* Центральная колонка */}
          <main className="order-2 min-w-0 max-w-[880px] space-y-16">

            <ActiveSalePropertiesSection
              id="active-objects"
              sectionNumber="01"
              eyebrow="Актуальные квартиры с Realt.by"
              title="Действующие квартиры в продаже"
              subtitle="Все действующие предложения квартир агентства АН «Фаттория» на продажу с актуальными ценами и ответственными риэлтерами."
              category="apartment"
              properties={properties}
              agents={agents}
              onRequestConsultation={() =>
                document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })
              }
            />

            {/* 02: СЕГМЕНТЫ КВАРТИР */}
            <section id="segments" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                02 · Классификация жилья
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 42px)', lineHeight: 1.15 }}
              >
                Особенности продажи квартир в разных типах домов Минска
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Продавать типовую «брежневку» и видовой пентхаус в новостройке одинаковыми методами — грубейшая ошибка. Мы разрабатываем индивидуальную маркетинговую и ценовую стратегию под каждый сегмент жилого фонда.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {apartmentSegments.map((seg, idx) => (
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
                          setFormRooms(seg.title);
                          document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-[11px] font-bold uppercase tracking-wider text-amber-800 hover:text-amber-900 text-left pt-3 border-t border-stone-100 flex items-center justify-between"
                      >
                        <span>Оценить квартиру этого типа</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 02: ОПЫТ ФАТТОРИИ С 2022 ГОДА */}
            <section id="history" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                03 · Экспертиза
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                АН «Фаттория»: успешные сделки с квартирами с 2022 года
              </h2>
              <div className="prose text-stone-600 text-[16px] leading-relaxed font-light space-y-4">
                <p>
                  С момента основания в 2022 году АН «Фаттория» сосредоточилось на решении наиболее сложных квартирных задач на территории Минска и Минского района. Мы не просто размещаем объявление в интернете — мы берем на себя полную ответственность за исход сделки.
                </p>
                <p>
                  За годы работы с 2022 года мы сформировали системную работу с активными заявками покупателей и инвесторов, которые ищут жилье для себя и сдачи в аренду. Это позволяет находить первых заинтересованных претендентов уже в первые дни продажи.
                </p>
              </div>

              {/* Фото вставка */}
              <div className="my-8 rounded-3xl overflow-hidden border border-stone-200 shadow-md">
                <img
                  src="/photo/hero-building.jpg"
                  alt="Современный жилой комплекс в Минске"
                  className="w-full h-80 object-cover"
                />
                <div className="p-4 bg-stone-50 text-xs text-stone-500 flex items-center justify-between border-t border-stone-200">
                  <span>Современные жилые комплексы и вторичный фонд Минска</span>
                  <span className="font-semibold text-stone-700">Средний срок — 26 дней (мин. 2 дня)</span>
                </div>
              </div>
            </section>

            {/* 03: ХОУМ-СТЕЙДЖИНГ */}
            <section id="staging" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                04 · Предпродажная подготовка
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Хоум-стейджинг и фотосет: как поднять стоимость на 5–8%
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Покупатель принимает эмоциональное решение в первые 3 секунды просмотра фотографий в каталоге. Если квартира выглядит темной, захламленной или неухоженной, он либо пролистывает объявление, либо начинает агрессивный торг.
              </p>

              <div className="space-y-4">
                {stagingPrinciples.map((st) => (
                  <div
                    key={st.step}
                    className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm flex items-start gap-5"
                  >
                    <span className="text-2xl font-light text-amber-800 tabular-nums shrink-0 pt-0.5" style={{ fontFamily: displayFont }}>
                      {st.step}
                    </span>
                    <div>
                      <h4 className="text-stone-900 font-semibold text-base mb-1">
                        {st.title}
                      </h4>
                      <p className="text-stone-600 text-sm leading-relaxed font-light">
                        {st.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 04: АЛЬТЕРНАТИВНЫЕ СДЕЛКИ */}
            <section id="chains" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                05 · Сложные цепочки
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Альтернативные сделки: продаем старую и покупаем новую квартиру в один день
              </h2>
              <div className="prose text-stone-600 text-[16px] leading-relaxed font-light space-y-4">
                <p>
                  Значительная часть сделок на минском рынке — встречные (альтернативные). Собственник продает однокомнатную квартиру и одновременно покупает просторное жильё с привлечением собственных средств, семейного капитала или банковского кредита.
                </p>
                <p>
                  Главный риск для продавца без опытного риэлтера — остаться без жилья или сорвать встречную покупку, если цепочка разорвется. В АН «Фаттория» синхронизируются все этапы: подписание предварительных договоров, внесение задатков, снятие с регистрационного учета и освобождение квартир.
                </p>
              </div>

              <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-2xl mt-6 space-y-3">
                <h4 className="text-stone-900 font-semibold text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-800" />
                  Гарантии безопасности при альтернативной цепочке:
                </h4>
                <ul className="text-xs sm:text-sm text-stone-700 space-y-2 leading-relaxed">
                  <li>• Договоры купли-продажи по всем объектам подписываются одновременно в один день в БТИ.</li>
                  <li>• Взаиморасчеты производятся через банковские счета с контролем поступления средств.</li>
                  <li>• Сроки фактического выселения и передачи ключей детально согласуются и фиксируются в договоре.</li>
                </ul>
              </div>
            </section>

            {/* 05: ПАКЕТ ДОКУМЕНТОВ */}
            <section id="documents" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                06 · Юридическая документация
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Чек-лист документов для безопасной продажи квартиры в БТИ
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-6 font-light">
                Юристы АН «Фаттория» организуют сбор всех справок и документов, исключая задержки при подаче в государственные регистрационные органы.
              </p>

              <div className="space-y-3">
                {documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-amber-800 shrink-0" />
                      <span className="text-stone-900 font-semibold text-sm">{doc.name}</span>
                    </div>
                    <span className="text-xs text-stone-500 font-light sm:text-right">{doc.note}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 06: ЦЕНОВАЯ СТРАТЕГИЯ */}
            <section id="pricing" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                07 · Переговоры
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Как мы удерживаем цену и защищаем вас от агрессивного торга
              </h2>
              <div className="prose text-stone-600 text-[16px] leading-relaxed font-light space-y-4">
                <p>
                  Большинство покупателей на показах целенаправленно ищут любые мелочи (потертость плинтуса, вид во двор, этаж), чтобы сбить цену на $2 000 – $5 000. Продавцы, действующие в одиночку, часто сдают позиции из страха упустить сделку.
                </p>
                <p>
                  Аттестованный риэлтер АН «Фаттория» берет все переговоры на себя. Мы аргументируем каждую копейку стартовой стоимости аналитикой БТИ, подчеркиваем редкие преимущества планировки и создаем конкурентный спрос, когда сразу несколько покупателей борются за ваш объект.
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
                Вопросы собственников квартир
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

          {/* Правая колонка: Форма и риэлтер */}
          <aside className="order-3 lg:col-start-2 xl:col-start-3 xl:row-start-1 xl:sticky xl:top-28 xl:h-fit space-y-6">
            
            <div id="lead-form" className="p-7 bg-white rounded-3xl border border-stone-200 shadow-md">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-800 mb-2">
                Заявка на продажу
              </div>
              <h3 className="text-stone-900 text-xl font-normal mb-2" style={{ fontFamily: displayFont }}>
                Оценка квартиры за 1 день
              </h3>
              <p className="text-xs text-stone-500 mb-6 font-light leading-relaxed">
                Бесплатно рассчитаем рыночную цену квартиры по базе БТИ и предложим план быстрой продажи.
              </p>

              {leadSent ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-semibold text-emerald-900 text-sm">Заявка принята!</div>
                  <p className="text-xs text-emerald-700 font-light">
                    Специалист отдела квартир свяжется с вами в течение 10 минут.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Комнатность
                    </label>
                    <select
                      value={formRooms}
                      onChange={(e) => setFormRooms(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                    >
                      <option value="1-комнатная">1-комнатная квартира</option>
                      <option value="2-комнатная">2-комнатная квартира</option>
                      <option value="3-комнатная">3-комнатная квартира</option>
                      <option value="4+ комнат">4+ комнатная / Пентхаус</option>
                      <option value="Студия">Студия</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Ваше имя
                    </label>
                    <input
                      type="text"
                      placeholder="Ольга"
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

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Улица или микрорайон
                    </label>
                    <input
                      type="text"
                      placeholder="пр. Дзержинского, 119"
                      value={formDistrict}
                      onChange={(e) => setFormDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Заказать оценку</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <p className="text-[10px] text-stone-400 text-center leading-normal">
                    Конфиденциально. Ваши контакты защищены законом о защите персональных данных РБ.
                  </p>
                </form>
              )}
            </div>

            <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200">
              <div className="flex items-center gap-3.5 mb-4">
                <AgentBrandAvatar
                  photo={featuredRealtor?.photo || '/photo/fedorchuk.jpg'}
                  name={featuredRealtor?.name || 'Специалист по квартирам'}
                  className="w-12 h-12 rounded-full object-cover shrink-0 border border-stone-300"
                />
                <div className="min-w-0">
                  {featuredRealtor ? (
                    <Link
                      href={getAgentUrl(featuredRealtor)}
                      className="font-semibold text-stone-900 text-sm hover:text-amber-800 transition-colors block truncate"
                    >
                      {featuredRealtor.name}
                    </Link>
                  ) : (
                    <div className="font-semibold text-stone-900 text-sm">Специалист по квартирам</div>
                  )}
                  <div className="text-[11px] text-stone-500 truncate">
                    {featuredRealtor?.role || 'АН «Фаттория» · Минск'}
                  </div>
                </div>
              </div>
              <p className="text-xs text-stone-600 mb-4 font-light leading-relaxed">
                «Помогу оценить рыночную перспективу вашей квартиры и подготовлю ее к показу без лишних затрат на ремонт.»
              </p>
              <div className="space-y-2">
                <a
                  href="tel:+375296380053"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-stone-300 hover:border-stone-400 rounded-xl text-xs font-semibold text-stone-900 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-800" />
                  <span>+375 29 638-00-53</span>
                </a>
              </div>
            </div>

          </aside>

        </div>
      </div>

    </div>
  );
}
