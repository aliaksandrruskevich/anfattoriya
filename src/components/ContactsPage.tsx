"use client";
import React from 'react';
import { PageId } from '../types';
import {
  MapPin, Phone, Mail, Clock, Building2, FileText, Shield,
  ArrowRight, Send, MessageCircle, CreditCard, Award,
  CheckCircle, ChevronRight,
} from 'lucide-react';

interface ContactsPageProps {
  activePage: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
}

const displayFont = "'Cormorant Garamond', 'Georgia', serif";
const bodyFont = "'Raleway', system-ui, sans-serif";

const HERO_PHOTO = '/photo/stati.jpg';

export default function ContactsPage({ activePage, navigateTo, handleAddLead }: ContactsPageProps) {
  const scrollToForm = () => {
    document.getElementById('contact-form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#171412]" style={{ fontFamily: bodyFont }}>

      {/* HERO BANNER */}
      <section className="relative overflow-hidden bg-neutral-950 text-white min-h-[520px] lg:min-h-[620px] flex items-end">
        <img
          src={HERO_PHOTO}
          alt="Контакты АН «Фаттория»"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/30" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 pt-32 pb-20 lg:pb-28 w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-white/40 text-xs">•</span>
            <span className="text-white/70 text-xs uppercase tracking-wider font-medium">Связаться с нами</span>
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/25 text-white px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.25em] mb-6">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>АН «Фаттория» · Контактная информация</span>
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
              Контактная информация
            </h1>

            <p
              className="text-[17px] lg:text-[21px] font-light leading-relaxed max-w-3xl mb-8 text-white/90"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
            >
              Свяжитесь с нами удобным способом. Ответим на вопросы о работе агентства, услугах и подберём специалиста под вашу задачу.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/20 text-[11px] uppercase tracking-[0.18em] text-white/80">
              <span className="inline-flex items-center gap-2 font-medium">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                г. Минск, ул. Репина, д. 4, пом. 458
              </span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                пн–пт: 9:00 — 21:00
              </span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-amber-300" />
                Лицензия № 02240/446
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
                  { id: 'contact-info', label: 'Контактная информация' },
                  { id: 'contact-form-section', label: 'Оставить заявку' },
                  { id: 'map-section', label: 'Мы на карте' },
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
                  <Send className="w-3.5 h-3.5 text-stone-600" />
                  <span>Заявка</span>
                </button>
                <a
                  href="https://t.me/fattoriaminsk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 text-[11px] font-semibold uppercase tracking-wider rounded-xl border border-stone-300 bg-white hover:border-stone-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-stone-600" />
                  <span>Telegram</span>
                </a>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-amber-50 to-stone-100 rounded-2xl border border-amber-200/70 text-stone-800">
              <div className="flex items-center gap-2 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Award className="w-4 h-4" /> Лицензия и страхование
              </div>
              <p className="text-xs leading-relaxed text-stone-600 mt-2">
                Лицензия Министерства юстиции Республики Беларусь № 02240/446 выдана 11.07.2022г.
              </p>
              <p className="text-xs leading-relaxed text-stone-600 mt-2">
                Договор обязательного страхования ответственности с РУП «Белгосстрах».
              </p>
            </div>
          </aside>

          {/* Центральная колонка */}
          <main className="order-2 min-w-0 max-w-[880px] space-y-16">

            {/* 01: КОНТАКТНАЯ ИНФОРМАЦИЯ */}
            <section id="contact-info" className="scroll-mt-32">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                01 · Как с нами связаться
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 42px)', lineHeight: 1.15 }}
              >
                Контактная информация
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Выберите удобный способ связи. Мы работаем для вас ежедневно и всегда готовы помочь с вопросами недвижимости.
              </p>

              <div className="space-y-5">
                {/* Колл-центр и Продажи */}
                <article className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-stone-50 border border-stone-200">
                      <Phone className="w-5 h-5 text-stone-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-normal text-stone-900 mb-1" style={{ fontFamily: displayFont }}>
                        Колл-центр и Продажи
                      </h3>
                      <p className="text-sm text-stone-500 font-light">Звонки, консультации, сделки</p>
                    </div>
                  </div>
                  <div className="space-y-2.5 pl-16">
                    <a href="tel:+375296380053" className="block text-amber-800 font-semibold text-lg hover:text-amber-900 transition-colors">
                      +375 29 638-00-53
                    </a>
                    <p className="text-sm text-stone-500">+375 29 638-00-53 (колл-центр)</p>
                    <p className="text-sm text-stone-500">+375 17 364-21-99 (городской)</p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <a href="viber://chat?number=%2B375296380053" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-amber-800 transition">
                        <MessageCircle className="w-3.5 h-3.5" /> Viber
                      </a>
                      <a href="https://t.me/fattoriaminsk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-amber-800 transition">
                        <Send className="w-3.5 h-3.5" /> Telegram
                      </a>
                    </div>
                  </div>
                </article>

                {/* Отдел аренды и оценки */}
                <article className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-stone-50 border border-stone-200">
                      <Building2 className="w-5 h-5 text-stone-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-normal text-stone-900 mb-1" style={{ fontFamily: displayFont }}>
                        Отдел аренды и оценки
                      </h3>
                      <p className="text-sm text-stone-500 font-light">Аренда, оценка, консультации</p>
                    </div>
                  </div>
                  <div className="space-y-2.5 pl-16">
                    <a href="tel:+375296380053" className="block text-amber-800 font-semibold text-lg hover:text-amber-900 transition-colors">
                      +375 29 638-00-53
                    </a>
                    <p className="text-sm text-stone-500">+375 29 638-00-53 (консультации)</p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <a href="viber://chat?number=%2B375296380053" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-amber-800 transition">
                        <MessageCircle className="w-3.5 h-3.5" /> Viber
                      </a>
                      <a href="https://t.me/fattoriaminsk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-amber-800 transition">
                        <Send className="w-3.5 h-3.5" /> Telegram
                      </a>
                    </div>
                  </div>
                </article>

                {/* E-mail */}
                <article className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-stone-50 border border-stone-200">
                      <Mail className="w-5 h-5 text-stone-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-normal text-stone-900 mb-1" style={{ fontFamily: displayFont }}>
                        E-mail
                      </h3>
                      <p className="text-sm text-stone-500 font-light">Для заявок и коммерческих предложений</p>
                    </div>
                  </div>
                  <div className="pl-16">
                    <a href="mailto:fattoria1900088@gmail.com" className="text-amber-800 font-medium hover:underline">
                      fattoria1900088@gmail.com
                    </a>
                  </div>
                </article>

                {/* Время работы */}
                <article className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-stone-50 border border-stone-200">
                      <Clock className="w-5 h-5 text-stone-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-normal text-stone-900 mb-1" style={{ fontFamily: displayFont }}>
                        Время работы офиса
                      </h3>
                      <p className="text-sm text-stone-500 font-light">График приёма</p>
                    </div>
                  </div>
                  <div className="pl-16 space-y-1.5 text-sm text-stone-600">
                    <p>пн–пт: 9:00 — 21:00</p>
                    <p>сб: 10:00 — 15:00</p>
                    <p>вс: по предварительной записи</p>
                  </div>
                </article>
              </div>
            </section>

            {/* 02: АДРЕС И РЕКВИЗИТЫ */}
            <section id="contact-details" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                02 · Юридическая информация
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Адрес и реквизиты
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <article className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-amber-800" />
                    <h3 className="text-base font-semibold text-stone-900">Адрес офиса</h3>
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    220035, Республика Беларусь,<br />
                    г. Минск,<br />
                    ул. Репина, д. 4, пом. 458
                  </p>
                </article>

                <article className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="w-5 h-5 text-amber-800" />
                    <h3 className="text-base font-semibold text-stone-900">Банковские реквизиты</h3>
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Р/с BY09АLFA30122C13360010270000<br />
                    в ЗАО «Альфа-Банк», г. Минск, ул. Сурганова, 43-47<br />
                    BIС: ALFABY2X
                  </p>
                </article>

                <article className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-5 h-5 text-amber-800" />
                    <h3 className="text-base font-semibold text-stone-900">Реквизиты компании</h3>
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    ООО «АН Фаттория»<br />
                    УНП 193625457, ОКПО 506039275000<br />
                    Юридический адрес: 220035, г. Минск, ул. Репина, д.4, пом.458
                  </p>
                </article>

                <article className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-5 h-5 text-amber-800" />
                    <h3 className="text-base font-semibold text-stone-900">Лицензия и страхование</h3>
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Лицензия Министерства юстиции Республики Беларусь № 02240/446 выдана 11.07.2022г.<br />
                    Договор обязательного страхования ответственности за причинение вреда с РУП «Белгосстрах»
                  </p>
                </article>
              </div>
            </section>

            {/* 03: ФОРМА ЗАЯВКИ */}
            <section id="contact-form-section" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                03 · Обратная связь
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Оставить заявку
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Оставьте свои контакты — мы свяжемся с вами в ближайшее время и ответим на все вопросы.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value || '';
                  const phone = (form.querySelector('[name="phone"]') as HTMLInputElement)?.value || '';
                  if (phone) {
                    handleAddLead(name, phone, 'Обратная связь (контакты)', 'kontakty');
                    form.reset();
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
                      placeholder="Александр"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800"
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
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Комментарий
                  </label>
                  <textarea
                    placeholder="Опишите ваш вопрос или задачу..."
                    rows={4}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Отправить заявку</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </section>

            {/* 04: КАРТА */}
            <section id="map-section" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                04 · Как нас найти
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Мы на карте
              </h2>

              <div className="rounded-3xl overflow-hidden border border-stone-200 shadow-sm">
                <iframe
                  src="https://yandex.ru/map-widget/v1/?z=12&ol=biz&oid=14167994740"
                  width="100%"
                  height="400"
                  frameBorder="0"
                  className="w-full"
                ></iframe>
              </div>
            </section>

          </main>

          {/* Правая колонка */}
          <aside className="order-3 lg:col-start-2 xl:col-start-3 xl:row-start-1 xl:sticky xl:top-28 xl:h-fit space-y-6">

            <div className="p-7 bg-white rounded-3xl border border-stone-200 shadow-md">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-800 mb-2">
                Быстрая связь
              </div>
              <h3 className="text-stone-900 text-xl font-normal mb-2" style={{ fontFamily: displayFont }}>
                Позвоните нам
              </h3>
              <p className="text-xs text-stone-500 mb-6 font-light leading-relaxed">
                Работаем ежедневно. Ответим на вопросы о работе агентства и услугах.
              </p>

              <a
                href="tel:+375296380053"
                className="block w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer text-center mb-3"
              >
                +375 29 638-00-53
              </a>

              <div className="flex gap-2">
                <a
                  href="viber://chat?number=%2B375296380053"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-3 text-[11px] font-semibold uppercase tracking-wider rounded-xl border border-stone-300 bg-white hover:border-stone-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-stone-600" />
                  <span>Viber</span>
                </a>
                <a
                  href="https://t.me/fattoriaminsk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-3 text-[11px] font-semibold uppercase tracking-wider rounded-xl border border-stone-300 bg-white hover:border-stone-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-stone-600" />
                  <span>Telegram</span>
                </a>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-amber-50 to-stone-100 rounded-3xl border border-amber-200/70">
              <div className="flex items-center gap-2 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-3">
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