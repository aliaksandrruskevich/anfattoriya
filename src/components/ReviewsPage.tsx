"use client";
import React, { useState } from 'react';
import { PageId, Review } from '../types';
import {
  Star, Check, Quote, Building2, ArrowRight, Plus, Minus,
  Bookmark, Share2, User, Calendar, Phone, Sparkles, Award,
  CheckCircle, Send, MessageCircle,
} from 'lucide-react';

interface ReviewsPageProps {
  activePage: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
  clientsReviews: Review[];
  onAddReview: (review: Review) => void;
}

const displayFont = "'Cormorant Garamond', 'Georgia', serif";
const bodyFont = "'Raleway', system-ui, sans-serif";

const HERO_PHOTO = '/photo/stati.jpg';

export default function ReviewsPage({
  activePage, navigateTo, handleAddLead, clientsReviews, onAddReview
}: ReviewsPageProps) {
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRole, setNewReviewRole] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor || !newReviewText) return;
    onAddReview({
      id: `review-${Date.now()}`,
      author: newReviewAuthor,
      role: newReviewRole || 'Клиент',
      rating: newReviewRating,
      text: newReviewText,
      date: new Date().toLocaleDateString('ru-RU'),
    });
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
      setNewReviewAuthor('');
      setNewReviewRole('');
      setNewReviewRating(5);
      setNewReviewText('');
    }, 4000);
  };

  const scrollToForm = () => {
    document.getElementById('review-form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const avgRating = clientsReviews.length
    ? (clientsReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / clientsReviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#171412]" style={{ fontFamily: bodyFont }}>

      {/* HERO BANNER */}
      <section className="relative overflow-hidden bg-neutral-950 text-white min-h-[520px] lg:min-h-[620px] flex items-end">
        <img
          src={HERO_PHOTO}
          alt="Отзывы клиентов АН «Фаттория»"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/30" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 pt-32 pb-20 lg:pb-28 w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-white/40 text-xs">•</span>
            <span className="text-white/70 text-xs uppercase tracking-wider font-medium">Обратная связь</span>
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/25 text-white px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.25em] mb-6">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>АН «Фаттория» · Отзывы клиентов</span>
            </div>

            <h1
              className="text-white mb-6 font-normal tracking-tight"
              style={{
                fontFamily: displayFont,
                fontSize: 'clamp(34px, 5.2vw, 64px)',
                lineHeight: 1.08,
                textShadow: '0 4px 24px rgba(0,0,0,0.85)'
              }}
            >
              Отзывы клиентов о работе АН «Фаттория»
            </h1>

            <p
              className="text-[17px] lg:text-[21px] font-light leading-relaxed max-w-3xl mb-8 text-white/90"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
            >
              Реальные истории клиентов, которые доверили нам свою недвижимость. Опыт покупки, продажи, обмена и сопровождения сделок в Минске.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/20 text-[11px] uppercase tracking-[0.18em] text-white/80">
              <span className="inline-flex items-center gap-2 font-medium">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Средний рейтинг {avgRating} из 5
              </span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                {clientsReviews.length} опубликованных отзывов
              </span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-amber-300" />
                Проверенные клиенты
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* EDITORIAL SHEET */}
      <div className="relative -mt-10 lg:-mt-14 rounded-t-[36px] lg:rounded-t-[50px] bg-white border-t border-[#E7E2DA] shadow-2xl z-20">
        <div className="max-w-[1520px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_340px] gap-10 xl:gap-14 pt-12 lg:pt-16 pb-20">

          {/* Левая колонка */}
          <aside className="lg:sticky lg:top-28 lg:h-fit space-y-6 order-1">
            <div className="bg-stone-50/90 p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] mb-4 pb-3 border-b border-stone-200 text-stone-900">
                Разделы
              </div>
              <nav className="space-y-1">
                {[
                  { id: 'list', label: 'Все отзывы' },
                  { id: 'review-form-section', label: 'Оставить отзыв' },
                ].map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex w-full items-start gap-2.5 text-left text-[13px] leading-snug py-2 px-2.5 rounded-lg transition-all hover:text-stone-900 cursor-pointer text-[#6B645C]"
                  >
                    <span className="mt-[2px] text-[10px] font-semibold tabular-nums text-amber-800">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-800">
                Быстрые действия
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={scrollToForm}
                  className="flex-1 py-2 px-3 text-[11px] font-semibold uppercase tracking-wider rounded-xl border border-stone-300 bg-white hover:border-stone-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-stone-600" />
                  <span>Отзыв</span>
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                  className="flex-1 py-2 px-3 text-[11px] font-semibold uppercase tracking-wider rounded-xl border border-stone-300 bg-white hover:border-stone-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-stone-600" />
                  <span>Поделиться</span>
                </button>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-amber-50 to-stone-100 rounded-2xl border border-amber-200/70 text-stone-800">
              <div className="flex items-center gap-2 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Award className="w-4 h-4" /> Средний рейтинг
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-light text-stone-900" style={{ fontFamily: displayFont }}>
                  {avgRating}
                </span>
                <span className="text-xs text-stone-500">из 5.0</span>
              </div>
              <div className="flex gap-0.5 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-700 fill-amber-700" />
                ))}
              </div>
              <p className="text-xs leading-relaxed text-stone-600 mt-3">
                На основе {clientsReviews.length} отзывов клиентов агентства.
              </p>
            </div>
          </aside>

          {/* Центральная колонка */}
          <main className="order-2 min-w-0 max-w-[880px] space-y-16">

            {/* 01: СПИСОК ОТЗЫВОВ */}
            <section id="list" className="scroll-mt-32">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                01 · Реальные истории
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 42px)', lineHeight: 1.15 }}
              >
                Отзывы клиентов
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Реальные отзывы людей, которые доверили нам свою недвижимость. Опыт покупки, продажи, обмена и юридического сопровождения сделок.
              </p>

              {clientsReviews.length > 0 ? (
                <div className="space-y-5">
                  {clientsReviews.map((rev) => (
                    <article
                      key={rev.id}
                      className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Логотип агентства вместо фото клиента */}
                          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-stone-50 border border-stone-200 overflow-hidden">
                            <img
                              src="/logo.svg"
                              alt="АН Фаттория"
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/logo.png';
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-stone-900 text-base truncate">
                              {rev.author}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                              <Building2 className="w-3 h-3" />
                              <span>{rev.role}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-stone-400 font-mono shrink-0">
                          {rev.date}
                        </span>
                      </div>

                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < rev.rating ? 'text-amber-700 fill-amber-700' : 'text-stone-200'}`}
                          />
                        ))}
                      </div>

                      <Quote className="w-5 h-5 mb-3 text-amber-800/50" />
                      <p className="text-stone-700 text-[15px] leading-relaxed italic font-light">
                        {rev.text}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center bg-white rounded-3xl border border-stone-200">
                  <Quote className="w-16 h-16 mx-auto mb-4 text-stone-300" />
                  <p className="text-stone-500 text-lg font-light mb-2">Пока нет отзывов</p>
                  <p className="text-stone-400 text-sm">Станьте первым, кто оставит отзыв о нашей работе</p>
                </div>
              )}
            </section>

            {/* 02: ФОРМА ОТЗЫВА */}
            <section id="review-form-section" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                02 · Поделитесь опытом
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Оставить отзыв
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Ваше мнение помогает нам становиться лучше и помогает другим клиентам сделать правильный выбор.
              </p>

              {reviewSubmitted ? (
                <div className="p-10 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7" />
                  </div>
                  <p className="text-xl font-normal text-stone-900" style={{ fontFamily: displayFont }}>
                    Спасибо за отзыв!
                  </p>
                  <p className="text-stone-600 text-sm font-light">
                    Ваш отзыв опубликован и поможет другим клиентам.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                        Ваше имя <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newReviewAuthor}
                        onChange={(e) => setNewReviewAuthor(e.target.value)}
                        placeholder="Александр"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                        Какая услуга?
                      </label>
                      <input
                        type="text"
                        placeholder="Например: продажа квартиры"
                        value={newReviewRole}
                        onChange={(e) => setNewReviewRole(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Ваша оценка
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReviewRating(star)}
                          className="p-1 transition-transform hover:scale-110 cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 ${newReviewRating >= star ? 'text-amber-700 fill-amber-700' : 'text-stone-300'}`}
                          />
                        </button>
                      ))}
                      <span className="text-sm text-stone-500 ml-2">
                        {newReviewRating} / 5
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Ваш отзыв <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      placeholder="Расскажите о вашем опыте работы с нами..."
                      rows={5}
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Опубликовать отзыв</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </section>

          </main>

          {/* Правая колонка */}
          <aside className="order-3 lg:col-start-2 xl:col-start-3 xl:row-start-1 xl:sticky xl:top-28 xl:h-fit space-y-6">

            <div className="p-7 bg-white rounded-3xl border border-stone-200 shadow-md">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-800 mb-2">
                Оставить заявку
              </div>
              <h3 className="text-stone-900 text-xl font-normal mb-2" style={{ fontFamily: displayFont }}>
                Связаться с агентством
              </h3>
              <p className="text-xs text-stone-500 mb-6 font-light leading-relaxed">
                Ответим на вопросы о работе агентства и услугах. Подберём специалиста под вашу задачу.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value || '';
                  const phone = (form.querySelector('[name="phone"]') as HTMLInputElement)?.value || '';
                  if (phone) {
                    handleAddLead(name, phone, 'Обратная связь (отзывы)', 'otzyvy-klientov');
                    form.reset();
                  }
                }}
                className="space-y-4"
              >
                <input
                  name="name"
                  type="text"
                  placeholder="Ваше имя"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800"
                />
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="+375 (29) 000-00-00"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800"
                />
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Отправить</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            <div className="p-6 bg-gradient-to-br from-amber-50 to-stone-100 rounded-3xl border border-amber-200/70">
              <div className="flex items-center gap-2 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Phone className="w-4 h-4" /> Прямая связь
              </div>
              <a
                href="tel:+375296380053"
                className="text-sm font-mono font-bold text-stone-900 hover:text-amber-800 transition-colors"
              >
                +375 29 638-00-53
              </a>
              <p className="text-[11px] text-stone-500 mt-2 font-light">
                г. Минск, ул. Репина, д. 4, пом. 458
              </p>
            </div>

          </aside>

        </div>
      </div>

    </div>
  );
}