import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Оформление сделки с недвижимостью",
  description: "Оформление сделки купли-продажи недвижимости в Минске.",
  alternates: {
    canonical: "https://fattoria.by/oformit-sdelku",
  },
  openGraph: {
    title: "Оформление сделки с недвижимостью",
    description: "Оформление сделки купли-продажи недвижимости в Минске.",
    url: "https://fattoria.by/oformit-sdelku",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
