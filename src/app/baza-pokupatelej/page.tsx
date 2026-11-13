'use client';

import React from 'react';
import BuyersDatabasePage from '@/components/BuyersDatabasePage';
import { useApp } from '@/app/Providers';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { addLead } = useApp();
  const router = useRouter();
  const nav = (path: string) => router.push(path.startsWith('/') ? path : `/${path}`);

  return (
    <BuyersDatabasePage 
      activePage="baza-pokupatelej" 
      navigateTo={nav} 
      handleAddLead={addLead} 
    />
  );
}
