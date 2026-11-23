import { execute, isDbMockMode, query, queryOne } from './db';
import { extractBelarusPhone, extractKufarAdId } from './kufarUtils';
import { getMockStore } from './mockStore';
import type { KufarChat, KufarMessage } from '../types';

interface MemoryStore {
  chats: KufarChat[];
  messages: KufarMessage[];
}

const globalForChats = globalThis as unknown as {
  __kufarChatsMemory?: MemoryStore;
};

function getMemoryStore(): MemoryStore {
  if (!globalForChats.__kufarChatsMemory) {
    const now = Date.now();
    const fmt = (offsetMin: number) =>
      new Date(now - offsetMin * 60_000).toISOString();

    globalForChats.__kufarChatsMemory = {
      chats: [
        {
          id: 'kufar-chat-101',
          kufar_ad_id: '123456',
          ad_title: '2-к квартира, Минск, ул. Притыцкого 29',
          client_name: 'Анна Соколова',
          client_phone: '+375 (29) 645-18-92',
          last_message: 'Здравствуйте! Актуальна ли квартира? Мой номер +375 29 645-18-92, хочу посмотреть завтра вечером.',
          last_message_date: fmt(12),
          status: 'new',
          created_at: fmt(45),
        },
        {
          id: 'kufar-chat-102',
          kufar_ad_id: '789012',
          ad_title: 'Дом в Цне, Логойский район',
          client_name: 'Дмитрий Ковалёв',
          client_phone: null,
          last_message: 'Добрый день! Подскажите, возможен ли торг и какая глубина скважины? Ссылка: https://www.kufar.by/item/789012',
          last_message_date: fmt(65),
          status: 'new',
          created_at: fmt(120),
        },
        {
          id: 'kufar-chat-103',
          kufar_ad_id: '345678',
          ad_title: 'Офис на ул. Фабрициуса 8, Минск',
          client_name: 'ООО «Вега-Трейд» (Сергей)',
          client_phone: '+375 (44) 712-30-05',
          last_message: 'Спасибо, ждём договор и планировку на просмотр.',
          last_message_date: fmt(240),
          status: 'active',
          created_at: fmt(600),
        },
      ],
      messages: [
        {
          id: 'msg-101-1',
          chat_id: 'kufar-chat-101',
          sender: 'client',
          text: 'Здравствуйте! Интересует объявление https://www.kufar.by/item/123456',
          created_at: fmt(45),
        },
        {
          id: 'msg-101-2',
          chat_id: 'kufar-chat-101',
          sender: 'client',
          text: 'Здравствуйте! Актуальна ли квартира? Мой номер +375 29 645-18-92, хочу посмотреть завтра вечером.',
          created_at: fmt(12),
        },
        {
          id: 'msg-102-1',
          chat_id: 'kufar-chat-102',
          sender: 'client',
          text: 'Добрый день! Подскажите, возможен ли торг и какая глубина скважины? Ссылка: https://www.kufar.by/item/789012',
          created_at: fmt(65),
        },
        {
          id: 'msg-103-1',
          chat_id: 'kufar-chat-103',
          sender: 'client',
          text: 'Добрый день! Нужен офис от 80 кв.м., наш контакт 80447123005.',
          created_at: fmt(580),
        },
        {
          id: 'msg-103-2',
          chat_id: 'kufar-chat-103',
          sender: 'agent',
          text: 'Здравствуйте, Сергей! Помещение на Фабрициуса 8 свободно, можем организовать показ завтра в 11:00.',
          created_at: fmt(310),
        },
        {
          id: 'msg-103-3',
          chat_id: 'kufar-chat-103',
          sender: 'client',
          text: 'Спасибо, ждём договор и планировку на просмотр.',
          created_at: fmt(240),
        },
      ],
    };
  }
  return globalForChats.__kufarChatsMemory;
}

function formatDateForDb(dateInput?: string): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(d.getTime())) {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

export async function listKufarChats(): Promise<KufarChat[]> {
  if (isDbMockMode()) {
    const store = getMemoryStore();
    return [...store.chats].sort((a, b) => {
      const da = new Date(a.last_message_date || a.created_at || 0).getTime();
      const dbTime = new Date(b.last_message_date || b.created_at || 0).getTime();
      return dbTime - da;
    });
  }

  const rows = await query<KufarChat>(
    `SELECT id, kufar_ad_id, ad_title, client_name, client_phone,
            last_message, last_message_date, status, created_at
     FROM kufar_chats
     ORDER BY COALESCE(last_message_date, created_at) DESC, created_at DESC`
  );
  return rows;
}

export async function getKufarChatWithMessages(
  chatId: string
): Promise<{ chat: KufarChat; messages: KufarMessage[]; matchedProperty?: any } | null> {
  if (isDbMockMode()) {
    const store = getMemoryStore();
    const chat = store.chats.find((c) => c.id === chatId);
    if (!chat) return null;
    const messages = store.messages
      .filter((m) => m.chat_id === chatId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    let matchedProperty: any = null;
    if (chat.kufar_ad_id) {
      const adId = chat.kufar_ad_id;
      const prop = getMockStore().properties.find(
        (p) =>
          p.id === adId ||
          (p.slug && p.slug.includes(adId)) ||
          (p.sourceUrl && p.sourceUrl.includes(adId))
      );
      if (prop) {
        matchedProperty = {
          id: prop.id,
          title: prop.title,
          slug: prop.slug,
          address: prop.address,
          priceBYN: prop.priceBYN,
          priceUSD: prop.priceUSD,
          agentName: prop.agentName,
          assignedAgentName: prop.assignedAgentName,
          agentPhone: prop.agentPhone,
        };
      }
    }
    return { chat, messages, matchedProperty };
  }

  const chat = await queryOne<KufarChat>(
    `SELECT id, kufar_ad_id, ad_title, client_name, client_phone,
            last_message, last_message_date, status, created_at
     FROM kufar_chats
     WHERE id = ?
     LIMIT 1`,
    [chatId]
  );

  if (!chat) return null;

  const messages = await query<KufarMessage>(
    `SELECT id, chat_id, sender, text, created_at
     FROM kufar_messages
     WHERE chat_id = ?
     ORDER BY created_at ASC`,
    [chatId]
  );

  let matchedProperty: any = null;
  if (chat.kufar_ad_id) {
    const likePattern = `%${chat.kufar_ad_id}%`;
    matchedProperty = await queryOne(
      `SELECT id, title, slug, address, priceBYN, priceUSD, agentName, assignedAgentName, agentPhone
       FROM properties
       WHERE externalId = ? OR id = ? OR sourceUrl LIKE ? OR slug LIKE ?
       LIMIT 1`,
      [chat.kufar_ad_id, chat.kufar_ad_id, likePattern, likePattern]
    );
  }

  return { chat, messages, matchedProperty };
}

export async function replyToKufarChat(
  chatId: string,
  text: string
): Promise<{ chat: KufarChat; message: KufarMessage } | null> {
  const cleanText = text.trim();
  if (!cleanText) return null;

  const nowIso = new Date().toISOString();
  const msgId = `kmsg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (isDbMockMode()) {
    const store = getMemoryStore();
    const chatIdx = store.chats.findIndex((c) => c.id === chatId);
    if (chatIdx === -1) return null;

    const msg: KufarMessage = {
      id: msgId,
      chat_id: chatId,
      sender: 'agent',
      text: cleanText,
      created_at: nowIso,
    };
    store.messages.push(msg);

    const updatedChat: KufarChat = {
      ...store.chats[chatIdx],
      last_message: cleanText,
      last_message_date: nowIso,
      status: store.chats[chatIdx].status === 'new' ? 'active' : store.chats[chatIdx].status,
    };
    store.chats[chatIdx] = updatedChat;

    return { chat: updatedChat, message: msg };
  }

  const existing = await queryOne<KufarChat>(
    'SELECT * FROM kufar_chats WHERE id = ? LIMIT 1',
    [chatId]
  );
  if (!existing) return null;

  const dbNow = formatDateForDb(nowIso);

  await execute(
    `INSERT INTO kufar_messages (id, chat_id, sender, text, created_at)
     VALUES (?, ?, 'agent', ?, ?)`,
    [msgId, chatId, cleanText, dbNow]
  );

  await execute(
    `UPDATE kufar_chats
     SET last_message = ?, last_message_date = ?, status = CASE WHEN status = 'new' THEN 'active' ELSE status END
     WHERE id = ?`,
    [cleanText, nowIso, chatId]
  );

  const updatedChat = await queryOne<KufarChat>(
    'SELECT * FROM kufar_chats WHERE id = ? LIMIT 1',
    [chatId]
  );
  const createdMsg = await queryOne<KufarMessage>(
    'SELECT * FROM kufar_messages WHERE id = ? LIMIT 1',
    [msgId]
  );

  return {
    chat: updatedChat || { ...existing, last_message: cleanText, last_message_date: nowIso, status: 'active' },
    message: createdMsg || { id: msgId, chat_id: chatId, sender: 'agent', text: cleanText, created_at: nowIso },
  };
}

export interface SyncKufarPayload {
  chatId?: string;
  kufarAdId?: string;
  adUrl?: string;
  adTitle?: string;
  clientName?: string;
  clientPhone?: string;
  sender?: 'client' | 'agent';
  text: string;
  createdAt?: string;
  externalMessageId?: string;
}

export async function syncKufarIncomingMessage(payload: SyncKufarPayload): Promise<{
  chat: KufarChat;
  message: KufarMessage;
  createdChat: boolean;
  duplicated: boolean;
}> {
  const cleanText = String(payload.text || '').trim();
  const sender: 'client' | 'agent' = payload.sender === 'agent' ? 'agent' : 'client';
  const adId = payload.kufarAdId || extractKufarAdId(payload.adUrl || '') || extractKufarAdId(cleanText);
  const extractedPhone = payload.clientPhone || extractBelarusPhone(cleanText);
  const clientName = (payload.clientName || 'Клиент Kufar').trim();
  const nowIso = payload.createdAt || new Date().toISOString();

  const deterministicChatId =
    payload.chatId ||
    `kufar-${adId || 'general'}-${clientName
      .toLowerCase()
      .replace(/[^a-zа-яё0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'client'}`;

  const msgId =
    payload.externalMessageId ||
    `kmsg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (isDbMockMode()) {
    const store = getMemoryStore();
    let chatIdx = store.chats.findIndex(
      (c) =>
        c.id === deterministicChatId ||
        (adId && c.kufar_ad_id === adId && c.client_name.toLowerCase() === clientName.toLowerCase())
    );

    let createdChat = false;
    let chatId = deterministicChatId;

    if (chatIdx === -1) {
      createdChat = true;
      const newChat: KufarChat = {
        id: deterministicChatId,
        kufar_ad_id: adId || null,
        ad_title: payload.adTitle || (adId ? `Объявление Kufar #${adId}` : 'Обращение с Kufar'),
        client_name: clientName,
        client_phone: extractedPhone || null,
        last_message: cleanText,
        last_message_date: nowIso,
        status: sender === 'client' ? 'new' : 'active',
        created_at: nowIso,
      };
      store.chats.unshift(newChat);
      chatIdx = 0;
    } else {
      chatId = store.chats[chatIdx].id;
      const duplicate = store.messages.find(
        (m) =>
          m.chat_id === chatId &&
          (m.id === msgId || (m.sender === sender && m.text === cleanText))
      );
      if (duplicate) {
        return {
          chat: store.chats[chatIdx],
          message: duplicate,
          createdChat: false,
          duplicated: true,
        };
      }

      store.chats[chatIdx] = {
        ...store.chats[chatIdx],
        kufar_ad_id: store.chats[chatIdx].kufar_ad_id || adId || null,
        ad_title: payload.adTitle || store.chats[chatIdx].ad_title,
        client_phone: store.chats[chatIdx].client_phone || extractedPhone || null,
        last_message: cleanText,
        last_message_date: nowIso,
        status: sender === 'client' ? 'new' : store.chats[chatIdx].status,
      };
    }

    const msg: KufarMessage = {
      id: msgId,
      chat_id: chatId,
      sender,
      text: cleanText,
      created_at: nowIso,
    };
    store.messages.push(msg);

    return { chat: store.chats[chatIdx], message: msg, createdChat, duplicated: false };
  }

  // MySQL path
  let existingChat = await queryOne<KufarChat>(
    `SELECT * FROM kufar_chats WHERE id = ? LIMIT 1`,
    [deterministicChatId]
  );

  if (!existingChat && adId) {
    existingChat = await queryOne<KufarChat>(
      `SELECT * FROM kufar_chats WHERE kufar_ad_id = ? AND LOWER(client_name) = LOWER(?) LIMIT 1`,
      [adId, clientName]
    );
  }

  const dbNow = formatDateForDb(nowIso);
  let createdChat = false;
  const targetChatId = existingChat ? existingChat.id : deterministicChatId;

  if (!existingChat) {
    createdChat = true;
    await execute(
      `INSERT INTO kufar_chats (
        id, kufar_ad_id, ad_title, client_name, client_phone,
        last_message, last_message_date, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        targetChatId,
        adId || null,
        payload.adTitle || (adId ? `Объявление Kufar #${adId}` : 'Обращение с Kufar'),
        clientName,
        extractedPhone || null,
        cleanText,
        nowIso,
        sender === 'client' ? 'new' : 'active',
        dbNow,
      ]
    );
  } else {
    const duplicate = await queryOne<KufarMessage>(
      `SELECT * FROM kufar_messages
       WHERE chat_id = ? AND (id = ? OR (sender = ? AND text = ?))
       LIMIT 1`,
      [targetChatId, msgId, sender, cleanText]
    );

    if (duplicate) {
      return {
        chat: existingChat,
        message: duplicate,
        createdChat: false,
        duplicated: true,
      };
    }

    await execute(
      `UPDATE kufar_chats
       SET kufar_ad_id = COALESCE(kufar_ad_id, ?),
           ad_title = COALESCE(?, ad_title),
           client_phone = COALESCE(client_phone, ?),
           last_message = ?,
           last_message_date = ?,
           status = CASE WHEN ? = 'client' THEN 'new' ELSE status END
       WHERE id = ?`,
      [
        adId || null,
        payload.adTitle || null,
        extractedPhone || null,
        cleanText,
        nowIso,
        sender,
        targetChatId,
      ]
    );
  }

  await execute(
    `INSERT INTO kufar_messages (id, chat_id, sender, text, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [msgId, targetChatId, sender, cleanText, dbNow]
  );

  const finalChat = await queryOne<KufarChat>(
    'SELECT * FROM kufar_chats WHERE id = ? LIMIT 1',
    [targetChatId]
  );
  const finalMsg = await queryOne<KufarMessage>(
    'SELECT * FROM kufar_messages WHERE id = ? LIMIT 1',
    [msgId]
  );

  return {
    chat: finalChat || {
      id: targetChatId,
      kufar_ad_id: adId || null,
      ad_title: payload.adTitle || null,
      client_name: clientName,
      client_phone: extractedPhone || null,
      last_message: cleanText,
      last_message_date: nowIso,
      status: sender === 'client' ? 'new' : 'active',
      created_at: dbNow,
    },
    message: finalMsg || {
      id: msgId,
      chat_id: targetChatId,
      sender,
      text: cleanText,
      created_at: dbNow,
    },
    createdChat,
    duplicated: false,
  };
}

export async function updateKufarChatStatus(chatId: string, status: string): Promise<boolean> {
  if (isDbMockMode()) {
    const store = getMemoryStore();
    const chat = store.chats.find((c) => c.id === chatId);
    if (!chat) return false;
    chat.status = status;
    return true;
  }
  const result = await execute('UPDATE kufar_chats SET status = ? WHERE id = ?', [status, chatId]);
  return result.affectedRows > 0;
}
