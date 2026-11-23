import { NextResponse, NextRequest } from 'next/server';
import { execute, isDbMockMode, queryOne, query } from '@/lib/db';
import { getAllArticles, getArticles } from '@/lib/repository';
import { requireCrmSession } from '@/lib/auth';
import { getMockStore } from '@/lib/mockStore';
import { generateSlug } from '@/lib/slugify';
import { sanitizeRichHtml } from '@/lib/sanitize';

// GET /api/articles?all=true — список статей
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    if (all) {
      const auth = await requireCrmSession();
      if (auth.errorResponse) return auth.errorResponse;
      if (isDbMockMode()) {
        return NextResponse.json(await getAllArticles());
      }
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

// POST /api/articles — создать статью (только CRM)
export async function POST(request: NextRequest) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json();

    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Поля title и content обязательны' },
        { status: 400 }
      );
    }

    const id = body.id || `art-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const slug = body.slug ? generateSlug(body.slug) : generateSlug(body.title);
    const cleanContent = sanitizeRichHtml(String(body.content));

    if (isDbMockMode()) {
      const store = getMockStore();
      if (store.articles.some((a) => a.slug === slug)) {
        return NextResponse.json({ error: 'Статья с таким slug уже существует' }, { status: 409 });
      }
      const created = {
        id,
        slug,
        title: String(body.title),
        snippet: String(body.snippet || ''),
        content: cleanContent,
        category: body.category || 'news',
        date: body.date || new Date().toLocaleDateString('ru-RU'),
        photo: body.photo ?? '/photo/hero-news.jpg',
        image: body.image ?? undefined,
        published: body.published !== false,
      };
      store.articles.unshift(created);
      return NextResponse.json(created, { status: 201 });
    }

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
        cleanContent,
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