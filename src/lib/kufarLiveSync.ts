import fs from 'node:fs/promises';
import { getKufarCredentials } from './kufarAuthConfig';
import { syncKufarIncomingMessage, type SyncKufarPayload } from './kufarChatsStore';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const globalSync = globalThis as unknown as {
  __kufarSyncPromise?: Promise<KufarSyncSummary>;
};

export interface KufarSyncSummary {
  ok: boolean;
  totalDialogs: number;
  processed: number;
  createdChats: number;
  message: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadSavedCookies(cookiesPath: string): Promise<any[] | null> {
  try {
    const raw = await fs.readFile(cookiesPath, 'utf-8');
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

async function saveCookies(page: any, cookiesPath: string): Promise<void> {
  try {
    const cookies = await page.cookies();
    if (Array.isArray(cookies) && cookies.length > 0) {
      await fs.writeFile(cookiesPath, JSON.stringify(cookies, null, 2), {
        encoding: 'utf-8',
        mode: 0o600,
      });
    }
  } catch {
    // ignore cookie cache write failure
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

async function authenticateWithEnvCredentials(
  page: any,
  login: string,
  password: string,
  cookiesPath: string
): Promise<void> {
  if (!login || !password) {
    throw new Error('В файле .env не заданы KUFAR_LOGIN и KUFAR_PASSWORD.');
  }

  await page.goto('https://www.kufar.by/l', {
    waitUntil: 'domcontentloaded',
    timeout: 45_000,
  });
  await sleep(2500);
  await dismissCookieBanner(page);
  await sleep(600);

  const loginBtn = await page.$('[data-testid="login_button"]');
  if (loginBtn) {
    await loginBtn.click().catch(() => {});
    await sleep(2000);
  } else {
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        (b) => (b.innerText || '').trim() === 'Войти'
      ) as HTMLElement | undefined;
      if (btn) btn.click();
    });
    await sleep(2000);
  }

  let hasLoginInput = await page.$('input[name="login"]');
  if (!hasLoginInput) {
    await page.goto('https://www.kufar.by/l?login_popup=1', {
      waitUntil: 'domcontentloaded',
      timeout: 45_000,
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

  await page.waitForSelector(loginSelector, { visible: true, timeout: 15_000 }).catch(() => {
    throw new Error('Не удалось открыть форму входа Kufar (поле логина не найдено).');
  });

  await page.click(loginSelector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type(loginSelector, login, { delay: 30 });

  const passSelector = 'input[name="password"], input[type="password"]';
  let passVisible = await page.$(passSelector);
  if (!passVisible) {
    await page.evaluate(() => {
      const formBtn = document.querySelector('form button[type="submit"]') as HTMLElement | null;
      if (formBtn) formBtn.click();
    });
    await sleep(1500);
    passVisible = await page.$(passSelector);
  }

  if (!passVisible) {
    throw new Error('Не найдено поле пароля на форме входа Kufar.');
  }

  await page.click(passSelector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type(passSelector, password, { delay: 30 });

  // Нажимаем submit внутри формы, где находится поле пароля
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

  const authProblem = await page.evaluate(() => {
    const modal = document.querySelector('[data-testid="modal-container"]');
    const text = (modal?.textContent || document.body?.innerText || '').toLowerCase();
    if (text.includes('неверный логин') || text.includes('неверный пароль') || text.includes('неверная пара')) {
      return 'Kufar отклонил логин или пароль. Проверьте KUFAR_LOGIN и KUFAR_PASSWORD в .env.';
    }
    if (text.includes('смс') && text.includes('код') && modal) {
      return 'Kufar запросил подтверждение по SMS. Подтвердите вход один раз в браузере.';
    }
    if (text.includes('неверно введена капча')) {
      return 'Kufar потребовал прохождение reCAPTCHA при входе с текущего IP сервера.';
    }
    return null;
  });

  if (authProblem) {
    throw new Error(authProblem);
  }

  await page.goto('https://www.kufar.by/account/messaging/', {
    waitUntil: 'networkidle2',
    timeout: 45_000,
  }).catch(() => {});
  await sleep(2500);

  if (!(await isMessagingAuthenticated(page))) {
    throw new Error('Не удалось подтвердить вход на Kufar по данным из .env.');
  }

  await saveCookies(page, cookiesPath);
}

function buildHashId(chatId: string, sender: string, text: string, index: number): string {
  const normalized = `${chatId}::${sender}::${text.trim()}::${index}`;
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }
  return `kf-${chatId}-${hash.toString(16)}`;
}

async function runSyncInternal(): Promise<KufarSyncSummary> {
  const { login, password, cookiesPath } = getKufarCredentials();
  if (!login || !password) {
    throw new Error('Укажите KUFAR_LOGIN и KUFAR_PASSWORD в файле .env.');
  }

  const modName = 'puppeteer';
  const puppeteer = (await import(/* webpackIgnore: true */ modName)).default;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let capturedJwt: string | null = null;
  const interceptedConversations: any[] = [];

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 900 });
    await page.setUserAgent(USER_AGENT);

    page.on('request', (req: any) => {
      const authHeader = req.headers()?.authorization || req.headers()?.Authorization;
      if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        capturedJwt = authHeader.slice(7).trim();
      }
    });

    page.on('response', async (res: any) => {
      try {
        const url = res.url();
        if (url.includes('/messaging-api/v4/conversations') && !url.includes('/messages') && res.ok()) {
          const json = await res.json().catch(() => null);
          const list = Array.isArray(json?.conversations)
            ? json.conversations
            : Array.isArray(json?.items)
              ? json.items
              : Array.isArray(json)
                ? json
                : [];
          if (list.length > 0) {
            interceptedConversations.push(...list);
          }
        }
      } catch {
        // ignore network sniff error
      }
    });

    const cachedCookies = await loadSavedCookies(cookiesPath);
    if (cachedCookies) {
      await page.setCookie(...cachedCookies);
    }

    await page
      .goto('https://www.kufar.by/account/messaging/', {
        waitUntil: 'networkidle2',
        timeout: 45_000,
      })
      .catch(() => {});
    await sleep(2500);

    if (!(await isMessagingAuthenticated(page))) {
      await authenticateWithEnvCredentials(page, login, password, cookiesPath);
    } else {
      await saveCookies(page, cookiesPath);
    }

    const payloads: SyncKufarPayload[] = [];
    let totalDialogs = 0;

    // 1. Пробуем забрать переписку напрямую через перехваченный JWT или API Kufar
    if (capturedJwt && interceptedConversations.length > 0) {
      totalDialogs = interceptedConversations.length;
      for (const conv of interceptedConversations.slice(0, 30)) {
        const rawConvId = String(conv.conversation_id || conv.id || '');
        if (!rawConvId) continue;
        const chatId = `kufar-${rawConvId}`;
        const adId = conv.ad_id ? String(conv.ad_id) : undefined;
        const adTitle = conv.ad_subject || conv.subject || conv.title || undefined;
        const clientName =
          conv.companion?.name ||
          conv.opponent?.name ||
          conv.participant_name ||
          'Клиент Kufar';
        const selfId = conv.owner_id || conv.user_id || null;

        const msgData = await page
          .evaluate(async (cid: string, jwt: string) => {
            try {
              const r = await fetch(
                `https://api.kufar.by/messaging-api/v4/conversations/${encodeURIComponent(cid)}/messages?limit=50&offset=0`,
                { headers: { Authorization: `Bearer ${jwt}` }, credentials: 'include' }
              );
              if (!r.ok) return null;
              return await r.json();
            } catch {
              return null;
            }
          }, rawConvId, capturedJwt)
          .catch(() => null);

        const msgs = Array.isArray(msgData?.messages)
          ? msgData.messages
          : Array.isArray(msgData?.items)
            ? msgData.items
            : [];

        msgs.forEach((m: any, idx: number) => {
          const text = String(m.text || m.body || m.message || '').trim();
          if (!text) return;
          const isAgent = Boolean(
            m.is_own ||
              m.from_me ||
              (selfId && m.sender_id && String(m.sender_id) === String(selfId))
          );
          const sender: 'agent' | 'client' = isAgent ? 'agent' : 'client';
          const extId = m.id
            ? `kf-${rawConvId}-${m.id}`
            : buildHashId(chatId, sender, text, idx);

          payloads.push({
            chatId,
            kufarAdId: adId,
            adUrl: adId ? `https://www.kufar.by/item/${adId}` : undefined,
            adTitle,
            clientName,
            sender,
            text,
            createdAt: m.created_at || m.timestamp || new Date().toISOString(),
            externalMessageId: extId,
          });
        });
      }
    }

    // 2. Fallback на DOM-парсинг диалогов, если API не вернул сообщения
    if (payloads.length === 0) {
      await page
        .waitForSelector('a[href*="/account/messaging/"]', { timeout: 10_000 })
        .catch(() => {});

      const dialogLinks: { href: string; clientName: string; adTitle: string }[] = await page.evaluate(
        () => {
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
          return items.slice(0, 25);
        }
      );

      totalDialogs = Math.max(totalDialogs, dialogLinks.length);

      for (const dialog of dialogLinks) {
        await page
          .goto(dialog.href, { waitUntil: 'networkidle2', timeout: 35_000 })
          .catch(() => {});
        await sleep(1000);

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

        extracted.msgs.forEach(
          (m: { sender: 'client' | 'agent'; text: string }, idx: number) => {
          payloads.push({
            chatId,
            kufarAdId,
            adUrl: extracted.adUrl || undefined,
            adTitle: finalAdTitle,
            clientName: finalClientName,
            sender: m.sender,
            text: m.text,
            createdAt: new Date().toISOString(),
            externalMessageId: buildHashId(chatId, m.sender, m.text, idx),
          });
        });
      }
    }

    let processed = 0;
    let createdChats = 0;
    for (const item of payloads) {
      const res = await syncKufarIncomingMessage(item);
      if (!res.duplicated) processed++;
      if (res.createdChat) createdChats++;
    }

    return {
      ok: true,
      totalDialogs,
      processed,
      createdChats,
      message:
        processed > 0
          ? `Загружено новых сообщений: ${processed}, новых чатов: ${createdChats}`
          : `Синхронизировано (диалогов на Kufar: ${totalDialogs}, новых сообщений нет)`,
    };
  } finally {
    await browser.close().catch(() => {});
  }
}

export async function syncKufarChatsViaBrowser(): Promise<KufarSyncSummary> {
  if (globalSync.__kufarSyncPromise) {
    return globalSync.__kufarSyncPromise;
  }

  globalSync.__kufarSyncPromise = runSyncInternal().finally(() => {
    globalSync.__kufarSyncPromise = undefined;
  });

  return globalSync.__kufarSyncPromise;
}

/**
 * Отправка ответа обратно в реальный диалог на Kufar (если чат имеет реальный ID вида kufar-<id>).
 */
export async function sendReplyToKufarViaBrowser(
  chatId: string,
  text: string
): Promise<boolean> {
  if (!chatId.startsWith('kufar-') || chatId.startsWith('kufar-chat-10')) {
    return false;
  }

  const { login, password, cookiesPath } = getKufarCredentials();
  if (!login || !password) return false;

  const rawDialogId = chatId.replace(/^kufar-/, '');
  const modName = 'puppeteer';
  const puppeteer = (await import(/* webpackIgnore: true */ modName)).default;
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 900 });
    await page.setUserAgent(USER_AGENT);

    const cachedCookies = await loadSavedCookies(cookiesPath);
    if (cachedCookies) {
      await page.setCookie(...cachedCookies);
    }

    await page
      .goto(`https://www.kufar.by/account/messaging/${encodeURIComponent(rawDialogId)}`, {
        waitUntil: 'networkidle2',
        timeout: 45_000,
      })
      .catch(() => {});
    await sleep(2000);

    if (!(await isMessagingAuthenticated(page))) {
      await authenticateWithEnvCredentials(page, login, password, cookiesPath);
      await page
        .goto(`https://www.kufar.by/account/messaging/${encodeURIComponent(rawDialogId)}`, {
          waitUntil: 'networkidle2',
          timeout: 45_000,
        })
        .catch(() => {});
      await sleep(1800);
    }

    const inputSel = 'textarea, input[placeholder*="сообщ" i], [contenteditable="true"]';
    const hasBox = await page.$(inputSel);
    if (!hasBox) return false;

    await page.click(inputSel);
    await page.type(inputSel, text, { delay: 15 });
    await page.keyboard.press('Enter');
    await sleep(1500);
    await saveCookies(page, cookiesPath);
    return true;
  } catch {
    return false;
  } finally {
    await browser.close().catch(() => {});
  }
}
