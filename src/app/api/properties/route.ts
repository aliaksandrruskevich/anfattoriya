import { NextResponse, NextRequest } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { getProperties } from '@/lib/repository';

// GET /api/properties?type=apartment&status=active&agentId=...&limit=50
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const agentId = searchParams.get('agentId') || undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const properties = await getProperties({ type, status, agentId, limit });
    return NextResponse.json(properties);
  } catch (error: any) {
    console.error('[GET /api/properties]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/properties — создать объект вручную (через CRM)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.type) {
      return NextResponse.json({ error: 'Поля title и type обязательны' }, { status: 400 });
    }

    const id = body.id || `prop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await execute(
      `INSERT INTO properties (
        id, externalId, title, type, address, priceBYN, priceUSD, rooms, area,
        floor, totalFloors, photo, image, features, agentName, agentPhone, agentPhoto,
        assignedAgentId, assignedAgentName, sellerPhone, priority, location, yearBuilt,
        description, status, isPublished, internalOnly, crmOnly, contractStatus,
        contractNumber, contractDate, sourceUrl, isClosedBase, sourceType, source,
        inventoryNo, lat, lng, photos, images, district, metro, city, street,
        houseNumber, slug, priceHistory
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )`,
      [
        id,
        body.externalId ?? null,
        body.title,
        body.type,
        body.address || '',
        body.priceBYN ?? 0,
        body.priceUSD ?? 0,
        body.rooms ?? null,
        body.area ?? 0,
        body.floor ?? null,
        body.totalFloors ?? null,
        body.photo || '',
        body.image ?? null,
        JSON.stringify(body.features ?? []),
        body.agentName ?? null,
        body.agentPhone ?? null,
        body.agentPhoto ?? null,
        body.assignedAgentId ?? null,
        body.assignedAgentName ?? null,
        body.sellerPhone ?? null,
        body.priority ?? null,
        body.location ?? null,
        body.yearBuilt ?? null,
        body.description ?? null,
        body.status ?? 'active',
        body.isPublished ? 1 : 0,
        body.internalOnly ? 1 : 0,
        body.crmOnly ? 1 : 0,
        body.contractStatus ?? null,
        body.contractNumber ?? null,
        body.contractDate ?? null,
        body.sourceUrl ?? null,
        body.isClosedBase ? 1 : 0,
        body.sourceType ?? 'manual',
        body.source ?? 'crm',
        body.inventoryNo ?? null,
        body.lat ?? null,
        body.lng ?? null,
        JSON.stringify(body.photos ?? []),
        JSON.stringify(body.images ?? []),
        body.district ?? null,
        body.metro ?? null,
        body.city ?? null,
        body.street ?? null,
        body.houseNumber ?? null,
        body.slug ?? null,
        body.priceHistory ? JSON.stringify(body.priceHistory) : null,
      ]
    );

    const created = await queryOne('SELECT * FROM properties WHERE id = ? LIMIT 1', [id]);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/properties]', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Объект с таким slug или externalId уже существует' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}