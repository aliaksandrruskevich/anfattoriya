import { NextResponse, NextRequest } from 'next/server';
import { execute, isDbMockMode, queryOne } from '@/lib/db';
import { isAdminRole, requireCrmSession } from '@/lib/auth';
import { getMockStore } from '@/lib/mockStore';

function canAccessTask(agent: any, task: any): boolean {
  return isAdminRole(agent) || task.agentId === agent.id;
}

// GET /api/tasks/[id] — одна задача
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;

    if (isDbMockMode()) {
      const task = getMockStore().tasks.find((t) => t.id === id);
      if (!task) return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 });
      if (!canAccessTask(auth.agent, task)) {
        return NextResponse.json({ error: 'Нет доступа к задаче' }, { status: 403 });
      }
      return NextResponse.json(task);
    }

    const task = await queryOne('SELECT * FROM crm_tasks WHERE id = ? LIMIT 1', [id]);
    if (!task) {
      return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 });
    }
    if (!canAccessTask(auth.agent, task)) {
      return NextResponse.json({ error: 'Нет доступа к задаче' }, { status: 403 });
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
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();
    const isAdmin = isAdminRole(auth.agent);

    const allowed = [
      'title', 'description', 'deadline', 'status', 'priority', 'clientId',
      'clientName', 'clientPhone', 'clientAddress',
      ...(isAdmin ? ['agentId', 'assignedAgentName'] : []),
      'actionType',
    ];

    if (isDbMockMode()) {
      const store = getMockStore();
      const idx = store.tasks.findIndex((t) => t.id === id);
      if (idx === -1) return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 });
      if (!canAccessTask(auth.agent, store.tasks[idx])) {
        return NextResponse.json({ error: 'Нет доступа к задаче' }, { status: 403 });
      }
      const next = { ...store.tasks[idx] };
      for (const key of allowed) {
        if (body[key] !== undefined) (next as any)[key] = body[key];
      }
      store.tasks[idx] = next;
      return NextResponse.json(next);
    }

    const existing = await queryOne('SELECT * FROM crm_tasks WHERE id = ? LIMIT 1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 });
    }
    if (!canAccessTask(auth.agent, existing)) {
      return NextResponse.json({ error: 'Нет доступа к задаче' }, { status: 403 });
    }

    const fields: string[] = [];
    const values: any[] = [];

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
    await execute(
      `UPDATE crm_tasks SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

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
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;

    if (isDbMockMode()) {
      const store = getMockStore();
      const idx = store.tasks.findIndex((t) => t.id === id);
      if (idx === -1) return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 });
      if (!canAccessTask(auth.agent, store.tasks[idx])) {
        return NextResponse.json({ error: 'Нет прав на удаление задачи' }, { status: 403 });
      }
      store.tasks.splice(idx, 1);
      return NextResponse.json({ ok: true });
    }

    const existing = await queryOne('SELECT * FROM crm_tasks WHERE id = ? LIMIT 1', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 });
    }
    if (!canAccessTask(auth.agent, existing)) {
      return NextResponse.json({ error: 'Нет прав на удаление задачи' }, { status: 403 });
    }

    await execute('DELETE FROM crm_tasks WHERE id = ?', [id]);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[DELETE /api/tasks/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}