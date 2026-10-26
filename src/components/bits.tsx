import { useEffect, useRef, useState, type ReactNode } from "react";
import { formatPct, pctClass } from "@/lib/format";

export function Change({ value, digits = 2 }: { value: number | null | undefined; digits?: number }) {
  return <span className={`tabular-nums ${pctClass(value)}`}>{formatPct(value, digits)}</span>;
}

export function LiveMark({
  checkedAt,
  fetching,
  failed,
}: {
  checkedAt?: string | null;
  fetching: boolean;
  failed?: boolean;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const age =
    checkedAt && Number.isFinite(Date.parse(checkedAt))
      ? Math.max(0, Math.round((now - Date.parse(checkedAt)) / 1000))
      : null;
  const label = failed ? "Print check failed" : fetching && age == null ? "Checking" : age == null ? "Waiting" : `${age}s`;
  return (
    <p className="mt-2 flex items-center gap-2 text-xs text-faint">
      <span className={`live-dot inline-block h-1.5 w-1.5 rounded-full ${failed ? "bg-down" : "bg-up"}`} />
      <span>{label}</span>
    </p>
  );
}

export function LivePrice({ price, className, children }: { price: number | null | undefined; className?: string; children: ReactNode }) {
  const prev = useRef<number | null>(null);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  useEffect(() => {
    if (price == null || !Number.isFinite(price)) return;
    const before = prev.current;
    prev.current = price;
    if (before == null || before === price) return;
    setFlash(price > before ? "up" : "down");
    const id = window.setTimeout(() => setFlash(null), 900);
    return () => window.clearTimeout(id);
  }, [price]);
  const tone = flash === "up" ? "text-up" : flash === "down" ? "text-down" : "";
  return <span className={`${className ?? ""} ${tone}`.trim()}>{children}</span>;
}

export function LoadingNote({ label }: { label: string }) {
  return (
    <div className="px-4 py-8 sm:px-6">
      <p className="text-sm text-muted">{label}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-28 rounded-md border border-line bg-surface" />
        ))}
      </div>
    </div>
  );
}

export function FeedErrors({ rows }: { rows: { symbol: string; message: string }[] }) {
  if (!rows.length) return null;
  return (
    <div className="rounded-md border border-line bg-down-dim px-4 py-3 text-sm text-fg">
      <p className="font-medium">No print</p>
      <ul className="mt-2 space-y-1 text-muted">
        {rows.map((row) => (
          <li key={row.symbol}>
            <span className="text-fg">{row.symbol}</span> — {row.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "up" | "down" | "flat";
}) {
  const color = tone === "up" ? "text-up" : tone === "down" ? "text-down" : "text-fg";
  return (
    <div className="border-t border-line px-3 py-3">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-1 text-base font-medium tabular-nums ${color}`}>{value}</div>
      {hint ? <div className="mt-1 text-xs text-faint">{hint}</div> : null}
    </div>
  );
}

export function Spark({ values, tone }: { values: number[]; tone: "up" | "down" | "flat" }) {
  if (values.length < 2) return <div className="h-9" />;
  const w = 140;
  const h = 36;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const d = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const stroke = tone === "up" ? "var(--color-up)" : tone === "down" ? "var(--color-down)" : "var(--color-muted)";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-full" aria-hidden="true">
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function RangeMark({ low, high, price }: { low: number | null; high: number | null; price: number }) {
  if (low == null || high == null || !(high > low)) return <div className="text-xs text-faint">—</div>;
  const t = Math.min(1, Math.max(0, (price - low) / (high - low)));
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 flex-1 rounded-sm bg-surface-2">
        <span
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-sm bg-accent"
          style={{ left: `calc(${(t * 100).toFixed(1)}% - 5px)` }}
        />
      </div>
    </div>
  );
}
