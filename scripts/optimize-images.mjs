import sharp from 'sharp';
import { readdir, stat, rename } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';

const DIRS = [
  'public/photo',
  'public/photo/docs',
  'public/photo/properties',
];

const MAX_WIDTH = 1600;
const QUALITY = 80;

async function optimizeImage(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;

  const before = (await stat(filePath)).size;
  const isPng = ext === '.png';

  let pipeline = sharp(filePath).resize({
    width: MAX_WIDTH,
    withoutEnlargement: true,
  });

  if (isPng) {
    pipeline = pipeline.png({ quality: QUALITY, compressionLevel: 9 });
  } else {
    pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true });
  }

  const tmpPath = filePath + '.tmp';
  await pipeline.toFile(tmpPath);
  await rename(tmpPath, filePath);

  const after = (await stat(filePath)).size;
  const saved = before - after;
  const pct = ((saved / before) * 100).toFixed(1);
  console.log(`${basename(filePath)}: ${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB (-${pct}%)`);
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
    } else {
      await optimizeImage(fullPath);
    }
  }
}

for (const dir of DIRS) {
  console.log(`\n=== ${dir} ===`);
  await walk(dir).catch((e) => console.error(`Skip ${dir}:`, e.message));
}
console.log('\n✅ Готово');