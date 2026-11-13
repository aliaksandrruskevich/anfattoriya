/**
 * Генерирует URL-безопасный slug из заголовка.
 * Кириллица транслитерируется в латиницу.
 *
 * Пример:
 *   "Актуальные адреса РСЦ Минска в 2026 году"
 *   → "aktualnye-adresa-rsc-minska-v-2026-godu"
 */
const TRANSLIT_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh',
  з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
  ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu',
  я: 'ya',
  // украинские (на всякий)
  і: 'i', ї: 'yi', є: 'ye', ґ: 'g',
  // белорусские
  ў: 'u',
};

export function generateSlug(input: string): string {
  if (!input) return '';

  const lower = input.toLowerCase().trim();

  // Транслитерация посимвольно
  const translit = lower
    .split('')
    .map((char) => TRANSLIT_MAP[char] ?? char)
    .join('');

  // Чистим и делаем slug
  return translit
    .replace(/[^a-z0-9]+/g, '-')   // всё, кроме букв/цифр → дефис
    .replace(/^-+|-+$/g, '')        // убрать дефисы по краям
    .replace(/-{2,}/g, '-')         // схлопнуть двойные дефисы
    .slice(0, 80);                   // ограничить длину
}