import { NextResponse, NextRequest } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { getSellers } from '@/lib/repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage') || undefined;
    const agentId = searchParams.get('agentId') || undefined;

    const sellers = await getSellers({ stage, agentId });
    return NextResponse.json(sellers);
  } catch (error: any) {
    console.error('[GET /api/sellers]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.phone) {
      return NextResponse.json({ error: 'Поля name и phone обязательны' }, { status: 400 });
    }

    const id = body.id || `seller-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await execute(
      `INSERT INTO cold_sellers (
        id, name, phone, address, propertyType, askingPriceBYN, askingPriceUSD,
        status, kanbanStage, assignedAgentName, assignedAgentId, callOperatorName,
        notes, dateAdded, nextContactDate, nextContactTime, commentsHistory,
        attachments, tags, contractNumber, contractDate, rooms, area, floor,
        totalFloors, publishedPropertyId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.name,
        body.phone,
        body.address || '',
        body.propertyType || 'apartment',
        body.askingPriceBYN ?? 0,
        body.askingPriceUSD ?? null,
        body.status || 'cold_call',
        body.kanbanStage ?? 'primary_contact',
        body.assignedAgentName ?? null,
        body.assignedAgentId ?? null,
        body.callOperatorName ?? null,
        body.notes || '',
        body.dateAdded || new Date().toLocaleDateString('ru-RU'),
        body.nextContactDate ?? null,
        body.nextContactTime ?? null,
        body.commentsHistory ? JSON.stringify(body.commentsHistory) : null,
        body.attachments ? JSON.stringify(body.attachments) : null,
        body.tags ? JSON.stringify(body.tags) : null,
        body.contractNumber ?? null,
        body.contractDate ?? null,
        body.rooms ?? null,
        body.area ?? null,
        body.floor ?? null,
        body.totalFloors ?? null,
        body.publishedPropertyId ?? null,
      ]
    );

    const created = await queryOne('SELECT * FROM cold_sellers WHERE id = ? LIMIT 1', [id]);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/sellers]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}