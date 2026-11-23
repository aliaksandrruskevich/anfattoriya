import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { syncKufarIncomingMessage, type SyncKufarPayload } from '@/lib/kufarChatsStore';
import { getSessionAgent } from '@/lib/auth';
import { getKufarCredentials } from '@/lib/kufarAuthConfig';

function verifySyncAccess(request: NextRequest): boolean {
  const { syncSecret } = getKufarCredentials();
  if (!syncSecret) return false;

  const provided =
    request.headers.get('x-sync-secret') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    '';

  const a = Buffer.from(provided.trim(), 'utf8');
  const b = Buffer.from(syncSecret, 'utf8');
  if (a.length !== b.length || a.length === 0) return false;
  return crypto.timingSafeEqual(a, b);
}

// POST /api/chats/sync — приём новых сообщений из парсера Kufar (Puppeteer)
export async function POST(request: NextRequest) {
  const session = await getSessionAgent();
  if (!session && !verifySyncAccess(request)) {
    return NextResponse.json({ error: 'Недействительный секрет синхронизации' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const items: SyncKufarPayload[] = Array.isArray(body?.messages)
      ? body.messages
      : [body];

    if (!items.length || !items[0]?.text) {
      return NextResponse.json(
        { error: 'Ожидается text или массив messages с новыми сообщениями' },
        { status: 400 }
      );
    }

    const results = [];
    for (const item of items) {
      if (!item?.text || !String(item.text).trim()) continue;
      const res = await syncKufarIncomingMessage(item);
      results.push(res);
    }

    return NextResponse.json({
      ok: true,
      processed: results.length,
      createdChats: results.filter((r) => r.createdChat).length,
      results,
    }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/chats/sync]', error);
    return NextResponse.json({ error: error.message || 'Ошибка синхронизации' }, { status: 500 });
  }
}
