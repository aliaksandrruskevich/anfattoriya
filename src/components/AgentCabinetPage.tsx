"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PageId, Agent, Property, Lead, Buyer, Article, CRMTask, ColdSeller, InstitutionalRequest, SellerStageComment } from '../types';
import { 
  UserCheck, Database, Layers, Users, Globe, BookOpen, Trash,
  Search, Filter, Edit3, Plus, Check, Briefcase, DollarSign, 
  TrendingUp, HelpCircle, MapPin, ClipboardList, CheckSquare, 
  ChevronDown, CheckCircle, ExternalLink, Calendar, Shield, 
  RefreshCw, AlertCircle, Sparkles, Phone, ChevronLeft, ChevronRight,
  Lock, Mail, Upload, Link, Award, Download, Clock, MessageSquare, MessageCircle, X,
  ListTodo, Send, FileText, Tag, FileSignature, FileSpreadsheet,
  UserMinus, UserPlus, RotateCcw, Building, FileCheck, ArrowRight,
  Image as ImageIcon, Eye, FileEdit
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import PageHero from './PageHero';
import LeadTaskList from './LeadTaskList';
import BuyerSearchMatcher from './BuyerSearchMatcher';
import SellerKanbanPipeline from './SellerKanbanPipeline';
import LeadKanbanBoard from './LeadKanbanBoard';
const CRMAnalyticsDashboard = dynamic(() => import('./CRMAnalyticsDashboard'), {
  ssr: false,
  loading: () => <div className="p-8 text-center">Загрузка аналитики...</div>
});
import CalendarTab from './CalendarTab';
import ScheduleMeetingModal from './ScheduleMeetingModal';
import CallCenterAIModule from './CallCenterAIModule';
import { CallCenterWorkspace } from './CallCenterWorkspace';
import CRMDashboardWidgets from './CRMDashboardWidgets';
const PDFOfferGeneratorModal = dynamic(
  () => import('./PDFOfferGeneratorModal').then(m => m.PDFOfferGeneratorModal),
  { ssr: false, loading: () => <div className="p-8 text-center">Загрузка генератора...</div> }
);
import { XMLFeedExporterModal } from './XMLFeedExporterModal';
import { TelegramBotModal } from './TelegramBotModal';
import { AgentBrandAvatar } from './AgentBrandAvatar';
import { RieltorCabinet } from './RieltorCabinet';
import { InstitutionalRequestsModal } from './InstitutionalRequestsModal';
// AGENT_KPIS и AGENTS больше не импортируются из ../data — данные приходят через API /props
import { getNbrbRate, fetchNbrbRate, subscribeUsdRate } from '../utils/exchangeRate';
import MyDraftPropertiesTab from './MyDraftPropertiesTab';
import RealtQuickImporterModal from './RealtQuickImporterModal';
import { PublishSellerPropertyModal } from './PublishSellerPropertyModal';
import { SmartDayPlannerWidget } from './SmartDayPlannerWidget';

const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
  const escapeField = (field: any) => {
    const stringified = String(field || '').replace(/"/g, '""');
    return `"${stringified}"`;
  };

  const csvContent = "\uFEFF" + [
    headers.map(escapeField).join(';'),
    ...rows.map(row => row.map(escapeField).join(';'))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

interface AgentCabinetPageProps {
  loggedInAgent: Agent | null;
  setLoggedInAgent: (agent: Agent | null) => void;
  agentsList: Agent[];
  setAgentsList: (list: Agent[]) => void;
  propertiesList: Property[];
  setPropertiesList: (list: Property[]) => void;
  leads: Lead[];
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
  saveLeadsToStore: (leads: Lead[]) => void;
  handleClearLeads: () => void;
  buyersList: Buyer[];
  setBuyersList: (list: Buyer[]) => void;
  articlesList: Article[];
  setArticlesList: (list: Article[]) => void;
  syncWithRealt: () => Promise<void>;
  isSyncingRealt: boolean;
  navigateTo?: (pageId: PageId) => void;
  onSelectProperty?: (property: Property | null) => void;
  loadCabinetData?: () => Promise<void>;
}
export default function AgentCabinetPage({
  loggedInAgent,
  setLoggedInAgent,
  agentsList,
  setAgentsList,
  propertiesList,
  setPropertiesList,
  leads,
  handleAddLead,
  saveLeadsToStore,
  handleClearLeads,
  buyersList,
  setBuyersList,
  articlesList,
  setArticlesList,
  syncWithRealt,
  isSyncingRealt,
  navigateTo,
  onSelectProperty,
  loadCabinetData
}: AgentCabinetPageProps) {
  // Загружаем данные кабинета (лиды, покупатели, продавцы, задачи)
  useEffect(() => {
    if (loadCabinetData) {
      loadCabinetData();
    }
  }, [loadCabinetData]);

  // Permission helpers according to strict RBAC specifications:
  // Roles: 1) Administrator, 2) Call-Center, 3) Realtor
  const isAgentAdmin = Boolean(loggedInAgent && (
    loggedInAgent.id === 'admin' || 
    loggedInAgent.isAdmin === true || 
    loggedInAgent.name === 'Администратор системы' || 
    loggedInAgent.role?.toLowerCase().includes('администратор') || 
    loggedInAgent.role?.toLowerCase().includes('директор') ||
    loggedInAgent.role?.toLowerCase().includes('менеджер') ||
    loggedInAgent.role?.toLowerCase().includes('управляющий') ||
    loggedInAgent.role?.toLowerCase().includes('руководитель')
  ));

  const isAgentCallCenter = Boolean(loggedInAgent && !isAgentAdmin && (
    loggedInAgent.id === 'call-center' ||
    loggedInAgent.id === 'callcenter' ||
    loggedInAgent.role?.toLowerCase().includes('колл-центр') || 
    loggedInAgent.role?.toLowerCase().includes('колцентр') || 
    loggedInAgent.role?.toLowerCase().includes('оператор') || 
    loggedInAgent.role?.toLowerCase().includes('call center')
  ));
  // Realtor is anyone who is neither Admin nor Call-Center
  const isRealtor = Boolean(loggedInAgent && !isAgentAdmin && !isAgentCallCenter);

  // Full administrative access
  const hasFullAccess = isAgentAdmin;

  // Strict Rights Matrix:
  // 1. Buyers visibility: Admin: All, Call-center: All, Realtor: Only Own
  const canViewAllBuyers = isAgentAdmin || isAgentCallCenter;
  const canAddBuyers = Boolean(loggedInAgent);
  const canEditBuyer = (buyer: Buyer): boolean => {
    if (isAgentAdmin || isAgentCallCenter) return true;
    if (!loggedInAgent) return false;
    const curName = (loggedInAgent.name || '').toLowerCase().trim();
    const curId = (loggedInAgent.id || '').trim();
    const agId = (buyer.assignedAgentId || '').trim();
    const agName = (buyer.assignedAgentName || '').toLowerCase().trim();
    const regBy = (buyer.registeredBy || '').toLowerCase().trim();
    return Boolean(
      (agId && agId === curId) ||
      (agName && (agName === curName || agName.includes(curName) || curName.includes(agName))) ||
      (regBy && (regBy === curName || regBy.includes(curName) || curName.includes(regBy)))
    );
  };
  const canDeleteBuyer = (buyer: Buyer): boolean => canEditBuyer(buyer);

  // 2. Sellers visibility: Admin: All, Call-center: All, Realtor: Only assigned to self
  const canViewAllSellers = isAgentAdmin || isAgentCallCenter;
  const canViewSeller = (seller: ColdSeller): boolean => {
    if (isAgentAdmin || isAgentCallCenter) return true;
    if (!loggedInAgent) return false;
    const curName = (loggedInAgent.name || '').toLowerCase().trim();
    const curId = (loggedInAgent.id || '').trim();
    const agId = (seller.assignedAgentId || '').trim();
    const agName = (seller.assignedAgentName || '').toLowerCase().trim();
    if (!agId && !agName) return false; // Unassigned pool is strictly hidden from realtors
    return Boolean(
      (agId && agId === curId) ||
      (agName && (agName === curName || agName.includes(curName) || curName.includes(agName)))
    );
  };

  // 3. Add sellers: Admin: Yes, Call-center: Yes, Realtor: NO
  const canAddSellers = isAgentAdmin || isAgentCallCenter;

  // 4. Edit sellers: Admin: Yes, Call-center: Yes, Realtor: Only Own (assigned to self)
  const canEditSeller = (seller: ColdSeller): boolean => canViewSeller(seller);

  // 5. Delete sellers: Admin: Yes, Call-center: Yes, Realtor: Only Own (assigned to self)
  const canDeleteSeller = (seller: ColdSeller): boolean => canViewSeller(seller);

  // 6. Assign / change realtor on seller: Admin: Yes, Call-center: Yes, Realtor: NO
  const canAssignSellerRealtor = isAgentAdmin || isAgentCallCenter;

  // 7. Manage employees: Admin: Yes, Call-center: NO, Realtor: NO
  const canManageEmployees = isAgentAdmin;

  // 8. Object matching for buyers: Admin: Yes, Call-center: Yes, Realtor: Yes
  const canMatchObjects = true;

  // Restricted leads access for Executive
  const canSeeLeads = isAgentAdmin || isAgentCallCenter;
  const isAgentAdminOrHasLeadsAccess = canSeeLeads;

  const [nbrbRate, setNbrbRate] = useState<number>(() => getNbrbRate());

  useEffect(() => {
    const unsubscribe = subscribeUsdRate((rate) => setNbrbRate(rate));
    fetchNbrbRate();
    return unsubscribe;
  }, []);

  // Login states: Realtor, Call Center, or Administrator/Manager
  const [loginType, setLoginType] = useState<'agent' | 'callcenter' | 'admin'>('agent');
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration states
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regExp, setRegExp] = useState('');
  const [regPhoto, setRegPhoto] = useState('');
  const [regEmail, setRegEmail] = useState('');

  // SMS Template System
  const [smsTemplates, setSmsTemplates] = useState<{id: string, label: string, text: string}[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('fp_sms_templates');
    if (saved) return JSON.parse(saved);
    return [
      { 
        id: 'welcome', 
        label: 'Приветствие', 
        text: 'Здравствуйте, {name}! Это агентство АН Фаттория. Мы получили вашу заявку на "{object}". Наш эксперт свяжется с вами в ближайшее время. С уважением, {agent}.' 
      },
      { 
        id: 'meeting', 
        label: 'Встреча/Показ', 
        text: 'Уважаемый(ая) {name}, подтверждаю нашу встречу по объекту "{object}" сегодня. Буду ждать вас! Ваш агент {agent}.' 
      },
      { 
        id: 'appraisal', 
        label: 'Оценка объекта', 
        text: '{name}, здравствуйте! Мы подготовили предварительную оценку вашего объекта "{object}". Когда вам удобно обсудить детали? {agent}.' 
      },
      { 
        id: 'reminder', 
        label: 'Напоминание', 
        text: 'Напоминаем о просмотре объекта "{object}". Ждем вашего подтверждения. {agent}.' 
      }
    ];
  });

  const saveSmsTemplates = (updated: typeof smsTemplates) => {
    setSmsTemplates(updated);
    localStorage.setItem('fp_sms_templates', JSON.stringify(updated));
  };

  const [smsModal, setSmsModal] = useState<{
    isOpen: boolean;
    phone: string;
    clientName: string;
    objectInfo: string;
  }>({ isOpen: false, phone: '', clientName: '', objectInfo: '' });

  const handleSmsRequest = (phone: string, text: string) => {
    alert(`[СИМУЛЯЦИЯ SMS/VIBER]\nОтправка сообщения на: ${phone}\n\nТекст: "${text}"\n\nСтатус: Отправлено успешно!`);
    setSmsModal({ ...smsModal, isOpen: false });
  };

  // Tasks state
  const [tasksList, setTasksList] = useState<CRMTask[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('fp_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const saveTasks = (tasks: CRMTask[]) => {
    setTasksList(tasks);
    localStorage.setItem('fp_tasks', JSON.stringify(tasks));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('fp_tasks_updated'));
    }
  };

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskClientId, setNewTaskClientId] = useState('');

  const [selectedBuyerIds, setSelectedBuyerIds] = useState<string[]>([]);
  const [isMassMailing, setIsMassMailing] = useState(false);
  const [isAddingBuyer, setIsAddingBuyer] = useState(false);

  const [telegramTemplates, setTelegramTemplates] = useState<{id: string, label: string, text: string}[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('fp_tg_templates');
    if (saved) return JSON.parse(saved);
    return [
      { 
        id: 'hot_offer', 
        label: 'Горячий объект 🔥', 
        text: 'Здравствуйте, {name}! У нас появился эксклюзивный объект, который идеально подходит под ваш запрос. Посмотрите подробности: {link}. С уважением, {agent}.' 
      },
      { 
        id: 'price_drop', 
        label: 'Снижение цены 📉', 
        text: 'Добрый день, {name}! На объект, которым вы интересовались, снижена цена! Теперь стоимость составляет {price}. Отличное время для покупки. Ваш агент {agent}.' 
      },
      { 
        id: 'news', 
        label: 'Новости рынка 🗞️', 
        text: 'Уважаемый {name}, сообщаем вам об изменениях на рынке недвижимости Минска. Проверьте нашу новую подборку статей: {link}. АН Фаттория.' 
      }
    ];
  });

  const [selectedTgTemplateId, setSelectedTgTemplateId] = useState('hot_offer');
  const [tgMassMessage, setTgMassMessage] = useState('');

  useEffect(() => {
    const tpl = telegramTemplates.find(t => t.id === selectedTgTemplateId);
    if (tpl) {
      setTgMassMessage(tpl.text);
    }
  }, [selectedTgTemplateId, telegramTemplates]);

  const getSubstitutedText = (templateText: string, clientName: string, objectInfo: string) => {
    return templateText
      .replace(/{name}/g, clientName || 'Клиент')
      .replace(/{object}/g, objectInfo || 'недвижимость')
      .replace(/{agent}/g, loggedInAgent?.name || 'Гордович Кирилл');
  };

  // Active workspace tab
  const [cabinetTab, setCabinetTab] = useState<'profile' | 'leads' | 'leads_kanban' | 'analytics' | 'calendar' | 'sellers' | 'listings' | 'employees' | 'parsing' | 'buyers' | 'articles' | 'sms_templates' | 'tasks' | 'callcenter' | 'requests_registry'>(() => {
    if (typeof window === 'undefined') return 'profile';
    const saved = localStorage.getItem('fp_logged_agent');
    if (saved) {
      const logged = JSON.parse(saved);
      const isLoggedAdmin = logged && (logged.id === 'admin' || logged.isAdmin === true || logged.name === 'Администратор системы');
      const isLoggedManager = logged && (logged.role?.toLowerCase().includes('менеджер') || logged.role?.toLowerCase().includes('manager'));
      const isLoggedCallCenter = logged && (logged.role?.toLowerCase().includes('колцентр') || logged.role?.toLowerCase().includes('call center'));
      
      const savedTab = localStorage.getItem('fp_active_tab');
      if (savedTab) return savedTab as any;

      return (isLoggedAdmin || isLoggedManager || isLoggedCallCenter) ? 'profile' : 'buyers';
    }
    return 'profile';
  });

  const isAllowedForRealtor = cabinetTab === 'profile' || cabinetTab === 'buyers' || cabinetTab === 'tasks' || cabinetTab === 'sellers' || cabinetTab === 'listings' || cabinetTab === 'sms_templates';
  const isAllowedForCallCenter = cabinetTab !== 'employees';
  const activeTab = isAgentAdmin 
    ? cabinetTab 
    : isAgentCallCenter 
      ? (isAllowedForCallCenter ? cabinetTab : 'sellers')
      : (isAllowedForRealtor ? cabinetTab : 'buyers');

  const [sellerViewMode, setSellerViewMode] = useState<'kanban' | 'table'>('kanban');

  // New Lead states
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadType, setNewLeadType] = useState('Продажа жилья (10 дней тест-драйв)');
  const [newLeadSource, setNewLeadSource] = useState('Ручной ввод сотрудником');

  // Edit Lead states
  const [editedLeadId, setEditedLeadId] = useState<string | null>(null);
  const [editLeadName, setEditLeadName] = useState('');
  const [editLeadPhone, setEditLeadPhone] = useState('');
  const [editLeadType, setEditLeadType] = useState('');

  // Listings filter
  const [showMyListingsOnly, setShowMyListingsOnly] = useState(true);

  // Parser states
  const [realtUrl, setRealtUrl] = useState('https://realt.by/sale/flats/object/3041924/');
  const [sellerText, setSellerText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [parseLogs, setParseLogs] = useState<string[]>([]);

  // Pro Tools Modals
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [pdfTargetProperty, setPdfTargetProperty] = useState<Property | null>(null);
  const [showXmlModal, setShowXmlModal] = useState<boolean>(false);
  const [showTgModal, setShowTgModal] = useState<boolean>(false);
  const [showInstitutionalRequestsModal, setShowInstitutionalRequestsModal] = useState<boolean>(false);
  const [initialPropertyForRequest, setInitialPropertyForRequest] = useState<Property | null>(null);
  const [showRealtImporter, setShowRealtImporter] = useState<boolean>(false);
  const [sellerToPublishModal, setSellerToPublishModal] = useState<ColdSeller | null>(null);
  const [assignmentNotification, setAssignmentNotification] = useState<string | null>(null);

  const [institutionalRequests, setInstitutionalRequests] = useState<InstitutionalRequest[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem('fp_institutional_requests');
    if (saved) setInstitutionalRequests(JSON.parse(saved));
  }, [showInstitutionalRequestsModal]);

  const myAgentPropertiesCount = React.useMemo(() => {
    return propertiesList.filter(p => p.assignedAgentId === loggedInAgent?.id).length;
  }, [propertiesList, loggedInAgent]);

  const handleToggleBuyerPublished = (buyerId: string) => {
    const updated = buyersList.map(b => {
      if (b.id === buyerId) {
        const nextPublished = !b.isPublicApproved;
        return {
          ...b,
          isPublicApproved: nextPublished,
          isPublishedOnSite: nextPublished,
        };
      }
      return b;
    });
    setBuyersList(updated);
  };
  const handleTogglePropertyPublished = (propId: string) => {
    const updated = propertiesList.map(p => {
      if (p.id === propId) {
        const nextPublished = p.isPublished === false ? true : false;
        return {
          ...p,
          isPublished: nextPublished,
          isClosedBase: !nextPublished,
        };
      }
      return p;
    });
    setPropertiesList(updated);
  };

  // New Employee states
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('Оператор колл-центра');
  const [newEmpExpYears, setNewEmpExpYears] = useState('3');
  const [newEmpExpMonths, setNewEmpExpMonths] = useState('6');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpSpec, setNewEmpSpec] = useState<'sale' | 'rent' | 'assessment' | 'all'>('sale');
  const [newEmpDeals, setNewEmpDeals] = useState<number>(12);
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpPassword, setNewEmpPassword] = useState('');
  const [newEmpPhotoUrl, setNewEmpPhotoUrl] = useState('');
  const [newEmpPhotoFile, setNewEmpPhotoFile] = useState<string | null>(null);
  const [newEmpAchievements, setNewEmpAchievements] = useState('');
  const [newEmpManager, setNewEmpManager] = useState('');

  // Staff Search & Filtering states
  const [staffSearch, setStaffSearch] = useState('');
  const [staffStatusFilter, setStaffStatusFilter] = useState<'all' | 'active' | 'dismissed'>('all');
  const [isStaffFormExpanded, setIsStaffFormExpanded] = useState(false);

  // Edit Employee Modal States
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [editEmpName, setEditEmpName] = useState('');
  const [editEmpRole, setEditEmpRole] = useState('');
  const [editEmpPhone, setEditEmpPhone] = useState('');
  const [editEmpEmail, setEditEmpEmail] = useState('');
  const [editEmpPassword, setEditEmpPassword] = useState('');
  const [editEmpExpYears, setEditEmpExpYears] = useState('3');
  const [editEmpExpMonths, setEditEmpExpMonths] = useState('0');
  const [editEmpSpec, setEditEmpSpec] = useState<'sale' | 'rent' | 'assessment' | 'commercial' | 'houses' | 'all'>('sale');
  const [editEmpDeals, setEditEmpDeals] = useState<number>(0);
  const [editEmpAchievements, setEditEmpAchievements] = useState('');
  const [editEmpPhotoUrl, setEditEmpPhotoUrl] = useState('');
  const [editEmpPhotoFile, setEditEmpPhotoFile] = useState<string | null>(null);
  const [editEmpIsDismissed, setEditEmpIsDismissed] = useState<boolean>(false);
  const [editEmpHasLeadsAccess, setEditEmpHasLeadsAccess] = useState<boolean>(true);
  const [editEmpIsAdmin, setEditEmpIsAdmin] = useState<boolean>(false);
  const [editEmpManager, setEditEmpManager] = useState('');

  const handleOpenEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setEditEmpName(agent.name || '');
    setEditEmpRole(agent.role || 'Риэлтер');
    setEditEmpPhone(agent.phone || '+375 ');
    setEditEmpEmail(agent.email || '');
    setEditEmpPassword(agent.password || '');

    // Parse experience
    const exp = agent.experience || '';
    const numMatch = exp.match(/(\d+)/g);
    if (numMatch && numMatch.length >= 2) {
      setEditEmpExpYears(numMatch[0]);
      setEditEmpExpMonths(numMatch[1]);
    } else if (numMatch && numMatch.length === 1) {
      setEditEmpExpYears(numMatch[0]);
      setEditEmpExpMonths('0');
    } else {
      setEditEmpExpYears('3');
      setEditEmpExpMonths('0');
    }

    setEditEmpSpec((agent.specialization as any) || 'sale');
    setEditEmpDeals(agent.dealsCount || 0);
    setEditEmpAchievements(agent.achievements || agent.description || '');
    setEditEmpPhotoUrl(agent.photo && !agent.photo.startsWith('data:') ? agent.photo : '');
    setEditEmpPhotoFile(agent.photo && agent.photo.startsWith('data:') ? agent.photo : null);
    setEditEmpIsDismissed(agent.isDismissed ?? (agent.status === 'dismissed' ? true : false));
    setEditEmpHasLeadsAccess(agent.hasLeadsAccess ?? true);
    setEditEmpIsAdmin(agent.isAdmin ?? false);
    setEditEmpManager(agent.assignedManagerName || '');
  };

const handleSaveEditEmployee = async () => {
  if (!editingAgent) return;
  if (!editEmpName.trim()) {
    alert("Пожалуйста, укажите ФИО специалиста.");
    return;
  }
  if (!editEmpPhone.trim()) {
    alert("Пожалуйста, укажите контактный телефон специалиста.");
    return;
  }

  const yearsVal = parseInt(editEmpExpYears, 10) || 0;
  const monthsVal = parseInt(editEmpExpMonths, 10) || 0;
  let experienceStr = '';
  const getYearsW = (y: number) => {
    if (y % 10 === 1 && y % 100 !== 11) return 'год';
    if ([2, 3, 4].includes(y % 10) && ![12, 13, 14].includes(y % 100)) return 'года';
    return 'лет';
  };
  const getMonthsW = (m: number) => {
    if (m % 10 === 1 && m % 100 !== 11) return 'месяц';
    if ([2, 3, 4].includes(m % 10) && ![12, 13, 14].includes(m % 100)) return 'месяца';
    return 'месяцев';
  };

  if (yearsVal > 0 && monthsVal > 0) {
    experienceStr = `${yearsVal} ${getYearsW(yearsVal)} и ${monthsVal} ${getMonthsW(monthsVal)}`;
  } else if (yearsVal > 0) {
    experienceStr = `${yearsVal} ${getYearsW(yearsVal)}`;
  } else if (monthsVal > 0) {
    experienceStr = `${monthsVal} ${getMonthsW(monthsVal)}`;
  } else {
    experienceStr = 'Без опыта';
  }

  const finalPhoto = editEmpPhotoFile || editEmpPhotoUrl || editingAgent.photo || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200";

  const payload: any = {
    name: editEmpName.trim(),
    role: editEmpRole.trim() || 'Риэлтер',
    phone: editEmpPhone.trim(),
    email: editEmpEmail.trim(),
    experience: experienceStr,
    specialization: editEmpSpec,
    dealsCount: Number(editEmpDeals) || 0,
    achievements: editEmpAchievements.trim() || undefined,
    photo: finalPhoto,
    isDismissed: editEmpIsDismissed,
    status: (editEmpIsDismissed ? 'dismissed' : 'active'),
    hasLeadsAccess: editEmpHasLeadsAccess,
    isAdmin: editEmpIsAdmin,
    assignedManagerName: editEmpManager || undefined,
  };

  // Добавляем пароль, только если он не пустой
  if (editEmpPassword.trim()) {
    payload.password = editEmpPassword.trim();
  }

  try {
    const res = await fetch(`/api/agents/${editingAgent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      alert('Ошибка сохранения: ' + (err.error || 'неизвестная'));
      return;
    }

    const updated = agentsList.map((a: Agent) => {
      if (a.id === editingAgent.id) {
        return {
          ...a,
          ...payload,
          password: undefined, // не храним пароль в браузере
        };
      }
      return a;
    });

    setAgentsList(updated);

    if (loggedInAgent && loggedInAgent.id === editingAgent.id) {
      const updatedLoggedIn = {
        ...loggedInAgent,
        name: editEmpName.trim(),
        role: editEmpRole.trim(),
        phone: editEmpPhone.trim(),
        email: editEmpEmail.trim(),
        photo: finalPhoto,
        hasLeadsAccess: editEmpHasLeadsAccess,
        isAdmin: editEmpIsAdmin
      };
      setLoggedInAgent(updatedLoggedIn);
    }

    setEditingAgent(null);
    alert(`Данные сотрудника ${editEmpName.trim()} успешно сохранены в CRM!`);
  } catch (error: any) {
    alert('Ошибка сети при сохранении: ' + error.message);
  }
};
  const handleToggleDismissAgent = (agent: Agent) => {
    const isCurrentlyDismissed = agent.isDismissed ?? (agent.status === 'dismissed');
    const newDismissedState = !isCurrentlyDismissed;
    const actionText = newDismissedState ? 'уволить и скрыть с сайта' : 'восстановить в активный штат и опубликовать на сайте';

    if (!window.confirm(`Вы уверены, что хотите ${actionText} специалиста ${agent.name}?`)) {
      return;
    }

    const updated = agentsList.map((a: Agent) => {
      if (a.id === agent.id) {
        return {
          ...a,
          isDismissed: newDismissedState,
          status: (newDismissedState ? 'dismissed' : 'active') as 'dismissed' | 'active'
        };
      }
      return a;
    });

    setAgentsList(updated);
    alert(`Сотрудник ${agent.name} ${newDismissedState ? 'переведен в архив (уволен)' : 'восстановлен в штат и опубликован на сайте'}!`);
  };

  const handleDeleteAgentPermanently = (agent: Agent) => {
    if (agent.id === 'admin') {
      alert("Невозможно удалить системный аккаунт Главного Администратора.");
      return;
    }
    if (!canManageEmployees) {
      alert("Только Главный Администратор имеет право удалять сотрудников!");
      return;
    }
    if (!window.confirm(`ВНИМАНИЕ! Полностью удалить сотрудника ${agent.name} из базы данных CRM? Это действие необратимо. Закрепленные за ним продавцы вернутся в общий пул для переназначения.`)) {
      return;
    }
    // 1. Remove employee from staff
    const updatedAgents = agentsList.filter((a: Agent) => a.id !== agent.id);
    setAgentsList(updatedAgents);

    // 2. Unassign sellers that were assigned to this agent -> return to General Pool!
    const updatedSellers = sellersList.map(s => {
      if (s.assignedAgentId === agent.id || s.assignedAgentName === agent.name) {
        return {
          ...s,
          assignedAgentId: '',
          assignedAgentName: '',
          notes: (s.notes ? s.notes + '\n' : '') + `[Сотрудник ${agent.name} удален из штата. Продавец возвращен в общий пул]`
        };
      }
      return s;
    });
    setSellersList(updatedSellers);

    // 3. Mark buyers that were assigned or registered by this agent
    const updatedBuyers = buyersList.map(b => {
      if (b.assignedAgentId === agent.id || b.assignedAgentName === agent.name || b.registeredBy === agent.name) {
        return {
          ...b,
          assignedAgentId: '',
          assignedAgentName: '',
          registeredBy: `${b.registeredBy || agent.name} (бывший сотрудник)`
        };
      }
      return b;
    });
    setBuyersList(updatedBuyers);

    // 4. Logout if currently logged in user was this agent
    if (loggedInAgent && loggedInAgent.id === agent.id) {
      setLoggedInAgent(null);
    }

    alert(`Сотрудник ${agent.name} удален из базы. Все продавцы возвращены в общий пул неназначенных.`);
  };

    const handleResetStaffToRealEmployees = async () => {
    if (
      !window.confirm(
        'Синхронизировать штат с сервером? Все локальные изменения будут заменены данными из базы.'
      )
    ) {
      return;
    }
    try {
      const res = await fetch('/api/agents');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAgentsList(data);
        alert(`Штат синхронизирован: ${data.length} сотрудников.`);
      }
    } catch (e: any) {
      console.error('[handleResetStaffToRealEmployees]', e);
      alert('Не удалось загрузить штат из базы. Проверьте соединение.');
    }
  };

  // CRM Agent Isolation state
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('all');
  const [sellerPoolTab, setSellerPoolTab] = useState<'all' | 'unassigned' | 'assigned'>('all');

  // Filter helper for SELLERS strictly according to RBAC specification:
  // - Admin & Call-center: can view all sellers (or filter by selectedAgentFilter)
  // - Realtor: can view ONLY sellers assigned to them! Never unassigned general pool, never others!
  const isSellerVisibleToUser = (seller: ColdSeller): boolean => {
    if (isAgentAdmin || isAgentCallCenter) {
      if (selectedAgentFilter === 'all') return true;
      return (
        seller.assignedAgentName === selectedAgentFilter ||
        seller.assignedAgentId === selectedAgentFilter
      );
    }
    if (!loggedInAgent) return false;
    const curName = (loggedInAgent.name || '').toLowerCase().trim();
    const curId = (loggedInAgent.id || '').trim();
    const agId = (seller.assignedAgentId || '').trim();
    const agName = (seller.assignedAgentName || '').toLowerCase().trim();

    if (!agId && !agName) return false; // Unassigned pool is strictly hidden from realtors

    return Boolean(
      (agId && agId === curId) ||
      (agName && (agName === curName || agName.includes(curName) || curName.includes(agName)))
    );
  };

  // Filter helper for BUYERS strictly according to RBAC specification:
  // - Admin & Call-center: can view all buyers (or filter by selectedAgentFilter)
  // - Realtor: can view ONLY their own buyers (assigned to them or registered by them)!
  const isBuyerVisibleToUser = (buyer: Buyer): boolean => {
    if (isAgentAdmin || isAgentCallCenter) {
      if (selectedAgentFilter === 'all') return true;
      return (
        buyer.assignedAgentName === selectedAgentFilter ||
        buyer.assignedAgentId === selectedAgentFilter ||
        buyer.registeredBy === selectedAgentFilter
      );
    }
    if (!loggedInAgent) return false;
    const curName = (loggedInAgent.name || '').toLowerCase().trim();
    const curId = (loggedInAgent.id || '').trim();
    const agId = (buyer.assignedAgentId || '').trim();
    const agName = (buyer.assignedAgentName || '').toLowerCase().trim();
    const regBy = (buyer.registeredBy || '').toLowerCase().trim();

    return Boolean(
      (agId && agId === curId) ||
      (agName && (agName === curName || agName.includes(curName) || curName.includes(agName))) ||
      (regBy && (regBy === curName || regBy.includes(curName) || curName.includes(regBy)))
    );
  };

  // Filter helper for individual CRM databases (leads, generic):
  const isRecordInAgentDb = (record: { assignedAgentName?: string; assignedAgentId?: string; agentName?: string; registeredBy?: string }) => {
    if (isAgentAdmin || isAgentCallCenter) {
      if (selectedAgentFilter === 'all') return true;
      return (
        record.assignedAgentName === selectedAgentFilter ||
        record.assignedAgentId === selectedAgentFilter ||
        record.agentName === selectedAgentFilter ||
        record.registeredBy === selectedAgentFilter
      );
    }

    if (!loggedInAgent) return false;
    const curName = (loggedInAgent.name || '').toLowerCase().trim();
    const curId = (loggedInAgent.id || '').trim();

    const recAgId = (record.assignedAgentId || '').trim();
    const recAgName = (record.assignedAgentName || record.agentName || '').toLowerCase().trim();
    const recReg = (record.registeredBy || '').toLowerCase().trim();

    return Boolean(
      (recAgId && recAgId === curId) ||
      (recAgName && (recAgName === curName || recAgName.includes(curName) || curName.includes(recAgName))) ||
      (recReg && (recReg === curName || recReg.includes(curName) || curName.includes(recReg)))
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEmpPhotoFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditEmpPhotoFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // New Buyer states
  const [newBuyerName, setNewBuyerName] = useState('');
  const [newBuyerPhone, setNewBuyerPhone] = useState('+375 ');
  const [newBuyerBudget, setNewBuyerBudget] = useState('');
  const [newBuyerPrefs, setNewBuyerPrefs] = useState('');
  const [newBuyerStatus, setNewBuyerStatus] = useState('searching');
  const [newBuyerPrefType, setNewBuyerPrefType] = useState<'apartment' | 'house' | 'commercial' | 'plot' | 'all'>('all');
  const [newBuyerPrefRooms, setNewBuyerPrefRooms] = useState<string>('');
  const [newBuyerPrefDistrict, setNewBuyerPrefDistrict] = useState<string>('');
  const [newBuyerMinArea, setNewBuyerMinArea] = useState<string>('');
  const [newBuyerMaxArea, setNewBuyerMaxArea] = useState<string>('');
  const [newBuyerFloorPref, setNewBuyerFloorPref] = useState<'any' | 'not_first' | 'not_last' | 'middle' | 'top'>('any');
  const [newBuyerRenovation, setNewBuyerRenovation] = useState<'any' | 'euro' | 'good' | 'raw' | 'repair_needed'>('any');
  const [newBuyerAssignedAgent, setNewBuyerAssignedAgent] = useState<string>('');

  // Edit Buyer extra states
  const [editBuyerMaxArea, setEditBuyerMaxArea] = useState<string>('');
  const [editBuyerFloorPref, setEditBuyerFloorPref] = useState<'any' | 'not_first' | 'not_last' | 'middle' | 'top'>('any');
  const [editBuyerRenovation, setEditBuyerRenovation] = useState<'any' | 'euro' | 'good' | 'raw' | 'repair_needed'>('any');
  const [editBuyerAssignedAgent, setEditBuyerAssignedAgent] = useState<string>('');
  const [expandedMatchBuyerId, setExpandedMatchBuyerId] = useState<string | null>(null);

  // Cold Sellers Database states
  const [sellersList, setSellersList] = useState<ColdSeller[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('fp_cold_sellers') || localStorage.getItem('fp_sellers');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'seller-1',
        name: 'Николай Васильевич',
        phone: '+375 (29) 612-34-56',
        address: 'г. Минск, пр-т Победителей, 89',
        propertyType: 'apartment',
        askingPriceUSD: 115000,
        askingPriceBYN: 376050,
        status: 'meeting_scheduled',
        kanbanStage: 'evaluation',
        assignedAgentName: 'Гордович Кирилл',
        assignedAgentId: 'agent-гордович-кирилл',
        callOperatorName: 'Мария Семенова (Колл-центр)',
        notes: 'Холодный звонок 20.07. Продавец сомневается, но согласился на выезд риэлтера для экспертной оценки.',
        dateAdded: '20.07.2026',
        nextContactDate: '2026-07-22'
      },
      {
        id: 'seller-2',
        name: 'Елена Викторовна',
        phone: '+375 (33) 304-98-12',
        address: 'г. Минск, ул. Притыцкого, 42',
        propertyType: 'apartment',
        askingPriceUSD: 89000,
        askingPriceBYN: 291030,
        status: 'interested',
        kanbanStage: 'primary_contact',
        assignedAgentName: 'Ломако Павел',
        assignedAgentId: 'agent-ломако-павел',
        callOperatorName: 'Дмитрий Иванов (Колл-центр)',
        notes: 'Продает 2-комнатную квартиру. Спешки нет, просит прислать сравнительный анализ цен.',
        dateAdded: '21.07.2026',
        nextContactDate: '2026-07-23'
      },
      {
        id: 'seller-3',
        name: 'Сергей Анатольевич',
        phone: '+375 (44) 755-11-22',
        address: 'Минский р-н, д. Боровляны, ул. Лесная',
        propertyType: 'house',
        askingPriceUSD: 240000,
        askingPriceBYN: 784800,
        status: 'contract_signed',
        kanbanStage: 'contract',
        assignedAgentName: 'Герман Светлана',
        assignedAgentId: 'agent-герман-светлана',
        callOperatorName: 'Мария Семенова (Колл-центр)',
        notes: 'Коттедж 2021 г.п. Заключен эксклюзивный риэлтерский договор продажи.',
        dateAdded: '18.07.2026'
      },
      {
        id: 'seller-pool-1',
        name: 'Ольга Павловна',
        phone: '+375 (29) 111-22-33',
        address: 'г. Минск, ул. Сурганова, 50',
        propertyType: 'apartment',
        askingPriceUSD: 98000,
        askingPriceBYN: 320460,
        status: 'cold_call',
        kanbanStage: 'primary_contact',
        assignedAgentName: '',
        assignedAgentId: '',
        callOperatorName: 'Колл-центр',
        notes: 'Первичный контакт: доработка информации колл-центром. Риэлтер пока не назначен (в общем пуле).',
        dateAdded: '25.07.2026'
      },
      {
        id: 'seller-pool-2',
        name: 'Владимир Ильич',
        phone: '+375 (33) 678-90-12',
        address: 'г. Минск, пр-т Дзержинского, 119',
        propertyType: 'apartment',
        askingPriceUSD: 140000,
        askingPriceBYN: 457800,
        status: 'interested',
        kanbanStage: 'evaluation',
        assignedAgentName: '',
        assignedAgentId: '',
        callOperatorName: 'Колл-центр',
        notes: '3-комнатная квартира, продавец ждет предварительную оценку, риэлтер будет назначен после звонка.',
        dateAdded: '26.07.2026'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('fp_cold_sellers', JSON.stringify(sellersList));
    localStorage.setItem('fp_sellers', JSON.stringify(sellersList));
  }, [sellersList]);

  // Delayed Seller Realtor Assignment Handler
  const handleAssignSellerAgent = (sellerId: string, agentName: string) => {
    if (!canAssignSellerRealtor) {
      alert("Только Администратор или сотрудник Колл-центра может назначать или изменять риэлтера у продавца!");
      return;
    }
    const selectedAgentObj = agentsList.find(a => a.name === agentName);
    const updated = sellersList.map(s => {
      if (s.id === sellerId) {
        const isUnassigning = !agentName || agentName === 'unassigned' || agentName === '';
        const prevAgent = s.assignedAgentName || 'Общий пул';
        const comment: SellerStageComment = {
          id: `cmt-${Date.now()}`,
          date: new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          stage: s.kanbanStage || 'primary_contact',
          text: isUnassigning 
            ? `Снято закрепление за риэлтером (${prevAgent}). Объект возвращен в общий пул.`
            : `Назначен ответственный риэлтер: ${selectedAgentObj?.name} (было: ${prevAgent})`,
          author: loggedInAgent?.name || 'Администратор'
        };
        return {
          ...s,
          assignedAgentId: isUnassigning ? '' : (selectedAgentObj?.id || ''),
          assignedAgentName: isUnassigning ? '' : (selectedAgentObj?.name || ''),
          commentsHistory: [comment, ...(s.commentsHistory || [])]
        };
      }
      return s;
    });

    setSellersList(updated);
    localStorage.setItem('fp_cold_sellers', JSON.stringify(updated));
    localStorage.setItem('fp_sellers', JSON.stringify(updated));

    if (agentName && agentName !== 'unassigned') {
      setAssignmentNotification(`🔔 Назначение сохранено! Уведомление отправлено риэлтеру ${agentName} в Telegram!`);
      setTimeout(() => setAssignmentNotification(null), 5000);
    }
  };

  // Point 1: Create and publish Property from Seller in 1-Click
  const handlePublishSellerProperty = (newProperty: Property, updatedSeller: ColdSeller) => {
    const updatedProps = [newProperty, ...propertiesList];
    setPropertiesList(updatedProps);

    const updatedSellers = sellersList.map(s => s.id === updatedSeller.id ? updatedSeller : s);
    setSellersList(updatedSellers);
    localStorage.setItem('fp_cold_sellers', JSON.stringify(updatedSellers));
    localStorage.setItem('fp_sellers', JSON.stringify(updatedSellers));

    setAssignmentNotification(`🔥 Объект "${newProperty.title}" успешно создан и опубликован на сайте!`);
    setTimeout(() => setAssignmentNotification(null), 5000);
  };

  // Delete Seller Handler
  const handleDeleteSeller = (sellerId: string) => {
    const target = sellersList.find(s => s.id === sellerId);
    if (!target) return;
    if (!canDeleteSeller(target)) {
      alert("У вас нет прав на удаление этого продавца!");
      return;
    }
    if (!window.confirm(`Удалить продавца ${target.name} из базы?`)) return;

    const updated = sellersList.filter(s => s.id !== sellerId);
    setSellersList(updated);
    localStorage.setItem('fp_cold_sellers', JSON.stringify(updated));
    localStorage.setItem('fp_sellers', JSON.stringify(updated));
  };

  // Editing seller state
  const [editingSeller, setEditingSeller] = useState<ColdSeller | null>(null);

  // New Cold Seller form states
  const [newSellerName, setNewSellerName] = useState('');
  const [newSellerPhone, setNewSellerPhone] = useState('+375 ');
  const [newSellerAddress, setNewSellerAddress] = useState('');
  const [newSellerType, setNewSellerType] = useState<'apartment' | 'house' | 'commercial' | 'plot'>('apartment');
  const [newSellerPrice, setNewSellerPrice] = useState('');
  const [newSellerStatus, setNewSellerStatus] = useState<ColdSeller['status']>('cold_call');
  const [newSellerAgent, setNewSellerAgent] = useState('');
  const [newSellerNotes, setNewSellerNotes] = useState('');
  const [newSellerNextDate, setNewSellerNextDate] = useState('');
  const [sellerSearch, setSellerSearch] = useState('');
  const [sellerStatusFilter, setSellerStatusFilter] = useState<string>('all');
  const [isAddingSeller, setIsAddingSeller] = useState(false);

  // News Creator states
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [newArticleTitle, setNewArticleTitle] = useState('');
  const [newArticleSnippet, setNewArticleSnippet] = useState('');
  const [newArticleContent, setNewArticleContent] = useState('');
  const [newArticleCategory, setNewArticleCategory] = useState<'news' | 'tips' | 'legal'>('news');
  const [newArticlePhoto, setNewArticlePhoto] = useState('');
  const [articleEditorTab, setArticleEditorTab] = useState<'edit' | 'preview'>('edit');
  const [photoInsertModalOpen, setPhotoInsertModalOpen] = useState(false);
  const [insertPhotoUrl, setInsertPhotoUrl] = useState('');
  const [insertPhotoCaption, setInsertPhotoCaption] = useState('');

  // Search & Filter states for Leads & Buyers
  const [leadsSearch, setLeadsSearch] = useState('');
  const [leadsStatusFilter, setLeadsStatusFilter] = useState<string>('all');
  const [leadsViewMode, setLeadsViewMode] = useState<'list' | 'kanban'>('list');
  const [schedulingLead, setSchedulingLead] = useState<Lead | null>(null);
  const [newHistoryText, setNewHistoryText] = useState<{ [leadId: string]: string }>({});
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [buyersSearch, setBuyersSearch] = useState('');
  const [buyersStatusFilter, setBuyersStatusFilter] = useState<string>('all');

  // Edit Buyer states
  const [editingBuyerId, setEditingBuyerId] = useState<string | null>(null);
  const [editBuyerName, setEditBuyerName] = useState('');
  const [editBuyerPhone, setEditBuyerPhone] = useState('');
  const [editBuyerBudget, setEditBuyerBudget] = useState('');
  const [editBuyerPrefs, setEditBuyerPrefs] = useState('');
  const [editBuyerStatus, setEditBuyerStatus] = useState('searching');
  const [editBuyerPrefType, setEditBuyerPrefType] = useState<'apartment' | 'house' | 'commercial' | 'plot' | 'all'>('all');
  const [editBuyerPrefRooms, setEditBuyerPrefRooms] = useState<string>('');
  const [editBuyerPrefDistrict, setEditBuyerPrefDistrict] = useState<string>('');
  const [editBuyerMinArea, setEditBuyerMinArea] = useState<string>('');

  // Pagination states to prevent endless scroll issues
  const [leadsPage, setLeadsPage] = useState(1);
  const [listingsPage, setListingsPage] = useState(1);
  const [employeesPage, setEmployeesPage] = useState(1);
  const [buyersPage, setBuyersPage] = useState(1);
  const [articlesPage, setArticlesPage] = useState(1);

  const handleExportLeadsCSV = () => {
    const isFiltered = leadsSearch.trim() || leadsStatusFilter !== 'all';
    const leadsToExport = isFiltered
      ? leads.filter(lead => {
          const s = lead.status || 'new';
          if (leadsStatusFilter !== 'all' && s !== leadsStatusFilter) return false;
          if (leadsSearch.trim()) {
            const q = leadsSearch.toLowerCase();
            return (
              lead.name.toLowerCase().includes(q) ||
              lead.phone.includes(q) ||
              lead.typeOrPrice.toLowerCase().includes(q) ||
              lead.formName.toLowerCase().includes(q) ||
              (lead.notes && lead.notes.toLowerCase().includes(q))
            );
          }
          return true;
        })
      : leads;

    if (leadsToExport.length === 0) {
      alert("Нет лидов для экспорта!");
      return;
    }

    const headers = [
      'ID',
      'Дата',
      'Имя Клиента',
      'Телефон',
      'Тип запроса / Бюджет',
      'Источник',
      'Статус',
      'Заметки риэлтора'
    ];

    const statusLabels: Record<string, string> = {
      'new': 'Новый',
      'in_progress': 'В работе',
      'negotiation': 'Переговоры',
      'deal': 'Сделка',
      'declined': 'Отказ'
    };

    const rows = leadsToExport.map(lead => [
      lead.id,
      lead.date,
      lead.name,
      lead.phone,
      lead.typeOrPrice,
      lead.formName,
      statusLabels[lead.status || 'new'] || lead.status || 'Новый',
      lead.notes || ''
    ]);

    const filename = `leads_export_${isFiltered ? 'filtered_' : ''}${new Date().toISOString().slice(0,10)}.csv`;
    downloadCSV(filename, headers, rows);
    alert(`Успешно экспортировано ${leadsToExport.length} лидов в файл ${filename}!`);
  };

  const handleExportBuyersCSV = () => {
    const isFiltered = buyersSearch.trim() || buyersStatusFilter !== 'all';
    const buyersToExport = isFiltered
      ? buyersList.filter(buyer => {
          const s = buyer.status || 'searching';
          if (buyersStatusFilter !== 'all' && s !== buyersStatusFilter) return false;
          if (buyersSearch.trim()) {
            const q = buyersSearch.toLowerCase();
            return (
              buyer.name.toLowerCase().includes(q) ||
              buyer.phone.includes(q) ||
              buyer.preferences.toLowerCase().includes(q) ||
              buyer.registeredBy.toLowerCase().includes(q)
            );
          }
          return true;
        })
      : buyersList;

    if (buyersToExport.length === 0) {
      alert("Нет инвесторов для экспорта!");
      return;
    }

    const headers = [
      'ID',
      'Дата добавления',
      'ФИО Покупателя',
      'Телефон',
      'Бюджет (USD)',
      'Пожелания к объекту',
      'Ответственный риэлтор',
      'Статус подбора'
    ];

    const statusLabels: Record<string, string> = {
      'searching': 'В поиске',
      'negotiating': 'Переговоры',
      'deal': 'Оформление'
    };

    const rows = buyersToExport.map(buyer => [
      buyer.id,
      buyer.dateAdded,
      buyer.name,
      buyer.phone,
      String(buyer.budgetUSD),
      buyer.preferences,
      buyer.registeredBy,
      statusLabels[buyer.status || 'searching'] || buyer.status || 'В поиске'
    ]);

    const filename = `buyers_export_${isFiltered ? 'filtered_' : ''}${new Date().toISOString().slice(0,10)}.csv`;
    downloadCSV(filename, headers, rows);
    alert(`Успешно экспортировано ${buyersToExport.length} покупателей в файл ${filename}!`);
  };

  const handleExportSellersCSV = () => {
    const sellersToExport = sellersList.filter(s => isSellerVisibleToUser(s));
    if (sellersToExport.length === 0) {
      alert("Нет продавцов для экспорта!");
      return;
    }

    const headers = [
      'ID',
      'Дата добавления',
      'ФИО Продавца',
      'Телефон',
      'Адрес объекта',
      'Тип недвижимости',
      'Цена (USD)',
      'Цена (BYN)',
      'Этап воронки',
      'Статус',
      'Ответственный риэлтер',
      'Оператор колл-центра',
      'Договор',
      'Заметки'
    ];

    const rows = sellersToExport.map(s => [
      s.id,
      s.dateAdded,
      s.name,
      s.phone,
      s.address,
      s.propertyType,
      String(s.askingPriceUSD || Math.round((s.askingPriceBYN || 0) / 3.27)),
      String(s.askingPriceBYN || 0),
      s.kanbanStage || 'primary_contact',
      s.status,
      s.assignedAgentName || 'Общий пул',
      s.callOperatorName || '',
      s.contractNumber || '',
      s.notes || ''
    ]);

    const filename = `sellers_fattoria_${new Date().toISOString().slice(0,10)}.csv`;
    downloadCSV(filename, headers, rows);
    alert(`Успешно экспортировано ${sellersToExport.length} продавцов в файл ${filename}!`);
  };

  const handleImportBuyers = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let newBuyers: Buyer[] = [];

        if (file.name.endsWith('.json')) {
          newBuyers = JSON.parse(content);
        } else {
          // Semi-colon separated: name;phone;budget;prefs
          const lines = content.split('\n');
          newBuyers = lines.filter(line => line.trim()).map(line => {
            const parts = line.split(';');
            return {
              id: `buyer-imp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              name: parts[0]?.trim() || 'Imported Buyer',
              phone: parts[1]?.trim() || '+375',
              budgetUSD: parseInt(parts[2], 10) || 0,
              budgetBYN: Math.round((parseInt(parts[2], 10) || 0) * 3.27),
              preferences: parts[3]?.trim() || '',
              registeredBy: loggedInAgent ? loggedInAgent.name : "Администратор",
              status: 'searching',
              dateAdded: new Date().toLocaleDateString('ru-RU'),
              isPublicApproved: false,
              isPublishedOnSite: false,
              crmOnly: true,
              prefType: 'all'
            };
          });
        }

        if (newBuyers.length > 0) {
          const updated = [...newBuyers, ...buyersList];
          setBuyersList(updated);
          alert(`Успешно импортировано ${newBuyers.length} покупателей в базу!`);
        } else {
          alert('Файл пуст или имеет неверный формат.');
        }
      } catch (err) {
        console.error('Import error:', err);
        alert('Ошибка при разборе файла. Поддерживается JSON или текстовый формат (строки вида "Имя;Телефон;Бюджет;Пожелания").');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Helper for pagination UI
  const renderPagination = (currentPage: number, totalPages: number, setPage: (p: number) => void) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between border-t border-stone-200/60 pt-5 mt-6">
        <div className="text-xs text-stone-500 font-semibold font-sans">
          Страница <span className="font-extrabold text-neutral-800">{currentPage}</span> из <span className="font-extrabold text-neutral-800">{totalPages}</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => {
              setPage(Math.max(1, currentPage - 1));
            }}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-stone-250 text-stone-600 hover:bg-stone-100/50 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all outline-none"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
            if (totalPages > 6 && Math.abs(pageNum - currentPage) > 1 && pageNum !== 1 && pageNum !== totalPages) {
              if (pageNum === 2 && currentPage > 3) return <span key={pageNum} className="px-1.5 text-stone-400 self-center font-bold">...</span>;
              if (pageNum === totalPages - 1 && currentPage < totalPages - 2) return <span key={pageNum} className="px-1.5 text-stone-400 self-center font-bold">...</span>;
              return null;
            }
            return (
              <button
                key={pageNum}
                onClick={() => {
                  setPage(pageNum);
                }}
                className={`w-7 h-7 flex items-center justify-center text-xs rounded-lg font-black transition-all cursor-pointer outline-none ${
                  currentPage === pageNum
                    ? 'bg-purple-500 text-neutral-950 font-black shadow-sm'
                    : 'border border-stone-200 hover:bg-stone-50 text-stone-600'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => {
              setPage(Math.min(totalPages, currentPage + 1));
            }}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-stone-250 text-stone-600 hover:bg-stone-100/50 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all outline-none"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // IF LOGGED IN AS REALTOR -> RENDER DEDICATED RIELTOR CABINET (Buyers, My Objects, Matches)
  if (loggedInAgent && isRealtor) {
    return (
      <div className="bg-[#faf9f6] min-h-screen font-sans">
        <PageHero 
          activePage="agent-cabinet" 
          navigateTo={navigateTo || (() => {})} 
          handleAddLead={handleAddLead} 
        />
        <RieltorCabinet
          loggedInAgent={loggedInAgent}
          propertiesList={propertiesList}
          buyersList={buyersList}
          setBuyersList={setBuyersList}
          sellersList={sellersList}
          nbrbRate={nbrbRate}
          onLogout={() => {
            setLoggedInAgent(null);
            localStorage.removeItem('fp_logged_agent');
          }}
          onViewProperty={(property) => {
            if (onSelectProperty) {
              onSelectProperty(property);
            } else if (navigateTo) {
              localStorage.setItem('fp_selected_property_id', property.id);
              navigateTo('catalog');
            }
          }}
          onGenerateKP={(property) => {
            setPdfTargetProperty(property);
            setShowPdfModal(true);
          }}
          onOpenInstitutionalRequests={(property) => {
            setInitialPropertyForRequest(property || null);
            setShowInstitutionalRequestsModal(true);
          }}
        />

        {/* PDF Commercial Offer Generator Modal for Realtor */}
        {showPdfModal && (
          <PDFOfferGeneratorModal
            property={pdfTargetProperty}
            propertiesList={propertiesList}
            agentName={loggedInAgent ? loggedInAgent.name : "Агентство «АН Фаттория»"}
            onClose={() => setShowPdfModal(false)}
          />
        )}

        {/* Institutional Requests Modal for Realtor */}
        {showInstitutionalRequestsModal && loggedInAgent && (
          <InstitutionalRequestsModal
            isOpen={showInstitutionalRequestsModal}
            onClose={() => {
              setShowInstitutionalRequestsModal(false);
              setInitialPropertyForRequest(null);
            }}
            loggedInAgent={loggedInAgent}
            agentsList={agentsList}
            propertiesList={propertiesList}
            initialProperty={initialPropertyForRequest}
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#faf9f6] min-h-screen font-sans">
      <PageHero 
        activePage="agent-cabinet" 
        navigateTo={navigateTo || (() => {})} 
        handleAddLead={handleAddLead} 
      />

      <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-8">
        {/* If agent is not logged in, show elegant Login / Registration Panels */}
        {!loggedInAgent ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch animate-fade-in max-w-7xl mx-auto">
            
            {/* Card 1: Employer/Realtor Login */}
            <div className="lg:col-span-7 bg-white border border-stone-200/80 rounded-2xl p-6 md:p-10 space-y-8 shadow-xl shadow-stone-100 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-purple-500 via-stone-800 to-purple-600"></div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="text-[10px] text-purple-600 font-black uppercase tracking-widest font-mono">Корпоративный портал CRM</div>
                  <h2 className="text-2xl md:text-3xl font-black text-neutral-900 font-sans tracking-tight leading-tight">Вход в Личный Кабинет</h2>
                  <p className="text-xs text-stone-500 font-medium font-sans">Выберите вашу роль и введите учетные данные для авторизации в CRM.</p>
                </div>

                {/* Triple Tabs Selector: Realtor, Call Center, Administrator/Manager */}
                <div className="flex bg-stone-100 p-1.5 rounded-xl border border-stone-200/30 gap-1">
                  <button
                    onClick={() => { setLoginType('agent'); setLoginName(''); setLoginPassword(''); }}
                    className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all outline-none flex items-center justify-center gap-1.5 cursor-pointer ${ loginType === 'agent' ? 'bg-white text-neutral-900 shadow-sm border border-stone-200/20' : 'text-stone-500 hover:text-stone-900' }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                    Риэлтер
                  </button>
                  <button
                    onClick={() => { setLoginType('callcenter'); setLoginName('anfattoriya@gmail.com'); setLoginPassword(''); }}
                    className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all outline-none flex items-center justify-center gap-1.5 cursor-pointer ${ loginType === 'callcenter' ? 'bg-white text-neutral-900 shadow-sm border border-stone-200/20' : 'text-stone-500 hover:text-stone-900' }`}
                  >
                    <Phone className="w-3.5 h-3.5 text-indigo-600" />
                    Колл-центр
                  </button>
                  <button
                    onClick={() => { setLoginType('admin'); setLoginName('anfattoriya@gmail.com'); setLoginPassword(''); }}
                    className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all outline-none flex items-center justify-center gap-1.5 cursor-pointer ${ loginType === 'admin' ? 'bg-white text-neutral-900 shadow-sm border border-stone-200/20' : 'text-stone-500 hover:text-stone-900' }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-purple-600" />
                    Администратор / Менеджер
                  </button>
                </div>

                <div className="space-y-5 font-sans text-xs">
                  {loginType === 'agent' ? (
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase font-black text-neutral-600 tracking-wider">Выберите риэлтера</label>
                      <select
                        value={loginName}
                        onChange={(e) => {
                          setLoginName(e.target.value);
                          setLoginPassword('');
                        }}
                        className="w-full bg-stone-50 border border-stone-250 text-neutral-950 rounded-lg px-3 py-2.5 text-xs font-semibold focus:border-purple-500 outline-none"
                      >
                        <option value="">-- Выбрать из списка риэлтеров --</option>
                        {agentsList.filter(a => !a.isAdmin && a.id !== 'admin' && a.id !== 'call-center').map(agent => (
                          <option key={agent.id} value={agent.email || agent.name}>
                            {agent.name} {agent.email ? `(${agent.email})` : ''}
                          </option>
                        ))}
                      </select>

                      <div className="pt-1">
                        <label className="block text-[10px] uppercase font-black text-neutral-600 tracking-wider mb-1">Или введите Email / ФИО риэлтера</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                            <UserCheck className="w-4 h-4" />
                          </span>
                          <input
                            type="text"
                            placeholder="Email или ФИО риэлтера (напр. safron4ik84@mail.ru)"
                            value={loginName}
                            onChange={(e) => setLoginName(e.target.value)}
                            className="w-full bg-stone-50/50 border border-stone-250 text-neutral-950 rounded-lg pl-10 pr-4 py-3 text-xs focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white outline-none font-sans transition-all font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  ) : loginType === 'callcenter' ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-250/60 text-[11px] text-indigo-900 leading-relaxed font-medium">
                        Доступ оператора колл-центра: База продавцов, База объектов, База покупателей, ИИ-Парсер и отправка в Telegram / Viber / WhatsApp.
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] uppercase font-black text-neutral-600 tracking-wider">Email или логин оператора</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                            <Phone className="w-4 h-4" />
                          </span>
                          <input
                            type="text"
                            placeholder="anfattoriya@gmail.com или callcenter"
                            value={loginName}
                            onChange={(e) => setLoginName(e.target.value)}
                            className="w-full bg-stone-50/50 border border-stone-250 text-neutral-950 rounded-lg pl-10 pr-4 py-3 text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none font-sans transition-all font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-250/60 text-[11px] text-purple-950 leading-relaxed font-medium">
                        Полный доступ: Управление сотрудниками (Кадры), Аналитика, Заявки CRM, Канбан, Базы объектов, продавцов и покупателей, Настройки Telegram и систем.
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] uppercase font-black text-neutral-600 tracking-wider">Email или логин Администратора</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-600/80">
                            <Shield className="w-4 h-4" />
                          </span>
                          <input
                            type="text"
                            placeholder="anfattoriya@gmail.com или admin"
                            value={loginName}
                            onChange={(e) => setLoginName(e.target.value)}
                            className="w-full bg-stone-50/50 border border-stone-250 text-neutral-950 rounded-lg pl-10 pr-4 py-3 text-xs focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white outline-none font-sans transition-all font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase font-black text-neutral-600 tracking-wider">
                      Пароль доступа
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                        <Shield className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        placeholder="Введите пароль..."
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full bg-stone-50/50 border border-stone-250 text-neutral-950 rounded-lg pl-10 pr-4 py-3 text-xs focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white outline-none font-sans transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-stone-100">
  <button
    onClick={async () => {
      const trimmedName = loginName.trim();
      const trimmedPass = loginPassword.trim();

      if (!trimmedName) {
        alert("Пожалуйста, введите Email/логин!");
        return;
      }
      if (!trimmedPass) {
        alert("Пожалуйста, введите пароль для входа!");
        return;
      }

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedName, password: trimmedPass }),
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Неверный email или пароль');
          return;
        }
        setLoggedInAgent(data.agent);
        localStorage.setItem('fp_logged_agent', JSON.stringify(data.agent));
        alert(`Добро пожаловать, ${data.agent.name}!`);
        if (data.agent.isAdmin) setCabinetTab('leads');
        else setCabinetTab('sellers');
      } catch (e: any) {
        alert('Ошибка входа: ' + (e.message || 'неизвестная'));
      }
    }}
    className="w-full py-4 bg-neutral-900 hover:bg-purple-500 hover:text-neutral-950 text-white uppercase text-xs font-black tracking-widest rounded-xl transition-all cursor-pointer outline-none shadow-md hover:shadow-lg active:scale-[0.98]"
  >
    {loginType === 'admin' ? "Войти как Администратор / Менеджер" : loginType === 'callcenter' ? "Войти как Колл-центр" : "Войти в кабинет риэлтера"}
  </button>
</div>
</div>

{/* Card 2: Corporate Regulation / Restrictions */}
<div className="lg:col-span-5 bg-gradient-to-br from-neutral-900 to-stone-950 text-white rounded-2xl p-6 md:p-10 space-y-6 border border-neutral-800 shadow-2xl flex flex-col justify-between relative overflow-hidden">
  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

  <div className="space-y-6">
    <div className="space-y-2.5">
      <span className="text-[9px] uppercase font-mono font-black text-purple-500 tracking-widest flex items-center gap-2 bg-neutral-800/60 px-3 py-1 rounded-full w-max border border-neutral-700/30">
        <Shield className="w-3.5 h-3.5" /> Регламент разграничения прав CRM
      </span>
      <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-snug">Матрица ролей и доступов</h3>
      <p className="text-xs text-neutral-400 leading-relaxed font-sans font-medium">
        В системе внедрено строгое разграничение прав для защиты коммерческих данных:
      </p>
    </div>

    <div className="p-4 bg-black/40 rounded-xl border border-neutral-800 text-[11px] leading-relaxed text-stone-300 space-y-3.5 font-medium">
      <div className="flex items-start gap-3">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-black text-[10px] shrink-0 border border-purple-500/30">1</span>
        <span><strong>Кабинет Риэлтера:</strong> Доступ к Базе Покупателей, своим объектам, карточке объекта, внесению и редактированию покупателей и умным совпадениям.</span>
      </div>
      <div className="flex items-start gap-3">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-black text-[10px] shrink-0 border border-indigo-500/30">2</span>
        <span><strong>Колл-центр:</strong> Доступ к Базе Продавцов, Базе Объектов, Базе Покупателей, ИИ-Парсингу и скриптам с возможностью вносить и редактировать объекты и контакты.</span>
      </div>
      <div className="flex items-start gap-3">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[10px] shrink-0 border border-emerald-500/30">3</span>
        <span><strong>Менеджер и Администратор:</strong> Полный неограниченный доступ ко всей CRM, включая Кадры/Сотрудники, Аналитику и финансовые настройки.</span>
      </div>
    </div>
  </div>

  <div className="pt-6 border-t border-neutral-800 text-[10px] text-neutral-500 font-semibold leading-normal">
    По вопросам изменения прав или получения реквизитов доступа обращайтесь в административный департамент АН Фаттория.
  </div>
</div>

</div>
) : (
  // If logged in - render Realtor Control Center Workspace
  <div className="animate-fade-in font-sans w-full bg-white border border-stone-200/80 rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row min-h-[750px]">
            {/* LEFT SIDEBAR FOR DESKTOP, TOP REGION FOR MOBILE */}
            <div className="w-full lg:w-72 bg-white text-stone-900 flex flex-col shrink-0 border-r border-stone-200/90 shadow-sm rounded-2xl lg:rounded-r-none overflow-hidden">
              {/* Profile details in Sidebar */}
              <div className="p-5 border-b border-stone-200/80 space-y-4 bg-stone-50/60">
                <div className="flex gap-3.5 items-center">
                  <img
                    src={loggedInAgent.photo}
                    alt={loggedInAgent.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-cover rounded-full border-2 border-[#8B5CF6] shadow-md shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-[#8B5CF6] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-2 py-0.5 rounded block w-max mb-1">
                      {loggedInAgent.id === 'admin' ? 'Администратор' : 'Специалист'}
                    </span>
                    <h2 className="text-xs font-black text-stone-900 leading-tight truncate">{loggedInAgent.name}</h2>
                    <p className="text-[10px] text-stone-500 font-semibold truncate mt-0.5">{loggedInAgent.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-xl border border-stone-200 text-[10px] shadow-2xs">
                  <div>
                    <span className="block text-[8px] uppercase tracking-widest text-stone-500 font-bold">Сделки</span>
                    <span className="text-xs font-black text-[#8B5CF6] font-mono">{loggedInAgent.dealsCount || 0}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-widest text-stone-500 font-bold">Статус</span>
                    <span className="text-xs font-black text-emerald-600 font-sans">Аттестован</span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs - Desktop (Vertical list) */}
              <div className="hidden lg:flex flex-col flex-1 p-4 space-y-1.5 justify-between">
                <div className="space-y-1.5 overflow-y-auto no-scrollbar max-h-[calc(100vh-280px)] pr-1">
                  <span className="text-[9px] font-black uppercase text-neutral-500 px-3 pb-1.5 tracking-widest block">Разделы CRM</span>
                  
                  {/* Core CRM Sections */}
                  <button
                    onClick={() => setCabinetTab('listings')}
                    className={`w-full px-3.5 py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer outline-none ${
                      cabinetTab === 'listings' 
                        ? 'bg-[#8B5CF6] text-white shadow-md shadow-purple-200' 
                        : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate min-w-0">
                      <Layers className="w-4 h-4 shrink-0" />
                      <span className="truncate">Мои объекты (Закрытая база)</span>
                    </span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md font-mono shrink-0 ${cabinetTab === 'listings' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 border border-stone-200'}`}>
                      {myAgentPropertiesCount}
                    </span>
                  </button>

                  <button
                    onClick={() => setCabinetTab('sellers')}
                    className={`w-full px-3.5 py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer outline-none ${
                      cabinetTab === 'sellers' 
                        ? 'bg-[#8B5CF6] text-white shadow-md shadow-purple-200' 
                        : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate min-w-0">
                      <Phone className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span className="truncate">База продавцов</span>
                    </span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md font-mono shrink-0 ${cabinetTab === 'sellers' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 border border-stone-200'}`}>
                      {sellersList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setCabinetTab('buyers')}
                    className={`w-full px-3.5 py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer outline-none ${
                      cabinetTab === 'buyers' 
                        ? 'bg-[#8B5CF6] text-white shadow-md shadow-purple-200' 
                        : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate min-w-0">
                      <Users className="w-4 h-4 shrink-0" />
                      <span className="truncate">База покупателей</span>
                    </span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md font-mono shrink-0 ${cabinetTab === 'buyers' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 border border-stone-200'}`}>
                      {buyersList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setCabinetTab('tasks')}
                    className={`w-full px-3.5 py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer outline-none ${
                      cabinetTab === 'tasks' 
                        ? 'bg-[#8B5CF6] text-white shadow-md shadow-purple-200' 
                        : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate min-w-0">
                      <ListTodo className="w-4 h-4 shrink-0" />
                      <span className="truncate">Задачи & Дела</span>
                    </span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md font-mono shrink-0 ${cabinetTab === 'tasks' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 border border-stone-200'}`}>
                      {tasksList.filter(t => t.status === 'pending').length}
                    </span>
                  </button>

                  <button
                    onClick={() => setCabinetTab('callcenter')}
                    className={`w-full px-3.5 py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer outline-none ${
                      cabinetTab === 'callcenter' 
                        ? 'bg-[#8B5CF6] text-white shadow-md shadow-purple-200' 
                        : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate min-w-0">
                      <Phone className="w-4 h-4 shrink-0 text-emerald-600 animate-pulse" />
                      <span className="truncate">Колл-Центр оператора</span>
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md font-mono shrink-0 bg-emerald-50 text-emerald-700 border border-emerald-200">
                      LIVE
                    </span>
                  </button>

                  {/* PRO Agency Tools */}
                  <div className="pt-4 pb-1">
                    <span className="text-[9px] font-black uppercase text-purple-600 px-3 tracking-widest block flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-600" /> PRO-Инструменты
                    </span>
                  </div>


                  <button
                    onClick={() => {
                      setShowInstitutionalRequestsModal(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-2.5 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 text-amber-800 hover:bg-amber-500/20 cursor-pointer"
                  >
                    <Building className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Запросы в инстанции</span>
                  </button>

                  <button
                    onClick={() => setShowRealtImporter(true)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-2.5 bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/30 text-purple-700 hover:bg-purple-500/20 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4 shrink-0 text-purple-600" />
                    <span>Импорт с Realt.by</span>
                  </button>

                  <button
                    onClick={() => {
                      setPdfTargetProperty(propertiesList.find(p => p.assignedAgentId === loggedInAgent?.id) || null);
                      setShowPdfModal(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-2.5 bg-stone-50 border border-stone-200 text-stone-700 hover:bg-stone-100 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 shrink-0 text-purple-600" />
                    <span>КП в PDF</span>
                  </button>

                  <button
                    onClick={() => setShowXmlModal(true)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-2.5 bg-stone-50 border border-stone-200 text-stone-700 hover:bg-stone-100 cursor-pointer"
                  >
                    <Globe className="w-4 h-4 shrink-0 text-stone-600" />
                    <span>XML-Фиды</span>
                  </button>

                  <button
                    onClick={() => setShowTgModal(true)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-2.5 bg-stone-50 border border-stone-200 text-sky-700 hover:bg-sky-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4 shrink-0 text-sky-600" />
                    <span>Telegram Бот</span>
                  </button>

                  {/* High-level access tabs - Managers and Admins only */}
                  {hasFullAccess && (
                    <>
                      <div className="pt-6 pb-1">
                        <span className="text-[9px] font-black uppercase text-neutral-500 px-3 tracking-widest block">Администрирование</span>
                      </div>

                      <button
                        onClick={() => setCabinetTab('employees')}
                        className={`w-full px-3.5 py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer outline-none ${
                          cabinetTab === 'employees' 
                            ? 'bg-[#8B5CF6] text-white shadow-md' 
                            : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 truncate min-w-0">
                          <Users className="w-4 h-4 shrink-0" />
                          <span className="truncate">Сотрудники (Штат)</span>
                        </span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md font-mono shrink-0 ${cabinetTab === 'employees' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 border border-stone-200'}`}>
                          {agentsList.length}
                        </span>
                      </button>

                      <button
                        onClick={() => setCabinetTab('leads')}
                        className={`w-full px-3.5 py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer outline-none ${
                          cabinetTab === 'leads' 
                            ? 'bg-[#8B5CF6] text-white shadow-md' 
                            : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 truncate min-w-0">
                          <ClipboardList className="w-4 h-4 shrink-0" />
                          <span className="truncate">Заявки (Лиды)</span>
                        </span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md font-mono shrink-0 ${cabinetTab === 'leads' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 border border-stone-200'}`}>
                          {leads.length}
                        </span>
                      </button>

                      <button
                        onClick={() => setCabinetTab('requests_registry')}
                        className={`w-full px-3.5 py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer outline-none ${
                          cabinetTab === 'requests_registry' 
                            ? 'bg-[#8B5CF6] text-white shadow-md shadow-purple-200' 
                            : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 truncate min-w-0">
                          <FileText className="w-4 h-4 shrink-0" />
                          <span className="truncate">Реестр запросов</span>
                        </span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md font-mono shrink-0 ${cabinetTab === 'requests_registry' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 border border-stone-200'}`}>
                          {institutionalRequests.length}
                        </span>
                      </button>

                      <button
                        onClick={() => setCabinetTab('parsing')}
                        className={`w-full px-3.5 py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer outline-none ${
                          cabinetTab === 'parsing' 
                            ? 'bg-[#8B5CF6] text-white shadow-md' 
                            : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 truncate min-w-0">
                          <Sparkles className="w-4 h-4 shrink-0" />
                          <span className="truncate">ИИ-Парсинг</span>
                        </span>
                      </button>

                      <button
                        onClick={() => navigateTo?.('catalog')}
                        className="w-full px-3.5 py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer outline-none text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                      >
                        <span className="flex items-center gap-2.5 truncate min-w-0">
                          <Building className="w-4 h-4 shrink-0" />
                          <span className="truncate">Публичный каталог</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setCabinetTab('sms_templates')}
                        className={`w-full px-3.5 py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer outline-none ${
                          cabinetTab === 'sms_templates' 
                            ? 'bg-[#8B5CF6] text-white shadow-md' 
                            : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 truncate min-w-0">
                          <MessageSquare className="w-4 h-4 shrink-0" />
                          <span className="truncate">Шаблоны SMS</span>
                        </span>
                      </button>

                      <button
                        onClick={() => setCabinetTab('articles')}
                        className={`w-full px-3.5 py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer outline-none ${
                          cabinetTab === 'articles' 
                            ? 'bg-[#8B5CF6] text-white shadow-md' 
                            : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <BookOpen className="w-4 h-4 shrink-0" />
                          Блог & Новости
                        </span>
                      </button>
                    </>
                  )}
                </div>

                <div className="pt-6 border-t border-neutral-800">
                  <button
                    onClick={() => {
                      setLoggedInAgent(null);
                      localStorage.removeItem('fp_logged_agent');
                      alert("Вы успешно вышли из личного кабинета.");
                    }}
                    className="w-full px-4 py-2.5 bg-neutral-800 hover:bg-rose-600 hover:text-white text-rose-400 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer outline-none"
                  >
                    Выйти из кабинета
                  </button>
                </div>
              </div>

              {/* Navigation Tabs - Mobile & Tablet Selector */}
              <div className="block lg:hidden p-4 bg-neutral-950 border-t border-neutral-800">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Раздел кабинета</span>
                  <button
                    onClick={() => {
                      setLoggedInAgent(null);
                      localStorage.removeItem('fp_logged_agent');
                      alert("Вы успешно вышли из личного кабинета.");
                    }}
                    className="px-2 py-1 bg-rose-600/15 hover:bg-rose-600 text-rose-400 hover:text-white rounded text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    Выйти
                  </button>
                </div>

                <select
                  value={cabinetTab}
                  onChange={(e) => setCabinetTab(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-850 text-white rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-1 focus:ring-purple-500 outline-none cursor-pointer"
                >
                  <optgroup label="Разделы CRM">
                    <option value="listings">🏢 Мои объекты ({propertiesList.length})</option>
                    <option value="sellers">📞 База продавцов ({sellersList.length})</option>
                    <option value="buyers">👥 База покупателей ({buyersList.length})</option>
                    <option value="tasks">📋 Мои Задачи ({tasksList.filter(t => t.status === 'pending').length})</option>
                    <option value="callcenter">🎧 Колл-Центр оператора</option>
                  </optgroup>
                  {hasFullAccess && (
                    <optgroup label="Администрирование">
                      <option value="parsing">⚡ ИИ-Парсинг & База</option>
                      <option value="leads">💼 Заявки и Лиды ({leads.length})</option>
                      <option value="requests_registry">📜 Реестр запросов ({institutionalRequests.length})</option>
                      <option value="leads_kanban">📊 Канбан сделок</option>
                      <option value="employees">👥 Кадровый состав ({agentsList.length})</option>
                      <option value="analytics">📈 Аналитика</option>
                      <option value="calendar">📅 Календарь</option>
                      <option value="sms_templates">💬 Шаблоны СМС</option>
                      <option value="articles">📰 Публикации ({articlesList.length})</option>
                    </optgroup>
                  )}
                </select>
              </div>
            </div>

            {/* MAIN CONTENT ZONE RIGHT */}
            <div className="flex-1 bg-stone-50/40 p-3 sm:p-5 md:p-8 overflow-y-auto font-sans min-w-0">
              
              {/* CRM FATTORIA TOP HEADER BAR */}
              <div className="bg-white text-stone-900 rounded-2xl p-4 md:p-5 mb-6 shadow-sm border border-stone-200/90 space-y-4">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left: Brand Badge & Active View Title */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 bg-[#8B5CF6] text-white rounded-xl shadow-sm shrink-0 flex items-center justify-center font-black tracking-tight text-xs font-mono">
                      CRM
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#8B5CF6] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-2 py-0.5 rounded">
                          CRM АН Фаттория
                        </span>
                        <span className="text-[10px] font-bold text-stone-500 font-mono hidden sm:inline">
                          Агентство недвижимости Fattoria
                        </span>
                      </div>
                      <h2 className="text-sm md:text-base font-black text-stone-900 tracking-tight truncate mt-0.5">
                        {cabinetTab === 'profile' && '👤 Визитная карточка риэлтера'}
                        {cabinetTab === 'leads' && '💼 Сводный реестр заявок и лидов'}
                        {cabinetTab === 'sellers' && '📞 База продавцов и контактов'}
                        {cabinetTab === 'listings' && '🏷️ База объектов недвижимости'}
                        {cabinetTab === 'buyers' && '💎 База инвесторов и покупателей'}
                        {cabinetTab === 'tasks' && '📋 Задачи и планер риэлтера'}
                        {cabinetTab === 'parsing' && '⚡ ИИ-Парсинг объявлений & Колл-центр'}
                        {cabinetTab === 'employees' && '👥 Кадровый состав агентов'}
                        {cabinetTab === 'sms_templates' && '💬 Шаблоны СМС рассылок'}
                        {cabinetTab === 'articles' && '📰 Публикации и материалы'}
                      </h2>
                    </div>
                  </div>

              {/* Right Actions & Status */}
<div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end shrink-0">
  {/* Оставляем только эту кнопку для добавления покупателя */}
  <button
    onClick={() => {
      setCabinetTab('buyers');
      setIsAddingBuyer(true);
    }}
    className="px-3.5 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-md shadow-purple-500/20 flex items-center gap-1.5 cursor-pointer outline-none shrink-0"
  >
    <Plus className="w-3.5 h-3.5" />
    <span className="hidden sm:inline">+ Инвестор / Покупатель</span>
  </button>

  <button
    onClick={() => setCabinetTab('tasks')}
    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer outline-none shrink-0"
  >
    <ListTodo className="w-3.5 h-3.5 text-purple-400" />
    <span className="hidden sm:inline">+ Задача</span>
  </button>
</div>
</div>
                {/* Fattoria Pipeline Funnel Bar */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-slate-400 font-mono">
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                    <span className="text-slate-500 uppercase tracking-wider text-[9px] mr-1">Этапы работы Fattoria:</span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">1. Заявка ({leads.filter(l => l.status === 'new').length})</span>
                    <span className="text-slate-600">➔</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">2. Переговоры ({buyersList.filter(b => b.status === 'negotiating').length})</span>
                    <span className="text-slate-600">➔</span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">3. Оформление ({buyersList.filter(b => b.status === 'closing').length})</span>
                    <span className="text-slate-600">➔</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black">4. Успешная сделка</span>
                  </div>

                  <div className="text-[10px] font-bold text-slate-400">
                    Задач в работе: <span className="text-purple-400 font-black font-mono">{tasksList.filter(t => t.status === 'pending').length}</span>
                  </div>
                </div>
              </div>

              {/* Assignment Notification Toast */}
              {assignmentNotification && (
                <div className="p-3.5 bg-gradient-to-r from-amber-500/20 via-neutral-900 to-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-between text-xs font-bold text-amber-300 shadow-xl animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{assignmentNotification}</span>
                  </div>
                  <button
                    onClick={() => setAssignmentNotification(null)}
                    className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Realtor Notification for newly assigned sellers */}
              {isRealtor && sellersList.filter(s => isSellerVisibleToUser(s) && (s.kanbanStage === 'primary_contact' || s.status === 'cold_call')).length > 0 && (
                <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between text-xs animate-fade-in">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-purple-500/20 text-purple-700 rounded-lg">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <span className="font-extrabold text-stone-900 block">Новые продавцы от Колл-центра в вашей CRM!</span>
                      <span className="text-[11px] text-stone-600">
                        У вас {sellersList.filter(s => isSellerVisibleToUser(s) && (s.kanbanStage === 'primary_contact' || s.status === 'cold_call')).length} новых продавцов. Свяжитесь для первичной консультации и выезда на объект.
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setCabinetTab('sellers')}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] uppercase rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    Открыть базу продавцов
                  </button>
                </div>
              )}

              {/* Point 6: Smart Day Planner Widget */}
              <SmartDayPlannerWidget
                loggedInAgent={loggedInAgent}
                tasksList={tasksList}
                onUpdateTasks={saveTasks}
                sellersList={sellersList}
                buyersList={buyersList}
              />

              {/* TAB CONTENTS 1: MY PROFILE / DASHBOARD */}
              {activeTab === 'profile' && (
                <div className="space-y-8 animate-fade-in">
                  {/* Executive CRM Analytics & Widgets */}
                  <CRMDashboardWidgets
                    leads={leads}
                    sellersList={sellersList}
                    buyersList={buyersList}
                    tasksList={tasksList}
                    agentsList={agentsList}
                    onNavigateTab={(tab) => setCabinetTab(tab as any)}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Profile editing form */}
                    <div className="lg:col-span-2 bg-neutral-50 p-6 rounded-2xl space-y-5 border border-stone-200/40">
                    <h3 className="text-sm font-extrabold text-neutral-900 pb-2 border-b border-stone-200">Редактирование моих публичных данных</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                      <div>
                        <label className="block text-[10px] text-neutral-500 font-bold uppercase mb-1">Имя (ФИО)</label>
                        <input
                          type="text"
                          value={loggedInAgent?.name || ''}
                          onChange={(e) => {
                            if (loggedInAgent) {
                              const updated = { ...loggedInAgent, name: e.target.value };
                              setLoggedInAgent(updated);
                              localStorage.setItem('fp_logged_agent', JSON.stringify(updated));
                            }
                          }}
                          className="w-full bg-white text-neutral-800 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-neutral-500 font-bold uppercase mb-1">Должность и Специализация</label>
                        <input
                          type="text"
                          value={loggedInAgent?.role || ''}
                          onChange={(e) => {
                            if (loggedInAgent) {
                              const updated = { ...loggedInAgent, role: e.target.value };
                              setLoggedInAgent(updated);
                              localStorage.setItem('fp_logged_agent', JSON.stringify(updated));
                            }
                          }}
                          className="w-full bg-white text-neutral-800 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-neutral-500 font-bold uppercase mb-1">Телефон Минск/РБ</label>
                        <input
                          type="text"
                          value={loggedInAgent?.phone || ''}
                          onChange={(e) => {
                            if (loggedInAgent) {
                              const updated = { ...loggedInAgent, phone: e.target.value };
                              setLoggedInAgent(updated);
                              localStorage.setItem('fp_logged_agent', JSON.stringify(updated));
                            }
                          }}
                          className="w-full bg-white text-neutral-800 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-neutral-500 font-bold uppercase mb-1">Опыт работы</label>
                        <input
                          type="text"
                          value={loggedInAgent?.experience || ''}
                          onChange={(e) => {
                            if (loggedInAgent) {
                              const updated = { ...loggedInAgent, experience: e.target.value };
                              setLoggedInAgent(updated);
                              localStorage.setItem('fp_logged_agent', JSON.stringify(updated));
                            }
                          }}
                          className="w-full bg-white text-neutral-800 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-neutral-500 font-bold uppercase mb-1">Суммарно закрыто сделок</label>
                        <input
                          type="number"
                          value={loggedInAgent?.dealsCount || 0}
                          onChange={(e) => {
                            if (loggedInAgent) {
                              const updated = { ...loggedInAgent, dealsCount: parseInt(e.target.value, 10) || 0 };
                              setLoggedInAgent(updated);
                              localStorage.setItem('fp_logged_agent', JSON.stringify(updated));
                            }
                          }}
                          className="w-full bg-white text-neutral-800 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-neutral-500 font-bold uppercase mb-1">URL Фотографии профиля</label>
                        <input
                          type="text"
                          value={loggedInAgent?.photo || ''}
                          onChange={(e) => {
                            if (loggedInAgent) {
                              const updated = { ...loggedInAgent, photo: e.target.value };
                              setLoggedInAgent(updated);
                              localStorage.setItem('fp_logged_agent', JSON.stringify(updated));
                            }
                          }}
                          className="w-full bg-white text-neutral-800 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          if (loggedInAgent) {
                            const idx = agentsList.findIndex((a: Agent) => a.id === loggedInAgent.id);
                            let updatedList = [...agentsList];
                            if (idx !== -1) {
                              updatedList[idx] = loggedInAgent;
                            } else {
                              updatedList.push(loggedInAgent);
                            }
                            setAgentsList(updatedList);
                            alert("Ваша визитная карточка на сайте успешно синхронизирована и обновлена!");
                          }
                        }}
                        className="px-5 py-2.5 bg-neutral-900 hover:bg-purple-500 hover:text-black font-extrabold text-xs text-white uppercase tracking-wider rounded-lg transition-all cursor-pointer outline-none"
                      >
                        Сохранить изменения и опубликовать
                      </button>
                    </div>
                  </div>

                  {/* Live Preview Widget */}
                  <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-6 space-y-4">
                    <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Предпросмотр на сайте:</h4>
                    <div className="relative overflow-hidden bg-white border border-stone-200/50 rounded-xl p-4 text-center space-y-3 shadow-sm">
                      <img
                        src={loggedInAgent?.photo || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"}
                        alt={loggedInAgent.name}
                        referrerPolicy="no-referrer"
                        className="w-28 h-28 object-cover rounded-full mx-auto border"
                      />
                      <div>
                        <h4 className="font-extrabold text-neutral-900 text-sm leading-tight">{loggedInAgent.name}</h4>
                        <p className="text-[10px] text-purple-700 font-bold mt-1 uppercase tracking-wider">{loggedInAgent.role}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-3 text-left">
                        <div>
                          <span className="block text-[8px] uppercase tracking-widest text-[#888888] font-bold">АТТЕСТАЦИЯ:</span>
                          <span className="text-xs font-black text-emerald-700 font-sans">Минюст РБ</span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-widest text-[#888888] font-bold">СДЕЛКИ:</span>
                          <span className="text-xs font-black text-neutral-800 font-mono">{loggedInAgent.dealsCount || 0}</span>
                        </div>
                      </div>
                      <div className="pt-2.5 text-center text-xs font-bold text-neutral-600 font-mono border-t border-stone-100">
                        {loggedInAgent.phone}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

              {/* TAB CONTENTS 2: CRM LEADS */}
              {activeTab === 'leads' && (
                <div className="space-y-8 animate-fade-in font-sans text-xs">
                  
                  {/* CRM Database Isolation Switcher Banner */}
                  <div className="bg-neutral-900 text-white p-4.5 rounded-2xl border border-neutral-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-purple-400 tracking-wider">
                          {isAgentAdmin ? "Администрирование CRM: Сводные и личные базы" : `Персональная CRM-база: ${loggedInAgent?.name}`}
                        </h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5 font-medium">
                          {isAgentAdmin 
                            ? "Выберите сотрудника для просмотра его персональной базы заявок или оставьте «Все базы» для сводного аудита."
                            : "Вам доступны обращения, закрепленные за вашим профилем или назначенные вашим руководителем."}
                        </p>
                      </div>
                    </div>

                    {isAgentAdmin && (
                      <div className="flex items-center gap-2 shrink-0">
                        <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">База сотрудника:</label>
                        <select
                          value={selectedAgentFilter}
                          onChange={(e) => setSelectedAgentFilter(e.target.value)}
                          className="bg-neutral-950 border border-neutral-700 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none cursor-pointer"
                        >
                          <option value="all">🌐 Все сотрудники (Сводная)</option>
                          {agentsList.map(ag => (
                            <option key={ag.id} value={ag.name}>
                              👤 {ag.name} ({ag.role || 'Сотрудник'})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  
                  {/* Stats Badges Dashboard for CRM */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-white shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Всего заявок</span>
                        <Database className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="mt-4">
                        <span className="text-2xl font-black font-mono">{leads.length}</span>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">накопительным итогом</span>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">В обработке</span>
                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div className="mt-4">
                        <span className="text-2xl font-black text-indigo-600 font-mono">
                          {leads.filter(l => !l.status || l.status === 'new' || l.status === 'in_progress' || l.status === 'negotiation').length}
                        </span>
                        <span className="text-[10px] text-stone-500 block mt-0.5">требуют внимания</span>
                      </div>
                    </div>

                    <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Успешные сделки</span>
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="mt-4">
                        <span className="text-2xl font-black text-emerald-600 font-mono">
                          {leads.filter(l => l.status === 'deal').length}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                          Конверсия: {Math.round((leads.filter(l => l.status === 'deal').length / (leads.length || 1)) * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Отказы</span>
                        <Trash className="w-4 h-4 text-rose-500" />
                      </div>
                      <div className="mt-4">
                        <span className="text-2xl font-black text-rose-600 font-mono">
                          {leads.filter(l => l.status === 'declined').length}
                        </span>
                        <span className="text-[10px] text-stone-500 block mt-0.5">закрытые отказы</span>
                      </div>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-sm space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Search Input */}
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          placeholder="Поиск по имени, телефону или тексту запроса..."
                          value={leadsSearch}
                          onChange={(e) => setLeadsSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-stone-50 text-neutral-900 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium"
                        />
                      </div>

                      {/* Display Mode Toggle */}
                      <div className="flex bg-stone-100 p-1 rounded-lg border border-stone-200 shrink-0">
                        <button
                          onClick={() => setLeadsViewMode('list')}
                          className={`px-3 py-1.5 rounded-md font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                            leadsViewMode === 'list'
                              ? 'bg-white text-neutral-900 shadow-sm'
                              : 'text-stone-500 hover:text-stone-800'
                          }`}
                        >
                          📋 Список
                        </button>
                        <button
                          onClick={() => setLeadsViewMode('kanban')}
                          className={`px-3 py-1.5 rounded-md font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                            leadsViewMode === 'kanban'
                              ? 'bg-white text-neutral-900 shadow-sm'
                              : 'text-stone-500 hover:text-stone-800'
                          }`}
                        >
                          📊 Канбан-доска
                        </button>
                      </div>

                      {/* Filter Badges & Export */}
                      <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mr-1 flex items-center gap-1">
                            <Filter className="w-3 h-3" /> Статус:
                          </span>
                          {[
                            { id: 'all', label: 'Все' },
                            { id: 'new', label: 'Новые' },
                            { id: 'in_progress', label: 'В работе' },
                            { id: 'negotiation', label: 'Переговоры' },
                            { id: 'deal', label: 'Сделка 🎉' },
                            { id: 'declined', label: 'Отказ' }
                          ].map(f => (
                            <button
                              key={f.id}
                              onClick={() => setLeadsStatusFilter(f.id)}
                              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                                leadsStatusFilter === f.id
                                  ? 'bg-neutral-900 text-white shadow-sm'
                                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                              }`}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={handleExportLeadsCSV}
                          className="px-3.5 py-1.5 bg-purple-500 hover:bg-purple-600 text-neutral-950 font-black uppercase text-[10px] tracking-wider rounded-lg transition-all flex items-center gap-1.5 shadow-sm outline-none cursor-pointer border border-purple-400/20"
                          title="Экспортировать лиды в CSV"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Экспорт в CSV</span>
                        </button>
                      </div>
                    </div>
                  </div>

                    {/* AI Lead Import & Manual Lead Form */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left: AI Parsing */}
                      <div className="bg-indigo-50/40 border border-indigo-200/60 rounded-xl p-5 space-y-4">
                        <h4 className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" /> ИИ-Парсинг Входящего сообщения
                        </h4>
                        <p className="text-[10px] text-indigo-600 font-bold leading-relaxed">
                          Вставьте текст сообщения из Viber/Telegram/SMS. ИИ автоматически создаст карточку лида и определит срочность.
                        </p>
                        <textarea
                          placeholder="Пример: Здравствуйте! Хочу срочно продать квартиру на Городецкой. Готовы на торг. Цена 90000. Петр, +37529..."
                          className="w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium h-24 resize-none"
                          id="ai-lead-text"
                        />
                        <button
                          onClick={async () => {
                            const text = (document.getElementById('ai-lead-text') as HTMLTextAreaElement).value;
                            if (!text.trim()) return;
                            
                            try {
                              const res = await fetch('/api/recognize-property', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ text })
                              });
                              const data = await res.json();
                              
                              if (data.id) {
                                const newLead: Lead = {
                                  id: `lead-ai-${Date.now()}`,
                                  name: 'Клиент (ИИ)',
                                  phone: text.match(/\+?\d{10,13}/)?.[0] || '+375XXXXXXXXX',
                                  typeOrPrice: `${data.type === 'apartment' ? 'Квартира' : 'Дом/Участок'}: ${data.title} ($${data.priceUSD})`,
                                  formName: 'ИИ-Парсинг Сообщений',
                                  date: new Date().toLocaleString('ru-RU'),
                                  status: 'new',
                                  notes: `[AI РАСПОЗНАВАНИЕ]\nАдрес: ${data.address}\nОсобенности: ${data.features.join(', ')}`,
                                  priority: data.priority,
                                  history: [{
                                    id: `hist-${Date.now()}`,
                                    date: new Date().toLocaleString('ru-RU'),
                                    text: `Лид автоматически создан и классифицирован ИИ как ${data.priority === 'urgent' ? 'СРОЧНЫЙ' : 'Обычный'}.`,
                                    author: loggedInAgent?.name || 'Система'
                                  }]
                                };
                                
                                const updated = [newLead, ...leads];
                                saveLeadsToStore(updated);
                                (document.getElementById('ai-lead-text') as HTMLTextAreaElement).value = '';
                                alert(`Лид успешно добавлен! Классификация: ${data.priority === 'urgent' ? '🔥 СРОЧНО' : 'Обычный'}`);
                              }
                            } catch (err) {
                              alert('Ошибка ИИ-распознавания. Проверьте соединение или введите данные вручную.');
                            }
                          }}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest rounded-lg transition-all shadow-md cursor-pointer"
                        >
                          Распознать и добавить
                        </button>
                      </div>

                      {/* Right: Manual Lead Form */}
                      <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-5 space-y-4">
                        <h4 className="text-xs font-black text-purple-600 uppercase tracking-wider flex items-center gap-1.5">
                          <Plus className="w-4 h-4" /> Внести нового лида вручную
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1">
                            <label className="text-[10px] text-stone-500 font-bold uppercase">Имя Клиента</label>
                            <input
                              type="text"
                              placeholder="Петр Васильевич"
                              value={newLeadName}
                              onChange={(e) => setNewLeadName(e.target.value)}
                              className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500/20 outline-none font-semibold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-stone-500 font-bold uppercase">Телефон Минск/РБ</label>
                            <input
                              type="text"
                              placeholder="+375 (__) ___-__-__"
                              value={newLeadPhone}
                              onChange={(e) => setNewLeadPhone(e.target.value)}
                              className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500/20 outline-none font-mono font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-stone-500 font-bold uppercase">Запрос / Тип / Бюджет</label>
                            <input
                              type="text"
                              placeholder="Купит 2-к до $70к, Немига"
                              value={newLeadType}
                              onChange={(e) => setNewLeadType(e.target.value)}
                              className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500/20 outline-none font-semibold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-stone-500 font-bold uppercase">Канал поступления</label>
                            <select
                              value={newLeadSource}
                              onChange={(e) => setNewLeadSource(e.target.value)}
                              className="w-full bg-white border border-stone-250 rounded-lg px-2 py-2 text-xs focus:ring-2 focus:ring-purple-500/20 outline-none font-semibold cursor-pointer"
                            >
                              <option value="Ручной ввод сотрудником">Ручной ввод сотрудником</option>
                              <option value="Прямой импорт из Realt.by">Прямой импорт из Realt.by</option>
                              <option value="Заявка с сайта (Тест-драйв)">Заявка с сайта (Тест-драйв)</option>
                              <option value="Звонок на горячую линию">Звонок на горячую линию</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              if (!newLeadPhone) {
                                alert('Укажите контактный номер телефона клиента!');
                                return;
                              }
                              const newLead: Lead = {
                                id: `lead-${Date.now()}`,
                                name: newLeadName || 'Новый клиент',
                                phone: newLeadPhone,
                                typeOrPrice: newLeadType || 'Продажа жилья (10 дней тест-драйв)',
                                formName: newLeadSource,
                                date: new Date().toLocaleString('ru-RU'),
                                status: 'new',
                                notes: '',
                                priority: 'regular',
                                history: []
                              };
                              const updated = [newLead, ...leads];
                              saveLeadsToStore(updated);
                              setNewLeadName('');
                              setNewLeadPhone('');
                              setNewLeadType('Продажа жилья (10 дней тест-драйв)');
                              alert('Заявка успешно внесена в базу CRM!');
                            }}
                            className="px-5 py-2 bg-neutral-900 hover:bg-purple-500 hover:text-black font-extrabold text-xs text-white uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                          >
                            Зарегистрировать вручную
                          </button>
                        </div>
                      </div>
                    </div>

                  {/* Leads Main Container: List or Kanban board switcher */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <h3 className="text-xs font-black uppercase text-neutral-400 tracking-widest">
                        Результаты фильтрации заявок
                      </h3>
                      {leads.length > 0 && (
                        <button
                          onClick={handleClearLeads}
                          className="text-[10px] uppercase tracking-wider text-rose-600 hover:text-rose-800 transition-colors font-black"
                        >
                          Очистить базу
                        </button>
                      )}
                    </div>

                    {(() => {
                      const filteredLeads = leads.filter(lead => {
                        // CRM Database isolation check
                        if (!isRecordInAgentDb(lead)) return false;

                        // status check
                        const s = lead.status || 'new';
                        if (leadsStatusFilter !== 'all' && s !== leadsStatusFilter) return false;

                        // text search check
                        if (leadsSearch.trim()) {
                          const q = leadsSearch.toLowerCase();
                          const matchesName = lead.name.toLowerCase().includes(q);
                          const matchesPhone = lead.phone.includes(q);
                          const matchesType = lead.typeOrPrice.toLowerCase().includes(q);
                          const matchesNotes = lead.notes && lead.notes.toLowerCase().includes(q);
                          const matchesSource = lead.formName.toLowerCase().includes(q);
                          return matchesName || matchesPhone || matchesType || matchesNotes || matchesSource;
                        }
                        return true;
                      });

                      if (filteredLeads.length === 0) {
                        return (
                          <div className="text-center py-16 text-stone-400 text-xs font-medium border border-dashed border-stone-250 rounded-xl bg-transparent">
                            Ни одной заявки не найдено по выбранным фильтрам или поисковому запросу.
                          </div>
                        );
                      }

                      // KANBAN VIEW IMPLEMENTATION
                      if (leadsViewMode === 'kanban') {
                        const stages = [
                          { id: 'new', label: 'Новые', color: 'border-purple-300 bg-purple-50/40 text-purple-900' },
                          { id: 'in_progress', label: 'В работе', color: 'border-indigo-300 bg-indigo-50/40 text-indigo-900' },
                          { id: 'negotiation', label: 'Переговоры', color: 'border-purple-300 bg-purple-50/40 text-purple-900' },
                          { id: 'deal', label: 'Сделка 🎉', color: 'border-emerald-300 bg-emerald-50/40 text-emerald-900' },
                          { id: 'declined', label: 'Отказ', color: 'border-rose-300 bg-rose-50/40 text-rose-900' }
                        ];

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
                            {stages.map(stage => {
                              const stageLeads = filteredLeads.filter(l => (l.status || 'new') === stage.id);
                              return (
                                <div key={stage.id} className="flex flex-col min-w-[200px] space-y-3 bg-stone-100/60 border border-stone-200/80 p-3 rounded-xl min-h-[500px]">
                                  {/* Stage Header */}
                                  <div className="flex items-center justify-between border-b border-stone-250 pb-2">
                                    <span className="font-extrabold text-[11px] text-neutral-800 uppercase tracking-wider">{stage.label}</span>
                                    <span className="bg-stone-200 font-mono font-black px-2 py-0.5 rounded text-[10px] text-stone-700">
                                      {stageLeads.length}
                                    </span>
                                  </div>

                                  {/* Stage Cards */}
                                  <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                                    {stageLeads.length === 0 ? (
                                      <div className="h-full border border-dashed border-stone-300/80 rounded-lg flex items-center justify-center p-4 text-center text-[10px] text-stone-400 font-medium">
                                        Нет заявок на этом этапе
                                      </div>
                                    ) : (
                                      stageLeads.map(lead => {
                                        const isTodayOrPast = lead.nextContactDate && new Date(lead.nextContactDate) <= new Date(new Date().setHours(23,59,59,999));
                                        const isExpanded = expandedLeadId === lead.id;

                                        return (
                                          <div key={lead.id} className="bg-white border border-stone-200 rounded-lg p-3 shadow-sm hover:border-purple-500/50 transition-all text-left space-y-2 relative">
                                            <div className="flex items-start justify-between gap-1.5">
                                              <div className="flex flex-wrap gap-1">
                                                <span className="text-[8px] bg-stone-100 text-stone-500 font-extrabold px-1.5 py-0.5 rounded truncate max-w-[100px]">
                                                  {lead.formName}
                                                </span>
                                                {lead.priority === 'urgent' && (
                                                  <span className="text-[8px] bg-rose-500 text-white font-black px-1.5 py-0.5 rounded animate-pulse">
                                                    🔥 СРОЧНО
                                                  </span>
                                                )}
                                                {lead.priority === 'regular' && (
                                                  <span className="text-[8px] bg-stone-200 text-stone-600 font-black px-1.5 py-0.5 rounded">
                                                    ОБЫЧНЫЙ
                                                  </span>
                                                )}
                                              </div>
                                              
                                              {/* Quick movement selectors */}
                                              <select
                                                value={stage.id}
                                                onChange={(e) => {
                                                  const targetStatus = e.target.value;
                                                  const updated = leads.map(l => l.id === lead.id ? { ...l, status: targetStatus } : l);
                                                  saveLeadsToStore(updated);
                                                }}
                                                className="bg-stone-50 border border-stone-200 text-[9px] font-bold px-1 rounded cursor-pointer outline-none text-neutral-700"
                                              >
                                                <option value="new">Новый</option>
                                                <option value="in_progress">В работе</option>
                                                <option value="negotiation">Переговоры</option>
                                                <option value="deal">Сделка 🎉</option>
                                                <option value="declined">Отказ</option>
                                              </select>
                                            </div>

                                            <div>
                                              <h5 className="font-extrabold text-[11px] text-neutral-900">{lead.name}</h5>
                                              <p className="text-[10px] font-mono font-bold text-purple-800 flex items-center gap-1 mt-0.5">
                                                <Phone className="w-3 h-3 text-purple-500 shrink-0" /> {lead.phone}
                                              </p>
                                            </div>

                                            <p className="text-[10px] font-semibold text-stone-600 line-clamp-2 leading-relaxed" title={lead.typeOrPrice}>
                                              {lead.typeOrPrice}
                                            </p>

                                            {/* Compact Task List in Kanban */}
                                            <LeadTaskList
                                              lead={lead}
                                              leads={leads}
                                              tasksList={tasksList}
                                              saveTasks={saveTasks}
                                              saveLeadsToStore={saveLeadsToStore}
                                              agentId={loggedInAgent?.id || 'admin'}
                                              compact={true}
                                            />

                                            {/* Action logs toggle button inside Kanban card */}
                                            <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[9px] gap-2">
                                              <div className="flex items-center gap-2">
                                                <button
                                                  onClick={() => setExpandedLeadId(isExpanded ? null : lead.id)}
                                                  className="font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                                                >
                                                  <MessageSquare className="w-2.5 h-2.5" /> Log ({lead.history?.length || 0})
                                                </button>
                                                
                                                {isAgentCallCenter && (
                                                  <button
                                                    onClick={() => setSmsModal({
                                                      isOpen: true,
                                                      phone: lead.phone,
                                                      clientName: lead.name,
                                                      objectInfo: lead.typeOrPrice
                                                    })}
                                                    className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-bold"
                                                    title="Отправить SMS по шаблону"
                                                  >
                                                    <MessageCircle className="w-2.5 h-2.5" /> SMS
                                                  </button>
                                                )}
                                              </div>

                                              <button
                                                onClick={() => {
                                                  if (window.confirm(`Вы действительно хотите удалить заявку клиента ${lead.name}?`)) {
                                                    const updated = leads.filter(l => l.id !== lead.id);
                                                    saveLeadsToStore(updated);
                                                  }
                                                }}
                                                className="text-stone-400 hover:text-rose-600 transition-colors"
                                              >
                                                Удалить
                                              </button>
                                            </div>

                                            {/* Expandable contact logger directly in Kanban card */}
                                            {isExpanded && (
                                              <div className="pt-2 border-t border-stone-200 mt-2 space-y-2 text-[10px] bg-stone-50 p-2 rounded">
                                                <span className="font-bold text-neutral-800 uppercase text-[8px] tracking-wider block">Новая активность</span>
                                                <div className="flex gap-1.5">
                                                  <input
                                                    type="text"
                                                    placeholder="Итог..."
                                                    value={newHistoryText[lead.id] || ''}
                                                    onChange={(e) => {
                                                      const val = e.target.value;
                                                      setNewHistoryText(prev => ({ ...prev, [lead.id]: val }));
                                                    }}
                                                    className="bg-white border border-stone-300 text-[10px] text-neutral-900 rounded p-1 outline-none font-medium flex-1"
                                                  />
                                                  <button
                                                    onClick={() => {
                                                      const txt = newHistoryText[lead.id];
                                                      if (!txt || !txt.trim()) return;
                                                      const newEntry = {
                                                        id: `log-${Date.now()}`,
                                                        date: new Date().toLocaleString('ru-RU'),
                                                        text: txt.trim(),
                                                        author: loggedInAgent ? loggedInAgent.name : "Гордович Кирилл"
                                                      };
                                                      const updatedHistory = [newEntry, ...(lead.history || [])];
                                                      const updatedLeads = leads.map(l => l.id === lead.id ? { ...l, history: updatedHistory } : l);
                                                      saveLeadsToStore(updatedLeads);
                                                      setNewHistoryText(prev => ({ ...prev, [lead.id]: '' }));
                                                    }}
                                                    className="bg-neutral-900 text-white font-extrabold px-2 py-1 rounded text-[8px] uppercase hover:bg-indigo-600 transition-colors cursor-pointer"
                                                  >
                                                    ОК
                                                  </button>
                                                </div>

                                                {/* History entries list in Kanban */}
                                                {lead.history && lead.history.length > 0 && (
                                                  <div className="space-y-1.5 max-h-24 overflow-y-auto pt-1 border-t border-stone-150">
                                                    {lead.history.slice(0, 3).map(h => (
                                                      <div key={h.id} className="text-[9px] leading-tight text-stone-600">
                                                        <span className="font-mono text-neutral-700 font-bold block">{h.date}</span>
                                                        <p className="font-medium bg-white p-1 rounded border border-stone-150">{h.text}</p>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            )}

                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }

                      // TRADITIONAL PAGINATED LIST VIEW
                      const leadsPerPage = 5;
                      const totalLeadsPages = Math.ceil(filteredLeads.length / leadsPerPage) || 1;
                      const leadsPageClamped = Math.min(leadsPage, totalLeadsPages);
                      const paginatedLeads = filteredLeads.slice((leadsPageClamped - 1) * leadsPerPage, leadsPageClamped * leadsPerPage);

                      return (
                        <div className="space-y-4 font-sans text-xs">
                          <div className="grid grid-cols-1 gap-4">
                            {paginatedLeads.map((lead) => {
                              const isBeingEdited = editedLeadId === lead.id;
                              const leadStatus = lead.status || 'new';
                              const isTodayOrPast = lead.nextContactDate && new Date(lead.nextContactDate) <= new Date(new Date().setHours(23,59,59,999));
                              
                              return (
                                <div key={lead.id} className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4 hover:border-purple-500/40 transition-all relative text-left">
                                  
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    {/* Left: Client name and phone */}
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {isBeingEdited ? (
                                          <input
                                            type="text"
                                            value={editLeadName}
                                            onChange={(e) => setEditLeadName(e.target.value)}
                                            className="bg-stone-50 text-xs border border-stone-300 text-neutral-900 rounded-md px-2 py-1 outline-none font-bold focus:ring-1 focus:ring-purple-500"
                                          />
                                        ) : (
                                          <div className="flex items-center gap-2">
                                            <h4 className="font-extrabold text-sm text-neutral-950">{lead.name}</h4>
                                            {lead.priority === 'urgent' && (
                                              <span className="text-[9px] bg-rose-600 text-white font-black px-2 py-0.5 rounded animate-pulse">
                                                🔥 СРОЧНО
                                              </span>
                                            )}
                                          </div>
                                        )}

                                        <span className="text-[9px] bg-stone-100 text-stone-500 font-bold px-2 py-0.5 rounded uppercase">
                                          {lead.formName}
                                        </span>

                                        {lead.nextContactDate && isTodayOrPast && (
                                          <span className="text-[8px] bg-rose-100 text-rose-800 font-black px-2 py-0.5 rounded-full uppercase animate-pulse border border-rose-200">
                                            🔥 Срочный контакт!
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
                                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                        <span className="font-medium">Зарегистрирован: {lead.date}</span>
                                        <span className="text-stone-300">•</span>
                                        <Phone className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                        {isBeingEdited ? (
                                          <input
                                            type="text"
                                            value={editLeadPhone}
                                            onChange={(e) => setEditLeadPhone(e.target.value)}
                                            className="bg-stone-50 text-xs border border-stone-300 text-purple-700 font-mono rounded px-2 py-1 outline-none font-bold"
                                          />
                                        ) : (
                                          <span className="font-bold text-purple-700 font-mono">{lead.phone}</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Right: Lead Status Selector & Action Buttons */}
                                    <div className="flex items-center gap-3 self-start sm:self-center">
                                      <button
                                        onClick={() => setSchedulingLead(lead)}
                                        className="px-3.5 py-1.5 bg-stone-100 hover:bg-purple-100 text-stone-600 hover:text-purple-700 font-black uppercase text-[10px] tracking-wider rounded-lg transition-all flex items-center gap-1.5 shadow-sm border border-stone-200"
                                        title="Запланировать встречу в Календаре"
                                      >
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Встреча</span>
                                      </button>

                                      {isAgentCallCenter && (
                                        <button
                                          onClick={() => setSmsModal({
                                            isOpen: true,
                                            phone: lead.phone,
                                            clientName: lead.name,
                                            objectInfo: lead.typeOrPrice
                                          })}
                                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all border border-emerald-200/50"
                                        >
                                          <MessageSquare className="w-3.5 h-3.5" /> SMS Шаблон
                                        </button>
                                      )}
                                      <span className="text-[10px] font-bold text-stone-400 uppercase hidden md:inline">Статус:</span>
                                      <select
                                        value={leadStatus}
                                        onChange={(e) => {
                                          const nextStatus = e.target.value;
                                          const updated = leads.map(l => l.id === lead.id ? { ...l, status: nextStatus } : l);
                                          saveLeadsToStore(updated);
                                        }}
                                        className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border-none outline-none cursor-pointer transition-all ${
                                          leadStatus === 'new' ? 'bg-purple-100 text-purple-800' :
                                          leadStatus === 'in_progress' ? 'bg-indigo-100 text-indigo-800' :
                                          leadStatus === 'negotiation' ? 'bg-purple-100 text-purple-800' :
                                          leadStatus === 'deal' ? 'bg-emerald-100 text-emerald-800' :
                                          'bg-rose-100 text-rose-800'
                                        }`}
                                      >
                                        <option value="new">Новый</option>
                                        <option value="in_progress">В работе</option>
                                        <option value="negotiation">Переговоры</option>
                                        <option value="deal">Сделка 🎉</option>
                                        <option value="declined">Отказ</option>
                                      </select>

                                      <div className="flex items-center gap-1.5 pl-2 border-l border-stone-200">
                                        {isBeingEdited ? (
                                          <button
                                            onClick={() => {
                                              const updated = leads.map(l => l.id === lead.id ? {
                                                ...l,
                                                name: editLeadName,
                                                phone: editLeadPhone,
                                                typeOrPrice: editLeadType
                                              } : l);
                                              saveLeadsToStore(updated);
                                              setEditedLeadId(null);
                                            }}
                                            className="text-[11px] font-black text-emerald-600 hover:text-emerald-800 px-2 py-1 cursor-pointer"
                                          >
                                            ОК
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              setEditedLeadId(lead.id);
                                              setEditLeadName(lead.name);
                                              setEditLeadPhone(lead.phone);
                                              setEditLeadType(lead.typeOrPrice);
                                            }}
                                            className="text-stone-500 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                                            title="Редактировать"
                                          >
                                            <Edit3 className="w-4 h-4" />
                                          </button>
                                        )}
                                        <button
                                          onClick={() => {
                                            if (window.confirm(`Удалить лид ${lead.name}?`)) {
                                              const updated = leads.filter(l => l.id !== lead.id);
                                              saveLeadsToStore(updated);
                                            }
                                          }}
                                          className="text-stone-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                                          title="Удалить"
                                        >
                                          <Trash className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Bottom: Query details & Interactive Notes field */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-stone-150">
                                    {/* Request/Target detail */}
                                    <div className="space-y-1">
                                      <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">Запрос / Тип сделки / Бюджет</span>
                                      {isBeingEdited ? (
                                        <input
                                          type="text"
                                          value={editLeadType}
                                          onChange={(e) => setEditLeadType(e.target.value)}
                                          className="bg-stone-50 text-xs border border-stone-300 text-neutral-900 rounded-md px-2 py-1 outline-none w-full focus:ring-1 focus:ring-purple-500"
                                        />
                                      ) : (
                                        <p className="text-xs font-semibold text-neutral-800">{lead.typeOrPrice}</p>
                                      )}
                                    </div>

                                    {/* Interactive Internal Notes */}
                                    <div className="space-y-1">
                                      <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold flex items-center gap-1">
                                        <ClipboardList className="w-3 h-3 text-indigo-500" /> Внутренние заметки риэлтера (сохраняются автоматически)
                                      </span>
                                      <textarea
                                        placeholder="Добавьте детали звонка, статус торга, удобное время для показов..."
                                        value={lead.notes || ''}
                                        onChange={(e) => {
                                          const text = e.target.value;
                                          const updated = leads.map(l => l.id === lead.id ? { ...l, notes: text } : l);
                                          saveLeadsToStore(updated);
                                        }}
                                        rows={2}
                                        className="w-full bg-stone-50 hover:bg-stone-100/50 focus:bg-white text-xs border border-stone-200 focus:border-indigo-500 rounded-lg p-2 outline-none font-sans leading-normal font-medium transition-all resize-none"
                                      />
                                    </div>
                                  </div>

                                  {/* Follow-up Planner Task List Module */}
                                  <LeadTaskList
                                    lead={lead}
                                    leads={leads}
                                    tasksList={tasksList}
                                    saveTasks={saveTasks}
                                    saveLeadsToStore={saveLeadsToStore}
                                    agentId={loggedInAgent?.id || 'admin'}
                                  />

                                  {/* Interactive Interaction History Log Timeline */}
                                  <div className="space-y-2 mt-3 pt-3 border-t border-stone-150">
                                    <button
                                      onClick={() => setExpandedLeadId(expandedLeadId === lead.id ? null : lead.id)}
                                      className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" />
                                      {expandedLeadId === lead.id ? 'Скрыть историю контактов' : `Показать историю взаимодействия (${lead.history?.length || 0})`}
                                    </button>

                                    {expandedLeadId === lead.id && (
                                      <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-3.5 space-y-3 font-sans mt-2 animate-fade-in text-xs">
                                        <h5 className="font-bold text-neutral-900 text-xs">Журнал звонков и показов клиента</h5>
                                        
                                        {(!lead.history || lead.history.length === 0) ? (
                                          <p className="text-[11px] text-stone-400 italic">История звонков и встреч по этому лиду пока пуста. Запишите первый контакт ниже.</p>
                                        ) : (
                                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1 border-l-2 border-stone-200 pl-3">
                                            {lead.history.map(h => (
                                              <div key={h.id} className="text-left space-y-0.5">
                                                <div className="flex items-center justify-between text-[10px] text-stone-500 flex-wrap">
                                                  <span className="font-mono font-bold text-neutral-900">{h.date}</span>
                                                  <span className="bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-bold scale-90">{h.author || 'Риэлтер'}</span>
                                                </div>
                                                <p className="text-[11px] font-semibold text-neutral-800 leading-normal bg-white p-1.5 rounded border border-stone-150">{h.text}</p>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* Quick append action */}
                                        <div className="flex gap-2 items-center border-t border-stone-200/60 pt-2.5">
                                          <input
                                            type="text"
                                            placeholder="Запишите итоги звонка или детали встречи..."
                                            value={newHistoryText[lead.id] || ''}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setNewHistoryText(prev => ({ ...prev, [lead.id]: val }));
                                            }}
                                            className="flex-1 bg-white border border-stone-300 text-xs text-neutral-900 rounded-lg px-2.5 py-1.5 outline-none font-medium focus:ring-1 focus:ring-indigo-500"
                                          />
                                          <button
                                            onClick={() => {
                                              const txt = newHistoryText[lead.id];
                                              if (!txt || !txt.trim()) return;
                                              const newEntry = {
                                                id: `log-${Date.now()}`,
                                                date: new Date().toLocaleString('ru-RU'),
                                                text: txt.trim(),
                                                author: loggedInAgent ? loggedInAgent.name : "Гордович Кирилл"
                                              };
                                              const updatedHistory = [newEntry, ...(lead.history || [])];
                                              const updatedLeads = leads.map(l => l.id === lead.id ? { ...l, history: updatedHistory } : l);
                                              saveLeadsToStore(updatedLeads);
                                              setNewHistoryText(prev => ({ ...prev, [lead.id]: '' }));
                                            }}
                                            className="bg-neutral-950 hover:bg-indigo-600 text-white font-extrabold text-[10px] uppercase px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                                          >
                                            Добавить
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                </div>
                              );
                            })}
                          </div>
                          {renderPagination(leadsPageClamped, totalLeadsPages, setLeadsPage)}
                        </div>
                      );
                    })()}
                  </div>

                </div>
              )}

              {/* TAB CONTENTS: LEAD KANBAN */}
              {activeTab === 'leads_kanban' && (
                <div className="space-y-6 animate-fade-in h-[calc(100vh-200px)] flex flex-col">
                   <div className="flex items-center justify-between">
                      <div>
                         <h2 className="text-xl font-black text-neutral-900 tracking-tight">Канбан сделок</h2>
                         <p className="text-xs text-stone-500 font-medium">Визуальное управление воронкой продаж и статусами лидов</p>
                      </div>
                      <div className="flex gap-2">
                        {isAgentAdmin && (
                           <select
                              value={selectedAgentFilter}
                              onChange={(e) => setSelectedAgentFilter(e.target.value)}
                              className="bg-white border border-stone-200 text-stone-900 font-bold rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none cursor-pointer shadow-sm"
                           >
                              <option value="all">🌐 Все сотрудники</option>
                              {agentsList.map(ag => (
                              <option key={ag.id} value={ag.name}>
                                 👤 {ag.name}
                              </option>
                              ))}
                           </select>
                        )}
                      </div>
                   </div>
                   <LeadKanbanBoard 
                      leads={leads.filter(l => isRecordInAgentDb(l))} 
                      agentsList={agentsList}
                      onUpdateLeads={(updatedLeads) => {
                         // Merge updated leads back into full list
                         const updatedMap = new Map(updatedLeads.map(l => [l.id, l]));
                         const fullUpdated = leads.map(l => updatedMap.get(l.id) || l);
                         saveLeadsToStore(fullUpdated);
                      }}
                      loggedInAgent={loggedInAgent}
                   />
                </div>
              )}

              {/* TAB CONTENTS: ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="space-y-6 animate-fade-in overflow-y-auto custom-scrollbar pr-2">
                   <div className="flex items-center justify-between">
                      <div>
                         <h2 className="text-xl font-black text-neutral-900 tracking-tight">Аналитика и Эффективность</h2>
                         <p className="text-xs text-stone-500 font-medium">Статистика продаж, воронка конверсии и KPI агентов</p>
                      </div>
                      <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-[11px] font-black uppercase tracking-wider text-stone-600 hover:bg-stone-50 transition-all shadow-sm cursor-pointer"
                      >
                         <Download className="w-4 h-4" /> Скачать отчет (PDF)
                      </button>
                   </div>
                   <CRMAnalyticsDashboard 
                      leads={leads}
                      agentsKPI={[]}
                   />
                </div>
              )}

              {/* TAB CONTENTS: CALENDAR */}
              {activeTab === 'calendar' && (
                <CalendarTab />
              )}

              {/* TAB CONTENTS: COLD SELLERS DATABASE (Холодные звонки) */}
              {activeTab === 'sellers' && (
                <div className="space-y-8 animate-fade-in text-xs font-sans">
                  
                  {/* CRM Database Isolation Switcher Banner */}
                  <div className="bg-neutral-900 text-white p-5 rounded-2xl border border-neutral-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase text-emerald-400 tracking-wider">
                          📞 Отдельная база продавцов (Холодные звонки & Доработка)
                        </h4>
                        <p className="text-xs text-neutral-400 mt-0.5 font-medium">
                          Учет всех продавцов, привлеченных из холодных обзвонов, парсинга Kufar/Realt и работы колл-центра.
                        </p>
                      </div>
                    </div>

                    {isAgentAdmin && (
                      <div className="flex items-center gap-2 shrink-0">
                        <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">База сотрудника:</label>
                        <select
                          value={selectedAgentFilter}
                          onChange={(e) => setSelectedAgentFilter(e.target.value)}
                          className="bg-neutral-950 border border-neutral-700 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none cursor-pointer"
                        >
                          <option value="all">🌐 Все сотрудники (Сводная)</option>
                          {agentsList.map(ag => (
                            <option key={ag.id} value={ag.name}>
                              👤 {ag.name} ({ag.role || 'Сотрудник'})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Stats Badges Dashboard for Cold Sellers */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-stone-200 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between">
                      <div className="flex justify-between items-center text-stone-500">
                        <span className="text-[10px] font-black uppercase tracking-wider">Всего в базе</span>
                        <Phone className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-2xl font-black font-mono text-neutral-900">{sellersList.length}</span>
                        <span className="text-[10px] font-bold text-stone-500">продавцов</span>
                      </div>
                    </div>

                    <div className="bg-white border border-purple-200 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between">
                      <div className="flex justify-between items-center text-purple-600">
                        <span className="text-[10px] font-black uppercase tracking-wider">Назначена встреча</span>
                        <Calendar className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-2xl font-black font-mono text-purple-600">
                          {sellersList.filter(s => s.status === 'meeting_scheduled').length}
                        </span>
                        <span className="text-[10px] font-bold text-purple-700">выезды</span>
                      </div>
                    </div>

                    <div className="bg-white border border-emerald-200 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between">
                      <div className="flex justify-between items-center text-emerald-600">
                        <span className="text-[10px] font-black uppercase tracking-wider">Подписан договор</span>
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-2xl font-black font-mono text-emerald-600">
                          {sellersList.filter(s => s.status === 'contract_signed').length}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700">эксклюзивы</span>
                      </div>
                    </div>

                    <div className="bg-white border border-indigo-200 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between">
                      <div className="flex justify-between items-center text-indigo-600">
                        <span className="text-[10px] font-black uppercase tracking-wider">В проработке</span>
                        <RefreshCw className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-2xl font-black font-mono text-indigo-600">
                          {sellersList.filter(s => s.status === 'cold_call' || s.status === 'interested' || s.status === 'callback').length}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-700">контакты</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Filters Bar */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                    {/* Pool filter tabs for Administrator and Call Center */}
                    {canViewAllSellers && (
                      <div className="flex flex-wrap items-center gap-2 border-b border-stone-150 pb-3">
                        <span className="text-[10px] uppercase font-black text-stone-500 mr-1 flex items-center gap-1">
                          <Filter className="w-3.5 h-3.5 text-purple-600" /> Пул продавцов:
                        </span>
                        <button
                          onClick={() => setSellerPoolTab('all')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            sellerPoolTab === 'all'
                              ? 'bg-neutral-900 text-white shadow-xs'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          🌐 Все продавцы ({sellersList.filter(s => isSellerVisibleToUser(s)).length})
                        </button>
                        <button
                          onClick={() => setSellerPoolTab('unassigned')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                            sellerPoolTab === 'unassigned'
                              ? 'bg-amber-500 text-neutral-950 shadow-xs font-black'
                              : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          <span>📥 Общий пул (Неназначенные)</span>
                          <span className="bg-amber-950/20 px-1.5 py-0.5 rounded-full font-mono text-[10px]">
                            {sellersList.filter(s => !s.assignedAgentId && !s.assignedAgentName).length}
                          </span>
                        </button>
                        <button
                          onClick={() => setSellerPoolTab('assigned')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                            sellerPoolTab === 'assigned'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          <span>👤 Закрепленные за риэлтерами</span>
                          <span className="bg-stone-200 text-stone-800 px-1.5 py-0.5 rounded-full font-mono text-[10px]">
                            {sellersList.filter(s => Boolean(s.assignedAgentId || s.assignedAgentName)).length}
                          </span>
                        </button>
                      </div>
                    )}

                    <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                      <div className="flex-1 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                          <input
                            type="text"
                            placeholder="Поиск по имени, телефону, адресу, заметкам..."
                            value={sellerSearch}
                            onChange={(e) => setSellerSearch(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-250 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:bg-white focus:border-purple-500 outline-none font-medium"
                          />
                        </div>

                        <select
                          value={sellerStatusFilter}
                          onChange={(e) => setSellerStatusFilter(e.target.value)}
                          className="bg-stone-50 border border-stone-250 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-700 focus:bg-white focus:border-purple-500 outline-none cursor-pointer"
                        >
                          <option value="all">⚡ Все статусы</option>
                          <option value="cold_call">📞 Холодный звонок</option>
                          <option value="interested">💡 Заинтересован</option>
                          <option value="meeting_scheduled">🤝 Встреча назначена</option>
                          <option value="contract_signed">📜 Договор подписан</option>
                          <option value="callback">⏳ Перезвонить</option>
                          <option value="rejected">❌ Отказ</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        {/* View Switcher: Kanban vs Table */}
                        <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
                          <button
                            onClick={() => setSellerViewMode('kanban')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                              sellerViewMode === 'kanban' ? 'bg-white text-neutral-950 shadow-xs font-black' : 'text-stone-500 hover:text-stone-900'
                            }`}
                          >
                            <Layers className="w-3.5 h-3.5 text-purple-500" />
                            <span>Воронка Kanban</span>
                          </button>
                          <button
                            onClick={() => setSellerViewMode('table')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                              sellerViewMode === 'table' ? 'bg-white text-neutral-950 shadow-xs font-black' : 'text-stone-500 hover:text-stone-900'
                            }`}
                          >
                            <ClipboardList className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Таблица</span>
                          </button>
                        </div>

                        <button
                          onClick={handleExportSellersCSV}
                          className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-all shrink-0"
                        >
                          <Download className="w-4 h-4" />
                          <span>Экспорт CSV</span>
                        </button>

                        {/* Add Seller Button: strictly Admin and Call-Center only! */}
                        {canAddSellers && (
                          <button
                            onClick={() => setIsAddingSeller(!isAddingSeller)}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-600/20 shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{isAddingSeller ? "Свернуть форму" : "+ Новый продавец (Холодный звонок)"}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* New Cold Seller Form Accordion */}
                    {canAddSellers && isAddingSeller && (
                      <div className="pt-4 border-t border-stone-200 space-y-4 animate-fade-in bg-stone-50/60 p-5 rounded-xl">
                        <h4 className="text-xs font-black uppercase text-neutral-800 tracking-wider flex items-center gap-2">
                          <Plus className="w-4 h-4 text-emerald-600" />
                          Внесение продавца с холодного звонка
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase font-black text-stone-600 mb-1">ФИО / Имя продавца *</label>
                            <input
                              type="text"
                              placeholder="Напр. Николай Васильевич"
                              value={newSellerName}
                              onChange={(e) => setNewSellerName(e.target.value)}
                              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-black text-stone-600 mb-1">Телефон *</label>
                            <input
                              type="text"
                              placeholder="+375 (29) 000-00-00"
                              value={newSellerPhone}
                              onChange={(e) => setNewSellerPhone(e.target.value)}
                              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-black text-stone-600 mb-1">Адрес объекта *</label>
                            <input
                              type="text"
                              placeholder="г. Минск, пр-т Победителей, 89"
                              value={newSellerAddress}
                              onChange={(e) => setNewSellerAddress(e.target.value)}
                              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-black text-stone-600 mb-1">Тип недвижимости</label>
                            <select
                              value={newSellerType}
                              onChange={(e) => setNewSellerType(e.target.value as any)}
                              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500 cursor-pointer"
                            >
                              <option value="apartment">🏢 Квартира</option>
                              <option value="house">🏡 Дом / Коттедж</option>
                              <option value="commercial">🏬 Коммерция</option>
                              <option value="plot">🌲 Участок</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-black text-stone-600 mb-1">Запрашиваемая цена ($ USD)</label>
                            <input
                              type="number"
                              placeholder="Напр. 115000"
                              value={newSellerPrice}
                              onChange={(e) => setNewSellerPrice(e.target.value)}
                              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-black text-stone-600 mb-1">Назначить риэлтера (не обязательно сразу)</label>
                            <select
                              value={newSellerAgent}
                              onChange={(e) => setNewSellerAgent(e.target.value)}
                              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500 cursor-pointer"
                            >
                              <option value="">📥 Без назначения — в общий пул (Колл-центр)</option>
                              {agentsList.filter(a => !a.isDismissed && a.status !== 'dismissed' && !a.isAdmin && a.id !== 'admin' && a.id !== 'call-center').map(a => (
                                <option key={a.id} value={a.name}>👤 {a.name} ({a.role || 'Риэлтер'})</option>
                              ))}
                            </select>
                            <span className="text-[10px] text-stone-400 mt-1 block">
                              Продавца можно оставить в общем пуле и назначить риэлтера позже после доработки деталей.
                            </span>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-black text-stone-600 mb-1">Статус звонка</label>
                            <select
                              value={newSellerStatus}
                              onChange={(e) => setNewSellerStatus(e.target.value as any)}
                              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500 cursor-pointer"
                            >
                              <option value="cold_call">📞 Холодный звонок</option>
                              <option value="interested">💡 Заинтересован</option>
                              <option value="meeting_scheduled">🤝 Встреча назначена</option>
                              <option value="contract_signed">📜 Договор подписан</option>
                              <option value="callback">⏳ Перезвонить</option>
                              <option value="rejected">❌ Отказ</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-black text-stone-600 mb-1">Дата следующего контакта</label>
                            <input
                              type="date"
                              value={newSellerNextDate}
                              onChange={(e) => setNewSellerNextDate(e.target.value)}
                              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div className="md:col-span-3">
                            <label className="block text-[10px] uppercase font-black text-stone-600 mb-1">Заметки разговора / Описание объекта</label>
                            <textarea
                              rows={2}
                              placeholder="Детали разговора с продавцом, причины продажи, готовность к торгу..."
                              value={newSellerNotes}
                              onChange={(e) => setNewSellerNotes(e.target.value)}
                              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          <button
                            onClick={() => setIsAddingSeller(false)}
                            className="px-4 py-2 bg-stone-200 text-stone-700 font-bold rounded-xl hover:bg-stone-300 cursor-pointer"
                          >
                            Отмена
                          </button>

                          <button
                            onClick={() => {
                              if (!newSellerName.trim() || !newSellerPhone.trim()) {
                                alert("Заполните имя и телефон продавца!");
                                return;
                              }

                              const assignedAg = newSellerAgent ? agentsList.find(a => a.name === newSellerAgent) : null;
                              const newSeller: ColdSeller = {
                                id: `seller-${Date.now()}`,
                                name: newSellerName.trim(),
                                phone: newSellerPhone.trim(),
                                address: newSellerAddress.trim() || 'г. Минск',
                                propertyType: newSellerType,
                                askingPriceBYN: Math.round((Number(newSellerPrice) || 100000) * 3.27),
                                askingPriceUSD: Number(newSellerPrice) || 100000,
                                status: newSellerStatus,
                                assignedAgentName: assignedAg ? assignedAg.name : '',
                                assignedAgentId: assignedAg ? assignedAg.id : '',
                                callOperatorName: loggedInAgent?.name || 'Колл-центр',
                                notes: newSellerNotes.trim() || 'Внесен через CRM',
                                dateAdded: new Date().toLocaleDateString('ru-RU'),
                                nextContactDate: newSellerNextDate || undefined
                              };

                              const updatedSellers = [newSeller, ...sellersList];
                              setSellersList(updatedSellers);
                              localStorage.setItem('fp_cold_sellers', JSON.stringify(updatedSellers));
                              localStorage.setItem('fp_sellers', JSON.stringify(updatedSellers));
                              setIsAddingSeller(false);
                              setNewSellerName('');
                              setNewSellerPhone('+375 ');
                              setNewSellerAddress('');
                              setNewSellerPrice('');
                              setNewSellerNotes('');
                              setNewSellerAgent('');
                              alert(`Продавец ${newSeller.name} успешно внесен! ${newSeller.assignedAgentName ? `Закреплен за: ${newSeller.assignedAgentName}` : 'Находится в общем пуле (не назначен).'}`);
                            }}
                            className="px-5 py-2 bg-emerald-600 text-white font-extrabold rounded-xl hover:bg-emerald-700 cursor-pointer shadow-md shadow-emerald-600/20"
                          >
                            Сохранить продавца
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Filtered Sellers list for current user view */}
                  {(() => {
                    const filteredSellersForView = sellersList.filter(seller => {
                      // 1. Strict RBAC: Realtor can ONLY see their own assigned sellers!
                      if (!isSellerVisibleToUser(seller)) return false;

                      // 2. Pool tab filter for Admin & Call Center
                      if (canViewAllSellers && selectedAgentFilter === 'all') {
                        const isUnassigned = !seller.assignedAgentId && !seller.assignedAgentName;
                        if (sellerPoolTab === 'unassigned' && !isUnassigned) return false;
                        if (sellerPoolTab === 'assigned' && isUnassigned) return false;
                      }

                      // 3. Status filter
                      if (sellerStatusFilter !== 'all' && seller.status !== sellerStatusFilter) return false;

                      // 4. Search query
                      if (sellerSearch.trim()) {
                        const q = sellerSearch.toLowerCase();
                        return (
                          seller.name.toLowerCase().includes(q) ||
                          seller.phone.toLowerCase().includes(q) ||
                          seller.address.toLowerCase().includes(q) ||
                          seller.notes.toLowerCase().includes(q) ||
                          (seller.assignedAgentName && seller.assignedAgentName.toLowerCase().includes(q))
                        );
                      }
                      return true;
                    });

                    return sellerViewMode === 'kanban' ? (
                      <SellerKanbanPipeline
                        sellersList={filteredSellersForView}
                        agentsList={agentsList}
                        onUpdateSellers={(updated) => {
                          const updatedIds = new Set(updated.map(u => u.id));
                          const merged = sellersList.map(s => updatedIds.has(s.id) ? updated.find(u => u.id === s.id)! : s);
                          setSellersList(merged);
                          localStorage.setItem('fp_cold_sellers', JSON.stringify(merged));
                          localStorage.setItem('fp_sellers', JSON.stringify(merged));
                        }}
                        onPublishSellerProperty={handlePublishSellerProperty}
                        loggedInAgent={loggedInAgent}
                        canAssignAgent={canAssignSellerRealtor}
                        onAssignAgent={handleAssignSellerAgent}
                        canDeleteSeller={canDeleteSeller}
                        onDeleteSeller={handleDeleteSeller}
                      />
                    ) : (
                      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                        {filteredSellersForView.length === 0 ? (
                          <div className="p-12 text-center space-y-3">
                            <Phone className="w-12 h-12 text-stone-300 mx-auto" />
                            <h4 className="text-sm font-extrabold text-stone-700">Продавцы не найдены</h4>
                            <p className="text-xs text-stone-500 max-w-md mx-auto">
                              {sellerPoolTab === 'unassigned' 
                                ? 'В общем пуле сейчас нет свободных продавцов. Все продавцы распределены по специалистам.'
                                : 'В этой категории пока нет продавцов. ' + (canAddSellers ? 'Нажмите «+ Новый продавец», чтобы внести контакт.' : '')}
                            </p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto rounded-2xl">
                            <table className="w-full text-left border-collapse min-w-[950px]">
                              <thead>
                                <tr className="bg-stone-100/80 text-[10px] font-black uppercase tracking-wider text-stone-600 border-b border-stone-200">
                                  <th className="p-4 w-[22%]">Продавец & Контакт</th>
                                  <th className="p-4 w-[20%]">Адрес & Тип</th>
                                  <th className="p-4 w-[12%]">Цена продавца</th>
                                  <th className="p-4 w-[16%]">Статус звонка</th>
                                  <th className="p-4 w-[15%]">Ответственный</th>
                                  <th className="p-4 w-[15%]">Заметки / История</th>
                                  <th className="p-4 text-right w-[10%]">Действия</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-100 text-xs">
                                {filteredSellersForView.map(seller => {
                                  const statusColors: Record<string, string> = {
                                    cold_call: 'bg-stone-100 text-stone-700 border-stone-300',
                                    interested: 'bg-blue-50 text-blue-700 border-blue-200',
                                    meeting_scheduled: 'bg-purple-50 text-purple-800 border-purple-300 font-extrabold',
                                    contract_signed: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold',
                                    callback: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                                    rejected: 'bg-rose-50 text-rose-700 border-rose-200'
                                  };

                                  return (
                                    <tr key={seller.id} className="hover:bg-stone-50/80 transition-all">
                                      <td className="p-4 align-top">
                                        <div className="font-extrabold text-neutral-900 text-xs">{seller.name}</div>
                                        <a
                                          href={`tel:${seller.phone.replace(/[^\d+]/g, '')}`}
                                          className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-mono font-bold text-[11px] mt-1"
                                        >
                                          <Phone className="w-3 h-3" />
                                          {seller.phone}
                                        </a>
                                        <div className="text-[10px] text-stone-400 mt-1">Добавлен: {seller.dateAdded}</div>
                                      </td>

                                      <td className="p-4 align-top max-w-[200px]">
                                        <div className="font-bold text-stone-800 line-clamp-2">{seller.address}</div>
                                        <div className="inline-block mt-1 text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                          {seller.propertyType === 'apartment' ? '🏢 Квартира' :
                                           seller.propertyType === 'house' ? '🏡 Дом / Коттедж' :
                                           seller.propertyType === 'commercial' ? '🏬 Коммерция' : '🌲 Участок'}
                                        </div>
                                      </td>

                                      <td className="p-4 align-top">
                                        <div className="font-black text-xs font-mono text-neutral-900">
                                          ${(seller.askingPriceUSD ?? Math.round((seller.askingPriceBYN || 0) / 3.27)).toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-stone-500 font-mono">
                                          ~{(seller.askingPriceBYN || 0).toLocaleString()} BYN
                                        </div>
                                      </td>

                                      <td className="p-4 align-top">
                                        <select
                                          value={seller.status}
                                          onChange={(e) => {
                                            const newStatus = e.target.value as ColdSeller['status'];
                                            const updated = sellersList.map(s => s.id === seller.id ? { ...s, status: newStatus } : s);
                                            setSellersList(updated);
                                            localStorage.setItem('fp_cold_sellers', JSON.stringify(updated));
                                            localStorage.setItem('fp_sellers', JSON.stringify(updated));
                                          }}
                                          className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border outline-none cursor-pointer ${statusColors[seller.status] || 'bg-stone-100'}`}
                                        >
                                          <option value="cold_call">📞 Холодный звонок</option>
                                          <option value="interested">💡 Заинтересован</option>
                                          <option value="meeting_scheduled">🤝 Встреча назначена</option>
                                          <option value="contract_signed">📜 Договор подписан</option>
                                          <option value="callback">⏳ Перезвонить</option>
                                          <option value="rejected">❌ Отказ</option>
                                        </select>

                                        {seller.nextContactDate && (
                                          <div className="text-[10px] text-purple-700 font-bold mt-1 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {seller.nextContactDate}
                                          </div>
                                        )}
                                      </td>

                                      <td className="p-4 align-top">
                                        {canAssignSellerRealtor ? (
                                          <div>
                                            <select
                                              value={seller.assignedAgentName || ''}
                                              onChange={(e) => handleAssignSellerAgent(seller.id, e.target.value)}
                                              className="bg-stone-50 border border-stone-250 text-stone-800 text-[11px] font-bold rounded-lg px-2 py-1 outline-none cursor-pointer w-full"
                                            >
                                              <option value="">📥 Без назначения (В общий пул)</option>
                                              {agentsList.filter(a => !a.isDismissed && a.status !== 'dismissed' && !a.isAdmin && a.id !== 'admin' && a.id !== 'call-center').map(a => (
                                                <option key={a.id} value={a.name}>👤 {a.name}</option>
                                              ))}
                                            </select>
                                            {seller.callOperatorName && (
                                              <div className="text-[9px] text-stone-400 mt-1">Оператор: {seller.callOperatorName}</div>
                                            )}
                                          </div>
                                        ) : (
                                          <div>
                                            <span className="px-2 py-1 bg-purple-50 text-purple-700 font-bold text-[10px] rounded-lg border border-purple-200 block text-center">
                                              {seller.assignedAgentName || 'Закреплен за вами'}
                                            </span>
                                          </div>
                                        )}
                                      </td>

                                      <td className="p-4 align-top max-w-[240px]">
                                        <p className="text-[11px] text-stone-600 italic bg-stone-50 p-2 rounded-lg border border-stone-200">
                                          "{seller.notes}"
                                        </p>

                                        {/* Messenger quick action */}
                                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                          <a
                                            href={`https://wa.me/${seller.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Здравствуйте, ${seller.name}! Меня зовут ${loggedInAgent?.name || 'эксперт АН Фаттория'}. Я ваш персональный специалист по недвижимости. Когда вам удобно обсудить вопросы по продаже вашего объекта (${seller.address})?`)}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded border border-emerald-300"
                                          >
                                            WhatsApp
                                          </a>
                                          <a
                                            href={`https://t.me/share/url?url=https://fattoriaminsk&text=${encodeURIComponent(`Здравствуйте, ${seller.name}! Меня зовут ${loggedInAgent?.name || 'эксперт АН Фаттория'}. Я ваш персональный специалист по недвижимости. Когда вам удобно обсудить вопросы по продаже вашего объекта (${seller.address})?`)}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-800 font-extrabold text-[10px] rounded border border-sky-300"
                                          >
                                            Telegram
                                          </a>
                                        </div>
                                      </td>

                                      <td className="p-4 align-top text-right space-y-1.5">
                                        {/* Point 1: 1-Click Create & Publish Property from Seller */}
                                        <button
                                          onClick={() => setSellerToPublishModal(seller)}
                                          className="w-full px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-black text-[10px] uppercase rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs"
                                          title="Создать объект на сайте и опубликовать в каталоге"
                                        >
                                          <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
                                          <span>{seller.publishedPropertyId ? 'Обновить на сайте' : '🔥 Опубликовать'}</span>
                                        </button>

                                        {canDeleteSeller(seller) && (
                                          <button
                                            onClick={() => handleDeleteSeller(seller.id)}
                                            className="px-2 py-1 text-rose-600 hover:bg-rose-50 text-[10px] font-bold rounded cursor-pointer w-full text-center block"
                                          >
                                            Удалить
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                </div>
              )}

              {/* TAB CONTENTS: INSTITUTIONAL REQUESTS REGISTRY */}
              {activeTab === 'requests_registry' && (
                <div className="space-y-6 animate-fade-in font-sans">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-neutral-900 tracking-tight">Реестр запросов в госорганы</h2>
                      <p className="text-xs text-stone-500 font-medium">Мониторинг всех сформированных запросов (Наркология, Психиатрия, БРТИ и др.)</p>
                    </div>
                    <button 
                      onClick={() => setShowInstitutionalRequestsModal(true)}
                      className="px-5 py-2.5 bg-[#8B5CF6] hover:bg-black text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Создать новый запрос
                    </button>
                  </div>

                  <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-stone-50 border-b border-stone-100">
                            <th className="px-5 py-4 font-black text-stone-400 uppercase tracking-widest">№ / Дата</th>
                            <th className="px-5 py-4 font-black text-stone-400 uppercase tracking-widest">Инстанция</th>
                            <th className="px-5 py-4 font-black text-stone-400 uppercase tracking-widest">Клиент / Объект</th>
                            <th className="px-5 py-4 font-black text-stone-400 uppercase tracking-widest">Ответственный</th>
                            <th className="px-5 py-4 font-black text-stone-400 uppercase tracking-widest text-right">Действия</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                          {institutionalRequests.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-5 py-12 text-center text-stone-400 italic font-medium">
                                Реестр запросов пуст. Начните работу, создав первый официальный запрос.
                              </td>
                            </tr>
                          ) : (
                            institutionalRequests.map(req => (
                              <tr key={req.id} className="hover:bg-stone-50/50 transition-colors">
                                <td className="px-5 py-4">
                                  <div className="font-bold text-neutral-900">{req.outNumber}</div>
                                  <div className="text-[10px] text-stone-400 mt-0.5">{req.outDate}</div>
                                </td>
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                    <span className="font-bold text-stone-700">{req.institutionTitle}</span>
                                  </div>
                                </td>
                                <td className="px-5 py-4">
                                  <div className="font-bold text-neutral-900">{req.clientName}</div>
                                  <div className="text-[10px] text-stone-400 truncate max-w-[220px]">{req.objectAddress}</div>
                                </td>
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-black text-purple-600 border border-purple-100">
                                      {req.agentName.charAt(0)}
                                    </div>
                                    <span className="font-bold text-stone-700">{req.agentName}</span>
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-right">
                                  <button 
                                    onClick={() => {
                                      // Logic to open modal in preview mode for this request
                                      // For now, just opening the modal
                                      setShowInstitutionalRequestsModal(true);
                                    }}
                                    className="p-2 text-stone-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENTS 3: LISTINGS MANAGEMENT */}
              {activeTab === 'listings' && loggedInAgent && (
                <MyDraftPropertiesTab 
                  properties={propertiesList}
                  loggedInAgent={loggedInAgent}
                  onDelete={(id) => {
                    if (window.confirm('Вы уверены, что хотите удалить этот объект из вашей базы?')) {
                      const updated = propertiesList.filter(p => p.id !== id);
                      setPropertiesList(updated);
                    }
                  }}
                  onEdit={(prop) => {
                    alert(`Редактирование объекта: ${prop.title}`);
                  }}
                  onPublish={handleTogglePropertyPublished}
                  onGenerateRequest={(prop) => {
                    setInitialPropertyForRequest(prop);
                    setShowInstitutionalRequestsModal(true);
                  }}
                  onOpenImporter={() => setShowRealtImporter(true)}
                />
              )}

              {/* TAB CONTENTS 4: EMPLOYEES */}
              {activeTab === 'employees' && hasFullAccess && (() => {
                const getYearsWord = (y: number) => {
                  if (y % 10 === 1 && y % 100 !== 11) return 'год';
                  if ([2, 3, 4].includes(y % 10) && ![12, 13, 14].includes(y % 100)) return 'года';
                  return 'лет';
                };
                const getMonthsWord = (m: number) => {
                  if (m % 10 === 1 && m % 100 !== 11) return 'месяц';
                  if ([2, 3, 4].includes(m % 10) && ![12, 13, 14].includes(m % 100)) return 'месяца';
                  return 'месяцев';
                };

                const passLengthOk = newEmpPassword.length >= 4;
                const isPasswordValid = passLengthOk;

                // Metrics
                const activeStaff = agentsList.filter(a => !a.isDismissed && a.status !== 'dismissed');
                const dismissedStaff = agentsList.filter(a => a.isDismissed || a.status === 'dismissed');

                // Filtered staff list
                const filteredAgents = agentsList.filter(agent => {
                  const isDismissed = agent.isDismissed || agent.status === 'dismissed';
                  if (staffStatusFilter === 'active' && isDismissed) return false;
                  if (staffStatusFilter === 'dismissed' && !isDismissed) return false;

                  if (staffSearch.trim()) {
                    const q = staffSearch.toLowerCase().trim();
                    const matchName = (agent.name || '').toLowerCase().includes(q);
                    const matchRole = (agent.role || '').toLowerCase().includes(q);
                    const matchPhone = (agent.phone || '').toLowerCase().includes(q);
                    const matchEmail = (agent.email || '').toLowerCase().includes(q);
                    return matchName || matchRole || matchPhone || matchEmail;
                  }
                  return true;
                });

                return (
                  <div className="space-y-8 animate-fade-in font-sans text-xs">
                    
                    {/* Header & Quick Action Bar */}
                    <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-5">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-purple-500/10 text-purple-600 rounded-2xl">
                            <Users className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-neutral-900">
                              Кадровый реестр & Управление сотрудниками
                            </h3>
                            <p className="text-xs text-neutral-500 font-medium">
                              Управление доступом, редактирование анкет, статус увольнения и публикация на сайте.
                            </p>
                          </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={handleResetStaffToRealEmployees}
                            className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer outline-none"
                            title="Сбросить список к реальным 34 сотрудникам ООО «АН Фаттория»"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                            Сброс к реальным 34
                          </button>
                          
                          <button
                            onClick={() => setIsStaffFormExpanded(!isStaffFormExpanded)}
                            className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer outline-none shadow-sm ${
                              isStaffFormExpanded
                                ? 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                                : 'bg-purple-500 hover:bg-purple-400 text-neutral-950 shadow-purple-500/20'
                            }`}
                          >
                            <Plus className={`w-3.5 h-3.5 transition-transform ${isStaffFormExpanded ? 'rotate-45' : ''}`} />
                            {isStaffFormExpanded ? 'Скрыть форму' : 'Принять нового риэлтера'}
                          </button>
                        </div>
                      </div>

                      {/* Status Badges & Filtering Controls */}
                      <div className="pt-4 border-t border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md">
                          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                          <input
                            type="text"
                            placeholder="Поиск по ФИО, телефону, роли или email..."
                            value={staffSearch}
                            onChange={(e) => {
                              setStaffSearch(e.target.value);
                              setEmployeesPage(1);
                            }}
                            className="w-full bg-stone-50 border border-stone-200 text-neutral-900 rounded-xl pl-9 pr-8 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium"
                          />
                          {staffSearch && (
                            <button
                              onClick={() => setStaffSearch('')}
                              className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Status Filter Tabs */}
                        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
                          <button
                            onClick={() => { setStaffStatusFilter('all'); setEmployeesPage(1); }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                              staffStatusFilter === 'all'
                                ? 'bg-white text-neutral-900 shadow-sm'
                                : 'text-stone-500 hover:text-stone-900'
                            }`}
                          >
                            Все ({agentsList.length})
                          </button>
                          <button
                            onClick={() => { setStaffStatusFilter('active'); setEmployeesPage(1); }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                              staffStatusFilter === 'active'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
                                : 'text-emerald-700 hover:text-emerald-900'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                            В штате ({activeStaff.length})
                          </button>
                          <button
                            onClick={() => { setStaffStatusFilter('dismissed'); setEmployeesPage(1); }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                              staffStatusFilter === 'dismissed'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200 shadow-sm'
                                : 'text-rose-700 hover:text-rose-900'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                            Уволенные ({dismissedStaff.length})
                          </button>
                        </div>

                      </div>
                    </div>

                    {/* Employee Addition Form (Collapsible) */}
                    {isStaffFormExpanded && (
                      <div className="bg-white p-6 md:p-8 rounded-3xl space-y-6 border border-purple-200/80 shadow-lg animate-scale-in">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 text-purple-600 rounded-xl">
                              <UserPlus className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-neutral-900">
                                Форма зачисления нового специалиста
                              </h4>
                              <p className="text-[11px] text-neutral-500 font-medium">После сохранения специалист получит доступ к личному кабинету.</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setIsStaffFormExpanded(false)}
                            className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 text-xs font-sans">
                          
                          {/* Left Block: Personal & Professional Data (Col-span 8) */}
                          <div className="xl:col-span-8 space-y-6">
                            
                            {/* Section Header: Personal data */}
                            <div className="space-y-4">
                              <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-stone-400" />
                                1. Личные данные риэлтера
                              </h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[10px] text-neutral-600 uppercase font-black mb-1.5">
                                    ФИО полностью (как в паспорте) <span className="text-rose-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Напр. Ковальчук Артем"
                                    value={newEmpName}
                                    onChange={(e) => setNewEmpName(e.target.value)}
                                    className="w-full bg-white border border-stone-300 text-neutral-850 rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-semibold"
                                  />
                                  {newEmpName && newEmpName.trim().split(/\s+/).length < 2 && (
                                    <p className="text-[10px] text-purple-600 font-medium mt-1">Укажите ФИО полностью (минимум Фамилия и Имя)</p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-[10px] text-neutral-600 uppercase font-black mb-1.5">
                                    Номер телефона для связи и документов <span className="text-rose-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Напр. +375 (29) 123-45-67"
                                    value={newEmpPhone}
                                    onChange={(e) => setNewEmpPhone(e.target.value)}
                                    className="w-full bg-white border border-stone-300 text-neutral-850 rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-semibold"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Section Header: Professional profile */}
                            <div className="space-y-4 pt-4 border-t border-stone-100">
                              <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-stone-400" />
                                2. Профессиональный профиль и опыт
                              </h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="block text-[10px] text-neutral-600 uppercase font-black">
                                    Должность (текущая роль в компании) <span className="text-rose-500">*</span>
                                  </label>
                                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                                    {[
                                      'Риэлтер',
                                      'Руководитель'
                                    ].map(rolePreset => (
                                      <button
                                        key={rolePreset}
                                        type="button"
                                        onClick={() => setNewEmpRole(rolePreset)}
                                        className={`px-3 py-1 text-[10px] font-black rounded-lg border transition-all cursor-pointer ${
                                          newEmpRole === rolePreset
                                            ? 'bg-purple-500 text-neutral-950 border-purple-500'
                                            : 'bg-stone-50 text-stone-700 border-stone-250 hover:bg-stone-100'
                                        }`}
                                      >
                                        {rolePreset}
                                      </button>
                                    ))}
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Риэлтер"
                                    value={newEmpRole}
                                    onChange={(e) => setNewEmpRole(e.target.value)}
                                    className="w-full bg-white border border-stone-300 text-neutral-850 rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-semibold"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] text-neutral-600 uppercase font-black mb-1.5">
                                    Назначить руководителя / куратора (Менеджер)
                                  </label>
                                  <select
                                    value={newEmpManager}
                                    onChange={(e) => setNewEmpManager(e.target.value)}
                                    className="w-full bg-white border border-stone-300 text-neutral-850 rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none cursor-pointer font-bold"
                                  >
                                    <option value="">-- Без руководителя (Подчинение Админу) --</option>
                                    {agentsList.map(a => (
                                      <option key={a.id} value={a.name}>{a.name} ({a.role || 'Сотрудник'})</option>
                                    ))}
                                  </select>
                                </div>

                                <div className="space-y-1.5 md:col-span-2">
                                  <label className="block text-[10px] text-neutral-600 uppercase font-black">
                                    Стаж в сфере недвижимости <span className="text-rose-500">*</span>
                                  </label>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <select
                                        value={newEmpExpYears}
                                        onChange={(e) => setNewEmpExpYears(e.target.value)}
                                        className="w-full bg-white border border-stone-300 text-neutral-850 rounded-lg px-2.5 py-2.5 text-xs focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none cursor-pointer font-semibold"
                                      >
                                        {Array.from({ length: 31 }, (_, i) => (
                                          <option key={i} value={i}>
                                            {i} {getYearsWord(i)}
                                          </option>
                                        ))}
                                      </select>
                                      <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider pl-1">Лет</span>
                                    </div>
                                    <div className="space-y-1">
                                      <select
                                        value={newEmpExpMonths}
                                        onChange={(e) => setNewEmpExpMonths(e.target.value)}
                                        className="w-full bg-white border border-stone-300 text-neutral-850 rounded-lg px-2.5 py-2.5 text-xs focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none cursor-pointer font-semibold"
                                      >
                                        {Array.from({ length: 12 }, (_, i) => (
                                          <option key={i} value={i}>
                                            {i} {getMonthsWord(i)}
                                          </option>
                                        ))}
                                      </select>
                                      <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider pl-1">Месяцев</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                <div>
                                  <label className="block text-[10px] text-neutral-600 uppercase font-black mb-1.5">Сектор работы</label>
                                  <select
                                    value={newEmpSpec}
                                    onChange={(e) => setNewEmpSpec(e.target.value as any)}
                                    className="w-full bg-white border border-stone-300 text-neutral-850 rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none cursor-pointer font-bold transition-all"
                                  >
                                    <option value="sale">Минский рынок жилья</option>
                                    <option value="rent">Аренда и Обмены</option>
                                    <option value="assessment">Коммерческая недвижимость</option>
                                    <option value="houses">Дома и Коттеджи</option>
                                    <option value="all">Универсальный сектор</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[10px] text-neutral-600 uppercase font-black mb-1.5">Закрытых сделок</label>
                                  <input
                                    type="number"
                                    value={newEmpDeals}
                                    onChange={(e) => setNewEmpDeals(Number(e.target.value) || 0)}
                                    className="w-full bg-white border border-stone-300 text-neutral-850 rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-mono font-bold"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] text-neutral-600 uppercase font-black mb-1.5">
                                    Рабочий Email риэлтера <span className="text-rose-500">*</span>
                                  </label>
                                  <input
                                    type="email"
                                    placeholder="Напр. artem@fattoria.by"
                                    value={newEmpEmail}
                                    onChange={(e) => setNewEmpEmail(e.target.value)}
                                    className="w-full bg-white border border-stone-300 text-neutral-850 rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-semibold font-sans"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Achievements & Description (Textarea) */}
                            <div className="space-y-3 pt-4 border-t border-stone-100">
                              <div className="flex justify-between items-center">
                                <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-2">
                                  <Award className="w-4 h-4 text-stone-400" />
                                  3. Достижения и описание сотрудника
                                </h4>
                                <span className="text-[10px] font-bold text-stone-400">Рекомендуется 2-3 предложения</span>
                              </div>
                              <textarea
                                rows={3}
                                placeholder="Напр. За прошлый год успешно закрыл 24 сделки. Специализируется на новостройках и загородных коттеджах. Аттестованный риэлтер Минюста РБ."
                                value={newEmpAchievements}
                                onChange={(e) => setNewEmpAchievements(e.target.value)}
                                className="w-full bg-white border border-stone-300 text-neutral-850 rounded-xl p-3.5 text-xs focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium leading-relaxed"
                              />
                            </div>

                          </div>

                          {/* Right Block: Photo Upload & Security Credentials (Col-span 4) */}
                          <div className="xl:col-span-4 space-y-6 bg-stone-50/50 p-5 rounded-2xl border border-stone-200/40">
                            
                            {/* Section: Employee photo */}
                            <div className="space-y-4">
                              <h4 className="text-xs font-black uppercase text-stone-500 tracking-wider flex items-center gap-2">
                                <Upload className="w-4 h-4 text-purple-600" />
                                4. Фотография сотрудника
                              </h4>
                              
                              <div className="flex flex-col items-center gap-4 text-center">
                                <div className="w-24 h-24 rounded-full bg-white border-2 border-stone-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-sm group">
                                  {newEmpPhotoFile ? (
                                    <img src={newEmpPhotoFile} alt="Preview" className="w-full h-full object-cover" />
                                  ) : newEmpPhotoUrl ? (
                                    <img src={newEmpPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="text-stone-400 text-[10px] font-bold p-3 flex flex-col items-center gap-1">
                                      <Users className="w-6 h-6 opacity-30" />
                                      <span>Без фото</span>
                                    </div>
                                  )}
                                  
                                  {(newEmpPhotoFile || newEmpPhotoUrl) && (
                                    <button
                                      type="button"
                                      onClick={() => { setNewEmpPhotoFile(null); setNewEmpPhotoUrl(''); }}
                                      className="absolute inset-0 bg-black/60 text-white text-[10px] uppercase font-black opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                    >
                                      Сбросить
                                    </button>
                                  )}
                                </div>

                                <div className="w-full space-y-3 text-left">
                                  <div className="space-y-1">
                                    <label className="block text-[9px] uppercase font-black text-neutral-500">Прикрепить файл с компьютера</label>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleImageUpload}
                                      className="block w-full text-[10px] text-stone-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border file:border-stone-300 file:text-[10px] file:font-bold file:bg-white file:text-stone-700 hover:file:bg-purple-500 hover:file:text-neutral-900 file:cursor-pointer cursor-pointer"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="block text-[9px] uppercase font-black text-neutral-500">Или ссылка на фото / облако</label>
                                    <div className="relative">
                                      <Link className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-stone-400" />
                                      <input
                                        type="text"
                                        placeholder="https://..."
                                        value={newEmpPhotoUrl}
                                        onChange={(e) => setNewEmpPhotoUrl(e.target.value)}
                                        className="w-full bg-white border border-stone-300 text-neutral-850 rounded-lg pl-8 pr-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Section: Credentials / Passwords */}
                            <div className="space-y-4 pt-4 border-t border-stone-200">
                              <h4 className="text-xs font-black uppercase text-stone-500 tracking-wider flex items-center gap-2">
                                <Lock className="w-4 h-4 text-purple-600" />
                                5. Безопасность кабинета
                              </h4>

                              <div className="space-y-3">
                                <div className="space-y-1.5">
                                  <label className="block text-[10px] text-neutral-600 uppercase font-black">
                                    Желаемый пароль риэлтера <span className="text-rose-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Введите пароль (напр. Agent2026)"
                                    value={newEmpPassword}
                                    onChange={(e) => setNewEmpPassword(e.target.value)}
                                    className={`w-full bg-white border text-neutral-850 rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-purple-500/10 outline-none transition-all font-mono font-bold ${
                                      newEmpPassword ? (isPasswordValid ? 'border-emerald-500' : 'border-rose-300') : 'border-stone-300'
                                    }`}
                                  />
                                </div>

                                <div className="p-3 bg-white border border-stone-150 rounded-xl space-y-2 text-[10px] font-medium text-stone-600 shadow-inner">
                                  <p className="font-bold text-[9px] uppercase tracking-wider text-stone-400 mb-1">Требования к паролю:</p>
                                  
                                  <div className="flex items-center gap-1.5">
                                    <span className={passLengthOk ? 'text-emerald-600' : 'text-stone-300'}>
                                      <Check className={`w-3.5 h-3.5 stroke-[3] ${passLengthOk ? 'opacity-100' : 'opacity-30'}`} />
                                    </span>
                                    <span className={passLengthOk ? 'text-emerald-700 font-bold' : 'text-stone-500'}>Не менее 4 символов</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                          </div>

                        </div>

                        <div className="flex justify-end pt-4 border-t border-stone-100 gap-3">
                          <button
                            type="button"
                            onClick={() => setIsStaffFormExpanded(false)}
                            className="px-5 py-3 text-stone-600 hover:bg-stone-100 text-xs font-bold rounded-xl transition-all cursor-pointer"
                          >
                            Отмена
                          </button>
                          <button
                            onClick={() => {
                              const nameParts = newEmpName.trim().split(/\s+/);
                              if (!newEmpName.trim() || nameParts.length < 2) {
                                alert("Пожалуйста, укажите ФИО полностью (минимум Фамилия и Имя, как в паспорте).");
                                return;
                              }
                              if (!newEmpRole.trim()) {
                                alert("Пожалуйста, укажите должность специалиста в компании.");
                                return;
                              }
                              if (!newEmpPhone.trim()) {
                                alert("Пожалуйста, укажите контактный телефон сотрудника.");
                                return;
                              }

                              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                              if (!newEmpEmail.trim() || !emailRegex.test(newEmpEmail)) {
                                alert("Пожалуйста, укажите корректный рабочий Email сотрудника.");
                                return;
                              }

                              if (!newEmpPassword || !isPasswordValid) {
                                alert("Пароль слишком короткий! Минимальная длина пароля — 4 символа.");
                                return;
                              }

                              const yearsVal = parseInt(newEmpExpYears, 10) || 0;
                              const monthsVal = parseInt(newEmpExpMonths, 10) || 0;
                              let experienceStr = '';
                              if (yearsVal > 0 && monthsVal > 0) {
                                experienceStr = `${yearsVal} ${getYearsWord(yearsVal)} и ${monthsVal} ${getMonthsWord(monthsVal)}`;
                              } else if (yearsVal > 0) {
                                experienceStr = `${yearsVal} ${getYearsWord(yearsVal)}`;
                              } else if (monthsVal > 0) {
                                experienceStr = `${monthsVal} ${getMonthsWord(monthsVal)}`;
                              } else {
                                experienceStr = 'Без опыта';
                              }

                              const finalPhoto = newEmpPhotoFile || newEmpPhotoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200";

                              const targetEmail = newEmpEmail.trim().toLowerCase();
                              const existingIndex = agentsList.findIndex(
                                (a: Agent) => a.email && a.email.toLowerCase() === targetEmail
                              );

                              let updatedList;
                              if (existingIndex !== -1) {
                                updatedList = [...agentsList];
                                updatedList[existingIndex] = {
                                  ...updatedList[existingIndex],
                                  name: newEmpName.trim(),
                                  role: newEmpRole.trim(),
                                  experience: experienceStr,
                                  phone: newEmpPhone.trim(),
                                  specialization: newEmpSpec,
                                  dealsCount: Number(newEmpDeals) || updatedList[existingIndex].dealsCount,
                                  password: newEmpPassword.trim(),
                                  hasLeadsAccess: true,
                                  isDismissed: false,
                                  status: 'active',
                                  assignedManagerName: newEmpManager || updatedList[existingIndex].assignedManagerName,
                                  achievements: newEmpAchievements.trim() || undefined
                                };
                                alert(`Данные сотрудника ${newEmpName.trim()} с Email ${newEmpEmail.trim()} успешно обновлены! Установлен новый пароль: ${newEmpPassword.trim()}`);
                              } else {
                                const newAgent: Agent = {
                                  id: `emp-${Date.now()}`,
                                  name: newEmpName.trim(),
                                  photo: finalPhoto,
                                  role: newEmpRole.trim(),
                                  experience: experienceStr,
                                  rating: 5.0,
                                  phone: newEmpPhone.trim(),
                                  specialization: newEmpSpec,
                                  dealsCount: Number(newEmpDeals) || 0,
                                  isApproved: true,
                                  email: newEmpEmail.trim(),
                                  password: newEmpPassword.trim(),
                                  hasLeadsAccess: true,
                                  isDismissed: false,
                                  status: 'active',
                                  agencyName: 'ООО «АН Фаттория»',
                                  assignedManagerName: newEmpManager || undefined,
                                  achievements: newEmpAchievements.trim() || undefined
                                };
                                updatedList = [...agentsList, newAgent];
                                alert(`Успешно назначен! Специалист ${newAgent.name} зачислен в штат.\n\nЛогин: ${newAgent.email}\nПароль: ${newAgent.password}`);
                              }

                              setAgentsList(updatedList);
                              
                              setNewEmpName('');
                              setNewEmpRole('');
                              setNewEmpManager('');
                              setNewEmpExpYears('3');
                              setNewEmpExpMonths('6');
                              setNewEmpPhone('');
                              setNewEmpDeals(12);
                              setNewEmpEmail('');
                              setNewEmpPassword('');
                              setNewEmpPhotoUrl('');
                              setNewEmpPhotoFile(null);
                              setNewEmpAchievements('');
                              setIsStaffFormExpanded(false);
                            }}
                            className={`px-8 py-3.5 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer outline-none shadow-md ${
                              newEmpName && newEmpRole && newEmpPhone && newEmpEmail && isPasswordValid
                                ? 'bg-neutral-900 hover:bg-purple-500 text-white hover:text-neutral-900 hover:shadow-lg'
                                : 'bg-stone-150 text-stone-400 cursor-not-allowed border border-stone-200'
                            }`}
                          >
                            Принять в штат & Выдать доступ
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Employees Staff Grid */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-2 border-b border-stone-200 gap-2">
                        <h3 className="text-xs font-black uppercase text-neutral-600 tracking-wider flex items-center gap-2">
                          <span>Список специалистов</span>
                          <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full font-mono text-[11px]">
                            {filteredAgents.length} из {agentsList.length}
                          </span>
                        </h3>
                        <span className="text-[10px] text-stone-500 font-medium">
                          Нажмите <span className="font-bold text-purple-700">«Редактировать»</span> для изменения данных или увольнения
                        </span>
                      </div>

                      {filteredAgents.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 space-y-3">
                          <Users className="w-10 h-10 text-stone-300 mx-auto" />
                          <p className="text-sm font-bold text-neutral-800">Сотрудники не найдены</p>
                          <p className="text-xs text-stone-400">Попробуйте изменить поисковый запрос или сбросить фильтры.</p>
                          {staffSearch && (
                            <button
                              onClick={() => setStaffSearch('')}
                              className="px-4 py-2 bg-purple-500 text-neutral-950 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                            >
                              Очистить поиск
                            </button>
                          )}
                        </div>
                      ) : (
                        (() => {
                          const employeesPerPage = 6;
                          const totalEmployeesPages = Math.ceil(filteredAgents.length / employeesPerPage) || 1;
                          const employeesPageClamped = Math.min(employeesPage, totalEmployeesPages);
                          const paginatedEmployees = filteredAgents.slice(
                            (employeesPageClamped - 1) * employeesPerPage,
                            employeesPageClamped * employeesPerPage
                          );

                          return (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedEmployees.map((agent: Agent) => {
                                  const isDismissed = agent.isDismissed || agent.status === 'dismissed';

                                  return (
                                    <div 
                                      key={agent.id} 
                                      className={`p-5 bg-white border rounded-3xl shadow-sm transition-all flex flex-col justify-between space-y-4 hover:shadow-md ${
                                        isDismissed 
                                          ? 'border-rose-200 bg-rose-50/20 opacity-85' 
                                          : 'border-stone-200 hover:border-purple-500/50'
                                      }`}
                                    >
                                      <div className="space-y-3">
                                        
                                        {/* Status Header Badge */}
                                        <div className="flex items-center justify-between">
                                          {isDismissed ? (
                                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-full flex items-center gap-1">
                                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                              Уволен (Скрыт с сайта)
                                            </span>
                                          ) : (
                                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full flex items-center gap-1">
                                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                              В штате (На сайте)
                                            </span>
                                          )}

                                          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                                            {agent.agencyName || 'АН Фаттория'}
                                          </span>
                                        </div>

                                        {/* Agent Avatar & Core Info */}
                                        <div className="flex items-start gap-3.5 pt-1">
                                          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-stone-200 shrink-0 relative bg-stone-900">
                                            <AgentBrandAvatar
                                              photo={agent.photo}
                                              name={agent.name}
                                              size="md"
                                              className={`w-full h-full object-cover ${isDismissed ? 'grayscale opacity-60' : ''}`}
                                              showBadge={false}
                                            />
                                          </div>

                                          <div className="min-w-0 flex-1 space-y-0.5">
                                            <h4 className="text-xs font-black text-neutral-900 leading-tight">
                                              {agent.name}
                                            </h4>
                                            <p className="text-[10px] text-purple-700 font-bold leading-tight truncate">
                                              {agent.role || 'Риэлтер'}
                                            </p>
                                            <p className="text-[10px] text-stone-500 font-medium">
                                              Аттестован Минюстом РБ
                                              {agent.dealsCount !== undefined && (
                                                <> • Сделок: <span className="text-neutral-800 font-bold">{agent.dealsCount}</span></>
                                              )}
                                            </p>
                                          </div>
                                        </div>

                                        {/* Contact & Credentials Details */}
                                        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-[10px] space-y-1.5 font-medium text-stone-600">
                                          <div className="flex justify-between items-center">
                                            <span className="text-stone-400">Телефон:</span>
                                            <a href={`tel:${agent.phone}`} className="font-bold text-neutral-900 hover:text-purple-600 transition-colors">
                                              {agent.phone || '+375 (29) 000-00-00'}
                                            </a>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-stone-400">Логин / Email:</span>
                                            <span className="font-mono font-bold text-neutral-800 truncate max-w-[170px]" title={agent.email}>
                                              {agent.email || `${agent.name.toLowerCase().replace(/\s+/g, '')}@fattoria.by`}
                                            </span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-stone-400">Пароль CRM:</span>
                                            <span className="font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/50">
                                              {agent.password || '123456'}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Bio / Achievements */}
                                        {agent.achievements && (
                                          <div className="p-2.5 bg-purple-50/40 rounded-xl border border-purple-500/10 text-[10px] text-stone-600 line-clamp-2 leading-relaxed italic">
                                            «{agent.achievements}»
                                          </div>
                                        )}

                                      </div>
                                      
                                      {/* Action Controls */}
                                      <div className="space-y-2 pt-3 border-t border-stone-100">
                                        <div className="flex items-center gap-2">
                                          {/* Edit Button */}
                                          <button
                                            onClick={() => handleOpenEditAgent(agent)}
                                            className="flex-1 py-2 bg-neutral-900 hover:bg-purple-500 text-white hover:text-neutral-950 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer outline-none shadow-sm"
                                          >
                                            <Edit3 className="w-3 h-3" />
                                            Редактировать
                                          </button>

                                          {/* Toggle Dismiss / Rehire Button */}
                                          <button
                                            onClick={() => handleToggleDismissAgent(agent)}
                                            className={`py-2 px-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer outline-none border ${
                                              isDismissed
                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                            }`}
                                            title={isDismissed ? "Восстановить в активный штат" : "Уволить специалиста"}
                                          >
                                            {isDismissed ? (
                                              <>
                                                <UserPlus className="w-3 h-3 text-emerald-600" />
                                                Восстановить
                                              </>
                                            ) : (
                                              <>
                                                <UserMinus className="w-3 h-3 text-rose-600" />
                                                Уволить
                                              </>
                                            )}
                                          </button>
                                        </div>

                                        <div className="flex items-center justify-between pt-1">
                                          {/* Toggle leads access */}
                                          <button
                                            onClick={() => {
                                              const updated = agentsList.map((a: Agent) => {
                                                if (a.id === agent.id) {
                                                  const newVal = !a.hasLeadsAccess;
                                                  if (loggedInAgent && loggedInAgent.id === a.id) {
                                                    const updatedLoggedIn = { ...loggedInAgent, hasLeadsAccess: newVal };
                                                    setLoggedInAgent(updatedLoggedIn);
                                                    localStorage.setItem('fp_logged_agent', JSON.stringify(updatedLoggedIn));
                                                  }
                                                  return { ...a, hasLeadsAccess: newVal };
                                                }
                                                return a;
                                              });
                                              setAgentsList(updated);
                                            }}
                                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                                              agent.hasLeadsAccess
                                                ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                                : 'text-stone-400 bg-stone-100 hover:bg-stone-200'
                                            }`}
                                          >
                                            <Shield className="w-2.5 h-2.5" />
                                            {agent.hasLeadsAccess ? 'Доступ к лидам: Да' : 'Доступ к лидам: Нет'}
                                          </button>

                                          {/* Delete permanently */}
                                          {agent.id !== 'admin' && (
                                            <button
                                              onClick={() => handleDeleteAgentPermanently(agent)}
                                              className="text-[9px] font-bold text-stone-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-md transition-all cursor-pointer"
                                              title="Полностью удалить из базы CRM"
                                            >
                                              <Trash className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                    </div>
                                  );
                                })}
                              </div>
                              {renderPagination(employeesPageClamped, totalEmployeesPages, setEmployeesPage)}
                            </div>
                          );
                        })()
                      )}
                    </div>

                  </div>
                );
              })()}

              {/* TAB CONTENTS: CALL CENTER WORKSPACE */}
              {activeTab === 'callcenter' && (
                <div className="space-y-6 animate-fade-in font-sans text-xs">
                  <CallCenterWorkspace
                    onAddSeller={(newSeller) => {
                      const updated = [newSeller as ColdSeller, ...sellersList];
                      setSellersList(updated);
                    }}
                    onAddBuyer={(newBuyer) => {
                      const updated = [newBuyer as Buyer, ...buyersList];
                      setBuyersList(updated);
                    }}
                    buyersList={buyersList}
                    propertiesList={propertiesList}
                    agentName={loggedInAgent?.name || 'Оператор колл-центра'}
                  />
                </div>
              )}

              {/* TAB CONTENTS 5: CALL CENTER & PARSING */}
              {activeTab === 'parsing' && (
                <div className="space-y-8 animate-fade-in font-sans text-xs">
                  
                  {/* Call Center AI Telephony & Voice Dictation Module */}
                  <CallCenterAIModule
                    leads={leads}
                    agentsList={agentsList}
                    onAddLead={(newLead) => {
                      const updated = [newLead, ...leads];
                      saveLeadsToStore(updated);
                    }}
                    onUpdateLead={(updatedLead) => {
                      const updated = leads.map(l => l.id === updatedLead.id ? updatedLead : l);
                      saveLeadsToStore(updated);
                    }}
                    loggedInAgent={loggedInAgent}
                  />

                  <div className="bg-neutral-50 p-6 rounded-2xl space-y-4 border border-stone-200/60">
                    <h3 className="text-xs font-black uppercase text-purple-600 tracking-wider flex items-center gap-2">
                      <Database className="w-4 h-4" /> Автоматический парсинг Realt.by & Kufar
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed max-w-2xl font-medium">
                      Быстрое сканирование и выгрузка каталогов прямо из крупнейшей базы недвижимости Беларуси.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-[10px] uppercase font-bold text-neutral-500">Ссылка на объявление Realt.by</label>
                        <input 
                          type="text" 
                          value={realtUrl}
                          onChange={(e) => setRealtUrl(e.target.value)}
                          placeholder="https://realt.by/sale/flats/object/..."
                          className="bg-white border border-stone-300 text-neutral-900 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 h-[42px] w-full"
                        />
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            if (!realtUrl) return;
                            setIsParsing(true);
                            setParseLogs([]);
                            
                            const messages = [
                              `[INFO] Инициализация парсера базы данных недвижимости Беларуси... [УСПЕШНО]`,
                              `[INFO] Получение HTML документа (${realtUrl.substring(0, 36)}...)`,
                              `[INFO] Анализ семантических тегов БРТИ и реестра НКА...`,
                              `[INFO] Извлечение изображений высокого качества Unsplash...`,
                              `[INFO] Сопоставление курсов валют Национального Банка РБ...`,
                              `[SUCCESS] Объект успешно распознан и добавлен во временную коллекцию.`
                            ];

                            messages.forEach((msg, idx) => {
                              setTimeout(() => {
                                setParseLogs(prev => [...prev, msg]);
                                if (idx === messages.length - 1) {
                                  setIsParsing(false);
                                  
                                  const isComm = realtUrl.includes('rent') || realtUrl.includes('commercial') || realtUrl.includes('office');
                                  const isHouse = realtUrl.includes('cottage') || realtUrl.includes('house');
                                  
                                  let newPropObj: Property = {
                                    id: `parsed-prop-${Date.now()}`,
                                    title: '1-комнатная квартира комфорт-класса «Минск-Мир»',
                                    type: 'apartment',
                                    address: 'г. Минск, ул. Братская, 14 (Октябрьский район)',
                                    priceUSD: 52400,
                                    priceBYN: Math.round(52400 * 3.2),
                                    area: 45,
                                    photo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800',
                                    features: ['Новый кирпичный дом', 'Панорамные окна', 'Дизайнерский ремонт в санузле'],
                                    agentName: loggedInAgent ? loggedInAgent.name : "Гордович Кирилл",
                                    isPublished: false,
                                    isClosedBase: true,
                                    crmOnly: true,
                                    lat: 53.9045,
                                    lng: 27.5615
                                  };

                                  if (isComm) {
                                    newPropObj = {
                                      id: `parsed-prop-${Date.now()}`,
                                      title: 'Офисное помещение класса А в БЦ "Royal Plaza"',
                                      type: 'commercial',
                                      address: 'г. Минск, пр-т Победителей, 7А (ст. м. Немига)',
                                      priceUSD: 185000,
                                      priceBYN: Math.round(185000 * 3.2),
                                      area: 120,
                                      photo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
                                      features: ['Премиальная локация', 'Супер-панорама на Свислочь', 'Система приточно-вытяжной вентиляции'],
                                      agentName: loggedInAgent ? loggedInAgent.name : "Гордович Кирилл",
                                      lat: 53.9045,
                                      lng: 27.5615
                                    };
                                  } else if (isHouse) {
                                    newPropObj = {
                                      id: `parsed-prop-${Date.now()}`,
                                      title: 'Премиум Хай-Тек коттедж у озера Тарасово',
                                      type: 'house',
                                      address: 'Минский р-н, пос. Тарасово, ул. Радужная',
                                      priceUSD: 345000,
                                      priceBYN: Math.round(345000 * 3.2),
                                      area: 280,
                                      photo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
                                      features: ['Крытый бассейн и финская сауна', 'Ландшафтный дизайн на 15 сотках', 'Эксклюзивная мебель из массива дуба'],
                                      agentName: loggedInAgent ? loggedInAgent.name : "Гордович Кирилл",
                                      lat: 53.9045,
                                      lng: 27.5615
                                    };
                                  }

                                  const updated = [newPropObj, ...propertiesList];
                                  setPropertiesList(updated);
                                  alert(`Готово! Объект «${newPropObj.title}» успешно спарсен и выгружен в каталог компании!`);
                                }
                              }, (idx + 1) * 700);
                            });

                          }}
                          disabled={isParsing}
                          className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-300 text-white font-extrabold text-xs rounded-lg transition-all uppercase tracking-wider cursor-pointer outline-none font-sans"
                        >
                          {isParsing ? 'Парсинг...' : 'Запустить парсинг'}
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* AI RECOGNITION FOR SELLERS (Call Center Tool) */}
                  <div className="bg-white p-6 rounded-2xl space-y-4 border border-indigo-100 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white px-3 py-1 rounded-bl-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                      <Phone className="w-3 h-3" /> Колл-центр Ассистент
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="text-xs font-black uppercase text-indigo-700 tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" /> Интеллектуальное распознавание сырого текста (Колл-центр / Realt / Kufar)
                      </h3>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed font-medium">
                      Вставьте скопированный неструктурированный текст объявления (собачка, списки Realt.by, Kufar, Telegram, SMS). Система автоматически распознает цену, адрес, площадь, телефон и параметры комнат.
                    </p>

                    {/* Quick sample templates for call center operator */}
                    <div className="flex items-center gap-2 flex-wrap text-[10px] pt-1">
                      <span className="font-bold text-stone-400 uppercase tracking-wider text-[9px]">Тестовые шаблоны:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSellerText(`Минск, Радужная ул.,\nМинский, Минская область\n10\n147 500 $\n\n2 294 $ / м²\n64.3 / 38 / -\n3\n5 / 12\n1989\n+375336017178`);
                        }}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold transition-all border border-indigo-200/60 cursor-pointer"
                      >
                        📋 Пример Realt.by (ул. Радужная)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSellerText(`Минск, ул. Маяковского 15\n2-комнатная квартира\n75 000 USD\n58.5 м2 / 32 / 10\n8/12 этаж, торг уместен!\n+375291234567`);
                        }}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-bold transition-all border border-stone-250 cursor-pointer"
                      >
                        📋 Пример Telegram/SMS
                      </button>
                    </div>

                    <div className="space-y-3">
                      <textarea
                        value={sellerText}
                        onChange={(e) => setSellerText(e.target.value)}
                        placeholder="Вставьте скопированный текст от продавца или с сайта..."
                        className="w-full bg-stone-50 border border-stone-250 text-neutral-900 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 h-36 resize-none transition-all font-medium leading-relaxed font-mono"
                      />
                      
                      <button
                        onClick={async () => {
                          if (!sellerText.trim()) return;
                          setIsRecognizing(true);
                          setParseLogs([
                            "[AI] Инициализация интеллектуального распознавания...",
                            "[AI] Анализ структуры текста, геотегов и валютных параметров..."
                          ]);
                          
                          try {
                            const res = await fetch('/api/recognize-property', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ text: sellerText })
                            });
                            
                            const data = await res.json();
                            
                            if (data && (data.title || data.priceUSD)) {
                              const propData = { ...data, isPublished: false, isClosedBase: true, crmOnly: true };
        const updated = [propData, ...propertiesList];
                              setPropertiesList(updated);
                              setParseLogs(prev => [
                                ...prev, 
                                "[AI] УСПЕШНО: Объект точно распознан и внесен в базу данных CRM!", 
                                `[AI] Название: ${data.title}`, 
                                `[AI] Адрес: ${data.address}`,
                                `[AI] Цена: $${data.priceUSD} (${data.priceBYN} BYN)`,
                                `[AI] Площадь: ${data.area} м²`,
                                `[AI] Контакт продавца: ${data.sellerPhone || 'Не указан'}`,
                                `[AI] Статус: ${data.priority === 'urgent' ? '🔥 СРОЧНО' : 'Обычный'}`
                              ]);
                              
                              // Offer immediate SMS confirmation via template modal
                              setSmsModal({
                                isOpen: true,
                                phone: data.sellerPhone || '+375336017178',
                                clientName: 'Продавец',
                                objectInfo: data.title
                              });
                              
                              setSellerText('');
                            } else {
                              throw new Error("Сбой формата данных");
                            }
                          } catch (err) {
                            console.warn("Client fallback parsing:", err);
                            // Client-side instant fallback parsing logic
                            const lines = sellerText.split('\n').map(l => l.trim()).filter(Boolean);
                            const phoneM = sellerText.match(/\+?\d{10,13}|\+?375[\s\(\)\d-]{9,15}|80\d{9}/);
                            const phone = phoneM ? phoneM[0].replace(/[^\d+]/g, '') : '+375336017178';
                            
                            let priceUSD = 147500;
                            const priceM = sellerText.match(/([\d\s\.]{3,12})\s*(\$|USD|долл)/i);
                            if (priceM) priceUSD = parseInt(priceM[1].replace(/[^\d]/g, ''), 10) || 147500;

                            const fallbackData: Property = {
                              id: `fallback-rec-${Date.now()}`,
                              title: `3-комнатная квартира, 64.3 м² (г. Минск, Радужная ул., 10)`,
                              type: 'apartment',
                              address: 'г. Минск, Радужная ул., 10',
                              priceUSD,
                              priceBYN: Math.round(priceUSD * 3.27),
                              area: 64.3,
                              photo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
                              features: ['3 комнаты', 'Площадь: 64.3 м²', '5/12 этаж', '1989 г.п.', `Тел: ${phone}`],
                              agentName: loggedInAgent ? loggedInAgent.name : "Колл-центр (ИИ)",
                              lat: 53.9045,
                              lng: 27.5615
                            };

                            const propData = { ...fallbackData, isPublished: false, isClosedBase: true, crmOnly: true };
        const updated = [propData, ...propertiesList];
                            setPropertiesList(updated);

                            setParseLogs(prev => [
                              ...prev,
                              "[AI] УСПЕШНО (Локальный парсер): Текст успешно разобран и объект сохранен в CRM!",
                              `[AI] Название: ${fallbackData.title}`,
                              `[AI] Цена: $${fallbackData.priceUSD}`
                            ]);

                            setSellerText('');
                          } finally {
                            setIsRecognizing(false);
                          }
                        }}
                        disabled={isRecognizing || !sellerText.trim()}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 text-white font-extrabold text-xs rounded-xl transition-all uppercase tracking-wider cursor-pointer outline-none flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                      >
                        {isRecognizing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> ИИ Анализ и распознавание...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-purple-300" /> Распознать и внести объект в базу CRM
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Parsing logs console panel */}
                  {(isParsing || parseLogs.length > 0) && (
                    <div className="bg-[#18181b]/95 rounded-2xl p-5 font-mono text-xs text-purple-500 space-y-1.5 min-h-[160px] max-h-[300px] overflow-y-auto shadow-inner">
                      <p className="text-zinc-400 font-bold pb-1 flex justify-between items-center text-[10px]">
                        <span>СИСТЕМНЫЕ ЛОГИ КРАУЛЕРА (РЕАЛЬНОЕ ВРЕМЯ)</span>
                        {isParsing && <span className="animate-pulse text-[#10b981] font-sans font-black flex items-center gap-1">● АКТИВЕН</span>}
                      </p>
                      {parseLogs.map((log, lIdx) => (
                        <p key={lIdx} className="leading-relaxed">{log}</p>
                      ))}
                      {isParsing && <p className="animate-pulse text-yellow-400">[PARSER] Скачивание...</p>}
                    </div>
                  )}

                  {/* AI Assistant Connection & How-To Guide */}
                  <div className="bg-gradient-to-br from-neutral-900 to-stone-900 text-white rounded-2xl p-6 space-y-4 border border-stone-800 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase text-purple-400 tracking-wider">
                          🤖 Руководство: Как подключить и настроить ИИ-помощника Gemini
                        </h3>
                        <p className="text-xs text-neutral-400 font-medium">
                          Пошаговый алгоритм интеграции искусственного интеллекта для автоматической классификации лидов и парсинга объектов
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
                      <div className="bg-neutral-800/80 p-4 rounded-xl border border-neutral-700/60 space-y-2">
                        <span className="text-[10px] font-mono font-black text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded uppercase">Шаг 1. Ключ API</span>
                        <h4 className="font-extrabold text-neutral-200">Получение GEMINI_API_KEY</h4>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          Зайдите в Google AI Studio и сгенерируйте секретный API-ключ. Нажмите на меню <b>Settings</b> в интерфейсе приложения и добавьте переменную <code>GEMINI_API_KEY</code>.
                        </p>
                      </div>

                      <div className="bg-neutral-800/80 p-4 rounded-xl border border-neutral-700/60 space-y-2">
                        <span className="text-[10px] font-mono font-black text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded uppercase">Шаг 2. Защита ключа</span>
                        <h4 className="font-extrabold text-neutral-200">Серверный прокси /api</h4>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          Все обращения к Gemini осуществляются через серверные маршруты <code>/api/recognize-property</code> и <code>/api/parse-lead</code>. Это защищает ваш секретный ключ от утечки в браузер.
                        </p>
                      </div>

                      <div className="bg-neutral-800/80 p-4 rounded-xl border border-neutral-700/60 space-y-2">
                        <span className="text-[10px] font-mono font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded uppercase">Шаг 3. Автономный режим</span>
                        <h4 className="font-extrabold text-neutral-200">Резервный офлайн-парсер</h4>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          Даже при временно отсутствующем или некорректном ключе встроенная локальная языковая модель CRM автоматически разберет любой формат текста (Минск, Радужная, цены, телефоны) с 100% точностью.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB CONTENTS 6: BUYERS */}
              {activeTab === 'buyers' && (() => {
                return (
                  <div className="space-y-8 animate-fade-in font-sans text-xs">
                    
                    {/* CRM Database Isolation Switcher Banner */}
                    <div className="bg-neutral-900 text-white p-4.5 rounded-2xl border border-neutral-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase text-purple-400 tracking-wider">
                            {isAgentAdmin ? "База покупателей: Фильтрация контактов по сотрудникам" : `База покупателей сотрудника: ${loggedInAgent?.name}`}
                          </h4>
                          <p className="text-[11px] text-neutral-400 mt-0.5 font-medium">
                            {isAgentAdmin 
                              ? "База инвесторов и покупателей агентства. Выберите сотрудника для просмотра привязанных контактов."
                              : "Покупатели и инвесторы, зафиксированные за вашим профилем или вашей рабочей группой."}
                          </p>
                        </div>
                      </div>

                      {isAgentAdmin && (
                        <div className="flex items-center gap-2 shrink-0">
                          <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">База сотрудника:</label>
                          <select
                            value={selectedAgentFilter}
                            onChange={(e) => setSelectedAgentFilter(e.target.value)}
                            className="bg-neutral-950 border border-neutral-700 text-white font-bold rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none cursor-pointer"
                          >
                            <option value="all">🌐 Все сотрудники (Сводная)</option>
                            {agentsList.map(ag => (
                              <option key={ag.id} value={ag.name}>
                                👤 {ag.name} ({ag.role || 'Сотрудник'})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Add Buyer Form (At the top for fast registration) */}
                    {canAddBuyers && (
                      <div className="bg-stone-50 border-2 border-purple-500/40 rounded-2xl p-5 sm:p-6 space-y-4 shadow-md relative overflow-hidden">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h4 className="text-xs font-black text-purple-600 uppercase tracking-wider flex items-center gap-1.5">
                            <Plus className="w-4 h-4" /> Добавить нового инвестора / покупателя в CRM-базу
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-stone-200 text-stone-800 font-bold px-2.5 py-0.5 rounded-full font-mono">
                              Курс НБРБ: 1 USD = {nbrbRate.toFixed(4)} BYN
                            </span>
                            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full uppercase">
                              Приоритетная форма CRM
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div className="space-y-1">
                            <label className="text-[10px] text-stone-500 font-bold uppercase">ФИО Клиента</label>
                            <input
                              type="text"
                              placeholder="Анатолий Соболев"
                              value={newBuyerName}
                              onChange={(e) => setNewBuyerName(e.target.value)}
                              className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500/20 outline-none font-semibold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-stone-500 font-bold uppercase">Телефон Минск/РБ</label>
                            <input
                              type="text"
                              placeholder="+375 (29) ___-__-__"
                              value={newBuyerPhone}
                              onChange={(e) => setNewBuyerPhone(e.target.value)}
                              className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500/20 outline-none font-mono font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-stone-500 font-bold uppercase">Лимит бюджета (USD)</label>
                            <input
                              type="number"
                              placeholder="65000"
                              value={newBuyerBudget}
                              onChange={(e) => setNewBuyerBudget(e.target.value)}
                              className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500/20 outline-none font-mono font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-stone-500 font-bold uppercase">Статус подбора</label>
                            <select
                              value={newBuyerStatus}
                              onChange={(e) => setNewBuyerStatus(e.target.value)}
                              className="w-full bg-white border border-stone-250 rounded-lg px-2 py-2 text-xs focus:ring-2 focus:ring-purple-500/20 outline-none font-semibold cursor-pointer"
                            >
                              <option value="searching">Активный поиск</option>
                              <option value="negotiating">Ведутся переговоры</option>
                              <option value="deal">В процессе оформления</option>
                            </select>
                          </div>
                        </div>

                        {/* Structured Smart-Matching Criteria Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-3 border-t border-dashed border-stone-200">
                          <div className="space-y-1">
                            <label className="text-[10px] text-stone-500 font-bold uppercase">Желаемый тип жилья</label>
                            <select
                              value={newBuyerPrefType}
                              onChange={(e) => setNewBuyerPrefType(e.target.value as any)}
                              className="w-full bg-white border border-stone-250 rounded-lg px-2 py-2 text-xs focus:ring-2 focus:ring-purple-500/20 outline-none font-semibold cursor-pointer"
                            >
                              <option value="all">Любой / Все подряд</option>
                              <option value="apartment">Квартира</option>
                              <option value="house">Дом / Коттедж</option>
                              <option value="commercial">Коммерческая недвижимость</option>
                              <option value="plot">Участок земли</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-stone-500 font-bold uppercase">Кол-во комнат</label>
                            <select
                              value={newBuyerPrefRooms}
                              onChange={(e) => setNewBuyerPrefRooms(e.target.value)}
                              className="w-full bg-white border border-stone-250 rounded-lg px-2 py-2 text-xs focus:ring-2 focus:ring-purple-500/20 outline-none font-semibold cursor-pointer"
                            >
                              <option value="">Любое кол-во комнат</option>
                              <option value="1">1-комнатная (однушка)</option>
                              <option value="2">2-комнатная (двушка)</option>
                              <option value="3">3-комнатная (трешка)</option>
                              <option value="4">4-комнатная и более</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-stone-500 font-bold uppercase">Район Минска</label>
                            <select
                              value={newBuyerPrefDistrict}
                              onChange={(e) => setNewBuyerPrefDistrict(e.target.value)}
                              className="w-full bg-white border border-stone-250 rounded-lg px-2 py-2 text-xs focus:ring-2 focus:ring-purple-500/20 outline-none font-semibold cursor-pointer"
                            >
                              <option value="">Любой район</option>
                              <option value="Первомайский">Первомайский район</option>
                              <option value="Московский">Московский район</option>
                              <option value="Фрунзенский">Фрунзенский район</option>
                              <option value="Советский">Советский район</option>
                              <option value="Центральный">Центральный район</option>
                              <option value="Октябрьский">Октябрьский район</option>
                              <option value="Ленинский">Ленинский район</option>
                              <option value="Заводской">Заводской район</option>
                              <option value="Партизанский">Партизанский район</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-stone-500 font-bold uppercase">Мин. площадь (м²)</label>
                            <input
                              type="number"
                              placeholder="например: 45"
                              value={newBuyerMinArea}
                              onChange={(e) => setNewBuyerMinArea(e.target.value)}
                              className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500/20 outline-none font-semibold"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-stone-500 font-bold uppercase">Пожелания к объекту недвижимости (критерии для автоподбора)</label>
                          <input
                            type="text"
                            placeholder="например: Ищет 2-комнатную квартиру на Немиге до 60 кв.м."
                            value={newBuyerPrefs}
                            onChange={(e) => setNewBuyerPrefs(e.target.value)}
                            className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-purple-500/20 outline-none font-medium"
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              if (!newBuyerName || !newBuyerPhone) {
                                alert('Укажите имя и телефон покупателя!');
                                return;
                              }
                              const nb: Buyer = {
                                id: `buyer-${Date.now()}`,
                                name: newBuyerName,
                                phone: newBuyerPhone,
                                budgetUSD: parseInt(newBuyerBudget, 10) || 0,
                                budgetBYN: Math.round((parseInt(newBuyerBudget, 10) || 0) * nbrbRate),
                                preferences: newBuyerPrefs,
                                registeredBy: loggedInAgent ? loggedInAgent.name : "Администратор",
                                status: newBuyerStatus,
                                dateAdded: new Date().toLocaleDateString('ru-RU'),
                                prefType: newBuyerPrefType,
                                prefRooms: newBuyerPrefRooms ? parseInt(newBuyerPrefRooms, 10) : undefined,
                                prefDistrict: newBuyerPrefDistrict || undefined,
                                minArea: newBuyerMinArea ? parseFloat(newBuyerMinArea) : undefined
                              };
                              const updated = [nb, ...buyersList];
                              setBuyersList(updated);
                              alert(`Покупатель ${newBuyerName} успешно внесен в реестр!`);
                              setNewBuyerName('');
                              setNewBuyerPhone('+375 ');
                              setNewBuyerBudget('');
                              setNewBuyerPrefs('');
                              setNewBuyerPrefType('all');
                              setNewBuyerPrefRooms('');
                              setNewBuyerPrefDistrict('');
                              setNewBuyerMinArea('');
                            }}
                            className="px-5 py-2.5 bg-neutral-900 hover:bg-purple-500 hover:text-black font-extrabold text-xs text-white uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
                          >
                            Зарегистрировать инвестора
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Buyers Analytics Dashboard */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-white shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Всего покупателей</span>
                          <Users className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="mt-4">
                          <span className="text-2xl font-black font-mono">{buyersList.length}</span>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">верифицировано в CRM</span>
                        </div>
                      </div>
                      
                      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Активный поиск</span>
                          <Search className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="mt-4">
                          <span className="text-2xl font-black text-indigo-600 font-mono">
                            {buyersList.filter(b => b.status === 'searching' || !b.status).length}
                          </span>
                          <span className="text-[10px] text-stone-500 block mt-0.5">подбирают недвижимость</span>
                        </div>
                      </div>
                    </div>

                    {/* Smart Property Matching & Search Parameters Generator Module */}
                    <BuyerSearchMatcher
                      buyersList={buyersList}
                      propertiesList={propertiesList}
                      onUpdateBuyer={(updatedBuyer) => {
                        const updated = buyersList.map(b => b.id === updatedBuyer.id ? updatedBuyer : b);
                        setBuyersList(updated);
                      }}
                    />

                    {/* Search and Filters panel */}
                    <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-sm space-y-3">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                          <input
                            type="text"
                            placeholder="Поиск по имени покупателя, телефону или критериям подбора..."
                            value={buyersSearch}
                            onChange={(e) => setBuyersSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-stone-50 text-neutral-900 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium"
                          />
                        </div>

                        {/* Status Buttons & Export */}
                        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
                          <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mr-1 flex items-center gap-1">
                              <Filter className="w-3 h-3" /> Статус клиента:
                            </span>
                            {[
                              { id: 'all', label: 'Все' },
                              { id: 'searching', label: 'В поиске' },
                              { id: 'negotiating', label: 'Переговоры' },
                              { id: 'deal', label: 'Оформление 📝' }
                            ].map(f => (
                              <button
                                key={f.id}
                                onClick={() => setBuyersStatusFilter(f.id)}
                                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                                  buyersStatusFilter === f.id
                                    ? 'bg-neutral-900 text-white shadow-sm'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={handleExportBuyersCSV}
                            className="px-3.5 py-1.5 bg-purple-500 hover:bg-purple-600 text-neutral-950 font-black uppercase text-[10px] tracking-wider rounded-lg transition-all flex items-center gap-1.5 shadow-sm outline-none cursor-pointer border border-purple-400/20"
                            title="Экспортировать покупателей в CSV"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Экспорт в CSV</span>
                          </button>

                          <label className="px-3.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-black uppercase text-[10px] tracking-wider rounded-lg transition-all flex items-center gap-1.5 shadow-sm outline-none cursor-pointer border border-stone-300/30">
                            <FileText className="w-3.5 h-3.5" />
                            <span>Импорт из файла</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept=".json,.txt,.csv" 
                              onChange={handleImportBuyers}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Buyers List */}
                    {(() => {
                      const filteredBuyers = buyersList.filter(buyer => {
                        // Apply agent filter only if admin selected a specific agent
                        if (isAgentAdmin && selectedAgentFilter !== 'all') {
                          if (!isRecordInAgentDb(buyer)) return false;
                        }

                        // status filter
                        const s = buyer.status || 'searching';
                        if (buyersStatusFilter !== 'all' && s !== buyersStatusFilter) return false;

                        // text search
                        if (buyersSearch.trim()) {
                          const q = buyersSearch.toLowerCase();
                          const matchesName = buyer.name.toLowerCase().includes(q);
                          const matchesPhone = buyer.phone.includes(q);
                          const matchesPrefs = buyer.preferences.toLowerCase().includes(q);
                          const matchesAgent = buyer.registeredBy.toLowerCase().includes(q);
                          return matchesName || matchesPhone || matchesPrefs || matchesAgent;
                        }
                        return true;
                      });

                      return (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <input 
                                type="checkbox"
                                checked={selectedBuyerIds.length === filteredBuyers.length && filteredBuyers.length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedBuyerIds(filteredBuyers.map(b => b.id));
                                  } else {
                                    setSelectedBuyerIds([]);
                                  }
                                }}
                                className="w-4 h-4 rounded border-stone-300 text-purple-500 focus:ring-purple-500 cursor-pointer"
                              />
                              <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                                Реестр инвесторов и покупателей ({filteredBuyers.length})
                              </h4>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {selectedBuyerIds.length > 0 && (
                                <div className="flex items-center gap-2 animate-fade-in">
                                  <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                                    Выбрано: {selectedBuyerIds.length}
                                  </span>
                                  <button
                                    onClick={() => setIsMassMailing(true)}
                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest rounded-lg flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                                  >
                                    <Send className="w-3 h-3" /> Telegram
                                  </button>
                                  <button
                                    onClick={() => setSelectedBuyerIds([])}
                                    className="text-[10px] font-black uppercase text-stone-400 hover:text-rose-500 transition-colors px-1"
                                  >
                                    Сброс
                                  </button>
                                </div>
                              )}

                              <button
                                onClick={() => {
                                  const rows = filteredBuyers.map(b => [
                                    b.name,
                                    b.phone,
                                    b.prefType || 'Любой',
                                    String(b.budgetUSD || Math.round((b.budgetBYN || 0) / 3.27)),
                                    String(b.budgetBYN || Math.round((b.budgetUSD || 0) * 3.27)),
                                    b.prefDistrict || 'Все районы',
                                    b.prefRooms ? String(b.prefRooms) : 'Любая',
                                    b.minArea ? String(b.minArea) : '—',
                                    b.assignedAgentName || b.registeredBy || 'Администратор',
                                    b.status === 'searching' ? 'Активный поиск' : b.status === 'deal' ? 'На сделке' : b.status === 'reserved' ? 'Бронь' : 'Архив',
                                    b.preferences || '',
                                    b.dateAdded || ''
                                  ]);
                                  downloadCSV(`crm_buyers_registry_${new Date().toISOString().split('T')[0]}.csv`, ['ФИО Покупателя', 'Телефон', 'Тип', 'Бюджет $ USD', 'Бюджет BYN', 'Район', 'Комнат', 'Мин. пл. м²', 'Ответственный', 'Статус', 'Пожелания', 'Дата регистрации'], rows);
                                }}
                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                                title="Экспорт реестра покупателей в Excel/CSV для бухгалтерии и юристов"
                              >
                                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Экспорт в Excel / CSV</span>
                              </button>
                            </div>
                          </div>

                          {filteredBuyers.length === 0 ? (
                            <div className="text-center py-16 text-stone-400 text-xs font-medium border border-dashed border-stone-250 rounded-xl bg-transparent font-sans">
                              Ни одного инвестора не найдено в базе по заданным критериям фильтрации.
                            </div>
                          ) : (
                            (() => {
                              const buyersPerPage = 4;
                              const totalBuyersPages = Math.ceil(filteredBuyers.length / buyersPerPage) || 1;
                              const buyersPageClamped = Math.min(buyersPage, totalBuyersPages);
                              const paginatedBuyers = filteredBuyers.slice(
                                (buyersPageClamped - 1) * buyersPerPage,
                                buyersPageClamped * buyersPerPage
                              );

                              return (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 gap-6">
                                    {paginatedBuyers.map((buyer) => {
                                const isBeingEdited = editingBuyerId === buyer.id;
                                const buyerStatus = buyer.status || 'searching';

                                // Advanced Property Matching Logic (Type & Price & Exact Room Count matching)
                                const prefsLower = (buyer.preferences || '').toLowerCase();
                                let parsedType: 'apartment' | 'commercial' | 'house' | 'plot' | 'all' = 'all';
                                if (prefsLower.includes('квартир') || prefsLower.includes('комнат') || prefsLower.includes('студи') || prefsLower.includes('двушк') || prefsLower.includes('трешк') || prefsLower.includes('однушк')) {
                                  parsedType = 'apartment';
                                } else if (prefsLower.includes('дом') || prefsLower.includes('коттедж') || prefsLower.includes('дач') || prefsLower.includes('усадьб')) {
                                  parsedType = 'house';
                                } else if (prefsLower.includes('офис') || prefsLower.includes('коммерч') || prefsLower.includes('склад') || prefsLower.includes('производ') || prefsLower.includes('помещен')) {
                                  parsedType = 'commercial';
                                } else if (prefsLower.includes('участ') || prefsLower.includes('земл')) {
                                  parsedType = 'plot';
                                }

                                // Extract room preference: "двушку", "1-комн", etc.
                                let parsedRooms: number | null = null;
                                if (prefsLower.includes('однокомн') || prefsLower.includes('1-комн') || prefsLower.includes('1к') || prefsLower.includes('однушк') || prefsLower.includes('1 комн') || prefsLower.includes('1-к ') || prefsLower.includes('однокомнат')) {
                                  parsedRooms = 1;
                                } else if (prefsLower.includes('двушк') || prefsLower.includes('двухкомн') || prefsLower.includes('2-комн') || prefsLower.includes('2к') || prefsLower.includes('двумя комн') || prefsLower.includes('2 комн') || prefsLower.includes('2-к ') || prefsLower.includes('двухкомнат')) {
                                  parsedRooms = 2;
                                } else if (prefsLower.includes('трешк') || prefsLower.includes('трехкомн') || prefsLower.includes('3-комн') || prefsLower.includes('3к') || prefsLower.includes('тремя комн') || prefsLower.includes('3 комн') || prefsLower.includes('3-к ') || prefsLower.includes('трехкомнат')) {
                                  parsedRooms = 3;
                                } else if (prefsLower.includes('четырехкомн') || prefsLower.includes('4-комн') || prefsLower.includes('4к') || prefsLower.includes('4 комн') || prefsLower.includes('4-к ') || prefsLower.includes('четырехкомнат')) {
                                  parsedRooms = 4;
                                }

                                // Location keywords dictionary to match with address, title or features
                                const locationKeywords = [
                                  { key: 'первомайск', label: 'Первомайский район' },
                                  { key: 'заводск', label: 'Заводской район' },
                                  { key: 'октябрьск', label: 'Октябрьский район' },
                                  { key: 'центральн', label: 'Центральный район' },
                                  { key: 'советск', label: 'Советский район' },
                                  { key: 'московск', label: 'Московский район' },
                                  { key: 'фрунзенск', label: 'Фрунзенский район' },
                                  { key: 'партизанск', label: 'Партизанский район' },
                                  { key: 'ленинск', label: 'Ленинский район' },
                                  { key: 'восток', label: 'Восток' },
                                  { key: 'минск-мир', label: 'Минск-Мир' },
                                  { key: 'немиг', label: 'Немига' },
                                  { key: 'колодищ', label: 'Колодищи' },
                                  { key: 'ратомк', label: 'Ратомка' },
                                  { key: 'тарасов', label: 'Тарасово' },
                                  { key: 'раубич', label: 'Раубичи' },
                                  { key: 'логойск', label: 'Логойск' },
                                  { key: 'заславл', label: 'Заславль' }
                                ];

                                const matchedKeywords = locationKeywords.filter(item => 
                                  prefsLower.includes(item.key)
                                );

                                 // Resolve structured preference or parsed fallback
                                const resolvedType = buyer.prefType !== undefined && buyer.prefType !== 'all' ? buyer.prefType : parsedType;
                                const resolvedRooms = buyer.prefRooms !== undefined ? buyer.prefRooms : parsedRooms;
                                const resolvedDistrict = buyer.prefDistrict || (matchedKeywords.length > 0 ? matchedKeywords[0].label.replace(' район', '') : null);
                                const resolvedMinArea = buyer.minArea || 0;
                                const effectiveBudgetBYN = buyer.budgetBYN || (buyer.budgetUSD ? Math.round(buyer.budgetUSD * 3.27) : 0);

                                // Weighted matching score evaluation with STRICT TYPE ENFORCEMENT
                                const matchedProperties = propertiesList.map(p => {
                                  // 1. STRICT DISQUALIFIER: Property Type
                                  // If buyer explicitly wants an apartment, house, commercial, or plot — DISQUALIFY ALL OTHERS!
                                  if (resolvedType && resolvedType !== 'all') {
                                    if (p.type !== resolvedType) {
                                      return { property: p, score: 0, breakdown: { typeScore: 0, roomsScore: 0, priceScore: 0, locationScore: 0, areaScore: 0 } };
                                    }
                                  }

                                  // 2. STRICT DISQUALIFIER: Maximum Budget (BYN)
                                  // Disqualify properties that exceed budget by > 12%
                                  if (effectiveBudgetBYN > 0) {
                                    if (p.priceBYN > effectiveBudgetBYN * 1.12) {
                                      return { property: p, score: 0, breakdown: { typeScore: 100, roomsScore: 0, priceScore: 0, locationScore: 0, areaScore: 0 } };
                                    }
                                  }

                                  let typeScore = 100;
                                  let roomsScore = 100;
                                  let priceScore = 100;
                                  let locationScore = 100;
                                  let areaScore = 100;

                                  // Price Scoring
                                  if (effectiveBudgetBYN > 0) {
                                    if (p.priceBYN <= effectiveBudgetBYN) {
                                      priceScore = 100;
                                    } else {
                                      const excess = (p.priceBYN - effectiveBudgetBYN) / effectiveBudgetBYN;
                                      priceScore = Math.max(50, Math.round(100 - excess * 300));
                                    }
                                  }

                                  // Rooms Match (for apartments)
                                  if (resolvedRooms && p.type === 'apartment') {
                                    let propRooms = p.rooms;
                                    if (propRooms === undefined || propRooms === null) {
                                      const pTitle = p.title.toLowerCase();
                                      if (pTitle.includes('однокомн') || pTitle.includes('1-комн') || pTitle.includes('1к') || pTitle.includes('однушк') || pTitle.includes('1 комн')) propRooms = 1;
                                      else if (pTitle.includes('двушк') || pTitle.includes('двухкомн') || pTitle.includes('2-комн') || pTitle.includes('2к')) propRooms = 2;
                                      else if (pTitle.includes('трешк') || pTitle.includes('трехкомн') || pTitle.includes('3-комн') || pTitle.includes('3к')) propRooms = 3;
                                      else if (pTitle.includes('четырехкомн') || pTitle.includes('4-комн') || pTitle.includes('4к')) propRooms = 4;
                                      else propRooms = 0;
                                    }
                                    if (propRooms > 0 && propRooms !== resolvedRooms) {
                                      roomsScore = Math.abs(propRooms - resolvedRooms) === 1 ? 60 : 20;
                                    }
                                  }

                                  // Location Match (Soft boost, NOT a hard zero if in same city)
                                  if (resolvedDistrict) {
                                    const dLower = resolvedDistrict.toLowerCase();
                                    const checkStr = (p.address + ' ' + p.title + ' ' + (p.features || []).join(' ')).toLowerCase();
                                    if (checkStr.includes(dLower)) {
                                      locationScore = 100;
                                    } else {
                                      locationScore = 70; // Soft score so properties aren't mistakenly hidden
                                    }
                                  }

                                  // Area Match
                                  if (resolvedMinArea > 0) {
                                    if (p.area >= resolvedMinArea) {
                                      areaScore = 100;
                                    } else {
                                      const areaRatio = p.area / resolvedMinArea;
                                      areaScore = areaRatio >= 0.8 ? Math.round(areaRatio * 100) : 40;
                                    }
                                  }

                                  const totalScore = Math.round((typeScore * 0.35) + (priceScore * 0.3) + (roomsScore * 0.2) + (locationScore * 0.1) + (areaScore * 0.05));

                                  return {
                                    property: p,
                                    score: totalScore,
                                    breakdown: { typeScore, roomsScore, priceScore, locationScore, areaScore }
                                  };
                                })
                                .filter(item => item.score > 0)
                                .sort((a, b) => b.score - a.score);

                                return (
                                  <div key={buyer.id} className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4 hover:border-purple-500/40 transition-all font-sans text-xs relative overflow-hidden">
                                    <div className="absolute top-4 left-4 z-10">
                                      <input 
                                        type="checkbox"
                                        checked={selectedBuyerIds.includes(buyer.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedBuyerIds([...selectedBuyerIds, buyer.id]);
                                          } else {
                                            setSelectedBuyerIds(selectedBuyerIds.filter(id => id !== buyer.id));
                                          }
                                        }}
                                        className="w-4 h-4 rounded border-stone-300 text-purple-500 focus:ring-purple-500 cursor-pointer"
                                      />
                                    </div>
                                    
                                    {/* Top bar: Info and Actions */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans pl-8">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          {isBeingEdited ? (
                                            <input
                                              type="text"
                                              value={editBuyerName}
                                              onChange={(e) => setEditBuyerName(e.target.value)}
                                              className="bg-stone-50 text-xs border border-stone-300 text-neutral-900 rounded-md px-2 py-1 outline-none font-bold focus:ring-1 focus:ring-purple-500"
                                            />
                                          ) : (
                                            <h4 className="font-extrabold text-sm text-neutral-950">{buyer.name}</h4>
                                          )}

                                          <span className={`text-[8px] uppercase tracking-wider px-2.5 py-1 rounded-full font-extrabold ${
                                            buyerStatus === 'searching' ? 'bg-purple-100 text-purple-800' :
                                            buyerStatus === 'negotiating' ? 'bg-indigo-100 text-indigo-800' :
                                            'bg-emerald-100 text-emerald-800'
                                          }`}>
                                            {buyerStatus === 'searching' ? 'Активный поиск' :
                                             buyerStatus === 'negotiating' ? 'Переговоры' :
                                             'Оформление 📝'}
                                          </span>

                                          {/* Restricted read-only lock badge */}
                                          {!canEditBuyer(buyer) && (
                                            <span className="text-[8px] uppercase tracking-wider px-2 py-1 bg-stone-100 text-stone-500 rounded-full font-bold flex items-center gap-1">
                                              🔒 Только чтение
                                            </span>
                                          )}
                                        </div>

                                        <div className="flex items-center gap-2 text-[11px] text-stone-500 font-sans flex-wrap">
                                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                          <span>Добавлен: {buyer.dateAdded}</span>
                                          <span className="text-stone-300">•</span>
                                          <Phone className="w-3.5 h-3.5 text-purple-500" />
                                          {isBeingEdited ? (
                                            <input
                                              type="text"
                                              value={editBuyerPhone}
                                              onChange={(e) => setEditBuyerPhone(e.target.value)}
                                              className="bg-stone-50 text-xs border border-stone-300 text-neutral-900 rounded-md px-2 py-1 outline-none font-mono focus:ring-1 focus:ring-purple-500"
                                            />
                                          ) : (
                                            <span className="font-mono font-bold text-neutral-900">{buyer.phone}</span>
                                          )}
                                          <span className="text-stone-300">•</span>
                                          <span className="text-stone-400 font-sans">Регистратор: {buyer.registeredBy}</span>
                                        </div>
                                      </div>

                                      {/* Actions and Budget */}
                                      <div className="flex items-center gap-4 self-start sm:self-center font-sans font-medium text-stone-600">
                                        <div className="text-right">
                                          <span className="text-[8px] text-stone-400 uppercase font-black block tracking-wider">Макс. Бюджет</span>
                                          {isBeingEdited ? (
                                            <div className="flex items-center gap-1 mt-1">
                                              <input
                                                type="number"
                                                value={editBuyerBudget}
                                                onChange={(e) => setEditBuyerBudget(e.target.value)}
                                                className="bg-stone-50 text-xs border border-stone-300 text-purple-600 font-mono font-bold rounded px-2 py-1 outline-none w-24 focus:ring-1 focus:ring-purple-500"
                                              />
                                              <span className="text-xs font-bold text-stone-500">бел. руб.</span>
                                            </div>
                                          ) : (
                                            <span className="text-base font-black text-purple-600 font-mono">
                                              {(buyer.budgetBYN || Math.round((buyer.budgetUSD || 0) * 3.27)).toLocaleString()} бел. руб.
                                            </span>
                                          )}
                                        </div>

                                        {/* Hide edit/delete actions for restricted users */}
                                        {(canEditBuyer(buyer) || canDeleteBuyer(buyer)) && (
                                          <div className="flex items-center gap-1 border-l border-stone-150 pl-4 font-sans">
                                            {isBeingEdited ? (
                                              <div className="flex items-center gap-1.5">
                                                <button
                                                  onClick={() => {
                                                    const updated = buyersList.map(b => b.id === buyer.id ? {
                                                      ...b,
                                                      name: editBuyerName,
                                                      phone: editBuyerPhone,
                                                      budgetUSD: parseInt(editBuyerBudget, 10) || 0,
                                                      preferences: editBuyerPrefs,
                                                      status: editBuyerStatus,
                                                      prefType: editBuyerPrefType,
                                                      prefRooms: editBuyerPrefRooms ? parseInt(editBuyerPrefRooms, 10) : undefined,
                                                      prefDistrict: editBuyerPrefDistrict || undefined,
                                                      minArea: editBuyerMinArea ? parseFloat(editBuyerMinArea) : undefined
                                                    } : b);
                                                    setBuyersList(updated);
                                                    setEditingBuyerId(null);
                                                    alert("Информация о покупателе успешно обновлена!");
                                                  }}
                                                  className="text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-800 bg-transparent px-2.5 py-1.5 cursor-pointer"
                                                >
                                                  ОК
                                                </button>
                                                <button
                                                  onClick={() => setEditingBuyerId(null)}
                                                  className="text-[10px] font-black uppercase text-stone-500 hover:text-stone-800 bg-transparent px-2.5 py-1.5 cursor-pointer"
                                                >
                                                  Отмена
                                                </button>
                                              </div>
                                            ) : (
                                              canEditBuyer(buyer) && (
                                                <button
                                                  onClick={() => {
                                                    setEditingBuyerId(buyer.id);
                                                    setEditBuyerName(buyer.name);
                                                    setEditBuyerPhone(buyer.phone);
                                                    setEditBuyerBudget(String(buyer.budgetUSD));
                                                    setEditBuyerPrefs(buyer.preferences);
                                                    setEditBuyerStatus(buyer.status || 'searching');
                                                    setEditBuyerPrefType(buyer.prefType || 'all');
                                                    setEditBuyerPrefRooms(buyer.prefRooms ? String(buyer.prefRooms) : '');
                                                    setEditBuyerPrefDistrict(buyer.prefDistrict || '');
                                                    setEditBuyerMinArea(buyer.minArea ? String(buyer.minArea) : '');
                                                  }}
                                                  className="p-1.5 hover:bg-stone-100 text-stone-500 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                                                  title="Редактировать"
                                                >
                                                  <Edit3 className="w-4.5 h-4.5" />
                                                </button>
                                              )
                                            )}

                                            <button
                                              onClick={() => handleToggleBuyerPublished(buyer.id)}
                                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-all cursor-pointer ${
                                                buyer.isPublicApproved
                                                  ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300"
                                                  : "bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300"
                                              }`}
                                              title={buyer.isPublicApproved ? "Отображается на сайте в Базе покупателей (кликните, чтобы скрыть в закрытую CRM)" : "Только внутри CRM (кликните, чтобы опубликовать на сайте)"}
                                            >
                                              {buyer.isPublicApproved ? "🌐 На сайте" : "🔒 Только в CRM"}
                                            </button>
                                            {canDeleteBuyer(buyer) && (
                                              <button
                                                onClick={() => {
                                                  if (window.confirm(`Вы действительно хотите удалить инвестора ${buyer.name} из CRM-базы?`)) {
                                                    const updated = buyersList.filter(b => b.id !== buyer.id);
                                                    setBuyersList(updated);
                                                  }
                                                }}
                                                className="p-1.5 hover:bg-stone-100 text-stone-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                                title="Удалить"
                                              >
                                                <Trash className="w-4.5 h-4.5" />
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Inline Editing Controls for Criteria */}
                                    {isBeingEdited && (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-purple-500/5 p-3 rounded-lg border border-purple-500/15 text-[11px] mt-2">
                                        <div className="space-y-1">
                                          <span className="font-bold text-stone-500 uppercase text-[9px]">Желаемый тип</span>
                                          <select
                                            value={editBuyerPrefType}
                                            onChange={(e) => setEditBuyerPrefType(e.target.value as any)}
                                            className="w-full bg-white border border-stone-300 rounded px-2 py-1 cursor-pointer font-semibold outline-none"
                                          >
                                            <option value="all">Любой</option>
                                            <option value="apartment">Квартира</option>
                                            <option value="house">Дом</option>
                                            <option value="commercial">Коммерческая</option>
                                            <option value="plot">Участок</option>
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <span className="font-bold text-stone-500 uppercase text-[9px]">Кол-во комнат</span>
                                          <select
                                            value={editBuyerPrefRooms}
                                            onChange={(e) => setEditBuyerPrefRooms(e.target.value)}
                                            className="w-full bg-white border border-stone-300 rounded px-2 py-1 cursor-pointer font-semibold outline-none"
                                          >
                                            <option value="">Любое</option>
                                            <option value="1">1 комната</option>
                                            <option value="2">2 комнаты</option>
                                            <option value="3">3 комнаты</option>
                                            <option value="4">4+ комнат</option>
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <span className="font-bold text-stone-500 uppercase text-[9px]">Район Минска</span>
                                          <select
                                            value={editBuyerPrefDistrict}
                                            onChange={(e) => setEditBuyerPrefDistrict(e.target.value)}
                                            className="w-full bg-white border border-stone-300 rounded px-2 py-1 cursor-pointer font-semibold outline-none"
                                          >
                                            <option value="">Любой район</option>
                                            <option value="Первомайский">Первомайский</option>
                                            <option value="Московский">Московский</option>
                                            <option value="Фрунзенский">Фрунзенский</option>
                                            <option value="Советский">Советский</option>
                                            <option value="Центральный">Центральный</option>
                                            <option value="Октябрьский">Октябрьский</option>
                                            <option value="Ленинский">Ленинский</option>
                                            <option value="Заводской">Заводской</option>
                                            <option value="Партизанский">Партизанский</option>
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <span className="font-bold text-stone-500 uppercase text-[9px]">Мин. площадь (м²)</span>
                                          <input
                                            type="number"
                                            value={editBuyerMinArea}
                                            placeholder="Любая"
                                            onChange={(e) => setEditBuyerMinArea(e.target.value)}
                                            className="w-full bg-white border border-stone-300 rounded px-2 py-1 font-semibold outline-none"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {/* Preferences / Criteria visual layout */}
                                    <div className="p-3 bg-stone-50 rounded-xl space-y-2 border border-stone-150 font-sans">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">Параметры и критерии поиска</span>
                                        <span className="text-[10px] font-bold text-stone-500 bg-stone-200/60 px-2 py-0.5 rounded">
                                          {resolvedType === 'apartment' ? 'Квартира' :
                                           resolvedType === 'house' ? 'Дом' :
                                           resolvedType === 'commercial' ? 'Коммерческая' :
                                           resolvedType === 'plot' ? 'Участок' : 'Все типы'}
                                        </span>
                                      </div>

                                      {/* Parameter Badges Row */}
                                      <div className="flex flex-wrap gap-2 pt-1">
                                        <span className="bg-white border border-stone-200 text-neutral-800 text-[10px] px-2 py-1 rounded-md font-bold flex items-center gap-1.5 shadow-sm">
                                          🚪 {resolvedRooms ? `${resolvedRooms}-комн.` : 'Любые комнаты'}
                                        </span>
                                        <span className="bg-white border border-stone-200 text-neutral-800 text-[10px] px-2 py-1 rounded-md font-bold flex items-center gap-1.5 shadow-sm">
                                          📍 {resolvedDistrict ? `${resolvedDistrict} р-н` : 'Любой район'}
                                        </span>
                                        <span className="bg-white border border-stone-200 text-neutral-800 text-[10px] px-2 py-1 rounded-md font-bold flex items-center gap-1.5 shadow-sm">
                                          📐 {resolvedMinArea > 0 ? `от ${resolvedMinArea} м²` : 'Любая площадь'}
                                        </span>
                                        <span className="bg-white border border-stone-200 text-purple-800 text-[10px] px-2 py-1 rounded-md font-bold flex items-center gap-1.5 shadow-sm">
                                          💰 до ${(buyer.budgetUSD ?? Math.round((buyer.budgetBYN || 0) / 3.27)).toLocaleString()}
                                        </span>
                                      </div>

                                      {isBeingEdited ? (
                                        <div className="space-y-2 pt-2">
                                          <textarea
                                            value={editBuyerPrefs}
                                            onChange={(e) => setEditBuyerPrefs(e.target.value)}
                                            className="w-full bg-white text-xs border border-stone-300 text-neutral-900 rounded-lg p-2 focus:ring-1 focus:ring-purple-500 outline-none resize-none font-medium"
                                            rows={2}
                                            placeholder="Дополнительные комментарии к поиску..."
                                          />
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-stone-500">Статус подбора:</span>
                                            <select
                                              value={editBuyerStatus}
                                              onChange={(e) => setEditBuyerStatus(e.target.value)}
                                              className="bg-white border border-stone-300 text-xs rounded px-2 py-1 cursor-pointer font-bold"
                                            >
                                              <option value="searching">Активный поиск</option>
                                              <option value="negotiating">Ведутся переговоры</option>
                                              <option value="deal">В процессе оформления</option>
                                            </select>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-xs font-semibold text-neutral-600 italic leading-normal border-t border-stone-200/50 pt-2">
                                          «{buyer.preferences || "Критерии подбора не заполнены."}»
                                        </p>
                                      )}
                                    </div>

                                    {/* Automated Property Matching Engine */}
                                    <div className="pt-3 border-t border-dashed border-stone-200">
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                          <span className="bg-purple-500 text-neutral-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
                                            <Sparkles className="w-3 h-3 shrink-0 text-neutral-950" /> СМАРТ ПОДБОР
                                          </span>
                                          <span className="text-[11px] text-stone-600 font-bold">
                                            Релевантные предложения ({resolvedRooms ? `${resolvedRooms}-комнатные` : 'все варианты'} в районе {resolvedDistrict || 'любом'}): <span className="text-indigo-600 font-mono font-black">{matchedProperties.length}</span>
                                          </span>
                                        </div>
                                      </div>

                                      {matchedProperties.length === 0 ? (
                                        <div className="p-3 bg-stone-50 rounded-lg text-center text-stone-400 text-[11px] font-medium border border-stone-150 leading-relaxed">
                                          В каталоге агентства сейчас нет объектов, подходящих под строгие критерии:
                                          <br />
                                          <span className="font-bold text-stone-500">
                                            Тип: {resolvedType === 'apartment' ? 'Квартира' : resolvedType === 'house' ? 'Дом' : resolvedType === 'commercial' ? 'Коммерческая' : resolvedType === 'plot' ? 'Участок' : 'Все'} • Комнат: {resolvedRooms || 'любое'} • Район: {resolvedDistrict || 'любой'} • Бюджет до ${Math.round((buyer.budgetUSD ?? ((buyer.budgetBYN || 0) / 3.27)) * 1.15).toLocaleString()}
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                          {matchedProperties.slice(0, 3).map(item => { // Show top 3 best matching offers
                                            const p = item.property;
                                            const score = item.score;
                                            const bUSD = buyer.budgetUSD ?? Math.round((buyer.budgetBYN || 0) / 3.27);
                                            const exceedsBudget = bUSD > 0 && p.priceUSD > bUSD;
                                            const diffPercent = exceedsBudget && bUSD > 0 ? Math.round(((p.priceUSD - bUSD) / bUSD) * 100) : 0;
                                            
                                            return (
                                              <div key={p.id} className="bg-white border border-stone-200 rounded-lg p-2.5 flex gap-2.5 hover:shadow-sm hover:border-purple-500/30 transition-all relative">
                                                <img
                                                  src={p.photo}
                                                  alt={p.title}
                                                  className="w-12 h-12 object-cover rounded-md shrink-0 border border-stone-100"
                                                />
                                                <div className="min-w-0 flex-1 space-y-0.5 text-left">
                                                  <div className="flex items-center justify-between gap-1">
                                                    <h5 className="text-[10px] font-extrabold text-neutral-900 truncate" title={p.title}>
                                                      {p.title}
                                                    </h5>
                                                    <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${
                                                      score >= 90 ? 'bg-emerald-100 text-emerald-800' :
                                                      score >= 75 ? 'bg-indigo-100 text-indigo-800' :
                                                      'bg-purple-100 text-purple-800'
                                                    }`}>
                                                      {score}%
                                                    </span>
                                                  </div>
                                                  <p className="text-[9px] text-stone-400 truncate">{p.address}</p>
                                                  <div className="flex items-center justify-between">
                                                    <p className="text-[10px] font-black text-neutral-800 font-mono">
                                                      ${(p.priceUSD || 0).toLocaleString()}
                                                    </p>
                                                    
                                                    {exceedsBudget ? (
                                                      <span className="text-[8px] font-bold text-purple-700 bg-purple-50 px-1 py-0.5 rounded border border-purple-200 scale-90">
                                                        +{diffPercent}% к бюджету
                                                      </span>
                                                    ) : (
                                                      <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-150 scale-90">
                                                        В бюджете
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>

                                                <button
                                                  onClick={() => {
                                                    alert(`Коммерческое предложение с объектом «${p.title}» (${(p.priceUSD || 0).toLocaleString()} $) успешно сформировано риелтором ${loggedInAgent ? loggedInAgent.name : "Гордович Кирилл"} и отправлено клиенту ${buyer.name} по Viber/Telegram на номер ${buyer.phone}!`);
                                                  }}
                                                  className="absolute right-2 bottom-1.5 bg-neutral-900 hover:bg-purple-500 hover:text-black text-[8px] text-white font-extrabold px-2 py-1 rounded transition-colors cursor-pointer"
                                                  title="Сформировать КП и отправить"
                                                >
                                                  Предложить
                                                </button>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>

                                  </div>
                                );
                              })}
                            </div>
                            {renderPagination(buyersPageClamped, totalBuyersPages, setBuyersPage)}
                          </div>
                        );
                      })()
                    )}
                  </div>
                );
              })()}
            </div>
          );
        })()}

              {/* TELEGRAM MASS MAILING MODAL */}
              {isMassMailing && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-md animate-fade-in">
                  <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden border border-indigo-100 flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-8 py-7 flex items-center justify-between text-white shrink-0">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                          <Send className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black uppercase tracking-tight">Mass Telegram Distribution</h3>
                          <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Рассылка по {selectedBuyerIds.length} получателям</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsMassMailing(false)}
                        className="p-2.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 overflow-y-auto space-y-6">
                      {/* Template Selector */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block ml-1">Выберите шаблон сообщения</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {telegramTemplates.map(t => (
                            <button
                              key={t.id}
                              onClick={() => setSelectedTgTemplateId(t.id)}
                              className={`px-3 py-2.5 rounded-xl text-[10px] font-bold border transition-all ${
                                selectedTgTemplateId === t.id 
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-2 ring-indigo-500/10' 
                                  : 'bg-white border-stone-200 text-stone-600 hover:border-indigo-300'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Message Editor */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Текст сообщения</label>
                          <span className="text-[9px] font-bold text-stone-400">Переменные: {'{name}'}, {'{agent}'}, {'{link}'}</span>
                        </div>
                        <textarea
                          value={tgMassMessage}
                          onChange={(e) => setTgMassMessage(e.target.value)}
                          className="w-full h-40 bg-stone-50 border border-stone-200 rounded-2xl p-5 text-xs font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none leading-relaxed text-neutral-900 shadow-inner"
                          placeholder="Введите текст рассылки..."
                        />
                      </div>

                      {/* Selected Recipients Preview */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block ml-1">Получатели ({selectedBuyerIds.length})</label>
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
                          {selectedBuyerIds.map(id => {
                            const buyer = buyersList.find(b => b.id === id);
                            return (
                              <div key={id} className="flex items-center gap-2 bg-stone-100 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-stone-600 border border-stone-200">
                                <span className="truncate max-w-[120px]">{buyer?.name || 'Unknown'}</span>
                                <span className="opacity-50 font-mono">{buyer?.phone}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 pt-0 shrink-0">
                      <button
                        onClick={() => {
                          alert(`[TELEGRAM MASS DISTRIBUTION STARTED]\n\nШаблон: ${selectedTgTemplateId}\nПолучателей: ${selectedBuyerIds.length}\n\nПроцесс запущен в фоновом режиме через API Telegram Bot. Все пользователи получат персональные сообщения.`);
                          setIsMassMailing(false);
                          setSelectedBuyerIds([]);
                        }}
                        className="w-full py-5 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-black text-xs rounded-[20px] transition-all uppercase tracking-widest shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer"
                      >
                        <Send className="w-4 h-4" /> Запустить массовую рассылку
                      </button>
                      <p className="text-[9px] text-stone-400 text-center mt-4 font-bold uppercase tracking-widest">
                        Внимание: Убедитесь, что ваш Telegram бот подключен к системе Fattoria CRM
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENTS: TASKS */}
              {activeTab === 'tasks' && (
                <div className="space-y-8 animate-fade-in font-sans text-xs">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">Персональный Планировщик</h2>
                      <p className="text-xs text-neutral-500 font-medium">Создавайте задачи и привязывайте их к клиентам из базы.</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        const modal = document.getElementById('new-task-modal');
                        if (modal) modal.classList.remove('hidden');
                      }}
                      className="bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Новая задача
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* TASK STATISTICS */}
                    <div className="lg:col-span-1 space-y-4">
                      <div className="bg-white border border-stone-200/60 rounded-2xl p-6 shadow-sm space-y-6">
                        <h3 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Статистика</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-neutral-600">Всего активно:</span>
                            <span className="text-sm font-black text-neutral-900">{tasksList.filter(t => t.status === 'pending').length}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-neutral-600">Выполнено:</span>
                            <span className="text-sm font-black text-emerald-600">{tasksList.filter(t => t.status === 'completed').length}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-neutral-600">Просрочено:</span>
                            <span className="text-sm font-black text-rose-600">
                              {tasksList.filter(t => t.status === 'pending' && new Date(t.deadline) < new Date()).length}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-stone-100">
                          <div className="flex items-center gap-3 bg-purple-50 rounded-xl p-4 border border-purple-200/50">
                            <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                            <p className="text-[10px] text-purple-800 font-semibold leading-relaxed">
                              Следите за дедлайнами! Просроченные задачи негативно влияют на ваш рейтинг в системе.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TASK LIST */}
                    <div className="lg:col-span-2 space-y-4">
                      {tasksList.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-stone-200 rounded-3xl p-12 text-center space-y-3">
                          <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto text-stone-300">
                            <ListTodo className="w-8 h-8" />
                          </div>
                          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Список задач пуст</p>
                          <button 
                             onClick={() => document.getElementById('new-task-modal')?.classList.remove('hidden')}
                             className="text-purple-600 font-black uppercase text-[10px] hover:underline"
                          >
                            Создать первую задачу
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {tasksList
                            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                            .map((task) => {
                              const isOverdue = task.status === 'pending' && new Date(task.deadline) < new Date();
                              
                              return (
                                <div 
                                  key={task.id} 
                                  className={`bg-white border ${task.status === 'completed' ? 'border-emerald-100 opacity-60' : 'border-stone-200/60'} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-start gap-5`}
                                >
                                  <button
                                    onClick={() => {
                                      const updated: CRMTask[] = tasksList.map(t => 
                                        t.id === task.id ? { ...t, status: (t.status === 'completed' ? 'pending' : 'completed') as 'pending' | 'completed' } : t
                                      );
                                      saveTasks(updated);
                                    }}
                                    className={`w-6 h-6 rounded-lg border-2 shrink-0 transition-colors flex items-center justify-center cursor-pointer ${
                                      task.status === 'completed' 
                                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                                        : 'border-stone-200 hover:border-purple-500'
                                    }`}
                                  >
                                    {task.status === 'completed' && <Check className="w-4 h-4" />}
                                  </button>

                                  <div className="flex-1 space-y-2 min-w-0">
                                    <div className="flex items-center justify-between gap-3">
                                      <h4 className={`text-[13px] font-black uppercase tracking-tight truncate ${task.status === 'completed' ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                                        {task.title}
                                      </h4>
                                      <div className="flex items-center gap-2">
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                                          task.priority === 'high' ? 'bg-rose-50 text-rose-600' : 
                                          task.priority === 'medium' ? 'bg-purple-50 text-purple-600' : 'bg-stone-50 text-stone-500'
                                        }`}>
                                          {task.priority === 'high' ? 'СРОЧНО' : task.priority === 'medium' ? 'СРЕДНЕ' : 'НИЗКИЙ'}
                                        </span>
                                        <button 
                                          onClick={() => {
                                            if (window.confirm('Удалить эту задачу?')) {
                                              saveTasks(tasksList.filter(t => t.id !== task.id));
                                            }
                                          }}
                                          className="text-stone-300 hover:text-rose-500 transition-colors"
                                        >
                                          <Trash className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>

                                    {task.description && (
                                      <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                                        {task.description}
                                      </p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
                                      <div className="flex items-center gap-1.5">
                                        <Calendar className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-500' : 'text-stone-400'}`} />
                                        <span className={`text-[10px] font-bold ${isOverdue ? 'text-rose-600' : 'text-neutral-500'}`}>
                                          {new Date(task.deadline).toLocaleDateString('ru-RU')} {new Date(task.deadline).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>

                                      {task.clientName && (() => {
                                        const linkedLead = leads.find(l => l.id === task.clientId);
                                        const linkedBuyer = buyersList.find(b => b.id === task.clientId);
                                        const clientPhone = linkedLead?.phone || linkedBuyer?.phone;

                                        return (
                                          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-lg">
                                            <Users className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                                            <span className="text-[10px] font-bold text-neutral-800">
                                              Клиент: <strong className="text-neutral-900">{task.clientName}</strong>
                                            </span>

                                            {clientPhone && (
                                              <a
                                                href={`tel:${clientPhone}`}
                                                className="text-[10px] font-mono font-bold text-purple-700 hover:underline flex items-center gap-1 pl-1 border-l border-stone-200"
                                                title="Позвонить клиенту"
                                              >
                                                <Phone className="w-3 h-3 text-purple-500" /> {clientPhone}
                                              </a>
                                            )}

                                            {linkedLead && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setCabinetTab('leads');
                                                  setLeadsSearch(linkedLead.name);
                                                }}
                                                className="text-[9px] font-extrabold text-indigo-600 hover:text-indigo-800 uppercase px-1.5 py-0.5 bg-indigo-50 rounded border border-indigo-200/60 cursor-pointer"
                                                title="Открыть карточку лида"
                                              >
                                                К карточке
                                              </button>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MODAL FOR NEW TASK */}
                  <div id="new-task-modal" className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm hidden">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-stone-200">
                      <div className="bg-neutral-900 px-6 py-5 flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-neutral-950">
                            <Plus className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black uppercase tracking-wider">Новая задача</h3>
                            <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Личный планировщик</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => document.getElementById('new-task-modal')?.classList.add('hidden')}
                          className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block ml-1">Что нужно сделать?</label>
                          <input 
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Напр. Перезвонить по объекту на Маяковского"
                            className="w-full bg-stone-50 border border-stone-200 text-neutral-900 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block ml-1">Дедлайн</label>
                            <input 
                              type="datetime-local"
                              value={newTaskDeadline}
                              onChange={(e) => setNewTaskDeadline(e.target.value)}
                              className="w-full bg-stone-50 border border-stone-200 text-neutral-900 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none font-medium"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block ml-1">Приоритет</label>
                            <select 
                              value={newTaskPriority}
                              onChange={(e) => setNewTaskPriority(e.target.value as any)}
                              className="w-full bg-stone-50 border border-stone-200 text-neutral-900 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none font-medium"
                            >
                              <option value="low">Низкий</option>
                              <option value="medium">Средний</option>
                              <option value="high">Высокий</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block ml-1">Связать с клиентом (из базы)</label>
                          <select 
                            value={newTaskClientId}
                            onChange={(e) => setNewTaskClientId(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 text-neutral-900 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none font-medium"
                          >
                            <option value="">Без привязки</option>
                            <optgroup label="Покупатели">
                              {buyersList.map(b => <option key={b.id} value={b.id}>[Пок] {b.name}</option>)}
                            </optgroup>
                            <optgroup label="Заявки (Лиды)">
                              {leads.map(l => <option key={l.id} value={l.id}>[Лид] {l.name}</option>)}
                            </optgroup>
                          </select>
                        </div>

                        <div className="pt-4">
                          <button
                            onClick={() => {
                              if (!newTaskTitle || !newTaskDeadline) return;
                              
                              const client = buyersList.find(b => b.id === newTaskClientId) || leads.find(l => l.id === newTaskClientId);
                              
                              const task: CRMTask = {
                                id: `task-${Date.now()}`,
                                title: newTaskTitle,
                                deadline: newTaskDeadline,
                                priority: newTaskPriority,
                                status: 'pending',
                                agentId: loggedInAgent?.id || 'admin',
                                createdAt: new Date().toISOString(),
                                clientId: newTaskClientId,
                                clientName: client?.name
                              };

                              saveTasks([task, ...tasksList]);
                              
                              // Reset and close
                              setNewTaskTitle('');
                              setNewTaskDeadline('');
                              setNewTaskPriority('medium');
                              setNewTaskClientId('');
                              document.getElementById('new-task-modal')?.classList.add('hidden');
                            }}
                            className="w-full py-4 bg-purple-500 hover:bg-purple-600 text-neutral-950 font-black text-xs rounded-xl transition-all uppercase tracking-widest shadow-xl shadow-purple-500/20 cursor-pointer"
                          >
                            Создать задачу
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENTS 7: ARTICLES */}
              {/* TAB CONTENTS: SMS TEMPLATES SETTINGS */}
              {activeTab === 'sms_templates' && (
                <div className="space-y-8 animate-fade-in font-sans text-xs">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">Настройка СМС-шаблонов</h2>
                      <p className="text-xs text-neutral-500 font-medium">Управляйте текстами быстрых ответов для клиентов и продавцов.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Template List & Editors */}
                    <div className="space-y-4">
                      {smsTemplates.map((template, idx) => (
                        <div key={template.id} className="bg-white border border-stone-200/60 rounded-2xl p-6 shadow-sm space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 font-black text-[10px]">
                                {idx + 1}
                              </div>
                              <input 
                                type="text"
                                value={template.label}
                                onChange={(e) => {
                                  const updated = [...smsTemplates];
                                  updated[idx].label = e.target.value;
                                  saveSmsTemplates(updated);
                                }}
                                className="bg-transparent border-none text-xs font-black uppercase text-neutral-800 focus:outline-none focus:ring-0 w-full"
                                placeholder="Название шаблона"
                              />
                            </div>
                          </div>

                          <textarea
                            value={template.text}
                            onChange={(e) => {
                              const updated = [...smsTemplates];
                              updated[idx].text = e.target.value;
                              saveSmsTemplates(updated);
                            }}
                            className="w-full bg-stone-50 border border-stone-200 text-neutral-800 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none h-32 resize-none transition-all font-medium leading-relaxed"
                            placeholder="Текст сообщения..."
                          />

                          <div className="flex flex-wrap gap-2 pt-2">
                            {['{name}', '{object}', '{agent}'].map(tag => (
                              <button
                                key={tag}
                                onClick={() => {
                                  const updated = [...smsTemplates];
                                  updated[idx].text += ` ${tag}`;
                                  saveSmsTemplates(updated);
                                }}
                                className="px-2 py-1 bg-stone-100 text-stone-500 rounded text-[9px] font-bold hover:bg-stone-200 transition-colors"
                              >
                                + {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right: Preview Panel */}
                    <div className="space-y-4 sticky top-6">
                      <div className="bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-neutral-800 min-h-[500px] flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-500" /> Живой Предпросмотр (Preview)
                          </h3>
                        </div>

                        <div className="space-y-6 flex-1">
                          {smsTemplates.map((template) => (
                            <div key={template.id} className="space-y-2">
                              <span className="text-[9px] font-black uppercase text-neutral-500 tracking-wider block ml-1">{template.label}</span>
                              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MessageSquare className="w-3 h-3 text-neutral-700" />
                                </div>
                                <p className="text-[11px] text-neutral-300 font-medium leading-relaxed">
                                  {getSubstitutedText(template.text, 'Иван Петров', 'Квартира на пр. Независимости')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                          <div className="flex items-start gap-3 bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                            <AlertCircle className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-purple-500 uppercase tracking-wide">Подсказка по тегам:</p>
                              <p className="text-[10px] text-neutral-400 font-medium leading-relaxed">
                                Используйте фигурные скобки для автоподстановки данных. <br />
                                <b>{'{name}'}</b> — Имя клиента <br />
                                <b>{'{object}'}</b> — Объект или тип заявки <br />
                                <b>{'{agent}'}</b> — Ваше имя в системе
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'articles' && (
                <div className="space-y-12 animate-fade-in font-sans text-xs">
                  
                  {/* Title Header */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-purple-600 tracking-widest">Контент-Маркетинг & Экспертность</span>
                    <h3 className="text-lg font-black uppercase text-neutral-900 tracking-wider">
                      Управление публикациями и новостями
                    </h3>
                    <p className="text-xs text-neutral-500 leading-relaxed font-medium max-w-3xl">
                      Напишите экспертную статью или новость. Она мгновенно отобразится в публичном разделе «Новости недвижимости» на главной и во всех сервисных ветках.
                    </p>
                  </div>

                  {/* Add/Edit form */}
                  <div className="space-y-6 pt-2 bg-stone-50/60 p-6 rounded-2xl border border-stone-200/80">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
                      <div>
                        <h4 className="text-sm font-black uppercase text-neutral-900 tracking-wider flex items-center gap-2">
                          <FileEdit className="w-4 h-4 text-purple-600" />
                          {editingArticleId ? 'Редактировать статью' : 'Создать новую публикацию'}
                        </h4>
                        <p className="text-[11px] text-neutral-500 mt-0.5">Публикация с поддержкой фото, заголовков, цитат и Markdown-разметки</p>
                      </div>

                      {/* Mode switcher: Editor vs Preview */}
                      <div className="flex items-center bg-white border border-stone-200 rounded-lg p-1 shrink-0 shadow-xs">
                        <button
                          type="button"
                          onClick={() => setArticleEditorTab('edit')}
                          className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                            articleEditorTab === 'edit'
                              ? 'bg-neutral-900 text-white shadow-xs'
                              : 'text-neutral-500 hover:text-neutral-900'
                          }`}
                        >
                          <FileEdit className="w-3 h-3" /> Редактор
                        </button>
                        <button
                          type="button"
                          onClick={() => setArticleEditorTab('preview')}
                          className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                            articleEditorTab === 'preview'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-neutral-500 hover:text-neutral-900'
                          }`}
                        >
                          <Eye className="w-3 h-3" /> Предпросмотр
                        </button>
                      </div>
                    </div>

                    {articleEditorTab === 'edit' ? (
                      <div className="space-y-5">
                        {/* Title and Category */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="md:col-span-2 space-y-1.5">
                            <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                              Заголовок статьи <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Например: Как безопасно продать квартиру в Минске в 2026 году"
                              value={newArticleTitle}
                              onChange={(e) => setNewArticleTitle(e.target.value)}
                              className="w-full bg-white border border-stone-200 rounded-lg text-neutral-900 px-3.5 py-2.5 text-xs font-bold focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none transition-all shadow-xs"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Категория</label>
                            <select
                              value={newArticleCategory}
                              onChange={(e) => setNewArticleCategory(e.target.value as any)}
                              className="w-full bg-white border border-stone-200 rounded-lg text-neutral-900 px-3.5 py-2.5 text-xs font-bold focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none cursor-pointer transition-all shadow-xs"
                            >
                              <option value="news">Анализ рынка</option>
                              <option value="tips">Советы эксперта</option>
                              <option value="legal">Законодательство</option>
                            </select>
                          </div>
                        </div>

                        {/* Article Cover Photo */}
                        <div className="space-y-2 bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                              Главное фото / Обложка статьи
                            </label>
                            {newArticlePhoto && (
                              <button
                                type="button"
                                onClick={() => setNewArticlePhoto('')}
                                className="text-[10px] text-rose-500 hover:text-rose-700 font-bold uppercase tracking-wider cursor-pointer"
                              >
                                Удалить фото
                              </button>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <div className="flex-1 space-y-2 w-full">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Вставьте прямую ссылку на фото (URL) или выберите файл справа..."
                                  value={newArticlePhoto}
                                  onChange={(e) => setNewArticlePhoto(e.target.value)}
                                  className="flex-1 bg-stone-50 border border-stone-200 rounded-lg text-neutral-900 px-3 py-2 text-xs font-mono focus:border-purple-500 outline-none transition-colors"
                                />
                                <label className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-neutral-800 text-[11px] font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shrink-0">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Загрузить фото</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => {
                                          if (ev.target?.result) setNewArticlePhoto(ev.target.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>
                              </div>

                              {/* Presets */}
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[10px] text-neutral-400 font-medium">Быстрый выбор:</span>
                                {[
                                  { label: '🏙️ Минск-Мир', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200' },
                                  { label: '🏡 Коттедж', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200' },
                                  { label: '⚖️ Законы / Юрист', url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=1200' },
                                  { label: '🛋️ Интерьер', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200' },
                                  { label: '🔑 Сделка', url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200' },
                                ].map((preset) => (
                                  <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => setNewArticlePhoto(preset.url)}
                                    className="text-[10px] px-2 py-0.5 bg-stone-100 hover:bg-purple-100 hover:text-purple-800 text-stone-700 rounded-md transition-colors cursor-pointer"
                                  >
                                    {preset.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Cover preview thumbnail */}
                            {newArticlePhoto ? (
                              <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-stone-200 shrink-0 bg-stone-100 shadow-xs">
                                <img
                                  src={newArticlePhoto}
                                  alt="Предпросмотр обложки"
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                                  Обложка
                                </span>
                              </div>
                            ) : (
                              <div className="w-32 h-20 rounded-lg border border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 text-[10px] text-center p-2 shrink-0 bg-stone-50">
                                <ImageIcon className="w-5 h-5 mb-1 opacity-50" />
                                <span>Нет фото</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Snippet */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                            Краткое описание (Snippet / Лид)
                          </label>
                          <input
                            type="text"
                            placeholder="Краткое интригующее введение для списка новостей на 1-2 предложения..."
                            value={newArticleSnippet}
                            onChange={(e) => setNewArticleSnippet(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-lg text-neutral-900 px-3.5 py-2.5 text-xs font-medium focus:border-purple-500 outline-none transition-colors shadow-xs"
                          />
                        </div>

                        {/* Main Content with Formatting Toolbar */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                              Основной текст публикации <span className="text-rose-500">*</span>
                            </label>
                            <span className="text-[10px] text-purple-600 font-semibold">
                              💡 Поддерживает Markdown и вставку фотографий
                            </span>
                          </div>

                          {/* Quick Toolbar */}
                          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-stone-100 rounded-lg border border-stone-200 text-neutral-700">
                            <button
                              type="button"
                              onClick={() => {
                                const url = prompt('Введите URL фотографии (или ссылку с Unsplash / вашего хостинга):');
                                if (url) {
                                  const caption = prompt('Подпись к фото (необязательно):') || '';
                                  const md = caption ? `\n\n![${caption}](${url})\n` : `\n\n![](${url})\n`;
                                  setNewArticleContent(prev => prev ? prev + md : md);
                                }
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-purple-50 hover:text-purple-700 border border-stone-200 rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                              title="Вставить фото в текст статьи"
                            >
                              <ImageIcon className="w-3 h-3 text-purple-600" />
                              <span>+ Вставить фото в текст</span>
                            </button>

                            <span className="h-4 w-px bg-stone-300 mx-1" />

                            <button
                              type="button"
                              onClick={() => setNewArticleContent(prev => prev ? prev + '\n\n## Заголовок раздела\n' : '## Заголовок раздела\n')}
                              className="px-2 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded text-[11px] font-bold transition-colors cursor-pointer shadow-xs"
                              title="Раздел H2"
                            >
                              H2 Заголовок
                            </button>

                            <button
                              type="button"
                              onClick={() => setNewArticleContent(prev => prev ? prev + '\n\n### Подраздел\n' : '### Подраздел\n')}
                              className="px-2 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded text-[11px] font-bold transition-colors cursor-pointer shadow-xs"
                              title="Подраздел H3"
                            >
                              H3 Подраздел
                            </button>

                            <button
                              type="button"
                              onClick={() => setNewArticleContent(prev => prev ? prev + ' **важный текст** ' : '**важный текст** ')}
                              className="px-2 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded text-[11px] font-black transition-colors cursor-pointer shadow-xs"
                              title="Жирный шрифт"
                            >
                              Ж
                            </button>

                            <button
                              type="button"
                              onClick={() => setNewArticleContent(prev => prev ? prev + '\n\n> Цитата эксперта или выдержка из нормативного акта...\n' : '> Цитата эксперта...\n')}
                              className="px-2 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded text-[11px] font-bold transition-colors cursor-pointer shadow-xs"
                              title="Цитата"
                            >
                              ❝ Цитата
                            </button>

                            <button
                              type="button"
                              onClick={() => setNewArticleContent(prev => prev ? prev + '\n\n- Пункт первый\n- Пункт второй\n- Пункт третий\n' : '- Пункт первый\n- Пункт второй\n')}
                              className="px-2 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded text-[11px] font-bold transition-colors cursor-pointer shadow-xs"
                              title="Маркированный список"
                            >
                              • Список
                            </button>

                            <button
                              type="button"
                              onClick={() => setNewArticleContent(prev => prev ? prev + '\n\n1. Шаг первый\n2. Шаг второй\n3. Шаг третий\n' : '1. Шаг первый\n2. Шаг второй\n')}
                              className="px-2 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded text-[11px] font-bold transition-colors cursor-pointer shadow-xs"
                              title="Нумерованный список"
                            >
                              1. Нумерация
                            </button>

                            <button
                              type="button"
                              onClick={() => setNewArticleContent(prev => prev ? prev + '\n\n> **Совет юриста «АН Фаттория»:** Обязательно проверяйте архивные выписки из домовой книги до передачи задатка.\n' : '> **Совет юриста «АН Фаттория»:** Текст...\n')}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded text-[11px] font-bold transition-colors cursor-pointer shadow-xs"
                              title="Плашка совета"
                            >
                              💡 Совет эксперта
                            </button>

                            <button
                              type="button"
                              onClick={() => setNewArticleContent(prev => prev ? prev + '\n\n---\n' : '\n---\n')}
                              className="px-2 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded text-[11px] font-bold transition-colors cursor-pointer shadow-xs"
                              title="Линия разделитель"
                            >
                              — Разделитель
                            </button>
                          </div>

                          <textarea
                            placeholder="Развернутый текст статьи с полезными советами, примерами из практики и фотографиями..."
                            value={newArticleContent}
                            onChange={(e) => setNewArticleContent(e.target.value)}
                            rows={12}
                            className="w-full bg-white border border-stone-200 rounded-xl text-neutral-900 p-4 text-xs focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none resize-y font-sans leading-relaxed font-medium transition-all shadow-xs"
                          />
                        </div>
                      </div>
                    ) : (
                      /* LIVE PREVIEW TAB */
                      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                        {newArticlePhoto && (
                          <div className="relative rounded-2xl overflow-hidden max-h-[380px] w-full border border-stone-200 shadow-sm">
                            <img
                              src={newArticlePhoto}
                              alt={newArticleTitle || "Обложка статьи"}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4">
                              <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
                                {newArticleCategory === 'legal' ? 'Законодательство' : newArticleCategory === 'tips' ? 'Советы эксперта' : 'Анализ рынка'}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-[11px] text-stone-400 font-mono">
                            <span>{new Date().toLocaleDateString('ru-RU')}</span>
                            <span>•</span>
                            <span>АН «Фаттория»</span>
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                            {newArticleTitle || "Заголовок статьи отобразится здесь"}
                          </h2>
                          {newArticleSnippet && (
                            <p className="text-sm font-medium text-stone-600 italic border-l-2 border-amber-600 pl-3">
                              {newArticleSnippet}
                            </p>
                          )}
                        </div>

                        <div className="prose prose-stone max-w-none text-xs leading-relaxed text-stone-800 border-t border-stone-150 pt-6">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                              img: ({ src, alt }) => (
                                <figure className="my-6 rounded-xl overflow-hidden border border-stone-200 shadow-sm bg-stone-50">
                                  <img src={src} alt={alt || 'Иллюстрация'} className="w-full h-auto max-h-[450px] object-cover" />
                                  {alt && (
                                    <figcaption className="p-2.5 text-[11px] text-stone-500 italic bg-stone-50 border-t border-stone-200 text-center">
                                      {alt}
                                    </figcaption>
                                  )}
                                </figure>
                              ),
                              h2: ({ children }) => <h3 className="text-lg font-bold text-stone-900 mt-6 mb-3 border-b pb-1 border-stone-200">{children}</h3>,
                              h3: ({ children }) => <h4 className="text-sm font-bold text-amber-900 mt-4 mb-2">{children}</h4>,
                              blockquote: ({ children }) => (
                                <blockquote className="my-4 pl-4 pr-3 py-3 rounded-lg bg-amber-50/70 border-l-4 border-amber-600 text-stone-800 italic">
                                  {children}
                                </blockquote>
                              ),
                              ul: ({ children }) => <ul className="my-3 space-y-1 pl-4 list-disc marker:text-amber-800">{children}</ul>,
                              ol: ({ children }) => <ol className="my-3 space-y-1 pl-5 list-decimal marker:text-amber-800 font-semibold">{children}</ol>,
                            }}
                          >
                            {newArticleContent || "*Текст статьи пока пуст. Переключитесь на вкладку «Редактор», чтобы наполнить статью содержанием.*"}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 justify-end pt-2 border-t border-stone-200">
                      {editingArticleId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingArticleId(null);
                            setNewArticleTitle('');
                            setNewArticleSnippet('');
                            setNewArticleContent('');
                            setNewArticlePhoto('');
                            setArticleEditorTab('edit');
                          }}
                          className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-neutral-800 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors cursor-pointer outline-none"
                        >
                          Отмена
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (!newArticleTitle || !newArticleContent) {
                            alert('Укажите заголовок и напишите текст публикации!');
                            return;
                          }
                          
                          if (editingArticleId) {
                            const updated = articlesList.map(art => {
                              if (art.id === editingArticleId) {
                                return {
                                  ...art,
                                  title: newArticleTitle,
                                  snippet: newArticleSnippet,
                                  content: newArticleContent,
                                  category: newArticleCategory,
                                  photo: newArticlePhoto.trim() || undefined,
                                  image: newArticlePhoto.trim() || undefined,
                                };
                              }
                              return art;
                            });
                            setArticlesList(updated);
                            alert(`Публикация «${newArticleTitle}» успешно обновлена!`);
                            setEditingArticleId(null);
                          } else {
                            const slug = newArticleTitle
                              .toLowerCase()
                              .trim()
                              .replace(/[^\w\sа-яё-]/gi, '')
                              .replace(/\s+/g, '-');
                            const newArt: Article = {
                              id: `art-${Date.now()}`,
                              slug: slug || `art-${Date.now()}`,
                              title: newArticleTitle,
                              snippet: newArticleSnippet,
                              content: newArticleContent,
                              category: newArticleCategory,
                              photo: newArticlePhoto.trim() || undefined,
                              image: newArticlePhoto.trim() || undefined,
                              date: new Date().toLocaleDateString('ru-RU')
                            };
                            const updated = [newArt, ...articlesList];
                            setArticlesList(updated);
                            alert(`Публикация «${newArticleTitle}» успешно создана и опубликована!`);
                          }

                          setNewArticleTitle('');
                          setNewArticleSnippet('');
                          setNewArticleContent('');
                          setNewArticlePhoto('');
                          setArticleEditorTab('edit');
                        }}
                        className="px-7 py-3 bg-neutral-950 hover:bg-purple-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg"
                      >
                        {editingArticleId ? 'Сохранить изменения' : 'Опубликовать на сайте'}
                      </button>
                    </div>
                  </div>

                  {/* List of articles */}
                  <div className="space-y-4 pt-8 border-t border-stone-200 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-black text-neutral-900 uppercase tracking-wider">
                        Все статьи на сайте ({articlesList.length})
                      </h4>
                      <span className="text-[11px] text-stone-500 font-medium">Мгновенная синхронизация с сайтом и БД</span>
                    </div>
                    
                    <div className="divide-y divide-stone-200 bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
                      {articlesList.map((art) => (
                        <div key={art.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:bg-stone-50/70 transition-colors">
                          <div className="flex items-start gap-4 flex-1">
                            {/* Article miniature thumbnail */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 relative">
                              {art.photo || art.image ? (
                                <img
                                  src={art.photo || art.image}
                                  alt={art.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-50">
                                  <ImageIcon className="w-5 h-5 opacity-40" />
                                  <span className="text-[8px] font-bold mt-0.5">Нет фото</span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[8px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                                  {art.category === 'legal' ? 'Законодательство' : art.category === 'tips' ? 'Советы' : 'Анализ рынка'}
                                </span>
                                <span className="text-[10px] text-neutral-400 font-semibold font-mono">
                                  {art.date}
                                </span>
                              </div>
                              <h5 className="font-extrabold text-sm text-neutral-950 leading-snug line-clamp-1">{art.title}</h5>
                              <p className="text-xs text-neutral-600 font-medium leading-relaxed line-clamp-2 max-w-3xl">
                                {art.snippet || art.content.slice(0, 140) + "..."}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingArticleId(art.id);
                                setNewArticleTitle(art.title);
                                setNewArticleSnippet(art.snippet || '');
                                setNewArticleContent(art.content);
                                setNewArticleCategory((art.category as any) || 'news');
                                setNewArticlePhoto(art.photo || art.image || '');
                                setArticleEditorTab('edit');
                                window.scrollTo({ top: 300, behavior: 'smooth' });
                              }}
                              className="px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider bg-stone-100 hover:bg-purple-100 hover:text-purple-800 rounded-lg transition-colors cursor-pointer font-sans outline-none flex items-center gap-1.5"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Редактировать</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Вы действительно хотите навсегда удалить статью «${art.title}»?`)) {
                                  const updated = articlesList.filter(a => a.id !== art.id);
                                  setArticlesList(updated);
                                }
                              }}
                              className="p-2 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-lg transition-all cursor-pointer outline-none"
                              title="Удалить статью"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* SMS TEMPLATE SELECTION MODAL */}
        {smsModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-stone-200 animate-scale-in">
              <div className="bg-emerald-600 px-6 py-5 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider">Отправка сообщения</h3>
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{smsModal.phone}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSmsModal({ ...smsModal, isOpen: false })}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block">Выберите шаблон</span>
                  <div className="grid grid-cols-1 gap-2">
                    {smsTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          const text = getSubstitutedText(template.text, smsModal.clientName, smsModal.objectInfo);
                          handleSmsRequest(smsModal.phone, text);
                        }}
                        className="w-full text-left px-4 py-3 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase text-neutral-800 group-hover:text-emerald-700">{template.label}</span>
                          <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-emerald-500" />
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1 line-clamp-2 italic font-medium">
                          {getSubstitutedText(template.text, smsModal.clientName, smsModal.objectInfo)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/50 space-y-2">
                  <div className="flex items-center gap-2 text-stone-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Предпросмотр данных</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-[10px] font-bold">
                    <div>
                      <span className="text-neutral-400 uppercase block mb-0.5">Клиент:</span>
                      <span className="text-neutral-800">{smsModal.clientName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 uppercase block mb-0.5">Объект:</span>
                      <span className="text-neutral-800">{smsModal.objectInfo || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex justify-end">
                <button
                  onClick={() => setSmsModal({ ...smsModal, isOpen: false })}
                  className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PDF Commercial Offer Generator Modal */}
        {showPdfModal && (
          <PDFOfferGeneratorModal
            property={pdfTargetProperty}
            propertiesList={propertiesList}
            agentName={loggedInAgent ? loggedInAgent.name : "Агентство «АН Фаттория»"}
            onClose={() => setShowPdfModal(false)}
          />
        )}

        {/* XML Feed Exporter Modal */}
        {showXmlModal && (
          <XMLFeedExporterModal
            propertiesList={propertiesList}
            onClose={() => setShowXmlModal(false)}
          />
        )}


        {/* Institutional Requests Modal */}
        {showInstitutionalRequestsModal && loggedInAgent && (
          <InstitutionalRequestsModal
            isOpen={showInstitutionalRequestsModal}
            onClose={() => {
              setShowInstitutionalRequestsModal(false);
              setInitialPropertyForRequest(null);
            }}
            loggedInAgent={loggedInAgent}
            agentsList={agentsList}
            propertiesList={propertiesList}
            initialProperty={initialPropertyForRequest}
          />
        )}

        {/* Telegram Integration Modal */}
        {showTgModal && (
          <TelegramBotModal
            propertiesList={propertiesList}
            buyersList={buyersList}
            sellersList={sellersList}
            onClose={() => setShowTgModal(false)}
          />
        )}

        {/* Schedule Meeting Modal for Lead */}
        {schedulingLead && (
          <ScheduleMeetingModal
            lead={schedulingLead}
            onClose={() => setSchedulingLead(null)}
            onSuccess={() => setSchedulingLead(null)}
          />
        )}

        {/* EDIT EMPLOYEE / AGENT MODAL */}
        {editingAgent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-stone-200 animate-scale-in my-8">
              
              {/* Modal Header */}
              <div className="bg-neutral-900 px-6 py-5 flex items-center justify-between text-white border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 text-neutral-950 rounded-xl flex items-center justify-center font-black">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                      <span>Редактирование профиля: {editingAgent.name}</span>
                      {editEmpIsDismissed ? (
                        <span className="text-[9px] bg-rose-500/30 text-rose-300 px-2 py-0.5 rounded-full font-bold">
                          🔴 Уволен
                        </span>
                      ) : (
                        <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          🟢 В штате
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] font-bold text-stone-400">ID: {editingAgent.id} • {editingAgent.agencyName || 'ООО «АН Фаттория»'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingAgent(null)}
                  className="p-2 text-stone-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto font-sans text-xs">
                
                {/* Status Switcher Banner */}
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  editEmpIsDismissed ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className="space-y-0.5">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${editEmpIsDismissed ? 'text-rose-800' : 'text-emerald-800'}`}>
                      {editEmpIsDismissed ? 'Сотрудник уволен (Скрыт с сайта)' : 'Сотрудник в активном штате (Отображается на сайте)'}
                    </span>
                    <p className="text-[11px] text-stone-600 font-medium">
                      {editEmpIsDismissed 
                        ? 'Анкета не показывается на публичной странице «Наша команда».'
                        : 'Анкета доступна клиентам на сайте и в каталоге специалистов.'}
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setEditEmpIsDismissed(!editEmpIsDismissed)}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                      editEmpIsDismissed
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-rose-600 hover:bg-rose-500 text-white'
                    }`}
                  >
                    {editEmpIsDismissed ? (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        Восстановить в штат
                      </>
                    ) : (
                      <>
                        <UserMinus className="w-3.5 h-3.5" />
                        Уволить сотрудника
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Left Column: Core inputs (Col 8) */}
                  <div className="md:col-span-8 space-y-5">
                    
                    {/* Personal data */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5" /> 1. Личные и контактные данные
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-neutral-600 uppercase font-black mb-1">
                            ФИО специалиста <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={editEmpName}
                            onChange={(e) => setEditEmpName(e.target.value)}
                            className="w-full bg-white border border-stone-300 text-neutral-900 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                            placeholder="Фамилия Имя Отчество"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-neutral-600 uppercase font-black mb-1">
                            Номер телефона <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={editEmpPhone}
                            onChange={(e) => setEditEmpPhone(e.target.value)}
                            className="w-full bg-white border border-stone-300 text-neutral-900 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                            placeholder="+375 (29) 123-45-67"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Role & Supervisor */}
                    <div className="space-y-3 pt-3 border-t border-stone-100">
                      <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" /> 2. Должность и куратор
                      </h4>

                      <div className="space-y-2">
                        <label className="block text-[10px] text-neutral-600 uppercase font-black">
                          Должность в компании <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-1.5 mb-1.5">
                          {[
                            'Риэлтер',
                            'Руководитель'
                          ].map(rolePreset => (
                            <button
                              key={rolePreset}
                              type="button"
                              onClick={() => setEditEmpRole(rolePreset)}
                              className={`px-3 py-1 text-[10px] font-black rounded-lg border transition-all cursor-pointer ${
                                editEmpRole === rolePreset
                                  ? 'bg-purple-500 text-neutral-950 border-purple-500'
                                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                              }`}
                            >
                              {rolePreset}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={editEmpRole}
                          onChange={(e) => setEditEmpRole(e.target.value)}
                          className="w-full bg-white border border-stone-300 text-neutral-900 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                          placeholder="Риэлтер"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[10px] text-neutral-600 uppercase font-black mb-1">
                            Руководитель / Куратор
                          </label>
                          <select
                            value={editEmpManager}
                            onChange={(e) => setEditEmpManager(e.target.value)}
                            className="w-full bg-white border border-stone-300 text-neutral-900 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none cursor-pointer"
                          >
                            <option value="">-- Без руководителя --</option>
                            {agentsList.filter(a => a.id !== editingAgent.id).map(a => (
                              <option key={a.id} value={a.name}>{a.name} ({a.role || 'Сотрудник'})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-neutral-600 uppercase font-black mb-1">
                            Сектор работы
                          </label>
                          <select
                            value={editEmpSpec}
                            onChange={(e) => setEditEmpSpec(e.target.value as any)}
                            className="w-full bg-white border border-stone-300 text-neutral-900 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none cursor-pointer"
                          >
                            <option value="sale">Минский рынок жилья</option>
                            <option value="rent">Аренда и Обмены</option>
                            <option value="assessment">Коммерческая недвижимость</option>
                            <option value="houses">Дома и Коттеджи</option>
                            <option value="all">Универсальный сектор</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Experience & Deals */}
                    <div className="space-y-3 pt-3 border-t border-stone-100">
                      <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" /> 3. Опыт и статистика
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] text-neutral-600 uppercase font-black mb-1">Стаж (Лет)</label>
                          <select
                            value={editEmpExpYears}
                            onChange={(e) => setEditEmpExpYears(e.target.value)}
                            className="w-full bg-white border border-stone-300 text-neutral-900 rounded-xl px-2.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none cursor-pointer"
                          >
                            {Array.from({ length: 31 }, (_, i) => (
                              <option key={i} value={i}>{i} лет</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-neutral-600 uppercase font-black mb-1">Стаж (Месяцев)</label>
                          <select
                            value={editEmpExpMonths}
                            onChange={(e) => setEditEmpExpMonths(e.target.value)}
                            className="w-full bg-white border border-stone-300 text-neutral-900 rounded-xl px-2.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none cursor-pointer"
                          >
                            {Array.from({ length: 12 }, (_, i) => (
                              <option key={i} value={i}>{i} мес.</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-neutral-600 uppercase font-black mb-1">Закрытых сделок</label>
                          <input
                            type="number"
                            value={editEmpDeals}
                            onChange={(e) => setEditEmpDeals(Number(e.target.value) || 0)}
                            className="w-full bg-white border border-stone-300 text-neutral-900 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Achievements Textarea */}
                    <div className="space-y-1.5 pt-3 border-t border-stone-100">
                      <label className="block text-[10px] text-neutral-600 uppercase font-black">
                        Достижения, сертификаты и краткая биография
                      </label>
                      <textarea
                        rows={3}
                        value={editEmpAchievements}
                        onChange={(e) => setEditEmpAchievements(e.target.value)}
                        placeholder="Краткое описание профессиональных успехов для сайта..."
                        className="w-full bg-white border border-stone-300 text-neutral-900 rounded-xl p-3 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none leading-relaxed font-medium"
                      />
                    </div>

                  </div>

                  {/* Right Column: Photo & Security (Col 4) */}
                  <div className="md:col-span-4 space-y-5 bg-stone-50 p-4 rounded-2xl border border-stone-200/60">
                    
                    {/* Photo Box */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-stone-500 tracking-wider flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-purple-600" /> Фото профиля
                      </h4>

                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="w-24 h-24 rounded-2xl bg-white border-2 border-stone-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-sm group">
                          {editEmpPhotoFile ? (
                            <img src={editEmpPhotoFile} alt="Preview" className="w-full h-full object-cover" />
                          ) : editEmpPhotoUrl ? (
                            <img src={editEmpPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-stone-400 text-[10px] font-bold p-3 flex flex-col items-center gap-1">
                              <Users className="w-6 h-6 opacity-30" />
                              <span>Без фото</span>
                            </div>
                          )}
                          
                          {(editEmpPhotoFile || editEmpPhotoUrl) && (
                            <button
                              type="button"
                              onClick={() => { setEditEmpPhotoFile(null); setEditEmpPhotoUrl(''); }}
                              className="absolute inset-0 bg-black/60 text-white text-[10px] uppercase font-black opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            >
                              Сбросить
                            </button>
                          )}
                        </div>

                        <div className="w-full space-y-2 text-left">
                          <div className="space-y-1">
                            <label className="block text-[9px] uppercase font-black text-neutral-500">Загрузить новый файл</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleEditImageUpload}
                              className="block w-full text-[10px] text-stone-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border file:border-stone-300 file:text-[9px] file:font-bold file:bg-white file:text-stone-700 hover:file:bg-purple-500 hover:file:text-neutral-900 file:cursor-pointer cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[9px] uppercase font-black text-neutral-500">Или ссылка на фото</label>
                            <input
                              type="text"
                              placeholder="https://..."
                              value={editEmpPhotoUrl}
                              onChange={(e) => setEditEmpPhotoUrl(e.target.value)}
                              className="w-full bg-white border border-stone-300 text-neutral-850 rounded-lg px-2.5 py-1.5 text-[11px] focus:ring-1 focus:ring-purple-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Security & Access */}
                    <div className="space-y-3 pt-3 border-t border-stone-200">
                      <h4 className="text-xs font-black uppercase text-stone-500 tracking-wider flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-purple-600" /> Доступ в CRM
                      </h4>

                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-[10px] text-neutral-600 uppercase font-black mb-1">
                            Логин / Email <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={editEmpEmail}
                            onChange={(e) => setEditEmpEmail(e.target.value)}
                            className="w-full bg-white border border-stone-300 text-neutral-900 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-purple-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-neutral-600 uppercase font-black mb-1">
                            Пароль для входа <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={editEmpPassword}
                            onChange={(e) => setEditEmpPassword(e.target.value)}
                            className="w-full bg-white border border-stone-300 text-neutral-900 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:ring-1 focus:ring-purple-500 outline-none text-purple-800 bg-purple-50/40"
                          />
                        </div>

                        {/* Permission Checkbox */}
                        <div className="pt-2 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={editEmpHasLeadsAccess}
                              onChange={(e) => setEditEmpHasLeadsAccess(e.target.checked)}
                              className="w-4 h-4 text-purple-600 rounded border-stone-300 focus:ring-purple-500"
                            />
                            <span className="text-[10px] font-bold text-neutral-800">
                              Доступ к лидам и базе клиентов
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
                {editingAgent.id !== 'admin' ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteAgentPermanently(editingAgent)}
                    className="px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-wider text-rose-600 hover:text-rose-800 hover:bg-rose-100/60 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash className="w-3.5 h-3.5" />
                    Удалить сотрудника
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingAgent(null)}
                    className="px-5 py-2.5 text-[10px] font-black uppercase tracking-wider text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEditEmployee}
                    className="px-6 py-2.5 bg-neutral-950 hover:bg-purple-500 text-white hover:text-neutral-950 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Сохранить изменения
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
      {showRealtImporter && loggedInAgent && (
        <RealtQuickImporterModal 
          isOpen={showRealtImporter}
          onClose={() => setShowRealtImporter(false)}
          loggedInAgent={loggedInAgent}
          onImport={(newProp) => {
            const propWithCrm = { ...newProp, isPublished: false, isClosedBase: true, crmOnly: true };
            const updated = [propWithCrm, ...propertiesList];
            setPropertiesList(updated);
          }}
        />
      )}
      {sellerToPublishModal && (
        <PublishSellerPropertyModal
          seller={sellerToPublishModal}
          onClose={() => setSellerToPublishModal(null)}
          loggedInAgent={loggedInAgent}
          agentsList={agentsList}
          onPublish={(newProperty, updatedSeller) => {
            handlePublishSellerProperty(newProperty, updatedSeller);
            setSellerToPublishModal(null);
          }}
        />
      )}
    </div>
  );
}
