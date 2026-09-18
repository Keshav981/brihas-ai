import React, { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { toObjects, fmtNumber, fmtLabel } from '../format.js';
import DataTable from './DataTable.jsx';

// Categorical palette (fixed slot order, never cycled) — see dataviz palette.
const SERIES = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)', 'var(--series-5)', 'var(--series-6)', 'var(--series-7)', 'var(--series-8)'];
const MAX_PIE_SLICES = 6;

function prepare(chart, result) {
  const data = toObjects(result).map((row) => {
    const out = { ...row };
    if (chart.x) out.__x = fmtLabel(row[chart.x]);
    for (const y of chart.y) {
      const n = Number(row[y]);
      out[y] = Number.isFinite(n) ? n : null;
    }
    return out;
  });
  return data;
}

function ChartTooltip({ active, payload, label, single }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip">
      {label !== undefined && <div className="tooltip-title">{label}</div>}
      {payload.map((p) => (
        <div key={p.dataKey ?? p.name} className="tooltip-row">
          {!single && <span className="swatch" style={{ background: p.color ?? p.payload?.fill }} />}
          <span className="tooltip-name">{p.name}</span>
          <span className="tooltip-value">{fmtNumber(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function ChartView({ chart, result, height = 260, label }) {
  const data = useMemo(() => (chart && result ? prepare(chart, result) : []), [chart, result]);

  if (!result) return null;
  if (!chart || chart.type === 'table' || result.rows.length === 0) {
    return <DataTable result={result} />;
  }

  if (chart.type === 'number') {
    const key = chart.y[0] ?? result.columns[0]?.name;
    const value = data[0]?.[key] ?? result.rows[0]?.[0];
    return (
      <div className="stat-tile">
        <div className="stat-value">{fmtNumber(value, { compactAbove: 1e9 })}</div>
        {label !== null && <div className="stat-label">{label ?? chart.title ?? key}</div>}
      </div>
    );
  }

  const single = chart.y.length === 1;
  const common = {
    data,
    margin: { top: 8, right: 12, bottom: 4, left: 4 },
  };
  const axes = (
    <>
      <CartesianGrid vertical={false} stroke="var(--gridline)" />
      <XAxis dataKey="__x" tick={{ fill: 'var(--muted)', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'var(--baseline)' }} minTickGap={16} />
      <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmtNumber(v)} width={56} />
      <Tooltip content={<ChartTooltip single={single} />} cursor={{ stroke: 'var(--baseline)', fill: 'var(--hover-wash)' }} />
      {!single && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />}
    </>
  );

  if (chart.type === 'pie') {
    const key = chart.y[0];
    const sorted = [...data].filter((d) => d[key] !== null).sort((a, b) => b[key] - a[key]);
    const head = sorted.slice(0, MAX_PIE_SLICES);
    const rest = sorted.slice(MAX_PIE_SLICES);
    if (rest.length) head.push({ __x: 'Other', [key]: rest.reduce((s, d) => s + d[key], 0) });
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={head} dataKey={key} nameKey="__x" innerRadius="55%" outerRadius="85%" paddingAngle={2} stroke="var(--surface-1)" strokeWidth={2}>
            {head.map((_, i) => <Cell key={i} fill={SERIES[i % SERIES.length]} />)}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (chart.type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart {...common}>
          {axes}
          {chart.y.map((y, i) => (
            <Line key={y} type="monotone" dataKey={y} name={y} stroke={SERIES[i]} strokeWidth={2} dot={data.length <= 40 ? { r: 3, strokeWidth: 0, fill: SERIES[i] } : false} activeDot={{ r: 5, stroke: 'var(--surface-1)', strokeWidth: 2 }} connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (chart.type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart {...common}>
          {axes}
          {chart.y.map((y, i) => (
            <Area key={y} type="monotone" dataKey={y} name={y} stroke={SERIES[i]} fill={SERIES[i]} fillOpacity={0.18} strokeWidth={2} activeDot={{ r: 5, stroke: 'var(--surface-1)', strokeWidth: 2 }} connectNulls />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // bar (default)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart {...common} barCategoryGap="25%" barGap={2}>
        {axes}
        {chart.y.map((y, i) => (
          <Bar key={y} dataKey={y} name={y} fill={SERIES[i]} radius={[4, 4, 0, 0]} maxBarSize={48} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
