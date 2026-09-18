// Natural language -> SQL -> answer, powered by Claude.
//
// Two entry points:
//   askData()          "talk to your data": answers a question, returning
//                      the SQL it used, the rows, and a chart suggestion.
//   generateDashboard() turns a plain-English description into a set of
//                      widgets (title + SQL + chart), each validated against
//                      the live database before it is returned.
//
// Claude can call one tool, run_sql, which only ever executes read-only
// queries through the same guarded path the UI uses.

import Anthropic from '@anthropic-ai/sdk';

const DEFAULT_MODEL = 'claude-opus-5';
const MAX_TOOL_ROUNDS = 10;
const MODEL_ROW_PREVIEW = 100;

const CHART_TYPES = ['bar', 'line', 'area', 'pie', 'number', 'table'];

const chartSchema = {
  type: 'object',
  description: 'How to visualise the result of the SQL.',
  properties: {
    type: { type: 'string', enum: CHART_TYPES },
    title: { type: 'string', description: 'Short chart title.' },
    x: {
      type: ['string', 'null'],
      description: 'Column for the x axis / category (bar, line, area, pie). null for number/table.',
    },
    y: {
      type: 'array',
      items: { type: 'string' },
      description: 'Numeric value column(s) to plot. One column for pie/number. Empty for table.',
    },
  },
  required: ['type', 'title', 'x', 'y'],
  additionalProperties: false,
};

const answerSchema = {
  type: 'object',
  properties: {
    answer: {
      type: 'string',
      description: 'The plain-English answer for a non-technical reader. Lead with the number or finding. Markdown allowed (bold, bullets). Do not paste SQL here.',
    },
    sql: {
      type: ['string', 'null'],
      description: 'The single final SELECT whose result backs the answer and chart. null if the question needed no query.',
    },
    chart: { anyOf: [chartSchema, { type: 'null' }] },
    follow_ups: {
      type: 'array',
      items: { type: 'string' },
      description: 'Up to 3 short follow-up questions the user might ask next.',
    },
  },
  required: ['answer', 'sql', 'chart', 'follow_ups'],
  additionalProperties: false,
};

const widgetSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    description: { type: 'string', description: 'One sentence on what this widget shows.' },
    sql: { type: 'string', description: 'A single SELECT returning the data for the widget.' },
    chart: chartSchema,
    width: { type: 'string', enum: ['half', 'full'] },
  },
  required: ['title', 'description', 'sql', 'chart', 'width'],
  additionalProperties: false,
};

const dashboardSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    widgets: { type: 'array', items: widgetSchema, minItems: 1, maxItems: 12 },
  },
  required: ['title', 'description', 'widgets'],
  additionalProperties: false,
};

const runSqlTool = {
  name: 'run_sql',
  description:
    'Run a read-only PostgreSQL SELECT against the connected database and get the rows back. Use it to explore values, check assumptions, and to verify the final query actually works before answering. Results are capped at 100 rows for you; the UI will re-run your final SQL with a higher cap.',
  strict: true,
  input_schema: {
    type: 'object',
    properties: {
      sql: { type: 'string', description: 'A single SELECT or WITH ... SELECT statement.' },
      purpose: { type: 'string', description: 'Why you are running this query (one short phrase).' },
    },
    required: ['sql', 'purpose'],
    additionalProperties: false,
  },
};

function baseSystemPrompt(schemaText) {
  return `You are a friendly data analyst embedded in a dashboard app. You are connected to a PostgreSQL database and help non-technical people understand their data.

Database schema:
${schemaText}

How to work:
- Write PostgreSQL syntax only. Quote identifiers with double quotes when they contain uppercase letters or special characters.
- Always run your final SQL with run_sql before answering so you know it works and what it returns. If a query errors, fix it and try again.
- If a question is ambiguous, pick the most sensible reading, answer it, and mention the assumption in one short clause.
- Prefer readable output: give aggregated columns clear aliases (e.g. total_revenue, signups), order results meaningfully, and cast dates to date when grouping by day.
- For time series group by day/week/month as appropriate and alias the time column plainly (day, week, month).
- Keep result sets small: aggregate rather than dumping raw rows unless the user asks for a list.
- Never modify data. Only SELECT.

Chart guidance:
- number: a single headline value (one row, one numeric column).
- bar: comparing categories (up to ~30). line/area: change over time. pie: share of a whole with at most 6 slices. table: lists or many columns.
- x is the category/time column; y lists the numeric columns to plot.
- Only put several y columns on one chart when they share a scale (e.g. two revenue series). Never mix a count with a currency total on the same chart; pick the one that answers the question or make two widgets.`;
}

export function createAi({ db, schema, client, model, effort, fallbacks } = {}) {
  const anthropic = client ?? new Anthropic();
  const modelId = model ?? process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;
  const effortLevel = effort ?? process.env.AI_EFFORT ?? 'high';
  // Server-side refusal fallbacks: if the primary model declines, the API
  // re-runs the request on a fallback model in the same call. Set
  // AI_FALLBACKS=off to send plain requests instead.
  const useFallbacks = fallbacks ?? (process.env.AI_FALLBACKS ?? 'on') !== 'off';

  async function createMessage(params) {
    const request = {
      model: modelId,
      max_tokens: 16000,
      output_config: { effort: effortLevel, ...(params.output_config ?? {}) },
      ...params,
    };
    if (useFallbacks) {
      return anthropic.beta.messages.create({
        ...request,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
      });
    }
    return anthropic.messages.create(request);
  }

  async function executeForModel(sql) {
    const result = await db.readOnlyQuery(sql, { limit: MODEL_ROW_PREVIEW });
    return {
      columns: result.columns.map((c) => c.name),
      rows: result.rows,
      rowCount: result.rowCount,
      note: result.truncated ? `Showing first ${MODEL_ROW_PREVIEW} rows only.` : undefined,
    };
  }

  /**
   * Drive the tool loop until Claude produces its final JSON.
   * Returns { output, steps } where steps records every SQL run.
   */
  async function runLoop({ system, messages, outputSchema }) {
    const steps = [];
    const convo = [...messages];
    let response;
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      response = await createMessage({
        system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
        messages: convo,
        tools: [runSqlTool],
        output_config: { format: { type: 'json_schema', schema: outputSchema } },
      });

      if (response.stop_reason === 'refusal') {
        const why = response.stop_details?.explanation ?? 'The model declined this request.';
        throw new Error(`Request declined: ${why}`);
      }
      if (response.stop_reason === 'max_tokens') {
        throw new Error('The model ran out of room while answering. Try a narrower question.');
      }

      const toolUses = response.content.filter((b) => b.type === 'tool_use');
      if (response.stop_reason !== 'tool_use' || toolUses.length === 0) break;

      convo.push({ role: 'assistant', content: response.content });
      const results = [];
      for (const tu of toolUses) {
        const { sql, purpose } = tu.input ?? {};
        const step = { purpose, sql, ok: true };
        try {
          const data = await executeForModel(sql);
          step.rowCount = data.rowCount;
          results.push({ type: 'tool_result', tool_use_id: tu.id, content: JSON.stringify(data) });
        } catch (err) {
          step.ok = false;
          step.error = err.message;
          results.push({ type: 'tool_result', tool_use_id: tu.id, is_error: true, content: `Query failed: ${err.message}` });
        }
        steps.push(step);
      }
      convo.push({ role: 'user', content: results });
    }

    if (!response || response.stop_reason === 'tool_use') {
      throw new Error('The model kept querying without reaching an answer. Try rephrasing.');
    }
    const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    let output;
    try {
      output = JSON.parse(text);
    } catch {
      throw new Error('The model returned an unreadable answer. Please try again.');
    }
    return { output, steps, convo: [...convo, { role: 'assistant', content: response.content }] };
  }

  /** Answer a question about the data. `history` is prior {role, content} text turns. */
  async function askData({ question, history = [] }) {
    if (!question?.trim()) throw new Error('Question is empty.');
    const schemaText = await schema.describeForModel();
    const messages = [
      ...history
        .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: question.trim() },
    ];

    const { output, steps } = await runLoop({
      system: baseSystemPrompt(schemaText),
      messages,
      outputSchema: answerSchema,
    });

    let result = null;
    if (output.sql) {
      result = await db.readOnlyQuery(output.sql, { limit: 500 });
    }
    return {
      answer: output.answer,
      sql: output.sql,
      chart: normalizeChart(output.chart, result),
      followUps: (output.follow_ups ?? []).slice(0, 3),
      result,
      steps,
    };
  }

  /**
   * Build (or rewrite) a dashboard from plain English.
   * When `existing` is given, the instruction edits that dashboard.
   */
  async function generateDashboard({ prompt, existing = null }) {
    if (!prompt?.trim()) throw new Error('Describe the dashboard you want.');
    const schemaText = await schema.describeForModel();
    const system = `${baseSystemPrompt(schemaText)}

You are now building a dashboard: a set of 3 to 8 widgets, each with a title, a single SELECT, and a chart spec. Choose widgets that together answer the user's request. Use run_sql to check that every query works and returns sensible data before you finish. Use width "full" only for wide time series or tables; "half" otherwise. Put the most important headline numbers first.`;

    const userText = existing
      ? `Here is the current dashboard as JSON:\n${JSON.stringify(existing, null, 2)}\n\nApply this change and return the complete updated dashboard (keep widgets that are not affected exactly as they are):\n${prompt.trim()}`
      : `Build a dashboard for: ${prompt.trim()}`;

    let { output, steps, convo } = await runLoop({
      system,
      messages: [{ role: 'user', content: userText }],
      outputSchema: dashboardSchema,
    });

    // Validate every widget against the live database; give the model one
    // chance to repair anything that fails.
    for (let attempt = 0; attempt < 2; attempt++) {
      const errors = await validateWidgets(output.widgets);
      if (errors.length === 0) break;
      if (attempt === 1) {
        output.widgets = output.widgets.map((w, i) => {
          const e = errors.find((x) => x.index === i);
          return e ? { ...w, error: e.error } : w;
        });
        break;
      }
      const fixPrompt = `These widget queries failed when executed. Fix them and return the complete dashboard again:\n${errors
        .map((e) => `- widget ${e.index + 1} "${output.widgets[e.index].title}": ${e.error}`)
        .join('\n')}`;
      const repaired = await runLoop({
        system,
        messages: [...convo, { role: 'user', content: fixPrompt }],
        outputSchema: dashboardSchema,
      });
      output = repaired.output;
      steps = [...steps, ...repaired.steps];
      convo = repaired.convo;
    }

    return {
      title: output.title,
      description: output.description,
      widgets: output.widgets.map((w) => ({
        title: w.title,
        description: w.description,
        sql: w.sql,
        chart: normalizeChart(w.chart, null),
        width: w.width === 'full' ? 'full' : 'half',
        error: w.error ?? null,
      })),
      steps,
    };
  }

  async function validateWidgets(widgets) {
    const errors = [];
    for (let i = 0; i < widgets.length; i++) {
      try {
        await db.readOnlyQuery(widgets[i].sql, { limit: 5 });
      } catch (err) {
        errors.push({ index: i, error: err.message });
      }
    }
    return errors;
  }

  return { askData, generateDashboard, model: modelId };
}

/** Make sure a chart spec references real columns; fall back to table. */
export function normalizeChart(chart, result) {
  if (!chart || !CHART_TYPES.includes(chart.type)) return chart ? { ...chart, type: 'table', x: null, y: [] } : null;
  const out = { type: chart.type, title: chart.title ?? '', x: chart.x ?? null, y: Array.isArray(chart.y) ? chart.y : [] };
  if (!result) return out;
  const names = new Set(result.columns.map((c) => c.name));
  if (out.x && !names.has(out.x)) out.x = null;
  out.y = out.y.filter((y) => names.has(y));
  if (out.type === 'number') {
    if (result.rows.length !== 1 && result.columns.length !== 1) out.type = 'table';
  } else if (out.type !== 'table' && (out.y.length === 0 || (!out.x && out.type !== 'number'))) {
    out.type = 'table';
  }
  return out;
}
