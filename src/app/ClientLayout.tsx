'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PrivacyBanner from '@/components/PrivacyBanner';
import TimedLeadModal from '@/components/TimedLeadModal';
import { AppProvider, useApp } from './Providers';

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { favorites, toggleFavorite, leads, addLead } = useApp();

  return (
    <div className="relative min-h-screen bg-white flex flex-col justify-between selection:bg-purple-600 selection:text-white antialiased font-sans w-full">
      <Navigation 
        favorites={favorites} 
        toggleFavorite={toggleFavorite} 
        currency="BYN"
        leadsCount={leads.length}
      />
      
      <main className="flex-1 w-full flex flex-col min-h-[50vh]">
        {children}
      </main>
      
      <Footer handleAddLead={addLead} />

      <TimedLeadModal onAddLead={addLead} />

      <PrivacyBanner onOpenPrivacyPolicy={() => {}} />
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <LayoutInner>{children}</LayoutInner>
    </AppProvider>
  );
}