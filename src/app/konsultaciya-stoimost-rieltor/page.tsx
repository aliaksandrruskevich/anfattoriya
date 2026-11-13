'use client';

import React from 'react';
import ConsultationCostPage from '@/components/ConsultationCostPage';
import { useApp } from '@/app/Providers';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { addLead } = useApp();
  const router = useRouter();
  const nav = (path: string) => router.push(path.startsWith('/') ? path : `/${path}`);

  return (
    <ConsultationCostPage 
      activePage="konsultaciya-stoimost-rieltor" 
      navigateTo={nav} 
      handleAddLead={addLead} 
    />
  );
}
