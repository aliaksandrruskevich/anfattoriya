'use client';

import React from 'react';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  
  return (
    <PrivacyPolicyModal 
      isFullPage={true} 
      initialTab="privacy"
      navigateTo={(path) => router.push(path.startsWith('/') ? path : `/${path}`)}
    />
  );
}
