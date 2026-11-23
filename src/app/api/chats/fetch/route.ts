import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { requireCrmSession } from '@/lib/auth';
import { getKufarConfigStatus, getKufarCredentials } from '@/lib/kufarAuthConfig';

const execFileAsync = promisify(execFile);

// POST /api/chats/fetch — запуск разовой синхронизации чатов с Kufar по логину/паролю из .env
export async function POST() {
  const auth = await requireCrmSession();
  if (auth.errorResponse) return auth.errorResponse;

  const status = getKufarConfigStatus();
  const { login, password } = getKufarCredentials();

  if ((!login || !password) && !status.cookiesSaved) {
    return NextResponse.json(
      {
        ok: false,
        ...status,
        error: 'В файле .env не заданы KUFAR_LOGIN и KUFAR_PASSWORD.',
      },
      { status: 400 }
    );
  }

  const puppeteerDir = path.join(process.cwd(), 'node_modules', 'puppeteer');
  if (!fs.existsSync(puppeteerDir)) {
    return NextResponse.json({
      ok: false,
      needsWorker: true,
      ...status,
      message:
        'Логин и пароль Kufar из .env подключены. Для прямой загрузки диалогов из веб-панели установите puppeteer на сервере или запустите фоновый воркер: npx tsx scripts/kufar-parser.ts --watch',
    });
  }

  try {
    const scriptPath = path.join(process.cwd(), 'scripts', 'kufar-parser.ts');
    const tsxBin = path.join(process.cwd(), 'node_modules', '.bin', 'tsx');
    const cmd = fs.existsSync(tsxBin) ? tsxBin : 'npx';
    const args = fs.existsSync(tsxBin) ? [scriptPath] : ['tsx', scriptPath];

    const { stdout, stderr } = await execFileAsync(cmd, args, {
      cwd: process.cwd(),
      timeout: 55_000,
      env: {
        ...process.env,
        CRM_API_URL: `http://127.0.0.1:${process.env.PORT || 3000}`,
      },
    });

    return NextResponse.json({
      ok: true,
      ...getKufarConfigStatus(),
      output: (stdout || stderr || '').trim().split('\n').slice(-5).join('\n'),
      message: 'Синхронизация с Kufar выполнена успешно',
    });
  } catch (err: any) {
    const rawDetail = String(err?.stderr || err?.stdout || err?.message || '');
    const safeLine =
      rawDetail
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(-2)
        .join(' ') || 'Ошибка синхронизации с Kufar';

    return NextResponse.json(
      {
        ok: false,
        ...getKufarConfigStatus(),
        error: safeLine,
      },
      { status: 502 }
    );
  }
}
