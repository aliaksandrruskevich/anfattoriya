import { NextRequest, NextResponse } from 'next/server';
import { replyToKufarChat } from '@/lib/kufarChatsStore';
import { requireCrmSession } from '@/lib/auth';

// POST /api/chats/[id]/reply — отправка ответа от менеджера (CRM)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();
    const text = String(body?.text || '').trim();

    if (!text) {
      return NextResponse.json({ error: 'Текст сообщения не может быть пустым' }, { status: 400 });
    }

    const result = await replyToKufarChat(id, text);
    if (!result) {
      return NextResponse.json({ error: 'Чат не найден' }, { status: 404 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/chats/[id]/reply]', error);
    return NextResponse.json({ error: error.message || 'Ошибка отправки ответа' }, { status: 500 });
  }
}
