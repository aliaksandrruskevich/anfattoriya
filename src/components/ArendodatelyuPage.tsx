"use client";
import React, { useEffect, useRef, useState } from 'react';
import { PageId } from '../types';
import {
  Star, Users, ShieldCheck, Camera, TrendingUp, CheckCircle,
  Award, BarChart3, Zap, Quote, Calculator,
  ClipboardList, Handshake, FileCheck, Plus, Minus, Calendar,
  Building2, Warehouse, Store, Briefcase, Search, Phone,
  CreditCard, FileText, Scale, Megaphone, Target, Eye, Clipboard,
  UserCheck, Banknote, Landmark, MapPin, Clock, Mail
} from 'lucide-react';

interface ArendodatelyuPageProps {
  activePage: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
}

/* Акцентный цвет этой страницы — приглушённый аметист вместо
   фирменной латуни, по отдельному запросу. Переменные оставлены
   с прежними именами (brass/brassLight), чтобы не трогать сотню
   мест использования ниже — меняется только палитра. */
const brass = '#8B6FB3';
const brassLight = '#D9C7EC';
const paper = '#F6F3EC';
const displayFont = "'Cormorant Garamond', 'Raleway', serif";

function useFonts() {
  useEffect(() => {
    if (document.getElementById('hp-fonts')) return;
    const link = document.createElement('link');
    link.id = 'hp-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Raleway:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);
}

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: 'opacity 0.8s cubic-bezier(.16,1,.3,1), transform 0.8s cubic-bezier(.16,1,.3,1)',
    }}>
      {children}
    </div>
  );
}

function Eyebrow({ children, dark = false, center = false }: { children: React.ReactNode; dark?: boolean; center?: boolean }) {
  return (
    <div className={`flex items-center gap-3 mb-4 ${center ? 'justify-center' : ''}`}>
      <span className="w-8 h-px" style={{ backgroundColor: brass }} />
      <span className="text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: dark ? brassLight : brass, fontFamily: 'Raleway, sans-serif' }}>
        {children}
      </span>
      {center && <span className="w-8 h-px" style={{ backgroundColor: brass }} />}
    </div>
  );
}

export default function ArendodatelyuPage({ activePage, navigateTo, handleAddLead }: ArendodatelyuPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);
  const [selectedType, setSelectedType] = useState<'office' | 'retail' | 'warehouse'>('office');
  useFonts();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value || '';
    const phone = (form.querySelector('[name="phone"]') as HTMLInputElement)?.value || '';
    if (phone) { handleAddLead(name, phone, `Арендодатель коммерческой: ${selectedType}`, 'Страница Арендодателю коммерческой'); form.reset(); }
  };

  const commercialTypes = [
    {
      id: 'office' as const,
      icon: <Building2 className="w-8 h-8" />,
      title: 'Офисные помещения',
      desc: 'Бизнес-центры класса А/В/С, отдельные кабинеты, open-space. Арендаторы: IT-компании, банки, консалтинг.',
      avgRate: '15–35 €/м²',
      demand: 'Высокий',
    },
    {
      id: 'retail' as const,
      icon: <Store className="w-8 h-8" />,
      title: 'Торговые площади',
      desc: 'Street-retail, помещения в ТЦ, шоу-румы. Арендаторы: ритейл, общепит, сфера услуг.',
      avgRate: '20–60 €/м²',
      demand: 'Очень высокий',
    },
    {
      id: 'warehouse' as const,
      icon: <Warehouse className="w-8 h-8" />,
      title: 'Складские комплексы',
      desc: 'Сухие склады, холодные склады, производственные базы. Арендаторы: логистика, производство, дистрибуция.',
      avgRate: '4–10 €/м²',
      demand: 'Стабильный',
    },
  ];

  const benefits = [
    { icon: <Search className="w-7 h-7" />, title: 'Поиск арендаторов среди бизнеса', desc: 'Прямой поиск и отбор арендаторов среди компаний, ищущих коммерческие площади. Прямой контакт с руководителями и собственниками бизнеса.' },
    { icon: <Scale className="w-7 h-7" />, title: 'Юридическая экспертиза арендатора', desc: 'Проверка компании через базу Минюста, налоговой и ЕГР. Исключаем фирмы-однодневки и неплатёжеспособных арендаторов.' },
    { icon: <FileText className="w-7 h-7" />, title: 'Договор аренды с защитой собственника', desc: 'Составляем договор с жёсткими санкциями за просрочку платежей, страховым депозитом и штрафами за досрочное расторжение.' },
    { icon: <Megaphone className="w-7 h-7" />, title: 'Маркетинг на B2B-площадках', desc: 'Размещение на специализированных коммерческих порталах, таргетированная реклама на собственников бизнеса, рассылка по базе брокеров.' },
    { icon: <Camera className="w-7 h-7" />, title: 'Профессиональная презентация', desc: 'Фотосъёмка широкоформатной оптикой, план помещений, визуализация зонирования под разные типы арендаторов.' },
    { icon: <Handshake className="w-7 h-7" />, title: 'Переговоры и торг от вашего имени', desc: 'Ведём переговоры с потенциальными арендаторами, обосновываем ставку, фиксируем выгодные условия в протоколе разногласий.' },
  ];

  const steps = [
    {
      day: 'День 1',
      title: 'Аудит объекта и стратегия',
      icon: <Clipboard className="w-6 h-6" />,
      items: [
        'Выезд на объект и технический аудит',
        'Расчёт рыночной арендной ставки по реальным сделкам и рынку',
        'Определение целевого портрета арендатора',
        'Разработка стратегии позиционирования',
      ]
    },
    {
      day: 'День 1-2',
      title: 'Подготовка и реклама',
      icon: <Camera className="w-6 h-6" />,
      items: [
        'Профессиональная фотосъёмка',
        'Составление коммерческого предложения',
        'Размещение на 10+ B2B-площадках',
        'Таргетированная реклама на арендаторов',
      ]
    },
    {
      day: 'День 3-5',
      title: 'Показы и переговоры',
      icon: <Users className="w-6 h-6" />,
      items: [
        'Организация просмотров с потенциальными арендаторами',
        'Сбор коммерческих предложений',
        'Проверка платёжеспособности компаний',
        'Переговоры по условиям и ставке',
      ]
    },
    {
      day: 'Финал',
      title: 'Договор и заселение',
      icon: <FileCheck className="w-6 h-6" />,
      items: [
        'Составление договора аренды с защитой собственника',
        'Фиксация страхового депозита',
        'Подписание акта приёма-передачи',
        'Передача ключей и документации',
      ]
    },
  ];

  const documents = [
    { title: 'Правоустанавливающие документы', items: ['Свидетельство о регистрации права', 'Технический паспорт БРТИ', 'Выписка из ЕГРНИ'] },
    { title: 'Документы собственника', items: ['Паспорт (для физлиц)', 'Устав и приказ о назначении директора (для юрлиц)', 'Согласие всех собственников'] },
    { title: 'Техническая документация', items: ['Поэтажный план', 'Экспликация помещений', 'Справка о мощности электросети', 'Акт разграничения балансовой принадлежности'] },
  ];

  const guarantees = [
    { icon: <Award className="w-6 h-6" />, title: 'Аттестация Минюста РБ', desc: 'Все специалисты имеют государственную аттестацию и многолетний опыт работы с коммерческой недвижимостью.' },
    { icon: <ShieldCheck className="w-6 h-6" />, title: 'Страховка Белгосстрах', desc: 'Профессиональная ответственность застрахована на 10 000 базовых величин.' },
    { icon: <Banknote className="w-6 h-6" />, title: 'Страховой депозит', desc: 'Фиксируем в договоре депозит в размере 1–3 месячных ставок аренды для защиты от порчи имущества.' },
    { icon: <Target className="w-6 h-6" />, title: 'Проверка арендатора', desc: 'Комплексная проверка юрлица: учредители, суды, задолженности, история арендных отношений.' },
  ];

  const faqItems = [
    { q: 'Какие коммерческие объекты вы сдаёте?', a: 'Офисы в бизнес-центрах и административных зданиях, торговые помещения (street-retail и в ТЦ), складские комплексы, производственные базы, помещения свободного назначения. Работаем с площадями от 20 до 10 000+ м².' },
    { q: 'Сколько стоит услуга для арендодателя коммерческой недвижимости?', a: 'Стоимость рассчитывается по государственным тарифам РБ. Для арендодателей коммерческой недвижимости: подбор арендатора с оформлением договора — от 2 700 BYN. Консультация и анализ рынка — от 135 BYN. Точная смета — после аудита объекта.' },
    { q: 'Как вы проверяете арендаторов-юрлиц?', a: 'Запрашиваем выписку из ЕГР, проверяем учредителей и директора через базу Минюста (судимости, банкротства), анализируем финансовую отчётность, проверяем наличие текущих судебных споров и задолженностей по налогам.' },
    { q: 'Как быстро находится арендатор на коммерческое помещение?', a: 'Средний срок сделки — 26 дней, минимальный — 2 дня. Ликвидные помещения в центре могут находить арендатора за несколько дней, а крупные складские комплексы требуют индивидуального подбора.' },
    { q: 'Какие гарантии, что арендатор не съедет через месяц?', a: 'В договоре фиксируется минимальный срок аренды (обычно 11 месяцев с пролонгацией), страховой депозит в размере 1–3 месячных ставок, штрафные санкции за досрочное расторжение и обязательство восстановительного ремонта.' },
    { q: 'Вы помогаете с согласованием перепланировки под арендатора?', a: 'Да. В штате есть специалист по согласованию перепланировок. Поможем арендатору узаконить изменения, не нарушая конструктив здания и ваши интересы как собственника.' },
  ];

  return (
    <div className="animate-fade-in" style={{ fontFamily: 'Raleway, sans-serif' }}>

      {/* ================= HERO ================= */}
      <div className="relative min-h-[92vh] flex items-center overflow-hidden" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/55 to-black/90" />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-32">
          <div className="max-w-3xl">
            <Eyebrow dark>Коммерческая недвижимость для арендодателей</Eyebrow>
            <h1 className="text-white leading-[1.08] mb-6" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(40px, 6.5vw, 68px)' }}>
              Сдайте офис, склад или торговое помещение <span style={{ color: brassLight, fontStyle: 'italic' }}>по максимальной ставке</span>
            </h1>
            <p className="text-white/60 leading-relaxed mb-10 max-w-2xl text-[17px] lg:text-[19px]">
              Находим платёжеспособных арендаторов среди проверенных компаний, готовим коммерческое предложение, 
              ведём переговоры и составляем договор с полной защитой ваших интересов как собственника.
            </p>

            <div className="flex flex-wrap gap-x-8 gap-y-3 mb-12 text-sm text-white/50">
              <div className="flex items-center gap-2"><Building2 className="w-4 h-4" style={{ color: brassLight }} /> Бизнес-центры и офисы</div>
              <div className="flex items-center gap-2"><Store className="w-4 h-4" style={{ color: brassLight }} /> Торговые площади</div>
              <div className="flex items-center gap-2"><Warehouse className="w-4 h-4" style={{ color: brassLight }} /> Склады и производство</div>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-wrap items-center gap-3 max-w-3xl">
              <input name="name" type="text" placeholder="Ваше имя" className="flex-1 min-w-[140px] px-5 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/50 text-sm transition-all" />
              <input name="phone" type="tel" placeholder="Номер телефона *" required className="flex-1 min-w-[140px] px-5 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/50 text-sm transition-all" />
              <button type="submit" className="px-9 py-4 rounded-lg text-black font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5 shadow-[0_8px_24px_rgba(139,111,179,0.4)] whitespace-nowrap" style={{ backgroundColor: brass }}>
                Получить консультацию
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ================= TYPES OF COMMERCIAL ================= */}
      <div className="w-full bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <Eyebrow center>Выберите тип вашего объекта</Eyebrow>
            <h2 className="text-neutral-900 mb-4" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(32px, 5vw, 50px)' }}>Какую недвижимость сдаём</h2>
            <p className="text-stone-500 text-sm mb-12 max-w-2xl mx-auto">Специализируемся на трёх ключевых сегментах коммерческой недвижимости Минска.</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {commercialTypes.map((type) => (
              <Reveal key={type.id}>
                <button
                  onClick={() => setSelectedType(type.id)}
                  className="w-full text-left p-8 rounded-md transition-all duration-300 hover:-translate-y-1"
                  style={{
                    backgroundColor: selectedType === type.id ? '#fff' : paper,
                    border: selectedType === type.id ? `2px solid ${brass}` : `1px solid ${brass}22`,
                    boxShadow: selectedType === type.id ? '0 8px 30px rgba(139,111,179,0.15)' : 'none',
                  }}
                >
                  <div className="mb-4" style={{ color: brass }}>{type.icon}</div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">{type.title}</h3>
                  <p className="text-xs text-stone-500 leading-relaxed mb-4">{type.desc}</p>
                  <div className="flex gap-4 pt-4 border-t" style={{ borderColor: `${brass}22` }}>
                    <div>
                      <span className="text-[9px] text-stone-400 uppercase font-bold block">Средняя ставка</span>
                      <span className="text-sm font-bold text-neutral-900">{type.avgRate}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-stone-400 uppercase font-bold block">Спрос</span>
                      <span className="text-sm font-bold" style={{ color: brass }}>{type.demand}</span>
                    </div>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>

          {/* Selected type details */}
          <Reveal>
            <div className="rounded-md p-8 lg:p-10" style={{ backgroundColor: paper, border: `1px solid ${brass}22` }}>
              <h3 className="text-lg font-bold text-neutral-900 mb-4">
                {selectedType === 'office' && 'Особенности сдачи офисов в Минске'}
                {selectedType === 'retail' && 'Особенности сдачи торговых помещений'}
                {selectedType === 'warehouse' && 'Особенности сдачи складов'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-stone-600">
                {selectedType === 'office' && (
                  <>
                    <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: brass }} /> <span>Работаем с бизнес-центрами всех классов: А, В, С</span></div>
                    <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: brass }} /> <span>Пул арендаторов: IT, финансы, консалтинг, телеком</span></div>
                    <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: brass }} /> <span>Оцениваем транспортную доступность и инфраструктуру</span></div>
                    <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: brass }} /> <span>Анализируем парковочный коэффициент и пешеходный трафик</span></div>
                  </>
                )}
                {selectedType === 'retail' && (
                  <>
                    <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: brass }} /> <span>Street-retail на первой линии — премиальный сегмент</span></div>
                    <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: brass }} /> <span>Помещения в ТЦ — арендаторы: федеральные и локальные сети</span></div>
                    <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: brass }} /> <span>Оцениваем витринность, трафик и якорных арендаторов</span></div>
                    <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: brass }} /> <span>Рассчитываем коэффициент конверсии для ритейла</span></div>
                  </>
                )}
                {selectedType === 'warehouse' && (
                  <>
                    <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: brass }} /> <span>Сухие склады класса А и В в Минском районе</span></div>
                    <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: brass }} /> <span>Арендаторы: логистические операторы, дистрибьюторы, производства</span></div>
                    <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: brass }} /> <span>Оцениваем мощность электросети и высоту потолков</span></div>
                    <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: brass }} /> <span>Анализируем подъездные пути и возможность заезда фур</span></div>
                  </>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ================= BENEFITS ================= */}
      <div className="py-20 lg:py-28" style={{ backgroundColor: paper }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <Eyebrow center>Почему собственники выбирают нас</Eyebrow>
            <h2 className="text-neutral-900 mb-14" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(32px, 5vw, 50px)' }}>Сдавать коммерческую с нами — выгодно и безопасно</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border" style={{ borderColor: `${brass}44`, borderStyle: 'dashed' }}>
            {benefits.map((c, i) => (
              <Reveal key={i}>
                <div className="h-full p-8 lg:p-10 min-h-[240px] flex flex-col bg-white" style={{ borderRight: (i + 1) % 3 !== 0 ? `1px dashed ${brass}44` : 'none', borderBottom: i < 3 ? `1px dashed ${brass}44` : 'none' }}>
                  <div className="mb-5" style={{ color: brass }}>{c.icon}</div>
                  <h3 className="text-neutral-900 text-base font-semibold mb-3">{c.title}</h3>
                  <p className="text-stone-500 text-xs leading-relaxed">{c.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ================= STEPS ================= */}
      <div className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <Eyebrow center>От аудита до договора</Eyebrow>
            <h2 className="text-neutral-900 mb-14" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(32px, 5vw, 50px)' }}>Как мы работаем с коммерческими объектами</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((step, i) => (
              <Reveal key={i} className="group relative transition-all duration-300 hover:-translate-y-1">
                <div className="h-full" style={{ backgroundColor: paper, border: `1px solid ${brass}22`, borderRadius: '2px', padding: '2rem' }}>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${brass}18`, color: brass }}>{step.icon}</div>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: brass }}>{step.day}</span>
                  </div>
                  <h4 className="text-neutral-900 text-lg font-semibold mb-4">{step.title}</h4>
                  <ul className="space-y-2.5">
                    {step.items.map((it, j) => (
                      <li key={j} className="flex items-center gap-2.5 text-xs text-stone-500">
                        <CheckCircle className="w-4 h-4 shrink-0" style={{ color: brass }} /> {it}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ================= DOCUMENTS ================= */}
      <div className="py-20 lg:py-28" style={{ backgroundColor: paper }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <Eyebrow center>Готовим заранее</Eyebrow>
            <h2 className="text-neutral-900 mb-4" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(32px, 5vw, 50px)' }}>Какие документы нужны для сдачи</h2>
            <p className="text-stone-500 text-sm mb-14 max-w-2xl mx-auto">Подготовьте этот пакет заранее — и мы найдём арендатора в 2 раза быстрее.</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {documents.map((doc, i) => (
              <Reveal key={i}>
                <div className="h-full p-7 bg-white rounded-md border" style={{ borderColor: `${brass}33` }}>
                  <h4 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: brass }} /> {doc.title}
                  </h4>
                  <ul className="space-y-2">
                    {doc.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-stone-500">
                        <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: brass }} /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ================= GUARANTEES ================= */}
      <div className="bg-white py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <Eyebrow center>Ваша безопасность</Eyebrow>
            <h2 className="text-neutral-900 mb-16" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(32px, 5vw, 50px)' }}>Гарантии для собственников коммерческой недвижимости</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {guarantees.map((item, i) => (
              <Reveal key={i} className="group rounded-md hover:-translate-y-1 transition-all duration-500">
                <div className="h-full p-7" style={{ backgroundColor: paper, border: `1px solid ${brass}22`, borderRadius: '2px' }}>
                  <div className="w-11 h-11 rounded-full text-white flex items-center justify-center mb-5" style={{ backgroundColor: '#1a1a1a' }}>{item.icon}</div>
                  <h3 className="text-neutral-900 mb-3 uppercase tracking-wider text-xs font-semibold">{item.title}</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ================= FAQ ================= */}
      <div className="bg-black py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <Eyebrow dark center>Остались вопросы</Eyebrow>
            <h2 className="text-white mb-14" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(32px, 5vw, 50px)' }}>Часто задаваемые вопросы</h2>
          </Reveal>
          <Reveal>
            <div className="space-y-3">
              {faqItems.map((item, i) => (
                <div key={i} className="rounded-lg overflow-hidden border transition-colors" style={{ borderColor: openFaq === i ? brass : 'rgba(255,255,255,0.12)' }}>
                  <button onClick={() => toggleFaq(i)} className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors">
                    <span className="text-[15px] font-semibold text-white pr-6">{item.q}</span>
                    {openFaq === i ? <Minus className="w-5 h-5 shrink-0" style={{ color: brassLight }} /> : <Plus className="w-5 h-5 text-white/40 shrink-0" />}
                  </button>
                  {openFaq === i && <div className="px-6 pb-6"><p className="text-[14.5px] text-white/50 leading-relaxed">{item.a}</p></div>}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

    </div>
  );
}