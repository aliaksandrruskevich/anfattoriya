import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Кабинет агента",
  description: "Личный кабинет риелтора АН Фаттория.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}