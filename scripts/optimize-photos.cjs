// scripts/optimize-photos.cjs
// Downloads property photos from Realt.by, compresses to WebP, saves locally.
// Updates DB with new photo paths.
// Run: node scripts/optimize-photos.cjs

require('dotenv').config();
const mysql = require('mysql2/promise');
const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'public', 'photo', 'properties');
const PUBLIC_PREFIX = '/photo/properties';
const MAX_WIDTH = 1200;
const QUALITY = 80;
const CONCURRENCY = 5;
const MAP_FILE = path.join(__dirname, '..', 'photos-map.json');

async function ensureDir() {
  await fs.mkdir(OUT_DIR, { recursive: true });
}

async function downloadBuffer(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; FattoriaBot/1.0)',
      'Referer': 'https://realt.by/',
    },
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

async function processOne(row, conn, mapping) {
  const slug = row.slug;
  const photo = row.photo;
  const fileName = slug + '.webp';
  const filePath = path.join(OUT_DIR, fileName);
  const publicPath = PUBLIC_PREFIX + '/' + fileName;

  try {
    try {
      await fs.access(filePath);
      mapping.push({ slug: slug, oldPhoto: photo, newPhoto: publicPath, status: 'skip' });
      await conn.query('UPDATE properties SET photo = ? WHERE slug = ?', [publicPath, slug]);
      return { slug: slug, status: 'skip' };
    } catch (e) {}

    const buf = await downloadBuffer(photo);
    const originalSize = buf.length;

    const webp = await sharp(buf)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();

    await fs.writeFile(filePath, webp);
    mapping.push({ slug: slug, oldPhoto: photo, newPhoto: publicPath, status: 'ok' });

    await conn.query('UPDATE properties SET photo = ? WHERE slug = ?', [publicPath, slug]);

    return { slug: slug, status: 'ok', size: webp.length, original: originalSize };
  } catch (e) {
    mapping.push({ slug: slug, oldPhoto: photo, newPhoto: null, status: 'error', error: e.message });
    return { slug: slug, status: 'error', error: e.message };
  }
}

async function main() {
  await ensureDir();

  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await conn.query(
    "SELECT slug, photo FROM properties WHERE photo LIKE '%realt.by%'"
  );

  console.log('Found: ' + rows.length + ' photos');

  const mapping = [];
  let ok = 0, skip = 0, err = 0;
  let totalOriginal = 0, totalNew = 0;

  let idx = 0;
  async function worker() {
    while (idx < rows.length) {
      const i = idx++;
      const r = await processOne(rows[i], conn, mapping);
      if (r.status === 'ok') {
        ok++;
        totalOriginal += r.original;
        totalNew += r.size;
        console.log('[' + (i + 1) + '/' + rows.length + '] OK ' + r.slug + '  ' + Math.round(r.original / 1024) + 'KB -> ' + Math.round(r.size / 1024) + 'KB');
      } else if (r.status === 'skip') {
        skip++;
      } else {
        err++;
        console.log('[' + (i + 1) + '/' + rows.length + '] FAIL ' + r.slug + '  ' + r.error);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  await conn.end();
  await fs.writeFile(MAP_FILE, JSON.stringify(mapping, null, 2));

  console.log('');
  console.log('=== TOTAL ===');
  console.log('OK: ' + ok);
  console.log('Skip (already exists): ' + skip);
  console.log('Errors: ' + err);
  if (ok > 0) {
    console.log('Was:  ' + (totalOriginal / 1024 / 1024).toFixed(1) + ' MB');
    console.log('Now:  ' + (totalNew / 1024 / 1024).toFixed(1) + ' MB');
    console.log('Saved: ' + Math.round((1 - totalNew / totalOriginal) * 100) + '%');
  }
  console.log('');
  console.log('Mapping saved: ' + MAP_FILE);
  console.log('Images in:    ' + OUT_DIR);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});