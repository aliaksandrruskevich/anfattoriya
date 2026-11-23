import { NextResponse, NextRequest } from 'next/server';
import { execute, isDbMockMode, queryOne } from '@/lib/db';
import { isAdminRole, isCallCenterRole, requireCrmSession } from '@/lib/auth';
import { getMockStore } from '@/lib/mockStore';

function canAccessSeller(agent: any, seller: any): boolean {
  if (isAdminRole(agent) || isCallCenterRole(agent)) return true;
  return seller.assignedAgentId === agent.id;
}

// GET /api/sellers/[id] — один продавец
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;

    if (isDbMockMode()) {
      const seller = getMockStore().sellers.find((s) => s.id === id);
      if (!seller) return NextResponse.json({ error: 'Продавец не найден' }, { status: 404 });
      if (!canAccessSeller(auth.agent, seller)) {
        return NextResponse.json({ error: 'Нет доступа к продавцу' }, { status: 403 });
      }
      return NextResponse.json(seller);
    }

    const seller = await queryOne('SELECT * FROM cold_sellers WHERE id = ? LIMIT 1', [id]);
    if (!seller) {
      return NextResponse.json({ error: 'Продавец не найден' }, { status: 404 });
    }
    if (!canAccessSeller(auth.agent, seller)) {
      return NextResponse.json({ error: 'Нет доступа к продавцу' }, { status: 403 });
    }
    return NextResponse.json(seller);
  } catch (error: any) {
    console.error('[GET /api/sellers/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/sellers/[id] — обновить продавца
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();
    const isPrivileged = isAdminRole(auth.agent) || isCallCenterRole(auth.agent);

    const allowed = [
      'name', 'phone', 'address', 'propertyType', 'askingPriceBYN', 'askingPriceUSD',
      'status', 'kanbanStage',
      ...(isPrivileged ? ['assignedAgentName', 'assignedAgentId'] : []),
      'callOperatorName', 'notes', 'nextContactDate', 'nextContactTime',
      'contractNumber', 'contractDate', 'rooms', 'area', 'floor', 'totalFloors',
      'publishedPropertyId',
    ];
    const jsonFields = ['commentsHistory', 'attachments', 'tags'];

    if (isDbMockMode()) {
      const store = getMockStore();
      const idx = store.sellers.findIndex((s) => s.id === id);
      if (idx === -1) return NextResponse.json({ error: 'Продавец не найден' }, { status: 404 });
      if (!canAccessSeller(auth.agent, store.sellers[idx])) {
        return NextResponse.json({ error: 'Нет доступа к продавцу' }, { status: 403 });
      }
      const next = { ...store.sellers[idx] };
      for (const key of allowed) {
        if (body[key] !== undefined) (next as any)[key] = body[key];
      }
      for (const key of jsonFields) {
        if (body[key] !== undefined) (next as any)[key] = body[key];
      }
      store.sellers[idx] = next;
      return NextResponse.json(next);
    }

    const existing = await queryOne('SELECT * FROM cold_sellers WHERE id = ? LIMIT 1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Продавец не найден' }, { status: 404 });
    }
    if (!canAccessSeller(auth.agent, existing)) {
      return NextResponse.json({ error: 'Нет доступа к продавцу' }, { status: 403 });
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

    if (fields.length === 0) {
      return NextResponse.json({ error: 'Нет полей для обновления' }, { status: 400 });
    }

    values.push(id);
    await execute(
      `UPDATE cold_sellers SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const updated = await queryOne('SELECT * FROM cold_sellers WHERE id = ? LIMIT 1', [id]);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[PUT /api/sellers/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/sellers/[id] — удалить продавца
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;

    if (isDbMockMode()) {
      const store = getMockStore();
      const idx = store.sellers.findIndex((s) => s.id === id);
      if (idx === -1) return NextResponse.json({ error: 'Продавец не найден' }, { status: 404 });
      if (!canAccessSeller(auth.agent, store.sellers[idx])) {
        return NextResponse.json({ error: 'Нет прав на удаление продавца' }, { status: 403 });
      }
      store.sellers.splice(idx, 1);
      return NextResponse.json({ ok: true });
    }

    const existing = await queryOne('SELECT * FROM cold_sellers WHERE id = ? LIMIT 1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Продавец не найден' }, { status: 404 });
    }
    if (!canAccessSeller(auth.agent, existing)) {
      return NextResponse.json({ error: 'Нет прав на удаление продавца' }, { status: 403 });
    }

    await execute('DELETE FROM cold_sellers WHERE id = ?', [id]);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[DELETE /api/sellers/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}