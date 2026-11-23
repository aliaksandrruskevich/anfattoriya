import { NextResponse } from 'next/server';
import { requireCrmSession } from '@/lib/auth';
import { getKufarConfigStatus } from '@/lib/kufarAuthConfig';

// GET /api/chats/status — безопасный статус подключения Kufar из .env (только для сотрудников CRM)
export async function GET() {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  return NextResponse.json(getKufarConfigStatus());
}
