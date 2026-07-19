export default function SimpleBarChart({ data, valueKey, maxHint, color = "#A02025", unit = "" }) {
  const max = maxHint || Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div className="flex items-end justify-between gap-2 h-40">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full flex items-end justify-center h-32">
            <div
              className="w-full max-w-[22px] rounded-t-md transition-all"
              style={{ height: `${Math.max(6, (d[valueKey] / max) * 100)}%`, backgroundColor: color }}
              title={`${d[valueKey]}${unit}`}
            />
          </div>
          <span className="text-[11px] text-rawaa-grayDark">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
