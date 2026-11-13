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
};

function createPool(): mysql.Pool {
  const url = process.env.DATABASE_URL || '';
  // Формат: mysql://user:password@host:port/database
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  if (!match) {
    throw new Error(
      `DATABASE_URL is not valid. Expected format: mysql://user:pass@host:port/database. Got: ${url}`
    );
  }
  const [, user, password, host, port, database] = match;

  return mysql.createPool({
    host,
    port: parseInt(port, 10),
    user,
    password,
    database,
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
  });
}

export const db = globalForDb.dbPool ?? createPool();

if (process.env.NODE_ENV !== 'production') {
  globalForDb.dbPool = db;
}

/**
 * Хелпер для SELECT-запросов.
 * Возвращает массив строк.
 */
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const [rows] = await db.query(sql, params);
  return rows as T[];
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
  const [result] = await db.execute(sql, params);
  return result as mysql.ResultSetHeader;
}

/**
 * Транзакция — выполняет набор операций атомарно.
 */
export async function transaction<T>(
  fn: (conn: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}