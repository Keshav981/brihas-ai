import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function SchemaBrowser({ onAsk }) {
  const [schema, setSchema] = useState(null);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState({});
  const [filter, setFilter] = useState('');

  const load = (force) => (force ? api.refreshSchema() : api.schema()).then(setSchema).catch((e) => setError(e.message));
  useEffect(() => { load(false); }, []);

  if (error) return <div className="page"><div className="error">{error}</div></div>;
  if (!schema) return <div className="page"><div className="empty">Reading schema…</div></div>;

  const tables = schema.tables.filter((t) => !filter || `${t.schema}.${t.name}`.includes(filter.toLowerCase()) || t.columns.some((c) => c.name.includes(filter.toLowerCase())));
  return (
    <div className="page">
      <header className="row">
        <h2 className="section-title">Tables ({schema.tables.length})</h2>
        <div className="spacer" />
        <input className="search" placeholder="Filter tables or columns" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <button className="btn ghost" onClick={() => load(true)}>↻ Refresh</button>
      </header>
      <div className="schema">
        {tables.map((t) => {
          const key = `${t.schema}.${t.name}`;
          const label = t.schema === 'public' ? t.name : key;
          return (
            <div key={key} className="card table-card">
              <button className="table-head" onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}>
                <span className="kind">{t.kind}</span>
                <strong>{label}</strong>
                <span className="muted">~{t.approxRows.toLocaleString()} rows · {t.columns.length} columns</span>
                <span className="spacer" />
                <span className="link" onClick={(e) => { e.stopPropagation(); onAsk(`Give me an overview of the ${label} table: how many rows, and a summary of its most interesting columns.`); }}>Ask about it →</span>
              </button>
              {t.comment && <p className="muted">{t.comment}</p>}
              {open[key] && (
                <table className="cols">
                  <tbody>
                    {t.columns.map((c) => (
                      <tr key={c.name}>
                        <td><code>{c.name}</code></td>
                        <td className="muted">{c.type}</td>
                        <td className="muted">{c.pk ? 'primary key' : c.fk ? `→ ${c.fk.replace(/^public\./, '')}` : ''}{c.comment ? ` · ${c.comment}` : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
