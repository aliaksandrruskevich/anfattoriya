'use client';

import React from 'react';
import ProdazhaKomnatyPage from '@/components/ProdazhaKomnatyPage';
import { useApp } from '@/app/Providers';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { addLead } = useApp();
  const router = useRouter();
  const nav = (path: string) => router.push(path.startsWith('/') ? path : `/${path}`);

  return (
    <ProdazhaKomnatyPage 
      activePage="prodazha-komnaty-doli" 
      navigateTo={nav} 
      handleAddLead={addLead} 
    />
  );
}
