/**
 * Kufar Messaging Scraper (Puppeteer fallback) for Fattoria CRM
 *
 * Резервная браузерная реализация (Puppeteer).
 * Основной легковесный клиент без браузера находится в scripts/kufar-parser.ts
 * и scripts/kufar-api-client.ts.
 *
 * Запуск:
 *   npx tsx scripts/kufar-parser-browser.ts
 *   npx tsx scripts/kufar-parser-browser.ts --watch
 */

import dotenv from 'dotenv';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

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

const KUFAR_LOGIN = (
  process.env.KUFAR_LOGIN ||
  process.env.KUFAR_EMAIL ||
  process.env.KUFAR_PHONE ||
  process.env.KUFAR_USER ||
  process.env.KUFAR_USERNAME ||
  ''
).trim();

const KUFAR_PASSWORD = (
  process.env.KUFAR_PASSWORD ||
  process.env.KUFAR_PASS ||
  ''
).trim();

function getSyncToken(): string {
  const explicit = (process.env.KUFAR_SYNC_SECRET || '').trim();
  if (explicit) return explicit;
  const seed = KUFAR_PASSWORD || process.env.SESSION_SECRET || '';
  return seed
    ? crypto.createHmac('sha256', seed).update('fattoria-kufar-sync').digest('hex')
    : '';
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadCookiesOptional(): Promise<any[] | null> {
  try {
    const raw = await fs.readFile(COOKIES_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed.map((c) => ({
      ...c,
      domain: c.domain || '.kufar.by',
      path: c.path || '/',
    }));
  } catch {
    return null;
  }
}

async function saveCookies(page: any): Promise<void> {
  try {
    const cookies = await page.cookies();
    if (Array.isArray(cookies) && cookies.length > 0) {
      await fs.writeFile(COOKIES_PATH, JSON.stringify(cookies, null, 2), {
        encoding: 'utf-8',
        mode: 0o600,
      });
    }
  } catch {
    // ignore
  }
}

async function dismissCookieBanner(page: any): Promise<void> {
  await page
    .evaluate(() => {
      const closeBtn = document.querySelector('[data-testid="popup-close"]') as HTMLElement | null;
      if (closeBtn) closeBtn.click();
      const btns = Array.from(document.querySelectorAll('button'));
      const accept = btns.find((b) =>
        /^(принять|согласиться|принять все|ok|хорошо)$/i.test((b.innerText || '').trim())
      );
      if (accept) (accept as HTMLElement).click();
    })
    .catch(() => {});
}

async function isMessagingAuthenticated(page: any): Promise<boolean> {
  return await page.evaluate(() => {
    const hasLoginBtn = Boolean(document.querySelector('[data-testid="login_button"]'));
    const hasGuestBtn = Array.from(document.querySelectorAll('button')).some(
      (b) => (b.innerText || '').trim() === 'Войти'
    );
    const hasPassInput = Boolean(document.querySelector('input[name="password"], input[type="password"]'));
    return !hasLoginBtn && !hasGuestBtn && !hasPassInput;
  });
}

async function loginToKufar(page: any): Promise<void> {
  if (!KUFAR_LOGIN || !KUFAR_PASSWORD) {
    throw new Error('Укажите KUFAR_LOGIN и KUFAR_PASSWORD в файле .env.');
  }

  console.log('[Kufar Parser] Вхожу на Kufar по логину и паролю из .env...');

  await page.goto('https://www.kufar.by/l', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await sleep(2500);
  await dismissCookieBanner(page);
  await sleep(600);

  const loginBtn = await page.$('[data-testid="login_button"]');
  if (loginBtn) {
    await loginBtn.click().catch(() => {});
    await sleep(2000);
  }

  let hasLoginInput = await page.$('input[name="login"]');
  if (!hasLoginInput) {
    await page.goto('https://www.kufar.by/l?login_popup=1', {
      waitUntil: 'domcontentloaded',
      timeout: 45000,
    });
    await sleep(2500);
    await dismissCookieBanner(page);
    await sleep(800);
    const popupBtn = await page.$('[data-testid="login_button"]');
    if (popupBtn) {
      await popupBtn.click().catch(() => {});
      await sleep(1800);
    }
    hasLoginInput = await page.$('input[name="login"]');
  }

  const loginSelector = hasLoginInput
    ? 'input[name="login"]'
    : 'input[name="email"], input[type="email"], input[autocomplete="username"]';

  await page.waitForSelector(loginSelector, { visible: true, timeout: 15000 });
  await page.click(loginSelector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type(loginSelector, KUFAR_LOGIN, { delay: 30 });

  const passSelector = 'input[name="password"], input[type="password"]';
  await page.waitForSelector(passSelector, { visible: true, timeout: 10000 });
  await page.click(passSelector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type(passSelector, KUFAR_PASSWORD, { delay: 30 });

  await page.evaluate(() => {
    const passEl = document.querySelector('input[name="password"], input[type="password"]');
    const form = passEl?.closest('form');
    const submitBtn =
      (form?.querySelector('button[type="submit"]') as HTMLElement | null) ||
      (Array.from(document.querySelectorAll('button[type="submit"]')).find(
        (b) => /войти|вход/i.test((b as HTMLElement).innerText || '')
      ) as HTMLElement | undefined);
    if (submitBtn) submitBtn.click();
  });

  await sleep(4000);
  await page
    .goto('https://www.kufar.by/account/messaging/', { waitUntil: 'networkidle2', timeout: 45000 })
    .catch(() => {});
  await sleep(2500);

  if (!(await isMessagingAuthenticated(page))) {
    throw new Error('Не удалось подтвердить вход на Kufar по данным из .env.');
  }

  await saveCookies(page);
  console.log('[Kufar Parser] Вход на Kufar выполнен успешно!');
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
  const token = getSyncToken();
  if (token) {
    headers['x-sync-secret'] = token;
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
  await page
    .goto('https://www.kufar.by/account/messaging/', { waitUntil: 'networkidle2', timeout: 45000 })
    .catch(() => {});
  await sleep(2500);

  if (!(await isMessagingAuthenticated(page))) {
    await loginToKufar(page);
  } else {
    await saveCookies(page);
  }

  await page.waitForSelector('a[href*="/account/messaging/"]', { timeout: 12000 }).catch(() => {});

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
      await page.goto(dialog.href, { waitUntil: 'networkidle2', timeout: 45000 }).catch(() => {});
      await sleep(1200);

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

            return { sender: isAgent ? ('agent' as const) : ('client' as const), text };
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
  const cookies = await loadCookiesOptional();
  if (!cookies && (!KUFAR_LOGIN || !KUFAR_PASSWORD)) {
    console.error('[Kufar Parser] Укажите KUFAR_LOGIN и KUFAR_PASSWORD в файле .env.');
    process.exit(1);
  }

  const syncedIds = await loadSyncedIds();
  const puppeteer = (await import('puppeteer')).default;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 900 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    );
    if (cookies) {
      await page.setCookie(...cookies);
    }

    await scrapeKufarOnce(page, syncedIds);

    if (WATCH_MODE) {
      console.log(`[Kufar Parser] Режим наблюдения активен (интервал ${POLL_INTERVAL_MS} мс)...`);
      while (true) {
        await sleep(POLL_INTERVAL_MS);
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
