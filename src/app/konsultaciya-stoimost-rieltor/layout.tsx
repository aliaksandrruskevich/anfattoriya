import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Консультация: стоимость услуг риелтора",
  description: "Сколько стоят услуги риелтора в Минске.",
  alternates: {
    canonical: "https://fattoria.by/konsultaciya-stoimost-rieltor",
  },
  openGraph: {
    title: "Консультация: стоимость услуг риелтора",
    description: "Сколько стоят услуги риелтора в Минске.",
    url: "https://fattoria.by/konsultaciya-stoimost-rieltor",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
