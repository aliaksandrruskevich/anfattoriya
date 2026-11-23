'use client';

import React from 'react';
import AgentCabinetPage from '@/components/AgentCabinetPage';
import { useApp } from '@/app/Providers';
import { useRouter } from 'next/navigation';

export default function Page() {
  const {
    agents, properties, articles, addLead,
    loggedInAgent, setLoggedInAgent, logout, isSyncing,
    leads, saveLeadsToStore, handleClearLeads,
    buyers, setBuyersList,
    sellers, setSellersList,
    tasks, setTasksList,
    setAgentsList, setPropertiesList, setArticlesList,
    syncWithRealt, loadCabinetData,
  } = useApp();
  const router = useRouter();
  const nav = (path: string) => router.push(path.startsWith('/') ? path : `/${path}`);

  return (
    <AgentCabinetPage
      loggedInAgent={loggedInAgent}
      setLoggedInAgent={setLoggedInAgent}
      onLogout={logout}
      agentsList={agents}
      setAgentsList={setAgentsList}
      propertiesList={properties}
      setPropertiesList={setPropertiesList}
      leads={leads}
      handleAddLead={addLead}
      saveLeadsToStore={saveLeadsToStore}
      handleClearLeads={handleClearLeads}
      buyersList={buyers}
      setBuyersList={setBuyersList}
      sellersList={sellers}
      setSellersList={setSellersList}
      tasksList={tasks}
      setTasksList={setTasksList}
      articlesList={articles}
      setArticlesList={setArticlesList}
      syncWithRealt={syncWithRealt}
      isSyncingRealt={isSyncing}
      navigateTo={nav}
      onSelectProperty={(p) => router.push(p ? `/object/${p.slug || p.id}` : '/catalog')}
      loadCabinetData={loadCabinetData}
    />
  );
}