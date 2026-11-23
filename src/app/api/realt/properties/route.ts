import { NextResponse } from 'next/server';
import { getProperties } from '@/lib/repository';
import { isPublicProperty, sanitizePropertyForPublic } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const properties = await getProperties({ status: 'active' });
    const safeProperties = properties
      .filter(isPublicProperty)
      .map(sanitizePropertyForPublic);
    return NextResponse.json(safeProperties);
  } catch (error: any) {
    console.error('[GET /api/realt/properties]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}