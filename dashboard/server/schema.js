// Introspects the connected database and renders a compact schema description
// that is handed to the model as context. Cached for a few minutes because
// schemas rarely change and the catalog queries are not free.

const CACHE_TTL_MS = 5 * 60 * 1000;

export function createSchemaService(db) {
  let cache = null;
  let cachedAt = 0;

  async function load({ force = false } = {}) {
    if (!force && cache && Date.now() - cachedAt < CACHE_TTL_MS) return cache;

    const columns = await db.catalogQuery(`
      SELECT c.table_schema, c.table_name, c.column_name, c.data_type,
             c.is_nullable = 'YES' AS nullable, c.ordinal_position,
             pgd.description AS column_comment
      FROM information_schema.columns c
      LEFT JOIN pg_catalog.pg_class pc
        ON pc.relname = c.table_name
       AND pc.relnamespace = (SELECT oid FROM pg_catalog.pg_namespace WHERE nspname = c.table_schema)
      LEFT JOIN pg_catalog.pg_description pgd
        ON pgd.objoid = pc.oid AND pgd.objsubid = c.ordinal_position
      WHERE c.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY c.table_schema, c.table_name, c.ordinal_position
    `);

    const tables = await db.catalogQuery(`
      SELECT n.nspname AS table_schema, c.relname AS table_name,
             CASE c.relkind WHEN 'v' THEN 'view' WHEN 'm' THEN 'materialized view' ELSE 'table' END AS kind,
             GREATEST(c.reltuples, COALESCE(s.n_live_tup, 0), 0)::bigint AS approx_rows,
             obj_description(c.oid, 'pg_class') AS table_comment
      FROM pg_catalog.pg_class c
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      LEFT JOIN pg_catalog.pg_stat_user_tables s ON s.relid = c.oid
      WHERE c.relkind IN ('r', 'v', 'm', 'p')
        AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY 1, 2
    `);

    const keys = await db.catalogQuery(`
      SELECT tc.table_schema, tc.table_name, kcu.column_name, tc.constraint_type,
             ccu.table_schema AS ref_schema, ccu.table_name AS ref_table, ccu.column_name AS ref_column
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema
      LEFT JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name AND tc.constraint_type = 'FOREIGN KEY'
      WHERE tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY')
        AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
    `);

    const byTable = new Map();
    for (const t of tables) {
      byTable.set(`${t.table_schema}.${t.table_name}`, {
        schema: t.table_schema,
        name: t.table_name,
        kind: t.kind,
        approxRows: Number(t.approx_rows) || 0,
        comment: t.table_comment || null,
        columns: [],
      });
    }
    for (const c of columns) {
      const t = byTable.get(`${c.table_schema}.${c.table_name}`);
      if (!t) continue;
      t.columns.push({
        name: c.column_name,
        type: c.data_type,
        nullable: c.nullable,
        comment: c.column_comment || null,
        pk: false,
        fk: null,
      });
    }
    for (const k of keys) {
      const t = byTable.get(`${k.table_schema}.${k.table_name}`);
      const col = t?.columns.find((c) => c.name === k.column_name);
      if (!col) continue;
      if (k.constraint_type === 'PRIMARY KEY') col.pk = true;
      else col.fk = `${k.ref_schema}.${k.ref_table}.${k.ref_column}`;
    }

    cache = { loadedAt: new Date().toISOString(), tables: [...byTable.values()] };
    cachedAt = Date.now();
    return cache;
  }

  /** Compact text rendering for the model's system prompt. */
  async function describeForModel() {
    const { tables } = await load();
    if (tables.length === 0) return '(The database has no user tables.)';
    return tables
      .map((t) => {
        const qualified = t.schema === 'public' ? t.name : `${t.schema}.${t.name}`;
        const head = `${t.kind} ${qualified} (~${t.approxRows.toLocaleString('en-US')} rows)${t.comment ? ` -- ${t.comment}` : ''}`;
        const cols = t.columns.map((c) => {
          const tags = [];
          if (c.pk) tags.push('PK');
          if (c.fk) tags.push(`FK -> ${c.fk.replace(/^public\./, '')}`);
          if (!c.nullable) tags.push('not null');
          return `  ${c.name} ${c.type}${tags.length ? ` [${tags.join(', ')}]` : ''}${c.comment ? ` -- ${c.comment}` : ''}`;
        });
        return [head, ...cols].join('\n');
      })
      .join('\n\n');
  }

  return { load, describeForModel };
}
