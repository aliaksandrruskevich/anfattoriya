import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export interface KufarCredentials {
  login: string;
  password: string;
  syncSecret: string;
  cookiesPath: string;
}

export interface KufarConfigStatus {
  configured: boolean;
  loginMasked: string | null;
  cookiesSaved: boolean;
  hasSyncSecret: boolean;
}

/**
 * Читает логин и пароль Kufar из переменных окружения (.env).
 * Поддерживает KUFAR_LOGIN / KUFAR_PASSWORD и распространённые алиасы.
 */
export function getKufarCredentials(): KufarCredentials {
  const login = (
    process.env.KUFAR_LOGIN ||
    process.env.KUFAR_EMAIL ||
    process.env.KUFAR_PHONE ||
    process.env.KUFAR_USER ||
    process.env.KUFAR_USERNAME ||
    ''
  ).trim();

  const password = (
    process.env.KUFAR_PASSWORD ||
    process.env.KUFAR_PASS ||
    ''
  ).trim();

  const explicitSecret = (process.env.KUFAR_SYNC_SECRET || '').trim();
  const derivedSeed = password || process.env.SESSION_SECRET || '';
  const syncSecret =
    explicitSecret ||
    (derivedSeed
      ? crypto.createHmac('sha256', derivedSeed).update('fattoria-kufar-sync').digest('hex')
      : '');

  const cookiesPath = path.resolve(
    /*turbopackIgnore: true*/ process.cwd(),
    process.env.KUFAR_COOKIES_PATH || 'kufar-cookies.json'
  );

  return { login, password, syncSecret, cookiesPath };
}

export function maskKufarLogin(login: string): string {
  const trimmed = login.trim();
  if (!trimmed) return '';
  if (trimmed.includes('@')) {
    const [user, domain] = trimmed.split('@');
    const visible = user.slice(0, 2);
    return `${visible}***@${domain}`;
  }
  if (trimmed.length <= 4) {
    return `${trimmed[0]}***`;
  }
  return `${trimmed.slice(0, 3)}***${trimmed.slice(-2)}`;
}

/**
 * Безопасный статус конфигурации для CRM (никогда не возвращает пароль или открытый логин).
 */
export function getKufarConfigStatus(): KufarConfigStatus {
  const { login, password, syncSecret, cookiesPath } = getKufarCredentials();
  const configured = Boolean(login && password);
  let cookiesSaved = false;
  try {
    cookiesSaved = fs.existsSync(/*turbopackIgnore: true*/ cookiesPath);
  } catch {
    cookiesSaved = false;
  }

  return {
    configured,
    loginMasked: configured ? maskKufarLogin(login) : null,
    cookiesSaved,
    hasSyncSecret: Boolean(syncSecret),
  };
}
