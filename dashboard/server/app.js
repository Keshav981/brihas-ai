import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';

/**
 * Build the Express app. Dependencies are injected so tests can run it
 * against an embedded Postgres and a fake model.
 */
export function createApp({ db, schema, ai, store, staticDir = null }) {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', async (_req, res) => {
    const info = await db.ping();
    res.json({ ok: true, database: info.db, postgres: info.version, model: ai.model });
  });

  app.get('/api/schema', async (_req, res) => {
    res.json(await schema.load());
  });
  app.post('/api/schema/refresh', async (_req, res) => {
    res.json(await schema.load({ force: true }));
  });

  // Talk to your data.
  app.post('/api/ask', async (req, res) => {
    const { question, history } = req.body ?? {};
    res.json(await ai.askData({ question, history: Array.isArray(history) ? history : [] }));
  });

  // Run a stored / hand-written read-only query (widgets use this).
  app.post('/api/query', async (req, res) => {
    const { sql, limit } = req.body ?? {};
    res.json(await db.readOnlyQuery(sql, { limit: limit ?? 500 }));
  });

  // Dashboards.
  app.get('/api/dashboards', async (_req, res) => res.json(await store.list()));

  app.post('/api/dashboards', async (req, res) => {
    res.status(201).json(await store.create(req.body ?? {}));
  });

  app.post('/api/dashboards/generate', async (req, res) => {
    const { prompt } = req.body ?? {};
    const draft = await ai.generateDashboard({ prompt });
    const saved = await store.create({ ...draft, prompt });
    res.status(201).json({ ...saved, steps: draft.steps });
  });

  app.get('/api/dashboards/:id', async (req, res) => {
    const d = await store.get(req.params.id);
    if (!d) return res.status(404).json({ error: 'Dashboard not found.' });
    res.json(d);
  });

  app.put('/api/dashboards/:id', async (req, res) => {
    const { title, description, widgets } = req.body ?? {};
    const patch = {};
    if (typeof title === 'string') patch.title = title;
    if (typeof description === 'string') patch.description = description;
    if (Array.isArray(widgets)) patch.widgets = widgets;
    const d = await store.update(req.params.id, patch);
    if (!d) return res.status(404).json({ error: 'Dashboard not found.' });
    res.json(d);
  });

  app.delete('/api/dashboards/:id', async (req, res) => {
    const ok = await store.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Dashboard not found.' });
    res.status(204).end();
  });

  // Edit an existing dashboard with a plain-English instruction.
  app.post('/api/dashboards/:id/edit', async (req, res) => {
    const current = await store.get(req.params.id);
    if (!current) return res.status(404).json({ error: 'Dashboard not found.' });
    const { instruction } = req.body ?? {};
    const existing = {
      title: current.title,
      description: current.description,
      widgets: current.widgets.map(({ title, description, sql, chart, width }) => ({ title, description, sql, chart, width })),
    };
    const draft = await ai.generateDashboard({ prompt: instruction, existing });
    const saved = await store.update(current.id, {
      title: draft.title,
      description: draft.description,
      widgets: draft.widgets,
    });
    res.json({ ...saved, steps: draft.steps });
  });

  // Pin a chat answer onto a dashboard.
  app.post('/api/dashboards/:id/widgets', async (req, res) => {
    const current = await store.get(req.params.id);
    if (!current) return res.status(404).json({ error: 'Dashboard not found.' });
    const { title, description, sql, chart, width } = req.body ?? {};
    if (!sql) return res.status(400).json({ error: 'Widget needs SQL.' });
    await db.readOnlyQuery(sql, { limit: 1 }); // reject broken SQL up front
    const widget = { title: title || chart?.title || 'Untitled', description: description ?? '', sql, chart, width };
    const saved = await store.update(current.id, { widgets: [...current.widgets, widget] });
    res.status(201).json(saved);
  });

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));

  if (staticDir && existsSync(staticDir)) {
    app.use(express.static(staticDir));
    app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(staticDir, 'index.html')));
  }

  // Error handler: plain JSON, never an HTML stack trace.
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    const status = err.status ?? (err instanceof SyntaxError ? 400 : 500);
    if (status >= 500) console.error(err);
    res.status(status).json({ error: err.message ?? 'Unexpected error.' });
  });

  return app;
}
