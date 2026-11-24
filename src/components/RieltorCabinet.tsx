"use client";
import React, { useState, useMemo } from 'react';
import { Agent, Property, Buyer, ColdSeller, CRMTask } from '../types';
import { 
  Building, Users, Phone, Target, Search, Plus, Filter, CheckCircle2, 
  ExternalLink, MessageSquare, ShieldCheck, AlertCircle, ArrowUpRight, 
  ChevronRight, Sparkles, MapPin, DollarSign, Bed, Maximize2, Tag, 
  Clock, X, Check, ArrowRight, UserCheck, Send, PhoneCall, RefreshCw, Edit2,
  FileText, Share2, MessageCircle, Copy, Download, Layers, Calendar, ChevronLeft
} from 'lucide-react';
import { AgentBrandAvatar } from './AgentBrandAvatar';
import { checkMatch, findMatches, MatchResult } from '../utils/matchEngine';
import { isSamePersonName } from '@/lib/agentUtils';

interface RieltorCabinetProps {
  loggedInAgent: Agent;
  propertiesList: Property[];
  buyersList: Buyer[];
  setBuyersList: (list: Buyer[]) => void;
  sellersList: ColdSeller[];
  nbrbRate?: number;
  onLogout: () => void;
  onViewProperty?: (property: Property) => void;
  onGenerateKP?: (property: Property) => void;
  onOpenInstitutionalRequests?: (property?: Property) => void;
}

export const RieltorCabinet: React.FC<RieltorCabinetProps> = ({
  loggedInAgent,
  propertiesList,
  buyersList,
  setBuyersList,
  sellersList,
  nbrbRate = 3.25,
  onLogout,
  onViewProperty,
  onGenerateKP,
  onOpenInstitutionalRequests
}) => {
  const [activeTab, setActiveTab] = useState<'my-objects' | 'buyers' | 'matches'>('my-objects');
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);

  const myObjects = useMemo(() => {
    const myIdNorm = (loggedInAgent.id || '').trim().toLowerCase();

    return propertiesList.filter((p) => {
      const propAgentId = p.assignedAgentId ? String(p.assignedAgentId).trim().toLowerCase() : '';
      if (propAgentId && myIdNorm) {
        return propAgentId === myIdNorm;
      }
      if (p.assignedAgentName && isSamePersonName(p.assignedAgentName, loggedInAgent.name)) {
        return true;
      }
      if (p.agentName && isSamePersonName(p.agentName, loggedInAgent.name)) {
        return true;
      }
      return false;
    });
  }, [propertiesList, loggedInAgent]);

  const matches = useMemo(() => {
    return findMatches(buyersList, myObjects, 70);
  }, [buyersList, myObjects]);

  const [newMatchAlert, setNewMatchAlert] = useState<MatchResult | null>(null);
  const [isAddBuyerModalOpen, setIsAddBuyerModalOpen] = useState(false);
  const [selectedPropertyForFilter, setSelectedPropertyForFilter] = useState<string | null>(null);

  // Quick Send KP Modal
  const [sendKpModal, setSendKpModal] = useState<{ property: Property; buyer?: Buyer } | null>(null);
  const [sendTargetPhone, setSendTargetPhone] = useState<string>('');
  const [sendTargetName, setSendTargetName] = useState<string>('');
  const [sendCustomNote, setSendCustomNote] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // New Buyer Form States
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('+375 ');
  const [buyerType, setBuyerType] = useState<'apartment' | 'house' | 'commercial' | 'plot'>('apartment');
  const [buyerRooms, setBuyerRooms] = useState<string>('2');
  const [buyerDistrict, setBuyerDistrict] = useState<string>('Центральный');
  const [buyerMinArea, setBuyerMinArea] = useState<string>('45');
  const [buyerMaxArea, setBuyerMaxArea] = useState<string>('80');
  const [buyerBudgetBYN, setBuyerBudgetBYN] = useState<string>('250000');
  const [buyerPreferences, setBuyerPreferences] = useState('');

  const [objectSearch, setObjectSearch] = useState('');
  const [buyerSearch, setBuyerSearch] = useState('');
  const [sellerSearch, setSellerSearch] = useState('');
  const [matchMinScore, setMatchMinScore] = useState<number>(70);

  const [contactModal, setContactModal] = useState<{ isOpen: boolean; title: string; text: string; phone: string } | null>(null);

  // === ПЕРЕХОД НА СТРАНИЦУ ОБЪЕКТА ===
  const handleOpenProperty = (property: Property) => {
    window.location.href = `/object/${property.slug || property.id}`;
  };

  const handleSaveBuyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !buyerPhone.trim()) {
      alert('Пожалуйста, укажите имя и телефон покупателя');
      return;
    }

    const budgetNum = parseFloat(buyerBudgetBYN.replace(/[^\d.]/g, '')) || 0;
    const minAreaNum = parseFloat(buyerMinArea) || 0;
    const maxAreaNum = parseFloat(buyerMaxArea) || 9999;
    const roomsNum = parseInt(buyerRooms, 10) || 2;

    const newBuyer: Buyer = {
      id: `buyer_${Date.now()}`,
      name: buyerName.trim(),
      phone: buyerPhone.trim(),
      budgetBYN: budgetNum,
      budgetUSD: Math.round(budgetNum / nbrbRate),
      preferences: buyerPreferences.trim() || `${buyerRooms}-комн., район: ${buyerDistrict}, площадь: ${minAreaNum}-${maxAreaNum} м²`,
      prefType: buyerType,
      prefRooms: roomsNum,
      prefDistrict: buyerDistrict,
      minArea: minAreaNum,
      registeredBy: loggedInAgent.name,
      assignedAgentId: loggedInAgent.id,
      assignedAgentName: loggedInAgent.name,
      status: 'Активный поиск',
      dateAdded: new Date().toISOString().split('T')[0],
      searchCriteria: {
        propertyType: buyerType,
        rooms: [roomsNum],
        minPriceBYN: Math.round(budgetNum * 0.7),
        maxPriceBYN: budgetNum,
        minArea: minAreaNum,
        maxArea: maxAreaNum,
        district: buyerDistrict,
        districts: [buyerDistrict]
      },
      autoMatchingEnabled: true
    };

    const updatedBuyers = [newBuyer, ...buyersList];
    setBuyersList(updatedBuyers);
    localStorage.setItem('fp_crm_buyers', JSON.stringify(updatedBuyers));

    setIsAddBuyerModalOpen(false);

    setBuyerName('');
    setBuyerPhone('+375 ');
    setBuyerPreferences('');

    const newMatchesForAgent = myObjects.map(obj => checkMatch(newBuyer, obj)).filter(m => m.score >= 70);
    if (newMatchesForAgent.length > 0) {
      const best = newMatchesForAgent.sort((a, b) => b.score - a.score)[0];
      setNewMatchAlert(best);
    }
  };

  const filteredMyObjects = useMemo(() => {
    return myObjects.filter(p => {
      if (!objectSearch) return true;
      const q = objectSearch.toLowerCase();
      return (
        p.title?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q) ||
        p.district?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q)
      );
    });
  }, [myObjects, objectSearch]);

  const filteredBuyers = useMemo(() => {
    return buyersList.filter(b => {
      if (!buyerSearch) return true;
      const q = buyerSearch.toLowerCase();
      return (
        b.name?.toLowerCase().includes(q) ||
        b.phone?.toLowerCase().includes(q) ||
        b.prefDistrict?.toLowerCase().includes(q) ||
        b.preferences?.toLowerCase().includes(q)
      );
    });
  }, [buyersList, buyerSearch]);

  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      if (m.score < matchMinScore) return false;
      if (selectedPropertyForFilter && m.property.id !== selectedPropertyForFilter) return false;
      return true;
    });
  }, [matches, matchMinScore, selectedPropertyForFilter]);

  const handleOpenSendKP = (property: Property, buyer?: Buyer) => {
    setSendKpModal({ property, buyer });
    setSendTargetName(buyer?.name || '');
    setSendTargetPhone(buyer?.phone || '+375 ');
    setSendCustomNote(`Здравствуйте${buyer?.name ? `, ${buyer.name}` : ''}! Подготовил для вас отличный проверенный вариант: ${property.title}.`);
    setCopiedLink(false);
    setCopiedText(false);
  };

  const getProposalText = (property: Property, customNote: string) => {
    const priceUSD = property.priceUSD || (property.priceBYN ? Math.round(property.priceBYN / nbrbRate) : 0);
    const priceBYN = property.priceBYN || (property.priceUSD ? Math.round(property.priceUSD * nbrbRate) : 0);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fattoria.by';
    const link = `${origin}/object/${property.slug || property.id}`;

    return `${customNote}\n\n🏢 ${property.title}\n📍 Адрес: ${property.address || property.location || 'г. Минск'}\n💰 Стоимость: ${(priceBYN).toLocaleString('ru-RU')} BYN ($${priceUSD.toLocaleString('ru-RU')})\n📐 Площадь: ${property.area} м² • ${property.rooms || 1}-комнатная\n🚇 Метро: ${property.metro || 'Рядом'}\n\n🔗 Посмотреть фото и описание объекта на сайте:\n${link}\n\n👤 Ваш риэлтер: ${loggedInAgent.name}\n📞 Телефон: ${loggedInAgent.phone || '+375 29 638-00-53'}\nООО «АН Фаттория»`;
  };

  const handleSendTelegram = (property: Property) => {
    const text = getProposalText(property, sendCustomNote);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fattoria.by';
    const url = `https://t.me/share/url?url=${encodeURIComponent(`${origin}/object/${property.slug || property.id}`)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSendWhatsApp = (property: Property) => {
    const text = getProposalText(property, sendCustomNote);
    const phoneClean = sendTargetPhone.replace(/[^\d]/g, '');
    const url = phoneClean && phoneClean.length > 8
      ? `https://api.whatsapp.com/send?phone=${phoneClean}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSendViber = (property: Property) => {
    const text = getProposalText(property, sendCustomNote);
    const url = `viber://forward?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = (property: Property) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fattoria.by';
    const link = `${origin}/object/${property.slug || property.id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyFullText = (property: Property) => {
    const text = getProposalText(property, sendCustomNote);
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 py-6 font-sans text-neutral-900 space-y-6">
      
      {/* Realtor Profile Banner */}
      <div className="bg-neutral-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-5 relative z-10">
          <div className="relative">
            <AgentBrandAvatar
              photo={loggedInAgent.photo}
              name={loggedInAgent.name}
              size="lg"
              className="border-2 border-purple-500 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-neutral-950 text-[9px] font-black px-2 py-0.5 rounded-full border border-neutral-900 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-950 animate-pulse"></span>
              Онлайн
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">{loggedInAgent.name}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                {loggedInAgent.role || 'Аттестованный риэлтер'}
              </span>
            </div>
            <p className="text-xs text-stone-400 font-medium">
              ООО «АН Фаттория» • ID: <span className="font-mono text-stone-300">{loggedInAgent.id}</span>
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-300 pt-1 font-mono">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-purple-400" />
                {loggedInAgent.phone || '+375 29 638-00-53'}
              </span>
              <span className="text-stone-600">•</span>
              <span className="text-stone-400">
                Закреплено объектов: <strong className="text-purple-300">{myObjects.length}</strong>
              </span>
              <span className="text-stone-600">•</span>
              <span className="text-stone-400">
                Совпадений с покупателями: <strong className="text-emerald-400">{matches.length}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => onOpenInstitutionalRequests?.()}
            className="bg-white hover:bg-stone-100 text-neutral-950 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all cursor-pointer border border-stone-200"
            title="Официальные запросы в БТИ, ЗАГС, Опеку, ПНД, НД по законодательству РБ"
          >
            <FileText className="w-4 h-4 text-purple-600" />
            <span>Запросы в инстанции</span>
          </button>

          <button
            onClick={() => setIsAddBuyerModalOpen(true)}
            className="bg-purple-500 hover:bg-purple-400 text-neutral-950 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Новый покупатель</span>
          </button>

          <button
            onClick={onLogout}
            className="bg-neutral-800 hover:bg-neutral-700 text-stone-300 hover:text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors cursor-pointer border border-neutral-700"
          >
            Выйти
          </button>
        </div>
      </div>

      {/* THREE MAIN TABS NAVIGATION */}
      <div className="bg-white rounded-2xl p-1.5 border border-stone-200 shadow-xs flex items-center gap-2">
        <button
          onClick={() => setActiveTab('my-objects')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'my-objects'
              ? 'bg-neutral-950 text-white shadow-md'
              : 'text-stone-600 hover:text-neutral-950 hover:bg-stone-50'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Мои объекты ({myObjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('buyers')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'buyers'
              ? 'bg-neutral-950 text-white shadow-md'
              : 'text-stone-600 hover:text-neutral-950 hover:bg-stone-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>База покупателей ({buyersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
            activeTab === 'matches'
              ? 'bg-neutral-950 text-white shadow-md'
              : 'text-stone-600 hover:text-neutral-950 hover:bg-stone-50'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Совпадения ({matches.length})</span>
          {matches.length > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: МОИ ОБЪЕКТЫ */}
      {/* ========================================================================= */}
      {activeTab === 'my-objects' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-neutral-950">📋 Мои объекты</h2>
                <span className="text-xs bg-purple-50 text-purple-700 font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                  В работе: {filteredMyObjects.length}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Кликните на любой объект, чтобы открыть его страницу, сформировать КП для клиента или отправить предложение в мессенджеры.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск по адресу, названию, ID..."
                value={objectSearch}
                onChange={(e) => setObjectSearch(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:border-purple-500 font-medium"
              />
            </div>
          </div>

          {filteredMyObjects.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-stone-200 text-center space-y-3">
              <Building className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-neutral-800">
                {objectSearch ? 'Объекты не найдены по запросу' : 'У вас пока нет прикрепленных объектов'}
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Администратор системы прикрепляет объекты к вашему профилю в общем каталоге агентства.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMyObjects.map((property) => {
                const objectMatches = matches.filter(m => m.property.id === property.id);
                const photo = property.photo || property.image || (property.photos && property.photos[0]) || '/logo.png';
                const priceUSD = property.priceUSD || (property.priceBYN ? Math.round(property.priceBYN / nbrbRate) : 0);
                const priceBYN = property.priceBYN || (property.priceUSD ? Math.round(property.priceUSD * nbrbRate) : 0);

                return (
                  <div
                    key={property.id}
                    className="bg-white rounded-3xl overflow-hidden border border-stone-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div 
                        onClick={() => handleOpenProperty(property)}
                        className="relative h-56 bg-stone-900 overflow-hidden cursor-pointer"
                      >
                        <img
                          src={photo}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo.png';
                            (e.target as HTMLImageElement).className = 'w-full h-full object-contain p-6 bg-stone-900';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                        <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                          <span>{property.rooms ? `${property.rooms}-комн.` : 'Объект'}</span>
                          <span>•</span>
                          <span>{property.area} м²</span>
                        </div>

                        {objectMatches.length > 0 && (
                          <div className="absolute top-3 right-3 bg-purple-500 text-neutral-950 text-[10px] font-black px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            <span>{objectMatches.length} покупателей</span>
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-white">
                          <div>
                            <span className="text-lg font-black font-mono">
                              {priceBYN.toLocaleString('ru-RU')} BYN
                            </span>
                            {priceUSD > 0 && (
                              <span className="text-xs text-stone-300 ml-2 font-mono">
                                (${priceUSD.toLocaleString('ru-RU')})
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded font-mono">
                            ID: {property.id}
                          </span>
                        </div>
                      </div>

                      <div 
                        onClick={() => handleOpenProperty(property)}
                        className="p-5 space-y-3 cursor-pointer"
                      >
                        <div>
                          <h4 className="text-sm font-bold text-neutral-950 leading-snug line-clamp-2 group-hover:text-purple-600 transition-colors">
                            {property.title}
                          </h4>
                          <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span className="truncate">{property.address || property.location || 'г. Минск'}</span>
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 pt-2 border-t border-stone-100 font-medium">
                          <div>
                            <span className="text-stone-400 block text-[10px]">Район:</span>
                            <span className="font-bold text-neutral-800 truncate block">
                              {property.district || 'Центральный'}
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-400 block text-[10px]">Этаж:</span>
                            <span className="font-bold text-neutral-800">
                              {property.floor ? `${property.floor}/${property.totalFloors || '—'}` : '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0 space-y-2 border-t border-stone-100 mt-2 pt-3">
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (onGenerateKP) {
                              onGenerateKP(property);
                            } else {
                              handleOpenSendKP(property);
                            }
                          }}
                          className="py-2.5 px-2 bg-purple-500 hover:bg-purple-400 text-neutral-950 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Сформировать коммерческое предложение (PDF / Презентация)"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Создать КП</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenSendKP(property)}
                          className="py-2.5 px-2 bg-neutral-950 hover:bg-neutral-800 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Отправить объект клиенту в WhatsApp, Telegram, Viber или SMS"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Отправить</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleOpenProperty(property)}
                          className="py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-700 text-[10px] font-bold rounded-lg transition-colors border border-stone-200 flex items-center justify-center gap-1"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>Открыть</span>
                        </button>

                        {onViewProperty && (
                          <button
                            type="button"
                            onClick={() => onViewProperty(property)}
                            className="py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-700 text-[10px] font-bold rounded-lg transition-colors border border-stone-200 flex items-center justify-center gap-1"
                          >
                            <span>На сайте</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenInstitutionalRequests?.(property)}
                        className="w-full py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/80 rounded-lg text-[10.5px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Подготовить официальные запросы в БТИ, ЗАГС, Опеку, ПНД по этому объекту"
                      >
                        <FileText className="w-3 h-3 text-purple-600" />
                        <span>Запрос в инстанции</span>
                      </button>

                      {objectMatches.length > 0 && (
                        <button
                          onClick={() => {
                            setSelectedPropertyForFilter(property.id);
                            setActiveTab('matches');
                          }}
                          className="w-full py-1.5 text-center text-[10px] font-bold text-purple-700 hover:text-purple-900 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Target className="w-3 h-3 text-purple-600" />
                          <span>Показать {objectMatches.length} покупателей под этот объект</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: БАЗА ПОКУПАТЕЛЕЙ */}
      {/* ========================================================================= */}
      {activeTab === 'buyers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-neutral-950">👥 База покупателей</h2>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Доступно клиентов: {buyersList.length}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Общая база потенциальных покупателей агентства. Вы можете просматривать запросы и отправлять подходящие КП в 1 клик.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Поиск покупателя, тел..."
                  value={buyerSearch}
                  onChange={(e) => setBuyerSearch(e.target.value)}
                  className="w-full sm:w-64 bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:bg-white focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <button
                onClick={() => setIsAddBuyerModalOpen(true)}
                className="bg-purple-500 hover:bg-purple-400 text-neutral-950 px-4 py-2 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Добавить покупателя</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-4 pl-6">Клиент</th>
                    <th className="p-4">Телефон</th>
                    <th className="p-4">Бюджет</th>
                    <th className="p-4">Параметры поиска</th>
                    <th className="p-4">Подходящий объект</th>
                    <th className="p-4 pr-6 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {filteredBuyers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-400">
                        Покупатели не найдены
                      </td>
                    </tr>
                  ) : (
                    filteredBuyers.map((buyer) => {
                      const matchedObjects = myObjects
                        .map(obj => checkMatch(buyer, obj))
                        .filter(m => m.score >= 70)
                        .sort((a, b) => b.score - a.score);

                      const bestMatch = matchedObjects[0];

                      return (
                        <tr key={buyer.id} className="hover:bg-purple-50/40 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="font-bold text-neutral-950 text-sm">{buyer.name}</div>
                            <div className="text-[10px] text-stone-400">
                              Внес: {buyer.registeredBy || 'Агентство'} • {buyer.dateAdded || 'Недавно'}
                            </div>
                          </td>

                          <td className="p-4">
                            <a
                              href={`tel:${buyer.phone}`}
                              className="font-mono font-bold text-neutral-900 hover:text-purple-600 transition-colors inline-flex items-center gap-1.5"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              {buyer.phone}
                            </a>
                          </td>

                          <td className="p-4">
                            <div className="font-mono font-black text-purple-700 text-sm">
                              {(buyer.budgetBYN || 0).toLocaleString('ru-RU')} BYN
                            </div>
                            {buyer.budgetUSD && (
                              <div className="font-mono text-[10px] text-stone-400">
                                ~${buyer.budgetUSD.toLocaleString('ru-RU')}
                              </div>
                            )}
                          </td>

                          <td className="p-4 max-w-xs">
                            <p className="text-xs text-stone-700 font-normal leading-relaxed">
                              {buyer.preferences || `${buyer.prefRooms || '2'}-комн., ${buyer.prefDistrict || 'Минск'}`}
                            </p>
                            {buyer.prefDistrict && (
                              <span className="inline-block mt-1 text-[10px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                                {buyer.prefDistrict}
                              </span>
                            )}
                          </td>

                          <td className="p-4">
                            {bestMatch ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 border border-purple-300 font-extrabold px-2.5 py-0.5 rounded-full text-[11px]">
                                  <Target className="w-3 h-3 text-purple-700" />
                                  {bestMatch.score}% совпадение
                                </span>
                                <p className="text-[10px] text-stone-500 truncate max-w-[180px]" title={bestMatch.property.title}>
                                  {bestMatch.property.title}
                                </p>
                              </div>
                            ) : (
                              <span className="text-[11px] text-stone-400">
                                Нет совпадений
                              </span>
                            )}
                          </td>

                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {bestMatch && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenSendKP(bestMatch.property, buyer)}
                                  className="px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-neutral-950 text-[10px] font-black uppercase rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                                  title="Отправить КП этому покупателю"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Отправить КП</span>
                                </button>
                              )}
                              <button
                                onClick={() => setEditingBuyer(buyer)}
                                className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors cursor-pointer"
                                title="Редактировать параметры"
                              >
                                <Edit2 className="w-4 h-4 text-stone-700" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: СОВПАДЕНИЯ */}
      {/* ========================================================================= */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-neutral-950">🎯 Совпадения с покупателями</h2>
                <span className="text-xs bg-purple-500 text-neutral-950 font-black px-2.5 py-0.5 rounded-full shadow-xs">
                  {matches.length} совпадений (≥ 70%)
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Система автоматически рассчитала совместимость ваших объектов с базой покупателей агентства.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {selectedPropertyForFilter && (
                <button
                  onClick={() => setSelectedPropertyForFilter(null)}
                  className="text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Сбросить фильтр объекта</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <select
                value={matchMinScore}
                onChange={(e) => setMatchMinScore(Number(e.target.value))}
                className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-neutral-800 focus:outline-none focus:border-purple-500"
              >
                <option value={70}>Мин. совпадение: 70%+</option>
                <option value={80}>Мин. совпадение: 80%+</option>
                <option value={90}>Идеальное: 90%+</option>
              </select>
            </div>
          </div>

          {filteredMatches.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-stone-200 text-center space-y-3">
              <Target className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-neutral-800">
                Совпадений с порогом {matchMinScore}% не найдено
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Добавьте новых покупателей в базу или измените критерии поиска.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMatches.map((match, idx) => {
                const { buyer, property, score } = match;

                return (
                  <div
                    key={`${buyer.id}-${property.id}-${idx}`}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 hover:border-purple-400 hover:shadow-md transition-all duration-300 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1.5 rounded-xl font-black text-sm flex items-center gap-1.5 ${
                          score >= 90
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : score >= 80
                            ? 'bg-purple-500 text-neutral-950'
                            : 'bg-blue-500 text-white'
                        }`}>
                          <Target className="w-4 h-4" />
                          <span>{score}% совпадение</span>
                        </div>

                        <span className="text-xs font-bold text-stone-600">
                          Подходящий покупатель для вашего объекта
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenSendKP(property, buyer)}
                          className="bg-purple-500 hover:bg-purple-400 text-neutral-950 font-black text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Отправить КП клиенту</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (onGenerateKP) {
                              onGenerateKP(property);
                            } else {
                              handleOpenSendKP(property, buyer);
                            }
                          }}
                          className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-purple-600" />
                          <span>PDF КП</span>
                        </button>

                        <a
                          href={`tel:${buyer.phone}`}
                          className="bg-neutral-950 hover:bg-neutral-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{buyer.phone}</span>
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                        <div className="text-[10px] uppercase font-bold text-stone-400">
                          Запрос покупателя ({buyer.name})
                        </div>
                        <div className="font-bold text-sm text-neutral-900">
                          Бюджет: {(buyer.budgetBYN || 0).toLocaleString('ru-RU')} BYN {buyer.budgetUSD ? `(~${buyer.budgetUSD.toLocaleString('ru-RU')} $)` : ''}
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed">
                          {buyer.preferences || `${buyer.prefRooms || '2'}-комн., район: ${buyer.prefDistrict || 'Минск'}`}
                        </p>
                      </div>

                      <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-2">
                        <div className="text-[10px] uppercase font-bold text-purple-700">
                          Ваш объект недвижимости
                        </div>
                        <div className="font-bold text-sm text-neutral-900">
                          {property.title}
                        </div>
                        <div className="text-xs text-stone-600">
                          {property.address} • {property.rooms}-комн. • {property.area} м² • {(property.priceBYN || 0).toLocaleString('ru-RU')} BYN
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INSTANT SEND KP TO CLIENT */}
      {/* ========================================================================= */}
      {sendKpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 my-8 animate-scale-in">
            
            <div className="bg-neutral-900 text-white p-5 flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500 text-neutral-950 flex items-center justify-center font-black">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    Отправить предложение клиенту
                  </h3>
                  <p className="text-[10px] text-stone-400 truncate max-w-[280px]">
                    {sendKpModal.property.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSendKpModal(null)}
                className="p-2 text-stone-400 hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                    Имя клиента
                  </label>
                  <input
                    type="text"
                    placeholder="Алексей"
                    value={sendTargetName}
                    onChange={(e) => setSendTargetName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                    Номер телефона клиента
                  </label>
                  <input
                    type="tel"
                    placeholder="+375 (29) 123-45-67"
                    value={sendTargetPhone}
                    onChange={(e) => setSendTargetPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                  Сопроводительный текст для клиента
                </label>
                <textarea
                  rows={3}
                  value={sendCustomNote}
                  onChange={(e) => setSendCustomNote(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs leading-relaxed focus:bg-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5 font-mono text-[11px] text-stone-700 max-h-36 overflow-y-auto">
                <div className="text-[9px] uppercase font-bold text-stone-400 font-sans">
                  Предварительный просмотр сообщения:
                </div>
                <div className="whitespace-pre-line">
                  {getProposalText(sendKpModal.property, sendCustomNote)}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-[10px] uppercase font-black text-stone-500">
                  Выберите способ отправки:
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendTelegram(sendKpModal.property)}
                    className="p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendWhatsApp(sendKpModal.property)}
                    className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendViber(sendKpModal.property)}
                    className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Viber</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopyFullText(sendKpModal.property)}
                    className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-neutral-800 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedText ? '✓ Скопировано' : 'Копировать текст'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(sendKpModal.property)}
                    className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-neutral-800 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedLink ? '✓ Ссылка скопирована' : 'Копировать ссылку'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    const prop = sendKpModal.property;
                    setSendKpModal(null);
                    if (onGenerateKP) {
                      onGenerateKP(prop);
                    }
                  }}
                  className="w-full py-2.5 bg-neutral-950 hover:bg-purple-500 hover:text-neutral-950 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Открыть расширенный генератор PDF КП</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW BUYER */}
      {/* ========================================================================= */}
      {isAddBuyerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-neutral-950">➕ Новый покупатель</h3>
                <p className="text-xs text-stone-500">Добавьте клиента для автоматического подбора объектов</p>
              </div>
              <button
                onClick={() => setIsAddBuyerModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBuyer} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 mb-1">ФИО / Имя покупателя *</label>
                <input
                  type="text"
                  required
                  placeholder="Иван Петров"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">Телефон *</label>
                <input
                  type="tel"
                  required
                  placeholder="+375 (29) 123-45-67"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-mono focus:bg-white focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">Количество комнат</label>
                  <select
                    value={buyerRooms}
                    onChange={(e) => setBuyerRooms(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-bold focus:bg-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="1">1-комнатная</option>
                    <option value="2">2-комнатная</option>
                    <option value="3">3-комнатная</option>
                    <option value="4">4+-комнатная</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 mb-1">Желаемый район</label>
                  <select
                    value={buyerDistrict}
                    onChange={(e) => setBuyerDistrict(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-bold focus:bg-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Первомайский">Первомайский</option>
                    <option value="Советский">Советский</option>
                    <option value="Центральный">Центральный</option>
                    <option value="Московский">Московский</option>
                    <option value="Фрунзенский">Фрунзенский</option>
                    <option value="Октябрьский">Октябрьский</option>
                    <option value="Ленинский">Ленинский</option>
                    <option value="Заводской">Заводской</option>
                    <option value="Партизанский">Партизанский</option>
                    <option value="Минский район">Минский район</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">Мин. площадь (м²)</label>
                  <input
                    type="number"
                    value={buyerMinArea}
                    onChange={(e) => setBuyerMinArea(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">Макс. площадь (м²)</label>
                  <input
                    type="number"
                    value={buyerMaxArea}
                    onChange={(e) => setBuyerMaxArea(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">
                  Максимальный бюджет (BYN) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="250000"
                  value={buyerBudgetBYN}
                  onChange={(e) => setBuyerBudgetBYN(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-mono font-bold text-sm focus:bg-white focus:outline-none focus:border-purple-500"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  ~ ${(Math.round((parseFloat(buyerBudgetBYN) || 0) / nbrbRate)).toLocaleString('ru-RU')} по курсу НБРБ
                </span>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">Пожелания / Комментарий</label>
                <textarea
                  rows={2}
                  placeholder="Только кирпич, не первый этаж, балкон обязателен..."
                  value={buyerPreferences}
                  onChange={(e) => setBuyerPreferences(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 font-medium focus:bg-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddBuyerModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-500 hover:bg-purple-400 text-neutral-950 font-black rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Добавить и проверить совпадения
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT BUYER */}
      {/* ========================================================================= */}
      {editingBuyer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-neutral-950">✏️ Редактировать покупателя</h3>
                <p className="text-xs text-stone-500">ID: {editingBuyer.id}</p>
              </div>
              <button
                onClick={() => setEditingBuyer(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const updated = buyersList.map(b => b.id === editingBuyer.id ? editingBuyer : b);
                setBuyersList(updated);
                localStorage.setItem('fp_crm_buyers', JSON.stringify(updated));
                setEditingBuyer(null);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-neutral-800 mb-1">ФИО / Имя *</label>
                <input
                  type="text"
                  required
                  value={editingBuyer.name}
                  onChange={(e) => setEditingBuyer({ ...editingBuyer, name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-medium focus:bg-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">Телефон *</label>
                <input
                  type="tel"
                  required
                  value={editingBuyer.phone}
                  onChange={(e) => setEditingBuyer({ ...editingBuyer, phone: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-mono font-bold focus:bg-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">Количество комнат</label>
                  <select
                    value={editingBuyer.prefRooms || 2}
                    onChange={(e) => setEditingBuyer({ ...editingBuyer, prefRooms: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-bold focus:bg-white focus:outline-none focus:border-purple-500"
                  >
                    <option value={1}>1-комнатная</option>
                    <option value={2}>2-комнатная</option>
                    <option value={3}>3-комнатная</option>
                    <option value={4}>4+-комнатная</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 mb-1">Желаемый район</label>
                  <select
                    value={editingBuyer.prefDistrict || 'Первомайский'}
                    onChange={(e) => setEditingBuyer({ ...editingBuyer, prefDistrict: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-bold focus:bg-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Первомайский">Первомайский</option>
                    <option value="Советский">Советский</option>
                    <option value="Центральный">Центральный</option>
                    <option value="Московский">Московский</option>
                    <option value="Фрунзенский">Фрунзенский</option>
                    <option value="Октябрьский">Октябрьский</option>
                    <option value="Ленинский">Ленинский</option>
                    <option value="Заводской">Заводской</option>
                    <option value="Партизанский">Партизанский</option>
                    <option value="Минский район">Минский район</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">
                  Максимальный бюджет (BYN) *
                </label>
                <input
                  type="number"
                  required
                  value={editingBuyer.budgetBYN}
                  onChange={(e) => {
                    const byn = parseFloat(e.target.value) || 0;
                    setEditingBuyer({
                      ...editingBuyer,
                      budgetBYN: byn,
                      budgetUSD: Math.round(byn / nbrbRate)
                    });
                  }}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-mono font-bold text-sm focus:bg-white focus:outline-none focus:border-purple-500"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  ~ ${(editingBuyer.budgetUSD || Math.round((editingBuyer.budgetBYN || 0) / nbrbRate)).toLocaleString('ru-RU')} по курсу НБРБ
                </span>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">Пожелания / Комментарий</label>
                <textarea
                  rows={2}
                  value={editingBuyer.preferences || ''}
                  onChange={(e) => setEditingBuyer({ ...editingBuyer, preferences: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 font-medium focus:bg-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingBuyer(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-500 hover:bg-purple-400 text-neutral-950 font-black rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Сохранить изменения
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INSTANT MATCH ALERT */}
      {/* ========================================================================= */}
      {newMatchAlert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border-2 border-purple-500 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-purple-500 text-neutral-950 rounded-xl font-black">
                  <Target className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-neutral-950">🔔 Новое совпадение!</h3>
                  <span className="text-xs font-bold text-purple-700">
                    Совместимость: {newMatchAlert.score}%
                  </span>
                </div>
              </div>
              <button
                onClick={() => setNewMatchAlert(null)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-1">
                <p className="text-[10px] uppercase font-bold text-stone-400">Покупатель:</p>
                <p className="text-sm font-black text-neutral-950">{newMatchAlert.buyer.name}</p>
                <p className="text-stone-600">
                  Ищет: {newMatchAlert.buyer.prefRooms || '2'}-комн., район {newMatchAlert.buyer.prefDistrict || 'Центральный'}
                </p>
                <p className="font-mono font-bold text-neutral-900">
                  Бюджет: {(newMatchAlert.buyer.budgetBYN || 0).toLocaleString('ru-RU')} BYN
                </p>
              </div>

              <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-300/60 space-y-1">
                <p className="text-[10px] uppercase font-bold text-purple-700">Ваш объект:</p>
                <p className="text-sm font-black text-neutral-950">{newMatchAlert.property.title}</p>
                <p className="text-stone-600">
                  {newMatchAlert.property.address} • {newMatchAlert.property.rooms}-комн. ({newMatchAlert.property.area} м²)
                </p>
                <p className="font-mono font-black text-neutral-950">
                  Цена: {(newMatchAlert.property.priceBYN || 0).toLocaleString('ru-RU')} BYN
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setNewMatchAlert(null);
                  setActiveTab('matches');
                }}
                className="w-full py-3 bg-neutral-950 hover:bg-purple-500 hover:text-neutral-950 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Target className="w-4 h-4" />
                <span>Перейти к совпадениям</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};