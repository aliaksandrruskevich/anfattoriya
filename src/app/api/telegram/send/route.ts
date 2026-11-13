import { NextResponse } from 'next/server';

const DEFAULT_TG_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DEFAULT_TG_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(req: Request) {
  try {
    const { name, phone, typeOrPrice, formName, date, message, extra } = await req.json();
    
    const token = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_TG_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID || DEFAULT_TG_CHAT_ID;
    
    const timeStr = date || new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Minsk' });

    const text = [
      `🔔 <b>Новая заявка с сайта | ООО «АН Фаттория»</b>`,
      ``,
      `👤 <b>Имя:</b> ${name || 'Не указано'}`,
      `📞 <b>Телефон:</b> <code>${phone || 'Не указан'}</code>`,
      `🏷️ <b>Услуга:</b> ${typeOrPrice || 'Консультация'}`,
      `📍 <b>Источник:</b> ${formName || 'Сайт'}`,
      extra ? `📋 <b>Детали:</b> ${extra}` : '',
      message ? `💬 <b>Сообщение:</b> ${message}` : '',
      `⏱️ <b>Время:</b> ${timeStr}`
    ].filter(Boolean).join('\n');

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const data = await tgRes.json();
    return NextResponse.json({ success: data.ok, result: data.result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
