"use client";
import React, { useState } from 'react';
import { PageId } from '../types';
import {
  Ruler, FileCheck, Shield, Home, ClipboardCheck, AlertTriangle,
  CheckCircle2, ArrowRight, Award, ShieldCheck, Check, Phone, Building2,
  MapPin, Clock, FileText, Send, MessageCircle, Plus, Star,
} from 'lucide-react';

interface Props {
  activePage: PageId;
  navigateTo: (p: PageId) => void;
  handleAddLead: (n: string, ph: string, e: string, s: string) => void;
}

const displayFont = "'Cormorant Garamond', 'Georgia', serif";
const bodyFont = "'Raleway', system-ui, sans-serif";

const HERO_PHOTO = '/photo/stati.jpg';

export default function RedevelopmentPage({ activePage, navigateTo, handleAddLead }: Props) {
  const [formSent, setFormSent] = useState(false);

  const steps = [
    { step: '01', icon: Ruler, title: 'Проектная документация', desc: 'Выезд аттестованного инженера на объект, проведение точных обмеров и разработка проекта перепланировки в строгом соответствии с нормами СНБ и ТКП Республики Беларусь.' },
    { step: '02', icon: ClipboardCheck, title: 'Согласование в инстанциях', desc: 'Прохождение обязательных согласований: администрация района, отдел архитектуры, ЖЭС/ТС, МЧС и санитарно-эпидемиологическая служба. Получение официального разрешения.' },
    { step: '03', icon: FileCheck, title: 'Обмеры БРТИ и техпаспорт', desc: 'Организация приемочной комиссии после строительных работ, заказ контрольных обмеров специалистами БРТИ и выдача нового технического паспорта с зарегистрированной планировкой.' },
  ];

  const allowed = [
    'Снос и возведение ненесущих межкомнатных перегородок',
    'Устройство проемов в ненесущих стенах и перегородках',
    'Объединение раздельного санузла с гидроизоляцией пола',
    'Замена газовой плиты на индукционную/электрическую панель',
    'Остекление лоджий и балконов по согласованию с архитектурой',
  ];

  const forbidden = [
    'Полный снос несущих капитальных стен, пилонов и колонн',
    'Перенос санузла или кухни над жилыми комнатами соседей снизу',
    'Перенос батарей центрального отопления на балкон или лоджию',
    'Уменьшение сечения или демонтаж вентиляционных шахт',
    'Объединение газифицированной кухни с жилой комнатой без двери',
  ];

  const scrollToForm = () => {
    document.getElementById('contact-form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#171412]" style={{ fontFamily: bodyFont }}>

      {/* HERO BANNER */}
      <section className="relative overflow-hidden bg-neutral-950 text-white min-h-[520px] lg:min-h-[620px] flex items-end">
        <img
          src={HERO_PHOTO}
          alt="Согласование перепланировок АН «Фаттория»"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/30" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-900/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 pt-32 pb-20 lg:pb-28 w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-white/40 text-xs">•</span>
            <span className="text-white/70 text-xs uppercase tracking-wider font-medium">Услуга агентства</span>
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/25 text-white px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.25em] mb-6">
              <Ruler className="w-3.5 h-3.5 text-purple-400" />
              <span>АН «Фаттория» · Перепланировки</span>
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
              Согласование и узаконивание перепланировок
            </h1>

            <p
              className="text-[17px] lg:text-[21px] font-light leading-relaxed max-w-3xl mb-8 text-white/90"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
            >
              Полный комплекс услуг в Минске: разработка проекта, согласование в администрации района и получение нового технического паспорта в БРТИ без штрафов и очередей.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/20 text-[11px] uppercase tracking-[0.18em] text-white/80">
              <span className="inline-flex items-center gap-2 font-medium">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                100% законно
              </span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium">
                <Building2 className="w-3.5 h-3.5 text-purple-300" />
                Все инстанции
              </span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium">
                <FileCheck className="w-3.5 h-3.5 text-purple-300" />
                Новый техпаспорт БРТИ
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
                  { id: 'process', label: 'Как мы работаем' },
                  { id: 'allowed-forbidden', label: 'Что можно и нельзя' },
                  { id: 'contact-form-section', label: 'Оставить заявку' },
                ].map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex w-full items-start gap-2.5 text-left text-[13px] leading-snug py-2 px-2.5 rounded-lg transition-all hover:text-stone-900 cursor-pointer text-[#6B645C]"
                  >
                    <span className="mt-[2px] text-[10px] font-semibold tabular-nums text-purple-700">
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
                  className="flex-1 py-2 px-3 text-[11px] font-semibold uppercase tracking-wider rounded-xl border border-stone-300 bg-white hover:border-purple-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-stone-600" />
                  <span>Заявка</span>
                </button>
                <a
                  href="https://t.me/fattoriaminsk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 text-[11px] font-semibold uppercase tracking-wider rounded-xl border border-stone-300 bg-white hover:border-purple-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-stone-600" />
                  <span>Telegram</span>
                </a>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-purple-50 to-stone-100 rounded-2xl border border-purple-200/70 text-stone-800">
              <div className="flex items-center gap-2 text-purple-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Award className="w-4 h-4" /> Постановление Совмина
              </div>
              <p className="text-xs leading-relaxed text-stone-600 mt-2">
                Работаем по Постановлению Совета Министров Республики Беларусь № 384.
              </p>
              <p className="text-xs leading-relaxed text-stone-600 mt-2">
                Инженеры аттестованы, ответственность застрахована в РУП «Белгосстрах».
              </p>
            </div>
          </aside>

          {/* Центральная колонка */}
          <main className="order-2 min-w-0 max-w-[880px] space-y-16">

            {/* 01: ПРОЦЕСС */}
            <section id="process" className="scroll-mt-32">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                01 · Процесс работы
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 42px)', lineHeight: 1.15 }}
              >
                Как мы узакониваем перепланировку
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Берем на себя все бюрократические процедуры от замеров до выдачи нового свидетельства.
              </p>

              <div className="space-y-5">
                {steps.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <article
                      key={idx}
                      className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-purple-50 border border-purple-200">
                          <Icon className="w-5 h-5 text-purple-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-[11px] font-mono font-bold text-purple-600">
                              {item.step}
                            </span>
                            <h3 className="text-lg font-normal text-stone-900" style={{ fontFamily: displayFont }}>
                              {item.title}
                            </h3>
                          </div>
                        </div>
                      </div>
                      <p className="text-stone-600 text-[15px] leading-relaxed font-light pl-16">
                        {item.desc}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* 02: ЧТО МОЖНО / НЕЛЬЗЯ */}
            <section id="allowed-forbidden" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                02 · Ограничения
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Что можно и нельзя при перепланировке
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Ключевые ограничения согласно строительным нормам Республики Беларусь.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <article className="p-7 bg-emerald-50/60 rounded-3xl border border-emerald-200/80">
                  <div className="flex items-center gap-3 mb-5">
                    <FileCheck className="w-5 h-5 text-emerald-700" />
                    <h3 className="text-base font-semibold text-emerald-900">Разрешено согласовывать</h3>
                  </div>
                  <ul className="space-y-3.5 text-sm text-emerald-950">
                    {allowed.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-light">{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>

                <article className="p-7 bg-rose-50/60 rounded-3xl border border-rose-200/80">
                  <div className="flex items-center gap-3 mb-5">
                    <AlertTriangle className="w-5 h-5 text-rose-700" />
                    <h3 className="text-base font-semibold text-rose-900">Категорически запрещено</h3>
                  </div>
                  <ul className="space-y-3.5 text-sm text-rose-950">
                    {forbidden.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">✕</span>
                        <span className="font-light">{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            </section>

            {/* 03: ФОРМА ЗАЯВКИ */}
            <section id="contact-form-section" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                03 · Обратная связь
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Узнать возможность согласования
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Опишите планируемые или выполненные изменения — инженер оценит шансы и назовет сроки.
              </p>

              {formSent ? (
                <div className="p-10 bg-purple-50 border border-purple-200 rounded-3xl text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7" />
                  </div>
                  <p className="text-xl font-normal text-stone-900" style={{ fontFamily: displayFont }}>
                    Заявка принята!
                  </p>
                  <p className="text-stone-600 text-sm font-light">
                    Инженер отдела согласований свяжется с вами в течение 10 минут.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value || '';
                    const phone = (form.querySelector('[name="phone"]') as HTMLInputElement)?.value || '';
                    const type = (form.querySelector('[name="type"]') as HTMLSelectElement)?.value || 'Согласование перепланировки';
                    if (phone) {
                      handleAddLead(name, phone, `Тип: ${type}`, 'Перепланировка: Главная форма');
                      setFormSent(true);
                    }
                  }}
                  className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                        Ваше имя
                      </label>
                      <input
                        name="name"
                        type="text"
                        placeholder="Например, Михаил"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                        Телефон <span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="phone"
                        type="tel"
                        required
                        placeholder="+375 (29) 000-00-00"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Вид перепланировки
                    </label>
                    <select
                      name="type"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all cursor-pointer"
                    >
                      <option value="Снос или перенос перегородок">Снос или перенос ненесущих стен</option>
                      <option value="Объединение санузла">Объединение ванной и туалета</option>
                      <option value="Объединение кухни с гостиной">Кухня-гостиная (снос проема)</option>
                      <option value="Узаконивание уже сделанной">Узаконивание уже выполненной перепланировки</option>
                      <option value="Другой сложный проект">Другой проект</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Комментарий
                    </label>
                    <textarea
                      placeholder="Опишите планируемые или выполненные изменения..."
                      rows={4}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-600/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Получить заключение инженера</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </section>

          </main>

          {/* Правая колонка */}
          <aside className="order-3 lg:col-start-2 xl:col-start-3 xl:row-start-1 xl:sticky xl:top-28 xl:h-fit space-y-6">

            <div className="p-7 bg-white rounded-3xl border border-stone-200 shadow-md">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-purple-700 mb-2">
                Быстрая связь
              </div>
              <h3 className="text-stone-900 text-xl font-normal mb-2" style={{ fontFamily: displayFont }}>
                Позвоните нам
              </h3>
              <p className="text-xs text-stone-500 mb-6 font-light leading-relaxed">
                Инженер ответит на вопросы о согласовании перепланировки и назовёт сроки.
              </p>

              <a
                href="tel:+375296380053"
                className="block w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-600/20 cursor-pointer text-center mb-3"
              >
                +375 29 638-00-53
              </a>

              <div className="flex gap-2">
                <a
                  href="viber://chat?number=%2B375296380053"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-3 text-[11px] font-semibold uppercase tracking-wider rounded-xl border border-stone-300 bg-white hover:border-purple-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-stone-600" />
                  <span>Viber</span>
                </a>
                <a
                  href="https://t.me/fattoriaminsk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-3 text-[11px] font-semibold uppercase tracking-wider rounded-xl border border-stone-300 bg-white hover:border-purple-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-stone-600" />
                  <span>Telegram</span>
                </a>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-stone-100 rounded-3xl border border-purple-200/70">
              <div className="flex items-center gap-2 text-purple-800 text-[11px] font-bold uppercase tracking-wider mb-3">
                <MapPin className="w-4 h-4" /> Адрес офиса
              </div>
              <p className="text-sm text-stone-900 font-medium mb-1">
                г. Минск, ул. Репина, д. 4
              </p>
              <p className="text-[11px] text-stone-500 font-light">
                пом. 458, 220035
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-stone-50 to-stone-100 rounded-3xl border border-stone-200">
              <div className="flex items-center gap-2 text-stone-700 text-[11px] font-bold uppercase tracking-wider mb-3">
                <Clock className="w-4 h-4" /> Режим работы
              </div>
              <div className="space-y-1.5 text-xs text-stone-600">
                <p className="flex justify-between">
                  <span>пн–пт</span>
                  <span className="font-medium text-stone-900">9:00 — 21:00</span>
                </p>
                <p className="flex justify-between">
                  <span>сб</span>
                  <span className="font-medium text-stone-900">10:00 — 15:00</span>
                </p>
                <p className="flex justify-between">
                  <span>вс</span>
                  <span className="font-medium text-stone-900">по записи</span>
                </p>
              </div>
            </div>

          </aside>

        </div>
      </div>

    </div>
  );
}