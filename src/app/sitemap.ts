import { MetadataRoute } from 'next';
import { getAgents, getArticles, getProperties } from '@/lib/repository';
import { getPropertySlug, getAgentSlug, getArticleSlug } from '@/lib/routes';
import { makeLandingSlug } from '@/lib/seoLandings';
import { Property } from '@/types';

// Пересобирать sitemap каждый час (3600 секунд)
// Новые объекты из БД автоматически попадают в sitemap
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://fattoria.by';
  const today = new Date();

  const staticPages = [
    '',
    '/catalog',
    '/kontakty',
    '/ob-agentstve',
    '/nasha-komanda',
    '/vybrat-agenta',
    '/novosti-nedvizhimosti',
    '/otzyvy-klientov',
    '/services-agentstva',
    '/ocenka-kvartiry',
    '/soglasovanie-pereplanirovki',
    '/yuridicheskaya-konsultaciya',
    '/konsultaciya-stoimost-rieltor',
    '/oformit-sdelku',
    '/prodazha-nedvizhimosti',
    '/prodazha-kvartiry',
    '/prodazha-pomescheniya',
    '/prodazha-doma-dachi',
    '/prodazha-komnaty-doli',
    '/10-dnej-probnogo-perioda',
    '/obmen-nedvizhimosti',
    '/rieltor',
    // ВНИМАНИЕ: /baza-pokupatelej и /agent-cabinet — внутренние страницы.
    // Они закрыты через noindex в layout.tsx и disallow в robots.ts.
    // В sitemap их НЕ добавляем.
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: today,
    changeFrequency: 'daily',
    priority: path === '' ? 1 : 0.8,
  }));

  // ============================================================
  // ОБЪЕКТЫ — читаем из MySQL через repository
  // ============================================================
  let properties: Property[] = [];
  try {
    properties = await getProperties({ status: 'active' });
    console.log(`[sitemap] Загружено объектов: ${properties.length}`);
  } catch (e) {
    console.error('[sitemap] Не удалось загрузить объекты:', e);
  }

  properties.forEach((p) => {
    if (p.isPublished !== false && !p.isClosedBase) {
      sitemapEntries.push({
        url: `${baseUrl}/object/${getPropertySlug(p)}`,
        lastModified: today,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  });

  // ============================================================
  // РИЭЛТЕРЫ — читаем из MySQL
  // ============================================================
  try {
    const agents = await getAgents();
    agents.forEach((a) => {
      sitemapEntries.push({
        url: `${baseUrl}/rieltor/${getAgentSlug(a)}`,
        lastModified: today,
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    });
  } catch (e) {
    console.error('[sitemap] Не удалось загрузить агентов:', e);
  }

  // ============================================================
  // СТАТЬИ — читаем из MySQL
  // ============================================================
  try {
    const articles = await getArticles();
    articles.forEach((art) => {
      sitemapEntries.push({
        url: `${baseUrl}/${getArticleSlug(art)}`,
        lastModified: today,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });
  } catch (e) {
    console.error('[sitemap] Не удалось загрузить статьи:', e);
  }

  // ============================================================
  // SEO-ЛЕНДИНГИ: метро, улицы, районы
  // ============================================================
  try {
    const metros = new Set<string>();
    const streets = new Set<string>();
    const districts = new Set<string>();

    properties.forEach((p) => {
      if (p.metro && p.metro.trim()) metros.add(p.metro.trim());
      if (p.street && p.street.trim()) streets.add(p.street.trim());
      if (p.district && p.district.trim()) districts.add(p.district.trim());
    });

    // Метро
    metros.forEach((metro) => {
      sitemapEntries.push({
        url: `${baseUrl}/${makeLandingSlug('metro', metro)}`,
        lastModified: today,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });

    // Улицы
    streets.forEach((street) => {
      sitemapEntries.push({
        url: `${baseUrl}/${makeLandingSlug('ulica', street)}`,
        lastModified: today,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });

    // Районы
    districts.forEach((district) => {
      sitemapEntries.push({
        url: `${baseUrl}/${makeLandingSlug('rajon', district)}`,
        lastModified: today,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });

    console.log(
      `[sitemap] SEO-лендингов: метро=${metros.size}, улиц=${streets.size}, районов=${districts.size}`
    );
  } catch (e) {
    console.error('[sitemap] Не удалось сгенерировать SEO-лендинги:', e);
  }

  console.log(`[sitemap] Всего URL: ${sitemapEntries.length}`);
  return sitemapEntries;
}