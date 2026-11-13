'use client';

import React from 'react';
import LegalConsultationPage from '@/components/LegalConsultationPage';
import { useApp } from '@/app/Providers';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { addLead } = useApp();
  const router = useRouter();
  const nav = (path: string) => router.push(path.startsWith('/') ? path : `/${path}`);

  return (
    <LegalConsultationPage 
      activePage="yuridicheskaya-konsultaciya" 
      navigateTo={nav} 
      handleAddLead={addLead} 
    />
  );
}
