import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "О компании",
  description: "АН Фаттория — агентство недвижимости в Минске с 2022 года. Лицензия Минюста РБ № 02240/446.",
  alternates: {
    canonical: "https://fattoria.by/ob-agentstve",
  },
  openGraph: {
    title: "О компании",
    description: "АН Фаттория — агентство недвижимости в Минске с 2022 года.",
    url: "https://fattoria.by/ob-agentstve",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}