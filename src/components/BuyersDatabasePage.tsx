"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { PageId, Property, Agent } from '../types';
import PageHero from './PageHero';
import { BUYERS_DATA, BuyerRequest } from '../data/buyers';
import { getNbrbRate, fetchNbrbRate, subscribeUsdRate } from '../utils/exchangeRate';
import { 
  Users, Search, Filter, Calendar, MapPin, CheckCircle, 
  X, ChevronDown, RotateCcw, ArrowUpDown, Sparkles, PhoneCall, 
  Building, Check, Flame, Clock, ShieldCheck, DollarSign, Coins, ExternalLink, Phone
} from 'lucide-react';
import { AgentBrandAvatar } from './AgentBrandAvatar';

interface BuyersDatabasePageProps {
  activePage: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
  buyersList?: any[];
  setBuyersList?: (list: any[]) => void;
  agentsList?: Agent[];
  propertiesList?: Property[];
}

export default function BuyersDatabasePage({ 
  activePage, 
  navigateTo, 
  handleAddLead,
  buyersList = [],
  setBuyersList,
  agentsList = [],
  propertiesList = []
}: BuyersDatabasePageProps) {

  const [usdRate, setUsdRate] = useState<number>(() => getNbrbRate());

  useEffect(() => {
    const unsubscribe = subscribeUsdRate((rate) => setUsdRate(rate));
    fetchNbrbRate();
    return unsubscribe;
  }, []);

  const USD_TO_BYN = usdRate;

  // Matching properties logic
  const getMatchingProperties = (buyer: BuyerRequest): Property[] => {
    if (!propertiesList || propertiesList.length === 0) return [];
    return propertiesList.filter((prop) => {
      // 1. Check price tolerance (within buyer's max budget + 10%)
      if (buyer.maxPriceUSD && buyer.maxPriceUSD > 0) {
        if (prop.priceUSD && prop.priceUSD > buyer.maxPriceUSD * 1.1) return false;
      } else if (buyer.maxPriceBYN && buyer.maxPriceBYN > 0) {
        if (prop.priceBYN && prop.priceBYN > buyer.maxPriceBYN * 1.1) return false;
      }

      // 2. Check rooms if specified
      if (buyer.rooms && buyer.rooms !== 'Все' && buyer.rooms !== 'Любая') {
        const parts = buyer.rooms.split(/[-–,]/).map(r => parseInt(r.trim(), 10)).filter(n => !isNaN(n));
        if (parts.length > 0 && prop.rooms) {
          if (!parts.includes(prop.rooms)) return false;
        }
      }

      // 3. Check min area
      if (buyer.minArea && buyer.minArea > 0 && prop.area) {
        if (prop.area < buyer.minArea * 0.85) return false;
      }

      // 4. Check location
      if (buyer.districts && buyer.districts.length > 0) {
        const matchLoc = buyer.districts.some(d => {
          if (!d || d === 'Минск' || d === 'Все' || d === 'Любой') return true;
          const dLow = d.toLowerCase();
          const pAddr = (prop.address || '').toLowerCase();
          const pDist = (prop.district || '').toLowerCase();
          const pDesc = (prop.description || '').toLowerCase();
          const pTitle = (prop.title || '').toLowerCase();
          return pAddr.includes(dLow) || pDist.includes(dLow) || pDesc.includes(dLow) || pTitle.includes(dLow);
        });
        if (!matchLoc) return false;
      }

      return true;
    });
  };

  // State for viewing matches modal
  const [viewingMatchesBuyer, setViewingMatchesBuyer] = useState<BuyerRequest | null>(null);
  const [newBuyerMatchNotification, setNewBuyerMatchNotification] = useState<{ buyerName: string; count: number; matches: Property[] } | null>(null);

  // Combine static data with CRM buyers from buyersList
  const allBuyers: BuyerRequest[] = useMemo(() => {
    const crmBuyersMapped: BuyerRequest[] = (buyersList || [])
      .filter((b: any) => b.isPublicApproved === true || b.isPublishedOnSite === true)
      .map((b: any, index: number) => {
      const budgetUSD = b.budgetUSD || b.maxPriceUSD || (b.budgetBYN || b.maxPriceBYN ? Math.round((b.budgetBYN || b.maxPriceBYN) / USD_TO_BYN) : 100000);
      const budgetBYN = b.budgetBYN || b.maxPriceBYN || Math.round((budgetUSD || 100000) * USD_TO_BYN);
      const codeDigits = b.id ? b.id.replace(/\D/g, '').slice(-6) : (800000 + index).toString();
      
      let roomsStr = '2-3';
      if (b.prefRooms) roomsStr = String(b.prefRooms);
      else if (b.searchCriteria?.rooms && b.searchCriteria.rooms.length > 0) {
        roomsStr = b.searchCriteria.rooms.join('-');
      }

      const districtsArr: string[] = [];
      if (b.prefDistrict) districtsArr.push(b.prefDistrict);
      if (b.searchCriteria?.districts) {
        b.searchCriteria.districts.forEach((d: string) => {
          if (!districtsArr.includes(d)) districtsArr.push(d);
        });
      }
      if (districtsArr.length === 0) districtsArr.push('Минск');

      return {
        id: b.id || `crm-buyer-${index}`,
        code: codeDigits.length >= 6 ? codeDigits : (700000 + index).toString(),
        date: b.dateAdded || '13.08.2026',
        rooms: roomsStr,
        maxPriceUSD: budgetUSD || 0,
        maxPriceBYN: budgetBYN || 0,
        districts: districtsArr,
        city: (b.prefDistrict?.includes('Пригород') || b.prefDistrict?.includes('обл')) ? 'Пригород' : 'Минск',
        minArea: b.minArea || b.searchCriteria?.minArea || 30,
        floorPreference: 'Любой',
        minYear: 1990,
        comment: b.preferences || `Ищет недвижимость с бюджетом до ${(budgetUSD || 0).toLocaleString()} USD. Заявка зарегистрирована в CRM Риэлтер  ${b.assignedAgentName || b.registeredBy || 'АН Фаттория'}.`,
        isUrgent: b.status === 'searching' || b.status === 'urgent',
      };
    });

    // Merge CRM buyers with static buyers dataset, avoiding duplicate codes
    const existingCodes = new Set(crmBuyersMapped.map(b => b.code));
    const uniqueStatic = BUYERS_DATA.filter(b => !existingCodes.has(b.code));
    return [...crmBuyersMapped, ...uniqueStatic];
  }, [buyersList]);

  // Currency Filter Mode: 'USD' or 'BYN'
  const [currency, setCurrency] = useState<'USD' | 'BYN'>('USD');

  // Filters State
  const [selectedCity, setSelectedCity] = useState<'Все' | 'Минск' | 'Пригород'>('Все');
  const [selectedRooms, setSelectedRooms] = useState<string>('Все'); // 'Все', '1', '2', '3', '4+'
  const [locationQuery, setLocationQuery] = useState('');
  
  // Budget Filters
  const [minBudget, setMinBudget] = useState<string>('');
  const [maxBudget, setMaxBudget] = useState<string>('');
  const [unlimitedBudget, setUnlimitedBudget] = useState<boolean>(true); // Default to unlimited budget allowed

  // Advanced Filters
  const [minArea, setMinArea] = useState<number>(0);
  const [selectedFloor, setSelectedFloor] = useState<string>('Любой');
  const [minYear, setMinYear] = useState<number>(0);
  const [onlyUrgent, setOnlyUrgent] = useState<boolean>(false);

  // Mobile Filter Accordion Toggle
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sorting State
  const [sortBy, setSortBy] = useState<'newest' | 'price-desc' | 'price-asc' | 'urgent'>('newest');

  // Pagination State (items to display)
  const [visibleCount, setVisibleCount] = useState<number>(9);

  // Expanded Cards State (for comments)
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  // Contact Modal State
  const [selectedBuyer, setSelectedBuyer] = useState<BuyerRequest | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactNotes, setContactNotes] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Add Buyer Modal State
  const [isAddBuyerModalOpen, setIsAddBuyerModalOpen] = useState(false);
  const [newBuyerName, setNewBuyerName] = useState('');
  const [newBuyerPhone, setNewBuyerPhone] = useState('+375 ');
  const [newBuyerBudgetUSD, setNewBuyerBudgetUSD] = useState('');
  const [newBuyerPrefType, setNewBuyerPrefType] = useState('apartment');
  const [newBuyerPrefRooms, setNewBuyerPrefRooms] = useState('');
  const [newBuyerPrefDistrict, setNewBuyerPrefDistrict] = useState('');
  const [newBuyerMinArea, setNewBuyerMinArea] = useState('');
  const [newBuyerPrefs, setNewBuyerPrefs] = useState('');
  const [newBuyerAgent, setNewBuyerAgent] = useState('Белюк Жанна');

  const handleAddBuyerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBuyerPhone || newBuyerPhone.trim().length < 7) {
      alert('Укажите корректный номер телефона покупателя!');
      return;
    }

    const budgetUSD = parseInt(newBuyerBudgetUSD, 10) || 0;
    const newBuyerObj = {
      id: `buyer-${Date.now()}`,
      name: newBuyerName.trim() || 'Покупатель из заявки',
      phone: newBuyerPhone.trim(),
      budgetUSD: budgetUSD,
      budgetBYN: Math.round(budgetUSD * USD_TO_BYN),
      preferences: newBuyerPrefs.trim() || `Ищет недвижимость. Бюджет: $${budgetUSD.toLocaleString()}`,
      registeredBy: newBuyerAgent || 'Белюк Жанна',
      assignedAgentName: newBuyerAgent || 'Белюк Жанна',
      status: 'searching',
      dateAdded: new Date().toLocaleDateString('ru-RU'),
      prefType: newBuyerPrefType,
      prefRooms: newBuyerPrefRooms ? parseInt(newBuyerPrefRooms, 10) : undefined,
      prefDistrict: newBuyerPrefDistrict || 'Минск',
      minArea: newBuyerMinArea ? parseFloat(newBuyerMinArea) : undefined
    };

    const updated = [newBuyerObj, ...(buyersList || [])];
    if (setBuyersList) {
      setBuyersList(updated);
    }
    localStorage.setItem('fp_buyers', JSON.stringify(updated));

    // Register lead
    handleAddLead(
      newBuyerName.trim() || 'Новый покупатель',
      newBuyerPhone.trim(),
      `Заявка на подбор (${newBuyerPrefType}, бюджет $${budgetUSD.toLocaleString()}): ${newBuyerPrefs}`,
      'База покупателей: Добавление заявки'
    );

    const createdReq: BuyerRequest = {
      id: newBuyerObj.id,
      code: newBuyerObj.id.replace(/\D/g, '').slice(-6) || '800001',
      date: newBuyerObj.dateAdded,
      rooms: newBuyerObj.prefRooms ? String(newBuyerObj.prefRooms) : 'Все',
      maxPriceUSD: newBuyerObj.budgetUSD,
      maxPriceBYN: newBuyerObj.budgetBYN,
      districts: newBuyerObj.prefDistrict ? [newBuyerObj.prefDistrict] : ['Минск'],
      city: 'Минск',
      minArea: newBuyerObj.minArea || 30,
      floorPreference: 'Любой',
      minYear: 1990,
      comment: newBuyerObj.preferences,
      isUrgent: true
    };

    const matches = getMatchingProperties(createdReq);
    setNewBuyerMatchNotification({
      buyerName: newBuyerObj.name,
      count: matches.length,
      matches: matches
    });
    setViewingMatchesBuyer(createdReq);

    setIsAddBuyerModalOpen(false);
    // Reset form
    setNewBuyerName('');
    setNewBuyerPhone('+375 ');
    setNewBuyerBudgetUSD('');
    setNewBuyerPrefType('apartment');
    setNewBuyerPrefRooms('');
    setNewBuyerPrefDistrict('');
    setNewBuyerMinArea('');
    setNewBuyerPrefs('');
  };

  // Helper to toggle expanded comment
  const toggleExpandComment = (id: string) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Reset Filters Function
  const handleResetFilters = () => {
    setSelectedCity('Все');
    setSelectedRooms('Все');
    setLocationQuery('');
    setMinBudget('');
    setMaxBudget('');
    setUnlimitedBudget(true);
    setMinArea(0);
    setSelectedFloor('Любой');
    setMinYear(0);
    setOnlyUrgent(false);
    setVisibleCount(9);
  };

  // Filtered & Sorted Buyers Computation
  const filteredBuyers = useMemo(() => {
    return allBuyers.filter(buyer => {
      // City Filter
      if (selectedCity !== 'Все' && buyer.city !== selectedCity) {
        return false;
      }

      // Rooms Filter
      if (selectedRooms !== 'Все') {
        if (selectedRooms === '1' && !buyer.rooms.includes('1')) return false;
        if (selectedRooms === '2' && !buyer.rooms.includes('2')) return false;
        if (selectedRooms === '3' && !buyer.rooms.includes('3')) return false;
        if (selectedRooms === '4+' && !buyer.rooms.includes('4') && !buyer.rooms.includes('5')) return false;
      }

      // Location Filter (Street, District, Comment)
      if (locationQuery.trim()) {
        const q = locationQuery.toLowerCase().trim();
        const streetMatch = buyer.street?.toLowerCase().includes(q);
        const commentMatch = buyer.comment.toLowerCase().includes(q);
        const districtMatch = buyer.districts.some(d => d.toLowerCase().includes(q));
        if (!streetMatch && !commentMatch && !districtMatch) return false;
      }

      // Budget Min & Max Filter
      const buyerPrice = currency === 'USD' ? buyer.maxPriceUSD : buyer.maxPriceBYN;
      
      const numMinBudget = minBudget ? parseFloat(minBudget) : 0;
      if (numMinBudget > 0 && buyerPrice < numMinBudget) {
        return false;
      }

      if (!unlimitedBudget && maxBudget) {
        const numMaxBudget = parseFloat(maxBudget);
        if (numMaxBudget > 0 && buyerPrice > numMaxBudget) {
          return false;
        }
      }

      // Area Filter
      if (minArea > 0 && buyer.minArea && buyer.minArea < minArea) {
        return false;
      }

      // Floor Filter
      if (selectedFloor !== 'Любой') {
        if (selectedFloor === '1-й' && buyer.floorPreference && !buyer.floorPreference.includes('1') && !buyer.comment.includes('1')) {
          // Pass
        }
        if (selectedFloor === 'Верхний' && buyer.floorPreference === '1-й') {
          return false;
        }
      }

      // Year Built Filter
      if (minYear > 0 && buyer.minYear && buyer.minYear < minYear) {
        return false;
      }

      // Only Urgent Filter
      if (onlyUrgent && !buyer.isUrgent) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = currency === 'USD' ? a.maxPriceUSD : a.maxPriceBYN;
      const priceB = currency === 'USD' ? b.maxPriceUSD : b.maxPriceBYN;

      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'urgent') {
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
      }
      return b.code.localeCompare(a.code);
    });
  }, [allBuyers, selectedCity, selectedRooms, locationQuery, currency, minBudget, maxBudget, unlimitedBudget, minArea, selectedFloor, minYear, onlyUrgent, sortBy]);

  // Handle Contact Modal Submit
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactPhone.trim() || !selectedBuyer) return;

    handleAddLead(
      contactName.trim() || 'Продавец объекта',
      contactPhone.trim(),
      `Заявка на покупателя № ${selectedBuyer.code} (бюджет: ${(selectedBuyer.maxPriceUSD || 0).toLocaleString()} USD / ${(selectedBuyer.maxPriceBYN || 0).toLocaleString()} BYN)${contactNotes ? ` | Сообщение: ${contactNotes}` : ''}`,
      'База покупателей'
    );

    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setSelectedBuyer(null);
      setContactName('');
      setContactPhone('');
      setContactNotes('');
    }, 3000);
  };

  const visibleBuyers = filteredBuyers.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 selection:bg-[#8B5CF6] selection:text-white">
      
      {/* Hero Header */}
      <PageHero
        activePage={activePage}
        navigateTo={navigateTo}
        handleAddLead={handleAddLead}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Top Live CRM Stats Bar */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xl sm:text-2xl font-bold text-stone-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  База реальных покупателей: <span className="text-[#8B5CF6]">{allBuyers.length}</span>
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  +15 на этой неделе
                </span>
              </div>
              <p className="text-stone-600 text-xs sm:text-sm">
                База синхронизирована с CRM агентства. Продайте вашу недвижимость без долгих поисков и комиссий.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 self-stretch md:self-center">
            <div className="bg-stone-50 border border-stone-200/80 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
              <Coins className="w-4 h-4 text-[#8B5CF6]" />
              <div>
                <span className="text-[9px] uppercase font-bold text-stone-400 block leading-none">Курс НБРБ:</span>
                <span className="text-xs font-bold text-stone-900 font-mono">1 USD = {USD_TO_BYN.toFixed(4)} BYN</span>
              </div>
            </div>
            <button
              onClick={() => navigateTo('agent-cabinet')}
              className="px-4 py-2.5 bg-[#8B5CF6] hover:bg-stone-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span></span>
            </button>
            <span className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>CRM статус: Активна</span>
            </span>
          </div>
        </div>

        {/* Main Content Layout: Left Filters + Right Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Mobile Filter Toggle Button */}
          <div className="lg:hidden col-span-1">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="w-full py-3 px-4 bg-white border border-stone-200 text-[#8B5CF6] font-bold text-sm rounded-xl flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#8B5CF6]" />
                <span>Фильтры поиска ({filteredBuyers.length})</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileFilterOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filters Sidebar */}
          <aside className={`lg:col-span-4 xl:col-span-3 ${mobileFilterOpen ? 'block' : 'hidden lg:block'} sticky top-24 z-20`}>
            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
              
              {/* Header Filters */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#8B5CF6]" />
                  <h3 className="font-bold text-stone-900 text-base" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    Фильтр заявок
                  </h3>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="text-stone-500 hover:text-[#8B5CF6] text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  title="Сбросить фильтры"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Сбросить</span>
                </button>
              </div>

              {/* Filter Controls */}
              <div className="space-y-4 text-xs">
                
                {/* Currency Switcher */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
                    Валюта бюджета
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200">
                    <button
                      type="button"
                      onClick={() => setCurrency('USD')}
                      className={`py-2 text-center rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        currency === 'USD'
                          ? 'bg-[#8B5CF6] text-white shadow-sm'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>USD ($)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency('BYN')}
                      className={`py-2 text-center rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        currency === 'BYN'
                          ? 'bg-[#8B5CF6] text-white shadow-sm'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>BYN (руб.)</span>
                    </button>
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
                    Локация
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200">
                    {(['Все', 'Минск', 'Пригород'] as const).map(city => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setSelectedCity(city)}
                        className={`py-1.5 text-center rounded-lg font-medium transition-all cursor-pointer ${
                          selectedCity === city
                            ? 'bg-stone-900 text-white shadow-sm font-bold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rooms */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
                    Комнаты
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Все', '1', '2', '3', '4+'].map(rooms => (
                      <button
                        key={rooms}
                        type="button"
                        onClick={() => setSelectedRooms(rooms)}
                        className={`px-3 py-1.5 rounded-xl font-medium transition-all text-xs cursor-pointer border ${
                          selectedRooms === rooms
                            ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] font-bold shadow-sm'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {rooms === 'Все' ? 'Все' : `${rooms}-к`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Section */}
                <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                      Бюджет ({currency})
                    </label>
                    <span className="text-[10px] text-stone-500 font-medium">
                      {currency === 'USD' ? 'в Долларах' : 'в Рублях'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[10px] text-stone-500 mb-1">От ({currency})</span>
                      <input
                        type="number"
                        value={minBudget}
                        onChange={(e) => setMinBudget(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-white border border-stone-200 focus:border-[#8B5CF6] rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none text-xs"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-stone-500 mb-1">До ({currency})</span>
                      <input
                        type="number"
                        disabled={unlimitedBudget}
                        value={unlimitedBudget ? '' : maxBudget}
                        onChange={(e) => setMaxBudget(e.target.value)}
                        placeholder={unlimitedBudget ? 'Без ограничений' : 'Например 120000'}
                        className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none transition-colors ${
                          unlimitedBudget
                            ? 'bg-stone-100 border-stone-200 text-stone-400 placeholder-stone-400 cursor-not-allowed'
                            : 'bg-white border-stone-200 focus:border-[#8B5CF6] text-stone-900 placeholder-stone-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Unlimited Budget Toggle */}
                  <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={unlimitedBudget}
                      onChange={(e) => {
                        setUnlimitedBudget(e.target.checked);
                        if (e.target.checked) setMaxBudget('');
                      }}
                      className="w-4 h-4 rounded border-stone-300 text-[#8B5CF6] focus:ring-[#8B5CF6] accent-[#8B5CF6]"
                    />
                    <span className="text-xs font-medium text-stone-800">
                      Бюджет не ограничен (показывать все)
                    </span>
                  </label>
                </div>

                {/* Street / District / Metro */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                    Улица, район или метро
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder="Заславская, Первомайский..."
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#8B5CF6] rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Min Area */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                      Площадь от
                    </label>
                    <span className="text-[#8B5CF6] font-bold text-xs">
                      {minArea > 0 ? `${minArea} м²` : 'Любая'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={150}
                    step={5}
                    value={minArea}
                    onChange={(e) => setMinArea(Number(e.target.value))}
                    className="w-full accent-[#8B5CF6] bg-stone-200 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Floor */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                    Этаж
                  </label>
                  <select
                    value={selectedFloor}
                    onChange={(e) => setSelectedFloor(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#8B5CF6] rounded-xl text-stone-900 focus:outline-none text-xs"
                  >
                    <option value="Любой">Любой этаж</option>
                    <option value="1-й">1-й этаж</option>
                    <option value="Средний">Средний (не 1-й и не последний)</option>
                    <option value="Верхний">Верхний / Последний</option>
                  </select>
                </div>

                {/* Urgent Only */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={onlyUrgent}
                      onChange={(e) => setOnlyUrgent(e.target.checked)}
                      className="w-4 h-4 rounded border-stone-300 text-[#8B5CF6] focus:ring-[#8B5CF6] accent-[#8B5CF6]"
                    />
                    <span className="text-xs font-medium text-stone-800 flex items-center gap-1">
                      <span>Только срочные покупки</span>
                      <Flame className="w-3.5 h-3.5 text-purple-500 fill-purple-500" />
                    </span>
                  </label>
                </div>

                {/* Filter Action Buttons */}
                <div className="pt-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileFilterOpen(false);
                      window.scrollTo({ top: 350, behavior: 'smooth' });
                    }}
                    className="w-full py-3 px-4 bg-[#8B5CF6] hover:bg-[#a38050] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Показать ({filteredBuyers.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Сбросить все</span>
                  </button>
                </div>

              </div>
            </div>
          </aside>

          {/* Main Listings Column */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* Top Toolbar */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="text-xs sm:text-sm text-stone-700">
                Найдено заявок: <span className="font-bold text-[#8B5CF6]">{filteredBuyers.length}</span> из <span className="text-stone-900 font-bold">{allBuyers.length}</span>
              </div>

              <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
                <span className="text-stone-500 whitespace-nowrap hidden sm:inline">Сортировка:</span>
                <div className="relative w-full sm:w-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full sm:w-auto pl-3 pr-8 py-2 bg-stone-50 border border-stone-200 focus:border-[#8B5CF6] rounded-xl text-stone-900 font-medium text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="newest">Сначала новые</option>
                    <option value="price-desc">По убыванию бюджета</option>
                    <option value="price-asc">По возрастанию бюджета</option>
                    <option value="urgent">Сначала срочные 🔥</option>
                  </select>
                  <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8B5CF6] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Empty State */}
            {filteredBuyers.length === 0 ? (
              <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-12 text-center my-8 space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-stone-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  По вашим критериям нет результатов
                </h3>
                <p className="text-stone-600 text-sm max-w-md mx-auto">
                  Попробуйте снять ограничение по бюджету или расширить географию поиска.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 bg-[#8B5CF6] hover:bg-[#a38050] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Сбросить все фильтры</span>
                </button>
              </div>
            ) : (
              /* Buyer Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {visibleBuyers.map((buyer) => {
                  const isExpanded = !!expandedComments[buyer.id];
                  const commentText = buyer.comment;
                  const isLongComment = commentText.length > 130;
                  const matchedProps = getMatchingProperties(buyer);
                  const hasMatches = matchedProps.length > 0;

                  return (
                    <div
                      key={buyer.id}
                      className={`bg-white border ${hasMatches ? 'border-emerald-500 bg-emerald-50/15 shadow-emerald-500/10' : 'border-stone-200/90 hover:border-[#8B5CF6]/60'} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group`}
                    >
                      <div>
                        {/* Header: Code + Date + Urgent + Matches */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-stone-100">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-[#8B5CF6] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-2.5 py-1 rounded-lg">
                              № {buyer.code}
                            </span>
                            {buyer.isUrgent && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                                <Flame className="w-3 h-3 text-purple-600 fill-purple-500" />
                                <span>Срочно</span>
                              </span>
                            )}
                            {hasMatches && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                                <Flame className="w-3 h-3 text-emerald-600 fill-emerald-500" />
                                <span>🔥 {matchedProps.length} {matchedProps.length === 1 ? 'объект' : matchedProps.length < 5 ? 'объекта' : 'объектов'}</span>
                              </span>
                            )}
                          </div>
                          <div className="text-stone-400 text-[11px] font-medium flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                            <span>{buyer.date}</span>
                          </div>
                        </div>

                        {/* Rooms & City */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 font-bold text-xs border border-stone-200/60">
                            {buyer.rooms}-комнатная
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-stone-50 text-stone-600 text-xs font-medium border border-stone-200/40">
                            {buyer.city}
                          </span>
                        </div>

                        {/* Price Block */}
                        <div className="mb-4 bg-stone-50/90 rounded-xl p-3 border border-stone-200/60">
                          <span className="text-stone-500 text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                            Макс. бюджет:
                          </span>
                          <div className="text-lg sm:text-xl font-bold text-stone-900 leading-tight">
                            до {(buyer.maxPriceUSD || 0).toLocaleString()} USD
                          </div>
                          <div className="text-xs font-medium text-[#8B5CF6] mt-0.5">
                            (~ {(buyer.maxPriceBYN || 0).toLocaleString()} BYN)
                          </div>
                        </div>

                        {/* Districts Tags */}
                        {buyer.districts.length > 0 && (
                          <div className="mb-3.5">
                            <span className="text-stone-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                              Районы:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {buyer.districts.map((dist, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-700 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md"
                                >
                                  <MapPin className="w-3 h-3 text-[#8B5CF6] shrink-0" />
                                  <span>{dist}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Buyer Wishes */}
                        <div className="mb-4">
                          <span className="text-stone-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                            Пожелания:
                          </span>
                          <p className="text-stone-600 text-xs leading-relaxed">
                            {isExpanded || !isLongComment
                              ? commentText
                              : `${commentText.slice(0, 130)}...`}
                          </p>
                          {isLongComment && (
                            <button
                              type="button"
                              onClick={() => toggleExpandComment(buyer.id)}
                              className="text-[#8B5CF6] hover:underline text-[11px] font-bold mt-1 transition-colors cursor-pointer"
                            >
                              {isExpanded ? 'Свернуть' : 'Читать полностью'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Card Action Buttons & Matches Button */}
                      <div className="space-y-2 mt-2">
                        {hasMatches && (
                          <button
                            type="button"
                            onClick={() => setViewingMatchesBuyer(buyer)}
                            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Building className="w-4 h-4" />
                            <span>🔥 Найдено {matchedProps.length} {matchedProps.length === 1 ? 'объект' : matchedProps.length < 5 ? 'объекта' : 'объектов'} под запрос</span>
                          </button>
                        )}
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedBuyer(buyer)}
                            className="py-2.5 px-2 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-stone-900 hover:bg-[#8B5CF6] text-white transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Связаться</span>
                          </button>
                          <a
                            href="https://t.me/fattoriaminsk"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-2 rounded-xl font-bold text-[10px] sm:text-xs bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 transition-all duration-200 flex items-center justify-center gap-1"
                            title="Колл-центр @fattoriaby в Telegram"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                            <span>Telegram</span>
                          </a>
                          <a
                            href="viber://chat?number=%2B375296380053"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-2 rounded-xl font-bold text-[10px] sm:text-xs bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 transition-all duration-200 flex items-center justify-center gap-1"
                            title="Колл-центр +375296380053 в Viber"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-purple-600" />
                            <span>Viber</span>
                          </a>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination "Показать ещё" */}
            {visibleCount < filteredBuyers.length && (
              <div className="pt-6 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount(prev => prev + 9)}
                  className="px-8 py-3 bg-white border border-stone-300 hover:border-[#8B5CF6] text-stone-800 hover:text-[#8B5CF6] font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Показать ещё ({filteredBuyers.length - visibleCount})</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Contact Buyer Modal */}
      {selectedBuyer && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-2xl text-stone-900 overflow-hidden">
            
            <button
              type="button"
              onClick={() => setSelectedBuyer(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {contactSubmitted ? (
              <div className="py-8 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-stone-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  Заявка отправлена!
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  Риэлтер  свяжется с вами в течение 10 минут и сопоставит вашу квартиру с запросом покупателя <span className="text-[#8B5CF6] font-bold">№ {selectedBuyer.code}</span>.
                </p>
              </div>
            ) : (
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6] text-xs font-bold uppercase mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Связь с Риэлтером по заявке</span>
                </div>

                <h3 className="text-xl font-bold text-stone-900 mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  Заявка № {selectedBuyer.code}
                </h3>
                <p className="text-stone-600 text-xs mb-4">
                  Бюджет: <span className="text-[#8B5CF6] font-bold">до {(selectedBuyer.maxPriceUSD || 0).toLocaleString()} USD ({(selectedBuyer.maxPriceBYN || 0).toLocaleString()} BYN)</span>
                </p>

                <form onSubmit={handleContactSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      Ваше имя
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Например, Елена"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#8B5CF6] rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      Номер телефона <span className="text-[#8B5CF6]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+375 (29) 000-00-00"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#8B5CF6] rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      Информация о вашей квартире (необязательно)
                    </label>
                    <textarea
                      rows={2}
                      value={contactNotes}
                      onChange={(e) => setContactNotes(e.target.value)}
                      placeholder="Адрес, комнатность или желаемая цена..."
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#8B5CF6] rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none text-xs resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#8B5CF6] hover:bg-[#a38050] text-white shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Предложить квартиру</span>
                  </button>

                  <p className="text-[10px] text-center text-stone-500 mt-2">
                    Нажимая кнопку, вы подтверждаете согласие на обработку персональных данных.
                  </p>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ================= ADD BUYER MODAL ================= */}
      {isAddBuyerModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-stone-200 relative my-auto space-y-5">
            <button
              onClick={() => setIsAddBuyerModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6] text-xs font-bold uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Реестр покупателей CRM</span>
              </div>
              <h3 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Внесение нового покупателя / Заявки
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Покупатель мгновенно появится в общей базе с кодом заявки и будет виден всем риэлтерам агентства.
              </p>
            </div>

            <form onSubmit={handleAddBuyerSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    ФИО / Имя покупателя <span className="text-[#8B5CF6]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newBuyerName}
                    onChange={(e) => setNewBuyerName(e.target.value)}
                    placeholder="Например: Покупатель Иван"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#8B5CF6] rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Телефон для связи <span className="text-[#8B5CF6]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={newBuyerPhone}
                    onChange={(e) => setNewBuyerPhone(e.target.value)}
                    placeholder="+375 29 123-45-67"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#8B5CF6] rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Тип объекта
                  </label>
                  <select
                    value={newBuyerPrefType}
                    onChange={(e) => setNewBuyerPrefType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#8B5CF6] rounded-xl text-stone-900 focus:outline-none text-xs cursor-pointer font-medium"
                  >
                    <option value="apartment">Квартира</option>
                    <option value="house">Дом / Коттедж</option>
                    <option value="land">Участок</option>
                    <option value="commercial">Коммерческая</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Бюджет ($ USD) <span className="text-[#8B5CF6]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={newBuyerBudgetUSD}
                    onChange={(e) => setNewBuyerBudgetUSD(e.target.value)}
                    placeholder="Например: 85000"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#8B5CF6] rounded-xl text-stone-900 focus:outline-none text-xs font-mono font-bold"
                  />
                  {newBuyerBudgetUSD && (
                    <span className="text-[10px] text-stone-500 mt-0.5 block font-mono">
                      ≈ {Math.round(parseInt(newBuyerBudgetUSD, 10) * USD_TO_BYN).toLocaleString()} BYN
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Комнатность
                  </label>
                  <select
                    value={newBuyerPrefRooms}
                    onChange={(e) => setNewBuyerPrefRooms(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#8B5CF6] rounded-xl text-stone-900 focus:outline-none text-xs cursor-pointer"
                  >
                    <option value="">Любая</option>
                    <option value="1">1 комната</option>
                    <option value="2">2 комнаты</option>
                    <option value="3">3 комнаты</option>
                    <option value="4">4+ комнаты</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Желаемый район / Метро / Город
                  </label>
                  <input
                    type="text"
                    value={newBuyerPrefDistrict}
                    onChange={(e) => setNewBuyerPrefDistrict(e.target.value)}
                    placeholder="Например: Первомайский, метро Восток"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#8B5CF6] rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Мин. площадь (м²)
                  </label>
                  <input
                    type="number"
                    value={newBuyerMinArea}
                    onChange={(e) => setNewBuyerMinArea(e.target.value)}
                    placeholder="Например: 42"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#8B5CF6] rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Ответственный Риэлтер
                </label>
                <select
                  value={newBuyerAgent}
                  onChange={(e) => setNewBuyerAgent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#8B5CF6] rounded-xl text-stone-900 focus:outline-none text-xs cursor-pointer font-bold"
                >
                  <option value="Белюк Жанна">Белюк Жанна (Руководитель)</option>
                  <option value="Екатерина Романова">Екатерина Романова</option>
                  <option value="Дмитрий Волков">Дмитрий Волков</option>
                  <option value="Мария Кравцова">Мария Кравцова</option>
                  <option value="Сергей Левченко">Сергей Левченко</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Пожелания, особенности и комментарий
                </label>
                <textarea
                  rows={3}
                  value={newBuyerPrefs}
                  onChange={(e) => setNewBuyerPrefs(e.target.value)}
                  placeholder="Срочная покупка, чистая продажа, ипотека одобрена, ищет кирпичный дом..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#8B5CF6] rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none text-xs resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddBuyerModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 font-bold text-xs cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#8B5CF6] hover:bg-stone-900 text-white shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Сохранить и опубликовать</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Matches Modal */}
      {viewingMatchesBuyer && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-stone-200 rounded-3xl shadow-2xl text-stone-900 overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-900 via-stone-900 to-stone-900 text-white flex items-center justify-between gap-4 border-b border-emerald-800/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                  <Flame className="w-5 h-5 fill-emerald-400 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                      Подходящие объекты под запрос № {viewingMatchesBuyer.code}
                    </h3>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      {getMatchingProperties(viewingMatchesBuyer).length} совпадений
                    </span>
                  </div>
                  <p className="text-stone-300 text-xs mt-0.5">
                    Бюджет до ${viewingMatchesBuyer.maxPriceUSD.toLocaleString()} USD (~ {viewingMatchesBuyer.maxPriceBYN.toLocaleString()} BYN) • {viewingMatchesBuyer.rooms}-комнатная • {viewingMatchesBuyer.districts.join(', ')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setViewingMatchesBuyer(null);
                  setNewBuyerMatchNotification(null);
                }}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification Banner if newly added */}
            {newBuyerMatchNotification && (
              <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    🔥 Отлично! Под заявку покупателя <b>{newBuyerMatchNotification.buyerName}</b> сразу найдено {newBuyerMatchNotification.count} подходящих объектов в нашей базе!
                  </span>
                </div>
              </div>
            )}

            {/* Matching Properties List */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {getMatchingProperties(viewingMatchesBuyer).length === 0 ? (
                <div className="py-12 text-center text-stone-500">
                  <Building className="w-12 h-12 mx-auto mb-3 text-stone-300" />
                  <p className="text-sm font-medium">К сожалению, на данный момент нет точных совпадений по объектам в базе.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getMatchingProperties(viewingMatchesBuyer).map((prop) => {
                    const assignedAgent = agentsList.find(a => (prop.assignedAgentId && a.id === prop.assignedAgentId) || (prop.agentName && a.name === prop.agentName)) || agentsList[0];
                    return (
                      <div
                        key={prop.id}
                        className="bg-white border border-stone-200 hover:border-emerald-500 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div>
                          {/* Property Photo & Badges */}
                          <div className="relative h-44 rounded-xl overflow-hidden mb-3 bg-stone-100">
                            <img
                              src={prop.image || prop.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'}
                              alt={prop.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-2 left-2 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/10">
                              {prop.rooms ? `${prop.rooms}-комнатная` : 'Объект'} • {prop.area} м²
                            </div>
                            <div className="absolute bottom-2 left-2 bg-emerald-600/90 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                              ${prop.priceUSD?.toLocaleString()} USD
                            </div>
                          </div>

                          {/* Title and Address */}
                          <h4 className="font-bold text-stone-900 text-sm mb-1 group-hover:text-emerald-700 transition-colors line-clamp-1">
                            {prop.title}
                          </h4>
                          <p className="text-xs text-stone-500 flex items-center gap-1 mb-3 line-clamp-1">
                            <MapPin className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
                            <span>{prop.address || prop.district}</span>
                          </p>

                          {/* Responsible Agent Card */}
                          <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-2.5 flex items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <AgentBrandAvatar
                                photo={assignedAgent?.photo}
                                name={assignedAgent?.name || prop.agentName || 'Риэлтер Фаттория'}
                                className="w-9 h-9 rounded-full object-cover border border-stone-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="text-[11px] font-bold text-stone-900 truncate">
                                  {assignedAgent?.name || prop.agentName || 'Белюк Жанна'}
                                </div>
                                <div className="text-[10px] text-stone-500">
                                  Ответственный Риэлтер
                                </div>
                              </div>
                            </div>

                            {assignedAgent?.phone && (
                              <a
                                href={`tel:${assignedAgent.phone.replace(/\s+/g, '')}`}
                                className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-emerald-700 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Позвонить</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                          <button
                            onClick={() => {
                              handleAddLead(
                                `Покупатель №${viewingMatchesBuyer.code}`,
                                '+375 29 638-00-53',
                                `Совпадение по запросу №${viewingMatchesBuyer.code} с объектом "${prop.title}" (${prop.address})`,
                                'База покупателей: Автоподбор'
                              );
                              alert(`Заявка на показ объекта "${prop.title}" для покупателя №${viewingMatchesBuyer.code} отправлена риэлтеру!`);
                            }}
                            className="py-2 px-3 bg-stone-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Предложить клиенту</span>
                          </button>

                          <button
                            onClick={() => {
                              setViewingMatchesBuyer(null);
                              navigateTo('catalog');
                            }}
                            className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>В каталог</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <span>Система умного сопоставления «АН Фаттория»</span>
              <button
                onClick={() => {
                  setViewingMatchesBuyer(null);
                  setNewBuyerMatchNotification(null);
                }}
                className="px-5 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl font-bold transition-all cursor-pointer"
              >
                Закрыть
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
