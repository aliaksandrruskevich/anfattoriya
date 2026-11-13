"use client";
import React, { useState } from 'react';
import { X, Shield, Lock, FileText, CheckCircle2, Phone, Mail, Building, Scale, ArrowLeft } from 'lucide-react';
import { PageId } from '../types';

interface PrivacyPolicyModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialTab?: 'privacy' | 'cookies';
  isFullPage?: boolean;
  navigateTo?: (pageId: PageId) => void;
}

export default function PrivacyPolicyModal({
  isOpen = true,
  onClose,
  initialTab = 'privacy',
  isFullPage = false,
  navigateTo
}: PrivacyPolicyModalProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'cookies'>(initialTab);

  React.useEffect(() => {
    if (!isOpen || isFullPage || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullPage, onClose]);

  if (!isOpen && !isFullPage) return null;

  const content = (
    <div className="space-y-6 text-sm text-neutral-700 leading-relaxed font-normal">
      {/* Tabs */}
      <div className="flex border-b border-neutral-200 gap-2 mb-6">
        <button
          onClick={() => setActiveTab('privacy')}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'privacy'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          Политика конфиденциальности
        </button>
        <button
          onClick={() => setActiveTab('cookies')}
          className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'cookies'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Политика использования файлов Cookie
        </button>
      </div>

      {activeTab === 'privacy' ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-purple-50 border border-purple-200/80 rounded-xl p-4 text-xs text-purple-900 flex items-start gap-3">
            <Scale className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold mb-0.5">Правовые основания обработки данных</div>
              Настоящая Политика составлена в строгом соответствии с Законом Республики Беларусь от 7 мая 2021 г. № 99-З «О защите персональных данных» и нормативными документами Национального центра защиты персональных данных Республики Беларусь (НЦЗПД).
            </div>
          </div>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-bold">1</span>
              Общие положения и сведения об Операторе
            </h3>
            <p>
              1.1. Оператором, осуществляющим обработку персональных данных пользователей сайта <strong>fattoria.by</strong>, является <strong>Общество с ограниченной ответственностью «АН Фаттория»</strong> (ООО «АН Фаттория»), зарегистрированное Минским горисполкомом, УНП 193625457, специальное разрешение (лицензия) на право осуществления риэлтерской деятельности № 02240/446, выданное Министерством юстиции Республики Беларусь.
            </p>
            <p>
              1.2. Местонахождение оператора: 220035, Республика Беларусь, г. Минск, ул. Репина, д. 4, пом. 458. Электронная почта для обращений по персональным данным: <a href="mailto:fattoria1900088@gmail.com" className="text-purple-600 font-medium underline">fattoria1900088@gmail.com</a>, телефон: <a href="tel:+375296380053" className="text-purple-600 font-medium underline">+375 29 638-00-53</a>.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-bold">2</span>
              Категории обрабатываемых персональных данных
            </h3>
            <p>Оператор может обрабатывать следующие данные, предоставляемые субъектом добровольно:</p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-600">
              <li>Фамилия, имя, отчество (при указании в формах обратной связи);</li>
              <li>Контактный номер телефона (мобильный/городской);</li>
              <li>Адрес электронной почты (e-mail);</li>
              <li>Параметры объектов недвижимости (адрес, количество комнат, желаемая цена, характеристики объекта);</li>
              <li>Технические данные: IP-адрес, тип браузера, файлы cookie, источник перехода.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-bold">3</span>
              Цели обработки персональных данных
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="font-semibold text-neutral-900 text-xs mb-1">Обратная связь и консультации</div>
                <p className="text-neutral-500 text-xs">Обработка входящих звонков и заявок, бесплатная экспресс-оценка стоимости жилья в Минске.</p>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="font-semibold text-neutral-900 text-xs mb-1">Оказание риэлтерских услуг</div>
                <p className="text-neutral-500 text-xs">Подбор объектов для покупки или аренды, подготовка договоров на оказание риэлтерских услуг.</p>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="font-semibold text-neutral-900 text-xs mb-1">Информирование о статусе</div>
                <p className="text-neutral-500 text-xs">Оповещение о назначенных просмотрах, юридических проверках и согласовании документов в БРТИ.</p>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="font-semibold text-neutral-900 text-xs mb-1">Улучшение работы сайта</div>
                <p className="text-neutral-500 text-xs">Оптимизация скорости поиска, исправление ошибок и повышение удобства каталога объектов.</p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-bold">4</span>
              Сроки обработки и порядок хранения данных
            </h3>
            <p>
              4.1. Обработка персональных данных осуществляется с использованием средств автоматизации и без таковых, с соблюдением требований по защите конфиденциальности (ст. 17 Закона № 99-З).
            </p>
            <p>
              4.2. Персональные данные хранятся не дольше, чем этого требуют цели их обработки, либо до момента отзыва согласия субъектом персональных данных (максимальный срок хранения заявок общего характера — 3 года с момента последнего контакта).
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-bold">5</span>
              Права субъекта персональных данных
            </h3>
            <p>В соответствии с Законом № 99-З вы имеете право:</p>
            <ul className="space-y-2 pt-1">
              <li className="flex items-start gap-2 text-xs text-neutral-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Отозвать согласие:</strong> направить заявление в свободной форме на e-mail fattoria1900088@gmail.com. Оператор прекратит обработку в течение 15 дней.</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-neutral-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Получить информацию:</strong> запросить сведения о предоставлении ваших данных третьим лицам за предшествующий год.</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-neutral-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Требовать изменения или удаления:</strong> внести правки при неточности данных либо удалить персональные данные при отсутствии оснований для их обработки.</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-neutral-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Обжаловать действия Оператора:</strong> подать жалобу в Национальный центр защиты персональных данных Республики Беларусь (cpd.by).</span>
              </li>
            </ul>
          </section>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-950 flex items-start gap-3">
            <FileText className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold mb-0.5">Что такое файлы Cookie (куки)?</div>
              Cookie — это небольшие текстовые файлы, сохраняемые на вашем компьютере или мобильном телефоне при посещении веб-страниц. Они помогают сайту помнить ваши предпочтения и упрощают навигацию по объектам недвижимости.
            </div>
          </div>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-neutral-900">Категории файлов cookie на сайте fattoria.by</h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-neutral-900 text-sm">1. Технические (обязательные) cookie</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                    Не отключаются
                  </span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Обеспечивают базовые функции: сохранение добавленных в «Избранное» и «Сравнение» квартир, работу калькулятора ипотеки, запоминание выбранной валюты (BYN/$), а также безопасность веб-сессии. Срок хранения: до 12 месяцев или до очистки браузера.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-neutral-900 text-sm">2. Аналитические cookie (Яндекс.Метрика, Google Analytics)</span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-2.5 py-0.5 rounded-full">
                    По согласию пользователя
                  </span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Позволяют анонимно собирать статистику: какие районы Минска чаще всего ищут пользователи, сколько времени занимает просмотр планировок, скорость загрузки страниц. Помогают нам оптимизировать каталог и мобильную версию.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-neutral-900 text-sm">3. Функциональные и маркетинговые cookie</span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-2.5 py-0.5 rounded-full">
                    По согласию пользователя
                  </span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Используются для показа персональных рекомендаций похожих квартир по районам (Первомайский, Уручье, Минск-Мир) и отображения актуальных скидок от банков-партнеров.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-neutral-900">Как управлять файлами cookie?</h3>
            <p className="text-xs text-neutral-600">
              Вы в любой момент можете изменить свои настройки файлов cookie через специальную кнопку в подвале нашего сайта или вызвав меню настроек ниже:
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  if (onClose) onClose();
                  window.dispatchEvent(new CustomEvent('openCookieSettings'));
                }}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Открыть панель настроек файлов Cookie
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );

  if (isFullPage) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-10">
          <div className="flex items-center justify-between pb-6 border-b border-neutral-200 mb-8">
            {navigateTo && (
              <button
                onClick={() => navigateTo('home')}
                className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Вернуться на главную
              </button>
            )}
            <div className="text-xs text-neutral-400">
              Редакция от 01.01.2026 г.
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6 font-serif">
            {activeTab === 'privacy' ? 'Политика конфиденциальности и защиты данных' : 'Политика использования файлов Cookie'}
          </h1>

          {content}
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 flex flex-col max-h-[88vh] overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Защита персональных данных
              </h2>
              <p className="text-xs text-neutral-500">
                ООО «АН Фаттория» • УНП 193625457 • Лиц. №02240/446
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-6 pr-2">
          {content}
        </div>

        <div className="pt-4 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          <div>г. Минск, ул. Репина, 4-458</div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all shadow-md"
            >
              Понятно, закрыть
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
