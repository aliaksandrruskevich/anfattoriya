"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Shield, Award, CheckCircle2, ChevronDown, 
  Clock, FileText, Phone, Building2, Home, Store, 
  Layers, Globe2, Sparkles, Scale, AlertTriangle, KeyRound,
  Check, Star, Calendar, Share2, Bookmark, ArrowUpRight,
  TrendingUp, Users, CheckCircle, HelpCircle, BadgeCheck,
  Send, MessageCircle, MapPin
} from 'lucide-react';
import { PageId } from '../types';

interface ProdazhaNedvizhimostiPageProps {
  activePage?: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
}

const displayFont = "'Cormorant Garamond', 'Georgia', serif";
const bodyFont = "'Raleway', system-ui, sans-serif";
const borderLine = '#E7E2DA';

const HERO_PHOTO = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1920';

const TOC_ITEMS = [
  { id: 'directions', label: 'Направления продаж' },
  { id: 'experience', label: 'Опыт «Фаттории» с 2022 года' },
  { id: 'analytics', label: 'Аналитика и цены 2022–2026' },
  { id: 'roadmap', label: '9 этапов сделки под ключ' },
  { id: 'marketing', label: 'Маркетинг и фотосъемка' },
  { id: 'safety', label: 'Юридические гарантии' },
  { id: 'tariffs', label: 'Тарифы и комиссия Минюста' },
  { id: 'faq', label: 'Частые вопросы продавцов' },
];

export default function ProdazhaNedvizhimostiPage({ navigateTo, handleAddLead }: ProdazhaNedvizhimostiPageProps) {
  const [activeId, setActiveId] = useState<string>('directions');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [leadSent, setLeadSent] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formObjType, setFormObjType] = useState('Квартира');
  const [formDistrict, setFormDistrict] = useState('');

  useEffect(() => {
    const els = TOC_ITEMS.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { rootMargin: '-15% 0px -65% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPhone.trim()) return;
    handleAddLead(
      formName.trim() || 'Продавец недвижимости',
      formPhone.trim(),
      `Объект: ${formObjType}. Район/Локация: ${formDistrict || 'Минск'}. Запрос с раздела Продажи`,
      'prodazha-nedvizhimosti'
    );
    setLeadSent(true);
    setTimeout(() => {
      setLeadSent(false);
      setFormName('');
      setFormPhone('');
      setFormDistrict('');
    }, 4500);
  };

  const saleDirections = [
    {
      title: 'Продажа квартир в Минске',
      slug: 'prodazha-kvartiry',
      desc: 'Вторичный фонд, улучшенные планировки, сталинки в центре и новые ЖК (Минск-Мир, Новая Боровая, Левада, D3). От хоум-стейджинга до получения расчетных документов в БТИ.',
      photo: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
      badge: 'Срок сделки от 14 дней',
      features: ['Глубокая проверка истории приватизации', 'Профессиональный фотосет без искажений', 'Альтернативные цепочки любой длины']
    },
    {
      title: 'Загородные дома, коттеджи и дачи',
      slug: 'prodazha-doma-dachi',
      desc: 'Престижные пригороды (Дроздово, Ратомка, Колодищи, Тарасово), дачные товарищества и участки под ИЖС. Аудит земельных границ, коммуникаций и консервации.',
      photo: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
      badge: 'Съемка 4K ',
      features: ['Сверка фактических границ по кадастру', 'Проверка техпаспорта и ввода коммуникаций', 'Презентация экологического окружения']
    },
    {
      title: 'Коммерческая недвижимость',
      slug: 'prodazha-pomescheniya',
      desc: 'Street retail, офисные этажи, склады, производственные базы и готовый арендный бизнес с подтвержденной доходностью (Cap Rate от 9% годовых).',
      photo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
      badge: 'Пул проверенных инвесторов',
      features: ['Финансовый аудит арендного потока', 'Инвестиционный меморандум для банков', 'Безналичные расчеты и налоговый аудит']
    },
    {
      title: 'Комнаты и доли в квартирах',
      slug: 'prodazha-komnaty-doli',
      desc: 'Безукоризненное соблюдение ст. 253 Гражданского кодекса РБ. Нотариальные извещения сособственников, отказы, определение порядка пользования комнатами.',
      photo: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800',
      badge: 'Юридическая безупречность',
      features: ['Досудебное урегулирование споров', 'Официальные почтовые и нотариальные вызовы', 'Снятие рисков оспаривания сделки']
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Глубокий рыночный аудит и оценка по реальным сделкам',
      desc: 'Мы не опираемся на завышенные «хотелки» из частных объявлений. С 2022 года наши эксперты анализируют закрытую базу фактических сделок Национального кадастрового агентства (НКА) за последние 90 дней, определяя реальную максимальную цену продажи.'
    },
    {
      num: '02',
      title: 'Юридическая экспертиза документов и истории объекта',
      desc: 'Аттестованные юристы проверяют всю архивную цепочку переходов права, лицевые счета, отсутствие обременений, арестов, скрытых прав третьих лиц и наследников.'
    },
    {
      num: '03',
      title: 'Профессиональный хоум-стейджинг и интерьерная съемка',
      desc: 'Специалист готовит объект к съемке: убирает визуальный шум, выставляет правильный свет. Проводим интерьерную съемку на широкоугольную оптику и создаем виртуальный 3D-тур.'
    },
    {
      num: '04',
      title: 'Масштабный маркетинг на 14 ведущих площадках',
      desc: 'Объект размещается на Realt.by, Onliner, Kufar с платным премиум-продвижением. Подключаются таргетированные кампании и закрытая рассылка по внутренней базе из 1 200+ покупателей.'
    },
    {
      num: '05',
      title: 'Фильтрация праздных звонков и защита покоя продавца',
      desc: 'Риэлтер принимает сотни звонков, отсеивает зевак, неплатежеспособных покупателей и стажеров других агентств. На показ приходят только проверенные мотивированные клиенты.'
    },
    {
      num: '06',
      title: 'Профессиональные переговоры и удержание цены',
      desc: 'Опытный переговорщик защищает стартовую стоимость объекта, оперируя реальными фактами и достоинствами ремонта, не позволяя сбивать цену при первом же торге.'
    },
    {
      num: '07',
      title: 'Заключение предварительного договора и задаток',
      desc: 'Фиксируем твердые сроки выхода на сделку, перечень остающейся мебели и техники, условия освобождения и финансовую ответственность сторон соглашением о задатке.'
    },
    {
      num: '08',
      title: 'Безопасные взаиморасчеты и регистрация в БТИ',
      desc: 'Организуем расчет через банковские ячейки, безотзывные аккредитивы или безналичные счета в белорусских рублях по согласованному курсу. Лично сопровождаем подписания в БТИ.'
    },
    {
      num: '09',
      title: 'Подписание передаточного акта и вручение ключей',
      desc: 'Контролируем снятие с регистрационного учета всех проживающих лиц, сверяем показания счетчиков и закрываем лицевые счета. Сделка считается завершенной только при отсутствии претензий.'
    }
  ];

  const faqItems = [
    {
      q: 'Сколько лет АН «Фаттория» работает на рынке недвижимости Беларуси?',
      a: 'Агентство недвижимости «Фаттория» успешно осуществляет профессиональную риэлтерскую деятельность с 2022 года. За более чем 4 года работы мы провели сотни сделок любой сложности: от типовых однокомнатных квартир до элитных усадеб, долей и крупных коммерческих объектов. Наша деятельность полностью застрахована, а риэлтеры имеют государственные аттестаты Министерства юстиции РБ.'
    },
    {
      q: 'Каков официальный размер комиссии агентства при продаже?',
      a: 'В Республике Беларусь тарифы на риэлтерские услуги строго регламентированы законодательством и постановлениями Совета Министров РБ. Ставка комиссии составляет от 1.5% до 6% в зависимости от рыночной стоимости и сложности объекта. Все тарифы предельно прозрачны, фиксируются в официальном договоре и оплачиваются только по факту успешно завершенной сделки.'
    },
    {
      q: 'Почему продавать через АН «Фаттория» выгоднее, чем самостоятельно?',
      a: 'Практика с 2022 года показывает: при самостоятельной продаже собственники теряют в среднем от 5% до 10% от реальной стоимости из-за неверного позиционирования, неумения вести жесткие ценовые переговоры и боязни потерять единственного покупателя. Мы обеспечиваем максимальный охват рынка, создаем здоровую конкуренцию покупателей и продаем объект по верхней планке цен.'
    },
    {
      q: 'Как вы защищаете расчеты между продавцом и покупателем?',
      a: 'Мы исключаем любые серые расчеты. Взаиморасчеты производятся через банковские расчетные счета, депозитарные ячейки или аккредитивы в соответствии с законодательством Республики Беларусь. Переход права собственности в РУП «Минское городское агентство по государственной регистрации и земельному кадастру» регистрируется только после выполнения финансовых обязательств.'
    },
    {
      q: 'Что делать, если в продаваемой квартире есть неузаконенная перепланировка?',
      a: 'Юристы АН «Фаттория» проведут аудит изменений. Если перепланировка допустима (например, объединение санузла или перенос не несущей перегородки), мы поможем оперативно согласовать ее в администрации района до сделки либо подготовим юридически грамотный пакет документов для регистрации.'
    },
    {
      q: 'Можно ли продать недвижимость, если собственник находится за границей?',
      a: 'Да. С сентября 2023 года вступил в силу Указ Президента РБ № 278, согласно которому сделки по отчуждению недвижимости по доверенности возможны только на основании доверенностей, оформленных на территории Республики Беларусь. Мы помогаем грамотно организовать процедуру, подготовить объект и безопасно провести расчеты.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#171412]" style={{ fontFamily: bodyFont }}>
      
      {/* 1. EDITORIAL HERO BANNER (без фиолетовых фильтров) */}
      <section className="relative overflow-hidden bg-neutral-950 text-white min-h-[520px] lg:min-h-[620px] flex items-end">
        <img
          src={HERO_PHOTO}
          alt="Продажа недвижимости в Минске"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.04]"
        />
        {/* Чистый натуральный контрастный градиент без фиолета */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/30" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 pt-32 pb-20 lg:pb-28 w-full">
          {/* Breadcrumb / Back */}
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/"
              className="bg-black/60 backdrop-blur-md border border-white/20 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] px-4 py-2 rounded-full text-white/90 hover:text-white hover:bg-black/80 transition-all"
            >
              ← На главную
            </Link>
            <span className="text-white/40 text-xs">•</span>
            <span className="text-white/70 text-xs uppercase tracking-wider font-medium">Раздел «Продажа»</span>
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/25 text-white px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.25em] mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>АН «Фаттория» · Работаем на рынке с 2022 года</span>
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
              Продажа недвижимости в Минске и Беларуси на максимальных рыночных условиях
            </h1>

            <p
              className="text-[17px] lg:text-[21px] font-light leading-relaxed max-w-3xl mb-8 text-white/90"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
            >
              С 2022 года обеспечиваем безопасные сделки купли-продажи квартир, загородных домов, долей и коммерческих площадей. Государственный регламент комиссии от 1.5% до 6%, закрытая база из 1 200+ покупателей и средний срок экспозиции 21 день.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/20 text-[11px] uppercase tracking-[0.18em] text-white/80">
              <span className="inline-flex items-center gap-2 font-medium"><Calendar className="w-3.5 h-3.5 text-amber-400" /> На рынке с 2022 года</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium"><Shield className="w-3.5 h-3.5 text-emerald-400" /> Страхование ответственности</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium"><Scale className="w-3.5 h-3.5 text-sky-400" /> Тарифы Минюста 1.5%–6%</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2 font-medium"><Clock className="w-3.5 h-3.5 text-amber-300" /> Срок сделки от 14 дней</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ELEVATED EDITORIAL SHEET */}
      <div
        className="relative -mt-10 lg:-mt-14 rounded-t-[36px] lg:rounded-t-[50px] bg-white border-t border-[#E7E2DA] shadow-2xl z-20"
      >
        <div className="max-w-[1520px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_340px] gap-10 xl:gap-14 pt-12 lg:pt-16 pb-20">
          
          {/* Левая колонка: Содержание раздела + Инструменты */}
          <aside className="lg:sticky lg:top-28 lg:h-fit space-y-6 order-1">
            <div className="bg-stone-50/90 p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] mb-4 pb-3 border-b border-stone-200 text-stone-900">
                Содержание раздела
              </div>
              <nav className="space-y-1">
                {TOC_ITEMS.map((item, i) => {
                  const on = activeId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                      className="flex w-full items-start gap-2.5 text-left text-[13px] leading-snug py-2 px-2.5 rounded-lg transition-all hover:text-stone-900 cursor-pointer"
                      style={on ? { color: '#171412', background: '#EAE6DF', fontWeight: 600 } : { color: '#6B645C' }}
                    >
                      <span className="mt-[2px] text-[10px] font-semibold tabular-nums text-amber-800">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick action bar */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-800">
                Быстрые действия
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  className="flex-1 py-2 px-3 text-[11px] font-semibold uppercase tracking-wider rounded-xl border border-stone-300 bg-white hover:border-stone-400 transition-all flex items-center justify-center gap-1.5"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-600 text-amber-600' : 'text-stone-600'}`} />
                  <span>{bookmarked ? 'В закладках' : 'Сохранить'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-2 px-3 text-[11px] font-semibold uppercase tracking-wider rounded-xl border border-stone-300 bg-white hover:border-stone-400 transition-all flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-stone-600" />
                  <span>{shareCopied ? 'Скопировано' : 'Поделиться'}</span>
                </button>
              </div>
            </div>

            {/* Доверие и стаж */}
            <div className="p-5 bg-gradient-to-br from-amber-50 to-stone-100 rounded-2xl border border-amber-200/70 text-stone-800">
              <div className="flex items-center gap-2 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Award className="w-4 h-4" /> Надежность АН «Фаттория»
              </div>
              <p className="text-xs leading-relaxed text-stone-600">
                Работаем с 2022 года. За это время 98.4% выставленных нами объектов проданы по стартовой цене или выше.
              </p>
            </div>
          </aside>

          {/* Центральная колонка: Полноценные редакционные материалы */}
          <main className="order-2 min-w-0 max-w-[880px] space-y-16">
            
            {/* 01: НАПРАВЛЕНИЯ ПРОДАЖ */}
            <section id="directions" className="scroll-mt-32">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                01 · Специализация
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 42px)', lineHeight: 1.15 }}
              >
                Все ключевые направления продаж в одном агентстве
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Каждый объект уникален. Поэтому в АН «Фаттория» продажами занимаются узкопрофильные специалисты: эксперты по жилым кварталам Минска, оценщики загородных коттеджей, юристы по долевой собственности и специалисты по инвестиционной коммерции.
              </p>

              <div className="space-y-6">
                {saleDirections.map((dir, idx) => (
                  <div
                    key={idx}
                    className="group bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)]"
                  >
                    <div className="relative h-56 md:h-full overflow-hidden bg-stone-100">
                      <img
                        src={dir.photo}
                        alt={dir.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 bg-black/75 backdrop-blur-md text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                        {dir.badge}
                      </span>
                    </div>

                    <div className="p-6 md:p-8 flex flex-col justify-between">
                      <div>
                        <h3
                          className="text-stone-900 text-xl md:text-2xl font-normal mb-3 group-hover:text-amber-900 transition-colors"
                          style={{ fontFamily: displayFont }}
                        >
                          {dir.title}
                        </h3>
                        <p className="text-stone-600 text-sm leading-relaxed mb-5 font-light">
                          {dir.desc}
                        </p>
                        <div className="space-y-2 mb-6">
                          {dir.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-2 text-xs text-stone-700">
                              <CheckCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                        <Link
                          href={`/${dir.slug}`}
                          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900 hover:text-amber-700 transition-colors group-hover:translate-x-1 duration-200"
                        >
                          <span>Подробнее о направлении</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            setFormObjType(dir.title.split(' ')[1] || 'Недвижимость');
                            document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-900"
                        >
                          Оценить объект
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 02: ОПЫТ АН ФАТТОРИЯ С 2022 ГОДА */}
            <section id="experience" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                02 · Практика и доверие
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Мы работаем на рынке недвижимости с 2022 года
              </h2>
              <div className="prose text-stone-600 text-[16px] leading-relaxed font-light space-y-4">
                <p>
                  Агентство недвижимости «Фаттория» основано в 2022 году группой аттестованных риэлтеров и судебных юристов по жилищному праву Республики Беларусь. За время нашей деятельности мы сформировали безупречную деловую репутацию, решая задачи любой правовой сложности.
                </p>
                <p>
                  Рынок недвижимости Беларуси последних лет прошел через серьезные законодательные трансформации: новые государственные тарифы на риэлтерские услуги (постановление Совета Министров), правила отчуждения по доверенности в рамках Указа Президента № 278, изменение порядка взаиморасчетов и усиление налогового контроля. Накопленный с 2022 года опыт позволяет нам предвосхищать любые юридические риски и гарантировать 100% юридическую чистоту каждой закрытой сделки.
                </p>
              </div>

              {/* Инфографика цифр */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 text-center">
                  <div className="text-3xl font-light text-stone-900 mb-1" style={{ fontFamily: displayFont }}>
                    с 2022
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">
                    Год основания
                  </div>
                </div>
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 text-center">
                  <div className="text-3xl font-light text-stone-900 mb-1" style={{ fontFamily: displayFont }}>
                    1 200+
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">
                    Покупателей в CRM
                  </div>
                </div>
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 text-center">
                  <div className="text-3xl font-light text-stone-900 mb-1" style={{ fontFamily: displayFont }}>
                    21 день
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">
                    Средний срок выхода
                  </div>
                </div>
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 text-center">
                  <div className="text-3xl font-light text-stone-900 mb-1" style={{ fontFamily: displayFont }}>
                    100%
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">
                    Страхование сделок
                  </div>
                </div>
              </div>
            </section>

            {/* 03: АНАЛИТИКА РЫНКА */}
            <section id="analytics" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                03 · Аналитический подход
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Как определить максимальную рыночную цену без демпинга
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-6 font-light">
                Главная ошибка продавцов — ориентироваться на цены объявлений на популярных порталах. В объявлениях указаны ожидания других продавцов, часто завышенные на 8–15%, которые месяцами не находят покупателя.
              </p>

              {/* Фото вставки высокого качества с подписью */}
              <div className="my-8 rounded-3xl overflow-hidden border border-stone-200 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1600"
                  alt="Интерьер премиальной квартиры в Минске"
                  className="w-full h-80 object-cover"
                />
                <div className="p-4 bg-stone-50 text-xs text-stone-500 flex items-center justify-between border-t border-stone-200">
                  <span>Реальный объект, проданный экспертами АН «Фаттория» в жилом комплексе «Левада»</span>
                  <span className="font-semibold text-stone-700">Срок продажи: 18 дней</span>
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-6 space-y-3">
                <h4 className="text-stone-900 font-semibold text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-800" />
                  Формула максимальной цены от АН «Фаттория»:
                </h4>
                <ul className="text-sm text-stone-700 space-y-2 leading-relaxed">
                  <li>• <strong>Реестр реальных сделок БТИ:</strong> берем цену завершенных договоров в вашем микрорайоне за последние 3 месяца.</li>
                  <li>• <strong>Оценка конкурентного окружения:</strong> анализируем все активные альтернативы, которые прямо сейчас смотрит ваш покупатель.</li>
                  <li>• <strong>Коэффициент стейджинга:</strong> визуально подготовленная квартира продается на 4–7% дороже неухоженных аналогов.</li>
                  <li>• <strong>Стартовая стратегия:</strong> выставляем объект по верхней границе коридора спроса, организуя поток просмотров в первые 10 дней.</li>
                </ul>
              </div>
            </section>

            {/* 04: 9 ЭТАПОВ СДЕЛКИ */}
            <section id="roadmap" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                04 · Регламент работы
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                9 этапов продажи недвижимости под ключ
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Прозрачность на каждом шаге. Вы всегда точно знаете, что происходит с вашим объектом прямо сейчас.
              </p>

              <div className="space-y-4">
                {steps.map((st) => (
                  <div
                    key={st.num}
                    className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm flex items-start gap-5 hover:border-amber-700/40 transition-colors"
                  >
                    <span className="text-2xl font-light text-amber-800 tabular-nums shrink-0 pt-0.5" style={{ fontFamily: displayFont }}>
                      {st.num}
                    </span>
                    <div>
                      <h4 className="text-stone-900 font-semibold text-base mb-1.5">
                        {st.title}
                      </h4>
                      <p className="text-stone-600 text-sm leading-relaxed font-light">
                        {st.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 05: МАРКЕТИНГ И ФОТОСЪЕМКА */}
            <section id="marketing" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                05 · Визуальный продакшн
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Маркетинг, который привлекает платежеспособных покупателей
              </h2>
              <p className="text-stone-600 text-[16px] leading-relaxed mb-8 font-light">
                Темные снимки на телефон и захламленные комнаты отпугивают покупателей с «живыми деньгами». Мы создаем презентацию европейского уровня, подчеркивающую статус объекта.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6">
                <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=800"
                    alt="Естественный свет в интерьере"
                    className="w-full h-52 object-cover"
                  />
                  <div className="p-4 bg-stone-50">
                    <h5 className="font-semibold text-stone-900 text-sm mb-1">Световые сценарии</h5>
                    <p className="text-xs text-stone-600 leading-relaxed font-light">Съемка в «золотой час» раскрывает объемы и планировочные достоинства жилья.</p>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800"
                    alt="Детали и сервировка интерьера"
                    className="w-full h-52 object-cover"
                  />
                  <div className="p-4 bg-stone-50">
                    <h5 className="font-semibold text-stone-900 text-sm mb-1">Интерьерный стайлинг</h5>
                    <p className="text-xs text-stone-600 leading-relaxed font-light">Аккуратные детали и живые растения создают ощущение ухоженного, дорогого дома.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 06: ЮРИДИЧЕСКИЕ ГАРАНТИИ И ТАРИФЫ */}
            <section id="safety" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                06 · Безопасность
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                100% юридическая защита продавца
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm flex items-start gap-4">
                  <Shield className="w-6 h-6 text-emerald-700 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-stone-900 text-sm mb-1">Страховой полис БРУСП «Белгосстрах»</h4>
                    <p className="text-xs text-stone-600 leading-relaxed font-light">Каждая сделка агентства защищена обязательным государственным страхованием профессиональной ответственности.</p>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm flex items-start gap-4">
                  <Scale className="w-6 h-6 text-sky-700 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-stone-900 text-sm mb-1">Аттестованные Минюстом риэлтеры</h4>
                    <p className="text-xs text-stone-600 leading-relaxed font-light">Специалисты имеют подтвержденные идентификационные пластиковые карточки и лицензии Министерства юстиции РБ.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 07: ТАРИФЫ МИНЮСТА */}
            <section id="tariffs" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                07 · Стоимость услуг
              </div>
              <h2
                className="text-stone-900 mb-4 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Государственные тарифы на услуги при продаже
              </h2>
              <p className="text-stone-600 text-[15px] leading-relaxed mb-6 font-light">
                Комиссионное вознаграждение регулируется действующим постановлением Совета Министров Республики Беларусь. Оплата осуществляется исключительно в белорусских рублях после совершения сделки в БТИ.
              </p>

              <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-stone-100 text-stone-900 font-semibold border-b border-stone-200">
                    <tr>
                      <th className="p-4">Стоимость объекта (в базовых величинах)</th>
                      <th className="p-4">Предельная ставка комиссии</th>
                      <th className="p-4">Условия оплаты</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700 font-light">
                    <tr>
                      <td className="p-4">До 4 200 базовых величин</td>
                      <td className="p-4 font-medium text-stone-900">до 6.0%</td>
                      <td className="p-4">По факту регистрации перехода права</td>
                    </tr>
                    <tr>
                      <td className="p-4">От 4 201 до 5 000 БВ</td>
                      <td className="p-4 font-medium text-stone-900">до 5.0%</td>
                      <td className="p-4">По факту регистрации перехода права</td>
                    </tr>
                    <tr>
                      <td className="p-4">От 5 001 до 5 800 БВ</td>
                      <td className="p-4 font-medium text-stone-900">до 4.5%</td>
                      <td className="p-4">По факту регистрации перехода права</td>
                    </tr>
                    <tr>
                      <td className="p-4">От 5 801 до 6 600 БВ</td>
                      <td className="p-4 font-medium text-stone-900">до 4.0%</td>
                      <td className="p-4">По факту регистрации перехода права</td>
                    </tr>
                    <tr>
                      <td className="p-4">Свыше 16 600 базовых величин</td>
                      <td className="p-4 font-medium text-stone-900">от 1.5% до 2.0%</td>
                      <td className="p-4">Индивидуальный расчет по прейскуранту</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 08: FAQ */}
            <section id="faq" className="scroll-mt-32 pt-8 border-t border-stone-200">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] mb-2 text-amber-800">
                08 · Ответы на вопросы
              </div>
              <h2
                className="text-stone-900 mb-6 font-normal tracking-tight"
                style={{ fontFamily: displayFont, fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.18 }}
              >
                Часто задаваемые вопросы продавцов недвижимости
              </h2>

              <div className="space-y-3">
                {faqItems.map((item, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border border-stone-200 overflow-hidden transition-all shadow-sm"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/80 transition-colors"
                      >
                        <span className="font-semibold text-stone-900 text-sm sm:text-base leading-snug">
                          {item.q}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-stone-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-800' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-stone-600 text-sm leading-relaxed font-light border-t border-stone-100">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Итоговый призыв к действию */}
            <div className="p-8 lg:p-10 rounded-3xl bg-stone-900 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 max-w-xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400 mb-2 inline-block">
                  С 2022 года в Минске
                </span>
                <h3 className="text-2xl sm:text-3xl font-normal mb-3" style={{ fontFamily: displayFont }}>
                  Хотите узнать точную стоимость вашего объекта сегодня?
                </h3>
                <p className="text-stone-300 text-sm leading-relaxed mb-6 font-light">
                  Оставьте заявку на бесплатную экспертную оценку. Наш ведущий специалист изучит реестр сделок БТИ и предоставит подробный аналитический отчет в течение 2 часов.
                </p>
                <button
                  onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-3.5 bg-white text-stone-900 text-xs font-bold uppercase tracking-wider rounded-full hover:bg-stone-100 transition-all cursor-pointer shadow-lg"
                >
                  Заказать бесплатную оценку
                </button>
              </div>
            </div>

          </main>

          {/* Правая колонка: Sticky Форма захвата заявки + Карточка дежурного риэлтера */}
          <aside className="order-3 lg:col-start-2 xl:col-start-3 xl:row-start-1 xl:sticky xl:top-28 xl:h-fit space-y-6">
            
            {/* Форма заявки */}
            <div id="lead-form" className="p-7 bg-white rounded-3xl border border-stone-200 shadow-md">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-800 mb-2">
                Экспресс-заявка
              </div>
              <h3 className="text-stone-900 text-xl font-normal mb-2" style={{ fontFamily: displayFont }}>
                Бесплатная оценка объекта
              </h3>
              <p className="text-xs text-stone-500 mb-6 font-light leading-relaxed">
                Перезвоним в течение 10 минут, ответим на вопросы и рассчитаем максимальную рыночную стоимость.
              </p>

              {leadSent ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-semibold text-emerald-900 text-sm">Заявка принята!</div>
                  <p className="text-xs text-emerald-700 font-light">
                    Дежурный риэлтер свяжется с вами в течение 10 минут.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Тип объекта
                    </label>
                    <select
                      value={formObjType}
                      onChange={(e) => setFormObjType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                    >
                      <option value="Квартира">Квартира (вторичка / новостройка)</option>
                      <option value="Дом / Коттедж">Дом / Коттедж / Дача</option>
                      <option value="Комната / Доля">Комната / Доля в квартире</option>
                      <option value="Коммерческая">Коммерческое помещение</option>
                      <option value="Участок">Земельный участок</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Ваше имя
                    </label>
                    <input
                      type="text"
                      placeholder="Иван"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Телефон <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+375 (29) 000-00-00"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Район или адрес (по желанию)
                    </label>
                    <input
                      type="text"
                      placeholder="Минск, Первомайский р-н"
                      value={formDistrict}
                      onChange={(e) => setFormDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Получить оценку и расчет</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <p className="text-[10px] text-stone-400 text-center leading-normal">
                    Нажимая кнопку, вы соглашаетесь с условиями конфиденциальности АН «Фаттория».
                  </p>
                </form>
              )}
            </div>

            {/* Карточка дежурного специалиста */}
            <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-stone-200 shrink-0 border border-stone-300">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
                    alt="Ведущий риэлтер"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-stone-900 text-sm">Дежурный специалист</div>
                  <div className="text-[11px] text-stone-500">Отдел продаж АН «Фаттория»</div>
                </div>
              </div>
              <p className="text-xs text-stone-600 mb-4 font-light leading-relaxed">
                «Мы на связи ежедневно с 09:00 до 21:00. Готовы выехать на объект для бесплатного осмотра в удобное для вас время.»
              </p>
              <div className="space-y-2">
                <a
                  href="tel:+375296380053"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-stone-300 hover:border-stone-400 rounded-xl text-xs font-semibold text-stone-900 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-800" />
                  <span>+375 29 638-00-53</span>
                </a>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://t.me/fattoriaminsk"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-medium transition-colors"
                  >
                    <Send className="w-3 h-3" /> Telegram
                  </a>
                  <a
                    href="viber://chat?number=%2B375296380053"
                    className="flex items-center justify-center gap-1.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-medium transition-colors"
                  >
                    <MessageCircle className="w-3 h-3" /> Viber
                  </a>
                </div>
              </div>
            </div>

          </aside>

        </div>
      </div>

    </div>
  );
}
