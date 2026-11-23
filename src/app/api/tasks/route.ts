import { NextResponse, NextRequest } from 'next/server';
import { execute, isDbMockMode, queryOne } from '@/lib/db';
import { getTasks } from '@/lib/repository';
import { isAdminRole, requireCrmSession } from '@/lib/auth';
import { getMockStore } from '@/lib/mockStore';
import type { CRMTask } from '@/types';

export async function GET(request: NextRequest) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const requestedAgentId = searchParams.get('agentId') || undefined;
    const isAdmin = isAdminRole(auth.agent);

    const tasks = await getTasks(isAdmin ? requestedAgentId : auth.agent.id);
    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error('[GET /api/tasks]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ error: 'Поле title обязательно' }, { status: 400 });
    }

    const isAdmin = isAdminRole(auth.agent);
    const agentId = isAdmin && body.agentId ? String(body.agentId) : auth.agent.id;
    const assignedAgentName =
      isAdmin && body.assignedAgentName ? body.assignedAgentName : auth.agent.name;

    const id = body.id || `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const newTask: CRMTask = {
      id,
      title: String(body.title),
      description: body.description ?? undefined,
      deadline: body.deadline || new Date().toISOString().split('T')[0],
      status: (body.status || 'pending') as CRMTask['status'],
      priority: (body.priority || 'medium') as CRMTask['priority'],
      clientId: body.clientId ?? undefined,
      clientName: body.clientName ?? undefined,
      clientPhone: body.clientPhone ?? undefined,
      clientAddress: body.clientAddress ?? undefined,
      agentId,
      assignedAgentName,
      actionType: body.actionType ?? undefined,
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isDbMockMode()) {
      getMockStore().tasks.unshift(newTask);
      return NextResponse.json(newTask, { status: 201 });
    }

    await execute(
      `INSERT INTO crm_tasks (
        id, title, description, deadline, status, priority, clientId,
        clientName, clientPhone, clientAddress, agentId, assignedAgentName,
        actionType, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newTask.id,
        newTask.title,
        newTask.description ?? null,
        newTask.deadline,
        newTask.status,
        newTask.priority,
        newTask.clientId ?? null,
        newTask.clientName ?? null,
        newTask.clientPhone ?? null,
        newTask.clientAddress ?? null,
        newTask.agentId,
        newTask.assignedAgentName ?? null,
        newTask.actionType ?? null,
        newTask.createdAt,
      ]
    );

    const created = await queryOne('SELECT * FROM crm_tasks WHERE id = ? LIMIT 1', [id]);
    return NextResponse.json(created || newTask, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/tasks]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}