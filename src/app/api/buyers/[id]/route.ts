import { NextResponse, NextRequest } from 'next/server';
import { execute, queryOne } from '@/lib/db';

// GET /api/buyers/[id] — один покупатель
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const buyer = await queryOne('SELECT * FROM buyers WHERE id = ? LIMIT 1', [id]);
    if (!buyer) {
      return NextResponse.json({ error: 'Покупатель не найден' }, { status: 404 });
    }
    return NextResponse.json(buyer);
  } catch (error: any) {
    console.error('[GET /api/buyers/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/buyers/[id] — обновить покупателя
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const fields: string[] = [];
    const values: any[] = [];

    const allowed = [
      'name', 'phone', 'budgetBYN', 'budgetUSD', 'preferences', 'registeredBy',
      'assignedAgentId', 'assignedAgentName', 'status', 'dateAdded', 'prefType',
      'prefRooms', 'prefDistrict', 'prefFloor', 'floorPreference', 'prefCondition',
      'renovation', 'minArea', 'maxArea', 'notifyChannel',
    ];
    const jsonFields = ['searchCriteria', 'tags'];
    const boolFields = ['autoMatchingEnabled', 'isPublicApproved', 'isPublishedOnSite', 'crmOnly'];

    for (const key of allowed) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(body[key]);
      }
    }
    for (const key of jsonFields) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(JSON.stringify(body[key]));
      }
    }
    for (const key of boolFields) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(body[key] ? 1 : 0);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'Нет полей для обновления' }, { status: 400 });
    }

    values.push(id);
    const result = await execute(`UPDATE buyers SET ${fields.join(', ')} WHERE id = ?`, values);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Покупатель не найден' }, { status: 404 });
    }

    const updated = await queryOne('SELECT * FROM buyers WHERE id = ? LIMIT 1', [id]);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[PUT /api/buyers/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/buyers/[id] — удалить покупателя
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await execute('DELETE FROM buyers WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Покупатель не найден' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[DELETE /api/buyers/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}