"use client";
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts';
import { AgentKPI, Lead } from '../types';
import { TrendingUp, Users, DollarSign, Target, Award, PieChart as PieIcon, Download, FileSpreadsheet, Calendar, Activity, ShieldCheck, Search, Filter } from 'lucide-react';

interface CRMAnalyticsDashboardProps {
  agentsKPI: AgentKPI[];
  leads: Lead[];
}

const COLORS = ['#8B5CF6', '#15120C', '#4b5563', '#9ca3af', '#d1d5db', '#10b981', '#f59e0b', '#3b82f6'];

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: 'lead' | 'property' | 'kp' | 'deal' | 'call' | 'security';
  details: string;
  ip?: string;
}

export default function CRMAnalyticsDashboard({ agentsKPI, leads }: CRMAnalyticsDashboardProps) {
  const [periodFilter, setPeriodFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [auditSearch, setAuditSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Audit Logs with persistent fallback
  const [auditLogs] = useState<AuditLogItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('fp_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    const now = new Date();
    const subDays = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();
    return [
      { id: '1', timestamp: new Date().toISOString(), user: 'Белюк Жанна', action: 'Генерация КП (Презентационный)', category: 'kp', details: 'Объект: 3-к на Независимости, 95 (Инвестор)', ip: '178.124.168.42' },
      { id: '2', timestamp: subDays(0.2), user: 'Ковалев Дмитрий', action: 'Фиксация сделки', category: 'deal', details: 'Задаток $3,000 принят. Договор №248-ПР', ip: '178.124.168.10' },
      { id: '3', timestamp: subDays(1), user: 'Белюк Жанна', action: 'Звонок клиенту', category: 'call', details: 'Лид #1042: Согласован выезд на объект', ip: '178.124.168.42' },
      { id: '4', timestamp: subDays(2), user: 'Макарова Ольга', action: 'Добавление объекта', category: 'property', details: 'Новый объект: Квартира в ЖК Новая Боровая', ip: '86.57.194.22' },
      { id: '5', timestamp: subDays(3), user: 'Администратор', action: 'Экспорт базы покупателей', category: 'security', details: 'Выгрузка 124 контактов в CSV', ip: '178.124.168.1' },
      { id: '6', timestamp: subDays(5), user: 'Ковалев Дмитрий', action: 'Смена этапа воронки', category: 'lead', details: 'Лид переведен в статус "Переговоры"', ip: '178.124.168.10' },
      { id: '7', timestamp: subDays(12), user: 'Белюк Жанна', action: 'Отправка КП в мессенджер', category: 'kp', details: 'Минималистичный PDF отправлен в Telegram', ip: '178.124.168.42' },
      { id: '8', timestamp: subDays(20), user: 'Макарова Ольга', action: 'Заключение договора', category: 'deal', details: 'Эксклюзивный договор оказания услуг №119', ip: '86.57.194.22' }
    ];
  });

  // Filter audit logs by period
  const filteredLogs = auditLogs.filter(log => {
    const logDate = new Date(log.timestamp).getTime();
    const now = Date.now();
    const diffDays = (now - logDate) / (1000 * 3600 * 24);

    if (periodFilter === 'today' && diffDays > 1) return false;
    if (periodFilter === 'week' && diffDays > 7) return false;
    if (periodFilter === 'month' && diffDays > 30) return false;

    if (selectedCategory !== 'all' && log.category !== selectedCategory) return false;

    if (auditSearch.trim()) {
      const q = auditSearch.toLowerCase();
      const matchUser = log.user.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      return matchUser || matchAction || matchDetails;
    }
    return true;
  });

  // Category stats for selected period
  const categoryCounts = filteredLogs.reduce<Record<string, number>>((acc, l) => {
    acc[l.category] = (acc[l.category] || 0) + 1;
    return acc;
  }, {});

  // Export audit log to CSV
  const handleExportAuditCSV = () => {
    const headers = ['ID', 'Дата и время', 'Риэлтер / Пользователь', 'Действие', 'Категория', 'Детали', 'IP адрес'];
    const rows = filteredLogs.map(l => [
      `"${l.id}"`,
      `"${new Date(l.timestamp).toLocaleString('ru-RU')}"`,
      `"${l.user}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.category}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ip || '—'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_activity_log_${periodFilter}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Funnel Data calculation
  const funnelData = [
    { name: 'Новые', value: leads.filter(l => l.stage === 'new' || !l.stage).length, fill: '#d1d5db' },
    { name: 'Контакт', value: leads.filter(l => l.stage === 'contacted').length, fill: '#9ca3af' },
    { name: 'Переговоры', value: leads.filter(l => l.stage === 'negotiation').length, fill: '#8B5CF6' },
    { name: 'Задаток', value: leads.filter(l => l.stage === 'deposit').length, fill: '#f59e0b' },
    { name: 'Сделка', value: leads.filter(l => l.stage === 'closed').length, fill: '#10b981' },
  ].filter(d => d.value > 0);

  // Source distribution
  const sourceMap = leads.reduce((acc: any, lead) => {
    const src = lead.source || 'Неизвестно';
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {});

  const sourceData = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6 font-sans">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-stone-100 rounded-lg text-stone-600">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Всего лидов</span>
          </div>
          <p className="text-2xl font-black text-neutral-900">{leads.length}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">+12% за неделю</p>
        </div>
        
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Конверсия</span>
          </div>
          <p className="text-2xl font-black text-neutral-900">
            {leads.length > 0 ? ((leads.filter(l => l.stage === 'closed').length / leads.length) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-[10px] text-stone-400 font-bold mt-1">Средняя по отделу</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Выручка (прогноз)</span>
          </div>
          <p className="text-2xl font-black text-neutral-900">$45.2k</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">В ожидании закрытия</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">ROI Маркетинга</span>
          </div>
          <p className="text-2xl font-black text-neutral-900">3.4x</p>
          <p className="text-[10px] text-indigo-600 font-bold mt-1">Активные кампании</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Funnel */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <h4 className="text-sm font-black text-neutral-900 mb-6 uppercase tracking-widest flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#8B5CF6]" /> Воронка продаж
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={funnelData} margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sources */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <h4 className="text-sm font-black text-neutral-900 mb-6 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#8B5CF6]" /> Источники лидов
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Realtor Performance Table / Chart */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <h4 className="text-sm font-black text-neutral-900 mb-6 uppercase tracking-widest flex items-center gap-2">
          <Award className="w-4 h-4 text-[#8B5CF6]" /> Сравнение эффективности риэлтеров
        </h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={agentsKPI}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="agentName" tick={{ fontSize: 10, fontWeight: 'bold' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
              <Tooltip 
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="calls" name="Звонки" fill="#d1d5db" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="meetings" name="Встречи" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="deals" name="Сделки" stroke="#15120C" strokeWidth={3} dot={{ r: 4, fill: '#15120C' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Audit & Activity Log with Period Filter & CSV/Excel Export */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <h4 className="text-sm font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" /> Журнал активности и аудит действий
            </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              Фиксация всех ключевых операций: генерация КП, звонки, изменение объектов и сделки
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAuditCSV}
              className="px-3.5 py-2 bg-neutral-900 hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              title="Экспорт в формате CSV / Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Экспорт журнала (CSV)</span>
            </button>
          </div>
        </div>

        {/* Period Filter & Category Chips */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl w-fit">
            {[
              { id: 'today', label: 'Сегодня' },
              { id: 'week', label: 'За 7 дней' },
              { id: 'month', label: 'За 30 дней' },
              { id: 'all', label: 'Все время' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPeriodFilter(p.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  periodFilter === p.id
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-stone-500 hover:text-neutral-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск по действию, риэлтеру..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full text-xs font-semibold pl-9 pr-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Summary Stats Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
          <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-center">
            <span className="text-[9px] uppercase font-black text-stone-400 block">Всего действий</span>
            <span className="text-sm font-black text-neutral-900">{filteredLogs.length}</span>
          </div>
          <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-100 text-center">
            <span className="text-[9px] uppercase font-black text-purple-600 block">Генерации КП</span>
            <span className="text-sm font-black text-purple-900">{categoryCounts['kp'] || 0}</span>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 text-center">
            <span className="text-[9px] uppercase font-black text-emerald-600 block">Сделки</span>
            <span className="text-sm font-black text-emerald-900">{categoryCounts['deal'] || 0}</span>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100 text-center">
            <span className="text-[9px] uppercase font-black text-blue-600 block">Звонки</span>
            <span className="text-sm font-black text-blue-900">{categoryCounts['call'] || 0}</span>
          </div>
          <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100 text-center">
            <span className="text-[9px] uppercase font-black text-amber-600 block">Объекты</span>
            <span className="text-sm font-black text-amber-900">{categoryCounts['property'] || 0}</span>
          </div>
          <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-100 text-center">
            <span className="text-[9px] uppercase font-black text-rose-600 block">Безопасность</span>
            <span className="text-sm font-black text-rose-900">{categoryCounts['security'] || 0}</span>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto rounded-2xl border border-stone-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100 text-stone-600 uppercase font-black text-[10px] tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Время</th>
                <th className="py-3 px-4">Риэлтер</th>
                <th className="py-3 px-4">Действие</th>
                <th className="py-3 px-4">Категория</th>
                <th className="py-3 px-4">Детали операции</th>
                <th className="py-3 px-4 text-right">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400 font-medium">
                    Событий за выбранный период не обнаружено
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-bold text-neutral-900 whitespace-nowrap">
                      {log.user}
                    </td>
                    <td className="py-3 px-4 font-medium text-stone-800">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        log.category === 'kp' ? 'bg-purple-100 text-purple-700' :
                        log.category === 'deal' ? 'bg-emerald-100 text-emerald-700' :
                        log.category === 'call' ? 'bg-blue-100 text-blue-700' :
                        log.category === 'property' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {log.category === 'kp' ? 'КП' :
                         log.category === 'deal' ? 'Сделка' :
                         log.category === 'call' ? 'Звонок' :
                         log.category === 'property' ? 'Объект' : 'Безопасность'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600 max-w-md truncate">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[10px] text-stone-400 whitespace-nowrap">
                      {log.ip || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
