'use client';

import React from 'react';
import ReviewsPage from '@/components/ReviewsPage';
import { useApp } from '@/app/Providers';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { reviews, addLead } = useApp();
  const router = useRouter();
  const nav = (path: string) => router.push(path.startsWith('/') ? path : `/${path}`);

  return (
    <ReviewsPage 
      activePage="otzyvy-klientov" 
      navigateTo={nav} 
      handleAddLead={addLead} 
      clientsReviews={reviews} 
      onAddReview={() => {}} 
    />
  );
}
