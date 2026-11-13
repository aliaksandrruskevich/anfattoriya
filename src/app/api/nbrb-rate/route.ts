import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
  try {
    const res = await fetch('https://api.nbrb.by/exrates/rates/USD?parammode=2', {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'NBRB request failed' }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json({
      rate: data.Cur_OfficialRate,
      scale: data.Cur_Scale,
      date: data.Date,
    });
  } catch (e) {
    console.error('[nbrb-rate]', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
