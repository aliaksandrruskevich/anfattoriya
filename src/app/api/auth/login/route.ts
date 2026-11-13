import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

function parseDbUrl(url: string) {
  const m = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  if (!m) throw new Error('Invalid DATABASE_URL');
  const [, user, password, host, port, database] = m;
  return { user, password, host, port: Number(port), database };
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'email и password обязательны' }, { status: 400 });
    }

    const url = process.env.DATABASE_URL;
    if (!url) {
      return NextResponse.json({ error: 'DATABASE_URL не задан' }, { status: 500 });
    }
    const cfg = parseDbUrl(url);
    const conn = await mysql.createConnection(cfg);

    // Выбираем ВСЕ поля, чтобы фронтенд получил полный объект (role, photo, phone и т.д.)
    const [rows] = await conn.execute(
      `SELECT id, name, photo, role, phone, specialization, email, password,
              isAdmin, isApproved, hasLeadsAccess, dealsCount, rating, agencyName, firstName, lastName
       FROM agents WHERE LOWER(email) = LOWER(?) LIMIT 1`,
      [email]
    );
    await conn.end();

    const agent = (rows as any[])[0];
    if (!agent) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 });
    }
    if (!agent.isApproved) {
      return NextResponse.json({ error: 'Аккаунт не одобрен' }, { status: 403 });
    }
    if (!agent.password) {
      return NextResponse.json({ error: 'Пароль не установлен. Обратитесь к администратору.' }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, agent.password);
    if (!ok) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 });
    }

    const { password: _pw, ...safeAgent } = agent;

    // ВАЖНО: приводим числовые флаги из MySQL (1/0) к булевым (true/false),
    // иначе React-компоненты с проверкой `isAdmin === true` их не увидят.
    const finalAgent = {
      ...safeAgent,
      isAdmin: Boolean(agent.isAdmin),
      isApproved: Boolean(agent.isApproved),
      hasLeadsAccess: Boolean(agent.hasLeadsAccess),
    };

    const res = NextResponse.json({ success: true, agent: finalAgent });
    res.cookies.set('fattoria_session', String(agent.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Ошибка входа' }, { status: 500 });
  }
}