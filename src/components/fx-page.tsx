import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { QuoteHead, RangePick, Split, Tape } from "@/components/frame";
import { CsvRecords } from "@/components/download";
import { CrossPanel } from "@/components/cross-panel";
import { MonthHeat } from "@/components/heat";
import { PriceChart } from "@/components/price-chart";
import { SymbolSearch } from "@/components/symbol-search";
import { formatNum } from "@/lib/format";
import { FX_PAIRS, type FxPair } from "@/lib/market/markets";
import { mergePrints, useBoardQuery, useEcbHistoryQuery, usePrintQuery, useReferenceQuery, useSeriesQuery } from "@/lib/market/queries";
import type { Board, ReferenceFx } from "@/lib/market/types";

const GROUPS = [
  { id: "g10", label: "G10" },
  { id: "asia", label: "Asia" },
  { id: "cross", label: "Crosses" },
] as const;

function perUsd(code: string, ref: ReferenceFx | undefined): number | null {
  const row = ref?.rates.find((rate) => rate.code === code);
  return row && row.perUsd > 0 ? row.perUsd : null;
}

function ecbQuote(symbol: string, ref: ReferenceFx | undefined): number | null {
  const pair = FX_PAIRS.find((row) => row.symbol === symbol);
  if (pair?.ecbCode) {
    const raw = perUsd(pair.ecbCode, ref);
    if (raw == null) return null;
    return pair.ecb === "invert" ? 1 / raw : raw;
  }
  if (symbol === "EURJPY=X") {
    const jpy = perUsd("JPY", ref);
    const eur = perUsd("EUR", ref);
    return jpy != null && eur != null ? jpy / eur : null;
  }
  if (symbol === "GBPJPY=X") {
    const jpy = perUsd("JPY", ref);
    const gbp = perUsd("GBP", ref);
    return jpy != null && gbp != null ? jpy / gbp : null;
  }
  return null;
}

export function FxPage({ initial, reference }: { initial: Board; reference: ReferenceFx }) {
  const [symbol, setSymbol] = useState("EURUSD=X");
  const [alias, setAlias] = useState("EUR/USD");
  const [range, setRange] = useState("1y");
  const book = FX_PAIRS;
  const symbols = FX_PAIRS.map((row) => row.symbol);
  const boardQ = useBoardQuery(symbols, initial);
  const printsQ = usePrintQuery(symbols);
  const refQ = useReferenceQuery(reference);
  const ecb = ecbQuote(symbol, refQ.data);
  const histQ = useEcbHistoryQuery(symbol, ecb != null);
  const quotes = mergePrints(boardQ.data?.quotes ?? [], printsQ.data?.prints);
  const bySymbol = new Map(quotes.map((quote) => [quote.symbol, quote]));
  const seriesQ = useSeriesQuery(symbol, range);
  const quote = bySymbol.get(symbol);
  const meta = FX_PAIRS.find((row) => row.symbol === symbol);
  const overlay = useMemo(() => {
    const points = histQ.data?.points;
    if (!seriesQ.data?.ok || !points?.length) return [];
    const byDate = new Map(points.map((point) => [point.d, point.rate]));
    return seriesQ.data.series.bars
      .filter((bar) => byDate.has(bar.d))
      .map((bar) => ({ d: bar.d, yahoo: bar.c, ecb: byDate.get(bar.d) ?? null }));
  }, [seriesQ.data, histQ.data]);

  return (
    <Split title="FX" symbol={symbol}>
      <div className="mt-3 max-w-xl">
        <SymbolSearch
          scope="fx"
          placeholder="Search a currency pair"
          onPick={(hit) => {
            setSymbol(hit.symbol);
            setAlias(hit.name);
          }}
        />
      </div>
      <QuoteHead
        name={alias}
        symbol={symbol}
        price={quote?.price ?? (seriesQ.data?.ok ? seriesQ.data.series.price : null)}
        change={quote?.changePct ?? (seriesQ.data?.ok ? seriesQ.data.series.changePct : null)}
        digits={meta?.digits ?? 4}
        checkedAt={printsQ.data?.fetchedAt}
        fetching={printsQ.isFetching}
        failed={printsQ.isError}
      />
      {ecb != null ? (
        <p className="mt-2 font-mono text-xs text-muted">
          ECB {formatNum(ecb, meta?.digits ?? 4)}
          {refQ.data?.date ? ` · ${refQ.data.date}` : ""}
        </p>
      ) : null}
      <div className="mt-4">
        <RangePick value={range} onChange={setRange} />
      </div>
      <div className="mt-3">
        {seriesQ.data?.ok ? <PriceChart bars={seriesQ.data.series.bars} file={symbol} /> : <p className="text-sm text-muted">{seriesQ.isPending ? "Loading" : "No bars"}</p>}
      </div>
      {seriesQ.data?.ok ? <MonthHeat bars={seriesQ.data.series.bars} /> : null}
      {overlay.length > 1 ? <EcbChart rows={overlay} digits={meta?.digits ?? 4} /> : null}
      <p className="mt-6 text-xs text-faint">
        Tape notes are the ECB reference{refQ.data?.date ? ` for ${refQ.data.date}` : ""}, not the live Yahoo quote. A cross is shown only when both legs have a reference rate.
      </p>
      {GROUPS.map((group) => (
        <section key={group.id}>
          <h2 className="mt-6 text-xs font-medium text-accent">{group.label}</h2>
          <Tape
            active={symbol}
            onPick={(next, label) => {
              setSymbol(next);
              setAlias(label);
            }}
            rows={book
              .filter((row) => row.group === group.id)
              .map((row) => ({
                symbol: row.symbol,
                name: row.name,
                price: bySymbol.get(row.symbol)?.price ?? null,
                changePct: bySymbol.get(row.symbol)?.changePct ?? null,
                digits: row.digits,
                note: tapeNote(row, refQ.data),
              }))}
          />
        </section>
      ))}
      <CrossPanel title="G10 correlation" symbols={FX_PAIRS.filter((row) => row.group === "g10").slice(0, 6).map((row) => row.symbol)} />
    </Split>
  );
}

function tapeNote(row: FxPair, ref: ReferenceFx | undefined): string | undefined {
  const value = ecbQuote(row.symbol, ref);
  if (value == null) return undefined;
  return `ECB ${formatNum(value, row.digits)}`;
}

function EcbChart({ rows, digits }: { rows: { d: string; yahoo: number; ecb: number | null }[]; digits: number }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <section className="mt-6">
      <h2 className="text-xs font-medium text-accent">Yahoo close and ECB reference</h2>
      <p className="mt-1 text-xs text-faint">Same quote convention as the chart above. The ECB line is the daily fix, not a tradable price.</p>
      {ready ? (
        <div className="mt-3 h-64 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-line)" vertical={false} />
              <XAxis dataKey="d" minTickGap={40} tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={["auto", "auto"]} tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} width={56} />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="rounded-md border border-line bg-bg px-3 py-2 text-xs">
                      <div className="text-muted">{label}</div>
                      {payload.map((point) => (
                        <div key={String(point.name)} className="tabular-nums">
                          {point.name}: {point.value == null ? "—" : formatNum(Number(point.value), digits)}
                        </div>
                      ))}
                    </div>
                  ) : null
                }
              />
              <Line dataKey="yahoo" name="Yahoo" stroke="var(--color-accent)" dot={false} strokeWidth={1.6} isAnimationActive={false} />
              <Line dataKey="ecb" name="ECB" stroke="var(--color-muted)" dot={false} strokeWidth={1.4} isAnimationActive={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-3 h-64 rounded-md bg-surface" />
      )}
      <CsvRecords file="ecb-history" rows={rows} columns={["d", "yahoo", "ecb"]} />
    </section>
  );
}
