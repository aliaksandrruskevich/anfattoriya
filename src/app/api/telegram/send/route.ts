import { NextResponse } from 'next/server';
import { escapeHtml, isValidPhone } from '@/lib/sanitize';

const globalForTg = globalThis as unknown as {
  __fattoriaTgConfig?: { enabled: boolean; chatId?: string };
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, typeOrPrice, formName, date, message, extra } = body || {};

    if (phone && !isValidPhone(phone) && !message) {
      return NextResponse.json({ success: false, error: 'Некорректный номер телефона' }, { status: 400 });
    }

    const runtimeCfg = globalForTg.__fattoriaTgConfig;
    if (runtimeCfg && runtimeCfg.enabled === false) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = runtimeCfg?.chatId || process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'Telegram credentials not configured on server',
      });
    }

    const timeStr = escapeHtml(
      date || new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Minsk' })
    );

    const text = [
      `🔔 <b>Новая заявка с сайта | ООО «АН Фаттория»</b>`,
      ``,
      `👤 <b>Имя:</b> ${escapeHtml(name || 'Не указано')}`,
      `📞 <b>Телефон:</b> <code>${escapeHtml(phone || 'Не указан')}</code>`,
      `🏷️ <b>Услуга:</b> ${escapeHtml(typeOrPrice || 'Консультация')}`,
      `📍 <b>Источник:</b> ${escapeHtml(formName || 'Сайт')}`,
      extra ? `📋 <b>Детали:</b> ${escapeHtml(extra)}` : '',
      message ? `💬 <b>Сообщение:</b> ${escapeHtml(message)}` : '',
      `⏱️ <b>Время:</b> ${timeStr}`,
    ]
      .filter(Boolean)
      .join('\n');

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
    return NextResponse.json({ success: Boolean(data.ok), result: data.ok ? { messageId: data.result?.message_id } : undefined });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
