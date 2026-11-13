// scripts/migrate-slugs.cjs
// Миграция slug'ов для всех объектов.
// Формат: <baseType>-<town>-<street>-<house>[-<deal>][-<area>]
//
// Запуск:
//   node scripts/migrate-slugs.cjs           -- dry-run
//   node scripts/migrate-slugs.cjs --apply   -- применить

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

const APPLY = process.argv.includes('--apply');

// ============ ТРАНСЛИТ ============

const RUS_TO_LAT = {
  'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh',
  'з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o',
  'п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts',
  'ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'
};

function translit(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .trim()
    .split('')
    .map((ch) => RUS_TO_LAT[ch] !== undefined ? RUS_TO_LAT[ch] : ch)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function cleanTown(t) {
  if (!t) return '';
  const clean = String(t)
    .trim()
    .replace(/^(г\.?п?|д\.?|пос\.?|п\.?|аг\.?|деревня|город|поселок|агрогородок|с\/т|ст\.?)\s+/i, '')
    .replace(/\s+(город|деревня|поселок|район|р-н)$/i, '')
    .trim();
  if (clean.toLowerCase() === 'цна' || clean.toLowerCase() === 'цне') return 'cna';
  return translit(clean);
}

function cleanStreet(s) {
  if (!s) return '';
  const clean = String(s)
    .trim()
    .replace(/^(ул\.?|улица|просп\.?|проспект|пр-?т\.?|пер\.?|переулок|тракт|бульвар|б-р|наб\.?|набережная|проезд|шоссе)\s+/i, '')
    .replace(/\s+(ул\.?|улица|просп\.?|проспект|пр-?т\.?|пер\.?|переулок|тракт|бульвар|б-р|наб\.?|набережная|проезд|шоссе)$/i, '')
    .trim();
  return translit(clean);
}

function getBaseType(type, objectType, rooms) {
  const ot = (objectType || '').toLowerCase();
  if (type === 'apartment' || ot.includes('квартир')) {
    return rooms && rooms > 0 ? 'kvartira-' + rooms + 'k' : 'kvartira';
  }
  if (type === 'house') {
    if (ot.includes('коттедж')) return 'kottedzh';
    if (ot.includes('дача')) return 'dacha';
    if (ot.includes('таунхаус')) return 'taunhaus';
    return 'dom';
  }
  if (type === 'plot') return 'uchastok';
  if (ot.includes('склад')) return 'sklad';
  if (ot.includes('офис')) return 'ofis';
  if (ot.includes('магазин')) return 'magazin';
  if (ot.includes('кафе')) return 'kafe';
  if (ot.includes('ресторан')) return 'restoran';
  if (ot.includes('бар')) return 'bar';
  if (ot.includes('производство')) return 'proizvodstvo';
  if (ot.includes('сто')) return 'sto';
  if (ot.includes('здание')) return 'zdanie';
  if (ot.includes('бизнес')) return 'biznes';
  if (ot.includes('машиноместо')) return 'mashinomesto';
  if (ot.includes('торговое')) return 'torgovoe';
  if (ot.includes('сфера услуг')) return 'uslugi';
  return 'pomeschenie';
}

function getDealSuffix(terms) {
  const t = (terms || '').toLowerCase();
  if (t.includes('аренд')) return 'arenda';
  return 'prodazha';
}

function buildSlug(obj) {
  const parts = [];
  parts.push(getBaseType(obj.type, obj.objectType, obj.rooms));
  const town = cleanTown(obj.city);
  if (town) parts.push(town);
  const street = cleanStreet(obj.street);
  if (street) parts.push(street);
  if (obj.houseNumber) parts.push(translit(String(obj.houseNumber).replace(/\s+/g, '-')));
  if (obj.type === 'commercial') parts.push(getDealSuffix(obj.terms));
  return parts.filter(Boolean).join('-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  console.log('Режим: ' + (APPLY ? 'APPLY (изменения применяются)' : 'DRY-RUN (только показать)'));

  const [rows] = await conn.query(
    "SELECT id, slug, type, objectType, terms, rooms, area, city, street, houseNumber FROM properties ORDER BY id"
  );

  console.log('Всего объектов: ' + rows.length);
  console.log('');

  const mapped = rows.map((r) => {
    const baseSlug = buildSlug(r);
    return { ...r, baseSlug, finalSlug: null };
  });

  const slugCount = new Map();
  for (const m of mapped) {
    slugCount.set(m.baseSlug, (slugCount.get(m.baseSlug) || 0) + 1);
  }

  const finalCount = new Map();
  for (const m of mapped) {
    let slug = m.baseSlug;
    if (slugCount.get(slug) > 1) {
      const areaSuffix = m.area ? String(Math.round(Number(m.area))) : 'x';
      slug = slug + '-' + areaSuffix;
    }
    let counter = 1;
    let attempt = slug;
    while (finalCount.has(attempt)) {
      counter++;
      attempt = slug + '-' + counter;
    }
    finalCount.set(attempt, true);
    m.finalSlug = attempt;
  }

  const changed = mapped.filter((m) => m.slug !== m.finalSlug);
  const unchanged = mapped.filter((m) => m.slug === m.finalSlug);

  console.log('Статистика:');
  console.log('  Не меняется: ' + unchanged.length);
  console.log('  Меняется:    ' + changed.length);
  console.log('');

  console.log('ТОП-30 изменений:');
  for (const m of changed.slice(0, 30)) {
    console.log('  ' + (m.slug || '(null)') + '  ->  ' + m.finalSlug);
  }
  if (changed.length > 30) {
    console.log('  ... и ещё ' + (changed.length - 30));
  }
  console.log('');

  const dupCheck = new Map();
  for (const m of mapped) {
    dupCheck.set(m.finalSlug, (dupCheck.get(m.finalSlug) || 0) + 1);
  }
  const dups = Array.from(dupCheck.entries()).filter(([_, n]) => n > 1);
  if (dups.length > 0) {
    console.log('ВНИМАНИЕ! Финальные slug не уникальны: ' + dups.length);
    for (const [s, n] of dups.slice(0, 10)) {
      console.log('  ' + s + ' — ' + n);
    }
  } else {
    console.log('Все финальные slug уникальны.');
  }
  console.log('');

  // Сохранение бэкапа
  fs.writeFileSync(
    'slug-migration-backup.json',
    JSON.stringify(mapped.map((m) => ({ id: m.id, oldSlug: m.slug, newSlug: m.finalSlug })), null, 2)
  );
  console.log('Бэкап сохранён: slug-migration-backup.json');

  if (!APPLY) {
    console.log('');
    console.log('DRY-RUN. Ничего не изменено.');
    console.log('Запусти с --apply, чтобы применить.');
    await conn.end();
    return;
  }

  console.log('');
  console.log('Применяю изменения...');

  let updated = 0;
  for (const m of changed) {
    await conn.query('UPDATE properties SET slug = ? WHERE id = ?', [m.finalSlug, m.id]);
    updated++;
    if (updated % 50 === 0) console.log('  обновлено: ' + updated);
  }

  await conn.end();

  console.log('');
  console.log('Готово!');
  console.log('  Обновлено: ' + updated);
  console.log('  Без изменений: ' + unchanged.length);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});