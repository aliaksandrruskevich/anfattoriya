import { NextResponse } from 'next/server';
import { getSessionAgent } from '@/lib/auth';

export async function GET() {
  const agent = await getSessionAgent();
  if (!agent) {
    return NextResponse.json({ authenticated: false, agent: null }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, agent });
}
