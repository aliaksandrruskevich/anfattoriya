import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPropertyBySlug, getAllPropertySlugs } from '@/lib/data-service';
import ObjectPageClient from './ObjectPageClient';

// Обновлять карточку объекта раз в час
export const revalidate = 3600;

// Разрешить рендер новых slug'ов без ребилда
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const slugs = await getAllPropertySlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (e) {
    console.error('[generateStaticParams] Error:', e);
    return [];
  }
}

/**
 * Формирует читаемый заголовок объекта по типу.
 *
 * Примеры:
 * - 3-к квартира, ул. Ванеева 2, Минск — 315 000 BYN
 * - Дом, Цна, Логойский район — 805 600 BYN
 * - Помещение, ул. Бабушкина 66, Минск — 340 000 BYN
 * - Офис, ул. Фабрициуса 8Б, Минск — 180 000 BYN
 * - Склад, ул. Гидростроителей 1А, Вилейка — 6 BYN/м²
 * - Участок, Сосновое, Минский район — 250 000 BYN
 */
function buildPropertyTitle(property: any): string {
  const type = property.type as 'apartment' | 'commercial' | 'house' | 'plot';
  const objectType = (property.objectType || '').toLowerCase();

  // ---- Тип объекта (первое слово) ----
  let typeWord = 'Объект';
  if (type === 'apartment') {
    typeWord = property.rooms ? `${property.rooms}-к квартира` : 'Квартира';
  } else if (type === 'house') {
    if (objectType.includes('коттедж')) typeWord = 'Коттедж';
    else if (objectType.includes('дача')) typeWord = 'Дача';
    else if (objectType.includes('таунхаус')) typeWord = 'Таунхаус';
    else typeWord = 'Дом';
  } else if (type === 'plot') {
    typeWord = 'Участок';
  } else if (type === 'commercial') {
    // Уточняем по objectType
    if (objectType.includes('офис')) typeWord = 'Офис';
    else if (objectType.includes('склад')) typeWord = 'Склад';
    else if (objectType.includes('магазин')) typeWord = 'Магазин';
    else if (objectType.includes('кафе')) typeWord = 'Кафе';
    else if (objectType.includes('ресторан')) typeWord = 'Ресторан';
    else if (objectType.includes('бар')) typeWord = 'Бар';
    else if (objectType.includes('производство')) typeWord = 'Производство';
    else if (objectType.includes('сто')) typeWord = 'СТО';
    else if (objectType.includes('здание')) typeWord = 'Здание';
    else if (objectType.includes('помещение') || objectType.includes('торговое')) typeWord = 'Помещение';
    else if (objectType.includes('бизнес')) typeWord = 'Готовый бизнес';
    else if (objectType.includes('машиноместо')) typeWord = 'Машиноместо';
    else if (objectType.includes('сфера услуг')) typeWord = 'Помещение';
    else typeWord = 'Помещение';
  }

  // ---- Адрес (улица + дом, если есть) ----
  const addressParts: string[] = [];
  if (property.street) {
    addressParts.push(`ул. ${property.street.replace(/\s*ул\.?\s*$/i, '')}`);
  }
  if (property.houseNumber) {
    addressParts.push(property.houseNumber);
  }
  const streetPart = addressParts.length > 0 ? `, ${addressParts.join(' ')}` : '';

  // ---- Населённый пункт (город/деревня) ----
  let cityPart = '';
  if (property.city) {
    const townType = (property.townType || '').toLowerCase();
    const prefix = townType === 'д' ? 'д. ' : townType === 'аг' ? 'аг. ' : townType === 'г' ? '' : '';
    cityPart = `, ${prefix}${property.city}`;
  }

  // ---- Район области ----
  let districtPart = '';
  const sd = property.stateDistrict || '';
  const isMinsk = property.city && property.city.toLowerCase() === 'минск';
  if (sd && !isMinsk) {
    // Приводим к форме "Логойский район" или "Минский район"
    const normalized = sd.endsWith('район') || sd.endsWith('область') ? sd : `${sd} район`;
    districtPart = `, ${normalized}`;
  } else if (!sd && property.district && !isMinsk) {
    districtPart = `, ${property.district}`;
  }

  // ---- Цена ----
  let pricePart = '';
  const isRental = property.isRental || /аренд/i.test(property.terms || '');
  const isPerM2 = property.priceIsPerM2 || (isRental && property.priceBYN && property.area && property.priceBYN / property.area < 1000);
  if (isPerM2 && property.priceBYN) {
    // Аренда за м²
    const perM2 = Math.round(property.priceBYN / (property.area || 1));
    pricePart = ` — ${perM2.toLocaleString('ru-RU')} BYN/м²`;
  } else if (property.priceBYN) {
    pricePart = ` — ${property.priceBYN.toLocaleString('ru-RU')} BYN`;
  } else if (property.priceUSD) {
    pricePart = ` — ${property.priceUSD.toLocaleString('ru-RU')} USD`;
  }

  // ---- Сборка ----
  const title = `${typeWord}${streetPart}${cityPart}${districtPart}${pricePart}`
    .replace(/\s+/g, ' ')
    .replace(/,\s*,/g, ',')
    .trim();

  // Для аренды добавляем префикс
  if (isRental && !title.toLowerCase().startsWith('аренда')) {
    return `Аренда: ${title}`;
  }
  return title;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug || '').replace(/[»«"']/g, '').trim();

  try {
    const property = await getPropertyBySlug(slug);

    if (!property) {
      return {
        title: 'Объект не найден',
        description: 'Возможно, объект был снят с продажи.',
      };
    }

    // ---- TITLE ----
    const title = buildPropertyTitle(property);

    // ---- DESCRIPTION ----
    const cleanTitle = (property.title || '').replace(/\s+/g, ' ').trim();

    const roomsText = property.rooms ? ` ${property.rooms}-комнатная` : '';
    const areaText = property.area ? ` ${property.area} м².` : '';
    const floorText =
      property.floor && property.totalFloors
        ? ` ${property.floor}/${property.totalFloors} этаж.`
        : '';
    const metroText = property.metro ? ` Рядом метро ${property.metro}.` : '';
    const metroTimeText = property.metroTime ? ` (${property.metroTime})` : '';
    const priceDesc = property.priceBYN
      ? ` Цена ${property.priceBYN.toLocaleString('ru-RU')} BYN.`
      : property.priceUSD
        ? ` Цена ${property.priceUSD.toLocaleString('ru-RU')} USD.`
        : '';

    const shortTitle =
      cleanTitle.length > 80
        ? cleanTitle.substring(0, 77).trim() + '...'
        : cleanTitle;

    const description =
      `${shortTitle}${roomsText}${areaText}${floorText}${metroText}${metroTimeText}${priceDesc} Проверка документов, помощь с ипотекой.`
        .replace(/\s+/g, ' ')
        .trim();

    const photos =
      property.photos && property.photos.length > 0
        ? property.photos.slice(0, 3)
        : property.photo
          ? [property.photo]
          : [];

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://fattoria.by/object/${slug}`,
        siteName: 'АН Фаттория',
        locale: 'ru_RU',
        type: 'website',
        images: photos.map((url) => ({
          url,
          width: 1200,
          height: 630,
          alt: title,
        })),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: photos,
      },
      alternates: {
        canonical: `https://fattoria.by/object/${slug}`,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (e) {
    console.error('[generateMetadata] Error:', e);
    return {
      title: 'Объект недвижимости',
    };
  }
}

export default async function ObjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug || '').replace(/[»«"']/g, '').trim();

  try {
    const property = await getPropertyBySlug(slug);
    if (!property) {
      notFound();
    }
  } catch (e) {
    console.error('[ObjectPage] Error:', e);
    notFound();
  }

  return <ObjectPageClient slug={slug} />;
}