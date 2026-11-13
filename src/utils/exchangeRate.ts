let currentUsdRate = 3.27;
let isFetched = false;
let isFetching = false;
const listeners: Set<(rate: number) => void> = new Set();

export async function fetchNbrbRate(): Promise<number> {
  // На сервере (SSR) не дёргаем — относительный URL там невалиден.
  // Курс нужен только в браузере, поэтому просто возвращаем дефолт.
  if (typeof window === 'undefined') return currentUsdRate;

  if (isFetching || isFetched) return currentUsdRate;
  isFetching = true;
  try {
    const res = await fetch('/api/nbrb-rate');
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.rate === 'number' && data.rate > 0) {
        currentUsdRate = data.rate;
        isFetched = true;
        listeners.forEach(cb => cb(currentUsdRate));
      }
    }
  } catch (err) {
    console.warn("Using default rate due to NBRB fetch error:", err);
  } finally {
    isFetching = false;
  }
  return currentUsdRate;
}

export function getNbrbRate(): number {
  if (!isFetched && !isFetching) {
    fetchNbrbRate();
  }
  return currentUsdRate;
}

export function subscribeUsdRate(callback: (rate: number) => void) {
  listeners.add(callback);
  callback(currentUsdRate);
  return () => {
    listeners.delete(callback);
  };
}

export function convertUsdToByn(usd: number, customRate?: number): number {
  const rate = customRate || currentUsdRate;
  return Math.round((usd || 0) * rate);
}

export function convertBynToUsd(byn: number, customRate?: number): number {
  const rate = customRate || currentUsdRate;
  return Math.round((byn || 0) / rate);
}