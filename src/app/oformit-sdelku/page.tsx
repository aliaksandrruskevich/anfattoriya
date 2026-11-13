'use client';

import React from 'react';
import CheckTransactionPage from '@/components/CheckTransactionPage';
import { useApp } from '@/app/Providers';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { addLead } = useApp();
  const router = useRouter();
  const nav = (path: string) => router.push(path.startsWith('/') ? path : `/${path}`);

  return (
    <CheckTransactionPage 
      activePage="oformit-sdelku" 
      navigateTo={nav} 
      handleAddLead={addLead} 
    />
  );
}
