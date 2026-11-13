'use client';

import ContactsPage from '@/components/ContactsPage';
import { useApp } from '../Providers';
import { useRouter } from 'next/navigation';

export default function Kontakty() {
  const { addLead } = useApp();
  const router = useRouter();

  return (
    <ContactsPage 
      activePage="kontakty"
      navigateTo={(path) => router.push(path.startsWith('/') ? path : `/${path}`)}
      handleAddLead={addLead}
    />
  );
}
