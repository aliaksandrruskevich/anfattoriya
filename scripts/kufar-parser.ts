/**
 * Kufar Messaging Sync (HTTP API eapi.kufar.by) for Fattoria CRM
 *
 * Работает без браузера (Puppeteer вынесен в scripts/kufar-parser-browser.ts).
 * Подходит для запуска по cron на хостинге CloudLinux/LVE.
 *
 * Переменные .env:
 *   KUFAR_LOGIN=...
 *   KUFAR_PASSWORD=...
 *   CRM_API_URL=https://ваш-домен.by   (по умолчанию http://localhost:3000)
 *   KUFAR_SYNC_SECRET=...
 *
 * Опционально:
 *   KUFAR_TOKEN_PATH=kufar-token.json
 *   KUFAR_POLL_INTERVAL_MS=90000       (в --watch режиме минимум 60000 мс)
 *   KUFAR_CONV_LIMIT=30                (1..99)
 *   KUFAR_MSG_LIMIT=50                 (1..99)
 *
 * Запуск:
 *   npx tsx scripts/kufar-parser.ts
 *   npx tsx scripts/kufar-parser.ts --watch
 */

import dotenv from 'dotenv';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  KufarApiClient,
  KufarAuthError,
  type KufarApiMessage,
  type KufarConversationSummary,
} from './kufar-api-client';
import { extractBelarusPhone, extractKufarAdId } from '../src/lib/kufarUtils';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface ScrapedMessage {
  chatId: string;
  kufarAdId?: string;
  adUrl?: string;
  adTitle?: string;
  clientName: string;
  client_phone?: string;
  sender: 'client' | 'agent';
  text: string;
  createdAt: string;
  externalMessageId: string;
}

const CRM_API_URL = (process.env.CRM_API_URL || 'http://localhost:3000').replace(/\/+$/, '');
const STATE_PATH = path.resolve(process.cwd(), 'scripts/.kufar-sync-state.json');
const LOCK_PATH = path.resolve(process.cwd(), 'scripts/.kufar-parser.lock');
const WATCH_MODE = process.argv.includes('--watch');

const MIN_POLL_INTERVAL_MS = 60_000;
const DEFAULT_POLL_INTERVAL_MS = 90_000;
const CRM_TIMEOUT_MS = 15_000;

function resolvePollIntervalMs(): number {
  const raw = Number(process.env.KUFAR_POLL_INTERVAL_MS || DEFAULT_POLL_INTERVAL_MS);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_POLL_INTERVAL_MS;
  return Math.max(MIN_POLL_INTERVAL_MS, Math.trunc(raw));
}

function resolveLimit(envValue: string | undefined, fallback: number): number {
  const parsed = Number(envValue || fallback);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(99, Math.max(1, Math.trunc(parsed)));
}

const POLL_INTERVAL_MS = resolvePollIntervalMs();
const CONV_LIMIT = resolveLimit(process.env.KUFAR_CONV_LIMIT, 30);
const MSG_LIMIT = resolveLimit(process.env.KUFAR_MSG_LIMIT, 50);

function getSyncToken(): string {
  const explicit = (process.env.KUFAR_SYNC_SECRET || '').trim();
  if (explicit) return explicit;
  const password = (process.env.KUFAR_PASSWORD || process.env.KUFAR_PASS || '').trim();
  const seed = password || process.env.SESSION_SECRET || '';
  return seed
    ? crypto.createHmac('sha256', seed).update('fattoria-kufar-sync').digest('hex')
    : '';
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isProcessAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err: any) {
    return err?.code === 'EPERM';
  }
}

async function acquireLock(): Promise<boolean> {
  await fs.mkdir(path.dirname(LOCK_PATH), { recursive: true });

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const handle = await fs.open(LOCK_PATH, 'wx', 0o600);
      await handle.writeFile(
        JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }),
        'utf8'
      );
      await handle.close();
      return true;
    } catch (err: any) {
      if (err?.code !== 'EEXIST') throw err;

      let existingPid = 0;
      try {
        const raw = await fs.readFile(LOCK_PATH, 'utf8');
        const parsed = JSON.parse(raw) as { pid?: unknown };
        existingPid = typeof parsed?.pid === 'number' ? parsed.pid : 0;
      } catch {
        existingPid = 0;
      }

      if (existingPid > 0 && existingPid !== process.pid && isProcessAlive(existingPid)) {
        return false;
      }

      // Устаревший lock-файл от завершившегося процесса
      await fs.unlink(LOCK_PATH).catch(() => {});
    }
  }

  return false;
}

async function releaseLock(): Promise<void> {
  try {
    const raw = await fs.readFile(LOCK_PATH, 'utf8');
    const parsed = JSON.parse(raw) as { pid?: unknown };
    if (parsed?.pid === process.pid) {
      await fs.unlink(LOCK_PATH).catch(() => {});
    }
  } catch {
    // lock уже удалён
  }
}

async function loadSyncedIds(): Promise<Set<string>> {
  try {
    const raw = await fs.readFile(STATE_PATH, 'utf8');
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

async function saveSyncedIds(ids: Set<string>): Promise<void> {
  const recent = Array.from(ids).slice(-5000);
  await fs.mkdir(path.dirname(STATE_PATH), { recursive: true });
  await fs.writeFile(STATE_PATH, JSON.stringify(recent, null, 2), {
    encoding: 'utf8',
    mode: 0o600,
  });
}

function buildFallbackMessageId(
  chatId: string,
  sender: 'client' | 'agent',
  createdAt: string,
  text: string
): string {
  const hash = crypto
    .createHash('sha256')
    .update(`${chatId}::${sender}::${createdAt}::${text.trim()}`)
    .digest('hex')
    .slice(0, 16);
  return `kf-${chatId}-${hash}`;
}

function normalizeIsoDate(rawDate: string | null | undefined): string {
  if (!rawDate) return new Date().toISOString();
  const ts = Date.parse(rawDate);
  if (Number.isNaN(ts)) return new Date().toISOString();
  return new Date(ts).toISOString();
}

function resolveSender(
  msg: KufarApiMessage,
  partnerId: number | string | null | undefined
): 'client' | 'agent' {
  if (partnerId !== undefined && partnerId !== null && msg.sender_id !== undefined && msg.sender_id !== null) {
    return String(msg.sender_id) === String(partnerId) ? 'client' : 'agent';
  }
  return 'client';
}

function mapApiMessageToScraped(
  conv: KufarConversationSummary,
  msg: KufarApiMessage,
  partnerId: number | string | null | undefined,
  adIdRaw: number | string | null | undefined,
  adLinkRaw: string | null | undefined,
  subjectRaw: string | null | undefined,
  partnerNameRaw: string | null | undefined
): ScrapedMessage | null {
  const text = String(msg.text || '').trim();
  if (!text) return null;

  const conversationId = String(conv.conversation_id || '').trim();
  if (!conversationId) return null;

  const chatId = `kufar-${conversationId}`;
  const sender = resolveSender(msg, partnerId);
  const createdAt = normalizeIsoDate(msg.date);

  const adUrl = (adLinkRaw || '').trim() || undefined;
  const kufarAdId =
    (adIdRaw !== undefined && adIdRaw !== null && String(adIdRaw).trim()) ||
    extractKufarAdId(adUrl) ||
    extractKufarAdId(text) ||
    undefined;
  const finalAdUrl = adUrl || (kufarAdId ? `https://www.kufar.by/item/${kufarAdId}` : undefined);

  const clientName = (partnerNameRaw || 'Клиент Kufar').trim() || 'Клиент Kufar';
  const adTitle = (subjectRaw || '').trim() || undefined;

  const externalMessageId = msg.message_id
    ? `kf-${conversationId}-${String(msg.message_id).trim()}`
    : buildFallbackMessageId(chatId, sender, createdAt, text);

  const clientPhone = sender === 'client' ? extractBelarusPhone(text) || undefined : undefined;

  return {
    chatId,
    kufarAdId,
    adUrl: finalAdUrl,
    adTitle,
    clientName,
    ...(clientPhone ? { client_phone: clientPhone } : {}),
    sender,
    text,
    createdAt,
    externalMessageId,
  };
}

async function sendToCrm(messages: ScrapedMessage[]): Promise<void> {
  if (!messages.length) return;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getSyncToken();
  if (token) {
    headers['x-sync-secret'] = token;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CRM_TIMEOUT_MS);

  try {
    const res = await fetch(`${CRM_API_URL}/api/chats/sync`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`CRM HTTP ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = (await res.json()) as { processed?: number; createdChats?: number };
    console.log(
      `[Kufar Parser] Синхронизировано сообщений: ${data.processed ?? messages.length}, новых чатов: ${data.createdChats ?? 0}`
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function syncKufarOnce(
  client: KufarApiClient,
  syncedIds: Set<string>
): Promise<number> {
  const listResp = await client.getConversations(CONV_LIMIT, 0);
  const conversations = Array.isArray(listResp?.conversations) ? listResp.conversations : [];
  console.log(`[Kufar Parser] Получено диалогов: ${conversations.length}`);

  const newMessages: ScrapedMessage[] = [];
  const seenInBatch = new Set<string>();

  for (const conv of conversations) {
    if (!conv?.conversation_id) continue;

    try {
      const detail = await client.getConversationMessages(conv.conversation_id, MSG_LIMIT, 0);
      const messages = Array.isArray(detail?.messages) ? detail.messages : [];

      const partnerId = detail?.partner_id ?? conv.partner_id;
      const adId = detail?.ad_id ?? conv.ad_id;
      const adLink = detail?.ad_link ?? conv.ad_link;
      const subject = detail?.subject ?? conv.subject;
      const partnerName = detail?.partner_name ?? conv.partner_name;

      for (const m of messages) {
        const mapped = mapApiMessageToScraped(
          conv,
          m,
          partnerId,
          adId,
          adLink,
          subject,
          partnerName
        );
        if (!mapped) continue;

        if (!syncedIds.has(mapped.externalMessageId) && !seenInBatch.has(mapped.externalMessageId)) {
          seenInBatch.add(mapped.externalMessageId);
          newMessages.push(mapped);
        }
      }
    } catch (err: any) {
      if (err instanceof KufarAuthError) {
        throw err;
      }
      const msg = client.sanitizeText(err?.message || String(err));
      console.warn(`[Kufar Parser] Ошибка чтения диалога ${conv.conversation_id}: ${msg}`);
    }
  }

  if (newMessages.length === 0) {
    console.log('[Kufar Parser] Новых сообщений нет.');
    return 0;
  }

  newMessages.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));

  // Фиксируем syncedIds строго ПОСЛЕ успешного ответа CRM
  await sendToCrm(newMessages);
  for (const m of newMessages) {
    syncedIds.add(m.externalMessageId);
  }
  await saveSyncedIds(syncedIds);

  return newMessages.length;
}

async function main() {
  const client = new KufarApiClient();
  if (!client.hasCredentials()) {
    console.error('[Kufar Parser] Укажите KUFAR_LOGIN и KUFAR_PASSWORD в файле .env.');
    process.exit(1);
  }

  if (!getSyncToken()) {
    console.warn(
      '[Kufar Parser] Предупреждение: не задан KUFAR_SYNC_SECRET — запросы к /api/chats/sync могут быть отклонены с 401.'
    );
  }

  const locked = await acquireLock();
  if (!locked) {
    console.log('[Kufar Parser] Предыдущий запуск ещё выполняется (lock активен). Пропускаю.');
    return;
  }

  let shouldStop = false;
  const handleSignal = async (signal: string) => {
    shouldStop = true;
    console.log(`[Kufar Parser] Получен сигнал ${signal}, завершаю работу...`);
    await releaseLock();
    process.exit(0);
  };

  process.once('SIGINT', () => void handleSignal('SIGINT'));
  process.once('SIGTERM', () => void handleSignal('SIGTERM'));

  try {
    const syncedIds = await loadSyncedIds();
    await syncKufarOnce(client, syncedIds);

    if (WATCH_MODE) {
      console.log(
        `[Kufar Parser] Режим наблюдения активен (интервал ${POLL_INTERVAL_MS} мс)...`
      );
      while (!shouldStop) {
        await sleep(POLL_INTERVAL_MS);
        if (shouldStop) break;
        try {
          await syncKufarOnce(client, syncedIds);
        } catch (err: any) {
          const msg = client.sanitizeText(err?.message || String(err));
          console.error(`[Kufar Parser] Ошибка цикла опроса: ${msg}`);
        }
      }
    }
  } finally {
    await releaseLock();
  }
}

const isDirectExecution =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);

if (isDirectExecution) {
  main().catch(async (err) => {
    const rawMsg = err?.message || String(err);
    console.error('[Kufar Parser] Критическая ошибка:', rawMsg);
    await releaseLock();
    process.exit(1);
  });
}
