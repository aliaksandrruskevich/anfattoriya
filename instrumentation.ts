export async function register() {
  console.log('[Instrumentation] NEXT_RUNTIME =', process.env.NEXT_RUNTIME);
  console.log('[Instrumentation] register() вызван');

  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    console.log('[Instrumentation] Пропускаю — не nodejs runtime');
    return;
  }

  try {
    console.log('[Instrumentation] Загружаю instrumentation-node...');
    const mod = await import('./instrumentation-node');
    console.log('[Instrumentation] ✅ Модуль загружен, вызываю register()...');
    await mod.register();
    console.log('[Instrumentation] ✅ register() из instrumentation-node завершён');
  } catch (err: any) {
    console.error('[Instrumentation] ❌ Ошибка:', err?.message || err);
    console.error('[Instrumentation] Stack:', err?.stack);
  }
}