import { NextResponse } from 'next/server';
import { getAgents } from '@/lib/repository';
import { sanitizeAgentForPublic } from '@/lib/sanitize';

export async function GET() {
  try {
    const agents = await getAgents();
    return NextResponse.json(agents.map(sanitizeAgentForPublic));
  } catch (error: any) {
    console.error('[GET /api/realt/agents]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}