export interface Agent {
  id: string;
  name: string;
  photo: string;
  role: string;
  experience?: string;
  rating: number;
  phone: string;
  specialization: 'sale' | 'rent' | 'assessment' | 'commercial' | 'houses' | 'all';
  dealsCount?: number;
  isAdmin?: boolean;
  isApproved?: boolean;
  hasLeadsAccess?: boolean;
  password?: string;
  email?: string;
  achievements?: string;
  assignedManagerId?: string;
  assignedManagerName?: string;
  agencyName?: string;
  description?: string;
  firstName?: string;
  lastName?: string;
  patronymic?: string;
  objectsCount?: number;
  userUuid?: string;
  userId?: string;
  contact?: string;
  certNo?: string;
  certDate?: string;
  cardNo?: string;
  status?: 'active' | 'dismissed';
  isDismissed?: boolean;
  reviews?: { id?: string; author: string; text: string; date?: string; rating?: number }[];
}

export interface AgentKPI {
  agentId: string;
  agentName: string;
  callsCount?: number;
  meetingsCount?: number;
  dealsCount?: number;
  calls?: number;
  meetings?: number;
  deals?: number;
  conversion?: number;
  conversionRate?: number;
  volumeBYN?: number;
  leadsCount?: number;
  revenue?: number;
  listingsCount?: number;
}

export interface Property {
  id: string;
  title: string;
  type: 'apartment' | 'commercial' | 'house' | 'plot';
  address: string;
  priceBYN: number;
  priceUSD: number;
  rooms?: number;
  area: number;
  floor?: number;
  totalFloors?: number;
  photo: string;
  image?: string;
  features: string[];
  agentName?: string;
  agentPhone?: string;
  agentPhoto?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  sellerPhone?: string;
  priority?: 'regular' | 'urgent';
  location?: string;
  yearBuilt?: number;
  description?: string;
  status?: string;
  isPublished?: boolean;
  internalOnly?: boolean;
  crmOnly?: boolean;
  contractStatus?: 'draft' | 'active' | 'sold' | 'terminated' | string;
  contractNumber?: string;
  contractDate?: string;
  sourceUrl?: string;
  isClosedBase?: boolean;
  sourceType?: 'realt' | 'kufar' | 'manual' | 'callcenter' | string;
  source?: string;
  inventoryNo?: string;
  lat?: number;
  lng?: number;
  photos?: string[];
  images?: string[];
  district?: string;
  metro?: string;
  city?: string;
  street?: string;
  houseNumber?: string;
  slug?: string;
  priceHistory?: { date: string; priceBYN: number; changePercent?: number }[];

  // === Дополнительные поля из парсера Realt.by (старые) ===
  terms?: string;
  isRental?: boolean;
  priceIsPerM2?: boolean;
  areaGround?: number;
  buildingLevels?: number;
  buildingYear?: number;
  ceilingHeight?: number;
  wallMaterial?: string;
  heating?: string;
  electricity?: string;
  water?: string;
  sewer?: string;
  gas?: string;
  roofMaterial?: string;
  balcony?: string;
  houseType?: string;
  areaLiving?: number;
  areaKitchen?: number;

  // === НОВЫЕ поля из фида Realt.by (для точных заголовков и адреса) ===
  /** Тип объекта из фида: "дом" | "квартира под офис" | "склад+офис" | "Офис" | "Торговое помещение" и т.д. */
  objectType?: string;
  /** Тип населённого пункта: "г" (город) | "аг" (агрогородок) | "д" (деревня) */
  townType?: string;
  /** Район области: "Логойский" | "Минский" | "Вилейский" */
  stateDistrict?: string;
  /** Область: "Минская" | "Брестская" | "Гомельская" */
  stateRegion?: string;
  /** Район города: "Партизанский район" | "Октябрьский район" */
  townDistrict?: string;
  /** Готовая строка адреса из фида: "Ванеева ул., 2" */
  addressFull?: string;
  /** Линия метро: "2" */
  metroLine?: string;
  /** Время до метро: "7 минут пешком" */
  metroTime?: string;
  /** Цена в EUR */
  priceEUR?: number;
  /** Цена в RUB */
  priceRUB?: number;
}

export interface Review {
  id: string;
  author: string;
  role: string;
  rating: number;
  text: string;
  date: string;
  avatar?: string;
}

export interface Article {
  id: string;
  slug?: string;
  title: string;
  snippet: string;
  content: string;
  category: 'news' | 'tips' | 'legal' | string;
  date: string;
  photo?: string;
  image?: string;
}

export type PageId =
  | 'home'
  | 'catalog'
  | 'property-detail'
  | 'agent-cabinet'
  | 'services-root'
  | 'services-agentstva'
  | 'prodazha-nedvizhimosti'
  | 'arenda-nedvizhimosti'
  | 'obmen-nedvizhimosti'
  | 'korporativnaya-arenda'
  | 'all-sale-services'
  | 'all-evaluation-services'
  | 'prodazha-kvartiry'
  | 'prodazha-pomescheniya'
  | 'prodazha-doma-dachi'
  | 'prodazha-komnaty-doli'
  | '10-dnej-probnogo-perioda'
  | 'uslugi-arendodatelyu'
  | 'uslugi-arendodatelyu-pomescheniya'
  | 'uslugi-arendatoru'
  | 'uslugi-arendatoru-pomescheniya'
  | 'pokupka-kvartiry'
  | 'pokupka-dlya-arendy'
  | 'ocenka-kvartiry'
  | 'besplatnyj-vyezd-agenta'
  | 'konsultaciya-dogovor-kupli'
  | 'konsultaciya-stoimost-rieltor'
  | 'yuridicheskaya-konsultaciya'
  | 'oformit-sdelku'
  | 'soglasovanie-pereplanirovki'
  | 'effektivnye-instrumenty'
  | 'baza-pokupatelej'
  | 'ob-agentstve'
  | 'vybrat-agenta'
  | 'nasha-komanda'
  | 'rieltor'
  | 'otzyvy-klientov'
  | 'kontrol-kachestva'
  | 'poleznaya-informaciya'
  | 'novosti-nedvizhimosti'
  | 'kontakty'
  | 'seo-landings'
  | 'contract-generator'
  | 'privacy-policy'
  | 'cookies-policy'
  | 'not-found';

export type LeadStage = 'new' | 'contacted' | 'meeting' | 'negotiation' | 'contract' | 'deal' | 'deposit' | 'closed' | 'rejected' | string;

export interface KanbanColumn {
  id: LeadStage | string;
  title: string;
  color: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  typeOrPrice: string;
  formName: string;
  date: string;
  status?: string;
  stage?: LeadStage | string;
  source?: string;
  notes?: string;
  lastContactedAt?: string;
  nextContactDate?: string;
  nextContactTime?: string;
  nextContactTask?: string;
  priority?: 'regular' | 'urgent';
  assignedAgentId?: string;
  assignedAgentName?: string;
  voiceSummary?: string;
  callIntent?: string;
  history?: { id: string; date: string; text: string; author?: string }[];
}

export interface BuyerSearchCriteria {
  propertyType?: 'apartment' | 'house' | 'commercial' | 'plot' | 'all' | string;
  rooms?: number[];
  roomsMin?: number;
  roomsMax?: number;
  minPriceUSD?: number;
  maxPriceUSD?: number;
  priceMinUSD?: number;
  priceMaxUSD?: number;
  minPriceBYN?: number;
  maxPriceBYN?: number;
  priceMinBYN?: number;
  priceMaxBYN?: number;
  minArea?: number;
  maxArea?: number;
  areaMin?: number;
  areaMax?: number;
  districts?: string[];
  district?: string;
  city?: string;
  metro?: string;
  renovation?: string;
  condition?: string;
  floorPreference?: 'any' | 'not_first' | 'not_last' | 'middle' | string;
  hasParking?: boolean;
  hasBalcony?: boolean;
}

export interface Buyer {
  id: string;
  name: string;
  phone: string;
  budgetBYN: number;
  budgetUSD?: number;
  preferences: string;
  registeredBy: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  status: string;
  dateAdded: string;
  prefType?: 'apartment' | 'house' | 'commercial' | 'plot' | 'all';
  prefRooms?: number;
  prefDistrict?: string;
  prefFloor?: 'any' | 'not_first' | 'not_last' | 'middle' | string;
  floorPreference?: 'any' | 'not_first' | 'not_last' | 'middle' | string;
  prefCondition?: string;
  renovation?: string;
  minArea?: number;
  maxArea?: number;
  searchCriteria?: BuyerSearchCriteria;
  autoMatchingEnabled?: boolean;
  notifyChannel?: 'telegram' | 'viber' | 'sms' | 'phone' | 'email' | 'whatsapp' | 'none' | string;
  tags?: string[];
  isPublicApproved?: boolean;
  isPublishedOnSite?: boolean;
  crmOnly?: boolean;
}

export interface SellerStageComment {
  id: string;
  date: string;
  stage: string;
  text: string;
  author: string;
}

export interface SellerFileAttachment {
  id: string;
  name: string;
  url: string;
  size?: string;
  type?: 'contract' | 'photo' | 'doc';
  dateAdded?: string;
  uploadedAt?: string;
}

export interface ColdSeller {
  id: string;
  name: string;
  phone: string;
  address: string;
  propertyType: 'apartment' | 'house' | 'commercial' | 'plot';
  askingPriceBYN: number;
  askingPriceUSD?: number;
  status: 'cold_call' | 'interested' | 'meeting_scheduled' | 'contract_signed' | 'rejected' | 'callback' | 'active' | 'completed' | string;
  kanbanStage?: string;
  assignedAgentName?: string;
  assignedAgentId?: string;
  callOperatorName?: string;
  notes: string;
  dateAdded: string;
  nextContactDate?: string;
  nextContactTime?: string;
  commentsHistory?: SellerStageComment[];
  attachments?: SellerFileAttachment[];
  tags?: string[];
  contractNumber?: string;
  contractDate?: string;
  rooms?: number;
  area?: number;
  floor?: number;
  totalFloors?: number;
  publishedPropertyId?: string;
}

export type Seller = ColdSeller;

export interface CRMTask {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  clientId?: string;
  clientName?: string;
  clientPhone?: string;
  clientAddress?: string;
  agentId: string;
  assignedAgentName?: string;
  actionType?: string;
  createdAt: string;
}

export type InstitutionKey =
  | 'narco'
  | 'psycho'
  | 'psycho_region'
  | 'brti'
  | 'nka'
  | 'notary_inheritance'
  | 'notary_arrest'
  | 'rsc_minsk'
  | 'rsc_shares'
  | 'happy_planet'
  | 'sop'
  | 'consent_psycho_region'
  | 'consent_psycho_city'
  | 'consent_narco_city';

export interface InstitutionalRequest {
  id: string;
  institutionKey: InstitutionKey;
  institutionTitle: string;
  institutionOfficialName: string;
  addressTo: string;
  clientName: string;
  clientBirthDate?: string;
  clientPassport?: string;
  clientAddress?: string;
  objectAddress?: string;
  cadastralNumber?: string;
  requestSubject: string;
  requestDetails: string;
  outNumber: string;
  outDate: string;
  status: 'draft' | 'sent' | 'processing' | 'ready' | 'archived';
  agentId: string;
  agentName: string;
  directorName: string;
  licenseNumber: string;
  responseDocumentNote?: string;
  createdAt: string;
  owners?: { fullName: string; birthDate: string; registration: string }[];
}

export interface KufarChat {
  id: string;
  kufar_ad_id?: string | null;
  ad_title?: string | null;
  client_name: string;
  client_phone?: string | null;
  last_message?: string | null;
  last_message_date?: string | null;
  status: 'new' | 'active' | 'closed' | string;
  created_at?: string;
}

export interface KufarMessage {
  id: string;
  chat_id: string;
  sender: 'client' | 'agent';
  text: string;
  created_at: string;
}