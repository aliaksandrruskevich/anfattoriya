import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Продать коммерческое помещение",
  description: "Продажа коммерческой недвижимости в Минске.",
  alternates: {
    canonical: "https://fattoria.by/prodazha-pomescheniya",
  },
  openGraph: {
    title: "Продать коммерческое помещение",
    description: "Продажа коммерческой недвижимости в Минске.",
    url: "https://fattoria.by/prodazha-pomescheniya",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
