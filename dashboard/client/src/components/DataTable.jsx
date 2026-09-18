import React from 'react';
import { fmtCell } from '../format.js';

export default function DataTable({ result, maxRows = 200 }) {
  if (!result) return null;
  if (result.rows.length === 0) return <div className="empty">No rows returned.</div>;
  const rows = result.rows.slice(0, maxRows);
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{result.columns.map((c) => <th key={c.name}>{c.name}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((v, j) => <td key={j} className={typeof v === 'number' ? 'num' : ''}>{fmtCell(v)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {(result.rows.length > maxRows || result.truncated) && (
        <div className="table-note">Showing {rows.length} of {result.truncated ? `${result.rowCount}+` : result.rowCount} rows</div>
      )}
    </div>
  );
}
