"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Building2, 
  TrendingUp, 
  Navigation as NavIcon, 
  Train, 
  Trees, 
  GraduationCap, 
  ShieldCheck, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft,
  ArrowUpRight, 
  Phone, 
  Search, 
  SlidersHorizontal, 
  CheckCircle2, 
  Sparkles,
  DollarSign,
  Layers,
  Heart,
  Eye,
  Clock,
  Compass,
  X,
  Share2,
  Calendar,
  User,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { PageId, Property } from '../types';
import { MINSK_DISTRICTS_DATA, DistrictInfo, getDistrictBySlug, matchPropertyToDistrict } from '../data/districtsData';

interface SeoLandingsPageProps {
  activePage: PageId;
  navigateTo: (pageId: PageId, query?: string) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
  propertiesList?: Property[];
  selectedDistrictSlug?: string;
  onSelectProperty?: (property: Property) => void;
}

export default function SeoLandingsPage({
  navigateTo,
  handleAddLead,
  propertiesList = [],
  selectedDistrictSlug = 'pervomajskij',
  onSelectProperty
}: SeoLandingsPageProps) {
  // Determine current district
  const [currentDistrictId, setCurrentDistrictId] = useState<string>(() => {
    const found = getDistrictBySlug(selectedDistrictSlug);
    return found ? found.id : 'pervomajskij';
  });

  const [currency, setCurrency] = useState<'USD' | 'BYN'>('USD');
  const [roomsFilter, setRoomsFilter] = useState<number | 'all'>('all');
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const districtScrollRef = useRef<HTMLDivElement>(null);

  const scrollDistricts = (direction: 'left' | 'right') => {
    if (districtScrollRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      districtScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Sync if slug changes from URL
  useEffect(() => {
    if (selectedDistrictSlug) {
      const found = getDistrictBySlug(selectedDistrictSlug);
      if (found && found.id !== currentDistrictId) {
        setCurrentDistrictId(found.id);
      }
    }
  }, [selectedDistrictSlug]);

  const currentDistrict = useMemo<DistrictInfo>(() => {
    return MINSK_DISTRICTS_DATA.find(d => d.id === currentDistrictId) || MINSK_DISTRICTS_DATA[0];
  }, [currentDistrictId]);

  // Real filtered properties for current district using the robust matcher
  const matchedProperties = useMemo(() => {
    return propertiesList.filter(p => {
      const matches = matchPropertyToDistrict(p, currentDistrict);
      if (!matches) return false;

      if (roomsFilter !== 'all') {
        return p.rooms === roomsFilter;
      }
      return true;
    });
  }, [propertiesList, currentDistrict, roomsFilter]);

  // Calculate property count for each district
  const districtCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    MINSK_DISTRICTS_DATA.forEach(d => {
      counts[d.id] = propertiesList.filter(p => matchPropertyToDistrict(p, d)).length;
    });
    return counts;
  }, [propertiesList]);

  const handleSelectDistrict = (district: DistrictInfo) => {
    setCurrentDistrictId(district.id);
    setRoomsFilter('all');
    setOpenFaqIndex(0);
    const url = `/kupit-kvartiru/${district.slug}`;
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', url);
      document.title = district.metaTitle;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadPhone.trim()) return;
    handleAddLead(
      leadName.trim() || 'Посетитель сайта',
      leadPhone.trim(),
      `Подбор квартиры в ${currentDistrict.name} (SEO Посадочная)`,
      `SEO: ${currentDistrict.name}`
    );
    setLeadSubmitted(true);
    setTimeout(() => {
      setLeadSubmitted(false);
      setLeadName('');
      setLeadPhone('');
    }, 4000);
  };

  // === ПЕРЕХОД НА СТРАНИЦУ ОБЪЕКТА ВМЕСТО МОДАЛКИ ===
  const handleOpenProperty = (property: Property) => {
    window.location.href = `/object/${property.slug || property.id}`;
  };

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-900 font-sans">
      
      {/* Top Banner / Hero */}
      <section className="relative bg-neutral-950 text-white pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden">
        {/* Background photo */}
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src={currentDistrict.photoUrl}
            alt={currentDistrict.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-6">
            <button 
              onClick={() => navigateTo('home')} 
              className="hover:text-purple-400 transition-colors"
            >
              Главная
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
            <button 
              onClick={() => navigateTo('catalog')} 
              className="hover:text-purple-400 transition-colors"
            >
              Купить квартиру в Минске
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
            <span className="text-purple-400 font-medium">{currentDistrict.name}</span>
          </nav>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-8 space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Официальный каталог проверенной недвижимости Минска</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight leading-tight">
                {currentDistrict.h1}
              </h1>

              <p className="text-sm sm:text-base text-neutral-300 max-w-2xl leading-relaxed">
                {currentDistrict.description}
              </p>

              {/* Fast Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                  <div className="text-[11px] text-neutral-400 font-medium">Ср. цена м²</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-purple-400 mt-0.5">
                    ${currentDistrict.avgPriceM2USD}
                  </div>
                  <div className="text-[10px] text-neutral-400">~{currentDistrict.avgPriceM2BYN} BYN/м²</div>
                </div>

                <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                  <div className="text-[11px] text-neutral-400 font-medium">До центра</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-white mt-0.5">
                    {currentDistrict.travelTimeToCenterMin} мин
                  </div>
                  <div className="text-[10px] text-neutral-400">на автомобиле / метро</div>
                </div>

                <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                  <div className="text-[11px] text-neutral-400 font-medium">Инфраструктура</div>
                  <div className="text-base sm:text-lg font-bold text-amber-400 mt-0.5 flex items-center gap-1">
                    ★ {currentDistrict.infrastructureRating.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-neutral-400">школы, парки, ТРЦ</div>
                </div>

                <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                  <div className="text-[11px] text-neutral-400 font-medium">В базе агентства</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-emerald-400 mt-0.5">
                    {matchedProperties.length} объектов
                  </div>
                  <div className="text-[10px] text-neutral-400">проверено юристами</div>
                </div>
              </div>

            </div>

            {/* Quick Consultation Card */}
            <div className="lg:col-span-4 bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-7 rounded-3xl text-white shadow-2xl space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                  Персональный подбор жилья
                </span>
                <h3 className="text-base sm:text-lg font-bold">Нужна квартира в локации «{currentDistrict.name}»?</h3>
                <p className="text-xs text-neutral-300">
                  Эксперт района вышлет подборку из 5 лучших вариантов под ваш бюджет в течение 15 минут.
                </p>
              </div>

              {leadSubmitted ? (
                <div className="bg-emerald-500/20 border border-emerald-400/40 p-4 rounded-2xl text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                  <div className="text-xs font-bold text-emerald-300">Заявка принята!</div>
                  <div className="text-[11px] text-neutral-200">Риэлтер свяжется с вами в течение 10 минут.</div>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Ваше имя"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-purple-400 focus:bg-white/15"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="+375 (__) ___-__-__"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-purple-400 focus:bg-white/15"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Получить подборку с ценами</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-neutral-400 text-center">
                    Бесплатная консультация • Без спама
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* DISTRICTS SWITCHER BAR */}
      <section className="bg-white border-b border-neutral-200 sticky top-14 sm:top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-black uppercase text-neutral-500 shrink-0">
              <Compass className="w-4 h-4 text-purple-600" />
              <span>Районы:</span>
            </div>

            <button
              type="button"
              onClick={() => scrollDistricts('left')}
              className="p-1.5 rounded-full bg-stone-100 hover:bg-purple-100 text-neutral-700 hover:text-purple-700 transition-colors shrink-0 cursor-pointer shadow-2xs"
              title="Прокрутить районы влево"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div 
              ref={districtScrollRef}
              className="flex items-center gap-2 overflow-x-auto scroll-smooth py-1 no-scrollbar touch-pan-x flex-1"
            >
              {MINSK_DISTRICTS_DATA.map((district) => {
                const isActive = district.id === currentDistrict.id;
                const count = districtCounts[district.id] || 0;

                return (
                  <button
                    key={district.id}
                    onClick={() => handleSelectDistrict(district)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-neutral-900 text-white shadow-md'
                        : 'bg-stone-100 hover:bg-stone-200 text-neutral-700'
                    }`}
                  >
                    <span>{district.name}</span>
                    {count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-purple-500 text-white' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => scrollDistricts('right')}
              className="p-1.5 rounded-full bg-stone-100 hover:bg-purple-100 text-neutral-700 hover:text-purple-700 transition-colors shrink-0 cursor-pointer shadow-2xs"
              title="Прокрутить районы вправо"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CATALOG & PROPERTIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-neutral-900">
              Объекты в продаже: {currentDistrict.name}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Найдено <strong>{matchedProperties.length}</strong> реальных объектов с актуальными ценами и юридической проверкой
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Rooms filter */}
            <div className="inline-flex rounded-xl bg-stone-100 p-1 text-xs">
              <button
                onClick={() => setRoomsFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${roomsFilter === 'all' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'}`}
              >
                Все ({propertiesList.filter(p => matchPropertyToDistrict(p, currentDistrict)).length})
              </button>
              <button
                onClick={() => setRoomsFilter(1)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${roomsFilter === 1 ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'}`}
              >
                1-комн.
              </button>
              <button
                onClick={() => setRoomsFilter(2)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${roomsFilter === 2 ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'}`}
              >
                2-комн.
              </button>
              <button
                onClick={() => setRoomsFilter(3)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${roomsFilter === 3 ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'}`}
              >
                3+ комн.
              </button>
            </div>

            {/* Currency Switcher */}
            <div className="inline-flex rounded-xl bg-stone-100 p-1 text-xs">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${currency === 'USD' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'}`}
              >
                $ USD
              </button>
              <button
                onClick={() => setCurrency('BYN')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${currency === 'BYN' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'}`}
              >
                BYN
              </button>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {matchedProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedProperties.map((property) => {
              const priceUSD = property.priceUSD || (property.priceBYN ? Math.round(property.priceBYN / 3.3) : 65000);
              const priceBYN = property.priceBYN || Math.round(priceUSD * 3.3);
              const displayPrice = currency === 'USD' ? `$ ${priceUSD.toLocaleString('ru-RU')}` : `${priceBYN.toLocaleString('ru-RU')} BYN`;

              const photo = property.photo || property.image || (property.photos && property.photos[0]) || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';

              return (
                <div
                  key={property.id}
                  onClick={() => handleOpenProperty(property)}
                  className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-purple-300 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {/* Photo Container */}
                    <div className="relative h-56 overflow-hidden bg-neutral-900">
                      <img
                        src={photo}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                      <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                        <span>{property.rooms ? `${property.rooms}-комн.` : 'Объект'}</span>
                        <span>•</span>
                        <span>{property.area} м²</span>
                      </div>

                      {property.floor && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-neutral-800 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xs">
                          {property.floor} {property.totalFloors ? `/ ${property.totalFloors}` : ''} этаж
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-white">
                        <div>
                          <div className="text-xl font-black font-mono">
                            {displayPrice}
                          </div>
                          <div className="text-[11px] text-neutral-300">
                            ~{Math.round(priceUSD / (property.area || 50))} $/м²
                          </div>
                        </div>

                        {property.metro && (
                          <div className="text-[10px] bg-purple-500/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                            <Train className="w-3 h-3" />
                            <span>{property.metro}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-bold text-neutral-900 text-sm line-clamp-2 group-hover:text-purple-600 transition-colors leading-snug">
                          {property.title}
                        </h3>
                        <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-1.5">
                          <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span className="line-clamp-1">{property.address || property.location || currentDistrict.name}</span>
                        </p>
                      </div>

                      {property.description && (
                        <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                          {property.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-5 pt-0">
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProperty(property);
                        }}
                        className="flex-1 py-2 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white rounded-xl text-xs font-bold transition-all text-center"
                      >
                        Подробнее
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProperty(property);
                        }}
                        className="p-2 bg-stone-100 hover:bg-stone-200 text-neutral-700 rounded-xl transition-colors"
                        title="Открыть страницу объекта"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center space-y-4 shadow-xs">
            <Building2 className="w-14 h-14 text-stone-300 mx-auto" />
            <h3 className="text-lg font-bold text-neutral-900">
              В открытом каталоге пока нет свободных объектов в {currentDistrict.name} с выбранными параметрами
            </h3>
            <p className="text-xs text-neutral-500 max-w-lg mx-auto leading-relaxed">
              В нашей внутренней межагентской базе прямо сейчас доступно более 18 эксклюзивных вариантов от собственников в районе {currentDistrict.name}. Оставьте заявку — наш риэлтер пришлет свежую подборку вариантов без комиссии.
            </p>
            <button
              onClick={() => {
                const formEl = document.getElementById('lead-form');
                if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-neutral-900 hover:bg-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md cursor-pointer"
            >
              Запросить объекты из закрытой базы
            </button>
          </div>
        )}

        {/* District Deep Dive: Advantages & Landmarks */}
        <div className="mt-16 grid lg:grid-cols-2 gap-8">
          {/* Advantages */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-neutral-900 font-serif flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <span>Плюсы жизни в локации {currentDistrict.name}</span>
            </h3>
            <div className="space-y-3">
              {currentDistrict.advantages.map((adv, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{adv}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Landmarks & Infrastructure */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-neutral-900 font-serif flex items-center gap-2">
              <Trees className="w-5 h-5 text-emerald-600" />
              <span>Знаковые места и инфраструктура</span>
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {currentDistrict.landmarks.map((lm, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-stone-50 hover:bg-purple-50 hover:text-purple-700 text-neutral-700 rounded-xl text-xs font-medium border border-neutral-200 transition-colors"
                >
                  📍 {lm}
                </span>
              ))}
            </div>
            <div className="pt-3 border-t border-neutral-100">
              <div className="text-xs font-bold text-neutral-500 mb-2">Типы жилого фонда:</div>
              <div className="flex flex-wrap gap-2">
                {currentDistrict.housingTypes.map((ht, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium">
                    {ht}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* METRO & TRANSPORT SECTION */}
        {currentDistrict.metroStations && currentDistrict.metroStations.length > 0 && (
          <div className="mt-8 bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-neutral-900 font-serif flex items-center gap-2">
              <Train className="w-5 h-5 text-purple-600" />
              <span>Метро и транспортное сообщение: {currentDistrict.name}</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {currentDistrict.metroStations.map((station, idx) => (
                <div key={idx} className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-center">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs mx-auto mb-1.5">
                    М
                  </div>
                  <div className="text-xs font-bold text-neutral-800">{station}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">В шаговой доступности</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ SECTION */}
        {currentDistrict.faq && currentDistrict.faq.length > 0 && (
          <div className="mt-12 bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-xl font-bold font-serif text-neutral-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                <span>Часто задаваемые вопросы о покупке жилья в {currentDistrict.name}</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Ответы аттестованных юристов и риэлтеров агентства «АН Фаттория»
              </p>
            </div>

            <div className="space-y-3">
              {currentDistrict.faq.map((faqItem, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-stone-200 rounded-2xl overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 text-left font-bold text-xs sm:text-sm text-neutral-900 bg-stone-50 hover:bg-stone-100 flex items-center justify-between gap-4 cursor-pointer transition-colors"
                    >
                      <span>{faqItem.question}</span>
                      <ChevronRight className={`w-4 h-4 text-neutral-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="p-4 bg-white text-xs sm:text-sm text-neutral-700 leading-relaxed border-t border-stone-100">
                        {faqItem.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* BOTTOM LEAD CAPTURE BANNER */}
        <div id="lead-form" className="mt-12 bg-gradient-to-r from-neutral-950 via-purple-950 to-neutral-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-purple-400">
              Бесплатная консультация
            </span>
            <h3 className="text-2xl sm:text-3xl font-black font-serif">
              Хотите выгодно купить или продать квартиру в {currentDistrict.name}?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Агентство «АН Фаттория» — с 2022 года на рынке недвижимости Минска. Сопровождаем сделку под ключ: от независимой рыночной оценки и проверки истории до расчета в банке и регистрации в БРТИ.
            </p>
          </div>

          {leadSubmitted ? (
            <div className="bg-emerald-500/20 border border-emerald-400/40 p-6 rounded-2xl text-center space-y-2 max-w-lg">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-sm font-bold text-emerald-300">Спасибо! Ваша заявка принята</div>
              <div className="text-xs text-neutral-200">Ведущий специалист района перезвонит вам в течение 10 минут.</div>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <input
                type="text"
                placeholder="Ваше имя"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-purple-400 focus:bg-white/15 sm:w-1/3"
              />
              <input
                type="tel"
                required
                placeholder="+375 (__) ___-__-__"
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-purple-400 focus:bg-white/15 sm:w-1/3"
              />
              <button
                type="submit"
                className="py-3 px-6 bg-purple-500 hover:bg-purple-400 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg cursor-pointer sm:w-1/3"
              >
                Отправить заявку
              </button>
            </form>
          )}
        </div>

      </section>

    </div>
  );
}