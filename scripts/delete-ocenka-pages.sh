#!/bin/bash
# ============================================================
# Удаление страниц оценки: ocenka-doma-dachi, ocenka-kommercheskoj, ocenka-uchastka
# Оставляем: ocenka-kvartiry (в навигации)
# Версия: 1.0
# Бэкап: src-backup-*.tar.gz
# ============================================================

set -e
cd "$(dirname "$0")/.."

echo "🗑️  Удаление лишних страниц оценки..."
echo ""

# ============================================================
# ШАГ 1: Папки в src/app/
# ============================================================
echo "=== Шаг 1: Папки в src/app/ ==="

mkdir -p src/app/_deleted

for dir in ocenka-doma-dachi ocenka-kommercheskoj ocenka-uchastka; do
  if [ -d "src/app/$dir" ]; then
    mv "src/app/$dir" "src/app/_deleted/"
    echo "✅ Перемещена папка: src/app/$dir"
  else
    echo "⚠️  Папка не найдена: src/app/$dir"
  fi
done

# ============================================================
# ШАГ 2: sitemap.ts — удалить 3 URL
# ============================================================
echo ""
echo "=== Шаг 2: sitemap.ts ==="

if [ -f src/app/sitemap.ts ]; then
  sed -i "/'\/ocenka-doma-dachi',/d" src/app/sitemap.ts
  sed -i "/'\/ocenka-kommercheskoj',/d" src/app/sitemap.ts
  sed -i "/'\/ocenka-uchastka',/d" src/app/sitemap.ts
  echo "✅ sitemap.ts — 3 URL удалены"
else
  echo "⚠️  sitemap.ts не найден"
fi

# ============================================================
# ШАГ 3: DynamicPageClient.tsx — удалить 3 записи
# ============================================================
echo ""
echo "=== Шаг 3: DynamicPageClient.tsx ==="

if [ -f "src/app/[slug]/DynamicPageClient.tsx" ]; then
  sed -i "/'ocenka-doma-dachi':/d" "src/app/[slug]/DynamicPageClient.tsx"
  sed -i "/'ocenka-kommercheskoj':/d" "src/app/[slug]/DynamicPageClient.tsx"
  sed -i "/'ocenka-uchastka':/d" "src/app/[slug]/DynamicPageClient.tsx"
  echo "✅ DynamicPageClient.tsx — 3 записи удалены"
else
  echo "⚠️  DynamicPageClient.tsx не найден"
fi

# ============================================================
# ШАГ 4: PageHero.tsx — удалить 3 ключа (через блоки)
# ============================================================
echo ""
echo "=== Шаг 4: PageHero.tsx ==="

if [ -f src/components/PageHero.tsx ]; then
  # Используем perl для многострочного удаления блоков
  perl -i -0pe "s/\s*'ocenka-doma-dachi':\s*\{[^}]*\},//gs" src/components/PageHero.tsx
  perl -i -0pe "s/\s*'ocenka-kommercheskoj':\s*\{[^}]*\},//gs" src/components/PageHero.tsx
  perl -i -0pe "s/\s*'ocenka-uchastka':\s*\{[^}]*\},//gs" src/components/PageHero.tsx
  echo "✅ PageHero.tsx — 3 ключа удалены"
  echo "⚠️  ПРОВЕРЬ ВРУЧНУЮ — perl может оставить мусор"
else
  echo "⚠️  PageHero.tsx не найден"
fi

# ============================================================
# ШАГ 5: OcenkaPage.tsx — удалить 3 блока
# ============================================================
echo ""
echo "=== Шаг 5: OcenkaPage.tsx ==="

if [ -f src/components/OcenkaPage.tsx ]; then
  perl -i -0pe "s/\s*'ocenka-doma-dachi':\s*\{[^}]*\},//gs" src/components/OcenkaPage.tsx
  perl -i -0pe "s/\s*'ocenka-kommercheskoj':\s*\{[^}]*\},//gs" src/components/OcenkaPage.tsx
  perl -i -0pe "s/\s*'ocenka-uchastka':\s*\{[^}]*\},//gs" src/components/OcenkaPage.tsx
  echo "✅ OcenkaPage.tsx — 3 блока удалены"
  echo "⚠️  ПРОВЕРЬ ВРУЧНУЮ — perl может оставить мусор"
else
  echo "⚠️  OcenkaPage.tsx не найден"
fi

# ============================================================
# ШАГ 6: pageMetadata.ts — удалить 3 блока
# ============================================================
echo ""
echo "=== Шаг 6: pageMetadata.ts ==="

if [ -f src/lib/pageMetadata.ts ]; then
  perl -i -0pe "s/\s*'ocenka-doma-dachi':\s*\{[^}]*\},//gs" src/lib/pageMetadata.ts
  perl -i -0pe "s/\s*'ocenka-kommercheskoj':\s*\{[^}]*\},//gs" src/lib/pageMetadata.ts
  perl -i -0pe "s/\s*'ocenka-uchastka':\s*\{[^}]*\},//gs" src/lib/pageMetadata.ts
  echo "✅ pageMetadata.ts — 3 блока удалены"
else
  echo "⚠️  pageMetadata.ts не найден"
fi

# ============================================================
# ШАГ 7: routes.ts — удалить блоки
# ============================================================
echo ""
echo "=== Шаг 7: routes.ts ==="

if [ -f src/lib/routes.ts ]; then
  # Удаляем маппинги URL → pageId
  sed -i "/'\/ocenka-doma-dachi':/d" src/lib/routes.ts
  sed -i "/'\/ocenka-kommercheskoj':/d" src/lib/routes.ts
  sed -i "/'\/ocenka-uchastka':/d" src/lib/routes.ts

  # Удаляем объекты pageId
  perl -i -0pe "s/\s*'ocenka-doma-dachi':\s*\{[^}]*\},//gs" src/lib/routes.ts
  perl -i -0pe "s/\s*'ocenka-kommercheskoj':\s*\{[^}]*\},//gs" src/lib/routes.ts
  perl -i -0pe "s/\s*'ocenka-uchastka':\s*\{[^}]*\},//gs" src/lib/routes.ts

  echo "✅ routes.ts — блоки и маппинги удалены"
else
  echo "⚠️  routes.ts не найден"
fi

# ============================================================
# ШАГ 8: types.ts — удалить 3 типа
# ============================================================
echo ""
echo "=== Шаг 8: types.ts ==="

if [ -f src/types.ts ]; then
  sed -i "/| 'ocenka-doma-dachi'/d" src/types.ts
  sed -i "/| 'ocenka-kommercheskoj'/d" src/types.ts
  sed -i "/| 'ocenka-uchastka'/d" src/types.ts
  echo "✅ types.ts — 3 типа удалены"
else
  echo "⚠️  types.ts не найден"
fi

# ============================================================
# ШАГ 9: [slug]/page.tsx — удалить 3 блока
# ============================================================
echo ""
echo "=== Шаг 9: [slug]/page.tsx ==="

if [ -f "src/app/[slug]/page.tsx" ]; then
  perl -i -0pe "s/\s*'ocenka-doma-dachi':\s*\{[^}]*\},//gs" "src/app/[slug]/page.tsx"
  perl -i -0pe "s/\s*'ocenka-kommercheskoj':\s*\{[^}]*\},//gs" "src/app/[slug]/page.tsx"
  perl -i -0pe "s/\s*'ocenka-uchastka':\s*\{[^}]*\},//gs" "src/app/[slug]/page.tsx"
  echo "✅ page.tsx — 3 блока удалены"
else
  echo "⚠️  page.tsx не найден"
fi

# ============================================================
# ШАГ 10: ПРОВЕРКА
# ============================================================
echo ""
echo "=== Шаг 10: ПРОВЕРКА ==="
echo ""

echo "--- Ссылки на удалённые URL ---"
FOUND=$(grep -rn "ocenka-doma-dachi\|ocenka-kommercheskoj\|ocenka-uchastka" src/ 2>/dev/null | grep -v "_deleted" | wc -l)
if [ "$FOUND" -eq 0 ]; then
  echo "✅ Нет ссылок на удалённые страницы"
else
  echo "⚠️  НАЙДЕНЫ ссылки ($FOUND):"
  grep -rn "ocenka-doma-dachi\|ocenka-kommercheskoj\|ocenka-uchastka" src/ 2>/dev/null | grep -v "_deleted" | head -20
fi

echo ""
echo "--- Осталось ocenka в проекте ---"
grep -rn "ocenka-" src/ 2>/dev/null | grep -v "_deleted" | head -20

echo ""
echo "--- Папки в src/app ---"
ls src/app/ | grep -i ocenka

echo ""
echo "============================================================"
echo "✅ СКРИПТ ЗАВЕРШЁН"
echo "============================================================"
echo ""
echo "📋 СЛЕДУЮЩИЕ ШАГИ:"
echo "1. Проверь PageHero.tsx и OcenkaPage.tsx — perl мог оставить мусор"
echo "2. Запусти: npm run build"
echo "3. Если билд ок → npm run start"
echo "4. Проверь http://localhost:3000/ocenka-kvartiry"
echo ""
echo "🛡️  ОТКАТ (если сломалось):"
echo "  mv src/app/_deleted/* src/app/"
echo "  tar -xzf src-backup-*.tar.gz"