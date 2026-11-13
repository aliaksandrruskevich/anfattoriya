'use client';

import React from 'react';
import OcenkaPage from '@/components/OcenkaPage';
import { useApp } from '@/app/Providers';

export default function Page() {
  const { addLead } = useApp();
  return <OcenkaPage activePage="ocenka-kvartiry" navigateTo={() => {}} handleAddLead={addLead} />;
}
