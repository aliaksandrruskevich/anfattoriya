"use client";
import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type { Agent, Property } from '@/types';
import {
  filterActiveSaleProperties,
  getPropertyCategoryLabel,
  type SaleCategoryFilter,
} from '@/lib/propertyFilters';
import { resolveAgentForProperty } from './PropertyCatalog';
import { AgentBrandAvatar } from './AgentBrandAvatar';

interface ActiveSalePropertiesSectionProps {
  id?: string;
  sectionNumber?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  category: SaleCategoryFilter;
  properties?: Property[];
  agents?: Agent[];
  showCategoryTabs?: boolean;
  onRequestConsultation?: () => void;
}

type SortOption = 'default' | 'price_asc' | 'price_desc' | 'area_desc';

const displayFont = "'Cormorant Garamond', 'Georgia', serif";
const INITIAL_VISIBLE = 12;
const PAGE_STEP = 24;

function PropertyThumb({ src, alt }: { src?: string; alt: string }) {
  const initialSrc =
    src && !src.includes('images.unsplash.com') ? src : '/photo/logo.png';
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [isFallback, setIsFallback] = useState(initialSrc === '/photo/logo.png');

  useEffect(() => {
    const next = src && !src.includes('images.unsplash.com') ? src : '/photo/logo.png';
    setImgSrc(next);
    setIsFallback(next === '/photo/logo.png');
  }, [src]);

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100 border-b border-stone-200/80">
      <img
        src={imgSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => {
          if (!isFallback) {
            setIsFallback(true);
            setImgSrc('/photo/logo.png');
          }
        }}
        className={
          isFallback
            ? 'w-full h-full object-contain p-8 opacity-60'
            : 'w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]'
        }
      />
    </div>
  );
}

export default function ActiveSalePropertiesSection({
  id = 'active-objects',
  sectionNumber = '01',
  eyebrow = 'Актуальные предложения с Realt.by',
  title = 'Действующие объекты в продаже',
  subtitle = 'Все объекты синхронизируются с актуальной базой объявлений агентства на Realt.by.',
  category,
  properties = [],
  agents = [],
  showCategoryTabs = false,
  onRequestConsultation,
}: ActiveSalePropertiesSectionProps) {
  const [activeTab, setActiveTab] = useState<SaleCategoryFilter>(category);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  useEffect(() => {
    setActiveTab(category);
  }, [category]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [activeTab, searchQuery, sortBy]);

  const countsByCategory = useMemo(() => {
    return {
      all: filterActiveSaleProperties(properties, 'all').length,
      apartment: filterActiveSaleProperties(properties, 'apartment').length,
      commercial: filterActiveSaleProperties(properties, 'commercial').length,
      house_plot: filterActiveSaleProperties(properties, 'house_plot').length,
      room_share: filterActiveSaleProperties(properties, 'room_share').length,
    };
  }, [properties]);

  const categoryItems = useMemo(
    () => filterActiveSaleProperties(properties, showCategoryTabs ? activeTab : category),
    [properties, showCategoryTabs, activeTab, category]
  );

  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const matched = q
      ? categoryItems.filter((p) => {
          const haystack = [
            p.title,
            p.address,
            p.city,
            p.district,
            p.townDistrict,
            p.metro,
            p.objectType,
            p.agentName,
            p.assignedAgentName,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return haystack.includes(q);
        })
      : categoryItems;

    if (sortBy === 'default') return matched;

    const copy = [...matched];
    if (sortBy === 'price_asc') {
      copy.sort((a, b) => (a.priceUSD || a.priceBYN || 0) - (b.priceUSD || b.priceBYN || 0));
    } else if (sortBy === 'price_desc') {
      copy.sort((a, b) => (b.priceUSD || b.priceBYN || 0) - (a.priceUSD || a.priceBYN || 0));
    } else if (sortBy === 'area_desc') {
      copy.sort((a, b) => (b.area || 0) - (a.area || 0));
    }
    return copy;
  }, [categoryItems, searchQuery, sortBy]);

  const visibleItems = useMemo(
    () => filteredAndSorted.slice(0, visibleCount),
    [filteredAndSorted, visibleCount]
  );

  const tabOptions: { id: SaleCategoryFilter; label: string; count: number }[] = [
    { id: 'all', label: 'Все объекты', count: countsByCategory.all },
    { id: 'apartment', label: 'Квартиры', count: countsByCategory.apartment },
    { id: 'commercial', label: 'Коммерческая', count: countsByCategory.commercial },
    { id: 'house_plot', label: 'Дома и участки', count: countsByCategory.house_plot },
    { id: 'room_share', label: 'Комнаты и доли', count: countsByCategory.room_share },
  ];

  return (
    <section id={id} className="scroll-mt-32">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
            {sectionNumber} · {eyebrow}
          </div>
          <h2
            className="text-stone-900 font-normal tracking-tight"
            style={{
              fontFamily: displayFont,
              fontSize: 'clamp(28px, 3.5vw, 42px)',
              lineHeight: 1.15,
            }}
          >
            {title}
          </h2>
        </div>

        <div className="text-xs font-semibold uppercase tracking-wider text-stone-700 bg-stone-100 border border-stone-200 rounded-xl px-3.5 py-2 tabular-nums whitespace-nowrap shrink-0">
          В продаже: {categoryItems.length}
        </div>
      </div>

      <p className="text-stone-600 text-[15px] sm:text-[16px] leading-relaxed mb-6 font-light">
        {subtitle}
      </p>

      {/* Категории (для общей страницы продажи) */}
      {showCategoryTabs && (
        <div className="flex flex-wrap gap-2 mb-5">
          {tabOptions.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                  active
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>
      )}

      {/* Поиск и сортировка */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по улице, району, метро или названию..."
            className="w-full pl-10 pr-9 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-700"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Очистить поиск"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="relative sm:w-56 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            aria-label="Сортировка объектов"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-stone-700 cursor-pointer"
          >
            <option value="default">По умолчанию</option>
            <option value="price_asc">Сначала дешевле</option>
            <option value="price_desc">Сначала дороже</option>
            <option value="area_desc">По площади (убыв.)</option>
          </select>
        </div>
      </div>

      {/* Сетка действующих объектов */}
      {visibleItems.length === 0 ? (
        <div className="p-8 rounded-2xl border border-stone-200 bg-stone-50 text-center space-y-3">
          <Building2 className="w-10 h-10 text-stone-400 mx-auto" />
          <div className="text-base font-semibold text-stone-900">
            {searchQuery
              ? `По запросу «${searchQuery}» активных объектов не найдено`
              : 'Актуальные предложения в данном разделе обновляются'}
          </div>
          <p className="text-xs text-stone-600 max-w-md mx-auto font-light leading-relaxed">
            {searchQuery
              ? 'Попробуйте изменить поисковый запрос или сбросить фильтр.'
              : 'Вы можете посмотреть полный каталог активных объектов или оставить заявку специалисту.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
              >
                Сбросить поиск
              </button>
            )}
            <Link
              href="/catalog"
              className="px-4 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs font-semibold hover:border-stone-500 transition-colors whitespace-nowrap"
            >
              Перейти в каталог
            </Link>
            {onRequestConsultation && (
              <button
                type="button"
                onClick={onRequestConsultation}
                className="px-4 py-2 rounded-xl bg-amber-800 text-white text-xs font-semibold hover:bg-amber-900 transition-colors cursor-pointer whitespace-nowrap"
              >
                Оставить заявку
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleItems.map((prop) => {
              const propUrl = `/object/${prop.slug || prop.id}`;
              const agent = resolveAgentForProperty(prop, agents);
              const categoryLabel = getPropertyCategoryLabel(prop);
              const metaParts = [
                categoryLabel,
                prop.rooms && prop.rooms > 0 ? `${prop.rooms}-комн.` : null,
                prop.area && prop.area > 0 ? `${prop.area} м²` : null,
                prop.floor && prop.totalFloors
                  ? `${prop.floor}/${prop.totalFloors} эт.`
                  : null,
              ].filter(Boolean);

              return (
                <article
                  key={prop.id}
                  data-testid="active-sale-card"
                  className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <Link href={propUrl} className="block">
                      <PropertyThumb src={prop.photo || prop.photos?.[0]} alt={prop.title} />
                    </Link>

                    <div className="p-5 space-y-2.5">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 truncate">
                        {metaParts.join(' · ')}
                      </div>

                      <h3 className="text-stone-900 font-semibold text-base leading-snug line-clamp-2 min-h-[2.75rem]">
                        <Link
                          href={propUrl}
                          className="hover:text-amber-900 transition-colors"
                        >
                          {prop.title}
                        </Link>
                      </h3>

                      <div className="text-xs text-stone-600 flex items-start gap-1.5 min-h-[1.25rem]">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">
                          {prop.address || prop.district || 'Минск'}
                          {prop.metro ? ` · ст.м. ${prop.metro}` : ''}
                        </span>
                      </div>

                      <div className="pt-1 flex items-baseline justify-between gap-2 tabular-nums">
                        <div className="text-lg font-bold text-stone-900">
                          {prop.priceBYN > 0
                            ? `${prop.priceBYN.toLocaleString('ru-RU')} BYN`
                            : 'Цена по запросу'}
                        </div>
                        {prop.priceUSD > 0 && (
                          <div className="text-xs font-semibold text-stone-500">
                            ≈ {prop.priceUSD.toLocaleString('ru-RU')} $
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-stone-50/70 border-t border-stone-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <AgentBrandAvatar
                        photo={agent.photo}
                        name={agent.name}
                        className="w-7 h-7 rounded-full object-cover border border-stone-200 shrink-0"
                      />
                      <span className="text-xs font-medium text-stone-700 truncate">
                        {agent.name}
                      </span>
                    </div>

                    <Link
                      href={propUrl}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-900 hover:text-amber-800 transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Подробнее</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Пагинация / Показать все */}
          {filteredAndSorted.length > INITIAL_VISIBLE && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-200">
              <div className="text-xs text-stone-500 tabular-nums">
                Показано {visibleItems.length} из {filteredAndSorted.length} объектов
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {visibleItems.length < filteredAndSorted.length ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleCount((prev) =>
                          Math.min(prev + PAGE_STEP, filteredAndSorted.length)
                        )
                      }
                      className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:border-stone-500 text-xs font-semibold text-stone-900 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Показать ещё {Math.min(PAGE_STEP, filteredAndSorted.length - visibleItems.length)}
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibleCount(filteredAndSorted.length)}
                      className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap tabular-nums"
                    >
                      Показать все ({filteredAndSorted.length})
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setVisibleCount(INITIAL_VISIBLE);
                      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:border-stone-500 text-xs font-semibold text-stone-900 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Свернуть список
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
