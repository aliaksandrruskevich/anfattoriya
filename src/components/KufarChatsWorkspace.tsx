'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  UserPlus,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import type { Agent, Buyer, KufarChat, KufarMessage, Property } from '../types';
import {
  buildMessengerShareText,
  buildTelegramShareUrl,
  buildViberShareUrl,
  extractBelarusPhone,
  findMatchingPropertyForKufar,
} from '../lib/kufarUtils';

interface KufarChatsWorkspaceProps {
  loggedInAgent: Agent | null;
  propertiesList: Property[];
  buyersList: Buyer[];
  onCreateBuyer: (buyer: Buyer) => Promise<void> | void;
  onCreateLead: (name: string, phone: string, typeOrPrice: string, formName: string) => void;
  onChatsCountChange?: (newCount: number) => void;
}

function formatShortDate(raw?: string | null): string {
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) {
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
}

function formatMessageTime(raw?: string | null): string {
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || 'КФ';
}

export default function KufarChatsWorkspace({
  loggedInAgent,
  propertiesList,
  buyersList,
  onCreateBuyer,
  onCreateLead,
  onChatsCountChange,
}: KufarChatsWorkspaceProps) {
  const [chats, setChats] = useState<KufarChat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<KufarMessage[]>([]);
  const [dbMatchedProperty, setDbMatchedProperty] = useState<Partial<Property> | null>(null);
  const [loadingChats, setLoadingChats] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [sendingReply, setSendingReply] = useState<boolean>(false);
  const [creatingBuyer, setCreatingBuyer] = useState<boolean>(false);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [createdLeadChatIds, setCreatedLeadChatIds] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  const fetchChats = useCallback(async () => {
    setLoadingChats(true);
    try {
      const res = await fetch('/api/chats', { cache: 'no-store' });
      if (res.ok) {
        const data: KufarChat[] = await res.json();
        setChats(Array.isArray(data) ? data : []);
        const newCount = Array.isArray(data) ? data.filter((c) => c.status === 'new').length : 0;
        onChatsCountChange?.(newCount);
        setSelectedChatId((prev) => {
          if (prev && Array.isArray(data) && data.some((c) => c.id === prev)) return prev;
          return Array.isArray(data) && data.length > 0 ? data[0].id : null;
        });
      }
    } catch (e) {
      console.error('[KufarChats] Failed to load chats:', e);
    } finally {
      setLoadingChats(false);
    }
  }, [onChatsCountChange]);

  const fetchChatMessages = useCallback(async (chatId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/chats/${encodeURIComponent(chatId)}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data?.messages) ? data.messages : []);
        setDbMatchedProperty(data?.matchedProperty || null);
      }
    } catch (e) {
      console.error('[KufarChats] Failed to load messages:', e);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (selectedChatId) {
      fetchChatMessages(selectedChatId);
    } else {
      setMessages([]);
      setDbMatchedProperty(null);
    }
  }, [selectedChatId, fetchChatMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedChat = useMemo(
    () => chats.find((c) => c.id === selectedChatId) || null,
    [chats, selectedChatId]
  );

  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      if (statusFilter === 'new' && chat.status !== 'new') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = [
          chat.client_name,
          chat.client_phone,
          chat.ad_title,
          chat.last_message,
          chat.kufar_ad_id,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [chats, searchQuery, statusFilter]);

  const newChatsCount = useMemo(
    () => chats.filter((c) => c.status === 'new').length,
    [chats]
  );

  // Smart CRM: поиск объекта и риэлтера по kufar_ad_id или ссылкам в сообщениях
  const matchedProperty = useMemo(() => {
    if (!selectedChat) return null;
    const msgTexts = messages.map((m) => m.text);
    const localMatch = findMatchingPropertyForKufar(
      selectedChat.kufar_ad_id,
      selectedChat.ad_title,
      msgTexts,
      propertiesList
    );
    if (localMatch) return localMatch;
    if (dbMatchedProperty && dbMatchedProperty.title) {
      return dbMatchedProperty as Property;
    }
    return null;
  }, [selectedChat, messages, propertiesList, dbMatchedProperty]);

  // Smart CRM: извлечение белорусского телефона из профиля чата или истории сообщений
  const detectedPhone = useMemo(() => {
    if (!selectedChat) return null;
    if (selectedChat.client_phone) {
      const normalized = extractBelarusPhone(selectedChat.client_phone);
      return normalized || selectedChat.client_phone;
    }
    for (let i = messages.length - 1; i >= 0; i--) {
      const found = extractBelarusPhone(messages[i].text);
      if (found) return found;
    }
    if (selectedChat.last_message) {
      return extractBelarusPhone(selectedChat.last_message);
    }
    return null;
  }, [selectedChat, messages]);

  const buyerAlreadyExists = useMemo(() => {
    if (!detectedPhone) return false;
    const digits = detectedPhone.replace(/\D/g, '');
    return buyersList.some((b) => (b.phone || '').replace(/\D/g, '') === digits);
  }, [detectedPhone, buyersList]);

  const shareText = useMemo(() => {
    if (!selectedChat) return '';
    return buildMessengerShareText({
      clientName: selectedChat.client_name,
      clientPhone: detectedPhone,
      adTitle: selectedChat.ad_title,
      kufarAdId: selectedChat.kufar_ad_id,
      lastMessage: selectedChat.last_message,
      matchedProperty,
    });
  }, [selectedChat, detectedPhone, matchedProperty]);

  const objectShareUrl = useMemo(() => {
    if (matchedProperty) {
      return `https://fattoria.by/object/${matchedProperty.slug || matchedProperty.id}`;
    }
    if (selectedChat?.kufar_ad_id) {
      return `https://www.kufar.by/item/${selectedChat.kufar_ad_id}`;
    }
    return 'https://fattoria.by/catalog';
  }, [matchedProperty, selectedChat]);

  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedChat || !replyText.trim() || sendingReply) return;

    const textToSend = replyText.trim();
    setSendingReply(true);
    try {
      const res = await fetch(`/api/chats/${encodeURIComponent(selectedChat.id)}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.message) {
          setMessages((prev) => [...prev, data.message]);
        }
        setChats((prev) => {
          const updated = prev.map((c) =>
            c.id === selectedChat.id
              ? {
                  ...c,
                  last_message: textToSend,
                  last_message_date: data?.chat?.last_message_date || new Date().toISOString(),
                  status: c.status === 'new' ? 'active' : c.status,
                }
              : c
          );
          onChatsCountChange?.(updated.filter((c) => c.status === 'new').length);
          return updated;
        });
        setReplyText('');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err?.error || 'Не удалось отправить сообщение');
      }
    } catch (err) {
      console.error('[KufarChats] Reply failed:', err);
      showToast('Ошибка сети при отправке ответа');
    } finally {
      setSendingReply(false);
    }
  };

  const handleCreateDeal = async () => {
    if (!selectedChat) return;
    const objectTitle =
      matchedProperty?.title ||
      selectedChat.ad_title ||
      (selectedChat.kufar_ad_id ? `Объявление Kufar #${selectedChat.kufar_ad_id}` : 'Запрос с Kufar');

    onCreateLead(
      selectedChat.client_name,
      detectedPhone || 'Уточнить в чате Kufar',
      objectTitle,
      'Чаты Kufar'
    );

    setCreatedLeadChatIds((prev) => ({ ...prev, [selectedChat.id]: true }));

    if (selectedChat.status === 'new') {
      await fetch(`/api/chats/${encodeURIComponent(selectedChat.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      }).catch(() => {});
      setChats((prev) => {
        const updated = prev.map((c) =>
          c.id === selectedChat.id ? { ...c, status: 'active' } : c
        );
        onChatsCountChange?.(updated.filter((c) => c.status === 'new').length);
        return updated;
      });
    }

    showToast(`Сделка по клиенту «${selectedChat.client_name}» создана в CRM`);
  };

  const handleCreateBuyer = async () => {
    if (!selectedChat || !detectedPhone || creatingBuyer || buyerAlreadyExists) return;

    setCreatingBuyer(true);
    try {
      const newBuyer: Buyer = {
        id: `buyer-kufar-${Date.now()}`,
        name: selectedChat.client_name,
        phone: detectedPhone,
        budgetBYN: matchedProperty?.priceBYN || 0,
        budgetUSD: matchedProperty?.priceUSD || undefined,
        preferences: `Обращение с Kufar: ${matchedProperty?.title || selectedChat.ad_title || ''}. ${selectedChat.last_message || ''}`.trim(),
        registeredBy: loggedInAgent?.name || 'CRM Чаты Kufar',
        assignedAgentId: matchedProperty?.assignedAgentId || loggedInAgent?.id,
        assignedAgentName:
          matchedProperty?.assignedAgentName ||
          matchedProperty?.agentName ||
          loggedInAgent?.name,
        status: 'searching',
        dateAdded: new Date().toLocaleDateString('ru-RU'),
        prefType: matchedProperty?.type || 'apartment',
        prefRooms: matchedProperty?.rooms,
        prefDistrict: matchedProperty?.district,
        tags: ['Kufar', selectedChat.kufar_ad_id ? `ad:${selectedChat.kufar_ad_id}` : ''].filter(Boolean),
      };

      await onCreateBuyer(newBuyer);
      showToast(`Покупатель «${selectedChat.client_name}» добавлен в базу покупателей`);
    } catch (e) {
      console.error('[KufarChats] Create buyer failed:', e);
      showToast('Не удалось добавить покупателя');
    } finally {
      setCreatingBuyer(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl shadow-sm flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {toastMessage}
          </span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-black px-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Двухпанельный интерфейс чатов */}
      <div className="bg-white border border-stone-200/90 rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px] lg:h-[700px]">
        {/* ЛЕВАЯ ПАНЕЛЬ: Список диалогов */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-stone-200 flex flex-col bg-stone-50/40 min-h-[260px] lg:min-h-0">
          <div className="p-4 border-b border-stone-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-stone-900">
                    Диалоги Kufar
                  </h3>
                  <p className="text-[10px] text-stone-500 font-semibold">
                    Всего: {chats.length} · Новых: {newChatsCount}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchChats}
                disabled={loadingChats}
                className="p-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
                title="Обновить список чатов"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingChats ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по клиенту, телефону, объекту..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:border-[#8B5CF6] outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Все ({chats.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('new')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === 'new'
                    ? 'bg-[#8B5CF6] text-white shadow-xs'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                Новые ({newChatsCount})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-stone-100 custom-scrollbar">
            {loadingChats && chats.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500 font-medium">
                Загрузка диалогов...
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <MessageCircle className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="text-xs font-bold text-stone-600">Диалоги не найдены</p>
                <p className="text-[11px] text-stone-400">
                  Новые сообщения из Kufar появятся здесь автоматически после синхронизации.
                </p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isSelected = chat.id === selectedChatId;
                const isNew = chat.status === 'new';

                return (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => setSelectedChatId(chat.id)}
                    className={`w-full text-left p-3.5 transition-all flex items-start gap-3 cursor-pointer outline-none ${
                      isSelected
                        ? 'bg-purple-50/90 border-l-4 border-l-[#8B5CF6]'
                        : 'bg-white hover:bg-stone-50 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0 shadow-xs ${
                        isSelected
                          ? 'bg-[#8B5CF6] text-white'
                          : isNew
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-stone-100 text-stone-700 border border-stone-200'
                      }`}
                    >
                      {getInitials(chat.client_name)}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-stone-900 truncate">
                          {chat.client_name}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400 shrink-0">
                          {formatShortDate(chat.last_message_date || chat.created_at)}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-600 line-clamp-2 leading-snug">
                        {chat.last_message || 'Нет сообщений'}
                      </p>

                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <span className="text-[10px] text-stone-400 font-semibold truncate">
                          {chat.ad_title || (chat.kufar_ad_id ? `Kufar #${chat.kufar_ad_id}` : 'Kufar')}
                        </span>
                        {isNew && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500 text-white shrink-0">
                            Новый
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ПРАВАЯ ПАНЕЛЬ: Окно переписки */}
        <div className="lg:col-span-8 flex flex-col bg-white min-h-[520px] lg:min-h-0">
          {!selectedChat ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-stone-400" />
              </div>
              <p className="text-sm font-bold text-stone-600">Выберите диалог слева</p>
              <p className="text-xs max-w-sm">
                Здесь отобразится история переписки с клиентом Kufar, найденный объект и быстрые действия CRM.
              </p>
            </div>
          ) : (
            <>
              {/* Верхняя панель переписки */}
              <div className="p-4 border-b border-stone-200 bg-white space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm">
                      {getInitials(selectedChat.client_name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-stone-900 truncate">
                          {selectedChat.client_name}
                        </h3>
                        {selectedChat.status === 'new' && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500 text-white">
                            Новый
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-stone-500 font-medium flex-wrap mt-0.5">
                        {selectedChat.ad_title && (
                          <span className="truncate max-w-xs">{selectedChat.ad_title}</span>
                        )}
                        {selectedChat.kufar_ad_id && (
                          <a
                            href={`https://www.kufar.by/item/${selectedChat.kufar_ad_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#8B5CF6] hover:underline font-bold"
                          >
                            Kufar #{selectedChat.kufar_ad_id}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Кнопки действий: В Viber, В Telegram, Создать сделку */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <a
                      href={buildViberShareUrl(shareText)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-[11px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      В Viber
                    </a>

                    <a
                      href={buildTelegramShareUrl(shareText, objectShareUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-[11px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      В Telegram
                    </a>

                    <button
                      type="button"
                      onClick={handleCreateDeal}
                      className={`px-3.5 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                        createdLeadChatIds[selectedChat.id]
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#8B5CF6] hover:bg-purple-700 text-white'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      {createdLeadChatIds[selectedChat.id] ? 'Сделка создана' : 'Создать сделку'}
                    </button>
                  </div>
                </div>

                {/* Smart CRM панель: Связка с объектом + Извлечённый телефон + Кнопка "Создать в базе покупателей" */}
                {(matchedProperty || detectedPhone) && (
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 min-w-0">
                      {matchedProperty && (
                        <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 shadow-2xs min-w-0">
                          <Building2 className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
                          <div className="min-w-0 text-[11px]">
                            <span className="font-bold text-stone-900 truncate block max-w-[260px]">
                              {matchedProperty.title}
                            </span>
                            <span className="text-[10px] text-stone-500 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-[#8B5CF6]" />
                              Риэлтер:{' '}
                              <strong className="text-stone-800">
                                {matchedProperty.assignedAgentName ||
                                  matchedProperty.agentName ||
                                  'Не назначен'}
                              </strong>
                            </span>
                          </div>
                        </div>
                      )}

                      {detectedPhone && (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg px-2.5 py-1.5 text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <div>
                            <span className="text-[9px] uppercase font-black tracking-wider text-emerald-700 block">
                              Телефон из чата
                            </span>
                            <a
                              href={`tel:${detectedPhone.replace(/[^\d+]/g, '')}`}
                              className="font-mono font-black hover:underline"
                            >
                              {detectedPhone}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {detectedPhone && (
                      <button
                        type="button"
                        onClick={handleCreateBuyer}
                        disabled={creatingBuyer || buyerAlreadyExists}
                        className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                          buyerAlreadyExists
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-default'
                            : 'bg-stone-900 hover:bg-stone-800 text-white shadow-xs'
                        }`}
                      >
                        {buyerAlreadyExists ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            Уже в базе покупателей
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5 text-purple-300" />
                            {creatingBuyer ? 'Сохранение...' : 'Создать в базе покупателей'}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Центр: История сообщений */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-stone-50/50 custom-scrollbar">
                {loadingMessages && messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-stone-400">
                    Загрузка сообщений...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-stone-400">
                    История переписки пока пуста.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAgent = msg.sender === 'agent';
                    const phoneInMsg = extractBelarusPhone(msg.text);

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-xs text-xs leading-relaxed ${
                            isAgent
                              ? 'bg-[#8B5CF6] text-white rounded-br-sm'
                              : 'bg-white text-stone-900 border border-stone-200 rounded-bl-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 mb-1">
                            <span
                              className={`text-[9px] font-black uppercase tracking-wider ${
                                isAgent ? 'text-purple-100' : 'text-[#8B5CF6]'
                              }`}
                            >
                              {isAgent ? 'Менеджер' : selectedChat.client_name}
                            </span>
                            <span
                              className={`text-[9px] font-mono ${
                                isAgent ? 'text-purple-200' : 'text-stone-400'
                              }`}
                            >
                              {formatMessageTime(msg.created_at)}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          {!isAgent && phoneInMsg && (
                            <div className="mt-2 pt-1.5 border-t border-stone-100 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              Найден телефон: <span className="font-mono">{phoneInMsg}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Низ: Поле ввода для ответа */}
              <form
                onSubmit={handleSendReply}
                className="p-3.5 sm:p-4 border-t border-stone-200 bg-white flex items-end gap-2.5"
              >
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleSendReply();
                    }
                  }}
                  placeholder="Напишите ответ клиенту... (Enter — отправить, Shift+Enter — новая строка)"
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:border-[#8B5CF6] outline-none resize-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || sendingReply}
                  className="px-4 py-3 rounded-xl bg-[#8B5CF6] hover:bg-purple-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {sendingReply ? 'Отправка...' : 'Отправить'}
                  </span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
