import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Каталог недвижимости в Минске",
  description: "Актуальные объекты недвижимости в Минске: квартиры, дома, участки, коммерческая недвижимость.",
  alternates: {
    canonical: "https://fattoria.by/catalog",
  },
  openGraph: {
    title: "Каталог недвижимости в Минске",
    description: "Актуальные объекты недвижимости в Минске: квартиры, дома, участки, коммерческая недвижимость.",
    url: "https://fattoria.by/catalog",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
