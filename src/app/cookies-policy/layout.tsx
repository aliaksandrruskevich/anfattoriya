import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Политика использования cookies",
  description: "Политика использования cookies на сайте fattoria.by.",
  alternates: {
    canonical: "https://fattoria.by/cookies-policy",
  },
  openGraph: {
    title: "Политика использования cookies",
    description: "Политика использования cookies на сайте fattoria.by.",
    url: "https://fattoria.by/cookies-policy",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
