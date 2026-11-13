import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Продажа недвижимости в Минске",
  description: "Продажа квартир, домов, участков и коммерческой недвижимости в Минске.",
  alternates: {
    canonical: "https://fattoria.by/prodazha-nedvizhimosti",
  },
  openGraph: {
    title: "Продажа недвижимости в Минске",
    description: "Продажа квартир, домов, участков и коммерческой недвижимости в Минске.",
    url: "https://fattoria.by/prodazha-nedvizhimosti",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
