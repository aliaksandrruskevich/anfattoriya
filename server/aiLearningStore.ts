import fs from 'fs';
import path from 'path';

export interface LearningItem {
  id: string;
  category: 'market_insight' | 'legal_nuance' | 'pricing_update' | 'user_feedback' | 'custom_rule';
  title: string;
  content: string;
  source: 'user_feedback' | 'expert_correction' | 'auto_learned' | 'admin_rule';
  rating?: 'positive' | 'negative';
  createdAt: string;
  appliedCount: number;
  isActive: boolean;
}

export interface ConversationFeedback {
  id: string;
  messageId: string;
  query: string;
  botReply: string;
  rating: 'like' | 'dislike';
  comment?: string;
  suggestedCorrection?: string;
  timestamp: string;
}

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const LEARNINGS_FILE = path.join(DATA_DIR, 'ai_learnings.json');
const FEEDBACKS_FILE = path.join(DATA_DIR, 'ai_feedbacks.json');

// Initial seed memory base for Belarusian real estate so it starts smart and human
const INITIAL_LEARNINGS: LearningItem[] = [
  {
    id: 'learn-1',
    category: 'market_insight',
    title: 'Реальный торг на вторичном рынке Минска',
    content: 'На вторичке в Минске реальный дисконт при торге обычно составляет 2-4% от цены в объявлении. Если объект висит более 45 дней без снижения цены, покупатели часто предлагают дисконт до 7-8%.',
    source: 'expert_correction',
    createdAt: new Date().toISOString(),
    appliedCount: 14,
    isActive: true
  },
  {
    id: 'learn-2',
    category: 'legal_nuance',
    title: 'Отказ от приватизации и архивные жильцы',
    content: 'Особое внимание нужно уделять гражданам, отказавшимся от приватизации в 1990-2010х годах: они сохраняют бессрочное право пожизненного проживания, даже если собственник сменится. Это проверяется через расширенную выписку из поквартирной карточки ЖЭУ/РСЦ.',
    source: 'expert_correction',
    createdAt: new Date().toISOString(),
    appliedCount: 22,
    isActive: true
  },
  {
    id: 'learn-3',
    category: 'pricing_update',
    title: 'Специфика Минск Мира (Minsk World)',
    content: 'В Минск Мире квартиры без отделки (черновые студии и евродвушки) продаются по $1400–$1650/м², а с качественным современным готовым ремонтом и мебелью у метро — от $2200 до $2900/м². Парковочное место в паркинге стоит от $6 000 до $12 000.',
    source: 'expert_correction',
    createdAt: new Date().toISOString(),
    appliedCount: 31,
    isActive: true
  },
  {
    id: 'learn-4',
    category: 'legal_nuance',
    title: 'Военкомат и выписка призывников',
    content: 'При выписке мужчин призывного возраста (до 27 лет) из продаваемой квартиры требуется обязательное снятие с воинского учета в РВК, иначе РСЦ откажет в снятии с регистрационного учета.',
    source: 'user_feedback',
    createdAt: new Date().toISOString(),
    appliedCount: 9,
    isActive: true
  },
  {
    id: 'learn-5',
    category: 'custom_rule',
    title: 'Человеческий тон и отсутствие шаблонных фраз',
    content: 'Общайся живо, сопереживай клиенту, не используй сухой канцелярский язык ("в соответствии со статьей"). Объясняй логику простыми словами и приводи жизненные примеры из практики Минска.',
    source: 'admin_rule',
    createdAt: new Date().toISOString(),
    appliedCount: 45,
    isActive: true
  }
];

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LEARNINGS_FILE)) {
    fs.writeFileSync(LEARNINGS_FILE, JSON.stringify(INITIAL_LEARNINGS, null, 2), 'utf8');
  }
  if (!fs.existsSync(FEEDBACKS_FILE)) {
    fs.writeFileSync(FEEDBACKS_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

export function getLearnings(): LearningItem[] {
  try {
    ensureDataFiles();
    const raw = fs.readFileSync(LEARNINGS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading learnings:', e);
    return INITIAL_LEARNINGS;
  }
}

export function addLearning(item: Omit<LearningItem, 'id' | 'createdAt' | 'appliedCount' | 'isActive'>): LearningItem {
  ensureDataFiles();
  const learnings = getLearnings();
  const newItem: LearningItem = {
    ...item,
    id: `learn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    appliedCount: 0,
    isActive: true
  };
  learnings.unshift(newItem);
  fs.writeFileSync(LEARNINGS_FILE, JSON.stringify(learnings, null, 2), 'utf8');
  return newItem;
}

export function deleteLearning(id: string): boolean {
  ensureDataFiles();
  const learnings = getLearnings();
  const filtered = learnings.filter(l => l.id !== id);
  if (filtered.length !== learnings.length) {
    fs.writeFileSync(LEARNINGS_FILE, JSON.stringify(filtered, null, 2), 'utf8');
    return true;
  }
  return false;
}

export function getFeedbacks(): ConversationFeedback[] {
  try {
    ensureDataFiles();
    const raw = fs.readFileSync(FEEDBACKS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading feedbacks:', e);
    return [];
  }
}

export function addFeedback(feedback: Omit<ConversationFeedback, 'id' | 'timestamp'>): ConversationFeedback {
  ensureDataFiles();
  const feedbacks = getFeedbacks();
  const newFeedback: ConversationFeedback = {
    ...feedback,
    id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString()
  };
  feedbacks.unshift(newFeedback);
  fs.writeFileSync(FEEDBACKS_FILE, JSON.stringify(feedbacks.slice(0, 200), null, 2), 'utf8');

  // If user provided a correction or note, automatically convert it into a new learned rule!
  if (feedback.suggestedCorrection && feedback.suggestedCorrection.trim().length > 10) {
    addLearning({
      category: 'user_feedback',
      title: `Инсайт из отзыва: "${feedback.query.slice(0, 45)}..."`,
      content: feedback.suggestedCorrection.trim(),
      source: 'user_feedback',
      rating: feedback.rating === 'like' ? 'positive' : 'negative'
    });
  } else if (feedback.comment && feedback.comment.trim().length > 15 && feedback.rating === 'like') {
    addLearning({
      category: 'market_insight',
      title: `Полезный опыт по запросу: "${feedback.query.slice(0, 45)}..."`,
      content: feedback.comment.trim(),
      source: 'user_feedback',
      rating: 'positive'
    });
  }

  return newFeedback;
}

/**
 * Returns formatted text block of active learnings for dynamic injection into Gemini system prompt
 */
export function getFormattedLearningsForPrompt(): string {
  const list = getLearnings().filter(l => l.isActive).slice(0, 15);
  if (list.length === 0) return '';

  return `
=== БАЗА САМООБУЧЕНИЯ И НАКОПЛЕННОГО ОПЫТА (ДИНАМИЧЕСКИЕ ИНСАЙТЫ АГЕНТСТВА): ===
Эти правила и факты были выучены консультантом на основе реальных отзывов клиентов, поправок риелторов и практики сделок в Минске. ОБЯЗАТЕЛЬНО учитывай их:
${list.map((item, idx) => `${idx + 1}. [${item.title}]: ${item.content}`).join('\n')}
=================================================================================
`;
}
