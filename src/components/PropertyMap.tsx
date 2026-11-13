'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '@/types';

// Фикс иконок Leaflet в Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

// Кастомная фиолетовая иконка маркера
const purpleIcon = typeof window !== 'undefined'
  ? L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 32px;
        height: 40px;
        position: relative;
        filter: drop-shadow(0 4px 6px rgba(139, 92, 246, 0.4));
      ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40">
          <path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 24 16 24s16-13 16-24c0-8.8-7.2-16-16-16z" fill="#8B5CF6"/>
          <circle cx="16" cy="16" r="6" fill="white"/>
        </svg>
      </div>`,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -40],
    })
  : undefined;

const typeLabels: Record<string, string> = {
  apartment: 'Квартира',
  commercial: 'Коммерция',
  house: 'Дом/Дача',
  plot: 'Участок',
};

const typeColors: Record<string, string> = {
  apartment: '#8B5CF6',
  commercial: '#F59E0B',
  house: '#10B981',
  plot: '#3B82F6',
};

interface PropertyMapProps {
  properties: Property[];
  currency?: 'USD' | 'BYN';
  activePropertyId?: string | null;
  onOpenProperty?: (property: Property) => void;
}

// Автоцентрирование карты по маркерам
function FitBounds({ properties, activeId }: { properties: Property[]; activeId?: string | null }) {
  const map = useMap();

  useEffect(() => {
    if (properties.length === 0) return;
    const valid = properties.filter(p => p.lat && p.lng);
    if (valid.length === 0) return;

    const bounds = L.latLngBounds(valid.map(p => [p.lat!, p.lng!]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [properties.length, map]);

  useEffect(() => {
    if (!activeId) return;
    const active = properties.find(p => p.id === activeId);
    if (active?.lat && active?.lng) {
      map.setView([active.lat, active.lng], 16, { animate: true });
    }
  }, [activeId, properties, map]);

  return null;
}

export default function PropertyMap({ properties, currency = 'BYN', activePropertyId, onOpenProperty }: PropertyMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-stone-100 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-stone-500 text-sm">Загрузка карты...</p>
        </div>
      </div>
    );
  }

  const validProperties = properties.filter(p => p.lat && p.lng);

  if (validProperties.length === 0) {
    return (
      <div className="w-full h-full bg-stone-100 flex items-center justify-center">
        <p className="text-stone-500 text-sm">Нет объектов с координатами</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={[53.9045, 27.5615]}
      zoom={11}
      style={{ width: '100%', height: '100%', background: '#f5f5f4' }}
      scrollWheelZoom={false}
      preferCanvas={true}
      attributionControl={true}
    >
      {/* Бесплатные OSM тайлы — БЕЗ API-ключа */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      <FitBounds properties={validProperties} activeId={activePropertyId} />

      <MarkerClusterGroup
        chunkedLoading={true}
        showCoverageOnHover={false}
        spiderfyOnMaxZoom={true}
        maxClusterRadius={60}
        iconCreateFunction={(cluster: any) => {
          const count = cluster.getChildCount();
          let size = 'small';
          let color = '#8B5CF6';
          if (count >= 100) { size = 'large'; color = '#7C3AED'; }
          else if (count >= 20) { size = 'medium'; color = '#8B5CF6'; }

          const sizePx = size === 'large' ? 50 : size === 'medium' ? 42 : 36;

          return L.divIcon({
            html: `<div style="
              width: ${sizePx}px;
              height: ${sizePx}px;
              background: ${color};
              border: 3px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 900;
              font-size: ${sizePx / 3}px;
              box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
              font-family: system-ui, sans-serif;
            ">${count}</div>`,
            className: 'custom-cluster',
            iconSize: L.point(sizePx, sizePx),
          });
        }}
      >
        {validProperties.map((property) => {
          const price = currency === 'BYN' ? property.priceBYN : property.priceUSD;
          const symbol = currency === 'BYN' ? 'р.' : '$';
          const photo = property.photo || '/photo/999.jpg';
          const isActive = activePropertyId === property.id;
          const pricePerM2 = property.area > 0 ? Math.round(price / property.area) : 0;

          return (
            <Marker
              key={property.id}
              position={[property.lat!, property.lng!]}
              icon={purpleIcon}
              opacity={isActive ? 1 : 0.85}
              zIndexOffset={isActive ? 1000 : 0}
            >
              <Popup maxWidth={300} minWidth={260}>
                <div className="w-64 -m-1">
                  {/* Фото */}
                  <div className="relative h-36 -mx-3 -mt-3 mb-3 overflow-hidden rounded-t-lg">
                    <img
                      src={photo}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/photo/999.jpg'; }}
                    />
                    <div className="absolute top-2 left-2 bg-purple-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      {typeLabels[property.type] || 'Объект'}
                    </div>
                  </div>

                  {/* Инфо */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-neutral-900 line-clamp-2 leading-tight">
                      {property.title}
                    </h4>
                    <p className="text-[11px] text-stone-500 flex items-center gap-1">
                      <span>📍</span>
                      <span className="line-clamp-1">{property.address}</span>
                    </p>

                    {/* Цена */}
                    <div className="pt-2 border-t border-stone-200">
                      <div className="text-lg font-black text-purple-700 font-mono">
                        {(price || 0).toLocaleString('ru-RU')} {symbol}
                      </div>
                      {pricePerM2 > 0 && (
                        <div className="text-[10px] text-stone-400 font-mono">
                          {pricePerM2.toLocaleString('ru-RU')} {symbol}/м²
                        </div>
                      )}
                    </div>

                    {/* Характеристики */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-bold text-neutral-700 bg-stone-100 px-2 py-0.5 rounded font-mono">
                        {property.area} м²
                      </span>
                      {property.rooms && (
                        <span className="text-[10px] font-bold text-neutral-700 bg-stone-100 px-2 py-0.5 rounded font-mono">
                          {property.rooms}-комн.
                        </span>
                      )}
                      {property.floor && (
                        <span className="text-[10px] font-bold text-neutral-700 bg-stone-100 px-2 py-0.5 rounded font-mono">
                          {property.floor} эт.
                        </span>
                      )}
                    </div>

                    {/* Кнопка */}
                    <button
                      onClick={() => {
                        if (onOpenProperty) {
                          onOpenProperty(property);
                        } else {
                          window.location.href = `/object/${property.slug || property.id}`;
                        }
                      }}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Подробнее →
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}