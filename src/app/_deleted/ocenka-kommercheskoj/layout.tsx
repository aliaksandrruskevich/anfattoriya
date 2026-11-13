import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Оценка коммерческой недвижимости",
  description: "Оценка коммерческой недвижимости в Минске.",
  alternates: {
    canonical: "https://fattoria.by/ocenka-kommercheskoj",
  },
  openGraph: {
    title: "Оценка коммерческой недвижимости",
    description: "Оценка коммерческой недвижимости в Минске.",
    url: "https://fattoria.by/ocenka-kommercheskoj",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
