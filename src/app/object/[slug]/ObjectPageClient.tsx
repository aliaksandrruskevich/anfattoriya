'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/app/Providers';
import {
  MapPin, Heart, Phone, Calendar, Maximize2,
  Home as HomeIcon, Building2, ArrowLeft, Check, Sparkles,
  ChevronLeft, ChevronRight, Layers, Ruler, Flame, Droplets,
  Zap, Wind, TreePine, Train, MapPinned
} from 'lucide-react';
import { resolveAgentForProperty } from '@/components/PropertyCatalog';
import { AgentBrandAvatar } from '@/components/AgentBrandAvatar';

const typeLabels: Record<string, string> = {
  apartment: 'Квартира',
  commercial: 'Коммерция',
  house: 'Дом / Дача',
  plot: 'Участок',
};

interface ObjectPageClientProps {
  slug?: string;
}

/**
 * Формирует H1 карточки объекта — читаемый и по типу.
 * Примеры:
 * - 3-к квартира, ул. Ванеева 2, Минск — 315 000 BYN
 * - Дом, Цна, Логойский район — 805 600 BYN
 * - Офис, ул. Фабрициуса 8Б, Минск — 180 000 BYN
 * - Склад, ул. Гидростроителей 1А, Вилейка — 6 BYN/м²
 * - Участок, Сосновое, Минский район — 250 000 BYN
 */
function buildH1(property: any): string {
  const type = property.type as 'apartment' | 'commercial' | 'house' | 'plot';
  const objectType = (property.objectType || '').toLowerCase();

  // ---- Тип слова ----
  let typeWord = 'Объект';
  if (type === 'apartment') {
    typeWord = property.rooms ? `${property.rooms}-к квартира` : 'Квартира';
  } else if (type === 'house') {
    if (objectType.includes('коттедж')) typeWord = 'Коттедж';
    else if (objectType.includes('дача')) typeWord = 'Дача';
    else if (objectType.includes('таунхаус')) typeWord = 'Таунхаус';
    else typeWord = 'Дом';
  } else if (type === 'plot') {
    typeWord = 'Участок';
  } else if (type === 'commercial') {
    if (objectType.includes('офис')) typeWord = 'Офис';
    else if (objectType.includes('склад')) typeWord = 'Склад';
    else if (objectType.includes('магазин')) typeWord = 'Магазин';
    else if (objectType.includes('кафе')) typeWord = 'Кафе';
    else if (objectType.includes('ресторан')) typeWord = 'Ресторан';
    else if (objectType.includes('бар')) typeWord = 'Бар';
    else if (objectType.includes('производство')) typeWord = 'Производство';
    else if (objectType.includes('сто')) typeWord = 'СТО';
    else if (objectType.includes('здание')) typeWord = 'Здание';
    else if (objectType.includes('помещение') || objectType.includes('торговое')) typeWord = 'Помещение';
    else if (objectType.includes('бизнес')) typeWord = 'Готовый бизнес';
    else if (objectType.includes('машиноместо')) typeWord = 'Машиноместо';
    else if (objectType.includes('сфера услуг')) typeWord = 'Помещение';
    else typeWord = 'Помещение';
  }

  // ---- Адрес ----
  const addressParts: string[] = [];
  if (property.street) {
    addressParts.push(`ул. ${property.street.replace(/\s*ул\.?\s*$/i, '')}`);
  }
  if (property.houseNumber) {
    addressParts.push(property.houseNumber);
  }
  const streetPart = addressParts.length > 0 ? `, ${addressParts.join(' ')}` : '';

  // ---- Населённый пункт ----
  let cityPart = '';
  if (property.city) {
    const townType = (property.townType || '').toLowerCase();
    const prefix = townType === 'д' ? 'д. ' : townType === 'аг' ? 'аг. ' : '';
    cityPart = `, ${prefix}${property.city}`;
  }

  // ---- Район области ----
  let districtPart = '';
  const sd = property.stateDistrict || '';
  const isMinsk = property.city && property.city.toLowerCase() === 'минск';
  if (sd && !isMinsk) {
    const normalized = sd.endsWith('район') || sd.endsWith('область') ? sd : `${sd} район`;
    districtPart = `, ${normalized}`;
  } else if (!sd && property.district && !isMinsk) {
    districtPart = `, ${property.district}`;
  }

  // ---- Цена ----
  let pricePart = '';
  const isRental = property.isRental || /аренд/i.test(property.terms || '');
  const priceValue = property.priceBYN;
  const isPerM2 = property.priceIsPerM2 || (isRental && priceValue && property.area && priceValue / property.area < 1000);
  if (isPerM2 && priceValue) {
    const perM2 = Math.round(priceValue / (property.area || 1));
    pricePart = ` — ${perM2.toLocaleString('ru-RU')} BYN/м²`;
  } else if (priceValue) {
    pricePart = ` — ${priceValue.toLocaleString('ru-RU')} BYN`;
  } else if (property.priceUSD) {
    pricePart = ` — ${property.priceUSD.toLocaleString('ru-RU')} USD`;
  }

  // ---- Сборка ----
  const result = `${typeWord}${streetPart}${cityPart}${districtPart}${pricePart}`
    .replace(/\s+/g, ' ')
    .replace(/,\s*,/g, ',')
    .trim();

  if (isRental && !result.toLowerCase().startsWith('аренда')) {
    return `Аренда: ${result}`;
  }
  return result;
}

export default function ObjectPageClient({ slug: propsSlug }: ObjectPageClientProps) {
  const params = useParams();
  const router = useRouter();
  const { properties, agents, favorites, toggleFavorite, addLead, currency = 'BYN' } = useApp();

  const slug = propsSlug || (typeof params?.slug === 'string' ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : '');

  const property = useMemo(() => {
    if (!slug) return null;
    return properties.find(p =>
      p.slug === slug ||
      p.id === slug ||
      p.id.toLowerCase() === slug.toLowerCase()
    ) || null;
  }, [slug, properties]);

  const [activePhoto, setActivePhoto] = useState(0);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50" style={{ paddingTop: '190px' }}>
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-neutral-900">Загрузка объекта...</h1>
          <p className="text-stone-600">Пожалуйста, подождите</p>
        </div>
      </div>
    );
  }

  const agent = resolveAgentForProperty(property, Array.isArray(agents) ? agents : []);
  const isFavorited = favorites.includes(property.id);
  const priceValue = currency === 'USD' ? property.priceUSD : property.priceBYN;
  const photos = (property.photos && property.photos.length > 0)
    ? property.photos
    : [property.photo].filter(Boolean);

  const nextPhoto = () => setActivePhoto((p) => (p + 1) % photos.length);
  const prevPhoto = () => setActivePhoto((p) => (p - 1 + photos.length) % photos.length);

  // ---- H1 ----
  const h1Text = buildH1(property);

  // ---- Бейдж аренда/продажа ----
  const isRental = property.isRental || /аренд/i.test(property.terms || '');

  const specs: { icon: React.ReactNode; label: string; value: string }[] = [];
  if (property.area) specs.push({ icon: <Maximize2 className="w-4 h-4" />, label: 'Площадь', value: `${property.area} м²` });
  if (property.rooms) specs.push({ icon: <HomeIcon className="w-4 h-4" />, label: 'Комнаты', value: `${property.rooms}` });
  if (property.floor && property.totalFloors) specs.push({ icon: <Building2 className="w-4 h-4" />, label: 'Этаж', value: `${property.floor} из ${property.totalFloors}` });
  else if (property.floor) specs.push({ icon: <Building2 className="w-4 h-4" />, label: 'Этаж', value: `${property.floor}` });
  if (property.buildingYear) specs.push({ icon: <Calendar className="w-4 h-4" />, label: 'Год постройки', value: `${property.buildingYear}` });
  if (property.houseType) specs.push({ icon: <HomeIcon className="w-4 h-4" />, label: 'Тип дома', value: property.houseType });
  if (property.wallMaterial) specs.push({ icon: <Building2 className="w-4 h-4" />, label: 'Стены', value: property.wallMaterial });
  if (property.areaLiving) specs.push({ icon: <Ruler className="w-4 h-4" />, label: 'Жилая', value: `${property.areaLiving} м²` });
  if (property.areaKitchen) specs.push({ icon: <Ruler className="w-4 h-4" />, label: 'Кухня', value: `${property.areaKitchen} м²` });
  if (property.areaGround) {
    const sotki = property.areaGround > 1000 ? (property.areaGround / 100).toFixed(1) : property.areaGround;
    specs.push({ icon: <TreePine className="w-4 h-4" />, label: 'Участок', value: `${sotki} сот.` });
  }
  if (property.ceilingHeight) specs.push({ icon: <Layers className="w-4 h-4" />, label: 'Потолки', value: `${property.ceilingHeight} м` });
  if (property.heating) specs.push({ icon: <Flame className="w-4 h-4" />, label: 'Отопление', value: property.heating });
  if (property.water) specs.push({ icon: <Droplets className="w-4 h-4" />, label: 'Вода', value: property.water });
  if (property.sewer) specs.push({ icon: <Droplets className="w-4 h-4" />, label: 'Канализация', value: property.sewer });
  if (property.gas) specs.push({ icon: <Flame className="w-4 h-4" />, label: 'Газ', value: property.gas });
  if (property.electricity) specs.push({ icon: <Zap className="w-4 h-4" />, label: 'Электричество', value: property.electricity });
  if (property.roofMaterial) specs.push({ icon: <HomeIcon className="w-4 h-4" />, label: 'Крыша', value: property.roofMaterial });
  if (property.balcony) specs.push({ icon: <Wind className="w-4 h-4" />, label: 'Балкон', value: property.balcony });
  if (property.metro) {
    const metroVal = property.metroTime ? `${property.metro} (${property.metroTime})` : property.metro;
    specs.push({ icon: <Train className="w-4 h-4" />, label: 'Метро', value: metroVal });
  }
  if (property.townDistrict) specs.push({ icon: <MapPinned className="w-4 h-4" />, label: 'Район', value: property.townDistrict });
  else if (property.district) specs.push({ icon: <MapPinned className="w-4 h-4" />, label: 'Район', value: property.district });

  const pricePerSqm = property.area > 0 ? Math.round(priceValue / property.area) : 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: h1Text,
    description: property.description,
    url: `https://fattoria.by/object/${property.slug || property.id}`,
    image: photos.slice(0, 5),
    datePosted: property.priceHistory?.[0]?.date || new Date().toISOString().split('T')[0],
    offers: {
      '@type': 'Offer',
      price: property.priceBYN,
      priceCurrency: 'BYN',
      availability: 'https://schema.org/InStock',
      url: `https://fattoria.by/object/${property.slug || property.id}`,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.city || 'Минск',
      addressCountry: 'BY',
    },
    numberOfRooms: property.rooms,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.area,
      unitCode: 'MTK',
    },
    agent: {
      '@type': 'RealEstateAgent',
      name: 'ООО «АН Фаттория»',
      telephone: agent?.phone || '+375 29 638-00-53',
      url: 'https://fattoria.by',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-stone-50 pb-16" style={{ paddingTop: '190px' }}>

        <div className="bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => router.push('/catalog')}
              className="flex items-center gap-2 text-sm font-bold text-stone-700 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад в каталог
            </button>
            <button
              onClick={() => toggleFavorite(property.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                isFavorited
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-stone-100 text-stone-700 hover:bg-rose-50 hover:text-rose-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
              {isFavorited ? 'В избранном' : 'В избранное'}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            <div className="lg:col-span-8 space-y-6">

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-800 px-3 py-1 rounded-lg border border-purple-500/20">
                    {typeLabels[property.type] || 'Объект'}
                  </span>
                  {isRental ? (
                    <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-800 px-3 py-1 rounded-lg border border-amber-500/20">
                      Аренда
                    </span>
                  ) : (
                    <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-800 px-3 py-1 rounded-lg border border-emerald-500/20">
                      Продажа
                    </span>
                  )}
                </div>

                {/* H1 */}
                <h1 className="text-2xl md:text-4xl font-black text-neutral-950 leading-tight">
                  {h1Text}
                </h1>

                <div className="flex items-center gap-2 text-stone-600 text-sm font-semibold">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  <span>{property.address}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative h-72 sm:h-96 md:h-[520px] bg-neutral-100 rounded-2xl overflow-hidden shadow-lg">
                  {photos.length > 0 && (
                    <Image
                      key={photos[activePhoto]}
                      src={photos[activePhoto]}
                      alt={h1Text}
                      fill
                      loading="eager"
                      fetchPriority="high"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover"
                    />
                  )}

                  {photos.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                      {activePhoto + 1} / {photos.length}
                    </div>
                  )}

                  {photos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prevPhoto}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-all shadow-lg"
                        aria-label="Предыдущее фото"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={nextPhoto}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-all shadow-lg"
                        aria-label="Следующее фото"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>

                {photos.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {photos.slice(0, 30).map((ph, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePhoto(idx)}
                        aria-label={`Фото ${idx + 1}`}
                        className={`relative shrink-0 w-24 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                          activePhoto === idx
                            ? 'border-purple-600 ring-2 ring-purple-600/40'
                            : 'border-stone-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={ph}
                          alt={`${h1Text} — фото ${idx + 1}`}
                          fill
                          sizes="96px"
                          loading="lazy"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {specs.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-stone-200 space-y-4">
                  <h2 className="text-lg font-black text-neutral-950 uppercase tracking-wide flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Характеристики объекта
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {specs.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 bg-stone-50 p-3 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-700 flex items-center justify-center shrink-0">
                          {s.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] text-stone-600 uppercase font-black tracking-wider">{s.label}</div>
                          <div className="text-sm font-bold text-neutral-900 break-words">{s.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl p-6 border border-stone-200 space-y-3">
                <h2 className="text-lg font-black text-neutral-950 uppercase tracking-wide">Описание</h2>
                <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                  {property.description || 'Описание отсутствует'}
                </p>
              </div>

              {property.features && property.features.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-stone-200 space-y-4">
                  <h2 className="text-lg font-black text-neutral-950 uppercase tracking-wide flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Преимущества
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {property.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-stone-50 p-3 rounded-xl">
                        <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <span className="text-sm text-neutral-900">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-neutral-800 text-white rounded-2xl p-6 space-y-3">
                <span className="text-[10px] font-black uppercase text-purple-300 tracking-wider">
                  {isRental ? 'Аренда' : 'Стоимость'}
                </span>
                <div className="text-3xl md:text-4xl font-black font-mono">
                  {(priceValue || 0).toLocaleString()} {currency === 'USD' ? '$' : 'BYN'}
                  {property.priceIsPerM2 && <span className="text-base text-stone-300 ml-1">/м²</span>}
                </div>
                <div className="text-sm text-stone-200">
                  {currency === 'USD'
                    ? `≈ ${(property.priceBYN || 0).toLocaleString()} BYN`
                    : `≈ $${(property.priceUSD || 0).toLocaleString()}`}
                </div>
                {pricePerSqm > 0 && !property.priceIsPerM2 && (
                  <div className="pt-3 border-t border-neutral-700 text-xs text-stone-200">
                    Цена за м²: <span className="font-mono font-bold text-white">{pricePerSqm.toLocaleString()} {currency === 'USD' ? '$' : 'BYN'}</span>
                  </div>
                )}
              </div>

              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-300 space-y-4">
                <span className="text-[10px] font-black uppercase text-stone-600 tracking-wider">Ответственный риэлтер</span>
                <div className="flex items-center gap-4">
                  <AgentBrandAvatar photo={agent.photo} name={agent.name} size="md" />
                  <div className="min-w-0">
                    <div className="font-bold text-neutral-900 break-words">{agent.name}</div>
                    <div className="text-xs text-purple-800 font-bold uppercase">{agent.role}</div>
                    <a
                      href={`tel:${agent.phone}`}
                      className="text-sm font-mono font-bold text-neutral-900 hover:text-purple-600 flex items-center gap-1 mt-1"
                    >
                      <Phone className="w-3 h-3" />
                      {agent.phone}
                    </a>
                  </div>
                </div>
              </div>

              <LeadForm property={property} addLead={addLead} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function LeadForm({ property, addLead }: any) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+375 ');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim() === '+375') return;
    addLead(name || 'Клиент', phone, `Просмотр: ${property.title}`, 'Страница объекта');
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="bg-neutral-800 text-white rounded-2xl p-6 space-y-4">
      <h2 className="text-sm font-black uppercase text-purple-300 tracking-wider">Записаться на просмотр</h2>

      {sent ? (
        <div className="text-center py-6 space-y-2">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto">
            <Check className="w-6 h-6 text-purple-300" />
          </div>
          <p className="text-sm font-bold">Заявка принята!</p>
          <p className="text-xs text-stone-200">Мы свяжемся с вами в течение 10 минут</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Ваше имя"
            aria-label="Ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-neutral-700 border border-neutral-500 rounded-xl px-4 py-3 text-sm placeholder-stone-300 text-white focus:outline-none focus:border-purple-400"
          />
          <input
            type="tel"
            required
            placeholder="+375 (29) 123-45-67"
            aria-label="Телефон"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-neutral-700 border border-neutral-500 rounded-xl py-3 px-4 text-sm font-mono placeholder-stone-300 text-white focus:outline-none focus:border-purple-400"
          />
          <button
            type="submit"
            className="w-full py-3 bg-purple-400 hover:bg-purple-500 text-neutral-950 font-black text-sm uppercase rounded-xl transition-colors"
          >
            Забронировать показ
          </button>
        </form>
      )}
    </div>
  );
}