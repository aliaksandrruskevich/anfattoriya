"use client";
import React, { useState, useEffect } from 'react';
import { CRMTask, Agent, ColdSeller, Buyer } from '../types';
import { CheckSquare, Square, Clock, AlertTriangle, Plus, Phone, Calendar, User, CheckCircle2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface SmartDayPlannerWidgetProps {
  loggedInAgent: Agent | null;
  tasksList: CRMTask[];
  onUpdateTasks: (tasks: CRMTask[]) => void;
  sellersList?: ColdSeller[];
  buyersList?: Buyer[];
  onOpenCallCenter?: () => void;
}

export const SmartDayPlannerWidget: React.FC<SmartDayPlannerWidgetProps> = ({
  loggedInAgent,
  tasksList,
  onUpdateTasks,
  sellersList = [],
  buyersList = [],
  onOpenCallCenter
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('15:00');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showAddForm, setShowAddForm] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter tasks for logged in agent or all for admin
  const agentTasks = tasksList.filter(t => {
    if (!loggedInAgent) return false;
    if (loggedInAgent.isAdmin || loggedInAgent.id === 'admin') return true;
    return t.agentId === loggedInAgent.id || t.assignedAgentName === loggedInAgent.name;
  });

  const todayTasks = agentTasks.filter(t => t.deadline.startsWith(todayStr) && t.status !== 'completed');
  const overdueTasks = agentTasks.filter(t => t.deadline < todayStr && t.status !== 'completed');
  const completedTodayTasks = agentTasks.filter(t => t.status === 'completed' && t.createdAt.startsWith(todayStr));

  // Today callbacks from sellers
  const todaySellerCallbacks = sellersList.filter(s => {
    if (s.nextContactDate !== todayStr) return false;
    if (!loggedInAgent) return false;
    if (loggedInAgent.isAdmin || loggedInAgent.id === 'admin') return true;
    return s.assignedAgentId === loggedInAgent.id || s.assignedAgentName === loggedInAgent.name;
  });

  const handleToggleTask = (taskId: string) => {
    const updated = tasksList.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: (t.status === 'completed' ? 'pending' : 'completed') as CRMTask['status']
        };
      }
      return t;
    });
    onUpdateTasks(updated);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: CRMTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      deadline: `${todayStr} ${newTaskTime}`,
      status: 'pending',
      priority: newTaskPriority,
      agentId: loggedInAgent?.id || 'admin',
      assignedAgentName: loggedInAgent?.name || 'Администратор',
      createdAt: new Date().toISOString()
    };

    onUpdateTasks([newTask, ...tasksList]);
    setNewTaskTitle('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-gradient-to-r from-stone-900 via-neutral-900 to-stone-900 rounded-3xl p-5 text-white shadow-xl border border-stone-800 space-y-4 font-sans">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                Умный ежедневник «Мой день»
              </h3>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                {new Date().toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' })}
              </span>
            </div>
            <p className="text-xs text-stone-400">
              {loggedInAgent?.name || 'Специалист'} • Все фокусные задачи и звонки под рукой
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Быстрая задача</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* KPI Counters Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Звонки сегодня</div>
            <div className="text-lg font-black font-mono text-amber-400">{todaySellerCallbacks.length}</div>
          </div>
          <Phone className="w-5 h-5 text-amber-400/50" />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Задачи на день</div>
            <div className="text-lg font-black font-mono text-white">{todayTasks.length}</div>
          </div>
          <Calendar className="w-5 h-5 text-stone-400" />
        </div>

        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-rose-300 tracking-wider">Просрочено</div>
            <div className="text-lg font-black font-mono text-rose-400">{overdueTasks.length}</div>
          </div>
          <AlertTriangle className="w-5 h-5 text-rose-400" />
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Выполнено</div>
            <div className="text-lg font-black font-mono text-emerald-400">{completedTodayTasks.length}</div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      {/* Quick Add Task Form */}
      {showAddForm && (
        <form onSubmit={handleAddTask} className="p-4 bg-white/10 rounded-2xl border border-white/15 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              placeholder="Что нужно сделать? (например: Перезвонить продавцу по ул. Победителей 89)"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-400 font-medium outline-none focus:ring-2 focus:ring-amber-400"
            />
            <input
              type="time"
              value={newTaskTime}
              onChange={(e) => setNewTaskTime(e.target.value)}
              className="w-28 bg-white/10 border border-white/20 rounded-xl px-2 py-2 text-xs text-white font-mono font-bold outline-none"
            />
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as any)}
              className="bg-neutral-800 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none"
            >
              <option value="low">Низкий</option>
              <option value="medium">Обычный</option>
              <option value="high">🔥 Срочно</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs uppercase rounded-xl transition-all cursor-pointer shrink-0"
            >
              Сохранить
            </button>
          </div>
        </form>
      )}

      {/* Expanded Tasks List */}
      {isExpanded && (
        <div className="space-y-2 pt-1">
          {/* Overdue alerts */}
          {overdueTasks.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Просроченные задачи ({overdueTasks.length})
              </span>
              {overdueTasks.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs transition-all hover:bg-rose-500/20"
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      className="text-stone-400 hover:text-amber-400 cursor-pointer"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-white line-through opacity-90">{task.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                    Дедлайн: {task.deadline}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Today callbacks & tasks */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Фокус на сегодня ({todayTasks.length + todaySellerCallbacks.length})
            </span>

            {todayTasks.length === 0 && todaySellerCallbacks.length === 0 && (
              <div className="p-4 text-center text-xs text-stone-400 bg-white/5 rounded-xl border border-white/5">
                🎉 На сегодня все важные задачи закрыты! Вы можете добавить новую задачу кнопкой «Быстрая задача».
              </div>
            )}

            {/* Seller Callbacks for Today */}
            {todaySellerCallbacks.map(seller => (
              <div
                key={seller.id}
                className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 bg-amber-500/30 text-amber-300 rounded-lg">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-white">Перезвонить продавцу: {seller.name}</span>
                    <span className="text-[10px] text-stone-400 block">{seller.phone} • {seller.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${seller.phone.replace(/[^\d+]/g, '')}`}
                    className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-black text-[10px] uppercase rounded-lg transition-all flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Набрать</span>
                  </a>
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    {seller.nextContactTime || 'Сегодня'}
                  </span>
                </div>
              </div>
            ))}

            {/* Today Regular Tasks */}
            {todayTasks.map(task => (
              <div
                key={task.id}
                className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task.id)}
                    className="text-stone-400 hover:text-emerald-400 cursor-pointer"
                  >
                    <Square className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-white">{task.title}</span>
                </div>

                <div className="flex items-center gap-2">
                  {task.priority === 'high' && (
                    <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                      Срочно
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-stone-400">
                    {task.deadline.split(' ')[1] || task.deadline}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
