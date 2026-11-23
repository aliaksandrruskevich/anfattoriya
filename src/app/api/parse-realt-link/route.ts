import { NextRequest, NextResponse } from 'next/server';
import { requireCrmSession } from '@/lib/auth';
import { validateExternalUrl } from '@/lib/sanitize';
import { extractKufarAdId } from '@/lib/kufarUtils';
import type { Property } from '@/types';

const ALLOWED_DOMAINS = ['realt.by', 'kufar.by', 're.kufar.by'];

function decodeMeta(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMetaTag(html: string, nameOrProp: string): string {
  const rx1 = new RegExp(
    `<meta[^>]+(?:property|name)=["']${nameOrProp}["'][^>]+content=["']([^"']+)["']`,
    'i'
  );
  const rx2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${nameOrProp}["']`,
    'i'
  );
  const match = html.match(rx1) || html.match(rx2);
  return match?.[1] ? decodeMeta(match[1]) : '';
}

export async function POST(request: NextRequest) {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json();
    const rawUrl = String(body?.url || '').trim();
    if (!rawUrl) {
      return NextResponse.json({ success: false, error: 'Укажите ссылку на объявление' }, { status: 400 });
    }

    let safeUrl: URL;
    try {
      safeUrl = validateExternalUrl(rawUrl, ALLOWED_DOMAINS);
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err?.message || 'Недопустимая ссылка' },
        { status: 400 }
      );
    }

    let html = '';
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10_000);
      const res = await fetch(safeUrl.toString(), {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'ru-RU,ru;q=0.9',
        },
        redirect: 'manual',
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        html = await res.text();
      }
    } catch {
      // Proceed gracefully with URL metadata fallback if remote host blocks automated fetch
    }

    const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '';
    const ogTitle = extractMetaTag(html, 'og:title') || decodeMeta(titleTag);
    const ogDesc = extractMetaTag(html, 'og:description') || extractMetaTag(html, 'description');
    const ogImage = extractMetaTag(html, 'og:image');

    const combined = `${ogTitle} ${ogDesc}`;
    const usdMatch = combined.match(/([\d\s]{3,12})\s*(?:\$|USD)/i);
    const bynMatch = combined.match(/([\d\s]{4,14})\s*(?:р\.|руб|BYN)/i);
    const areaMatch = combined.match(/(\d+(?:[.,]\d+)?)\s*(?:м²|м2|кв\.?\s*м)/i);
    const roomsMatch = combined.match(/(\d+)\s*-?\s*(?:комн|к\.|комнатная)/i);
    const floorMatch = combined.match(/(\d+)\s*\/\s*(\d+)\s*(?:эт|этаж)/i);

    const priceUSD = usdMatch ? parseInt(usdMatch[1].replace(/\s+/g, ''), 10) || 0 : 0;
    const priceBYN = bynMatch
      ? parseInt(bynMatch[1].replace(/\s+/g, ''), 10) || 0
      : Math.round(priceUSD * 3.22);

    const area = areaMatch ? parseFloat(areaMatch[1].replace(',', '.')) || 0 : 0;
    const rooms = roomsMatch ? parseInt(roomsMatch[1], 10) || undefined : undefined;
    const floor = floorMatch ? parseInt(floorMatch[1], 10) || undefined : undefined;
    const totalFloors = floorMatch ? parseInt(floorMatch[2], 10) || undefined : undefined;

    const lower = combined.toLowerCase();
    let type: Property['type'] = 'apartment';
    if (/дом|коттедж|дача/.test(lower)) type = 'house';
    else if (/участок|соток/.test(lower)) type = 'plot';
    else if (/офис|помещен|склад|коммерц|магазин/.test(lower)) type = 'commercial';

    const adId = extractKufarAdId(safeUrl.toString()) || safeUrl.pathname.split('/').filter(Boolean).pop();

    const safeImage =
      ogImage && /^https?:\/\//i.test(ogImage)
        ? ogImage
        : type === 'house'
        ? '/photo/properties/dom-cna.webp'
        : type === 'commercial'
        ? '/photo/properties/ofis-minsk-fabritsiusa-8.webp'
        : type === 'plot'
        ? '/photo/properties/uchastok-zhdanovichi-institutskaya.webp'
        : '/photo/properties/kvartira-minsk-pritytskogo-29.webp';

    const title =
      ogTitle ||
      `${rooms ? `${rooms}-к ` : ''}${
        type === 'house' ? 'дом' : type === 'commercial' ? 'помещение' : type === 'plot' ? 'участок' : 'квартира'
      }${adId ? ` (#${adId})` : ''}`;

    const property: Property = {
      id: `imp-${Date.now()}`,
      externalId: adId || undefined,
      title,
      type,
      address: 'г. Минск (уточняется по объявлению)',
      priceUSD,
      priceBYN,
      rooms,
      area,
      floor,
      totalFloors,
      photo: safeImage,
      photos: [safeImage],
      features: [
        rooms ? `${rooms}-комн.` : '',
        area ? `${area} м²` : '',
        `Источник: ${safeUrl.hostname}`,
      ].filter(Boolean),
      description: ogDesc || `Импортировано по ссылке: ${safeUrl.toString()}`,
      sourceUrl: safeUrl.toString(),
      sourceType: safeUrl.hostname.includes('kufar') ? 'kufar' : 'realt',
      status: 'draft',
      isPublished: false,
      isClosedBase: true,
    } as Property;

    return NextResponse.json({ success: true, property });
  } catch (error: any) {
    console.error('[POST /api/parse-realt-link]', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Ошибка парсинга ссылки' },
      { status: 500 }
    );
  }
}
