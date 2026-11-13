// scripts/add-metadata.cjs
// Создаёт layout.tsx в каждой папке с page.tsx (если page.tsx — клиентский)

const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '..', 'src', 'app');
const BASE_URL = 'https://fattoria.by';

// Мета для каждой страницы
const PAGES_META = {
  '': { title: 'АН Фаттория — Агентство недвижимости в Минске', description: 'Агентство недвижимости «АН Фаттория» в Минске. Продажа, покупка и аренда квартир, коммерческой недвижимости, домов. Бесплатная оценка.' },
  'catalog': { title: 'Каталог недвижимости в Минске', description: 'Актуальные объекты недвижимости в Минске: квартиры, дома, участки, коммерческая недвижимость.' },
  'ob-agentstve': { title: 'О компании АН Фаттория', description: 'АН Фаттория — агентство недвижимости в Минске с 2022 года. Лицензия Минюста РБ № 02240/446.' },
  'nasha-komanda': { title: 'Наша команда риелторов', description: 'Аттестованные риелторы АН Фаттория в Минске.' },
  'vybrat-agenta': { title: 'Выбрать риелтора', description: 'Выберите аттестованного риелтора АН Фаттория.' },
  'services-agentstva': { title: 'Услуги агентства недвижимости', description: 'Полный спектр риэлтерских услуг в Минске.' },
  'novosti-nedvizhimosti': { title: 'Новости недвижимости Минска', description: 'Актуальные новости рынка недвижимости Минска.' },
  'kontakty': { title: 'Контакты АН Фаттория', description: 'Контакты АН Фаттория: г. Минск, ул. Репина, д. 4, пом. 458. Тел.: +375 29 638-00-53.' },
  'otzyvy-klientov': { title: 'Отзывы клиентов', description: 'Отзывы клиентов АН Фаттория.' },
  'prodazha-kvartiry': { title: 'Продать квартиру в Минске', description: 'Продажа квартир в Минске с АН Фаттория.' },
  'prodazha-doma-dachi': { title: 'Продать дом или дачу в Минске', description: 'Продажа домов и дач в Минске и Минской области.' },
  'prodazha-pomescheniya': { title: 'Продать коммерческое помещение', description: 'Продажа коммерческой недвижимости в Минске.' },
  'prodazha-komnaty-doli': { title: 'Продать комнату или долю', description: 'Продажа комнат и долей в квартирах Минска.' },
  'prodazha-nedvizhimosti': { title: 'Продажа недвижимости в Минске', description: 'Продажа квартир, домов, участков и коммерческой недвижимости в Минске.' },
  'ocenka-kvartiry': { title: 'Оценка квартиры в Минске', description: 'Бесплатная оценка квартиры в Минске.' },
  'ocenka-doma-dachi': { title: 'Оценка дома и дачи', description: 'Бесплатная оценка домов и дач в Минске.' },
  'ocenka-kommercheskoj': { title: 'Оценка коммерческой недвижимости', description: 'Оценка коммерческой недвижимости в Минске.' },
  'ocenka-uchastka': { title: 'Оценка земельного участка', description: 'Оценка земельных участков в Минске.' },
  '10-dnej-probnogo-perioda': { title: 'Тест-драйв 10 дней', description: 'Бесплатный тест-драйв услуг АН Фаттория.' },
  'obmen-nedvizhimosti': { title: 'Обмен недвижимости', description: 'Обмен квартир, домов и коммерческой недвижимости в Минске.' },
  'baza-pokupatelej': { title: 'База покупателей недвижимости', description: 'Актуальная база покупателей недвижимости в Минске.' },
  'rieltor': { title: 'Риелторы АН Фаттория', description: 'Аттестованные риелторы АН Фаттория в Минске.' },
  'konsultaciya-stoimost-rieltor': { title: 'Консультация: стоимость услуг риелтора', description: 'Сколько стоят услуги риелтора в Минске.' },
  'oformit-sdelku': { title: 'Оформление сделки с недвижимостью', description: 'Оформление сделки купли-продажи недвижимости в Минске.' },
  'soglasovanie-pereplanirovki': { title: 'Согласование перепланировки', description: 'Согласование перепланировки квартиры в Минске.' },
  'yuridicheskaya-konsultaciya': { title: 'Юридическая консультация по недвижимости', description: 'Юридическая консультация по сделкам с недвижимостью в Минске.' },
  'privacy-policy': { title: 'Политика конфиденциальности', description: 'Политика конфиденциальности АН Фаттория.' },
  'cookies-policy': { title: 'Политика использования cookies', description: 'Политика использования cookies на сайте fattoria.by.' },
  'agent-cabinet': { title: 'Кабинет агента', description: 'Личный кабинет риелтора АН Фаттория.' },
};

function findPages(dir, base = '') {
  const result = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = base ? `${base}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      if (['api', '_next', 'node_modules', 'object'].includes(entry.name)) continue;
      if (entry.name.startsWith('[') && entry.name.endsWith(']')) continue;
      result.push(...findPages(fullPath, relPath));
    } else if (entry.name === 'page.tsx') {
      result.push({ filePath: fullPath, dir: dir, slug: base || '' });
    }
  }

  return result;
}

function createLayout(dirPath, slug) {
  const layoutPath = path.join(dirPath, 'layout.tsx');

  if (fs.existsSync(layoutPath)) {
    console.log(`SKIP (layout exists): ${layoutPath}`);
    return false;
  }

  const meta = PAGES_META[slug] || {
    title: 'АН Фаттория — Агентство недвижимости в Минске',
    description: 'Агентство недвижимости «АН Фаттория» в Минске.',
  };
  const url = slug ? `${BASE_URL}/${slug}` : BASE_URL;

  const content = `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ${JSON.stringify(meta.title)},
  description: ${JSON.stringify(meta.description)},
  alternates: {
    canonical: ${JSON.stringify(url)},
  },
  openGraph: {
    title: ${JSON.stringify(meta.title)},
    description: ${JSON.stringify(meta.description)},
    url: ${JSON.stringify(url)},
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
`;

  fs.writeFileSync(layoutPath, content, 'utf8');
  console.log(`OK: /${slug || ''} → ${layoutPath}`);
  return true;
}

const pages = findPages(APP_DIR);
console.log(`Найдено ${pages.length} page.tsx\n`);

let added = 0, skipped = 0;
for (const { dir, slug } of pages) {
  if (createLayout(dir, slug)) added++;
  else skipped++;
}

console.log(`\n=== ИТОГО ===`);
console.log(`Создано layout.tsx: ${added}`);
console.log(`Пропущено: ${skipped}`);