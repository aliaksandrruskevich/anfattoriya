import React from 'react';
import { PageId } from '../types';
import { Award, Shield, Star, Users, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

interface Props { 
  activePage: PageId; 
  navigateTo: (p: PageId) => void; 
  handleAddLead: (n: string, ph: string, e: string, s: string) => void; 
}

export default function RieltorPage({ activePage, navigateTo, handleAddLead }: Props) {

  const benefits = [
    { title: 'Официальный аттестат', desc: 'Все риэлтеры агентства имеют действующий аттестат Министерства юстиции Республики Беларусь. Проверить специалиста можно в открытом реестре.' },
    { title: 'Государственные тарифы', desc: 'Работаем строго по Постановлению №754. Никаких скрытых платежей. Оплата только по факту совершённой сделки.' },
    { title: 'Юридическая безопасность', desc: 'Каждую сделку сопровождает юридический отдел. Полная правовая чистота и страховая защита.' },
    { title: 'Специализация', desc: 'Узкая специализация каждого агента: жилая недвижимость, коммерческая, аренда или оценка. Вы получаете эксперта в нужной области.' },
    { title: 'Контроль качества', desc: 'Служба контроля качества следит за каждым этапом работы. Любая жалоба рассматривается в течение 24 часов.' },
    { title: 'Постоянное обучение', desc: 'Риэлтеры проходят ежегодную аттестацию и курсы повышения квалификации. Мы в курсе всех изменений законодательства.' },
  ];

  return (
    <div className="animate-fade-in" style={{ fontFamily: 'Raleway, sans-serif' }}>
      
      {/* БАННЕР */}
      <div className="relative min-h-screen flex items-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=2000')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full pl-3 pr-5 py-2.5 mb-8">
              <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Аттестован</span>
              <span className="text-white/80 text-sm font-medium tracking-wide">Министерством юстиции РБ</span>
            </div>
            <h1 className="text-white leading-tight" style={{ fontWeight: 400, fontSize: 'clamp(28px, 5vw, 50px)', lineHeight: 1.2 }}>
              Аттестованный<br />риэлтер
            </h1>
            <p className="text-white/90 mt-6" style={{ fontWeight: 300, fontSize: 'clamp(16px, 1.5vw, 20px)' }}>
              Доверьте свою недвижимость профессионалам с действующим аттестатом Министерства юстиции. Юридическая чистота, государственные тарифы и полное сопровождение на всех этапах сделки.
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value || '';
              const phone = (form.querySelector('[name="phone"]') as HTMLInputElement)?.value || '';
              const type = (form.querySelector('[name="type"]') as HTMLSelectElement)?.value || '';
              if (phone) { handleAddLead(name, phone, `Услуга: ${type}`, 'Риэлтер: баннер'); form.reset(); }
            }} className="mt-8 flex flex-wrap items-center gap-3">
              <input name="name" type="text" placeholder="Ваше имя" className="w-[180px] sm:w-[200px] px-4 py-3 bg-transparent border border-white/40 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-white/30 text-sm rounded-lg" />
              <input name="phone" type="tel" placeholder="Номер телефона *" className="w-[180px] sm:w-[200px] px-4 py-3 bg-transparent border border-white/40 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-white/30 text-sm rounded-lg" />
              <select name="type" className="w-[200px] sm:w-[220px] px-4 py-3 bg-transparent border border-white/40 text-white/90 text-sm focus:outline-none focus:ring-1 focus:ring-white/30 rounded-lg">
                <option value="" className="text-stone-900">Выберите услугу...</option>
                <option value="Консультация" className="text-stone-900">Консультация</option>
                <option value="Оценка недвижимости" className="text-stone-900">Оценка недвижимости</option>
                <option value="Подбор риэлтера" className="text-stone-900">Подбор риэлтера</option>
              </select>
              <button type="submit" className="px-8 py-3 bg-white hover:bg-stone-100 text-black font-semibold rounded-lg text-sm transition-all whitespace-nowrap" style={{ fontWeight: 600, fontSize: '15px' }}>Отправить в 1 клик</button>
            </form>
          </div>
        </div>
      </div>

      {/* ПРЕИМУЩЕСТВА */}
      <div className="bg-white py-24">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-light text-neutral-900 text-center mb-4">Почему стоит работать с аттестованным риэлтером</h2>
          <p className="text-stone-500 text-center text-sm mb-16">Шесть причин доверить сделку профессионалу</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((item, i) => (
              <div key={i} className="group flex items-start gap-4 bg-stone-50 rounded-2xl p-6 hover:bg-neutral-900 transition-all duration-300">
                <CheckCircle2 className="w-5 h-5 text-stone-400 group-hover:text-purple-400 mt-0.5 shrink-0 transition-colors" />
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 group-hover:text-white transition-colors mb-1">{item.title}</h3>
                  <p className="text-xs text-stone-500 group-hover:text-stone-300 leading-relaxed transition-colors">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ЧТО ДЕЛАЕТ РИЭЛТЕР */}
      <div className="w-full bg-black py-24">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-light text-white text-center mb-4">Что делает риэлтер для вас</h2>
          <p className="text-stone-400 text-center text-sm mb-16">Полный цикл сопровождения сделки — от оценки до регистрации</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {[
              { step: '01', title: 'Оценка и консультация', desc: 'Бесплатный выезд на объект. Определение рыночной стоимости на основе реестра сделок БРТИ и НКА. Рекомендации по предпродажной подготовке.' },
              { step: '02', title: 'Маркетинг и показы', desc: 'Профессиональная фотосъёмка, 3D-тур, размещение на 14 площадках. Организация показов и переговоры с покупателями.' },
              { step: '03', title: 'Сделка и регистрация', desc: 'Юридическая проверка, составление договора, организация расчётов, регистрация права собственности. Вы получаете деньги или ключи.' },
            ].map((item, i) => (
              <div key={i} className="min-h-[340px] flex flex-col justify-center items-center text-center p-10"
                style={{ borderRight: i < 2 ? '2px dashed rgba(255,255,255,0.3)' : 'none', borderBottom: '2px dashed rgba(255,255,255,0.3)' }}>
                <div className="text-5xl font-thin text-white/20 mb-4">{item.step}</div>
                <h3 className="text-white text-lg font-bold mb-3">{item.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ЦИФРЫ */}
      <div className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '100%', label: 'юридическая чистота' },
            { value: '0 руб.', label: 'до результата' },
            { value: '5.0', label: 'рейтинг специалистов' },
            { value: 'Белгосстрах', label: 'страховой полис' },
          ].map((item, i) => (
            <div key={i}>
              <div className="text-2xl lg:text-3xl font-light text-neutral-900 mb-1">{item.value}</div>
              <div className="text-xs text-stone-500 uppercase tracking-wider">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ПОЧЕМУ НАМ ДОВЕРЯЮТ */}
      <div className="bg-white py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-[40px] lg:text-[50px] font-normal text-[#1a1a1a] mb-12 lg:mb-16">Почему нам доверяют:</h2>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-3 flex flex-col gap-10">
              <div className="flex flex-col gap-2"><h3 className="text-[16px] font-bold text-[#1a1a1a]">Надёжность и гарантия</h3><div className="w-full h-px border-b border-dashed border-[#1a1a1a]/30 mb-1"></div><p className="text-[14px] font-normal text-[#444] leading-relaxed">Профессиональное агентство недвижимости Минска.</p></div>
              <div className="flex flex-col gap-2"><h3 className="text-[16px] font-bold text-[#1a1a1a]">Скорость работы</h3><div className="w-full h-px border-b border-dashed border-[#1a1a1a]/30 mb-1"></div><p className="text-[14px] font-normal text-[#444] leading-relaxed">Оперативный подбор и продажа.</p></div>
              <div className="flex flex-col gap-2"><h3 className="text-[16px] font-bold text-[#1a1a1a]">Доверие клиентов</h3><div className="w-full h-px border-b border-dashed border-[#1a1a1a]/30 mb-1"></div><p className="text-[14px] font-normal text-[#444] leading-relaxed">Индивидуальный подход и прозрачные условия.</p></div>
            </div>
            <div className="lg:col-span-6 flex flex-col gap-8">
              <div className="w-full h-[280px] lg:h-[340px] bg-neutral-200 overflow-hidden"><img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200" alt="" className="w-full h-full object-cover" /></div>
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-2"><h3 className="text-[16px] font-bold text-[#1a1a1a]">Юридическая безопасность</h3><div className="w-full h-px border-b border-dashed border-[#1a1a1a]/30 mb-1"></div><p className="text-[14px] font-normal text-[#444] leading-relaxed">Полный аудит документов и государственная регистрация.</p></div>
                <div className="flex flex-col gap-2"><h3 className="text-[16px] font-bold text-[#1a1a1a]">Сопровождение сделок</h3><div className="w-full h-px border-b border-dashed border-[#1a1a1a]/30 mb-1"></div><p className="text-[14px] font-normal text-[#444] leading-relaxed">От оценки до регистрации.</p></div>
              </div>
            </div>
            <div className="lg:col-span-3 flex flex-col gap-10">
              <div className="flex flex-col gap-2"><h3 className="text-[16px] font-bold text-[#1a1a1a]">Гарантия качества</h3><div className="w-full h-px border-b border-dashed border-[#1a1a1a]/30 mb-1"></div><p className="text-[14px] font-normal text-[#444] leading-relaxed">Служба контроля качества.</p></div>
              <div className="flex flex-col gap-2"><h3 className="text-[16px] font-bold text-[#1a1a1a]">Каталог предложений</h3><div className="w-full h-px border-b border-dashed border-[#1a1a1a]/30 mb-1"></div><p className="text-[14px] font-normal text-[#444] leading-relaxed">Проверенные объекты в каталоге агентства.</p></div>
              <div className="flex flex-col gap-2"><h3 className="text-[16px] font-bold text-[#1a1a1a]">Стоимость</h3><div className="w-full h-px border-b border-dashed border-[#1a1a1a]/30 mb-1"></div><p className="text-[14px] font-normal text-[#444] leading-relaxed">Государственные тарифы</p></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}