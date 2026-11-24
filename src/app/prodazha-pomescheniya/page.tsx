'use client';

import React from 'react';
import ProdazhaPomescheniyaPage from '@/components/ProdazhaPomescheniyaPage';
import { useApp } from '@/app/Providers';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { addLead, properties, agents } = useApp();
  const router = useRouter();
  const nav = (path: string) => router.push(path.startsWith('/') ? path : `/${path}`);

  return (
    <ProdazhaPomescheniyaPage
      activePage="prodazha-pomescheniya"
      navigateTo={nav}
      handleAddLead={addLead}
      properties={properties}
      agents={agents}
    />
  );
}
