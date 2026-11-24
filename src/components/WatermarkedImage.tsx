"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

interface WatermarkedImageProps {
  src: string;
  alt: string;
  showWatermark?: boolean;
  watermarkPosition?: 'bottom-right' | 'bottom-left' | 'center' | 'top-right';
  watermarkSize?: 'sm' | 'md' | 'lg';
  watermarkType?: 'badge' | 'subtle' | 'full';
  containerClassName?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}

export const WatermarkedImage: React.FC<WatermarkedImageProps> = ({
  src,
  alt,
  showWatermark = true,
  watermarkPosition = 'bottom-right',
  watermarkSize = 'md',
  watermarkType = 'badge',
  containerClassName = '',
  className = '',
  priority = false,
  sizes = '(max-width: 640px) 100vw, 192px',
  fill = true,
  width,
  height,
}) => {
  const [hasError, setHasError] = useState(false);

  const fallbackSrc = '/photo/logo.png';

  const positionClasses = {
    'bottom-right': 'bottom-2.5 right-2.5 sm:bottom-3 sm:right-3',
    'bottom-left': 'bottom-2.5 left-2.5 sm:bottom-3 sm:left-3',
    'top-right': 'top-2.5 right-2.5 sm:top-3 sm:right-3',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  }[watermarkPosition];

  const sizeClasses = {
    sm: 'text-[9px] px-2 py-0.5 scale-90 sm:scale-100',
    md: 'text-[10px] sm:text-xs px-2.5 py-1',
    lg: 'text-xs sm:text-sm px-3.5 py-1.5',
  }[watermarkSize];

  const imgSrc = hasError ? fallbackSrc : src;

  return (
    <div className={`relative overflow-hidden group select-none ${containerClassName}`}>
      {fill ? (
        <Image
          src={imgSrc}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setHasError(true)}
          className={`object-cover ${className}`}
        />
      ) : (
        <Image
          src={imgSrc}
          alt={alt}
          width={width || 400}
          height={height || 300}
          sizes={sizes}
          priority={priority}
          onError={() => setHasError(true)}
          className={className}
        />
      )}

      {showWatermark && (
        <div
          className={`absolute ${positionClasses} z-10 pointer-events-none transition-transform duration-200 transform`}
          aria-hidden="true"
        >
          {watermarkType === 'subtle' ? (
            <div className="bg-black/40 backdrop-blur-xs text-white/75 font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border border-white/10">
              АН ФАТТОРИЯ
            </div>
          ) : watermarkType === 'full' ? (
            <div className="flex flex-col items-center justify-center p-2 bg-neutral-950/60 backdrop-blur-md rounded-xl border border-purple-400/30 text-white shadow-lg">
              <div className="flex items-center gap-1 text-[11px] font-black tracking-wider uppercase text-purple-300">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>АН ФАТТОРИЯ</span>
              </div>
              <span className="text-[8px] text-stone-300 tracking-tight font-medium">
                Минск • Репина, 4
              </span>
            </div>
          ) : (
            <div
              className={`bg-neutral-950/80 backdrop-blur-md text-white rounded-lg shadow-lg border border-purple-400/30 flex items-center gap-1.5 font-sans tracking-wide ${sizeClasses}`}
            >
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shrink-0" />
              <span className="font-extrabold uppercase text-purple-200">АН Фаттория</span>
              <span className="text-stone-400 hidden sm:inline">• Репина 4</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};