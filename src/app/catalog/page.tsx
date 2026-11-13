'use client';

import CatalogPage from '@/components/CatalogPage';
import { useApp } from '../Providers';
import { useRouter } from 'next/navigation';
import { getAgentUrl } from '@/lib/routes';

export default function Catalog() {
  const { agents, properties, addLead, favorites, toggleFavorite } = useApp();
  const router = useRouter();

  // Показываем только активные объекты: опубликованные, не закрытые, не архивные.
  const publicProperties = properties.filter(
    (p) =>
      p.isPublished !== false &&
      !p.isClosedBase &&
      p.status !== 'archived' &&
      p.status !== 'archive'
  );

  return (
    <CatalogPage
      activePage="catalog"
      navigateTo={(path) => router.push(path.startsWith('/') ? path : `/${path}`)}
      handleAddLead={addLead}
      favorites={favorites}
      toggleFavorite={toggleFavorite}
      comparisonIds={[]}
      toggleComparison={() => {}}
      properties={publicProperties}
      selectedProperty={null}
      onSelectProperty={(p) => router.push(p ? `/object/${p.slug || p.id}` : '/catalog')}
      onViewProfile={(agent) => router.push(getAgentUrl(agent))}
      agentsList={agents}
    />
  );
}