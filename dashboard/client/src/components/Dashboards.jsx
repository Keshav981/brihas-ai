import React, { useState } from 'react';
import { api } from '../api.js';

const IDEAS = [
  'Sales overview: total revenue, orders per day for the last 30 days, top customers and best selling products',
  'User growth: signups per week, active users, breakdown by plan',
  'Operations health: records created today, errors this week, busiest hours',
];

export default function Dashboards({ dashboards, onOpen, onChanged }) {
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const create = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const d = await api.generateDashboard(prompt.trim());
      setPrompt('');
      onChanged?.();
      onOpen(d.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <section className="card create">
        <h2>Create a dashboard in plain English</h2>
        <p className="muted">Describe what you want to keep an eye on. Claude explores your tables, writes the queries, checks that they run, and lays out the widgets.</p>
        <form onSubmit={create}>
          <textarea rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g. A weekly business review: revenue this month vs last, new customers per week, top 10 products, and refunds" />
          <div className="row">
            <div className="starters">
              {IDEAS.map((i) => <button type="button" key={i} className="chip" onClick={() => setPrompt(i)}>{i.split(':')[0]}</button>)}
            </div>
            <div className="spacer" />
            <button className="btn" type="submit" disabled={busy || !prompt.trim()}>{busy ? 'Building… (30–90s)' : 'Build dashboard'}</button>
          </div>
        </form>
        {error && <div className="error">{error}</div>}
      </section>

      <h2 className="section-title">Your dashboards</h2>
      {dashboards.length === 0 && <p className="muted">No dashboards yet. Describe one above to get started.</p>}
      <div className="cards">
        {dashboards.map((d) => (
          <button key={d.id} className="card dash-card" onClick={() => onOpen(d.id)}>
            <h3>{d.title}</h3>
            <p className="muted">{d.description}</p>
            <div className="meta">{d.widgetCount} widget{d.widgetCount === 1 ? '' : 's'} · updated {new Date(d.updatedAt).toLocaleDateString()}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
