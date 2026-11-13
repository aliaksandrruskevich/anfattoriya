import { NextResponse, NextRequest } from 'next/server';
import { execute, queryOne } from '@/lib/db';

// GET /api/sellers/[id] — один продавец
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const seller = await queryOne('SELECT * FROM cold_sellers WHERE id = ? LIMIT 1', [id]);
    if (!seller) {
      return NextResponse.json({ error: 'Продавец не найден' }, { status: 404 });
    }
    return NextResponse.json(seller);
  } catch (error: any) {
    console.error('[GET /api/sellers/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/sellers/[id] — обновить продавца
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
      'name', 'phone', 'address', 'propertyType', 'askingPriceBYN', 'askingPriceUSD',
      'status', 'kanbanStage', 'assignedAgentName', 'assignedAgentId',
      'callOperatorName', 'notes', 'nextContactDate', 'nextContactTime',
      'contractNumber', 'contractDate', 'rooms', 'area', 'floor', 'totalFloors',
      'publishedPropertyId',
    ];
    const jsonFields = ['commentsHistory', 'attachments', 'tags'];

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

    if (fields.length === 0) {
      return NextResponse.json({ error: 'Нет полей для обновления' }, { status: 400 });
    }

    values.push(id);
    const result = await execute(
      `UPDATE cold_sellers SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Продавец не найден' }, { status: 404 });
    }

    const updated = await queryOne('SELECT * FROM cold_sellers WHERE id = ? LIMIT 1', [id]);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[PUT /api/sellers/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/sellers/[id] — удалить продавца
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await execute('DELETE FROM cold_sellers WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Продавец не найден' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[DELETE /api/sellers/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}