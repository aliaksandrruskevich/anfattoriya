import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Обмен недвижимости",
  description: "Обмен квартир, домов и коммерческой недвижимости в Минске.",
  alternates: {
    canonical: "https://fattoria.by/obmen-nedvizhimosti",
  },
  openGraph: {
    title: "Обмен недвижимости",
    description: "Обмен квартир, домов и коммерческой недвижимости в Минске.",
    url: "https://fattoria.by/obmen-nedvizhimosti",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
