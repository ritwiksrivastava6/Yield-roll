import { useState } from "react";
import { CrossPanel } from "@/components/cross-panel";
import { EnergyPanel } from "@/components/energy-panel";
import { MonthHeat } from "@/components/heat";
import { QuoteHead, RangePick, Split, Tape } from "@/components/frame";
import { PriceChart } from "@/components/price-chart";
import { SymbolSearch } from "@/components/symbol-search";
import { formatNum } from "@/lib/format";
import { ENERGY, METALS, listingDigits, type Listing } from "@/lib/market/markets";
import { mergePrints, useBoardQuery, useCotQuery, usePrintQuery, useSeriesQuery } from "@/lib/market/queries";
import type { Board, CotRow } from "@/lib/market/types";

function energyKind(symbol: string): "gas" | "crude" | null {
  if (symbol === "NG=F" || symbol === "UNG") return "gas";
  if (symbol === "CL=F" || symbol === "BZ=F" || symbol === "HO=F" || symbol === "RB=F" || symbol === "USO") return "crude";
  return null;
}

export function CommoditiesPage({ initial }: { initial: Board }) {
  const [symbol, setSymbol] = useState("GC=F");
  const [alias, setAlias] = useState("Gold");
  const [range, setRange] = useState("1y");
  const book = [...METALS, ...ENERGY];
  const symbols = book.map((row) => row.symbol);
  const boardQ = useBoardQuery(symbols, initial);
  const printsQ = usePrintQuery(symbols);
  const quotes = mergePrints(boardQ.data?.quotes ?? [], printsQ.data?.prints);
  const bySymbol = new Map(quotes.map((quote) => [quote.symbol, quote]));
  const seriesQ = useSeriesQuery(symbol, range);
  const cotQ = useCotQuery();
  const quote = bySymbol.get(symbol);
  const physical = energyKind(symbol);
  const pick = (next: string, label: string) => {
    setSymbol(next);
    setAlias(label);
  };

  return (
    <Split title="Commodities" symbol={symbol}>
      <div className="mt-3 max-w-xl">
        <SymbolSearch
          scope="commodity"
          placeholder="Search a metal or energy contract"
          onPick={(hit) => pick(hit.symbol, hit.name)}
        />
      </div>
      <QuoteHead
        name={alias}
        symbol={symbol}
        price={quote?.price ?? (seriesQ.data?.ok ? seriesQ.data.series.price : null)}
        change={quote?.changePct ?? (seriesQ.data?.ok ? seriesQ.data.series.changePct : null)}
        digits={listingDigits(symbol)}
        checkedAt={printsQ.data?.fetchedAt}
        fetching={printsQ.isFetching}
        failed={printsQ.isError}
      />
      <div className="mt-4">
        <RangePick value={range} onChange={setRange} />
      </div>
      <div className="mt-3">
        {seriesQ.data?.ok ? <PriceChart bars={seriesQ.data.series.bars} file={symbol} /> : <p className="text-sm text-muted">{seriesQ.isPending ? "Loading" : "No bars"}</p>}
      </div>
      {seriesQ.data?.ok ? <MonthHeat bars={seriesQ.data.series.bars} /> : null}
      <CotPanel row={cotQ.data?.rows.find((item) => item.symbol === symbol)} loading={cotQ.isPending} error={cotQ.data?.error} active={symbol} />
      {physical ? <EnergyPanel kind={physical} /> : null}
      <Section title="Metals" rows={METALS} active={symbol} onPick={pick} bySymbol={bySymbol} />
      <Section title="Energy" rows={ENERGY} active={symbol} onPick={pick} bySymbol={bySymbol} />
      <CrossPanel title="Return correlation" symbols={["GC=F", "SI=F", "HG=F", "CL=F", "NG=F", "BZ=F"]} />
    </Split>
  );
}

function Section({
  title,
  rows,
  active,
  onPick,
  bySymbol,
}: {
  title: string;
  rows: Listing[];
  active: string;
  onPick: (symbol: string, name: string) => void;
  bySymbol: Map<string, { price: number; changePct: number | null }>;
}) {
  return (
    <section>
      <h2 className="mt-6 text-xs font-medium text-accent">{title}</h2>
      <Tape
        active={active}
        onPick={onPick}
        rows={rows.map((row) => ({
          symbol: row.symbol,
          name: row.name,
          price: bySymbol.get(row.symbol)?.price ?? null,
          changePct: bySymbol.get(row.symbol)?.changePct ?? null,
          note: row.kind === "etf" ? "ETF" : row.kind === "metal" ? "Metal" : "Energy",
          digits: row.digits,
        }))}
      />
    </section>
  );
}

const COT_SYMBOLS = new Set(["GC=F", "SI=F", "HG=F", "CL=F", "BZ=F", "NG=F"]);

function CotPanel({ row, loading, error, active }: { row: CotRow | undefined; loading: boolean; error?: string; active: string }) {
  if (!COT_SYMBOLS.has(active)) return null;
  const net = row ? row.long - row.short : null;
  return (
    <section className="mt-8">
      <h2 className="text-sm font-medium text-muted">Managed money</h2>
      <p className="mt-1 text-xs text-faint">CFTC disaggregated futures only. Net is long minus short. Spreading is a separate bucket and is not in the net. Not the ETF.</p>
      {loading ? <p className="mt-3 text-sm text-muted">Loading the commitments report</p> : null}
      {!loading && error ? <p className="mt-3 text-sm text-down">{error}</p> : null}
      {!loading && !error && !row ? <p className="mt-3 text-sm text-muted">This contract was not in the latest futures file.</p> : null}
      {row ? (
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Stat label="Long" value={formatNum(row.long, 0)} hint={`Report ${row.reportDate}`} />
          <Stat label="Short" value={formatNum(row.short, 0)} hint="Managed money" />
          <Stat label="Spreading" value={formatNum(row.spread, 0)} hint="Not in the net" />
          <Stat label="Net" value={net == null ? "—" : formatNum(net, 0)} hint="Long − short" />
          <Stat label="Open interest" value={formatNum(row.openInterest, 0)} hint={row.market} />
        </div>
      ) : null}
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-xl font-medium tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-faint">{hint}</div>
    </div>
  );
}
