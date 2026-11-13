'use client';

import React, { useState } from 'react';
import { PageId } from '../types';
import PageHero from './PageHero';
import { 
  ShieldAlert, CheckCircle2, MessageSquare, PhoneCall, 
  Award, Clock, Star, Send, UserCheck, HeartHandshake
} from 'lucide-react';
import { Reveal } from './DesignSystem';

interface QualityControlPageProps {
  activePage: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, extra: string, source: string) => void;
}

export default function QualityControlPage({ activePage, navigateTo, handleAddLead }: QualityControlPageProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agentName, setAgentName] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    handleAddLead(
      name.trim() || 'Клиент отдела качества',
      phone.trim(),
      `Оценка качества: ${rating} звёзд. Риэлтер: ${agentName || 'не указан'}. Сообщение: ${message}`,
      'Служба контроля качества'
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
        
        {/* Header Block */}
        <Reveal>
          <div className="bg-gradient-to-br from-neutral-900 via-stone-900 to-purple-950 text-white rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30">
                <HeartHandshake className="w-4 h-4 text-purple-400" />
                Прямая линия руководства
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Служба контроля качества обслуживания клиентов «АН Фаттория»
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Ваше доверие — наш главный капитал. Мы лично рассматриваем каждый отзыв, предложение или замечание по работе специалистов агентства. Если у вас возник вопрос по сделке или обслуживанию — напишите нам напрямую, и руководство свяжется с вами в течение 24 часов.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10 text-stone-200">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">24 ч.</div>
                <div className="text-xs text-stone-400 mt-1">Регламент ответа директора</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">98.4%</div>
                <div className="text-xs text-stone-400 mt-1">Индекс удовлетворенности (CSI)</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">100%</div>
                <div className="text-xs text-stone-400 mt-1">Персональный контроль сделок</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">Минюст</div>
                <div className="text-xs text-stone-400 mt-1">Соблюдение стандартов РБ</div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Feedback / Quality Form */}
        <Reveal>
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xl space-y-8 max-w-4xl mx-auto">
            <div className="border-b border-stone-100 pb-6 text-center space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900">
                Оставить обратную связь или задать вопрос руководству
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">
                Все сообщения поступают напрямую руководителю службы контроля качества
              </p>
            </div>

            {submitted ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-bold">Спасибо за обратную связь!</h4>
                <p className="text-sm text-emerald-700 max-w-md mx-auto">
                  Ваше обращение принято и передано руководству агентства. Мы свяжемся с вами в течение рабочего дня.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2 uppercase">Ваша оценка работы агентства</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className={`p-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                          rating >= star 
                            ? 'bg-purple-50 border-purple-300 text-purple-700' 
                            : 'bg-stone-50 border-stone-200 text-stone-400'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${rating >= star ? 'fill-purple-600 text-purple-600' : ''}`} />
                        <span>{star}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2 uppercase">Ваше имя *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Имя Фамилия" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2 uppercase">Номер телефона для связи *</label>
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
                  <label className="block text-xs font-bold text-stone-700 mb-2 uppercase">ФИО риэлтера (если обращались к конкретному специалисту)</label>
                  <input 
                    type="text" 
                    placeholder="Например: Савина Лариса" 
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2 uppercase">Текст обращения / предложения / отзыва</label>
                  <textarea 
                    rows={4}
                    placeholder="Опишите ситуацию, предложение или ваше впечатление от сотрудничества..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-purple-600 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Отправить обращение руководству
                </button>
              </form>
            )}
          </div>
        </Reveal>

        {/* 4 Standards of Service */}
        <Reveal>
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h3 className="text-2xl font-bold text-neutral-900">
                Стандарты обслуживания АН Фаттория
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">
                Принципы, на которых строится работа каждого сотрудника компании
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-stone-200 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-neutral-900 text-base">Аттестация Минюста</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Все сделки ведутся только специалистами, имеющими действующие идентификационные пластиковые карточки и свидетельства Минюста РБ.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-stone-200 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-neutral-900 text-base">Пунктуальность</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Специалист на связи 7 дней в неделю, всегда прибывает на показ за 10 минут до встречи и оперативно предоставляет отчеты по рекламе.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-stone-200 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-neutral-900 text-base">Прозрачность тарифов</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Никаких скрытых платежей или скрытых комиссий. Все расчеты производятся строго в соответствии с государственными тарифами Совмина № 754.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-stone-200 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-neutral-900 text-base">Интересы клиента</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Мы отстаиваем ваши финансовые интересы при торге, проверяем каждый документ и не допускаем рискованных компромиссов.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

      </div>
    </div>
  );
}
