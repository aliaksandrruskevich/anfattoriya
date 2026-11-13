import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Продать квартиру в Минске",
  description: "Продажа квартир в Минске с АН Фаттория.",
  alternates: {
    canonical: "https://fattoria.by/prodazha-kvartiry",
  },
  openGraph: {
    title: "Продать квартиру в Минске",
    description: "Продажа квартир в Минске с АН Фаттория.",
    url: "https://fattoria.by/prodazha-kvartiry",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
