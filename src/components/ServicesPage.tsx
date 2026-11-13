import React from 'react';
import { PageId } from '../types';
import PageHero from './PageHero';

interface ServicesPageProps {
  activePage: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
}

export default function ServicesPage({ activePage, navigateTo, handleAddLead }: ServicesPageProps) {
  return (
    <div id="services-root-view" className="animate-fade-in">
      
      {/* Баннер с формой */}
      <PageHero 
        activePage={activePage} 
        navigateTo={navigateTo} 
        handleAddLead={handleAddLead} 
      />

      {/* ========================================================== */}
      {/* 10 ЭТАПОВ ПРОДАЖИ */}
      {/* ========================================================== */}
      <div className="bg-[#1a1a1a] py-20 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <h2 className="text-white text-center mb-16"
            style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 300, fontSize: 'clamp(36px, 5vw, 52px)', lineHeight: 1.2 }}>
            10 этапов продажи
          </h2>

          {/* СТРОКА 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <div className="border border-dashed border-neutral-500 p-6 lg:p-8 flex flex-col min-h-[320px]"
              style={{ borderRight: '1px dashed #737373', borderBottom: '1px dashed #737373' }}>
              <span className="text-5xl font-thin text-stone-500 mb-4">01.</span>
              <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide" style={{ fontFamily: 'Raleway, sans-serif' }}>Профессиональная оценка</h3>
              <p className="text-stone-400 text-xs leading-relaxed" style={{ fontFamily: 'Raleway, sans-serif', lineHeight: 1.6 }}>Мы проведем профессиональную оценку и предоставим максимально выгодный для Вас анализ для продажи и сдачи в аренду с использованием нашей специализированной базы данных.</p>
            </div>
            <div className="border border-dashed border-neutral-500 p-6 lg:p-8 flex flex-col min-h-[320px]"
              style={{ borderLeft: 'none', borderRight: '1px dashed #737373', borderBottom: '1px dashed #737373' }}>
              <span className="text-5xl font-thin text-stone-500 mb-4">02.</span>
              <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide" style={{ fontFamily: 'Raleway, sans-serif' }}>Подготовка к продаже</h3>
              <p className="text-stone-400 text-xs leading-relaxed" style={{ fontFamily: 'Raleway, sans-serif', lineHeight: 1.6 }}>Консультация по всем вопросам и подготовка коммерческой недвижимости к сдаче в аренду или продаже: юридическая чистота, комплексная уборка, мелкий косметический ремонт, освобождение от имущества предыдущих собственников/арендаторов, замена замков, передача ключей.</p>
            </div>
            <div className="border border-dashed border-neutral-500 p-3 lg:p-4 flex items-center justify-center min-h-[320px]"
              style={{ borderLeft: 'none', borderRight: '1px dashed #737373', borderBottom: '1px dashed #737373' }}>
              <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200" alt="Интерьер" className="w-full h-full object-cover" />
            </div>
            <div className="border border-dashed border-neutral-500 p-6 lg:p-8 flex flex-col min-h-[320px]"
              style={{ borderLeft: 'none', borderBottom: '1px dashed #737373' }}>
              <span className="text-5xl font-thin text-stone-500 mb-4">03.</span>
              <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide" style={{ fontFamily: 'Raleway, sans-serif' }}>Профессиональные фото и видео</h3>
              <p className="text-stone-400 text-xs leading-relaxed" style={{ fontFamily: 'Raleway, sans-serif', lineHeight: 1.6 }}>Профессиональные съемки ваших объектов и видеотуры. Вы получите профессиональные фото и видео Вашего объекта для размещения на сайтах и в соцсетях.</p>
            </div>
          </div>

          {/* СТРОКА 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4">
            <div className="border border-dashed border-neutral-500 p-6 lg:p-8 flex flex-col min-h-[320px]"
              style={{ borderRight: '1px dashed #737373', borderTop: 'none' }}>
              <span className="text-5xl font-thin text-stone-500 mb-4">04.</span>
              <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide" style={{ fontFamily: 'Raleway, sans-serif' }}>Оформление презентации</h3>
              <p className="text-stone-400 text-xs leading-relaxed" style={{ fontFamily: 'Raleway, sans-serif', lineHeight: 1.6 }}>Подготовка общей и технической документации и создание привлекательной и информативной презентации для потенциальных покупателей.</p>
            </div>
            <div className="md:col-span-2 border border-dashed border-neutral-500 p-6 lg:p-8 flex flex-col min-h-[320px]"
              style={{ borderLeft: 'none', borderRight: '1px dashed #737373', borderTop: 'none' }}>
              <span className="text-5xl font-thin text-stone-500 mb-4">05.</span>
              <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide" style={{ fontFamily: 'Raleway, sans-serif' }}>Реклама и online-продвижение</h3>
              <p className="text-stone-400 text-xs leading-relaxed" style={{ fontFamily: 'Raleway, sans-serif', lineHeight: 1.6 }}>Быстрое размещение Вашего офиса, склада, магазина на всех популярных сайтах. А также обязательное размещение в социальных сетях и профессиональная рекламная кампания на лучших электронных площадках.</p>
            </div>
            <div className="border border-dashed border-neutral-500 p-6 lg:p-8 flex flex-col min-h-[320px]"
              style={{ borderLeft: 'none', borderTop: 'none' }}>
              <span className="text-5xl font-thin text-stone-500 mb-4">06.</span>
              <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide" style={{ fontFamily: 'Raleway, sans-serif' }}>Поиск и проверка клиентов</h3>
              <p className="text-stone-400 text-xs leading-relaxed" style={{ fontFamily: 'Raleway, sans-serif', lineHeight: 1.6 }}>Поиск в нашей базе покупателей и арендаторов. Проверка благонадежности контрагентов для Вашего спокойствия.</p>
            </div>
          </div>

          {/* СТРОКА 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <div className="border border-dashed border-neutral-500 p-6 lg:p-8 flex flex-col min-h-[320px]"
              style={{ borderRight: '1px dashed #737373', borderTop: 'none' }}>
              <span className="text-5xl font-thin text-stone-500 mb-4">07.</span>
              <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide" style={{ fontFamily: 'Raleway, sans-serif' }}>Только эффективные показы</h3>
              <p className="text-stone-400 text-xs leading-relaxed" style={{ fontFamily: 'Raleway, sans-serif', lineHeight: 1.6 }}>Все вопросы по покупке — наша забота. Мы подготовим Вас к показу и сделаем его максимально эффективным.</p>
            </div>
            <div className="border border-dashed border-neutral-500 p-6 lg:p-8 flex flex-col min-h-[320px]"
              style={{ borderLeft: 'none', borderRight: '1px dashed #737373', borderTop: 'none' }}>
              <span className="text-5xl font-thin text-stone-500 mb-4">08.</span>
              <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide" style={{ fontFamily: 'Raleway, sans-serif' }}>Отстаиваем лучшую цену</h3>
              <p className="text-stone-400 text-xs leading-relaxed" style={{ fontFamily: 'Raleway, sans-serif', lineHeight: 1.6 }}>Наши профессионалы уберут у Вас необходимость ведения переговоров. Мы отстоим Ваши интересы.</p>
            </div>
            <div className="border border-dashed border-neutral-500 p-6 lg:p-8 flex flex-col min-h-[320px]"
              style={{ borderLeft: 'none', borderRight: '1px dashed #737373', borderTop: 'none' }}>
              <span className="text-5xl font-thin text-stone-500 mb-4">09.</span>
              <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide" style={{ fontFamily: 'Raleway, sans-serif' }}>Профессиональный договор</h3>
              <p className="text-stone-400 text-xs leading-relaxed" style={{ fontFamily: 'Raleway, sans-serif', lineHeight: 1.6 }}>Заключение предварительного договора и юридическое обеспечение его исполнения.</p>
            </div>
            <div className="border border-dashed border-neutral-500 p-6 lg:p-8 flex flex-col min-h-[320px]"
              style={{ borderLeft: 'none', borderTop: 'none' }}>
              <span className="text-5xl font-thin text-stone-500 mb-4">10.</span>
              <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide" style={{ fontFamily: 'Raleway, sans-serif' }}>Договор продажи и безопасность</h3>
              <p className="text-stone-400 text-xs leading-relaxed" style={{ fontFamily: 'Raleway, sans-serif', lineHeight: 1.6 }}>Договор купли-продажи защищает все стороны сделки. Наши юристы подготовят его с учетом Ваших интересов.</p>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================== */}
      {/* ТЕСТ-ДРАЙВ 10 ДНЕЙ — КРУГ-МИШЕНЬ */}
      {/* ========================================================== */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Круг-мишень с цифрой 10 */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative w-[380px] h-[380px] flex items-center justify-center">
                {/* Осевые линии */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[340px] h-px bg-stone-300"></div>
                  <div className="w-px h-[340px] bg-stone-300 absolute"></div>
                </div>
                {/* Внешний круг */}
                <div className="w-[300px] h-[300px] rounded-full border-2 border-stone-400 flex items-center justify-center relative z-10 bg-white">
                  {/* Внутренний круг */}
                  <div className="w-[260px] h-[260px] rounded-full border border-stone-300 flex items-center justify-center">
                    {/* Ещё один внутренний */}
                    <div className="w-[200px] h-[200px] rounded-full border border-stone-200 flex flex-col items-center justify-center">
                      <span className="text-[100px] font-bold text-neutral-900 leading-none" style={{ fontFamily: 'Raleway, sans-serif' }}>10</span>
                      <span className="text-xl text-neutral-600 mt-1" style={{ fontFamily: 'Raleway, sans-serif' }}>дней</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Текст и кнопка */}
            <div>
              <h2 className="text-neutral-900 mb-6"
                style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 400, fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.2 }}>
                Тест-драйв услуг агентства по продаже квартиры
              </h2>
              <p className="text-stone-500 mb-8 leading-relaxed"
                style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 400, fontSize: '15px', lineHeight: 1.7 }}>
                Мы продвигаем Вашу недвижимость на протяжении 10 дней. Вы узнаете максимальную цену квартиры, спрос на Вашу недвижимость, экономите время и получаете сразу выгодные предложения от покупателей.
              </p>
              <button 
                onClick={() => navigateTo('10-dnej-probnogo-perioda')}
                className="px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white transition-colors cursor-pointer"
                style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em' }}>
                Подробнее
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* СЕРЫЙ ИНФО БЛОК */}
      {/* ========================================================== */}
      <div className="bg-[#f2f2f2] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-300">
            
            <div className="py-8 md:py-0 md:pr-12">
              <h3 className="text-neutral-900 font-bold mb-3 cursor-pointer hover:text-neutral-700 transition-colors"
                style={{ fontFamily: 'Raleway, sans-serif', fontSize: '16px' }}
                onClick={() => navigateTo('services-agentstva')}>
                Тарифы (ставки). Полный список риэлторских услуг
              </h3>
              <p className="text-stone-500 text-sm mb-6 leading-relaxed" style={{ fontFamily: 'Raleway, sans-serif', lineHeight: 1.6 }}>
                Тарифы на риэлторские услуги, утвержденные постановлением Совета Министров Республики Беларусь от 7 ноября 2017 г. № 794 «О тарифах на риэлторские услуги».
              </p>
              <button onClick={() => navigateTo('services-agentstva')}
                className="px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white transition-colors cursor-pointer"
                style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em' }}>
                Подробнее
              </button>
            </div>

            <div className="py-8 md:py-0 md:pl-12">
              <h3 className="text-neutral-900 font-bold mb-3 cursor-pointer hover:text-neutral-700 transition-colors"
                style={{ fontFamily: 'Raleway, sans-serif', fontSize: '16px' }}
                onClick={() => navigateTo('poleznaya-informaciya')}>
                Полезная информация
              </h3>
              <p className="text-stone-500 text-sm mb-6 leading-relaxed" style={{ fontFamily: 'Raleway, sans-serif', lineHeight: 1.6 }}>
                РУП «Минское городское агентство по государственной регистрации и земельному кадастру» (до 2013 г. — БРТИ г. Минска).
              </p>
              <button onClick={() => navigateTo('poleznaya-informaciya')}
                className="px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white transition-colors cursor-pointer"
                style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em' }}>
                Подробнее
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}