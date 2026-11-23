"use client";
import React, { useEffect, useRef, useState, CSSProperties } from 'react';

export const brass = '#8B5CF6';
export const brassLight = '#DDD6FE';
export const brassDark = '#6D28D9';
export const paper = '#FAF8FC';
export const displayFont = "'Cormorant Garamond', 'Raleway', serif";

export function useFonts() {
  useEffect(() => {
    if (document.getElementById('fp-luxury-fonts')) return;
    const link = document.createElement('link');
    link.id = 'fp-luxury-fonts';
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Raleway:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap';
    document.head.appendChild(link);
  }, []);
}

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
}

export function Reveal({ children, className = '', style, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
  }, [delay]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: 'translateY(0)',
        transition: `opacity 0.5s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.5s cubic-bezier(.16,1,.3,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CornerFrame({ dark = false }: { dark?: boolean }) {
  const c = dark ? 'rgba(255,255,255,0.85)' : brass;
  return (
    <div className="pointer-events-none absolute inset-3 z-20">
      <span className="absolute top-0 left-0 w-4 h-4 border-t-[1.5px] border-l-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ borderColor: c }} />
      <span className="absolute top-0 right-0 w-4 h-4 border-t-[1.5px] border-r-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ borderColor: c }} />
      <span className="absolute bottom-0 left-0 w-4 h-4 border-b-[1.5px] border-l-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ borderColor: c }} />
      <span className="absolute bottom-0 right-0 w-4 h-4 border-b-[1.5px] border-r-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ borderColor: c }} />
    </div>
  );
}

export function Eyebrow({
  children,
  dark = false,
  center = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
  center?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 mb-4 ${center ? 'justify-center' : ''}`}>
      <span className="w-8 h-px" style={{ backgroundColor: dark ? brassLight : brass }} />
      <span
        className="text-[11px] font-semibold uppercase tracking-[0.25em]"
        style={{ color: dark ? brassLight : brass, fontFamily: 'Raleway, sans-serif' }}
      >
        {children}
      </span>
      {center && <span className="w-8 h-px" style={{ backgroundColor: dark ? brassLight : brass }} />}
    </div>
  );
}

interface InlineLeadFormProps {
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
  source: string;
  dark?: boolean;
  ctaLabel?: string;
  defaultExtra?: string;
}

export function InlineLeadForm({
  handleAddLead,
  source,
  dark = false,
  ctaLabel = 'Отправить заявку',
  defaultExtra = 'Консультация',
}: InlineLeadFormProps) {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (sent) {
    return (
      <div
        className={`text-sm px-6 py-4 rounded-lg flex items-center gap-2 ${
          dark
            ? 'text-white bg-white/10 border border-white/20'
            : 'text-stone-900 bg-stone-50 border border-stone-200'
        }`}
      >
        <span className="text-purple-500 font-bold">✓</span> Спасибо! Заявка принята — перезвоним в течение 10 минут.
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (phone.trim()) {
          handleAddLead(name.trim() || 'Клиент', phone.trim(), defaultExtra, source);
          setSent(true);
        }
      }}
      className="flex flex-col sm:flex-row gap-3 w-full max-w-xl"
    >
      <input
        name="name"
        type="text"
        placeholder="Ваше имя"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={`px-4 py-3.5 rounded-lg text-sm focus:outline-none transition-all ${
          dark
            ? 'bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-white/60'
            : 'bg-white border border-stone-300 text-neutral-900 placeholder-stone-400 focus:border-stone-500'
        }`}
      />
      <input
        name="phone"
        type="tel"
        placeholder="Номер телефона *"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className={`flex-1 px-4 py-3.5 rounded-lg text-sm focus:outline-none transition-all ${
          dark
            ? 'bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-white/60'
            : 'bg-white border border-stone-300 text-neutral-900 placeholder-stone-400 focus:border-stone-500'
        }`}
      />
      <button
        type="submit"
        className="px-7 py-3.5 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all hover:brightness-110 hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(139,92,246,0.3)] whitespace-nowrap cursor-pointer"
        style={{ backgroundColor: brass }}
      >
        {ctaLabel}
      </button>
    </form>
  );
}
