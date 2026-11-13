import type { Agent } from '../types';

/**
 * Сопоставляет имя риэлтера из фида Realt.by с сотрудником из БД.
 * Возвращает найденного Agent или null.
 *
 * Нормализация: lowercase, trim, схлопывание пробелов, убирание точек.
 * Сравниваем и полное имя, и firstName + lastName.
 */
export function matchAgentByName(
  nameFromRealt: string | undefined | null,
  agents: Agent[]
): Agent | null {
  if (!nameFromRealt || !agents.length) return null;

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/\./g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const target = normalize(nameFromRealt);
  if (!target) return null;

  // 1. Пробуем точное совпадение по полному имени
  for (const agent of agents) {
    if (normalize(agent.name) === target) return agent;
  }

  // 2. Пробуем совпадение по firstName + lastName
  for (const agent of agents) {
    if (agent.firstName && agent.lastName) {
      const full = normalize(`${agent.firstName} ${agent.lastName}`);
      if (full === target) return agent;
      const reverse = normalize(`${agent.lastName} ${agent.firstName}`);
      if (reverse === target) return agent;
    }
  }

  // 3. Пробуем совпадение только по фамилии (lastName)
  //    Используется, если в фиде только фамилия или имя+фамилия не совпадают
  const targetParts = target.split(' ').filter(Boolean);
  if (targetParts.length === 1) {
    for (const agent of agents) {
      if (agent.lastName && normalize(agent.lastName) === targetParts[0]) {
        return agent;
      }
    }
  }

  // 4. Мягкое совпадение: фамилия из фида содержится в фамилии агента
  //    (например, "Климович" в "Климович Дмитрий")
  for (const agent of agents) {
    if (agent.lastName) {
      const agentLast = normalize(agent.lastName);
      const agentFirst = normalize(agent.firstName || '');
      if (
        targetParts.some((part) => part === agentLast) &&
        (targetParts.includes(agentFirst) || targetParts.length === 1)
      ) {
        return agent;
      }
    }
  }

  return null;
}