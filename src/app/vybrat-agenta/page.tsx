'use client';

import React from 'react';
import ChooseAgentPage from '@/components/ChooseAgentPage';
import { useApp } from '@/app/Providers';
import { useRouter } from 'next/navigation';
import { getAgentUrl } from '@/lib/routes';

export default function Page() {
  const { agents, addLead } = useApp();
  const router = useRouter();
  const nav = (path: string) => router.push(path.startsWith('/') ? path : `/${path}`);

  return (
    <ChooseAgentPage 
      activePage="vybrat-agenta" 
      navigateTo={nav} 
      handleAddLead={addLead} 
      agentsList={agents}
      onViewProfile={(a) => router.push(getAgentUrl(a))}
    />
  );
}
