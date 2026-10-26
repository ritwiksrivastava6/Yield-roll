import { useState } from "react";
import { SymbolSearch } from "@/components/symbol-search";
import { PriceChart } from "@/components/price-chart";
import { OptionBoard } from "@/components/option-board";
import { CrossPanel } from "@/components/cross-panel";
import { MonthHeat } from "@/components/heat";
import { SurfacePanel } from "@/components/surface-panel";
import { Choice, QuoteHead, RangePick, Split, Tape } from "@/components/frame";
import { formatNum } from "@/lib/format";
import { RATE_IMPLIED, RATES_BOOKS, RATES_MARKETS, RATES_OPTIONABLE, listingDigits, type Listing, type RatesMarketId } from "@/lib/market/markets";
import { mergePrints, useBoardQuery, useOfficialRatesQuery, useOptionsQuery, usePrintQuery, useSeriesQuery } from "@/lib/market/queries";
import type { Board, OfficialRates } from "@/lib/market/types";

export function RatesPage({ initial, official }: { initial: Board; official: OfficialRates }) {
  const [market, setMarket] = useState<RatesMarketId>("global");
  const [symbol, setSymbol] = useState("^TNX");
  const [alias, setAlias] = useState("US 10-year");
  const [range, setRange] = useState("1y");
  const book = RATES_BOOKS[market];
  const symbols = book.map((row) => row.symbol);
  const boardQ = useBoardQuery(symbols, market === "global" ? initial : undefined);
  const printsQ = usePrintQuery(symbols);
  const quotes = mergePrints(boardQ.data?.quotes ?? [], printsQ.data?.prints);
  const bySymbol = new Map(quotes.map((quote) => [quote.symbol, quote]));
  const seriesQ = useSeriesQuery(symbol, range);
  const optionable = RATES_OPTIONABLE.has(symbol);
  const [expiry, setExpiry] = useState("");
  const optionsQ = useOptionsQuery(symbol, expiry, optionable);
  const officialQ = useOfficialRatesQuery(official);
  const fixes = officialQ.data ?? official;
  const quote = bySymbol.get(symbol);
  const digits = listingDigits(symbol);
  const price = quote?.price ?? (seriesQ.data?.ok ? seriesQ.data.series.price : null);
  const implied = RATE_IMPLIED.has(symbol) && price != null && price > 80 && price < 100 ? 100 - price : null;
  const chain = optionsQ.data;
  const sections = [
    { label: "Yields", rows: book.filter((row) => row.kind === "yield"), note: "Yield index" },
    { label: "Bond futures", rows: book.filter((row) => row.kind === "future" && !RATE_IMPLIED.has(row.symbol)), note: "Future" },
    { label: "IR futures", rows: book.filter((row) => RATE_IMPLIED.has(row.symbol)), note: "100 − price" },
    { label: "Bonds and credit", rows: book.filter((row) => row.kind === "fund"), note: "Fund price" },
  ].filter((section) => section.rows.length > 0);

  return (
    <Split title="Rates" symbol={symbol}>
      <div className="mt-4 max-w-xs">
        <Choice
          label="Market"
          value={market}
          options={RATES_MARKETS}
          onChange={(next) => {
            setMarket(next);
            const first = RATES_BOOKS[next][0];
            if (first) {
              setSymbol(first.symbol);
              setAlias(first.name);
            }
          }}
        />
      </div>
      <div className="mt-3 max-w-xl">
        <SymbolSearch
          scope="rates"
          placeholder="Search a bond, future, or yield"
          onPick={(hit) => {
            setSymbol(hit.symbol);
            setAlias(hit.name);
          }}
        />
      </div>
      <QuoteHead
        name={alias || symbol}
        symbol={symbol}
        price={price}
        change={quote?.changePct ?? (seriesQ.data?.ok ? seriesQ.data.series.changePct : null)}
        digits={digits}
        checkedAt={printsQ.data?.fetchedAt}
        fetching={printsQ.isFetching}
        failed={printsQ.isError}
      />
      {implied != null ? <p className="mt-2 font-mono text-xs text-accent">Implied {formatNum(implied, 3)} · 100 − price</p> : null}
      {market === "global" ? <OfficialStrip data={fixes} /> : null}
      <p className="mt-2 text-xs text-faint">
        {market === "global"
          ? "The row above is the Treasury par curve and the New York Fed overnight prints. OTC swaps and CDS are still not on a keyless feed. Futures below are listed contracts. Credit rows are bond-fund prices."
          : "OTC swap fixings and CDS are not on a keyless feed. Credit rows are bond-fund prices."}
      </p>
      <div className="mt-4">
        <RangePick value={range} onChange={setRange} />
      </div>
      {optionable ? (
        <OptionBoard
          loading={optionsQ.isPending}
          error={optionsQ.isError ? "Option chain did not load" : chain?.error}
          rate={chain?.rate ?? null}
          dividend={chain?.dividendYield ?? null}
          expiries={chain?.expiries ?? []}
          expiry={expiry || chain?.expiry || ""}
          onExpiry={setExpiry}
          rows={chain?.rows ?? []}
        />
      ) : (
        <p className="mt-3 text-xs text-faint">No Yahoo equity-style chain on this contract. Chains load for the Treasury and credit ETFs.</p>
      )}
      {optionable ? <SurfacePanel symbol={symbol} /> : null}
      <div className="mt-3">
        {seriesQ.data?.ok ? <PriceChart bars={seriesQ.data.series.bars} file={symbol} /> : <p className="text-sm text-muted">{seriesQ.isPending ? "Loading" : "No bars"}</p>}
      </div>
      {seriesQ.data?.ok ? <MonthHeat bars={seriesQ.data.series.bars} /> : null}
      {sections.map((section) => (
        <section key={section.label}>
          <h2 className="mt-6 text-xs font-medium text-accent">{section.label}</h2>
          <Tape
            active={symbol}
            onPick={(next, label) => {
              setSymbol(next);
              setAlias(label);
              setExpiry("");
            }}
            rows={section.rows.map((row: Listing) => ({
              symbol: row.symbol,
              name: row.name,
              price: bySymbol.get(row.symbol)?.price ?? null,
              changePct: bySymbol.get(row.symbol)?.changePct ?? null,
              note: section.note,
              digits: row.digits,
            }))}
          />
        </section>
      ))}
      <CrossPanel
        title="Correlation of daily changes"
        symbols={book.filter((row) => row.kind === "yield" || row.symbol === "TLT" || row.symbol === "HYG" || row.symbol === "SR3=F").slice(0, 6).map((row) => row.symbol)}
      />
    </Split>
  );
}

function OfficialStrip({ data }: { data: OfficialRates }) {
  const cells = [
    ...data.curve.map((row) => ({ label: row.label, value: row.yield, hint: data.date ? `Par yield ${data.date}` : "Treasury par yield" })),
    { label: "SOFR", value: data.sofr?.rate ?? null, hint: data.sofr ? `NY Fed ${data.sofr.date}` : "NY Fed" },
    { label: "EFFR", value: data.effr?.rate ?? null, hint: data.effr ? `NY Fed ${data.effr.date}` : "NY Fed" },
  ];
  return (
    <section className="mt-4">
      <h2 className="text-xs font-medium text-accent">Official fixes</h2>
      <p className="mt-1 text-xs text-faint">Not the Yahoo yield index on the chart. SOFR and EFFR are overnight prints, not swap rates.</p>
      {data.error ? <p className="mt-2 text-xs text-down">{data.error}</p> : null}
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-6">
        {cells.map((cell) => (
          <div key={cell.label} className="rounded-md border border-line bg-surface px-3 py-3">
            <div className="text-xs text-muted">{cell.label}</div>
            <div className="mt-1 text-xl font-medium tabular-nums">{cell.value == null ? "—" : `${formatNum(cell.value, 2)}%`}</div>
            <div className="mt-1 text-xs text-faint">{cell.hint}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
