import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';

const globalForTg = globalThis as unknown as {
  __fattoriaTgConfig?: {
    enabled: boolean;
    chatId?: string;
    botUsername?: string;
  };
};

function maskChatId(chatId: string | undefined): string {
  if (!chatId) return '';
  if (chatId.length <= 4) return '****';
  return `${chatId.slice(0, 2)}***${chatId.slice(-2)}`;
}

// GET /api/telegram-config — статус Telegram-интеграции без возврата секретного токена
export async function GET() {
  const auth = await requireAdminSession();
  if (auth.errorResponse) return auth.errorResponse;

  const cfg = globalForTg.__fattoriaTgConfig;
  const hasToken = Boolean(process.env.TELEGRAM_BOT_TOKEN);
  const rawChatId = cfg?.chatId || process.env.TELEGRAM_CHAT_ID || '';

  return NextResponse.json({
    configured: hasToken && Boolean(rawChatId),
    tokenConfigured: hasToken,
    enabled: cfg?.enabled ?? true,
    chatIdMasked: maskChatId(rawChatId),
    botUsername: cfg?.botUsername || process.env.TELEGRAM_BOT_USERNAME || '@anfattoria_bot',
  });
}

// POST /api/telegram-config — обновление безопасных настроек (без чтения токена на клиент)
export async function POST(request: NextRequest) {
  const auth = await requireAdminSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json();
    const current = globalForTg.__fattoriaTgConfig || { enabled: true };

    globalForTg.__fattoriaTgConfig = {
      enabled: body?.enabled !== undefined ? Boolean(body.enabled) : current.enabled,
      chatId: body?.chatId ? String(body.chatId).trim() : current.chatId,
      botUsername: body?.botUsername ? String(body.botUsername).trim() : current.botUsername,
    };

    return NextResponse.json({
      success: true,
      enabled: globalForTg.__fattoriaTgConfig.enabled,
      botUsername: globalForTg.__fattoriaTgConfig.botUsername || '@anfattoria_bot',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
