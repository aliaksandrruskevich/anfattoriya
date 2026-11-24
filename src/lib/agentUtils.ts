import type { Agent } from '../types';

/**
 * Определяет, является ли сотрудник действующим риэлтером/экспертом для публичных
 * разделов сайта («Наша команда», «Выбрать агента», главная, /rieltor/[slug])
 * и назначения риэлтеров на объекты/заявки.
 *
 * Исключает администраторов, операторов колл-центра, неодобренных и уволенных сотрудников.
 */
export function isRealtorAgent(agent: Agent | null | undefined): boolean {
  if (!agent || !agent.name) return false;
  if (agent.isDismissed || agent.status === 'dismissed') return false;
  if (agent.isApproved === false) return false;
  if (agent.isAdmin) return false;

  const idLower = String(agent.id || '').trim().toLowerCase();
  if (idLower === 'admin' || idLower === 'callcenter' || idLower === 'call-center') {
    return false;
  }

  const emailLower = String(agent.email || '').trim().toLowerCase();
  if (emailLower === 'anfattoriya@gmail.com' || emailLower === 'callcenter@fattoria.by') {
    return false;
  }

  const roleLower = String(agent.role || '').toLowerCase();
  const nameLower = String(agent.name || '').toLowerCase();

  if (
    roleLower.includes('администратор') ||
    /\badmin\b/i.test(roleLower) ||
    roleLower.includes('колл-центр') ||
    roleLower.includes('колл центр') ||
    roleLower.includes('call-center') ||
    roleLower.includes('call center') ||
    roleLower.includes('оператор колл') ||
    nameLower.includes('администратор') ||
    nameLower.includes('колл-центр')
  ) {
    return false;
  }

  return true;
}

/**
 * Нормализует строку ФИО/имени для сравнения:
 * lowercase, ё → е, убираем знаки препинания, схлопываем пробелы.
 */
export function normalizePersonName(value: string | null | undefined): string {
  if (!value) return '';
  return String(value)
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[.,()"'«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractNameTokens(value: string | null | undefined): string[] {
  return normalizePersonName(value)
    .split(' ')
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

/**
 * Строго сравнивает имена двух людей («Федорчук Светлана» vs «Светлана Федорчук» -> true,
 * «Федорчук Светлана» vs «Федорчук Антон» -> false,
 * «Федорчук» vs «Федорчук Светлана» -> false, чтобы однофамильцы никогда не объединялись).
 */
export function isSamePersonName(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  const aNorm = normalizePersonName(a);
  const bNorm = normalizePersonName(b);
  if (!aNorm || !bNorm) return false;
  if (aNorm === bNorm) return true;

  const aTokens = extractNameTokens(aNorm);
  const bTokens = extractNameTokens(bNorm);
  if (aTokens.length === 0 || bTokens.length === 0) return false;

  // Если хотя бы у одного указано только одно слово (например, только фамилия «Федорчук»),
  // а у другого 2+ слов («Федорчук Светлана») — НЕ считаем их одним человеком,
  // чтобы избежать объединения однофамильцев!
  if (aTokens.length < 2 || bTokens.length < 2) {
    return aTokens.length === 1 && bTokens.length === 1 && aTokens[0] === bTokens[0];
  }

  // Сравниваем ключевые 2 слова (Имя + Фамилия в любом порядке).
  // Если у одного из них есть отчество (3 слова), сравниваем пары первых/последних слов.
  const bSet = new Set(bTokens);
  let matchedCount = 0;
  for (const token of aTokens) {
    if (bSet.has(token)) matchedCount++;
  }

  const requiredMatches = Math.min(2, aTokens.length, bTokens.length);
  return matchedCount >= requiredMatches;
}
