'use client';

import React from 'react';
import ProdazhaNedvizhimostiPage from '@/components/ProdazhaNedvizhimostiPage';
import { useApp } from '@/app/Providers';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { addLead } = useApp();
  const router = useRouter();
  const nav = (path: string) => router.push(path.startsWith('/') ? path : `/${path}`);

  return (
    <ProdazhaNedvizhimostiPage 
      activePage="prodazha-nedvizhimosti" 
      navigateTo={nav} 
      handleAddLead={addLead} 
    />
  );
}
