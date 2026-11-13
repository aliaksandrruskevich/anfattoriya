'use client';

import React, { useState } from 'react';
import { PageId } from '../types';
import PageHero from './PageHero';
import { 
  BookOpen, FileText, CheckCircle2, AlertTriangle, 
  HelpCircle, Download, ArrowRight, ShieldCheck, Landmark
} from 'lucide-react';
import { Reveal } from './DesignSystem';

interface UsefulInfoPageProps {
  activePage: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
}

export default function UsefulInfoPage({ activePage, navigateTo, handleAddLead }: UsefulInfoPageProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    handleAddLead(
      name.trim() || 'Читатель базы знаний',
      phone.trim(),
      'Запрос полного комплекта памяток и чеклистов по сделке',
      'Полезная информация'
    );
    setSubmitted(true);
  };

  const ARTICLES_GUIDE = [
    {
      title: 'Список документов для продажи квартиры в 2026 году',
      badge: 'Для продавца',
      desc: 'Паспорт собственника, свидетельство о госрегистрации БРТИ, техпаспорт объекта, копия лицевого счета из РСЦ, нотариальные согласия супругов и совершеннолетних жильцов.',
      points: [
        'Справка об отсутствии задолженности по коммунальным платежам',
        'Согласие органов опеки, если собственник или жилец — несовершеннолетний',
        'Разрешение банка при наличии непогашенного кредита или ипотеки'
      ]
    },
    {
      title: 'Налогообложение сделок с недвижимостью в Беларуси',
      badge: 'Налоги и сборы',
      desc: 'В Республике Беларусь продажа одной квартиры, одного жилого дома и одного земельного участка в течение 5 календарных лет НЕ облагается подоходным налогом.',
      points: [
        'Вторая продажа аналогичного объекта за 5 лет облагается налогом 13%',
        'Налог уплачивается с разницы между ценой продажи и документально подтвержденными расходами на покупку',
        'Нерезиденты РБ уплачивают налог 13% с первой же продажи'
      ]
    },
    {
      title: 'Что можно и что нельзя при перепланировке квартиры',
      badge: 'Законодательство',
      desc: 'Постановление Совета Министров РБ № 384 четко разграничивает виды строительных работ, требующих предварительного согласования в исполкоме.',
      points: [
        'ЗАПРЕЩЕНО: перенос радиаторов на балкон, объединение балкона с комнатой без перегородки, снос вентиляционных шахт',
        'ТРЕБУЕТ СОГЛАСОВАНИЯ: перенос мокрых зон (кухни, санузлов), устройство проемов в несущих стенах',
        'БЕЗ СОГЛАСОВАНИЯ: остекление балконов типовыми рамами, замена напольных покрытий без изменения шумоизоляции'
      ]
    },
    {
      title: 'Чеклист покупателя: как проверить юридическую чистоту',
      badge: 'Для покупателя',
      desc: 'Главное правило безопасной покупки — изучить не только действующего собственника, но и всю цепочку переходов прав с момента постройки дома.',
      points: [
        'Заказ расширенной архивной выписки из регистрационной книги БРТИ',
        'Проверка истории приватизации и чеков «Жилье»',
        'Исключение прав временно выписанных граждан (армия, места лишения свободы)'
      ]
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
                <BookOpen className="w-4 h-4 text-purple-400" />
                Юридическая библиотека АН Фаттория
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Полезная информация, инструкции и чеклисты по недвижимости
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Экспертные памятки от аттестованных риэлтеров и юристов. Все нормы приведены в строгое соответствие с Гражданским и Жилищным кодексами Республики Беларусь, указами Президента и инструкциями Минюста РБ.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10 text-stone-200">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">100%</div>
                <div className="text-xs text-stone-400 mt-1">Актуальность законов 2026</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">0 руб.</div>
                <div className="text-xs text-stone-400 mt-1">Бесплатный доступ к материалам</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">БРТИ & РСЦ</div>
                <div className="text-xs text-stone-400 mt-1">Регламенты государственных служб</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">Юристы</div>
                <div className="text-xs text-stone-400 mt-1">Проверено аттестованными экспертами</div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Guides Grid */}
        <Reveal>
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                Главные темы для участников сделок
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">
                Практические руководства, которые помогут избежать ошибок, финансовых потерь и судебных споров
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ARTICLES_GUIDE.map((art, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">
                    {art.badge}
                  </span>
                  <h4 className="text-lg sm:text-xl font-bold text-neutral-900 leading-snug">
                    {art.title}
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">{art.desc}</p>
                  
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <span className="text-[11px] font-bold text-stone-500 uppercase">Ключевые нюансы:</span>
                    {art.points.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2 text-xs text-stone-700">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Checklist Download Lead Form */}
        <Reveal>
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xl max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900">
                Получить полный чеклист документов на телефон
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">
                Отправим в Viber или Telegram PDF-памятку со списком всех справок, адресов инстанций Минска и образцами договоров
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold">Материалы отправлены!</h4>
                <p className="text-xs text-emerald-700">
                  Специалист выслал файл с чеклистом и образцами документов по указанному номеру.
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
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase">Телефон (Viber/Telegram) *</label>
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

                <button 
                  type="submit"
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Скачать PDF-памятку для сделки бесплатно
                </button>
              </form>
            )}
          </div>
        </Reveal>

      </div>
    </div>
  );
}
