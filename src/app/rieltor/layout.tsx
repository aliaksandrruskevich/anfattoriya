import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Риелторы",
  description: "Аттестованные риелторы АН Фаттория в Минске.",
  alternates: {
    canonical: "https://fattoria.by/rieltor",
  },
  openGraph: {
    title: "Риелторы",
    description: "Аттестованные риелторы АН Фаттория в Минске.",
    url: "https://fattoria.by/rieltor",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}