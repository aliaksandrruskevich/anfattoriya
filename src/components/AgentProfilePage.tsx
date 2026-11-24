"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Agent, Property, PageId } from '../types';
import {
  Phone,
  Mail,
  ChevronLeft,
  Check,
  X,
  MapPin,
  MessageSquare,
  Award,
  Star,
  Copy,
  CheckCheck,
  Send,
  BadgeCheck,
  ArrowUpRight,
  Home,
  PlusCircle,
} from 'lucide-react';
import { AgentBrandAvatar } from './AgentBrandAvatar';
import { getAgentUrl, getAgentFullUrl } from '../lib/routes';
import { getAgentReviews, addAgentReview, AgentReview } from '../utils/reviewsManager';
import { isSamePersonName } from '../lib/agentUtils';

interface AgentProfilePageProps {
  agent: Agent;
  propertiesList: Property[];
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
  onBack: () => void;
  currency?: string;
}

type AgentExtras = {
  bio?: string;
  dealsClosed?: number;
  responseTime?: string;
  specializations?: string[];
  languages?: string[];
  workingHours?: string;
  telegram?: string;
  reviews?: { author: string; text: string }[];
};

const TYPE_PLURAL: Record<string, string> = {
  apartment: 'Квартиры',
  house: 'Дома',
  commercial: 'Коммерция',
  land: 'Участки',
  plot: 'Участки',
};

const typeSingular = (type?: string) =>
  type === 'apartment'
    ? 'Квартира'
    : type === 'house'
      ? 'Дом'
      : type === 'commercial'
        ? 'Коммерческая'
        : 'Участок';


const FALLBACK_IMG = '/photo/logo.png';

const DISPLAY_FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');
.fp-display { font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, 'Times New Roman', serif; }
`;

function namesLikelyMatch(a?: string, b?: string): boolean {
  return isSamePersonName(a, b);
}

/* ---------- вспомогательные компоненты ---------- */

function SectionHeading({
  num,
  title,
  aside,
}: {
  num: string;
  title: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mb-10 md:mb-12">
      <div className="flex items-end justify-between gap-6 pb-4 border-b border-neutral-900">
        <div className="flex items-baseline gap-4">
          <span className="fp-display italic text-2xl text-purple-700">{num}</span>
          <h2 className="fp-display text-3xl md:text-5xl font-medium tracking-tight text-neutral-950">
            {title}
          </h2>
        </div>
        {aside && (
          <div className="hidden sm:block text-[11px] uppercase tracking-[0.2em] text-stone-500 font-semibold pb-1.5">
            {aside}
          </div>
        )}
      </div>
    </div>
  );
}

function PropertyCard({
  prop,
  currency,
  onOpen,
  featured = false,
}: {
  prop: Property;
  currency: string;
  onOpen: (p: Property) => void;
  featured?: boolean;
}) {
  const isRental =
    Array.isArray(prop.features) &&
    prop.features.some((f) => String(f).toLowerCase().includes('аренда'));

  const priceValue = prop.priceBYN || prop.priceUSD || 0;

  // Цена за м² считается ТОЛЬКО для продажи (для аренды priceBYN = price_per_m2 * area)
  const perM2 =
    !isRental && prop.area > 0 && prop.priceBYN > 0
      ? Math.round(prop.priceBYN / prop.area)
      : null;

  const image = (
    <div
      className={`relative overflow-hidden bg-stone-100 ${
        featured ? 'md:col-span-3 h-72 md:h-full md:min-h-[380px]' : 'aspect-[4/3]'
      }`}
    >
      <img
        src={prop.photo || FALLBACK_IMG}
        alt={prop.title}
        loading={featured ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={featured ? 'high' : 'auto'}
        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-[900ms] ease-out"
        onError={(e) => {
          (e.target as HTMLImageElement).src = FALLBACK_IMG;
        }}
      />
      <span className="absolute top-4 left-4 bg-white/95 text-neutral-900 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5">
        {typeSingular(prop.type)}
      </span>
      {isRental && (
        <span className="absolute top-4 right-4 bg-purple-700 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5">
          Аренда
        </span>
      )}
    </div>
  );

  const body = (
    <div
      className={`${
        featured ? 'md:col-span-2 p-7 md:p-10 flex flex-col justify-between gap-8' : 'pt-5 space-y-3'
      }`}
    >
      <div className="space-y-3">
        {featured && (
          <p className="text-[10px] uppercase tracking-[0.3em] text-purple-700 font-bold">
            Объект в фокусе
          </p>
        )}
        <h3
          className={`fp-display font-medium text-neutral-950 leading-[1.1] ${
            featured ? 'text-3xl md:text-4xl' : 'text-xl line-clamp-2'
          }`}
        >
          {prop.title}
        </h3>
        <p className="flex items-start gap-1.5 text-xs text-stone-500">
          <MapPin className="w-3.5 h-3.5 text-purple-600 mt-0.5 shrink-0" />
          <span className={featured ? '' : 'line-clamp-1'}>{prop.address}</span>
        </p>
      </div>

      <div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-600 font-medium mb-4">
          <span>{prop.area} м²</span>
          {prop.rooms ? <span>{prop.rooms} комн.</span> : null}
          {perM2 ? (
            <span>
              {perM2.toLocaleString()} {currency}/м²
            </span>
          ) : null}
        </div>
        <div className="flex items-end justify-between border-t border-stone-300 pt-4">
          <p
            className={`fp-display font-semibold text-neutral-950 ${
              featured ? 'text-4xl' : 'text-2xl'
            }`}
          >
            {priceValue > 0 ? (
              <>
                {priceValue.toLocaleString()}{' '}
                <span className="text-sm font-sans font-bold text-stone-500">{currency}</span>
                {isRental && (
                  <span className="text-xs font-sans font-medium text-stone-500 ml-1">/мес</span>
                )}
              </>
            ) : (
              <span className="text-base font-sans font-bold text-purple-700">
                Цена по запросу
              </span>
            )}
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] font-bold text-neutral-900 group-hover:text-purple-700 transition-colors">
            Подробнее <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <article
      onClick={() => onOpen(prop)}
      className={`group cursor-pointer ${
        featured ? 'grid grid-cols-1 md:grid-cols-5 bg-white border border-stone-200' : ''
      }`}
    >
      {image}
      {body}
    </article>
  );
}

/* ---------- страница ---------- */

const PAGE_SIZE = 12; // сколько объектов показывать за раз (чтобы не тормозить)

export default function AgentProfilePage({
  agent,
  propertiesList,
  handleAddLead,
  onBack,
  currency = 'BYN',
}: AgentProfilePageProps) {
  const router = useRouter();
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  const [agentReviews, setAgentReviews] = useState<AgentReview[]>([]);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRole, setNewReviewRole] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [ratingHover, setRatingHover] = useState(0);

  useEffect(() => {
    setAgentReviews(getAgentReviews(agent.id, agent.name));
  }, [agent.id, agent.name]);

  useEffect(() => {
    const handleSync = (e: any) => {
      if (e.detail?.agentId === agent.id || (agent.name && e.detail?.agentName === agent.name)) {
        setAgentReviews(getAgentReviews(agent.id, agent.name));
      }
    };
    window.addEventListener('fp_reviews_updated', handleSync);
    return () => window.removeEventListener('fp_reviews_updated', handleSync);
  }, [agent.id, agent.name]);

  const cleanRealtorUrl = getAgentUrl(agent);
  const fullRealtorUrl = getAgentFullUrl(agent);
  const extra = agent as Agent & AgentExtras;
  const phoneDigits = (agent.phone || '').replace(/[^\d+]/g, '');

  const nameParts = (agent.name || '').trim().split(/\s+/);
  const surname = nameParts[0] || '';
  const givenName = nameParts.slice(1).join(' ');
  const firstNameForText = givenName || surname;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullRealtorUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  /**
   * Фильтр объектов по агенту:
   *  1. Приоритет — assignedAgentId (в БД совпадает с agents.id).
   *  2. Fallback — assignedAgentName (записан при синке).
   *  3. Fallback — agentName из фида («Фамилия Имя» ↔ «Имя Фамилия»).
   */
  const agentProperties = useMemo(() => {
    if (!Array.isArray(propertiesList) || propertiesList.length === 0) return [];
    const agentIdNorm = (agent.id || '').trim().toLowerCase();

    return propertiesList.filter((p) => {
      const propAgentId = p.assignedAgentId ? String(p.assignedAgentId).trim().toLowerCase() : '';
      // 1. Если у объекта явно задан assignedAgentId — доверяем ему строго
      if (propAgentId && agentIdNorm) {
        return propAgentId === agentIdNorm;
      }

      // 2. Fallback — по полному имени (assignedAgentName / agentName), без пересечения однофамильцев
      if (p.assignedAgentName && agent.name) {
        if (namesLikelyMatch(p.assignedAgentName, agent.name)) return true;
      }

      if (p.agentName && agent.name) {
        if (namesLikelyMatch(p.agentName, agent.name)) return true;
      }

      return false;
    });
  }, [propertiesList, agent.id, agent.name]);

  // Сброс пагинации при смене агента
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [agent.id]);

  const visibleProperties = useMemo(
    () => agentProperties.slice(0, visibleCount),
    [agentProperties, visibleCount]
  );
  const hasMore = visibleCount < agentProperties.length;

  const rating =
    agentReviews.length > 0
      ? (agentReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / agentReviews.length).toFixed(1)
      : typeof agent.rating === 'number'
        ? agent.rating.toFixed(1)
        : agent.rating || '5.0';

  const specializations =
    extra.specializations && extra.specializations.length > 0
      ? extra.specializations
      : Array.from(new Set(agentProperties.map((p) => TYPE_PLURAL[p.type] || 'Другое'))).slice(0, 4);

  const serviceDistricts = Array.from(
    new Set(agentProperties.map((p) => p.district).filter(Boolean))
  ).slice(0, 3) as string[];

  const bio =
    extra.bio ||
    `${firstNameForText} сопровождает клиентов на каждом этапе сделки: подбирает объекты под задачу, проверяет документы, ведёт переговоры с продавцом и остаётся на связи вплоть до регистрации права собственности. Условия работы прозрачны, а каждый шаг понятен клиенту.`;

  type Figure = { value: string; unit?: string; label: string };
  const figures = [
    { value: rating, label: 'рейтинг риэлтера' },
    { value: String(agentProperties.length), label: 'объектов в каталоге' },
    { value: String(agentReviews.length), label: 'отзывов клиентов' },
    extra.dealsClosed ? { value: `${extra.dealsClosed}+`, label: 'закрытых сделок' } : null,
    extra.responseTime ? { value: extra.responseTime, label: 'среднее время ответа' } : null,
  ].filter((f): f is Figure => f !== null);

  const principles = [
    'Реальная рыночная цена — без завышений и потерь при продаже',
    'Проверка юридической чистоты объекта на каждом этапе',
    'Сопровождение до регистрации права собственности, а не только до подписи',
  ];

  const sectionNum = (i: number) => String(i).padStart(2, '0');
  const contactNum = 4;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientPhone) return;
    handleAddLead(
      clientName || 'Интересант',
      clientPhone,
      'Консультация',
      `Страница риэлтера: ${agent.name}`
    );
    setFormSubmitted(true);
    setTimeout(() => {
      setClientName('');
      setClientPhone('');
      setFormSubmitted(false);
    }, 4000);
  };

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewText.trim()) return;
    const authorLine = newReviewRole.trim()
      ? `${newReviewAuthor.trim()} (${newReviewRole.trim()})`
      : newReviewAuthor.trim();

    const updated = addAgentReview(
      agent.id,
      {
        author: authorLine,
        text: newReviewText.trim(),
        rating: newReviewRating,
        date: new Date().toLocaleDateString('ru-RU'),
      },
      agent.name
    );
    setAgentReviews(updated);
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
      setShowAddReviewModal(false);
      setNewReviewAuthor('');
      setNewReviewRole('');
      setNewReviewRating(5);
      setNewReviewText('');
    }, 2000);
  };

  const handleOpenProperty = (p: Property) => {
    router.push(`/object/${p.slug || p.id}`);
  };

  const featured = visibleProperties[0];
  const restProps = visibleProperties.slice(1);

  return (
    <div className="bg-[#faf9f7] min-h-screen pb-24 lg:pb-0 font-sans text-neutral-900">
      <style>{DISPLAY_FONT_CSS}</style>

      {/* ================= ОБЛОЖКА ================= */}
      <header className="relative bg-[#f6f2ea] overflow-hidden" style={{ paddingTop: '190px' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pb-16 md:pb-24">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-neutral-900/80 mb-12 md:mb-16">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-stone-600 hover:text-neutral-950 text-[11px] uppercase tracking-[0.25em] font-bold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Назад к списку
            </button>
            <span className="hidden sm:block text-[10px] uppercase tracking-[0.35em] text-stone-500 font-semibold">
              Fattoria Premium · Персональная страница
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* ---- ТЕКСТ ---- */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="flex items-center gap-3 mb-8">
                <span className="h-px w-10 bg-purple-600" />
                <span className="text-[11px] uppercase tracking-[0.3em] text-purple-700 font-bold">
                  Риэлтер
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-stone-600">
                  <Star className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
                  {rating}
                </span>
              </div>

              <h1 className="fp-display font-medium tracking-[-0.02em] text-neutral-950 leading-[0.88] break-words">
                <span className="block text-6xl sm:text-7xl xl:text-[112px]">{surname}</span>
                {givenName && (
                  <span className="block italic text-purple-700 text-5xl sm:text-6xl xl:text-[92px] mt-1">
                    {givenName}
                  </span>
                )}
              </h1>

              <p className="fp-display italic text-xl md:text-2xl text-stone-600 leading-snug mt-8 max-w-xl">
                Персональный подход к каждой сделке — от первого показа до регистрации права
                собственности.
              </p>

              <dl className="mt-10 grid grid-cols-1 sm:grid-cols-3 border-y border-neutral-900/15 divide-y sm:divide-y-0 sm:divide-x divide-neutral-900/15">
                {specializations.length > 0 && (
                  <div className="py-4 sm:px-5 sm:first:pl-0">
                    <dt className="text-[10px] uppercase tracking-[0.25em] text-stone-500 font-bold mb-1.5">
                      Специализация
                    </dt>
                    <dd className="text-sm font-semibold text-neutral-900">
                      {specializations.join(' · ')}
                    </dd>
                  </div>
                )}
                {serviceDistricts.length > 0 && (
                  <div className="py-4 sm:px-5">
                    <dt className="text-[10px] uppercase tracking-[0.25em] text-stone-500 font-bold mb-1.5">
                      География
                    </dt>
                    <dd className="text-sm font-semibold text-neutral-900">
                      {serviceDistricts.join(' · ')}
                    </dd>
                  </div>
                )}
                {extra.workingHours && (
                  <div className="py-4 sm:px-5">
                    <dt className="text-[10px] uppercase tracking-[0.25em] text-stone-500 font-bold mb-1.5">
                      Приём
                    </dt>
                    <dd className="text-sm font-semibold text-neutral-900">{extra.workingHours}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href={`tel:${phoneDigits}`}
                  className="inline-flex items-center gap-2.5 px-7 py-4 bg-neutral-950 hover:bg-purple-700 text-white text-[11px] uppercase tracking-[0.2em] font-bold transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Позвонить
                </a>
                <a
                  href={`viber://chat?number=${phoneDigits}`}
                  className="inline-flex items-center gap-2.5 px-7 py-4 border border-neutral-900 hover:bg-neutral-900 hover:text-white text-[11px] uppercase tracking-[0.2em] font-bold transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Viber
                </a>
                {extra.telegram && (
                  <a
                    href={`https://t.me/${extra.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-7 py-4 border border-neutral-900 hover:bg-neutral-900 hover:text-white text-[11px] uppercase tracking-[0.2em] font-bold transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Telegram
                  </a>
                )}
                <button
                  onClick={() => setShowAddReviewModal(true)}
                  className="inline-flex items-center gap-2.5 px-7 py-4 border border-purple-700 text-purple-700 hover:bg-purple-700 hover:text-white text-[11px] uppercase tracking-[0.2em] font-bold transition-colors group"
                >
                  <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                  Оставить отзыв
                </button>
              </div>
            </div>

            {/* ---- ПОРТРЕТ ---- */}
            <div className="lg:col-span-5 order-1 lg:order-2">
              <figure className="relative max-w-[420px] mx-auto lg:ml-auto lg:mr-0">
                <span className="hidden xl:block absolute -left-10 bottom-0 text-[10px] tracking-[0.4em] uppercase text-stone-400 font-semibold [writing-mode:vertical-rl] rotate-180">
                  Portrait · Fattoria Premium
                </span>

                <div className="relative aspect-[3/4] overflow-hidden bg-stone-200 shadow-[0_35px_70px_-25px_rgba(23,15,45,0.45)]">
                  <AgentBrandAvatar
                    photo={agent.photo}
                    name={agent.name}
                    size="full"
                    className="w-full h-full object-cover"
                    showBadge={false}
                  />
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900">
                    <BadgeCheck className="w-3.5 h-3.5 text-purple-700" />
                    Проверен
                  </span>
                </div>

                <figcaption className="relative mt-4 flex items-start justify-between gap-4 text-xs">
                  <div>
                    <p className="fp-display text-lg font-semibold text-neutral-950 leading-tight">
                      {agent.name}
                    </p>
                    <p className="text-stone-500 mt-0.5">Риэлтер · Fattoria Premium</p>
                  </div>
                  <p className="inline-flex items-center gap-1.5 font-bold text-neutral-900 shrink-0">
                    <Star className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
                    {rating}
                  </p>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </header>

      {/* ================= КЛЮЧЕВЫЕ ЦИФРЫ ================= */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div
            className={`grid grid-cols-2 ${
              figures.length >= 4 ? 'lg:grid-cols-4' : figures.length === 3 ? 'lg:grid-cols-3' : ''
            } divide-x divide-stone-200`}
          >
            {figures.map((f, i) => (
              <div key={i} className="py-8 md:py-10 px-4 md:px-8 first:pl-0">
                <p className="fp-display text-4xl md:text-5xl font-medium text-neutral-950 leading-none">
                  {f.value}
                  {f.unit && (
                    <span className="font-sans text-xs font-bold text-stone-400 ml-1.5 tracking-wider">
                      {f.unit}
                    </span>
                  )}
                </p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500 font-bold mt-3">
                  {f.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* ================= 01 · О СПЕЦИАЛИСТЕ ================= */}
        <section className="pt-20 md:pt-28">
          <SectionHeading num="01" title="О специалисте" aside="Подход к работе" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-7">
              <p className="fp-display text-2xl md:text-[28px] leading-[1.45] text-neutral-800 first-letter:float-left first-letter:text-[88px] first-letter:leading-[0.78] first-letter:font-medium first-letter:mr-3 first-letter:mt-1.5 first-letter:text-purple-700">
                {bio}
              </p>
            </div>

            <div className="lg:col-span-5">
              <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500 font-bold mb-5">
                Три принципа
              </p>
              <ol className="divide-y divide-stone-300 border-y border-stone-300">
                {principles.map((text, i) => (
                  <li key={i} className="flex gap-5 py-5">
                    <span className="fp-display italic text-3xl text-purple-700 leading-none w-8 shrink-0">
                      {['I', 'II', 'III'][i]}
                    </span>
                    <p className="text-sm text-stone-700 leading-relaxed">{text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ================= 02 · ОБЪЕКТЫ ================= */}
        <section className="pt-20 md:pt-28">
          <SectionHeading
            num="02"
            title="Объекты в каталоге"
            aside={`${agentProperties.length} в работе`}
          />

          {agentProperties.length === 0 ? (
            <div className="border border-stone-200 bg-white py-20 text-center">
              <Home className="w-8 h-8 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500 text-sm">У этого риэлтера пока нет активных объектов</p>
            </div>
          ) : (
            <div className="space-y-12">
              {featured && (
                <PropertyCard
                  prop={featured}
                  currency={currency}
                  onOpen={handleOpenProperty}
                  featured
                />
              )}
              {restProps.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {restProps.map((prop) => (
                    <PropertyCard
                      key={prop.id}
                      prop={prop}
                      currency={currency}
                      onOpen={handleOpenProperty}
                    />
                  ))}
                </div>
              )}

              {hasMore && (
                <div className="pt-4 text-center">
                  <button
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="px-8 py-4 bg-neutral-950 hover:bg-purple-700 text-white text-[11px] uppercase tracking-[0.2em] font-bold transition-colors"
                  >
                    Показать ещё {Math.min(PAGE_SIZE, agentProperties.length - visibleCount)}
                  </button>
                  <p className="text-[11px] text-stone-500 mt-3 font-mono">
                    Показано {visibleProperties.length} из {agentProperties.length}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ================= 03 · ОТЗЫВЫ КЛИЕНТОВ ================= */}
        <section className="pt-20 md:pt-28">
          <div className="mb-10 md:mb-12">
            <div className="flex items-end justify-between gap-4 pb-4 border-b border-neutral-900">
              <div className="flex items-baseline gap-4">
                <span className="fp-display italic text-2xl text-purple-700">03</span>
                <h2 className="fp-display text-3xl md:text-5xl font-medium tracking-tight text-neutral-950">
                  Слова клиентов
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-full font-sans">
                  {agentReviews.length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#f3eee5] border border-stone-300 p-6 md:p-8 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="text-center md:text-left">
                <span className="fp-display text-5xl md:text-6xl font-medium text-neutral-950 leading-none">
                  {rating}
                </span>
                <span className="text-stone-500 text-xs font-bold uppercase tracking-wider block mt-1">
                  из 5.0
                </span>
              </div>
              <div className="h-12 w-px bg-stone-300 hidden sm:block" />
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-5 h-5 ${
                        s <= Math.round(Number(rating))
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs font-semibold text-stone-700">
                  На основе {agentReviews.length} проверенных отзывов клиентов
                </p>
              </div>
            </div>
            <div className="text-xs text-stone-500 max-w-md leading-relaxed border-t md:border-t-0 pt-3 md:pt-0 border-stone-300">
              <div className="flex items-center gap-1.5 text-purple-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                <BadgeCheck className="w-4 h-4 text-purple-700" />
                100% прозрачность и подлинность
              </div>
              Отзывы публикуются от реальных участников сделок (продавцов и покупателей) и
              сохраняются персонально в профиле специалиста.
            </div>
          </div>

          {agentReviews.length === 0 ? (
            <div className="border border-dashed border-stone-300 bg-white py-16 px-6 text-center">
              <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <h3 className="fp-display text-2xl font-medium text-neutral-900 mb-2">
                У этого специалиста пока нет отзывов
              </h3>
              <p className="text-stone-500 text-sm max-w-md mx-auto mb-6">
                Вы уже сотрудничали с {firstNameForText}? Поделитесь своим опытом покупки или
                продажи недвижимости.
              </p>
              <button
                onClick={() => setShowAddReviewModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-neutral-950 hover:bg-purple-700 text-white text-[11px] uppercase tracking-[0.2em] font-bold transition-all"
              >
                <PlusCircle className="w-4 h-4 text-purple-400" />
                Написать первый отзыв
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {agentReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="relative bg-white border border-stone-200 p-8 flex flex-col justify-between hover:border-purple-300 transition-colors shadow-sm"
                >
                  <span className="fp-display absolute -top-5 left-6 text-7xl leading-none text-purple-100 select-none pointer-events-none">
                    "
                  </span>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= (rev.rating || 5)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-stone-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-stone-400 font-mono">{rev.date}</span>
                    </div>

                    <p className="fp-display italic text-xl md:text-[22px] leading-snug text-neutral-800 relative z-10 mb-6">
                      {rev.text}
                    </p>
                  </div>

                  <footer className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-px w-6 bg-purple-600 shrink-0" />
                      <span className="font-semibold text-neutral-900 truncate">{rev.author}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded shrink-0">
                      <BadgeCheck className="w-3.5 h-3.5" /> Сделка подтверждена
                    </span>
                  </footer>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ================= СВЯЗЬ И АТТЕСТАЦИЯ ================= */}
      <section className="mt-24 md:mt-32 bg-neutral-950 text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16 md:py-24">
          <div className="mb-12 pb-4 border-b border-white/20 flex items-baseline gap-4">
            <span className="fp-display italic text-2xl text-purple-400">
              {sectionNum(contactNum)}
            </span>
            <h2 className="fp-display text-3xl md:text-5xl font-medium tracking-tight">
              Аттестация и связь
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20">
            <div className="lg:col-span-7">
              <dl className="divide-y divide-white/15 border-y border-white/15">
                <div className="py-5 grid grid-cols-3 gap-4 items-baseline">
                  <dt className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-bold">
                    Свидетельство
                  </dt>
                  <dd className="col-span-2 text-sm">
                    <span className="font-semibold">
                      № {agent.certNo || '1823'}{' '}
                      {agent.certDate ? `до ${agent.certDate}` : 'бессрочно'}
                    </span>
                    <span className="block text-xs text-stone-400 mt-0.5">
                      Министерство юстиции РБ
                    </span>
                  </dd>
                </div>
                {agent.cardNo && (
                  <div className="py-5 grid grid-cols-3 gap-4 items-baseline">
                    <dt className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-bold">
                      Карточка риэлтера
                    </dt>
                    <dd className="col-span-2 text-sm font-mono font-semibold">{agent.cardNo}</dd>
                  </div>
                )}
                {extra.languages && extra.languages.length > 0 && (
                  <div className="py-5 grid grid-cols-3 gap-4 items-baseline">
                    <dt className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-bold">
                      Языки
                    </dt>
                    <dd className="col-span-2 text-sm font-semibold">{extra.languages.join(', ')}</dd>
                  </div>
                )}
                <div className="py-5 grid grid-cols-3 gap-4 items-baseline">
                  <dt className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-bold">
                    Телефон
                  </dt>
                  <dd className="col-span-2">
                    <a
                      href={`tel:${phoneDigits}`}
                      className="fp-display text-3xl font-medium hover:text-purple-300 transition-colors"
                    >
                      {agent.phone || '+375 29 638-00-53'}
                    </a>
                  </dd>
                </div>
                {agent.email && (
                  <div className="py-5 grid grid-cols-3 gap-4 items-baseline">
                    <dt className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-bold">
                      Email
                    </dt>
                    <dd className="col-span-2 text-sm font-semibold inline-flex items-center gap-2 break-all">
                      <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                      {agent.email}
                    </dd>
                  </div>
                )}
                <div className="py-5 grid grid-cols-3 gap-4 items-center">
                  <dt className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-bold">
                    Личная ссылка
                  </dt>
                  <dd className="col-span-2 flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-stone-300 truncate">
                      {cleanRealtorUrl}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 border border-white/25 hover:bg-white hover:text-neutral-950 text-[10px] uppercase tracking-[0.2em] font-bold transition-colors"
                    >
                      {copiedLink ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5" /> Скопировано
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Копировать
                        </>
                      )}
                    </button>
                  </dd>
                </div>
              </dl>

              <div className="mt-8 flex items-start gap-4 text-stone-300">
                <Award className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">
                  <span className="text-white font-semibold">Юридическая гарантия.</span> Каждая
                  сделка застрахована Белгосстрах. Полное юридическое сопровождение от договора до
                  регистрации.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="border border-white/15 bg-white/[0.03] p-7 md:p-9">
                <p className="text-[10px] uppercase tracking-[0.3em] text-purple-400 font-bold mb-2">
                  Написать риэлтеру
                </p>
                <h3 className="fp-display text-3xl font-medium leading-tight mb-8">
                  Оставьте номер — {firstNameForText} перезвонит вам
                </h3>

                {formSubmitted ? (
                  <div className="py-10 text-center">
                    <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Check className="w-7 h-7 text-emerald-400" />
                    </div>
                    <p className="text-sm font-bold">Заявка отправлена!</p>
                    <p className="text-xs text-stone-400 mt-1">
                      Мы свяжемся с вами в ближайшее время
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                      type="text"
                      placeholder="Ваше имя"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-white/25 text-white placeholder:text-stone-500 px-0 py-3 outline-none focus:border-purple-400 transition-colors text-sm"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Номер телефона *"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-white/25 text-white placeholder:text-stone-500 px-0 py-3 outline-none focus:border-purple-400 transition-colors text-sm font-mono"
                    />
                    <button
                      type="submit"
                      className="w-full py-4 bg-purple-500 hover:bg-purple-400 text-neutral-950 font-bold text-[11px] uppercase tracking-[0.25em] transition-colors"
                    >
                      Отправить заявку
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= МОДАЛКА ДОБАВЛЕНИЯ ОТЗЫВА ================= */}
      {showAddReviewModal && (
        <div
          className="fixed inset-0 z-[110] bg-neutral-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => {
            if (!reviewSubmitted) setShowAddReviewModal(false);
          }}
        >
          <div
            className="relative bg-white w-full max-w-xl p-8 md:p-10 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddReviewModal(false)}
              className="absolute top-6 right-6 p-2 text-stone-400 hover:text-neutral-950 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {reviewSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Check className="w-8 h-8 stroke-[2.5]" />
                </div>
                <h3 className="fp-display text-3xl font-medium text-neutral-950">
                  Благодарим за ваш отзыв!
                </h3>
                <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
                  Отзыв успешно добавлен в карточку риэлтера {agent.name} и сохранен в системе.
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-8">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-purple-700 font-bold block mb-1">
                    Обратная связь
                  </span>
                  <h3 className="fp-display text-3xl font-medium text-neutral-950 leading-tight">
                    Отзыв о работе с {firstNameForText}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    {agent.name} · Аттестованный риэлтер
                  </p>
                </div>

                <form onSubmit={handleAddReviewSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-stone-600 mb-2">
                      Ваша оценка специалисту *
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReviewRating(star)}
                            onMouseEnter={() => setRatingHover(star)}
                            onMouseLeave={() => setRatingHover(0)}
                            className="p-1 hover:scale-110 transition-transform focus:outline-none"
                          >
                            <Star
                              className={`w-7 h-7 ${
                                star <= (ratingHover || newReviewRating)
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-stone-200 hover:text-amber-200'
                              } transition-colors`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-stone-700 ml-2">
                        {(ratingHover || newReviewRating) === 5 && '5 — Отлично, рекомендую'}
                        {(ratingHover || newReviewRating) === 4 && '4 — Хорошо, всё устроило'}
                        {(ratingHover || newReviewRating) === 3 && '3 — Нормально'}
                        {(ratingHover || newReviewRating) === 2 && '2 — Были замечания'}
                        {(ratingHover || newReviewRating) === 1 && '1 — Не понравилось'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-stone-600 mb-2">
                      Ваше имя и фамилия *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Например: Артем и Виктория"
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      className="w-full bg-[#faf9f7] border border-stone-300 focus:border-purple-600 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-stone-600 mb-2">
                      Сделка или объект (необязательно)
                    </label>
                    <input
                      type="text"
                      placeholder="Например: Продажа 2-комнатной на Независимости или Покупка дома"
                      value={newReviewRole}
                      onChange={(e) => setNewReviewRole(e.target.value)}
                      className="w-full bg-[#faf9f7] border border-stone-300 focus:border-purple-600 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-stone-600 mb-2">
                      Текст отзыва *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Опишите, как проходило взаимодействие, помог ли риэлтер с переговорами, документами или показом..."
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      className="w-full bg-[#faf9f7] border border-stone-300 focus:border-purple-600 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddReviewModal(false)}
                      className="px-6 py-3.5 border border-stone-300 text-stone-600 hover:text-neutral-900 hover:border-neutral-900 text-[11px] uppercase tracking-[0.2em] font-bold transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3.5 bg-neutral-950 hover:bg-purple-700 text-white text-[11px] uppercase tracking-[0.2em] font-bold transition-colors"
                    >
                      Опубликовать отзыв
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= ЛИПКАЯ ПАНЕЛЬ (мобильные) ================= */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-3 flex gap-3">
        <a
          href={`tel:${phoneDigits}`}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 bg-neutral-950 text-white text-[11px] uppercase tracking-[0.2em] font-bold"
        >
          <Phone className="w-4 h-4" />
          Позвонить
        </a>
        <a
          href={`viber://chat?number=${phoneDigits}`}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 border border-neutral-900 text-[11px] uppercase tracking-[0.2em] font-bold"
        >
          <MessageSquare className="w-4 h-4" />
          Написать
        </a>
      </div>
    </div>
  );
}