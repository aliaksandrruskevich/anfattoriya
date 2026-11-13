import { NextResponse, NextRequest } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { getTasks } from '@/lib/repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId') || undefined;

    const tasks = await getTasks(agentId);
    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error('[GET /api/tasks]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.agentId) {
      return NextResponse.json({ error: 'Поля title и agentId обязательны' }, { status: 400 });
    }

    const id = body.id || `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await execute(
      `INSERT INTO crm_tasks (
        id, title, description, deadline, status, priority, clientId,
        clientName, clientPhone, clientAddress, agentId, assignedAgentName,
        actionType, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.title,
        body.description ?? null,
        body.deadline || new Date().toISOString().split('T')[0],
        body.status || 'pending',
        body.priority || 'medium',
        body.clientId ?? null,
        body.clientName ?? null,
        body.clientPhone ?? null,
        body.clientAddress ?? null,
        body.agentId,
        body.assignedAgentName ?? null,
        body.actionType ?? null,
        new Date().toISOString().split('T')[0],
      ]
    );

    const created = await queryOne('SELECT * FROM crm_tasks WHERE id = ? LIMIT 1', [id]);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/tasks]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}