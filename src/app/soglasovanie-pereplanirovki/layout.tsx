import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Согласование перепланировки",
  description: "Согласование перепланировки квартиры в Минске.",
  alternates: {
    canonical: "https://fattoria.by/soglasovanie-pereplanirovki",
  },
  openGraph: {
    title: "Согласование перепланировки",
    description: "Согласование перепланировки квартиры в Минске.",
    url: "https://fattoria.by/soglasovanie-pereplanirovki",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
