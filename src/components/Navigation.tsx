'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Heart, Search, Phone, ChevronDown, UserCheck, Sparkles, Users } from 'lucide-react';
import { useApp } from '@/app/Providers';
import CompanyLogo from './CompanyLogo';

const PHONE = '+375 29 638-00-53';

interface NavigationProps {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  currency: 'USD' | 'BYN';
  leadsCount: number;
  onOpenAIValuation?: () => void;
  comparisonCount?: number;
  onOpenComparison?: () => void;
}

export default function Navigation({
  favorites, toggleFavorite, currency, leadsCount,
  onOpenAIValuation, comparisonCount = 0, onOpenComparison
}: NavigationProps) {
  const pathname = usePathname();
  const { properties } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showCallDropdown, setShowCallDropdown] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

  const currencySign = 'р.';
  const favoritedProperties = properties.filter((p) => favorites.includes(p.id));

  // Auto-close mobile menu on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setShowCallDropdown(false);
    setGlobalSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
        setShowCallDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Close mobile menu on route change
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setGlobalSearchOpen(false);
  }, [pathname]);

  const toggleDropdown = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const isActive = (path: string) => pathname === path || (path !== '/' && pathname.startsWith(path));

  const isSolidNav = isScrolled || pathname === '/agent-cabinet' || mobileMenuOpen;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
          isSolidNav
            ? 'bg-neutral-950/95 backdrop-blur-xl shadow-xl border-b border-white/10 py-3.5'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-4 sm:py-5'
        }`}
        ref={navRef}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="flex items-center justify-between gap-2 lg:gap-4">

              <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
                <CompanyLogo className="w-8 h-8 sm:w-9 sm:h-9 transition-transform group-hover:scale-105" variant="purple" />
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-bold tracking-[0.12em] sm:tracking-[0.15em] uppercase text-white group-hover:text-purple-400 transition-colors whitespace-nowrap" style={{ fontFamily: 'Raleway, sans-serif' }}>АН ФАТТОРИЯ</span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-stone-400 -mt-1 hidden sm:block">Агентство недвижимости</span>
                </div>
              </Link>

              <nav className="hidden xl:flex items-center gap-4 xl:gap-5 text-xs xl:text-sm font-medium text-white shrink" style={{ fontFamily: 'Raleway, sans-serif' }}>

                <div className="relative">
                  <button onClick={() => toggleDropdown('services')} className={`hover:text-purple-400 cursor-pointer flex items-center gap-0.5 whitespace-nowrap ${activeDropdown === 'services' || isActive('/services') ? 'text-purple-400' : ''}`}>Услуги<ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'services' ? 'rotate-180' : ''}`} /></button>
                  {activeDropdown === 'services' && (
                    <div className="absolute left-0 mt-2 w-64 bg-neutral-950/95 backdrop-blur-md rounded-xl py-2 shadow-2xl z-50">
                      <Link href="/services-agentstva" className="block w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm font-bold text-purple-400 border-b border-white/10">Все услуги агентства</Link>
                      <Link href="/soglasovanie-pereplanirovki" className="block w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm hover:text-purple-400 text-stone-300">✨ Перепланировки</Link>
                      <Link href="/yuridicheskaya-konsultaciya" className="block w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm hover:text-purple-400 text-stone-300">Юридическая консультация</Link>
                      <Link href="/konsultaciya-stoimost-rieltor" className="block w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm hover:text-purple-400 text-stone-300">Стоимость услуг риэлтера</Link>
                      <Link href="/oformit-sdelku" className="block w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm hover:text-purple-400 text-stone-300">Оформление сделки под ключ</Link>
                    </div>
                  )}
                </div>

                <Link href="/catalog" className={`hover:text-purple-400 cursor-pointer whitespace-nowrap ${isActive('/catalog') ? 'text-purple-400 font-bold' : ''}`}>Каталог</Link>

                <div className="relative">
                  <button onClick={() => toggleDropdown('assessment')} className={`hover:text-purple-400 cursor-pointer flex items-center gap-0.5 whitespace-nowrap ${activeDropdown === 'assessment' || isActive('/ocenka-kvartiry') ? 'text-purple-400' : ''}`}>Бесплатная оценка<ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'assessment' ? 'rotate-180' : ''}`} /></button>
                  {activeDropdown === 'assessment' && (
                    <div className="absolute left-0 mt-2 w-56 bg-neutral-950/95 backdrop-blur-md rounded-xl py-2 shadow-2xl z-50">
                      <Link href="/ocenka-kvartiry" className="block w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm font-bold text-purple-400 border-b border-white/10">Бесплатная оценка</Link>
                      {onOpenAIValuation && (
                        <button onClick={() => { setActiveDropdown(null); onOpenAIValuation(); }} className="block w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm font-bold text-purple-400 hover:bg-white/10 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400 fill-purple-400 shrink-0" />
                          <span>AI-Оценка недвижимости</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <Link href="/ob-agentstve" className={`hover:text-purple-400 cursor-pointer whitespace-nowrap ${isActive('/ob-agentstve') ? 'text-purple-400 font-bold' : ''}`}>О компании</Link>
                <Link href="/nasha-komanda" className={`hover:text-purple-400 cursor-pointer whitespace-nowrap ${isActive('/nasha-komanda') ? 'text-purple-400 font-bold' : ''}`}>Наша команда</Link>
                <Link href="/novosti-nedvizhimosti" className={`hover:text-purple-400 cursor-pointer whitespace-nowrap ${isActive('/novosti-nedvizhimosti') ? 'text-purple-400 font-bold' : ''}`}>Статьи</Link>
                <Link href="/kontakty" className={`hover:text-purple-400 cursor-pointer whitespace-nowrap ${isActive('/kontakty') ? 'text-purple-400 font-bold' : ''}`}>Контакты</Link>
              </nav>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <Link href="/agent-cabinet" className={`hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold hover:text-purple-400 transition-all cursor-pointer whitespace-nowrap ${isActive('/agent-cabinet') ? 'text-purple-400' : ''}`}>
                  <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Кабинет</span>
                </Link>

                <button
                  onClick={() => setGlobalSearchOpen(!globalSearchOpen)}
                  className={`p-2 transition-colors cursor-pointer ${globalSearchOpen ? 'text-purple-400' : 'text-white hover:text-purple-400'}`}
                  title="Поиск"
                  aria-label="Открыть поиск по сайту"
                >
                  <Search className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setShowWishlistModal(true)}
                  className="relative p-2 text-white hover:text-purple-400 transition-colors cursor-pointer"
                  title="Избранное"
                  aria-label={`Избранные объекты (${favorites.length})`}
                >
                  <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'fill-purple-400 text-purple-400' : ''}`} />
                  {favorites.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-purple-500 text-white text-[9px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                      {favorites.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="xl:hidden relative z-[60] p-2 sm:p-2.5 rounded-xl bg-white/10 text-white hover:text-purple-400 hover:bg-white/15 transition-all cursor-pointer active:scale-95"
                  aria-label="Меню сайта"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>

          <div className="hidden xl:flex items-center justify-center mt-3 pt-2.5 border-t border-white/15 text-xs font-bold uppercase tracking-wider text-white" style={{ fontFamily: 'Raleway, sans-serif' }}>
            <div className="flex flex-wrap items-center justify-center gap-4 xl:gap-6">
              <Link href="/baza-pokupatelej" className={`hover:text-purple-400 cursor-pointer flex items-center gap-1.5 whitespace-nowrap font-bold ${isActive('/baza-pokupatelej') ? 'text-purple-400' : 'text-purple-400/90'}`}>
                <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>База покупателей</span>
                <span className="bg-purple-500 text-neutral-950 text-[10px] font-black rounded-full px-1.5 py-0.2 shadow-sm"></span>
              </Link>
              <Link href="/otzyvy-klientov" className={`hover:text-purple-400 cursor-pointer whitespace-nowrap ${isActive('/otzyvy-klientov') ? 'text-purple-400 font-bold' : ''}`}>Наши клиенты</Link>

              <div className="relative">
                <button onClick={() => toggleDropdown('sale')} className={`hover:text-purple-400 cursor-pointer flex items-center gap-0.5 whitespace-nowrap ${activeDropdown === 'sale' ? 'text-purple-400' : ''}`}>Продажа<ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'sale' ? 'rotate-180' : ''}`} /></button>
                {activeDropdown === 'sale' && (
                  <div className="absolute left-0 mt-2 w-56 bg-neutral-950/95 backdrop-blur-md rounded-xl py-2 shadow-2xl normal-case font-medium z-50">
                    <Link href="/prodazha-nedvizhimosti" className="block w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm font-bold text-purple-400 border-b border-white/10">Все услуги продажи</Link>
                    <Link href="/prodazha-kvartiry" className="block w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm hover:text-purple-400 text-stone-300">Продать квартиру</Link>
                    <Link href="/prodazha-pomescheniya" className="block w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm hover:text-purple-400 text-stone-300">Продать помещение</Link>
                    <Link href="/prodazha-doma-dachi" className="block w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm hover:text-purple-400 text-stone-300">Продать дом, дачу</Link>
                    <Link href="/prodazha-komnaty-doli" className="block w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm hover:text-purple-400 text-stone-300">Продать комнату, долю</Link>
                    <Link href="/10-dnej-probnogo-perioda" className="block w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm hover:text-purple-400 text-stone-300">10 дней тест-драйва</Link>
                  </div>
                )}
              </div>

              <Link href="/obmen-nedvizhimosti" className={`hover:text-purple-400 cursor-pointer whitespace-nowrap ${isActive('/obmen-nedvizhimosti') ? 'text-purple-400 font-bold' : ''}`}>Обмен</Link>
              <Link href="/10-dnej-probnogo-perioda" className={`hover:text-purple-400 cursor-pointer whitespace-nowrap ${isActive('/10-dnej-probnogo-perioda') ? 'text-purple-400' : ''}`}>Тест-драйв</Link>
              <Link href="/#catalog-root" className="hover:text-purple-400 cursor-pointer whitespace-nowrap">Топ предложений</Link>

              <a href={`tel:${PHONE.replace(/\s/g, '')}`} className="text-purple-400 hover:text-purple-300 font-bold text-sm tracking-wide whitespace-nowrap">{PHONE}</a>

              <div className="relative">
                <button onClick={() => setShowCallDropdown(!showCallDropdown)} className={`hover:text-purple-400 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${showCallDropdown ? 'text-purple-400' : ''}`}><Phone className="w-4 h-4" />СВЯЗАТЬСЯ</button>
                {showCallDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-neutral-950/95 backdrop-blur-md rounded-xl p-5 z-50 shadow-2xl">
                    <div className="flex justify-between items-center pb-3 border-b border-white/10"><span className="text-xs font-bold uppercase text-stone-400">Позвоните нам</span><Phone className="w-4 h-4 text-stone-400" /></div>
                    <div className="mt-3 space-y-3">
                      <div><p className="text-[10px] font-bold uppercase text-stone-400">Телефон</p><a href={`tel:${PHONE.replace(/\s/g, '')}`} className="text-base font-bold text-purple-400 hover:text-purple-300">{PHONE}</a></div>
                      <div className="border-t border-white/10 pt-3 flex gap-2">
                        <a href={`viber://chat?number=%2B${PHONE.replace(/\D/g, '')}`} className="flex-1 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-center text-xs font-bold rounded transition-colors">Viber</a>
                        <a href="https://t.me/fattoriaminsk" target="_blank" rel="noreferrer" className="flex-1 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-center text-xs font-bold rounded transition-colors">Telegram</a>
                      </div>
                      <div className="text-[10px] text-stone-400"><span>пн-пт: <span className="text-stone-300 font-medium">9:00 — 21:00</span></span><br /><span>сб: <span className="text-stone-300 font-medium">10:00 — 15:00</span></span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {globalSearchOpen && (
          <div className="bg-neutral-950/95 backdrop-blur-md border-t border-white/10 px-4 py-3">
            <div className="max-w-3xl mx-auto flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <label htmlFor="global-search-input" className="sr-only">Поиск недвижимости</label>
                <input
                  id="global-search-input"
                  type="text"
                  placeholder="Поиск недвижимости..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 text-white placeholder-stone-500 text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
              </div>
              <Link
                href={`/novosti-nedvizhimosti?search=${encodeURIComponent(searchQuery)}`}
                className="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg text-xs uppercase cursor-pointer"
                aria-label="Найти недвижимость"
              >
                Найти
              </Link>
            </div>
          </div>
        )}

        {mobileMenuOpen && (
          <div className="xl:hidden absolute top-full left-0 right-0 bg-neutral-950/98 backdrop-blur-2xl border-t border-white/10 p-4 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto rounded-b-3xl shadow-2xl animate-fadeIn z-[60]">
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <Link href="/baza-pokupatelej" className="col-span-2 text-left px-4 py-3 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-400 font-extrabold flex items-center justify-between transition-all">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>👥 База покупателей</span>
                </div>
                <span className="px-2.5 py-0.5 text-[10px] bg-purple-500 text-neutral-950 font-black rounded-full shadow-xs">
                  активные
                </span>
              </Link>

              <Link href="/catalog" className="text-left px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-purple-400 font-bold flex items-center justify-between border border-white/5">
                <span>🏙️ Каталог</span>
              </Link>
              <Link href="/ocenka-kvartiry" className="text-left px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-purple-400 font-bold flex items-center justify-between border border-white/5">
                <span>📊 Оценка</span>
              </Link>
              <Link href="/services-agentstva" className="text-left px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200">
                Услуги агентства
              </Link>
              <Link href="/prodazha-kvartiry" className="text-left px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200">
                Продать квартиру
              </Link>
              <Link href="/obmen-nedvizhimosti" className="text-left px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200">
                Обмен
              </Link>
              <Link href="/ob-agentstve" className="text-left px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200">
                О компании
              </Link>
              <Link href="/nasha-komanda" className="text-left px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200">
                Наша команда
              </Link>
              <Link href="/novosti-nedvizhimosti" className="text-left px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200">
                Статьи
              </Link>
              <Link href="/kontakty" className="text-left px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200">
                Контакты
              </Link>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <Link href="/10-dnej-probnogo-perioda" className="w-full text-left px-4 py-2.5 text-xs font-bold bg-purple-500/15 text-purple-300 rounded-xl flex items-center justify-between border border-purple-500/20">
                <span>🚀 Тест-драйв услуг (10 дней)</span>
                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 bg-purple-500 text-neutral-950 rounded">Бесплатно</span>
              </Link>
              <Link href="/agent-cabinet" className="w-full text-left px-4 py-2.5 text-xs font-bold bg-stone-900 text-purple-400 rounded-xl flex items-center gap-2 border border-stone-800">
                <UserCheck className="w-4 h-4 text-purple-400" />
                <span>Личный кабинет риэлтера</span>
              </Link>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2 text-center">
              <a href={`tel:${PHONE.replace(/\s/g, '')}`} className="block py-2 text-lg font-extrabold text-purple-400 tracking-wider">
                {PHONE}
              </a>
              <div className="flex gap-2">
                <a href={`viber://chat?number=%2B${PHONE.replace(/\D/g, '')}`} className="flex-1 py-2 bg-purple-600/20 text-purple-300 font-bold text-xs rounded-xl border border-purple-500/30 text-center">
                  Viber
                </a>
                <a href="https://t.me/fattoriaminsk" target="_blank" rel="noreferrer" className="flex-1 py-2 bg-blue-600/20 text-blue-300 font-bold text-xs rounded-xl border border-blue-500/30 text-center">
                  Telegram
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Backdrop for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="xl:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[45]"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {showWishlistModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="bg-neutral-950/95 backdrop-blur-lg border-l border-white/10 text-white h-full max-w-md w-full p-6 flex flex-col shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold">
                <Heart className="w-5 h-5 text-purple-400 fill-purple-400 inline mr-2" />
                Избранное ({favoritedProperties.length})
              </h3>
              <button
                onClick={() => setShowWishlistModal(false)}
                className="px-3 py-1 text-xs font-bold uppercase text-stone-300 bg-white/5 hover:bg-white/15 rounded transition-colors"
                aria-label="Закрыть список избранного"
              >
                Закрыть
              </button>
            </div>
            {favoritedProperties.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-12 h-12 text-stone-600 mx-auto" />
                <p className="text-sm text-stone-400 mt-2">У вас нет избранных объектов</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {favoritedProperties.map(p => (
                  <div key={p.id} className="flex gap-3 p-2 hover:bg-white/5 rounded-lg">
                    <img
                      src={p.photo}
                      alt={p.title}
                      width={64}
                      height={64}
                      loading="lazy"
                      decoding="async"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase text-stone-400">{p.type}</p>
                      <h4 className="text-sm font-bold">{p.title}</h4>
                      <p className="text-xs text-stone-400">{p.address}</p>
                      <p className="text-sm font-bold text-purple-400">
                        {((currency === 'BYN' ? p.priceBYN : p.priceUSD) || 0).toLocaleString()} {currencySign}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleFavorite(p.id)}
                      className="text-stone-400 hover:text-purple-400 p-1"
                      aria-label={`Удалить ${p.title} из избранного`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {favoritedProperties.length > 0 && (
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowWishlistModal(false)}
                  className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg text-sm transition-colors"
                >
                  Записаться на просмотр
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}