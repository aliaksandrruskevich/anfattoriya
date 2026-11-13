"use client";
import React, { useState } from 'react';
import { PageId } from '../types';
import {
  Shield, FileCheck, ClipboardList, Key, Search, Banknote, Home,
  Users, Star, Clock, CheckCircle2, ShieldCheck, Scale, AlertCircle,
  ArrowRight, FileText, Landmark, Phone, ChevronDown, Award, Sparkles,
  Lock, Check, Building2, MapPin, Send, MessageCircle, Plus,
} from 'lucide-react';

interface Props {
  activePage: PageId;
  navigateTo: (p: PageId) => void;
  handleAddLead: (n: string, ph: string, e: string, s: string) => void;
}

const displayFont = "'Cormorant Garamond', 'Georgia', serif";
const bodyFont = "'Raleway', system-ui, sans-serif";

const HERO_PHOTO = '/photo/stati.jpg';

export default function CheckTransactionPage({ activePage, navigateTo, handleAddLead }: Props) {
  const [formSent, setFormSent] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const steps = [
    { step: '01', icon: Search, title: 'Комплексный аудит объекта и истории', desc: 'Заказываем выписку из ЕГРНИ и архивные справки БРТИ. Проверяем всех предыдущих собственников, основания перехода прав с 1991 года, наличие арестов, запретов, залогов и скрытых обременений.' },
    { step: '02', icon: Scale, title: 'Проверка дееспособности и прав третьих лиц', desc: 'Запрашиваем официальные справки из психоневрологического и наркологического диспансеров (ПНД и НД). Выявляем временно выписанных лиц, осужденных, военнослужащих и получаем согласия органов опеки.' },
    { step: '03', icon: FileText, title: 'Составление индивидуального договора', desc: 'Разрабатываем детальный договор купли-продажи в строгом соответствии с Гражданским кодексом РБ. Прописываем точные сроки освобождения квартиры, штрафные санкции и порядок безопасных расчётов.' },
    { step: '04', icon: Lock, title: 'Организация безопасных взаиморасчётов', desc: 'Организуем расчёты через банковскую ячейку, аккредитив или безналичный счёт в белорусских рублях по согласованному курсу. Контролируем передачу денег только после выполнения всех условий.' },
    { step: '05', icon: Landmark, title: 'Нотариат и регистрация в БРТИ', desc: 'Лично сопровождаем подписание у государственного регистратора или нотариуса. Подаём документы на государственную регистрацию перехода права собственности и контролируем получение свидетельства.' },
    { step: '06', icon: ShieldCheck, title: 'Страхование титула и передача ключей', desc: 'Оформляем полис обязательного государственного страхования гражданской ответственности в Белгосстрах. Организуем подписание передаточного акта и вручение ключей новому собственнику.' },
  ];

  const auditParameters = [
    { title: 'Выписка из ЕГРНИ', desc: 'Текущие собственники, доли, аресты, запреты, ипотеки и сервитуты.' },
    { title: 'Архивная история переходов', desc: 'Анализ всех предыдущих сделок с момента приватизации или постройки дома.' },
    { title: 'Сверка с техпаспортом БРТИ', desc: 'Контроль фактической планировки на предмет неузаконенных перепланировок.' },
    { title: 'Справка о зарегистрированных', desc: 'Проверка всех когда-либо прописанных лиц, включая временно выписанных.' },
    { title: 'Органы опеки и попечительства', desc: 'Официальное разрешение при наличии несовершеннолетних собственников.' },
    { title: 'Дееспособность продавцов', desc: 'Справки из психоневрологического и наркологического диспансеров (ПНД/НД).' },
    { title: 'Отсутствие долгов по ЖКХ', desc: 'Справки об отсутствии задолженности за коммунальные услуги и капремонт.' },
    { title: 'Согласие супругов', desc: 'Нотариально удостоверенное согласие супруга (действующего или бывшего).' },
    { title: 'Наследственные риски', desc: 'Проверка круга потенциальных наследников и сроков вступления в наследство.' },
    { title: 'Проверка доверенностей', desc: 'Экспертиза полномочий, срока действия и отсутствия отзыва по реестру.' },
    { title: 'Налоговый аудит', desc: 'Расчет подоходного налога 13% при продаже второй недвижимости за 5 лет.' },
    { title: 'Юридическая чистота расчётов', desc: 'Фиксация валютных эквивалентов в договоре в соответствии с Нацбанком РБ.' },
  ];

  const faqs = [
    { q: 'Сколько времени занимает оформление сделки под ключ?', a: 'Полный цикл оформления сделки занимает от 3 до 7 рабочих дней. Экспресс-проверка объекта и сбор справок выполняются за 1–2 рабочих дня, после чего назначается дата подписания договора и государственной регистрации в БРТИ.' },
    { q: 'Какая гарантия предоставляется покупателю?', a: 'Каждая сделка агентства «АН Фаттория» застрахована в государственной страховой компании «Белгосстрах». Кроме того, наши профильные юристы выдают официальное правовое заключение о чистоте объекта.' },
    { q: 'Как формируется стоимость услуги?', a: 'Мы работаем строго по государственным тарифам, установленным Советом Министров Республики Беларусь. Никаких скрытых платежей или комиссий сверх официального договора.' },
    { q: 'Можно ли оформить сделку, если продавец находится за границей?', a: 'Да. Мы проводим сделки по доверенностям в строгом соответствии с Указом Президента РБ № 278, организуя предварительную проверку документов через консульские службы и нотариат.' },
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
          alt="Оформление сделки с недвижимостью под ключ"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/30" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-900/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 pt-32 pb-20 lg:pb-28 w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-white/40 text-xs">•</span>
            <span className="text-white/70 text-xs uppercase tracking-wider font-medium">Юридическая чистота · Под ключ</span>
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/25 text-white px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.25em] mb-6">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>АН «Фаттория» · Сопровождение сделок</span>
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
              Оформление сделки с недвижимостью под ключ
            </h1>

            <p
              className="text-[17px] lg:text-[21px] font-light leading-relaxed max-w-3xl mb-8 text-white/90"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
            >
              Полный комплекс риэлтерских и юридических услуг в Минске: от 12-этапной проверки объекта и истории собственников до расчётов, нотариата и страхования ответственности в Белгосстрах.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/20 text-[11px] uppercase tracking-[0.18em] text-white/80">
              <span className="inline-flex items-center gap-2 font-medium">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                Аттестация Минюста РБ
              </span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium">
                <Shield className="w-3.5 h-3.5 text-purple-300" />
                Белгосстрах 100%
              </span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-300" />
                12 параметров аудита
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
                  { id: 'process', label: 'Этапы оформления' },
                  { id: 'stats', label: 'Гарантии и сроки' },
                  { id: 'audit', label: 'Что мы проверяем' },
                  { id: 'why-us', label: 'Почему нам доверяют' },
                  { id: 'faq', label: 'Вопросы и ответы' },
                  { id: 'contact-form-section', label: 'Заявка на расчёт' },
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
                  href="https://t.me/fattoriaby"
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
                <ShieldCheck className="w-4 h-4" /> Белгосстрах
              </div>
              <p className="text-xs leading-relaxed text-stone-600 mt-2">
                Каждая сделка застрахована в государственной компании «Белгосстрах».
              </p>
              <p className="text-xs leading-relaxed text-stone-600 mt-2">
                Профильные юристы выдают официальное правовое заключение о чистоте объекта.
              </p>
            </div>
          </aside>

          {/* Центральная колонка */}
          <main className="order-2 min-w-0 max-w-[880px] space-y-16">

            {/* 01: ЭТАПЫ */}
            <section id="process" className="scroll-mt-32">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                01 · Пошаговый регламент
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 42px)', lineHeight: 1.15 }}
              >
                Как мы оформляем сделку под ключ
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Чёткий алгоритм из шести этапов гарантирует абсолютную безопасность и экономит ваше время.
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

            {/* 02: STATS */}
            <section id="stats" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                02 · Гарантии и сроки
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Наши обязательства перед вами
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <article className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all text-center">
                  <div className="text-4xl md:text-5xl font-bold text-purple-700 mb-3 font-mono">12</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2">Параметров аудита</div>
                  <p className="text-xs text-stone-500 leading-relaxed font-light">
                    Всесторонняя юридическая экспертиза правоустанавливающих документов и истории объекта.
                  </p>
                </article>

                <article className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all text-center">
                  <div className="text-4xl md:text-5xl font-bold text-purple-700 mb-3 font-mono">100%</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2">Финансовая защита</div>
                  <p className="text-xs text-stone-500 leading-relaxed font-light">
                    Полное страхование профессиональной ответственности риэлтера в Белгосстрах.
                  </p>
                </article>

                <article className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all text-center">
                  <div className="text-3xl md:text-4xl font-bold text-purple-700 mb-3 font-mono">3–5 дней</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2">Срок оформления</div>
                  <p className="text-xs text-stone-500 leading-relaxed font-light">
                    Оперативный сбор справок, подготовка договора и регистрация перехода прав в БРТИ.
                  </p>
                </article>
              </div>
            </section>

            {/* 03: AUDIT */}
            <section id="audit" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                03 · Чек-лист безопасности
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Что мы проверяем перед сделкой
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Исчерпывающий аудит каждого объекта исключает риски оспаривания сделки или появления скрытых претендентов.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {auditParameters.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-white border border-stone-200 rounded-2xl hover:border-purple-200 transition-all">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-purple-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-stone-900 mb-1">{item.title}</h3>
                      <p className="text-xs text-stone-500 leading-relaxed font-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 04: WHY US */}
            <section id="why-us" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                04 · Преимущества
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Почему клиенты доверяют оформление сделок нам
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Мы берем на себя все юридические, организационные и финансовые согласования, гарантируя вам комфорт и абсолютную защиту.
              </p>

              <div className="space-y-5 mb-8">
                {[
                  { title: 'Официальная лицензия и аттестация', text: 'Все риэлтеры имеют квалификационные аттестаты Министерства юстиции РБ.' },
                  { title: 'Прозрачные государственные тарифы', text: 'Работаем строго по утвержденным тарифам без наценок и скрытых комиссий.' },
                  { title: 'Персональный юрист 24/7', text: 'Прямой контакт со специалистом, ведущим вашу сделку от первого звонка до передачи ключей.' },
                ].map((item, i) => (
                  <article key={i} className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-purple-50 border border-purple-200">
                        <span className="text-sm font-bold text-purple-700" style={{ fontFamily: displayFont }}>
                          {i + 1}
                        </span>
                      </div>
                      <h3 className="text-lg font-normal text-stone-900 self-center" style={{ fontFamily: displayFont }}>
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-stone-600 text-[15px] leading-relaxed font-light pl-16">
                      {item.text}
                    </p>
                  </article>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { icon: Building2, title: 'Нотариат и БРТИ', text: 'Бронируем приоритетное время у нотариусов и регистраторов, исключая очереди и задержки.' },
                  { icon: Banknote, title: 'Безопасные расчёты', text: 'Проверка купюр, организация банковской ячейки или безналичного перевода в белорусских рублях.' },
                  { icon: FileCheck, title: 'Правовой аудит', text: 'Детальное письменное заключение о юридической чистоте объекта перед внесением задатка.' },
                  { icon: ShieldCheck, title: 'Страховой полис', text: 'Официальное страховое свидетельство Белгосстрах передаётся вместе с документами на право собственности.' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="p-6 bg-white border border-stone-200 rounded-3xl hover:border-purple-200 transition-all">
                      <Icon className="w-6 h-6 text-purple-700 mb-3" />
                      <h4 className="text-sm font-bold text-stone-900 mb-1.5">{item.title}</h4>
                      <p className="text-xs text-stone-500 leading-relaxed font-light">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 05: FAQ */}
            <section id="faq" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                05 · Частые вопросы
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Ответы ведущих юристов
              </h2>

              <div className="space-y-3">
                {faqs.map((item, i) => {
                  const open = openFaqIndex === i;
                  return (
                    <div key={i} className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaqIndex(open ? null : i)}
                        className="w-full flex items-center justify-between gap-4 text-left p-5 hover:bg-stone-50/50 transition-colors cursor-pointer"
                      >
                        <span className="text-sm font-semibold text-stone-900">{item.q}</span>
                        <ChevronDown
                          className="w-5 h-5 shrink-0 transition-transform text-purple-600"
                          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        />
                      </button>
                      {open && (
                        <p className="text-sm text-stone-600 leading-relaxed px-5 pb-5 font-light border-t border-stone-100 pt-4">
                          {item.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 06: ФОРМА */}
            <section id="contact-form-section" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                06 · Обратная связь
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Рассчитать стоимость сопровождения
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Оставьте контакты — дежурный юрист свяжется с вами, бесплатно проконсультирует и составит план оформления.
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
                    Дежурный специалист агентства «АН Фаттория» свяжется с вами в течение 10 минут.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value || '';
                    const phone = (form.querySelector('[name="phone"]') as HTMLInputElement)?.value || '';
                    const serviceType = (form.querySelector('[name="serviceType"]') as HTMLSelectElement)?.value || 'Полное сопровождение';
                    if (phone) {
                      handleAddLead(name, phone, `Услуга: ${serviceType}`, 'Оформление сделки: Главная форма');
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
                        placeholder="Например, Александр"
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
                      Тип услуги
                    </label>
                    <select
                      name="serviceType"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all cursor-pointer"
                    >
                      <option value="Полное сопровождение под ключ">Полное сопровождение сделки под ключ</option>
                      <option value="Юридическая проверка объекта">Юридическая проверка объекта перед покупкой</option>
                      <option value="Составление и регистрация договора">Составление договора и регистрация в БРТИ</option>
                      <option value="Организация безопасных расчётов">Организация безопасных расчётов</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Комментарий
                    </label>
                    <textarea
                      placeholder="Опишите объект или задачу..."
                      rows={4}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-600/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Получить консультацию юриста</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400">
                    <Lock className="w-3 h-3 text-stone-500" />
                    <span>Конфиденциально · В строгом соответствии с законами РБ</span>
                  </div>
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
                Дежурный юрист ответит на вопросы по сделке и составит план оформления.
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
                  href="https://t.me/fattoriaby"
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
                <ShieldCheck className="w-4 h-4" /> Гарантии
              </div>
              <div className="space-y-2 text-xs text-stone-600">
                <p className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-600" />
                  Страхование в Белгосстрах
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-600" />
                  Правовое заключение юриста
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-600" />
                  Госрегулирование тарифов
                </p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-stone-50 to-stone-100 rounded-3xl border border-stone-200">
              <div className="flex items-center gap-2 text-stone-700 text-[11px] font-bold uppercase tracking-wider mb-3">
                <Clock className="w-4 h-4" /> Сроки
              </div>
              <div className="space-y-1.5 text-xs text-stone-600">
                <p className="flex justify-between">
                  <span>Проверка объекта</span>
                  <span className="font-medium text-stone-900">1–2 дня</span>
                </p>
                <p className="flex justify-between">
                  <span>Сбор справок</span>
                  <span className="font-medium text-stone-900">3–5 дней</span>
                </p>
                <p className="flex justify-between">
                  <span>Регистрация в БРТИ</span>
                  <span className="font-medium text-stone-900">1–5 дней</span>
                </p>
              </div>
            </div>

          </aside>

        </div>
      </div>

    </div>
  );
}