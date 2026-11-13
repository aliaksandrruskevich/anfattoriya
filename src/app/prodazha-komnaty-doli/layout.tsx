import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Продать комнату или долю",
  description: "Продажа комнат и долей в квартирах Минска.",
  alternates: {
    canonical: "https://fattoria.by/prodazha-komnaty-doli",
  },
  openGraph: {
    title: "Продать комнату или долю",
    description: "Продажа комнат и долей в квартирах Минска.",
    url: "https://fattoria.by/prodazha-komnaty-doli",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
