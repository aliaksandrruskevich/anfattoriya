"use client";
import React, { useState } from 'react';
import { Search, Phone, ShieldCheck, Award, MessageSquare, ArrowRight, Star } from 'lucide-react';
import { PageId, Agent } from '../types';
import { brass, brassLight, paper, displayFont, useFonts, Reveal, CornerFrame, Eyebrow } from './DesignSystem';
import { AgentBrandAvatar } from './AgentBrandAvatar';
import { isRealtorAgent } from '@/lib/agentUtils';

interface OurTeamPageProps {
  activePage?: PageId;
  navigateTo?: (pageId: PageId) => void;
  handleAddLead?: (name: string, phone: string, extra: string, source: string) => void;
  agentsList?: Agent[];
  onViewProfile?: (agent: Agent) => void;
}

export default function OurTeamPage({
  activePage = 'nasha-komanda',
  navigateTo = () => {},
  handleAddLead = () => {},
  agentsList = [],
  onViewProfile = () => {},
}: OurTeamPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'sale' | 'rent' | 'assessment'>('all');
  const [heroSent, setHeroSent] = useState(false);
  useFonts();

  const handleHeroSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value || '';
    const phone = (form.querySelector('[name="phone"]') as HTMLInputElement)?.value || '';
    const task = (form.querySelector('[name="task"]') as HTMLSelectElement)?.value || '';
    if (phone) {
      handleAddLead(name, phone, `Задача: ${task || 'Консультация с риэлтером'}`, 'Наша команда: баннер');
      form.reset();
      setHeroSent(true);
      setTimeout(() => setHeroSent(false), 5000);
    }
  };

  // Источник данных — agentsList (props). Если пусто, показываем пустой список.
  // Хардкод из src/data.ts больше не используется.
  const sourcePool: Agent[] = Array.isArray(agentsList) ? agentsList : [];

  const approvedAgents: Agent[] = sourcePool.filter(isRealtorAgent);

  const filteredAgents: Agent[] = approvedAgents.filter((agent: Agent) => {
    const matchesFilter =
      activeFilter === 'all' ||
      agent.specialization === activeFilter ||
      agent.specialization === 'all';
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.role || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filterTabs = [
    { id: 'all', label: 'Все риэлтеры' },
    { id: 'sale', label: 'Продажа' },
    { id: 'rent', label: 'Аренда' },
    { id: 'assessment', label: 'Оценка и консалтинг' },
  ];

  return (
    <div className="animate-fade-in" style={{ fontFamily: 'Raleway, sans-serif' }}>
      {/* ================= HERO ================= */}
      <div
        className="relative min-h-[85vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url('/photo/hero-teamwork.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/90" />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-28">
          <div className="max-w-3xl">
            <Eyebrow dark>Команда экспертов «АН Фаттория»</Eyebrow>
            <h1
              className="text-white leading-[1.1] mb-6"
              style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(36px, 6vw, 62px)' }}
            >
              Аттестованные <span style={{ color: brassLight, fontStyle: 'italic' }}>риэлтеры Минска</span>
            </h1>
            <p className="text-white/80 leading-relaxed mb-8 max-w-xl text-[16px] lg:text-[18px]">
              Профессиональная команда аттестованных специалистов. Сопровождение сделок любой сложности с
              официальной гарантией.
            </p>

            {/* Quick Hero Form */}
            <form
              onSubmit={handleHeroSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl"
            >
              <input
                name="name"
                type="text"
                placeholder="Ваше имя"
                className="px-4 py-3.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/60 text-sm"
              />
              <input
                name="phone"
                type="tel"
                placeholder="Номер телефона *"
                required
                className="px-4 py-3.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/60 text-sm"
              />
              <select
                name="task"
                className="px-4 py-3.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-white/60"
              >
                <option value="Продажа квартиры" className="text-stone-900">
                  Продажа недвижимости
                </option>
                <option value="Покупка квартиры" className="text-stone-900">
                  Покупка недвижимости
                </option>
                <option value="Аренда" className="text-stone-900">
                  Аренда
                </option>
                <option value="Оценка объекта" className="text-stone-900">
                  Оценка объекта
                </option>
              </select>
              <button
                type="submit"
                className="px-6 py-3.5 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-all hover:brightness-105 hover:-translate-y-0.5 shadow-[0_6px_20px_rgba(139,92,246,0.4)] whitespace-nowrap cursor-pointer"
                style={{ backgroundColor: brass }}
              >
                Подобрать риэлтера
              </button>
            </form>
            {heroSent && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600/25 border border-purple-400/40 text-purple-100 text-xs font-medium">
                Спасибо! Мы подберём профильного риэлтера и свяжемся с вами в ближайшее время.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= FILTER & SEARCH BAR ================= */}
      <div className="bg-white border-b border-stone-200 py-8 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeFilter === tab.id
                      ? 'text-stone-950 shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                  style={activeFilter === tab.id ? { backgroundColor: brass } : {}}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Поиск риэлтера по имени..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-stone-100 border border-stone-200 text-sm focus:outline-none focus:border-stone-400 text-stone-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= AGENTS GRID ================= */}
      <div className="py-16 lg:py-24" style={{ backgroundColor: paper }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredAgents.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-stone-200">
              <p className="text-stone-500 text-base">Риэлтеров по выбранным критериям не найдено.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveFilter('all');
                }}
                className="mt-4 text-xs font-bold uppercase tracking-wider"
                style={{ color: brass }}
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
              {filteredAgents.map((agent) => (
                <Reveal key={agent.id}>
                  <div
                    onClick={() => onViewProfile(agent)}
                    className="group bg-white rounded-xl overflow-hidden border border-stone-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Photo or Official Brand Logo Badge */}
                      <div className="relative aspect-[4/4.5] overflow-hidden bg-stone-900 flex items-center justify-center">
                        <AgentBrandAvatar
                          photo={agent.photo}
                          name={agent.name}
                          size="full"
                          className="w-full h-full object-cover"
                          showBadge={false}
                        />
                        {/* Rating Pill */}
                        <div className="absolute top-3 right-3 bg-stone-950/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 border border-white/10 z-10">
                          <Star className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
                          <span>5.0</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-5">
                        <h3 className="text-neutral-900 font-semibold text-lg group-hover:text-purple-800 transition-colors">
                          {agent.name}
                        </h3>
                        <p className="text-stone-500 text-xs uppercase tracking-wider mt-1 mb-3 font-medium">
                          Риэлтер
                        </p>

                        <div className="space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-stone-400">Телефон:</span>
                            <a
                              href={`tel:${agent.phone || '+375 29 638-00-53'}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-mono font-bold text-purple-700 hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3 text-purple-600" />
                              {agent.phone || '+375 29 638-00-53'}
                            </a>
                          </div>
                          {agent.certNo && (
                            <div className="bg-purple-50/70 border border-purple-100 rounded-lg p-2.5 space-y-1 my-2">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-purple-900 font-bold">Свидетельство МЮ РБ:</span>
                                <span className="font-mono font-black text-purple-950">№ {agent.certNo}</span>
                              </div>
                              {agent.certDate && (
                                <div className="text-[10px] text-stone-500 flex justify-between">
                                  <span>Действительно:</span>
                                  <span className="font-semibold text-stone-700">до {agent.certDate}</span>
                                </div>
                              )}
                              {agent.cardNo && (
                                <div className="text-[10px] text-stone-500 flex justify-between pt-0.5 border-t border-purple-200/50">
                                  <span>Идент. карточка:</span>
                                  <span className="font-mono font-bold text-purple-900">{agent.cardNo}</span>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-stone-400">Аттестация:</span>
                            <span className="font-semibold text-emerald-700 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> Минюст РБ
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="p-6 pt-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewProfile(agent);
                        }}
                        className="w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-stone-200 group-hover:border-stone-900 group-hover:bg-stone-950 group-hover:text-white"
                      >
                        Связаться с риэлтером <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= GUARANTEE BAR ================= */}
      <div className="bg-white py-16 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div
                className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4"
                style={{ backgroundColor: `${brass}20`, color: brass }}
              >
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-neutral-900 font-semibold text-base mb-2">100% аттестованные риэлтеры</h4>
              <p className="text-stone-500 text-xs leading-relaxed">
                Все специалисты имеют свидетельства об аттестации Министерства юстиции РБ.
              </p>
            </div>

            <div className="p-6">
              <div
                className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4"
                style={{ backgroundColor: `${brass}20`, color: brass }}
              >
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-neutral-900 font-semibold text-base mb-2">Страхование ответственности</h4>
              <p className="text-stone-500 text-xs leading-relaxed">
                Гражданская ответственность компании застрахована в Белгосстрах.
              </p>
            </div>

            <div className="p-6">
              <div
                className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4"
                style={{ backgroundColor: `${brass}20`, color: brass }}
              >
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-neutral-900 font-semibold text-base mb-2">Персональное ведение сделки</h4>
              <p className="text-stone-500 text-xs leading-relaxed">
                Прямая связь с вашим риэлтером 7 дней в неделю без посредников.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}