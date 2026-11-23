import { NextResponse, NextRequest } from 'next/server';
import { execute, isDbMockMode, queryOne } from '@/lib/db';
import { getArticleBySlug } from '@/lib/repository';
import { getSessionAgent, requireCrmSession } from '@/lib/auth';
import { getMockStore } from '@/lib/mockStore';
import { sanitizeRichHtml } from '@/lib/sanitize';

// GET /api/articles/[slug] — одна статья
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getSessionAgent();

    if (isDbMockMode()) {
      const found = getMockStore().articles.find((a) => a.slug === slug || a.id === slug);
      if (!found || (!session && found.published === false)) {
        return NextResponse.json({ error: 'Статья не найдена' }, { status: 404 });
      }
      const { published: _p, ...rest } = found;
      return NextResponse.json(rest);
    }

    const article = await getArticleBySlug(slug);
    if (!article) {
      return NextResponse.json({ error: 'Статья не найдена' }, { status: 404 });
    }
    return NextResponse.json(article);
  } catch (error: any) {
    console.error('[GET /api/articles/[slug]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/articles/[slug] — обновить статью (только CRM)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { slug } = await params;
    const body = await request.json();

    const allowed = ['title', 'snippet', 'content', 'category', 'date', 'photo', 'image'];
    const boolFields = ['published'];

    if (isDbMockMode()) {
      const store = getMockStore();
      const idx = store.articles.findIndex((a) => a.slug === slug || a.id === slug);
      if (idx === -1) return NextResponse.json({ error: 'Статья не найдена' }, { status: 404 });
      const next = { ...store.articles[idx] };
      for (const key of allowed) {
        if (body[key] !== undefined) {
          (next as any)[key] = key === 'content' ? sanitizeRichHtml(String(body[key])) : body[key];
        }
      }
      for (const key of boolFields) {
        if (body[key] !== undefined) (next as any)[key] = Boolean(body[key]);
      }
      store.articles[idx] = next;
      return NextResponse.json(next);
    }

    const existing = await queryOne(
      'SELECT id FROM articles WHERE slug = ? OR id = ? LIMIT 1',
      [slug, slug]
    );
    if (!existing) {
      return NextResponse.json({ error: 'Статья не найдена' }, { status: 404 });
    }

    const fields: string[] = [];
    const values: any[] = [];

    for (const key of allowed) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(key === 'content' ? sanitizeRichHtml(String(body[key])) : body[key]);
      }
    }
    for (const key of boolFields) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(body[key] ? 1 : 0);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'Нет полей для обновления' }, { status: 400 });
    }

    values.push(existing.id);
    await execute(`UPDATE articles SET ${fields.join(', ')} WHERE id = ?`, values);

    const updated = await queryOne('SELECT * FROM articles WHERE id = ? LIMIT 1', [existing.id]);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[PUT /api/articles/[slug]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/articles/[slug] — удалить статью (только CRM)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { slug } = await params;

    if (isDbMockMode()) {
      const store = getMockStore();
      const idx = store.articles.findIndex((a) => a.slug === slug || a.id === slug);
      if (idx === -1) return NextResponse.json({ error: 'Статья не найдена' }, { status: 404 });
      store.articles.splice(idx, 1);
      return NextResponse.json({ ok: true });
    }

    const existing = await queryOne(
      'SELECT id FROM articles WHERE slug = ? OR id = ? LIMIT 1',
      [slug, slug]
    );
    if (!existing) {
      return NextResponse.json({ error: 'Статья не найдена' }, { status: 404 });
    }

    await execute('DELETE FROM articles WHERE id = ?', [existing.id]);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[DELETE /api/articles/[slug]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}