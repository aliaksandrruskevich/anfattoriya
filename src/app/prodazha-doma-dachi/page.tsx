'use client';

import React from 'react';
import ProdazhaDomaPage from '@/components/ProdazhaDomaPage';
import { useApp } from '@/app/Providers';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { addLead } = useApp();
  const router = useRouter();
  const nav = (path: string) => router.push(path.startsWith('/') ? path : `/${path}`);

  return (
    <ProdazhaDomaPage 
      activePage="prodazha-doma-dachi" 
      navigateTo={nav} 
      handleAddLead={addLead} 
    />
  );
}
