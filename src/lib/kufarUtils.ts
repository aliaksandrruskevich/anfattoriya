import type { Property } from '../types';

/**
 * Извлекает белорусский мобильный номер телефона из произвольного текста.
 * Поддерживаемые коды операторов: 29, 33, 44, 25.
 * Поддерживаемые форматы:
 * - +375 (29) 123-45-67 / +375291234567 / 375 29 123 45 67
 * - 8 (029) 123-45-67 / 80291234567 / 80 29 123-45-67
 * - (29) 123-45-67 / 29 123-45-67 / 291234567
 *
 * Игнорирует URL и длинные числовые ID объявлений, чтобы не путать номер телефона с ID.
 */
export function extractBelarusPhone(text: string | null | undefined): string | null {
  if (!text) return null;

  // Убираем ссылки (в URL часто содержатся длинные ID объявлений и query-параметры)
  const sanitized = String(text)
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/(?:[\w-]+\.)?kufar\.by\/\S+/gi, ' ');

  const patterns: { rx: RegExp; checkAdContext: boolean }[] = [
    // +375 / 375 + мобильный код (29|33|44|25) + 7 цифр
    {
      rx: /(?<![\dA-Za-zА-Яа-яЁё/_-])(?:\+?375)[\s\-().]*(29|33|44|25)[\s\-().]*(\d{3})[\s\-().]*(\d{2})[\s\-().]*(\d{2})(?!\d)/g,
      checkAdContext: false,
    },
    // 80 / 8 0 + мобильный код (29|33|44|25) + 7 цифр
    {
      rx: /(?<![\dA-Za-zА-Яа-яЁё/_#№-])8[\s\-().]*0[\s\-().]*(29|33|44|25)[\s\-().]*(\d{3})[\s\-().]*(\d{2})[\s\-().]*(\d{2})(?!\d)/g,
      checkAdContext: false,
    },
    // Без кода страны: (29|33|44|25) + 7 цифр
    {
      rx: /(?<![\dA-Za-zА-Яа-яЁё/_#№-])(?:\(?(29|33|44|25)\)?[\s\-.]*(\d{3})[\s\-.]*(\d{2})[\s\-.]*(\d{2}))(?!(?:\d|\s*(?:р\.|руб|byn|usd|eur|\$|€|м2|м²|кв\.?\s*м)))/gi,
      checkAdContext: true,
    },
  ];

  const adContextRx =
    /(?:^|[^\p{L}])(?:id|ad|лот|объяв\p{L}*|арт\p{L}*)\s*[:#№\-]?\s*$/iu;

  for (const { rx, checkAdContext } of patterns) {
    for (const m of sanitized.matchAll(rx)) {
      const idx = m.index ?? 0;
      if (checkAdContext) {
        const before = sanitized.slice(Math.max(0, idx - 24), idx);
        if (adContextRx.test(before)) {
          continue;
        }
      }

      const code = m[1];
      const p1 = m[2];
      const p2 = m[3];
      const p3 = m[4];
      if (code && p1 && p2 && p3) {
        return `+375 (${code}) ${p1}-${p2}-${p3}`;
      }
    }
  }

  return null;
}

/**
 * Извлекает ID объявления Kufar из ссылки или текста.
 * Примеры:
 * - https://re.kufar.by/vi/minsk/kupit/kvartiru/123456789
 * - https://www.kufar.by/item/123456789
 * - kufar.by/item/123456
 */
export function extractKufarAdId(text: string | null | undefined): string | null {
  if (!text) return null;

  const itemMatch = text.match(/kufar\.by\/(?:item|vi\/[^\s?#]+)\/(\d{5,15})/i);
  if (itemMatch?.[1]) return itemMatch[1];

  const genericItemMatch = text.match(/kufar\.by\/[^\s?#]*?\/(\d{6,15})(?:[/?#\s]|$)/i);
  if (genericItemMatch?.[1]) return genericItemMatch[1];

  return null;
}

/**
 * Извлекает первую ссылку на объявление Kufar из текста.
 */
export function extractKufarAdUrl(text: string | null | undefined): string | null {
  if (!text) return null;
  const m = text.match(/https?:\/\/(?:[\w-]+\.)?kufar\.by\/[^\s<>"']+/i);
  if (m?.[0]) return m[0];

  const shortMatch = text.match(/(?:re\.|www\.)?kufar\.by\/(?:item|vi)\/[^\s<>"']+/i);
  if (shortMatch?.[0]) return `https://${shortMatch[0]}`;

  return null;
}

/**
 * Ищет соответствующий объект в базе properties по ID объявления Kufar
 * или по совпадению названия/адреса.
 */
export function findMatchingPropertyForKufar(
  kufarAdId: string | null | undefined,
  adTitle: string | null | undefined,
  messagesTexts: string[],
  properties: Property[]
): Property | null {
  if (!properties.length) return null;

  const candidateIds = new Set<string>();
  if (kufarAdId) candidateIds.add(String(kufarAdId).trim());

  for (const txt of messagesTexts) {
    const found = extractKufarAdId(txt);
    if (found) candidateIds.add(found);
  }

  for (const id of candidateIds) {
    const byId = properties.find((p) => {
      const pId = String(p.id || '');
      const pUrl = String(p.sourceUrl || '');
      const pSlug = String(p.slug || '');
      const pInv = String(p.inventoryNo || '');
      return (
        pId === id ||
        pId.includes(id) ||
        pUrl.includes(id) ||
        pSlug.includes(id) ||
        pInv === id
      );
    });
    if (byId) return byId;
  }

  // Fallback: аккуратный поиск по названию объявления, если указано
  if (adTitle && adTitle.trim().length >= 8) {
    const normTitle = adTitle.toLowerCase().replace(/\s+/g, ' ').trim();
    const byTitle = properties.find((p) => {
      const pt = (p.title || '').toLowerCase().trim();
      const pa = (p.address || '').toLowerCase().trim();
      return (
        (pt.length >= 6 && (normTitle.includes(pt) || pt.includes(normTitle))) ||
        (pa.length >= 6 && normTitle.includes(pa))
      );
    });
    if (byTitle) return byTitle;
  }

  return null;
}

/**
 * Формирует ссылку для пересылки информации об объекте и клиенте в Viber / Telegram.
 */
export function buildMessengerShareText(opts: {
  clientName: string;
  clientPhone?: string | null;
  adTitle?: string | null;
  kufarAdId?: string | null;
  lastMessage?: string | null;
  matchedProperty?: Property | null;
}): string {
  const objectTitle = opts.matchedProperty?.title || opts.adTitle || 'Объект недвижимости';
  const objectUrl = opts.matchedProperty
    ? `https://fattoria.by/object/${opts.matchedProperty.slug || opts.matchedProperty.id}`
    : opts.kufarAdId
      ? `https://www.kufar.by/item/${opts.kufarAdId}`
      : 'https://fattoria.by/catalog';

  const parts = [
    `💬 Запрос с Kufar | АН Фаттория`,
    `👤 Клиент: ${opts.clientName}`,
    opts.clientPhone ? `📞 Телефон: ${opts.clientPhone}` : '',
    `🏢 Объект: ${objectTitle}`,
    opts.matchedProperty?.assignedAgentName || opts.matchedProperty?.agentName
      ? `🧑‍💼 Риэлтер: ${opts.matchedProperty?.assignedAgentName || opts.matchedProperty?.agentName}`
      : '',
    opts.lastMessage ? `✉️ Сообщение: "${opts.lastMessage}"` : '',
    `🔗 Ссылка: ${objectUrl}`,
  ].filter(Boolean);

  return parts.join('\n');
}

export function buildViberShareUrl(text: string): string {
  return `viber://forward?text=${encodeURIComponent(text)}`;
}

export function buildTelegramShareUrl(text: string, objectUrl?: string): string {
  const urlParam = objectUrl ? `url=${encodeURIComponent(objectUrl)}&` : '';
  return `https://t.me/share/url?${urlParam}text=${encodeURIComponent(text)}`;
}
