import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import ChartView from './ChartView.jsx';

export default function Widget({ widget, onRemove, refreshKey }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(widget.error ?? null);
  const [loading, setLoading] = useState(true);
  const [showSql, setShowSql] = useState(false);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await api.query(widget.sql, 500));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [widget.sql]);

  useEffect(() => { run(); }, [run, refreshKey]);

  const isNumber = widget.chart?.type === 'number';
  return (
    <section className={`widget ${widget.width === 'full' ? 'full' : ''} ${isNumber ? 'is-number' : ''}`}>
      <header className="widget-head">
        <div>
          <h3>{widget.title}</h3>
          {widget.description && !isNumber && <p className="widget-desc">{widget.description}</p>}
        </div>
        <div className="widget-actions">
          <button className="icon-btn" title="Show SQL" onClick={() => setShowSql((s) => !s)}>SQL</button>
          <button className="icon-btn" title="Refresh" onClick={run}>↻</button>
          {onRemove && <button className="icon-btn danger" title="Remove widget" onClick={onRemove}>✕</button>}
        </div>
      </header>
      {showSql && <pre className="sql">{widget.sql}</pre>}
      <div className="widget-body">
        {loading && <div className="empty">Loading…</div>}
        {!loading && error && <div className="error">{error}</div>}
        {!loading && !error && <ChartView chart={widget.chart} result={result} height={isNumber ? 100 : 240} label={isNumber ? (widget.description || null) : undefined} />}
      </div>
    </section>
  );
}
