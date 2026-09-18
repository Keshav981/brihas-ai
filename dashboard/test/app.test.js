// End-to-end smoke test: real HTTP -> Express -> real `pg` client -> an
// embedded Postgres (PGlite over the wire protocol), with the model faked.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { createApp } from '../server/app.js';
import { createDb } from '../server/db.js';
import { createSchemaService } from '../server/schema.js';
import { createAi } from '../server/ai.js';
import { createDashboardStore } from '../server/dashboards.js';

let pglite, socket, db, server, base, tmpDir;

/** A stand-in for the Anthropic client that scripts the tool loop. */
function fakeAnthropic(script) {
  let i = 0;
  const create = async (params) => {
    const step = script[i++];
    if (typeof step === 'function') return step(params);
    return step;
  };
  return { messages: { create }, beta: { messages: { create } } };
}
const toolUse = (sql) => ({
  stop_reason: 'tool_use',
  content: [{ type: 'tool_use', id: `tu_${Math.random()}`, name: 'run_sql', input: { sql, purpose: 'check' } }],
});
const finalJson = (obj) => ({ stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(obj) }] });

before(async () => {
  pglite = await PGlite.create();
  await pglite.exec(`
    CREATE TABLE users (id serial PRIMARY KEY, name text NOT NULL, plan text, created_at timestamptz NOT NULL DEFAULT now());
    CREATE TABLE orders (id serial PRIMARY KEY, user_id int REFERENCES users(id), amount numeric(10,2) NOT NULL, created_at date NOT NULL);
    INSERT INTO users (name, plan) VALUES ('Ada', 'pro'), ('Grace', 'free'), ('Linus', 'pro');
    INSERT INTO orders (user_id, amount, created_at) VALUES (1, 120.50, '2026-09-01'), (1, 80, '2026-09-02'), (3, 45.25, '2026-09-02');
  `);
  socket = new PGLiteSocketServer({ db: pglite, port: 0, host: '127.0.0.1' });
  await socket.start();
  const port = socket.server?.address?.().port ?? socket.port;
  db = createDb({ host: '127.0.0.1', port, user: 'postgres', password: 'postgres', database: 'postgres', max: 1 });
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ds-test-'));
  global.__ai = { current: null };
  const schema = createSchemaService(db);
  const ai = {
    get model() { return 'fake-model'; },
    askData: (args) => global.__ai.current.askData(args),
    generateDashboard: (args) => global.__ai.current.generateDashboard(args),
  };
  global.__mk = (script) => createAi({ db, schema, client: fakeAnthropic(script), model: 'fake-model' });
  const app = createApp({ db, schema, ai, store: createDashboardStore(path.join(tmpDir, 'dashboards.json')) });
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server?.close();
  await db?.end();
  await socket?.stop();
  await pglite?.close();
  if (tmpDir) await fs.rm(tmpDir, { recursive: true, force: true });
});

const api = async (method, url, body) => {
  const res = await fetch(base + url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
};

test('health and schema introspection', async () => {
  const health = await api('GET', '/api/health');
  assert.equal(health.status, 200);
  assert.equal(health.body.ok, true);

  const schema = await api('GET', '/api/schema');
  const names = schema.body.tables.map((t) => t.name).sort();
  assert.deepEqual(names, ['orders', 'users']);
  const orders = schema.body.tables.find((t) => t.name === 'orders');
  assert.equal(orders.columns.find((c) => c.name === 'user_id').fk, 'public.users.id');
  assert.equal(orders.columns.find((c) => c.name === 'id').pk, true);
});

test('query endpoint is read-only and limits rows', async () => {
  const ok = await api('POST', '/api/query', { sql: 'SELECT name FROM users ORDER BY name', limit: 2 });
  assert.equal(ok.status, 200);
  assert.deepEqual(ok.body.rows, [['Ada'], ['Grace']]);
  assert.equal(ok.body.truncated, true);

  const bad = await api('POST', '/api/query', { sql: 'DELETE FROM users' });
  assert.equal(bad.status, 400);
  assert.match(bad.body.error, /Only SELECT/);

  const count = await api('POST', '/api/query', { sql: 'SELECT count(*) FROM users' });
  assert.deepEqual(count.body.rows, [[3]]);
});

test('ask: tool loop runs SQL, final answer re-executed with chart', async () => {
  global.__ai.current = global.__mk([
    toolUse('SELECT plan, count(*) AS users FROM users GROUP BY plan ORDER BY plan'),
    (params) => {
      // The tool result must have been fed back to the model.
      const last = params.messages.at(-1);
      assert.equal(last.role, 'user');
      assert.equal(last.content[0].type, 'tool_result');
      assert.match(last.content[0].content, /"rows":\[\["free",1\],\["pro",2\]\]/);
      assert.equal(params.output_config.format.type, 'json_schema');
      return finalJson({
        answer: 'You have **2 pro** users and 1 free user.',
        sql: 'SELECT plan, count(*) AS users FROM users GROUP BY plan ORDER BY plan',
        chart: { type: 'bar', title: 'Users by plan', x: 'plan', y: ['users'] },
        follow_ups: ['How many signed up this month?'],
      });
    },
  ]);
  const res = await api('POST', '/api/ask', { question: 'how many users per plan?' });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.match(res.body.answer, /2 pro/);
  assert.equal(res.body.chart.type, 'bar');
  assert.deepEqual(res.body.result.rows, [['free', 1], ['pro', 2]]);
  assert.equal(res.body.steps.length, 1);
});

test('ask: failing tool query is reported back to the model, not fatal', async () => {
  global.__ai.current = global.__mk([
    toolUse('SELECT nope FROM users'),
    (params) => {
      const last = params.messages.at(-1);
      assert.equal(last.content[0].is_error, true);
      assert.match(last.content[0].content, /nope/);
      return finalJson({ answer: 'There is no such column.', sql: null, chart: null, follow_ups: [] });
    },
  ]);
  const res = await api('POST', '/api/ask', { question: 'select nope' });
  assert.equal(res.status, 200);
  assert.equal(res.body.result, null);
  assert.equal(res.body.steps[0].ok, false);
});

test('dashboard: generate validates widgets and repairs failures once', async () => {
  const good = { title: 'Revenue', description: 'Total revenue', sql: 'SELECT sum(amount) AS revenue FROM orders', chart: { type: 'number', title: 'Revenue', x: null, y: ['revenue'] }, width: 'half' };
  const broken = { ...good, title: 'Broken', sql: 'SELECT sum(amount) FROM missing_table' };
  const fixed = { ...good, title: 'Orders per day', sql: 'SELECT created_at AS day, count(*) AS orders FROM orders GROUP BY 1 ORDER BY 1', chart: { type: 'line', title: 'Orders per day', x: 'day', y: ['orders'] }, width: 'full' };
  global.__ai.current = global.__mk([
    finalJson({ title: 'Sales', description: 'Sales overview', widgets: [good, broken] }),
    (params) => {
      assert.match(params.messages.at(-1).content, /widget 2 "Broken"/);
      return finalJson({ title: 'Sales', description: 'Sales overview', widgets: [good, fixed] });
    },
  ]);
  const gen = await api('POST', '/api/dashboards/generate', { prompt: 'sales overview' });
  assert.equal(gen.status, 201, JSON.stringify(gen.body));
  assert.equal(gen.body.widgets.length, 2);
  assert.equal(gen.body.widgets[1].title, 'Orders per day');
  assert.ok(gen.body.widgets.every((w) => w.id && !w.error));

  const list = await api('GET', '/api/dashboards');
  assert.equal(list.body.length, 1);
  assert.equal(list.body[0].widgetCount, 2);

  // Pin a chat answer to it.
  const pin = await api('POST', `/api/dashboards/${gen.body.id}/widgets`, {
    title: 'Users', sql: 'SELECT count(*) AS users FROM users', chart: { type: 'number', title: 'Users', x: null, y: ['users'] },
  });
  assert.equal(pin.status, 201);
  assert.equal(pin.body.widgets.length, 3);

  const badPin = await api('POST', `/api/dashboards/${gen.body.id}/widgets`, { title: 'x', sql: 'DROP TABLE users' });
  assert.equal(badPin.status, 400);

  // Edit with English.
  global.__ai.current = global.__mk([
    (params) => {
      assert.match(params.messages[0].content, /current dashboard as JSON/);
      return finalJson({ title: 'Sales (weekly)', description: 'x', widgets: [good] });
    },
  ]);
  const edit = await api('POST', `/api/dashboards/${gen.body.id}/edit`, { instruction: 'drop everything except revenue' });
  assert.equal(edit.status, 200);
  assert.equal(edit.body.title, 'Sales (weekly)');
  assert.equal(edit.body.widgets.length, 1);

  const del = await api('DELETE', `/api/dashboards/${gen.body.id}`);
  assert.equal(del.status, 204);
  assert.equal((await api('GET', `/api/dashboards/${gen.body.id}`)).status, 404);
});
