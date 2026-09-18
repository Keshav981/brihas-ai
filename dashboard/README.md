# Brihas Data Studio

Talk to your Postgres database in plain English and build dashboards from it.

- **Ask** – type a question ("how many users signed up each week this quarter?"). Claude reads your schema, writes a read-only SQL query, runs it, and answers in plain English with a chart and the table behind it. Follow-up questions keep the context. Any answer can be pinned to a dashboard.
- **Dashboards** – describe a dashboard ("sales overview with revenue, orders per day, top products"). Claude explores the tables, writes and verifies each widget's query, and lays it out. Change it later with another sentence ("add a pie of users by plan", "show revenue by month instead").
- **Tables** – browse every table, its columns, keys and approximate row counts.

Nothing is written to your database. Every query is checked to be a single `SELECT`, wrapped in a row limit, and executed inside a `READ ONLY` transaction with a statement timeout.

## Setup

Requirements: Node 20+, network access to your Postgres, an Anthropic API key.

```bash
cd dashboard
npm install
cp .env.example .env     # then edit .env
```

`.env` for the local database:

```
PGHOST=127.0.0.1
PGPORT=5434
PGUSER=founder@brihas.ai
PGPASSWORD=
PGDATABASE=brihasai
PGSSL=disable
ANTHROPIC_API_KEY=sk-ant-...
```

Run it:

```bash
npm run dev        # API on http://localhost:8787, UI on http://localhost:5174
```

Production build (one process serves both the API and the UI):

```bash
npm run build
npm start          # http://localhost:8787
```

Tests (run against an embedded Postgres, no external services needed):

```bash
npm test
```

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` | – | Postgres connection |
| `PGSSL` | `disable` | set to `require` for SSL |
| `PG_STATEMENT_TIMEOUT_MS` | `20000` | kills any query running longer than this |
| `PG_POOL_MAX` | `4` | connection pool size |
| `ANTHROPIC_API_KEY` | – | Claude API key |
| `ANTHROPIC_MODEL` | `claude-opus-5` | model used for SQL generation |
| `AI_EFFORT` | `high` | `low` / `medium` / `high` / `xhigh` / `max`; lower is faster and cheaper |
| `AI_FALLBACKS` | `on` | server-side refusal fallbacks; `off` sends plain requests |
| `PORT` | `8787` | API port |
| `DASHBOARDS_FILE` | `./data/dashboards.json` | where dashboards are saved |

Dashboards are stored as a JSON file (`dashboard/data/dashboards.json`, git-ignored), so nothing has to be created inside the analysed database.

## Tips

- Give the app a Postgres role that only has `SELECT` on the tables you want it to see. The app enforces read-only access itself, but a read-only role is the right second layer.
- Table and column comments (`COMMENT ON COLUMN ...`) are passed to the model, so a few comments on ambiguous columns noticeably improve answers.
- The schema is cached for 5 minutes; use the Refresh button on the Tables page after migrations.

## Layout

```
server/   Express API: sqlGuard (read-only checks), db (pool + READ ONLY txn),
          schema (introspection), ai (Claude tool loop), dashboards (JSON store)
client/   React + Vite UI: Chat, Dashboards, DashboardView, SchemaBrowser, ChartView
test/     unit tests for the SQL guard + end-to-end tests on an embedded Postgres
```
