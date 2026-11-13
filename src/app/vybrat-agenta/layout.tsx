import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Выбрать риелтора",
  description: "Выберите аттестованного риелтора АН Фаттория.",
  alternates: {
    canonical: "https://fattoria.by/vybrat-agenta",
  },
  openGraph: {
    title: "Выбрать риелтора",
    description: "Выберите аттестованного риелтора АН Фаттория.",
    url: "https://fattoria.by/vybrat-agenta",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
