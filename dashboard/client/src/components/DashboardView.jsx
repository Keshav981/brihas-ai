import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import Widget from './Widget.jsx';

export default function DashboardView({ id, onBack, onChanged }) {
  const [dash, setDash] = useState(null);
  const [error, setError] = useState(null);
  const [instruction, setInstruction] = useState('');
  const [busy, setBusy] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingTitle, setEditingTitle] = useState(false);

  useEffect(() => {
    setDash(null);
    api.dashboard(id).then(setDash).catch((e) => setError(e.message));
  }, [id]);

  const save = async (patch) => {
    const next = await api.updateDashboard(id, patch);
    setDash(next);
    onChanged?.();
  };

  const edit = async (e) => {
    e.preventDefault();
    if (!instruction.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const next = await api.editDashboard(id, instruction.trim());
      setDash(next);
      setInstruction('');
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete "${dash.title}"? This cannot be undone.`)) return;
    await api.deleteDashboard(id);
    onChanged?.();
    onBack();
  };

  if (error && !dash) return <div className="page"><div className="error">{error}</div></div>;
  if (!dash) return <div className="page"><div className="empty">Loading dashboard…</div></div>;

  return (
    <div className="page">
      <header className="dash-head">
        <button className="link" onClick={onBack}>← All dashboards</button>
        <div className="dash-title">
          {editingTitle ? (
            <input
              autoFocus
              defaultValue={dash.title}
              onBlur={(e) => { setEditingTitle(false); if (e.target.value.trim() && e.target.value !== dash.title) save({ title: e.target.value.trim() }); }}
              onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditingTitle(false); }}
            />
          ) : (
            <h1 onClick={() => setEditingTitle(true)} title="Click to rename">{dash.title}</h1>
          )}
          {dash.description && <p className="muted">{dash.description}</p>}
        </div>
        <div className="widget-actions">
          <button className="btn ghost" onClick={() => setRefreshKey((k) => k + 1)}>↻ Refresh all</button>
          <button className="btn ghost danger" onClick={remove}>Delete</button>
        </div>
      </header>

      <form className="edit-bar" onSubmit={edit}>
        <input
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder='Change it in plain English, e.g. "add a chart of revenue by month" or "make the top chart a pie"'
        />
        <button className="btn" type="submit" disabled={busy || !instruction.trim()}>{busy ? 'Updating…' : 'Apply'}</button>
      </form>
      {error && <div className="error">{error}</div>}

      {dash.widgets.length === 0 && <p className="muted">This dashboard is empty. Ask for widgets above, or pin answers from the Ask tab.</p>}
      <div className="grid">
        {dash.widgets.map((w) => (
          <Widget
            key={w.id}
            widget={w}
            refreshKey={refreshKey}
            onRemove={() => save({ widgets: dash.widgets.filter((x) => x.id !== w.id) })}
          />
        ))}
      </div>
    </div>
  );
}
