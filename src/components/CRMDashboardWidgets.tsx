import React from 'react';
import { Briefcase, TrendingUp, Clock, ChevronRight, Target } from 'lucide-react';
import { Lead, ColdSeller, Buyer, CRMTask, Agent } from '../types';

interface CRMDashboardWidgetsProps {
  leads: Lead[];
  sellersList: ColdSeller[];
  buyersList: Buyer[];
  tasksList: CRMTask[];
  agentsList: Agent[];
  onNavigateTab: (tab: string) => void;
}

export default function CRMDashboardWidgets({
  leads,
  sellersList,
  buyersList,
  tasksList,
  agentsList: _agentsList,
  onNavigateTab
}: CRMDashboardWidgetsProps) {
  // 1. Active deals count
  const activeSellersCount = sellersList.filter(s => s.status === 'active' || s.kanbanStage === 'showing' || s.kanbanStage === 'negotiation' || s.kanbanStage === 'contract').length;
  const activeBuyersCount = buyersList.filter(b => b.status === 'searching' || b.status === 'negotiating').length;
  const totalActiveDeals = activeSellersCount + activeBuyersCount;

  // 2. New leads this week
  const newLeadsCount = leads.filter(l => l.status === 'new' || !l.status).length;

  // 3. Upcoming callbacks / tasks
  const pendingTasks = tasksList.filter(t => t.status === 'pending');
  const upcomingSellersCallbacks = sellersList.filter(s => s.nextContactDate);

  return (
    <div className="space-y-6 font-sans text-neutral-900">
      
      {/* 4 Core Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Widget 1: Active Deals */}
        <div
          onClick={() => onNavigateTab('sellers')}
          className="bg-white border border-stone-200 hover:border-purple-500 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider">
              Активные сделки
            </span>
            <div className="p-2.5 bg-purple-100 text-purple-800 rounded-2xl group-hover:bg-purple-500 group-hover:text-neutral-950 transition-colors">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-black font-mono text-neutral-950">
              {totalActiveDeals}
            </div>
            <p className="text-[11px] text-stone-500 font-medium mt-1">
              Продавцы: <strong className="text-emerald-700">{activeSellersCount}</strong> • Покупатели: <strong className="text-purple-700">{activeBuyersCount}</strong>
            </p>
          </div>

          <div className="pt-2 border-t border-stone-100 text-[10px] font-extrabold text-purple-600 flex items-center justify-between">
            <span>Воронка продаж</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Widget 2: New Leads This Week */}
        <div
          onClick={() => onNavigateTab('leads')}
          className="bg-white border border-stone-200 hover:border-indigo-500 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider">
              Новые лиды за неделю
            </span>
            <div className="p-2.5 bg-indigo-100 text-indigo-800 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-neutral-950">{leads.length}</span>
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                +{newLeadsCount} новых
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium mt-1">
              Входящие звонки и заявки с сайта
            </p>
          </div>

          <div className="pt-2 border-t border-stone-100 text-[10px] font-extrabold text-indigo-600 flex items-center justify-between">
            <span>Открыть журнал заявок</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Widget 3: Upcoming Callbacks */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className="bg-white border border-stone-200 hover:border-emerald-500 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider">
              Ближайшие перезвоны
            </span>
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-black font-mono text-neutral-950">
              {pendingTasks.length + upcomingSellersCallbacks.length}
            </div>
            <p className="text-[11px] text-stone-500 font-medium mt-1">
              Задач на сегодня: <strong className="text-purple-700">{pendingTasks.length}</strong>
            </p>
          </div>

          <div className="pt-2 border-t border-stone-100 text-[10px] font-extrabold text-emerald-600 flex items-center justify-between">
            <span>Календарь задач</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Widget 4: Overall Goal Execution */}
        <div className="bg-neutral-950 text-white rounded-3xl p-5 shadow-lg border border-purple-500/30 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">
              План продаж агентства
            </span>
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
              <Target className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-black font-mono text-white">
              84% выполнено
            </div>
            <p className="text-[10px] text-stone-400 font-medium mt-1">
              42 закрытых договора из 50 по плану
            </p>
          </div>

          <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full w-[84%]" />
          </div>
        </div>

      </div>

    </div>
  );
}
