import { NextResponse, NextRequest } from 'next/server';
import { execute, isDbMockMode, queryOne } from '@/lib/db';
import { getAgents, getAllAgents } from '@/lib/repository';
import { getSessionAgent, requireAdminSession, requireCrmSession } from '@/lib/auth';
import { getMockStore } from '@/lib/mockStore';
import { sanitizeAgentForClient, sanitizeAgentForPublic } from '@/lib/sanitize';
import bcrypt from 'bcryptjs';

// GET /api/agents?all=true — список агентов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    if (all) {
      const auth = await requireCrmSession();
      if (auth.errorResponse) return auth.errorResponse;
      const agents = await getAllAgents();
      return NextResponse.json(agents.map(sanitizeAgentForClient));
    }

    const session = await getSessionAgent();
    const agents = await getAgents();
    return NextResponse.json(
      session ? agents.map(sanitizeAgentForClient) : agents.map(sanitizeAgentForPublic)
    );
  } catch (error: any) {
    console.error('[GET /api/agents]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/agents — создать агента (только админ)
export async function POST(request: NextRequest) {
  const auth = await requireAdminSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json();

    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: 'Поля name и phone обязательны' },
        { status: 400 }
      );
    }

    const id = body.id || `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const hashedPassword =
      body.password && String(body.password).trim()
        ? await bcrypt.hash(String(body.password).trim(), 10)
        : undefined;

    if (isDbMockMode()) {
      const store = getMockStore();
      if (
        store.agents.some(
          (a) =>
            a.id === id ||
            (body.email && a.email && a.email.toLowerCase() === String(body.email).toLowerCase())
        )
      ) {
        return NextResponse.json({ error: 'Агент с таким ID или email уже существует' }, { status: 409 });
      }
      const newRecord = {
        id,
        name: String(body.name),
        photo: body.photo || '/photo/logo.png',
        role: body.role || 'Аттестованный риэлтер',
        experience: body.experience ?? undefined,
        rating: Number(body.rating ?? 5),
        phone: String(body.phone),
        specialization: body.specialization || 'all',
        dealsCount: Number(body.dealsCount ?? 0),
        isAdmin: Boolean(body.isAdmin),
        isApproved: body.isApproved !== false,
        hasLeadsAccess: Boolean(body.hasLeadsAccess),
        password: hashedPassword,
        email: body.email ?? undefined,
        achievements: body.achievements ?? undefined,
        assignedManagerId: body.assignedManagerId ?? undefined,
        assignedManagerName: body.assignedManagerName ?? undefined,
        agencyName: body.agencyName ?? 'ООО «АН Фаттория»',
        description: body.description ?? undefined,
        firstName: body.firstName ?? undefined,
        lastName: body.lastName ?? undefined,
        patronymic: body.patronymic ?? undefined,
        objectsCount: Number(body.objectsCount ?? 0),
        userUuid: body.userUuid ?? undefined,
        userId: body.userId ?? undefined,
        contact: body.contact ?? undefined,
        certNo: body.certNo ?? undefined,
        certDate: body.certDate ?? undefined,
        cardNo: body.cardNo ?? undefined,
        status: (body.status ?? 'active') as 'active' | 'dismissed',
        isDismissed: Boolean(body.isDismissed),
      };
      store.agents.push(newRecord);
      return NextResponse.json(sanitizeAgentForClient(newRecord), { status: 201 });
    }

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
        hashedPassword ?? null,
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

    const created = await queryOne(
      `SELECT id, name, photo, role, experience, rating, phone, specialization,
              dealsCount, isAdmin, isApproved, hasLeadsAccess, email, achievements,
              assignedManagerId, assignedManagerName, agencyName, description,
              firstName, lastName, patronymic, objectsCount, status, isDismissed
       FROM agents WHERE id = ? LIMIT 1`,
      [id]
    );

    return NextResponse.json(created ? sanitizeAgentForClient(created) : { id }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/agents]', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Агент с таким ID или email уже существует' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}