import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import ClientLayout from './ClientLayout';
import './globals.css';

// Мы убрали next/font/google, чтобы сборка не падала.
// Шрифты теперь подключаются через обычный CSS в globals.css.

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://fattoria.by'),
  title: {
    default: 'АН Фаттория — Агентство недвижимости в Минске',
    template: '%s | АН Фаттория',
  },
  description:
    'Агентство недвижимости «АН Фаттория» в Минске. Продажа, покупка и аренда квартир, коммерческой недвижимости, домов. Бесплатная оценка стоимости. Адрес: ул. Репина, 4, пом. 458. Тел.: +375 29 638-00-53.',
  authors: [{ name: 'АН Фаттория' }],
  creator: 'АН Фаттория',
  publisher: 'АН Фаттория',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'АН Фаттория',
    title: 'АН Фаттория — Агентство недвижимости в Минске',
    description:
      'Агентство недвижимости «АН Фаттория» в Минске. Продажа, покупка и аренда квартир, коммерческой недвижимости, домов. Бесплатная оценка стоимости. Адрес: ул. Репина, 4, пом. 458.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'АН Фаттория — агентство недвижимости',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'АН Фаттория — Агентство недвижимости в Минске',
    description:
      'Агентство недвижимости «АН Фаттория» в Минске. Продажа, покупка и аренда квартир, коммерческой недвижимости, домов.',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'qKDJYbmRSIv1SR03B692aNRVi4oEbjG5eUPRQJhif7A',
    yandex: 'a3a53c29d96d7c3f',
  },
};

const MAIN_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'АН Фаттория',
  alternateName: 'ООО «АН Фаттория»',
  url: 'https://fattoria.by',
  logo: 'https://fattoria.by/logo.svg',
  image: 'https://fattoria.by/og-image.jpg',
  description:
    'Агентство недвижимости «АН Фаттория» в Минске. Продажа, покупка и аренда квартир, коммерческой недвижимости, домов. Бесплатная оценка стоимости.',
  telephone: '+375 29 638-00-53',
  email: 'fattoria1900088@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'ул. Репина, д.4, пом.458',
    addressLocality: 'Минск',
    addressCountry: 'BY',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 53.9008,
    longitude: 27.5516,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '21:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '10:00',
      closes: '15:00',
    },
  ],
  foundingDate: '2022',
  areaServed: {
    '@type': 'City',
    name: 'Минск',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isProduction = process.env.NODE_ENV === 'production';

  return (
    <html lang="ru" className="font-sans">
      <head>
        <link rel="preconnect" href="https://files.realt.by" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://files.realt.by" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(MAIN_SCHEMA) }}
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>

        {isProduction && (
          <>
            {/* Yandex.Metrika counter */}
            <Script id="yandex-metrika" strategy="afterInteractive">
              {`
                (function(m,e,t,r,i,k,a){
                  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                  m[i].l=1*new Date();
                  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
                })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=106704448', 'ym');

                try {
                  ym(106704448, 'init', {
                    ssr: true,
                    webvisor: true,
                    clickmap: true,
                    ecommerce: "dataLayer",
                    referrer: document.referrer,
                    url: location.href,
                    accurateTrackBounce: true,
                    trackLinks: true
                  });
                } catch (e) {
                  // Метрика иногда падает при медленной загрузке — не критично
                }
              `}
            </Script>

            {/* Yandex.Metrika noscript */}
            <noscript>
              <div>
                <img
                  src="https://mc.yandex.ru/watch/106704448"
                  style={{ position: 'absolute', left: '-9999px' }}
                  alt=""
                />
              </div>
            </noscript>

            {/* Google Analytics 4 */}
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-W9P522GEC"
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-W9P522GEC', { send_page_view: false });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}