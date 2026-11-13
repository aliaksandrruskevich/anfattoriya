import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Новости недвижимости Минска",
  description: "Актуальные новости рынка недвижимости Минска.",
  alternates: {
    canonical: "https://fattoria.by/novosti-nedvizhimosti",
  },
  openGraph: {
    title: "Новости недвижимости Минска",
    description: "Актуальные новости рынка недвижимости Минска.",
    url: "https://fattoria.by/novosti-nedvizhimosti",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
