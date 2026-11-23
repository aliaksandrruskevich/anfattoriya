import { NextResponse, NextRequest } from 'next/server';
import { execute, isDbMockMode, queryOne } from '@/lib/db';
import { getAgentById } from '@/lib/repository';
import {
  getSessionAgent,
  isAdminRole,
  requireAdminSession,
  requireCrmSession,
} from '@/lib/auth';
import { getMockStore } from '@/lib/mockStore';
import { sanitizeAgentForClient, sanitizeAgentForPublic } from '@/lib/sanitize';
import bcrypt from 'bcryptjs';

// GET /api/agents/[id] — один агент
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionAgent();
    const agent = await getAgentById(id);

    if (!agent || (!session && (agent.isDismissed || agent.status === 'dismissed'))) {
      return NextResponse.json({ error: 'Агент не найден' }, { status: 404 });
    }

    return NextResponse.json(
      session ? sanitizeAgentForClient(agent) : sanitizeAgentForPublic(agent)
    );
  } catch (error: any) {
    console.error('[GET /api/agents/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/agents/[id] — обновить агента
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

    if (!isAdmin && auth.agent.id !== id) {
      return NextResponse.json(
        { error: 'Недостаточно прав для редактирования другого сотрудника' },
        { status: 403 }
      );
    }

    const adminAllowed = [
      'name', 'photo', 'role', 'experience', 'rating', 'phone', 'specialization',
      'dealsCount', 'isAdmin', 'isApproved', 'hasLeadsAccess', 'email',
      'achievements', 'agencyName', 'description', 'firstName', 'lastName',
      'patronymic', 'objectsCount', 'contact', 'certNo', 'certDate', 'cardNo',
      'status', 'isDismissed',
    ];
    const selfAllowed = [
      'name', 'photo', 'role', 'experience', 'phone', 'specialization',
      'achievements', 'description', 'firstName', 'lastName', 'patronymic', 'contact',
    ];
    const allowed = isAdmin ? adminAllowed : selfAllowed;

    let hashedPassword: string | undefined = undefined;
    if (body.password !== undefined && String(body.password).trim() !== '') {
      hashedPassword = await bcrypt.hash(String(body.password).trim(), 10);
    }

    if (isDbMockMode()) {
      const store = getMockStore();
      const idx = store.agents.findIndex((a) => a.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Агент не найден' }, { status: 404 });
      }
      const current = { ...store.agents[idx] };
      let changed = false;
      for (const key of allowed) {
        if (body[key] !== undefined) {
          (current as any)[key] = ['isAdmin', 'isApproved', 'hasLeadsAccess', 'isDismissed'].includes(key)
            ? Boolean(body[key])
            : body[key];
          changed = true;
        }
      }
      if (hashedPassword) {
        current.password = hashedPassword;
        changed = true;
      }
      if (!changed) {
        return NextResponse.json({ error: 'Нет полей для обновления' }, { status: 400 });
      }
      store.agents[idx] = current;
      return NextResponse.json(sanitizeAgentForClient(current));
    }

    const fields: string[] = [];
    const values: any[] = [];

    for (const key of allowed) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`);
        if (['isAdmin', 'isApproved', 'hasLeadsAccess', 'isDismissed'].includes(key)) {
          values.push(body[key] ? 1 : 0);
        } else {
          values.push(body[key]);
        }
      }
    }

    if (hashedPassword) {
      fields.push('password = ?');
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'Нет полей для обновления' }, { status: 400 });
    }

    values.push(id);
    await execute(`UPDATE agents SET ${fields.join(', ')} WHERE id = ?`, values);

    const updated = await queryOne(
      `SELECT id, name, photo, role, experience, rating, phone, specialization,
              dealsCount, isAdmin, isApproved, hasLeadsAccess, email, achievements,
              assignedManagerId, assignedManagerName, agencyName, description,
              firstName, lastName, patronymic, objectsCount, status, isDismissed
       FROM agents WHERE id = ? LIMIT 1`,
      [id]
    );
    if (!updated) {
      return NextResponse.json({ error: 'Агент не найден' }, { status: 404 });
    }

    return NextResponse.json(sanitizeAgentForClient(updated));
  } catch (error: any) {
    console.error('[PUT /api/agents/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/agents/[id] — soft delete (только админ)
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
      const idx = store.agents.findIndex((a) => a.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Агент не найден' }, { status: 404 });
      }
      store.agents[idx] = {
        ...store.agents[idx],
        status: 'dismissed',
        isDismissed: true,
      };
      return NextResponse.json({ ok: true });
    }

    await execute(
      `UPDATE agents SET status = 'dismissed', isDismissed = 1 WHERE id = ?`,
      [id]
    );

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[DELETE /api/agents/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}