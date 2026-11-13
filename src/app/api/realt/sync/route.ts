import { NextResponse } from 'next/server';
import { syncRealtToDb } from '@/lib/data-service';
import { revalidatePath } from 'next/cache';

// POST /api/realt/sync — запустить синк вручную
export async function POST() {
  try {
    const result = await syncRealtToDb();
    revalidatePath('/api/realt/properties');
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[POST /api/realt/sync]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/realt/sync — для проверки в браузере (не для прода)
export async function GET() {
  try {
    const result = await syncRealtToDb();
    revalidatePath('/api/realt/properties');
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[GET /api/realt/sync]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}