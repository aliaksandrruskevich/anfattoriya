import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description: "Политика конфиденциальности АН Фаттория.",
  alternates: {
    canonical: "https://fattoria.by/privacy-policy",
  },
  openGraph: {
    title: "Политика конфиденциальности",
    description: "Политика конфиденциальности АН Фаттория.",
    url: "https://fattoria.by/privacy-policy",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
