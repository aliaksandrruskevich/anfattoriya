import type { Property } from '@/types';

export type SaleCategoryFilter =
  | 'all'
  | 'apartment'
  | 'commercial'
  | 'house_plot'
  | 'room_share';

const CYR_BOUND_LEFT = '(?:^|[\\s,.;:("«\\-])';
const CYR_BOUND_RIGHT = '(?=$|[\\s,.;:)"»?!\\-])';

/**
 * Определяет, является ли объект арендой (исключается со страниц раздела «Продажа»).
 */
export function isRentalProperty(prop: Property): boolean {
  if (prop.isRental || prop.priceIsPerM2) return true;

  const terms = String(prop.terms || '').toLowerCase().trim();
  if (terms && /аренд|сда[её]тся|на[её]м|посуточн/i.test(terms)) {
    return true;
  }

  const features = Array.isArray(prop.features) ? prop.features : [];
  if (
    features.some((f) =>
      new RegExp(`${CYR_BOUND_LEFT}аренда${CYR_BOUND_RIGHT}|в месяц`, 'i').test(String(f))
    )
  ) {
    return true;
  }

  // Если условия сделки прямо не указаны как продажа, проверяем явный заголовок аренды
  if (!/продаж|прода[её]т|мены|обмен/i.test(terms)) {
    const title = String(prop.title || '').toLowerCase().trim();
    if (
      /^(сда[её]тся|аренда(?=$|[\s,:])|долгосрочная\s+аренда|предлагаем\s+(в\s+(долгосрочную\s+)?)?аренд)/i.test(
        title
      )
    ) {
      return true;
    }
    if (
      /[\s,]в\s+аренду(?=$|[\s,.;:!?])/.test(title) &&
      !/прода[её]т|продаж|готовый\s+(арендный\s+)?бизнес/i.test(title)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Определяет, относится ли объект к разделу «Комнаты и доли» (включая полдома и выделенные доли).
 * Не путает с обычными «2-комнатными» или «3-комнатными» квартирами.
 */
export function isRoomOrShareProperty(prop: Property): boolean {
  const ot = String(prop.objectType || '').toLowerCase().trim();
  if (
    ot === 'комната' ||
    ot === 'доля' ||
    ot === 'полдома' ||
    ot.includes('комната в') ||
    ot.includes('дол')
  ) {
    return true;
  }

  const title = String(prop.title || '').toLowerCase();
  const roomShareTitlePatterns = [
    new RegExp(`^\\s*(?:комната|доля|полдома)${CYR_BOUND_RIGHT}`, 'i'),
    new RegExp(
      `(?:прода[её]тся|в\\s+продаже|продажа)\\s+(?:[\\d/]+\\s+)?(?:выделенн\\w+\\s+)?(?:комнат[ауы]|дол[яию]|полдома)${CYR_BOUND_RIGHT}`,
      'i'
    ),
    new RegExp(`\\d+\\s*/\\s*\\d+\\s*дол[яией]${CYR_BOUND_RIGHT}`, 'i'),
    new RegExp(
      `${CYR_BOUND_LEFT}комната\\s+(?:[\\d.,]+\\s*(?:м2|м²|кв\\.?\\s*м)?\\s*)?(?:\\([^)]*\\)\\s*)?в\\s+(?:\\d+-?[хк]?\\s*)?(?:[а-яё-]+\\s+)?квартир`,
      'i'
    ),
    new RegExp(`${CYR_BOUND_LEFT}доля\\s+в\\s+(?:[а-яё-]+\\s+){0,3}квартир`, 'i'),
  ];
  if (roomShareTitlePatterns.some((rx) => rx.test(title))) {
    return true;
  }

  const descLead = String(prop.description || '').slice(0, 260).toLowerCase();
  const roomShareDescPatterns = [
    new RegExp(
      `(?:в\\s+продаже|прода[её]тся|предлагается\\s+к?\\s*продаже)\\s+(?:выделенная\\s+)?(?:дол[яи]|комната\\s+в|полдома)`,
      'i'
    ),
    new RegExp(`${CYR_BOUND_LEFT}выделенная\\s+доля\\s+в${CYR_BOUND_RIGHT}`, 'i'),
    new RegExp(`доля\\s+в\\s+(?:[а-яё0-9-]+\\s+){0,2}квартире\\s*:\\s*\\d+\\s*/\\s*\\d+`, 'i'),
  ];
  if (roomShareDescPatterns.some((rx) => rx.test(descLead))) {
    return true;
  }

  return false;
}

/**
 * Уточняет базовый тип объекта для случаев, когда из фида не пришёл <object_type>,
 * а тип явно указан в названии объекта (например, "Продается 2-х ком.квартира").
 */
export function resolveEffectivePropertyType(
  prop: Property
): 'apartment' | 'commercial' | 'house' | 'plot' {
  const ot = String(prop.objectType || '').toLowerCase().trim();
  if (ot) {
    if (
      ot.includes('дом') ||
      ot.includes('коттедж') ||
      ot.includes('дача') ||
      ot.includes('таунхаус') ||
      ot.includes('полдома')
    ) {
      return 'house';
    }
    if (ot.includes('участок') || ot.includes('земл')) {
      return 'plot';
    }
    if (ot === 'квартира' || ot === 'комната' || ot.includes('дол')) {
      return 'apartment';
    }
    if (prop.type === 'commercial') return 'commercial';
  }

  if (prop.type !== 'commercial') {
    return prop.type;
  }

  const title = String(prop.title || '').toLowerCase();
  if (
    !/(офис|склад|торгов|помещени|кафе|магазин|ресторан|саун|производств|бизнес|машиномест|гараж|здани)/i.test(
      title
    )
  ) {
    if (/(?:ком\.?\s*квартира|комнатная\s+квартира|квартира)/i.test(title)) {
      return 'apartment';
    }
    if (/^\s*(?:дом|коттедж|дача)(?=$|[\s,])/i.test(title)) {
      return 'house';
    }
  }

  return prop.type;
}

export function filterActiveSaleProperties(
  properties: Property[],
  category: SaleCategoryFilter = 'all'
): Property[] {
  const activePublicSales = (Array.isArray(properties) ? properties : []).filter((p) => {
    if (!p) return false;
    if (p.status && p.status !== 'active') return false;
    if (p.isPublished === false || p.isClosedBase || p.internalOnly || p.crmOnly) return false;
    if (isRentalProperty(p)) return false;
    return true;
  });

  if (category === 'all') {
    return activePublicSales;
  }

  if (category === 'room_share') {
    return activePublicSales.filter((p) => isRoomOrShareProperty(p));
  }

  if (category === 'apartment') {
    return activePublicSales.filter(
      (p) => resolveEffectivePropertyType(p) === 'apartment' && !isRoomOrShareProperty(p)
    );
  }

  if (category === 'commercial') {
    return activePublicSales.filter(
      (p) => resolveEffectivePropertyType(p) === 'commercial' && !isRoomOrShareProperty(p)
    );
  }

  if (category === 'house_plot') {
    return activePublicSales.filter((p) => {
      if (isRoomOrShareProperty(p)) return false;
      const eff = resolveEffectivePropertyType(p);
      return eff === 'house' || eff === 'plot';
    });
  }

  return activePublicSales;
}

export function getPropertyCategoryLabel(prop: Property): string {
  if (isRoomOrShareProperty(prop)) {
    return prop.objectType || 'Комната / доля';
  }
  if (prop.objectType) {
    return prop.objectType.charAt(0).toUpperCase() + prop.objectType.slice(1);
  }
  const eff = resolveEffectivePropertyType(prop);
  if (eff === 'apartment') return prop.rooms ? `${prop.rooms}-комн. квартира` : 'Квартира';
  if (eff === 'house') return 'Дом / коттедж';
  if (eff === 'plot') return 'Участок';
  return 'Коммерческая недвижимость';
}
