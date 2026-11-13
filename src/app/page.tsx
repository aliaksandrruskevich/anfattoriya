'use client';

import { useState } from 'react';
import HomePage from '@/components/HomePage';
import { useApp } from './Providers';
import { useRouter } from 'next/navigation';
import { getAgentUrl } from '@/lib/routes';

export default function Home() {
  const { agents, properties, reviews, articles, addLead, favorites, toggleFavorite } = useApp();
  const router = useRouter();

  // Состояние фильтров каталога на главной
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [catalogSelectedType, setCatalogSelectedType] = useState<'all' | 'apartment' | 'commercial' | 'house' | 'plot'>('all');
  const [catalogMaxPrice, setCatalogMaxPrice] = useState(0);

  const navigateTo = (path: string) => {
    router.push(path.startsWith('/') ? path : `/${path}`);
  };

  // Публичные объекты: только опубликованные, не закрытые, не архивные
  const publicProperties = properties.filter(
    (p) =>
      p.isPublished !== false &&
      !p.isClosedBase &&
      p.status !== 'archived' &&
      p.status !== 'archive'
  );

  return (
    <HomePage
      navigateTo={navigateTo}
      handleAddLead={addLead}
      agentsList={agents}
      propertiesList={publicProperties}
      favorites={favorites}
      toggleFavorite={toggleFavorite}
      currency="BYN"
      clientsReviews={reviews}
      articlesList={articles}
      onViewProfile={(agent) => router.push(getAgentUrl(agent))}
      onSelectArticle={(article) => router.push(`/${article.slug || article.id}`)}
      catalogSearchQuery={catalogSearchQuery}
      setCatalogSearchQuery={setCatalogSearchQuery}
      catalogSelectedType={catalogSelectedType}
      setCatalogSelectedType={setCatalogSelectedType}
      catalogMaxPrice={catalogMaxPrice}
      setCatalogMaxPrice={setCatalogMaxPrice}
    />
  );
}