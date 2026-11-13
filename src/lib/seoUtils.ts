import { Agent, Article, Property, PageId } from '../types';
import {
  getAgentSlug,
  getArticleSlug,
  getPropertySlug,
  resolveAgentFromSlug,
  resolveArticleFromSlug,
} from './routes';

export const BASE_URL = 'https://fattoria.by';

// ============================================================
// БАЗОВЫЕ УТИЛИТЫ
// ============================================================

export function transliterateToSlug(text: string): string {
  if (!text) return '';
  const rusToLatMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya'
  };

  return text
    .toLowerCase()
    .trim()
    .split('')
    .map(char => rusToLatMap[char] || char)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export class SlugManager {
  generate(text: string): string {
    return transliterateToSlug(text);
  }
}

export const slugManager = new SlugManager();

// ============================================================
// SEO METADATA
// ============================================================

interface SEOMetadata {
  title: string;
  description: string;
  h1: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: 'website' | 'article' | 'product' | 'place';
  schemaType: 'RealEstateListing' | 'Product' | 'Article' | 'LocalBusiness' | 'FAQ' | 'HowTo';
  breadcrumbs: Array<{ name: string; url: string }>;
  faq?: Array<{ question: string; answer: string }>;
  localBusiness?: {
    name: string;
    address: string;
    phone: string;
    geo: { lat: number; lng: number };
  };
  twitterCard: 'summary' | 'summary_large_image';
  noindex?: boolean;
  nofollow?: boolean;
  priority: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  lastmod: string;
}

interface RealEstateCategory {
  id: string;
  name: string;
  slug: string;
  parent?: string;
  keywords: string[];
  longTailKeywords: string[];
  searchIntent: 'buy' | 'sell' | 'rent' | 'exchange' | 'info';
  priority: number;
}

interface ContentCluster {
  pillarPage: string;
  clusterPages: string[];
  internalLinks: Array<{ from: string; to: string; anchor: string }>;
}

// ============================================================
// DYNAMIC SEO
// ============================================================

export function updateDynamicSEO(optionsOrPageId: string | {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType?: string;
  ogImage?: string;
  jsonLd?: object;
}) {
  if (!optionsOrPageId) return;
  let options: {
    title: string;
    description: string;
    canonicalUrl: string;
    ogType?: string;
    ogImage?: string;
    jsonLd?: object;
  };

  if (typeof optionsOrPageId === 'string') {
    const pageId = optionsOrPageId;
    const titles: Record<string, { title: string; desc: string }> = {
      'home': {
        title: 'Агентство недвижимости «АН Фаттория» | Минск — покупка, продажа и аренда',
        desc: 'Официальный сайт агентства недвижимости «АН Фаттория» в Минске. Продажа квартир, домов, коммерческой недвижимости. Аренда коммерческих помещений. Аттестованные риэлтеры.'
      },
      'catalog': {
        title: 'Каталог недвижимости в Минске | АН Фаттория',
        desc: 'Актуальная база квартир, домов, коттеджей, участков и коммерческой недвижимости в Минске и Минской области.'
      },
      'agent-cabinet': {
        title: 'Кабинет риэлтера | CRM «АН Фаттория»',
        desc: 'Рабочее пространство риэлтера: управление лидами, сделками и базой объектов.'
      },
      'prodazha-kvartiry': {
        title: 'Продажа квартир в Минске под ключ | АН Фаттория',
        desc: 'Быстро и выгодно продать квартиру в Минске. Бесплатная оценка, профессиональная фотосъёмка, юридическая чистота сделки.'
      },
      'arenda-nedvizhimosti': {
        title: 'Аренда коммерческой недвижимости в Минске | АН Фаттория',
        desc: 'Аренда офисов, складов, торговых и производственных помещений в Минске. Помощь в подборе, юридическая проверка, официальный договор.'
      },
      'nasha-komanda': {
        title: 'Наша команда — аттестованные риэлтеры | АН Фаттория',
        desc: 'Опытные аттестованные риэлтеры, юристы и оценщики недвижимости агентства «АН Фаттория».'
      },
      'kontakty': {
        title: 'Контакты агентства недвижимости «АН Фаттория»',
        desc: 'Адрес офиса, телефоны, мессенджеры и схема проезда к агентству «АН Фаттория» в Минске.'
      },
    };
    const info = titles[pageId] || {
      title: 'АН Фаттория — Агентство недвижимости Минск',
      desc: 'Профессиональные риэлтерские услуги в Минске и Минской области.'
    };
    options = {
      title: info.title,
      description: info.desc,
      canonicalUrl: `${BASE_URL}/${pageId === 'home' ? '' : pageId}`,
      ogType: 'website',
      ogImage: `${BASE_URL}/og-image.jpg`
    };
  } else {
    options = optionsOrPageId;
  }

  const { title, description, canonicalUrl, ogType = 'website', ogImage = `${BASE_URL}/og-image.jpg`, jsonLd } = options;

  document.title = title;

  const setMeta = (selector: string, attrName: string, attrVal: string, contentVal: string) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', contentVal);
  };

  setMeta('meta[name="description"]', 'name', 'description', description);
  setMeta('meta[name="title"]', 'name', 'title', title);
  setMeta('meta[property="og:title"]', 'property', 'og:title', title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', description);
  setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setMeta('meta[property="og:type"]', 'property', 'og:type', ogType);
  setMeta('meta[property="og:image"]', 'property', 'og:image', ogImage);

  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  if (jsonLd) {
    let scriptEl = document.getElementById('dynamic-jsonld');
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'dynamic-jsonld';
      scriptEl.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLd);
  }
}

// ============================================================
// КАТЕГОРИИ НЕДВИЖИМОСТИ
// ============================================================

const REAL_ESTATE_CATEGORIES: Record<string, RealEstateCategory> = {
  buyApartments: {
    id: 'buy-apartments',
    name: 'Покупка квартир',
    slug: 'pokupka-kvartir',
    keywords: ['купить квартиру', 'покупка квартиры', 'квартиры в минске купить'],
    longTailKeywords: [
      'купить квартиру в минске недорого',
      'купить квартиру в минске без посредников',
      'купить квартиру в новостройке минск',
      'купить квартиру на вторичном рынке минск',
      'купить квартиру в рассрочку минск',
      'купить квартиру в ипотеку минск',
      'купить однокомнатную квартиру минск',
      'купить двухкомнатную квартиру минск',
      'купить трехкомнатную квартиру минск',
      'купить квартиру студию минск',
    ],
    searchIntent: 'buy',
    priority: 10,
  },
  buyHouses: {
    id: 'buy-houses',
    name: 'Покупка домов',
    slug: 'pokupka-domov',
    keywords: ['купить дом', 'покупка дома', 'дома в минске купить'],
    longTailKeywords: [
      'купить дом в минске недорого',
      'купить дом в пригороде минска',
      'купить дом с участком минск',
      'купить дом в минском районе',
      'купить дом для постоянного проживания',
      'купить дом из бруса',
      'купить кирпичный дом',
      'купить дом в коттеджном поселке',
      'купить дом со всеми коммуникациями',
      'купить дом с баней',
    ],
    searchIntent: 'buy',
    priority: 9,
  },
  buyDachas: {
    id: 'buy-dachas',
    name: 'Покупка дач',
    slug: 'pokupka-dach',
    keywords: ['купить дачу', 'покупка дачи', 'дачи в минске купить'],
    longTailKeywords: [
      'купить дачу недорого',
      'купить дачу в минском районе',
      'купить дачу с участком',
      'купить дачу у леса',
      'купить дачу у воды',
      'купить дачу в садовом товариществе',
      'купить дачу для круглогодичного проживания',
      'купить дачу с баней',
      'купить дачу с коммуникациями',
      'купить дачу 6 соток',
    ],
    searchIntent: 'buy',
    priority: 9,
  },
  buyCommercial: {
    id: 'buy-commercial',
    name: 'Покупка коммерческой недвижимости',
    slug: 'pokupka-kommercheskoy-nedvizhimosti',
    keywords: ['купить коммерческую недвижимость', 'помещение под бизнес купить'],
    longTailKeywords: [
      'купить офис минск',
      'купить помещение под магазин',
      'купить склад минск',
      'купить помещение под офис минск',
      'купить торговое помещение',
      'купить помещение под салон красоты',
      'купить помещение под кафе',
      'купить помещение свободного назначения',
      'купить цокольное помещение',
      'инвестиции в коммерческую недвижимость',
    ],
    searchIntent: 'buy',
    priority: 8,
  },
  sellApartments: {
    id: 'sell-apartments',
    name: 'Продажа квартир',
    slug: 'prodazha-kvartir',
    keywords: ['продать квартиру', 'продажа квартиры', 'квартиры на продажу'],
    longTailKeywords: [
      'продать квартиру в минске срочно',
      'продать квартиру быстро',
      'продать квартиру за 1 день',
      'продать квартиру дорого',
      'выгодно продать квартиру',
      'продать квартиру без риэлтора',
      'продать квартиру с долгами',
      'продать квартиру в ипотеке',
      'продать квартиру с прописанными',
      'оценка квартиры для продажи',
    ],
    searchIntent: 'sell',
    priority: 10,
  },
  sellHouses: {
    id: 'sell-houses',
    name: 'Продажа домов',
    slug: 'prodazha-domov',
    keywords: ['продать дом', 'продажа дома', 'дома на продажу'],
    longTailKeywords: [
      'продать дом в минске срочно',
      'продать дом быстро',
      'продать дом в пригороде',
      'продать дом с участком',
      'продать дом выгодно',
      'оценка дома для продажи',
      'продать дом в коттеджном поселке',
      'продать дом с коммуникациями',
      'продать дом без посредников',
      'продать дом с земельным участком',
    ],
    searchIntent: 'sell',
    priority: 9,
  },
  exchange: {
    id: 'exchange',
    name: 'Обмен недвижимости',
    slug: 'obmen-nedvizhimosti',
    keywords: ['обмен квартиры', 'обмен недвижимости', 'обменять квартиру'],
    longTailKeywords: [
      'обмен квартиры с доплатой',
      'обмен квартиры на дом',
      'обмен квартиры на квартиру',
      'обмен неравноценных квартир',
      'альтернативная сделка обмен',
      'обмен через куплю-продажу',
      'обмен доли в квартире',
      'обмен с переездом',
      'обмен квартиры в минске',
      'помощь в обмене квартиры',
    ],
    searchIntent: 'exchange',
    priority: 9,
  },
  separation: {
    id: 'separation',
    name: 'Разъезд',
    slug: 'raziezd',
    keywords: ['разъезд', 'размен квартиры', 'разъехаться'],
    longTailKeywords: [
      'разъезд родственников',
      'разъезд при разводе',
      'размен квартиры на две',
      'разъезд коммунальной квартиры',
      'разъезд с доплатой',
      'принудительный разъезд',
      'разъезд через суд',
      'разъезд наследников',
      'размен квартиры с доплатой',
      'помощь в разъезде',
    ],
    searchIntent: 'exchange',
    priority: 8,
  },
  shares: {
    id: 'shares',
    name: 'Доли в недвижимости',
    slug: 'doli-v-nedvizhimosti',
    keywords: ['продажа доли', 'покупка доли', 'доля в квартире'],
    longTailKeywords: [
      'продать долю в квартире',
      'купить долю в квартире',
      'выделение доли в натуре',
      'продажа доли без согласия собственников',
      'выкуп доли в квартире',
      'наследственная доля продажа',
      'дарение доли в квартире',
      'оценка доли в квартире',
      'микродоли в квартире',
      'долевая собственность продажа',
    ],
    searchIntent: 'info',
    priority: 9,
  },
  debts: {
    id: 'debts',
    name: 'Недвижимость с долгами',
    slug: 'nedvizhimost-s-dolgami',
    keywords: ['квартира с долгами', 'продажа квартиры с долгами', 'долги по коммуналке'],
    longTailKeywords: [
      'продать квартиру с долгами по коммуналке',
      'купить квартиру с долгами',
      'списание долгов при продаже квартиры',
      'задолженность за коммунальные услуги при продаже',
      'квартира с долгами по кредиту',
      'арест за долги по коммуналке',
      'оплата долгов при покупке квартиры',
      'пени за коммунальные долги',
      'реструктуризация долгов по коммуналке',
      'судебная практика долги за квартиру',
    ],
    searchIntent: 'info',
    priority: 8,
  },
  problemProperties: {
    id: 'problem-properties',
    name: 'Проблемная недвижимость',
    slug: 'problemnaya-nedvizhimost',
    keywords: ['проблемная квартира', 'квартира с обременением', 'аварийное жилье'],
    longTailKeywords: [
      'продажа квартиры с обременением',
      'арестованная недвижимость продажа',
      'квартира в залоге продажа',
      'продажа аварийного жилья',
      'самовольная перепланировка продажа',
      'неузаконенная перепланировка',
      'квартира с несогласованной перепланировкой',
      'недвижимость под арестом',
      'снять обременение с квартиры',
      'продажа квартиры с зарегистрированными',
    ],
    searchIntent: 'info',
    priority: 7,
  },
  rentCommercial: {
    id: 'rent-commercial',
    name: 'Аренда коммерческой недвижимости',
    slug: 'arenda-kommercheskoy-nedvizhimosti',
    keywords: ['аренда коммерческой недвижимости', 'аренда офиса', 'аренда помещения'],
    longTailKeywords: [
      'аренда офиса минск',
      'аренда склада минск',
      'аренда торгового помещения минск',
      'аренда производственного помещения минск',
      'снять коммерческое помещение минск',
      'аренда помещения под магазин',
      'аренда помещения под кафе',
      'аренда помещения под салон',
      'аренда офиса в центре минска',
      'долгосрочная аренда коммерческой недвижимости',
    ],
    searchIntent: 'rent',
    priority: 8,
  },
};

const MINSK_DISTRICTS = [
  'центральный', 'советский', 'первомайский', 'партизанский',
  'заводской', 'ленинский', 'октябрьский', 'московский', 'фрунзенский',
];

const MINSK_METRO_STATIONS = [
  'уручье', 'борисовский тракт', 'восток', 'московская', 'парк челюскинцев',
  'академия наук', 'площадь якуба коласа', 'площадь победы', 'октябрьская',
  'площадь ленина', 'институт культуры', 'грушевка', 'михалово', 'петровщина',
  'малиновка', 'каменная горка', 'кунцевщина', 'спортивная', 'пушкинская',
  'молодежная', 'фрунзенская', 'немига', 'купаловская', 'первомайская',
  'пролетарская', 'тракторный завод', 'партизанская', 'автозаводская', 'могилевская',
];

const MINSK_MICRODISTRICTS = [
  'сухарево', 'малиновка', 'юго-запад', 'курасовщина', 'чижовка',
  'серебрянка', 'ленинский', 'шабаны', 'ангарская', 'зеленый луг',
  'восток', 'уручье', 'веснянка', 'сухарево-6', 'каменная горка',
  'красный бор', 'дражня', 'сосны', 'масюковщина', 'лебяжий',
];

const SUBURBS = [
  'минский район', 'колодищи', 'бровки', 'сенница', 'прилукская слобода',
  'одуванчик', 'боровая', 'зацень', 'цнянка', 'ратомка', 'жановичи',
  'боровляны', 'лесной', 'опитный', 'сеница', 'щомыслица', 'хатежино',
];

function generateLongTailKeywords(): Record<string, string[]> {
  const keywords: Record<string, string[]> = {};

  Object.values(REAL_ESTATE_CATEGORIES).forEach(category => {
    const geoKeywords: string[] = [];

    MINSK_DISTRICTS.forEach(district => {
      category.keywords.forEach(keyword => {
        geoKeywords.push(`${keyword} ${district} район`);
      });
    });

    MINSK_METRO_STATIONS.forEach(station => {
      category.keywords.forEach(keyword => {
        geoKeywords.push(`${keyword} рядом с метро ${station}`);
      });
    });

    MINSK_MICRODISTRICTS.forEach(micro => {
      category.keywords.forEach(keyword => {
        geoKeywords.push(`${keyword} ${micro}`);
      });
    });

    keywords[category.id] = [...category.longTailKeywords, ...geoKeywords];
  });

  return keywords;
}

// ============================================================
// ADVANCED SEO MANAGER
// ============================================================

class AdvancedSEOManager {
  private slugManager = new SlugManager();

  generateCategoryPageSEO(
    category: RealEstateCategory,
    geo?: { district?: string; metro?: string; microdistrict?: string }
  ): SEOMetadata {
    const locationName = geo?.district || geo?.metro || geo?.microdistrict || '';
    const fullName = locationName ? `${category.name} в ${locationName}` : category.name;

    const primaryKeyword = locationName
      ? `${category.keywords[0]} ${locationName}`
      : category.keywords[0];

    const secondaryKeywords = category.longTailKeywords.slice(0, 5);

    const title = this.generateOptimizedTitle(fullName, primaryKeyword);
    const description = this.generateOptimizedDescription(fullName, primaryKeyword, secondaryKeywords);
    const h1 = this.generateH1(fullName, primaryKeyword);

    const slug = locationName
      ? `${category.slug}-${this.slugManager.generate(locationName)}`
      : category.slug;

    const faq = this.generateFAQ(category);

    return {
      title,
      description,
      h1,
      primaryKeyword,
      secondaryKeywords: category.longTailKeywords.slice(0, 10),
      canonicalUrl: `${BASE_URL}/${slug}`,
      ogTitle: title,
      ogDescription: description,
      ogImage: `${BASE_URL}/og-${category.id}.jpg`,
      ogType: 'website',
      schemaType: 'RealEstateListing',
      breadcrumbs: [
        { name: 'Главная', url: '/' },
        { name: category.name, url: `/${category.slug}` },
      ],
      faq,
      localBusiness: {
        name: 'АН Фаттория',
        address: 'г. Минск, ул. Репина, д.4, пом.458',
        phone: '+375 29 638-00-53',
        geo: { lat: 53.9008, lng: 27.5516 },
      },
      twitterCard: 'summary_large_image',
      priority: (category.priority / 10).toFixed(1),
      changefreq: 'daily',
      lastmod: new Date().toISOString(),
    };
  }

  generatePropertySEO(property: Property): SEOMetadata {
    const propCategoryKey = (property as any).category || property.type;
    const category = REAL_ESTATE_CATEGORIES[propCategoryKey] || REAL_ESTATE_CATEGORIES.buyApartments;

    const district = (property as any).district;
    const metroStation = (property as any).metroStation;
    const titleParts: string[] = [];
    titleParts.push(property.title);
    if (district) titleParts.push(district);
    if (metroStation) titleParts.push(`м. ${metroStation}`);
    titleParts.push('Минск');

    const title = titleParts.join(', ');
    const fullTitle = `${title} | ${category.name} | АН Фаттория`;

    const descriptionParts: string[] = [];
    if (property.rooms) descriptionParts.push(`${property.rooms}-комнатная`);
    if (property.area) descriptionParts.push(`${property.area} м²`);
    if (property.floor) descriptionParts.push(`${property.floor} этаж`);
    descriptionParts.push(district || 'Минск');
    descriptionParts.push(`Цена: $${(property.priceUSD || 0).toLocaleString()} (${(property.priceBYN || 0).toLocaleString()} BYN)`);

    const description = `🏠 ${descriptionParts.join(' · ')}. ${category.keywords[0]} в Минске от агентства «АН Фаттория». ${category.keywords[1]} выгодно и безопасно!`;

    const secondaryKeywords = this.generateLSIKeywords(property, category);
    const pSlug = getPropertySlug(property);

    return {
      title: fullTitle.slice(0, 70),
      description: description.slice(0, 160),
      h1: property.title,
      primaryKeyword: `${category.keywords[0]} ${district || 'минск'}`,
      secondaryKeywords,
      canonicalUrl: `${BASE_URL}/${pSlug}`,
      ogTitle: fullTitle,
      ogDescription: description,
      ogImage: property.photo || `${BASE_URL}/og-image.jpg`,
      ogType: 'product',
      schemaType: 'Product',
      breadcrumbs: [
        { name: 'Главная', url: '/' },
        { name: category.name, url: `/${category.slug}` },
        { name: property.title, url: `/${pSlug}` },
      ],
      faq: this.generateFAQ(category),
      twitterCard: 'summary_large_image',
      priority: (property as any).isHot ? '0.9' : '0.8',
      changefreq: 'daily',
      lastmod: (property as any).updatedAt || (property as any).createdAt || new Date().toISOString(),
    };
  }

  generateArticleSEO(article: Article): SEOMetadata {
    const category = this.detectArticleCategory(article);
    const title = this.generateArticleTitle(article.title, category);
    const description = this.generateArticleDescription(article, category);
    const faq = this.extractFAQFromArticle(article);

    const articleSlug = article.slug || article.id;

    return {
      title,
      description,
      h1: article.title,
      primaryKeyword: category.keywords[0],
      secondaryKeywords: category.longTailKeywords.slice(0, 5),
      canonicalUrl: `${BASE_URL}/${articleSlug}`,
      ogTitle: title,
      ogDescription: description,
      ogImage: (article as any).mainImage || `${BASE_URL}/og-image.jpg`,
      ogType: 'article',
      schemaType: 'Article',
      breadcrumbs: [
        { name: 'Главная', url: '/' },
        { name: 'Статьи', url: '/novosti-nedvizhimosti' },
        { name: article.title, url: `/${articleSlug}` },
      ],
      faq,
      twitterCard: 'summary_large_image',
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: (article as any).updatedAt || (article as any).publishedAt || article.date || new Date().toISOString(),
    };
  }

  generateLocalSEOPage(
    category: RealEstateCategory,
    location: { district?: string; metroStation?: string; microdistrict?: string }
  ): SEOMetadata {
    const locationName = location.district || location.metroStation || location.microdistrict || '';

    const titleVariants = [
      `${category.name} ${locationName} | АН Фаттория`,
      `${category.keywords[0]} ${locationName} — агентство «АН Фаттория»`,
      `${locationName}: ${category.name.toLowerCase()} | АН Фаттория`,
    ];

    const title = titleVariants[0];

    const description = `Ищете ${category.keywords[0]} в ${locationName}? ✅ Агентство «АН Фаттория» — профессиональная помощь в ${category.name.toLowerCase()}. ${this.getUSP(category)}`;

    const primaryKeyword = `${category.keywords[0]} ${locationName}`;
    const geoKeywords = this.generateGeoKeywords(location, category);

    return {
      title,
      description: description.slice(0, 160),
      h1: `${category.name} в ${locationName}`,
      primaryKeyword,
      secondaryKeywords: [...geoKeywords, ...category.longTailKeywords.slice(0, 10)],
      canonicalUrl: `${BASE_URL}/${category.slug}-${this.slugManager.generate(locationName)}`,
      ogTitle: title,
      ogDescription: description,
      ogImage: `${BASE_URL}/og-${category.id}-${locationName}.jpg`,
      ogType: 'place',
      schemaType: 'LocalBusiness',
      breadcrumbs: [
        { name: 'Главная', url: '/' },
        { name: category.name, url: `/${category.slug}` },
        { name: locationName, url: `/${category.slug}-${locationName}` },
      ],
      faq: this.generateLocalFAQ(category, locationName),
      localBusiness: {
        name: 'АН Фаттория',
        address: `г. Минск, ${locationName}`,
        phone: '+375 29 638-00-53',
        geo: { lat: 53.9008, lng: 27.5516 },
      },
      twitterCard: 'summary_large_image',
      priority: '0.9',
      changefreq: 'weekly',
      lastmod: new Date().toISOString(),
    };
  }

  private generateFAQ(category: RealEstateCategory): Array<{ question: string; answer: string }> {
    const faqTemplates: Record<string, Array<{ question: string; answer: string }>> = {
      'buy-apartments': [
        { question: 'Сколько стоит купить квартиру в Минске?', answer: 'Стоимость квартир в Минске варьируется от $30,000 за однокомнатную в спальном районе до $150,000+ за многокомнатную в центре. Цена зависит от района, метража, состояния и этажа.' },
        { question: 'Какие документы нужны для покупки квартиры?', answer: 'Для покупки квартиры потребуются: паспорт, свидетельство о браке (если есть), согласие супруга, справка о доходах (для ипотеки). Продавец предоставляет: свидетельство о собственности, техпаспорт, справку о составе семьи.' },
        { question: 'Можно ли купить квартиру в ипотеку?', answer: 'Да, мы сотрудничаем со всеми банками Минска. Первоначальный взнос от 10%, ставка от 12% годовых. Поможем подобрать оптимальную программу и собрать документы.' },
      ],
      'sell-apartments': [
        { question: 'Как быстро продать квартиру в Минске?', answer: 'При правильной оценке и подготовке квартира продается за 2-4 недели. АН Фаттория гарантирует продажу за 24 дня благодаря собственной базе покупателей и профессиональной подготовке.' },
        { question: 'Сколько стоит продажа квартиры через агентство?', answer: 'Стандартная комиссия 3-5% от стоимости. Но у нас действуют акции: при эксклюзивном договоре — 2%, для пенсионеров — скидка 50%.' },
      ],
      'exchange': [
        { question: 'Как происходит обмен квартиры?', answer: 'Обмен может быть прямой (квартира на квартиру) или альтернативный (через цепочку сделок). Мы организуем безопасную схему: одновременно регистрируем продажу вашей квартиры и покупку новой.' },
      ],
      'separation': [
        { question: 'Как разъехаться при разводе?', answer: 'Существует несколько вариантов: продажа общей квартиры с разделом денег, обмен на две меньшие квартиры с доплатой, выделение долей в натуре.' },
      ],
      'rent-commercial': [
        { question: 'Как арендовать офис в Минске?', answer: 'Подбираем офисы, склады, торговые и производственные помещения. Проверяем документы, помогаем с заключением официального договора аренды.' },
      ],
    };

    return faqTemplates[category.id] || [
      { question: `Почему стоит выбрать АН Фаттория для ${category.name.toLowerCase()}?`, answer: `АН Фаттория — агентство, работающее на рынке с 2022 года. Сотни успешных сделок, собственная база покупателей, юридическая проверка, страховка сделок.` },
    ];
  }

  private generateLSIKeywords(property: Property, category: RealEstateCategory): string[] {
    const lsi: string[] = [];

    if (property.rooms) {
      lsi.push(`${property.rooms}-комнатная квартира`);
      lsi.push(`${property.rooms} комнаты`);
    }

    if (property.area) lsi.push(`квартира ${property.area} м²`);
    if (property.floor) lsi.push(`${property.floor} этаж`);
    if ((property as any).balcony) lsi.push('с балконом', 'балкон');
    if ((property as any).repair) lsi.push(`${(property as any).repair} ремонт`);
    if ((property as any).furniture) lsi.push('с мебелью');

    lsi.push('без посредников', 'от собственника', 'прямая продажа');
    lsi.push('юридическая проверка', 'чистая продажа', 'без обременений');

    return lsi;
  }

  private generateOptimizedTitle(fullName: string, primaryKeyword: string): string {
    const title = `${primaryKeyword} | АН Фаттория Минск`;
    return title.length > 70 ? title.slice(0, 67) + '...' : title;
  }

  private generateOptimizedDescription(
    fullName: string,
    primaryKeyword: string,
    secondaryKeywords: string[]
  ): string {
    const usp = this.getUSPByKeyword(primaryKeyword);
    const desc = `🔑 ${fullName} от агентства «АН Фаттория». ${usp} ${secondaryKeywords.slice(0, 3).join(', ')}. Звоните! ☎️`;
    return desc.length > 160 ? desc.slice(0, 157) + '...' : desc;
  }

  private generateH1(fullName: string, primaryKeyword: string): string {
    return fullName.includes(primaryKeyword) ? fullName : `${fullName} — ${primaryKeyword}`;
  }

  private getUSP(category: RealEstateCategory): string {
    const usps: Record<string, string> = {
      buy: 'Безопасная сделка с юридической проверкой. Подберем идеальный вариант!',
      sell: 'Продадим за 24 дня по максимальной цене. Бесплатная оценка!',
      rent: 'Прямые договоры без скрытых комиссий. Поможем с оформлением!',
      exchange: 'Организуем цепочку любой сложности. Синхронная сделка в один день!',
      info: 'Профессиональная консультация. Решим вашу проблему!',
    };
    return usps[category.searchIntent] || 'На рынке с 2022 года. Сотни довольных клиентов!';
  }

  private getUSPByKeyword(keyword: string): string {
    if (keyword.includes('долг')) return 'Поможем продать даже с долгами. Юридическая очистка!';
    if (keyword.includes('дол')) return 'Выкупим вашу долю за 1 день. Рыночная цена!';
    if (keyword.includes('ипотек')) return 'Поможем с ипотекой. Одобрение в кратчайшие сроки!';
    return '';
  }

  private generateGeoKeywords(
    location: { district?: string; metroStation?: string; microdistrict?: string },
    category: RealEstateCategory
  ): string[] {
    const keywords: string[] = [];
    const locName = location.district || location.metroStation || location.microdistrict || '';

    if (locName) {
      keywords.push(
        `${category.keywords[0]} ${locName}`,
        `${category.name} ${locName}`,
        `${locName} ${category.keywords[0]}`,
        `недвижимость ${locName}`,
        `квартиры ${locName}`,
      );
    }

    return keywords;
  }

  private detectArticleCategory(article: Article): RealEstateCategory {
    const content = `${article.title} ${article.snippet || ''} ${article.content || ''}`.toLowerCase();

    for (const category of Object.values(REAL_ESTATE_CATEGORIES)) {
      if (category.keywords.some(kw => content.includes(kw.toLowerCase()))) {
        return category;
      }
    }

    return REAL_ESTATE_CATEGORIES.buyApartments;
  }

  private generateArticleTitle(title: string, category: RealEstateCategory): string {
    return `${title} | АН Фаттория`;
  }

  private generateArticleDescription(article: Article, category: RealEstateCategory): string {
    const base = article.snippet || `${category.name} в Минске.`;
    const cta = 'Читайте в нашей статье! ☝️';
    const full = `${base} ${cta}`;
    return full.length > 160 ? full.slice(0, 157) + '...' : full;
  }

  private extractFAQFromArticle(article: Article): Array<{ question: string; answer: string }> {
    const questions: Array<{ question: string; answer: string }> = [];
    const content = article.content || '';

    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('?') && i + 1 < lines.length) {
        const question = lines[i].trim();
        const answer = lines[i + 1].trim();
        if (question.length > 10 && answer.length > 20) {
          questions.push({ question, answer: answer.slice(0, 300) });
        }
      }
    }

    if (questions.length === 0) {
      questions.push({
        question: `Что важно знать о ${article.title.toLowerCase()}?`,
        answer: `В статье мы подробно разбираем ${article.title.toLowerCase()}. Даем практические советы, основанные на опыте работы агентства «АН Фаттория» с 2022 года.`,
      });
    }

    return questions.slice(0, 5);
  }

  private generateLocalFAQ(
    category: RealEstateCategory,
    location: string
  ): Array<{ question: string; answer: string }> {
    return [
      {
        question: `Почему стоит ${category.keywords[0]} в ${location}?`,
        answer: `${location} — один из лучших районов Минска с развитой инфраструктурой, транспортной доступностью и хорошей экологией. ${category.name} здесь пользуется стабильным спросом.`,
      },
      {
        question: `Какие цены на ${category.name.toLowerCase()} в ${location}?`,
        answer: `Цены зависят от типа дома, этажа, состояния и метража. Актуальные цены уточняйте у наших специалистов.`,
      },
    ];
  }
}

class ContentClusterGenerator {
  generateCluster(category: RealEstateCategory): ContentCluster {
    const pillarPage = `${category.slug}`;
    const clusterPages: string[] = [];
    const internalLinks: Array<{ from: string; to: string; anchor: string }> = [];

    category.longTailKeywords.forEach((keyword) => {
      const clusterSlug = `${category.slug}-${slugManager.generate(keyword)}`;
      clusterPages.push(clusterSlug);

      internalLinks.push({ from: clusterSlug, to: pillarPage, anchor: `${category.name.toLowerCase()} в Минске` });
      internalLinks.push({ from: pillarPage, to: clusterSlug, anchor: keyword });
    });

    MINSK_DISTRICTS.forEach(district => {
      const geoslug = `${category.slug}-${slugManager.generate(district)}`;
      clusterPages.push(geoslug);

      internalLinks.push({ from: pillarPage, to: geoslug, anchor: `${category.keywords[0]} ${district} район` });
    });

    return { pillarPage, clusterPages, internalLinks };
  }
}

// ============================================================
// ЭКСПОРТЫ
// ============================================================

export const advancedSEO = new AdvancedSEOManager();
export const clusterGenerator = new ContentClusterGenerator();

export { REAL_ESTATE_CATEGORIES, MINSK_DISTRICTS, MINSK_METRO_STATIONS };

export function updateAdvancedSEO(
  type: 'category' | 'property' | 'article' | 'local',
  data: any
): void {
  let metadata: SEOMetadata;

  switch (type) {
    case 'category':
      metadata = advancedSEO.generateCategoryPageSEO(data.category, data.geo);
      break;
    case 'property':
      metadata = advancedSEO.generatePropertySEO(data.property);
      break;
    case 'article':
      metadata = advancedSEO.generateArticleSEO(data.article);
      break;
    case 'local':
      metadata = advancedSEO.generateLocalSEOPage(data.category, data.location);
      break;
    default:
      return;
  }

  applySEOMetadata(metadata);
}

export function generateRealEstateListingSchema(property: Property): object {
  const priceUSD = property.priceUSD || 0;
  const priceBYN = property.priceBYN || Math.round(priceUSD * 3.27);
  const propertyUrl = `${BASE_URL}/${getPropertySlug(property)}`;
  const photoUrl = property.photo || property.image || `${BASE_URL}/og-image.jpg`;

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description || `${property.title} в Минске от агентства «АН Фаттория»`,
    url: propertyUrl,
    image: [photoUrl],
    datePosted: (property as any).createdAt || '2025-01-01',
    offers: {
      '@type': 'Offer',
      price: priceUSD > 0 ? priceUSD : priceBYN,
      priceCurrency: priceUSD > 0 ? 'USD' : 'BYN',
      priceSpecification: [
        { '@type': 'UnitPriceSpecification', price: priceUSD, priceCurrency: 'USD' },
        { '@type': 'UnitPriceSpecification', price: priceBYN, priceCurrency: 'BYN' }
      ],
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'RealEstateAgent',
        name: 'ООО «АН Фаттория»',
        telephone: '+375 29 638-00-53',
        url: BASE_URL,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'ул. Репина, д.4, пом.458',
          addressLocality: 'Минск',
          addressCountry: 'BY',
        },
      },
    },
    about: {
      '@type': property.type === 'house' ? 'SingleFamilyResidence' : property.type === 'commercial' ? 'Place' : 'Apartment',
      name: property.title,
      address: {
        '@type': 'PostalAddress',
        streetAddress: property.address,
        addressLocality: 'Минск',
        addressCountry: 'BY',
      },
      geo: (property as any).coordinates ? {
        '@type': 'GeoCoordinates',
        latitude: (property as any).coordinates[0],
        longitude: (property as any).coordinates[1],
      } : undefined,
      numberOfRooms: property.rooms,
      floorSize: property.area ? {
        '@type': 'QuantitativeValue',
        value: property.area,
        unitCode: 'MTK',
      } : undefined,
    },
  };
}

function applySEOMetadata(metadata: SEOMetadata & { propertyData?: Property }): void {
  document.title = metadata.title;

  setMetaTag('description', metadata.description);
  setMetaTag('title', metadata.title);

  setMetaTag('og:title', metadata.ogTitle, true);
  setMetaTag('og:description', metadata.ogDescription, true);
  setMetaTag('og:image', metadata.ogImage, true);
  setMetaTag('og:type', metadata.ogType, true);
  setMetaTag('og:url', metadata.canonicalUrl, true);
  setMetaTag('og:site_name', 'АН Фаттория', true);

  setMetaTag('twitter:card', metadata.twitterCard || 'summary_large_image');
  setMetaTag('twitter:title', metadata.ogTitle);
  setMetaTag('twitter:description', metadata.ogDescription);
  setMetaTag('twitter:image', metadata.ogImage);

  setCanonical(metadata.canonicalUrl);

  const schemas: object[] = [];

  if (metadata.localBusiness) {
    schemas.push(generateLocalBusinessSchema(metadata.localBusiness));
  }

  if (metadata.faq) {
    schemas.push(generateFAQSchema(metadata.faq));
  }

  if (metadata.breadcrumbs && metadata.breadcrumbs.length > 0) {
    schemas.push(generateBreadcrumbSchema(metadata.breadcrumbs));
  }

  if (metadata.propertyData) {
    schemas.push(generateRealEstateListingSchema(metadata.propertyData));
  }

  setJSONLD(schemas);
}

function setMetaTag(name: string, content: string, isProperty = false): void {
  const attr = isProperty ? 'property' : 'name';
  let element = document.querySelector(`meta[${attr}="${name}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function setCanonical(url: string): void {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
}

function setJSONLD(schemas: object[]): void {
  const existing = document.getElementById('advanced-seo-jsonld');
  if (existing) existing.remove();

  const script = document.createElement('script');
  script.id = 'advanced-seo-jsonld';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);
  document.head.appendChild(script);
}

function generateLocalBusinessSchema(data: SEOMetadata['localBusiness']): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: data?.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: data?.address,
      addressLocality: 'Минск',
      addressCountry: 'BY',
    },
    telephone: data?.phone,
    geo: data?.geo ? {
      '@type': 'GeoCoordinates',
      latitude: data.geo.lat,
      longitude: data.geo.lng,
    } : undefined,
  };
}

function generateFAQSchema(faq: Array<{ question: string; answer: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: `${BASE_URL}${item.url}`,
    })),
  };
}