import { NextResponse, NextRequest } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { getReviews } from '@/lib/repository';

export async function GET() {
  try {
    const reviews = await getReviews();
    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error('[GET /api/reviews]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.author || !body.text) {
      return NextResponse.json({ error: 'Поля author и text обязательны' }, { status: 400 });
    }

    const id = body.id || `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await execute(
      `INSERT INTO reviews (id, author, role, rating, text, date, avatar, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.author,
        body.role || '',
        body.rating ?? 5,
        body.text,
        body.date || new Date().toLocaleDateString('ru-RU'),
        body.avatar ?? null,
        body.published !== false ? 1 : 0,
      ]
    );

    const created = await queryOne('SELECT * FROM reviews WHERE id = ? LIMIT 1', [id]);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/reviews]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}