import pg from 'pg';
import { assertReadOnly, withRowLimit } from './sqlGuard.js';

const { Pool } = pg;

/**
 * Create a database handle. All queries run inside a READ ONLY transaction
 * with a statement timeout, so even if something slipped past the SQL guard
 * Postgres itself refuses to write.
 */
export function createDb(config = {}) {
  const pool = new Pool({
    host: config.host ?? process.env.PGHOST ?? '127.0.0.1',
    port: Number(config.port ?? process.env.PGPORT ?? 5432),
    user: config.user ?? process.env.PGUSER,
    password: config.password ?? process.env.PGPASSWORD ?? '',
    database: config.database ?? process.env.PGDATABASE,
    ssl: config.ssl ?? (process.env.PGSSL === 'require' ? { rejectUnauthorized: false } : false),
    max: Number(config.max ?? process.env.PG_POOL_MAX ?? 4),
    connectionTimeoutMillis: 10_000,
  });
  const timeoutMs = Number(config.statementTimeoutMs ?? process.env.PG_STATEMENT_TIMEOUT_MS ?? 20_000);

  async function readOnlyQuery(sql, { limit = 500 } = {}) {
    const clean = assertReadOnly(sql);
    const wrapped = withRowLimit(clean, limit);
    const client = await pool.connect();
    const started = Date.now();
    try {
      await client.query('BEGIN READ ONLY');
      await client.query(`SET LOCAL statement_timeout = ${Math.floor(timeoutMs)}`);
      const res = await client.query({ text: wrapped, rowMode: 'array' });
      await client.query('COMMIT');
      const columns = res.fields.map((f) => ({ name: f.name, typeId: f.dataTypeID }));
      const rows = res.rows.map((r) => r.map(normalizeValue));
      return {
        columns,
        rows,
        rowCount: rows.length,
        truncated: rows.length >= Math.min(limit, 5000),
        durationMs: Date.now() - started,
      };
    } catch (err) {
      try { await client.query('ROLLBACK'); } catch { /* ignore */ }
      throw err;
    } finally {
      client.release();
    }
  }

  /** Raw catalog query used only for schema introspection (no user input). */
  async function catalogQuery(text, params = []) {
    const res = await pool.query(text, params);
    return res.rows;
  }

  async function ping() {
    const rows = await catalogQuery('SELECT current_database() AS db, version() AS version');
    return rows[0];
  }

  return { readOnlyQuery, catalogQuery, ping, end: () => pool.end() };
}

function normalizeValue(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'bigint') return Number(v);
  if (v instanceof Date) return v.toISOString();
  if (Buffer.isBuffer(v)) return `\\x${v.toString('hex')}`;
  if (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v) && v.length < 16) {
    // numeric/bigint columns come back as strings from node-postgres
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return v;
}
