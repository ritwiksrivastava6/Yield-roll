import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Change } from "@/components/bits";
import { CsvButton, TableExport } from "@/components/download";
import { formatNum, formatPx } from "@/lib/format";
import { useEnergyQuery } from "@/lib/market/queries";
import type { EnergyContext } from "@/lib/market/types";

export function EnergyPanel({ kind }: { kind: "gas" | "crude" }) {
  const query = useEnergyQuery();
  if (query.isPending) {
    return <p className="mt-6 text-sm text-muted">Pulling EIA reports and Open-Meteo weather…</p>;
  }
  if (query.isError || !query.data) {
    return <p className="mt-6 text-sm text-down">The physical feeds did not return.</p>;
  }
  return kind === "gas" ? <GasPhysical data={query.data} /> : <CrudePhysical data={query.data} />;
}

function GasPhysical({ data }: { data: EnergyContext }) {
  const total = data.storage.regions.find((row) => row.name.startsWith("total"));
  const rows = data.history.filter((row) => row.hdd != null && row.ng != null).map((row) => ({ d: row.d, hdd: row.hdd, ng: row.ng }));
  return (
    <section className="mt-8">
      <h2 className="text-sm font-medium text-muted">Physical gas</h2>
      <p className="mt-1 text-xs text-faint">EIA storage · Open-Meteo</p>
      {data.storage.error ? <p className="mt-3 text-sm text-down">{data.storage.error}</p> : null}
      {total ? (
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Lower 48 storage" value={`${formatNum(total.latest, 0)} ${total.unit}`} hint={`Week of ${data.storage.week}`} />
          <Stat label="Weekly change" value={signed(total.change, 0)} hint="EIA net change, Bcf" />
          <Stat label="5-year average" value={total.avg5 == null ? "—" : formatNum(total.avg5, 0)} hint="Same week, EIA" />
          <Stat label="Year ago" value={total.yearAgo == null ? "—" : formatNum(total.yearAgo, 0)} hint={data.storage.release || "EIA release"} />
        </div>
      ) : null}
      {data.storage.regions.length > 1 ? (
        <TableExport file="gas-storage">
        <div className="mt-3 overflow-x-auto rounded-md border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs text-muted">
              <tr>
                <th className="px-3 py-3 font-medium">Region</th>
                <th className="px-3 py-3 font-medium">Stocks</th>
                <th className="px-3 py-3 font-medium">Change</th>
                <th className="px-3 py-3 font-medium">5-year</th>
                <th className="px-3 py-3 font-medium">Year ago</th>
              </tr>
            </thead>
            <tbody>
              {data.storage.regions.map((row) => (
                <tr key={row.name} className="border-t border-line">
                  <td className="px-3 py-3 capitalize">{row.name}</td>
                  <td className="px-3 py-3 tabular-nums">{formatNum(row.latest, 0)}</td>
                  <td className="px-3 py-3 tabular-nums">{signed(row.change, 0)}</td>
                  <td className="px-3 py-3 tabular-nums">{row.avg5 == null ? "—" : formatNum(row.avg5, 0)}</td>
                  <td className="px-3 py-3 tabular-nums">{row.yearAgo == null ? "—" : formatNum(row.yearAgo, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </TableExport>
      ) : null}
      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Stat
          label="HDD vs NG=F return"
          value={corr(data.gasCorr?.ret)}
          hint={data.gasCorr ? `n = ${data.gasCorr.n} overlapping sessions` : "No overlap"}
        />
        <Stat
          label="HDD vs NG=F level"
          value={corr(data.gasCorr?.level)}
          hint="Pearson on the same dates. Not a causal claim."
        />
        <Stat
          label="Gulf wind, latest"
          value={latestWind(data)}
          hint="km/h max, Erath. Dates after today are forecast."
        />
      </div>
      {data.weatherError ? <p className="mt-3 text-sm text-down">{data.weatherError}</p> : null}
      {data.derivedMeanDays > 0 ? (
        <p className="mt-2 text-xs text-faint">
          On {data.derivedMeanDays} city-days Open-Meteo omitted the mean, so the average of that day’s high and low was used.
        </p>
      ) : null}
      {rows.length > 5 ? <DualChart rows={rows} left="hdd" right="ng" leftName="HDD °F" rightName="NG=F" /> : null}
      <Forecast data={data} />
      <Freight data={data} />
    </section>
  );
}

function CrudePhysical({ data }: { data: EnergyContext }) {
  const rows = data.history.filter((row) => row.wind != null && row.cl != null).map((row) => ({ d: row.d, hdd: row.wind, ng: row.cl }));
  return (
    <section className="mt-8">
      <h2 className="text-sm font-medium text-muted">Physical crude</h2>
      <p className="mt-1 text-xs text-faint">EIA weekly stocks · Open-Meteo wind</p>
      {data.petroleum.error ? <p className="mt-3 text-sm text-down">{data.petroleum.error}</p> : null}
      {data.petroleum.rows.length ? (
        <TableExport file="crude-stocks">
        <div className="mt-3 overflow-x-auto rounded-md border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs text-muted">
              <tr>
                <th className="px-3 py-3 font-medium">Stock</th>
                <th className="px-3 py-3 font-medium">Latest</th>
                <th className="px-3 py-3 font-medium">Week change</th>
                <th className="px-3 py-3 font-medium">Week ago</th>
                <th className="px-3 py-3 font-medium">Year ago</th>
              </tr>
            </thead>
            <tbody>
              {data.petroleum.rows.map((row) => (
                <tr key={row.name} className="border-t border-line">
                  <td className="px-3 py-3">{row.name}</td>
                  <td className="px-3 py-3 tabular-nums">{formatNum(row.latest, 1)}</td>
                  <td className="px-3 py-3 tabular-nums">{signed(row.change, 1)}</td>
                  <td className="px-3 py-3 tabular-nums">{row.weekAgo == null ? "—" : formatNum(row.weekAgo, 1)}</td>
                  <td className="px-3 py-3 tabular-nums">{row.yearAgo == null ? "—" : formatNum(row.yearAgo, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </TableExport>
      ) : null}
      <p className="mt-2 text-xs text-faint">Week ending {data.petroleum.week || "—"}. Unit: {data.petroleum.unit}.</p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Stat
          label="Wind vs CL=F return"
          value={corr(data.windCorr?.ret)}
          hint={data.windCorr ? `n = ${data.windCorr.n} overlapping sessions` : "No overlap"}
        />
        <Stat label="Latest Gulf wind" value={latestWind(data)} hint="Open-Meteo, km/h. Forecast dates are marked below." />
      </div>
      {data.weatherError ? <p className="mt-3 text-sm text-down">{data.weatherError}</p> : null}
      {rows.length > 5 ? <DualChart rows={rows} left="hdd" right="ng" leftName="Wind km/h" rightName="CL=F" /> : null}
      <Forecast data={data} windOnly />
      <Freight data={data} />
    </section>
  );
}

function Forecast({ data, windOnly }: { data: EnergyContext; windOnly?: boolean }) {
  if (!data.forecast.length) return null;
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium">Open-Meteo, after {data.today}</h3>
      <p className="mt-1 text-xs text-faint">Forecast weather only. No price is implied.</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {data.forecast.slice(0, 7).map((row) => (
          <div key={row.d} className="rounded-md border border-line bg-surface px-3 py-2">
            <div className="text-xs text-faint">{row.d.slice(5)}</div>
            <div className="mt-1 text-sm tabular-nums">{windOnly ? `${row.wind == null ? "—" : formatNum(row.wind, 0)} km/h` : `${row.hdd == null ? "—" : formatNum(row.hdd, 1)} HDD`}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Freight({ data }: { data: EnergyContext }) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium">Listed shipping prices</h3>
      <p className="mt-1 text-xs text-faint">ETF prices. Not a freight index.</p>
      {data.freight.length ? (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.freight.map((row) => (
            <div key={row.symbol} className="rounded-md border border-line bg-surface px-3 py-3">
              <div className="text-xs text-muted">{row.name}</div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-xl font-medium tabular-nums">{formatPx(row.price, "USD", 2)}</span>
                <Change value={row.changePct} />
              </div>
              <p className="mt-1 text-xs text-faint">
                {row.symbol} · {row.asOfLabel}
              </p>
              <p className="mt-1 text-xs text-muted">{row.note}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-lg font-medium tabular-nums">{value}</div>
      {hint ? <div className="mt-1 text-xs text-faint">{hint}</div> : null}
    </div>
  );
}

function DualChart({
  rows,
  left,
  right,
  leftName,
  rightName,
}: {
  rows: { d: string; hdd: number | null; ng: number | null }[];
  left: "hdd";
  right: "ng";
  leftName: string;
  rightName: string;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <div className="mt-4 h-64 rounded-md bg-surface" />;
  return (
    <>
    <div className="mt-4 h-64 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-line)" vertical={false} />
          <XAxis dataKey="d" minTickGap={36} tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="l" tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
          <YAxis yAxisId="r" orientation="right" tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
          <Tooltip
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div className="rounded-md border border-line bg-bg-elev px-3 py-2 text-xs">
                  <div className="mb-1 text-muted">{label}</div>
                  {payload.map((item) => (
                    <div key={String(item.name)} className="flex justify-between gap-4 tabular-nums">
                      <span className="text-muted">{item.name}</span>
                      <span>{formatNum(Number(item.value), 2)}</span>
                    </div>
                  ))}
                </div>
              ) : null
            }
          />
          <Line yAxisId="l" dataKey={left} name={leftName} stroke="var(--color-accent)" dot={false} strokeWidth={1.6} isAnimationActive={false} />
          <Line yAxisId="r" dataKey={right} name={rightName} stroke="var(--color-muted)" dot={false} strokeWidth={1.4} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-2 flex justify-end">
      <CsvButton file={leftName.includes("HDD") ? "hdd-ng" : "wind-cl"} columns={["date", leftName, rightName]} rows={rows.map((row) => [row.d, row.hdd, row.ng])} />
    </div>
    </>
  );
}

function signed(n: number | null, digits: number): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n > 0 ? "+" : ""}${formatNum(n, digits)}`;
}

function corr(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const rounded = Math.round(n * 100) / 100;
  return (rounded === 0 ? 0 : n).toFixed(2);
}

function latestWind(data: EnergyContext): string {
  const past = [...data.history].reverse().find((row) => row.wind != null);
  if (!past || past.wind == null) return "—";
  return `${formatNum(past.wind, 0)} km/h`;
}
