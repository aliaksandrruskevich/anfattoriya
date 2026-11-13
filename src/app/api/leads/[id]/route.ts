import { NextResponse, NextRequest } from 'next/server';
import { execute, queryOne } from '@/lib/db';

// GET /api/leads/[id] — один лид
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lead = await queryOne('SELECT * FROM leads WHERE id = ? LIMIT 1', [id]);
    if (!lead) {
      return NextResponse.json({ error: 'Лид не найден' }, { status: 404 });
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
  try {
    const { id } = await params;
    const body = await request.json();

    const fields: string[] = [];
    const values: any[] = [];

    const allowed = [
      'name', 'phone', 'typeOrPrice', 'formName', 'date', 'status', 'stage',
      'source', 'notes', 'lastContactedAt', 'nextContactDate', 'nextContactTime',
      'nextContactTask', 'priority', 'assignedAgentId', 'assignedAgentName',
      'voiceSummary', 'callIntent',
    ];

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
    const result = await execute(`UPDATE leads SET ${fields.join(', ')} WHERE id = ?`, values);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Лид не найден' }, { status: 404 });
    }

    const updated = await queryOne('SELECT * FROM leads WHERE id = ? LIMIT 1', [id]);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[PUT /api/leads/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/leads/[id] — удалить лид
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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