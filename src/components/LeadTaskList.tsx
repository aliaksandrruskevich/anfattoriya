"use client";
import React, { useState } from 'react';
import { Lead, CRMTask } from '../types';
import { 
  Check, Plus, Clock, Calendar, Trash, Phone, Home, 
  Send, FileText, Users, ListTodo, AlertCircle, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';

interface LeadTaskListProps {
  lead: Lead;
  leads: Lead[];
  tasksList: CRMTask[];
  saveTasks: (tasks: CRMTask[]) => void;
  saveLeadsToStore: (leads: Lead[]) => void;
  agentId: string;
  compact?: boolean;
}

export default function LeadTaskList({
  lead,
  leads,
  tasksList,
  saveTasks,
  saveLeadsToStore,
  agentId,
  compact = false
}: LeadTaskListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [actionType, setActionType] = useState<'call' | 'showing' | 'selection' | 'documents' | 'meeting' | 'other'>('call');

  // Filter tasks specific to this lead
  const leadTasks = tasksList.filter(t => t.clientId === lead.id);
  const pendingTasks = leadTasks.filter(t => t.status === 'pending');
  const completedTasks = leadTasks.filter(t => t.status === 'completed');

  // Format default deadline helper (e.g. tomorrow at 12:00)
  const getDefaultDeadline = (hoursOffset: number = 24) => {
    const d = new Date();
    d.setHours(d.getHours() + hoursOffset);
    d.setMinutes(0);
    // Format YYYY-MM-DDTHH:mm for datetime-local
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleApplyPreset = (presetType: 'call' | 'showing' | 'selection' | 'documents' | 'meeting') => {
    setActionType(presetType);
    setShowAddForm(true);
    
    if (presetType === 'call') {
      setTitle(`Звонок клиенту ${lead.name} по подборке`);
      setDeadline(getDefaultDeadline(3));
      setPriority('high');
    } else if (presetType === 'showing') {
      setTitle(`Показ объекта для ${lead.name}`);
      setDeadline(getDefaultDeadline(24));
      setPriority('high');
    } else if (presetType === 'selection') {
      setTitle(`Подготовить и отправить подборку вариантов в Telegram`);
      setDeadline(getDefaultDeadline(6));
      setPriority('medium');
    } else if (presetType === 'documents') {
      setTitle(`Запросить пакет документов для сделки`);
      setDeadline(getDefaultDeadline(48));
      setPriority('medium');
    } else if (presetType === 'meeting') {
      setTitle(`Встреча в офисе с клиентом ${lead.name}`);
      setDeadline(getDefaultDeadline(24));
      setPriority('high');
    }
  };

  const handleCreateTask = () => {
    if (!title.trim()) return;

    const taskDeadline = deadline || getDefaultDeadline(24);

    const newTask: CRMTask = {
      id: `task-lead-${Date.now()}`,
      title: title.trim(),
      deadline: taskDeadline,
      priority,
      status: 'pending',
      actionType,
      clientId: lead.id,
      clientName: lead.name,
      agentId: agentId || 'admin',
      createdAt: new Date().toISOString()
    };

    const updatedTasks = [newTask, ...tasksList];
    saveTasks(updatedTasks);

    // Update lead's nextContactTask & nextContactDate to earliest pending task for sync
    const allPendingForLead = updatedTasks.filter(t => t.clientId === lead.id && t.status === 'pending');
    allPendingForLead.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    
    if (allPendingForLead.length > 0) {
      const earliest = allPendingForLead[0];
      const updatedLeads = leads.map(l => l.id === lead.id ? {
        ...l,
        nextContactTask: earliest.title,
        nextContactDate: earliest.deadline.split('T')[0]
      } : l);
      saveLeadsToStore(updatedLeads);
    }

    // Reset Form
    setTitle('');
    setDeadline('');
    setPriority('medium');
    setActionType('call');
    setShowAddForm(false);
  };

  const handleToggleTaskStatus = (task: CRMTask) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    const updatedTasks = tasksList.map(t => t.id === task.id ? { ...t, status: nextStatus as 'pending' | 'completed' } : t);
    saveTasks(updatedTasks);

    // Sync earliest pending task back to lead summary
    const pendingForLead = updatedTasks.filter(t => t.clientId === lead.id && t.status === 'pending');
    pendingForLead.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    const updatedLeads = leads.map(l => {
      if (l.id === lead.id) {
        if (pendingForLead.length > 0) {
          return {
            ...l,
            nextContactTask: pendingForLead[0].title,
            nextContactDate: pendingForLead[0].deadline.split('T')[0]
          };
        } else {
          return {
            ...l,
            nextContactTask: '',
            nextContactDate: ''
          };
        }
      }
      return l;
    });
    saveLeadsToStore(updatedLeads);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasksList.filter(t => t.id !== taskId);
    saveTasks(updatedTasks);

    // Sync lead summary
    const pendingForLead = updatedTasks.filter(t => t.clientId === lead.id && t.status === 'pending');
    pendingForLead.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    const updatedLeads = leads.map(l => {
      if (l.id === lead.id) {
        if (pendingForLead.length > 0) {
          return {
            ...l,
            nextContactTask: pendingForLead[0].title,
            nextContactDate: pendingForLead[0].deadline.split('T')[0]
          };
        } else {
          return { ...l, nextContactTask: '', nextContactDate: '' };
        }
      }
      return l;
    });
    saveLeadsToStore(updatedLeads);
  };

  const getActionIcon = (type?: string) => {
    switch (type) {
      case 'call': return <Phone className="w-3.5 h-3.5 text-indigo-600" />;
      case 'showing': return <Home className="w-3.5 h-3.5 text-purple-600" />;
      case 'selection': return <Send className="w-3.5 h-3.5 text-sky-600" />;
      case 'documents': return <FileText className="w-3.5 h-3.5 text-purple-600" />;
      case 'meeting': return <Users className="w-3.5 h-3.5 text-emerald-600" />;
      default: return <Clock className="w-3.5 h-3.5 text-stone-500" />;
    }
  };

  if (compact) {
    return (
      <div className="space-y-2 text-[10px]">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-neutral-800 uppercase tracking-wider text-[9px] flex items-center gap-1">
            <ListTodo className="w-3 h-3 text-purple-500" /> Задачи ({pendingTasks.length})
          </span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-[9px] font-black uppercase text-purple-600 hover:text-purple-800 flex items-center gap-0.5"
          >
            <Plus className="w-2.5 h-2.5" /> Задача
          </button>
        </div>

        {/* Quick Compact Presets */}
        {showAddForm && (
          <div className="bg-purple-50/80 border border-purple-200 p-2 rounded-lg space-y-2 animate-fade-in">
            <input
              type="text"
              placeholder="Что нужно сделать..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-purple-200 text-[10px] rounded p-1.5 outline-none font-medium"
            />
            <div className="flex items-center justify-between gap-1">
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-white border border-purple-200 text-[9px] rounded p-1 outline-none font-medium flex-1"
              />
              <button
                onClick={handleCreateTask}
                className="bg-neutral-900 text-white font-black text-[9px] uppercase px-2 py-1 rounded hover:bg-purple-500 hover:text-neutral-950 transition-colors cursor-pointer"
              >
                ОК
              </button>
            </div>
          </div>
        )}

        {/* Compact List of Pending Tasks */}
        {pendingTasks.length > 0 && (
          <div className="space-y-1 max-h-32 overflow-y-auto pr-0.5">
            {pendingTasks.map((t) => {
              const isOverdue = new Date(t.deadline) < new Date();
              return (
                <div key={t.id} className="flex items-start justify-between gap-1.5 bg-stone-50 border border-stone-200/80 p-1.5 rounded">
                  <div className="flex items-start gap-1.5 min-w-0 flex-1">
                    <button
                      onClick={() => handleToggleTaskStatus(t)}
                      className="w-3.5 h-3.5 border border-stone-300 rounded hover:border-emerald-500 flex items-center justify-center shrink-0 mt-0.5 bg-white cursor-pointer"
                    >
                      {t.status === 'completed' && <Check className="w-2.5 h-2.5 text-emerald-600" />}
                    </button>
                    <div className="min-w-0">
                      <p className="font-bold text-neutral-900 truncate leading-tight">{t.title}</p>
                      <span className={`text-[8px] font-mono block ${isOverdue ? 'text-rose-600 font-black' : 'text-stone-400'}`}>
                        {isOverdue && '🔥 '}
                        {new Date(t.deadline).toLocaleDateString('ru-RU')} {new Date(t.deadline).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteTask(t.id)} className="text-stone-300 hover:text-rose-500 shrink-0">
                    <Trash className="w-2.5 h-2.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-4 space-y-4 shadow-sm text-xs font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-150 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-200/60">
            <ListTodo className="w-4 h-4" />
          </div>
          <div>
            <h5 className="font-extrabold text-neutral-900 uppercase text-xs tracking-tight flex items-center gap-2">
              Follow-up Задачи по клиенту
              <span className="bg-neutral-900 text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                {pendingTasks.length} активных
              </span>
            </h5>
            <p className="text-[10px] text-stone-500 font-medium">Запланируйте звонок, показ или подготовку документов</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm w-fit"
        >
          {showAddForm ? <ChevronUp className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{showAddForm ? 'Скрыть форму' : '+ Поручение / Задача'}</span>
        </button>
      </div>

      {/* Preset Action Templates Bar */}
      <div className="space-y-1.5">
        <span className="text-[9px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-500" /> Быстрое назначение стандартных действий:
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleApplyPreset('call')}
            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200/60 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <Phone className="w-3 h-3 text-indigo-600" /> 📞 Звонок
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('showing')}
            className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/60 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <Home className="w-3 h-3 text-purple-600" /> 🏠 Показ
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('selection')}
            className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200/60 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <Send className="w-3 h-3 text-sky-600" /> 📩 Подборка
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('documents')}
            className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/60 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <FileText className="w-3 h-3 text-purple-600" /> 📑 Документы
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('meeting')}
            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/60 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <Users className="w-3 h-3 text-emerald-600" /> 🤝 Встреча
          </button>
        </div>
      </div>

      {/* Task Creation Form Panel */}
      {showAddForm && (
        <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl space-y-3 animate-fade-in shadow-inner">
          <div className="space-y-1">
            <label className="text-[9px] font-extrabold uppercase text-stone-500 tracking-wider block">
              Суть follow-up задачи
            </label>
            <input
              type="text"
              placeholder="Напр.: Перезвонить узнать решение по ипотеке и просмотру на Городецкой"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-stone-250 rounded-lg px-3 py-2 text-xs text-neutral-900 font-semibold focus:ring-2 focus:ring-purple-500/20 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-extrabold uppercase text-stone-500 tracking-wider block">
                Срок выполнения (Дедлайн)
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 font-medium focus:ring-2 focus:ring-purple-500/20 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-extrabold uppercase text-stone-500 tracking-wider block">
                Тип действия
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as any)}
                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 font-semibold focus:ring-2 focus:ring-purple-500/20 outline-none"
              >
                <option value="call">📞 Звонок</option>
                <option value="showing">🏠 Показ объекта</option>
                <option value="selection">📩 Подборка вариантов</option>
                <option value="documents">📑 Документы</option>
                <option value="meeting">🤝 Встреча в офисе</option>
                <option value="other">⚙️ Другое действие</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-extrabold uppercase text-stone-500 tracking-wider block">
                Приоритет
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-white border border-stone-250 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 font-bold focus:ring-2 focus:ring-purple-500/20 outline-none"
              >
                <option value="high">🔥 СРОЧНО (Высокий)</option>
                <option value="medium">⚡ Средний</option>
                <option value="low">🌱 Низкий</option>
              </select>
            </div>
          </div>

          <div className="pt-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-stone-500 hover:text-stone-800 text-[10px] font-bold uppercase"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleCreateTask}
              className="bg-purple-500 hover:bg-purple-600 text-neutral-950 font-black text-[10px] uppercase tracking-wider px-4 py-1.5 rounded-lg transition-all shadow-md cursor-pointer"
            >
              + Создать задачу
            </button>
          </div>
        </div>
      )}

      {/* Task List Display */}
      <div className="space-y-2">
        {leadTasks.length === 0 ? (
          <div className="bg-stone-50 border border-dashed border-stone-200 rounded-xl p-4 text-center space-y-1.5">
            <Clock className="w-5 h-5 text-stone-300 mx-auto" />
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Нет запланированных задач по клиенту {lead.name}
            </p>
            <p className="text-[10px] text-stone-400">
              Нажмите кнопку выше или выберите быстрый пресет, чтобы не упустить контакт.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {leadTasks
              .sort((a, b) => {
                if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
                return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
              })
              .map((task) => {
                const isCompleted = task.status === 'completed';
                const isOverdue = !isCompleted && new Date(task.deadline) < new Date();

                return (
                  <div
                    key={task.id}
                    className={`border rounded-xl p-3 transition-all flex items-start justify-between gap-3 ${
                      isCompleted 
                        ? 'bg-stone-50/70 border-stone-200 opacity-60' 
                        : isOverdue 
                        ? 'bg-rose-50/50 border-rose-200/80 shadow-sm' 
                        : 'bg-white border-stone-200 shadow-sm hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleTaskStatus(task)}
                        className={`w-5 h-5 rounded-lg border-2 shrink-0 transition-colors flex items-center justify-center mt-0.5 cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-white border-stone-300 hover:border-purple-500'
                        }`}
                        title={isCompleted ? 'Отметить невыполненной' : 'Отметить выполненной'}
                      >
                        {isCompleted && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="p-1 bg-stone-100 rounded-md shrink-0">
                            {getActionIcon(task.actionType)}
                          </span>

                          <h6 className={`font-bold text-xs ${isCompleted ? 'line-through text-stone-400' : 'text-neutral-900'}`}>
                            {task.title}
                          </h6>

                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                            task.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                            task.priority === 'medium' ? 'bg-purple-100 text-purple-800' : 'bg-stone-100 text-stone-600'
                          }`}>
                            {task.priority === 'high' ? '🔥 Срочно' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[10px] text-stone-500 flex-wrap">
                          <span className={`flex items-center gap-1 font-mono font-bold ${isOverdue ? 'text-rose-600 font-black' : 'text-stone-500'}`}>
                            <Calendar className="w-3 h-3 text-stone-400" />
                            {isOverdue && '🔥 ПРОСРОЧЕНО: '}
                            {new Date(task.deadline).toLocaleDateString('ru-RU')} {new Date(task.deadline).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-stone-300 hover:text-rose-600 p-1 rounded transition-colors shrink-0 cursor-pointer"
                      title="Удалить задачу"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Completed Summary Footer */}
      {completedTasks.length > 0 && (
        <div className="pt-2 border-t border-stone-150 flex items-center justify-between text-[10px] text-stone-400 font-medium">
          <span>Выполнено задач по клиенту: {completedTasks.length}</span>
          <span className="text-emerald-600 font-bold flex items-center gap-1">
            <Check className="w-3 h-3" /> Успешный контроль контакта
          </span>
        </div>
      )}
    </div>
  );
}
