'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Edit3,
  FileSpreadsheet,
  FileText,
  Filter,
  Globe,
  Kanban,
  List,
  Lock,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import type { Agent, Buyer, CRMTask, Property } from '../types';
import { isRealtorAgent, isSamePersonName } from '../lib/agentUtils';

const BuyerSearchMatcher = dynamic(() => import('./BuyerSearchMatcher'), {
  ssr: false,
  loading: () => <div className="p-8 text-center text-xs text-stone-500">Загрузка подбора объектов...</div>,
});

interface BuyersCRMWorkspaceProps {
  buyersList: Buyer[];
  setBuyersList: (buyers: Buyer[]) => Promise<void> | void;
  propertiesList: Property[];
  agentsList: Agent[];
  loggedInAgent: Agent | null;
  isAgentAdmin: boolean;
  isAgentCallCenter: boolean;
  selectedAgentFilter: string;
  setSelectedAgentFilter: (val: string) => void;
  nbrbRate: number;
  selectedBuyerIds: string[];
  setSelectedBuyerIds: React.Dispatch<React.SetStateAction<string[]>>;
  isAddingBuyer: boolean;
  setIsAddingBuyer: (open: boolean) => void;
  onOpenMassMailing: () => void;
  onExportCSV: () => void;
  onExportExcelCSV: (filtered: Buyer[]) => void;
  onImportBuyers: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tasksList: CRMTask[];
  onSaveTasks: (tasks: CRMTask[]) => void;
  onNotify: (message: string, variant?: 'success' | 'info' | 'error') => void;
}

type BuyerStageId = 'searching' | 'negotiating' | 'deal' | 'closed';

const BUYER_STAGES: { id: BuyerStageId; label: string; short: string; badgeClass: string; columnTint: string }[] = [
  {
    id: 'searching',
    label: 'Активный поиск',
    short: 'В поиске',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    columnTint: 'border-t-purple-500',
  },
  {
    id: 'negotiating',
    label: 'Переговоры',
    short: 'Переговоры',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    columnTint: 'border-t-indigo-500',
  },
  {
    id: 'deal',
    label: 'Оформление сделки',
    short: 'Оформление',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    columnTint: 'border-t-amber-500',
  },
  {
    id: 'closed',
    label: 'Сделка закрыта',
    short: 'Закрыто',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    columnTint: 'border-t-emerald-500',
  },
];

const DISTRICT_OPTIONS = [
  'Первомайский',
  'Московский',
  'Фрунзенский',
  'Советский',
  'Центральный',
  'Октябрьский',
  'Ленинский',
  'Заводской',
  'Партизанский',
];

function normalizeBuyerStage(status?: string): BuyerStageId {
  if (status === 'negotiating') return 'negotiating';
  if (status === 'deal' || status === 'closing' || status === 'reserved') return 'deal';
  if (status === 'closed' || status === 'completed') return 'closed';
  return 'searching';
}

function getPropertyTypeLabel(type?: string): string {
  switch (type) {
    case 'apartment':
      return 'Квартира';
    case 'house':
      return 'Дом / Коттедж';
    case 'commercial':
      return 'Коммерция';
    case 'plot':
      return 'Участок';
    default:
      return 'Любой тип';
  }
}

function getBuyerMatchesCount(buyer: Buyer, propertiesList: Property[], nbrbRate: number): number {
  const rate = nbrbRate || 3.27;
  const prefsLower = (buyer.preferences || '').toLowerCase();
  let parsedType: string = buyer.prefType && buyer.prefType !== 'all' ? buyer.prefType : 'all';
  if (parsedType === 'all' && !buyer.prefType) {
    if (prefsLower.includes('квартир') || prefsLower.includes('двушк') || prefsLower.includes('трешк') || prefsLower.includes('однушк')) {
      parsedType = 'apartment';
    } else if (prefsLower.includes('дом') || prefsLower.includes('коттедж') || prefsLower.includes('дач')) {
      parsedType = 'house';
    } else if (prefsLower.includes('офис') || prefsLower.includes('коммерч') || prefsLower.includes('склад') || prefsLower.includes('помещен')) {
      parsedType = 'commercial';
    } else if (prefsLower.includes('участ') || prefsLower.includes('земл')) {
      parsedType = 'plot';
    }
  }

  const effectiveBudgetBYN = buyer.budgetBYN || (buyer.budgetUSD ? Math.round(buyer.budgetUSD * rate) : 0);

  let count = 0;
  for (const p of propertiesList) {
    if (parsedType !== 'all' && p.type !== parsedType) continue;
    const propBYN = p.priceBYN || (p.priceUSD ? Math.round(p.priceUSD * rate) : 0);
    if (effectiveBudgetBYN > 0 && propBYN > effectiveBudgetBYN * 1.12) continue;
    count++;
  }
  return count;
}

function getInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name || 'ПК').slice(0, 2).toUpperCase();
}

export default function BuyersCRMWorkspace({
  buyersList,
  setBuyersList,
  propertiesList,
  agentsList,
  loggedInAgent,
  isAgentAdmin,
  isAgentCallCenter,
  selectedAgentFilter,
  setSelectedAgentFilter,
  nbrbRate,
  selectedBuyerIds,
  setSelectedBuyerIds,
  isAddingBuyer,
  setIsAddingBuyer,
  onOpenMassMailing,
  onExportCSV,
  onExportExcelCSV,
  onImportBuyers,
  tasksList,
  onSaveTasks,
  onNotify,
}: BuyersCRMWorkspaceProps) {
  const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'matcher'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BuyerStageId>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Slide-Over Buyer Card Drawer
  const [drawerBuyerId, setDrawerBuyerId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<'matches' | 'card' | 'tasks'>('matches');

  // Drawer Edit Form States
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBudgetUSD, setEditBudgetUSD] = useState('');
  const [editStatus, setEditStatus] = useState<BuyerStageId>('searching');
  const [editType, setEditType] = useState<'all' | 'apartment' | 'house' | 'commercial' | 'plot'>('all');
  const [editRooms, setEditRooms] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editMinArea, setEditMinArea] = useState('');
  const [editPrefs, setEditPrefs] = useState('');
  const [editAssignedAgentId, setEditAssignedAgentId] = useState('');

  // Quick Task inside Drawer
  const [drawerTaskTitle, setDrawerTaskTitle] = useState('');
  const [drawerTaskDeadline, setDrawerTaskDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(11, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [drawerTaskPriority, setDrawerTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Add Buyer Modal States
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('+375 ');
  const [addBudgetUSD, setAddBudgetUSD] = useState('');
  const [addStatus, setAddStatus] = useState<BuyerStageId>('searching');
  const [addType, setAddType] = useState<'all' | 'apartment' | 'house' | 'commercial' | 'plot'>('apartment');
  const [addRooms, setAddRooms] = useState('');
  const [addDistrict, setAddDistrict] = useState('');
  const [addMinArea, setAddMinArea] = useState('');
  const [addPrefs, setAddPrefs] = useState('');
  const [addAssignedAgentId, setAddAssignedAgentId] = useState('');
  const [addFormError, setAddFormError] = useState<string | null>(null);

  const canAddBuyers = true;
  const canEditBuyer = (buyer: Buyer): boolean => {
    if (isAgentAdmin || isAgentCallCenter) return true;
    if (!loggedInAgent) return false;
    return (
      buyer.assignedAgentId === loggedInAgent.id ||
      buyer.registeredBy === loggedInAgent.name
    );
  };
  const canDeleteBuyer = (buyer: Buyer): boolean => {
    if (isAgentAdmin) return true;
    if (!loggedInAgent) return false;
    return buyer.registeredBy === loggedInAgent.name || buyer.assignedAgentId === loggedInAgent.id;
  };

  const isBuyerInAgentFilter = (buyer: Buyer): boolean => {
    if (isAgentAdmin || isAgentCallCenter) {
      if (!isAgentAdmin || selectedAgentFilter === 'all') return true;
      return (
        buyer.assignedAgentId === selectedAgentFilter ||
        isSamePersonName(buyer.assignedAgentName, selectedAgentFilter) ||
        isSamePersonName(buyer.registeredBy, selectedAgentFilter)
      );
    }
    if (!loggedInAgent) return false;
    const curId = (loggedInAgent.id || '').trim();
    const agId = (buyer.assignedAgentId || '').trim();
    return Boolean(
      (agId && agId === curId) ||
      isSamePersonName(buyer.assignedAgentName, loggedInAgent.name) ||
      isSamePersonName(buyer.registeredBy, loggedInAgent.name)
    );
  };

  const agentScopedBuyers = useMemo(
    () => buyersList.filter(isBuyerInAgentFilter),
    [buyersList, isAgentAdmin, isAgentCallCenter, selectedAgentFilter, loggedInAgent]
  );

  const filteredBuyers = useMemo(() => {
    return agentScopedBuyers.filter((buyer) => {
      const stage = normalizeBuyerStage(buyer.status);
      if (statusFilter !== 'all' && stage !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (buyer.name || '').toLowerCase().includes(q);
        const phoneMatch = (buyer.phone || '').replace(/[\s()-]/g, '').includes(q.replace(/[\s()-]/g, '')) || (buyer.phone || '').includes(q);
        const prefsMatch = (buyer.preferences || '').toLowerCase().includes(q);
        const districtMatch = (buyer.prefDistrict || '').toLowerCase().includes(q);
        const agentMatch = (buyer.assignedAgentName || buyer.registeredBy || '').toLowerCase().includes(q);
        return nameMatch || phoneMatch || prefsMatch || districtMatch || agentMatch;
      }
      return true;
    });
  }, [agentScopedBuyers, statusFilter, searchQuery]);

  const stageCounts = useMemo(() => {
    const counts: Record<'all' | BuyerStageId, number> = {
      all: agentScopedBuyers.length,
      searching: 0,
      negotiating: 0,
      deal: 0,
      closed: 0,
    };
    for (const b of agentScopedBuyers) {
      counts[normalizeBuyerStage(b.status)] += 1;
    }
    return counts;
  }, [agentScopedBuyers]);

  const drawerBuyer = useMemo(
    () => buyersList.find((b) => b.id === drawerBuyerId) || null,
    [buyersList, drawerBuyerId]
  );

  const openBuyerDrawer = (buyer: Buyer, tab: 'matches' | 'card' | 'tasks' = 'matches') => {
    setDrawerBuyerId(buyer.id);
    setDrawerTab(tab);
    setEditName(buyer.name || '');
    setEditPhone(buyer.phone || '+375 ');
    setEditBudgetUSD(String(buyer.budgetUSD || Math.round((buyer.budgetBYN || 0) / (nbrbRate || 3.27)) || ''));
    setEditStatus(normalizeBuyerStage(buyer.status));
    setEditType((buyer.prefType as any) || 'all');
    setEditRooms(buyer.prefRooms ? String(buyer.prefRooms) : '');
    setEditDistrict(buyer.prefDistrict || '');
    setEditMinArea(buyer.minArea ? String(buyer.minArea) : '');
    setEditPrefs(buyer.preferences || '');
    setEditAssignedAgentId(buyer.assignedAgentId || '');
  };

  const handleCopyPhone = (id: string, phone: string) => {
    if (navigator.clipboard && phone) {
      navigator.clipboard.writeText(phone).catch(() => {});
    }
    setCopiedPhoneId(id);
    setTimeout(() => {
      setCopiedPhoneId((prev) => (prev === id ? null : prev));
    }, 1800);
  };

  const handleStageChange = async (buyerId: string, nextStage: BuyerStageId) => {
    const updated = buyersList.map((b) => (b.id === buyerId ? { ...b, status: nextStage } : b));
    await setBuyersList(updated);
    onNotify('Этап покупателя обновлён', 'success');
  };

  const handleTogglePublished = async (buyerId: string) => {
    const updated = buyersList.map((b) => {
      if (b.id !== buyerId) return b;
      const next = !b.isPublicApproved;
      return {
        ...b,
        isPublicApproved: next,
        isPublishedOnSite: next,
      };
    });
    await setBuyersList(updated);
    onNotify('Видимость покупателя обновлена', 'info');
  };

  const handleSaveDrawerCard = async () => {
    if (!drawerBuyer) return;
    if (!editName.trim() || !editPhone.trim()) {
      onNotify('Заполните имя и телефон покупателя', 'error');
      return;
    }
    const usd = parseInt(editBudgetUSD, 10) || 0;
    const assignedAg = agentsList.find((a) => a.id === editAssignedAgentId);

    const updated = buyersList.map((b) =>
      b.id === drawerBuyer.id
        ? {
            ...b,
            name: editName.trim(),
            phone: editPhone.trim(),
            budgetUSD: usd,
            budgetBYN: Math.round(usd * (nbrbRate || 3.27)),
            status: editStatus,
            prefType: editType,
            prefRooms: editRooms ? parseInt(editRooms, 10) : undefined,
            prefDistrict: editDistrict || undefined,
            minArea: editMinArea ? parseFloat(editMinArea) : undefined,
            preferences: editPrefs.trim(),
            assignedAgentId: assignedAg ? assignedAg.id : b.assignedAgentId,
            assignedAgentName: assignedAg ? assignedAg.name : b.assignedAgentName,
          }
        : b
    );
    await setBuyersList(updated);
    onNotify(`Карточка «${editName.trim()}» сохранена`, 'success');
  };

  const handleCreateBuyer = async () => {
    setAddFormError(null);
    if (!addName.trim()) {
      setAddFormError('Укажите ФИО или название клиента');
      return;
    }
    const cleanPhone = addPhone.replace(/[^\d]/g, '');
    if (cleanPhone.length < 7) {
      setAddFormError('Укажите корректный контактный телефон');
      return;
    }

    const usd = parseInt(addBudgetUSD, 10) || 0;
    const byn = Math.round(usd * (nbrbRate || 3.27));
    const assignedAg = agentsList.find((a) => a.id === addAssignedAgentId) || loggedInAgent;

    const newBuyer: Buyer = {
      id: `buyer-${Date.now()}`,
      name: addName.trim(),
      phone: addPhone.trim(),
      budgetUSD: usd,
      budgetBYN: byn,
      preferences: addPrefs.trim() || `${getPropertyTypeLabel(addType)}${addRooms ? `, ${addRooms}-комн.` : ''}${addDistrict ? `, ${addDistrict} р-н` : ''}`,
      registeredBy: loggedInAgent?.name || 'Администратор',
      assignedAgentId: assignedAg?.id,
      assignedAgentName: assignedAg?.name,
      status: addStatus,
      dateAdded: new Date().toLocaleDateString('ru-RU'),
      prefType: addType,
      prefRooms: addRooms ? parseInt(addRooms, 10) : undefined,
      prefDistrict: addDistrict || undefined,
      minArea: addMinArea ? parseFloat(addMinArea) : undefined,
      isPublicApproved: false,
      isPublishedOnSite: false,
      crmOnly: true,
    };

    await setBuyersList([newBuyer, ...buyersList]);
    setIsAddingBuyer(false);
    setAddName('');
    setAddPhone('+375 ');
    setAddBudgetUSD('');
    setAddStatus('searching');
    setAddType('apartment');
    setAddRooms('');
    setAddDistrict('');
    setAddMinArea('');
    setAddPrefs('');
    setAddAssignedAgentId('');
    setCurrentPage(1);
    onNotify(`Покупатель «${newBuyer.name}» добавлен в CRM`, 'success');
    openBuyerDrawer(newBuyer, 'matches');
  };

  const handleDeleteBuyer = async (buyer: Buyer) => {
    const updated = buyersList.filter((b) => b.id !== buyer.id);
    await setBuyersList(updated);
    setConfirmDeleteId(null);
    if (drawerBuyerId === buyer.id) setDrawerBuyerId(null);
    onNotify(`Контакт «${buyer.name}» удалён`, 'info');
  };

  const handleAddDrawerTask = () => {
    if (!drawerBuyer || !drawerTaskTitle.trim()) {
      onNotify('Введите текст задачи', 'error');
      return;
    }
    const task: CRMTask = {
      id: `task-${Date.now()}`,
      title: drawerTaskTitle.trim(),
      description: `Покупатель: ${drawerBuyer.name} (${drawerBuyer.phone})`,
      deadline: drawerTaskDeadline || new Date().toISOString(),
      status: 'pending',
      priority: drawerTaskPriority,
      clientId: drawerBuyer.id,
      clientName: drawerBuyer.name,
      clientPhone: drawerBuyer.phone,
      agentId: loggedInAgent?.id || 'admin',
      assignedAgentName: loggedInAgent?.name,
      createdAt: new Date().toISOString(),
    };
    onSaveTasks([task, ...tasksList]);
    setDrawerTaskTitle('');
    onNotify('Задача привязана к покупателю и добавлена в планер', 'success');
  };

  const itemsPerPage = 15;
  const totalPages = Math.max(1, Math.ceil(filteredBuyers.length / itemsPerPage));
  const clampedPage = Math.min(currentPage, totalPages);
  const paginatedBuyers = filteredBuyers.slice(
    (clampedPage - 1) * itemsPerPage,
    clampedPage * itemsPerPage
  );

  const drawerBuyerTasks = useMemo(
    () => (drawerBuyer ? tasksList.filter((t) => t.clientId === drawerBuyer.id) : []),
    [drawerBuyer, tasksList]
  );

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Top CRM Control Bar (amoCRM / Bitrix24 style) */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Left: Search & Employee Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Быстрый поиск: имя, +375..., район или запрос..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-8 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-neutral-900 placeholder:text-stone-400 focus:bg-white focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/15 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  aria-label="Сбросить поиск"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {isAgentAdmin && (
              <select
                value={selectedAgentFilter}
                onChange={(e) => {
                  setSelectedAgentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-stone-50 border border-stone-200 text-neutral-800 font-semibold rounded-xl px-3 py-2.5 text-xs focus:border-[#8B5CF6] outline-none cursor-pointer"
              >
                <option value="all">Все сотрудники ({buyersList.length})</option>
                {agentsList.map((ag) => (
                  <option key={ag.id} value={ag.name}>
                    {ag.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Right: View Switcher & Primary CTA */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle: Table / Kanban / Matcher */}
            <div className="inline-flex items-center p-1 bg-stone-100 border border-stone-200 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  viewMode === 'table'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-stone-500 hover:text-neutral-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Список</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  viewMode === 'kanban'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-stone-500 hover:text-neutral-900'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Воронка</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('matcher')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  viewMode === 'matcher'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-stone-500 hover:text-neutral-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>Умный подбор</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onExportCSV}
              className="px-3 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-semibold rounded-xl text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              title="Экспорт в CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            <button
              type="button"
              onClick={() => onExportExcelCSV(filteredBuyers)}
              className="px-3 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-semibold rounded-xl text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              title="Экспорт отфильтрованных в Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            <label className="px-3 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-semibold rounded-xl text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap">
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Импорт</span>
              <input
                type="file"
                className="hidden"
                accept=".json,.txt,.csv"
                onChange={onImportBuyers}
              />
            </label>

            {canAddBuyers && (
              <button
                type="button"
                onClick={() => setIsAddingBuyer(true)}
                className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-[11px] rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить покупателя</span>
              </button>
            )}
          </div>
        </div>

        {/* Stage Filter Strip & Quick Batch Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer tabular-nums ${
                statusFilter === 'all'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Все · {stageCounts.all}
            </button>
            {BUYER_STAGES.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setStatusFilter(st.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer tabular-nums ${
                  statusFilter === st.id
                    ? 'bg-neutral-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {st.short} · {stageCounts[st.id]}
              </button>
            ))}
          </div>

          {selectedBuyerIds.length > 0 && (
            <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl">
              <span className="text-[11px] font-bold text-purple-900 tabular-nums">
                Выбрано: {selectedBuyerIds.length}
              </span>
              <button
                type="button"
                onClick={onOpenMassMailing}
                className="px-2.5 py-1 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>Рассылка</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedBuyerIds([])}
                className="text-[10px] font-semibold text-stone-500 hover:text-rose-600 px-1 cursor-pointer"
              >
                Снять
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VIEW 1: HIGH-DENSITY CONTACT & DEAL TABLE (Default — Immediate contacts & phones!) */}
      {viewMode === 'table' && (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
          {filteredBuyers.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">Покупатели не найдены</h4>
                <p className="text-xs text-stone-500 mt-1">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Попробуйте изменить параметры поиска или сбросить фильтр этапа.'
                    : 'Добавьте первого покупателя в CRM, чтобы запустить автоподбор объектов.'}
                </p>
              </div>
              {canAddBuyers && (
                <button
                  type="button"
                  onClick={() => setIsAddingBuyer(true)}
                  className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить покупателя</span>
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[980px]">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      <th className="py-3 pl-4 pr-2 w-10">
                        <input
                          type="checkbox"
                          checked={
                            paginatedBuyers.length > 0 &&
                            paginatedBuyers.every((b) => selectedBuyerIds.includes(b.id))
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              const ids = Array.from(
                                new Set([...selectedBuyerIds, ...paginatedBuyers.map((b) => b.id)])
                              );
                              setSelectedBuyerIds(ids);
                            } else {
                              const pageSet = new Set(paginatedBuyers.map((b) => b.id));
                              setSelectedBuyerIds(selectedBuyerIds.filter((id) => !pageSet.has(id)));
                            }
                          }}
                          className="w-4 h-4 rounded border-stone-300 text-[#8B5CF6] focus:ring-[#8B5CF6] cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-3 w-[23%]">Покупатель и телефон</th>
                      <th className="py-3 px-3 w-[24%]">Запрос и пожелания</th>
                      <th className="py-3 px-3 w-[13%] text-right">Бюджет</th>
                      <th className="py-3 px-3 w-[14%]">Этап воронки</th>
                      <th className="py-3 px-3 w-[11%]">Подбор</th>
                      <th className="py-3 px-3 w-[10%]">Ответственный</th>
                      <th className="py-3 pl-2 pr-4 w-[10%] text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {paginatedBuyers.map((buyer) => {
                      const stage = normalizeBuyerStage(buyer.status);
                      const stageMeta = BUYER_STAGES.find((s) => s.id === stage) || BUYER_STAGES[0];
                      const budgetUSD =
                        buyer.budgetUSD ||
                        (buyer.budgetBYN ? Math.round(buyer.budgetBYN / (nbrbRate || 3.27)) : 0);
                      const budgetBYN =
                        buyer.budgetBYN || Math.round(budgetUSD * (nbrbRate || 3.27));
                      const matchesCount = getBuyerMatchesCount(buyer, propertiesList, nbrbRate);
                      const cleanPhone = (buyer.phone || '').replace(/[^\d]/g, '');

                      return (
                        <tr
                          key={buyer.id}
                          className="hover:bg-purple-50/30 transition-colors group"
                        >
                          <td className="py-3 pl-4 pr-2 align-top">
                            <input
                              type="checkbox"
                              checked={selectedBuyerIds.includes(buyer.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBuyerIds([...selectedBuyerIds, buyer.id]);
                                } else {
                                  setSelectedBuyerIds(selectedBuyerIds.filter((id) => id !== buyer.id));
                                }
                              }}
                              className="w-4 h-4 mt-1 rounded border-stone-300 text-[#8B5CF6] focus:ring-[#8B5CF6] cursor-pointer"
                            />
                          </td>

                          {/* Buyer Name + Immediate Phone Actions */}
                          <td className="py-3 px-3 align-top">
                            <div className="flex items-start gap-2.5">
                              <button
                                type="button"
                                onClick={() => openBuyerDrawer(buyer, 'card')}
                                className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] flex items-center justify-center shrink-0 hover:bg-[#8B5CF6] hover:text-white transition-colors cursor-pointer"
                                title="Открыть карточку покупателя"
                              >
                                {getInitials(buyer.name)}
                              </button>
                              <div className="min-w-0">
                                <button
                                  type="button"
                                  onClick={() => openBuyerDrawer(buyer, 'card')}
                                  className="font-bold text-neutral-900 hover:text-[#8B5CF6] text-left text-[13px] leading-tight truncate block max-w-[200px] cursor-pointer"
                                >
                                  {buyer.name}
                                </button>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <a
                                    href={`tel:${(buyer.phone || '').replace(/[^\d+]/g, '')}`}
                                    className="font-mono font-bold text-[12px] text-neutral-800 hover:text-[#8B5CF6] tabular-nums inline-flex items-center gap-1"
                                  >
                                    <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                                    {buyer.phone}
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyPhone(buyer.id, buyer.phone)}
                                    className="p-1 text-stone-400 hover:text-neutral-800 rounded hover:bg-stone-100 cursor-pointer"
                                    title="Скопировать номер"
                                  >
                                    {copiedPhoneId === buyer.id ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[10px] font-semibold">
                                  {cleanPhone && (
                                    <>
                                      <a
                                        href={`viber://chat?number=%2B${cleanPhone}`}
                                        className="text-purple-700 hover:underline"
                                      >
                                        Viber
                                      </a>
                                      <span className="text-stone-300">·</span>
                                      <a
                                        href={`https://t.me/+${cleanPhone}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sky-600 hover:underline"
                                      >
                                        Telegram
                                      </a>
                                      <span className="text-stone-300">·</span>
                                      <a
                                        href={`https://wa.me/${cleanPhone}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-emerald-700 hover:underline"
                                      >
                                        WhatsApp
                                      </a>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Request Summary */}
                          <td className="py-3 px-3 align-top">
                            <div className="text-[11px] font-semibold text-neutral-800">
                              {[
                                getPropertyTypeLabel(buyer.prefType),
                                buyer.prefRooms ? `${buyer.prefRooms}-комн.` : null,
                                buyer.prefDistrict ? `${buyer.prefDistrict} р-н` : null,
                                buyer.minArea ? `от ${buyer.minArea} м²` : null,
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </div>
                            <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-snug">
                              {buyer.preferences || 'Без дополнительных комментариев'}
                            </p>
                          </td>

                          {/* Budget */}
                          <td className="py-3 px-3 align-top text-right tabular-nums">
                            {budgetUSD > 0 ? (
                              <>
                                <div className="font-mono font-bold text-neutral-900 text-[12px]">
                                  ${budgetUSD.toLocaleString('ru-RU')}
                                </div>
                                <div className="font-mono text-[10px] text-stone-500 mt-0.5">
                                  {budgetBYN.toLocaleString('ru-RU')} BYN
                                </div>
                              </>
                            ) : (
                              <span className="text-[11px] text-stone-400">Не указан</span>
                            )}
                          </td>

                          {/* Stage */}
                          <td className="py-3 px-3 align-top">
                            <select
                              value={stage}
                              disabled={!canEditBuyer(buyer)}
                              onChange={(e) => handleStageChange(buyer.id, e.target.value as BuyerStageId)}
                              className={`w-full px-2.5 py-1.5 rounded-lg border text-[11px] font-bold outline-none cursor-pointer transition-colors ${stageMeta.badgeClass}`}
                            >
                              {BUYER_STAGES.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                            <div className="text-[10px] text-stone-400 mt-1 tabular-nums">
                              Добавлен: {buyer.dateAdded || '—'}
                            </div>
                          </td>

                          {/* Matched Objects Drawer Trigger */}
                          <td className="py-3 px-3 align-top">
                            <button
                              type="button"
                              onClick={() => openBuyerDrawer(buyer, 'matches')}
                              className="px-2.5 py-1.5 bg-purple-50 hover:bg-[#8B5CF6] text-purple-800 hover:text-white border border-purple-200 hover:border-[#8B5CF6] rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer tabular-nums whitespace-nowrap"
                              title="Открыть подбор объектов для покупателя"
                            >
                              <Building2 className="w-3.5 h-3.5" />
                              <span>{matchesCount} об.</span>
                            </button>
                          </td>

                          {/* Owner & Visibility */}
                          <td className="py-3 px-3 align-top">
                            <div className="text-[11px] font-semibold text-neutral-700 truncate max-w-[120px]">
                              {buyer.assignedAgentName || buyer.registeredBy || '—'}
                            </div>
                            {canEditBuyer(buyer) && (
                              <button
                                type="button"
                                onClick={() => handleTogglePublished(buyer.id)}
                                className={`mt-1 text-[10px] font-semibold inline-flex items-center gap-1 cursor-pointer ${
                                  buyer.isPublicApproved ? 'text-emerald-700' : 'text-stone-400 hover:text-stone-700'
                                }`}
                                title="Переключить отображение в закрытом/публичном списке запросов"
                              >
                                {buyer.isPublicApproved ? (
                                  <>
                                    <Globe className="w-3 h-3" /> На сайте
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3 h-3" /> В CRM
                                  </>
                                )}
                              </button>
                            )}
                          </td>

                          {/* Row Actions */}
                          <td className="py-3 pl-2 pr-4 align-top text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openBuyerDrawer(buyer, 'card')}
                                className="p-1.5 text-stone-500 hover:text-[#8B5CF6] hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                                title="Открыть / редактировать карточку"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {canDeleteBuyer(buyer) &&
                                (confirmDeleteId === buyer.id ? (
                                  <div className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-lg">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteBuyer(buyer)}
                                      className="text-[10px] font-bold text-rose-700 hover:text-rose-900 cursor-pointer"
                                    >
                                      Удалить
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="text-[10px] font-semibold text-stone-500 hover:text-stone-800 cursor-pointer"
                                    >
                                      Отмена
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(buyer.id)}
                                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="Удалить"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Clean Pagination Footer */}
              <div className="px-4 py-3 bg-stone-50/70 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
                <span className="tabular-nums">
                  Показано {paginatedBuyers.length} из {filteredBuyers.length} (стр. {clampedPage} / {totalPages})
                </span>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={clampedPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={clampedPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* VIEW 2: AMOCRM / BITRIX24 DEAL FUNNEL KANBAN */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {BUYER_STAGES.map((stage) => {
            const colBuyers = filteredBuyers.filter((b) => normalizeBuyerStage(b.status) === stage.id);
            const totalStageUSD = colBuyers.reduce(
              (acc, b) => acc + (b.budgetUSD || Math.round((b.budgetBYN || 0) / (nbrbRate || 3.27))),
              0
            );

            return (
              <div
                key={stage.id}
                className={`bg-stone-100/70 border border-stone-200 border-t-4 ${stage.columnTint} rounded-2xl p-3 flex flex-col min-h-[480px]`}
              >
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-200">
                  <div>
                    <h4 className="font-bold text-xs text-neutral-900">{stage.label}</h4>
                    <span className="text-[10px] font-mono text-stone-500 tabular-nums">
                      ${totalStageUSD.toLocaleString('ru-RU')}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 font-mono font-bold text-[11px] text-neutral-800 tabular-nums">
                    {colBuyers.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
                  {colBuyers.length === 0 ? (
                    <div className="h-32 border border-dashed border-stone-300 rounded-xl flex items-center justify-center text-[11px] text-stone-400">
                      Нет клиентов на этапе
                    </div>
                  ) : (
                    colBuyers.map((buyer) => {
                      const usd = buyer.budgetUSD || Math.round((buyer.budgetBYN || 0) / (nbrbRate || 3.27));
                      const matches = getBuyerMatchesCount(buyer, propertiesList, nbrbRate);

                      return (
                        <div
                          key={buyer.id}
                          className="bg-white border border-stone-200 hover:border-[#8B5CF6] rounded-xl p-3 shadow-2xs space-y-2 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => openBuyerDrawer(buyer, 'card')}
                              className="font-bold text-xs text-neutral-900 hover:text-[#8B5CF6] text-left leading-snug cursor-pointer"
                            >
                              {buyer.name}
                            </button>
                            {usd > 0 && (
                              <span className="font-mono font-bold text-[11px] text-[#8B5CF6] shrink-0 tabular-nums">
                                ${usd.toLocaleString('ru-RU')}
                              </span>
                            )}
                          </div>

                          <a
                            href={`tel:${(buyer.phone || '').replace(/[^\d+]/g, '')}`}
                            className="font-mono text-[11px] font-semibold text-stone-700 hover:text-[#8B5CF6] flex items-center gap-1 tabular-nums"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            {buyer.phone}
                          </a>

                          <p className="text-[11px] text-stone-500 line-clamp-2">
                            {buyer.preferences || getPropertyTypeLabel(buyer.prefType)}
                          </p>

                          <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => openBuyerDrawer(buyer, 'matches')}
                              className="text-[10px] font-bold text-[#8B5CF6] hover:underline cursor-pointer tabular-nums"
                            >
                              {matches} объектов ▸
                            </button>
                            <select
                              value={stage.id}
                              disabled={!canEditBuyer(buyer)}
                              onChange={(e) => handleStageChange(buyer.id, e.target.value as BuyerStageId)}
                              className="bg-stone-50 border border-stone-200 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-stone-700 outline-none cursor-pointer"
                            >
                              {BUYER_STAGES.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.short}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: DEDICATED SMART PROPERTY MATCHING WORKSPACE */}
      {viewMode === 'matcher' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
          <BuyerSearchMatcher
            buyersList={agentScopedBuyers}
            propertiesList={propertiesList}
            agentsList={agentsList}
            onUpdateBuyer={(updatedBuyer) => {
              const updated = buyersList.map((b) => (b.id === updatedBuyer.id ? updatedBuyer : b));
              setBuyersList(updated);
            }}
          />
        </div>
      )}

      {/* BITRIX24 / AMOCRM SLIDE-OVER BUYER CARD DRAWER */}
      {drawerBuyer && (
        <div className="fixed inset-0 z-[130] flex justify-end bg-neutral-950/50 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white h-full shadow-2xl border-l border-stone-200 flex flex-col overflow-hidden">
            {/* Drawer Header */}
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 space-y-3 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-[#8B5CF6] text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {getInitials(drawerBuyer.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-neutral-900 truncate">
                      {drawerBuyer.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs">
                      <a
                        href={`tel:${(drawerBuyer.phone || '').replace(/[^\d+]/g, '')}`}
                        className="font-mono font-bold text-neutral-800 hover:text-[#8B5CF6] flex items-center gap-1 tabular-nums"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        {drawerBuyer.phone}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopyPhone(drawerBuyer.id, drawerBuyer.phone)}
                        className="text-[11px] font-semibold text-stone-500 hover:text-neutral-900 cursor-pointer"
                      >
                        {copiedPhoneId === drawerBuyer.id ? 'Скопировано' : 'Копировать'}
                      </button>
                      <span className="text-stone-300">·</span>
                      <span className="font-mono font-bold text-[#8B5CF6] tabular-nums">
                        ${(drawerBuyer.budgetUSD || Math.round((drawerBuyer.budgetBYN || 0) / (nbrbRate || 3.27))).toLocaleString('ru-RU')}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDrawerBuyerId(null)}
                  className="p-2 rounded-xl hover:bg-stone-200 text-stone-500 hover:text-neutral-900 cursor-pointer"
                  aria-label="Закрыть карточку"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* AmoCRM Interactive Stage Pipeline Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {BUYER_STAGES.map((st) => {
                  const active = normalizeBuyerStage(drawerBuyer.status) === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      disabled={!canEditBuyer(drawerBuyer)}
                      onClick={() => handleStageChange(drawerBuyer.id, st.id)}
                      className={`py-1.5 px-2.5 rounded-lg text-[11px] font-bold border text-center transition-all cursor-pointer truncate ${
                        active
                          ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-2xs'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-purple-300'
                      }`}
                    >
                      {st.short}
                    </button>
                  );
                })}
              </div>

              {/* Inner Drawer Tabs */}
              <div className="flex items-center gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => setDrawerTab('matches')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    drawerTab === 'matches'
                      ? 'bg-neutral-900 text-white'
                      : 'text-stone-600 hover:bg-stone-200/70'
                  }`}
                >
                  Подобранные объекты ({getBuyerMatchesCount(drawerBuyer, propertiesList, nbrbRate)})
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab('card')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    drawerTab === 'card'
                      ? 'bg-neutral-900 text-white'
                      : 'text-stone-600 hover:bg-stone-200/70'
                  }`}
                >
                  Карточка и параметры
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab('tasks')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    drawerTab === 'tasks'
                      ? 'bg-neutral-900 text-white'
                      : 'text-stone-600 hover:bg-stone-200/70'
                  }`}
                >
                  Задачи ({drawerBuyerTasks.length})
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {drawerTab === 'matches' && (
                <BuyerSearchMatcher
                  buyer={drawerBuyer}
                  propertiesList={propertiesList}
                  agentsList={agentsList}
                  onUpdateBuyer={(updatedBuyer) => {
                    const updated = buyersList.map((b) =>
                      b.id === updatedBuyer.id ? updatedBuyer : b
                    );
                    setBuyersList(updated);
                    onNotify('Критерии подбора сохранены', 'success');
                  }}
                />
              )}

              {drawerTab === 'card' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-stone-500">ФИО покупателя</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#8B5CF6]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-stone-500">Телефон</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold outline-none focus:bg-white focus:border-[#8B5CF6]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-stone-500">
                        Бюджет USD ({(Math.round((parseInt(editBudgetUSD, 10) || 0) * (nbrbRate || 3.27))).toLocaleString('ru-RU')} BYN)
                      </label>
                      <input
                        type="number"
                        value={editBudgetUSD}
                        onChange={(e) => setEditBudgetUSD(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold outline-none focus:bg-white focus:border-[#8B5CF6]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-stone-500">Этап сделки</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as BuyerStageId)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none cursor-pointer"
                      >
                        {BUYER_STAGES.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-stone-500">Тип объекта</label>
                      <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none cursor-pointer"
                      >
                        <option value="all">Любой тип</option>
                        <option value="apartment">Квартира</option>
                        <option value="house">Дом / Коттедж</option>
                        <option value="commercial">Коммерческая недвижимость</option>
                        <option value="plot">Участок</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-stone-500">Комнаты</label>
                      <select
                        value={editRooms}
                        onChange={(e) => setEditRooms(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none cursor-pointer"
                      >
                        <option value="">Любое кол-во</option>
                        <option value="1">1 комната</option>
                        <option value="2">2 комнаты</option>
                        <option value="3">3 комнаты</option>
                        <option value="4">4+ комнат</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-stone-500">Район Минска</label>
                      <select
                        value={editDistrict}
                        onChange={(e) => setEditDistrict(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none cursor-pointer"
                      >
                        <option value="">Любой район</option>
                        {DISTRICT_OPTIONS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-stone-500">Мин. площадь (м²)</label>
                      <input
                        type="number"
                        value={editMinArea}
                        onChange={(e) => setEditMinArea(e.target.value)}
                        placeholder="Например: 45"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#8B5CF6]"
                      />
                    </div>
                  </div>

                  {isAgentAdmin && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-stone-500">Ответственный риэлтер</label>
                      <select
                        value={editAssignedAgentId}
                        onChange={(e) => setEditAssignedAgentId(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none cursor-pointer"
                      >
                        <option value="">— По умолчанию ({drawerBuyer.registeredBy}) —</option>
                        {agentsList
                          .filter(isRealtorAgent)
                          .map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name} ({a.role})
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Пожелания и заметки по клиенту</label>
                    <textarea
                      rows={3}
                      value={editPrefs}
                      onChange={(e) => setEditPrefs(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-[#8B5CF6] resize-none"
                    />
                  </div>

                  {canEditBuyer(drawerBuyer) && (
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleSaveDrawerCard}
                        className="px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Сохранить карточку
                      </button>
                    </div>
                  )}
                </div>
              )}

              {drawerTab === 'tasks' && (
                <div className="space-y-5">
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-neutral-900">Поставить задачу по клиенту</h4>
                    <input
                      type="text"
                      value={drawerTaskTitle}
                      onChange={(e) => setDrawerTaskTitle(e.target.value)}
                      placeholder="Например: Созвониться и согласовать просмотр квартиры"
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:border-[#8B5CF6]"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="datetime-local"
                        value={drawerTaskDeadline}
                        onChange={(e) => setDrawerTaskDeadline(e.target.value)}
                        className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs outline-none"
                      />
                      <select
                        value={drawerTaskPriority}
                        onChange={(e) => setDrawerTaskPriority(e.target.value as any)}
                        className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold outline-none cursor-pointer"
                      >
                        <option value="low">Обычный приоритет</option>
                        <option value="medium">Средний приоритет</option>
                        <option value="high">Срочно</option>
                      </select>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddDrawerTask}
                        className="px-4 py-2 bg-neutral-900 hover:bg-[#8B5CF6] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Добавить задачу
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-stone-500 uppercase">
                      Связанные задачи ({drawerBuyerTasks.length})
                    </h4>
                    {drawerBuyerTasks.length === 0 ? (
                      <p className="text-xs text-stone-400 py-4">Задач по этому покупателю пока нет.</p>
                    ) : (
                      drawerBuyerTasks.map((t) => (
                        <div
                          key={t.id}
                          className="p-3 bg-white border border-stone-200 rounded-xl flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              type="button"
                              onClick={() => {
                                const next = tasksList.map((item) =>
                                  item.id === t.id
                                    ? { ...item, status: (item.status === 'completed' ? 'pending' : 'completed') as 'pending' | 'completed' }
                                    : item
                                );
                                onSaveTasks(next);
                              }}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 cursor-pointer ${
                                t.status === 'completed'
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'border-stone-300'
                              }`}
                            >
                              {t.status === 'completed' && <Check className="w-3.5 h-3.5" />}
                            </button>
                            <div className="min-w-0">
                              <div className={`font-semibold text-xs truncate ${t.status === 'completed' ? 'line-through text-stone-400' : 'text-neutral-900'}`}>
                                {t.title}
                              </div>
                              <div className="text-[10px] text-stone-500 tabular-nums">
                                Срок: {new Date(t.deadline).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW BUYER MODAL (Clean, Non-Blocking, Instant Save) */}
      {isAddingBuyer && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Новый покупатель в CRM</h3>
                <p className="text-[11px] text-stone-500 mt-0.5 tabular-nums">
                  Курс НБРБ: 1 USD = {nbrbRate.toFixed(4)} BYN
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddingBuyer(false);
                  setAddFormError(null);
                }}
                className="p-1.5 rounded-lg text-stone-400 hover:text-neutral-900 hover:bg-stone-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {addFormError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                  {addFormError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-500">ФИО клиента *</label>
                  <input
                    type="text"
                    placeholder="Например: Анна Соколова"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#8B5CF6]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Телефон *</label>
                  <input
                    type="text"
                    placeholder="+375 (29) ___-__-__"
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold outline-none focus:bg-white focus:border-[#8B5CF6]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-500">
                    Бюджет (USD){addBudgetUSD ? ` ≈ ${Math.round((parseInt(addBudgetUSD, 10) || 0) * nbrbRate).toLocaleString('ru-RU')} BYN` : ''}
                  </label>
                  <input
                    type="number"
                    placeholder="65000"
                    value={addBudgetUSD}
                    onChange={(e) => setAddBudgetUSD(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold outline-none focus:bg-white focus:border-[#8B5CF6]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Этап сделки</label>
                  <select
                    value={addStatus}
                    onChange={(e) => setAddStatus(e.target.value as BuyerStageId)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none cursor-pointer"
                  >
                    {BUYER_STAGES.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Тип недвижимости</label>
                  <select
                    value={addType}
                    onChange={(e) => setAddType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none cursor-pointer"
                  >
                    <option value="all">Любой тип</option>
                    <option value="apartment">Квартира</option>
                    <option value="house">Дом / Коттедж</option>
                    <option value="commercial">Коммерческая</option>
                    <option value="plot">Участок</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Комнаты</label>
                  <select
                    value={addRooms}
                    onChange={(e) => setAddRooms(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none cursor-pointer"
                  >
                    <option value="">Любое кол-во</option>
                    <option value="1">1-комнатная</option>
                    <option value="2">2-комнатная</option>
                    <option value="3">3-комнатная</option>
                    <option value="4">4+ комнат</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Район Минска</label>
                  <select
                    value={addDistrict}
                    onChange={(e) => setAddDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none cursor-pointer"
                  >
                    <option value="">Любой район</option>
                    {DISTRICT_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Мин. площадь (м²)</label>
                  <input
                    type="number"
                    placeholder="45"
                    value={addMinArea}
                    onChange={(e) => setAddMinArea(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#8B5CF6]"
                  />
                </div>
              </div>

              {isAgentAdmin && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Ответственный риэлтер</label>
                  <select
                    value={addAssignedAgentId}
                    onChange={(e) => setAddAssignedAgentId(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold outline-none cursor-pointer"
                  >
                    <option value="">Закрепить за мной ({loggedInAgent?.name || 'Администратор'})</option>
                    {agentsList
                      .filter(isRealtorAgent)
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.role})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-stone-500">Пожелания к объекту</label>
                <textarea
                  rows={2}
                  placeholder="Например: Ищет 2-комнатную квартиру рядом с метро Немига или Грушевка"
                  value={addPrefs}
                  onChange={(e) => setAddPrefs(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-[#8B5CF6] resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddingBuyer(false);
                  setAddFormError(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-neutral-900 cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleCreateBuyer}
                className="px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Сохранить покупателя
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
