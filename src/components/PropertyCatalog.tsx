"use client";
import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { getNbrbRate, fetchNbrbRate, subscribeUsdRate } from '../utils/exchangeRate';
import { Heart, Search } from 'lucide-react';
import { Property, Agent } from '../types';
import { AgentBrandAvatar } from './AgentBrandAvatar';
import { WatermarkedImage } from './WatermarkedImage';
import { extractNameTokens, isRealtorAgent, isSamePersonName, normalizePersonName } from '@/lib/agentUtils';

const PropertyMap = dynamic(() => import('./PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-stone-100 flex items-center justify-center rounded-2xl">
      <p className="text-stone-500 text-sm">Загрузка карты...</p>
    </div>
  ),
});

const EMPTY_AGENT: Agent = {
  id: 'unknown',
  name: 'АН Фаттория',
  photo: '/photo/logo.svg',
  role: 'Агентство недвижимости',
  phone: '+375 29 638-00-53',
  rating: 5,
  specialization: 'all',
};

export const resolveAgentForProperty = (prop: Property, agentPool: Agent[] = []): Agent => {
  const realtors = (Array.isArray(agentPool) ? agentPool : []).filter(isRealtorAgent);

  if (prop.assignedAgentId) {
    const byId = realtors.find((a) => a.id === prop.assignedAgentId);
    if (byId) return byId;
  }

  const rawName = (prop as any).assignedAgentName || prop.agentName;
  if (rawName) {
    const cleanTarget = normalizePersonName(rawName);
    const exactOrFull = realtors.find(
      (a) =>
        normalizePersonName(a.name) === cleanTarget ||
        isSamePersonName(a.name, rawName) ||
        (a.firstName && a.lastName && isSamePersonName(`${a.lastName} ${a.firstName}`, rawName))
    );
    if (exactOrFull) return exactOrFull;

    // Если в объекте указана только фамилия (1 слово), сопоставляем только при уникальной фамилии
    const tokens = extractNameTokens(rawName);
    if (tokens.length === 1) {
      const surnameMatches = realtors.filter((a) => {
        const agentTokens = extractNameTokens(a.lastName || a.name);
        return agentTokens[0] === tokens[0];
      });
      if (surnameMatches.length === 1) return surnameMatches[0];
    }

    return {
      ...EMPTY_AGENT,
      id: prop.assignedAgentId || 'realtor-external',
      name: String(rawName),
      phone: prop.agentPhone || EMPTY_AGENT.phone,
      photo: prop.agentPhoto || EMPTY_AGENT.photo,
      role: 'Риэлтер',
    };
  }

  return EMPTY_AGENT;
};

interface PropertyCatalogProps {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  comparisonIds?: string[];
  toggleComparison?: (id: string) => void;
  currency: 'USD' | 'BYN';
  properties?: Property[];
  agents?: Agent[];
  onAddLead?: (name: string, phone: string, typeOrPrice: string, formName: string) => void;
  searchQuery?: string;
  onSearchQueryChange?: (val: string) => void;
  selectedType?: 'all' | 'apartment' | 'commercial' | 'house' | 'plot';
  onSelectedTypeChange?: (val: 'all' | 'apartment' | 'commercial' | 'house' | 'plot') => void;
  maxPrice?: number;
  onMaxPriceChange?: (val: number) => void;
  onViewProfile?: (agent: Agent) => void;
  selectedProperty?: Property | null;
  onSelectProperty?: (property: Property | null) => void;
}

const PAGE_SIZE = 12;

export default function PropertyCatalog({
  favorites,
  toggleFavorite,
  currency,
  properties,
  agents,
  searchQuery: propsSearchQuery,
  onSearchQueryChange,
  selectedType: propsSelectedType,
  onSelectedTypeChange,
  maxPrice: propsMaxPrice,
  onMaxPriceChange,
  onSelectProperty,
}: PropertyCatalogProps) {
  const [innerType, setInnerType] = useState<'all' | 'apartment' | 'commercial' | 'house' | 'plot'>('all');
  const [innerSearch, setInnerSearch] = useState<string>('');
  const [innerMaxPrice, setInnerMaxPrice] = useState<number>(400000);

  const selectedType = propsSelectedType !== undefined ? propsSelectedType : innerType;
  const setSelectedType = onSelectedTypeChange || setInnerType;

  const searchQuery = propsSearchQuery !== undefined ? propsSearchQuery : innerSearch;
  const setSearchQuery = onSearchQueryChange || setInnerSearch;

  const maxPrice = propsMaxPrice !== undefined ? propsMaxPrice : innerMaxPrice;
  const setMaxPrice = onMaxPriceChange || setInnerMaxPrice;

  const [usdToBynRate, setUsdToBynRate] = useState<number>(() => getNbrbRate());
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  useEffect(() => {
    const unsubscribe = subscribeUsdRate((rate) => setUsdToBynRate(rate));
    fetchNbrbRate();
    return unsubscribe;
  }, []);

  const actualProperties = properties || [];
  const actualAgents = Array.isArray(agents) ? agents : [];

  // Сброс пагинации при смене фильтров
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, selectedType, maxPrice]);

  const filteredProperties = useMemo(() => {
    return actualProperties.filter((p) => {
      const matchesType = selectedType === 'all' || p.type === selectedType;
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase());
      // Объекты с ценой 0 (аренда без цены) не режем слайдером
      const matchesPrice = p.priceUSD === 0 || p.priceUSD <= maxPrice;
      return matchesType && matchesSearch && matchesPrice;
    });
  }, [actualProperties, selectedType, searchQuery, maxPrice]);

  const visibleProperties = useMemo(
    () => filteredProperties.slice(0, visibleCount),
    [filteredProperties, visibleCount]
  );

  const hasMore = visibleCount < filteredProperties.length;

  // Для карты — только объекты с координатами
  const mappableProperties = useMemo(
    () => filteredProperties.filter((p) => p.lat != null && p.lng != null),
    [filteredProperties]
  );

  const typeCounts = useMemo(
    () => ({
      all: actualProperties.length,
      apartment: actualProperties.filter((p) => p.type === 'apartment').length,
      commercial: actualProperties.filter((p) => p.type === 'commercial').length,
      house: actualProperties.filter((p) => p.type === 'house').length,
      plot: actualProperties.filter((p) => p.type === 'plot').length,
    }),
    [actualProperties]
  );

  const typeLabels: Record<string, string> = {
    all: 'Все типы',
    apartment: 'Квартиры',
    commercial: 'Офисы/Помещения',
    house: 'Дома/Дачи',
    plot: 'Участки',
  };

  const handleOpenProperty = (p: Property) => {
    if (onSelectProperty) {
      onSelectProperty(p);
    } else {
      window.location.href = `/object/${p.slug || p.id}`;
    }
  };

  const isRental = (p: Property) =>
    Array.isArray(p.features) && p.features.some((f) => String(f).toLowerCase().includes('аренда'));

  const renderPrice = (p: Property) => {
    const priceValue = currency === 'USD' ? p.priceUSD : p.priceBYN;
    if (!priceValue || priceValue === 0) {
      return <span className="text-sm font-bold text-purple-700">Цена по запросу</span>;
    }
    const rental = isRental(p);
    return (
      <span>
        {priceValue.toLocaleString()} {currency === 'USD' ? '$' : 'р.'}
        {rental && <span className="text-[10px] text-neutral-500 font-sans ml-1">/мес</span>}
      </span>
    );
  };

  return (
    <div id="catalog-root" className="space-y-6 font-sans">
      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-4 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="catalog-search"
              type="text"
              placeholder="Поиск по району, улице, описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-stone-50 border border-stone-200 text-neutral-900"
            />
          </div>

          <div className="lg:col-span-5 flex flex-wrap gap-1.5">
            {(['all', 'apartment', 'commercial', 'house', 'plot'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedType === type
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <span>{typeLabels[type]}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                    selectedType === type ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {typeCounts[type]}
                </span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-neutral-500 mb-1">
              <span>Макс. цена:</span>
              <span className="font-mono text-neutral-800 text-xs">
                {currency === 'USD'
                  ? `$${(maxPrice || 0).toLocaleString()}`
                  : `${Math.round((maxPrice || 0) * usdToBynRate).toLocaleString()} BYN`}
              </span>
            </div>
            <input
              id="catalog-price-slider"
              type="range"
              min="30000"
              max="400000"
              step="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
            />
          </div>
        </div>
      </div>

      {/* Split Layout: List (left) + Map (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Property Cards List */}
        <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
          {visibleProperties.map((p, index) => {
            const isFavorited = favorites.includes(p.id);
            const cardAgent = resolveAgentForProperty(p, actualAgents);
            const isActive = activePropertyId === p.id;
            const isPriority = index === 0;

            return (
              <div
                key={p.id}
                onMouseEnter={() => setActivePropertyId(p.id)}
                onClick={() => handleOpenProperty(p)}
                className={`bg-white rounded-2xl overflow-hidden transition-all flex flex-col sm:flex-row cursor-pointer border-2 ${
                  isActive
                    ? 'border-purple-500 shadow-lg'
                    : 'border-stone-200 hover:border-purple-300 hover:shadow-md'
                }`}
              >
                {/* Фото */}
                <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-neutral-100 overflow-hidden">
                  <WatermarkedImage
                    src={p.photo}
                    alt={p.title}
                    showWatermark={true}
                    watermarkSize="sm"
                    watermarkPosition="bottom-right"
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover"
                    priority={isPriority}
                    sizes="(max-width: 640px) 100vw, 192px"
                  />

                  <div className="absolute top-2 left-2 bg-neutral-900/80 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full z-20">
                    {typeLabels[p.type] || 'Объект'}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(p.id);
                    }}
                    className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all z-20 ${
                      isFavorited
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-white/80 hover:bg-white text-neutral-500 hover:text-rose-600'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Инфо */}
                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="text-[11px] text-neutral-400 font-medium leading-normal tracking-wide truncate">
                      {p.address}
                    </h3>
                    <h4 className="text-sm font-bold text-neutral-900 mt-1 line-clamp-2 leading-tight">{p.title}</h4>

                    <div className="text-base font-extrabold text-neutral-950 font-mono mt-2 flex items-baseline gap-2 flex-wrap">
                      {renderPrice(p)}
                      {(p.priceBYN || 0) > 0 && (p.priceUSD || 0) > 0 && (
                        <span className="text-[10px] text-neutral-400 font-semibold font-sans">
                          {currency === 'USD'
                            ? `≈ ${(p.priceBYN || 0).toLocaleString()} BYN`
                            : `≈ $${(p.priceUSD || 0).toLocaleString()}`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <span className="text-[10px] font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded font-mono">
                      {p.area} м²
                    </span>
                    {p.rooms && (
                      <span className="text-[10px] font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded font-mono">
                        {p.rooms}-комн.
                      </span>
                    )}
                    {p.floor && (
                      <span className="text-[10px] font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded font-mono">
                        {p.floor} эт.
                      </span>
                    )}
                  </div>

                  <div className="pt-2 mt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-stone-600">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <AgentBrandAvatar
                        photo={cardAgent.photo}
                        name={cardAgent.name}
                        size="xs"
                        className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-purple-200"
                      />
                      <span className="truncate font-medium text-[11px] text-neutral-800">
                        {cardAgent.name.split(' ')[0]}{' '}
                        {cardAgent.name.split(' ')[1]?.[0] ? `${cardAgent.name.split(' ')[1][0]}.` : ''}
                      </span>
                    </div>
                    <span className="text-[10px] text-purple-700 font-semibold shrink-0 bg-purple-50 px-1.5 py-0.5 rounded">
                      Риэлтер
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Кнопка «Показать ещё» */}
          {hasMore && (
            <div className="pt-2 pb-4 text-center">
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-extrabold hover:bg-purple-700 transition-colors cursor-pointer shadow-sm"
              >
                Показать ещё {Math.min(PAGE_SIZE, filteredProperties.length - visibleCount)}
              </button>
              <p className="text-[10px] text-neutral-500 mt-2 font-mono">
                Показано {visibleProperties.length} из {filteredProperties.length}
              </p>
            </div>
          )}

          {filteredProperties.length === 0 && (
            <div className="text-center py-12 bg-neutral-50 rounded-xl">
              <p className="text-neutral-400 text-xs font-semibold">
                Объектов недвижимости под заданные критерии не найдено
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setMaxPrice(350000);
                }}
                className="text-purple-600 text-xs hover:underline mt-2"
              >
                Сбросить параметры поиска
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: Map */}
        <div className="lg:sticky lg:top-24 h-[600px] lg:h-[800px] rounded-2xl overflow-hidden border border-stone-200 bg-stone-100">
          <PropertyMap
            properties={mappableProperties}
            currency={currency}
            activePropertyId={activePropertyId}
            onOpenProperty={handleOpenProperty}
          />
        </div>
      </div>
    </div>
  );
}