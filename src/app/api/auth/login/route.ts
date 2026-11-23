import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { isDbMockMode, queryOne } from '@/lib/db';
import { getMockStore } from '@/lib/mockStore';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { sanitizeAgentForClient } from '@/lib/sanitize';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const identifier = String(body?.email || body?.login || '').trim();
    const password = String(body?.password || '').trim();

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Логин/email и пароль обязательны' }, { status: 400 });
    }

    let agentRow: any = null;

    if (isDbMockMode()) {
      const lower = identifier.toLowerCase();
      agentRow =
        getMockStore().agents.find(
          (a) =>
            a.id.toLowerCase() === lower ||
            (a.email && a.email.toLowerCase() === lower) ||
            a.name.toLowerCase() === lower
        ) || null;
    } else {
      agentRow = await queryOne(
        `SELECT id, name, photo, role, phone, specialization, email, password,
                isAdmin, isApproved, hasLeadsAccess, dealsCount, rating, agencyName,
                firstName, lastName, patronymic, status, isDismissed
         FROM agents
         WHERE LOWER(email) = LOWER(?) OR LOWER(id) = LOWER(?) OR LOWER(name) = LOWER(?)
         LIMIT 1`,
        [identifier, identifier, identifier]
      );
    }

    if (!agentRow) {
      return NextResponse.json({ error: 'Неверный логин/email или пароль' }, { status: 401 });
    }
    if (!agentRow.isApproved || agentRow.isDismissed) {
      return NextResponse.json({ error: 'Аккаунт не активен или не одобрен' }, { status: 403 });
    }
    if (!agentRow.password) {
      return NextResponse.json({ error: 'Пароль не установлен. Обратитесь к администратору.' }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, String(agentRow.password));
    if (!ok) {
      return NextResponse.json({ error: 'Неверный логин/email или пароль' }, { status: 401 });
    }

    const finalAgent = sanitizeAgentForClient({
      ...agentRow,
      isAdmin: Boolean(agentRow.isAdmin),
      isApproved: Boolean(agentRow.isApproved),
      hasLeadsAccess: Boolean(agentRow.hasLeadsAccess),
      isDismissed: Boolean(agentRow.isDismissed),
    });

    const token = createSessionToken(finalAgent.id);
    const isHttps =
      req.headers.get('x-forwarded-proto') === 'https' || req.url.startsWith('https://');
    const res = NextResponse.json({ success: true, agent: finalAgent });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Ошибка входа' }, { status: 500 });
  }
}