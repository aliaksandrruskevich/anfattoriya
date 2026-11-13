import { NextResponse, NextRequest } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { getArticleBySlug } from '@/lib/repository';

// GET /api/articles/[slug] — одна статья
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
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

// PUT /api/articles/[slug] — обновить статью
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const existing = await queryOne(
      'SELECT id FROM articles WHERE slug = ? LIMIT 1',
      [slug]
    );
    if (!existing) {
      return NextResponse.json({ error: 'Статья не найдена' }, { status: 404 });
    }

    const fields: string[] = [];
    const values: any[] = [];

    const allowed = ['title', 'snippet', 'content', 'category', 'date', 'photo', 'image'];
    const boolFields = ['published'];

    for (const key of allowed) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(body[key]);
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

// DELETE /api/articles/[slug] — удалить статью
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const existing = await queryOne(
      'SELECT id FROM articles WHERE slug = ? LIMIT 1',
      [slug]
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