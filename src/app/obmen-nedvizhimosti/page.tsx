'use client';

import React from 'react';
import ObmenNedvizhimostiPage from '@/components/ObmenNedvizhimostiPage';
import { useApp } from '@/app/Providers';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { addLead } = useApp();
  const router = useRouter();
  const nav = (path: string) => router.push(path.startsWith('/') ? path : `/${path}`);

  return (
    <ObmenNedvizhimostiPage 
      activePage="obmen-nedvizhimosti" 
      navigateTo={nav} 
      handleAddLead={addLead} 
    />
  );
}
