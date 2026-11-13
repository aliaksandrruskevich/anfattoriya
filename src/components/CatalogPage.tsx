"use client";
import React, { useEffect, useRef, useState } from 'react';
import { PageId, Property, Agent } from '../types';
import PropertyCatalog from './PropertyCatalog';
import {
  Shield, Sparkles, Key,
  ScanSearch, FileCheck2, Megaphone
} from 'lucide-react';
import FAQAccordion from './FAQAccordion';

interface CatalogPageProps {
  activePage: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, comment: string, source: string) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  comparisonIds?: string[];
  toggleComparison?: (id: string) => void;
  properties: Property[];
  selectedProperty?: Property | null;
  onSelectProperty?: (property: Property | null) => void;
  onViewProfile?: (agent: Agent) => void;
  agentsList?: Agent[];
}

const brass = '#8B5CF6';
const brassLight = '#DDD6FE';
const displayFont = "'Cormorant Garamond', 'Raleway', serif";

function useFonts() {
  useEffect(() => {
    if (document.getElementById('hp-fonts')) return;
    const link = document.createElement('link');
    link.id = 'hp-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Raleway:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 150 + delay);
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return () => clearTimeout(timer);
    }
    const io = new IntersectionObserver(
      ([entry]) => { 
        if (entry.isIntersecting) { 
          setVisible(true); 
          io.disconnect(); 
        } 
      },
      { threshold: 0.01, rootMargin: '50px' }
    );
    io.observe(el);
    return () => {
      clearTimeout(timer);
      io.disconnect();
    };
  }, [delay]);
  
  return (
    <div ref={ref} className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.6s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.6s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}>
      {children}
    </div>
  );
}

export default function CatalogPage({
  navigateTo, 
  handleAddLead, 
  favorites = [], 
  toggleFavorite,
  comparisonIds = [], 
  toggleComparison, 
  properties = [],
  selectedProperty,
  onSelectProperty,
  onViewProfile,
  agentsList
}: CatalogPageProps) {
  useFonts();

  // ✅ Безопасное получение длины
  const totalListings = properties?.length || 0;

  const vettingSteps = [
    { icon: <ScanSearch className="w-4 h-4" />, title: 'Заявка собственника', desc: 'Объект поступает от собственника напрямую.' },
    { icon: <FileCheck2 className="w-4 h-4" />, title: 'Юридическая проверка', desc: 'Изучаем документы и историю объекта.' },
    { icon: <Megaphone className="w-4 h-4" />, title: 'Публикация в каталоге', desc: 'После проверки объект появляется на сайте.' },
  ];

  const catalogFaqItems = [
    { question: "Как часто обновляется каталог?", answer: "База синхронизируется с Realt.by в реальном времени." },
    { question: "Проверяются ли объекты?", answer: "Да, каждый объект проходит юридическую экспертизу." },
    { question: "Можно посмотреть несколько объектов за день?", answer: "Да, риэлтер составит маршрут на 3–5 объектов." },
    { question: "Как зафиксировать цену?", answer: "Предварительный договор и задаток в офисе агентства." }
  ];

  const handleBannerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value || '';
    const phone = (form.querySelector('[name="phone"]') as HTMLInputElement)?.value || '';
    
    if (phone) { 
      handleAddLead(name, phone, 'Подбор из каталога', 'Баннер каталога'); 
      form.reset(); 
    }
  };

  return (
    <div className="space-y-12 animate-fade-in pb-16 font-sans text-neutral-900">

      {/* ГЕРОЙ-БАННЕР */}
      <div
        className="relative min-h-[86vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url('/photo/repina.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/20"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-10"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px z-10" style={{ background: `linear-gradient(90deg, transparent, ${brass}66, transparent)` }} />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-20">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-px" style={{ backgroundColor: brass }} />
              <span className="text-[12px] font-semibold uppercase tracking-[0.3em]" style={{ color: brassLight }}>
                Каталог недвижимости Минска
              </span>
            </div>
            
            <h1 className="text-white leading-[1.05]" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(34px, 6vw, 60px)' }}>
              {totalListings}+ проверенных<br />объектов в базе
            </h1>
            
            <p className="text-white/70 mt-5 max-w-xl" style={{ fontWeight: 300, fontSize: 'clamp(16px, 2vw, 21px)', lineHeight: 1.5 }}>
              Квартиры, коттеджи и коммерческие площади. Прямые договоры с собственниками, прозрачные цены и юридическая гарантия.
            </p>

            <form onSubmit={handleBannerSubmit} className="mt-9 flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full max-w-2xl">
              <input 
                name="name" 
                type="text" 
                placeholder="Ваше имя" 
                className="flex-1 px-4 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 rounded-lg text-sm transition-all" 
              />
              <input 
                name="phone" 
                type="tel" 
                placeholder="Номер телефона *" 
                required
                className="flex-1 px-4 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 rounded-lg text-sm transition-all" 
              />
              <button 
                type="submit"
                className="flex-none px-8 py-3.5 text-black font-semibold rounded-lg text-sm transition-all whitespace-nowrap shadow-[0_8px_30px_rgba(139, 92, 246,0.35)] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(139, 92, 246,0.5)]"
                style={{ backgroundColor: brass, fontFamily: 'Raleway, sans-serif' }}
              >
                Подобрать объект
              </button>
            </form>

            <div className="flex flex-wrap gap-x-10 gap-y-6 mt-12">
              {[
                { value: `${totalListings}`, label: 'объектов в базе' },
                { value: '100%', label: 'проверенных' },
                { value: '24ч', label: 'подбор под ключ' },
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

      {/* КАТАЛОГ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PropertyCatalog
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          comparisonIds={comparisonIds}
          toggleComparison={toggleComparison}
          properties={properties}
          onAddLead={handleAddLead}
          currency="BYN"
          selectedProperty={selectedProperty}
          onSelectProperty={onSelectProperty}
          onViewProfile={onViewProfile}
          agents={agentsList}
        />
      </div>

      {/* КАК ОТБИРАЕМ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="space-y-6">
          <h3 className="text-neutral-900 text-center" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(24px, 3.5vw, 34px)' }}>
            Как объекты попадают в каталог
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vettingSteps.map((step, i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-stone-100 text-purple-800 border border-stone-200 font-mono">
                    0{i + 1}
                  </span>
                  <span className="text-purple-700">{step.icon}</span>
                </div>
                <h5 className="text-sm font-bold text-neutral-900">{step.title}</h5>
                <p className="text-xs text-stone-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* ПРЕИМУЩЕСТВА */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: <Shield className="w-5 h-5" />, title: 'Проверенные собственники', desc: 'Документы изучены юристами агентства.' },
              { icon: <Sparkles className="w-5 h-5" />, title: 'Прямые договоры', desc: 'Никаких скрытых платежей. Официальные расценки.' },
              { icon: <Key className="w-5 h-5" />, title: 'Удобные показы', desc: 'Организуем просмотры в удобное время.' }
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200/50">
                  {item.icon}
                </div>
                <h4 className="font-bold text-sm text-neutral-900">{item.title}</h4>
                <p className="text-xs text-stone-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* FAQ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <FAQAccordion 
            title="Вопросы по каталогу" 
            subtitle="Ответы на частые вопросы"
            items={catalogFaqItems} 
            className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200" 
          />
        </Reveal>
      </div>

    </div>
  );
}