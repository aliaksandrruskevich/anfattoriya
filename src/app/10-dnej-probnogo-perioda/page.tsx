'use client';

import React from 'react';
import TrialPeriodPage from '@/components/TrialPeriodPage';
import { useApp } from '@/app/Providers';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { addLead } = useApp();
  const router = useRouter();
  const nav = (path: string) => router.push(path.startsWith('/') ? path : `/${path}`);

  return (
    <TrialPeriodPage 
      activePage="10-dnej-probnogo-perioda" 
      navigateTo={nav} 
      handleAddLead={addLead} 
    />
  );
}
