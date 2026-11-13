import { NextResponse, NextRequest } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { getBuyers } from '@/lib/repository';

// GET /api/buyers?status=active&agentId=... — список покупателей
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const agentId = searchParams.get('agentId') || undefined;

    const buyers = await getBuyers({ status, agentId });
    return NextResponse.json(buyers);
  } catch (error: any) {
    console.error('[GET /api/buyers]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/buyers — создать покупателя
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.phone) {
      return NextResponse.json({ error: 'Поля name и phone обязательны' }, { status: 400 });
    }

    const id = body.id || `buyer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await execute(
      `INSERT INTO buyers (
        id, name, phone, budgetBYN, budgetUSD, preferences, registeredBy,
        assignedAgentId, assignedAgentName, status, dateAdded, prefType,
        prefRooms, prefDistrict, prefFloor, floorPreference, prefCondition,
        renovation, minArea, maxArea, searchCriteria, autoMatchingEnabled,
        notifyChannel, tags, isPublicApproved, isPublishedOnSite, crmOnly
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.name,
        body.phone,
        body.budgetBYN ?? 0,
        body.budgetUSD ?? null,
        body.preferences || '',
        body.registeredBy || '',
        body.assignedAgentId ?? null,
        body.assignedAgentName ?? null,
        body.status || 'active',
        body.dateAdded || new Date().toLocaleDateString('ru-RU'),
        body.prefType ?? null,
        body.prefRooms ?? null,
        body.prefDistrict ?? null,
        body.prefFloor ?? null,
        body.floorPreference ?? null,
        body.prefCondition ?? null,
        body.renovation ?? null,
        body.minArea ?? null,
        body.maxArea ?? null,
        body.searchCriteria ? JSON.stringify(body.searchCriteria) : null,
        body.autoMatchingEnabled ? 1 : 0,
        body.notifyChannel ?? null,
        body.tags ? JSON.stringify(body.tags) : null,
        body.isPublicApproved ? 1 : 0,
        body.isPublishedOnSite ? 1 : 0,
        body.crmOnly ? 1 : 0,
      ]
    );

    const created = await queryOne('SELECT * FROM buyers WHERE id = ? LIMIT 1', [id]);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/buyers]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}