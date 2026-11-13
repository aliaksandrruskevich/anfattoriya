"use client";
'use client';

import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface AgentBrandAvatarProps {
  photo?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  showBadge?: boolean;
}

export const AgentBrandAvatar: React.FC<AgentBrandAvatarProps> = ({
  photo,
  name = 'Риэлтер',
  size = 'md',
  className = '',
  showBadge = false,
}) => {
  const [hasError, setHasError] = useState(false);

  const isValidPhoto = Boolean(
    photo && 
    photo.trim() !== '' && 
    photo !== 'logo' && 
    !hasError
  );

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    if (parts.length === 1 && parts[0].length > 0) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return 'ФП';
  };

  const initials = getInitials(name);

  const sizeClasses = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-20 h-20 text-base',
    xl: 'w-28 h-28 text-xl',
    '2xl': 'w-36 h-36 text-2xl',
    full: 'w-full h-full text-4xl',
  };

  const isSmall = size === 'xs' || size === 'sm';

  return (
    <div 
      className={`
        relative inline-flex items-center justify-center shrink-0 overflow-hidden 
        ${sizeClasses[size]} 
        ${className}
      `}
    >
      {isValidPhoto ? (
        <img
          src={photo}
          alt={name}
          onError={() => setHasError(true)}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top"
        />
      ) : (
        /* ===== PREMIUM FALLBACK ===== */
        <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex flex-col items-center justify-center relative overflow-hidden">
          
          {/* Тонкая текстура */}
          <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#a78bfa_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Тонкая рамка */}
          <div className="absolute inset-[6px] border border-purple-500/20 rounded-xl pointer-events-none" />

          {isSmall ? (
            <div className="relative z-10 text-center">
              <span className="font-serif font-black text-purple-300 tracking-wider text-[11px]">
                Фаттория
              </span>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-3">
              
              {/* Элегантный монограм */}
              <div className="mb-3">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-purple-400/40 flex items-center justify-center bg-purple-500/10">
                  <span className="font-serif font-black text-2xl md:text-3xl text-purple-200 tracking-widest">
                    Фаттория
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-purple-300/90">
                  АН Фаттория
                </span>
                <span className="block text-[9px] uppercase tracking-widest text-stone-500 font-medium">
                  Агентство недвижимости
                </span>
              </div>
            </div>
          )}

          {/* Нижняя акцентная линия */}
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-70" />
        </div>
      )}

      {showBadge && (
        <div 
          className="absolute -bottom-0.5 -right-0.5 bg-purple-500 text-white p-1 rounded-full shadow-lg border-2 border-white z-20"
          title="Аттестованный риэлтер Минюста РБ"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
};