import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { isDbMockMode } from '@/lib/db';
import { getMockStore } from '@/lib/mockStore';

function safeTimingEqual(aStr: string, bStr: string): boolean {
  const a = Buffer.from(aStr, 'utf8');
  const b = Buffer.from(bStr, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const password = String(body?.password || '').trim();
    if (!password) {
      return NextResponse.json({ error: 'Пароль обязателен' }, { status: 400 });
    }

    const expected = process.env.ADMIN_ACCESS_PASSWORD;
    if (expected) {
      if (!safeTimingEqual(password, expected)) {
        return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
      }
      return NextResponse.json({ success: true });
    }

    if (isDbMockMode()) {
      const admin = getMockStore().agents.find((a) => a.id === 'admin');
      if (admin?.password && (await bcrypt.compare(password, admin.password))) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
    }

    return NextResponse.json({ error: 'ADMIN_ACCESS_PASSWORD не настроен на сервере' }, { status: 500 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Ошибка проверки доступа' }, { status: 500 });
  }
}
