import { NextResponse } from 'next/server';
import { getProperties } from '@/lib/repository';

// Кэш на 1 час: Next.js будет отдавать закэшированный ответ
export const revalidate = 3600;
export const dynamic = 'force-static';

export async function GET() {
  try {
    const properties = await getProperties({ status: 'active' });
    return NextResponse.json(properties);
  } catch (error: any) {
    console.error('[GET /api/realt/properties]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}