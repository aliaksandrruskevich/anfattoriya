import { NextResponse, NextRequest } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { getAgents, getAllAgents } from '@/lib/repository';
import bcrypt from 'bcryptjs'; // <-- ДОБАВЛЕН ИМПОРТ

// GET /api/agents?all=true — список агентов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';
    const agents = all ? await getAllAgents() : await getAgents();
    return NextResponse.json(agents);
  } catch (error: any) {
    console.error('[GET /api/agents]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/agents — создать агента
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: 'Поля name и phone обязательны' },
        { status: 400 }
      );
    }

    const id = body.id || `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Хэшируем пароль, если он передан и не пустой
    const hashedPassword = body.password && String(body.password).trim()
      ? await bcrypt.hash(String(body.password).trim(), 10)
      : null;

    await execute(
      `INSERT INTO agents (
        id, name, photo, role, experience, rating, phone, specialization,
        dealsCount, isAdmin, isApproved, hasLeadsAccess, password, email,
        achievements, assignedManagerId, assignedManagerName, agencyName,
        description, firstName, lastName, patronymic, objectsCount,
        userUuid, userId, contact, certNo, certDate, cardNo, status, isDismissed, reviews
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.name,
        body.photo || '/photo/logo.png',
        body.role || 'Аттестованный риэлтер',
        body.experience ?? null,
        body.rating ?? 5,
        body.phone,
        body.specialization || 'all',
        body.dealsCount ?? 0,
        body.isAdmin ? 1 : 0,
        body.isApproved !== false ? 1 : 0,
        body.hasLeadsAccess ? 1 : 0,
        hashedPassword,           // <-- ИСПОЛЬЗУЕМ ХЭШ
        body.email ?? null,
        body.achievements ?? null,
        body.assignedManagerId ?? null,
        body.assignedManagerName ?? null,
        body.agencyName ?? 'ООО «АН Фаттория»',
        body.description ?? null,
        body.firstName ?? null,
        body.lastName ?? null,
        body.patronymic ?? null,
        body.objectsCount ?? 0,
        body.userUuid ?? null,
        body.userId ?? null,
        body.contact ?? null,
        body.certNo ?? null,
        body.certDate ?? null,
        body.cardNo ?? null,
        body.status ?? 'active',
        body.isDismissed ? 1 : 0,
        null,
      ]
    );

    // Возвращаем созданную запись
    const created = await queryOne('SELECT * FROM agents WHERE id = ? LIMIT 1', [id]);

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/agents]', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Агент с таким ID или email уже существует' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}