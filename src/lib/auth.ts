import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Agent } from '../types';
import { isDbMockMode, queryOne } from './db';
import { getMockStore } from './mockStore';
import { sanitizeAgentForClient } from './sanitize';

export const SESSION_COOKIE_NAME = 'fattoria_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const globalForSession = globalThis as unknown as {
  __fattoriaEphemeralSecret?: string;
};

function getSessionSecret(): string {
  const envSecret = process.env.SESSION_SECRET || process.env.AUTH_SECRET;
  if (envSecret && envSecret.trim().length >= 16) {
    return envSecret.trim();
  }
  if (!globalForSession.__fattoriaEphemeralSecret) {
    // Ephemeral CSPRNG secret when SESSION_SECRET env var is unset (never hardcoded)
    globalForSession.__fattoriaEphemeralSecret = crypto.randomBytes(32).toString('hex');
  }
  return globalForSession.__fattoriaEphemeralSecret;
}

interface SessionPayload {
  agentId: string;
  exp: number;
}

function signPayload(encodedPayload: string): string {
  return crypto
    .createHmac('sha256', getSessionSecret())
    .update(encodedPayload)
    .digest('base64url');
}

export function createSessionToken(agentId: string): string {
  const payload: SessionPayload = {
    agentId,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = signPayload(encoded);
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const dotIdx = token.indexOf('.');
  if (dotIdx <= 0) return null;

  const encoded = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  if (!encoded || !sig) return null;

  const expectedSig = signPayload(encoded);
  const sigBuf = Buffer.from(sig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');

  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (!decoded?.agentId || typeof decoded.exp !== 'number') return null;
    if (decoded.exp < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function isAdminRole(agent: Agent | null | undefined): boolean {
  if (!agent) return false;
  return Boolean(
    agent.isAdmin ||
      agent.id === 'admin' ||
      (agent.email && agent.email.toLowerCase() === 'anfattoriya@gmail.com')
  );
}

export function isCallCenterRole(agent: Agent | null | undefined): boolean {
  if (!agent) return false;
  const roleLower = String(agent.role || '').toLowerCase();
  return Boolean(
    agent.id === 'callcenter' ||
      agent.id === 'call-center' ||
      roleLower.includes('колл') ||
      roleLower.includes('оператор') ||
      roleLower.includes('call')
  );
}

async function findActiveAgentById(agentId: string): Promise<Agent | null> {
  if (isDbMockMode()) {
    const store = getMockStore();
    const found = store.agents.find((a) => a.id === agentId);
    if (!found || !found.isApproved || found.isDismissed) return null;
    return sanitizeAgentForClient(found);
  }

  const row = await queryOne<any>(
    `SELECT id, name, photo, role, experience, rating, phone, specialization,
            dealsCount, isAdmin, isApproved, hasLeadsAccess, email, achievements,
            assignedManagerId, assignedManagerName, agencyName, description,
            firstName, lastName, patronymic, objectsCount, userUuid, userId,
            contact, certNo, certDate, cardNo, status, isDismissed
     FROM agents WHERE id = ? LIMIT 1`,
    [agentId]
  );

  if (!row || !row.isApproved || row.isDismissed) return null;

  return sanitizeAgentForClient({
    ...row,
    isAdmin: Boolean(row.isAdmin),
    isApproved: Boolean(row.isApproved),
    hasLeadsAccess: Boolean(row.hasLeadsAccess),
    isDismissed: Boolean(row.isDismissed),
  });
}

/**
 * Reads and verifies the current CRM session from HTTP cookies.
 * Returns sanitized Agent or null if unauthenticated / expired / dismissed.
 */
export async function getSessionAgent(): Promise<Agent | null> {
  try {
    const cookieStore = await cookies();
    const rawCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const payload = verifySessionToken(rawCookie);
    if (!payload) return null;
    return await findActiveAgentById(payload.agentId);
  } catch {
    return null;
  }
}

export async function requireCrmSession(): Promise<
  { agent: Agent; errorResponse?: never } | { agent?: never; errorResponse: NextResponse }
> {
  const agent = await getSessionAgent();
  if (!agent) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Требуется авторизация в CRM' },
        { status: 401 }
      ),
    };
  }
  return { agent };
}

export async function requireAdminSession(): Promise<
  { agent: Agent; errorResponse?: never } | { agent?: never; errorResponse: NextResponse }
> {
  const session = await requireCrmSession();
  if (session.errorResponse) return session;
  if (!isAdminRole(session.agent)) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Доступ разрешён только администратору' },
        { status: 403 }
      ),
    };
  }
  return { agent: session.agent };
}

export function verifySharedSecretHeader(req: Request, envVarName: string): boolean {
  const expected = process.env[envVarName];
  if (!expected || !expected.trim()) {
    // Allow local dev/sync when secret is explicitly omitted unless strict mode requested
    return true;
  }
  const provided =
    req.headers.get('x-sync-secret') ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    '';

  const a = Buffer.from(provided, 'utf8');
  const b = Buffer.from(expected.trim(), 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
