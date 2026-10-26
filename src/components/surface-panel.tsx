import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Heatmap } from "@/components/heat";
import { CsvRecords } from "@/components/download";
import { skewSurface } from "@/lib/market/skew";
import { useSurfaceQuery } from "@/lib/market/queries";
import type { SurfacePoint } from "@/lib/market/types";

const BUCKETS = [0.85, 0.9, 0.95, 1, 1.05, 1.1, 1.15];

function curvesOf(points: SurfacePoint[], spot: number) {
  const byExpiry = new Map<string, SurfacePoint[]>();
  for (const point of points) {
    const list = byExpiry.get(point.expiry) ?? [];
    list.push(point);
    byExpiry.set(point.expiry, list);
  }
  const expiries = [...byExpiry.keys()].sort();
  const picked = [0, Math.floor(expiries.length / 2), expiries.length - 1]
    .map((index) => expiries[index])
    .filter((value, index, all) => value && all.indexOf(value) === index);
  const rows = new Map<number, Record<string, number>>();
  for (const expiry of picked) {
    for (const point of byExpiry.get(expiry) ?? []) {
      const moneyness = Math.round((point.strike / spot) * 100);
      const row = rows.get(moneyness) ?? { m: moneyness };
      row[expiry] = point.iv * 100;
      rows.set(moneyness, row);
    }
  }
  return { expiries: picked, data: [...rows.values()].sort((a, b) => Number(a.m) - Number(b.m)) };
}

function gridOf(points: SurfacePoint[], spot: number) {
  const expiries = [...new Set(points.map((point) => point.expiry))].sort();
  return expiries.map((expiry) => ({
    label: expiry.slice(5),
    cells: BUCKETS.map((bucket) => {
      const near = points
        .filter((point) => point.expiry === expiry)
        .map((point) => ({ iv: point.iv, distance: Math.abs(point.strike / spot - bucket) }))
        .filter((point) => point.distance <= 0.025)
        .sort((a, b) => a.distance - b.distance)[0];
      return near ? near.iv * 100 : null;
    }),
  }));
}

export function SurfacePanel({ symbol }: { symbol: string }) {
  const query = useSurfaceQuery(symbol, true);
  const spot = query.data?.spot ?? null;
  const points = query.data?.points ?? [];
  const skew = useMemo(() => (spot ? curvesOf(points, spot) : { expiries: [], data: [] }), [points, spot]);
  const grid = useMemo(() => (spot ? gridOf(points, spot) : []), [points, spot]);
  const skewGrid = useMemo(() => (spot ? skewSurface(points, spot) : null), [points, spot]);
  const front = skewGrid?.term.find((row) => row.rr != null) ?? null;
  return (
    <section className="mt-6">
      <h2 className="text-sm font-medium">Implied vol</h2>
      <p className="mt-1 text-xs text-faint">OTM quotes from the live chain. Puts below spot, calls at and above. This is today's surface, not a history.</p>
      {query.isPending ? <p className="mt-3 text-sm text-muted">Loading surface</p> : null}
      {query.data?.error ? <p className="mt-3 text-sm text-down">{query.data.error}</p> : null}
      {skew.data.length ? (
        <>
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={skew.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-line)" vertical={false} />
              <XAxis dataKey="m" tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} unit="%" />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="rounded-md border border-line bg-bg-elev px-3 py-2 text-xs">
                      <div className="text-muted">{label}% of spot</div>
                      {payload.map((item) => (
                        <div key={String(item.dataKey)} className="font-mono text-fg">
                          {item.dataKey} {Number(item.value).toFixed(1)}%
                        </div>
                      ))}
                    </div>
                  ) : null
                }
              />
              {skew.expiries.map((expiry, index) => (
                <Line
                  key={expiry}
                  dataKey={expiry}
                  name={expiry}
                  stroke={index === 0 ? "var(--color-accent)" : index === 1 ? "var(--color-up)" : "var(--color-muted)"}
                  dot={false}
                  strokeWidth={1.7}
                  connectNulls
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <CsvRecords file={`${symbol}-skew`} rows={skew.data} />
        </>
      ) : null}
      {grid.length ? (
        <div className="mt-4">
          <h3 className="text-xs font-medium text-muted">Vol surface, percent</h3>
          <div className="mt-2">
            <Heatmap file={`${symbol}-vol-surface`} columns={BUCKETS.map((bucket) => `${Math.round(bucket * 100)}`)} rows={grid} scale="level" format={(value) => value.toFixed(0)} />
          </div>
        </div>
      ) : null}
      {skewGrid ? (
        <div className="mt-6">
          <h3 className="text-xs font-medium text-muted">Skew surface, vol points versus ATM</h3>
          <p className="mt-1 text-xs text-faint">
            Each cell is that moneyness minus at-the-money. Risk reversal is the 105 call vol minus the 95 put vol. Butterfly is the average of those wings minus ATM.
            {front?.rr != null ? ` Front ${front.expiry}: risk reversal ${front.rr.toFixed(1)}, butterfly ${front.fly == null ? "—" : front.fly.toFixed(1)}.` : ""}
          </p>
          <div className="mt-2">
            <Heatmap file={`${symbol}-skew-surface`} columns={skewGrid.columns} rows={skewGrid.rows} scale="diverge" format={(value) => value.toFixed(1)} />
          </div>
          {skewGrid.term.some((row) => row.rr != null || row.fly != null) ? (
            <>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={skewGrid.term} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-line)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <div className="rounded-md border border-line bg-bg-elev px-3 py-2 text-xs">
                          <div className="text-muted">{label}</div>
                          {payload.map((item) => (
                            <div key={String(item.dataKey)} className="font-mono text-fg">
                              {item.name} {Number(item.value).toFixed(1)}
                            </div>
                          ))}
                        </div>
                      ) : null
                    }
                  />
                  <Line dataKey="rr" name="Risk reversal" stroke="var(--color-accent)" dot={false} strokeWidth={1.7} connectNulls isAnimationActive={false} />
                  <Line dataKey="fly" name="Butterfly" stroke="var(--color-muted)" dot={false} strokeWidth={1.7} connectNulls isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <CsvRecords file={`${symbol}-risk-reversal`} rows={skewGrid.term} />
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
