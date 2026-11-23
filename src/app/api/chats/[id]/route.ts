import { NextRequest, NextResponse } from 'next/server';
import { getKufarChatWithMessages, updateKufarChatStatus } from '@/lib/kufarChatsStore';
import { requireCrmSession } from '@/lib/auth';

// GET /api/chats/[id] — история сообщений конкретного чата (CRM)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const data = await getKufarChatWithMessages(id);
    if (!data) {
      return NextResponse.json({ error: 'Чат не найден' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[GET /api/chats/[id]]', error);
    return NextResponse.json({ error: error.message || 'Ошибка загрузки чата' }, { status: 500 });
  }
}

// PATCH /api/chats/[id] — обновить статус чата (CRM)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();
    if (!body?.status) {
      return NextResponse.json({ error: 'Поле status обязательно' }, { status: 400 });
    }
    const ok = await updateKufarChatStatus(id, String(body.status));
    if (!ok) {
      return NextResponse.json({ error: 'Чат не найден' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[PATCH /api/chats/[id]]', error);
    return NextResponse.json({ error: error.message || 'Ошибка обновления чата' }, { status: 500 });
  }
}
