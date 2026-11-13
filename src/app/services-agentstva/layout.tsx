import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Услуги агентства недвижимости",
  description: "Полный спектр риэлтерских услуг в Минске.",
  alternates: {
    canonical: "https://fattoria.by/services-agentstva",
  },
  openGraph: {
    title: "Услуги агентства недвижимости",
    description: "Полный спектр риэлтерских услуг в Минске.",
    url: "https://fattoria.by/services-agentstva",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
