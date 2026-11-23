import { NextResponse } from 'next/server';
import { listKufarChats } from '@/lib/kufarChatsStore';
import { requireCrmSession } from '@/lib/auth';

// GET /api/chats — список чатов Kufar (только авторизованные сотрудники CRM)
export async function GET() {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const chats = await listKufarChats();
    return NextResponse.json(chats);
  } catch (error: any) {
    console.error('[GET /api/chats]', error);
    return NextResponse.json({ error: error.message || 'Ошибка загрузки чатов' }, { status: 500 });
  }
}
