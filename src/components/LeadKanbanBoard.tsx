"use client";
import React, { useState } from 'react';
import { Lead, LeadStage, KanbanColumn, Agent } from '../types';
import { 
  Plus, Clock, MessageSquare, Phone, User, 
  MoreVertical, Calendar, AlertCircle, CheckCircle2,
  ChevronRight, ArrowRight, Filter, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LeadKanbanBoardProps {
  leads: Lead[];
  agentsList: Agent[];
  onUpdateLeads: (leads: Lead[]) => void;
  loggedInAgent?: Agent | null;
}

const STAGES: { id: LeadStage; title: string; color: string }[] = [
  { id: 'new', title: 'Новые', color: 'bg-stone-100 border-stone-200 text-stone-600' },
  { id: 'contacted', title: 'Контакт', color: 'bg-blue-50 border-blue-100 text-blue-600' },
  { id: 'negotiation', title: 'Переговоры', color: 'bg-purple-50 border-purple-100 text-purple-600' },
  { id: 'deposit', title: 'Задаток', color: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
  { id: 'closed', title: 'Сделка', color: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
  { id: 'rejected', title: 'Отказ', color: 'bg-rose-50 border-rose-100 text-rose-600' },
];

export default function LeadKanbanBoard({ leads, agentsList, onUpdateLeads, loggedInAgent }: LeadKanbanBoardProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleMoveLead = (leadId: string, newStage: LeadStage) => {
    const updated = leads.map(l => {
      if (l.id === leadId) {
        const historyItem = {
          id: `hist-${Date.now()}`,
          date: new Date().toLocaleDateString('ru-RU'),
          text: `Этап изменен на: ${STAGES.find(s => s.id === newStage)?.title}`,
          author: loggedInAgent?.name || 'Система'
        };
        return { 
          ...l, 
          stage: newStage,
          history: [historyItem, ...(l.history || [])],
          lastContactedAt: new Date().toISOString()
        };
      }
      return l;
    });
    onUpdateLeads(updated);
  };

  const getInactiveDays = (lastContact?: string) => {
    if (!lastContact) return 999;
    const diff = Date.now() - new Date(lastContact).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 h-[calc(100vh-250px)] custom-scrollbar">
      {STAGES.map(stage => {
        const stageLeads = leads.filter(l => (l.stage || 'new') === stage.id);
        
        return (
          <div key={stage.id} className="flex flex-col w-72 shrink-0 bg-stone-50/50 rounded-2xl border border-stone-200">
            {/* Header */}
            <div className="p-3 border-b border-stone-200 flex items-center justify-between bg-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${stage.color.split(' ')[0].replace('bg-', 'bg-opacity-100 bg-')}`} />
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-500">
                  {stage.title}
                </span>
              </div>
              <span className="text-[10px] font-mono font-black text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                {stageLeads.length}
              </span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
              {stageLeads.map(lead => {
                const inactiveDays = getInactiveDays(lead.lastContactedAt);
                const isUrgent = inactiveDays >= 3;

                return (
                  <motion.div
                    layoutId={lead.id}
                    key={lead.id}
                    className="bg-white border border-stone-200 rounded-xl p-3 shadow-sm hover:border-purple-500 cursor-pointer transition-all group"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">{lead.name}</h4>
                      {isUrgent && (
                        <div className="animate-pulse" title="Не было контакта более 3 дней">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[10px] text-stone-500 font-medium flex items-center gap-1.5">
                        <Phone className="w-3 h-3" /> {lead.phone}
                      </p>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">
                        {lead.typeOrPrice}
                      </p>
                    </div>

                    {lead.nextContactDate && (
                      <div className="mt-3 p-1.5 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-blue-500" />
                        <span className="text-[9px] font-bold text-blue-700">
                          {lead.nextContactDate}
                        </span>
                      </div>
                    )}

                    <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-stone-100 rounded-full flex items-center justify-center">
                          <User className="w-2.5 h-2.5 text-stone-400" />
                        </div>
                        <span className="text-[9px] font-bold text-stone-400 truncate max-w-[80px]">
                          {lead.assignedAgentName || 'Не назначен'}
                        </span>
                      </div>
                      
                      <div className="flex gap-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="p-1 hover:bg-stone-100 rounded-md text-stone-400 hover:text-purple-600 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {stageLeads.length === 0 && (
                <div className="h-24 border-2 border-dashed border-stone-200 rounded-xl flex items-center justify-center">
                  <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Пусто</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-stone-200 overflow-hidden"
            >
              <div className="bg-stone-900 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center">
                      <User className="w-6 h-6 text-stone-900" />
                   </div>
                   <div>
                      <h3 className="text-lg font-black">{selectedLead.name}</h3>
                      <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">{selectedLead.phone}</p>
                   </div>
                </div>
                <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-white/10 rounded-xl text-stone-400 hover:text-white transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Stage Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Этап сделки</label>
                  <div className="grid grid-cols-3 gap-2">
                    {STAGES.map(s => (
                      <button
                        key={s.id}
                        onClick={() => handleMoveLead(selectedLead.id, s.id)}
                        className={`p-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border ${
                          (selectedLead.stage || 'new') === s.id 
                            ? 'bg-stone-900 text-white border-stone-900' 
                            : 'bg-stone-50 text-stone-400 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                      <span className="text-[10px] font-black text-stone-400 uppercase block mb-1">Источник</span>
                      <p className="text-xs font-bold text-stone-900">{selectedLead.source || 'Прямой заход'}</p>
                   </div>
                   <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                      <span className="text-[10px] font-black text-stone-400 uppercase block mb-1">Приоритет</span>
                      <p className="text-xs font-bold text-stone-900">{selectedLead.priority === 'urgent' ? '🔥 Срочно' : 'Обычный'}</p>
                   </div>
                </div>

                {/* History */}
                <div className="space-y-4">
                   <h5 className="text-[11px] font-black text-stone-900 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-500" /> История событий
                   </h5>
                   <div className="space-y-3">
                      {(selectedLead.history || []).map((h, i) => (
                        <div key={i} className="flex gap-3">
                           <div className="w-px bg-stone-200 relative">
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-500" />
                           </div>
                           <div className="pb-4">
                              <p className="text-[10px] text-stone-400 font-bold mb-1">{h.date} • {h.author}</p>
                              <p className="text-xs text-stone-800 font-medium">{h.text}</p>
                           </div>
                        </div>
                      ))}
                      {(!selectedLead.history || selectedLead.history.length === 0) && (
                        <p className="text-xs text-stone-400 italic">История пуста</p>
                      )}
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}