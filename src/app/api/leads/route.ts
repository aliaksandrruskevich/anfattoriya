import { NextResponse, NextRequest } from 'next/server';
import { execute, isDbMockMode, queryOne } from '@/lib/db';
import { getLeads } from '@/lib/repository';
import {
  getSessionAgent,
  isAdminRole,
  isCallCenterRole,
  requireAdminSession,
  requireCrmSession,
} from '@/lib/auth';
import { getMockStore } from '@/lib/mockStore';
import { isValidPhone } from '@/lib/sanitize';
import type { Lead } from '@/types';

// GET /api/leads?stage=new&agentId=... — список лидов (только CRM)
export async function GET(request: NextRequest) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage') || undefined;
    const requestedAgentId = searchParams.get('agentId') || undefined;

    const isPrivileged =
      isAdminRole(auth.agent) ||
      isCallCenterRole(auth.agent) ||
      Boolean(auth.agent.hasLeadsAccess);

    let leads = await getLeads({
      stage,
      agentId: isPrivileged ? requestedAgentId : auth.agent.id,
    });

    if (!isPrivileged) {
      leads = leads.filter((l) => l.assignedAgentId === auth.agent.id);
    }

    return NextResponse.json(leads);
  } catch (error: any) {
    console.error('[GET /api/leads]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/leads — создать лид (публичные формы сайта ИЛИ CRM)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await getSessionAgent();

    if (!body.phone || !isValidPhone(body.phone)) {
      return NextResponse.json({ error: 'Укажите корректный номер телефона' }, { status: 400 });
    }

    const id =
      session && body.id
        ? String(body.id)
        : `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const newLead: Lead = {
      id,
      name: String(body.name || 'Не указано').slice(0, 160),
      phone: String(body.phone).slice(0, 40),
      typeOrPrice: String(body.typeOrPrice || '').slice(0, 500),
      formName: String(body.formName || 'Заявка с сайта').slice(0, 160),
      date:
        session && body.date
          ? String(body.date)
          : new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Minsk' }),
      status: session ? body.status ?? 'active' : 'active',
      stage: session ? body.stage ?? 'new' : 'new',
      source: session ? body.source ?? 'CRM' : 'Сайт fattoria.by',
      notes: session ? body.notes ?? undefined : undefined,
      lastContactedAt: session ? body.lastContactedAt ?? undefined : undefined,
      nextContactDate: session ? body.nextContactDate ?? undefined : undefined,
      nextContactTime: session ? body.nextContactTime ?? undefined : undefined,
      nextContactTask: session ? body.nextContactTask ?? undefined : undefined,
      priority: session && body.priority === 'urgent' ? 'urgent' : 'regular',
      assignedAgentId: session ? body.assignedAgentId ?? undefined : undefined,
      assignedAgentName: session ? body.assignedAgentName ?? undefined : undefined,
      voiceSummary: session ? body.voiceSummary ?? undefined : undefined,
      callIntent: session ? body.callIntent ?? undefined : undefined,
      history: session && Array.isArray(body.history) ? body.history : undefined,
    };

    if (isDbMockMode()) {
      getMockStore().leads.unshift(newLead);
      if (!session) {
        return NextResponse.json({ ok: true, id: newLead.id }, { status: 201 });
      }
      return NextResponse.json(newLead, { status: 201 });
    }

    await execute(
      `INSERT INTO leads (
        id, name, phone, typeOrPrice, formName, date, status, stage, source,
        notes, lastContactedAt, nextContactDate, nextContactTime, nextContactTask,
        priority, assignedAgentId, assignedAgentName, voiceSummary, callIntent, history
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newLead.id,
        newLead.name,
        newLead.phone,
        newLead.typeOrPrice,
        newLead.formName,
        newLead.date,
        newLead.status ?? 'active',
        newLead.stage ?? 'new',
        newLead.source ?? null,
        newLead.notes ?? null,
        newLead.lastContactedAt ?? null,
        newLead.nextContactDate ?? null,
        newLead.nextContactTime ?? null,
        newLead.nextContactTask ?? null,
        newLead.priority ?? 'regular',
        newLead.assignedAgentId ?? null,
        newLead.assignedAgentName ?? null,
        newLead.voiceSummary ?? null,
        newLead.callIntent ?? null,
        newLead.history ? JSON.stringify(newLead.history) : null,
      ]
    );

    if (!session) {
      return NextResponse.json({ ok: true, id: newLead.id }, { status: 201 });
    }

    const created = await queryOne('SELECT * FROM leads WHERE id = ? LIMIT 1', [id]);
    return NextResponse.json(created || newLead, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/leads]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/leads — очистить все лиды (только для админа)
export async function DELETE() {
  const auth = await requireAdminSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    if (isDbMockMode()) {
      const count = getMockStore().leads.length;
      getMockStore().leads = [];
      return NextResponse.json({ ok: true, deleted: count });
    }

    const result = await execute('DELETE FROM leads');
    return NextResponse.json({ ok: true, deleted: result.affectedRows });
  } catch (error: any) {
    console.error('[DELETE /api/leads]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}