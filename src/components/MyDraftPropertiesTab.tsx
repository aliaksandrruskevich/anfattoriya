"use client";
import React, { useState } from 'react';
import { 
  Building, Search, Filter, Plus, Globe, 
  Trash2, Edit3, ChevronRight, Lock, Clock, AlertCircle, 
  CheckCircle2, Sparkles, MapPin, DollarSign, ArrowRight
} from 'lucide-react';
import { Property, Agent } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface MyDraftPropertiesTabProps {
  properties: Property[];
  onDelete: (id: string) => void;
  onEdit: (prop: Property) => void;
  onCreateManual?: () => void;
  onPublish: (id: string) => void;
  onGenerateRequest: (prop: Property) => void;
  onOpenImporter: () => void;
  loggedInAgent: Agent | null;
}

export default function MyDraftPropertiesTab({ 
  properties, 
  onDelete, 
  onEdit, 
  onCreateManual,
  onPublish, 
  onGenerateRequest,
  onOpenImporter,
  loggedInAgent 
}: MyDraftPropertiesTabProps) {
  const [filter, setFilter] = useState<'all' | 'no_contract' | 'signed' | 'published'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const isAdminUser = Boolean(
    loggedInAgent && (
      loggedInAgent.id === 'admin' ||
      loggedInAgent.isAdmin === true ||
      loggedInAgent.role?.toLowerCase().includes('администратор') ||
      loggedInAgent.role?.toLowerCase().includes('директор')
    )
  );
  const ownPropertiesCount = properties.filter(p => p.assignedAgentId === loggedInAgent?.id).length;
  const [scopeMode, setScopeMode] = useState<'mine' | 'all'>(() =>
    isAdminUser && ownPropertiesCount === 0 ? 'all' : 'mine'
  );

  const myProperties = (isAdminUser && scopeMode === 'all')
    ? properties
    : properties.filter(p => p.assignedAgentId === loggedInAgent?.id);

  const filteredProperties = myProperties.filter(p => {
    const matchesSearch = (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.address || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'no_contract') return matchesSearch && p.contractStatus !== 'signed' && !p.isPublished;
    if (filter === 'signed') return matchesSearch && p.contractStatus === 'signed' && !p.isPublished;
    if (filter === 'published') return matchesSearch && p.isPublished;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tight flex items-center gap-3">
            📦 Мои объекты <span className="text-stone-400 font-medium">/ Черновики CRM</span>
          </h2>
          <p className="text-sm font-medium text-stone-500 mt-1">Здесь хранятся черновики, объекты в работе и те, что ещё не опубликованы на сайте.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5">
          {isAdminUser && (
            <div className="inline-flex p-1 bg-stone-100 border border-stone-200 rounded-xl">
              <button
                type="button"
                onClick={() => setScopeMode('mine')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                  scopeMode === 'mine' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Мои ({ownPropertiesCount})
              </button>
              <button
                type="button"
                onClick={() => setScopeMode('all')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                  scopeMode === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Все ({properties.length})
              </button>
            </div>
          )}
          <button 
            type="button"
            onClick={onOpenImporter}
            className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-stone-800 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            Распознать с Realt.by
          </button>
          <button
            type="button"
            onClick={() => onCreateManual?.()}
            className="px-4 py-2.5 bg-[#8B5CF6] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#7C3AED] transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Добавить вручную
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-2 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input 
            type="text" 
            placeholder="Поиск по адресу или названию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-stone-50 border-transparent focus:bg-white focus:border-stone-200 rounded-xl text-sm font-medium outline-none transition-all"
          />
        </div>
        
        <div className="flex p-1 bg-stone-100 rounded-xl overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Все', count: myProperties.length },
            { id: 'no_contract', label: 'Без договора', count: myProperties.filter(p => p.contractStatus !== 'signed' && !p.isPublished).length },
            { id: 'signed', label: 'Подписан договор', count: myProperties.filter(p => p.contractStatus === 'signed' && !p.isPublished).length },
            { id: 'published', label: 'Опубликовано', count: myProperties.filter(p => p.isPublished).length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                filter === tab.id 
                  ? 'bg-white text-stone-900 shadow-sm' 
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] tabular-nums ${filter === tab.id ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-600'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredProperties.map((prop) => (
            <motion.div
              layout
              key={prop.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden group hover:shadow-lg hover:border-purple-200 transition-all"
            >
              <div className="relative aspect-video overflow-hidden bg-stone-100">
                <img 
                  src={prop.photo || prop.image || '/photo/hero-apartment.jpg'} 
                  alt={prop.title} 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/photo/hero-apartment.jpg';
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                
                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {prop.isPublished ? (
                    <span className="px-2.5 py-1.5 bg-emerald-500/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 shadow-lg">
                      <Globe className="w-3 h-3" /> Опубликован
                    </span>
                  ) : (
                    <span className="px-2.5 py-1.5 bg-stone-900/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 shadow-lg">
                      <Lock className="w-3 h-3" /> Черновик CRM
                    </span>
                  )}
                  
                  {prop.contractStatus !== 'signed' && !prop.isPublished && (
                    <span className="px-2.5 py-1.5 bg-amber-500/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 shadow-lg">
                      <AlertCircle className="w-3 h-3" /> Договор не подписан
                    </span>
                  )}
                  {prop.contractStatus === 'signed' && (
                    <span className="px-2.5 py-1.5 bg-blue-500/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 shadow-lg">
                      <CheckCircle2 className="w-3 h-3" /> Договор подписан
                    </span>
                  )}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/75 via-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  {confirmDeleteId === prop.id ? (
                    <div className="flex items-center gap-2 w-full bg-white/95 backdrop-blur-md p-2 rounded-xl">
                      <span className="text-[10px] font-bold text-rose-700 flex-1 pl-1">Удалить объект?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(prop.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Да
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1 bg-stone-200 text-stone-700 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Нет
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 w-full">
                      <button 
                        type="button"
                        onClick={() => onEdit(prop)}
                        className="flex-1 py-2 bg-white/90 text-stone-900 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white transition-all cursor-pointer"
                      >
                        Редактировать
                      </button>
                      <button 
                        type="button"
                        onClick={() => setConfirmDeleteId(prop.id)}
                        className="p-2 bg-rose-600/90 text-white rounded-lg hover:bg-rose-600 transition-all cursor-pointer"
                        title="Удалить объект"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 pr-4">
                    <h3 className="text-sm font-black text-stone-900 line-clamp-1 mb-1">{prop.title}</h3>
                    <div className="flex items-center gap-1.5 text-stone-500">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium truncate">{prop.address}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-stone-900">${prop.priceUSD?.toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-stone-400">{prop.priceBYN?.toLocaleString()} р.</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  {prop.rooms && <span className="px-2 py-1 bg-stone-50 rounded text-[10px] font-bold text-stone-600">{prop.rooms} комн.</span>}
                  {prop.area && <span className="px-2 py-1 bg-stone-50 rounded text-[10px] font-bold text-stone-600">{prop.area} м²</span>}
                  {prop.floor && <span className="px-2 py-1 bg-stone-50 rounded text-[10px] font-bold text-stone-600">{prop.floor}/{prop.totalFloors} эт.</span>}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-50">
                  <button 
                    onClick={() => onGenerateRequest(prop)}
                    className="col-span-2 py-3 mb-2 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-purple-100"
                  >
                    <Building className="w-4 h-4" />
                    ⚖️ Сформировать запрос
                  </button>

                  {prop.contractStatus !== 'signed' ? (
                    <div className="col-span-2 py-3 bg-stone-50 text-stone-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-stone-100 cursor-default">
                      Договор оформляется в офисе
                    </div>
                  ) : (
                    <>
                      {!prop.isPublished ? (
                        <button 
                          onClick={() => onPublish(prop.id)}
                          className="col-span-2 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700"
                        >
                          <ArrowRight className="w-4 h-4" />
                          🚀 Разместить на сайте
                        </button>
                      ) : (
                        <button 
                          onClick={() => onPublish(prop.id)}
                          className="col-span-2 py-3 bg-stone-100 text-stone-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                          Снять с публикации
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredProperties.length === 0 && (
          <div className="col-span-full py-20 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 rounded-full bg-stone-200/50 flex items-center justify-center mb-6">
              <Building className="w-10 h-10 text-stone-400" />
            </div>
            <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight mb-2">Объекты не найдены</h3>
            <p className="text-sm font-medium text-stone-500 max-w-sm mb-8 italic">У вас пока нет объектов в этом разделе или они не соответствуют критериям поиска.</p>
            <button 
              onClick={onOpenImporter}
              className="px-8 py-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-stone-800 transition-all shadow-xl shadow-stone-200 flex items-center gap-3"
            >
              <Sparkles className="w-5 h-5 text-purple-400" />
              Распознать первый объект
            </button>
          </div>
        )}
      </div>
    </div>
  );
}