import { useEffect, useMemo, useState } from "react";
import { SymbolSearch } from "@/components/symbol-search";
import { PriceChart } from "@/components/price-chart";
import { BetaLine } from "@/components/beta-line";
import { Choice, QuoteHead, RangePick, Split, Tape } from "@/components/frame";
import { OptionBoard } from "@/components/option-board";
import { CrossPanel } from "@/components/cross-panel";
import { MonthHeat } from "@/components/heat";
import { SurfacePanel } from "@/components/surface-panel";
import { homeBench, rollingBeta } from "@/lib/market/screen";
import { EQUITY_MARKETS, equityBook, equitySearchScope, optionBook, type EquityMarketId } from "@/lib/market/markets";
import { mergePrints, useBoardQuery, useFilingsQuery, useOptionsQuery, usePrintQuery, useSeriesQuery } from "@/lib/market/queries";
import type { Board, FilingStrip } from "@/lib/market/types";

const KINDS = [
  { id: "stock", label: "Stocks" },
  { id: "etf", label: "ETFs" },
  { id: "option", label: "Options" },
] as const;

type Kind = (typeof KINDS)[number]["id"];

function place(symbol: string): { market: EquityMarketId; kind: Kind; name: string } | null {
  for (const market of EQUITY_MARKETS) {
    for (const kind of ["stock", "etf"] as const) {
      const hit = equityBook(market.id, kind).find((row) => row.symbol === symbol);
      if (hit) return { market: market.id, kind, name: hit.name };
    }
  }
  return null;
}

export function EquitiesPage({ initial, focus }: { initial: Board; focus?: string }) {
  const located = focus ? place(focus) : null;
  const [market, setMarket] = useState<EquityMarketId>(located?.market ?? "global");
  const [kind, setKind] = useState<Kind>(located?.kind ?? "stock");
  const [symbol, setSymbol] = useState(focus || "^GSPC");
  const [alias, setAlias] = useState(located?.name ?? (focus ? focus : "S&P 500"));
  const [range, setRange] = useState("1y");
  const [expiry, setExpiry] = useState("");
  const book = kind === "option" ? optionBook(market) : equityBook(market, kind);
  const symbols = book.map((row) => row.symbol);
  const seeded = market === "global" && kind === "stock";
  const boardQ = useBoardQuery(symbols, seeded ? initial : undefined);
  const printsQ = usePrintQuery(symbols);
  const quotes = mergePrints(boardQ.data?.quotes ?? [], printsQ.data?.prints);
  const bySymbol = new Map(quotes.map((quote) => [quote.symbol, quote]));
  const seriesQ = useSeriesQuery(symbol, range);
  const home = homeBench(symbol);
  const benchQ = useSeriesQuery(home.symbol, range);
  const historyQ = useSeriesQuery(symbol, "2y");
  const optionsQ = useOptionsQuery(symbol, expiry, kind === "option");

  useEffect(() => {
    setExpiry("");
  }, [symbol]);

  useEffect(() => {
    if (!focus) return;
    const hit = place(focus);
    setSymbol(focus);
    setAlias(hit?.name ?? focus);
    if (hit) {
      setMarket(hit.market);
      setKind(hit.kind);
    }
  }, [focus]);

  function onMarket(next: EquityMarketId) {
    setMarket(next);
    if (kind === "option") {
      if (symbol.startsWith("^")) {
        setSymbol("SPY");
        setAlias("SPDR S&P 500");
      }
      return;
    }
    const first = equityBook(next, kind)[0];
    if (!first) return;
    setSymbol(first.symbol);
    setAlias(first.name);
  }

  function onKind(next: Kind) {
    setKind(next);
    if (next === "option") {
      if (symbol.startsWith("^")) {
        setSymbol("SPY");
        setAlias("SPDR S&P 500");
      }
      return;
    }
    const first = equityBook(market, next)[0];
    if (!first) return;
    setSymbol(first.symbol);
    setAlias(first.name);
  }

  const beta = useMemo(() => {
    if (symbol === home.symbol || symbol.startsWith("^") || !seriesQ.data?.ok || !benchQ.data?.ok) return [];
    return rollingBeta(seriesQ.data.series.bars, benchQ.data.series.bars, 63);
  }, [symbol, home.symbol, seriesQ.data, benchQ.data]);

  const quote = bySymbol.get(symbol);
  const filingName = book.find((row) => row.symbol === symbol);
  const showFilings = market === "us" && filingName?.kind === "stock";
  const filingsQ = useFilingsQuery(symbol, showFilings);
  const live = quote?.price ?? (seriesQ.data?.ok ? seriesQ.data.series.price : null);
  const change = quote?.changePct ?? (seriesQ.data?.ok ? seriesQ.data.series.changePct : null);
  const name = alias || book.find((row) => row.symbol === symbol)?.name || (seriesQ.data?.ok ? seriesQ.data.series.name : symbol);
  const chain = optionsQ.data;
  const shownExpiry = expiry || chain?.expiry || "";

  return (
    <Split title="Equities" symbol={symbol}>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Choice label="Market" value={market} options={EQUITY_MARKETS} onChange={onMarket} />
        <Choice label="Instrument" value={kind} options={KINDS} onChange={onKind} />
      </div>
      <div className="mt-3 max-w-xl">
        <SymbolSearch
          scope={equitySearchScope(market)}
          placeholder={market === "global" ? "Search a listing" : "Search this market"}
          onPick={(hit) => {
            setSymbol(hit.symbol);
            setAlias(hit.name);
          }}
        />
      </div>
      <QuoteHead
        name={name}
        symbol={symbol}
        price={live}
        change={change}
        checkedAt={printsQ.data?.fetchedAt}
        fetching={printsQ.isFetching}
        failed={printsQ.isError}
      />
      <div className="mt-4">
        <RangePick value={range} onChange={setRange} />
      </div>
      {kind === "option" ? (
        <OptionBoard
          loading={optionsQ.isPending || optionsQ.isFetching}
          error={optionsQ.isError ? "Option chain did not load" : chain?.error}
          rate={chain?.rate ?? null}
          dividend={chain?.dividendYield ?? null}
          expiries={chain?.expiries ?? []}
          expiry={shownExpiry}
          onExpiry={setExpiry}
          rows={chain?.rows ?? []}
        />
      ) : null}
      <div className="mt-3">
        {seriesQ.data?.ok ? <PriceChart bars={seriesQ.data.series.bars} file={symbol} /> : <p className="text-sm text-muted">{seriesQ.isPending ? "Loading" : "No bars"}</p>}
      </div>
      <BetaLine data={beta} against={home.vs} />
      {seriesQ.data?.ok && benchQ.data && !symbol.startsWith("^") && symbol !== home.symbol && beta.length < 2 ? (
        <p className="mt-3 text-xs text-faint">No rolling beta. {home.vs.charAt(0).toUpperCase() + home.vs.slice(1)} did not return enough history to line up with this name.</p>
      ) : null}
      {seriesQ.data?.ok ? (
        <MonthHeat
          bars={seriesQ.data.series.bars}
          history={historyQ.data?.ok ? historyQ.data.series.bars.map((bar) => bar.c) : null}
        />
      ) : null}
      {showFilings ? <Filings filings={filingsQ.data} loading={filingsQ.isPending} /> : null}
      {kind === "option" ? <SurfacePanel symbol={symbol} /> : null}
      <Tape
        active={symbol}
        onPick={(next, label) => {
          setSymbol(next);
          setAlias(label);
        }}
        rows={book.map((row) => {
          const print = bySymbol.get(row.symbol);
          return {
            symbol: row.symbol,
            name: row.name,
            price: print?.price ?? null,
            changePct: print?.changePct ?? null,
            note: row.kind === "index" ? "Index" : row.kind === "etf" ? "ETF" : undefined,
          };
        })}
      />
      {boardQ.data?.errors?.length ? (
        <p className="mt-2 text-xs text-down">{boardQ.data.errors.map((row) => row.symbol).join(", ")} did not print</p>
      ) : null}
      <CrossPanel
        title="Return correlation"
        symbols={book.filter((row) => row.kind !== "index").slice(0, 6).map((row) => row.symbol)}
      />
    </Split>
  );
}

function Filings({ filings, loading }: { filings: FilingStrip | undefined; loading: boolean }) {
  return (
    <section className="mt-6">
      <h2 className="text-xs font-medium text-accent">Filings</h2>
      <p className="mt-1 text-xs text-faint">Latest 10-K, 10-Q, and 8-K on EDGAR. Insider Forms 4 are left out. Not a ratio.</p>
      {loading ? <p className="mt-3 text-sm text-muted">Loading filings</p> : null}
      {!loading && filings?.error ? <p className="mt-3 text-sm text-down">{filings.error}</p> : null}
      {!loading && filings && !filings.error && !filings.filings.length ? <p className="mt-3 text-sm text-muted">No 10-K, 10-Q, or 8-K in the recent list.</p> : null}
      {filings?.filings.length ? (
        <ul className="mt-3 divide-y divide-line rounded-md border border-line">
          {filings.filings.map((row) => (
            <li key={row.url} className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-3 text-sm">
              <a href={row.url} target="_blank" rel="noreferrer" className="font-medium text-fg">
                {row.form}
              </a>
              <span className="font-mono text-xs text-muted">{row.filed}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
