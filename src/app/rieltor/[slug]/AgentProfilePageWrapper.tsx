'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AgentProfilePage from '@/components/AgentProfilePage';
import { useApp } from '@/app/Providers';
import type { Agent, Property } from '@/types';

interface Props {
  agent: Agent;
  propertiesList: Property[];
}

export default function AgentProfilePageWrapper({ agent, propertiesList }: Props) {
  const router = useRouter();
  const { addLead } = useApp();

  return (
    <AgentProfilePage
      agent={agent}
      propertiesList={propertiesList}
      navigateTo={(path) => router.push(path.startsWith('/') ? path : `/${path}`)}
      currency="BYN"
      handleAddLead={addLead}
      onBack={() => router.push('/nasha-komanda')}
    />
  );
}