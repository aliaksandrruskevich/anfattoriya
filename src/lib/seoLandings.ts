import { Property } from '@/types';

export type LandingType = 'zhk' | 'metro' | 'ulica' | 'rajon' | null;

/**
 * Определяет тип SEO-лендинга по slug
 */
export function parseLandingType(slug: string): LandingType {
  if (slug.startsWith('zhk-')) return 'zhk';
  if (slug.startsWith('metro-')) return 'metro';
  if (slug.startsWith('ulica-')) return 'ulica';
  if (slug.startsWith('rajon-')) return 'rajon';
  return null;
}

/**
 * Транслитерация кириллицы в латиницу.
 */
const TRANSLIT_MAP: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
  'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i',
  'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
  'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
  'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
  'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '',
  'э': 'e', 'ю': 'yu', 'я': 'ya',
};

function transliterate(str: string): string {
  return str
    .toLowerCase()
    .split('')
    .map((c) => TRANSLIT_MAP[c] ?? c)
    .join('');
}

/**
 * Нормализация: транслит + удаление всего кроме a-z0-9.
 */
function normalize(value: string): string {
  return transliterate(value).replace(/[^a-z0-9]/g, '');
}

/**
 * Склоняет название района:
 * «Логойский район» → «Логойском районе»
 * «Минский район» → «Минском районе»
 */
function declineDistrict(name: string): string {
  if (!name) return name;

  // Если есть "район" — склоняем прилагательное + "районе"
  if (name.toLowerCase().includes('район')) {
    return name
      .replace(/([а-яё])ский район/i, '$1ском районе')
      .replace(/([а-яё])ий район/i, '$1ом районе')
      .replace(/([а-яё])ой район/i, '$1ом районе')
      .replace(/([а-яё])ый район/i, '$1ом районе')
      .replace(/район$/i, 'районе');
  }

  return name;
}

/**
 * Склоняет название города:
 * «Цна» → «Цне», «Минск» → «Минске»
 */
function declineCity(name: string): string {
  if (!name) return name;
  const lower = name.toLowerCase().trim();

  // Известные города
  const cityMap: Record<string, string> = {
    'минск': 'Минске',
    'борисов': 'Борисове',
    'заславль': 'Заславле',
    'дзержинск': 'Дзержинске',
    'столбцы': 'Столбцах',
    'вилейка': 'Вилейке',
    'копище': 'Копище',
    'семково': 'Семково',
    'самохваловичи': 'Самохваловичах',
    'цна': 'Цне',
    'цне': 'Цне',
    'логойск': 'Логойске',
    'фаниполь': 'Фаниполе',
    'колодищи': 'Колодищах',
    'боровляны': 'Боровлянах',
    'ратомка': 'Ратомке',
    'раубичи': 'Раубичах',
    'сеница': 'Сенице',
    'тарасово': 'Тарасово',
    'юбилейный': 'Юбилейном',
  };

  if (cityMap[lower]) return cityMap[lower];

  // Общее правило: -а → -е (Цна → Цне)
  if (lower.endsWith('а')) {
    return name.slice(0, -1) + 'е';
  }

  // -ск → -ске
  if (lower.endsWith('ск')) {
    return name + 'е';
  }

  return name;
}

/**
 * Склоняет название области:
 * «Минская область» → «Минской области»
 */
function declineRegion(name: string): string {
  const lower = name.toLowerCase().trim();

  if (lower.includes('область')) {
    return lower
      .replace('минская область', 'Минской области')
      .replace('гомельская область', 'Гомельской области')
      .replace('брестская область', 'Брестской области')
      .replace('витебская область', 'Витебской области')
      .replace('гродненская область', 'Гродненской области')
      .replace('могилевская область', 'Могилёвской области')
      .replace('могилёвская область', 'Могилёвской области');
  }

  if (lower === 'минск') return 'Минске';

  return name;
}

/**
 * Фильтрует объекты по типу лендинга
 */
export function filterProperties(
  properties: Property[],
  type: LandingType,
  slug: string
): Property[] {
  const searchValue = slug
    .replace(/^(zhk|metro|ulica|rajon)-/, '')
    .replace(/-/g, ' ')
    .toLowerCase()
    .trim();

  const normalizedSearch = normalize(searchValue);

  const published = properties.filter(
    (p) => p.isPublished !== false && !p.isClosedBase
  );

  switch (type) {
    case 'metro':
      return published.filter((p) => {
        if (!p.metro) return false;
        return normalize(p.metro).includes(normalizedSearch);
      });
    case 'ulica':
      return published.filter((p) => {
        if (!p.street) return false;
        return normalize(p.street).includes(normalizedSearch);
      });
    case 'rajon':
      return published.filter((p) => {
        if (!p.district) return false;
        return normalize(p.district).includes(normalizedSearch);
      });
    case 'zhk':
      return published.filter((p) => {
        const haystack = `${p.title || ''} ${p.description || ''} ${p.address || ''}`;
        return normalize(haystack).includes(normalizedSearch);
      });
    default:
      return [];
  }
}

/**
 * Находит настоящее название метро/улицы/района из объектов
 */
export function findDisplayName(
  properties: Property[],
  type: LandingType,
  slug: string
): string | null {
  const filtered = filterProperties(properties, type, slug);
  if (filtered.length === 0) return null;

  const first = filtered[0];
  if (type === 'metro') return first.metro || null;
  if (type === 'ulica') return first.street || null;
  if (type === 'rajon') return first.district || null;
  return null;
}

/**
 * Определяет, какие типы объектов на странице.
 * Возвращает "дом", "квартира", "участок", "коммерция" или null (микс).
 */
function detectObjectType(properties: Property[]): string | null {
  if (properties.length === 0) return null;

  const types = new Set(properties.map((p) => p.type));
  if (types.size > 1) return null; // микс

  const type = types.values().next().value;
  if (type === 'house') return 'дом';
  if (type === 'apartment') return 'квартиру';
  if (type === 'plot') return 'участок';
  if (type === 'commercial') return 'коммерческую недвижимость';
  return null;
}

/**
 * Генерирует title
 */
export function generateLandingTitle(
  type: LandingType,
  slug: string,
  count: number,
  displayName?: string | null,
  properties?: Property[]
): string {
  // Определяем тип объектов на странице
  const objectType = properties ? detectObjectType(properties) : null;

  // Извлекаем значение из slug или displayName
  let value: string;
  if (displayName) {
    value = displayName;
  } else {
    value = slug
      .replace(/^(zhk|metro|ulica|rajon)-/, '')
      .replace(/-/g, ' ');
    value = value.charAt(0).toUpperCase() + value.slice(1);
  }

  // Определяем, что искать: дом / квартиру / недвижимость
  const searchWord = objectType
    ? objectType
    : type === 'metro' || type === 'ulica'
      ? 'квартиру'
      : 'недвижимость';

  switch (type) {
    case 'metro':
      return `Купить ${searchWord} у метро ${value} — цены, фото | Фаттория`;

    case 'ulica':
      return `Купить ${searchWord} на улице ${value} — цены, фото | Фаттория`;

    case 'rajon': {
      const lower = value.toLowerCase();
      // Если это область/город
      if (lower.includes('область') || lower === 'минск' || lower.includes('город')) {
        const declined = declineRegion(value);
        return `Купить ${searchWord} в ${declined} — цены, фото | Фаттория`;
      }
      // Если это район (Логойский район, Минский район)
      if (lower.includes('район')) {
        const declined = declineDistrict(value);
        return `Купить ${searchWord} в ${declined} — цены, фото | Фаттория`;
      }
      // Обычный район
      return `Купить ${searchWord} в ${value} районе — цены, фото | Фаттория`;
    }

    case 'zhk':
      return `Квартиры в ЖК ${value} — купить в Минске | Фаттория`;

    default:
      return 'Недвижимость в Минске | АН Фаттория';
  }
}

/**
 * Генерирует description
 */
export function generateLandingDescription(
  type: LandingType,
  slug: string,
  count: number,
  displayName?: string | null,
  properties?: Property[]
): string {
  const objectType = properties ? detectObjectType(properties) : null;
  const objectTypeAcc = objectType
    ? objectType === 'дом'
      ? 'домов'
      : objectType === 'квартиру'
        ? 'квартир'
        : objectType === 'участок'
          ? 'участков'
          : 'объектов'
    : 'объектов';

  let value: string;
  if (displayName) {
    value = displayName;
  } else {
    value = slug
      .replace(/^(zhk|metro|ulica|rajon)-/, '')
      .replace(/-/g, ' ');
  }

  switch (type) {
    case 'metro':
      return `Все ${objectTypeAcc} у метро ${value} в Минске: ${count} актуальных предложений. Фото, цены, планировки. Живые описания, проверка документов, помощь с ипотекой.`;

    case 'ulica':
      return `Все ${objectTypeAcc} на улице ${value} в Минске: ${count} актуальных предложений. Фото, цены, планировки. Живые описания, проверка документов.`;

    case 'rajon': {
      const lower = value.toLowerCase();
      if (lower.includes('область') || lower === 'минск' || lower.includes('город')) {
        const declined = declineRegion(value);
        return `Все ${objectTypeAcc} в ${declined}: ${count} актуальных предложений. Фото, цены, планировки. Подбор, проверка, оформление — под ключ от «Фаттории».`;
      }
      if (lower.includes('район')) {
        const declined = declineDistrict(value);
        return `Все ${objectTypeAcc} в ${declined}: ${count} актуальных предложений. Фото, цены, планировки. Подбор, проверка, оформление — под ключ от «Фаттории».`;
      }
      return `Все ${objectTypeAcc} в ${value} районе: ${count} актуальных предложений. Фото, цены, планировки. Подбор, проверка, оформление.`;
    }

    case 'zhk':
      return `Квартиры в ЖК ${value}: ${count} предложений. Реальные фото, живое описание, юридическая проверка.`;

    default:
      return 'Недвижимость в Минске от агентства «Фаттория».';
  }
}

/**
 * Генерирует slug из значения (для sitemap)
 */
export function makeLandingSlug(type: LandingType, value: string): string {
  const clean = transliterate(value)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  return `${type}-${clean}`;
}