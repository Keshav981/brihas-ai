/** Turn {columns, rows} into an array of objects keyed by column name. */
export function toObjects(result) {
  if (!result) return [];
  const names = result.columns.map((c) => c.name);
  return result.rows.map((r) => Object.fromEntries(names.map((n, i) => [n, r[i]])));
}

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const full = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

export function fmtNumber(v, { compactAbove = 100000 } = {}) {
  if (v === null || v === undefined || v === '') return '—';
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return String(v);
  return Math.abs(n) >= compactAbove ? compact.format(n) : full.format(n);
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;

export function fmtLabel(v) {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'string' && ISO_DATE.test(v)) {
    return v.includes('T') && !v.endsWith('T00:00:00.000Z') ? v.slice(0, 16).replace('T', ' ') : v.slice(0, 10);
  }
  if (typeof v === 'number') return fmtNumber(v);
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

export function fmtCell(v) {
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return fmtLabel(v);
}
