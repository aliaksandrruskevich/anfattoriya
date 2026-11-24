import type { Agent } from '../types';
import {
  extractNameTokens,
  isRealtorAgent,
  isSamePersonName,
  normalizePersonName,
} from './agentUtils';

/**
 * Сопоставляет имя риэлтера из фида Realt.by с действующим риэлтером из БД.
 * Никогда не объединяет однофамильцев (например, «Федорчук Светлана» и «Федорчук Антон»)
 * и исключает администраторов / колл-центр.
 */
export function matchAgentByName(
  nameFromRealt: string | undefined | null,
  agents: Agent[]
): Agent | null {
  if (!nameFromRealt || !agents.length) return null;

  const target = normalizePersonName(nameFromRealt);
  if (!target) return null;

  // Работаем только с действующими риэлтерами (без админов, колл-центра и уволенных)
  const pool = agents.filter(isRealtorAgent);
  const candidates = pool.length > 0 ? pool : agents.filter((a) => !a.isAdmin && a.id !== 'admin');
  if (!candidates.length) return null;

  // 1. Точное нормализованное совпадение по полному имени
  for (const agent of candidates) {
    if (normalizePersonName(agent.name) === target) return agent;
  }

  // 2. Совпадение по firstName + lastName (в любом порядке)
  for (const agent of candidates) {
    if (agent.firstName && agent.lastName) {
      const full = normalizePersonName(`${agent.firstName} ${agent.lastName}`);
      const reverse = normalizePersonName(`${agent.lastName} ${agent.firstName}`);
      if (full === target || reverse === target) return agent;
    }
  }

  // 3. Токенное сравнение полного имени (Фамилия + Имя в любом порядке, включая отчество)
  for (const agent of candidates) {
    if (isSamePersonName(target, agent.name)) return agent;
    if (agent.firstName && agent.lastName) {
      if (isSamePersonName(target, `${agent.lastName} ${agent.firstName}`)) return agent;
    }
  }

  // 4. Совпадение по фамилии и инициалам (например, "Федорчук С." vs "Федорчук Светлана")
  const rawParts = target.split(' ').filter(Boolean);
  if (rawParts.length >= 2) {
    const initialMatches = candidates.filter((agent) => {
      const tokens = extractNameTokens(agent.name);
      const last = normalizePersonName(agent.lastName || tokens[0] || '');
      const first = normalizePersonName(agent.firstName || tokens[1] || '');
      if (!last || !first) return false;
      const hasLast = rawParts.includes(last);
      const otherTokens = rawParts.filter((p) => p !== last);
      const matchesInitial = otherTokens.some(
        (p) => p === first || (p.length === 1 && first.startsWith(p))
      );
      return hasLast && matchesInitial;
    });
    if (initialMatches.length === 1) {
      return initialMatches[0];
    }
  }

  // 5. Если в фиде указана ТОЛЬКО одна фамилия (1 слово),
  //    привязываем ТОЛЬКО если в штате ровно ОДИН риэлтер с такой фамилией!
  //    Если однофамильцев 2+ (как Федорчук Светлана и Федорчук Антон) — не угадываем.
  const targetTokens = extractNameTokens(target);
  if (targetTokens.length === 1) {
    const singleSurname = targetTokens[0];
    const surnameMatches = candidates.filter((agent) => {
      const agentLast = normalizePersonName(
        agent.lastName || extractNameTokens(agent.name)[0] || ''
      );
      return agentLast === singleSurname;
    });
    if (surnameMatches.length === 1) {
      return surnameMatches[0];
    }
  }

  return null;
}