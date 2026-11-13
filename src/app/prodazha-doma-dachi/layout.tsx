import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Продать дом или дачу в Минске",
  description: "Продажа домов и дач в Минске и Минской области.",
  alternates: {
    canonical: "https://fattoria.by/prodazha-doma-dachi",
  },
  openGraph: {
    title: "Продать дом или дачу в Минске",
    description: "Продажа домов и дач в Минске и Минской области.",
    url: "https://fattoria.by/prodazha-doma-dachi",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
