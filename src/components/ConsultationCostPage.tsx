"use client";
import React, { useState } from 'react';
import { PageId } from '../types';
import {
  Scale, ShieldCheck, CheckCircle, FileCheck2, BadgeCheck,
  ArrowRight, Clock, Award, Users, ChevronDown, MapPin,
  Home, Building2, Handshake, Phone, Send, MessageCircle, Plus,
  FileText, Banknote, Lock, Star,
} from 'lucide-react';

interface Props {
  activePage: PageId;
  navigateTo: (p: PageId) => void;
  handleAddLead: (n: string, ph: string, e: string, s: string) => void;
}

const displayFont = "'Cormorant Garamond', 'Georgia', serif";
const bodyFont = "'Raleway', system-ui, sans-serif";

const HERO_PHOTO = '/photo/stati.jpg';

export default function ConsultationCostPage({ activePage, navigateTo, handleAddLead }: Props) {
  const [formSent, setFormSent] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const keyPoints = [
    { icon: Scale, title: 'Государственные тарифы', text: 'Стоимость риэлтерских услуг регулируется государством. Агентство не вправе брать больше установленного максимума.' },
    { icon: BadgeCheck, title: 'Комиссия от 1,5% до 6%', text: 'Процент зависит от стоимости объекта. Чем выше цена недвижимости — тем ниже процент комиссии.' },
    { icon: ShieldCheck, title: 'Оплата по факту сделки', text: 'Вы платите только после успешного завершения сделки. Без предоплаты «за воздух».' },
    { icon: FileCheck2, title: 'Без двойной оплаты', text: 'По закону исключена ситуация, когда обе стороны платят полную комиссию за одну и ту же сделку.' },
  ];

  const whatIncluded = [
    'Оценка рыночной стоимости объекта',
    'Подбор покупателей или вариантов',
    'Организация и проведение показов',
    'Юридическая проверка чистоты объекта',
    'Подготовка и согласование договора',
    'Сопровождение до регистрации права',
  ];

  const serviceTypes = [
    { icon: Home, title: 'Квартиры и комнаты', text: 'Продажа, покупка, обмен. Полное сопровождение сделки от показа до регистрации.' },
    { icon: Building2, title: 'Коммерческая недвижимость', text: 'Офисы, торговые площади, склады. Работа с юрлицами и собственниками.' },
    { icon: Handshake, title: 'Консультации и документы', text: 'Письменные консультации, подготовка документов, помощь при регистрации.' },
  ];

  const dealSteps = [
    { step: '01', title: 'Обращение и разбор', desc: 'Выясняем задачу: объект, сроки, обременения, доли. Определяем порядок работы.', duration: '1 день' },
    { step: '02', title: 'Оценка и стратегия', desc: 'Анализируем рынок, фиксируем цену и план продвижения или подбора.', duration: '1–2 дня' },
    { step: '03', title: 'Показы и переговоры', desc: 'Организуем просмотры, ведём переговоры, согласуем условия сделки.', duration: 'по ситуации' },
    { step: '04', title: 'Проверка и документы', desc: 'Юридический аудит, сбор справок, подготовка договора.', duration: '3–7 дней' },
    { step: '05', title: 'Нотариус и регистрация', desc: 'Удостоверение договора, подача в БРТИ, взаиморасчёт и передача ключей.', duration: '1–5 дней' },
  ];

  const faqs = [
    { q: 'Может ли риэлтер взять больше, чем указано в тарифе?', a: 'Нет. Предельные тарифы установлены государством. Агентство не вправе требовать сумму выше максимума.' },
    { q: 'Когда нужно платить комиссию?', a: 'Как правило — по факту оказания услуги, после государственной регистрации перехода права. Предоплата не является обязательной.' },
    { q: 'Кто оплачивает — продавец или покупатель?', a: 'Тот, кто заключил договор с агентством. Чаще продавец платит за сопровождение продажи, покупатель — за подбор. Стороны могут договориться иначе.' },
    { q: 'Что входит в комиссию, а что платится отдельно?', a: 'Комиссия покрывает работу риэлтера: подбор, проверку, переговоры, подготовку документов. Отдельно — госпошлина, услуги нотариуса, техпаспорт.' },
    { q: 'Можно ли снизить процент?', a: 'Да. Тариф задаёт верхнюю границу. Итоговый размер можно обсудить индивидуально, особенно при комплексной сделке.' },
    { q: 'Как проверить, что риэлтер работает легально?', a: 'Попросите лицензию агентства, аттестат специалиста и договор с указанием тарифа. Номер лицензии должен быть на сайте и в договоре.' },
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
          alt="Стоимость риэлтерских услуг АН «Фаттория»"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/30" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-900/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 pt-32 pb-20 lg:pb-28 w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-white/40 text-xs">•</span>
            <span className="text-white/70 text-xs uppercase tracking-wider font-medium">Тарифы и стоимость</span>
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/25 text-white px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.25em] mb-6">
              <Scale className="w-3.5 h-3.5 text-purple-400" />
              <span>АН «Фаттория» · Стоимость услуг</span>
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
              Комиссия риэлтера от 1,5% до 6%
            </h1>

            <p
              className="text-[17px] lg:text-[21px] font-light leading-relaxed max-w-3xl mb-8 text-white/90"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
            >
              Стоимость риэлтерских услуг регулируется государством. Точный процент зависит от стоимости объекта: чем выше цена — тем ниже ставка. Оплата — только по факту совершения сделки.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/20 text-[11px] uppercase tracking-[0.18em] text-white/80">
              <span className="inline-flex items-center gap-2 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Без предоплаты
              </span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium">
                <Award className="w-3.5 h-3.5 text-purple-300" />
                Без двойной оплаты
              </span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium">
                <BadgeCheck className="w-3.5 h-3.5 text-purple-300" />
                Фиксированный максимум
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
                  { id: 'key-points', label: 'Что важно о тарифах' },
                  { id: 'included', label: 'Что входит в работу' },
                  { id: 'services', label: 'Для каких сделок' },
                  { id: 'process', label: 'Как проходит сделка' },
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
                  <span>Расчёт</span>
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
                <ShieldCheck className="w-4 h-4" /> Госрегулирование
              </div>
              <p className="text-xs leading-relaxed text-stone-600 mt-2">
                Предельные тарифы на риэлтерские услуги установлены государством.
              </p>
              <p className="text-xs leading-relaxed text-stone-600 mt-2">
                Агентство не вправе требовать сумму выше установленного максимума.
              </p>
            </div>
          </aside>

          {/* Центральная колонка */}
          <main className="order-2 min-w-0 max-w-[880px] space-y-16">

            {/* 01: КЛЮЧЕВЫЕ ФАКТЫ */}
            <section id="key-points" className="scroll-mt-32">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                01 · Прозрачные условия
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 42px)', lineHeight: 1.15 }}
              >
                Что важно знать о тарифах
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Стоимость риэлтерских услуг регулируется государством. Точный процент зависит от стоимости объекта.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-6 bg-white rounded-3xl border border-stone-200 text-center">
                  <p className="text-3xl md:text-4xl mb-2 font-light text-purple-700" style={{ fontFamily: displayFont }}>
                    1,5–6%
                  </p>
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                    комиссия от стоимости
                  </p>
                </div>
                <div className="p-6 bg-white rounded-3xl border border-stone-200 text-center">
                  <p className="text-3xl md:text-4xl mb-2 font-light text-purple-700" style={{ fontFamily: displayFont }}>
                    по факту
                  </p>
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                    оплата после сделки
                  </p>
                </div>
                <div className="p-6 bg-white rounded-3xl border border-stone-200 text-center">
                  <p className="text-3xl md:text-4xl mb-2 font-light text-purple-700" style={{ fontFamily: displayFont }}>
                    0
                  </p>
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                    скрытых доплат
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {keyPoints.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <article
                      key={i}
                      className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-purple-50 border border-purple-200">
                          <Icon className="w-5 h-5 text-purple-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-normal text-stone-900 mb-1" style={{ fontFamily: displayFont }}>
                            {item.title}
                          </h3>
                        </div>
                      </div>
                      <p className="text-stone-600 text-[15px] leading-relaxed font-light pl-16">
                        {item.text}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* 02: ЧТО ВХОДИТ */}
            <section id="included" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                02 · Состав услуги
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Что входит в работу риэлтера
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Комиссия покрывает полный цикл сопровождения — от оценки и поиска до регистрации права собственности.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {whatIncluded.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-stone-200 hover:border-purple-200 transition-all">
                    <CheckCircle className="w-4 h-4 shrink-0 text-purple-600" />
                    <span className="text-sm text-stone-800 font-light">{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigateTo('services-agentstva')}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 hover:text-purple-900 transition"
              >
                Все услуги агентства
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </section>

            {/* 03: ВИДЫ УСЛУГ */}
            <section id="services" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                03 · Направления
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Для каких сделок применяется тариф
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {serviceTypes.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <article key={i} className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-5 bg-purple-50 border border-purple-200">
                        <Icon className="w-5 h-5 text-purple-700" />
                      </div>
                      <h3 className="text-base font-normal text-stone-900 mb-2" style={{ fontFamily: displayFont }}>
                        {item.title}
                      </h3>
                      <p className="text-sm text-stone-600 leading-relaxed font-light">{item.text}</p>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* 04: ЭТАПЫ СДЕЛКИ */}
            <section id="process" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                04 · Регламент
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Как проходит сделка
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Понятный порядок на каждом этапе — без сюрпризов по срокам и документам.
              </p>

              <div className="space-y-5">
                {dealSteps.map((item, idx) => (
                  <article
                    key={idx}
                    className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-purple-50 border border-purple-200">
                        <span className="text-sm font-bold text-purple-700" style={{ fontFamily: displayFont }}>
                          {item.step}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="text-lg font-normal text-stone-900" style={{ fontFamily: displayFont }}>
                            {item.title}
                          </h3>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> {item.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-stone-600 text-[15px] leading-relaxed font-light pl-16">
                      {item.desc}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            {/* 05: КАК ПРОВЕРИТЬ РИЭЛТЕРА */}
            <section className="pt-8 border-t border-stone-200">
              <div className="p-7 bg-gradient-to-br from-purple-50 to-stone-50 rounded-3xl border border-purple-200/70">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-white border border-purple-200">
                    <BadgeCheck className="w-5 h-5 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-normal text-stone-900 mb-1" style={{ fontFamily: displayFont }}>
                      Как убедиться, что перед вами легальный риэлтер
                    </h3>
                    <p className="text-sm text-stone-500 font-light">
                      Перед оплатой попросите три документа — это займёт минуту и защитит от недобросовестных посредников.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-16">
                  {[
                    { title: 'Лицензия агентства', text: 'На риэлтерскую деятельность, выданная Минюстом.' },
                    { title: 'Аттестат риэлтера', text: 'Личный документ специалиста, ведущего вашу сделку.' },
                    { title: 'Договор на услуги', text: 'С указанием тарифа в рамках государственных норм.' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white border border-stone-200 rounded-2xl p-4">
                      <FileCheck2 className="w-4 h-4 text-purple-600 mb-2" />
                      <p className="text-xs text-stone-800 font-semibold mb-1">{item.title}</p>
                      <p className="text-[11px] text-stone-500 font-light leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 06: FAQ */}
            <section id="faq" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                05 · Частые вопросы
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Ответы о тарифах и оплате
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

              <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-6">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                <span>Работаем по всей Беларуси. Не нашли ответ — задайте вопрос в форме ниже.</span>
              </div>
            </section>

            {/* 07: ФОРМА ЗАЯВКИ */}
            <section id="contact-form-section" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                06 · Обратная связь
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Рассчитаем стоимость под вашу сделку
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Оставьте контакты — перезвоним, уточним задачу и назовём ориентировочную сумму комиссии.
              </p>

              {formSent ? (
                <div className="p-10 bg-purple-50 border border-purple-200 rounded-3xl text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <p className="text-xl font-normal text-stone-900" style={{ fontFamily: displayFont }}>
                    Заявка отправлена
                  </p>
                  <p className="text-stone-600 text-sm font-light">
                    Мы перезвоним в ближайшее время и назовём ориентировочную стоимость.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value || '';
                    const phone = (form.querySelector('[name="phone"]') as HTMLInputElement)?.value || '';
                    if (phone) {
                      handleAddLead(name || 'Интересант', phone, 'Заявка: консультация по стоимости риэлтерских услуг', 'Страница тарифов');
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
                        placeholder="Например, Ирина"
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
                      Комментарий
                    </label>
                    <textarea
                      placeholder="Опишите объект или задачу — рассчитаем точнее..."
                      rows={4}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-600/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Получить расчёт</span>
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
                Рассчитать комиссию
              </h3>
              <p className="text-xs text-stone-500 mb-6 font-light leading-relaxed">
                Позвоните — уточним параметры объекта и назовём ориентировочную стоимость.
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
                <Banknote className="w-4 h-4" /> Тариф вкратце
              </div>
              <div className="space-y-2 text-xs text-stone-600">
                <p className="flex justify-between">
                  <span>Комиссия</span>
                  <span className="font-semibold text-stone-900">1,5–6%</span>
                </p>
                <p className="flex justify-between">
                  <span>Предоплата</span>
                  <span className="font-semibold text-stone-900">нет</span>
                </p>
                <p className="flex justify-between">
                  <span>Оплата</span>
                  <span className="font-semibold text-stone-900">по факту</span>
                </p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-stone-50 to-stone-100 rounded-3xl border border-stone-200">
              <div className="flex items-center gap-2 text-stone-700 text-[11px] font-bold uppercase tracking-wider mb-3">
                <Lock className="w-4 h-4" /> Гарантии
              </div>
              <div className="space-y-1.5 text-xs text-stone-600">
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-purple-600" />
                  Госрегулирование тарифов
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-purple-600" />
                  Договор с фиксированной суммой
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-purple-600" />
                  Ответственность застрахована
                </p>
              </div>
            </div>

          </aside>

        </div>
      </div>

    </div>
  );
}