import { NextResponse, NextRequest } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { getLeads } from '@/lib/repository';

// GET /api/leads?stage=new&agentId=... — список лидов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage') || undefined;
    const agentId = searchParams.get('agentId') || undefined;

    const leads = await getLeads({ stage, agentId });
    return NextResponse.json(leads);
  } catch (error: any) {
    console.error('[GET /api/leads]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/leads — создать лид
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.phone) {
      return NextResponse.json({ error: 'Поле phone обязательно' }, { status: 400 });
    }

    const id = body.id || `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await execute(
      `INSERT INTO leads (
        id, name, phone, typeOrPrice, formName, date, status, stage, source,
        notes, lastContactedAt, nextContactDate, nextContactTime, nextContactTask,
        priority, assignedAgentId, assignedAgentName, voiceSummary, callIntent, history
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.name || 'Не указано',
        body.phone,
        body.typeOrPrice || '',
        body.formName || 'Заявка с сайта',
        body.date || new Date().toLocaleString('ru-RU'),
        body.status ?? 'active',
        body.stage ?? 'new',
        body.source ?? null,
        body.notes ?? null,
        body.lastContactedAt ?? null,
        body.nextContactDate ?? null,
        body.nextContactTime ?? null,
        body.nextContactTask ?? null,
        body.priority ?? 'regular',
        body.assignedAgentId ?? null,
        body.assignedAgentName ?? null,
        body.voiceSummary ?? null,
        body.callIntent ?? null,
        body.history ? JSON.stringify(body.history) : null,
      ]
    );

    const created = await queryOne('SELECT * FROM leads WHERE id = ? LIMIT 1', [id]);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/leads]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/leads — очистить все лиды (только для админа)
export async function DELETE() {
  try {
    const result = await execute('DELETE FROM leads');
    return NextResponse.json({ ok: true, deleted: result.affectedRows });
  } catch (error: any) {
    console.error('[DELETE /api/leads]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}