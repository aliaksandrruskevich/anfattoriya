import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Оценка земельного участка",
  description: "Оценка земельных участков в Минске.",
  alternates: {
    canonical: "https://fattoria.by/ocenka-uchastka",
  },
  openGraph: {
    title: "Оценка земельного участка",
    description: "Оценка земельных участков в Минске.",
    url: "https://fattoria.by/ocenka-uchastka",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
