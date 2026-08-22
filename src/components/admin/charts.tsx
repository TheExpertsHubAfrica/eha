export function BarList({
  items,
  empty = "No data yet.",
}: {
  items: { label: string; value: number }[];
  empty?: string;
}) {
  if (items.length === 0 || items.every((item) => item.value === 0)) {
    return <p className="text-sm text-muted">{empty}</p>;
  }
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="capitalize text-navy">{item.label}</span>
            <span className="tabular-nums text-muted">{item.value}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-sky">
            <div
              className="h-2 rounded-full bg-blue"
              style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Sparkline({
  points,
  empty = "No submissions in this period.",
}: {
  points: { label: string; value: number }[];
  empty?: string;
}) {
  if (points.every((item) => item.value === 0)) {
    return <p className="text-sm text-muted">{empty}</p>;
  }
  const max = Math.max(...points.map((item) => item.value), 1);
  const width = 560;
  const height = 140;
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const path = points
    .map((item, index) => {
      const x = index * step;
      const y = height - (item.value / max) * (height - 8) - 4;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-36 w-full text-blue" role="img" aria-label="Submissions over 30 days">
        <path d={path} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      </svg>
      <p className="mt-1 text-xs text-muted">
        Last 30 days · peak {max} submitted in a day
      </p>
    </div>
  );
}

export function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}
