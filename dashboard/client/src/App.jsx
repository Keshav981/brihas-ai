import React, { useEffect, useState, useCallback } from 'react';
import { api } from './api.js';
import Chat from './components/Chat.jsx';
import Dashboards from './components/Dashboards.jsx';
import DashboardView from './components/DashboardView.jsx';
import SchemaBrowser from './components/SchemaBrowser.jsx';

export default function App() {
  const [view, setView] = useState({ name: 'ask' });
  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState(null);
  const [dashboards, setDashboards] = useState([]);
  const [prefill, setPrefill] = useState('');

  const loadDashboards = useCallback(() => api.dashboards().then(setDashboards).catch(() => {}), []);

  useEffect(() => {
    api.health().then(setHealth).catch((e) => setHealthError(e.message));
    loadDashboards();
  }, [loadDashboards]);

  const askAbout = (q) => { setPrefill(q); setView({ name: 'ask' }); };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="logo" />
          <div>
            <div className="brand-name">Data Studio</div>
            <div className="brand-sub">{health ? health.database : healthError ? 'not connected' : '…'}</div>
          </div>
        </div>
        <nav>
          <button className={view.name === 'ask' ? 'on' : ''} onClick={() => setView({ name: 'ask' })}>💬 Ask</button>
          <button className={view.name === 'dashboards' || view.name === 'dashboard' ? 'on' : ''} onClick={() => setView({ name: 'dashboards' })}>📊 Dashboards</button>
          <button className={view.name === 'schema' ? 'on' : ''} onClick={() => setView({ name: 'schema' })}>🗂 Tables</button>
        </nav>
        {dashboards.length > 0 && (
          <div className="side-list">
            <div className="side-label">Recent</div>
            {dashboards.slice(0, 8).map((d) => (
              <button key={d.id} className={view.name === 'dashboard' && view.id === d.id ? 'on' : ''} onClick={() => setView({ name: 'dashboard', id: d.id })}>{d.title}</button>
            ))}
          </div>
        )}
        <div className="side-foot">
          {healthError && <div className="error small">Database: {healthError}</div>}
          {health && <div className="muted small">Model {health.model}<br />Read-only access</div>}
        </div>
      </aside>
      <main className="main">
        <div className={`view ${view.name === 'ask' ? '' : 'hidden'}`}>
          <Chat dashboards={dashboards} onDashboardsChanged={loadDashboards} initialQuestion={prefill} />
        </div>
        {view.name === 'dashboards' && <Dashboards dashboards={dashboards} onChanged={loadDashboards} onOpen={(id) => setView({ name: 'dashboard', id })} />}
        {view.name === 'dashboard' && <DashboardView id={view.id} onBack={() => setView({ name: 'dashboards' })} onChanged={loadDashboards} />}
        {view.name === 'schema' && <SchemaBrowser onAsk={askAbout} />}
      </main>
    </div>
  );
}
