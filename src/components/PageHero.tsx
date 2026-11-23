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
    bgImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000',
    formPlaceholder: 'Например: 2-комнатная квартира, Минск-Мир',
    formSource: 'Главная: Hero-блок'
  },
  'catalog': {
    title: 'Актуальные объекты недвижимости в Минске',
    description: 'Каждый объект проходит юридическую проверку перед публикацией. Квартиры в центре, загородные дома, дачи, земельные участки и коммерческие площади.',
    bgImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070',
    formPlaceholder: 'Например: 2-комнатная квартира, Минск-Мир',
    formSource: 'Каталог: Hero-блок'
  },
  'services-root': {
    title: 'Услуги агентства недвижимости «АН Фаттория»',
    description: 'Полный комплекс профессиональных риэлтерских услуг в Минске и Минской области. Бесплатная консультация и оценка от экспертов.',
    bgImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Например: Продажа квартиры, аренда офиса',
    formSource: 'Услуги: Hero-блок'
  },
  'services-agentstva': {
    title: 'Услуги агентства недвижимости «АН Фаттория»',
    description: 'Проверенное годами качество обслуживания. Риэлтерские услуги аттестованными специалистами.',
    bgImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Например: Купля, продажа, аренда',
    formSource: 'Услуги агентства: Hero-блок'
  },
  'prodazha-nedvizhimosti': {
    title: 'Продажа недвижимости в Минске и пригороде',
    description: 'Мы помогаем продавцам совершать сделки по максимальной цене в кратчайшие сроки.',
    bgImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Например: Квартира, дом, коммерция',
    formSource: 'Продажа недвижимости: Hero-блок'
  },
  'prodazha-kvartiry': {
    title: 'Продайте квартиру дороже рынка на 8–15%',
    description: 'Профессиональная оценка, фотосъёмка, 3D-тур, реклама на ведущих площадках — средний срок продажи 26 дней, минимальный — 2 дня.',
    bgImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=2070',
    formPlaceholder: 'Например: 2-комнатная, Первомайский район',
    formSource: 'Продажа квартиры: Hero-блок'
  },
  'prodazha-pomescheniya': {
    title: 'Продайте офис, склад или торговое помещение по максимальной цене',
    description: 'Оценка по доходному методу, инвестиционный меморандум, индивидуальный подбор целевых покупателей и инвесторов.',
    bgImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070',
    formPlaceholder: 'Например: Офис, магазин, склад',
    formSource: 'Продажа помещения: Hero-блок'
  },
  'prodazha-doma-dachi': {
    title: 'Продайте дом, дачу или участок выгодно',
    description: 'Профессиональная аэросъёмка, оценка и показы покупателям. Быстро реализуем загородную недвижимость.',
    bgImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Например: Коттедж в Тарасово, дача в Ракове',
    formSource: 'Продажа дома: Hero-блок'
  },
  'prodazha-komnaty-doli': {
    title: 'Продайте комнату или долю юридически безупречно',
    description: 'Соблюдение преимущественного права покупки, извещение сособственников, полное сопровождение сделки.',
    bgImage: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&q=80&w=2070',
    formPlaceholder: 'Например: 1/2 доля в 2-комнатной',
    formSource: 'Продажа доли: Hero-блок'
  },
  'arenda-nedvizhimosti': {
    title: 'Сдайте недвижимость выгодно и безопасно',
    description: 'Найдём платёжеспособных арендаторов, подготовим объект к показу, оформим договор — под ключ.',
    bgImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Например: Снять офис, сдать квартиру',
    formSource: 'Аренда: Hero-блок'
  },
  'obmen-nedvizhimosti': {
    title: 'Обмен недвижимости в Минске',
    description: 'Сложные разъезды, встречные сделки, обмен квартир с доплатой. Юридическая чистота.',
    bgImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Например: 1-к на 3-к с доплатой',
    formSource: 'Обмен: Hero-блок'
  },
  'korporativnaya-arenda': {
    title: 'Аренда недвижимости для бизнеса: офисы, склады, квартиры для сотрудников',
    description: 'Комплексное решение для корпоративных клиентов. Подберём, проверим, согласуем скидку.',
    bgImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070',
    formPlaceholder: 'Например: Квартиры для IT-специалистов',
    formSource: 'Корпоративная аренда: Hero-блок'
  },
  '10-dnej-probnogo-perioda': {
    title: '10 дней тест-драйва услуг',
    description: 'Бесплатный пробный период. Проверьте качество нашей работы перед подписанием договора.',
    bgImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Например: Квартира на проспекте',
    formSource: 'Тест-драйв: Hero-блок'
  },
  'uslugi-arendodatelyu': {
    title: 'Сдайте недвижимость выгодно',
    description: 'Найдём платёжеспособных арендаторов, оформим договор и защитим ваше имущество.',
    bgImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Например: 2-комнатная у метро',
    formSource: 'Арендодателю: Hero-блок'
  },
  'uslugi-arendatoru': {
    title: 'Снимите помещение на выгодных условиях',
    description: 'Подберём идеальное помещение под ваш бизнес, проверим собственника, согласуем скидку.',
    bgImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2070',
    formPlaceholder: 'Например: До 500$, Некрасова',
    formSource: 'Арендатору: Hero-блок'
  },
  'pokupka-kvartiry': {
    title: 'Покупка недвижимости под ключ',
    description: 'Профессиональный подбор объектов, экспертиза и проверка истории квартиры.',
    bgImage: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Например: до 60 000$, 2 комнаты',
    formSource: 'Покупка: Hero-блок'
  },
  'all-sale-services': {
    title: 'Услуги по продаже недвижимости',
    description: 'Полный цикл услуг по продаже квартир, коммерческих объектов, домов и комнат в Минске.',
    bgImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Например: 2-комнатная квартира в Сухарево',
    formSource: 'Все услуги продажи: Hero-блок'
  },
  'all-evaluation-services': {
    title: 'Бесплатная оценка недвижимости',
    description: 'Точное определение рыночной стоимости на основе базы сделок БРТИ.',
    bgImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Например: Квартира на ул. Козлова',
    formSource: 'Все услуги оценки: Hero-блок'
  },
  'ocenka-kvartiry': {
    title: 'Экспертная оценка стоимости квартиры',
    description: 'Узнайте точную рыночную стоимость на основе сделок в БРТИ.',
    bgImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Например: пр. Победителей, 12',
    formSource: 'Оценка квартиры: Hero-блок'
  },
  'effektivnye-instrumenty': {
    title: 'Эффективные инструменты маркетинга',
    description: 'Передовые рекламные каналы, таргетинг в Instagram и Telegram.',
    bgImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Например: Офис в центре, дом за городом',
    formSource: 'Маркетинг: Hero-блок'
  },
  '3d-vizualizaciya': {
    title: 'Профессиональная 3D-визуализация',
    description: 'Интерактивные 3D-туры, планировочные решения и видеоролики.',
    bgImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Например: Коттедж в Ратомке',
    formSource: '3D: Hero-блок'
  },
  'baza-pokupatelej': {
    title: 'Актуальные запросы покупателей',
    description: 'Подбор активных покупателей и инвесторов под ваш объект недвижимости.',
    bgImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Например: Склад 500 м2, 3-к квартира',
    formSource: 'База покупателей: Hero-блок'
  },
  'vybrat-agenta': {
    title: 'Наша команда аттестованных специалистов',
    description: 'Выберите личного эксперта для проведения Вашей сделки.',
    bgImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Например: Риэлтер по загородной недвижимости',
    formSource: 'Выбор агента: Hero-блок'
  },
  'kalkulyator-kredita': {
    title: 'Ипотечный кредитный калькулятор',
    description: 'Рассчитайте ежемесячный платеж для покупки квартиры в кредит.',
    bgImage: 'https://images.unsplash.com/photo-1554224155-6726b3fc858f?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Например: 100 000 бел. руб.',
    formSource: 'Калькулятор: Hero-блок'
  },
  'otzyvy-klientov': {
    title: 'Реальные отзывы наших клиентов',
    description: '1424+ клиентов выбрали нас для своих сделок с квартирами, домами и коммерческой недвижимостью.',
    bgImage: 'https://images.unsplash.com/photo-1552581230-2645f27d5b46?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Хочу поблагодарить / Оставить отзыв',
    formSource: 'Отзывы: Hero-блок'
  },
  'novosti-nedvizhimosti': {
    title: 'Аналитика и статьи рынка недвижимости',
    description: 'Актуальные новости, рекомендации юристов и разборы изменений законодательства.',
    bgImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Введите тему вопроса',
    formSource: 'Статьи: Hero-блок'
  },
  'ob-agentstve': {
    title: 'О компании «АН Фаттория»',
    description: 'С 2022 года безупречной работы на рынке недвижимости Минска и Беларуси.',
    bgImage: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Ваш вопрос директору',
    formSource: 'О компании: Hero-блок'
  },
  'skidki-ot-partnerov': {
    title: 'Скидки от партнеров для наших клиентов',
    description: 'Экономьте на ремонте, мебели и переезде с нашей дисконтной программой.',
    bgImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Номер договора (если есть)',
    formSource: 'Скидки: Hero-блок'
  },
  'kontakty': {
    title: 'Контакты агентства АН Фаттория',
    description: 'Минск, ул. Репина, д. 4. Время работы: ежедневно с 09:00 до 21:00.',
    bgImage: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Удобное время для звонка',
    formSource: 'Контакты: Hero-блок'
  },
  'nasha-komanda': {
    title: 'Наша команда • Специалисты АН Фаттория',
    description: 'Познакомьтесь с нашими аттестованными риэлтерами, агентами и юристами.',
    bgImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Тип вашей задачи',
    formSource: 'Команда: Hero-блок'
  },
  'rieltor': {
    title: 'Аттестованный риэлтер в Беларуси',
    description: 'Государственная аттестация Минюста РБ гарантирует чистоту вашей сделки.',
    bgImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Ваш вопрос риэлтеру',
    formSource: 'Риэлтер: Hero-блок'
  },
  'konsultaciya-stoimost-rieltor': {
    title: 'Тарифы и стоимость риэлтерских услуг',
    description: 'Прозрачные цены по Постановлению Совета Министров РБ. Никаких скрытых платежей.',
    bgImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Какая услуга вас интересует',
    formSource: 'Стоимость: Hero-блок'
  },
  'yuridicheskaya-konsultaciya': {
    title: 'Юридическая консультация по недвижимости',
    description: 'Правовые консультации по купле-продаже, дарению, мене, приватизации, наследованию.',
    bgImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Опишите вашу ситуацию',
    formSource: 'Юрконсультация: Hero-блок'
  },
  'konsultaciya-dogovor-kupli': {
    title: 'Консультация по договору купли-продажи',
    description: 'Разбор условий договоров, оценка рисков, схемы безопасных взаиморасчетов.',
    bgImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Укажите особенности договора',
    formSource: 'Договор: Hero-блок'
  },
  'oformit-sdelku': {
    title: 'Оформить сделку и проверить недвижимость',
    description: 'Оформление сделки с готовым покупателем. Архивная проверка истории с 1991 года.',
    bgImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Какая квартира выбрана',
    formSource: 'Оформить сделку: Hero-блок'
  },
  'soglasovanie-pereplanirovki': {
    title: 'Согласование и узаконивание перепланировок',
    description: 'Получение разрешений в Администрациях районов Минска, разработка проектов.',
    bgImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Какая стадия перепланировки',
    formSource: 'Перепланировка: Hero-блок'
  },
  'pokupka-dlya-arendy': {
    title: 'Покупка квартиры для сдачи в аренду (Инвестиции)',
    description: 'Подбор высокодоходных объектов, инвестиционные кейсы, расчет окупаемости.',
    bgImage: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Ваш бюджет инвестиций',
    formSource: 'Инвестиции: Hero-блок'
  },
  'agent-cabinet': {
    title: 'Личный кабинет / Fattoria CRM',
    description: 'Автоматизированная рабочая среда специалистов по недвижимости.',
    bgImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1600',
    formPlaceholder: 'Укажите тему обращения',
    formSource: 'CRM: Hero-блок'
  }
};

export default function PageHero({ activePage, navigateTo, handleAddLead }: PageHeroProps) {
  const config = PAGE_HERO_CONFIG[activePage] || {
    title: 'Агентство недвижимости АН Фаттория',
    description: 'Продажа, аренда, экспертная оценка и юридическое сопровождение сделок.',
    bgImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1600',
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