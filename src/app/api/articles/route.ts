import { NextResponse, NextRequest } from 'next/server';
import { execute, queryOne, query } from '@/lib/db';
import { getArticles } from '@/lib/repository';
import { generateSlug } from '@/lib/slugify';

// GET /api/articles?all=true — список статей
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    if (all) {
      // Все статьи (включая черновики) — для CRM
      const rows = await query('SELECT * FROM articles ORDER BY date DESC');
      return NextResponse.json(rows);
    }

    const articles = await getArticles();
    return NextResponse.json(articles);
  } catch (error: any) {
    console.error('[GET /api/articles]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/articles — создать статью
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Поля title и content обязательны' },
        { status: 400 }
      );
    }

    const id = body.id || `art-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Slug: если передан — тоже прогоняем через generateSlug (кириллица → латиница),
    // если нет — генерируем из заголовка.
    const slug = body.slug
      ? generateSlug(body.slug)
      : generateSlug(body.title);

    await execute(
      `INSERT INTO articles (
        id, externalId, slug, title, snippet, content, category, date, photo, image, published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.externalId ?? null,
        slug,
        body.title,
        body.snippet || '',
        body.content,
        body.category || 'news',
        body.date || new Date().toLocaleDateString('ru-RU'),
        body.photo ?? null,
        body.image ?? null,
        body.published !== false ? 1 : 0,
      ]
    );

    const created = await queryOne('SELECT * FROM articles WHERE id = ? LIMIT 1', [id]);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/articles]', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Статья с таким slug уже существует' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}