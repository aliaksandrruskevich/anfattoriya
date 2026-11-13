import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const expected = process.env.ADMIN_ACCESS_PASSWORD;
    if (!expected) {
      return NextResponse.json({ error: 'ADMIN_ACCESS_PASSWORD не задан' }, { status: 500 });
    }
    if (!password || password !== expected) {
      return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Ошибка' }, { status: 500 });
  }
}
