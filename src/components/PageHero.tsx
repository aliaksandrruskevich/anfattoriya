"use client";
import React, { useState } from 'react';
import { PageId } from '../types';

interface PageHeroProps {
  activePage: PageId;
  navigateTo: (pageId: PageId) => void;
  handleAddLead: (name: string, phone: string, comment: string, source: string) => void;
}

const brass = '#8B5CF6';
const brassLight = '#DDD6FE';
const displayFont = "'Cormorant Garamond', 'Raleway', serif";

const PAGE_HERO_CONFIG: Record<string, {
  title: string;
  description: string;
  bgImage: string;
  formPlaceholder: string;
  formSource: string;
}> = {
  'home': {
    title: 'Агентство недвижимости, которому доверяют Минск',
    description: 'Бесплатная оценка и экспертная консультация по продаже, покупке, аренде и обмену недвижимости в Минске и Беларуси.',
    bgImage: '/photo/hero-building.jpg',
    formPlaceholder: 'Например: 2-комнатная квартира, Минск-Мир',
    formSource: 'Главная: Hero-блок'
  },
  'catalog': {
    title: 'Актуальные объекты недвижимости в Минске',
    description: 'Каждый объект проходит юридическую проверку перед публикацией. Квартиры в центре, загородные дома, дачи, земельные участки и коммерческие площади.',
    bgImage: '/photo/hero-architecture.jpg',
    formPlaceholder: 'Например: 2-комнатная квартира, Минск-Мир',
    formSource: 'Каталог: Hero-блок'
  },
  'services-root': {
    title: 'Услуги агентства недвижимости «АН Фаттория»',
    description: 'Полный комплекс профессиональных риэлтерских услуг в Минске и Минской области. Бесплатная консультация и оценка от экспертов.',
    bgImage: '/photo/hero-office.jpg',
    formPlaceholder: 'Например: Продажа квартиры, аренда офиса',
    formSource: 'Услуги: Hero-блок'
  },
  'services-agentstva': {
    title: 'Услуги агентства недвижимости «АН Фаттория»',
    description: 'Проверенное годами качество обслуживания. Риэлтерские услуги аттестованными специалистами.',
    bgImage: '/photo/hero-architecture.jpg',
    formPlaceholder: 'Например: Купля, продажа, аренда',
    formSource: 'Услуги агентства: Hero-блок'
  },
  'prodazha-nedvizhimosti': {
    title: 'Продажа недвижимости в Минске и пригороде',
    description: 'Мы помогаем продавцам совершать сделки по максимальной цене в кратчайшие сроки.',
    bgImage: '/photo/hero-building.jpg',
    formPlaceholder: 'Например: Квартира, дом, коммерция',
    formSource: 'Продажа недвижимости: Hero-блок'
  },
  'prodazha-kvartiry': {
    title: 'Продайте квартиру выгодно и безопасно',
    description: 'Профессиональная оценка, фотосъёмка и продвижение на ведущих площадках — средний срок продажи 26 дней, минимальный — 2 дня.',
    bgImage: '/photo/hero-apartment.jpg',
    formPlaceholder: 'Например: 2-комнатная, Первомайский район',
    formSource: 'Продажа квартиры: Hero-блок'
  },
  'prodazha-pomescheniya': {
    title: 'Продайте офис, склад или торговое помещение по максимальной цене',
    description: 'Оценка, подготовка презентации объекта, подбор целевых покупателей и юридическое сопровождение.',
    bgImage: '/photo/hero-office.jpg',
    formPlaceholder: 'Например: Офис, магазин, склад',
    formSource: 'Продажа помещения: Hero-блок'
  },
  'prodazha-doma-dachi': {
    title: 'Продайте дом, дачу или участок выгодно',
    description: 'Профессиональная презентация, оценка и показы покупателям. Реализуем загородную недвижимость под ключ.',
    bgImage: '/photo/hero-house.jpg',
    formPlaceholder: 'Например: Коттедж в Тарасово, дача в Ракове',
    formSource: 'Продажа дома: Hero-блок'
  },
  'prodazha-komnaty-doli': {
    title: 'Продайте комнату или долю юридически безупречно',
    description: 'Соблюдение преимущественного права покупки, извещение сособственников, полное сопровождение сделки.',
    bgImage: '/photo/hero-interior.jpg',
    formPlaceholder: 'Например: 1/2 доля в 2-комнатной',
    formSource: 'Продажа доли: Hero-блок'
  },
  'arenda-nedvizhimosti': {
    title: 'Сдайте недвижимость выгодно и безопасно',
    description: 'Найдём платёжеспособных арендаторов, подготовим объект к показу, оформим договор — под ключ.',
    bgImage: '/photo/hero-flat.jpg',
    formPlaceholder: 'Например: Снять офис, сдать квартиру',
    formSource: 'Аренда: Hero-блок'
  },
  'obmen-nedvizhimosti': {
    title: 'Обмен недвижимости в Минске',
    description: 'Сложные разъезды, встречные сделки, обмен квартир с доплатой. Юридическая чистота.',
    bgImage: '/photo/hero-building.jpg',
    formPlaceholder: 'Например: 1-к на 3-к с доплатой',
    formSource: 'Обмен: Hero-блок'
  },
  'korporativnaya-arenda': {
    title: 'Аренда недвижимости для бизнеса: офисы, склады, квартиры для сотрудников',
    description: 'Комплексное решение для корпоративных клиентов. Подберём, проверим, согласуем условия.',
    bgImage: '/photo/hero-coworking.jpg',
    formPlaceholder: 'Например: Квартиры для специалистов',
    formSource: 'Корпоративная аренда: Hero-блок'
  },
  '10-dnej-probnogo-perioda': {
    title: '10 дней тест-драйва услуг',
    description: 'Бесплатный пробный период. Проверьте качество нашей работы перед подписанием договора.',
    bgImage: '/photo/hero-city.jpg',
    formPlaceholder: 'Например: Квартира на проспекте',
    formSource: 'Тест-драйв: Hero-блок'
  },
  'uslugi-arendodatelyu': {
    title: 'Сдайте недвижимость выгодно',
    description: 'Найдём платёжеспособных арендаторов, оформим договор и защитим ваше имущество.',
    bgImage: '/photo/hero-flat.jpg',
    formPlaceholder: 'Например: 2-комнатная у метро',
    formSource: 'Арендодателю: Hero-блок'
  },
  'uslugi-arendatoru': {
    title: 'Снимите помещение на выгодных условиях',
    description: 'Подберём подходящее помещение под ваш бизнес, проверим собственника, согласуем условия.',
    bgImage: '/photo/hero-office.jpg',
    formPlaceholder: 'Например: Офис в центре, Некрасова',
    formSource: 'Арендатору: Hero-блок'
  },
  'pokupka-kvartiry': {
    title: 'Покупка недвижимости под ключ',
    description: 'Профессиональный подбор объектов, экспертиза и проверка истории квартиры.',
    bgImage: '/photo/hero-apartment.jpg',
    formPlaceholder: 'Например: 2 комнаты, Минск',
    formSource: 'Покупка: Hero-блок'
  },
  'all-sale-services': {
    title: 'Услуги по продаже недвижимости',
    description: 'Полный цикл услуг по продаже квартир, коммерческих объектов, домов и комнат в Минске.',
    bgImage: '/photo/hero-building.jpg',
    formPlaceholder: 'Например: 2-комнатная квартира в Сухарево',
    formSource: 'Все услуги продажи: Hero-блок'
  },
  'all-evaluation-services': {
    title: 'Бесплатная оценка недвижимости',
    description: 'Точное определение рыночной стоимости на основе базы сделок БРТИ.',
    bgImage: '/photo/hero-analytics.jpg',
    formPlaceholder: 'Например: Квартира на ул. Козлова',
    formSource: 'Все услуги оценки: Hero-блок'
  },
  'ocenka-kvartiry': {
    title: 'Экспертная оценка стоимости квартиры',
    description: 'Узнайте точную рыночную стоимость на основе сделок в БРТИ.',
    bgImage: '/photo/hero-analytics.jpg',
    formPlaceholder: 'Например: пр. Победителей, 12',
    formSource: 'Оценка квартиры: Hero-блок'
  },
  'effektivnye-instrumenty': {
    title: 'Эффективные инструменты маркетинга',
    description: 'Передовые рекламные каналы и продвижение на ведущих площадках Беларуси.',
    bgImage: '/photo/hero-laptop.jpg',
    formPlaceholder: 'Например: Офис в центре, дом за городом',
    formSource: 'Маркетинг: Hero-блок'
  },
  '3d-vizualizaciya': {
    title: 'Профессиональная 3D-визуализация',
    description: 'Интерактивные 3D-туры, планировочные решения и видеоролики.',
    bgImage: '/photo/hero-interior.jpg',
    formPlaceholder: 'Например: Коттедж в Ратомке',
    formSource: '3D: Hero-блок'
  },
  'baza-pokupatelej': {
    title: 'Актуальные запросы покупателей',
    description: 'Подбор активных покупателей и инвесторов под ваш объект недвижимости.',
    bgImage: '/photo/hero-buyers.jpg',
    formPlaceholder: 'Например: Склад, 3-к квартира',
    formSource: 'База покупателей: Hero-блок'
  },
  'vybrat-agenta': {
    title: 'Наша команда аттестованных специалистов',
    description: 'Выберите личного эксперта для проведения Вашей сделки.',
    bgImage: '/photo/hero-teamwork.jpg',
    formPlaceholder: 'Например: Риэлтер по загородной недвижимости',
    formSource: 'Выбор агента: Hero-блок'
  },
  'kalkulyator-kredita': {
    title: 'Ипотечный кредитный калькулятор',
    description: 'Рассчитайте ежемесячный платеж для покупки квартиры в кредит.',
    bgImage: '/photo/hero-finance.jpg',
    formPlaceholder: 'Например: 100 000 бел. руб.',
    formSource: 'Калькулятор: Hero-блок'
  },
  'otzyvy-klientov': {
    title: 'Реальные отзывы наших клиентов',
    description: '1424+ клиентов выбрали нас для своих сделок с квартирами, домами и коммерческой недвижимостью.',
    bgImage: '/photo/hero-people.jpg',
    formPlaceholder: 'Хочу поблагодарить / Оставить отзыв',
    formSource: 'Отзывы: Hero-блок'
  },
  'novosti-nedvizhimosti': {
    title: 'Аналитика и статьи рынка недвижимости',
    description: 'Актуальные новости, рекомендации юристов и разборы изменений законодательства.',
    bgImage: '/photo/hero-news.jpg',
    formPlaceholder: 'Введите тему вопроса',
    formSource: 'Статьи: Hero-блок'
  },
  'ob-agentstve': {
    title: 'О компании «АН Фаттория»',
    description: 'С 2022 года безупречной работы на рынке недвижимости Минска и Беларуси.',
    bgImage: '/photo/hero-office.jpg',
    formPlaceholder: 'Ваш вопрос директору',
    formSource: 'О компании: Hero-блок'
  },
  'skidki-ot-partnerov': {
    title: 'Скидки от партнеров для наших клиентов',
    description: 'Экономьте на ремонте, мебели и переезде с нашей дисконтной программой.',
    bgImage: '/photo/hero-interior.jpg',
    formPlaceholder: 'Номер договора (если есть)',
    formSource: 'Скидки: Hero-блок'
  },
  'kontakty': {
    title: 'Контакты агентства АН Фаттория',
    description: 'Минск, ул. Репина, д. 4. Время работы: ежедневно с 09:00 до 21:00.',
    bgImage: '/photo/repina.jpg',
    formPlaceholder: 'Удобное время для звонка',
    formSource: 'Контакты: Hero-блок'
  },
  'nasha-komanda': {
    title: 'Наша команда • Специалисты АН Фаттория',
    description: 'Познакомьтесь с нашими аттестованными риэлтерами, агентами и юристами.',
    bgImage: '/photo/hero-teamwork.jpg',
    formPlaceholder: 'Тип вашей задачи',
    formSource: 'Команда: Hero-блок'
  },
  'rieltor': {
    title: 'Аттестованный риэлтер в Беларуси',
    description: 'Государственная аттестация Минюста РБ гарантирует чистоту вашей сделки.',
    bgImage: '/photo/hero-legal.jpg',
    formPlaceholder: 'Ваш вопрос риэлтеру',
    formSource: 'Риэлтер: Hero-блок'
  },
  'konsultaciya-stoimost-rieltor': {
    title: 'Тарифы и стоимость риэлтерских услуг',
    description: 'Прозрачные цены по Постановлению Совета Министров РБ. Никаких скрытых платежей.',
    bgImage: '/photo/hero-finance.jpg',
    formPlaceholder: 'Какая услуга вас интересует',
    formSource: 'Стоимость: Hero-блок'
  },
  'yuridicheskaya-konsultaciya': {
    title: 'Юридическая консультация по недвижимости',
    description: 'Правовые консультации по купле-продаже, дарению, мене, приватизации, наследованию.',
    bgImage: '/photo/hero-justice.jpg',
    formPlaceholder: 'Опишите вашу ситуацию',
    formSource: 'Юрконсультация: Hero-блок'
  },
  'konsultaciya-dogovor-kupli': {
    title: 'Консультация по договору купли-продажи',
    description: 'Разбор условий договоров, оценка рисков, схемы безопасных взаиморасчетов.',
    bgImage: '/photo/hero-legal.jpg',
    formPlaceholder: 'Укажите особенности договора',
    formSource: 'Договор: Hero-блок'
  },
  'oformit-sdelku': {
    title: 'Оформить сделку и проверить недвижимость',
    description: 'Оформление сделки с готовым покупателем. Архивная проверка истории с 1991 года.',
    bgImage: '/photo/hero-building.jpg',
    formPlaceholder: 'Какая квартира выбрана',
    formSource: 'Оформить сделку: Hero-блок'
  },
  'soglasovanie-pereplanirovki': {
    title: 'Согласование и узаконивание перепланировок',
    description: 'Получение разрешений в Администрациях районов Минска, разработка проектов.',
    bgImage: '/photo/hero-construction.jpg',
    formPlaceholder: 'Какая стадия перепланировки',
    formSource: 'Перепланировка: Hero-блок'
  },
  'pokupka-dlya-arendy': {
    title: 'Покупка квартиры для сдачи в аренду (Инвестиции)',
    description: 'Подбор ликвидных объектов, оценка арендной ставки, расчёт окупаемости.',
    bgImage: '/photo/hero-investment.jpg',
    formPlaceholder: 'Ваш бюджет инвестиций',
    formSource: 'Инвестиции: Hero-блок'
  },
  'agent-cabinet': {
    title: 'Личный кабинет / Fattoria CRM',
    description: 'Автоматизированная рабочая среда специалистов по недвижимости.',
    bgImage: '/photo/hero-laptop.jpg',
    formPlaceholder: 'Укажите тему обращения',
    formSource: 'CRM: Hero-блок'
  }
};

export default function PageHero({ activePage, navigateTo, handleAddLead }: PageHeroProps) {
  const config = PAGE_HERO_CONFIG[activePage] || {
    title: 'Агентство недвижимости АН Фаттория',
    description: 'Продажа, аренда, экспертная оценка и юридическое сопровождение сделок.',
    bgImage: '/photo/hero-building.jpg',
    formPlaceholder: 'Введите ваш вопрос',
    formSource: `Форма: ${activePage}`
  };

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value || '';
    const phone = (form.querySelector('[name="phone"]') as HTMLInputElement)?.value || '';
    const extra = (form.querySelector('[name="extra"]') as HTMLInputElement)?.value || '';
    if (phone) {
      handleAddLead(name, phone, extra || 'Не указано', config.formSource);
      form.reset();
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    }
  };

  return (
    <div className="w-full animate-fade-in" style={{ fontFamily: 'Raleway, sans-serif' }}>
      <div 
        className="relative min-h-[85vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url('${config.bgImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/55 to-black/90" />
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-32">
          <div className="max-w-3xl">
            
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-px" style={{ backgroundColor: brass }} />
              <span className="text-[12px] font-semibold uppercase tracking-[0.3em]" style={{ color: brassLight }}>
                агентство недвижимости «АН Фаттория»
              </span>
            </div>

            {/* Title */}
            <h1 className="text-white leading-[1.08] mb-6" style={{ fontFamily: displayFont, fontWeight: 400, fontSize: 'clamp(34px, 6vw, 60px)' }}>
              {config.title}
            </h1>

            {/* Description */}
            <p className="text-white/60 leading-relaxed mb-10 max-w-xl text-[17px] lg:text-[19px]" style={{ fontWeight: 300 }}>
              {config.description}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3 max-w-3xl">
              <input name="name" type="text" placeholder="Ваше имя" className="flex-1 min-w-[140px] px-5 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/50 text-sm transition-all" />
              <input name="phone" type="tel" placeholder="Номер телефона *" required className="flex-1 min-w-[140px] px-5 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/50 text-sm transition-all" />
              <input name="extra" type="text" placeholder={config.formPlaceholder} className="flex-1 min-w-[160px] px-5 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/50 text-sm transition-all" />
              <button type="submit" className="px-9 py-4 rounded-lg text-black font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5 shadow-[0_8px_24px_rgba(139, 92, 246,0.4)] whitespace-nowrap" style={{ backgroundColor: brass }}>
                Отправить заявку
              </button>
            </form>

            {/* Success */}
            {submitted && (
              <div className="mt-4 text-emerald-400 font-semibold text-sm animate-fade-in">
                ✓ Заявка отправлена! Специалист свяжется с Вами в ближайшее время.
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}