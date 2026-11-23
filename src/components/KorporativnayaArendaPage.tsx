"use client";
import React, { useEffect, useRef, useState } from 'react';
import { PageId } from '../types';
import {
  Building2, Warehouse, Home, Store, ShieldCheck, FileText, Users, Clock,
  CheckCircle, ArrowRight, Camera, Scale, Landmark, ChevronDown, ClipboardCheck,
  ScanSearch, Handshake, Receipt, BadgeCheck, Phone
} from 'lucide-react';

interface Props {
  activePage: PageId;
  navigateTo: (p: PageId) => void;
  handleAddLead: (n: string, ph: string, e: string, s: string) => void;
}

/* ============================================================
   Единая дизайн-система сайта: латунь + Cormorant + бумага.
   Если уже вынесли токены/хелперы в общий файл — импортируйте
   их оттуда вместо дублирования (см. также ConsultationCostPage,
   CatalogPage).
   ============================================================ */
const brass = '#B8935F';
const brassLight = '#D9C7A3';
const paper = '#F6F3EC';
const displayFont = "'Cormorant Garamond', 'Raleway', serif";

function useFonts() {
  useEffect(() => {
    if (document.getElementById('hp-fonts')) return;
    const link = document.createElement('link');
    link.id = 'hp-fonts';
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Raleway:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
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
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-8 h-px" style={{ backgroundColor: brass }} />
      <span className="text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: dark ? brassLight : brass, fontFamily: 'Raleway, sans-serif' }}>
        {children}
      </span>
    </div>
  );
}

export default function KorporativnayaArendaPage({ activePage, navigateTo, handleAddLead }: Props) {
  useFonts();

  const heroFormRef = useRef<HTMLDivElement>(null);

  // Controlled hero form — validated, with real success/error feedback
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [premType, setPremType] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const isValidPhone = (value: string) => value.replace(/\D/g, '').length >= 9;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone(phone)) {
      setPhoneError('Укажите корректный номер телефона');
      return;
    }
    setPhoneError('');
    handleAddLead(
      name || 'Не указано',
      phone,
      `Тип помещения: ${premType || 'не выбран'}`,
      'Корпоративная аренда: баннер'
    );
    setSubmitted(true);
    setName('');
    setPhone('');
    setPremType('');
  };

  const scrollToForm = () => {
    heroFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const serviceTypes = [
    { icon: <Building2 className="w-6 h-6" />, title: 'Офисы', desc: 'Подбор офисных помещений класса А и В под требования компании и штата.' },
    { icon: <Warehouse className="w-6 h-6" />, title: 'Склады', desc: 'Складские комплексы с необходимой инфраструктурой и подъездными путями.' },
    { icon: <Store className="w-6 h-6" />, title: 'Торговые помещения', desc: 'Площади с трафиком под розницу, шоу-рум или пункт выдачи заказов.' },
    { icon: <Home className="w-6 h-6" />, title: 'Жильё для сотрудников', desc: 'Квартиры для временного размещения иногородних и релоцированных специалистов.' },
  ];

  const processSteps = [
    { icon: <ScanSearch className="w-4 h-4" />, title: 'Заявка и бриф', desc: 'Уточняем требования: площадь, бюджет, локацию, сроки заезда и особые условия.', duration: '1 день' },
    { icon: <Building2 className="w-4 h-4" />, title: 'Персональный подбор', desc: 'Формируем шорт-лист объектов из актуального каталога и новых предложений собственников под ваш бриф.', duration: '1–3 дня' },
    { icon: <ClipboardCheck className="w-4 h-4" />, title: 'Показы и согласование', desc: 'Организуем просмотры, ведём переговоры об условиях аренды и сроке договора.', duration: '3–7 дней' },
    { icon: <FileText className="w-4 h-4" />, title: 'Договор и документы', desc: 'Готовим договор аренды, акты приёма-передачи и закрывающие документы.', duration: '1–2 дня' },
    { icon: <Handshake className="w-4 h-4" />, title: 'Сопровождение', desc: 'Остаёмся на связи весь срок аренды — от продления до смены условий.', duration: 'весь период' },
  ];

  const b2bTrust = [
    { icon: <Landmark className="w-4 h-4" />, text: 'Работаем по договору с ИП и ООО, включая безналичный расчёт' },
    { icon: <Receipt className="w-4 h-4" />, text: 'Полный пакет закрывающих документов: акты, счета, счета-фактуры' },
    { icon: <Users className="w-4 h-4" />, text: 'Один персональный менеджер на весь период сотрудничества' },
    { icon: <ShieldCheck className="w-4 h-4" />, text: 'Юридическая проверка объекта и договора перед подписанием' },
  ];

  const faqs = [
    { q: 'Можно ли заключить рамочный договор на несколько объектов сразу?', a: 'Да, для компаний с сетью филиалов или регулярной потребностью в подборе помещений мы заключаем рамочный договор на обслуживание с фиксированными условиями на весь период.' },
    { q: 'Выдаёте ли вы закрывающие документы для бухгалтерии?', a: 'Да, по каждой оказанной услуге предоставляется акт выполненных работ и счёт-фактура — стандартный пакет для бухгалтерского и налогового учёта юридического лица.' },
    { q: 'Работаете ли вы с иностранными компаниями и представительствами?', a: 'Да, у нас есть опыт сопровождения представительств иностранных компаний — от подбора офиса до организации жилья для релоцированных сотрудников.' },
    { q: 'Кто оплачивает комиссию — арендатор или арендодатель?', a: 'Условия оплаты обсуждаются индивидуально и фиксируются в договоре до начала подбора, чтобы для компании не было сюрпризов на этапе согласования.' },
    { q: 'Сколько времени занимает подбор офиса под ключевые требования?', a: 'В среднем первый шорт-лист подходящих вариантов формируется в течение 1–3 рабочих дней после уточнения брифа — точный срок зависит от специфики требований.' },
  ];

  return (
    <div className="animate-fade-in" style={{ fontFamily: 'Raleway, sans-serif' }}>

      {/* HERO */}
      <div className="relative min-h-screen flex items-center"
        style={{ backgroundImage: `url('/photo/header.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.75) 100%)' }}></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-semibold px-3.5 py-1.5 rounded-full border mb-6" style={{ color: brassLight, borderColor: `${brass}66`, backgroundColor: `${brass}1a` }}>
              <Scale className="w-3.5 h-3.5" /> Для юридических лиц и ИП
            </div>
            <h1 className="text-white leading-tight" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(30px, 5vw, 54px)', lineHeight: 1.15 }}>
              Корпоративная аренда квартир и офисов
            </h1>
            <p className="text-white/80 mt-6 max-w-2xl" style={{ fontWeight: 300, fontSize: 'clamp(15px, 1.4vw, 19px)' }}>
              Профессиональное обслуживание компаний по подбору жилых и нежилых помещений в Минске. Закрываем потребность бизнеса в аренде под ключ — с договором, безналичным расчётом и закрывающими документами.
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-[11px] font-mono text-white/50">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" style={{ color: brass }} /> Безналичный расчёт</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" style={{ color: brass }} /> Закрывающие документы</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" style={{ color: brass }} /> Персональный менеджер</span>
            </div>

            <div ref={heroFormRef} className="mt-9 max-w-2xl">
              {submitted ? (
                <div className="bg-white/10 backdrop-blur-sm border rounded-lg p-6 flex items-start gap-3" style={{ borderColor: `${brass}55` }}>
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: brass }} />
                  <div>
                    <p className="text-white text-sm font-bold">Заявка принята в работу</p>
                    <p className="text-white/60 text-xs mt-1">Персональный менеджер свяжется с вами в течение рабочего дня, чтобы уточнить детали брифа.</p>
                    <button onClick={() => setSubmitted(false)} className="text-xs font-semibold underline mt-3" style={{ color: brassLight }}>Отправить ещё одну заявку</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-3">
                  <input
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ваше имя"
                    className="w-[180px] sm:w-[200px] px-4 py-3 bg-transparent border text-white placeholder-white/60 focus:outline-none focus:ring-1 text-sm rounded-lg"
                    style={{ borderColor: 'rgba(255,255,255,0.4)' }}
                  />
                  <div className="flex flex-col gap-1">
                    <input
                      name="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); if (phoneError) setPhoneError(''); }}
                      placeholder="Номер телефона *"
                      className="w-[180px] sm:w-[200px] px-4 py-3 bg-transparent border text-white placeholder-white/60 focus:outline-none focus:ring-1 text-sm rounded-lg"
                      style={{ borderColor: phoneError ? '#f87171' : 'rgba(255,255,255,0.4)' }}
                    />
                    {phoneError && <span className="text-[11px] text-red-300">{phoneError}</span>}
                  </div>
                  <select
                    name="type"
                    value={premType}
                    onChange={(e) => setPremType(e.target.value)}
                    className="w-[200px] sm:w-[220px] px-4 py-3 bg-transparent border text-white/90 text-sm focus:outline-none focus:ring-1 rounded-lg"
                    style={{ borderColor: 'rgba(255,255,255,0.4)' }}
                  >
                    <option value="" className="text-stone-900">Тип помещения</option>
                    <option value="Офис" className="text-stone-900">Офис</option>
                    <option value="Склад" className="text-stone-900">Склад</option>
                    <option value="Торговое" className="text-stone-900">Торговое помещение</option>
                    <option value="Квартира для сотрудников" className="text-stone-900">Квартира для сотрудников</option>
                  </select>
                  <button
                    type="submit"
                    className="px-8 py-3 text-black font-bold rounded-lg text-sm transition-all whitespace-nowrap hover:-translate-y-0.5"
                    style={{ backgroundColor: brass, boxShadow: '0 8px 24px rgba(184,147,95,0.35)' }}
                  >
                    Отправить в 1 клик
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-16 lg:py-24">

        {/* Типы объектов */}
        <Reveal>
          <div className="bg-black rounded-md overflow-hidden border" style={{ borderColor: `${brass}33` }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {serviceTypes.map((item, i) => (
                <div
                  key={i}
                  className="min-h-[260px] flex flex-col justify-center items-center text-center p-8 group transition-colors hover:bg-white/[0.03]"
                  style={{
                    borderRight: (i + 1) % 4 !== 0 ? `1px dashed ${brass}33` : 'none',
                    borderBottom: '1px dashed rgba(255,255,255,0.12)'
                  }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 border transition-colors group-hover:border-solid" style={{ borderColor: `${brass}44`, color: brass }}>
                    {item.icon}
                  </div>
                  <p className="text-white text-lg mb-2" style={{ fontFamily: displayFont, fontWeight: 400 }}>{item.title}</p>
                  <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Как мы работаем с компаниями — реальная последовательность */}
        <Reveal className="space-y-6">
          <div>
            <Eyebrow>Регламент для юридических лиц</Eyebrow>
            <h2 className="text-neutral-950" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(26px, 4vw, 40px)' }}>
              Как мы работаем с компаниями
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {processSteps.map((step, i) => (
              <div key={i} className="bg-white border rounded-md p-5 space-y-3" style={{ borderColor: `${brass}33` }}>
                <div className="flex items-center justify-between">
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ backgroundColor: paper, color: brass, fontFamily: displayFont, border: `1px solid ${brass}44` }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ color: brass }}>{step.icon}</span>
                </div>
                <h5 className="text-sm font-bold text-neutral-900">{step.title}</h5>
                <p className="text-[11px] text-stone-500 leading-relaxed">{step.desc}</p>
                <p className="text-[10px] font-mono text-stone-400 flex items-center gap-1 pt-1 border-t" style={{ borderColor: `${brass}22` }}>
                  <Clock className="w-3 h-3" /> {step.duration}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* B2B доверие */}
        <Reveal>
          <div className="rounded-md p-6 md:p-10 border grid grid-cols-1 md:grid-cols-2 gap-5" style={{ backgroundColor: paper, borderColor: `${brass}33` }}>
            {b2bTrust.map((item, i) => (
              <div key={i} className="bg-white border rounded-lg p-4 flex items-start gap-3" style={{ borderColor: `${brass}22` }}>
                <span className="shrink-0" style={{ color: brass }}>{item.icon}</span>
                <span className="text-xs text-neutral-800 leading-relaxed">{item.text}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Почему нам доверяют */}
        <Reveal className="space-y-10">
          <div>
            <Eyebrow>Цифры и факты</Eyebrow>
            <h2 className="text-neutral-950" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(26px, 4vw, 40px)' }}>Почему нам доверяют</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3 flex flex-col gap-8">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" style={{ color: brass }} /><h3 className="text-sm font-bold text-neutral-900">Гарантия качества</h3></div>
                <div className="w-full h-px border-b border-dashed" style={{ borderColor: `${brass}33` }}></div>
                <p className="text-xs text-stone-500">Служба контроля качества сопровождает каждую сделку.</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2"><Users className="w-4 h-4" style={{ color: brass }} /><h3 className="text-sm font-bold text-neutral-900">Сайт агентства</h3></div>
                <div className="w-full h-px border-b border-dashed" style={{ borderColor: `${brass}33` }}></div>
                <p className="text-xs text-stone-500">1424+ клиентов выбрали нас для своих сделок.</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2"><Scale className="w-4 h-4" style={{ color: brass }} /><h3 className="text-sm font-bold text-neutral-900">Стоимость</h3></div>
                <div className="w-full h-px border-b border-dashed" style={{ borderColor: `${brass}33` }}></div>
                <p className="text-xs text-stone-500">Государственные тарифы, без переплат.</p>
              </div>
            </div>
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="w-full h-[280px] rounded-md overflow-hidden border" style={{ borderColor: `${brass}33` }}>
                <img src="/photo/header.jpg" alt="" className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2"><Camera className="w-4 h-4" style={{ color: brass }} /><h3 className="text-sm font-bold text-neutral-900">Фотографии</h3></div>
                  <div className="w-full h-px border-b border-dashed" style={{ borderColor: `${brass}33` }}></div>
                  <p className="text-xs text-stone-500">Профессиональная съёмка объекта.</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4" style={{ color: brass }} /><h3 className="text-sm font-bold text-neutral-900">Срок продажи</h3></div>
                  <div className="w-full h-px border-b border-dashed" style={{ borderColor: `${brass}33` }}></div>
                  <p className="text-xs text-stone-500">Средний срок — 26 дней, минимальный — 2 дня.</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-3 flex flex-col gap-8">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2"><FileText className="w-4 h-4" style={{ color: brass }} /><h3 className="text-sm font-bold text-neutral-900">Юристы</h3></div>
                <div className="w-full h-px border-b border-dashed" style={{ borderColor: `${brass}33` }}></div>
                <p className="text-xs text-stone-500">Профильный юридический отдел в штате.</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2"><ScanSearch className="w-4 h-4" style={{ color: brass }} /><h3 className="text-sm font-bold text-neutral-900">Реклама</h3></div>
                <div className="w-full h-px border-b border-dashed" style={{ borderColor: `${brass}33` }}></div>
                <p className="text-xs text-stone-500">Ведущие площадки, соцсети и прямой подбор.</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4" style={{ color: brass }} /><h3 className="text-sm font-bold text-neutral-900">Доверие</h3></div>
                <div className="w-full h-px border-b border-dashed" style={{ borderColor: `${brass}33` }}></div>
                <p className="text-xs text-stone-500">Высокие рейтинги среди корпоративных клиентов.</p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* FAQ */}
        <Reveal className="space-y-6">
          <div>
            <Eyebrow>Частые вопросы</Eyebrow>
            <h2 className="text-neutral-950" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(26px, 4vw, 40px)' }}>Вопросы от корпоративных клиентов</h2>
          </div>
          <div className="border rounded-md divide-y bg-white" style={{ borderColor: `${brass}33` }}>
            {faqs.map((item, i) => {
              const open = openFaqIndex === i;
              return (
                <div key={i} className={i !== 0 ? 'border-t' : ''} style={{ borderColor: `${brass}1a` }}>
                  <button
                    onClick={() => setOpenFaqIndex(open ? null : i)}
                    className="w-full flex items-center justify-between gap-4 text-left p-5"
                  >
                    <span className="text-sm font-bold text-neutral-900">{item.q}</span>
                    <ChevronDown
                      className="w-4 h-4 shrink-0 transition-transform"
                      style={{ color: brass, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </button>
                  <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open ? '200px' : '0px' }}>
                    <p className="text-xs text-stone-500 leading-relaxed px-5 pb-5 max-w-3xl">{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* Финальный CTA */}
        <Reveal>
          <div className="bg-black text-white rounded-md p-8 lg:p-12 relative overflow-hidden border" style={{ borderColor: `${brass}33` }}>
            <div className="absolute right-0 bottom-0 opacity-[0.06] pointer-events-none">
              <Handshake className="w-80 h-80" style={{ color: brass }} />
            </div>
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <h3 className="text-white leading-tight" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(22px, 3vw, 32px)' }}>
                  Готовы обсудить условия для вашей компании?
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Оставьте заявку выше — персональный менеджер свяжется с вами в течение рабочего дня и предложит варианты под ваш бюджет и сроки.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <button
                  onClick={scrollToForm}
                  className="px-8 py-4 text-black text-xs font-bold uppercase tracking-widest rounded-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap"
                  style={{ backgroundColor: brass, boxShadow: '0 8px 24px rgba(184,147,95,0.35)' }}
                >
                  Оставить заявку <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <a
                  href="tel:+375291234567"
                  className="px-8 py-4 border text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-all hover:border-white/40 flex items-center justify-center gap-2 whitespace-nowrap"
                  style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  <Phone className="w-3.5 h-3.5" /> Позвонить менеджеру
                </a>
              </div>
            </div>
          </div>
        </Reveal>

      </div>
    </div>
  );
}

