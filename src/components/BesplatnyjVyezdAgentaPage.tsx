"use client";
import React, { useState } from 'react';
import {
  MapPin, Clock, ShieldCheck, Camera, TrendingUp, CheckCircle, Award,
  Phone, Calendar, ArrowRight, UserCheck, FileSpreadsheet, Plus, Minus
} from 'lucide-react';
import { PageId } from '../types';
import { brass, brassLight, paper, displayFont, useFonts, Reveal, CornerFrame, Eyebrow } from './DesignSystem';

interface BesplatnyjVyezdAgentaPageProps {
  activePage?: PageId;
  navigateTo?: (pageId: PageId) => void;
  handleAddLead?: (name: string, phone: string, extra: string, source: string) => void;
}

export default function BesplatnyjVyezdAgentaPage({
  navigateTo = () => {},
  handleAddLead = () => {}
}: BesplatnyjVyezdAgentaPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);
  useFonts();

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value || '';
    const phone = (form.querySelector('[name="phone"]') as HTMLInputElement)?.value || '';
    const address = (form.querySelector('[name="address"]') as HTMLInputElement)?.value || '';
    const propType = (form.querySelector('[name="propType"]') as HTMLSelectElement)?.value || '';
    if (phone) {
      handleAddLead(name, phone, `Адрес: ${address || 'Не указан'}, Тип: ${propType || 'Квартира'}`, 'Бесплатный выезд риэлтера');
      form.reset();
      alert('Спасибо! Ваш запрос на выезд специалиста принят. Риэлтер свяжется с вами для согласования времени.');
    }
  };

  const benefits = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Точная оценка стоимости',
      desc: 'Анализ объекта на месте с учетом ремонта, планировки, вида из окон и реальных цен сделок в вашем доме.'
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: 'Тестовая фотофиксация',
      desc: 'Оценка готовности объекта к фотосъемке и составление рекомендаций по предпродажной подготовке.'
    },
    {
      icon: <FileSpreadsheet className="w-6 h-6" />,
      title: 'Аналитический отчет',
      desc: 'Предоставление официального расчета стартовой и рыночной стоимости в течение 24 часов после осмотра.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: 'Юридический аудит документов',
      desc: 'Первичная проверка документов на право собственности, выявление возможных препятствий к сделке.'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Заявка на сайте или по телефону',
      desc: 'Вы оставляете контакты, и наш специалист связывается с вами в течение 10 минут для согласования удобного дня и времени визита.'
    },
    {
      step: '02',
      title: 'Визит аттестованного риэлтера',
      desc: 'Специалист приезжает в оговоренное время, осматривает объект, фиксирует метраж, состояние инженерии и особенности дома.'
    },
    {
      step: '03',
      title: 'Анализ базы сделок БРТИ',
      desc: 'Мы сопоставляем ваш объект с реальными зарегистрированными сделками в вашем микрорайоне за последние 3-6 месяцев.'
    },
    {
      step: '04',
      title: 'Готовая стратегия продажи',
      desc: 'Вы получаете обоснованный расчет цены, перечень необходимых документов и индивидуальный маркетинговый план без обязательств.'
    }
  ];

  const faqItems = [
    {
      q: 'Действительно ли выезд бесплатный?',
      a: 'Да, выезд аттестованного риэлтера в пределах Минска и до 15 км от МКАД является полностью бесплатным и ни к чему вас не обязывает.'
    },
    {
      q: 'Сколько времени занимает осмотр объекта?',
      a: 'Обычно осмотр длится от 20 до 40 минут в зависимости от площади объекта и объема документов, которые вы хотите проконсультировать.'
    },
    {
      q: 'Какие документы желательно подготовить к визиту?',
      a: 'Желательно иметь технический паспорт помещения, свидетельство о государственной регистрации и правоустанавливающий документ (договор купли-продажи, мены, приватизации или свидетельство о праве на наследство).'
    },
    {
      q: 'Можно ли пригласить специалиста в выходной день или вечернее время?',
      a: 'Да, наши специалисты выезжают в удобное для вас время: с понедельника по воскресенье с 8:30 до 21:00 по предварительному согласованию.'
    }
  ];

  return (
    <div className="animate-fade-in" style={{ fontFamily: 'Raleway, sans-serif' }}>
      
      {/* ================= HERO BANNER ================= */}
      <div
        className="relative min-h-[90vh] flex items-center overflow-hidden"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=2000')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/65 to-black/90" />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-28">
          <div className="max-w-3xl">
            <Eyebrow dark>Сервис агентства недвижимости «АН Фаттория»</Eyebrow>
            <h1
              className="text-white leading-[1.1] mb-6"
              style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(36px, 6vw, 62px)' }}
            >
              Бесплатный выезд риэлтера <span style={{ color: brassLight, fontStyle: 'italic' }}>на ваш объект</span>
            </h1>
            <p className="text-white/80 leading-relaxed mb-8 max-w-xl text-[16px] lg:text-[18px]">
              Профессиональный осмотр, фотофиксация, экспресс-оценка по базе реальных сделок БРТИ и персональная стратегия выгодной продажи за 1 визит.
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-3 mb-10 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: brassLight }} /> Выезд в день обращения
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: brassLight }} /> Минск и до 30 км от МКАД
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" style={{ color: brassLight }} /> Без обязательств
              </div>
            </div>

            {/* Quick Hero Form */}
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl">
              <input
                name="name"
                type="text"
                placeholder="Ваше имя"
                className="px-4 py-3.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/60 text-sm"
              />
              <input
                name="phone"
                type="tel"
                placeholder="Номер телефона *"
                required
                className="px-4 py-3.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/60 text-sm"
              />
              <input
                name="address"
                type="text"
                placeholder="Адрес или район"
                className="px-4 py-3.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/60 text-sm"
              />
              <button
                type="submit"
                className="px-6 py-3.5 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-all hover:brightness-105 hover:-translate-y-0.5 shadow-[0_6px_20px_rgba(139, 92, 246,0.4)] whitespace-nowrap cursor-pointer"
                style={{ backgroundColor: brass }}
              >
                Вызвать риэлтера
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ================= ЧТО ДАЕТ ВЫЕЗД ================= */}
      <div className="w-full bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <Eyebrow center>Комплексный осмотр</Eyebrow>
            <h2
              className="text-neutral-900 mb-14"
              style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(30px, 4.5vw, 46px)' }}
            >
              Что входит в бесплатный выезд специалиста
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <Reveal key={i} className="group">
                <div
                  className="h-full p-8 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  style={{ backgroundColor: paper, border: `1px solid ${brass}22` }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${brass}18`, color: brass }}>
                    {b.icon}
                  </div>
                  <h3 className="text-neutral-900 font-semibold text-lg mb-3">{b.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{b.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ================= ЭТАПЫ РАБОТЫ ================= */}
      <div className="py-20 lg:py-28 bg-[#15120C] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <Eyebrow dark center>Простой и понятный процесс</Eyebrow>
            <h2
              className="text-white mb-16"
              style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(30px, 4.5vw, 46px)' }}
            >
              Как проходит организация выезда
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <Reveal key={i}>
                <div className="p-8 rounded-lg border border-white/10 bg-white/5 h-full flex flex-col justify-between">
                  <div>
                    <span className="text-2xl font-light block mb-4" style={{ color: brassLight, fontFamily: displayFont }}>
                      {s.step}
                    </span>
                    <h3 className="text-white font-semibold text-base mb-3">{s.title}</h3>
                    <p className="text-white/60 text-xs leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ================= ФОРМА ЗАЯВКИ ================= */}
      <div className="py-20 lg:py-28" style={{ backgroundColor: paper }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-10">
            <Eyebrow center>Онлайн-запись</Eyebrow>
            <h2
              className="text-neutral-900 mb-4"
              style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(28px, 4vw, 42px)' }}
            >
              Забронируйте удобное время для визита
            </h2>
            <p className="text-stone-500 text-sm max-w-xl mx-auto">
              Оставьте контактные данные — риэлтер свяжется с вами, чтобы подтвердить адрес и уточнить детали.
            </p>
          </Reveal>

          <div className="bg-white p-8 lg:p-12 rounded-xl shadow-lg border border-stone-200">
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">Ваше имя *</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Например, Александр"
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">Телефон для связи *</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="+375 29 000-00-00"
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">Адрес объекта или район</label>
                <input
                  name="address"
                  type="text"
                  placeholder="Минск, ул. Репина, д. 4"
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">Тип недвижимости</label>
                <select
                  name="propType"
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-600 bg-white"
                >
                  <option value="Квартира в Минске">Квартира в Минске</option>
                  <option value="Новостройка">Новостройка</option>
                  <option value="Дом / Коттедж / Дача">Дом / Коттедж / Дача</option>
                  <option value="Коммерческое помещение">Коммерческое помещение</option>
                  <option value="Земельный участок">Земельный участок</option>
                </select>
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-4 text-stone-950 font-bold text-sm uppercase tracking-wider rounded-lg transition-all hover:brightness-105 shadow-md cursor-pointer"
                  style={{ backgroundColor: brass }}
                >
                  Подтвердить бесплатный выезд
                </button>
                <p className="text-stone-400 text-xs text-center mt-3">
                  Нажимая кнопку, вы соглашаетесь на обработку персональных данных. Конфиденциальность гарантируется.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ================= FAQ ================= */}
      <div className="bg-white py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <Eyebrow center>Вопросы и ответы</Eyebrow>
            <h2
              className="text-neutral-900"
              style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(28px, 4vw, 42px)' }}
            >
              Часто задаваемые вопросы
            </h2>
          </Reveal>

          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className="rounded-lg overflow-hidden border transition-colors"
                style={{ borderColor: openFaq === i ? brass : 'rgba(0,0,0,0.1)' }}
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  <span className="text-[15px] font-semibold text-neutral-900 pr-4">{item.q}</span>
                  {openFaq === i ? (
                    <Minus className="w-5 h-5 shrink-0" style={{ color: brass }} />
                  ) : (
                    <Plus className="w-5 h-5 text-stone-400 shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-[14px] text-stone-600 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
