'use client';

import React from 'react';
import ServicesPage from '@/components/ServicesPage';
import { useApp } from '@/app/Providers';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { addLead } = useApp();
  const router = useRouter();
  const nav = (path: string) => router.push(path.startsWith('/') ? path : `/${path}`);

  return (
    <ServicesPage 
      activePage="services-agentstva" 
      navigateTo={nav} 
      handleAddLead={addLead} 
    />
  );
}
