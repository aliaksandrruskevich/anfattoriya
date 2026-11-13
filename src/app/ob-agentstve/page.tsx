'use client';

import AboutPage from '@/components/AboutPage';
import { useApp } from '@/app/Providers';
import { useRouter } from 'next/navigation';
import { getAgentUrl } from '@/lib/routes';

export default function Page() {
  const { addLead, agents } = useApp();
  const router = useRouter();

  return (
    <AboutPage 
      activePage="ob-agentstve" 
      navigateTo={(path) => router.push(path.startsWith('/') ? path : `/${path}`)} 
      handleAddLead={addLead}
      agentsList={agents}
      onViewProfile={(agent) => router.push(getAgentUrl(agent))}
    />
  );
}