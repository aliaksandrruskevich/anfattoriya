import React from 'react';
import { PageId } from '../types';
import { Camera, Globe, Target, Smartphone, BarChart3, MapPin, CheckCircle } from 'lucide-react';

interface EffectiveToolsPageProps {
  activePage: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
}

const brass = '#B8935F';
const brassLight = '#D9C7A3';
const paper = '#F6F3EC';
const displayFont = "'Cormorant Garamond', 'Raleway', serif";

export default function EffectiveToolsPage({ handleAddLead }: EffectiveToolsPageProps) {

  const tools = [
    {
      icon: <Camera className="w-6 h-6" />,
      title: 'Профессиональная фотосъёмка',
      desc: 'Штатный фотограф с широкоугольной оптикой. До 50 снимков с HDR-обработкой и цветокоррекцией. Правильный свет и ракурс увеличивают конверсию просмотров на 60%.',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: '8 рекламных площадок',
      desc: 'Realt.by, Domovita, Hata.by, Onliner, Kufar и другие — размещение на всех ведущих площадках Беларуси одновременно. Максимальный охват с первого дня.',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Таргетированная реклама',
      desc: 'Instagram, Facebook, Яндекс.Директ — настраиваем показы на целевую аудиторию по интересам, геолокации и доходу. Ваше предложение видят только потенциальные покупатели.',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'SEO-продвижение',
      desc: 'Целевые покупатели находят объекты через поисковые системы и каталог агентства.',
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: 'Социальные сети',
      desc: 'Активные сообщества в Instagram, Telegram, Facebook.  Сторис, прямые эфиры с показов, регулярные публикации.',
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Гео-продвижение',
      desc: 'Гиперлокальный таргетинг от 500 м до 50 км. Привлекаем покупателей из нужной локации. Идеально для коммерческой недвижимости и новостроек.',
    },
  ];

  const steps = [
    { step: '01', title: 'Подготовка', desc: 'Фотосъёмка, продающее описание. Выезд фотографа в день подписания договора.' },
    { step: '02', title: 'Запуск рекламы', desc: 'Размещение на 8 площадках, таргетинг в соцсетях, SEO-продвижение. Первые звонки в течение 24 часов.' },
    { step: '03', title: 'Сделка', desc: 'Показы, переговоры, юридическая проверка, регистрация. Вы получаете деньги в оговоренный срок.' },
  ];

  return (
    <div className="animate-fade-in" style={{ fontFamily: 'Raleway, sans-serif' }}>

      {/* ГЕРОЙ */}
      <div className="relative min-h-[90vh] flex items-center bg-black overflow-hidden">
        <img src="/photo/header.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${brass}66, transparent)` }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-semibold px-3.5 py-1.5 rounded-full border mb-6" style={{ color: brassLight, borderColor: `${brass}66`, backgroundColor: `${brass}1a` }}>
              Маркетинговый арсенал
            </div>
            <h1 className="text-white leading-[1.05]" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(34px, 6vw, 60px)' }}>
              Инструменты продажи<br />недвижимости
            </h1>
            <p className="text-white/70 mt-5 max-w-xl" style={{ fontWeight: 300, fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.5 }}>
              От профессиональной фотосъёмки до таргетированной рекламы — весь арсенал для быстрой продажи вашего объекта по максимальной цене.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); const f = e.currentTarget; const n = (f.querySelector('[name="name"]') as HTMLInputElement)?.value || ''; const p = (f.querySelector('[name="phone"]') as HTMLInputElement)?.value || ''; if (p) { handleAddLead(n, p, 'Инструменты', 'Баннер'); f.reset(); } }} className="mt-8 flex flex-wrap items-center gap-3 max-w-2xl">
              <input name="name" type="text" placeholder="Ваше имя" className="flex-1 min-w-[150px] px-4 py-3.5 bg-white/5 backdrop-blur-sm border border-white/15 text-white placeholder-white/40 focus:outline-none text-sm rounded-lg" />
              <input name="phone" type="tel" required placeholder="Номер телефона *" className="flex-1 min-w-[150px] px-4 py-3.5 bg-white/5 backdrop-blur-sm border border-white/15 text-white placeholder-white/40 focus:outline-none text-sm rounded-lg" />
              <button type="submit" className="px-8 py-3.5 text-black font-semibold rounded-lg text-sm transition-all hover:-translate-y-0.5 whitespace-nowrap" style={{ backgroundColor: brass, boxShadow: '0 8px 24px rgba(184,147,95,0.35)' }}>
                Получить консультацию
              </button>
            </form>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-[11px] text-white/50">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" style={{ color: brass }} /> Ведущие площадки</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" style={{ color: brass }} /> 1424+ клиентов выбрали нас</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" style={{ color: brass }} /> Средний срок — 26 дней (мин. 2 дня)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ИНСТРУМЕНТЫ */}
      <div className="py-20 lg:py-28" style={{ backgroundColor: paper }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-neutral-900" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(28px, 5vw, 46px)' }}>Маркетинговый арсенал</h2>
            <p className="text-stone-500 text-sm mt-3 max-w-xl mx-auto">Стратегия продвижения, которая приводит покупателя в кратчайшие сроки.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool, i) => (
              <div key={i} className="bg-white rounded-md p-6 border hover:-translate-y-1 transition-all duration-300" style={{ borderColor: `${brass}33` }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 border" style={{ borderColor: `${brass}44`, color: brass }}>{tool.icon}</div>
                <h3 className="text-sm font-bold text-neutral-900 mb-2">{tool.title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* КАК РАБОТАЕТ */}
      <div className="bg-black py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-14">
          <h2 className="text-white" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(28px, 5vw, 46px)' }}>Как это работает</h2>
        </div>
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3">
          {steps.map((item, i) => (
            <div key={i} className="p-10 text-center" style={{ borderRight: i < 2 ? `1px dashed ${brass}33` : 'none', borderBottom: `1px dashed ${brass}33` }}>
              <span className="text-5xl text-white/10 mb-4 block" style={{ fontFamily: displayFont }}>{item.step}</span>
              <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}