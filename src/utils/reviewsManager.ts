export interface AgentReview {
  id: string;
  author: string;
  text: string;
  date: string;
  rating: number;
}

function getInitialReviewsForAgent(agentId: string, agentName?: string): AgentReview[] {
  const name = agentName || 'риэлтеру';
  return [
    {
      id: `rev-${agentId || 'ag'}-1`,
      author: 'Михаил и Елена Смирновы',
      text: `Выражаем огромную благодарность (${name}) за оперативную продажу нашей 3-комнатной квартиры и безупречное юридическое сопровождение встречной покупки. Все этапы сделки были понятными, прозрачными и спокойными.`,
      date: '14.01.2025',
      rating: 5
    },
    {
      id: `rev-${agentId || 'ag'}-2`,
      author: 'Дмитрий Ковалев',
      text: 'Отличный специалист, знающий рынок недвижимости от А до Я. Сделка по продаже новостройки прошла четко по намеченному графику без единой задержки.',
      date: '02.12.2024',
      rating: 5
    },
    {
      id: `rev-${agentId || 'ag'}-3`,
      author: 'Ольга Николаевна',
      text: 'Очень внимательный, тактичный и юридически грамотный специалист. Помог согласовать сложный торг с продавцом и сэкономить нам круглую сумму. Рекомендуем всем друзьям!',
      date: '18.10.2024',
      rating: 5
    }
  ];
}

export function getAgentReviews(agentId: string, agentName?: string): AgentReview[] {
  // SSR-safe: на сервере localStorage недоступен
  if (typeof window === 'undefined') return [];

  if (!agentId && !agentName) return [];
  try {
    const rawById = agentId ? localStorage.getItem(`fp_agent_reviews_${agentId}`) : null;
    if (rawById !== null) {
      const parsed = JSON.parse(rawById);
      if (Array.isArray(parsed)) return parsed;
    }
    const rawByName = agentName ? localStorage.getItem(`fp_agent_reviews_${agentName}`) : null;
    if (rawByName !== null) {
      const parsed = JSON.parse(rawByName);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading reviews:', e);
  }

  // Create and persist distinct initial reviews for this agent
  const initial = getInitialReviewsForAgent(agentId, agentName);
  saveAgentReviews(agentId, initial, agentName);
  return initial;
}

export function saveAgentReviews(agentId: string, reviews: AgentReview[], agentName?: string): void {
  // SSR-safe: на сервере localStorage недоступен
  if (typeof window === 'undefined') return;

  try {
    const json = JSON.stringify(reviews);
    if (agentId) localStorage.setItem(`fp_agent_reviews_${agentId}`, json);
    if (agentName) localStorage.setItem(`fp_agent_reviews_${agentName}`, json);

    // Also sync in fp_agents if available
    const savedAgents = localStorage.getItem('fp_agents');
    if (savedAgents) {
      try {
        const list = JSON.parse(savedAgents);
        if (Array.isArray(list)) {
          const updated = list.map((a: any) => {
            if (a.id === agentId || (agentName && a.name === agentName)) {
              return { ...a, reviews };
            }
            return a;
          });
          localStorage.setItem('fp_agents', JSON.stringify(updated));
        }
      } catch (err) {}
    }

    window.dispatchEvent(new CustomEvent('fp_reviews_updated', { detail: { agentId, agentName, reviews } }));
  } catch (e) {
    console.error('Error saving reviews:', e);
  }
}

export function addAgentReview(
  agentId: string,
  review: { author: string; text: string; rating?: number; date?: string },
  agentName?: string
): AgentReview[] {
  const current = getAgentReviews(agentId, agentName);
  const newReview: AgentReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    author: review.author.trim() || 'Клиент агентства',
    text: review.text.trim(),
    rating: review.rating || 5,
    date: review.date || new Date().toLocaleDateString('ru-RU')
  };
  const updated = [newReview, ...current];
  saveAgentReviews(agentId, updated, agentName);
  return updated;
}

export function deleteAgentReview(agentId: string, reviewId: string, agentName?: string): AgentReview[] {
  const current = getAgentReviews(agentId, agentName);
  const updated = current.filter(r => r.id !== reviewId);
  saveAgentReviews(agentId, updated, agentName);
  return updated;
}