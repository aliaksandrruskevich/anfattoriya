import { NextResponse, NextRequest } from 'next/server';
import { execute, isDbMockMode, queryOne } from '@/lib/db';
import { getProperties } from '@/lib/repository';
import { getSessionAgent, requireCrmSession } from '@/lib/auth';
import { getMockStore } from '@/lib/mockStore';
import { isPublicProperty, sanitizePropertyForPublic } from '@/lib/sanitize';

// GET /api/properties?type=apartment&status=active&agentId=...&limit=50
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const agentId = searchParams.get('agentId') || undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const session = await getSessionAgent();
    const properties = await getProperties({
      type,
      status: session ? status : 'active',
      agentId,
      limit: session ? limit : undefined,
    });

    if (session) {
      return NextResponse.json(properties);
    }

    const publicProps = properties
      .filter(isPublicProperty)
      .slice(0, limit || properties.length)
      .map(sanitizePropertyForPublic);
    return NextResponse.json(publicProps);
  } catch (error: any) {
    console.error('[GET /api/properties]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/properties — создать объект (только авторизованный сотрудник CRM)
export async function POST(request: NextRequest) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json();

    if (!body.title || !body.type) {
      return NextResponse.json({ error: 'Поля title и type обязательны' }, { status: 400 });
    }

    const id = body.id || `prop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (isDbMockMode()) {
      const store = getMockStore();
      const created = {
        ...body,
        id,
        title: String(body.title),
        type: body.type,
        address: body.address || '',
        priceBYN: Number(body.priceBYN ?? 0),
        priceUSD: Number(body.priceUSD ?? 0),
        area: Number(body.area ?? 0),
        photo: body.photo || '/photo/properties/kvartira-minsk-pritytskogo-29.webp',
        features: Array.isArray(body.features) ? body.features : [],
        status: body.status ?? 'active',
        isPublished: Boolean(body.isPublished),
        internalOnly: Boolean(body.internalOnly),
        crmOnly: Boolean(body.crmOnly),
        isClosedBase: Boolean(body.isClosedBase),
        assignedAgentId: body.assignedAgentId ?? auth.agent.id,
        assignedAgentName: body.assignedAgentName ?? auth.agent.name,
        sourceType: body.sourceType ?? 'manual',
        source: body.source ?? 'crm',
      };
      store.properties.unshift(created);
      return NextResponse.json(created, { status: 201 });
    }

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
        body.assignedAgentId ?? auth.agent.id,
        body.assignedAgentName ?? auth.agent.name,
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