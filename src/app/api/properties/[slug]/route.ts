import { NextResponse, NextRequest } from 'next/server';
import { execute, isDbMockMode, queryOne } from '@/lib/db';
import { getPropertyBySlug } from '@/lib/repository';
import {
  getSessionAgent,
  isAdminRole,
  isCallCenterRole,
  requireCrmSession,
} from '@/lib/auth';
import { getMockStore } from '@/lib/mockStore';
import { isPublicProperty, sanitizePropertyForPublic } from '@/lib/sanitize';

// GET /api/properties/[slug] — один объект
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getSessionAgent();
    const property = await getPropertyBySlug(slug);

    if (!property) {
      return NextResponse.json({ error: 'Объект не найден' }, { status: 404 });
    }

    if (!session) {
      if (!isPublicProperty(property)) {
        return NextResponse.json({ error: 'Объект не найден' }, { status: 404 });
      }
      return NextResponse.json(sanitizePropertyForPublic(property));
    }

    return NextResponse.json(property);
  } catch (error: any) {
    console.error('[GET /api/properties/[slug]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/properties/[slug] — обновить объект (CRM)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { slug } = await params;
    const body = await request.json();

    const allowed = [
      'title', 'type', 'address', 'priceBYN', 'priceUSD', 'rooms', 'area',
      'floor', 'totalFloors', 'photo', 'image', 'description', 'status',
      'agentName', 'agentPhone', 'assignedAgentId', 'assignedAgentName',
      'sellerPhone', 'contractStatus', 'contractNumber', 'contractDate',
      'sourceUrl', 'inventoryNo', 'priority',
      'district', 'metro', 'city', 'street', 'houseNumber', 'slug',
    ];
    const jsonFields = ['features', 'photos', 'images', 'priceHistory'];
    const boolFields = ['isPublished', 'internalOnly', 'crmOnly', 'isClosedBase'];

    if (isDbMockMode()) {
      const store = getMockStore();
      const idx = store.properties.findIndex((p) => p.slug === slug || p.id === slug);
      if (idx === -1) {
        return NextResponse.json({ error: 'Объект не найден' }, { status: 404 });
      }
      const existing = store.properties[idx];
      if (
        !isAdminRole(auth.agent) &&
        !isCallCenterRole(auth.agent) &&
        existing.assignedAgentId &&
        existing.assignedAgentId !== auth.agent.id
      ) {
        return NextResponse.json({ error: 'Нет прав на изменение чужого объекта' }, { status: 403 });
      }
      const next = { ...existing };
      for (const key of allowed) {
        if (body[key] !== undefined) (next as any)[key] = body[key];
      }
      for (const key of jsonFields) {
        if (body[key] !== undefined) (next as any)[key] = body[key];
      }
      for (const key of boolFields) {
        if (body[key] !== undefined) (next as any)[key] = Boolean(body[key]);
      }
      store.properties[idx] = next;
      return NextResponse.json(next);
    }

    const existing = await queryOne(
      'SELECT id, assignedAgentId FROM properties WHERE slug = ? OR externalId = ? OR id = ? LIMIT 1',
      [slug, slug, slug]
    );
    if (!existing) {
      return NextResponse.json({ error: 'Объект не найден' }, { status: 404 });
    }
    if (
      !isAdminRole(auth.agent) &&
      !isCallCenterRole(auth.agent) &&
      existing.assignedAgentId &&
      existing.assignedAgentId !== auth.agent.id
    ) {
      return NextResponse.json({ error: 'Нет прав на изменение чужого объекта' }, { status: 403 });
    }

    const fields: string[] = [];
    const values: any[] = [];

    for (const key of allowed) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(body[key]);
      }
    }
    for (const key of jsonFields) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(JSON.stringify(body[key]));
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
    await execute(`UPDATE properties SET ${fields.join(', ')} WHERE id = ?`, values);

    const updated = await queryOne('SELECT * FROM properties WHERE id = ? LIMIT 1', [existing.id]);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[PUT /api/properties/[slug]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/properties/[slug] — удалить объект (CRM)
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
      const idx = store.properties.findIndex((p) => p.slug === slug || p.id === slug);
      if (idx === -1) {
        return NextResponse.json({ error: 'Объект не найден' }, { status: 404 });
      }
      const existing = store.properties[idx];
      if (
        !isAdminRole(auth.agent) &&
        existing.assignedAgentId &&
        existing.assignedAgentId !== auth.agent.id
      ) {
        return NextResponse.json({ error: 'Нет прав на удаление чужого объекта' }, { status: 403 });
      }
      store.properties.splice(idx, 1);
      return NextResponse.json({ ok: true });
    }

    const existing = await queryOne(
      'SELECT id, assignedAgentId FROM properties WHERE slug = ? OR externalId = ? OR id = ? LIMIT 1',
      [slug, slug, slug]
    );
    if (!existing) {
      return NextResponse.json({ error: 'Объект не найден' }, { status: 404 });
    }
    if (
      !isAdminRole(auth.agent) &&
      existing.assignedAgentId &&
      existing.assignedAgentId !== auth.agent.id
    ) {
      return NextResponse.json({ error: 'Нет прав на удаление чужого объекта' }, { status: 403 });
    }

    await execute('DELETE FROM properties WHERE id = ?', [existing.id]);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[DELETE /api/properties/[slug]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}