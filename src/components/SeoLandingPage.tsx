'use client';

import React from 'react';
import { Property } from '@/types';
import { ArrowRight, MapPin, Maximize2, Building2 } from 'lucide-react';

interface SeoLandingPageProps {
  title: string;
  description: string;
  properties: Property[];
  filterLabel: string;
  onSelectProperty: (p: Property) => void;
  navigateTo: (path: string) => void;
}

const brass = '#8B5CF6';
const brassLight = '#DDD6FE';
const paper = '#F6F3EC';
const displayFont = "'Cormorant Garamond', 'Raleway', serif";
const bodyFont = "'Raleway', system-ui, sans-serif";
const dashed = `1px dashed ${brass}44`;

export default function SeoLandingPage({
  title,
  description,
  properties,
  filterLabel,
  onSelectProperty,
  navigateTo,
}: SeoLandingPageProps) {
  return (
    <div style={{ fontFamily: bodyFont, backgroundColor: paper }} className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-stone-500">
          <button onClick={() => navigateTo('/')} className="hover:text-[#8B5CF6] transition-colors">
            Главная
          </button>
          <span className="text-stone-300">/</span>
          <button onClick={() => navigateTo('/catalog')} className="hover:text-[#8B5CF6] transition-colors">
            Каталог
          </button>
          <span className="text-stone-300">/</span>
          <span className="text-stone-900 font-semibold">{filterLabel}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-10 h-px" style={{ backgroundColor: brass }} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: brass }}>
            {filterLabel}
          </span>
        </div>

        <h1
          className="text-neutral-900 leading-[1.1] mb-6"
          style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(32px, 5vw, 56px)' }}
        >
          {title}
        </h1>

        <p
          className="text-stone-600 max-w-3xl leading-relaxed mb-8"
          style={{ fontWeight: 300, fontSize: 'clamp(15px, 1.8vw, 19px)' }}
        >
          {description}
        </p>

        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/60 backdrop-blur" style={{ border: dashed }}>
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: brass }}>
            Найдено объектов
          </span>
          <span className="text-2xl font-bold text-neutral-900" style={{ fontFamily: displayFont }}>
            {properties.length}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {properties.length === 0 ? (
          <div className="bg-white/60 backdrop-blur p-12 text-center" style={{ border: dashed }}>
            <p className="text-stone-600 mb-2">Пока нет объектов по этому фильтру.</p>
            <p className="text-sm text-stone-400 mb-6">Оставьте заявку — подберём вручную под ваш запрос.</p>
            <button
              onClick={() => navigateTo('/kontakty')}
              className="inline-flex items-center gap-2 px-6 py-3 text-white text-[13px] font-semibold uppercase tracking-wider transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: '#1a1a1a' }}
            >
              Оставить заявку
              <ArrowRight className="w-3.5 h-3.5" style={{ color: brassLight }} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <article
                key={p.id}
                onClick={() => onSelectProperty(p)}
                className="group bg-white cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                style={{ border: dashed }}
              >
                <div className="aspect-[4/3] bg-stone-100 overflow-hidden relative">
                  <img
                    src={p.photo || '/photo/999.jpg'}
                    alt={p.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/photo/999.jpg'; }}
                  />
                  <div className="absolute top-3 right-3 bg-black/70 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">
                    {p.type === 'apartment' ? 'Квартира' : p.type === 'house' ? 'Дом' : p.type === 'commercial' ? 'Коммерция' : 'Объект'}
                  </div>
                </div>

                <div className="p-5">
                  <h3
                    className="text-neutral-900 mb-3 line-clamp-2 min-h-[3rem] leading-snug"
                    style={{ fontFamily: displayFont, fontWeight: 500, fontSize: 17 }}
                  >
                    {p.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-stone-500 text-[12px] mb-4">
                    <MapPin className="w-3 h-3 shrink-0" style={{ color: brass }} />
                    <span className="line-clamp-1">{p.address}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {p.area && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-stone-600 bg-stone-100 px-2 py-1">
                        <Maximize2 className="w-3 h-3" />
                        {p.area} м²
                      </span>
                    )}
                    {p.rooms && (
                      <span className="text-[11px] text-stone-600 bg-stone-100 px-2 py-1">
                        {p.rooms}-комн.
                      </span>
                    )}
                    {p.floor && p.totalFloors && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-stone-600 bg-stone-100 px-2 py-1">
                        <Building2 className="w-3 h-3" />
                        {p.floor}/{p.totalFloors}
                      </span>
                    )}
                  </div>

                  <div className="pt-4 flex items-end justify-between" style={{ borderTop: dashed }}>
                    <div>
                      <div
                        className="text-neutral-900"
                        style={{ fontFamily: displayFont, fontWeight: 500, fontSize: 22 }}
                      >
                        {p.priceBYN ? `${p.priceBYN.toLocaleString('ru-RU')} BYN` : '—'}
                      </div>
                      {p.area && p.priceBYN && p.area > 0 ? (
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          {Math.round(p.priceBYN / p.area)} BYN/м²
                        </div>
                      ) : null}
                    </div>

                    <ArrowRight
                      className="w-5 h-5 transition-transform group-hover:translate-x-1"
                      style={{ color: brass }}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="bg-black py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-white mb-4"
            style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(28px, 4vw, 42px)' }}
          >
            Не нашли подходящий вариант?
          </h2>
          <p className="text-stone-400 max-w-2xl mx-auto mb-8" style={{ fontWeight: 300 }}>
            Оставьте заявку — подберём объекты под ваш запрос и бюджет. База обновляется ежедневно.
          </p>
          <button
            onClick={() => navigateTo('/kontakty')}
            className="inline-flex items-center gap-2 px-8 py-3.5 text-white text-[13px] font-semibold uppercase tracking-wider transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: brass }}
          >
            Оставить заявку
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}