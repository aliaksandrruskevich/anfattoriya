"use client";
import React, { useState } from 'react';
import { useApp } from '@/app/Providers';
import { PageId, Agent } from '../types';
import {
  Building2, ArrowRight, Check, Phone, Award, ShieldCheck,
  Users, TrendingUp, FileCheck, Star, Plus, Minus, Target,
  HeartHandshake, Lock, Clock, Sparkles, BarChart3, Calendar,
  MapPin, Send, MessageCircle, ChevronDown, Home, Scale,
} from 'lucide-react';

interface AboutPageProps {
  activePage: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
  agentsList?: Agent[];
  onViewProfile?: (agent: Agent) => void;
}

const displayFont = "'Cormorant Garamond', 'Georgia', serif";
const bodyFont = "'Raleway', system-ui, sans-serif";

const HERO_PHOTO = '/photo/999.jpg';

export default function AboutPage({ handleAddLead: propHandleAddLead, navigateTo: propNavigateTo }: Partial<AboutPageProps>) {
  const { addLead } = useApp();
  const handleAddLead = propHandleAddLead || addLead;
  const navigateTo = propNavigateTo;

  const [formSent, setFormSent] = useState(false);
  const [deal, setDeal] = useState<'sell' | 'buy'>('sell');
  const [tip, setTip] = useState<number | null>(0);
  const [faq, setFaq] = useState<number | null>(0);

  const numbers = [
    { value: '2022', label: 'год основания', icon: Calendar },
    { value: '1424+', label: 'клиентов выбрали нас', icon: Users },
    { value: '0', label: 'оспоренных сделок', icon: ShieldCheck },
    { value: '26 дн.', label: 'средний срок (мин. 2 дня)', icon: Clock },
  ];

  const principles = [
    { icon: ShieldCheck, title: 'Безопасность', desc: 'Каждая сделка проходит трёхэтапную юридическую проверку. Ответственность застрахована в Белгосстрахе на 10 000 базовых величин.' },
    { icon: FileCheck, title: 'Прозрачность', desc: 'Работаем по государственным тарифам. Вы платите только за результат, без скрытых комиссий.' },
    { icon: Lock, title: 'Конфиденциальность', desc: 'Мы не разглашаем данные клиентов и условия договоров. Сделка остаётся между её участниками.' },
    { icon: HeartHandshake, title: 'Постоянная связь', desc: 'Персональный риэлтер и юрист на связи на всех этапах: от первой консультации до передачи ключей.' },
  ];

  const sell = [
    { title: 'Бесплатная оценка', desc: 'Анализируем реестр реальных сделок НКА и БРТИ, а не объявления конкурентов.' },
    { title: 'Подготовка объекта', desc: 'Профессиональные фото, описание, подготовка к показам.' },
    { title: 'Реклама', desc: 'Публикация на ведущих площадках и подбор целевых покупателей.' },
    { title: 'Показы и торг', desc: 'Риэлтер берёт на себя звонки, показы и переговоры.' },
    { title: 'Юридическая чистота', desc: 'Трёхэтапная проверка, подготовка договора, нотариус.' },
    { title: 'Расчёт и ключи', desc: 'Безопасные расчёты, регистрация, передаточный акт.' },
  ];
  const buy = [
    { title: 'Консультация', desc: 'Фиксируем бюджет, район и критерии, сразу отсекаем лишнее.' },
    { title: 'Персональный подбор', desc: 'Актуальные объекты каталога и новые предложения сразу после обращения собственника.' },
    { title: 'Показы', desc: 'Маршрут, сопровождение и честный разбор минусов объекта.' },
    { title: 'Проверка чистоты', desc: 'История объекта, собственники, обременения. Всё до аванса.' },
    { title: 'Сделка и переезд', desc: 'Расчёты, регистрация, помощь с коммунальными услугами.' },
  ];
  const steps = deal === 'sell' ? sell : buy;

  const compare = [
    ['Цена', 'По объявлениям соседей', 'По реестру реальных сделок НКА'],
    ['Показы', 'Десятки часов лично', 'Берёт на себя риэлтер'],
    ['Юридическая проверка', 'Своими силами', 'Три этапа, юрист'],
    ['Охват рынка', '2–3 площадки', 'Ведущие площадки и подбор покупателей'],
    ['Торг', 'Один на один', 'Профессиональный посредник'],
    ['Риск срыва', 'Высокий', '0 оспоренных сделок'],
  ];

  const years = [
    { year: '2022', title: 'Основание', desc: 'Лицензия Минюста РБ №02240/446. Открытие офиса на ул. Репина.' },
    { year: '2023', title: 'CRM и коммерция', desc: 'Внедрение собственной CRM-системы и отдела коммерческой недвижимости.' },
    { year: '2024', title: 'Рост доверия', desc: 'Расширение команды аттестованных риэлтеров и развитие юридической экспертизы.' },
    { year: '2025', title: 'Рейтинг 5.0', desc: 'Высокие оценки клиентов на Google Maps и репутация надёжного агентства Минска.' },
    { year: '2026', title: '1424+ клиентов', desc: '1424+ клиентов выбрали нас для своих сделок. Средний срок — 26 дней, минимальный — 2 дня.' },
  ];

  const tips = [
    { q: 'Как правильно установить цену?', a: 'Объявления конкурентов часто завышены на 10–15%, поэтому мы на них не опираемся. Оценщик берёт данные реальных завершённых сделок из реестра НКА и БРТИ за 3 месяца и учитывает этаж, вид, состояние и транспорт.' },
    { q: 'Какие документы нужны для продажи?', a: 'Выписка из ЕГРНИ, паспорт, справка об отсутствии задолженностей, техпаспорт. При несовершеннолетних собственниках нужно разрешение опеки. Полный список готовит наш юрист.' },
    { q: 'Нужно ли платить налог при продаже?', a: 'Зависит от срока владения и от того, единственное ли это жильё. Юрист рассчитает вашу ситуацию на бесплатной консультации.' },
    { q: 'Что проверять на просмотре?', a: 'Состояние стояков, историю затоплений, лифт и интерком, шумоизоляцию вечером и обязательно историю переходов права по объекту.' },
  ];

  const faqs = [
    { q: 'Как давно компания на рынке?', a: 'С 2022 года. Лицензия Министерства юстиции РБ №02240/446 от 11.07.2022. 1424+ клиентов выбрали нас для своих сделок и ни одной оспоренной.' },
    { q: 'Какие услуги вы предоставляете?', a: 'Полный цикл: продажа и покупка квартир, домов и коммерции, срочный выкуп, обмен, аренда, юридические консультации, оценка, согласование перепланировок.' },
    { q: 'Сколько стоит услуга?', a: 'По государственным тарифам (Постановление №754). Оплата только по факту сделки. Точная сумма известна после оценки объекта.' },
    { q: 'Где находится офис?', a: 'Центральный офис: г. Минск, ул. Репина, д. 4, пом. 458.' },
    { q: 'Как проверяете юридическую чистоту?', a: 'Три этапа: анализ документов, запросы в госорганы, финальная верификация юристом.' },
    { q: 'Можно ли продать квартиру удалённо?', a: 'Да. Оформляем нотариальную доверенность на территории РБ, и риэлтер ведёт сделку от показов до передачи ключей.' },
    { q: 'Сколько занимает продажа?', a: 'Средний срок — 26 дней, минимальный — 2 дня. Срок зависит от точности оценки и состояния объекта.' },
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
          alt="Агентство недвижимости АН Фаттория, Минск"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/30" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-900/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 pt-32 pb-20 lg:pb-28 w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-white/40 text-xs">•</span>
            <span className="text-white/70 text-xs uppercase tracking-wider font-medium">Об агентстве</span>
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/25 text-white px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.25em] mb-6">
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              <span>АН «Фаттория» · С 2022 года</span>
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
              Мы делаем сделки безопасными и понятными
            </h1>

            <p
              className="text-[17px] lg:text-[21px] font-light leading-relaxed max-w-3xl mb-8 text-white/90"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
            >
              С 2022 года сопровождаем покупку и продажу недвижимости в Минске. Юристы, оценщики и аттестованные риэлтеры работают под одной крышей.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/20 text-[11px] uppercase tracking-[0.18em] text-white/80">
              <span className="inline-flex items-center gap-2 font-medium">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                1424+ клиентов выбрали нас
              </span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                0 оспоренных сделок
              </span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium">
                <Clock className="w-3.5 h-3.5 text-purple-300" />
                Средний срок — 26 дней (мин. 2 дня)
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
                  { id: 'about', label: 'О компании' },
                  { id: 'principles', label: 'Наши принципы' },
                  { id: 'process', label: 'Как мы работаем' },
                  { id: 'compare', label: 'Самостоятельно или с нами' },
                  { id: 'history', label: 'Путь агентства' },
                  { id: 'tips', label: 'Полезно знать' },
                  { id: 'faq', label: 'Вопросы и ответы' },
                  { id: 'contact-form-section', label: 'Заявка' },
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
                <Award className="w-4 h-4" /> Лицензия Минюста
              </div>
              <p className="text-xs leading-relaxed text-stone-600 mt-2">
                Лицензия №02240/446 от 11.07.2022.
              </p>
              <p className="text-xs leading-relaxed text-stone-600 mt-2">
                Ответственность застрахована в РУП «Белгосстрах».
              </p>
            </div>
          </aside>

          {/* Центральная колонка */}
          <main className="order-2 min-w-0 max-w-[880px] space-y-16">

            {/* 01: О КОМПАНИИ */}
            <section id="about" className="scroll-mt-32">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                01 · О компании
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 42px)', lineHeight: 1.15 }}
              >
                Агентство недвижимости «АН Фаттория»
              </h2>

              <article className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm mb-8">
                <p className="text-stone-600 text-[15px] leading-relaxed font-light mb-4">
                  Утро риэлтера начинается с планёрки: новые заявки, распределение показов, обзор рынка за ночь. Днём встречи с собственниками, выезды на оценку, переговоры. Вечером CRM и документы к завтрашним сделкам.
                </p>
                <p className="text-stone-600 text-[15px] leading-relaxed font-light">
                  Раз в неделю команда разбирает сложные случаи. Именно эта практика сохраняет главный результат: с 2022 года у нас нет ни одной оспоренной сделки.
                </p>
              </article>

              {/* ЦИФРЫ */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {numbers.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="p-6 bg-white rounded-3xl border border-stone-200 text-center hover:border-purple-200 transition-all">
                      <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center mx-auto mb-3">
                        <Icon className="w-4 h-4 text-purple-700" />
                      </div>
                      <div className="text-2xl md:text-3xl font-light text-stone-900 mb-1" style={{ fontFamily: displayFont }}>
                        {item.value}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-purple-700 font-semibold">
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => navigateTo?.('vybrat-agenta' as PageId)}
                className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 hover:text-purple-900 transition"
              >
                Наша команда
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </section>

            {/* 02: ПРИНЦИПЫ */}
            <section id="principles" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                02 · Наши принципы
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Четыре правила, которые мы не нарушаем
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {principles.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <article key={i} className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-5 bg-purple-50 border border-purple-200">
                        <Icon className="w-5 h-5 text-purple-700" />
                      </div>
                      <h3 className="text-lg font-normal text-stone-900 mb-3" style={{ fontFamily: displayFont }}>
                        {item.title}
                      </h3>
                      <p className="text-sm text-stone-600 leading-relaxed font-light">{item.desc}</p>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* 03: ПРОЦЕСС */}
            <section id="process" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                03 · Процесс
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                От звонка до ключей
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-6 font-light">
                Вы всегда знаете, что происходит на текущем этапе и что будет дальше.
              </p>

              {/* Переключатель */}
              <div className="inline-flex mb-8 bg-stone-50 rounded-2xl border border-stone-200 p-1">
                {(['sell', 'buy'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setDeal(t)}
                    className={`px-6 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                      deal === t
                        ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {t === 'sell' ? 'Продаёте' : 'Покупаете'}
                  </button>
                ))}
              </div>

              <div className="space-y-5">
                {steps.map((item, i) => (
                  <article
                    key={`${deal}-${i}`}
                    className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all"
                  >
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-purple-50 border border-purple-200">
                        <span className="text-sm font-bold text-purple-700" style={{ fontFamily: displayFont }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h3 className="text-lg font-normal text-stone-900 self-center" style={{ fontFamily: displayFont }}>
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-stone-600 text-[15px] leading-relaxed font-light pl-16">
                      {item.desc}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            {/* 04: СРАВНЕНИЕ */}
            <section id="compare" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                04 · Сравнение
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Самостоятельно или с нами
              </h2>

              <div className="overflow-x-auto rounded-3xl border border-stone-200 shadow-sm bg-white">
                <table className="w-full min-w-[620px] text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-900 text-[11px] uppercase tracking-[0.18em]">
                      <th className="p-5 font-semibold text-white/60">Параметр</th>
                      <th className="p-5 font-semibold text-white/60">Самостоятельно</th>
                      <th className="p-5 font-semibold text-purple-300">АН Фаттория</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compare.map((r, i) => (
                      <tr key={i} className="border-t border-stone-100">
                        <td className="p-5 text-stone-900" style={{ fontFamily: displayFont, fontSize: 17, fontWeight: 400 }}>
                          {r[0]}
                        </td>
                        <td className="p-5 text-sm text-stone-400 font-light">{r[1]}</td>
                        <td className="p-5 text-sm font-semibold text-stone-900 bg-purple-50/40">{r[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 05: ИСТОРИЯ */}
            <section id="history" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                05 · История
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Путь агентства
              </h2>

              <div className="space-y-5">
                {years.map((item, i) => (
                  <article key={i} className="p-7 bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-16 h-12 rounded-full flex items-center justify-center shrink-0 bg-purple-50 border border-purple-200">
                        <span className="text-sm font-bold text-purple-700" style={{ fontFamily: displayFont }}>
                          {item.year}
                        </span>
                      </div>
                      <h3 className="text-lg font-normal text-stone-900 self-center" style={{ fontFamily: displayFont }}>
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-stone-600 text-[15px] leading-relaxed font-light pl-20">
                      {item.desc}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            {/* 06: ПОЛЕЗНО ЗНАТЬ */}
            <section id="tips" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                06 · Экспертиза
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Полезно знать
              </h2>

              <div className="space-y-3">
                {tips.map((item, i) => {
                  const open = tip === i;
                  return (
                    <div key={i} className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setTip(open ? null : i)}
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

            {/* 07: FAQ */}
            <section id="faq" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                07 · Частые вопросы
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Ответы о работе агентства
              </h2>

              <div className="space-y-3">
                {faqs.map((item, i) => {
                  const open = faq === i;
                  return (
                    <div key={i} className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setFaq(open ? null : i)}
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

            {/* 08: ФОРМА */}
            <section id="contact-form-section" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-purple-700">
                08 · Обратная связь
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Оставить заявку
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Оставьте контакты — перезвоним, ответим на вопросы о работе агентства и подберём специалиста под вашу задачу.
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
                    Мы перезвоним в течение 15 минут.
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
                      handleAddLead(name, phone, 'Заявка со страницы «О компании»', 'О компании');
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
                      Комментарий
                    </label>
                    <textarea
                      placeholder="Опишите вашу задачу или вопрос..."
                      rows={4}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-600/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Отправить заявку</span>
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
                Работаем ежедневно. Ответим на вопросы о работе агентства и услугах.
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