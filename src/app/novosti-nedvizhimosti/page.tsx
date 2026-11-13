'use client';

import React from 'react';
import NewsPage from '@/components/NewsPage';
import { useApp } from '@/app/Providers';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { articles, addLead } = useApp();
  const router = useRouter();
  const nav = (path: string) => router.push(path.startsWith('/') ? path : `/${path}`);

  return (
    <NewsPage
      activePage="novosti-nedvizhimosti"
      navigateTo={nav}
      handleAddLead={addLead}
      articlesList={articles}
      selectedArticle={null}
      onSelectArticle={(art) => router.push(art ? `/${art.slug || art.id}` : '/novosti-nedvizhimosti')}
    />
  );
}