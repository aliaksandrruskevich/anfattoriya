"use client";
import React, { useState } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneForwarded,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Building2,
  DollarSign,
  Send,
  Plus,
  BookOpen,
  Calendar,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Target,
  Search,
  Filter,
  Check,
  Users,
  Settings,
  ExternalLink
} from 'lucide-react';
import { Property, Buyer, Seller, Agent } from '../types';
import { TelegramBotModal } from './TelegramBotModal';

interface CallCenterWorkspaceProps {
  onAddSeller: (newSeller: Partial<Seller>) => void;
  onAddBuyer: (newBuyer: Partial<Buyer>) => void;
  buyersList: Buyer[];
  propertiesList: Property[];
  agentName?: string;
  isAdmin?: boolean;
  agentsList?: Agent[];
}

interface CallRecord {
  id: string;
  clientName: string;
  clientPhone: string;
  role: 'seller' | 'buyer';
  result: 'meeting_set' | 'callback' | 'offer_sent' | 'no_answer' | 'refused';
  comment: string;
  callbackDate?: string;
  timestamp: string;
  operatorName: string;
  messengerChannel?: 'telegram' | 'viber' | 'whatsapp' | 'all';
}

export const CallCenterWorkspace: React.FC<CallCenterWorkspaceProps> = ({
  onAddSeller,
  onAddBuyer,
  buyersList,
  propertiesList,
  agentName = 'Оператор колл-центра',
  isAdmin = false,
  agentsList = []
}) => {
  // Call Center State
  const [activeCallRole, setActiveCallRole] = useState<'seller' | 'buyer'>('seller');
  const [scriptStep, setScriptStep] = useState<number>(1);
  const [operatorStatus, setOperatorStatus] = useState<'online' | 'break' | 'offline'>('online');
  const [operatorFilter, setOperatorFilter] = useState<string>('all');
  const [showTgModal, setShowTgModal] = useState<boolean>(false);
  const [selectedMessenger, setSelectedMessenger] = useState<'all' | 'telegram' | 'viber' | 'whatsapp'>('all');

  // Interactive Call Lead Intake Form State
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('+375 ');
  const [leadType, setLeadType] = useState<'apartment' | 'house' | 'commercial' | 'plot'>('apartment');
  const [leadPriceBYN, setLeadPriceBYN] = useState('');
  const [leadRooms, setLeadRooms] = useState('2');
  const [leadDistrict, setLeadDistrict] = useState('Первомайский район');
  const [leadNotes, setLeadNotes] = useState('');
  const [leadSuccessMsg, setLeadSuccessMsg] = useState<string | null>(null);

  // Script Checklist Answers
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});

  // Objections Matrix State
  const [objectionSearch, setObjectionSearch] = useState('');
  const [selectedObjectionCat, setSelectedObjectionCat] = useState<'all' | 'commission' | 'self_sale' | 'exclusive' | 'price' | 'timing'>('all');
  const [expandedObjectionId, setExpandedObjectionId] = useState<string | null>('obj-1');

  // Call Logs State with persistence and per-agent association
  const [callLogs, setCallLogs] = useState<CallRecord[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('fp_call_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse fp_call_logs", e);
      }
    }
    return [
      {
        id: 'call-1',
        clientName: 'Виктор Михайлович',
        clientPhone: '+375 29 123-45-67',
        role: 'seller',
        result: 'meeting_set',
        comment: 'Продает 3к на Независимости. Согласован выезд риэлтора завтра в 15:00.',
        callbackDate: '2026-07-31 15:00',
        timestamp: '11:42',
        operatorName: 'Белюк Жанна'
      },
      {
        id: 'call-2',
        clientName: 'Анна Сергеевна',
        clientPhone: '+375 44 987-65-43',
        role: 'buyer',
        result: 'offer_sent',
        comment: 'Ищет 2к квартиру в Минск-Мир до 220 000 BYN. Отправлено КП в Telegram.',
        timestamp: '11:15',
        operatorName: 'Белюк Жанна'
      },
      {
        id: 'call-3',
        clientName: 'Дмитрий Н.',
        clientPhone: '+375 25 555-12-34',
        role: 'seller',
        result: 'callback',
        comment: 'Занят на совещании. Попросил перезвонить после 18:00.',
        callbackDate: '2026-07-30 18:00',
        timestamp: '10:30',
        operatorName: 'Романова Светлана'
      },
      {
        id: 'call-4',
        clientName: 'Олег Васильевич',
        clientPhone: '+375 29 777-88-99',
        role: 'buyer',
        result: 'meeting_set',
        comment: 'Подбор 1-комнатной квартиры под аренду. Бюджет $55,000.',
        timestamp: '09:45',
        operatorName: 'Волков Сергей'
      }
    ];
  });

  const saveLogs = (logs: CallRecord[]) => {
    setCallLogs(logs);
    localStorage.setItem('fp_call_logs', JSON.stringify(logs));
  };

  const toggleQuestion = (id: string) => {
    setCheckedQuestions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Quick Lead Registration
  const handleRegisterLead = () => {
    if (!leadName.trim() || !leadPhone.trim() || leadPhone.length < 7) {
      alert('Пожалуйста, укажите имя и контактный телефон клиента!');
      return;
    }

    const priceNum = parseInt(leadPriceBYN, 10) || 200000;
    const priceUSD = Math.round(priceNum / 3.27);

    if (activeCallRole === 'seller') {
      const newSellerRecord: Partial<Seller> = {
        id: 'seller-' + Date.now(),
        name: leadName,
        phone: leadPhone,
        propertyType: leadType,
        address: `г. Минск, ${leadDistrict}`,
        askingPriceBYN: priceNum,
        askingPriceUSD: priceUSD,
        status: 'active',
        kanbanStage: 'primary_contact',
        notes: `[Заявка из Колл-Центра] Комнат: ${leadRooms}. Детали: ${leadNotes}`,
        dateAdded: new Date().toISOString().slice(0, 10),
      };
      onAddSeller(newSellerRecord);
      setLeadSuccessMsg(`Продавец ${leadName} успешно занесен в базу CRM! Назначен первичный прозвон.`);
    } else {
      const newBuyerRecord: Partial<Buyer> = {
        id: 'buyer-' + Date.now(),
        name: leadName,
        phone: leadPhone,
        budgetBYN: priceNum,
        budgetUSD: priceUSD,
        preferences: `Ищет ${leadType === 'apartment' ? `${leadRooms}-комн квартиру` : leadType === 'house' ? 'дом' : leadType === 'commercial' ? 'коммерцию' : 'участок'} в ${leadDistrict}. ${leadNotes}`,
        registeredBy: agentName,
        status: 'searching',
        isPublicApproved: false,
        isPublishedOnSite: false,
        crmOnly: true,
        prefType: leadType,
        prefRooms: parseInt(leadRooms, 10) || undefined,
        prefDistrict: leadDistrict,
      };
      onAddBuyer(newBuyerRecord);
      setLeadSuccessMsg(`Покупатель ${leadName} успешно создан и подключен к Смарт-Подбору объектов!`);
    }

    // Record Call Log
    const newLog: CallRecord = {
      id: 'call-' + Date.now(),
      clientName: leadName,
      clientPhone: leadPhone,
      role: activeCallRole,
      result: 'meeting_set',
      comment: leadNotes || `Новая заявка занесена в CRM (${activeCallRole === 'seller' ? 'Продавец' : 'Покупатель'})`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      operatorName: agentName
    };
    saveLogs([newLog, ...callLogs]);

    // Dispatch to Telegram if selected
    if (selectedMessenger === 'all' || selectedMessenger === 'telegram') {
      fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadName,
          phone: leadPhone,
          typeOrPrice: `${activeCallRole === 'seller' ? 'Продажа' : 'Покупка'}: ${priceNum.toLocaleString()} BYN (${leadType}, ${leadDistrict})`,
          formName: `Колл-центр CRM [Канал: ${selectedMessenger.toUpperCase()}] (Оператор: ${agentName || 'Дежурный'})`,
          extra: leadNotes || undefined,
        })
      }).catch(err => console.warn('CallCenter TG dispatch error:', err));
    }

    // Reset Form
    setLeadName('');
    setLeadPhone('+375 ');
    setLeadPriceBYN('');
    setLeadNotes('');
    setTimeout(() => setLeadSuccessMsg(null), 4000);
  };

  // Objections Database
  const objections = [
    {
      id: 'obj-1',
      category: 'commission',
      title: '«Почему у вас такая высокая комиссия за риэлтерские услуги?»',
      quickAnswer: 'Комиссия регламентирована Постановлением Совмина РБ и гарантирует полную юридическую защиту, рекламный бюджет и профессиональную организацию сделки.',
      fullScript: `«Понимаю ваше желание сэкономить! Однако наша комиссия строго зафиксирована государственными тарифами Республики Беларусь (Постановление Совмина РБ). За эти деньги вы получаете не просто размещение объявлений, а полную защиту от мошенников, бесплатный клининг и хоум-стейджинг, профессиональные фото и видео 360°, юридическую проверку каждого покупателя и сопровождение сделки в банке и БТИ. По статистике, объекты с нашей предпродажной подготовкой продаются на 4-6% дороже рынка — что полностью перекрывает стоимость услуг!»`
    },
    {
      id: 'obj-2',
      category: 'self_sale',
      title: '«Я сам прекрасно продам квартиру без агентств и риэлтеров!»',
      quickAnswer: 'Самостоятельная продажа отнимает десятки часов на звонки риэлтеров-агентов, а без проверки истории есть риски оспоримости сделки.',
      fullScript: `«Отличное решение, если у вас есть время принимать по 30 звонков в день (в основном от других агентов) и готовить пакет документов для БТИ и нотариуса. Но вы знали, что 82% покупателей с готовыми наличными деньгами обращаются именно в агентство «АН Фаттория»? Мы можем предложить вам тест-драйв: мы показываем ваш объект нашей готовой базе покупателей в течение 10 дней БЕЗ подписания эксклюзива. Если продадим — вы в плюсе, если нет — вы ничего не теряете!»`
    },
    {
      id: 'obj-3',
      category: 'exclusive',
      title: '«Я не хочу заключать эксклюзивный договор с одним агентством!»',
      quickAnswer: 'При неэксклюзиве агентства снижают цену, соревнуясь друг с другом, создавая демпинг на рынке.',
      fullScript: `«Когда квартира висит у 5 разных агентств с разными ценами, у покупателя возникает ощущение, что с объектом что-то не так или продавец отчаянно ищет деньги. Покупатели начинаются сбивать цену! Эксклюзивный договор — это единый центр управления продажей: максимальная цена на рынке, один ответственный эксперт и прозрачная отчётность каждую неделю. Мы вкладываем собственный рекламный бюджет в ваш объект только при эксклюзиве!»`
    },
    {
      id: 'obj-4',
      category: 'price',
      title: '«Моя квартира стоит дороже! На Realt аналоги стоят на $10,000 больше»',
      quickAnswer: 'Цены на Realt — это «хотелки» продавцов, а не цены реальных совершенных сделок в БТИ.',
      fullScript: `«Вы совершенно правы, цены в объявлениях на порталах часто завышены на 8-12%. Это так называемые "цены предложения". Но наш аналитический отдел опирается на реестр реальных совершенных сделок Национального кадастрового агентства (НКА). Если выставить квартиру по цене предложения, она простоит 6-9 месяцев и обесценится. Мы предлагаем сделать бесплатную профессиональную экспресс-оценку с реальными цифрами сделок в вашем микрорайоне за последний месяц!»`
    },
    {
      id: 'obj-5',
      category: 'timing',
      title: '«Мне нужно подумать / Я посоветуюсь с родственниками»',
      quickAnswer: 'Фиксируем удобное время для короткого повторного звонка с конкретной аналитической справкой.',
      fullScript: `«Конечно! Покупка или продажа недвижимости — важное финансовое решение. Давайте я отправлю вам на WhatsApp/Telegram краткую аналитическую презентацию по вашему району с готовой подборкой вариантов и расчетом расходов. Когда вам будет удобно, если я наберу завтра в 14:00 или в 17:00, чтобы обсудить мысли?»`
    }
  ];

  const filteredObjections = objections.filter(o => {
    const matchesCat = selectedObjectionCat === 'all' || o.category === selectedObjectionCat;
    const matchesSearch = o.title.toLowerCase().includes(objectionSearch.toLowerCase()) ||
                          o.fullScript.toLowerCase().includes(objectionSearch.toLowerCase()) ||
                          o.quickAnswer.toLowerCase().includes(objectionSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans text-neutral-900">
      
      {/* Workspace Header & Shift Status */}
      <div className="bg-gradient-to-r from-stone-900 via-neutral-900 to-purple-950 text-white rounded-2xl p-5 shadow-lg border border-purple-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded border border-purple-400/20">
                  Модуль Колл-Центра CRM
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  Оператор: <strong className="text-white">{agentName}</strong>
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5 tracking-tight">
                Рабочее место оператора входящих & исходящих звонков
              </h2>
            </div>
          </div>

          {/* Operator Status Indicator & Shift Buttons & Telegram Bot Settings */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowTgModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/40 text-purple-200 hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Настройки Telegram Бота и привязка каналов"
            >
              <Settings className="w-3.5 h-3.5 text-purple-400" />
              <span>Telegram-Бот (@anfattoria_bot)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>

            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-xl backdrop-blur-md">
              <div className="flex items-center gap-2 px-2">
                <span className={`w-3 h-3 rounded-full ${
                  operatorStatus === 'online' ? 'bg-emerald-500 animate-ping' :
                  operatorStatus === 'break' ? 'bg-purple-500' : 'bg-rose-500'
                }`} />
                <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">
                  {operatorStatus === 'online' ? '🟢 На линии' : operatorStatus === 'break' ? '🟡 Перерыв' : '🔴 Не на месте'}
                </span>
              </div>
              <div className="flex items-center gap-1 border-l border-white/15 pl-2">
                <button
                  onClick={() => setOperatorStatus('online')}
                  className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                    operatorStatus === 'online' ? 'bg-emerald-500 text-neutral-950 shadow-md' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  В сети
                </button>
                <button
                  onClick={() => setOperatorStatus('break')}
                  className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                    operatorStatus === 'break' ? 'bg-purple-500 text-neutral-950 shadow-md' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Перерыв
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Operator KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-[9px] text-stone-400 uppercase font-black block tracking-wider">Звонков сегодня</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-purple-400 font-mono">24</span>
              <span className="text-[10px] text-emerald-400 font-bold">+6 к норме</span>
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-[9px] text-stone-400 uppercase font-black block tracking-wider">Назначено встреч</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400 font-mono">6</span>
              <span className="text-[10px] text-stone-400 font-medium">цель: 8</span>
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-[9px] text-stone-400 uppercase font-black block tracking-wider">Создано лидов в CRM</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-cyan-400 font-mono">9</span>
              <span className="text-[10px] text-stone-400 font-medium">база обновлена</span>
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-[9px] text-stone-400 uppercase font-black block tracking-wider">Конверсия вызовов</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-purple-300 font-mono">25.0%</span>
              <span className="text-[10px] text-emerald-400 font-bold">топ результат</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT & CENTER COLUMN: Interactive Script & Quick Lead Intake (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Mode Switcher: Seller vs Buyer Call */}
          <div className="bg-white border border-stone-200 rounded-2xl p-2.5 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={() => {
                  setActiveCallRole('seller');
                  setScriptStep(1);
                }}
                className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeCallRole === 'seller'
                    ? 'bg-purple-500 text-neutral-950 shadow-md ring-2 ring-purple-500/30'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Звонок ПРОДАВЦУ (Собственник)</span>
              </button>

              <button
                onClick={() => {
                  setActiveCallRole('buyer');
                  setScriptStep(1);
                }}
                className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeCallRole === 'buyer'
                    ? 'bg-neutral-900 text-purple-400 shadow-md ring-2 ring-neutral-900/30'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span>Звонок ПОКУПАТЕЛЮ (Инвестор)</span>
              </button>
            </div>
          </div>

          {/* Interactive Call Script Stepper */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-150 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-black text-sm text-neutral-900 uppercase tracking-wider">
                    Интерактивный сценарий разговора оператора
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Направление: <strong className="text-purple-600">{activeCallRole === 'seller' ? 'Разговор с Продавцом объекта' : 'Разговор с Покупателем недвижимости'}</strong>
                  </p>
                </div>
              </div>

              {/* Step indicator pills */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map(step => (
                  <button
                    key={step}
                    onClick={() => setScriptStep(step)}
                    className={`w-7 h-7 rounded-lg text-xs font-black font-mono transition-all cursor-pointer ${
                      scriptStep === step
                        ? 'bg-purple-500 text-neutral-950 shadow-sm scale-105'
                        : scriptStep > step
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    {step}
                  </button>
                ))}
              </div>
            </div>

            {/* SCRIPT CONTENT BY STEPS */}
            {activeCallRole === 'seller' ? (
              // SELLER CALL SCRIPTS
              <div className="space-y-4">
                {scriptStep === 1 && (
                  <div className="space-y-3 bg-purple-50/60 border border-purple-200/80 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-black tracking-widest text-purple-800 bg-purple-200/60 px-2 py-0.5 rounded">
                        Этап 1 из 4: Приветствие & Представление
                      </span>
                    </div>
                    <p className="text-xs text-stone-800 font-medium leading-relaxed">
                      «Здравствуйте! Меня зовут <strong className="text-purple-900">{agentName}</strong>, агентство недвижимости «АН Фаттория». Звоню по поводу вашей недвижимости на сайте. Удобно сейчас говорить минуту?»
                    </p>
                    <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between">
                      <span className="text-[11px] text-stone-500 italic">Если говорит "Да, удобно": переходите к вылову параметров.</span>
                      <button
                        onClick={() => setScriptStep(2)}
                        className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-neutral-950 font-black text-xs rounded-lg transition-colors flex items-center gap-1"
                      >
                        Далее к квалификации <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {scriptStep === 2 && (
                  <div className="space-y-3 bg-stone-50 border border-stone-200 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-black tracking-widest text-neutral-800 bg-stone-200 px-2 py-0.5 rounded">
                        Этап 2 из 4: Квалификация и Мотивация Продавца
                      </span>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!checkedQuestions['q1']}
                          onChange={() => toggleQuestion('q1')}
                          className="rounded text-purple-500 focus:ring-purple-500"
                        />
                        <span>1. Вы являетесь собственником объекта? Сколько человек прописано?</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!checkedQuestions['q2']}
                          onChange={() => toggleQuestion('q2')}
                          className="rounded text-purple-500 focus:ring-purple-500"
                        />
                        <span>2. Есть ли альтернативная покупка (взамен) или просто чистая продажа?</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!checkedQuestions['q3']}
                          onChange={() => toggleQuestion('q3')}
                          className="rounded text-purple-500 focus:ring-purple-500"
                        />
                        <span>3. Какая окончательная стоимость в белорусских рублях зафиксирована?</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!checkedQuestions['q4']}
                          onChange={() => toggleQuestion('q4')}
                          className="rounded text-purple-500 focus:ring-purple-500"
                        />
                        <span>4. Когда планируете завершить сделку (срочно / в течение месяца)?</span>
                      </label>
                    </div>
                    <div className="pt-2 border-t border-stone-200 flex justify-between">
                      <button onClick={() => setScriptStep(1)} className="text-xs text-stone-500 hover:text-stone-800">Назад</button>
                      <button onClick={() => setScriptStep(3)} className="px-3 py-1.5 bg-purple-500 text-neutral-950 font-black text-xs rounded-lg flex items-center gap-1">
                        Презентация УТП <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {scriptStep === 3 && (
                  <div className="space-y-3 bg-stone-900 text-white p-4 rounded-xl border border-purple-500/30">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-black tracking-widest text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded border border-purple-400/20">
                        Этап 3 из 4: Презентация преимуществ «АН Фаттория»
                      </span>
                    </div>
                    <div className="space-y-2 text-xs text-stone-300 leading-relaxed">
                      <p>«Отлично! У нас в CRM-базе агентства сейчас прямо под ваш район зарегистрированы покупатели с готовым капиталом в BYN.»</p>
                      <div className="bg-white/5 p-3 rounded-lg border border-white/10 space-y-1.5 text-[11px]">
                        <div className="flex items-center gap-2 text-purple-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>10 дней тест-драйва без эксклюзива</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Бесплатная предпродажная подготовка и фотосессия</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Юридическая проверка в БТИ и полная защита от рисков</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-between">
                      <button onClick={() => setScriptStep(2)} className="text-xs text-stone-400 hover:text-white">Назад</button>
                      <button onClick={() => setScriptStep(4)} className="px-3 py-1.5 bg-purple-500 text-neutral-950 font-black text-xs rounded-lg flex items-center gap-1">
                        Назначение встречи <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {scriptStep === 4 && (
                  <div className="space-y-3 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-black tracking-widest text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded">
                        Этап 4 из 4: Назначение выезда эксперта
                      </span>
                    </div>
                    <p className="text-xs text-emerald-950 font-semibold leading-relaxed">
                      «Давайте наш аттестованный эксперт по недвижимости подъедет к вам завтра в 15:00 или в 18:00, проведет бесплатную экспресс-оценку объекта и покажет план продаж. Вам в какое время удобнее?»
                    </p>
                    <div className="bg-white p-3 rounded-lg border border-emerald-200 text-xs">
                      <p className="font-bold text-emerald-900">Заполните форму занесения продавца ниже для фиксации в CRM!</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // BUYER CALL SCRIPTS
              <div className="space-y-4">
                {scriptStep === 1 && (
                  <div className="space-y-3 bg-indigo-50/70 border border-indigo-200 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-black tracking-widest text-indigo-800 bg-indigo-200 px-2 py-0.5 rounded">
                        Этап 1 из 4: Приветствие Покупателя
                      </span>
                    </div>
                    <p className="text-xs text-stone-800 font-medium leading-relaxed">
                      «Здравствуйте! Меня зовут <strong className="text-indigo-900">{agentName}</strong>, агентство «АН Фаттория». Вы оставляли заявку на подбор квартиры в Минске. Удобно сейчас проговорить параметры поиска?»
                    </p>
                    <div className="pt-2 border-t border-indigo-200 flex justify-end">
                      <button onClick={() => setScriptStep(2)} className="px-3 py-1.5 bg-neutral-900 text-purple-400 font-black text-xs rounded-lg flex items-center gap-1">
                        К потребностям <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {scriptStep === 2 && (
                  <div className="space-y-3 bg-stone-50 border border-stone-200 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-black tracking-widest text-neutral-800 bg-stone-200 px-2 py-0.5 rounded">
                        Этап 2 из 4: Потребности & Бюджет в BYN
                      </span>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                        <input type="checkbox" checked={!!checkedQuestions['bq1']} onChange={() => toggleQuestion('bq1')} className="rounded text-purple-500" />
                        <span>Какой тип недвижимости рассматриваете (Квартира / Дом / Коммерция)?</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                        <input type="checkbox" checked={!!checkedQuestions['bq2']} onChange={() => toggleQuestion('bq2')} className="rounded text-purple-500" />
                        <span>Какое количество комнат и желаемые районы Минска?</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                        <input type="checkbox" checked={!!checkedQuestions['bq3']} onChange={() => toggleQuestion('bq3')} className="rounded text-purple-500" />
                        <span>Предельный бюджет в бел. рублях (наличные / привлечение кредита)?</span>
                      </label>
                    </div>
                    <div className="pt-2 border-t border-stone-200 flex justify-between">
                      <button onClick={() => setScriptStep(1)} className="text-xs text-stone-500">Назад</button>
                      <button onClick={() => setScriptStep(3)} className="px-3 py-1.5 bg-neutral-900 text-purple-400 font-black text-xs rounded-lg flex items-center gap-1">
                        Презентация Смарт-Подбора <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {scriptStep === 3 && (
                  <div className="space-y-3 bg-stone-900 text-white p-4 rounded-xl border border-purple-500/30">
                    <p className="text-xs leading-relaxed">
                      «Отлично! У нас прямо сейчас есть 3 закрытых эксклюзивных варианта под ваш бюджет, которых еще нет в общей публичной рекламе. Я сформирую персональное Коммерческое Предложение (КП) и вышлю прямо вам в Telegram/Viber!»
                    </p>
                    <div className="pt-2 border-t border-white/10 flex justify-between">
                      <button onClick={() => setScriptStep(2)} className="text-xs text-stone-400">Назад</button>
                      <button onClick={() => setScriptStep(4)} className="px-3 py-1.5 bg-neutral-900 text-purple-400 font-black text-xs rounded-lg flex items-center gap-1">
                        Назначение показа <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {scriptStep === 4 && (
                  <div className="space-y-3 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                    <p className="text-xs font-bold text-emerald-950">
                      «Давайте согласуем просмотр наилучшего варианта завтра вечером. В 17:30 или в 19:00 вам удобнее подъехать?»
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick 1-Click Lead Intake Panel */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-150 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/20 text-emerald-800 rounded-lg">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-xs text-neutral-900 uppercase tracking-wider">
                    Быстрая фиксация клиента во время звонка
                  </h4>
                  <p className="text-[10px] text-stone-500">
                    Автоматическая выгрузка в CRM-базу <strong className="text-emerald-700">{activeCallRole === 'seller' ? 'Продавцов' : 'Покупателей'}</strong>
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-stone-400 font-bold">1-Click CRM Import</span>
            </div>

            {leadSuccessMsg && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{leadSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  ФИО / Имя Клиента *
                </label>
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Например: Артем Сергеевич"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-neutral-900 outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  Телефон Клиента *
                </label>
                <input
                  type="text"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  placeholder="+375 29 000-00-00"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-neutral-900 outline-none focus:ring-1 focus:ring-purple-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  Тип объекта
                </label>
                <select
                  value={leadType}
                  onChange={(e) => setLeadType(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-neutral-900 outline-none focus:ring-1 focus:ring-purple-500 font-bold cursor-pointer"
                >
                  <option value="apartment">🏢 Квартира</option>
                  <option value="house">🏡 Дом / Коттедж</option>
                  <option value="commercial">🏬 Коммерция</option>
                  <option value="plot">🌲 Участок</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  {activeCallRole === 'seller' ? 'Цена объекта (бел. руб.)' : 'Макс. бюджет (бел. руб.)'}
                </label>
                <input
                  type="number"
                  value={leadPriceBYN}
                  onChange={(e) => setLeadPriceBYN(e.target.value)}
                  placeholder="Например: 220000"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-purple-700 outline-none focus:ring-1 focus:ring-purple-500 font-mono font-black"
                />
              </div>

              {leadType === 'apartment' && (
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Количество комнат
                  </label>
                  <select
                    value={leadRooms}
                    onChange={(e) => setLeadRooms(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-neutral-900 outline-none focus:ring-1 focus:ring-purple-500 font-bold cursor-pointer"
                  >
                    <option value="1">1-комнатная</option>
                    <option value="2">2-комнатная</option>
                    <option value="3">3-комнатная</option>
                    <option value="4">4+ комнатная</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  Предпочитаемый район
                </label>
                <select
                  value={leadDistrict}
                  onChange={(e) => setLeadDistrict(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-neutral-900 outline-none focus:ring-1 focus:ring-purple-500 font-medium cursor-pointer"
                >
                  <option value="Первомайский район">Первомайский район (Уручье, Восток)</option>
                  <option value="Центральный район">Центральный район (Немига, Дрозды)</option>
                  <option value="Советский район">Советский район (Якуба Коласа)</option>
                  <option value="Октябрьский район">Октябрьский район (Минск-Мир)</option>
                  <option value="Московский район">Московский район (Юго-Запад)</option>
                  <option value="Фрунзенский район">Фрунзенский район (Каменная Горка)</option>
                  <option value="Заводской район">Заводской район (Ангарская)</option>
                  <option value="Партизанский район">Партизанский район (Тракторный)</option>
                  <option value="Минский район">Минский район / Пригород</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                Комментарии и особые условия
              </label>
              <textarea
                value={leadNotes}
                onChange={(e) => setLeadNotes(e.target.value)}
                rows={2}
                placeholder="Заметки с разговора: срочность продажи, время перезвона, наличие кредита..."
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-xs text-neutral-900 outline-none focus:ring-1 focus:ring-purple-500 font-medium resize-none"
              />
            </div>

            {/* Messenger Channel Selection for Notification & Forwarding */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-wider text-stone-700">
                  Канал отправки уведомления / КП:
                </span>
                <span className="text-[9px] text-stone-500 font-medium">Колл-центр мульти-канал</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'all', label: 'Все каналы', icon: '🌐' },
                  { id: 'telegram', label: 'Telegram', icon: '🚀' },
                  { id: 'viber', label: 'Viber', icon: '💜' },
                  { id: 'whatsapp', label: 'WhatsApp', icon: '🟢' },
                ].map(ch => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedMessenger(ch.id as any)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      selectedMessenger === ch.id
                        ? 'bg-neutral-900 text-white shadow-sm ring-2 ring-purple-500/50'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span>{ch.icon}</span>
                    <span className="truncate">{ch.label}</span>
                  </button>
                ))}
              </div>

              {/* Quick direct messenger open buttons for this lead */}
              {leadPhone.replace(/\D/g, '').length >= 7 && (
                <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="text-[10px] text-stone-500 font-bold">Быстрая связь:</span>
                  <a
                    href={`https://t.me/anfattoria_bot`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 rounded-md font-bold flex items-center gap-1 transition-colors"
                  >
                    🚀 Бот Telegram
                  </a>
                  <a
                    href={`viber://chat?number=%2B${leadPhone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-md font-bold flex items-center gap-1 transition-colors"
                  >
                    💜 Чат Viber
                  </a>
                  <a
                    href={`https://wa.me/${leadPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Здравствуйте, ${leadName}! Вас беспокоит агентство «АН Фаттория». По вашему запросу на ${leadType === 'apartment' ? 'квартиру' : 'недвижимость'} в Минске готовы выслать подборку вариантов.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-md font-bold flex items-center gap-1 transition-colors"
                  >
                    🟢 Чат WhatsApp
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={handleRegisterLead}
              className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Зафиксировать лид и внести в CRM ({activeCallRole === 'seller' ? 'Продавец' : 'Покупатель'})</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Objection Handling Cheat Sheet & Call History (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* OBJECTION MATRIX CHEAT SHEET */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-150 pb-2.5">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-600" />
                <h4 className="font-black text-xs text-neutral-900 uppercase tracking-wider">
                  База отработки возражений
                </h4>
              </div>
              <span className="text-[9px] font-bold uppercase bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded">
                Шпаргалка
              </span>
            </div>

            {/* Objection Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={objectionSearch}
                onChange={(e) => setObjectionSearch(e.target.value)}
                placeholder="Поиск по возражению..."
                className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-neutral-900 outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'Все' },
                { id: 'commission', label: 'Комиссия' },
                { id: 'self_sale', label: 'Сам продам' },
                { id: 'exclusive', label: 'Эксклюзив' },
                { id: 'price', label: 'Цена' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedObjectionCat(cat.id as any)}
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                    selectedObjectionCat === cat.id
                      ? 'bg-neutral-900 text-white font-black'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Objection List */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredObjections.length === 0 ? (
                <p className="text-center text-xs text-stone-400 py-4">Возражение не найдено.</p>
              ) : (
                filteredObjections.map(obj => {
                  const isExpanded = expandedObjectionId === obj.id;
                  return (
                    <div
                      key={obj.id}
                      className={`border rounded-xl p-2.5 transition-all text-xs cursor-pointer ${
                        isExpanded ? 'border-purple-500 bg-purple-50/40 shadow-xs' : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                      onClick={() => setExpandedObjectionId(isExpanded ? null : obj.id)}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <h5 className="font-extrabold text-neutral-900 text-[11px] leading-tight">
                          {obj.title}
                        </h5>
                        <ChevronRight className={`w-3.5 h-3.5 text-stone-400 shrink-0 transition-transform ${isExpanded ? 'rotate-90 text-purple-600' : ''}`} />
                      </div>

                      {isExpanded && (
                        <div className="mt-2 pt-2 border-t border-purple-200/60 space-y-2 animate-fade-in">
                          <div className="p-2 bg-purple-100/70 text-purple-950 font-bold rounded-lg text-[10px] leading-snug">
                            ⚡ Краткий тезис: {obj.quickAnswer}
                          </div>
                          <p className="text-[11px] text-stone-700 italic leading-relaxed bg-white p-2 rounded-lg border border-stone-200">
                            {obj.fullScript}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* CALL HISTORY / LOG */}
          {(() => {
            const filteredLogs = callLogs.filter(log => {
              if (isAdmin) {
                if (operatorFilter === 'all') return true;
                return log.operatorName === operatorFilter;
              }
              const currentAgentClean = (agentName || '').trim().toLowerCase();
              const logOperatorClean = (log.operatorName || '').trim().toLowerCase();
              return logOperatorClean === currentAgentClean || logOperatorClean.includes(currentAgentClean) || currentAgentClean.includes(logOperatorClean);
            });

            return (
              <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex flex-col gap-2 border-b border-stone-150 pb-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-stone-600" />
                      <h4 className="font-black text-xs text-neutral-900 uppercase tracking-wider">
                        {isAdmin ? `Журнал звонков CRM (${filteredLogs.length})` : `Мои совершенные звонки (${filteredLogs.length})`}
                      </h4>
                    </div>
                    {!isAdmin && (
                      <span className="text-[9px] bg-purple-50 text-purple-800 font-bold px-2 py-0.5 rounded border border-purple-200">
                        Только мои ({agentName.split(' ')[0]})
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-[10px] font-bold text-stone-500">Фильтр сотрудника:</span>
                      <select
                        value={operatorFilter}
                        onChange={(e) => setOperatorFilter(e.target.value)}
                        className="bg-stone-50 border border-stone-200 text-stone-900 font-bold rounded-lg px-2 py-1 text-[10px] outline-none cursor-pointer"
                      >
                        <option value="all">🌐 Все сотрудники ({callLogs.length})</option>
                        {agentsList.map(a => (
                          <option key={a.id} value={a.name}>👤 {a.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {filteredLogs.length === 0 ? (
                    <div className="p-6 text-center text-stone-400 text-xs italic bg-stone-50 rounded-xl border border-dashed border-stone-200">
                      У вас пока нет зарегистрированных звонков за сегодня. Нажмите «Зарегистрировать заявку» во время разговора с клиентом!
                    </div>
                  ) : (
                    filteredLogs.map(log => (
                      <div key={log.id} className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80 text-xs space-y-1 hover:border-purple-400 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-bold text-neutral-900 text-[11px] truncate">{log.clientName}</span>
                            <span className="text-[9px] text-stone-400 uppercase">({log.role === 'seller' ? 'Продавец' : 'Покупатель'})</span>
                          </div>
                          <span className="text-[10px] text-stone-400 font-mono font-bold shrink-0">{log.timestamp}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-stone-500 font-mono">{log.clientPhone}</span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                            log.result === 'meeting_set' ? 'bg-emerald-100 text-emerald-800' :
                            log.result === 'offer_sent' ? 'bg-cyan-100 text-cyan-800' :
                            log.result === 'callback' ? 'bg-purple-100 text-purple-800' :
                            'bg-stone-200 text-stone-700'
                          }`}>
                            {log.result === 'meeting_set' ? 'Встреча назначена' :
                             log.result === 'offer_sent' ? 'КП отправлено' :
                             log.result === 'callback' ? 'Перезвонить' : 'Разговор'}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-600 italic truncate pt-0.5">{log.comment}</p>
                        {isAdmin && (
                          <div className="text-[9px] text-[#8B5CF6] font-bold font-mono pt-1 border-t border-stone-200/60 flex justify-between items-center">
                            <span>Оператор: {log.operatorName}</span>
                            <button
                              onClick={() => {
                                const nextLogs = callLogs.filter(l => l.id !== log.id);
                                saveLogs(nextLogs);
                              }}
                              className="text-rose-500 hover:text-rose-700 font-normal cursor-pointer"
                            >
                              Удалить
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })()}

        </div>

      </div>

      {/* Telegram Bot Setup Modal */}
      <TelegramBotModal
        isOpen={showTgModal}
        onClose={() => setShowTgModal(false)}
      />
    </div>
  );
};
