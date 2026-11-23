import { execute, isDbMockMode, query, queryOne } from './db';
import { getAgents } from './repository';
import { matchAgentByName } from './matchAgent';
import { getMockStore } from './mockStore';
import {
  isPublicProperty,
  sanitizeAgentForPublic,
  sanitizePropertyForPublic,
} from './sanitize';
import type { Property } from '../types';

const REALT_FEED_URL = process.env.REALT_FEED_URL || '';
const FETCH_TIMEOUT_MS = 30 * 1000;
const ARCHIVE_THRESHOLD_MINUTES = 5;

// ==================== SYNC ====================

export async function syncRealtToDb(): Promise<{ ok: boolean; count: number; error?: string }> {
  const started = Date.now();
  console.log('[Realt.by Sync] 🔄 Синхронизация с фидом Realt.by...');

  let xmlText: string | null = null;

  // 1. Пытаемся скачать фид по URL
  if (REALT_FEED_URL) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      const response = await fetch(REALT_FEED_URL, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          Accept: 'application/xml,text/xml,*/*;q=0.8',
          'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        xmlText = await response.text();
      } else {
        console.warn(`[Realt.by Sync] ⚠️ HTTP ${response.status} ${response.statusText}`);
      }
    } catch (err: any) {
      console.warn(`[Realt.by Sync] ⚠️ fetch не сработал: ${err.message}`);
    }
  }

  // 2. Fallback: локальный feed.xml
  if (!xmlText) {
    try {
      const fs = await import('node:fs/promises');
      const path = await import('node:path');
      const feedPath = path.join(process.cwd(), 'feed.xml');
      xmlText = await fs.readFile(feedPath, 'utf-8');
      console.log('[Realt.by Sync] 📂 Использован локальный feed.xml');
    } catch {
      console.error('[Realt.by Sync] ❌ Не удалось получить фид ни через fetch, ни через feed.xml');
      return { ok: false, count: 0, error: 'Feed not available' };
    }
  }

  const parsed = parseRealtFeed(xmlText);
  if (!parsed.properties.length) {
    console.warn('[Realt.by Sync] ⚠️ Фид распарсен, но объектов нет');
    return { ok: false, count: 0, error: 'No properties parsed' };
  }

  console.log(`[Realt.by Sync] 📦 Распарсено объектов: ${parsed.properties.length}`);

  const agents = await getAgents();

  let upserted = 0;
  let matched = 0;
  let failed = 0;

  for (const p of parsed.properties) {
    try {
      const matchedAgent = matchAgentByName(p.agentName, agents);
      const externalId = p.id;
      const now = new Date();

      await execute(
        `INSERT INTO properties (
          externalId, title, type, address, priceBYN, priceUSD, rooms, area,
          floor, totalFloors, photo, features, description, status, isPublished,
          source, sourceType, agentName, agentPhone, assignedAgentId, assignedAgentName,
          photos, district, metro, city, street, houseNumber, slug, priceHistory, id,
          lat, lng, createdAt, updatedAt,
          objectType, terms, townType, stateDistrict, stateRegion, townDistrict,
          addressFull, metroLine, metroTime, areaLiving, areaKitchen, areaGround,
          priceEUR, priceRUB
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) AS new
        ON DUPLICATE KEY UPDATE
          title = new.title,
          type = new.type,
          address = new.address,
          priceBYN = new.priceBYN,
          priceUSD = new.priceUSD,
          rooms = new.rooms,
          area = new.area,
          floor = new.floor,
          totalFloors = new.totalFloors,
          -- [FIX] photo/photos: квалифицируем колонку таблицы через properties.*
          --        без префикса MySQL 8.0.19+ с "AS new" считает имя ambiguous.
          photo = COALESCE(NULLIF(new.photo, ''), properties.photo),
          photos = COALESCE(NULLIF(new.photos, '[]'), properties.photos),
          features = new.features,
          description = new.description,
          status = 'active',
          isPublished = 1,
          agentName = new.agentName,
          agentPhone = new.agentPhone,
          assignedAgentId = new.assignedAgentId,
          assignedAgentName = new.assignedAgentName,
          district = new.district,
          metro = new.metro,
          city = new.city,
          street = new.street,
          houseNumber = new.houseNumber,
          -- [FIX] slug: раньше не обновлялся вообще. Теперь синхронизируется.
          slug = new.slug,
          -- priceHistory: перезаписываем (храним только последнюю цену).
          priceHistory = new.priceHistory,
          lat = new.lat,
          lng = new.lng,
          objectType = new.objectType,
          terms = new.terms,
          townType = new.townType,
          stateDistrict = new.stateDistrict,
          stateRegion = new.stateRegion,
          townDistrict = new.townDistrict,
          addressFull = new.addressFull,
          metroLine = new.metroLine,
          metroTime = new.metroTime,
          areaLiving = new.areaLiving,
          areaKitchen = new.areaKitchen,
          areaGround = new.areaGround,
          priceEUR = new.priceEUR,
          priceRUB = new.priceRUB,
          updatedAt = new.updatedAt`,
        [
          externalId,
          p.title,
          p.type,
          p.address,
          p.priceBYN ?? 0,
          p.priceUSD ?? 0,
          p.rooms ?? null,
          p.area ?? 0,
          p.floor ?? null,
          p.totalFloors ?? null,
          p.photo,
          JSON.stringify(p.features ?? []),
          p.description ?? null,
          'active',
          1,
          'realt',
          'realt',
          p.agentName ?? null,
          p.agentPhone ?? null,
          matchedAgent?.id ?? null,
          matchedAgent?.name ?? null,
          JSON.stringify(p.photos ?? []),
          p.district ?? null,
          p.metro ?? null,
          p.city ?? null,
          p.street ?? null,
          p.houseNumber ?? null,
          p.slug ?? null,
          JSON.stringify(p.priceHistory ?? null),
          `prop_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
          p.lat ?? null,
          p.lng ?? null,
          now,
          now,
          p.objectType ?? null,
          p.terms ?? null,
          p.townType ?? null,
          p.stateDistrict ?? null,
          p.stateRegion ?? null,
          p.townDistrict ?? null,
          p.addressFull ?? null,
          p.metroLine ?? null,
          p.metroTime ?? null,
          p.areaLiving ?? null,
          p.areaKitchen ?? null,
          p.areaGround ?? null,
          p.priceEUR ?? null,
          p.priceRUB ?? null,
        ]
      );

      upserted++;
      if (matchedAgent) matched++;
    } catch (err: any) {
      failed++;
      console.error(`[Realt.by Sync] ❌ Объект ${p.id}: ${err.message}`);
    }
  }

  // ==================== АВТОАРХИВАЦИЯ ====================
  // Объекты, которые есть в БД, но не пришли в этом синке — архивируем.
  // ВАЖНО: запускаем только если синк прошёл без ошибок (failed === 0).
  // Иначе можно заархивировать объекты, которые просто не успели обновиться.
  if (failed > 0) {
    console.warn(
      `[Realt.by Sync] ⚠️ Синк с ошибками (${failed} из ${parsed.properties.length}), ` +
        `автоархивация пропущена — чтобы не заархивировать объекты ложно`
    );
  } else {
    try {
      const result = await execute(
        `UPDATE properties
         SET status = 'archived', isPublished = 0, updatedAt = UTC_TIMESTAMP()
         WHERE sourceType = 'realt'
           AND status = 'active'
           AND updatedAt < DATE_SUB(
             (SELECT MAX(updatedAt) FROM (SELECT * FROM properties) AS t WHERE sourceType = 'realt'),
             INTERVAL ? MINUTE
           )`,
        [ARCHIVE_THRESHOLD_MINUTES]
      );
      const affected = (result as any)?.affectedRows ?? 0;
      if (affected > 0) {
        console.log(`[Realt.by Sync] 🗑️  Архивировано ${affected} объектов (нет в фиде)`);
      } else {
        console.log('[Realt.by Sync] ✅ Архивация: нечего архивировать');
      }
    } catch (e: any) {
      console.error('[Realt.by Sync] ⚠️ Ошибка автоархивации:', e.message);
    }
  }

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `[Realt.by Sync] ✅ Готово: ${upserted} объектов, ${matched} привязано к агентам` +
      (failed ? `, ${failed} ошибок` : '') +
      ` за ${elapsed}с`
  );

  return { ok: true, count: upserted };
}

// ==================== READ ====================

export async function getRealtData(force: boolean = false) {
  void force;

  if (isDbMockMode()) {
    const store = getMockStore();
    const agents = (await getAgents()).map(sanitizeAgentForPublic);
    const properties = store.properties
      .filter(isPublicProperty)
      .map(sanitizePropertyForPublic);

    return {
      properties,
      agents,
      lastSync: Date.now(),
      fromCache: false,
    };
  }

  const [propertyRows, agents] = await Promise.all([
    query(
      `SELECT * FROM properties
       WHERE status = 'active'
         AND isPublished = 1
         AND (isClosedBase = 0 OR isClosedBase IS NULL)
         AND (internalOnly = 0 OR internalOnly IS NULL)
         AND (crmOnly = 0 OR crmOnly IS NULL)
       ORDER BY createdAt DESC`
    ),
    getAgents(),
  ]);

  return {
    properties: propertyRows.map(rowToProperty).map(sanitizePropertyForPublic),
    agents: agents.map(sanitizeAgentForPublic),
    lastSync: Date.now(),
    fromCache: false,
  };
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  if (isDbMockMode()) {
    const store = getMockStore();
    const found = store.properties.find(
      (p) => (p.slug === slug || p.id === slug) && isPublicProperty(p)
    );
    return found ? sanitizePropertyForPublic(found) : null;
  }

  const row = await queryOne(
    `SELECT * FROM properties
     WHERE (slug = ? OR externalId = ? OR id = ?)
       AND status = 'active'
       AND isPublished = 1
       AND (isClosedBase = 0 OR isClosedBase IS NULL)
       AND (internalOnly = 0 OR internalOnly IS NULL)
       AND (crmOnly = 0 OR crmOnly IS NULL)
     LIMIT 1`,
    [slug, slug, slug]
  );
  return row ? sanitizePropertyForPublic(rowToProperty(row)) : null;
}

export async function getAllPropertySlugs(): Promise<string[]> {
  if (isDbMockMode()) {
    return getMockStore().properties
      .filter((p) => isPublicProperty(p) && p.slug)
      .map((p) => p.slug as string);
  }

  const rows = await query(
    `SELECT slug FROM properties
     WHERE status = 'active'
       AND isPublished = 1
       AND (isClosedBase = 0 OR isClosedBase IS NULL)
       AND (internalOnly = 0 OR internalOnly IS NULL)
       AND (crmOnly = 0 OR crmOnly IS NULL)
       AND slug IS NOT NULL`
  );
  return rows.map((r) => r.slug).filter((s): s is string => Boolean(s));
}

// ==================== MAPPERS ====================

function rowToProperty(row: any): Property {
  return {
    id: row.id,
    title: row.title,
    type: row.type as Property['type'],
    address: row.address,
    priceBYN: Number(row.priceBYN),
    priceUSD: Number(row.priceUSD),
    rooms: row.rooms ?? undefined,
    area: Number(row.area),
    floor: row.floor ?? undefined,
    totalFloors: row.totalFloors ?? undefined,
    photo: row.photo,
    image: row.image ?? undefined,
    features: parseJson(row.features) ?? [],
    agentName: row.agentName ?? undefined,
    agentPhone: row.agentPhone ?? undefined,
    agentPhoto: row.agentPhoto ?? undefined,
    assignedAgentId: row.assignedAgentId ?? undefined,
    assignedAgentName: row.assignedAgentName ?? undefined,
    sellerPhone: row.sellerPhone ?? undefined,
    priority: (row.priority as Property['priority']) ?? undefined,
    location: row.location ?? undefined,
    yearBuilt: row.yearBuilt ?? undefined,
    description: row.description ?? undefined,
    status: row.status ?? undefined,
    isPublished: Boolean(row.isPublished),
    internalOnly: Boolean(row.internalOnly),
    crmOnly: Boolean(row.crmOnly),
    contractStatus: row.contractStatus ?? undefined,
    contractNumber: row.contractNumber ?? undefined,
    contractDate: row.contractDate ?? undefined,
    sourceUrl: row.sourceUrl ?? undefined,
    isClosedBase: Boolean(row.isClosedBase),
    sourceType: row.sourceType ?? undefined,
    source: row.source ?? undefined,
    inventoryNo: row.inventoryNo ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    photos: parseJson(row.photos) ?? undefined,
    images: parseJson(row.images) ?? undefined,
    district: row.district ?? undefined,
    metro: row.metro ?? undefined,
    city: row.city ?? undefined,
    street: row.street ?? undefined,
    houseNumber: row.houseNumber ?? undefined,
    slug: row.slug ?? undefined,
    priceHistory: parseJson(row.priceHistory) ?? undefined,

    // Новые поля из фида
    objectType: row.objectType ?? undefined,
    terms: row.terms ?? undefined,
    townType: row.townType ?? undefined,
    stateDistrict: row.stateDistrict ?? undefined,
    stateRegion: row.stateRegion ?? undefined,
    townDistrict: row.townDistrict ?? undefined,
    addressFull: row.addressFull ?? undefined,
    metroLine: row.metroLine ?? undefined,
    metroTime: row.metroTime ?? undefined,
    areaLiving: row.areaLiving != null ? Number(row.areaLiving) : undefined,
    areaKitchen: row.areaKitchen != null ? Number(row.areaKitchen) : undefined,
    areaGround: row.areaGround != null ? Number(row.areaGround) : undefined,
    priceEUR: row.priceEUR != null ? Number(row.priceEUR) : undefined,
    priceRUB: row.priceRUB != null ? Number(row.priceRUB) : undefined,
    isRental: row.terms ? /аренда|аренд/i.test(String(row.terms)) : undefined,
    priceIsPerM2: row.terms ? /аренда|аренд/i.test(String(row.terms)) : undefined,
  };
}

function parseJson<T = any>(value: any): T | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'object') return value as T;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

// ==================== PARSER ====================

const TOWN_TO_REGION: Record<string, string> = {
  'минск': 'Минск',
  'цна': 'Логойский район',
  'цне': 'Логойский район',
  'логойск': 'Логойский район',
  'борисов': 'Минская область',
  'вилейка': 'Минская область',
  'дзержинск': 'Минская область',
  'жодино': 'Минская область',
  'заславль': 'Минская область',
  'клецк': 'Минская область',
  'копыль': 'Минская область',
  'крупки': 'Минская область',
  'любань': 'Минская область',
  'марьина горка': 'Минская область',
  'молодечно': 'Минская область',
  'мядель': 'Минская область',
  'несвиж': 'Минская область',
  'пуховичи': 'Минская область',
  'слуцк': 'Минская область',
  'смолевичи': 'Минская область',
  'солигорск': 'Минская область',
  'старые дороги': 'Минская область',
  'столбцы': 'Минская область',
  'узда': 'Минская область',
  'фаниполь': 'Минская область',
  'червен': 'Минская область',
  'боровляны': 'Минская область',
  'ждановичи': 'Минская область',
  'качино': 'Минская область',
  'колодищи': 'Минская область',
  'копище': 'Минская область',
  'мачулищи': 'Минская область',
  'михановичи': 'Минская область',
  'новоселье': 'Минская область',
  'прилуки': 'Минская область',
  'ратомка': 'Минская область',
  'раубичи': 'Минская область',
  'самохваловичи': 'Минская область',
  'семково': 'Минская область',
  'сеница': 'Минская область',
  'сенница': 'Минская область',
  'слобода': 'Минская область',
  'тарасово': 'Минская область',
  'углы': 'Минская область',
  'плещеницы': 'Минская область',
  'дукора': 'Минская область',
  'смиловичи': 'Минская область',
  'озерцо': 'Минская область',
  'гатово': 'Минская область',
  'брест': 'Брестская область',
  'барановичи': 'Брестская область',
  'берёза': 'Брестская область',
  'береза': 'Брестская область',
  'ганцевичи': 'Брестская область',
  'дрогичин': 'Брестская область',
  'жабинка': 'Брестская область',
  'иваново': 'Брестская область',
  'ивацевичи': 'Брестская область',
  'каменец': 'Брестская область',
  'кобрин': 'Брестская область',
  'лунинец': 'Брестская область',
  'малорита': 'Брестская область',
  'пинск': 'Брестская область',
  'пружаны': 'Брестская область',
  'столин': 'Брестская область',
  'витебск': 'Витебская область',
  'бешенковичи': 'Витебская область',
  'браслав': 'Витебская область',
  'верхнедвинск': 'Витебская область',
  'глубокое': 'Витебская область',
  'городок': 'Витебская область',
  'докшицы': 'Витебская область',
  'дубровно': 'Витебская область',
  'лепель': 'Витебская область',
  'миоры': 'Витебская область',
  'новополоцк': 'Витебская область',
  'орша': 'Витебская область',
  'полоцк': 'Витебская область',
  'поставы': 'Витебская область',
  'россияны': 'Витебская область',
  'сеннно': 'Витебская область',
  'толочин': 'Витебская область',
  'ушачи': 'Витебская область',
  'чашники': 'Витебская область',
  'шарковщина': 'Витебская область',
  'шумилино': 'Витебская область',
  'гомель': 'Гомельская область',
  'брагин': 'Гомельская область',
  'буда-кошелево': 'Гомельская область',
  'ветка': 'Гомельская область',
  'добруш': 'Гомельская область',
  'ельск': 'Гомельская область',
  'жлобин': 'Гомельская область',
  'житковичи': 'Гомельская область',
  'калинковичи': 'Гомельская область',
  'корма': 'Гомельская область',
  'лельчицы': 'Гомельская область',
  'лоев': 'Гомельская область',
  'мозырь': 'Гомельская область',
  'наровля': 'Гомельская область',
  'октябрьский': 'Гомельская область',
  'петриков': 'Гомельская область',
  'речица': 'Гомельская область',
  'рогачёв': 'Гомельская область',
  'рогачев': 'Гомельская область',
  'светлогорск': 'Гомельская область',
  'хвойники': 'Гомельская область',
  'чечерск': 'Гомельская область',
  'гродно': 'Гродненская область',
  'берестовица': 'Гродненская область',
  'волковыск': 'Гродненская область',
  'вороново': 'Гродненская область',
  'дятлово': 'Гродненская область',
  'ивье': 'Гродненская область',
  'кореличи': 'Гродненская область',
  'лида': 'Гродненская область',
  'мосты': 'Гродненская область',
  'новогрудок': 'Гродненская область',
  'островец': 'Гродненская область',
  'ошмяны': 'Гродненская область',
  'свислочь': 'Гродненская область',
  'скидель': 'Гродненская область',
  'слоним': 'Гродненская область',
  'сморгонь': 'Гродненская область',
  'щучин': 'Гродненская область',
  'могилёв': 'Могилёвская область',
  'могилев': 'Могилёвская область',
  'белыничи': 'Могилёвская область',
  'бобруйск': 'Могилёвская область',
  'быхов': 'Могилёвская область',
  'глуск': 'Могилёвская область',
  'горки': 'Могилёвская область',
  'дрибин': 'Могилёвская область',
  'кировск': 'Могилёвская область',
  'климовичи': 'Могилёвская область',
  'кличев': 'Могилёвская область',
  'костюковичи': 'Могилёвская область',
  'краснополье': 'Могилёвская область',
  'кричев': 'Могилёвская область',
  'круглое': 'Могилёвская область',
  'мстиславль': 'Могилёвская область',
  'осиповичи': 'Могилёвская область',
  'славгород': 'Могилёвская область',
  'чаусы': 'Могилёвская область',
  'чериков': 'Могилёвская область',
  'шклов': 'Могилёвская область',
};

function resolveRegion(town: string): string {
  if (!town) return '';
  const key = town.toLowerCase().trim();
  return TOWN_TO_REGION[key] || '';
}

const MINSK_SUBURBS = [
  'раубичи', 'колодищи', 'ратомка', 'сенница', 'тарасово', 'заславль',
  'дроздово', 'боровляны', 'ждановичи', 'мачулищи', 'слобода', 'копище',
  'аннополь', 'пережир', 'корзуны', 'верх-озеро', 'турьяково', 'оконо',
  'касынь', 'русаковичи', 'головенчицы', 'паперня', 'кугони', 'озерцы',
  'пралеска', 'пролеска', 'заранак', 'зенитчик', 'смолевичи', 'фаниполь',
  'гатово', 'михановичи', 'смиловичи', 'дукора', 'озерцо', 'самохваловичи',
  'сеница', 'прилуки', 'новоселье',
];

interface ParsedProperty {
  id: string;
  title: string;
  type: 'apartment' | 'commercial' | 'house' | 'plot';
  district: string;
  metro: string;
  address: string;
  city: string;
  street: string;
  houseNumber: string;
  slug: string;
  source: string;
  sourceType: string;
  priceBYN: number;
  priceUSD: number;
  priceEUR?: number;
  priceRUB?: number;
  rooms?: number;
  area: number;
  areaLiving?: number;
  areaKitchen?: number;
  areaGround?: number;
  floor?: number;
  totalFloors?: number;
  photo: string;
  photos: string[];
  description: string;
  status: string;
  features: string[];
  priceHistory: { date: string; priceBYN: number }[];
  agentName: string;
  agentPhone: string;
  lat?: number;
  lng?: number;
  objectType?: string;
  terms?: string;
  townType?: string;
  stateDistrict?: string;
  stateRegion?: string;
  townDistrict?: string;
  addressFull?: string;
  metroLine?: string;
  metroTime?: string;
}

function detectTypeFromObjectType(
  objectType: string,
  rooms: number | undefined
): 'apartment' | 'commercial' | 'house' | 'plot' {
  const ot = (objectType || '').toLowerCase().trim();

  if (!ot) {
    if (rooms && rooms > 0) return 'apartment';
    return 'commercial';
  }

  if (
    ot.includes('дом') ||
    ot.includes('коттедж') ||
    ot.includes('дача') ||
    ot.includes('таунхаус') ||
    ot.includes('резиденц')
  ) {
    return 'house';
  }

  if (ot.includes('участок') || ot.includes('земл')) {
    return 'plot';
  }

  if (ot === 'квартира') {
    return 'apartment';
  }

  return 'commercial';
}

function parseRealtFeed(xmlText: string): { properties: ParsedProperty[] } {
  const properties: ParsedProperty[] = [];

  const rxRecord = /<record unid="([^"]+)">([\s\S]*?)<\/record>/g;
  let match;

  while ((match = rxRecord.exec(xmlText)) !== null) {
    const unid = match[1];
    const recText = match[2];

    const titleMatch = recText.match(/<title>([\s\S]*?)<\/title>/);
    const title = (titleMatch ? titleMatch[1] : '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');

    const descMatch = recText.match(/<description>([\s\S]*?)<\/description>/);
    const desc = descMatch ? descMatch[1] : '';

    const rooms = parseInt(recText.match(/<rooms>(\d+)<\/rooms>/)?.[1] || '0', 10) || undefined;

    const objectTypeRaw = (recText.match(/<object_type>([\s\S]*?)<\/object_type>/)?.[1] || '').trim();
    const type = detectTypeFromObjectType(objectTypeRaw, rooms);

    const lName = (recText.match(/<responsible_last_name>([\s\S]*?)<\/responsible_last_name>/)?.[1] || '').trim();
    const fName = (recText.match(/<responsible_first_name>([\s\S]*?)<\/responsible_first_name>/)?.[1] || '').trim();
    const agentName = [fName, lName].filter(Boolean).join(' ').trim();
    const agentPhone = (recText.match(/<x_phones>([\s\S]*?)<\/x_phones>/)?.[1] || '').trim();

    let area = 0;
    const areaTotalMatch = recText.match(/<area_total>([\d.,]+)<\/area_total>/);
    const areaMinMatch = recText.match(/<area_min>([\d.,]+)<\/area_min>/);
    const areaMaxMatch = recText.match(/<area_max>([\d.,]+)<\/area_max>/);
    const xAreaMatch = recText.match(/<x_area>([\d.,]+)/);

    if (areaTotalMatch) area = parseFloat(areaTotalMatch[1].replace(',', '.')) || 0;
    else if (areaMinMatch) area = parseFloat(areaMinMatch[1].replace(',', '.')) || 0;
    else if (areaMaxMatch) area = parseFloat(areaMaxMatch[1].replace(',', '.')) || 0;
    else if (xAreaMatch) area = parseFloat(xAreaMatch[1].replace(',', '.')) || 0;

    const areaLivingRaw = recText.match(/<area_living>([\d.,]+)<\/area_living>/)?.[1];
    const areaKitchenRaw = recText.match(/<area_kitchen>([\d.,]+)<\/area_kitchen>/)?.[1];
    const areaGroundRaw = recText.match(/<area_ground>([\d.,]+)<\/area_ground>/)?.[1];

    const areaLiving = areaLivingRaw ? parseFloat(areaLivingRaw.replace(',', '.')) || 0 : undefined;
    const areaKitchen = areaKitchenRaw ? parseFloat(areaKitchenRaw.replace(',', '.')) || 0 : undefined;
    const areaGround = areaGroundRaw ? parseFloat(areaGroundRaw.replace(',', '.')) || 0 : undefined;

    const priceMatch = recText.match(/<price\s([^>]*)>([\s\S]*?)<\/price>/);
    let priceBYN = 0;
    let priceUSD = 0;
    let priceEUR = 0;
    let priceRUB = 0;
    if (priceMatch) {
      const bynAttr = priceMatch[1].match(/byn="([^"]+)"/);
      const usdAttr = priceMatch[1].match(/usd="([^"]+)"/);
      const eurAttr = priceMatch[1].match(/eur="([^"]+)"/);
      const rubAttr = priceMatch[1].match(/rub="([^"]+)"/);
      if (bynAttr) priceBYN = parseFloat(bynAttr[1].replace(/[^\d.]/g, '')) || 0;
      if (usdAttr) priceUSD = parseFloat(usdAttr[1].replace(/[^\d.]/g, '')) || 0;
      if (eurAttr) priceEUR = parseFloat(eurAttr[1].replace(/[^\d.]/g, '')) || 0;
      if (rubAttr) priceRUB = parseFloat(rubAttr[1].replace(/[^\d.]/g, '')) || 0;
    }

    let isRental = false;
    let pricePerM2Byn = 0;
    let pricePerM2Usd = 0;

    if (priceBYN === 0) {
      const pricePerM2Match = recText.match(/<price_per_m2\s([^>]*)>([\s\S]*?)<\/price_per_m2>/);
      if (pricePerM2Match) {
        const bynAttr = pricePerM2Match[1].match(/byn="([^"]+)"/);
        const usdAttr = pricePerM2Match[1].match(/usd="([^"]+)"/);
        pricePerM2Byn = bynAttr ? parseFloat(bynAttr[1].replace(/[^\d.]/g, '')) || 0 : 0;
        pricePerM2Usd = usdAttr ? parseFloat(usdAttr[1].replace(/[^\d.]/g, '')) || 0 : 0;

        if (pricePerM2Byn > 0 && area > 0) {
          priceBYN = Math.round(pricePerM2Byn * area);
          priceUSD = Math.round(pricePerM2Usd * area);
          isRental = true;
        }
      }
    }

    if (priceBYN === 0) {
      const priceMinMatch = recText.match(/<price_min\s([^>]*)>([\s\S]*?)<\/price_min>/);
      const priceMaxMatch = recText.match(/<price_max\s([^>]*)>([\s\S]*?)<\/price_max>/);
      const minByn = priceMinMatch?.[1].match(/byn="([^"]+)"/)?.[1];
      const maxByn = priceMaxMatch?.[1].match(/byn="([^"]+)"/)?.[1];
      const minUsd = priceMinMatch?.[1].match(/usd="([^"]+)"/)?.[1];
      const maxUsd = priceMaxMatch?.[1].match(/usd="([^"]+)"/)?.[1];

      const minBynVal = minByn ? parseFloat(minByn.replace(/[^\d.]/g, '')) || 0 : 0;
      const maxBynVal = maxByn ? parseFloat(maxByn.replace(/[^\d.]/g, '')) || 0 : 0;
      const minUsdVal = minUsd ? parseFloat(minUsd.replace(/[^\d.]/g, '')) || 0 : 0;
      const maxUsdVal = maxUsd ? parseFloat(maxUsd.replace(/[^\d.]/g, '')) || 0 : 0;

      if (minBynVal > 0) {
        priceBYN = minBynVal;
        priceUSD = minUsdVal;
      } else if (maxBynVal > 0) {
        priceBYN = maxBynVal;
        priceUSD = maxUsdVal;
      }
    }

    const rawStreet = (recText.match(/<street_name>([\s\S]*?)<\/street_name>/)?.[1] || '').trim();
    const rawBld = (recText.match(/<house_number>([\s\S]*?)<\/house_number>/)?.[1] || '').trim();
    const rawTown = (recText.match(/<town_name>([\s\S]*?)<\/town_name>/)?.[1] || '').trim();
    const rawTownType = (recText.match(/<town_type>([\s\S]*?)<\/town_type>/)?.[1] || '').trim();
    const rawStateDistrict = (recText.match(/<state_district_name>([\s\S]*?)<\/state_district_name>/)?.[1] || '').trim();
    const rawTownDistrict = (recText.match(/<town_district_name>([\s\S]*?)<\/town_district_name>/)?.[1] || '').trim();
    const rawAddressFull = (recText.match(/<x_address>([\s\S]*?)<\/x_address>/)?.[1] || '').trim();
    const rawStateRegionId = (recText.match(/<state_region_id>([\s\S]*?)<\/state_region_id>/)?.[1] || '').trim();

    const REGION_BY_ID: Record<string, string> = {
      '1': 'Брестская',
      '2': 'Витебская',
      '3': 'Гомельская',
      '4': 'Гродненская',
      '5': 'Минская',
      '6': 'Могилёвская',
      '7': 'Минск',
    };
    const stateRegion = rawStateRegionId ? REGION_BY_ID[rawStateRegionId] || '' : '';

    const metroMatch = recText.match(/<metro_station_name>([\s\S]*?)<\/metro_station_name>/)?.[1] || '';
    const metroLine = recText.match(/<metro_line_id>([\s\S]*?)<\/metro_line_id>/)?.[1] || '';
    const metroTimeRaw = recText.match(/<metro_time>([\s\S]*?)<\/metro_time>/)?.[1] || '';
    const metroTimeType = recText.match(/<metro_time_type>([\s\S]*?)<\/metro_time_type>/)?.[1] || '';
    const metroTime = metroTimeRaw ? `${metroTimeRaw} ${metroTimeType}`.trim() : '';

    const floor = parseInt(recText.match(/<storey>(\d+)<\/storey>/)?.[1] || '0', 10) || undefined;
    const totalFloors = parseInt(recText.match(/<storeys>(\d+)<\/storeys>/)?.[1] || '0', 10) || undefined;

    const positionX = parseFloat(recText.match(/<position_x>([\d.-]+)<\/position_x>/)?.[1] || '0') || undefined;
    const positionY = parseFloat(recText.match(/<position_y>([\d.-]+)<\/position_y>/)?.[1] || '0') || undefined;

    const termsRaw = (recText.match(/<terms>([\s\S]*?)<\/terms>/)?.[1] || '').trim();

    const city = rawTown || '';

    let district = resolveRegion(city);
    if (!district && MINSK_SUBURBS.some((s) => city.toLowerCase().includes(s))) {
      district = 'Минская область';
    }

    const townPrefix = rawTownType ? `${rawTownType}. ` : 'г. ';
    const addressParts = [
      city ? `${townPrefix}${city}` : '',
      rawStreet,
      rawBld ? `д. ${rawBld}` : '',
    ].filter(Boolean);

    const address = rawAddressFull || addressParts.join(', ') || 'Адрес не указан';

    const slug =
      generateFeedPropertySlug({ type, rooms, title, town: city, street: rawStreet, house: rawBld }) ||
      `prop-${unid}`;

    const photos: string[] = [];
    const rxPhoto = /<photo picture="([^"]+)"/g;
    let pm;
    while ((pm = rxPhoto.exec(recText)) !== null) {
      if (pm[1] && !photos.includes(pm[1])) photos.push(pm[1]);
    }
    if (!photos.length)
      photos.push('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80');

    const features: string[] = [
      rooms && `${rooms}-комн.`,
      area && `${area} м²`,
      metroMatch && `ст.м. ${metroMatch}`,
    ].filter(Boolean) as string[];

    if (isRental) features.push('Аренда');
    if (isRental && pricePerM2Byn > 0) features.push(`${pricePerM2Byn} BYN/м² в месяц`);

    properties.push({
      id: unid,
      title,
      type,
      district,
      metro: metroMatch,
      address,
      city,
      street: rawStreet,
      houseNumber: rawBld,
      slug,
      source: 'realt',
      sourceType: 'realt',
      priceBYN,
      priceUSD,
      priceEUR: priceEUR || undefined,
      priceRUB: priceRUB || undefined,
      rooms,
      area,
      areaLiving,
      areaKitchen,
      areaGround,
      floor,
      totalFloors,
      photo: photos[0],
      photos,
      description: cleanHtmlDescription(desc) || title,
      status: 'active',
      features,
      priceHistory: [{ date: new Date().toISOString().split('T')[0], priceBYN }],
      agentName,
      agentPhone,
      lat: positionY,
      lng: positionX,
      objectType: objectTypeRaw || undefined,
      terms: termsRaw || undefined,
      townType: rawTownType || undefined,
      stateDistrict: rawStateDistrict || undefined,
      stateRegion: stateRegion || undefined,
      townDistrict: rawTownDistrict || undefined,
      addressFull: rawAddressFull || undefined,
      metroLine: metroLine || undefined,
      metroTime: metroTime || undefined,
    });
  }

  return { properties };
}

function cleanHtmlDescription(raw: string): string {
  if (!raw) return '';

  let text = raw;

  text = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…')
    .replace(/&amp;/g, '&');

  text = text.replace(/<[^>]*>/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

function transliterateRussianToSlug(text: string): string {
  if (!text) return '';
  const rusToLatMap: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
    з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
    п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
    ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu',
    я: 'ya',
  };

  return text
    .toLowerCase()
    .trim()
    .replace(/цна/g, 'cna')
    .replace(/цне/g, 'cna')
    .split('')
    .map((char) => rusToLatMap[char] || char)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function cleanTownForSlug(t: string): string {
  if (!t) return '';
  const clean = t
    .trim()
    .replace(/^(г\.?п?|д\.?|пос\.?|п\.?|аг\.?|деревня|город|поселок|агрогородок|с\/т|ст\.?)\s+/i, '')
    .replace(/\s+(город|деревня|поселок|район|р-н)$/i, '')
    .trim();
  if (clean.toLowerCase() === 'цна' || clean.toLowerCase() === 'цне') return 'cna';
  return transliterateRussianToSlug(clean);
}

function cleanStreetForSlug(s: string): string {
  if (!s) return '';
  const clean = s
    .trim()
    .replace(
      /^(ул\.?|улица|просп\.?|проспект|пр-?т\.?|пер\.?|переулок|тракт|бульвар|б-р|наб\.?|набережная|проезд|шоссе)\s+/i,
      ''
    )
    .replace(
      /\s+(ул\.?|улица|просп\.?|проспект|пр-?т\.?|пер\.?|переулок|тракт|бульвар|б-р|наб\.?|набережная|проезд|шоссе)$/i,
      ''
    )
    .trim();
  return transliterateRussianToSlug(clean);
}

function generateFeedPropertySlug(opts: any): string {
  let typeSlug = 'kvartira';
  const tLower = (opts.title || '').toLowerCase();
  if (opts.type === 'apartment') typeSlug = opts.rooms && opts.rooms > 0 ? `kvartira-${opts.rooms}k` : 'kvartira';
  else if (opts.type === 'house')
    typeSlug = tLower.includes('коттедж') ? 'kottedzh' : tLower.includes('дача') ? 'dacha' : 'dom';
  else if (opts.type === 'commercial')
    typeSlug = tLower.includes('офис') ? 'ofis' : tLower.includes('склад') ? 'sklad' : 'pomeschenie';
  else if (opts.type === 'plot') typeSlug = 'uchastok';

  return [
    typeSlug,
    cleanTownForSlug(opts.town),
    cleanStreetForSlug(opts.street),
    opts.house && transliterateRussianToSlug(opts.house),
  ]
    .filter(Boolean)
    .join('-');
}