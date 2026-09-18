async function request(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* non-JSON error */ }
  if (!res.ok) throw new Error(data?.error || `${res.status} ${res.statusText}`);
  return data;
}

export const api = {
  health: () => request('GET', '/api/health'),
  schema: () => request('GET', '/api/schema'),
  refreshSchema: () => request('POST', '/api/schema/refresh'),
  ask: (question, history) => request('POST', '/api/ask', { question, history }),
  query: (sql, limit) => request('POST', '/api/query', { sql, limit }),
  dashboards: () => request('GET', '/api/dashboards'),
  dashboard: (id) => request('GET', `/api/dashboards/${id}`),
  createDashboard: (body) => request('POST', '/api/dashboards', body),
  generateDashboard: (prompt) => request('POST', '/api/dashboards/generate', { prompt }),
  updateDashboard: (id, patch) => request('PUT', `/api/dashboards/${id}`, patch),
  deleteDashboard: (id) => request('DELETE', `/api/dashboards/${id}`),
  editDashboard: (id, instruction) => request('POST', `/api/dashboards/${id}/edit`, { instruction }),
  addWidget: (id, widget) => request('POST', `/api/dashboards/${id}/widgets`, widget),
};
