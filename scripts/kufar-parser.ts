/**
 * Kufar Messaging Scraper (Puppeteer) for Fattoria CRM
 *
 * Скрипт запускается локально или на VPS в фоне:
 *   npm install puppeteer
 *   npx tsx scripts/kufar-parser.ts
 *   npx tsx scripts/kufar-parser.ts --watch   (опрос каждые 30 секунд)
 *
 * Переменные окружения:
 *   CRM_API_URL=https://fattoria.by (по умолчанию http://localhost:3000)
 *   KUFAR_COOKIES_PATH=./kufar-cookies.json
 *   KUFAR_POLL_INTERVAL_MS=30000
 */

import fs from 'node:fs/promises';
import path from 'node:path';

interface ScrapedMessage {
  chatId: string;
  kufarAdId?: string;
  adUrl?: string;
  adTitle?: string;
  clientName: string;
  sender: 'client' | 'agent';
  text: string;
  createdAt: string;
  externalMessageId: string;
}

const CRM_API_URL = (process.env.CRM_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const COOKIES_PATH = path.resolve(
  process.cwd(),
  process.env.KUFAR_COOKIES_PATH || 'kufar-cookies.json'
);
const STATE_PATH = path.resolve(process.cwd(), 'scripts/.kufar-sync-state.json');
const POLL_INTERVAL_MS = Number(process.env.KUFAR_POLL_INTERVAL_MS || 30000);
const WATCH_MODE = process.argv.includes('--watch');

async function loadCookies(): Promise<any[]> {
  try {
    const raw = await fs.readFile(COOKIES_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('kufar-cookies.json должен содержать JSON-массив cookies');
    }
    return parsed.map((c) => ({
      ...c,
      domain: c.domain || '.kufar.by',
      path: c.path || '/',
    }));
  } catch (err: any) {
    console.error(`[Kufar Parser] Не удалось загрузить cookies из ${COOKIES_PATH}:`, err.message);
    console.error('[Kufar Parser] Экспортируйте авторизованные cookies Kufar в файл kufar-cookies.json');
    process.exit(1);
  }
}

async function loadSyncedIds(): Promise<Set<string>> {
  try {
    const raw = await fs.readFile(STATE_PATH, 'utf-8');
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

async function saveSyncedIds(ids: Set<string>): Promise<void> {
  const recent = Array.from(ids).slice(-5000);
  await fs.writeFile(STATE_PATH, JSON.stringify(recent, null, 2), 'utf-8');
}

function buildMessageHash(chatId: string, sender: string, text: string, index: number): string {
  const normalized = `${chatId}::${sender}::${text.trim()}::${index}`;
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }
  return `kf-${chatId}-${hash.toString(16)}`;
}

async function sendToCrm(messages: ScrapedMessage[]): Promise<void> {
  if (!messages.length) return;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (process.env.KUFAR_SYNC_SECRET) {
    headers['x-sync-secret'] = process.env.KUFAR_SYNC_SECRET;
  }

  const res = await fetch(`${CRM_API_URL}/api/chats/sync`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }

  const data = await res.json();
  console.log(
    `[Kufar Parser] Синхронизировано сообщений: ${data.processed ?? messages.length}, новых чатов: ${data.createdChats ?? 0}`
  );
}

async function scrapeKufarOnce(page: any, syncedIds: Set<string>): Promise<void> {
  console.log('[Kufar Parser] Открываю страницу сообщений Kufar...');
  await page.goto('https://www.kufar.by/account/messaging', {
    waitUntil: 'networkidle2',
    timeout: 60000,
  });

  // Ждём появления списка диалогов или сообщения о пустом списке
  await page
    .waitForSelector('[data-testid*="dialog"], [class*="dialog"], [class*="conversation"], a[href*="/account/messaging/"]', {
      timeout: 15000,
    })
    .catch(() => {
      console.warn('[Kufar Parser] Таймаут ожидания списка диалогов (проверьте cookies авторизации)');
    });

  // Получаем список ссылок/элементов диалогов
  const dialogLinks: { href: string; clientName: string; adTitle: string }[] = await page.evaluate(() => {
    const items: { href: string; clientName: string; adTitle: string }[] = [];
    const anchors = Array.from(
      document.querySelectorAll('a[href*="/account/messaging/"]')
    ) as HTMLAnchorElement[];

    for (const a of anchors) {
      const href = a.href;
      if (!href || items.some((x) => x.href === href)) continue;
      const lines = (a.innerText || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      items.push({
        href,
        clientName: lines[0] || 'Клиент Kufar',
        adTitle: lines[1] || '',
      });
    }
    return items.slice(0, 30);
  });

  console.log(`[Kufar Parser] Найдено диалогов: ${dialogLinks.length}`);

  const newMessages: ScrapedMessage[] = [];

  for (const dialog of dialogLinks) {
    try {
      await page.goto(dialog.href, { waitUntil: 'networkidle2', timeout: 45000 });
      await new Promise((r) => setTimeout(r, 1200));

      const chatMatch = dialog.href.match(/\/account\/messaging\/([^/?#]+)/i);
      const chatId = chatMatch?.[1] ? `kufar-${chatMatch[1]}` : `kufar-${Date.now()}`;

      const extracted = await page.evaluate(() => {
        const adAnchor = document.querySelector(
          'a[href*="/item/"], a[href*="re.kufar.by"]'
        ) as HTMLAnchorElement | null;
        const adUrl = adAnchor?.href || '';
        const adTitle = adAnchor?.innerText?.trim() || '';

        const headerEl = document.querySelector(
          'h1, h2, [data-testid*="user-name"], [class*="companion"], [class*="opponent"]'
        ) as HTMLElement | null;
        const clientName = headerEl?.innerText?.trim() || '';

        const msgNodes = Array.from(
          document.querySelectorAll(
            '[data-testid*="message"], [class*="message-item"], [class*="messageBubble"], [class*="bubble"]'
          )
        ) as HTMLElement[];

        const msgs = msgNodes
          .map((el) => {
            const text = (el.innerText || '').trim();
            if (!text) return null;

            const cls = (el.className || '').toLowerCase();
            const testId = (el.getAttribute('data-testid') || '').toLowerCase();
            const styleAlign = window.getComputedStyle(el).alignSelf;
            const isAgent =
              cls.includes('outgoing') ||
              cls.includes('own') ||
              cls.includes('self') ||
              cls.includes('sent') ||
              testId.includes('outgoing') ||
              styleAlign === 'flex-end';

            return {
              sender: isAgent ? ('agent' as const) : ('client' as const),
              text,
            };
          })
          .filter(Boolean) as { sender: 'client' | 'agent'; text: string }[];

        return { adUrl, adTitle, clientName, msgs };
      });

      const adIdMatch = extracted.adUrl.match(/\/(\d{5,15})(?:[/?#]|$)/);
      const kufarAdId = adIdMatch?.[1];
      const finalClientName = extracted.clientName || dialog.clientName || 'Клиент Kufar';
      const finalAdTitle = extracted.adTitle || dialog.adTitle || undefined;

      extracted.msgs.forEach((m, idx) => {
        const extId = buildMessageHash(chatId, m.sender, m.text, idx);
        if (!syncedIds.has(extId)) {
          syncedIds.add(extId);
          newMessages.push({
            chatId,
            kufarAdId,
            adUrl: extracted.adUrl || undefined,
            adTitle: finalAdTitle,
            clientName: finalClientName,
            sender: m.sender,
            text: m.text,
            createdAt: new Date().toISOString(),
            externalMessageId: extId,
          });
        }
      });
    } catch (err: any) {
      console.warn(`[Kufar Parser] Ошибка чтения диалога ${dialog.href}:`, err.message);
    }
  }

  if (newMessages.length > 0) {
    await sendToCrm(newMessages);
    await saveSyncedIds(syncedIds);
  } else {
    console.log('[Kufar Parser] Новых сообщений нет.');
  }
}

async function main() {
  const cookies = await loadCookies();
  const syncedIds = await loadSyncedIds();

  let puppeteer: any;
  try {
    const modName = 'puppeteer';
    puppeteer = (await import(modName)).default;
  } catch {
    console.error('[Kufar Parser] Пакет puppeteer не установлен. Установите: npm install puppeteer');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    );
    await page.setCookie(...cookies);

    await scrapeKufarOnce(page, syncedIds);

    if (WATCH_MODE) {
      console.log(`[Kufar Parser] Режим наблюдения активен (интервал ${POLL_INTERVAL_MS} мс)...`);
      while (true) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        try {
          await scrapeKufarOnce(page, syncedIds);
        } catch (err: any) {
          console.error('[Kufar Parser] Ошибка цикла опроса:', err.message);
        }
      }
    }
  } finally {
    if (!WATCH_MODE) {
      await browser.close();
    }
  }
}

main().catch((err) => {
  console.error('[Kufar Parser] Критическая ошибка:', err);
  process.exit(1);
});
