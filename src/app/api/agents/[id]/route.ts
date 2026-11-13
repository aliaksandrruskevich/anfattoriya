import { NextResponse, NextRequest } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { getAgentById } from '@/lib/repository';
import bcrypt from 'bcryptjs';

// GET /api/agents/[id] — один агент
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agent = await getAgentById(id);
    if (!agent) {
      return NextResponse.json({ error: 'Агент не найден' }, { status: 404 });
    }
    return NextResponse.json(agent);
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
  try {
    const { id } = await params;
    const body = await request.json();

    // 1. Сначала делаем всю асинхронную работу (хэширование)
    let hashedPassword: string | undefined = undefined;
    if (body.password !== undefined && String(body.password).trim() !== '') {
      hashedPassword = await bcrypt.hash(String(body.password).trim(), 10);
    }

    // 2. Затем собираем поля для SQL
    const fields: string[] = [];
    const values: any[] = [];

    const allowed = [
      'name', 'photo', 'role', 'experience', 'rating', 'phone', 'specialization',
      'dealsCount', 'isAdmin', 'isApproved', 'hasLeadsAccess', 'email',
      'achievements', 'agencyName', 'description', 'firstName', 'lastName',
      'patronymic', 'objectsCount', 'contact', 'certNo', 'certDate', 'cardNo',
      'status', 'isDismissed',
    ];

    for (const key of allowed) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`);
        // Булевы поля MySQL ожидает как 0/1
        if (['isAdmin', 'isApproved', 'hasLeadsAccess', 'isDismissed'].includes(key)) {
          values.push(body[key] ? 1 : 0);
        } else {
          values.push(body[key]);
        }
      }
    }

    // 3. Добавляем уже готовый хэш пароля
    if (hashedPassword) {
      fields.push('password = ?');
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'Нет полей для обновления' }, { status: 400 });
    }

    values.push(id);
    
    // 4. Выполняем запрос
    await execute(`UPDATE agents SET ${fields.join(', ')} WHERE id = ?`, values);

    const updated = await queryOne('SELECT * FROM agents WHERE id = ? LIMIT 1', [id]);
    if (!updated) {
      return NextResponse.json({ error: 'Агент не найден' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[PUT /api/agents/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/agents/[id] — soft delete
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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