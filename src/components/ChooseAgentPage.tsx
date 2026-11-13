"use client";
import React, { useState } from 'react';
import { PageId, Agent } from '../types';
import { Phone, Search, Clock, TrendingUp, Shield, X, Mail, Star, Award, MapPin, Building } from 'lucide-react';
import { AgentBrandAvatar } from './AgentBrandAvatar';

interface ChooseAgentPageProps {
  activePage: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
  agentsList: Agent[];
  onViewProfile?: (agent: Agent) => void;
}

const brass = '#8B5CF6';
const brassLight = '#DDD6FE';
const displayFont = "'Cormorant Garamond', 'Raleway', serif";

export default function ChooseAgentPage({ navigateTo, handleAddLead, agentsList, onViewProfile }: ChooseAgentPageProps) {
  const [filter, setFilter] = useState<'all' | 'sale' | 'rent' | 'assessment'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const approvedAgents = agentsList.filter(a => a.isApproved !== false && a.id !== 'admin' && !a.isDismissed && a.status !== 'dismissed');

  const filteredAgents = approvedAgents.filter(agent => {
    const matchesFilter = filter === 'all' || agent.specialization === filter || agent.specialization === 'all';
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (agent.role || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statsBySpec = {
    sale: approvedAgents.filter(a => a.specialization === 'sale' || a.specialization === 'all').length,
    rent: approvedAgents.filter(a => a.specialization === 'rent' || a.specialization === 'all').length,
    assessment: approvedAgents.filter(a => a.specialization === 'assessment' || a.specialization === 'all').length,
  };

  // Функция получения инициалов
  const getInitials = (name: string) => {
    if (!name) return 'Р';
    return name.split(' ').map(w => w[0]).slice(0, 2).join('');
  };

  return (
    <div className="font-sans text-neutral-900">
      
      {/* ГЕРОЙ-БАННЕР */}
      <div className="relative min-h-[70vh] flex items-center overflow-hidden"
        style={{ backgroundImage: `url('/photo/repina.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/20"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-10"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px z-10" style={{ background: `linear-gradient(90deg, transparent, ${brass}66, transparent)` }} />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-20">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-px" style={{ backgroundColor: brass }} />
              <span className="text-[12px] font-semibold uppercase tracking-[0.3em]" style={{ color: brassLight }}>
                Наша команда
              </span>
            </div>
            <h1 className="text-white leading-[1.05]" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(34px, 6vw, 60px)' }}>
              Аттестованные<br />специалисты
            </h1>
            <p className="text-white/70 mt-5 max-w-xl" style={{ fontWeight: 300, fontSize: 'clamp(16px, 2vw, 21px)', lineHeight: 1.5 }}>
              Выберите личного эксперта для проведения сделки. Каждый риэлтер имеет действующий аттестат Министерства юстиции РБ.
            </p>

            <div className="flex flex-wrap gap-x-10 gap-y-6 mt-12">
              {[
                { value: `${approvedAgents.length}`, label: 'специалистов' },
                { value: '100%', label: 'аттестованы' },
                { value: 'Минюст РБ', label: 'лицензирование' },
              ].map((item, i) => (
                <div key={i} className="flex items-baseline gap-2">
                  <div className="text-3xl" style={{ fontFamily: displayFont, fontWeight: 400, color: 'white' }}>{item.value}</div>
                  <div className="text-[11px] text-white/45 uppercase tracking-wider">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ФИЛЬТРЫ И ПОИСК */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-30">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {([
                { key: 'all', label: 'Все эксперты', count: approvedAgents.length },
                { key: 'sale', label: 'Продажа', count: statsBySpec.sale },
                { key: 'rent', label: 'Аренда', count: statsBySpec.rent },
                { key: 'assessment', label: 'Оценка', count: statsBySpec.assessment },
              ] as const).map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    filter === f.key ? 'bg-neutral-950 text-white' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}>
                  {f.label} <span className="ml-1 opacity-50">({f.count})</span>
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input type="text" placeholder="Поиск по имени..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* КАРТОЧКИ АГЕНТОВ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAgents.map((agent) => (
            <div key={agent.id} 
              onClick={() => onViewProfile?.(agent)}
              className="bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group cursor-pointer border border-stone-200 hover:border-purple-400">
              
              <div className="relative h-72 bg-stone-900 overflow-hidden">
                <AgentBrandAvatar
                  photo={agent.photo}
                  name={agent.name}
                  size="full"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  showBadge={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute top-3 right-3 bg-purple-500 text-neutral-950 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 z-10 shadow-sm">
                  <Star className="w-3 h-3 fill-current" /> {agent.rating || '5.0'}
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 group-hover:text-purple-700 transition-colors">{agent.name}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">{agent.role || 'Риэлтер'}</p>
                  {agent.email && (
                    <p className="text-[11px] text-purple-800 font-mono mt-0.5 truncate">{agent.email}</p>
                  )}
                </div>
                
                <div className="flex flex-col gap-1 text-xs text-stone-500 pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 font-semibold text-emerald-700">
                      <Shield className="w-3.5 h-3.5 text-emerald-600" /> Минюст РБ
                    </span>
                    <span className="text-[10px] font-bold text-purple-800 bg-purple-100/80 px-2 py-0.5 rounded-full">
                      Аттестован
                    </span>
                  </div>
                  {agent.certNo && (
                    <div className="text-[11px] text-stone-600 font-medium">
                      Свид. № {agent.certNo} {agent.certDate ? `(до ${agent.certDate})` : ''}
                    </div>
                  )}
                  {agent.cardNo && (
                    <div className="text-[10px] text-purple-900/80 font-mono">
                      Карта: {agent.cardNo}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button onClick={(e) => { e.stopPropagation(); onViewProfile?.(agent); }}
                    className="flex-1 py-2.5 bg-stone-50 hover:bg-stone-100 text-neutral-900 text-xs font-bold rounded-xl transition-all">
                    Профиль
                  </button>
                  <a href={`tel:${(agent.phone || '').replace(/[^\d+]/g, '')}`} onClick={(e) => e.stopPropagation()}
                    className="flex-1 py-2.5 bg-neutral-900 hover:bg-purple-500 hover:text-neutral-950 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1">
                    <Phone className="w-3 h-3" /> Позвонить
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-16 text-stone-400">
            <p className="text-sm">Специалистов по заданным критериям не найдено</p>
            <button onClick={() => { setFilter('all'); setSearchQuery(''); }} className="text-purple-600 text-xs font-bold hover:underline mt-2">Сбросить фильтры</button>
          </div>
        )}
      </div>

      {/* КАК МЫ ОТБИРАЕМ */}
      <div className="bg-stone-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h3 className="text-center mb-10" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(24px, 3.5vw, 34px)' }}>
            Как мы отбираем риэлтеров
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Shield className="w-6 h-6" />, title: 'Аттестация Минюста', desc: 'Каждый специалист имеет действующий аттестат. Никаких случайных людей.' },
              { icon: <TrendingUp className="w-6 h-6" />, title: 'Узкая специализация', desc: 'Продажа, аренда или оценка — Риэлтер работает в своём направлении.' },
              { icon: <Star className="w-6 h-6" />, title: 'Регулярное обучение', desc: 'Ежегодные курсы и семинары по изменениям в законодательстве.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center space-y-3 shadow-xs">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">{item.icon}</div>
                <h4 className="text-sm font-bold text-neutral-900">{item.title}</h4>
                <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
