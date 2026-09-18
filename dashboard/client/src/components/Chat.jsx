import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api.js';
import ChartView from './ChartView.jsx';
import DataTable from './DataTable.jsx';
import Markdown from './Markdown.jsx';

const STARTERS = [
  'What tables do we have and what is in them?',
  'How many rows were added in the last 30 days, by table?',
  'Show me the trend of new records per week this year',
  'What are the top 10 most common values in our biggest table?',
];

function historyFor(messages) {
  return messages.map((m) =>
    m.role === 'user'
      ? { role: 'user', content: m.content }
      : { role: 'assistant', content: `${m.data?.answer ?? m.content}${m.data?.sql ? `\n\nSQL used:\n${m.data.sql}` : ''}` },
  );
}

function AssistantMessage({ msg, dashboards, onPinned }) {
  const [view, setView] = useState('chart');
  const [showSql, setShowSql] = useState(false);
  const [pinTo, setPinTo] = useState('');
  const [pinState, setPinState] = useState(null);
  const d = msg.data;
  if (!d) return <div className="bubble assistant"><Markdown text={msg.content} /></div>;

  const hasChart = d.chart && d.chart.type !== 'table';
  const pin = async () => {
    if (!pinTo) return;
    setPinState('saving');
    try {
      await api.addWidget(pinTo, {
        title: d.chart?.title || msg.question,
        description: msg.question,
        sql: d.sql,
        chart: d.chart ?? { type: 'table', title: msg.question, x: null, y: [] },
        width: d.chart?.type === 'number' ? 'half' : 'full',
      });
      setPinState('done');
      onPinned?.();
    } catch (err) {
      setPinState(err.message);
    }
  };

  return (
    <div className="bubble assistant">
      <Markdown text={d.answer} />
      {d.result && (
        <div className="result">
          <div className="result-bar">
            <div className="seg">
              {hasChart && <button className={view === 'chart' ? 'on' : ''} onClick={() => setView('chart')}>Chart</button>}
              <button className={view === 'table' || !hasChart ? 'on' : ''} onClick={() => setView('table')}>Table</button>
            </div>
            <div className="spacer" />
            <button className="link" onClick={() => setShowSql((s) => !s)}>{showSql ? 'Hide SQL' : 'Show SQL'}</button>
            {dashboards.length > 0 && d.sql && (
              <span className="pin">
                <select value={pinTo} onChange={(e) => { setPinTo(e.target.value); setPinState(null); }}>
                  <option value="">Add to dashboard…</option>
                  {dashboards.map((db) => <option key={db.id} value={db.id}>{db.title}</option>)}
                </select>
                <button className="btn small" disabled={!pinTo || pinState === 'saving'} onClick={pin}>
                  {pinState === 'saving' ? 'Adding…' : pinState === 'done' ? 'Added ✓' : 'Add'}
                </button>
              </span>
            )}
          </div>
          {pinState && pinState !== 'saving' && pinState !== 'done' && <div className="error">{pinState}</div>}
          {showSql && <pre className="sql">{d.sql}</pre>}
          {view === 'chart' && hasChart ? <ChartView chart={d.chart} result={d.result} /> : <DataTable result={d.result} />}
          <div className="meta">{d.result.rowCount}{d.result.truncated ? '+' : ''} rows · {d.result.durationMs} ms{d.steps?.length > 1 ? ` · ${d.steps.length} queries explored` : ''}</div>
        </div>
      )}
      {d.followUps?.length > 0 && (
        <div className="followups">
          {d.followUps.map((f) => <button key={f} className="chip" onClick={() => msg.onAsk?.(f)}>{f}</button>)}
        </div>
      )}
    </div>
  );
}

export default function Chat({ dashboards, onDashboardsChanged, initialQuestion }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(initialQuestion ?? '');
  const [busy, setBusy] = useState(false);
  const bottom = useRef(null);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, busy]);
  useEffect(() => { if (initialQuestion) setInput(initialQuestion); }, [initialQuestion]);

  const ask = async (question) => {
    const q = question.trim();
    if (!q || busy) return;
    setInput('');
    const prior = messages;
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setBusy(true);
    try {
      const data = await api.ask(q, historyFor(prior));
      setMessages((m) => [...m, { role: 'assistant', content: data.answer, data, question: q, onAsk: ask }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', content: `Sorry, that did not work: ${err.message}`, error: true }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="chat">
      <div className="chat-scroll">
        {messages.length === 0 && (
          <div className="welcome">
            <h2>Ask anything about your data</h2>
            <p>Questions are turned into read-only SQL, run against your Postgres database, and answered in plain English with a chart when it helps.</p>
            <div className="starters">
              {STARTERS.map((s) => <button key={s} className="chip" onClick={() => ask(s)}>{s}</button>)}
            </div>
          </div>
        )}
        {messages.map((m, i) =>
          m.role === 'user'
            ? <div key={i} className="bubble user">{m.content}</div>
            : <AssistantMessage key={i} msg={m} dashboards={dashboards} onPinned={onDashboardsChanged} />,
        )}
        {busy && <div className="bubble assistant thinking"><span className="dots"><i /><i /><i /></span> Looking at your data…</div>}
        <div ref={bottom} />
      </div>
      <form className="composer" onSubmit={(e) => { e.preventDefault(); ask(input); }}>
        <textarea
          value={input}
          placeholder="e.g. How many new users signed up each week this quarter?"
          rows={2}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input); } }}
        />
        <button className="btn" type="submit" disabled={busy || !input.trim()}>Ask</button>
      </form>
    </div>
  );
}
