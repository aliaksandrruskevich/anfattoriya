import { NextResponse, NextRequest } from 'next/server';
import { execute, isDbMockMode, queryOne } from '@/lib/db';
import { getBuyers } from '@/lib/repository';
import { isAdminRole, isCallCenterRole, requireCrmSession } from '@/lib/auth';
import { getMockStore } from '@/lib/mockStore';
import type { Buyer } from '@/types';

// GET /api/buyers?status=active&agentId=... — список покупателей (только CRM)
export async function GET(request: NextRequest) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const requestedAgentId = searchParams.get('agentId') || undefined;

    const isPrivileged = isAdminRole(auth.agent) || isCallCenterRole(auth.agent);
    let buyers = await getBuyers({
      status,
      agentId: isPrivileged ? requestedAgentId : undefined,
    });

    if (!isPrivileged) {
      buyers = buyers.filter(
        (b) =>
          b.assignedAgentId === auth.agent.id ||
          b.registeredBy === auth.agent.name ||
          b.isPublicApproved
      );
    }

    return NextResponse.json(buyers);
  } catch (error: any) {
    console.error('[GET /api/buyers]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/buyers — создать покупателя (только CRM)
export async function POST(request: NextRequest) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json();

    if (!body.name || !body.phone) {
      return NextResponse.json({ error: 'Поля name и phone обязательны' }, { status: 400 });
    }

    const isPrivileged = isAdminRole(auth.agent) || isCallCenterRole(auth.agent);
    const id = body.id || `buyer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const assignedAgentId = isPrivileged
      ? body.assignedAgentId ?? auth.agent.id
      : auth.agent.id;
    const assignedAgentName = isPrivileged
      ? body.assignedAgentName ?? auth.agent.name
      : auth.agent.name;

    const newBuyer: Buyer = {
      id,
      name: String(body.name),
      phone: String(body.phone),
      budgetBYN: Number(body.budgetBYN ?? 0),
      budgetUSD: body.budgetUSD != null ? Number(body.budgetUSD) : undefined,
      preferences: body.preferences || '',
      registeredBy: body.registeredBy || auth.agent.name,
      assignedAgentId,
      assignedAgentName,
      status: body.status || 'active',
      dateAdded: body.dateAdded || new Date().toLocaleDateString('ru-RU'),
      prefType: body.prefType ?? undefined,
      prefRooms: body.prefRooms ?? undefined,
      prefDistrict: body.prefDistrict ?? undefined,
      prefFloor: body.prefFloor ?? undefined,
      floorPreference: body.floorPreference ?? undefined,
      prefCondition: body.prefCondition ?? undefined,
      renovation: body.renovation ?? undefined,
      minArea: body.minArea ?? undefined,
      maxArea: body.maxArea ?? undefined,
      searchCriteria: body.searchCriteria ?? undefined,
      autoMatchingEnabled: Boolean(body.autoMatchingEnabled),
      notifyChannel: body.notifyChannel ?? undefined,
      tags: Array.isArray(body.tags) ? body.tags : undefined,
      isPublicApproved: Boolean(body.isPublicApproved),
      isPublishedOnSite: Boolean(body.isPublishedOnSite),
      crmOnly: Boolean(body.crmOnly),
    };

    if (isDbMockMode()) {
      getMockStore().buyers.unshift(newBuyer);
      return NextResponse.json(newBuyer, { status: 201 });
    }

    await execute(
      `INSERT INTO buyers (
        id, name, phone, budgetBYN, budgetUSD, preferences, registeredBy,
        assignedAgentId, assignedAgentName, status, dateAdded, prefType,
        prefRooms, prefDistrict, prefFloor, floorPreference, prefCondition,
        renovation, minArea, maxArea, searchCriteria, autoMatchingEnabled,
        notifyChannel, tags, isPublicApproved, isPublishedOnSite, crmOnly
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newBuyer.id,
        newBuyer.name,
        newBuyer.phone,
        newBuyer.budgetBYN,
        newBuyer.budgetUSD ?? null,
        newBuyer.preferences,
        newBuyer.registeredBy,
        newBuyer.assignedAgentId ?? null,
        newBuyer.assignedAgentName ?? null,
        newBuyer.status,
        newBuyer.dateAdded,
        newBuyer.prefType ?? null,
        newBuyer.prefRooms ?? null,
        newBuyer.prefDistrict ?? null,
        newBuyer.prefFloor ?? null,
        newBuyer.floorPreference ?? null,
        newBuyer.prefCondition ?? null,
        newBuyer.renovation ?? null,
        newBuyer.minArea ?? null,
        newBuyer.maxArea ?? null,
        newBuyer.searchCriteria ? JSON.stringify(newBuyer.searchCriteria) : null,
        newBuyer.autoMatchingEnabled ? 1 : 0,
        newBuyer.notifyChannel ?? null,
        newBuyer.tags ? JSON.stringify(newBuyer.tags) : null,
        newBuyer.isPublicApproved ? 1 : 0,
        newBuyer.isPublishedOnSite ? 1 : 0,
        newBuyer.crmOnly ? 1 : 0,
      ]
    );

    const created = await queryOne('SELECT * FROM buyers WHERE id = ? LIMIT 1', [id]);
    return NextResponse.json(created || newBuyer, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/buyers]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}