// Read-only SQL guard.
//
// Every query the model writes (and every widget query a dashboard stores)
// passes through here before it touches Postgres. The database session is
// also opened READ ONLY with a statement timeout, so this guard is the first
// of two layers, not the only one.

const FORBIDDEN = [
  'insert', 'update', 'delete', 'merge', 'drop', 'alter', 'create', 'truncate',
  'grant', 'revoke', 'copy', 'vacuum', 'analyze', 'call', 'do', 'execute',
  'lock', 'refresh', 'reindex', 'cluster', 'comment', 'security', 'set',
  'reset', 'listen', 'notify', 'unlisten', 'prepare', 'deallocate', 'discard',
  'load', 'import', 'pg_sleep', 'pg_read_file', 'pg_read_binary_file',
  'pg_ls_dir', 'lo_import', 'lo_export', 'dblink', 'pg_terminate_backend',
  'pg_cancel_backend',
];
const FORBIDDEN_RE = new RegExp(`\\b(${FORBIDDEN.join('|')})\\b`, 'i');

/** Remove SQL comments and string literal contents so keyword checks
 *  only see real SQL tokens. */
function stripNoise(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, ' ')       // block comments
    .replace(/--[^\n]*/g, ' ')               // line comments
    .replace(/\$([A-Za-z_]*)\$[\s\S]*?\$\1\$/g, "''") // dollar-quoted strings
    .replace(/'(?:[^']|'')*'/g, "''");       // single-quoted strings
}

/**
 * Validate that `sql` is a single read-only statement.
 * Returns the cleaned statement (no trailing semicolon) or throws.
 */
export function assertReadOnly(sql) {
  if (typeof sql !== 'string' || !sql.trim()) {
    throw reject('Empty SQL statement.');
  }
  const cleaned = stripNoise(sql).trim().replace(/;+\s*$/, '');
  if (cleaned.includes(';')) {
    throw reject('Only a single SQL statement is allowed.');
  }
  if (!/^\s*(select|with)\b/i.test(cleaned)) {
    throw reject('Only SELECT queries are allowed.');
  }
  const hit = cleaned.match(FORBIDDEN_RE);
  if (hit) {
    throw reject(`Query contains a disallowed keyword: ${hit[1].toUpperCase()}.`);
  }
  // Return the original text (minus comments/trailing semicolon) so string
  // literals the query relies on are preserved.
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--[^\n]*/g, ' ')
    .trim()
    .replace(/;+\s*$/, '');
}

function reject(message) {
  const err = new Error(message);
  err.status = 400; // a rejected query is a client error, not a server crash
  return err;
}

/** Wrap a validated statement so it can never return more than `limit` rows. */
export function withRowLimit(sql, limit) {
  const n = Math.max(1, Math.min(Number(limit) || 500, 5000));
  return `SELECT * FROM (\n${sql}\n) AS __q LIMIT ${n}`;
}
