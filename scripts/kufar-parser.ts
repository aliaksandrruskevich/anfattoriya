/**
 * Kufar Messaging Scraper (Puppeteer) for Fattoria CRM
 *
 * Авторизуется на Kufar по логину и паролю из файла .env:
 *   KUFAR_LOGIN=...
 *   KUFAR_PASSWORD=...
 *
 * Также поддерживает кеширование cookies (kufar-cookies.json), чтобы не логиниться
 * при каждом опросе, с автоматическим повторным входом при истечении сессии.
 *
 * Запуск:
 *   npm install puppeteer
 *   npx tsx scripts/kufar-parser.ts
 *   npx tsx scripts/kufar-parser.ts --watch   (опрос каждые 30 секунд)
 *
 * Дополнительные переменные окружения (.env):
 *   CRM_API_URL=https://fattoria.by (по умолчанию http://localhost:3000)
 *   KUFAR_SYNC_SECRET=...
 *   KUFAR_COOKIES_PATH=./kufar-cookies.json
 *   KUFAR_POLL_INTERVAL_MS=30000
 */

import dotenv from 'dotenv';
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadCookiesOptional(): Promise<any[] | null> {
  try {
    const raw = await fs.readFile(COOKIES_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return null;
    }
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
      console.log(`[Kufar Parser] Cookies сессии сохранены (${cookies.length} шт.)`);
    }
  } catch (err: any) {
    console.warn('[Kufar Parser] Не удалось сохранить cookies:', err.message);
  }
}

async function isLoginRequired(page: any): Promise<boolean> {
  const url = page.url();
  if (url.includes('login_popup') || url.includes('/login')) {
    return true;
  }
  return await page.evaluate(() => {
    const loginBtn = document.querySelector('[data-testid="login_button"]');
    const passInput = document.querySelector('input[type="password"]');
    const modal = document.querySelector('[data-testid="modal-container"]');
    const modalText = (modal?.textContent || '').toLowerCase();
    const hasLoginModal = Boolean(
      modal && (modalText.includes('вход') || modalText.includes('войти') || modalText.includes('парол'))
    );
    return Boolean(loginBtn || passInput || hasLoginModal);
  });
}

async function findFirstVisibleSelector(page: any, selectors: string[]): Promise<string | null> {
  for (const sel of selectors) {
    const handle = await page.$(sel);
    if (!handle) continue;
    const isVisible = await page.evaluate((el: HTMLElement) => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    }, handle);
    if (isVisible) return sel;
  }
  return null;
}

async function loginToKufar(page: any): Promise<void> {
  if (!KUFAR_LOGIN || !KUFAR_PASSWORD) {
    throw new Error(
      'Не заданы KUFAR_LOGIN и KUFAR_PASSWORD в файле .env (и отсутствуют действительные cookies).'
    );
  }

  console.log('[Kufar Parser] Выполняю вход на Kufar по логину и паролю из .env...');

  // Открываем страницу сообщений (или нажимаем кнопку входа, если попап еще не открыт)
  if (!page.url().includes('kufar.by')) {
    await page.goto('https://www.kufar.by/account/messaging/', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });
  }

  const loginBtn = await page.$('[data-testid="login_button"]');
  if (loginBtn) {
    await loginBtn.click().catch(() => {});
    await sleep(1000);
  }

  // Если форма входа ещё не появилась, переходим напрямую на URL с login_popup=1
  const initialInput = await findFirstVisibleSelector(page, [
    '[data-testid="modal-container"] input[name="login"]',
    '[data-testid="modal-container"] input[name="email"]',
    '[data-testid="modal-container"] input[type="email"]',
    '[data-testid="modal-container"] input[type="tel"]',
    '[data-testid="modal-container"] input[type="text"]',
    'input[name="login"]',
    'input[name="email"]',
    'input[type="email"]',
    'input[autocomplete="username"]',
  ]);

  if (!initialInput) {
    await page.goto('https://www.kufar.by/l?login_popup=1', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });
    await sleep(1200);
  }

  const loginSelectors = [
    '[data-testid="modal-container"] input[name="login"]',
    '[data-testid="modal-container"] input[name="email"]',
    '[data-testid="modal-container"] input[type="email"]',
    '[data-testid="modal-container"] input[type="tel"]',
    '[data-testid="modal-container"] input[autocomplete="username"]',
    '[data-testid="modal-container"] input[type="text"]',
    'input[name="login"]',
    'input[name="email"]',
    'input[type="email"]',
    'input[autocomplete="username"]',
  ];

  const loginSel = await findFirstVisibleSelector(page, loginSelectors);
  if (!loginSel) {
    throw new Error('Не найдено поле ввода логина на странице авторизации Kufar.');
  }

  await page.click(loginSel, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type(loginSel, KUFAR_LOGIN, { delay: 35 });

  // Проверяем, видно ли сразу поле пароля, или вход двухшаговый (сначала логин -> далее -> пароль)
  const passwordSelectors = [
    '[data-testid="modal-container"] input[type="password"]',
    '[data-testid="modal-container"] input[name="password"]',
    'input[type="password"]',
    'input[name="password"]',
  ];

  let passSel = await findFirstVisibleSelector(page, passwordSelectors);
  if (!passSel) {
    const nextBtnSel = await findFirstVisibleSelector(page, [
      '[data-testid="modal-container"] button[type="submit"]',
      'form button[type="submit"]',
    ]);
    if (nextBtnSel) {
      await page.click(nextBtnSel);
      await sleep(1500);
      passSel = await findFirstVisibleSelector(page, passwordSelectors);
    }
  }

  if (!passSel) {
    throw new Error('Не найдено поле ввода пароля на форме входа Kufar.');
  }

  await page.click(passSel, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type(passSel, KUFAR_PASSWORD, { delay: 35 });

  const submitSel = await findFirstVisibleSelector(page, [
    '[data-testid="modal-container"] button[type="submit"]',
    'form button[type="submit"]',
  ]);

  if (submitSel) {
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {}),
      page.click(submitSel),
    ]);
  } else {
    await page.keyboard.press('Enter');
    await sleep(3000);
  }

  await sleep(2500);

  // Проверяем, не запросил ли Kufar капчу / SMS-код или не вернул ошибку пароля
  const authIssue = await page.evaluate(() => {
    const modal = document.querySelector('[data-testid="modal-container"]');
    const text = (modal?.textContent || document.body?.innerText || '').toLowerCase();
    if (text.includes('неверный') || text.includes('ошибка авторизации')) {
      return 'Kufar отклонил логин или пароль. Проверьте KUFAR_LOGIN и KUFAR_PASSWORD в .env.';
    }
    if (text.includes('подтверд') && (text.includes('смс') || text.includes('код'))) {
      return 'Kufar запросил одноразовый SMS-код/подтверждение. Пройдите вход один раз вручную или сохраните cookies.';
    }
    if (document.querySelector('iframe[src*="captcha"], iframe[src*="recaptcha"]')) {
      return 'Kufar показал CAPTCHA. Пройдите проверку вручную или обновите kufar-cookies.json.';
    }
    return null;
  });

  if (authIssue) {
    throw new Error(authIssue);
  }

  await page.goto('https://www.kufar.by/account/messaging/', {
    waitUntil: 'networkidle2',
    timeout: 60000,
  });

  if (await isLoginRequired(page)) {
    throw new Error('После отправки формы входа Kufar сессия не подтверждена.');
  }

  await saveCookies(page);
  console.log('[Kufar Parser] Успешный вход на Kufar по данным из .env!');
}

async function ensureAuthenticated(page: any): Promise<void> {
  await page.goto('https://www.kufar.by/account/messaging/', {
    waitUntil: 'networkidle2',
    timeout: 60000,
  });
  await sleep(1500);

  if (await isLoginRequired(page)) {
    console.log('[Kufar Parser] Требуется авторизация на Kufar...');
    await loginToKufar(page);
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
  console.log('[Kufar Parser] Проверяю сессию и открываю сообщения Kufar...');
  await ensureAuthenticated(page);

  await page
    .waitForSelector(
      '[data-testid*="dialog"], [class*="dialog"], [class*="conversation"], a[href*="/account/messaging/"]',
      { timeout: 15000 }
    )
    .catch(() => {
      console.warn('[Kufar Parser] Список диалогов не появился за 15 сек (проверьте наличие чатов).');
    });

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
  const cookies = await loadCookiesOptional();
  if (!cookies && (!KUFAR_LOGIN || !KUFAR_PASSWORD)) {
    console.error(
      '[Kufar Parser] Укажите KUFAR_LOGIN и KUFAR_PASSWORD в файле .env (или экспортируйте kufar-cookies.json).'
    );
    process.exit(1);
  }

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
