import { NextResponse, NextRequest } from 'next/server';
import { execute, queryOne } from '@/lib/db';

// GET /api/tasks/[id] — одна задача
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await queryOne('SELECT * FROM crm_tasks WHERE id = ? LIMIT 1', [id]);
    if (!task) {
      return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 });
    }
    return NextResponse.json(task);
  } catch (error: any) {
    console.error('[GET /api/tasks/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/tasks/[id] — обновить задачу
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
      'title', 'description', 'deadline', 'status', 'priority', 'clientId',
      'clientName', 'clientPhone', 'clientAddress', 'agentId',
      'assignedAgentName', 'actionType',
    ];

    for (const key of allowed) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(body[key]);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'Нет полей для обновления' }, { status: 400 });
    }

    values.push(id);
    const result = await execute(
      `UPDATE crm_tasks SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 });
    }

    const updated = await queryOne('SELECT * FROM crm_tasks WHERE id = ? LIMIT 1', [id]);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[PUT /api/tasks/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] — удалить задачу
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await execute('DELETE FROM crm_tasks WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[DELETE /api/tasks/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}