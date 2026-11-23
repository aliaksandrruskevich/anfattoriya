import { NextResponse, NextRequest } from 'next/server';
import { execute, isDbMockMode, queryOne } from '@/lib/db';
import {
  isAdminRole,
  isCallCenterRole,
  requireAdminSession,
  requireCrmSession,
} from '@/lib/auth';
import { getMockStore } from '@/lib/mockStore';

function canAccessLead(agent: any, lead: any): boolean {
  if (isAdminRole(agent) || isCallCenterRole(agent) || agent.hasLeadsAccess) return true;
  return lead.assignedAgentId === agent.id;
}

// GET /api/leads/[id] — один лид
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;

    if (isDbMockMode()) {
      const lead = getMockStore().leads.find((l) => l.id === id);
      if (!lead) return NextResponse.json({ error: 'Лид не найден' }, { status: 404 });
      if (!canAccessLead(auth.agent, lead)) {
        return NextResponse.json({ error: 'Нет доступа к заявке' }, { status: 403 });
      }
      return NextResponse.json(lead);
    }

    const lead = await queryOne('SELECT * FROM leads WHERE id = ? LIMIT 1', [id]);
    if (!lead) {
      return NextResponse.json({ error: 'Лид не найден' }, { status: 404 });
    }
    if (!canAccessLead(auth.agent, lead)) {
      return NextResponse.json({ error: 'Нет доступа к заявке' }, { status: 403 });
    }
    return NextResponse.json(lead);
  } catch (error: any) {
    console.error('[GET /api/leads/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/leads/[id] — обновить лид
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
      'name', 'phone', 'typeOrPrice', 'formName', 'date', 'status', 'stage',
      'source', 'notes', 'lastContactedAt', 'nextContactDate', 'nextContactTime',
      'nextContactTask', 'priority', 'assignedAgentId', 'assignedAgentName',
      'voiceSummary', 'callIntent',
    ];

    if (isDbMockMode()) {
      const store = getMockStore();
      const idx = store.leads.findIndex((l) => l.id === id);
      if (idx === -1) return NextResponse.json({ error: 'Лид не найден' }, { status: 404 });
      if (!canAccessLead(auth.agent, store.leads[idx])) {
        return NextResponse.json({ error: 'Нет доступа к заявке' }, { status: 403 });
      }
      const next = { ...store.leads[idx] };
      for (const key of allowed) {
        if (body[key] !== undefined) (next as any)[key] = body[key];
      }
      if (body.history !== undefined) next.history = body.history;
      store.leads[idx] = next;
      return NextResponse.json(next);
    }

    const existing = await queryOne('SELECT * FROM leads WHERE id = ? LIMIT 1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Лид не найден' }, { status: 404 });
    }
    if (!canAccessLead(auth.agent, existing)) {
      return NextResponse.json({ error: 'Нет доступа к заявке' }, { status: 403 });
    }

    const fields: string[] = [];
    const values: any[] = [];

    for (const key of allowed) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(body[key]);
      }
    }

    if (body.history !== undefined) {
      fields.push('history = ?');
      values.push(JSON.stringify(body.history));
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'Нет полей для обновления' }, { status: 400 });
    }

    values.push(id);
    await execute(`UPDATE leads SET ${fields.join(', ')} WHERE id = ?`, values);

    const updated = await queryOne('SELECT * FROM leads WHERE id = ? LIMIT 1', [id]);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[PUT /api/leads/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/leads/[id] — удалить лид (только админ)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;

    if (isDbMockMode()) {
      const store = getMockStore();
      const idx = store.leads.findIndex((l) => l.id === id);
      if (idx === -1) return NextResponse.json({ error: 'Лид не найден' }, { status: 404 });
      store.leads.splice(idx, 1);
      return NextResponse.json({ ok: true });
    }

    const result = await execute('DELETE FROM leads WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Лид не найден' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[DELETE /api/leads/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}