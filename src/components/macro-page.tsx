import { useEffect, useState, type ReactNode } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Change, FeedErrors, LiveMark, LivePrice } from "@/components/bits";
import { CsvRecords, TableExport } from "@/components/download";
import { formatNum, formatPx } from "@/lib/format";
import { mergePrints, useMacroQuery, usePrintQuery, useWorldBankQuery } from "@/lib/market/queries";
import type { MacroBundle, Quote, WbBundle, WbSeries } from "@/lib/market/types";
import { MACRO_PRINTS, WB_COUNTRIES, WB_DEFAULT } from "@/lib/market/universe";

const STROKES = [
  "var(--color-accent)",
  "var(--color-fg)",
  "var(--color-up)",
  "var(--color-down)",
  "var(--color-muted)",
  "var(--color-faint)",
] as const;

const MAX_COUNTRIES = 6;

export function MacroPage({ initial }: { initial: MacroBundle }) {
  const query = useMacroQuery(initial);
  const printsQ = usePrintQuery(MACRO_PRINTS.map((row) => row.symbol));
  const data = query.data ?? initial;
  const market = mergePrints(data.market, printsQ.data?.prints);
  const bySymbol = new Map(market.map((quote) => [quote.symbol, quote]));
  const printFailed = Boolean(
    printsQ.isError || (printsQ.data && printsQ.data.prints.length === 0 && printsQ.data.errors.length > 0),
  );
  const [picked, setPicked] = useState<string[]>(() => (initial.wbCountries?.length ? [...initial.wbCountries] : [...WB_DEFAULT]));
  const [wbId, setWbId] = useState("FP.CPI.TOTL.ZG");
  const pickedKey = picked.join("|");
  const macroCountries = data.wbCountries?.length ? data.wbCountries : [...WB_DEFAULT];
  const fromMacro: WbBundle | undefined =
    macroCountries.join("|") === pickedKey
      ? { countries: macroCountries, updated: data.wbUpdated, series: data.wb }
      : undefined;
  const wbQ = useWorldBankQuery(picked, fromMacro);
  const bundle = wbQ.data && wbQ.data.countries.join("|") === pickedKey ? wbQ.data : fromMacro ?? null;
  const selected = bundle?.series.find((row) => row.id === wbId) ?? bundle?.series[0];
  const labels = new Map<string, string>(WB_COUNTRIES.map((row) => [row.id, row.label]));

  function toggle(id: string) {
    setPicked((current) => {
      if (current.includes(id)) {
        if (current.length === 1) return current;
        return current.filter((item) => item !== id);
      }
      if (current.length >= MAX_COUNTRIES) return current;
      return [...current, id];
    });
  }

  return (
    <div className="px-4 py-6 sm:px-6">
      <h1 className="font-display text-4xl leading-tight">Macro</h1>
      <LiveMark checkedAt={printsQ.data?.fetchedAt} fetching={printsQ.isFetching} failed={printFailed} />

      <section className="mt-6">
        <h2 className="text-sm font-medium text-muted">Market prints</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {MACRO_PRINTS.map((row) => (
            <Mini
              key={row.symbol}
              label={row.label}
              name={row.name}
              quote={bySymbol.get(row.symbol)}
              digits={row.digits}
            />
          ))}
        </div>
        <div className="mt-4">
          <FeedErrors rows={[...data.marketErrors, ...(printsQ.data?.errors ?? [])]} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-muted">World Bank</h2>
        <div className="mt-3 flex flex-wrap gap-1" role="group" aria-label="Countries">
          {WB_COUNTRIES.map((country) => {
            const on = picked.includes(country.id);
            const locked = (on && picked.length === 1) || (!on && picked.length >= MAX_COUNTRIES);
            return (
              <button
                key={country.id}
                type="button"
                aria-pressed={on}
                disabled={locked}
                onClick={() => toggle(country.id)}
                className={
                  "min-h-11 rounded-md px-3 text-sm " +
                  (on ? "bg-accent text-accent-ink" : "border border-line text-muted") +
                  (locked && !on ? " opacity-40" : "")
                }
              >
                {country.label}
              </button>
            );
          })}
        </div>
        {!bundle ? (
          <p className="mt-4 text-sm text-muted">
            {wbQ.isError ? (wbQ.error instanceof Error ? wbQ.error.message : "World Bank request failed") : "Loading"}
          </p>
        ) : (
          <>
            <TableExport file="world-bank">
            <div className="mt-4 overflow-x-auto rounded-md border border-line">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="bg-surface text-xs text-muted">
                  <tr>
                    <th className="px-3 py-3 font-medium">Indicator</th>
                    {bundle.countries.map((id) => (
                      <th key={id} className="whitespace-nowrap px-3 py-3 font-medium">
                        {labels.get(id) ?? id}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bundle.series.map((row) => {
                    const active = selected?.id === row.id;
                    return (
                      <tr key={row.id} className={active ? "bg-surface" : "border-t border-line"}>
                        <td className="px-3 py-3">
                          <button type="button" onClick={() => setWbId(row.id)} className="text-left">
                            <span className="block font-medium">{row.name}</span>
                            <span className="text-xs text-faint">
                              {row.unit}
                              {row.error ? ` · ${row.error}` : ""}
                            </span>
                          </button>
                        </td>
                        {bundle.countries.map((id) => (
                          <td key={id} className="whitespace-nowrap px-3 py-3">
                            <span className="block tabular-nums">{cell(row.latest[id]?.value, row.digits)}</span>
                            <span className="block text-xs text-faint">{row.latest[id]?.year ?? "—"}</span>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </TableExport>
            {selected ? (
              <div className="mt-4 rounded-md border border-line bg-bg-elev p-4">
                <h3 className="text-sm font-medium">
                  {selected.name}
                  <span className="ml-2 text-xs font-normal text-faint">{selected.unit}</span>
                </h3>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  {bundle.countries.map((id, index) => (
                    <span key={id} className="inline-flex items-center gap-1.5">
                      <span className="inline-block h-1.5 w-3 rounded-sm" style={{ background: STROKES[index] ?? STROKES[0] }} />
                      {labels.get(id) ?? id}
                    </span>
                  ))}
                </div>
                <WbChart series={selected} countries={bundle.countries} labels={labels} />
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}

function cell(value: number | null | undefined, digits: number): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return formatNum(value, digits);
}

function Mini({ label, name, quote, digits }: { label: string; name: string; quote?: Quote; digits: number }) {
  return (
    <div className="rounded-md border border-line bg-bg-elev px-3 py-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-xs text-faint">{name}</div>
      <div className="mt-1 text-xl font-medium tabular-nums">
        <LivePrice price={quote?.price}>{quote ? formatPx(quote.price, quote.currency, digits) : "—"}</LivePrice>
      </div>
      <Change value={quote?.changePct ?? null} />
    </div>
  );
}

function ChartFrame({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <div className="mt-3 h-64 rounded-md bg-surface" />;
  return <div className="mt-3 h-64 w-full min-w-0">{children}</div>;
}

function WbChart({
  series,
  countries,
  labels,
}: {
  series: WbSeries;
  countries: string[];
  labels: Map<string, string>;
}) {
  const rows = series.points
    .filter((point) => countries.some((id) => point.values[id] != null))
    .map((point) => {
      const row: { d: string } & Record<string, string | number | null> = { d: point.year };
      for (const id of countries) row[id] = point.values[id] ?? null;
      return row;
    });
  if (rows.length < 2) return <p className="mt-3 text-sm text-muted">No plottable history.</p>;
  return (
    <>
    <ChartFrame>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-line)" vertical={false} />
          <XAxis dataKey="d" minTickGap={28} tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} width={56} domain={["auto", "auto"]} />
          <Tooltip
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div className="rounded-md border border-line bg-bg px-3 py-2 text-xs">
                  <div className="text-muted">{label}</div>
                  {payload.map((item) => (
                    <div key={String(item.dataKey)} className="tabular-nums">
                      {labels.get(String(item.dataKey)) ?? item.name}: {item.value == null ? "—" : formatNum(Number(item.value), series.digits)}
                    </div>
                  ))}
                </div>
              ) : null
            }
          />
          {countries.map((id, index) => (
            <Line
              key={id}
              dataKey={id}
              name={labels.get(id) ?? id}
              stroke={STROKES[index] ?? STROKES[0]}
              dot={false}
              strokeWidth={1.6}
              isAnimationActive={false}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
    <CsvRecords file={`wb-${series.id}`} rows={rows} />
    </>
  );
}
