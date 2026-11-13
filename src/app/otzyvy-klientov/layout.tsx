import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Отзывы клиентов",
  description: "Отзывы клиентов АН Фаттория.",
  alternates: {
    canonical: "https://fattoria.by/otzyvy-klientov",
  },
  openGraph: {
    title: "Отзывы клиентов",
    description: "Отзывы клиентов АН Фаттория.",
    url: "https://fattoria.by/otzyvy-klientov",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
