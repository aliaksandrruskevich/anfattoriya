import { NextRequest, NextResponse } from 'next/server';
import { requireCrmSession } from '@/lib/auth';
import { extractBelarusPhone } from '@/lib/kufarUtils';
import type { Property } from '@/types';

export async function POST(request: NextRequest) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json();
    const rawText = String(body?.text || '').trim();
    if (!rawText) {
      return NextResponse.json({ error: 'Передайте текст для распознавания' }, { status: 400 });
    }

    const lower = rawText.toLowerCase();

    // Detect property type
    let type: Property['type'] = 'apartment';
    if (/(коттедж|дом\b|дача|таунхаус)/i.test(lower)) type = 'house';
    else if (/(офис|помещен|склад|торгов|магазин|коммерц)/i.test(lower)) type = 'commercial';
    else if (/(участок|соток|земл)/i.test(lower)) type = 'plot';

    // Detect rooms
    const roomsMatch = rawText.match(/(\d+)\s*[- ]?(?:комн|к\.|комнатная)/i);
    const rooms = roomsMatch ? parseInt(roomsMatch[1], 10) : undefined;

    // Detect price USD / BYN
    let priceUSD = 0;
    let priceBYN = 0;
    const usdMatch = rawText.match(/([\d\s.,]{3,14})\s*(?:\$|usd|долл)/i);
    const bynMatch = rawText.match(/([\d\s.,]{4,14})\s*(?:byn|р\.|руб)/i);
    const plainNumMatch = rawText.match(/(?:цена|стоимость|бюджет)\s*[:\-]?\s*([\d\s]{4,12})/i);

    if (usdMatch) {
      priceUSD = parseInt(usdMatch[1].replace(/[^\d]/g, ''), 10) || 0;
    } else if (plainNumMatch) {
      const n = parseInt(plainNumMatch[1].replace(/[^\d]/g, ''), 10) || 0;
      if (n > 0 && n < 2000000) priceUSD = n;
    }
    if (bynMatch) {
      priceBYN = parseInt(bynMatch[1].replace(/[^\d]/g, ''), 10) || 0;
    }
    if (priceUSD && !priceBYN) priceBYN = Math.round(priceUSD * 3.22);
    if (priceBYN && !priceUSD) priceUSD = Math.round(priceBYN / 3.22);

    // Area & floors
    const areaMatch = rawText.match(/(\d+(?:[.,]\d+)?)\s*(?:м2|м²|кв\.?\s*м)/i);
    const area = areaMatch ? parseFloat(areaMatch[1].replace(',', '.')) || 0 : 0;

    const floorMatch = rawText.match(/(\d+)\s*\/\s*(\d+)\s*(?:эт|этаж)?/i);
    const floor = floorMatch ? parseInt(floorMatch[1], 10) : undefined;
    const totalFloors = floorMatch ? parseInt(floorMatch[2], 10) : undefined;

    // Address extraction
    const addressMatch = rawText.match(
      /(?:ул\.?|улица|пр\.?|проспект|пер\.?|переулок|г\.|аг\.|д\.)\s*[А-ЯЁа-яёA-Za-z0-9\s.,-]{3,50}/i
    );
    const address = addressMatch ? addressMatch[0].trim() : 'г. Минск';

    const sellerPhone = extractBelarusPhone(rawText) || undefined;
    const urgent = /(срочно|торг|быстр|горит|сегодня)/i.test(lower);

    const typeLabel =
      type === 'house'
        ? 'Дом / Коттедж'
        : type === 'commercial'
        ? 'Коммерческое помещение'
        : type === 'plot'
        ? 'Участок'
        : rooms
        ? `${rooms}-комнатная квартира`
        : 'Квартира';

    const title = `${typeLabel}${address !== 'г. Минск' ? ` (${address})` : ''}`;

    const features: string[] = [
      rooms ? `${rooms}-комн.` : '',
      area ? `${area} м²` : '',
      floor && totalFloors ? `${floor}/${totalFloors} эт.` : '',
      urgent ? 'Срочная продажа' : '',
    ].filter(Boolean);

    const photo =
      type === 'house'
        ? '/photo/properties/dom-cna.webp'
        : type === 'commercial'
        ? '/photo/properties/ofis-minsk-fabritsiusa-8.webp'
        : type === 'plot'
        ? '/photo/properties/uchastok-zhdanovichi-institutskaya.webp'
        : '/photo/properties/kvartira-minsk-pritytskogo-29.webp';

    return NextResponse.json({
      id: `prop-ai-${Date.now()}`,
      title,
      type,
      address,
      priceUSD,
      priceBYN,
      rooms,
      area,
      floor,
      totalFloors,
      features,
      sellerPhone,
      priority: urgent ? 'urgent' : 'regular',
      photo,
      photos: [photo],
      description: rawText,
      status: 'active',
      isPublished: false,
      isClosedBase: true,
      crmOnly: true,
    });
  } catch (error: any) {
    console.error('[POST /api/recognize-property]', error);
    return NextResponse.json({ error: error?.message || 'Ошибка распознавания' }, { status: 500 });
  }
}
