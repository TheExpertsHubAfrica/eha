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
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ash-100">
            <div
              className="h-2 rounded-full bg-linear-to-r from-gold-deep to-gold transition-[width] duration-500"
              style={{ width: `${Math.max(6, (item.value / max) * 100)}%` }}
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
  peakLabel = "submitted in a day",
}: {
  points: { label: string; value: number }[];
  empty?: string;
  peakLabel?: string;
}) {
  if (points.every((item) => item.value === 0)) {
    return <p className="text-sm text-muted">{empty}</p>;
  }
  const max = Math.max(...points.map((item) => item.value), 1);
  const width = 560;
  const height = 140;
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const coords = points.map((item, index) => {
    const x = index * step;
    const y = height - (item.value / max) * (height - 8) - 4;
    return { x, y, value: item.value };
  });
  const line = coords
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const peakDisplay =
    Number.isInteger(max) || max >= 100 ? String(Math.round(max)) : max.toFixed(2);
  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-36 w-full text-gold-deep"
        role="img"
        aria-label="Trend over 30 days"
      >
        <path d={area} fill="currentColor" opacity="0.12" />
        <path d={line} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        {coords
          .filter((point) => point.value === max)
          .slice(0, 1)
          .map((point) => (
            <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r="4" fill="currentColor" />
          ))}
      </svg>
      <p className="mt-1 text-xs text-muted">
        Last 30 days · peak {peakDisplay} {peakLabel}
      </p>
    </div>
  );
}

export function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}
