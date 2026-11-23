import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import { escapeHtml } from '@/lib/sanitize';

const globalForTg = globalThis as unknown as {
  __fattoriaTgConfig?: { enabled: boolean; chatId?: string; botUsername?: string };
};

export async function POST(request: NextRequest) {
  const auth = await requireAdminSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json().catch(() => ({}));
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId =
      String(body?.chatId || '').trim() ||
      globalForTg.__fattoriaTgConfig?.chatId ||
      process.env.TELEGRAM_CHAT_ID ||
      '';

    if (!token || !chatId) {
      return NextResponse.json(
        {
          success: false,
          error: 'TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не настроены в окружении сервера (.env)',
        },
        { status: 400 }
      );
    }

    const text = `✅ <b>Тест интеграции CRM | ООО «АН Фаттория»</b>\nАдминистратор: ${escapeHtml(
      auth.agent.name
    )}\nВремя: ${escapeHtml(new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Minsk' }))}`;

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await tgRes.json();
    if (!data?.ok) {
      return NextResponse.json(
        { success: false, error: data?.description || 'Ошибка API Telegram' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
