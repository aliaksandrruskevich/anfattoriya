import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DynamicPage from './DynamicPageClient';
import { getArticleBySlug } from '@/lib/repository';

const BASE_URL = 'https://fattoria.by';

interface PageMeta {
  title: string;
  description: string;
}

const PAGES_META: Record<string, PageMeta> = {
  '': {
    title: 'Агентство недвижимости в Минске',
    description:
      'Агентство недвижимости «АН Фаттория» в Минске. Продажа, покупка квартир, коммерческой недвижимости, домов. Бесплатная оценка. Тел.: +375 29 638-00-53.',
  },
  'catalog': {
    title: 'Каталог недвижимости в Минске',
    description:
      'Актуальные объекты недвижимости в Минске: квартиры, дома, участки, коммерческая недвижимость. Более 500 проверенных объектов от АН Фаттория.',
  },
  'ob-agentstve': {
    title: 'О компании ',
    description:
      'АН Фаттория — агентство недвижимости в Минске с 2022 года. Лицензия Минюста РБ № 02240/446, страхование ответственности, 1000+ сделок в год.',
  },
  'nasha-komanda': {
    title: 'Наша команда риелторов',
    description:
      'Аттестованные риелторы АН Фаттория в Минске. Опыт, специализация, контакты. Выберите своего персонального риелтора.',
  },
  'vybrat-agenta': {
    title: 'Выбрать риелтора',
    description: 'Выберите аттестованного риелтора АН Фаттория для сопровождения сделки с недвижимостью в Минске.',
  },
  'services-agentstva': {
    title: 'Услуги агентства недвижимости',
    description:
      'Полный спектр риэлтерских услуг в Минске: продажа, покупка, аренда, оценка, юридическое сопровождение, перепланировка.',
  },
  'novosti-nedvizhimosti': {
    title: 'Новости недвижимости Минска',
    description:
      'Актуальные новости рынка недвижимости Минска и Беларуси. Аналитика, советы, изменения в законодательстве.',
  },
  'kontakty': {
    title: 'Контакты',
    description:
      'Контакты АН Фаттория: г. Минск, ул. Репина, д. 4, пом. 458. Телефон +375 29 638-00-53. Время работы: пн-пт 9:00–21:00, сб 10:00–15:00.',
  },
  'otzyvy-klientov': {
    title: 'Отзывы клиентов',
    description: 'Отзывы клиентов АН Фаттория о работе агентства и риелторов.',
  },
  'prodazha-kvartiry': {
    title: 'Продать квартиру в Минске',
    description:
      'Продажа квартир в Минске с АН Фаттория. Бесплатная оценка, профессиональная реклама, юридическое сопровождение сделки.',
  },
  'prodazha-doma-dachi': {
    title: 'Продать дом или дачу в Минске',
    description:
      'Продажа домов и дач в Минске и Минской области. Оценка, реклама, поиск покупателя, сопровождение сделки.',
  },
  'prodazha-pomescheniya': {
    title: 'Продать коммерческое помещение',
    description:
      'Продажа коммерческой недвижимости в Минске: офисы, магазины, склады, помещения. Оценка и сопровождение сделки.',
  },
  'prodazha-komnaty-doli': {
    title: 'Продать комнату или долю',
    description: 'Продажа комнат и долей в квартирах Минска. Юридическое сопровождение, оценка, поиск покупателя.',
  },
  'prodazha-nedvizhimosti': {
    title: 'Продажа недвижимости в Минске',
    description: 'Продажа квартир, домов, участков и коммерческой недвижимости в Минске. АН Фаттория — профессиональные риелторы.',
  },
  'ocenka-kvartiry': {
    title: 'Оценка квартиры в Минске',
    description: 'Бесплатная оценка квартиры в Минске. Узнайте рыночную стоимость вашей недвижимости за 30 минут.',
  },
  '10-dnej-probnogo-perioda': {
    title: 'Тест-драйв 10 дней — бесплатное продвижение',
    description: 'Бесплатный тест-драйв услуг АН Фаттория: 10 дней продвижения недвижимости без оплаты.',
  },
  'obmen-nedvizhimosti': {
    title: 'Обмен недвижимости',
    description: 'Обмен квартир, домов и коммерческой недвижимости в Минске с доплатой и без. Помощь в подборе вариантов.',
  },
  'baza-pokupatelej': {
    title: 'База покупателей недвижимости',
    description: 'Актуальная база покупателей недвижимости в Минске. Быстрая продажа объекта.',
  },
  'rieltor': {
    title: 'Риелторы',
    description: 'Аттестованные риелторы АН Фаттория в Минске. Команда профессионалов с опытом работы.',
  },
  'korporativnaya-arenda': {
    title: 'Корпоративная аренда недвижимости',
    description: 'Корпоративная аренда коммерческой недвижимости в Минске для сотрудников компаний.',
  },
  'uslugi-arendodatelyu': {
    title: 'Услуги арендодателю',
    description: 'Услуги для арендодателей: подбор арендаторов, проверка, сопровождение сделки аренды.',
  },
  'uslugi-arendatoru': {
    title: 'Услуги арендатору',
    description: 'Помощь в аренде коммерческой недвижимости в Минске. Подбор, проверка, оформление.',
  },
  'pokupka-kvartiry': {
    title: 'Покупка квартиры в Минске',
    description: 'Покупка квартиры в Минске с АН Фаттория. Подбор, проверка юридической чистоты, сопровождение сделки.',
  },
  'pokupka-dlya-arendy': {
    title: 'Покупка недвижимости для сдачи в аренду',
    description: 'Инвестиции в недвижимость Минска для сдачи в аренду. Подбор объектов, расчёт доходности.',
  },
  'yuridicheskaya-konsultaciya': {
    title: 'Юридическая консультация по недвижимости',
    description: 'Юридическая консультация по сделкам с недвижимостью в Минске. Проверка документов, сопровождение.',
  },
  'konsultaciya-stoimost-rieltor': {
    title: 'Консультация: стоимость услуг риелтора',
    description: 'Сколько стоят услуги риелтора в Минске. Прозрачные тарифы АН Фаттория.',
  },
  'oformit-sdelku': {
    title: 'Оформление сделки с недвижимостью',
    description: 'Оформление сделки купли-продажи недвижимости в Минске. Юридическое сопровождение от АН Фаттория.',
  },
  'soglasovanie-pereplanirovki': {
    title: 'Согласование перепланировки',
    description: 'Согласование перепланировки квартиры в Минске. Помощь в оформлении документов.',
  },
  'besplatnyj-vyezd-agenta': {
    title: 'Бесплатный выезд риелтора',
    description: 'Бесплатный выезд риелтора АН Фаттория для оценки недвижимости в Минске.',
  },
  'konsultaciya-dogovor-kupli': {
    title: 'Консультация: договор купли-продажи',
    description: 'Консультация по договору купли-продажи недвижимости в Минске. Юридическое сопровождение.',
  },
  'effektivnye-instrumenty': {
    title: 'Эффективные инструменты продажи',
    description: 'Инструменты эффективной продажи недвижимости в Минске: реклама, базы, аналитика.',
  },
  'kontrol-kachestva': {
    title: 'Контроль качества услуг',
    description: 'Контроль качества риэлтерских услуг в АН Фаттория. Гарантия профессионального сопровождения.',
  },
  'poleznaya-informaciya': {
    title: 'Полезная информация о недвижимости',
    description: 'Полезная информация о покупке, продаже недвижимости в Минске.',
  },
  'seo-landings': {
    title: 'Недвижимость по районам и улицам Минска',
    description: 'Подборки недвижимости по районам, улицам и станциям метро Минска.',
  },
  'privacy-policy': {
    title: 'Политика конфиденциальности',
    description: 'Политика конфиденциальности АН Фаттория.',
  },
  'cookies-policy': {
    title: 'Политика использования cookies',
    description: 'Политика использования cookies на сайте fattoria.by.',
  },
};

/**
 * Нормализует slug из Next.js params.
 */
function normalizeSlug(rawSlug: string | string[] | undefined): string {
  if (!rawSlug) return '';
  if (Array.isArray(rawSlug)) return rawSlug.join('/');
  return String(rawSlug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string | string[] }>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);

  const path = slug ? `/${slug}` : '';
  const url = `${BASE_URL}${path}`;
  const key = slug.split('/')[0] || '';

  let meta: PageMeta | undefined = PAGES_META[key];

  // Если это статья (slug не из PAGES_META) — берём из БД
  if (!meta) {
    try {
      const article = await getArticleBySlug(slug);
      if (article) {
        meta = {
          title: article.title, // layout добавит "| АН Фаттория" сам
          description: article.snippet || article.title,
        };
      }
    } catch (e) {
      console.error('[generateMetadata] article fetch failed:', e);
    }
  }

  // Если ничего не нашли — 404 (вместо fallback на главную)
  if (!meta) {
    notFound();
  }

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: 'АН Фаттория',
      locale: 'ru_RU',
      type: 'website',
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string | string[] }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);
  const key = slug.split('/')[0] || '';

  const isKnownPage = Boolean(PAGES_META[key]);

  // SSR: получаем статью на сервере (только если это НЕ известная страница)
  let initialArticle = null;

  if (!isKnownPage) {
    try {
      initialArticle = await getArticleBySlug(slug);
    } catch (e) {
      console.error('[Page] article fetch failed:', e);
    }

    // Не страница И не статья → 404
    if (!initialArticle) {
      notFound();
    }
  }

  return <DynamicPage initialArticle={initialArticle} />;
}