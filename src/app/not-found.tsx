'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white px-4 py-20">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated 404 Header */}
        <div className="relative inline-block">
          <h1 className="text-9xl font-black text-stone-100 select-none" style={{ fontFamily: 'Raleway, sans-serif' }}>
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-neutral-900 uppercase tracking-widest bg-white px-4 py-2 border-2 border-neutral-900">
              Ошибка
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold text-neutral-900" style={{ fontFamily: 'Raleway, sans-serif' }}>
            Страница не найдена
          </h2>
          <p className="text-stone-600 text-lg leading-relaxed">
            Похоже, объект уже продан, снят с продажи или ссылка устарела.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            onClick={() => router.push('/catalog')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 active:scale-[0.98]"
          >
            <Search className="w-5 h-5" />
            В каталог
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200 active:scale-[0.98]"
          >
            <Home className="w-5 h-5" />
            На главную
          </button>
        </div>

        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-stone-500 hover:text-neutral-900 font-semibold transition-colors pt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Вернуться назад
        </button>
      </div>
    </div>
  );
}
