import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { createDb } from './db.js';
import { createSchemaService } from './schema.js';
import { createAi } from './ai.js';
import { createDashboardStore } from './dashboards.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const port = Number(process.env.PORT ?? 8787);
const db = createDb();
const schema = createSchemaService(db);
const ai = createAi({ db, schema });
const store = createDashboardStore(process.env.DASHBOARDS_FILE ?? path.join(root, 'data', 'dashboards.json'));

const app = createApp({
  db,
  schema,
  ai,
  store,
  staticDir: process.env.NODE_ENV === 'production' ? path.join(root, 'client', 'dist') : null,
});

db.ping()
  .then((info) => console.log(`Connected to Postgres database "${info.db}"`))
  .catch((err) => console.error(`Could not connect to Postgres: ${err.message}`));

if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
  console.warn('ANTHROPIC_API_KEY is not set. Natural-language features will fail until it is (see .env.example).');
}

app.listen(port, () => console.log(`Data Studio server listening on http://localhost:${port}`));
