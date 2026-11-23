import mysql from 'mysql2/promise';

/**
 * Пул соединений MySQL через mysql2.
 *
 * Заменяет Prisma Client. Работает в одном процессе Node.js,
 * не форкает Rust-движков, совместим с shared-хостингом (CloudLinux LVE).
 *
 * Все запросы — параметризованные (защита от SQL-инъекций):
 *   const [rows] = await db.query('SELECT * FROM agents WHERE status = ?', ['active']);
 *   const [result] = await db.execute('INSERT INTO agents (id, name) VALUES (?, ?)', [id, name]);
 */
const globalForDb = globalThis as unknown as {
  dbPool: mysql.Pool | undefined;
  isMockMode?: boolean;
};

const mockConnection = {
  query: async () => [[], []] as any,
  execute: async () => [{ affectedRows: 0, insertId: 0 }, []] as any,
  beginTransaction: async () => {},
  commit: async () => {},
  rollback: async () => {},
  release: () => {},
} as unknown as mysql.PoolConnection;

const mockPool = {
  query: async () => [[], []] as any,
  execute: async () => [{ affectedRows: 0, insertId: 0 }, []] as any,
  getConnection: async () => mockConnection,
} as unknown as mysql.Pool;

const PLACEHOLDER_TOKENS = new Set([
  'user',
  'username',
  'db_user',
  'pass',
  'password',
  'db_password',
  'host',
  'db_host',
  'db_name',
  'database',
  'dbname',
]);

function isPlaceholderPart(value: string): boolean {
  const lower = value.trim().toLowerCase();
  return !lower || PLACEHOLDER_TOKENS.has(lower) || /^<.*>$/.test(lower);
}

function isValidConfiguredDbUrl(url: string): {
  valid: boolean;
  user?: string;
  password?: string;
  host?: string;
  port?: number;
  database?: string;
} {
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  if (!match) return { valid: false };
  const [, user, password, host, portStr, database] = match;
  if (
    isPlaceholderPart(user) ||
    isPlaceholderPart(password) ||
    isPlaceholderPart(host) ||
    isPlaceholderPart(database)
  ) {
    return { valid: false };
  }
  return {
    valid: true,
    user,
    password,
    host,
    port: parseInt(portStr, 10),
    database,
  };
}

function isDbConnectionError(err: any): boolean {
  const code = String(err?.code || '');
  return (
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'ETIMEDOUT' ||
    code === 'EHOSTUNREACH' ||
    code === 'ER_ACCESS_DENIED_ERROR' ||
    code === 'ER_BAD_DB_ERROR' ||
    code === 'PROTOCOL_CONNECTION_LOST'
  );
}

function createPool(): mysql.Pool {
  const url = process.env.DATABASE_URL || '';
  const parsed = isValidConfiguredDbUrl(url);
  if (!parsed.valid) {
    console.warn('[AI Studio] DB not connected — mock active (DATABASE_URL not configured or placeholder)');
    globalForDb.isMockMode = true;
    return mockPool;
  }

  try {
    globalForDb.isMockMode = false;
    const pool = mysql.createPool({
      host: parsed.host,
      port: parsed.port,
      user: parsed.user,
      password: parsed.password,
      database: parsed.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
      timezone: 'Z',
      // SSL отключён — MySQL на shared-хостинге работает через TCP без SSL.
      ssl: undefined,
      // Не падать при потере соединения — переподключаться автоматически.
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      connectTimeout: 3000,
    });
    pool.query('SELECT 1').catch((probeErr) => {
      if (isDbConnectionError(probeErr)) {
        console.warn('[AI Studio] MySQL probe failed — switching to mock mode:', probeErr?.code || probeErr?.message);
        globalForDb.isMockMode = true;
      }
    });
    return pool;
  } catch (err) {
    console.warn('[AI Studio] DB not connected — mock active:', err);
    globalForDb.isMockMode = true;
    return mockPool;
  }
}

export const db = globalForDb.dbPool ?? createPool();

export function isDbMockMode(): boolean {
  if (globalForDb.isMockMode !== undefined) return globalForDb.isMockMode;
  const parsed = isValidConfiguredDbUrl(process.env.DATABASE_URL || '');
  globalForDb.isMockMode = !parsed.valid;
  return globalForDb.isMockMode;
}

if (process.env.NODE_ENV !== 'production') {
  globalForDb.dbPool = db;
}

/**
 * Хелпер для SELECT-запросов.
 * Возвращает массив строк.
 */
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  if (isDbMockMode()) return [];
  try {
    const [rows] = await db.query(sql, params);
    return rows as T[];
  } catch (err: any) {
    if (isDbConnectionError(err)) {
      globalForDb.isMockMode = true;
    }
    console.warn('[AI Studio] DB query failed — returning empty array:', err?.message || err);
    return [];
  }
}

/**
 * Хелпер для SELECT одного ряда.
 * Возвращает первую строку или null.
 */
export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Хелпер для INSERT/UPDATE/DELETE.
 * Возвращает result (insertId, affectedRows и т.д.).
 */
export async function execute(sql: string, params?: any[]): Promise<mysql.ResultSetHeader> {
  if (isDbMockMode()) {
    return {
      affectedRows: 0,
      insertId: 0,
      fieldCount: 0,
      info: '',
      serverStatus: 0,
      warningStatus: 0,
      changedRows: 0,
    } as mysql.ResultSetHeader;
  }
  try {
    const [result] = await db.execute(sql, params);
    return result as mysql.ResultSetHeader;
  } catch (err: any) {
    if (isDbConnectionError(err)) {
      globalForDb.isMockMode = true;
    }
    console.warn('[AI Studio] DB execute failed — returning mock result:', err?.message || err);
    return {
      affectedRows: 0,
      insertId: 0,
      fieldCount: 0,
      info: '',
      serverStatus: 0,
      warningStatus: 0,
      changedRows: 0,
    } as mysql.ResultSetHeader;
  }
}

/**
 * Транзакция — выполняет набор операций атомарно.
 */
export async function transaction<T>(
  fn: (conn: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  if (isDbMockMode()) {
    return await fn(mockConnection);
  }
  let conn: mysql.PoolConnection;
  try {
    conn = await db.getConnection();
  } catch (err: any) {
    if (isDbConnectionError(err)) {
      globalForDb.isMockMode = true;
    }
    console.warn('[AI Studio] DB transaction connection failed — using mock:', err?.message || err);
    return await fn(mockConnection);
  }
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally {
    conn.release();
  }
}