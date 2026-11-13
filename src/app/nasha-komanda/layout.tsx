import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Наша команда риелторов",
  description: "Аттестованные риелторы АН Фаттория в Минске.",
  alternates: {
    canonical: "https://fattoria.by/nasha-komanda",
  },
  openGraph: {
    title: "Наша команда риелторов",
    description: "Аттестованные риелторы АН Фаттория в Минске.",
    url: "https://fattoria.by/nasha-komanda",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
