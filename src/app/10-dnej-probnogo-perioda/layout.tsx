import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Тест-драйв 10 дней",
  description: "Бесплатный тест-драйв услуг АН Фаттория.",
  alternates: {
    canonical: "https://fattoria.by/10-dnej-probnogo-perioda",
  },
  openGraph: {
    title: "Тест-драйв 10 дней",
    description: "Бесплатный тест-драйв услуг АН Фаттория.",
    url: "https://fattoria.by/10-dnej-probnogo-perioda",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
