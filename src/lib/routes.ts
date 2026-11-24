import { PageId, Agent, Property, Article } from '../types';
import { transliterateToSlug } from './seoUtils';

export interface RouteInfo {
  pageId: PageId;
  canonicalPath: string;
  title: string;
  description: string;
}

export const PAGE_ROUTES: Record<PageId, RouteInfo> = {
  'home': {
    pageId: 'home',
    canonicalPath: '/',
    title: 'Агентство недвижимости «АН Фаттория» | Минск — продажа и аренда недвижимости',
    description: 'Официальный сайт агентства недвижимости «АН Фаттория» в Минске. Продажа квартир, домов, коммерческой недвижимости. Аренда коммерческих помещений. Аттестованные риэлтеры.'
  },
  'catalog': {
    pageId: 'catalog',
    canonicalPath: '/catalog',
    title: 'Каталог недвижимости в Минске и Минской области | АН Фаттория',
    description: 'Актуальный каталог квартир, домов, участков и коммерческой недвижимости в Минске. Подбор объектов, реальные цены и фото.'
  },
  'nasha-komanda': {
    pageId: 'nasha-komanda',
    canonicalPath: '/nasha-komanda',
    title: 'Наша команда — аттестованные риэлтеры | Агентство «АН Фаттория»',
    description: 'Профессиональная команда аттестованных риэлтеров агентства «АН Фаттория». Опыт, отзывы и прямые контакты специалистов.'
  },
  'ob-agentstve': {
    pageId: 'ob-agentstve',
    canonicalPath: '/ob-agentstve',
    title: 'Об агентстве недвижимости «АН Фаттория» | Опыт и гарантии',
    description: 'Агентство недвижимости «АН Фаттория» — профессиональные риэлтерские услуги в Минске и Беларуси. Официальная аттестация Минюста РБ, страхование сделок.'
  },
  'vybrat-agenta': {
    pageId: 'vybrat-agenta',
    canonicalPath: '/vybrat-agenta',
    title: 'Выбрать риэлтера для продажи или покупки квартиры | АН Фаттория',
    description: 'Подберите персонального риэлтера по специализации и району. Прямой контакт с экспертами агентства «АН Фаттория».'
  },
  'services-root': {
    pageId: 'services-root',
    canonicalPath: '/services',
    title: 'Риэлтерские услуги в Минске | Агентство «АН Фаттория»',
    description: 'Полный комплекс услуг по покупке, продаже, обмену и оценке недвижимости в Минске и Минском районе.'
  },
  'services-agentstva': {
    pageId: 'services-agentstva',
    canonicalPath: '/services',
    title: 'Все услуги агентства недвижимости | АН Фаттория',
    description: 'Официальные риэлтерские и юридические услуги по недвижимости в Минске: сопровождение сделок, оценка, перепланировки.'
  },
  'otzyvy-klientov': {
    pageId: 'otzyvy-klientov',
    canonicalPath: '/otzyvy',
    title: 'Отзывы клиентов об агентстве недвижимости «АН Фаттория»',
    description: 'Реальные отзывы клиентов о покупке, продаже и аренде недвижимости с риэлтерами агентства «АН Фаттория».'
  },
  'novosti-nedvizhimosti': {
    pageId: 'novosti-nedvizhimosti',
    canonicalPath: '/novosti',
    title: 'Новости недвижимости, аналитика рынка и статьи | АН Фаттория',
    description: 'Актуальные новости рынка недвижимости Беларуси, аналитические обзоры цен на квартиры в Минске, советы юристов и риэлтеров.'
  },
  'kontakty': {
    pageId: 'kontakty',
    canonicalPath: '/kontakty',
    title: 'Контакты агентства недвижимости «АН Фаттория» в Минске',
    description: 'Контакты, телефоны, адрес офиса и схема проезда в агентство недвижимости «АН Фаттория» в Минске.'
  },
  'baza-pokupatelej': {
    pageId: 'baza-pokupatelej',
    canonicalPath: '/baza-pokupatelej',
    title: 'Запросы покупателей недвижимости | АН Фаттория',
    description: 'Актуальные запросы покупателей с одобренными кредитами и наличными средствами для быстрой продажи вашей недвижимости.'
  },
  'agent-cabinet': {
    pageId: 'agent-cabinet',
    canonicalPath: '/agent-cabinet',
    title: 'Личный кабинет риэлтера и CRM | АН Фаттория',
    description: 'Единая система управления сделками, объектами, продавцами и покупателями агентства «АН Фаттория».'
  },
  'ocenka-kvartiry': {
    pageId: 'ocenka-kvartiry',
    canonicalPath: '/ocenka-kvartiry',
    title: 'Бесплатная онлайн-оценка стоимости квартиры в Минске | АН Фаттория',
    description: 'Точный экспресс-расчет рыночной стоимости квартиры в Минске на основе реальных сделок и актуальной аналитики.'
  },
  'prodazha-kvartiry': {
    pageId: 'prodazha-kvartiry',
    canonicalPath: '/prodazha-kvartiry',
    title: 'Продажа квартиры в Минске — быстро и выгодно | АН Фаттория',
    description: 'Срочная и выгодная продажа квартир в Минске. Профессиональная фотосъемка, реклама на всех площадках и юридическое сопровождение.'
  },
  'prodazha-doma-dachi': {
    pageId: 'prodazha-doma-dachi',
    canonicalPath: '/prodazha-doma-dachi',
    title: 'Продажа домов, коттеджей и дач в Беларуси | АН Фаттория',
    description: 'Помощь в быстрой и безопасной продаже загородной недвижимости в Минске и Минской области.'
  },
  'prodazha-komnaty-doli': {
    pageId: 'prodazha-komnaty-doli',
    canonicalPath: '/prodazha-komnaty-doli',
    title: 'Продажа комнаты или доли в квартире в Минске | АН Фаттория',
    description: 'Юридически грамотное оформление и продажа комнат и долей с соблюдением преимущественного права покупки.'
  },
  'prodazha-pomescheniya': {
    pageId: 'prodazha-pomescheniya',
    canonicalPath: '/prodazha-pomescheniya',
    title: 'Продажа коммерческих помещений в Минске | АН Фаттория',
    description: 'Продажа торговых, офисных и складских площадей с привлечением профильных инвесторов.'
  },
  'prodazha-nedvizhimosti': {
    pageId: 'prodazha-nedvizhimosti',
    canonicalPath: '/prodazha-nedvizhimosti',
    title: 'Продажа недвижимости в Минске под ключ | АН Фаттория',
    description: 'Полный цикл продажи объектов недвижимости в Минске: от экспертной оценки до передачи ключей.'
  },
  'pokupka-kvartiry': {
    pageId: 'pokupka-kvartiry',
    canonicalPath: '/pokupka-kvartiry',
    title: 'Покупка квартиры в Минске — безопасный подбор | АН Фаттория',
    description: 'Подбор квартир на первичном и вторичном рынке Минска, архивная юридическая проверка и торг в вашу пользу.'
  },
  'pokupka-dlya-arendy': {
    pageId: 'pokupka-dlya-arendy',
    canonicalPath: '/pokupka-dlya-arendy',
    title: 'Покупка недвижимости для инвестиций и аренды | АН Фаттория',
    description: 'Подбор высокодоходных объектов жилой и коммерческой недвижимости для стабильного арендного дохода.'
  },
  'arenda-nedvizhimosti': {
    pageId: 'arenda-nedvizhimosti',
    canonicalPath: '/arenda-nedvizhimosti',
    title: 'Аренда коммерческой недвижимости в Минске — офисы, склады, помещения | АН Фаттория',
    description: 'Аренда офисов, складов, торговых и производственных помещений в Минске. Помощь в подборе, юридическая проверка, официальный договор. Аттестованные риэлтеры «АН Фаттория».'
  },
  'uslugi-arendodatelyu': {
    pageId: 'uslugi-arendodatelyu',
    canonicalPath: '/uslugi-arendodatelyu',
    title: 'Сдать коммерческое помещение в аренду в Минске | АН Фаттория',
    description: 'Сдадим ваше коммерческое помещение в аренду: офис, склад, торговое или производственное. Поиск надежных арендаторов, проверка платежеспособности, официальный договор. Аттестованные риэлтеры «АН Фаттория».'
  },
  'uslugi-arendodatelyu-pomescheniya': {
    pageId: 'uslugi-arendodatelyu-pomescheniya',
    canonicalPath: '/uslugi-arendodatelyu-pomescheniya',
    title: 'Сдать коммерческое помещение в Минске | АН Фаттория',
    description: 'Аренда коммерческих площадей для долгосрочного и прибыльного сотрудничества.'
  },
  'uslugi-arendatoru': {
    pageId: 'uslugi-arendatoru',
    canonicalPath: '/uslugi-arendatoru',
    title: 'Аренда офиса, склада, помещения для бизнеса в Минске | АН Фаттория',
    description: 'Подбор коммерческих помещений в аренду в Минске: офисы, склады, торговые и производственные площади. Проверка документов, юридическое сопровождение сделки. Аттестованные риэлтеры «АН Фаттория».'
  },
  'uslugi-arendatoru-pomescheniya': {
    pageId: 'uslugi-arendatoru-pomescheniya',
    canonicalPath: '/uslugi-arendatoru-pomescheniya',
    title: 'Аренда помещений для бизнеса в Минске | АН Фаттория',
    description: 'Подбор коммерческих площадей: офисы, торговля, услуги, склады.'
  },
  'obmen-nedvizhimosti': {
    pageId: 'obmen-nedvizhimosti',
    canonicalPath: '/obmen-nedvizhimosti',
    title: 'Обмен квартир и встречные сделки в Минске | АН Фаттория',
    description: 'Размен, съезд, разъезд и встречные сделки купли-продажи недвижимости любой сложности.'
  },
  'yuridicheskaya-konsultaciya': {
    pageId: 'yuridicheskaya-konsultaciya',
    canonicalPath: '/yuridicheskaya-konsultaciya',
    title: 'Юридическая консультация по недвижимости | АН Фаттория',
    description: 'Консультации аттестованных юристов и риэлтеров по сделкам с недвижимостью, налогам и правам собственности.'
  },
  'soglasovanie-pereplanirovki': {
    pageId: 'soglasovanie-pereplanirovki',
    canonicalPath: '/soglasovanie-pereplanirovki',
    title: 'Согласование и узаконивание перепланировок в Минске | АН Фаттория',
    description: 'Официальное согласование перепланировок под ключ: проектная документация, исполкомы, БРТИ.'
  },
  'oformit-sdelku': {
    pageId: 'oformit-sdelku',
    canonicalPath: '/oformit-sdelku',
    title: 'Оформление и юридическая проверка сделки | АН Фаттория',
    description: 'Полное сопровождение сделки купли-продажи недвижимости при самостоятельно найденном покупателе или объекте.'
  },
  'konsultaciya-stoimost-rieltor': {
    pageId: 'konsultaciya-stoimost-rieltor',
    canonicalPath: '/konsultaciya-stoimost-rieltor',
    title: 'Стоимость риэлтерских услуг | АН Фаттория',
    description: 'Прозрачные тарифы на риэлтерские услуги в соответствии с Постановлением Совмина РБ № 754.'
  },
  'konsultaciya-dogovor-kupli': {
    pageId: 'konsultaciya-dogovor-kupli',
    canonicalPath: '/konsultaciya-dogovor-kupli',
    title: 'Консультация по договору купли-продажи жилья | АН Фаттория',
    description: 'Проверка и составление безопасного договора купли-продажи с защитой финансовых интересов сторон.'
  },
  'korporativnaya-arenda': {
    pageId: 'korporativnaya-arenda',
    canonicalPath: '/korporativnaya-arenda',
    title: 'Корпоративная аренда коммерческой недвижимости в Минске | АН Фаттория',
    description: 'Аренда офисов, складов и производственных помещений для юридических лиц с безналичной формой оплаты. Долгосрочные договоры, юридическое сопровождение. Аттестованные риэлтеры «АН Фаттория».'
  },
  'all-sale-services': {
    pageId: 'all-sale-services',
    canonicalPath: '/all-sale-services',
    title: 'Все услуги по продаже недвижимости | АН Фаттория',
    description: 'Комплексные пакеты услуг по продаже жилой и загородной недвижимости в Минске.'
  },
  'all-evaluation-services': {
    pageId: 'all-evaluation-services',
    canonicalPath: '/all-evaluation-services',
    title: 'Все услуги по оценке недвижимости | АН Фаттория',
    description: 'Экспертная оценка рыночной стоимости жилья, загородных домов и коммерческих площадей.'
  },
  '10-dnej-probnogo-perioda': {
    pageId: '10-dnej-probnogo-perioda',
    canonicalPath: '/10-dnej-probnogo-perioda',
    title: '10 дней бесплатного тест-драйва услуг риэлтера | АН Фаттория',
    description: 'Оцените качество работы агентства без предоплаты и обязательств.'
  },
  'effektivnye-instrumenty': {
    pageId: 'effektivnye-instrumenty',
    canonicalPath: '/effektivnye-instrumenty',
    title: 'Эффективные рекламные инструменты продажи жилья | АН Фаттория',
    description: 'Как мы находим покупателей: таргетированная реклама, премиум-размещение на Realt.by, CRM-рассылки.'
  },
  'kontrol-kachestva': {
    pageId: 'kontrol-kachestva',
    canonicalPath: '/kontrol-kachestva',
    title: 'Служба контроля качества обслуживания | АН Фаттория',
    description: 'Прямая связь с руководством агентства «АН Фаттория» и контроль стандартов риэлтерской деятельности.'
  },
  'poleznaya-informaciya': {
    pageId: 'poleznaya-informaciya',
    canonicalPath: '/poleznaya-informaciya',
    title: 'Полезные статьи и памятки по недвижимости | АН Фаттория',
    description: 'Инструкции, чеклисты и нормативные документы для покупателей и продавцов недвижимости.'
  },
  'seo-landings': {
    pageId: 'seo-landings',
    canonicalPath: '/seo-landings',
    title: 'Каталог недвижимости по районам Минска | АН Фаттория',
    description: 'Квартиры в Центральном, Советском, Первомайском, Московском и других районах Минска.'
  },
  'contract-generator': {
    pageId: 'contract-generator',
    canonicalPath: '/contract-generator',
    title: 'Конструктор риэлтерских договоров онлайн | АН Фаттория',
    description: 'Быстрое формирование официальных типовых договоров на оказание риэлтерских услуг.'
  },
  'rieltor': {
    pageId: 'rieltor',
    canonicalPath: '/rieltor',
    title: 'Услуги персонального риэлтера в Минске | АН Фаттория',
    description: 'Индивидуальное сопровождение вашего жилищного вопроса опытным аттестованным риэлтером.'
  },
  'besplatnyj-vyezd-agenta': {
    pageId: 'besplatnyj-vyezd-agenta',
    canonicalPath: '/besplatnyj-vyezd-agenta',
    title: 'Бесплатный выезд риэлтера на объект в Минске | АН Фаттория',
    description: 'Осмотр объекта, профессиональная оценка и консультация риэлтера с выездом на дом.'
  },
  'privacy-policy': {
    pageId: 'privacy-policy',
    canonicalPath: '/privacy-policy',
    title: 'Политика конфиденциальности и обработки персональных данных | АН Фаттория',
    description: 'Официальная политика обработки персональных данных клиентов в соответствии с Законом РБ № 99-З «О защите персональных данных» ООО «АН Фаттория».'
  },
  'cookies-policy': {
    pageId: 'cookies-policy',
    canonicalPath: '/cookies-policy',
    title: 'Политика использования файлов cookie | АН Фаттория',
    description: 'Информация о типах, целях и правилах использования файлов cookie на официальном сайте агентства недвижимости «АН Фаттория».'
  },
  'property-detail': {
    pageId: 'property-detail',
    canonicalPath: '/catalog',
    title: 'Объект недвижимости | АН Фаттория',
    description: 'Подробная информация об объекте недвижимости, фото, планировка и контакты риэлтера.'
  },
  'not-found': {
    pageId: 'not-found',
    canonicalPath: '/404',
    title: 'Страница не найдена (404) | АН Фаттория',
    description: 'Запрашиваемая страница не существует или объект недвижимости продан и снят с продажи.'
  }
};

export const PATH_ALIASES: Record<string, PageId> = {
  '/': 'home',
  '/home': 'home',
  '/404': 'not-found',
  '/not-found': 'not-found',
  '/catalog': 'catalog',
  '/nedvizhimost': 'catalog',
  '/objects': 'catalog',
  '/privacy': 'privacy-policy',
  '/privacy-policy': 'privacy-policy',
  '/politika-konfidencialnosti': 'privacy-policy',
  '/cookies': 'cookies-policy',
  '/cookies-policy': 'cookies-policy',
  '/politika-cookie': 'cookies-policy',
  '/property': 'property-detail',
  '/nasha-komanda': 'nasha-komanda',
  '/team': 'nasha-komanda',
  '/realtors': 'nasha-komanda',
  '/rieltory': 'nasha-komanda',
  '/ob-agentstve': 'ob-agentstve',
  '/about': 'ob-agentstve',
  '/vybrat-agenta': 'vybrat-agenta',
  '/choose-agent': 'vybrat-agenta',
  '/services': 'services-agentstva',
  '/services-root': 'services-root',
  '/services-agentstva': 'services-agentstva',
  '/uslugi': 'services-agentstva',
  '/otzyvy': 'otzyvy-klientov',
  '/otzyvy-klientov': 'otzyvy-klientov',
  '/reviews': 'otzyvy-klientov',
  '/novosti': 'novosti-nedvizhimosti',
  '/novosti-nedvizhimosti': 'novosti-nedvizhimosti',
  '/news': 'novosti-nedvizhimosti',
  '/stati': 'novosti-nedvizhimosti',
  '/kontakty': 'kontakty',
  '/contacts': 'kontakty',
  '/baza-pokupatelej': 'baza-pokupatelej',
  '/buyers': 'baza-pokupatelej',
  '/agent-cabinet': 'agent-cabinet',
  '/crm': 'agent-cabinet',
  '/cabinet': 'agent-cabinet',
  '/ocenka-kvartiry': 'ocenka-kvartiry',
  '/ocenka': 'ocenka-kvartiry',
  '/prodazha-kvartiry': 'prodazha-kvartiry',
  '/prodazha-doma-dachi': 'prodazha-doma-dachi',
  '/prodazha-komnaty-doli': 'prodazha-komnaty-doli',
  '/prodazha-pomescheniya': 'prodazha-pomescheniya',
  '/prodazha-nedvizhimosti': 'prodazha-nedvizhimosti',
  '/pokupka-kvartiry': 'pokupka-kvartiry',
  '/pokupka-dlya-arendy': 'pokupka-dlya-arendy',
  '/arenda-nedvizhimosti': 'arenda-nedvizhimosti',
  '/arenda-kommercheskoj-nedvizhimosti': 'arenda-nedvizhimosti',
  '/uslugi-arendodatelyu': 'uslugi-arendodatelyu',
  '/uslugi-arendodatelyu-pomescheniya': 'uslugi-arendodatelyu-pomescheniya',
  '/uslugi-arendatoru': 'uslugi-arendatoru',
  '/uslugi-arendatoru-pomescheniya': 'uslugi-arendatoru-pomescheniya',
  '/obmen-nedvizhimosti': 'obmen-nedvizhimosti',
  '/yuridicheskaya-konsultaciya': 'yuridicheskaya-konsultaciya',
  '/soglasovanie-pereplanirovki': 'soglasovanie-pereplanirovki',
  '/oformit-sdelku': 'oformit-sdelku',
  '/konsultaciya-stoimost-rieltor': 'konsultaciya-stoimost-rieltor',
  '/konsultaciya-dogovor-kupli': 'konsultaciya-dogovor-kupli',
  '/korporativnaya-arenda': 'korporativnaya-arenda',
  '/all-sale-services': 'all-sale-services',
  '/all-evaluation-services': 'all-evaluation-services',
  '/10-dnej-probnogo-perioda': '10-dnej-probnogo-perioda',
  '/effektivnye-instrumenty': 'effektivnye-instrumenty',
  '/kontrol-kachestva': 'kontrol-kachestva',
  '/poleznaya-informaciya': 'poleznaya-informaciya',
  '/seo-landings': 'seo-landings',
  '/contract-generator': 'contract-generator',
  '/rieltor': 'rieltor',
  '/besplatnyj-vyezd-agenta': 'besplatnyj-vyezd-agenta'
};

// ============================================================
// 1. РИЭЛТЕРЫ
// ============================================================

export function getAgentSlug(agent: Agent): string {
  if (!agent) return '';
  const parts = (agent.name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const firstWord = transliterateToSlug(parts[0]);
    const secondWord = transliterateToSlug(parts[1]);
    return `${firstWord}-${secondWord}`;
  }
  if (agent.id && agent.id.startsWith('agent-')) {
    return agent.id.replace('agent-', '');
  }
  return transliterateToSlug(agent.name) || agent.id;
}

export function getAgentUrl(agent: Agent): string {
  if (!agent) return '/nasha-komanda';
  const slug = getAgentSlug(agent);
  const cleanSlug = slug.replace(/^rieltor-/, '');
  return `/rieltor/${cleanSlug}`;
}

export function getAgentFullUrl(agent: Agent): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fattoria.by';
  return `${origin}${getAgentUrl(agent)}`;
}

export function resolveAgentFromSlug(slug: string, agentsList: Agent[]): Agent | null {
  if (!slug || !Array.isArray(agentsList) || agentsList.length === 0) return null;
  const clean = slug.toLowerCase().replace(/^\/+|\/+$/g, '').trim();
  const withoutPrefix = clean.replace(/^(rieltor-|realtor-|agent-|rieltor\/|realtor\/|agent\/|agents\/)/, '');
  if (!withoutPrefix) return null;

  // 1. Точное совпадение по ID
  const exactMatch = agentsList.find(a =>
    a.id.toLowerCase() === clean ||
    a.id.toLowerCase() === `agent-${withoutPrefix}` ||
    a.id.toLowerCase().replace(/^agent-/, '') === withoutPrefix
  );
  if (exactMatch) return exactMatch;

  // 2. Точное совпадение по сгенерированному slug («фамилия-имя») или обратному («имя-фамилия»)
  const slugMatch = agentsList.find(a => {
    const s = getAgentSlug(a).toLowerCase();
    if (s === withoutPrefix || s === clean || `rieltor-${s}` === clean) return true;
    const parts = (a.name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const reversedSlug = `${transliterateToSlug(parts[1])}-${transliterateToSlug(parts[0])}`;
      if (reversedSlug === withoutPrefix) return true;
    }
    return false;
  });
  if (slugMatch) return slugMatch;

  // 3. Точное совпадение транслитерации полного ФИО (включая отчество)
  const translitMatch = agentsList.find(a => {
    const tName = transliterateToSlug(a.name);
    return tName === withoutPrefix;
  });
  if (translitMatch) return translitMatch;

  // 4. Односложный slug (только фамилия, без дефиса) — разрешаем ТОЛЬКО если фамилия уникальна среди всех агентов,
  //    чтобы не объединять однофамильцев вроде Федорчук Светлана и Федорчук Антон.
  if (!withoutPrefix.includes('-')) {
    const surnameMatches = agentsList.filter(a => {
      const firstToken = (a.name || '').toLowerCase().trim().split(/\s+/)[0] || '';
      const lastToken = (a.lastName || '').toLowerCase().trim();
      return (
        (firstToken && transliterateToSlug(firstToken) === withoutPrefix) ||
        (lastToken && transliterateToSlug(lastToken) === withoutPrefix)
      );
    });
    if (surnameMatches.length === 1) return surnameMatches[0];
  }

  return null;
}

// ============================================================
// 2. СТАТЬИ
// ============================================================

export function getArticleSlug(article: Article): string {
  if (!article) return '';
  return article.slug || article.id;
}

export function getArticleUrl(article: Article): string {
  if (!article) return '/novosti-nedvizhimosti';
  return `/${article.slug || article.id}`;
}

export function getArticleFullUrl(article: Article): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fattoria.by';
  return `${origin}${getArticleUrl(article)}`;
}

export function resolveArticleFromSlug(slug: string, articlesList: Article[]): Article | null {
  if (!slug || !Array.isArray(articlesList) || articlesList.length === 0) return null;
  const clean = slug.toLowerCase().replace(/^\/+|\/+$/g, '').trim();

  const bySlug = articlesList.find(a => a.slug === clean);
  if (bySlug) return bySlug;

  const byId = articlesList.find(a => a.id === clean);
  if (byId) return byId;

  const withoutPrefix = clean.replace(/^(statya-|statya\/|article-|article\/|novost-|novost\/|novosti\/|articles\/)/, '');
  const numeric = withoutPrefix.match(/^(\d+)$/);
  if (numeric) {
    return articlesList.find(a => a.id === `art-${numeric[1]}`) || null;
  }
  const byRawId = articlesList.find(a => a.id === withoutPrefix);
  if (byRawId) return byRawId;

  const partial = articlesList.find(a => a.slug && (a.slug.startsWith(withoutPrefix) || withoutPrefix.startsWith(a.slug)));
  return partial || null;
}

// ============================================================
// 3. ОБЪЕКТЫ
// ============================================================

export function cleanTownForSlug(t: string): string {
  if (!t) return '';
  let clean = t.trim();
  clean = clean.replace(/^(г\.?п?|д\.?|пос\.?|п\.?|аг\.?|деревня|город|поселок|агрогородок|с\/т|ст\.?)\s+/i, '');
  clean = clean.replace(/\s+(город|деревня|поселок|район|р-н)$/i, '').trim();
  if (clean.toLowerCase() === 'цна' || clean.toLowerCase() === 'цне') return 'cna';
  return transliterateToSlug(clean);
}

export function cleanStreetForSlug(s: string): string {
  if (!s) return '';
  let clean = s.trim();
  clean = clean.replace(/^(ул\.?|улица|просп\.?|проспект|пр-?т\.?|пер\.?|переулок|тракт|бульвар|б-р|наб\.?|набережная|проезд|шоссе)\s+/i, '');
  clean = clean.replace(/\s+(ул\.?|улица|просп\.?|проспект|пр-?т\.?|пер\.?|переулок|тракт|бульвар|б-р|наб\.?|набережная|проезд|шоссе)$/i, '').trim();
  return transliterateToSlug(clean);
}

export function cleanHouseForSlug(h: string): string {
  if (!h) return '';
  let clean = h.trim();
  clean = clean.replace(/^(д\.?|дом|зд\.?|здание|корп\.?|к\.?)\s*/i, '').trim();
  return transliterateToSlug(clean);
}

export function getPropertySlug(property: Property): string {
  if (!property) return '';
  if (property.slug && property.slug.trim()) {
    return property.slug.trim().toLowerCase();
  }

  let typeSlug = 'kvartira';
  const tLower = (property.title || '').toLowerCase();
  if (property.type === 'apartment') {
    typeSlug = (property.rooms && property.rooms > 0) ? `kvartira-${property.rooms}k` : 'kvartira';
  } else if (property.type === 'house') {
    if (tLower.includes('коттедж')) typeSlug = 'kottedzh';
    else if (tLower.includes('дача')) typeSlug = 'dacha';
    else typeSlug = 'dom';
  } else if (property.type === 'commercial') {
    if (tLower.includes('офис')) typeSlug = 'ofis';
    else if (tLower.includes('склад')) typeSlug = 'sklad';
    else typeSlug = 'pomeschenie';
  } else if (property.type === 'plot') {
    typeSlug = 'uchastok';
  }

  let town = property.city || '';
  if (!town && property.address) {
    const townMatch = property.address.match(/(?:г\.|аг\.|д\.|пос\.|п\.|с\/т)?\s*([а-яёa-z-]+(?:\s+[а-яёa-z-]+)?)/i);
    if (townMatch) town = townMatch[1];
  }
  if (!town) town = property.district?.includes('район') ? 'Минский район' : 'Минск';

  let street = property.street || '';
  if (!street && property.address) {
    const streetMatch = property.address.match(/(?:ул\.?|улице|пр-?т\.?|проспекте|тракт|пер\.?)\s*([а-яёa-z0-9-]+)/i);
    if (streetMatch && streetMatch[1]) street = streetMatch[1];
  }

  let house = property.houseNumber || '';
  if (!house && property.address) {
    const houseMatch = property.address.match(/(?:д\.?|дом)\s*([0-9]+[а-яa-z]?)/i);
    if (houseMatch && houseMatch[1]) house = houseMatch[1];
  }

  const c = cleanTownForSlug(town);
  const s = cleanStreetForSlug(street);
  const h = cleanHouseForSlug(house);

  const parts = [typeSlug, c, s, h].filter(Boolean);
  return parts.join('-') || `prop-${property.id}`;
}

export function getPropertyUrl(property: Property): string {
  if (!property) return '/catalog';
  return `/${getPropertySlug(property)}`;
}

export function getPropertyFullUrl(property: Property): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fattoria.by';
  return `${origin}${getPropertyUrl(property)}`;
}

export function resolvePropertyFromSlug(slug: string, propertiesList: Property[]): Property | null {
  if (!slug || !Array.isArray(propertiesList) || propertiesList.length === 0) return null;
  const clean = slug.toLowerCase().replace(/^\/+|\/+$/g, '').trim();
  const withoutCatalog = clean.replace(/^(catalog\/|object\/|property\/|realt\/|obekt-)/, '');

  const idMatch = propertiesList.find(p =>
    p.id.toLowerCase() === clean ||
    p.id.toLowerCase() === withoutCatalog ||
    p.id.toLowerCase() === `prop-${withoutCatalog}` ||
    `site${p.id.toLowerCase()}` === withoutCatalog ||
    p.id.toLowerCase().replace(/^(prop-|realt-)/, '') === withoutCatalog
  );
  if (idMatch) return idMatch;

  const slugMatch = propertiesList.find(p => {
    const pSlug = getPropertySlug(p).toLowerCase();
    const explicitSlug = p.slug ? p.slug.toLowerCase() : '';
    return pSlug === clean || pSlug === withoutCatalog || explicitSlug === clean || explicitSlug === withoutCatalog;
  });
  if (slugMatch) return slugMatch;

  return null;
}

// ============================================================
// 4. PARSER & SEO
// ============================================================

export function parseLocation(
  agentsList: Agent[] = [],
  propertiesList: Property[] = [],
  articlesList: Article[] = []
): {
  pageId: PageId;
  agentProfile: Agent | null;
  selectedArticle: Article | null;
  selectedProperty: Property | null;
  query?: string;
  hasLegacyHash?: boolean;
} {
  if (typeof window === 'undefined') {
    return { pageId: 'home', agentProfile: null, selectedArticle: null, selectedProperty: null };
  }

  let pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const hash = window.location.hash;
  let hasLegacyHash = false;

  if (hash) {
    if (hash.startsWith('#pages/')) {
      hasLegacyHash = true;
      const raw = hash.replace('#pages/', '').split('?')[0];
      if (raw) pathname = `/${raw}`;
    } else if (hash.startsWith('#/')) {
      hasLegacyHash = true;
      pathname = hash.replace('#', '').split('?')[0];
    } else if (hash.length > 1 && !hash.includes('&')) {
      const candidate = hash.replace('#', '').split('?')[0];
      if (PATH_ALIASES[`/${candidate}`] || PAGE_ROUTES[candidate as PageId]) {
        hasLegacyHash = true;
        pathname = `/${candidate}`;
      }
    }
  }

  const normalizedPath = pathname.toLowerCase();

  // Риэлтер
  if (normalizedPath.startsWith('/rieltor-') || normalizedPath.match(/^\/(?:realtor|rieltor|agent|agents)\/([^/?#]+)/i)) {
    const slug = normalizedPath.startsWith('/rieltor-')
      ? normalizedPath.replace(/^\//, '')
      : (normalizedPath.split('/')[2] || '');
    const agent = resolveAgentFromSlug(slug, agentsList);
    if (agent) {
      return { pageId: 'nasha-komanda', agentProfile: agent, selectedArticle: null, selectedProperty: null, hasLegacyHash };
    }
    return { pageId: 'not-found', agentProfile: null, selectedArticle: null, selectedProperty: null, hasLegacyHash };
  }

  // Статья
  const articleCandidate = normalizedPath.replace(/^\//, '');
  const isArticlePath =
    normalizedPath.startsWith('/statya-') ||
    normalizedPath.startsWith('/statya/') ||
    normalizedPath.startsWith('/article-') ||
    normalizedPath.startsWith('/article/') ||
    normalizedPath.startsWith('/novost-') ||
    normalizedPath.startsWith('/novosti/') ||
    /^art-\d+$/.test(articleCandidate) ||
    articlesList.some(a => a.slug === articleCandidate);

  if (isArticlePath) {
    let slug: string;
    if (normalizedPath.startsWith('/statya/') || normalizedPath.startsWith('/article/') || normalizedPath.startsWith('/novosti/')) {
      slug = normalizedPath.split('/')[2] || '';
    } else {
      slug = articleCandidate;
    }
    const article = resolveArticleFromSlug(slug, articlesList);
    if (article) {
      return { pageId: 'novosti-nedvizhimosti', agentProfile: null, selectedArticle: article, selectedProperty: null, hasLegacyHash };
    }
    return { pageId: 'not-found', agentProfile: null, selectedArticle: null, selectedProperty: null, hasLegacyHash };
  }

  // Объект
  const isPropertyPrefix = /^\/(kvartira|dom|dacha|kottedzh|uchastok|pomeschenie|ofis|sklad|komnata|dolya|prop-|realt-)/i.test(normalizedPath) ||
    /^\/(?:catalog|object|property|realt)\/([^/?#]+)/i.test(normalizedPath);

  if (isPropertyPrefix) {
    const slug = normalizedPath.startsWith('/catalog/') || normalizedPath.startsWith('/object/') || normalizedPath.startsWith('/property/')
      ? normalizedPath.split('/')[2] || ''
      : normalizedPath.replace(/^\//, '');
    const property = resolvePropertyFromSlug(slug, propertiesList);
    if (property) {
      return { pageId: 'catalog', agentProfile: null, selectedArticle: null, selectedProperty: property, hasLegacyHash };
    }
    return { pageId: 'not-found', agentProfile: null, selectedArticle: null, selectedProperty: null, hasLegacyHash };
  }

  // SEO-лендинги
  if (normalizedPath.startsWith('/kupit-kvartiru') || normalizedPath.startsWith('/kupit-dom') || normalizedPath.startsWith('/seo-landings')) {
    return { pageId: 'seo-landings', agentProfile: null, selectedArticle: null, selectedProperty: null, hasLegacyHash };
  }

  // Алиасы
  if (PATH_ALIASES[normalizedPath]) {
    return { pageId: PATH_ALIASES[normalizedPath], agentProfile: null, selectedArticle: null, selectedProperty: null, hasLegacyHash };
  }

  // Прямой PageId
  const bareSlug = normalizedPath.replace(/^\//, '') as PageId;
  if (PAGE_ROUTES[bareSlug]) {
    return { pageId: bareSlug, agentProfile: null, selectedArticle: null, selectedProperty: null, hasLegacyHash };
  }

  // Корень
  if (normalizedPath === '' || normalizedPath === '/') {
    return { pageId: 'home', agentProfile: null, selectedArticle: null, selectedProperty: null, hasLegacyHash };
  }

  // 404
  return { pageId: 'not-found', agentProfile: null, selectedArticle: null, selectedProperty: null, hasLegacyHash };
}

export function applyPageSEO(
  pageId: PageId,
  agentProfile?: Agent | null,
  selectedArticle?: Article | null,
  selectedProperty?: Property | null
) {
  if (typeof document === 'undefined') return;

  let title = 'Агентство недвижимости «АН Фаттория» | Минск';
  let description = 'Профессиональные риэлтерские услуги в Минске и Минской области.';
  let canonicalPath = '/';

  if (pageId === 'not-found') {
    title = 'Страница не найдена (404) | АН Фаттория';
    description = 'Запрашиваемый объект недвижимости продан, снят с продажи или ссылка устарела.';
    canonicalPath = '/404';
  } else if (selectedArticle) {
    title = `${selectedArticle.title} | Статьи и экспертиза «АН Фаттория»`;
    description = selectedArticle.snippet || selectedArticle.title;
    canonicalPath = getArticleUrl(selectedArticle);
  } else if (selectedProperty) {
    title = `${selectedProperty.title} (${selectedProperty.address}) | Каталог «АН Фаттория»`;
    description = `${selectedProperty.title}, ${selectedProperty.address}. Цена: ${selectedProperty.priceUSD.toLocaleString()} $ (${selectedProperty.priceBYN.toLocaleString()} BYN). Официальное агентство недвижимости «АН Фаттория».`;
    canonicalPath = getPropertyUrl(selectedProperty);
  } else if (agentProfile) {
    title = `${agentProfile.name} — Аттестованный риэлтер | Агентство «АН Фаттория»`;
    description = `Персональная визитка риэлтера ${agentProfile.name}. Опыт, отзывы клиентов, контакты и актуальные объекты на продаже в Минске.`;
    canonicalPath = getAgentUrl(agentProfile);
  } else if (PAGE_ROUTES[pageId]) {
    title = PAGE_ROUTES[pageId].title;
    description = PAGE_ROUTES[pageId].description;
    canonicalPath = PAGE_ROUTES[pageId].canonicalPath;
  }

  document.title = title;

  const setMeta = (name: string, content: string, isProperty = false) => {
    const attr = isProperty ? 'property' : 'name';
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('description', description);
  setMeta('title', title);
  setMeta('og:title', title, true);
  setMeta('og:description', description, true);

  if (pageId === 'not-found') {
    setMeta('robots', 'noindex, nofollow');
  } else {
    setMeta('robots', 'index, follow');
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fattoria.by';
  const fullCanonical = `${origin}${canonicalPath}`;
  setMeta('og:url', fullCanonical, true);

  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', fullCanonical);
}