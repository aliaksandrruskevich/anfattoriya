import { NextResponse } from 'next/server';
import { requireCrmSession } from '@/lib/auth';
import { getKufarConfigStatus, getKufarCredentials } from '@/lib/kufarAuthConfig';
import { syncKufarChatsViaBrowser } from '@/lib/kufarLiveSync';

// POST /api/chats/fetch — вход на Kufar по логину и паролю из .env и загрузка переписок
export async function POST() {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  const { login, password } = getKufarCredentials();
  if (!login || !password) {
    return NextResponse.json(
      {
        ok: false,
        ...getKufarConfigStatus(),
        error: 'В файле .env не заданы KUFAR_LOGIN и KUFAR_PASSWORD.',
      },
      { status: 400 }
    );
  }

  try {
    const summary = await syncKufarChatsViaBrowser();
    return NextResponse.json({
      ...summary,
      ...getKufarConfigStatus(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        ...getKufarConfigStatus(),
        error: err?.message || 'Ошибка входа или синхронизации с Kufar',
      },
      { status: 502 }
    );
  }
}
