import React from 'react';

// Tiny renderer for the subset of markdown the model uses in answers:
// paragraphs, bullet lists, **bold**, `code`.
function inline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i}>{p.slice(1, -1)}</code>;
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

export default function Markdown({ text }) {
  const blocks = [];
  let list = null;
  for (const raw of String(text ?? '').split('\n')) {
    const line = raw.trimEnd();
    const m = line.match(/^\s*([-*•]|\d+[.)])\s+(.*)$/);
    if (m) {
      list = list ?? { ordered: /\d/.test(m[1]), items: [] };
      list.items.push(m[2]);
      continue;
    }
    if (list) { blocks.push(list); list = null; }
    if (line.trim()) blocks.push(line);
  }
  if (list) blocks.push(list);
  return (
    <div className="md">
      {blocks.map((b, i) =>
        typeof b === 'string'
          ? <p key={i}>{inline(b)}</p>
          : b.ordered
            ? <ol key={i}>{b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}</ol>
            : <ul key={i}>{b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}</ul>,
      )}
    </div>
  );
}
