import fs from 'node:fs/promises';
import path from 'node:path';

export const KUFAR_API_DEFAULT_BASE_URL = 'https://eapi.kufar.by';
const DEFAULT_TOKEN_PATH = 'kufar-token.json';
const DEFAULT_TIMEOUT_MS = 15_000;
const MIN_RATE_LIMIT_MS = 1_000;
const DEFAULT_RATE_LIMIT_MS = 1_050;
const MAX_RETRY_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 1_500;
const TOKEN_EXPIRY_SKEW_MS = 30_000;

export interface KufarConversationSummary {
  conversation_id: string;
  ad_id?: number | string | null;
  ad_link?: string | null;
  last_message_date?: string | null;
  last_message_preview?: string | null;
  partner_id?: number | string | null;
  partner_name?: string | null;
  partner_profile_picture_url?: string | null;
  subject?: string | null;
  unseen_counter?: number;
}

export interface KufarConversationsResponse {
  items: number;
  limit: number;
  offset: number;
  conversations: KufarConversationSummary[];
}

export interface KufarApiMessage {
  message_id?: string;
  date?: string;
  sender_id?: number | string | null;
  read?: boolean;
  text?: string | null;
  type?: string | null;
  attachments?: unknown[];
}

export interface KufarConversationWithMessages extends KufarConversationSummary {
  messages: KufarApiMessage[];
}

export interface KufarSendMessageResponse {
  message_id?: string;
  date?: string;
  sender_id?: number | string;
  text?: string;
  type?: string;
  attachments?: unknown[];
}

export interface KufarApiClientOptions {
  login?: string;
  password?: string;
  tokenPath?: string;
  baseUrl?: string;
  timeoutMs?: number;
  minIntervalMs?: number;
  backoffBaseMs?: number;
  fetchImpl?: typeof fetch;
}

interface StoredTokenRecord {
  token: string;
  updatedAt: string;
  expiresAt?: string;
}

class HttpStatusError extends Error {
  readonly status: number;
  readonly retryAfterMs?: number;

  constructor(status: number, message: string, retryAfterMs?: number) {
    super(message);
    this.name = 'HttpStatusError';
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

export class KufarAuthError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'KufarAuthError';
    this.status = status;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveEnvLogin(): string {
  return (
    process.env.KUFAR_LOGIN ||
    process.env.KUFAR_EMAIL ||
    process.env.KUFAR_PHONE ||
    process.env.KUFAR_USER ||
    process.env.KUFAR_USERNAME ||
    ''
  ).trim();
}

function resolveEnvPassword(): string {
  return (process.env.KUFAR_PASSWORD || process.env.KUFAR_PASS || '').trim();
}

function decodeJwtExpMs(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payloadRaw = Buffer.from(parts[1], 'base64url').toString('utf8');
    const payload = JSON.parse(payloadRaw) as { exp?: unknown };
    if (typeof payload.exp === 'number' && Number.isFinite(payload.exp)) {
      return payload.exp * 1000;
    }
    return null;
  } catch {
    return null;
  }
}

function parseRetryAfterMs(headerVal: string | null): number | undefined {
  if (!headerVal) return undefined;
  const trimmed = headerVal.trim();
  if (!trimmed) return undefined;
  const asSeconds = Number(trimmed);
  if (Number.isFinite(asSeconds) && asSeconds >= 0) {
    return Math.min(60_000, Math.round(asSeconds * 1000));
  }
  const asDate = Date.parse(trimmed);
  if (!Number.isNaN(asDate)) {
    const delta = asDate - Date.now();
    if (delta > 0) return Math.min(60_000, delta);
  }
  return undefined;
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

export class KufarApiClient {
  private readonly login: string;
  private readonly password: string;
  private readonly tokenPath: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly minIntervalMs: number;
  private readonly backoffBaseMs: number;
  private readonly fetchFn: typeof fetch;

  private cachedToken: string | null = null;
  private cachedTokenExpMs: number | null = null;
  private signInPromise: Promise<string> | null = null;
  private rateQueue: Promise<void> = Promise.resolve();
  private lastRequestAt = 0;

  constructor(options: KufarApiClientOptions = {}) {
    this.login = (options.login ?? resolveEnvLogin()).trim();
    this.password = (options.password ?? resolveEnvPassword()).trim();
    this.tokenPath = path.resolve(
      process.cwd(),
      (options.tokenPath ?? process.env.KUFAR_TOKEN_PATH ?? DEFAULT_TOKEN_PATH).trim() ||
        DEFAULT_TOKEN_PATH
    );
    this.baseUrl = (options.baseUrl ?? KUFAR_API_DEFAULT_BASE_URL).replace(/\/+$/, '');

    const rawTimeout = Number(options.timeoutMs ?? process.env.KUFAR_API_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
    this.timeoutMs =
      Number.isFinite(rawTimeout) && rawTimeout >= 1_000 ? Math.trunc(rawTimeout) : DEFAULT_TIMEOUT_MS;

    const rawInterval = Number(options.minIntervalMs ?? DEFAULT_RATE_LIMIT_MS);
    this.minIntervalMs =
      Number.isFinite(rawInterval) && rawInterval >= MIN_RATE_LIMIT_MS
        ? Math.trunc(rawInterval)
        : DEFAULT_RATE_LIMIT_MS;

    const rawBackoff = Number(options.backoffBaseMs ?? BASE_BACKOFF_MS);
    this.backoffBaseMs =
      Number.isFinite(rawBackoff) && rawBackoff >= 50 ? Math.trunc(rawBackoff) : BASE_BACKOFF_MS;

    this.fetchFn = options.fetchImpl ?? globalThis.fetch;
  }

  hasCredentials(): boolean {
    return Boolean(this.login && this.password);
  }

  getTokenFilePath(): string {
    return this.tokenPath;
  }

  sanitizeText(input: string): string {
    let out = String(input || '');
    if (this.password) {
      out = out.split(this.password).join('[REDACTED]');
    }
    if (this.login) {
      out = out.split(this.login).join('[REDACTED_LOGIN]');
    }
    if (this.cachedToken) {
      out = out.split(this.cachedToken).join('[REDACTED_TOKEN]');
    }
    out = out.replace(/Bearer\s+[A-Za-z0-9\-_.~+/=]+/gi, 'Bearer [REDACTED_TOKEN]');
    out = out.replace(/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{4,}\b/g, '[REDACTED_JWT]');
    return out;
  }

  private enqueueRateLimited<T>(fn: () => Promise<T>): Promise<T> {
    const run = async (): Promise<T> => {
      const now = Date.now();
      const waitMs = this.lastRequestAt > 0 ? this.lastRequestAt + this.minIntervalMs - now : 0;
      if (waitMs > 0) {
        await sleep(waitMs);
      }
      try {
        return await fn();
      } finally {
        this.lastRequestAt = Date.now();
      }
    };

    const next = this.rateQueue.then(run, run);
    this.rateQueue = next.then(
      () => undefined,
      () => undefined
    );
    return next;
  }

  private async fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    return await this.enqueueRateLimited(async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        return await this.fetchFn(url, {
          ...init,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }
    });
  }

  private async executeWithRetry(
    url: string,
    buildInit: () => RequestInit
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        const res = await this.fetchWithTimeout(url, buildInit());

        if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
          const retryAfterMs = res.status === 429 ? parseRetryAfterMs(res.headers.get('retry-after')) : undefined;
          const bodySnippet = await res.text().catch(() => '');
          const cleanBody = this.sanitizeText(bodySnippet).slice(0, 200);
          const statusErr = new HttpStatusError(
            res.status,
            `HTTP ${res.status}${cleanBody ? `: ${cleanBody}` : ''}`,
            retryAfterMs
          );
          lastError = statusErr;

          if (attempt < MAX_RETRY_ATTEMPTS) {
            const backoff = this.backoffBaseMs * Math.pow(2, attempt - 1);
            const delayMs = retryAfterMs !== undefined ? Math.max(backoff, retryAfterMs) : backoff;
            await sleep(delayMs);
            continue;
          }
          throw statusErr;
        }

        return res;
      } catch (err: any) {
        if (err instanceof HttpStatusError) {
          throw err;
        }

        const isAbort = err?.name === 'AbortError';
        const rawMsg = isAbort
          ? `Превышен таймаут запроса (${this.timeoutMs} мс)`
          : this.sanitizeText(err?.message || String(err));
        const wrapped = new Error(rawMsg);
        lastError = wrapped;

        if (attempt < MAX_RETRY_ATTEMPTS) {
          const backoff = this.backoffBaseMs * Math.pow(2, attempt - 1);
          await sleep(backoff);
          continue;
        }
        throw wrapped;
      }
    }

    throw lastError || new Error('Не удалось выполнить запрос к Kufar API');
  }

  private async readTokenFromDisk(): Promise<string | null> {
    try {
      const raw = await fs.readFile(this.tokenPath, 'utf8');
      const parsed = JSON.parse(raw) as Partial<StoredTokenRecord>;
      const token = typeof parsed?.token === 'string' ? parsed.token.trim() : '';
      if (!token) return null;

      let expMs: number | null = null;
      if (typeof parsed.expiresAt === 'string') {
        const ts = Date.parse(parsed.expiresAt);
        if (!Number.isNaN(ts)) expMs = ts;
      }
      if (expMs === null) {
        expMs = decodeJwtExpMs(token);
      }
      if (expMs !== null && Date.now() >= expMs - TOKEN_EXPIRY_SKEW_MS) {
        return null;
      }

      this.cachedToken = token;
      this.cachedTokenExpMs = expMs;
      return token;
    } catch {
      return null;
    }
  }

  private async saveTokenToDisk(token: string): Promise<void> {
    const expMs = decodeJwtExpMs(token);
    const record: StoredTokenRecord = {
      token,
      updatedAt: new Date().toISOString(),
      ...(expMs ? { expiresAt: new Date(expMs).toISOString() } : {}),
    };

    const dir = path.dirname(this.tokenPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.tokenPath, JSON.stringify(record, null, 2), {
      encoding: 'utf8',
      mode: 0o600,
    });
    await fs.chmod(this.tokenPath, 0o600).catch(() => {});

    this.cachedToken = token;
    this.cachedTokenExpMs = expMs;
  }

  private async getValidToken(forceRefresh = false): Promise<string> {
    if (!forceRefresh) {
      if (
        this.cachedToken &&
        (this.cachedTokenExpMs === null || Date.now() < this.cachedTokenExpMs - TOKEN_EXPIRY_SKEW_MS)
      ) {
        return this.cachedToken;
      }
      const fromDisk = await this.readTokenFromDisk();
      if (fromDisk) {
        return fromDisk;
      }
    }

    return await this.signIn();
  }

  async signIn(): Promise<string> {
    if (this.signInPromise) {
      return await this.signInPromise;
    }

    this.signInPromise = (async () => {
      if (!this.login || !this.password) {
        throw new KufarAuthError(400, 'Не заданы KUFAR_LOGIN и KUFAR_PASSWORD в .env.');
      }

      const url = `${this.baseUrl}/auth/v1/sign-in`;
      const res = await this.executeWithRetry(url, () => ({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: this.login,
          password: this.password,
        }),
      }));

      if (res.status === 401 || res.status === 403) {
        await res.text().catch(() => '');
        throw new KufarAuthError(
          res.status,
          `Ошибка авторизации Kufar (HTTP ${res.status}): проверьте KUFAR_LOGIN и KUFAR_PASSWORD.`
        );
      }

      if (!res.ok) {
        const body = this.sanitizeText(await res.text().catch(() => '')).slice(0, 200);
        throw new Error(`Ошибка входа Kufar (HTTP ${res.status})${body ? `: ${body}` : ''}`);
      }

      const data = (await res.json().catch(() => null)) as { token?: unknown } | null;
      const token = typeof data?.token === 'string' ? data.token.trim() : '';
      if (!token) {
        throw new Error('Ответ /auth/v1/sign-in не содержит token.');
      }

      await this.saveTokenToDisk(token);
      return token;
    })();

    try {
      return await this.signInPromise;
    } finally {
      this.signInPromise = null;
    }
  }

  private async requestJson<T>(
    endpointPath: string,
    init: { method: 'GET' | 'POST' | 'PUT'; body?: unknown },
    allow401Retry = true
  ): Promise<T> {
    const token = await this.getValidToken(false);
    const url = `${this.baseUrl}${endpointPath}`;

    const res = await this.executeWithRetry(url, () => ({
      method: init.method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
    }));

    if (res.status === 401) {
      await res.text().catch(() => '');
      if (allow401Retry) {
        this.cachedToken = null;
        this.cachedTokenExpMs = null;
        await this.signIn();
        return await this.requestJson<T>(endpointPath, init, false);
      }
      throw new KufarAuthError(401, 'Токен Kufar отклонён сервером (HTTP 401) после повторного входа.');
    }

    if (res.status === 403) {
      await res.text().catch(() => '');
      throw new KufarAuthError(403, 'Доступ к Kufar Messenger API запрещён (HTTP 403).');
    }

    if (!res.ok) {
      const errBody = this.sanitizeText(await res.text().catch(() => '')).slice(0, 200);
      throw new Error(`Kufar API HTTP ${res.status}${errBody ? `: ${errBody}` : ''}`);
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return (await res.json()) as T;
  }

  async getConversations(limit = 50, offset = 0): Promise<KufarConversationsResponse> {
    const safeLimit = clampInt(limit, 1, 99);
    const safeOffset = clampInt(offset, 0, 10_000);
    return await this.requestJson<KufarConversationsResponse>(
      `/messaging/v2/messenger/conversations/?limit=${safeLimit}&offset=${safeOffset}`,
      { method: 'GET' }
    );
  }

  async getConversation(conversationId: string): Promise<KufarConversationWithMessages> {
    const id = encodeURIComponent(String(conversationId || '').trim());
    if (!id) {
      throw new Error('conversationId обязателен');
    }
    return await this.requestJson<KufarConversationWithMessages>(
      `/messaging/v2/messenger/conversations/${id}`,
      { method: 'GET' }
    );
  }

  async getConversationMessages(
    conversationId: string,
    limit = 50,
    offset = 0
  ): Promise<KufarConversationWithMessages> {
    const id = encodeURIComponent(String(conversationId || '').trim());
    if (!id) {
      throw new Error('conversationId обязателен');
    }
    const safeLimit = clampInt(limit, 1, 99);
    const safeOffset = clampInt(offset, 0, 10_000);
    return await this.requestJson<KufarConversationWithMessages>(
      `/messaging/v2/messenger/conversations/${id}/messages?limit=${safeLimit}&offset=${safeOffset}`,
      { method: 'GET' }
    );
  }

  async sendMessage(
    conversationId: string,
    text: string,
    attachments: unknown[] = []
  ): Promise<KufarSendMessageResponse> {
    const id = encodeURIComponent(String(conversationId || '').trim());
    if (!id) {
      throw new Error('conversationId обязателен');
    }
    const cleanText = String(text || '').trim();
    if (!cleanText) {
      throw new Error('Текст сообщения не может быть пустым');
    }
    return await this.requestJson<KufarSendMessageResponse>(
      `/messaging/v2/messenger/conversations/${id}/messages`,
      {
        method: 'POST',
        body: {
          type: 'text',
          text: cleanText,
          attachments,
        },
      }
    );
  }
}
