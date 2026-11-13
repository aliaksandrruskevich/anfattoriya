import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "База покупателей недвижимости",
  description: "Актуальная база покупателей недвижимости в Минске.",
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