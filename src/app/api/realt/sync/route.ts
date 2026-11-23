import { NextResponse } from 'next/server';
import { syncRealtToDb } from '@/lib/data-service';
import { requireAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// POST /api/realt/sync — запустить синк вручную (только админ)
export async function POST() {
  const auth = await requireAdminSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const result = await syncRealtToDb();
    revalidatePath('/api/realt/properties');
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[POST /api/realt/sync]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const auth = await requireAdminSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const result = await syncRealtToDb();
    revalidatePath('/api/realt/properties');
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[GET /api/realt/sync]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}