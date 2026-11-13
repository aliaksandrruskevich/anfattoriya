import React from 'react';
import { PageId } from '../types';
import PageHero from './PageHero';

interface TariffsPageProps {
  activePage: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
}

export default function TariffsPage({ activePage, navigateTo, handleAddLead }: TariffsPageProps) {

  const saleTariffs = [
    { cost: 'До 700 включительно', rate: '6,0' },
    { cost: 'Свыше 700 до 2000 включительно', rate: '5,0' },
    { cost: 'Свыше 2000 до 3000 включительно', rate: '4,0' },
    { cost: 'Свыше 3000 до 4200 включительно', rate: '3,0' },
    { cost: 'Свыше 4200 до 5000 включительно', rate: '2,5' },
    { cost: 'Свыше 5000 до 5800 включительно', rate: '2,4' },
    { cost: 'Свыше 5800 до 6600 включительно', rate: '2,3' },
    { cost: 'Свыше 6600 до 7500 включительно', rate: '2,2' },
    { cost: 'Свыше 7500 до 8300 включительно', rate: '2,1' },
    { cost: 'Свыше 8300 до 9100 включительно', rate: '2,0' },
    { cost: 'Свыше 9100 до 10 000 включительно', rate: '1,9' },
    { cost: 'Свыше 10 000 до 10 500 включительно', rate: '1,8' },
    { cost: 'Свыше 10 500 до 11 600 включительно', rate: '1,7' },
    { cost: 'Свыше 11 600 до 12 400 включительно', rate: '1,6' },
    { cost: 'Свыше 12 400', rate: '1,5' },
  ];

  const serviceTariffs = [
    { id: '1', name: 'Консультационные услуги по сделкам с объектами недвижимого имущества (в письменной форме)', price: '135', sub: false },
    { id: '2', name: 'Услуги по представлению информации о спросе и предложении на объекты недвижимого имущества (в письменной форме):', price: '', sub: true },
    { id: '2.1', name: 'отчуждение и (или) приобретение объектов недвижимого имущества', price: '225', sub: false },
    { id: '3', name: 'Услуги по подбору вариантов сделки (за исключением сделки по найму жилых помещений) с объектом недвижимого имущества:', price: '', sub: true },
    { id: '3.1', name: 'квартира (комната, доля)', price: '2025', sub: false },
    { id: '6', name: 'Организация и проведение согласования условий предстоящей сделки с объектами недвижимого имущества', price: '450', sub: false },
    { id: '7', name: 'Услуги по оказанию помощи в подготовке (оформлении) документов, связанных с совершением сделки с объектами недвижимого имущества:', price: '', sub: true },
    { id: '7.1', name: 'отчуждение и (или) приобретение квартиры (комнаты, доли)', price: '1350', sub: false },
    { id: '9', name: 'Услуги по содействию при заключении, исполнении, прекращении договоров залога объектов недвижимого имущества', price: '675', sub: false },
    { id: '10', name: 'Услуги по оказанию помощи в подготовке (оформлении) документов, связанных с государственной регистрацией недвижимого имущества, прав на него и сделок с ним:', price: '', sub: true },
    { id: '10.1', name: 'отчуждение и (или) приобретение квартиры (комнаты, доли)', price: '675', sub: false },
  ];

  return (
    <div className="animate-fade-in">
      
      {/* Баннер с формой */}
      <PageHero 
        activePage="services-agentstva"
        navigateTo={navigateTo} 
        handleAddLead={handleAddLead} 
      />

      {/* ТАБЛИЦА 1: Тарифы по продаже (тёмный фон) */}
      <div className="bg-[#1a1a1a] py-20 w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <h2 className="text-white text-center mb-4"
            style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 300, fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: 1.2 }}>
            Тарифы на риэлтерские услуги по содействию в продаже объектов недвижимого имущества
          </h2>
          
          <p className="text-stone-400 text-center text-xs mb-12" style={{ fontFamily: 'Raleway, sans-serif' }}>
            Стоимость объекта недвижимого имущества, указываемая физическими лицами (за исключением индивидуальных предпринимателей) в договоре купли-продажи (базовых величин)
          </p>

          <div className="border border-dashed border-neutral-600 rounded-xl overflow-hidden">
            <div className="grid grid-cols-2 border-b border-dashed border-neutral-600">
              <div className="p-5 text-white font-bold text-xs uppercase tracking-wider" style={{ fontFamily: 'Raleway, sans-serif' }}>
                Стоимость объекта (базовых величин)
              </div>
              <div className="p-5 text-white font-bold text-xs uppercase tracking-wider text-center border-l border-dashed border-neutral-600" style={{ fontFamily: 'Raleway, sans-serif' }}>
                Предельный максимальный тариф (%)
              </div>
            </div>
            
            {saleTariffs.map((row, index) => (
              <div key={index} className={`grid grid-cols-2 ${index !== saleTariffs.length - 1 ? 'border-b border-dashed border-neutral-700' : ''} hover:bg-white/5 transition-colors`}>
                <div className="p-4 text-stone-300 text-sm" style={{ fontFamily: 'Raleway, sans-serif' }}>{row.cost}</div>
                <div className="p-4 text-white font-bold text-sm text-center border-l border-dashed border-neutral-600" style={{ fontFamily: 'Raleway, sans-serif' }}>{row.rate}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ТАБЛИЦА 2: Тарифы по услугам (светлый фон) */}
      <div className="bg-white py-20 w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <h2 className="text-neutral-900 text-center mb-12"
            style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 300, fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: 1.2 }}>
            Тарифы на риэлтерские услуги
          </h2>

          <div>
            <div className="grid grid-cols-12 border-b-2 border-dashed border-neutral-300 pb-3 mb-2">
              <div className="col-span-1 text-neutral-900 font-bold text-xs uppercase tracking-wider" style={{ fontFamily: 'Raleway, sans-serif' }}>№ п/п</div>
              <div className="col-span-8 text-neutral-900 font-bold text-xs uppercase tracking-wider" style={{ fontFamily: 'Raleway, sans-serif' }}>Наименование риэлтерской услуги</div>
              <div className="col-span-3 text-neutral-900 font-bold text-xs uppercase tracking-wider text-right" style={{ fontFamily: 'Raleway, sans-serif' }}>Тариф (бел. руб.)</div>
            </div>
            
            {serviceTariffs.map((row, index) => (
              <div key={index} className={`grid grid-cols-12 py-3 ${index !== serviceTariffs.length - 1 ? 'border-b border-dashed border-stone-200' : ''}`}>
                <div className={`col-span-1 text-sm ${row.sub ? 'text-stone-500' : 'text-neutral-900 font-bold'}`} style={{ fontFamily: 'Raleway, sans-serif' }}>{row.id}</div>
                <div className={`col-span-8 text-sm ${row.sub ? 'text-stone-500 font-bold pl-4' : 'text-neutral-700'}`} style={{ fontFamily: 'Raleway, sans-serif' }}>{row.name}</div>
                <div className={`col-span-3 text-sm text-right ${row.price ? 'text-neutral-900 font-bold' : ''}`} style={{ fontFamily: 'Raleway, sans-serif' }}>{row.price}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}