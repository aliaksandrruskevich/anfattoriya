"use client";
import React, { useState } from 'react';
import { PageId } from '../types';
import { 
  FileText, AlertTriangle, CheckCircle2, Shield, ArrowRight, 
  FileCheck, Scale, Lock, Check, Phone, ShieldCheck, Award 
} from 'lucide-react';

interface Props { 
  activePage: PageId; 
  navigateTo: (p: PageId) => void; 
  handleAddLead: (n: string, ph: string, e: string, s: string) => void; 
}

export default function ContractConsultationPage({ activePage, navigateTo, handleAddLead }: Props) {
  const [formSent, setFormSent] = useState(false);

  const mustHave = [
    { title: 'Полные паспортные данные сторон', desc: 'ФИО, дата рождения, идентификационный номер, адрес регистрации, реквизиты паспорта — всё должно быть указано без сокращений.' },
    { title: 'Точное описание объекта недвижимости', desc: 'Адрес, этаж, площадь (общая/жилая), кадастровый номер. Любые расхождения с техпаспортом БРТИ несут риски приостановки регистрации.' },
    { title: 'Цена и строгий порядок расчётов', desc: 'Сумма в белорусских рублях (и эквивалент), способ расчёта (ячейка, аккредитив или безналичный перевод) и точные сроки передачи денег.' },
    { title: 'Сроки передачи и освобождения объекта', desc: 'Конкретная календарная дата освобождения квартиры и подписания передаточного акта. Ответственность и пеня за каждый день просрочки.' },
    { title: 'Гарантии и заверения продавца', desc: 'Письменная гарантия, что объект не заложен, не арестован, не сдан в аренду и свободен от притязаний любых третьих лиц.' },
    { title: 'Согласие супруга(и) и органов опеки', desc: 'Нотариально заверенное согласие супруга (в том числе бывшего при совместной собственности) и разрешение опеки при детях-собственниках.' },
  ];

  const redFlags = [
    { title: 'Продажа по генеральной доверенности', desc: 'Доверенность должна быть проверена по реестру на отсутствие отзыва. Мы всегда связываемся с доверителем по видеосвязи.' },
    { title: 'Свежее наследство (менее 6 месяцев)', desc: 'Высокий риск появления других законных наследников, восстановивших срок принятия наследства через суд.' },
    { title: 'Частая перепродажа объекта', desc: 'Если за 2–3 года квартира сменила несколько владельцев — это признак скрытого дефекта или сомнительной правовой истории.' },
    { title: 'Предложение занизить цену в договоре', desc: 'При признании сделки недействительной суд обяжет вернуть только ту сумму, которая официально зафиксирована в договоре.' },
    { title: 'Отказ от нотариального удостоверения', desc: 'Настаивание на простой письменной форме без проверки юристом может скрывать дефекты дееспособности или полномочий.' },
    { title: 'Прописанные третьи лица', desc: 'Наличие лиц с правом пожизненного пользования или временно выписанных (служба в армии, осужденные).' },
  ];

  const documentList = [
    'Свидетельство о государственной регистрации права (выписка из ЕГРНИ)',
    'Технический паспорт БРТИ с актуальной планировкой',
    'Справка о составе семьи и лицевом счете (отсутствие задолженностей)',
    'Нотариально удостоверенное согласие супруга(и)',
    'Разрешение органов опеки и попечительства (при наличии несовершеннолетних)',
    'Справки из психоневрологического и наркологического диспансеров (ПНД/НД)',
    'Справка об отсутствии задолженностей по коммунальным платежам',
  ];

  return (
    <div className="bg-[#faf8f6] text-neutral-900 animate-fade-in font-sans min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative text-white pt-32 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
        {/* ФОНОВОЕ ФОТО */}
        <div className="absolute inset-0 z-0">
          <img
            src="/photo/contract-hero.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-6">
                <FileCheck className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Правовая экспертиза договоров</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-normal text-white leading-[1.15] tracking-tight mb-6" style={{ fontFamily: 'Raleway, sans-serif', textShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>
                Анализ договора <span className="text-purple-300 font-medium">купли-продажи</span>
              </h1>

              <p className="text-stone-200 text-base sm:text-lg leading-relaxed max-w-2xl mb-8" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                Профессиональная проверка проекта договора перед подписанием. Выявим скрытые риски, несправедливые пункты и защитим ваши финансовые интересы.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-900/50 border border-purple-400/40 flex items-center justify-center shrink-0 backdrop-blur-md">
                    <Award className="w-4 h-4 text-purple-300" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-white">Минюст РБ</div>
                    <div className="text-stone-300">Аттестация</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-900/50 border border-purple-400/40 flex items-center justify-center shrink-0 backdrop-blur-md">
                    <Shield className="w-4 h-4 text-purple-300" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-white">Белгосстрах</div>
                    <div className="text-stone-300">100% защита</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                  <div className="w-8 h-8 rounded-xl bg-purple-900/50 border border-purple-400/40 flex items-center justify-center shrink-0 backdrop-blur-md">
                    <CheckCircle2 className="w-4 h-4 text-purple-300" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-white">Экспертиза</div>
                    <div className="text-stone-300">В день обращения</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Lead Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Экспертиза документов</span>
                  <span className="text-xs text-stone-300">Конфиденциально</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  Проверить договор перед сделкой
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 mb-6">
                  Отправьте проект договора или оставьте контакт для консультации с ведущим юристом.
                </p>

                {formSent ? (
                  <div className="bg-purple-900/50 border border-purple-400/40 rounded-2xl p-6 text-center animate-fade-in">
                    <div className="w-12 h-12 rounded-full bg-purple-500/30 text-purple-200 flex items-center justify-center mx-auto mb-3">
                      <Check className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">Заявка принята!</h3>
                    <p className="text-xs text-stone-300">Юрист агентства «АН Фаттория» свяжется с вами в течение 10 минут.</p>
                  </div>
                ) : (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value || '';
                    const phone = (form.querySelector('[name="phone"]') as HTMLInputElement)?.value || '';
                    const service = (form.querySelector('[name="service"]') as HTMLSelectElement)?.value || 'Экспертиза договора';
                    if (phone) {
                      handleAddLead(name, phone, `Услуга: ${service}`, 'Анализ договора: Главная форма');
                      setFormSent(true);
                    }
                  }} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-200 mb-1.5">Ваше имя</label>
                      <input 
                        name="name" 
                        type="text" 
                        placeholder="Например, Сергей" 
                        className="w-full px-4 py-3 bg-white/10 border border-white/25 rounded-xl text-white placeholder-stone-400 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-200 mb-1.5">Номер телефона <span className="text-rose-400">*</span></label>
                      <input 
                        name="phone" 
                        type="tel" 
                        required 
                        placeholder="+375 (__) ___-__-__" 
                        defaultValue="+375 "
                        className="w-full px-4 py-3 bg-white/10 border border-white/25 rounded-xl text-white placeholder-stone-400 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-200 mb-1.5">Необходимая услуга</label>
                      <select 
                        name="service" 
                        className="w-full px-4 py-3 bg-white/10 border border-white/25 rounded-xl text-white text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all cursor-pointer"
                      >
                        <option value="Анализ готового договора купли-продажи">Анализ готового договора купли-продажи</option>
                        <option value="Составление индивидуального договора">Составление индивидуального договора</option>
                        <option value="Комплексное сопровождение сделки">Комплексное сопровождение сделки</option>
                      </select>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-purple-600/30 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Заказать правовой анализ</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ЧТО ОБЯЗАТЕЛЬНО ДОЛЖНО БЫТЬ В ДОГОВОРЕ */}
      <section className="py-20 lg:py-28 bg-[#faf8f6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider mb-3">
              Чек-лист юриста
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-neutral-900 tracking-tight" style={{ fontFamily: 'Raleway, sans-serif' }}>
              Что обязательно должно быть в договоре
            </h2>
            <p className="text-stone-600 text-base sm:text-lg mt-4">
              Ключевые существенные условия договора купли-продажи недвижимости согласно законодательству РБ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mustHave.map((item, i) => (
              <div 
                key={i} 
                className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 hover:shadow-md hover:border-purple-300 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4 font-bold">
                  0{i + 1}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ОПАСНЫЕ ПУНКТЫ И РИСКИ */}
      <section className="py-20 lg:py-28 bg-white border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider mb-3">
              Внимание к деталям
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-neutral-900 tracking-tight" style={{ fontFamily: 'Raleway, sans-serif' }}>
              Красные флаги в договорах
            </h2>
            <p className="text-stone-600 text-base sm:text-lg mt-4">
              Пункты и обстоятельства, из-за которых сделка может быть признана недействительной.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {redFlags.map((item, i) => (
              <div 
                key={i} 
                className="bg-[#faf8f6] border border-stone-200/90 rounded-3xl p-6 sm:p-8 hover:border-rose-300 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ПАКЕТ ДОКУМЕНТОВ */}
      <section className="py-20 lg:py-24 bg-[#faf8f6] border-t border-stone-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-normal text-neutral-900" style={{ fontFamily: 'Raleway, sans-serif' }}>
              Документы, необходимые для проверки
            </h2>
            <p className="text-stone-600 text-sm mt-3">
              Полный пакет правоустанавливающих документов для совершения чистой сделки
            </p>
          </div>

          <div className="space-y-3">
            {documentList.map((doc, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3.5 p-4 bg-white border border-stone-200/90 rounded-2xl shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-neutral-900">{doc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-[#141312] text-white py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-normal mb-4" style={{ fontFamily: 'Raleway, sans-serif' }}>
            Хотите проверить договор перед подписанием?
          </h2>
          <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto mb-8">
            Отправьте документ нашему юридическому отделу. Мы проведем полную экспертизу и предоставим письменное заключение.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold rounded-xl text-sm transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              Отправить договор на аудит
            </button>
            <a 
              href="tel:+375296380053" 
              className="px-8 py-4 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-sm transition-all border border-stone-700 flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-purple-400" />
              <span>+375 (29) 638-00-53</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
