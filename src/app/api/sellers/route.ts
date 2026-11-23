import { NextResponse, NextRequest } from 'next/server';
import { execute, isDbMockMode, queryOne } from '@/lib/db';
import { getSellers } from '@/lib/repository';
import { isAdminRole, isCallCenterRole, requireCrmSession } from '@/lib/auth';
import { getMockStore } from '@/lib/mockStore';
import type { ColdSeller } from '@/types';

export async function GET(request: NextRequest) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage') || undefined;
    const requestedAgentId = searchParams.get('agentId') || undefined;

    const isPrivileged = isAdminRole(auth.agent) || isCallCenterRole(auth.agent);
    let sellers = await getSellers({
      stage,
      agentId: isPrivileged ? requestedAgentId : auth.agent.id,
    });

    if (!isPrivileged) {
      sellers = sellers.filter((s) => s.assignedAgentId === auth.agent.id);
    }

    return NextResponse.json(sellers);
  } catch (error: any) {
    console.error('[GET /api/sellers]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json();

    if (!body.name || !body.phone) {
      return NextResponse.json({ error: 'Поля name и phone обязательны' }, { status: 400 });
    }

    const isPrivileged = isAdminRole(auth.agent) || isCallCenterRole(auth.agent);
    const id = body.id || `seller-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const assignedAgentId = isPrivileged
      ? body.assignedAgentId ?? undefined
      : auth.agent.id;
    const assignedAgentName = isPrivileged
      ? body.assignedAgentName ?? undefined
      : auth.agent.name;

    const newSeller: ColdSeller = {
      id,
      name: String(body.name),
      phone: String(body.phone),
      address: body.address || '',
      propertyType: body.propertyType || 'apartment',
      askingPriceBYN: Number(body.askingPriceBYN ?? 0),
      askingPriceUSD: body.askingPriceUSD != null ? Number(body.askingPriceUSD) : undefined,
      status: body.status || 'cold_call',
      kanbanStage: body.kanbanStage ?? 'primary_contact',
      assignedAgentName,
      assignedAgentId,
      callOperatorName: body.callOperatorName ?? (isCallCenterRole(auth.agent) ? auth.agent.name : undefined),
      notes: body.notes || '',
      dateAdded: body.dateAdded || new Date().toLocaleDateString('ru-RU'),
      nextContactDate: body.nextContactDate ?? undefined,
      nextContactTime: body.nextContactTime ?? undefined,
      commentsHistory: Array.isArray(body.commentsHistory) ? body.commentsHistory : undefined,
      attachments: Array.isArray(body.attachments) ? body.attachments : undefined,
      tags: Array.isArray(body.tags) ? body.tags : undefined,
      contractNumber: body.contractNumber ?? undefined,
      contractDate: body.contractDate ?? undefined,
      rooms: body.rooms ?? undefined,
      area: body.area ?? undefined,
      floor: body.floor ?? undefined,
      totalFloors: body.totalFloors ?? undefined,
      publishedPropertyId: body.publishedPropertyId ?? undefined,
    };

    if (isDbMockMode()) {
      getMockStore().sellers.unshift(newSeller);
      return NextResponse.json(newSeller, { status: 201 });
    }

    await execute(
      `INSERT INTO cold_sellers (
        id, name, phone, address, propertyType, askingPriceBYN, askingPriceUSD,
        status, kanbanStage, assignedAgentName, assignedAgentId, callOperatorName,
        notes, dateAdded, nextContactDate, nextContactTime, commentsHistory,
        attachments, tags, contractNumber, contractDate, rooms, area, floor,
        totalFloors, publishedPropertyId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newSeller.id,
        newSeller.name,
        newSeller.phone,
        newSeller.address,
        newSeller.propertyType,
        newSeller.askingPriceBYN,
        newSeller.askingPriceUSD ?? null,
        newSeller.status,
        newSeller.kanbanStage ?? 'primary_contact',
        newSeller.assignedAgentName ?? null,
        newSeller.assignedAgentId ?? null,
        newSeller.callOperatorName ?? null,
        newSeller.notes,
        newSeller.dateAdded,
        newSeller.nextContactDate ?? null,
        newSeller.nextContactTime ?? null,
        newSeller.commentsHistory ? JSON.stringify(newSeller.commentsHistory) : null,
        newSeller.attachments ? JSON.stringify(newSeller.attachments) : null,
        newSeller.tags ? JSON.stringify(newSeller.tags) : null,
        newSeller.contractNumber ?? null,
        newSeller.contractDate ?? null,
        newSeller.rooms ?? null,
        newSeller.area ?? null,
        newSeller.floor ?? null,
        newSeller.totalFloors ?? null,
        newSeller.publishedPropertyId ?? null,
      ]
    );

    const created = await queryOne('SELECT * FROM cold_sellers WHERE id = ? LIMIT 1', [id]);
    return NextResponse.json(created || newSeller, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/sellers]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}