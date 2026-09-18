// Dashboards are saved as a JSON file on disk (dashboard/data/dashboards.json)
// so nothing has to be created inside the analysed database.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export function createDashboardStore(filePath) {
  let queue = Promise.resolve();

  async function readAll() {
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      if (err.code === 'ENOENT') return [];
      throw err;
    }
  }

  async function writeAll(list) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const tmp = `${filePath}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(list, null, 2));
    await fs.rename(tmp, filePath);
  }

  /** Serialise writers so concurrent requests cannot clobber the file. */
  function locked(fn) {
    const run = queue.then(fn, fn);
    queue = run.catch(() => {});
    return run;
  }

  return {
    list: async () => (await readAll()).map(({ widgets, ...d }) => ({ ...d, widgetCount: widgets?.length ?? 0 })),
    get: async (id) => (await readAll()).find((d) => d.id === id) ?? null,
    create: (input) =>
      locked(async () => {
        const list = await readAll();
        const now = new Date().toISOString();
        const dashboard = {
          id: randomUUID(),
          title: input.title?.trim() || 'Untitled dashboard',
          description: input.description ?? '',
          prompt: input.prompt ?? null,
          widgets: (input.widgets ?? []).map(withWidgetId),
          createdAt: now,
          updatedAt: now,
        };
        list.unshift(dashboard);
        await writeAll(list);
        return dashboard;
      }),
    update: (id, patch) =>
      locked(async () => {
        const list = await readAll();
        const idx = list.findIndex((d) => d.id === id);
        if (idx === -1) return null;
        const next = {
          ...list[idx],
          ...patch,
          id,
          widgets: (patch.widgets ?? list[idx].widgets).map(withWidgetId),
          updatedAt: new Date().toISOString(),
        };
        list[idx] = next;
        await writeAll(list);
        return next;
      }),
    remove: (id) =>
      locked(async () => {
        const list = await readAll();
        const next = list.filter((d) => d.id !== id);
        if (next.length === list.length) return false;
        await writeAll(next);
        return true;
      }),
  };
}

function withWidgetId(w) {
  return { ...w, id: w.id ?? randomUUID(), width: w.width === 'full' ? 'full' : 'half' };
}
