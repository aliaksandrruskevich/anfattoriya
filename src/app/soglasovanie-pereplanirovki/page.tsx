'use client';

import React from 'react';
import RedevelopmentPage from '@/components/RedevelopmentPage';
import { useApp } from '@/app/Providers';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { addLead } = useApp();
  const router = useRouter();
  const nav = (path: string) => router.push(path.startsWith('/') ? path : `/${path}`);

  return (
    <RedevelopmentPage 
      activePage="soglasovanie-pereplanirovki" 
      navigateTo={nav} 
      handleAddLead={addLead} 
    />
  );
}
