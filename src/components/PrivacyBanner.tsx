"use client";
'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, X, FileText, Lock } from 'lucide-react';
import CompanyLogo from './CompanyLogo';

interface PrivacyBannerProps {
  onOpenPrivacyPolicy: (tab?: 'privacy' | 'cookies') => void;
}

const PRIVACY_DISMISSED_KEY = 'fp_privacy_notice_dismissed';
const COOKIE_STORAGE_KEY = 'fp_cookie_consent';

export const PrivacyBanner: React.FC<PrivacyBannerProps> = ({ onOpenPrivacyPolicy }) => {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PRIVACY_DISMISSED_KEY);
      if (!stored) {
        const timer = setTimeout(() => setIsDismissed(false), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsDismissed(false);
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(PRIVACY_DISMISSED_KEY, 'true');
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify({
        necessary: true,
        analytics: true,
        marketing: true,
        timestamp: new Date().toISOString()
      }));
    } catch {}
    setIsDismissed(true);
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(PRIVACY_DISMISSED_KEY, 'true');
    } catch {}
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <aside 
      aria-label="Политика конфиденциальности и использование cookies"
      className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/95 backdrop-blur-xl border-t border-purple-500/40 text-white shadow-[0_-8px_30px_rgba(0,0,0,0.6)] py-3 px-4 sm:px-6 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center shrink-0 shadow-inner">
            <CompanyLogo className="w-5 h-5" variant="purple" />
          </div>
          <div className="leading-snug text-stone-200">
            <div className="font-semibold text-white flex items-center gap-1.5 flex-wrap">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-4 h-4 inline" />
                Защита данных
              </span>
              <span className="text-purple-300">и файлы cookie</span>
            </div>
            <p className="text-stone-300 text-xs mt-0.5 max-w-2xl hidden sm:block">
              Мы используем файлы cookie и обрабатываем персональные данные в строгом соответствии с Законом Республики Беларусь № 99-З «О защите персональных данных» для корректной работы сервисов и подбора объектов.
            </p>
            <p className="text-stone-300 text-[11px] mt-0.5 sm:hidden">
              Соответствие Закону РБ № 99-З «О защите персональных данных» и использование cookie.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 w-full md:w-auto justify-end flex-wrap">
          <button
            onClick={() => onOpenPrivacyPolicy('privacy')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-purple-300 hover:text-white font-medium text-xs transition-colors border border-white/10 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Политика</span>
          </button>
          <button
            onClick={() => onOpenPrivacyPolicy('cookies')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-stone-300 hover:text-white font-medium text-xs transition-colors border border-white/10 cursor-pointer"
          >
            <Cookie className="w-3.5 h-3.5" />
            <span>Cookie</span>
          </button>
          <button
            onClick={handleAcceptAll}
            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 whitespace-nowrap cursor-pointer hover:shadow-purple-500/25 hover:shadow-lg"
          >
            Принять и продолжить
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Закрыть баннер"
            className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
            title="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default PrivacyBanner;
