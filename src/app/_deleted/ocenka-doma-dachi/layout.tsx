import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Оценка дома и дачи",
  description: "Бесплатная оценка домов и дач в Минске.",
  alternates: {
    canonical: "https://fattoria.by/ocenka-doma-dachi",
  },
  openGraph: {
    title: "Оценка дома и дачи",
    description: "Бесплатная оценка домов и дач в Минске.",
    url: "https://fattoria.by/ocenka-doma-dachi",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
