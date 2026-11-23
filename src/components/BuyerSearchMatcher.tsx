"use client";
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Search, Filter, Sparkles, Building, MapPin, DollarSign, Layers, CheckCircle2, Sliders, Bell, Send, FileText, ChevronRight, Eye, RefreshCw } from 'lucide-react';
import { Buyer, BuyerSearchCriteria, Property, Agent } from '../types';
import { getNbrbRate } from '../utils/exchangeRate';

// CommercialOfferModal — ленивая загрузка (тянет jspdf + html2canvas ~1 МБ)
const CommercialOfferModal = dynamic(() => import('./CommercialOfferModal'), {
  ssr: false,
  loading: () => <div className="p-8 text-center">Загрузка КП...</div>
});

interface BuyerSearchMatcherProps {
  buyer?: Buyer;
  buyersList?: Buyer[];
  properties?: Property[];
  propertiesList?: Property[];
  agentsList?: Agent[];
  onUpdateBuyer: (updatedBuyer: Buyer) => void;
}

const DISTRICT_OPTIONS = [
  'Центральный р-н', 'Первомайский р-н', 'Советский р-н', 'Фрунзенский р-н',
  'Московский р-н', 'Октябрьский р-н', 'Заводской р-н', 'Партизанский р-н',
  'Минск-Мир', 'Маяк Минска', 'Боровляны', 'Новая Боровая', 'Колодищи', 'Заславль'
];

const METRO_OPTIONS = [
  'ст. м. Площадь Якуба Коласа', 'ст. м. Парк Челюскинцев', 'ст. м. Восток',
  'ст. м. Немига', 'ст. м. Каменная Горка', 'ст. м. Малиновка', 'ст. м. Грушевка',
  'ст. м. Институт Культуры', 'ст. м. Уручье', 'ст. м. Ковальская Слобода'
];

export default function BuyerSearchMatcher({ buyer: propBuyer, buyersList = [], properties: propProps = [], propertiesList = [], agentsList, onUpdateBuyer }: BuyerSearchMatcherProps) {
  const effectiveProperties = propProps.length > 0 ? propProps : propertiesList;
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>(() => {
    if (propBuyer) return propBuyer.id;
    if (buyersList.length > 0) return buyersList[0].id;
    return '';
  });

  const activeBuyer = propBuyer || buyersList.find(b => b.id === selectedBuyerId) || buyersList[0] || {
    id: 'b-default',
    name: 'Инвестор CRM',
    phone: '+375 29 000-00-00',
    budgetBYN: 209000,
    preferences: '2-комн квартиру в Минске',
    dateAdded: '2026-07-27',
    registeredBy: 'Система'
  };

  const [isEditingCriteria, setIsEditingCriteria] = useState(false);
  const [selectedPropertyForKP, setSelectedPropertyForKP] = useState<Property | null>(null);
  const [digestSuccess, setDigestSuccess] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Default criteria derived from buyer preferences or existing criteria
  const [criteria, setCriteria] = useState<BuyerSearchCriteria>(() => {
    if (activeBuyer.searchCriteria) return activeBuyer.searchCriteria;

    // Smart auto-parse initial preferences string
    const p = (activeBuyer.preferences || '').toLowerCase();
    let propType: BuyerSearchCriteria['propertyType'] = activeBuyer.prefType && activeBuyer.prefType !== 'all' ? activeBuyer.prefType : 'apartment';
    if (activeBuyer.prefType === 'all') propType = 'all';
    else if (!activeBuyer.prefType) {
      if (p.includes('дом') || p.includes('коттедж') || p.includes('дача')) propType = 'house';
      else if (p.includes('коммерч') || p.includes('помещение') || p.includes('офис')) propType = 'commercial';
      else if (p.includes('участок') || p.includes('земля')) propType = 'plot';
      else if (p.includes('квартир') || p.includes('студи') || p.includes('комнат')) propType = 'apartment';
    }

    let roomsMin: number | undefined;
    let roomsMax: number | undefined;
    if (p.includes('1к') || p.includes('1-к') || p.includes('1комн')) { roomsMin = 1; roomsMax = 1; }
    else if (p.includes('2к') || p.includes('2-к') || p.includes('2комн')) { roomsMin = 2; roomsMax = 2; }
    else if (p.includes('3к') || p.includes('3-к') || p.includes('3комн')) { roomsMin = 3; roomsMax = 3; }

    const effectiveBudgetBYN = activeBuyer.budgetBYN || (activeBuyer.budgetUSD ? Math.round(activeBuyer.budgetUSD * 3.27) : undefined);

    return {
      propertyType: propType,
      city: 'Минск',
      district: activeBuyer.prefDistrict || '',
      roomsMin: activeBuyer.prefRooms || roomsMin,
      roomsMax: activeBuyer.prefRooms || roomsMax,
      areaMin: activeBuyer.minArea || undefined,
      areaMax: undefined,
      priceMinBYN: undefined,
      priceMaxBYN: effectiveBudgetBYN,
      renovation: 'any',
      hasParking: false,
      hasBalcony: false,
    };
  });

  const [autoNotify, setAutoNotify] = useState<boolean>(activeBuyer.autoMatchingEnabled ?? true);
  const [notifyChannel, setNotifyChannel] = useState<string>(activeBuyer.notifyChannel || 'telegram');

  // Re-sync criteria when active buyer changes
  React.useEffect(() => {
    if (activeBuyer.searchCriteria) {
      setCriteria(activeBuyer.searchCriteria);
    } else {
      const p = (activeBuyer.preferences || '').toLowerCase();
      let propType: BuyerSearchCriteria['propertyType'] = 'apartment';
      if (p.includes('дом') || p.includes('коттедж') || p.includes('дача')) propType = 'house';
      else if (p.includes('коммерч') || p.includes('помещение') || p.includes('офис') || p.includes('гараж')) propType = 'commercial';
      else if (p.includes('участок') || p.includes('соток')) propType = 'plot';
      else if (p.includes('квартир') || p.includes('студи') || p.includes('комнат')) propType = 'apartment';

      let roomsMin: number | undefined;
      let roomsMax: number | undefined;
      if (p.includes('1к') || p.includes('1-к') || p.includes('1комн')) { roomsMin = 1; roomsMax = 1; }
      else if (p.includes('2к') || p.includes('2-к') || p.includes('2комн')) { roomsMin = 2; roomsMax = 2; }
      else if (p.includes('3к') || p.includes('3-к') || p.includes('3комн')) { roomsMin = 3; roomsMax = 3; }

      const effectiveBudgetBYN = activeBuyer.budgetBYN || (activeBuyer.budgetUSD ? Math.round(activeBuyer.budgetUSD * getNbrbRate()) : undefined);

      setCriteria({
        propertyType: propType,
        city: 'Минск',
        district: activeBuyer.prefDistrict || '',
        roomsMin: activeBuyer.prefRooms || roomsMin,
        roomsMax: activeBuyer.prefRooms || roomsMax,
        areaMin: activeBuyer.minArea || undefined,
        areaMax: undefined,
        priceMinBYN: undefined,
        priceMaxBYN: effectiveBudgetBYN,
        renovation: 'any',
        hasParking: false,
        hasBalcony: false,
      });
    }
    setAutoNotify(activeBuyer.autoMatchingEnabled ?? true);
    setNotifyChannel(activeBuyer.notifyChannel || 'telegram');
    setVisibleCount(12);
  }, [activeBuyer.id, activeBuyer.preferences, activeBuyer.budgetBYN, activeBuyer.budgetUSD]);

  const handleSaveCriteria = () => {
    const updated: Buyer = {
      ...activeBuyer,
      searchCriteria: criteria,
      autoMatchingEnabled: autoNotify,
      notifyChannel: notifyChannel as any,
    };
    onUpdateBuyer(updated);
    setIsEditingCriteria(false);
  };

  // Matching Logic (Strict Category & Budget boundaries)
  const getMatchedProperties = () => {
    const rate = getNbrbRate();
    const effectiveMaxPriceBYN = criteria.priceMaxBYN || (criteria.priceMaxUSD ? Math.round(criteria.priceMaxUSD * rate) : undefined);
    return effectiveProperties.map(property => {
      // 1. STRICT DISQUALIFIER: Property Type
      if (criteria.propertyType && criteria.propertyType !== 'all') {
        if (property.type !== criteria.propertyType) {
          // Hard filter out completely
          return null;
        }
      }

      // 2. STRICT DISQUALIFIER: Maximum Price
      const propBYN = property.priceBYN || (property.priceUSD ? Math.round(property.priceUSD * rate) : 0);
      if (effectiveMaxPriceBYN && effectiveMaxPriceBYN > 0 && propBYN > 0) {
        // Disqualify properties that exceed budget by more than 10% room for negotiation
        const maxNegotiable = effectiveMaxPriceBYN * 1.10; 
        if (propBYN > maxNegotiable) {
          return null;
        }
      }

      let score = 0;
      let total = 0;
      const matchReasons: string[] = [];

      // 1. Property Type match
      total += 25;
      score += 25;
      matchReasons.push('Тип объекта совпадает');

      // 2. Budget / Price BYN
      if (effectiveMaxPriceBYN && propBYN > 0) {
        total += 30;
        if (propBYN <= effectiveMaxPriceBYN) {
          score += 30;
          matchReasons.push('В рамках бюджета');
        } else {
          score += 15;
          matchReasons.push('Возможен торг до бюджета');
        }
      } else {
        total += 30;
        score += 30;
      }

      // 3. Rooms
      if (criteria.roomsMin || criteria.roomsMax) {
        total += 20;
        const r = property.rooms || 1;
        const minOk = !criteria.roomsMin || r >= criteria.roomsMin;
        const maxOk = !criteria.roomsMax || r <= criteria.roomsMax;
        if (minOk && maxOk) {
          score += 20;
          matchReasons.push(`${r}-комнатная`);
        }
      } else {
        total += 20;
        score += 20;
      }

      // 4. Area m2
      if (criteria.areaMin || criteria.areaMax) {
        total += 15;
        const a = property.area || 0;
        const minOk = !criteria.areaMin || a >= criteria.areaMin;
        const maxOk = !criteria.areaMax || a <= criteria.areaMax;
        if (minOk && maxOk) {
          score += 15;
          matchReasons.push(`Площадь ${a} м² подходит`);
        }
      } else {
        total += 15;
        score += 15;
      }

      // 5. Location / District
      if (criteria.district && criteria.district.trim()) {
        total += 10;
        const dist = criteria.district.toLowerCase();
        if (property.address.toLowerCase().includes(dist) || property.title.toLowerCase().includes(dist)) {
          score += 10;
          matchReasons.push('Район совпадает');
        }
      } else {
        total += 10;
        score += 10;
      }

      // 6. Floor preference
      if (criteria.floorPreference && criteria.floorPreference !== 'any') {
        total += 10;
        const f = property.floor;
        const tf = property.totalFloors;
        if (f) {
          if (criteria.floorPreference === 'not_first' && f === 1) {
            score += 0;
          } else if (criteria.floorPreference === 'not_last' && tf && f === tf && f > 1) {
            score += 0;
          } else if (criteria.floorPreference === 'middle' && (f === 1 || (tf && f === tf))) {
            score += 2;
          } else {
            score += 10;
            matchReasons.push(`Этаж ${f}${tf ? '/' + tf : ''} подходит`);
          }
        } else {
          score += 8;
        }
      }

      // 7. Renovation / Condition
      if (criteria.renovation && criteria.renovation !== 'any') {
        total += 10;
        const featStr = ((property.features || []).join(' ') + ' ' + (property.description || '')).toLowerCase();
        if (criteria.renovation === 'euro') {
          if (featStr.includes('евро') || featStr.includes('дизайн') || featStr.includes('люкс') || featStr.includes('отличный ремонт')) {
            score += 10;
            matchReasons.push('Евроремонт');
          } else {
            score += 2;
          }
        } else if (criteria.renovation === 'need_repair' || criteria.renovation === 'raw') {
          if (featStr.includes('без отделки') || featStr.includes('чернов') || featStr.includes('чистовая') || featStr.includes('свободная планировка')) {
            score += 10;
            matchReasons.push('Под отделку');
          } else {
            score += 2;
          }
        } else {
          score += 10;
        }
      }

      const matchPercent = total > 0 ? Math.round((score / total) * 100) : 100;

      return {
        property,
        matchPercent,
        matchReasons
      };
    })
    .filter((item): item is { property: Property; matchPercent: number; matchReasons: string[] } => item !== null && item.matchPercent >= 50)
    .sort((a, b) => b.matchPercent - a.matchPercent);
  };

  const matchedItems = getMatchedProperties();

  const getDigestShareText = () => {
    const topItems = matchedItems.slice(0, 4);
    let text = `Здравствуйте, ${activeBuyer.name}! Агентство недвижимости «Фаттория» подготовило для вас ${matchedItems.length} актуальных вариантов по вашему запросу:\n\n`;
    topItems.forEach((item, idx) => {
      text += `${idx + 1}. ${item.property.title}\n   📍 ${item.property.address}\n   💰 $${(item.property.priceUSD || Math.round((item.property.priceBYN || 0) / 3.27)).toLocaleString()} (~${(item.property.priceBYN || 0).toLocaleString()} BYN)\n   📐 ${item.property.area} м² • Совпадение: ${item.matchPercent}%\n\n`;
    });
    text += `Посмотреть все подробности и фото вы можете на сайте: https://fattoria.by/catalog\nС уважением, ваш персональный риэлтер АН «Фаттория».`;
    return text;
  };

  const handleShareMessenger = (channel: 'telegram' | 'whatsapp' | 'viber') => {
    const text = getDigestShareText();
    const cleanPhone = activeBuyer.phone.replace(/[^\d]/g, '');
    if (channel === 'whatsapp') {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    } else if (channel === 'viber') {
      window.open(`viber://forward?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    } else {
      window.open(`https://t.me/share/url?url=${encodeURIComponent('https://fattoria.by/catalog')}&text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    }
    setDigestSuccess(`Подборка из ${matchedItems.length} объектов подготовлена для отправки в ${channel.toUpperCase()}!`);
    setTimeout(() => setDigestSuccess(null), 4000);
  };

  const handleSendDigest = () => {
    const text = getDigestShareText();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setDigestSuccess(`Дайджест из ${matchedItems.length} объектов сформирован! Текст скопирован в буфер для отправки.`);
    setTimeout(() => setDigestSuccess(null), 4000);
  };

  return (
    <div className="space-y-4 font-sans text-neutral-900">
      
      {/* Search Criteria Card (2.1) */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-500/20 text-purple-700 rounded-lg">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-neutral-900 uppercase tracking-wider">
                Параметры поиска объектов
              </h5>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[10px] text-stone-500">
                  Фильтры автоподбора для покупателя:
                </p>
                {buyersList.length > 0 && !propBuyer ? (
                  <select
                    value={activeBuyer.id}
                    onChange={(e) => {
                      setSelectedBuyerId(e.target.value);
                      const b = buyersList.find(x => x.id === e.target.value);
                      if (b) {
                        if (b.searchCriteria) setCriteria(b.searchCriteria);
                        setAutoNotify(b.autoMatchingEnabled ?? true);
                        setNotifyChannel(b.notifyChannel || 'telegram');
                      }
                    }}
                    className="bg-white border border-stone-300 text-neutral-900 font-extrabold text-[11px] rounded-lg px-2 py-0.5 outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                  >
                    {buyersList.map(b => {
                      const displayBudget = b.budgetBYN || (b.budgetUSD ? Math.round(b.budgetUSD * getNbrbRate()) : 0);
                      return (
                        <option key={b.id} value={b.id}>
                          👤 {b.name} ({((displayBudget) || 0).toLocaleString()} BYN)
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <strong className="text-neutral-800 text-[11px] font-extrabold">{activeBuyer.name}</strong>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditingCriteria(!isEditingCriteria)}
            className="px-3 py-1 bg-white hover:bg-stone-100 border border-stone-300 text-neutral-900 font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5 text-purple-600" />
            <span>{isEditingCriteria ? 'Закрыть редактор' : 'Настроить фильтр'}</span>
          </button>
        </div>

        {/* Current Criteria Summary Tags */}
        {!isEditingCriteria ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-stone-200">
              <span className="text-[9px] text-stone-400 font-bold uppercase block">Тип недвижимости</span>
              <strong className="text-neutral-900 font-bold">
                {criteria.propertyType === 'apartment' ? 'Квартира' : criteria.propertyType === 'house' ? 'Дом / Коттедж' : criteria.propertyType === 'commercial' ? 'Коммерция' : 'Все типы'}
              </strong>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-stone-200">
              <span className="text-[9px] text-stone-400 font-bold uppercase block">Бюджет до</span>
              <strong className="text-purple-600 font-mono font-black">
                {criteria.priceMaxBYN ? `${(criteria.priceMaxBYN || 0).toLocaleString()} BYN` : activeBuyer.budgetBYN ? `${(activeBuyer.budgetBYN || 0).toLocaleString()} BYN` : activeBuyer.budgetUSD ? `${(Math.round((activeBuyer.budgetUSD || 0) * getNbrbRate()) || 0).toLocaleString()} BYN` : 'не ограничено'}
              </strong>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-stone-200">
              <span className="text-[9px] text-stone-400 font-bold uppercase block">Комнаты / Площадь</span>
              <strong className="text-neutral-900 font-bold">
                {criteria.roomsMin || criteria.roomsMax ? `${criteria.roomsMin || 1}–${criteria.roomsMax || 'любое'} комн.` : 'Любое'} / {criteria.areaMin ? `от ${criteria.areaMin} м²` : 'Любая'}
              </strong>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-stone-200">
              <span className="text-[9px] text-stone-400 font-bold uppercase block">Район / Город</span>
              <strong className="text-neutral-900 font-bold truncate block">
                {criteria.district || criteria.city || 'Любой'}
              </strong>
            </div>
          </div>
        ) : (
          /* Editable Form (2.1) */
          <div className="bg-white p-4 rounded-xl border border-stone-300 space-y-3 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Тип недвижимости</label>
                <select
                  value={criteria.propertyType || 'all'}
                  onChange={(e) => setCriteria({ ...criteria, propertyType: e.target.value as any })}
                  className="w-full bg-stone-50 border border-stone-250 rounded-lg p-2 font-bold text-neutral-900 outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="all">Любой тип</option>
                  <option value="apartment">Квартира</option>
                  <option value="house">Дом / Коттедж</option>
                  <option value="commercial">Коммерческая</option>
                  <option value="plot">Участок</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Город / Район</label>
                <input
                  type="text"
                  placeholder="Например: Первомайский, Минск-Мир"
                  value={criteria.district || ''}
                  onChange={(e) => setCriteria({ ...criteria, district: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-250 rounded-lg p-2 font-bold text-neutral-900 outline-none focus:ring-1 focus:ring-purple-500"
                  list="districts-list"
                />
                <datalist id="districts-list">
                  {DISTRICT_OPTIONS.map((d, i) => <option key={i} value={d} />)}
                </datalist>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Метро</label>
                <input
                  type="text"
                  placeholder="Например: Парк Челюскинцев"
                  value={criteria.metro || ''}
                  onChange={(e) => setCriteria({ ...criteria, metro: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-250 rounded-lg p-2 font-bold text-neutral-900 outline-none focus:ring-1 focus:ring-purple-500"
                  list="metro-list"
                />
                <datalist id="metro-list">
                  {METRO_OPTIONS.map((m, i) => <option key={i} value={m} />)}
                </datalist>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Комнат (от – до)</label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    placeholder="От"
                    value={criteria.roomsMin || ''}
                    onChange={(e) => setCriteria({ ...criteria, roomsMin: Number(e.target.value) || undefined })}
                    className="w-1/2 bg-stone-50 border border-stone-250 rounded-lg p-2 font-mono font-bold outline-none"
                  />
                  <input
                    type="number"
                    placeholder="До"
                    value={criteria.roomsMax || ''}
                    onChange={(e) => setCriteria({ ...criteria, roomsMax: Number(e.target.value) || undefined })}
                    className="w-1/2 bg-stone-50 border border-stone-250 rounded-lg p-2 font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Площадь м² (от – до)</label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    placeholder="От м²"
                    value={criteria.areaMin || ''}
                    onChange={(e) => setCriteria({ ...criteria, areaMin: Number(e.target.value) || undefined })}
                    className="w-1/2 bg-stone-50 border border-stone-250 rounded-lg p-2 font-mono font-bold outline-none"
                  />
                  <input
                    type="number"
                    placeholder="До м²"
                    value={criteria.areaMax || ''}
                    onChange={(e) => setCriteria({ ...criteria, areaMax: Number(e.target.value) || undefined })}
                    className="w-1/2 bg-stone-50 border border-stone-250 rounded-lg p-2 font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Цена BYN (мин – макс)</label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    placeholder="Мин BYN"
                    value={criteria.priceMinBYN || ''}
                    onChange={(e) => setCriteria({ ...criteria, priceMinBYN: Number(e.target.value) || undefined })}
                    className="w-1/2 bg-stone-50 border border-stone-250 rounded-lg p-2 font-mono font-bold outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Макс BYN"
                    value={criteria.priceMaxBYN || ''}
                    onChange={(e) => setCriteria({ ...criteria, priceMaxBYN: Number(e.target.value) || undefined })}
                    className="w-1/2 bg-stone-50 border border-stone-250 rounded-lg p-2 font-mono font-bold outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Extra Parameters */}
            <div className="pt-2 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Ремонт</label>
                <select
                  value={criteria.renovation || 'any'}
                  onChange={(e) => setCriteria({ ...criteria, renovation: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-250 rounded-lg p-2 font-bold text-neutral-900 outline-none"
                >
                  <option value="any">Любой ремонт</option>
                  <option value="euro">Евроремонт</option>
                  <option value="design">Дизайнерский</option>
                  <option value="cosmetic">Косметический</option>
                  <option value="need_repair">Под отделку / Черновая</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Этаж</label>
                <select
                  value={criteria.floorPreference || 'any'}
                  onChange={(e) => setCriteria({ ...criteria, floorPreference: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-250 rounded-lg p-2 font-bold text-neutral-900 outline-none"
                >
                  <option value="any">Любой этаж</option>
                  <option value="not_first">Не первый этаж</option>
                  <option value="not_last">Не последний этаж</option>
                  <option value="middle">Средний (не крайние)</option>
                </select>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={!!criteria.hasParking}
                    onChange={(e) => setCriteria({ ...criteria, hasParking: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500"
                  />
                  <span>Парковка</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={!!criteria.hasBalcony}
                    onChange={(e) => setCriteria({ ...criteria, hasBalcony: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500"
                  />
                  <span>Балкон / Лоджия</span>
                </label>
              </div>

              <div className="text-right pt-2">
                <button
                  type="button"
                  onClick={handleSaveCriteria}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-neutral-950 font-black text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Сохранить критерии
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Smart Notifications Toggle Bar (2.3) */}
        <div className="bg-neutral-900 text-white rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="font-extrabold text-purple-400 block">Умные автоуведомления о новых объектах</span>
              <span className="text-[10px] text-stone-300">При появлении подходящего жилья в базе отправлять рассылку</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={notifyChannel}
              onChange={(e) => setNotifyChannel(e.target.value as any)}
              className="bg-neutral-800 border border-stone-700 text-purple-300 text-xs font-bold rounded-lg px-2 py-1 outline-none cursor-pointer"
            >
              <option value="telegram">Telegram Bot</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email дайджест</option>
            </select>

            <button
              onClick={handleSendDigest}
              className="px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-neutral-950 font-black text-[10px] uppercase rounded-lg transition-all cursor-pointer shrink-0"
            >
              Сформировать дайджест
            </button>
          </div>
        </div>

        {digestSuccess && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold text-center animate-fade-in">
            {digestSuccess}
          </div>
        )}
      </div>

      {/* Matched Properties Section (2.2) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Подобранные объекты из базы ({matchedItems.length})
            </h4>
            <span className="text-[10px] text-stone-500 font-bold">
              Показаны варианты с совпадением от 50%
            </span>
          </div>

          {matchedItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleShareMessenger('viber')}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] uppercase rounded-xl transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                title="Отправить подборку клиенту в Viber"
              >
                <span>Viber</span>
              </button>
              <button
                type="button"
                onClick={() => handleShareMessenger('telegram')}
                className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-[10px] uppercase rounded-xl transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                title="Отправить подборку клиенту в Telegram"
              >
                <span>Telegram</span>
              </button>
              <button
                type="button"
                onClick={() => handleShareMessenger('whatsapp')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase rounded-xl transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                title="Отправить подборку клиенту в WhatsApp"
              >
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-purple-400 font-extrabold text-[10px] uppercase rounded-xl transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                title="Распечатать подборку или сохранить в PDF"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Печать / PDF</span>
              </button>
            </div>
          )}
        </div>

        {matchedItems.length === 0 ? (
          <div className="p-8 bg-stone-50 rounded-2xl border border-dashed border-stone-300 text-center space-y-2">
            <Building className="w-8 h-8 text-stone-400 mx-auto" />
            <p className="text-xs font-bold text-neutral-800">Нет подходящих объектов по данным критериям</p>
            <p className="text-[10px] text-stone-500">Попробуйте расширить рамки бюджета или района в настройках фильтра</p>
          </div>
        ) : (
          <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {matchedItems.slice(0, visibleCount).map(({ property, matchPercent, matchReasons }) => (
              <div
                key={property.id}
                className="bg-white border border-stone-200 hover:border-purple-500 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={property.photo || '/photo/hero-apartment.jpg'}
                        alt={property.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/photo/hero-apartment.jpg';
                        }}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200 bg-stone-100"
                      />
                      <div>
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          {property.type === 'apartment' ? 'Квартира' : 'Объект'}
                        </span>
                        <h5 className="font-extrabold text-xs text-neutral-950 line-clamp-1 mt-0.5">
                          {property.title}
                        </h5>
                        <p className="text-[10px] text-stone-500 font-medium truncate max-w-[200px]">
                          {property.address}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-black ${
                        matchPercent >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {matchPercent}% совпадение
                      </span>
                      <div className="text-sm font-black font-mono text-purple-600 mt-1">
                        {(property.priceBYN || 0).toLocaleString()} бел. руб.
                      </div>
                    </div>
                  </div>

                  {/* Match criteria tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {matchReasons.map((reason, i) => (
                      <span key={i} className="text-[9px] font-bold bg-purple-50 text-purple-800 border border-purple-200/60 px-1.5 py-0.5 rounded">
                        ✓ {reason}
                      </span>
                    ))}
                  </div>
                </div>

                {/* KP Generator Action Button (2.4) */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-stone-400">
                    {property.area} м² • {property.rooms ? `${property.rooms} к.` : ''}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedPropertyForKP(property)}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-purple-400 font-extrabold text-[10px] uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    <span>Сформировать КП</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          {matchedItems.length > visibleCount && (
            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <span className="text-[11px] font-medium text-stone-500 tabular-nums">
                Показано {Math.min(visibleCount, matchedItems.length)} из {matchedItems.length}
              </span>
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Показать ещё {Math.min(12, matchedItems.length - visibleCount)}
              </button>
            </div>
          )}
          </div>
        )}
      </div>

      {/* Commercial Offer Modal trigger */}
      {selectedPropertyForKP && (
        <CommercialOfferModal
          property={selectedPropertyForKP}
          buyer={activeBuyer}
          agent={
            agentsList?.find(a => a.id === selectedPropertyForKP.assignedAgentId || (selectedPropertyForKP.agentName && a.name.toLowerCase().includes(selectedPropertyForKP.agentName.toLowerCase()))) ||
            agentsList?.find(a => a.id === activeBuyer.assignedAgentId || (activeBuyer.assignedAgentName && a.name.toLowerCase().includes(activeBuyer.assignedAgentName.toLowerCase())))
          }
          agentsList={agentsList}
          onClose={() => setSelectedPropertyForKP(null)}
        />
      )}
    </div>
  );
}
