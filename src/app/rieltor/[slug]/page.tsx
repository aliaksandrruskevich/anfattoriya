import { notFound } from 'next/navigation';
import { getRealtData } from '@/lib/data-service';
import { resolveAgentFromSlug } from '@/lib/routes';
import { isRealtorAgent, isSamePersonName } from '@/lib/agentUtils';
import AgentProfilePageWrapper from './AgentProfilePageWrapper';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RieltorPage({ params }: PageProps) {
  const { slug } = await params;

  try {
    const { properties, agents } = await getRealtData();
    const realtors = agents.filter(isRealtorAgent);
    const agent = resolveAgentFromSlug(slug, realtors);

    if (!agent || !isRealtorAgent(agent)) {
      notFound();
    }

    const agentIdNorm = (agent.id || '').trim().toLowerCase();
    const agentProperties = properties.filter((p) => {
      const propAgentId = p.assignedAgentId ? String(p.assignedAgentId).trim().toLowerCase() : '';
      if (propAgentId && agentIdNorm) {
        return propAgentId === agentIdNorm;
      }
      if (p.assignedAgentName && agent.name && isSamePersonName(p.assignedAgentName, agent.name)) {
        return true;
      }
      if (p.agentName && agent.name && isSamePersonName(p.agentName, agent.name)) {
        return true;
      }
      return false;
    });

    return (
      <AgentProfilePageWrapper
        agent={agent}
        propertiesList={agentProperties}
      />
    );
  } catch (e) {
    console.error('[RieltorPage] Error:', e);
    notFound();
  }
}