import { NextResponse, NextRequest } from 'next/server';
import { execute, isDbMockMode, queryOne } from '@/lib/db';
import { getReviews } from '@/lib/repository';
import { getSessionAgent, requireAdminSession } from '@/lib/auth';
import { getMockStore } from '@/lib/mockStore';

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
    const session = await getSessionAgent();

    if (!body.author || !body.text) {
      return NextResponse.json({ error: 'Поля author и text обязательны' }, { status: 400 });
    }

    const id =
      session && body.id
        ? String(body.id)
        : `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Public reviews stay pending moderation until approved by CRM admin
    const published = session ? body.published !== false : false;
    const rating = Math.min(5, Math.max(1, Number(body.rating ?? 5) || 5));

    const newReview = {
      id,
      author: String(body.author).slice(0, 120),
      role: String(body.role || '').slice(0, 160),
      rating,
      text: String(body.text).slice(0, 2000),
      date: body.date || new Date().toLocaleDateString('ru-RU'),
      avatar: body.avatar ?? undefined,
      published,
    };

    if (isDbMockMode()) {
      getMockStore().reviews.unshift(newReview);
      return NextResponse.json(newReview, { status: 201 });
    }

    await execute(
      `INSERT INTO reviews (id, author, role, rating, text, date, avatar, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newReview.id,
        newReview.author,
        newReview.role,
        newReview.rating,
        newReview.text,
        newReview.date,
        newReview.avatar ?? null,
        published ? 1 : 0,
      ]
    );

    const created = await queryOne('SELECT * FROM reviews WHERE id = ? LIMIT 1', [id]);
    return NextResponse.json(created || newReview, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/reviews]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/reviews — синхронизация списка отзывов из CRM (только админ)
export async function PUT(request: NextRequest) {
  const auth = await requireAdminSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Ожидается массив отзывов' }, { status: 400 });
    }

    if (isDbMockMode()) {
      getMockStore().reviews = body.map((r: any) => ({
        id: String(r.id || `rev-${Date.now()}`),
        author: String(r.author || ''),
        role: String(r.role || ''),
        rating: Math.min(5, Math.max(1, Number(r.rating ?? 5) || 5)),
        text: String(r.text || ''),
        date: String(r.date || new Date().toLocaleDateString('ru-RU')),
        avatar: r.avatar ?? undefined,
        published: r.published !== false,
      }));
      return NextResponse.json({ ok: true, count: getMockStore().reviews.length });
    }

    for (const r of body) {
      await execute(
        `INSERT INTO reviews (id, author, role, rating, text, date, avatar, published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           author = VALUES(author),
           role = VALUES(role),
           rating = VALUES(rating),
           text = VALUES(text),
           date = VALUES(date),
           published = VALUES(published)`,
        [
          String(r.id || `rev-${Date.now()}`),
          String(r.author || ''),
          String(r.role || ''),
          Math.min(5, Math.max(1, Number(r.rating ?? 5) || 5)),
          String(r.text || ''),
          String(r.date || new Date().toLocaleDateString('ru-RU')),
          r.avatar ?? null,
          r.published !== false ? 1 : 0,
        ]
      );
    }

    return NextResponse.json({ ok: true, count: body.length });
  } catch (error: any) {
    console.error('[PUT /api/reviews]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}