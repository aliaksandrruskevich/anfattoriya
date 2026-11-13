'use client';

import React, { useState } from 'react';
import { PageId } from '../types';
import PageHero from './PageHero';
import { 
  Eye, Compass, Layers, Camera, CheckCircle2, 
  Sparkles, PhoneCall, ArrowRight, Laptop, Play
} from 'lucide-react';
import { Reveal } from './DesignSystem';

interface ThreeDVisualizationPageProps {
  activePage: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
}

export default function ThreeDVisualizationPage({ activePage, navigateTo, handleAddLead }: ThreeDVisualizationPageProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    handleAddLead(
      name.trim() || 'Заказчик 3D тура',
      phone.trim(),
      `Заказ 3D-тура и съемки для объекта: ${address || 'адрес не указан'}`,
      '3D-Визуализация'
    );
    setSubmitted(true);
  };

  return (
    <div className="space-y-12 animate-fade-in font-sans">
      <PageHero 
        activePage={activePage} 
        navigateTo={navigateTo} 
        handleAddLead={handleAddLead} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-6">
        
        {/* Hero Banner */}
        <Reveal>
          <div className="bg-gradient-to-br from-neutral-900 via-stone-900 to-purple-950 text-white rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Инновационный маркетинг недвижимости
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Интерактивные 3D-виртуальные туры и профессиональная аэросъемка
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Позвольте покупателям гулять по вашей квартире или дому онлайн 24/7. Объекты с виртуальными 3D-турами привлекают в 3 раза больше внимания на Realt.by, отсеивают праздных «экскурсантов» и продаются в среднем на 21 день быстрее.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10 text-stone-200">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">+320%</div>
                <div className="text-xs text-stone-400 mt-1">Рост просмотров объявления</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">4K HDR</div>
                <div className="text-xs text-stone-400 mt-1">Сверхчеткая детализация</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">24 часа</div>
                <div className="text-xs text-stone-400 mt-1">Готовность тура после съемки</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">Бесплатно</div>
                <div className="text-xs text-stone-400 mt-1">При заключении договора продажи</div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Feature Cards */}
        <Reveal>
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                Что входит в пакет визуализации
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">
                Полный арсенал визуального контента для максимальной конверсии покупателей
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Compass className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-neutral-900">3D-тур «Эффект присутствия»</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Полноценное перемещение из комнаты в комнату с возможностью кругового обзора 360° по вертикали и горизонтали. Покупатель изучает каждый уголок без выезда на место.
                </p>
                <div className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl w-fit">
                  Поддержка смартфона, планшета и ПК
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-neutral-900">Кукольный домик & Планировка</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Трехмерная проекция всей квартиры (Dollhouse View) с точными размерами комнат и дверных проемов. Покупатель видит геометрию пространства и расстановку мебели.
                </p>
                <div className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl w-fit">
                  Точность лазерных замеров до 1 см
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Camera className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-neutral-900">Интерьерные фото & Аэросъемка</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Журнальная интерьерная фотосъемка с широким углом объектива и видео с квадрокоптера для загородных домов, коттеджей и живописных видов из окон.
                </p>
                <div className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl w-fit">
                  Профессиональная цветокоррекция
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Lead Capture Form */}
        <Reveal>
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xl max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900">
                Заказать 3D-съемку вашего объекта недвижимости
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">
                Для клиентов с эксклюзивным договором продажи — профессиональная съемка и 3D-тур создаются <span className="text-purple-600 font-bold">бесплатно</span>.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold">Заявка на 3D-тур принята!</h4>
                <p className="text-xs text-emerald-700">
                  Фотограф свяжется с вами для согласования удобного времени проведения съемки.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">Ваше имя</label>
                  <input 
                    type="text" 
                    placeholder="Иван" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">Телефон для связи *</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="+375 29 000-00-00" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">Адрес объекта или район</label>
                  <input 
                    type="text" 
                    placeholder="Например: ул. Репина, 4" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Заказать профессиональный 3D-тур
                </button>
              </form>
            )}
          </div>
        </Reveal>

      </div>
    </div>
  );
}
