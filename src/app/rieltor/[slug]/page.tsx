import { notFound } from 'next/navigation';
import { getRealtData } from '@/lib/data-service';
import { resolveAgentFromSlug } from '@/lib/routes';
import AgentProfilePageWrapper from './AgentProfilePageWrapper';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RieltorPage({ params }: PageProps) {
  const { slug } = await params;
  console.log('[RieltorPage] slug:', slug);

  try {
    const { properties, agents } = await getRealtData();
    console.log('[RieltorPage] agents count:', agents.length);

    const agent = resolveAgentFromSlug(slug, agents);
    console.log('[RieltorPage] found agent:', agent?.name || 'NOT FOUND');

    if (!agent) {
      notFound();
    }

    return (
      <AgentProfilePageWrapper
        agent={agent}
        propertiesList={properties}
      />
    );
  } catch (e) {
    console.error('[RieltorPage] Error:', e);
    notFound();
  }
}