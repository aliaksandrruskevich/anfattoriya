'use client';

import React from 'react';
import OcenkaPage from '@/components/OcenkaPage';
import { useApp } from '@/app/Providers';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { addLead } = useApp();
  const router = useRouter();
  const nav = (path: string) => router.push(path.startsWith('/') ? path : `/${path}`);

  return (
    <OcenkaPage 
      activePage="ocenka-kvartiry" 
      navigateTo={nav} 
      handleAddLead={addLead} 
    />
  );
}
