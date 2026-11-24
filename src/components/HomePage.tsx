'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { PageId, Agent, Property, Review, Article } from '../types';
import { AgentBrandAvatar } from './AgentBrandAvatar';
import { isRealtorAgent } from '@/lib/agentUtils';
import {
  Star, Search, MapPin, ArrowRight, ShieldCheck, Scale,
  FileCheck, Home, Clock, Award, Users, TrendingUp, CheckCircle, Phone,
  Send, MessageCircle, X,
} from 'lucide-react';

const heroBgImage = '/photo/999.jpg';

interface HomePageProps {
  navigateTo: (pageId: PageId, q?: string) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
  agentsList: Agent[];
  propertiesList: Property[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  currency: 'USD' | 'BYN';
  catalogSearchQuery?: string;
  setCatalogSearchQuery?: (query: string) => void;
  catalogSelectedType?: 'all' | 'apartment' | 'commercial' | 'house' | 'plot';
  setCatalogSelectedType?: (type: 'all' | 'apartment' | 'commercial' | 'house' | 'plot') => void;
  catalogMaxPrice?: number;
  setCatalogMaxPrice?: (price: number) => void;
  clientsReviews: Review[];
  articlesList: Article[];
  onViewProfile?: (agent: Agent) => void;
  onSelectArticle?: (article: Article) => void;
}

const displayFont = "'Cormorant Garamond', 'Georgia', serif";
const bodyFont = "'Raleway', system-ui, sans-serif";

/* ============================================================
   ДОКУМЕНТЫ И ЛИЦЕНЗИИ — 4 документа
   Замени файлы в /public/photo/docs/ 1.jpg, 2.jpg, 5.jpg, 6.jpg
   ============================================================ */
const DOCUMENTS = [
  { src: '/photo/docs/1.jpg', label: 'Лицензия Минюста №02240/446', caption: 'Государственная лицензия на риэлтерскую деятельность' },
  { src: '/photo/docs/2.jpg', label: 'Страхование ответственности', caption: 'Договор страхования профессиональной ответственности' },
  { src: '/photo/docs/5.jpg', label: 'Договор оказания услуг', caption: 'Типовой договор оказания риэлтерских услуг' },
  { src: '/photo/docs/6.jpg', label: 'Договор купли-продажи', caption: 'Типовой договор купли-продажи недвижимости' },
];

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    setVisible(true);
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: 'translateY(0)',
        transition: 'opacity 0.5s cubic-bezier(.16,1,.3,1), transform 0.5s cubic-bezier(.16,1,.3,1)',
      }}
    >
      {children}
    </div>
  );
}

function MiniQuiz({ onSubmit }: { onSubmit: HomePageProps['handleAddLead'] }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ type: 'Квартира', district: '', phone: '' });

  return (
    <div className="bg-stone-50 border border-stone-200 p-8 max-w-2xl mx-auto rounded-3xl">
      {step === 0 && (
        <div>
          <p className="text-stone-900 text-sm mb-4 font-light">Что оцениваем?</p>
          <div className="grid grid-cols-2 gap-3">
            {['Квартира', 'Дом', 'Коммерция', 'Участок'].map(t => (
              <button
                key={t}
                onClick={() => { setData({ ...data, type: t }); setStep(1); }}
                className="py-3 bg-white hover:bg-purple-50 text-stone-900 text-sm transition-colors border border-stone-300 hover:border-purple-400 rounded-xl cursor-pointer"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 1 && (
        <div>
          <p className="text-stone-900 text-sm mb-4 font-light">В каком районе?</p>
          <div className="grid grid-cols-3 gap-2">
            {['Центр', 'Немига', 'Уручье', 'Малиновка', 'Серебрянка', 'Другое'].map(d => (
              <button
                key={d}
                onClick={() => { setData({ ...data, district: d }); setStep(2); }}
                className="py-2.5 bg-white hover:bg-purple-50 text-stone-900 text-xs transition-colors border border-stone-300 hover:border-purple-400 rounded-xl cursor-pointer"
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit('', data.phone, `${data.type}, ${data.district}`, 'Мини-квиз'); setStep(3); }}>
          <p className="text-stone-900 text-sm mb-4 font-light">Оставьте телефон — пришлём расчёт</p>
          <input
            type="tel"
            required
            placeholder="+375 (__) ___-__-__"
            value={data.phone}
            onChange={e => setData({ ...data, phone: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-stone-300 text-stone-900 placeholder-stone-400 text-sm mb-3 focus:outline-none focus:border-purple-500 rounded-xl font-mono"
          />
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold text-sm rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all"
          >
            Получить расчёт
          </button>
        </form>
      )}
      {step === 3 && (
        <div className="text-center py-6">
          <CheckCircle className="w-10 h-10 mx-auto mb-3 text-purple-600" />
          <p className="text-stone-900 text-sm">Заявка принята. Перезвоним за 15 минут.</p>
        </div>
      )}
      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full" style={{ backgroundColor: step >= i ? '#8B5CF6' : '#E7E5E4' }} />
        ))}
      </div>
    </div>
  );
}

/* Нормализация типа объекта для фильтра */
function normalizePropertyType(raw: any): 'apartment' | 'house' | 'commercial' | 'plot' | 'other' {
  if (!raw) return 'other';
  const t = String(raw).toLowerCase().trim();
  if (['apartment', 'flat', 'квартира', 'квартиры', 'комната', 'комнаты'].includes(t)) return 'apartment';
  if (['house', 'дом', 'дома', 'коттедж', 'дача', 'загородный'].includes(t)) return 'house';
  if (['commercial', 'коммерция', 'офис', 'офисы', 'магазин', 'склад', 'помещение'].includes(t)) return 'commercial';
  if (['plot', 'land', 'участок', 'участки', 'земля'].includes(t)) return 'plot';
  return 'other';
}

export default function HomePage({
  navigateTo, handleAddLead, agentsList, propertiesList, favorites, toggleFavorite,
  currency, catalogSearchQuery, setCatalogSearchQuery, catalogSelectedType,
  setCatalogSelectedType, catalogMaxPrice, setCatalogMaxPrice, clientsReviews, articlesList,
  onViewProfile, onSelectArticle
}: HomePageProps) {

  const realProperties = propertiesList.filter(p =>
    Boolean(p.id) && p.isPublished !== false && !p.isClosedBase && !p.internalOnly && !p.crmOnly
  );

  const filteredProperties = realProperties.filter((p) => {
    if (catalogSelectedType && catalogSelectedType !== 'all') {
      const normalized = normalizePropertyType(p.type);
      if (normalized !== catalogSelectedType) return false;
    }
    if (catalogSearchQuery && catalogSearchQuery.trim()) {
      const q = catalogSearchQuery.toLowerCase().trim();
      const matches =
        (p.title || '').toLowerCase().includes(q) ||
        (p.address || '').toLowerCase().includes(q) ||
        (p.district || '').toLowerCase().includes(q) ||
        (p.metro || '').toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (catalogMaxPrice && catalogMaxPrice > 0) {
      if ((p.priceBYN || 0) > catalogMaxPrice) return false;
    }
    return true;
  });

  const previewProperties = filteredProperties.slice(0, 3);
  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} BYN`;

  /* === МОДАЛКА ДОКУМЕНТА И СОСТОЯНИЯ ФОРМ === */
  const [openDoc, setOpenDoc] = useState<{ src: string; label: string; caption: string } | null>(null);
  const [brokenDocs, setBrokenDocs] = useState<Record<number, boolean>>({});
  const [heroSent, setHeroSent] = useState(false);

  useEffect(() => {
    if (!openDoc) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenDoc(null); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openDoc]);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#171412]" style={{ fontFamily: bodyFont }}>

      {/* HERO */}
      <section className="relative overflow-hidden bg-neutral-950 text-white min-h-[520px] lg:min-h-[620px] flex items-end">
        <Image
          src={heroBgImage}
          alt="Агентство недвижимости АН Фаттория"
          fill priority sizes="100vw" quality={80}
          className="object-cover object-center filter brightness-[0.78] contrast-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/30" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-900/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 pt-32 pb-20 lg:pb-28 w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-white/40 text-xs">•</span>
            <span className="text-white/70 text-xs uppercase tracking-wider font-medium">Агентство недвижимости · Минск</span>
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/25 text-white px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.25em] mb-6">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <span>АН «Фаттория» · С 2022 года</span>
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
              Агентство недвижимости, которому доверяет Минск
            </h1>

            <p
              className="text-[17px] lg:text-[21px] font-light leading-relaxed max-w-3xl mb-8 text-white/90"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
            >
              Бесплатная оценка и экспертная консультация по продаже, покупке, аренде и обмену недвижимости в Минске и Беларуси.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value || '';
                const phone = (form.querySelector('[name="phone"]') as HTMLInputElement)?.value || '';
                const type = (form.querySelector('[name="type"]') as HTMLSelectElement)?.value || '';
                if (phone) {
                  handleAddLead(name, phone, `Тип: ${type}`, 'Главный баннер');
                  form.reset();
                  setHeroSent(true);
                  setTimeout(() => setHeroSent(false), 5000);
                }
              }}
              className="flex flex-col sm:flex-row flex-wrap md:flex-nowrap items-stretch sm:items-center gap-3 w-full max-w-3xl mb-4"
            >
              <input
                name="name"
                type="text"
                placeholder="Ваше имя"
                className="w-full sm:flex-1 min-w-[120px] px-4 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:border-transparent text-sm rounded-xl transition-all"
                style={{ '--tw-ring-color': '#8B5CF6' } as React.CSSProperties}
              />
              <input
                name="phone"
                type="tel"
                required
                placeholder="Номер телефона *"
                className="w-full sm:flex-1 min-w-[140px] px-4 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:border-transparent text-sm rounded-xl transition-all"
                style={{ '--tw-ring-color': '#8B5CF6' } as React.CSSProperties}
              />
              <select
                name="type"
                className="w-full sm:flex-1 min-w-[150px] px-4 py-3.5 bg-neutral-900/90 sm:bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm focus:outline-none focus:ring-1 focus:border-transparent rounded-xl transition-all cursor-pointer"
              >
                <option value="" className="text-stone-900">Выберите вариант...</option>
                <option value="Квартира в Минске" className="text-stone-900">Квартира в Минске</option>
                <option value="Загородный дом / Дача" className="text-stone-900">Загородный дом / Дача</option>
                <option value="Коммерческое помещение" className="text-stone-900">Коммерческое помещение</option>
                <option value="Сложный обмен / Разъезд" className="text-stone-900">Сложный обмен / Разъезд</option>
              </select>
              <button
                type="submit"
                className="w-full sm:w-auto flex-none px-7 py-3.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold rounded-xl text-sm transition-all whitespace-nowrap shadow-lg shadow-purple-600/30 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Получить консультацию</span>
                <ArrowRight className="w-4 h-4 hidden sm:inline" />
              </button>
            </form>
            {heroSent && (
              <div className="mb-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/25 border border-purple-400/40 text-purple-100 text-xs font-medium">
                <CheckCircle className="w-4 h-4 text-purple-300" />
                Спасибо! Заявка принята — специалист свяжется с вами в ближайшее время.
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/20 text-[11px] uppercase tracking-[0.18em] text-white/80">
              <span className="inline-flex items-center gap-2 font-medium">
                <Star className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
                5.0 рейтинг
              </span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium">
                <Users className="w-3.5 h-3.5 text-purple-300" />
                1424+ клиентов выбрали нас
              </span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium">
                <Clock className="w-3.5 h-3.5 text-purple-300" />
                Средний срок — 26 дней (мин. 2 дня)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* EDITORIAL SHEET */}
      <div className="relative -mt-10 lg:-mt-14 rounded-t-[36px] lg:rounded-t-[50px] bg-white border-t border-[#E7E2DA] shadow-2xl z-20">
        <div className="max-w-[1520px] mx-auto px-6 lg:px-12 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-10 xl:gap-14 pt-12 lg:pt-16 pb-20">

          <main className="min-w-0 space-y-16">

            {/* ПОЛОСА ДОВЕРИЯ */}
            <Reveal>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: '5.0', label: 'Рейтинг Google Maps', icon: Star },
                  { value: '1424+', label: 'Клиентов выбрали нас', icon: TrendingUp },
                  { value: '0', label: 'Оспоренных сделок', icon: ShieldCheck },
                  { value: '26 дней', label: 'Средний срок (мин. 2 дня)', icon: Clock },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="p-5 bg-stone-50 rounded-2xl border border-stone-200 text-center">
                      <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center mx-auto mb-3">
                        <Icon className="w-4 h-4 text-purple-700" />
                      </div>
                      <div className="text-2xl font-light text-stone-900 mb-1" style={{ fontFamily: displayFont }}>
                        {item.value}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-purple-700 font-semibold">
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            {/* 01: ТЕСТ-ДРАЙВ */}
            <Reveal>
              <section className="pt-8 border-t border-stone-200">
                <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                  01 · Пробный период
                </div>
                <h2
                  className="text-stone-900 mb-6 font-normal tracking-tight"
                  style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 42px)', lineHeight: 1.15 }}
                >
                  Тест-драйв услуг агентства по продаже квартиры
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-7 bg-gradient-to-br from-purple-50 to-stone-50 rounded-3xl border border-purple-200/70">
                  <div className="md:col-span-4 flex justify-center">
                    <div className="relative w-[180px] h-[180px] flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full" style={{ border: '1px solid #8B5CF655' }} />
                      <div className="absolute inset-3 rounded-full border border-dashed" style={{ borderColor: '#8B5CF633' }} />
                      <div className="relative z-10 text-center">
                        <div className="text-stone-900 text-[76px] leading-none font-light" style={{ fontFamily: displayFont }}>10</div>
                        <div className="text-[18px] tracking-wide text-purple-700">дней</div>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-8">
                    <p className="text-stone-600 text-[15px] leading-relaxed mb-6 font-light">
                      Мы продвигаем Вашу недвижимость на протяжении 10 дней. Вы узнаете максимальную цену квартиры, спрос на Вашу недвижимость, экономите время и получаете сразу выгодные предложения от покупателей.
                    </p>
                    <button
                      onClick={() => navigateTo('10-dnej-probnogo-perioda' as PageId)}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                    >
                      Подробнее
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </section>
            </Reveal>

            {/* 02: О КОМПАНИИ */}
            <Reveal>
              <section className="pt-8 border-t border-stone-200">
                <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                  02 · О компании
                </div>
                <h2
                  className="text-stone-900 mb-6 font-normal tracking-tight"
                  style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
                >
                  Агентство недвижимости «АН Фаттория»
                </h2>

                <article className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm">
                  <p className="text-stone-600 text-[15px] leading-relaxed font-light mb-4">
                    Мы работаем на рынке недвижимости Минска с 2022 года. Наши специалисты — аттестованные риэлтеры с многолетним опытом работы в сфере жилой, загородной и коммерческой недвижимости.
                  </p>
                  <p className="text-stone-600 text-[15px] leading-relaxed font-light">
                    Каждая сделка сопровождается юридической службой агентства и застрахована в РУП «Белгосстрах». Мы работаем в строгом соответствии с законодательством Республики Беларусь.
                  </p>
                </article>

                <button
                  onClick={() => navigateTo('ob-agentstve' as PageId)}
                  className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 hover:text-purple-900 transition cursor-pointer"
                >
                  Подробнее о нас
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </section>
            </Reveal>

            {/* 03: 4 ШАГА */}
            <Reveal>
              <section className="pt-8 border-t border-stone-200">
                <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                  03 · Процесс
                </div>
                <h2
                  className="text-stone-900 mb-6 font-normal tracking-tight"
                  style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
                >
                  От заявки до ключей — 4 шага
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { n: '01', t: 'Заявка', d: 'Оставляете заявку — перезваниваем за 15 минут' },
                    { n: '02', t: 'Оценка', d: 'Бесплатный выезд оценщика на объект' },
                    { n: '03', t: 'Продвижение', d: 'Фото, реклама, показы, переговоры' },
                    { n: '04', t: 'Сделка', d: 'Юрист, нотариус, расчёты, ключи' },
                  ].map((s, i) => (
                    <div key={i} className="p-6 bg-white rounded-3xl border border-stone-200 hover:border-purple-200 transition-all">
                      <div className="text-3xl font-light mb-3 text-purple-600" style={{ fontFamily: displayFont }}>{s.n}</div>
                      <h3 className="text-stone-900 text-base mb-2" style={{ fontFamily: displayFont }}>{s.t}</h3>
                      <p className="text-stone-500 text-[13px] leading-relaxed font-light">{s.d}</p>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>

            {/* 04: 6 ПРИЧИН */}
            <Reveal>
              <section className="pt-8 border-t border-stone-200">
                <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                  04 · Преимущества
                </div>
                <h2
                  className="text-stone-900 mb-6 font-normal tracking-tight"
                  style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
                >
                  6 причин работать с нами
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { icon: ShieldCheck, t: 'Белгосстрах', d: 'Ответственность застрахована на 10 000 базовых величин' },
                    { icon: Scale, t: 'Госрегулирование', d: 'Работаем по тарифам, установленным Совмином' },
                    { icon: FileCheck, t: 'Юрист на сделке', d: 'Трёхэтапная проверка чистоты объекта' },
                    { icon: Users, t: '1424+ клиентов', d: 'Выбрали нас для своих сделок с 2022 года' },
                    { icon: Clock, t: 'Средний срок — 26 дней', d: 'Минимальный срок продажи — 2 дня' },
                    { icon: Award, t: 'Лицензия Минюста', d: '№ 02240/446 от 11.07.2022' },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex gap-4 p-5 bg-white rounded-2xl border border-stone-200 hover:border-purple-200 transition-all">
                        <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-purple-700" />
                        </div>
                        <div>
                          <h3 className="text-stone-900 font-semibold text-sm mb-1">{item.t}</h3>
                          <p className="text-stone-500 text-xs leading-relaxed font-light">{item.d}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </Reveal>

            {/* 05: КАТАЛОГ */}
            <Reveal>
              <section className="pt-8 border-t border-stone-200">
                <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                  05 · Актуальные предложения
                </div>
                <h2
                  className="text-stone-900 mb-6 font-normal tracking-tight"
                  style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
                >
                  Каталог недвижимости
                </h2>

                <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 mb-6">
                  <div className="flex flex-wrap gap-2 mb-5">
                    {['Все объекты', 'Квартиры', 'Дома', 'Коммерция', 'Участки'].map((label, i) => {
                      const type = ['all', 'apartment', 'house', 'commercial', 'plot'][i];
                      const active = catalogSelectedType === type;
                      return (
                        <button
                          key={i}
                          onClick={() => setCatalogSelectedType?.(type as any)}
                          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                            active
                              ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md'
                              : 'bg-white border border-stone-300 text-stone-600 hover:border-purple-400'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-5 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Район, улица, метро..."
                        value={catalogSearchQuery || ''}
                        onChange={(e) => setCatalogSearchQuery?.(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-stone-300 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-purple-500 rounded-xl"
                      />
                    </div>
                    <div className="md:col-span-4 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-medium">BYN</span>
                      <input
                        type="number"
                        placeholder="Макс. цена"
                        value={catalogMaxPrice || ''}
                        onChange={(e) => setCatalogMaxPrice?.(Number(e.target.value))}
                        className="w-full pl-14 pr-4 py-3 bg-white border border-stone-300 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-purple-500 rounded-xl"
                      />
                    </div>
                    <div className="md:col-span-3 flex gap-2">
                      <button
                        onClick={() => { setCatalogSearchQuery?.(''); setCatalogSelectedType?.('all'); setCatalogMaxPrice?.(0); }}
                        className="flex-1 py-3 bg-white border border-stone-300 text-stone-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:border-purple-400 transition-colors cursor-pointer"
                      >
                        Сбросить
                      </button>
                      <button
                        onClick={() => navigateTo('catalog' as PageId)}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                      >
                        Поиск
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-stone-500">
                    Найдено: <strong className="text-stone-900">{filteredProperties.length}</strong> объектов
                  </div>
                </div>

                {previewProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {previewProperties.map((property) => (
                      <div
                        key={property.id}
                        onClick={() => { window.location.href = `/object/${property.slug || property.id}`; }}
                        className="group bg-white rounded-3xl overflow-hidden border border-stone-200 hover:shadow-lg hover:border-purple-200 transition-all cursor-pointer hover:-translate-y-1"
                      >
                        <div className="relative h-52 overflow-hidden">
                          <Image src={property.photo || '/photo/999.jpg'} alt={property.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute bottom-3 left-3 bg-stone-900/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-sm" style={{ fontFamily: displayFont, fontWeight: 500 }}>
                            {formatPrice(property.priceBYN || 0)}
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="text-sm font-semibold text-stone-900 mb-2 line-clamp-2">{property.title}</h3>
                          <p className="text-xs text-stone-500 mb-4 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-purple-600" /> {property.address || 'Минск'}
                          </p>
                          <button
                            onClick={(e) => { e.stopPropagation(); window.location.href = `/object/${property.slug || property.id}`; }}
                            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                          >
                            Подробнее
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-stone-50 rounded-3xl border border-stone-200">
                    <p className="text-stone-500 mb-4">
                      {realProperties.length === 0 ? 'Загрузка объектов...' : 'По вашему запросу ничего не найдено'}
                    </p>
                    <button
                      onClick={() => { setCatalogSearchQuery?.(''); setCatalogSelectedType?.('all'); setCatalogMaxPrice?.(0); }}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Сбросить фильтры
                    </button>
                  </div>
                )}

                {filteredProperties.length > 3 && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => navigateTo('catalog' as PageId)}
                      className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer hover:-translate-y-0.5"
                    >
                      Смотреть все объекты ({filteredProperties.length})
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </section>
            </Reveal>

            {/* 06: МИНИ-КВИЗ */}
            <Reveal>
              <section className="pt-8 border-t border-stone-200">
                <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                  06 · Быстрая оценка
                </div>
                <h2
                  className="text-stone-900 mb-6 font-normal tracking-tight"
                  style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
                >
                  Узнайте цену вашей квартиры за 30 секунд
                </h2>
                <p className="text-stone-600 text-[15px] leading-relaxed mb-6 font-light">
                  Ответьте на 2 вопроса — оценщик перезвонит с расчётом.
                </p>
                <MiniQuiz onSubmit={handleAddLead} />
              </section>
            </Reveal>

            {/* 07: СТАТЬИ */}
            <Reveal>
              <section className="pt-8 border-t border-stone-200">
                <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                  07 · Экспертиза
                </div>
                <h2
                  className="text-stone-900 mb-6 font-normal tracking-tight"
                  style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
                >
                  Статьи
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[0, 1, 2].map((idx) => {
                    const article = articlesList[idx];
                    return (
                      <article
                        key={idx}
                        onClick={() => { if (article && onSelectArticle) onSelectArticle(article); else navigateTo('novosti-nedvizhimosti' as PageId); }}
                        className="p-6 bg-white rounded-3xl border border-stone-200 hover:shadow-lg hover:border-purple-200 transition-all cursor-pointer hover:-translate-y-1 flex flex-col min-h-[240px]"
                      >
                        <p className="mb-3 text-[10px] uppercase tracking-wider text-purple-700 font-semibold">
                          {article?.date || '2024'}
                        </p>
                        <h3 className="text-stone-900 mb-3 text-base flex-1" style={{ fontFamily: displayFont, fontWeight: 500 }}>
                          {article?.title || 'Что такое проверка недвижимости?'}
                        </h3>
                        <p className="text-stone-500 text-xs line-clamp-3 mb-3 font-light">
                          {article?.snippet || ''}
                        </p>
                        <p className="text-[10px] text-stone-400 uppercase tracking-wider">
                          {5 + idx} мин чтения
                        </p>
                      </article>
                    );
                  })}
                </div>

                <div className="text-center mt-6">
                  <button
                    onClick={() => navigateTo('novosti-nedvizhimosti' as PageId)}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 hover:text-purple-900 transition cursor-pointer"
                  >
                    Все статьи
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </section>
            </Reveal>

            {/* 08: СЛУЖБА КАЧЕСТВА */}
            <Reveal>
              <section className="pt-8 border-t border-stone-200">
                <div className="p-7 bg-gradient-to-br from-purple-50 to-stone-50 rounded-3xl border border-purple-200/70">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-full bg-white border border-purple-200 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-7 h-7 text-purple-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-normal text-stone-900 mb-2" style={{ fontFamily: displayFont }}>
                        Служба качества компании
                      </h3>
                      <p className="text-stone-600 text-[15px] leading-relaxed font-light mb-4">
                        Нам очень важно Ваше мнение о качестве работы специалистов. Если у Вас возникли вопросы или Вы бы хотели оставить отзыв — отправьте сообщение в службу качества.
                      </p>
                      <button
                        onClick={() => navigateTo('kontrol-kachestva' as PageId)}
                        className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer hover:-translate-y-0.5"
                      >
                        Оставить отзыв
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </Reveal>

            {/* 09: ОТЗЫВЫ */}
            <Reveal>
              <section className="pt-8 border-t border-stone-200">
                <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                  08 · Реальный опыт
                </div>
                <h2
                  className="text-stone-900 mb-6 font-normal tracking-tight"
                  style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
                >
                  Отзывы клиентов
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {clientsReviews.slice(0, 4).map((review, index) => (
                    <article key={index} className="p-6 bg-white rounded-3xl border border-stone-200 hover:shadow-md hover:border-purple-200 transition-all">
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: review?.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-purple-600 fill-purple-600" />
                        ))}
                      </div>
                      <p className="text-stone-700 leading-relaxed mb-5 italic text-[15px] font-light" style={{ fontFamily: displayFont, fontStyle: 'italic' }}>
                        "{review?.text || 'Отличное агентство!'}"
                      </p>
                      <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                        {review?.avatar ? (
                          <Image src={review.avatar} alt={review.author} width={40} height={40} sizes="40px" className="w-10 h-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-xs shrink-0">
                            {(review?.author || 'К')[0]}
                          </div>
                        )}
                        <div>
                          <h4 className="text-stone-900 font-semibold text-sm">{review?.author || 'Клиент'}</h4>
                          <p className="text-stone-400 text-xs">{review?.role || 'Пользователь'} • {review?.date || '2026'}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="text-center mt-6">
                  <button
                    onClick={() => navigateTo('otzyvy-klientov' as PageId)}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 hover:text-purple-900 transition cursor-pointer"
                  >
                    Все отзывы
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </section>
            </Reveal>

            {/* 10: КОМАНДА */}
            <Reveal>
              <section className="pt-8 border-t border-stone-200">
                <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                  09 · Люди, которым доверяют
                </div>
                <h2
                  className="text-stone-900 mb-6 font-normal tracking-tight"
                  style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
                >
                  Наша команда
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {agentsList.filter(isRealtorAgent).slice(0, 6).map((agent) => (
                    <div
                      key={agent.id}
                      onClick={() => { if (onViewProfile) onViewProfile(agent); else navigateTo('vybrat-agenta' as PageId); }}
                      className="group cursor-pointer"
                    >
                      <div className="relative aspect-[3/4] bg-stone-100 rounded-2xl overflow-hidden mb-3 border border-stone-200 group-hover:border-purple-300 transition-all">
                        <AgentBrandAvatar photo={agent.photo} name={agent.name} size="full" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <h4 className="text-stone-900 text-sm font-semibold">{agent.name}</h4>
                      <p className="text-xs text-purple-700">{agent.role}</p>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-6">
                  <button
                    onClick={() => navigateTo('vybrat-agenta' as PageId)}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 hover:text-purple-900 transition cursor-pointer"
                  >
                    Все специалисты
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </section>
            </Reveal>

            {/* 11: ГЕОГРАФИЯ */}
            <Reveal>
              <section className="pt-8 border-t border-stone-200">
                <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                  10 · География
                </div>
                <h2
                  className="text-stone-900 mb-6 font-normal tracking-tight"
                  style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
                >
                  Работаем по всему Минску и области
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-5 bg-white rounded-3xl border border-stone-200">
                      <MapPin className="w-4 h-4 shrink-0 mt-1 text-purple-600" />
                      <div>
                        <div className="text-stone-900 text-sm font-semibold mb-0.5">Центральный офис</div>
                        <div className="text-stone-500 text-xs">г. Минск, ул. Репина, д. 4, пом. 458</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-5 bg-white rounded-3xl border border-stone-200">
                      <Clock className="w-4 h-4 shrink-0 mt-1 text-purple-600" />
                      <div>
                        <div className="text-stone-900 text-sm font-semibold mb-0.5">Режим работы</div>
                        <div className="text-stone-500 text-xs">пн–пт 9:00–21:00 · сб 10:00–15:00 · вс по записи</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-5 bg-white rounded-3xl border border-stone-200">
                      <Phone className="w-4 h-4 shrink-0 mt-1 text-purple-600" />
                      <div>
                        <div className="text-stone-900 text-sm font-semibold mb-0.5">Телефон</div>
                        <a href="tel:+375296380053" className="text-stone-500 text-xs hover:text-purple-700 transition-colors">
                          +375 29 638-00-53
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="aspect-video overflow-hidden rounded-2xl border border-stone-200">
                    <iframe
                      src="https://yandex.ru/map-widget/v1/?z=14&ol=biz&oid=14167994740"
                      className="w-full h-full"
                      frameBorder="0"
                    />
                  </div>
                </div>
              </section>
            </Reveal>

            {/* 12: ДОКУМЕНТЫ И ЛИЦЕНЗИИ — 4 документа */}
            <Reveal>
              <section className="pt-8 border-t border-stone-200">
                <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                  11 · Документы и лицензии
                </div>
                <h2
                  className="text-stone-900 mb-3 font-normal tracking-tight"
                  style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
                >
                  Официальные документы агентства
                </h2>
                <p className="text-stone-600 text-[15px] leading-relaxed mb-6 font-light max-w-3xl">
                  Лицензия Минюста, договор страхования профессиональной ответственности и типовые договоры оказания услуг. Нажмите на документ, чтобы увеличить.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {DOCUMENTS.map((doc, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setOpenDoc(doc)}
                      className="group text-left bg-white rounded-2xl border border-stone-200 hover:border-purple-300 hover:shadow-lg transition-all overflow-hidden cursor-pointer"
                      aria-label={`Открыть документ: ${doc.label}`}
                    >
                      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
                        {!brokenDocs[i] ? (
                          <img
                            src={doc.src}
                            alt={doc.label}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                            onError={() => setBrokenDocs((prev) => ({ ...prev, [i]: true }))}
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 gap-2 p-4 text-center">
                            <FileCheck className="w-10 h-10 text-purple-400" />
                            <span className="text-xs font-medium text-stone-500">Документ {i + 1}</span>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          Увеличить
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-[11px] uppercase tracking-wider text-purple-700 font-semibold mb-1">
                          Документ {String(i + 1).padStart(2, '0')}
                        </p>
                        <p className="text-[13px] text-stone-700 leading-snug font-light">
                          {doc.label}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </Reveal>

          </main>

          {/* ПРАВЫЙ STICKY-САЙДБАР */}
          <aside className="hidden xl:block xl:sticky xl:top-28 xl:h-fit space-y-6">

            <div className="p-7 bg-white rounded-3xl border border-stone-200 shadow-md">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-purple-700 mb-2">
                Быстрая связь
              </div>
              <h3 className="text-stone-900 text-xl font-normal mb-2" style={{ fontFamily: displayFont }}>
                Позвоните нам
              </h3>
              <p className="text-xs text-stone-500 mb-6 font-light leading-relaxed">
                Работаем ежедневно. Ответим на вопросы и подберём специалиста.
              </p>

              <a
                href="tel:+375296380053"
                className="block w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-600/20 cursor-pointer text-center mb-3"
              >
                +375 29 638-00-53
              </a>

              <div className="flex gap-2">
                <a
                  href="viber://chat?number=%2B375296380053"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-3 text-[11px] font-semibold uppercase tracking-wider rounded-xl border border-stone-300 bg-white hover:border-purple-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-stone-600" />
                  <span>Viber</span>
                </a>
                <a
                  href="https://t.me/fattoriaminsk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-3 text-[11px] font-semibold uppercase tracking-wider rounded-xl border border-stone-300 bg-white hover:border-purple-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-stone-600" />
                  <span>Telegram</span>
                </a>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-stone-100 rounded-3xl border border-purple-200/70">
              <div className="flex items-center gap-2 text-purple-800 text-[11px] font-bold uppercase tracking-wider mb-3">
                <MapPin className="w-4 h-4" /> Адрес офиса
              </div>
              <p className="text-sm text-stone-900 font-medium mb-1">
                г. Минск, ул. Репина, д. 4
              </p>
              <p className="text-[11px] text-stone-500 font-light">
                пом. 458, 220035
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

      {/* МОДАЛКА ПРОСМОТРА ДОКУМЕНТА */}
      {openDoc && (
        <div
          className="fixed inset-0 z-[9999] bg-black/92 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpenDoc(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Просмотр документа: ${openDoc.label}`}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpenDoc(null); }}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/25 transition flex items-center justify-center cursor-pointer z-10"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className="max-w-[95vw] max-h-[92vh] flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={openDoc.src}
              alt={openDoc.label}
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl bg-white"
            />
            <div className="text-center max-w-2xl px-4">
              <p className="text-white font-semibold text-base mb-1">{openDoc.label}</p>
              <p className="text-white/70 text-xs">{openDoc.caption}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}