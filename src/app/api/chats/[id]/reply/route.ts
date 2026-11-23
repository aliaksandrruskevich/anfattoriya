import { NextRequest, NextResponse } from 'next/server';
import { replyToKufarChat } from '@/lib/kufarChatsStore';
import { requireCrmSession } from '@/lib/auth';
import { getKufarCredentials } from '@/lib/kufarAuthConfig';
import { sendReplyToKufarViaBrowser } from '@/lib/kufarLiveSync';

// POST /api/chats/[id]/reply — отправка ответа от менеджера (CRM + доставка в Kufar при наличии .env)
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

    let deliveredToKufar = false;
    const { login, password } = getKufarCredentials();
    if (login && password && id.startsWith('kufar-') && !id.startsWith('kufar-chat-10')) {
      deliveredToKufar = await sendReplyToKufarViaBrowser(id, text).catch(() => false);
    }

    return NextResponse.json({ ...result, deliveredToKufar }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/chats/[id]/reply]', error);
    return NextResponse.json({ error: error.message || 'Ошибка отправки ответа' }, { status: 500 });
  }
}
