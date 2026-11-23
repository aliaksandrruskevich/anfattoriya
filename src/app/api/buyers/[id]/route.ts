import { NextResponse, NextRequest } from 'next/server';
import { execute, isDbMockMode, queryOne } from '@/lib/db';
import { isAdminRole, isCallCenterRole, requireCrmSession } from '@/lib/auth';
import { getMockStore } from '@/lib/mockStore';

function canAccessBuyer(agent: any, buyer: any): boolean {
  if (isAdminRole(agent) || isCallCenterRole(agent)) return true;
  return (
    buyer.assignedAgentId === agent.id ||
    buyer.registeredBy === agent.name
  );
}

// GET /api/buyers/[id] — один покупатель
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;

    if (isDbMockMode()) {
      const buyer = getMockStore().buyers.find((b) => b.id === id);
      if (!buyer) return NextResponse.json({ error: 'Покупатель не найден' }, { status: 404 });
      if (!canAccessBuyer(auth.agent, buyer) && !buyer.isPublicApproved) {
        return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
      }
      return NextResponse.json(buyer);
    }

    const buyer = await queryOne('SELECT * FROM buyers WHERE id = ? LIMIT 1', [id]);
    if (!buyer) {
      return NextResponse.json({ error: 'Покупатель не найден' }, { status: 404 });
    }
    if (!canAccessBuyer(auth.agent, buyer) && !buyer.isPublicApproved) {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }
    return NextResponse.json(buyer);
  } catch (error: any) {
    console.error('[GET /api/buyers/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/buyers/[id] — обновить покупателя
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();

    const allowed = [
      'name', 'phone', 'budgetBYN', 'budgetUSD', 'preferences', 'registeredBy',
      'assignedAgentId', 'assignedAgentName', 'status', 'dateAdded', 'prefType',
      'prefRooms', 'prefDistrict', 'prefFloor', 'floorPreference', 'prefCondition',
      'renovation', 'minArea', 'maxArea', 'notifyChannel',
    ];
    const jsonFields = ['searchCriteria', 'tags'];
    const boolFields = ['autoMatchingEnabled', 'isPublicApproved', 'isPublishedOnSite', 'crmOnly'];

    if (isDbMockMode()) {
      const store = getMockStore();
      const idx = store.buyers.findIndex((b) => b.id === id);
      if (idx === -1) return NextResponse.json({ error: 'Покупатель не найден' }, { status: 404 });
      if (!canAccessBuyer(auth.agent, store.buyers[idx])) {
        return NextResponse.json({ error: 'Нет прав на редактирование покупателя' }, { status: 403 });
      }
      const next = { ...store.buyers[idx] };
      for (const key of allowed) {
        if (body[key] !== undefined) (next as any)[key] = body[key];
      }
      for (const key of jsonFields) {
        if (body[key] !== undefined) (next as any)[key] = body[key];
      }
      for (const key of boolFields) {
        if (body[key] !== undefined) (next as any)[key] = Boolean(body[key]);
      }
      store.buyers[idx] = next;
      return NextResponse.json(next);
    }

    const existing = await queryOne('SELECT * FROM buyers WHERE id = ? LIMIT 1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Покупатель не найден' }, { status: 404 });
    }
    if (!canAccessBuyer(auth.agent, existing)) {
      return NextResponse.json({ error: 'Нет прав на редактирование покупателя' }, { status: 403 });
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

    values.push(id);
    await execute(`UPDATE buyers SET ${fields.join(', ')} WHERE id = ?`, values);

    const updated = await queryOne('SELECT * FROM buyers WHERE id = ? LIMIT 1', [id]);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[PUT /api/buyers/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/buyers/[id] — удалить покупателя
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
      const idx = store.buyers.findIndex((b) => b.id === id);
      if (idx === -1) return NextResponse.json({ error: 'Покупатель не найден' }, { status: 404 });
      if (!canAccessBuyer(auth.agent, store.buyers[idx])) {
        return NextResponse.json({ error: 'Нет прав на удаление покупателя' }, { status: 403 });
      }
      store.buyers.splice(idx, 1);
      return NextResponse.json({ ok: true });
    }

    const existing = await queryOne('SELECT * FROM buyers WHERE id = ? LIMIT 1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Покупатель не найден' }, { status: 404 });
    }
    if (!canAccessBuyer(auth.agent, existing)) {
      return NextResponse.json({ error: 'Нет прав на удаление покупателя' }, { status: 403 });
    }

    await execute('DELETE FROM buyers WHERE id = ?', [id]);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[DELETE /api/buyers/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}