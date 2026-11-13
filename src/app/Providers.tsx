'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  createContext,
  useContext,
} from 'react';
import { Agent, Property, Lead, Article, Review, Buyer, ColdSeller, CRMTask } from '@/types';

type Currency = 'BYN' | 'USD';

interface AppContextType {
  favorites: string[];
  toggleFavorite: (id: string) => void;

  leads: Lead[];
  addLead: (name: string, phone: string, typeOrPrice: string, formName: string) => void;
  saveLeadsToStore: (leads: Lead[]) => Promise<void>;
  handleClearLeads: () => Promise<void>;

  buyers: Buyer[];
  setBuyersList: (buyers: Buyer[]) => Promise<void>;

  sellers: ColdSeller[];
  setSellersList: (sellers: ColdSeller[]) => Promise<void>;

  tasks: CRMTask[];
  setTasksList: (tasks: CRMTask[]) => Promise<void>;

  agents: Agent[];
  setAgentsList: (agents: Agent[]) => Promise<void>;

  properties: Property[];
  setPropertiesList: (props: Property[]) => Promise<void>;

  articles: Article[];
  setArticlesList: (articles: Article[]) => Promise<void>;

  reviews: Review[];
  setReviewsList: (reviews: Review[]) => Promise<void>;

  isSyncing: boolean;
  syncWithRealt: () => Promise<void>;
  loadCabinetData: () => Promise<void>;

  loggedInAgent: Agent | null;
  setLoggedInAgent: (agent: Agent | null) => void;

  currency: Currency;
  setCurrency: (c: Currency) => void;

  reload: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

const safeGetItem = (key: string, fallback: any) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch {
    return fallback;
  }
};

const safeSetItem = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[Providers] Failed to save ${key}:`, e);
  }
};

async function safeJson(res: Response): Promise<any | null> {
  try {
    const text = await res.text();
    if (!text || !text.trim()) return null;
    return JSON.parse(text);
  } catch (e) {
    console.error('[safeJson] Parse error:', e);
    return null;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [sellers, setSellers] = useState<ColdSeller[]>([]);
  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loggedInAgent, setLoggedInAgent] = useState<Agent | null>(null);
  const [currency, setCurrency] = useState<Currency>('BYN');

  // ==================== ЗАГРУЗКА ПУБЛИЧНЫХ ДАННЫХ ====================

  const loadAll = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [agentsRes, articlesRes, reviewsRes, propsRes] = await Promise.allSettled([
        fetch('/api/agents'),
        fetch('/api/articles'),
        fetch('/api/reviews'),
        fetch('/api/properties'),
      ]);

      if (agentsRes.status === 'fulfilled' && agentsRes.value.ok) {
        const data = await safeJson(agentsRes.value);
        if (Array.isArray(data)) setAgents(data);
      }
      if (articlesRes.status === 'fulfilled' && articlesRes.value.ok) {
        const data = await safeJson(articlesRes.value);
        if (Array.isArray(data)) setArticles(data);
      }
      if (reviewsRes.status === 'fulfilled' && reviewsRes.value.ok) {
        const data = await safeJson(reviewsRes.value);
        if (Array.isArray(data)) setReviews(data);
      }
      if (propsRes.status === 'fulfilled' && propsRes.value.ok) {
        const data = await safeJson(propsRes.value);
        if (Array.isArray(data)) setProperties(data);
      }
    } catch (e) {
      console.error('[Providers] loadAll failed:', e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // ==================== ЗАГРУЗКА ДАННЫХ КАБИНЕТА ====================

  const loadCabinetData = useCallback(async () => {
    try {
      const [leadsRes, buyersRes, sellersRes, tasksRes, agentsRes] = await Promise.allSettled([
        fetch('/api/leads'),
        fetch('/api/buyers'),
        fetch('/api/sellers'),
        fetch('/api/tasks'),
        fetch('/api/agents?all=true'),
      ]);

      if (leadsRes.status === 'fulfilled' && leadsRes.value.ok) {
        const data = await safeJson(leadsRes.value);
        if (Array.isArray(data)) setLeads(data);
      }
      if (buyersRes.status === 'fulfilled' && buyersRes.value.ok) {
        const data = await safeJson(buyersRes.value);
        if (Array.isArray(data)) setBuyers(data);
      }
      if (sellersRes.status === 'fulfilled' && sellersRes.value.ok) {
        const data = await safeJson(sellersRes.value);
        if (Array.isArray(data)) setSellers(data);
      }
      if (tasksRes.status === 'fulfilled' && tasksRes.value.ok) {
        const data = await safeJson(tasksRes.value);
        if (Array.isArray(data)) setTasks(data);
      }
      if (agentsRes.status === 'fulfilled' && agentsRes.value.ok) {
        const data = await safeJson(agentsRes.value);
        if (Array.isArray(data)) setAgents(data);
      }
    } catch (e) {
      console.error('[Providers] loadCabinetData failed:', e);
    }
  }, []);

  useEffect(() => {
    const savedFavorites = safeGetItem('fp_favorites', []);
    const savedAgent = safeGetItem('fp_logged_agent', null);
    const savedCurrency = safeGetItem('fp_currency', 'BYN');

    if (Array.isArray(savedFavorites) && savedFavorites.length) setFavorites(savedFavorites);
    if (savedAgent) setLoggedInAgent(savedAgent);
    if (savedCurrency === 'BYN' || savedCurrency === 'USD') setCurrency(savedCurrency);

    loadAll();
  }, [loadAll]);

  // ==================== ACTIONS ====================

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      safeSetItem('fp_favorites', next);
      return next;
    });
  }, []);

  const addLead = useCallback((n: string, p: string, t: string, f: string) => {
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: n || 'Не указано',
      phone: p,
      typeOrPrice: t,
      formName: f,
      date: new Date().toLocaleString('ru-RU'),
    };

    setLeads((prev) => [newLead, ...prev]);

    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLead),
    }).catch((err) => console.error('[Providers] Lead save failed:', err));

    fetch('/api/telegram/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLead),
    }).catch((err) => console.error('[Providers] Telegram send failed:', err));
  }, []);

  const saveLeadsToStore = useCallback(async (newLeads: Lead[]) => {
    const oldMap = new Map(leads.map((l) => [l.id, l]));
    const newMap = new Map(newLeads.map((l) => [l.id, l]));

    const toCreate: Lead[] = [];
    const toUpdate: Lead[] = [];
    const toDelete: string[] = [];

    for (const [id, lead] of newMap) {
      const old = oldMap.get(id);
      if (!old) toCreate.push(lead);
      else if (JSON.stringify(old) !== JSON.stringify(lead)) toUpdate.push(lead);
    }
    for (const id of oldMap.keys()) {
      if (!newMap.has(id)) toDelete.push(id);
    }

    setLeads(newLeads);

    const tasks: Promise<any>[] = [];
    for (const lead of toCreate) {
      tasks.push(fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) }));
    }
    for (const lead of toUpdate) {
      tasks.push(fetch(`/api/leads/${encodeURIComponent(lead.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) }));
    }
    for (const id of toDelete) {
      tasks.push(fetch(`/api/leads/${encodeURIComponent(id)}`, { method: 'DELETE' }));
    }
    await Promise.allSettled(tasks);
  }, [leads]);

  const handleClearLeads = useCallback(async () => {
    setLeads([]);
    try {
      await fetch('/api/leads', { method: 'DELETE' });
    } catch (e) {
      console.error('[Providers] Clear leads failed:', e);
    }
  }, []);

  const setBuyersList = useCallback(async (newBuyers: Buyer[]) => {
    const oldMap = new Map(buyers.map((b) => [b.id, b]));
    const newMap = new Map(newBuyers.map((b) => [b.id, b]));

    const toCreate: Buyer[] = [];
    const toUpdate: Buyer[] = [];
    const toDelete: string[] = [];

    for (const [id, buyer] of newMap) {
      const old = oldMap.get(id);
      if (!old) toCreate.push(buyer);
      else if (JSON.stringify(old) !== JSON.stringify(buyer)) toUpdate.push(buyer);
    }
    for (const id of oldMap.keys()) {
      if (!newMap.has(id)) toDelete.push(id);
    }

    setBuyers(newBuyers);

    const tasks: Promise<any>[] = [];
    for (const b of toCreate) {
      tasks.push(fetch('/api/buyers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }));
    }
    for (const b of toUpdate) {
      tasks.push(fetch(`/api/buyers/${encodeURIComponent(b.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }));
    }
    for (const id of toDelete) {
      tasks.push(fetch(`/api/buyers/${encodeURIComponent(id)}`, { method: 'DELETE' }));
    }
    await Promise.allSettled(tasks);
  }, [buyers]);

  const setAgentsList = useCallback(async (newAgents: Agent[]) => {
    const oldMap = new Map(agents.map((a) => [a.id, a]));
    const newMap = new Map(newAgents.map((a) => [a.id, a]));

    const toCreate: Agent[] = [];
    const toUpdate: Agent[] = [];
    const toDelete: string[] = [];

    for (const [id, agent] of newMap) {
      const old = oldMap.get(id);
      if (!old) toCreate.push(agent);
      else if (JSON.stringify(old) !== JSON.stringify(agent)) toUpdate.push(agent);
    }
    for (const id of oldMap.keys()) {
      if (!newMap.has(id)) toDelete.push(id);
    }

    setAgents(newAgents);

    const tasks: Promise<any>[] = [];
    for (const a of toCreate) {
      tasks.push(fetch('/api/agents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(a) }));
    }
    for (const a of toUpdate) {
      tasks.push(fetch(`/api/agents/${encodeURIComponent(a.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(a) }));
    }
    for (const id of toDelete) {
      tasks.push(fetch(`/api/agents/${encodeURIComponent(id)}`, { method: 'DELETE' }));
    }
    await Promise.allSettled(tasks);
  }, [agents]);

  const setPropertiesList = useCallback(async (newProps: Property[]) => {
    const oldMap = new Map(properties.map((p) => [p.id, p]));
    const newMap = new Map(newProps.map((p) => [p.id, p]));

    const toCreate: Property[] = [];
    const toUpdate: Property[] = [];
    const toDelete: string[] = [];

    for (const [id, prop] of newMap) {
      const old = oldMap.get(id);
      if (!old) toCreate.push(prop);
      else if (JSON.stringify(old) !== JSON.stringify(prop)) toUpdate.push(prop);
    }
    for (const id of oldMap.keys()) {
      if (!newMap.has(id)) toDelete.push(id);
    }

    setProperties(newProps);

    const tasks: Promise<any>[] = [];
    for (const p of toCreate) {
      tasks.push(fetch('/api/properties', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) }));
    }
    for (const p of toUpdate) {
      const key = p.slug || p.id;
      tasks.push(fetch(`/api/properties/${encodeURIComponent(key)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) }));
    }
    for (const id of toDelete) {
      const prop = oldMap.get(id);
      const key = prop?.slug || id;
      tasks.push(fetch(`/api/properties/${encodeURIComponent(key)}`, { method: 'DELETE' }));
    }
    await Promise.allSettled(tasks);
  }, [properties]);

  const setArticlesList = useCallback(async (newArticles: Article[]) => {
    const oldMap = new Map(articles.map((a) => [a.id, a]));
    const newMap = new Map(newArticles.map((a) => [a.id, a]));

    const toCreate: Article[] = [];
    const toUpdate: Article[] = [];
    const toDelete: string[] = [];

    for (const [id, article] of newMap) {
      const old = oldMap.get(id);
      if (!old) toCreate.push(article);
      else if (JSON.stringify(old) !== JSON.stringify(article)) toUpdate.push(article);
    }
    for (const id of oldMap.keys()) {
      if (!newMap.has(id)) toDelete.push(id);
    }

    setArticles(newArticles);

    const tasks: Promise<any>[] = [];
    for (const a of toCreate) {
      tasks.push(fetch('/api/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(a) }));
    }
    for (const a of toUpdate) {
      const key = a.slug || a.id;
      tasks.push(fetch(`/api/articles/${encodeURIComponent(key)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(a) }));
    }
    for (const id of toDelete) {
      const art = oldMap.get(id);
      const key = art?.slug || id;
      tasks.push(fetch(`/api/articles/${encodeURIComponent(key)}`, { method: 'DELETE' }));
    }
    await Promise.allSettled(tasks);
  }, [articles]);

  // ==================== НОВЫЕ ОБЁРТКИ: SELLERS, TASKS, REVIEWS ====================

  const setSellersList = useCallback(async (newSellers: ColdSeller[]) => {
    const oldMap = new Map(sellers.map((s) => [s.id, s]));
    const newMap = new Map(newSellers.map((s) => [s.id, s]));

    const toCreate: ColdSeller[] = [];
    const toUpdate: ColdSeller[] = [];
    const toDelete: string[] = [];

    for (const [id, seller] of newMap) {
      const old = oldMap.get(id);
      if (!old) toCreate.push(seller);
      else if (JSON.stringify(old) !== JSON.stringify(seller)) toUpdate.push(seller);
    }
    for (const id of oldMap.keys()) {
      if (!newMap.has(id)) toDelete.push(id);
    }

    setSellers(newSellers);

    const promises: Promise<any>[] = [];
    for (const s of toCreate) {
      promises.push(fetch('/api/sellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      }));
    }
    for (const s of toUpdate) {
      promises.push(fetch(`/api/sellers/${encodeURIComponent(s.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      }));
    }
    for (const id of toDelete) {
      promises.push(fetch(`/api/sellers/${encodeURIComponent(id)}`, { method: 'DELETE' }));
    }
    await Promise.allSettled(promises);
  }, [sellers]);

  const setTasksList = useCallback(async (newTasks: CRMTask[]) => {
    const oldMap = new Map(tasks.map((t) => [t.id, t]));
    const newMap = new Map(newTasks.map((t) => [t.id, t]));

    const toCreate: CRMTask[] = [];
    const toUpdate: CRMTask[] = [];
    const toDelete: string[] = [];

    for (const [id, task] of newMap) {
      const old = oldMap.get(id);
      if (!old) toCreate.push(task);
      else if (JSON.stringify(old) !== JSON.stringify(task)) toUpdate.push(task);
    }
    for (const id of oldMap.keys()) {
      if (!newMap.has(id)) toDelete.push(id);
    }

    setTasks(newTasks);

    const promises: Promise<any>[] = [];
    for (const t of toCreate) {
      promises.push(fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t),
      }));
    }
    for (const t of toUpdate) {
      promises.push(fetch(`/api/tasks/${encodeURIComponent(t.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t),
      }));
    }
    for (const id of toDelete) {
      promises.push(fetch(`/api/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' }));
    }
    await Promise.allSettled(promises);
  }, [tasks]);

  const setReviewsList = useCallback(async (newReviews: Review[]) => {
    setReviews(newReviews);
    try {
      await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReviews),
      });
    } catch (e) {
      console.error('[Providers] setReviewsList failed:', e);
    }
  }, []);

  const syncWithRealt = useCallback(async () => {
    setIsSyncing(true);
    try {
      await fetch('/api/realt/sync', { method: 'POST' });
      await loadAll();
    } catch (e) {
      console.error('[Providers] Sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [loadAll]);

  const handleSetCurrency = useCallback((c: Currency) => {
    setCurrency(c);
    safeSetItem('fp_currency', c);
  }, []);

  const value = useMemo(
    () => ({
      favorites,
      toggleFavorite,
      leads,
      addLead,
      saveLeadsToStore,
      handleClearLeads,
      buyers,
      setBuyersList,
      sellers,
      setSellersList,
      tasks,
      setTasksList,
      agents,
      setAgentsList,
      properties,
      setPropertiesList,
      articles,
      setArticlesList,
      reviews,
      setReviewsList,
      isSyncing,
      syncWithRealt,
      loadCabinetData,
      loggedInAgent,
      setLoggedInAgent,
      currency,
      setCurrency: handleSetCurrency,
      reload: loadAll,
    }),
    [
      favorites, toggleFavorite,
      leads, addLead, saveLeadsToStore, handleClearLeads,
      buyers, setBuyersList,
      sellers, setSellersList,
      tasks, setTasksList,
      agents, setAgentsList,
      properties, setPropertiesList,
      articles, setArticlesList,
      reviews, setReviewsList,
      isSyncing, syncWithRealt, loadCabinetData,
      loggedInAgent, currency, handleSetCurrency, loadAll,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}