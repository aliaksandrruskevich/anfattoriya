import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Контакты",
  description: "Контакты АН Фаттория: г. Минск, ул. Репина, д. 4, пом. 458. Тел.: +375 29 638-00-53.",
  alternates: {
    canonical: "https://fattoria.by/kontakty",
  },
  openGraph: {
    title: "Контакты",
    description: "Контакты АН Фаттория: г. Минск, ул. Репина, д. 4, пом. 458. Тел.: +375 29 638-00-53.",
    url: "https://fattoria.by/kontakty",
    siteName: 'АН Фаттория',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}