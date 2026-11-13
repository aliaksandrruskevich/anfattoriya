import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Оценка квартиры в Минске",
  description: "Бесплатная оценка квартиры в Минске.",
  alternates: {
    canonical: "https://fattoria.by/ocenka-kvartiry",
  },
  openGraph: {
    title: "Оценка квартиры в Минске",
    description: "Бесплатная оценка квартиры в Минске.",
    url: "https://fattoria.by/ocenka-kvartiry",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
