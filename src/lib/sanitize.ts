import type { Agent, Property } from '../types';

/**
 * Escapes HTML special characters for safe interpolation inside HTML / Telegram HTML templates.
 */
export function escapeHtml(input: unknown): string {
  const s = String(input ?? '');
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitizes rich HTML/Markdown-embedded HTML before passing into rehypeRaw / HTML renderers.
 * Strips dangerous tags (<script>, <iframe>, <object>, <embed>, <style>, <link>, <meta>, <base>),
 * inline event handlers (on*=), and javascript:/vbscript:/data:text/html URIs.
 */
export function sanitizeRichHtml(raw: string | null | undefined): string {
  if (!raw) return '';
  let out = String(raw);

  // Remove dangerous paired tags and their content
  out = out.replace(
    /<\s*(script|style|iframe|object|embed|applet|svg|math|form|input|button|textarea|select|link|meta|base)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
    ''
  );
  // Remove self-closing / unclosed dangerous tags
  out = out.replace(
    /<\s*(script|style|iframe|object|embed|applet|link|meta|base|form|input|button|textarea|select)[^>]*\/?\s*>/gi,
    ''
  );
  // Remove inline event handlers (onclick=, onerror=, onload=, etc.)
  out = out.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  // Neutralize javascript:, vbscript:, data: URIs inside href/src/action/xlink:href
  out = out.replace(
    /\b(href|src|action|xlink:href)\s*=\s*(?:"\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^"]*"|'\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^']*'|[^\s>]*javascript:[^\s>]*)/gi,
    '$1="#"'
  );

  return out;
}

/**
 * Validates and normalizes a contact phone number (at least 7 digits).
 */
export function isValidPhone(phone: unknown): boolean {
  const digits = String(phone ?? '').replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 16;
}

/**
 * Validates an external URL against allowed hosts and blocks SSRF targets
 * (localhost, loopback, link-local 169.254.0.0/16, private IPv4/IPv6 ranges).
 */
export function validateExternalUrl(rawUrl: string, allowedDomains: string[]): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error('Некорректный формат ссылки');
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('Разрешены только HTTP/HTTPS ссылки');
  }

  const host = parsed.hostname.toLowerCase();

  // Block raw IP addresses and localhost
  if (
    host === 'localhost' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    /^[\d.]+$/.test(host) ||
    host.includes(':')
  ) {
    throw new Error('Запрещённый адрес хоста');
  }

  const isAllowed = allowedDomains.some(
    (domain) => host === domain || host.endsWith(`.${domain}`)
  );
  if (!isAllowed) {
    throw new Error(`Поддерживаются только ссылки с доменов: ${allowedDomains.join(', ')}`);
  }

  return parsed;
}

/**
 * Strips private CRM fields from a Property before exposing to unauthenticated public endpoints / SSR pages.
 */
export function sanitizePropertyForPublic(prop: Property): Property {
  const {
    sellerPhone: _sellerPhone,
    contractNumber: _contractNumber,
    contractDate: _contractDate,
    contractStatus: _contractStatus,
    inventoryNo: _inventoryNo,
    sourceUrl: _sourceUrl,
    internalOnly: _internalOnly,
    crmOnly: _crmOnly,
    isClosedBase: _isClosedBase,
    ...publicFields
  } = prop;

  return {
    ...publicFields,
    isPublished: prop.isPublished ?? true,
  };
}

/**
 * Returns true if a property may be displayed publicly (active, published, not CRM-only/internal/closed-base).
 */
export function isPublicProperty(prop: Property): boolean {
  if (prop.status && prop.status !== 'active') return false;
  if (prop.isPublished === false) return false;
  if (prop.isClosedBase || prop.internalOnly || prop.crmOnly) return false;
  return true;
}

/**
 * Strips authentication/private fields from Agent for authenticated CRM client use.
 */
export function sanitizeAgentForClient(agent: Agent): Agent {
  const { password: _password, ...rest } = agent as Agent & { password?: string };
  return {
    ...rest,
    isAdmin: Boolean(agent.isAdmin),
    isApproved: Boolean(agent.isApproved),
    hasLeadsAccess: Boolean(agent.hasLeadsAccess),
    isDismissed: Boolean(agent.isDismissed),
  };
}

/**
 * Strips email, UUIDs, manager links, certs, and password from Agent for unauthenticated public endpoints / SSR pages.
 */
export function sanitizeAgentForPublic(agent: Agent): Agent {
  const {
    password: _password,
    email: _email,
    userUuid: _userUuid,
    userId: _userId,
    assignedManagerId: _assignedManagerId,
    assignedManagerName: _assignedManagerName,
    certNo: _certNo,
    certDate: _certDate,
    cardNo: _cardNo,
    isAdmin: _isAdmin,
    hasLeadsAccess: _hasLeadsAccess,
    ...publicAgent
  } = agent as Agent & { password?: string };

  return {
    ...publicAgent,
    isApproved: Boolean(agent.isApproved),
    isDismissed: Boolean(agent.isDismissed),
  };
}
