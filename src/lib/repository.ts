import { isDbMockMode, query, queryOne } from './db';
import { getMockStore } from './mockStore';
import { sanitizeAgentForClient } from './sanitize';
import type { Agent, Property, Review, Article, Lead, Buyer, ColdSeller, CRMTask } from '../types';

/**
 * Декодирует HTML-entities: &middot; → ·, &nbsp; → пробел и т.д.
 * Нужно, потому что Realt.by отдаёт описание с HTML-кодами.
 *
 * ⚠️ ВАЖНО: НЕ схлопывает переносы строк (\n, \r).
 * Заменяет только пробелы и табы ([ \t]+ → ' '),
 * чтобы сохранить markdown-разметку для ReactMarkdown.
 */
function decodeHtmlEntities(text: string | null | undefined): string | undefined {
  if (!text) return undefined;
  return text
    .replace(/&middot;/g, '·')
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&times;/g, '×')
    .replace(/&divide;/g, '÷')
    .replace(/&copy;/g, '©')
    .replace(/&reg;/g, '®')
    .replace(/&trade;/g, '™')
    .replace(/&euro;/g, '€')
    .replace(/&hellip;/g, '…')
    .replace(/&bull;/g, '•')
    .replace(/&deg;/g, '°')
    .replace(/&plusmn;/g, '±')
    .replace(/[ \t]+/g, ' ');
}

// ==================== AGENTS ====================

export async function getAgents(): Promise<Agent[]> {
  if (isDbMockMode()) {
    const store = getMockStore();
    return store.agents
      .filter((a) => (a.status || 'active') === 'active' && !a.isDismissed)
      .map((a) => ({
        ...sanitizeAgentForClient(a),
        objectsCount: store.properties.filter(
          (p) => p.assignedAgentId === a.id && (p.status || 'active') === 'active'
        ).length,
      }));
  }

  const rows = await query(
    `SELECT a.*,
       (SELECT COUNT(*) FROM properties p
        WHERE p.assignedAgentId = a.id AND p.status = 'active') AS objectsCount
     FROM agents a
     WHERE a.status = 'active' AND a.isDismissed = 0
     ORDER BY a.isAdmin DESC, a.dealsCount DESC, a.name ASC`
  );
  return rows.map(rowToAgent);
}

export async function getAllAgents(): Promise<Agent[]> {
  if (isDbMockMode()) {
    const store = getMockStore();
    return store.agents.map((a) => ({
      ...sanitizeAgentForClient(a),
      objectsCount: store.properties.filter(
        (p) => p.assignedAgentId === a.id && (p.status || 'active') === 'active'
      ).length,
    }));
  }

  const rows = await query(
    `SELECT a.*,
       (SELECT COUNT(*) FROM properties p
        WHERE p.assignedAgentId = a.id AND p.status = 'active') AS objectsCount
     FROM agents a
     ORDER BY a.name ASC`
  );
  return rows.map(rowToAgent);
}

export async function getAgentById(id: string): Promise<Agent | null> {
  if (isDbMockMode()) {
    const store = getMockStore();
    const found = store.agents.find((a) => a.id === id);
    if (!found) return null;
    return {
      ...sanitizeAgentForClient(found),
      objectsCount: store.properties.filter(
        (p) => p.assignedAgentId === found.id && (p.status || 'active') === 'active'
      ).length,
    };
  }

  const row = await queryOne(
    `SELECT a.*,
       (SELECT COUNT(*) FROM properties p
        WHERE p.assignedAgentId = a.id AND p.status = 'active') AS objectsCount
     FROM agents a
     WHERE a.id = ? LIMIT 1`,
    [id]
  );
  return row ? rowToAgent(row) : null;
}

// ==================== ARTICLES ====================

export async function getArticles(): Promise<Article[]> {
  if (isDbMockMode()) {
    return getMockStore().articles
      .filter((a) => a.published !== false)
      .map(({ published: _p, ...rest }) => rest);
  }

  const rows = await query(
    `SELECT * FROM articles WHERE published = 1 ORDER BY date DESC`
  );
  return rows.map(rowToArticle);
}

export async function getAllArticles(): Promise<Article[]> {
  if (isDbMockMode()) {
    return getMockStore().articles.map(({ published: _p, ...rest }) => rest);
  }
  const rows = await query(`SELECT * FROM articles ORDER BY date DESC`);
  return rows.map(rowToArticle);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (isDbMockMode()) {
    const found = getMockStore().articles.find(
      (a) => a.slug === slug || a.id === slug
    );
    if (!found) return null;
    const { published: _p, ...rest } = found;
    return rest;
  }

  const row = await queryOne(`SELECT * FROM articles WHERE slug = ? OR id = ? LIMIT 1`, [slug, slug]);
  return row ? rowToArticle(row) : null;
}

// ==================== REVIEWS ====================

export async function getReviews(): Promise<Review[]> {
  if (isDbMockMode()) {
    return getMockStore().reviews
      .filter((r) => r.published !== false)
      .map(({ published: _p, ...rest }) => rest);
  }

  const rows = await query(
    `SELECT * FROM reviews WHERE published = 1 ORDER BY createdAt DESC`
  );
  return rows.map((r) => ({
    id: r.id,
    author: r.author,
    role: r.role,
    rating: r.rating,
    text: decodeHtmlEntities(r.text) || r.text,
    date: r.date,
    avatar: r.avatar ?? undefined,
  }));
}

// ==================== PROPERTIES ====================

export async function getProperties(filters?: {
  type?: string;
  status?: string;
  agentId?: string;
  limit?: number;
}): Promise<Property[]> {
  if (isDbMockMode()) {
    let list = [...getMockStore().properties];
    if (filters?.type) list = list.filter((p) => p.type === filters.type);
    if (filters?.status) list = list.filter((p) => (p.status || 'active') === filters.status);
    if (filters?.agentId) list = list.filter((p) => p.assignedAgentId === filters.agentId);
    if (filters?.limit) list = list.slice(0, Number(filters.limit));
    return list;
  }

  const where: string[] = [];
  const params: any[] = [];

  if (filters?.type) {
    where.push('type = ?');
    params.push(filters.type);
  }
  if (filters?.status) {
    where.push('status = ?');
    params.push(filters.status);
  }
  if (filters?.agentId) {
    where.push('assignedAgentId = ?');
    params.push(filters.agentId);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const limitSql = filters?.limit ? `LIMIT ${Number(filters.limit)}` : '';

  const rows = await query(
    `SELECT * FROM properties ${whereSql} ORDER BY createdAt DESC ${limitSql}`,
    params
  );
  return rows.map(rowToProperty);
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  if (isDbMockMode()) {
    return (
      getMockStore().properties.find(
        (p) => p.slug === slug || p.id === slug
      ) || null
    );
  }

  const row = await queryOne(
    `SELECT * FROM properties WHERE slug = ? OR externalId = ? OR id = ? LIMIT 1`,
    [slug, slug, slug]
  );
  return row ? rowToProperty(row) : null;
}

export async function getAllPropertySlugs(): Promise<string[]> {
  if (isDbMockMode()) {
    return getMockStore().properties
      .filter((p) => (p.status || 'active') === 'active' && p.isPublished !== false && !p.isClosedBase && p.slug)
      .map((p) => p.slug as string);
  }

  const rows = await query(
    `SELECT slug FROM properties WHERE status = 'active' AND isPublished = 1 AND (isClosedBase = 0 OR isClosedBase IS NULL) AND slug IS NOT NULL`
  );
  return rows.map((r) => r.slug).filter((s): s is string => Boolean(s));
}

// ==================== LEADS ====================

export async function getLeads(filters?: { stage?: string; agentId?: string }): Promise<Lead[]> {
  if (isDbMockMode()) {
    let list = [...getMockStore().leads];
    if (filters?.stage) list = list.filter((l) => l.stage === filters.stage);
    if (filters?.agentId) list = list.filter((l) => l.assignedAgentId === filters.agentId);
    return list;
  }

  const where: string[] = [];
  const params: any[] = [];

  if (filters?.stage) {
    where.push('stage = ?');
    params.push(filters.stage);
  }
  if (filters?.agentId) {
    where.push('assignedAgentId = ?');
    params.push(filters.agentId);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const rows = await query(
    `SELECT * FROM leads ${whereSql} ORDER BY createdAt DESC`,
    params
  );
  return rows.map(rowToLead);
}

// ==================== BUYERS ====================

export async function getBuyers(filters?: { agentId?: string; status?: string }): Promise<Buyer[]> {
  if (isDbMockMode()) {
    let list = [...getMockStore().buyers];
    if (filters?.agentId) list = list.filter((b) => b.assignedAgentId === filters.agentId);
    if (filters?.status) list = list.filter((b) => b.status === filters.status);
    return list;
  }

  const where: string[] = [];
  const params: any[] = [];

  if (filters?.agentId) {
    where.push('assignedAgentId = ?');
    params.push(filters.agentId);
  }
  if (filters?.status) {
    where.push('status = ?');
    params.push(filters.status);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const rows = await query(
    `SELECT * FROM buyers ${whereSql} ORDER BY createdAt DESC`,
    params
  );
  return rows.map(rowToBuyer);
}

// ==================== SELLERS ====================

export async function getSellers(filters?: { agentId?: string; stage?: string }): Promise<ColdSeller[]> {
  if (isDbMockMode()) {
    let list = [...getMockStore().sellers];
    if (filters?.agentId) list = list.filter((s) => s.assignedAgentId === filters.agentId);
    if (filters?.stage) list = list.filter((s) => s.kanbanStage === filters.stage);
    return list;
  }

  const where: string[] = [];
  const params: any[] = [];

  if (filters?.agentId) {
    where.push('assignedAgentId = ?');
    params.push(filters.agentId);
  }
  if (filters?.stage) {
    where.push('kanbanStage = ?');
    params.push(filters.stage);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const rows = await query(
    `SELECT * FROM cold_sellers ${whereSql} ORDER BY createdAt DESC`,
    params
  );
  return rows.map(rowToSeller);
}

// ==================== TASKS ====================

export async function getTasks(agentId?: string): Promise<CRMTask[]> {
  if (isDbMockMode()) {
    let list = [...getMockStore().tasks];
    if (agentId) list = list.filter((t) => t.agentId === agentId);
    return list.sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''));
  }

  const whereSql = agentId ? 'WHERE agentId = ?' : '';
  const params = agentId ? [agentId] : [];

  const rows = await query(
    `SELECT * FROM crm_tasks ${whereSql} ORDER BY deadline ASC`,
    params
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    deadline: r.deadline,
    status: r.status as CRMTask['status'],
    priority: r.priority as CRMTask['priority'],
    clientId: r.clientId ?? undefined,
    clientName: r.clientName ?? undefined,
    clientPhone: r.clientPhone ?? undefined,
    clientAddress: r.clientAddress ?? undefined,
    agentId: r.agentId,
    assignedAgentName: r.assignedAgentName ?? undefined,
    actionType: r.actionType ?? undefined,
    createdAt: r.createdAt,
  }));
}

// ==================== MAPPERS ====================

function rowToAgent(row: any): Agent {
  return {
    id: row.id,
    name: row.name,
    photo: row.photo,
    role: row.role,
    experience: row.experience ?? undefined,
    rating: row.rating,
    phone: row.phone,
    specialization: row.specialization as Agent['specialization'],
    dealsCount: row.dealsCount,
    isAdmin: Boolean(row.isAdmin),
    isApproved: Boolean(row.isApproved),
    hasLeadsAccess: Boolean(row.hasLeadsAccess),
    // ⚠️ СТРОКА password УДАЛЕНА, чтобы хэш не уходил в API и клиент
    email: row.email ?? undefined,
    achievements: row.achievements ?? undefined,
    assignedManagerId: row.assignedManagerId ?? undefined,
    assignedManagerName: row.assignedManagerName ?? undefined,
    agencyName: row.agencyName ?? undefined,
    description: decodeHtmlEntities(row.description),
    firstName: row.firstName ?? undefined,
    lastName: row.lastName ?? undefined,
    patronymic: row.patronymic ?? undefined,
    objectsCount: Number(row.objectsCount) || 0,
    userUuid: row.userUuid ?? undefined,
    userId: row.userId ?? undefined,
    contact: row.contact ?? undefined,
    certNo: row.certNo ?? undefined,
    certDate: row.certDate ?? undefined,
    cardNo: row.cardNo ?? undefined,
    status: (row.status as Agent['status']) ?? 'active',
    isDismissed: Boolean(row.isDismissed),
    reviews: typeof row.reviews === 'string' ? JSON.parse(row.reviews) : row.reviews ?? undefined,
  };
}

function rowToArticle(row: any): Article {
  return {
    id: row.id,
    slug: row.slug ?? undefined,
    title: decodeHtmlEntities(row.title) || row.title,
    snippet: decodeHtmlEntities(row.snippet) || row.snippet,
    content: decodeHtmlEntities(row.content) || row.content,
    category: row.category,
    date: row.date,
    photo: row.photo ?? undefined,
    image: row.image ?? undefined,
  };
}

function rowToProperty(row: any): Property {
  return {
    id: row.id,
    title: decodeHtmlEntities(row.title) || row.title,
    type: row.type as Property['type'],
    address: decodeHtmlEntities(row.address) || row.address,
    priceBYN: Number(row.priceBYN),
    priceUSD: Number(row.priceUSD),
    rooms: row.rooms ?? undefined,
    area: Number(row.area),
    floor: row.floor ?? undefined,
    totalFloors: row.totalFloors ?? undefined,
    photo: row.photo,
    image: row.image ?? undefined,
    features: (parseJson<string[]>(row.features) ?? []).map((f) => decodeHtmlEntities(f) || f),
    agentName: row.agentName ?? undefined,
    agentPhone: row.agentPhone ?? undefined,
    agentPhoto: row.agentPhoto ?? undefined,
    assignedAgentId: row.assignedAgentId ?? undefined,
    assignedAgentName: row.assignedAgentName ?? undefined,
    sellerPhone: row.sellerPhone ?? undefined,
    priority: (row.priority as Property['priority']) ?? undefined,
    location: row.location ?? undefined,
    yearBuilt: row.yearBuilt ?? undefined,
    description: decodeHtmlEntities(row.description),
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

    // === НОВЫЕ поля из фида Realt.by ===
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
    isRental: row.terms ? /аренд/i.test(String(row.terms)) : undefined,
    priceIsPerM2: row.terms ? /аренд/i.test(String(row.terms)) : undefined,
  };
}

function rowToLead(row: any): Lead {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    typeOrPrice: row.typeOrPrice,
    formName: row.formName,
    date: row.date,
    status: row.status ?? undefined,
    stage: row.stage ?? undefined,
    source: row.source ?? undefined,
    notes: row.notes ?? undefined,
    lastContactedAt: row.lastContactedAt ?? undefined,
    nextContactDate: row.nextContactDate ?? undefined,
    nextContactTime: row.nextContactTime ?? undefined,
    nextContactTask: row.nextContactTask ?? undefined,
    priority: (row.priority as Lead['priority']) ?? undefined,
    assignedAgentId: row.assignedAgentId ?? undefined,
    assignedAgentName: row.assignedAgentName ?? undefined,
    voiceSummary: row.voiceSummary ?? undefined,
    callIntent: row.callIntent ?? undefined,
    history: parseJson(row.history) ?? undefined,
  };
}

function rowToBuyer(row: any): Buyer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    budgetBYN: Number(row.budgetBYN),
    budgetUSD: row.budgetUSD ? Number(row.budgetUSD) : undefined,
    preferences: row.preferences,
    registeredBy: row.registeredBy,
    assignedAgentId: row.assignedAgentId ?? undefined,
    assignedAgentName: row.assignedAgentName ?? undefined,
    status: row.status,
    dateAdded: row.dateAdded,
    prefType: row.prefType ?? undefined,
    prefRooms: row.prefRooms ?? undefined,
    prefDistrict: row.prefDistrict ?? undefined,
    prefFloor: row.prefFloor ?? undefined,
    floorPreference: row.floorPreference ?? undefined,
    prefCondition: row.prefCondition ?? undefined,
    renovation: row.renovation ?? undefined,
    minArea: row.minArea ?? undefined,
    maxArea: row.maxArea ?? undefined,
    searchCriteria: parseJson(row.searchCriteria) ?? undefined,
    autoMatchingEnabled: Boolean(row.autoMatchingEnabled),
    notifyChannel: row.notifyChannel ?? undefined,
    tags: parseJson(row.tags) ?? undefined,
    isPublicApproved: Boolean(row.isPublicApproved),
    isPublishedOnSite: Boolean(row.isPublishedOnSite),
    crmOnly: Boolean(row.crmOnly),
  };
}

function rowToSeller(row: any): ColdSeller {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    address: row.address,
    propertyType: row.propertyType as ColdSeller['propertyType'],
    askingPriceBYN: Number(row.askingPriceBYN),
    askingPriceUSD: row.askingPriceUSD ? Number(row.askingPriceUSD) : undefined,
    status: row.status,
    kanbanStage: row.kanbanStage ?? undefined,
    assignedAgentName: row.assignedAgentName ?? undefined,
    assignedAgentId: row.assignedAgentId ?? undefined,
    callOperatorName: row.callOperatorName ?? undefined,
    notes: row.notes ?? '',
    dateAdded: row.dateAdded,
    nextContactDate: row.nextContactDate ?? undefined,
    nextContactTime: row.nextContactTime ?? undefined,
    commentsHistory: parseJson(row.commentsHistory) ?? undefined,
    attachments: parseJson(row.attachments) ?? undefined,
    tags: parseJson(row.tags) ?? undefined,
    contractNumber: row.contractNumber ?? undefined,
    contractDate: row.contractDate ?? undefined,
    rooms: row.rooms ?? undefined,
    area: row.area ?? undefined,
    floor: row.floor ?? undefined,
    totalFloors: row.totalFloors ?? undefined,
    publishedPropertyId: row.publishedPropertyId ?? undefined,
  };
}

/**
 * Безопасный JSON.parse для полей из MySQL.
 */
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