"use client";
import React, { useState } from 'react';
import { PageId } from '../types';
import {
  Shield, FileText, CheckCircle2, AlertTriangle, ChevronDown, Scale,
  Building2, FileCheck, Search, Banknote, ShieldCheck, ArrowRight,
  Lock, Award, Check, Phone, MapPin, Clock, Send, MessageCircle, Plus,
} from 'lucide-react';

interface Props {
  activePage: PageId;
  navigateTo: (p: PageId) => void;
  handleAddLead: (n: string, ph: string, e: string, s: string) => void;
}

const displayFont = "'Cormorant Garamond', 'Georgia', serif";
const bodyFont = "'Raleway', system-ui, sans-serif";

const HERO_PHOTO = '/photo/stati.jpg';

export default function LegalConsultationPage({ activePage, navigateTo, handleAddLead }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formSent, setFormSent] = useState(false);

  const steps = [
    {
      step: '01',
      icon: Search,
      title: 'Правовой аудит объекта',
      desc: 'Заказываем выписку из Единого государственного регистра недвижимого имущества (ЕГРНИ). Анализируем всю историю объекта: собственники, обременения, аресты, запреты, сервитуты. Сверяем технический паспорт БРТИ с фактической планировкой помещения. Проверяем дееспособность продавцов и отсутствие скрытых наследников.'
    },
    {
      step: '02',
      icon: FileCheck,
      title: 'Подготовка пакета документов',
      desc: 'Готовим или анализируем договор купли-продажи в строгом соответствии с Гражданским кодексом Республики Беларусь. Согласовываем все условия с нотариусом. Получаем справки: о составе семьи, об отсутствии задолженности по ЖКХ, нотариально заверенное согласие супруга, разрешение органов опеки.'
    },
    {
      step: '03',
      icon: Building2,
      title: 'Нотариат и государственная регистрация',
      desc: 'Сопровождаем подписание договора у нотариуса или государственного регистратора. Подаём полный пакет документов в БРТИ для государственной регистрации перехода права собственности. Контролируем соблюдение сроков и получаем готовые документы.'
    },
    {
      step: '04',
      icon: ShieldCheck,
      title: 'Страховая защита и гарантия',
      desc: 'Оформляем договор обязательного страхования гражданской ответственности риэлтера в Белгосстрах. Ваша финансовая гарантия на весь период владения недвижимостью и полная правовая безопасность.'
    },
  ];

  const redFlags = [
    'Продажа по доверенности (особенно оформленной за пределами РБ)',
    'Наследство получено менее 6 месяцев назад (риск скрытых наследников)',
    'В квартире прописаны временно выписанные лица или несовершеннолетние',
    'Продавец предлагает занизить стоимость в договоре купли-продажи',
    'Частая смена собственников за последние 2–3 года',
    'Отсутствует нотариальное согласие бывшего или текущего супруга',
  ];

  const faqItems = [
    {
      q: 'Обязательно ли нотариальное удостоверение договора?',
      a: 'В соответствии с законодательством Республики Беларусь договор купли-продажи недвижимости подлежит обязательному нотариальному удостоверению либо удостоверению государственным регистратором БРТИ.\n\nЧто делает специалист:\n• Устанавливает личность всех участников сделки\n• Проверяет дееспособность граждан и правоспособность юрлиц\n• Убеждается в подлинности представленных документов\n• Разъясняет сторонам смысл и значение договора\n• Вносит сведения в Единую электронную систему нотариата\n• Отказывает в удостоверении, если сделка противоречит законодательству.'
    },
    {
      q: 'Как проверить квартиру перед покупкой?',
      a: 'Юридический отдел агентства проводит полную проверку объекта:\n1. Выписка из ЕГРНИ — собственники, аресты, запреты, ипотеки, сервитуты\n2. Технический паспорт БРТИ — сверка планировки с документальной\n3. Справка о составе семьи и занимаемой жилой площади\n4. Справка об отсутствии задолженности по ЖКХ\n5. Запросы в ПНД и НД о дееспособности продавцов\n6. Проверка несовершеннолетних собственников — разрешение органов опеки\n\nСрок экспресс-проверки: 1-2 рабочих дня.'
    },
    {
      q: 'Какие документы нужны для продажи квартиры?',
      a: 'Стандартный пакет документов для продавца:\n• Свидетельство о государственной регистрации права собственности\n• Технический паспорт БРТИ\n• Справка о составе семьи и занимаемой жилой площади\n• Справка об отсутствии задолженности по ЖКХ\n• Нотариально удостоверенное согласие супруга на отчуждение имущества\n• Разрешение органов опеки — если среди собственников есть несовершеннолетние\n• Справки из ПНД и НД о дееспособности.\n\nМы помогаем собрать полный пакет в рамках сопровождения сделки.'
    },
    {
      q: 'Что делать с неузаконенной перепланировкой?',
      a: 'Если при осмотре выявлены расхождения с техпаспортом БРТИ:\n1. Продавец обязан узаконить перепланировку до сделки или вернуть помещение в исходное состояние согласно Постановлению Совмина № 384.\n2. Мы всегда сверяем техпаспорт БРТИ с фактической планировкой до подписания договора и предостерегаем покупателя от рисков штрафов.'
    },
    {
      q: 'Кто присутствует при сделке?',
      a: 'При совершении сделки купли-продажи присутствуют:\n• Продавец и покупатель (или их доверенные лица по проверенной доверенности)\n• Нотариус или государственный регистратор\n• Ведущий юрист агентства «АН Фаттория»\n• При необходимости — представитель банка (если привлекается кредит/ипотека).'
    },
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
          alt="Юридическое сопровождение сделок АН «Фаттория»"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/30" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-900/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 pt-32 pb-20 lg:pb-28 w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-white/40 text-xs">•</span>
            <span className="text-white/70 text-xs uppercase tracking-wider font-medium">Юридическая практика · Минск</span>
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/25 text-white px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.25em] mb-6">
              <Scale className="w-3.5 h-3.5 text-purple-400" />
              <span>АН «Фаттория» · Юридическое сопровождение</span>
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
              Юридическое сопровождение сделок с недвижимостью
            </h1>

            <p
              className="text-[17px] lg:text-[21px] font-light leading-relaxed max-w-3xl mb-8 text-white/90"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
            >
              Полный цикл юридической защиты: от правовой экспертизы правоустанавливающих документов до безопасных расчётов и государственной регистрации права собственности в БРТИ.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/20 text-[11px] uppercase tracking-[0.18em] text-white/80">
              <span className="inline-flex items-center gap-2 font-medium">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                Аттестат Минюста
              </span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium">
                <Shield className="w-3.5 h-3.5 text-purple-300" />
                Белгосстрах
              </span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-300" />
                Экспресс-проверка 1–2 дня
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
                  { id: 'process', label: 'Как мы защищаем сделку' },
                  { id: 'red-flags', label: 'Зона риска и FAQ' },
                  { id: 'contact-form-section', label: 'Задать вопрос юристу' },
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
                <ShieldCheck className="w-4 h-4" /> Гарантия безопасности
              </div>
              <p className="text-xs leading-relaxed text-stone-600 mt-2">
                Ответственность юристов застрахована в РУП «Белгосстрах» на 10 000 базовых величин.
              </p>
              <p className="text-xs leading-relaxed text-stone-600 mt-2">
                С 2022 года — ни одной оспоренной сделки.
              </p>
            </div>
          </aside>

          {/* Центральная колонка */}
          <main className="order-2 min-w-0 max-w-[880px] space-y-16">

            {/* 01: ЭТАПЫ */}
            <section id="process" className="scroll-mt-32">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                01 · Регламент безопасности
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 42px)', lineHeight: 1.15 }}
              >
                Как мы защищаем вашу сделку
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Четыре этапа юридического сопровождения в строгом соответствии с законодательством Республики Беларусь.
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

            {/* 02: RED FLAGS + FAQ */}
            <section id="red-flags" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                02 · Зона риска и вопросы
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Когда юрист обязателен
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Red Flags */}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <AlertTriangle className="w-5 h-5 text-rose-700" />
                    <h3 className="text-base font-semibold text-rose-900">Зона повышенного риска</h3>
                  </div>
                  <div className="space-y-3">
                    {redFlags.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3.5 bg-rose-50/60 border border-rose-200/70 rounded-2xl">
                        <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-stone-700 leading-relaxed font-light">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQ */}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <FileText className="w-5 h-5 text-purple-700" />
                    <h3 className="text-base font-semibold text-stone-900">Вопросы и ответы</h3>
                  </div>
                  <div className="space-y-3">
                    {faqItems.map((item, i) => (
                      <div key={i} className="bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden">
                        <button
                          onClick={() => setOpenFaq(openFaq === i ? null : i)}
                          className="w-full flex items-center justify-between p-4 text-left font-semibold text-stone-900 text-sm hover:text-purple-900 transition-colors cursor-pointer"
                        >
                          <span className="pr-4">{item.q}</span>
                          <ChevronDown className={`w-5 h-5 text-stone-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180 text-purple-600' : ''}`} />
                        </button>
                        {openFaq === i && (
                          <div className="px-4 pb-4 pt-1 text-xs text-stone-600 leading-relaxed border-t border-stone-200/60 bg-white">
                            {item.a.split('\n').map((line, j) => (
                              <p key={j} className={`my-1 font-light ${line.startsWith('•') ? 'pl-3' : ''}`}>
                                {line}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
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
                Задать вопрос ведущему юристу
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Оставьте заявку для предварительного анализа документов или разбора юридической чистоты объекта.
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
                    Дежурный юрист «АН Фаттория» свяжется с вами в течение 10 минут.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value || '';
                    const phone = (form.querySelector('[name="phone"]') as HTMLInputElement)?.value || '';
                    const topic = (form.querySelector('[name="topic"]') as HTMLSelectElement)?.value || 'Консультация юриста';
                    if (phone) {
                      handleAddLead(name, phone, `Тема: ${topic}`, 'Юрконсультация: Главная форма');
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
                        placeholder="Например, Елена"
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
                      Тема вопроса
                    </label>
                    <select
                      name="topic"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all cursor-pointer"
                    >
                      <option value="Проверка объекта перед покупкой">Проверка объекта перед покупкой</option>
                      <option value="Экспертиза договора купли-продажи">Экспертиза договора купли-продажи</option>
                      <option value="Сделка по доверенности (Указ № 278)">Сделка по доверенности (Указ № 278)</option>
                      <option value="Наследственные вопросы и доли">Наследственные вопросы и доли</option>
                      <option value="Другой юридический вопрос">Другой юридический вопрос</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Комментарий
                    </label>
                    <textarea
                      placeholder="Опишите вашу ситуацию или вопрос..."
                      rows={4}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-600/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Получить консультацию</span>
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
                Позвоните юристу
              </h3>
              <p className="text-xs text-stone-500 mb-6 font-light leading-relaxed">
                Дежурный юрист ответит на вопросы по сделке и оценит риски.
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