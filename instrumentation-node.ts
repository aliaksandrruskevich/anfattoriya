/**
 * Node.js-only instrumentation.
 * Загружается ТОЛЬКО когда NEXT_RUNTIME === 'nodejs'.
 * Здесь можно использовать любые Node.js API.
 */
export async function register() {
  const { syncRealtToDb } = await import('./src/lib/data-service');

  const ONE_HOUR_MS = 60 * 60 * 1000;
  const INITIAL_DELAY_MS = 5 * 1000;

  let stopped = false;
  let loopTimer: NodeJS.Timeout | null = null;

  async function runSync(label: string): Promise<void> {
    try {
      console.log(`[Instrumentation] 🔄 ${label}...`);
      const result = await syncRealtToDb();
      if (result.ok) {
        console.log(`[Instrumentation] ✅ ${label}: ${result.count} объектов`);
      } else {
        console.error(`[Instrumentation] ⚠️ ${label}: ${result.error || 'неизвестная ошибка'}`);
      }
    } catch (err: any) {
      console.error(`[Instrumentation] ❌ ${label}:`, err?.message || err);
    }
  }

  async function syncLoop(firstRunLabel: string): Promise<void> {
    await runSync(firstRunLabel);
    if (stopped) return;

    loopTimer = setTimeout(() => {
      if (stopped) return;
      void syncLoop('Плановый синк Realt.by');
    }, ONE_HOUR_MS);

    loopTimer.unref?.();
  }

  const initialTimer = setTimeout(() => {
    if (stopped) return;
    void syncLoop('Первый синк Realt.by');
  }, INITIAL_DELAY_MS);

  initialTimer.unref?.();

  const cleanup = () => {
    stopped = true;
    if (loopTimer) {
      clearTimeout(loopTimer);
      loopTimer = null;
    }
    clearTimeout(initialTimer);
    console.log('[Instrumentation] 🛑 Фоновый синк остановлен');
  };

  process.once('SIGTERM', cleanup);
  process.once('SIGINT', cleanup);

  console.log('[Instrumentation] ⚙️ Запущен фоновый синк Realt.by (раз в час)');
}