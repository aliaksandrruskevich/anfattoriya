'use client';

import React, { useState } from 'react';
import { PageId } from '../types';
import PageHero from './PageHero';
import { 
  Gift, Percent, Truck, Palette, Sofa, ShoppingBag, 
  CheckCircle2, ArrowRight, PhoneCall, Sparkles, Building2
} from 'lucide-react';
import { Reveal } from './DesignSystem';

interface PartnerDiscountsPageProps {
  activePage: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
}

export default function PartnerDiscountsPage({ activePage, navigateTo, handleAddLead }: PartnerDiscountsPageProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPartner, setSelectedPartner] = useState('Все партнеры (пакет новосела)');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    handleAddLead(
      name.trim() || 'Клиент партнерской программы',
      phone.trim(),
      `Запрос сертификата скидок: ${selectedPartner}`,
      'Скидки от партнеров'
    );
    setSubmitted(true);
  };

  const PARTNERS = [
    {
      category: 'Мебель и интерьер',
      icon: Sofa,
      discount: 'до 15%',
      brand: 'Мебельные салоны и фабрики',
      description: 'Скидки на корпусную и мягкую мебель, кухни по индивидуальным размерам и ортопедические матрасы.',
      benefit: 'Экономия до 2,500 BYN на комплектации 2-к квартиры'
    },
    {
      category: 'Ремонт и отделка',
      icon: Palette,
      discount: 'до 12%',
      brand: 'Проверенные строительные бригады',
      description: 'Комплексный ремонт под ключ с официальным договором, гарантией 3 года и фиксированной сметой.',
      benefit: 'Бесплатный дизайн-проект планировки при заказе'
    },
    {
      category: 'Стройматериалы',
      icon: ShoppingBag,
      discount: 'до 10%',
      brand: 'Строительные гипермаркеты (ОМА, Материк)',
      description: 'Специальные дисконтные карты новоселов на черновые и чистовые строительные материалы, плитку, сантехнику.',
      benefit: 'Оптовые цены на весь чек при первой покупке'
    },
    {
      category: 'Грузоперевозки и переезд',
      icon: Truck,
      discount: '20%',
      brand: 'Службы профессионального мувинга',
      description: 'Бережная упаковка мебели, разборка/сборка, аккуратные грузчики и чистые мебельные фургоны.',
      benefit: 'Бесплатные коробки и упаковочный материал'
    },
    {
      category: 'Банки и страхование',
      icon: Building2,
      discount: '-0.3%',
      brand: 'Ведущие банки Беларуси',
      description: 'Сниженная ставка по ипотечным кредитам для клиентов агентства и льготные тарифы на страхование жилья.',
      benefit: 'Ускоренное рассмотрение кредитной заявки за 24 часа'
    },
    {
      category: 'Дизайн интерьера',
      icon: Sparkles,
      discount: 'до 25%',
      brand: 'Студии архитектуры и дизайна',
      description: 'Разработка авторских планировочных решений, 3D-визуализации интерьеров и ведомости чистовых материалов.',
      benefit: 'Авторский надзор за ремонтом со скидкой'
    }
  ];

  return (
    <div className="space-y-12 animate-fade-in font-sans">
      <PageHero 
        activePage={activePage} 
        navigateTo={navigateTo} 
        handleAddLead={handleAddLead} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-6">
        
        {/* Banner */}
        <Reveal>
          <div className="bg-gradient-to-br from-neutral-900 via-stone-900 to-purple-950 text-white rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30">
                <Gift className="w-4 h-4 text-purple-400" />
                Программа лояльности «Клуб новоселов Фаттория»
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Эксклюзивные скидки и бонусы от партнеров для наших клиентов
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Каждый клиент агентства недвижимости «АН Фаттория» при покупке или продаже объекта получает персональный сертификат новосела. Экономьте до 5,000 BYN на ремонте, мебели, переезде и материалах.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10 text-stone-200">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">до 25%</div>
                <div className="text-xs text-stone-400 mt-1">Максимальная скидка</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">20+</div>
                <div className="text-xs text-stone-400 mt-1">Проверенных партнеров</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">5,000+ BYN</div>
                <div className="text-xs text-stone-400 mt-1">Средняя экономия новосела</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">Бессрочно</div>
                <div className="text-xs text-stone-400 mt-1">Действие сертификатов</div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Partners Grid */}
        <Reveal>
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                Категории партнерских предложений
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">
                Мы отобрали компании с безупречной репутацией и честными специальными ценами для наших клиентов
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PARTNERS.map((partner, idx) => {
                const Icon = partner.icon;
                return (
                  <div key={idx} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black text-purple-600 bg-purple-100/60 px-3 py-1 rounded-full border border-purple-200">
                          {partner.discount}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                        {partner.category}
                      </span>
                      <h4 className="font-bold text-neutral-900 text-lg">{partner.brand}</h4>
                      <p className="text-xs text-stone-600 leading-relaxed">{partner.description}</p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 text-xs font-semibold text-purple-700 bg-purple-50/60 p-2.5 rounded-xl">
                      ✓ {partner.benefit}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* Certificate Request Form */}
        <Reveal>
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xl max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900">
                Получить пакет скидочных сертификатов
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">
                Оставьте заявку, и мы вышлем электронные сертификаты или передадим их в офисе агентства
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold">Сертификаты зарезервированы!</h4>
                <p className="text-xs text-emerald-700">
                  Менеджер программы лояльности свяжется с вами для передачи промокодов и партнерских карт.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">Телефон *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="+375 29 000-00-00" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">Интересующая категория скидок</label>
                  <select 
                    value={selectedPartner}
                    onChange={(e) => setSelectedPartner(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                  >
                    <option value="Все партнеры (пакет новосела)">Все партнеры (полный пакет новосела)</option>
                    <option value="Мебель и кухни">Мебель, кухни и матрасы (-15%)</option>
                    <option value="Ремонт и отделка">Строительные бригады и отделка (-12%)</option>
                    <option value="Стройматериалы">Гипермаркеты ОМА, Материк (-10%)</option>
                    <option value="Грузоперевозки и переезд">Службы переезда и мувинга (-20%)</option>
                    <option value="Дизайн интерьера">Дизайн интерьера и 3D-проекты (-25%)</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Gift className="w-4 h-4" />
                  Получить персональные скидочные сертификаты
                </button>
              </form>
            )}
          </div>
        </Reveal>

      </div>
    </div>
  );
}
