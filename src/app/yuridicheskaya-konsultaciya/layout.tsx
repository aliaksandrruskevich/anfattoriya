import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Юридическая консультация по недвижимости",
  description: "Юридическая консультация по сделкам с недвижимостью в Минске.",
  alternates: {
    canonical: "https://fattoria.by/yuridicheskaya-konsultaciya",
  },
  openGraph: {
    title: "Юридическая консультация по недвижимости",
    description: "Юридическая консультация по сделкам с недвижимостью в Минске.",
    url: "https://fattoria.by/yuridicheskaya-konsultaciya",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
