import { useEffect, useMemo, useState } from "react";
import { Change, FeedErrors, LiveMark, LivePrice, RangeMark, Stat } from "@/components/bits";
import { EnergyPanel } from "@/components/energy-panel";
import { PriceChart } from "@/components/price-chart";
import { TableExport } from "@/components/download";
import { SymbolSearch } from "@/components/symbol-search";
import { formatNum, formatPx, formatVol, pctClass } from "@/lib/format";
import { searchSymbols } from "@/lib/market/api";
import { betaCorr, GRAMS_PER_TROY_OZ, inrBullion, indicatorFrame, lastNum, rsi, sma } from "@/lib/market/math";
import { mergePrints, useBoardQuery, usePrintQuery, useSeriesQuery } from "@/lib/market/queries";
import type { Board, Quote, Series, SeriesResult } from "@/lib/market/types";
import {
  RANGES,
  SEGMENTS,
  instrumentOf,
  type RangeKey,
  type SegmentId,
} from "@/lib/market/universe";

export function SegmentPage({
  id,
  initial,
  querySymbol = "",
}: {
  id: SegmentId;
  initial: { board: Board; series: SeriesResult };
  querySymbol?: string;
}) {
  const seg = SEGMENTS[id];
  const [symbol, setSymbol] = useState(id === "gas" || id === "crude" ? seg.benchmark : querySymbol || seg.benchmark);
  const [alias, setAlias] = useState("");
  const [range, setRange] = useState<RangeKey>("1y");
  useEffect(() => {
    if (!querySymbol) return;
    if (id !== "gas" && id !== "crude") {
      setSymbol(querySymbol);
      return;
    }
    let cancel = false;
    searchSymbols({ data: { q: querySymbol, scope: id } })
      .then((hits) => {
        const match = hits.find((hit) => hit.symbol === querySymbol);
        if (!cancel && match) {
          setSymbol(match.symbol);
          setAlias(match.name);
        }
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, [querySymbol, id]);
  const boardQ = useBoardQuery(seg.fetch, initial.board);
  const printSymbols = useMemo(() => (seg.fetch.includes(symbol) ? seg.fetch : [...seg.fetch, symbol]), [seg, symbol]);
  const printsQ = usePrintQuery(printSymbols);
  const board = boardQ.data ?? initial.board;
  const printFailed = Boolean(printsQ.isError || (printsQ.data && printsQ.data.prints.length === 0 && printsQ.data.errors.length > 0));
  const seriesQ = useSeriesQuery(symbol, range, {
    symbol: seg.benchmark,
    range: "1y",
    result: initial.series,
  });
  const series = seriesQ.data?.ok ? seriesQ.data.series : null;
  const quotes = useMemo(() => {
    const merged = mergePrints(board.quotes, printsQ.data?.prints);
    if (series && series.symbol === symbol && !merged.some((row) => row.symbol === series.symbol)) {
      return mergePrints([...merged, quoteFromSeries(series)], printsQ.data?.prints);
    }
    return merged;
  }, [board.quotes, printsQ.data, series, symbol]);
  const bySymbol = useMemo(() => new Map(quotes.map((q) => [q.symbol, q])), [quotes]);
  const quote = bySymbol.get(symbol);
  const frame = useMemo(() => (series ? indicatorFrame(series.bars) : null), [series]);
  const bench = bySymbol.get(seg.benchmark);
  const tape = useMemo(() => {
    if (seg.symbols.some((item) => item.symbol === symbol)) return seg.symbols;
    const known = instrumentOf(symbol);
    return [
      {
        symbol,
        name: known?.name || alias || (series?.symbol === symbol ? series.name : symbol),
        role: known?.role ?? "stock",
        note: known?.note ?? (series?.exchange || "Yahoo"),
        digits: known?.digits,
        percent: known?.percent,
      },
      ...seg.symbols,
    ];
  }, [seg, symbol, alias, series]);
  const rowStats = useMemo(() => buildRowStats(tape.map((s) => s.symbol), bySymbol, bench), [tape, bySymbol, bench]);

  const meta = instrumentOf(symbol);
  const snap = frame?.snapshot;

  return (
    <div className="px-4 py-6 sm:px-6">
      <p className="text-xs tracking-wide text-accent">{seg.kicker}</p>
      <h1 className="mt-2 font-display text-4xl leading-tight">{seg.title}</h1>
      <p className="mt-3 max-w-3xl text-sm text-muted">{seg.lede}</p>
      <div className="mt-4 max-w-xl">
        <SymbolSearch
          scope={id === "us" ? "us" : id === "india" ? "india" : id === "gas" ? "gas" : id === "crude" ? "crude" : "any"}
          placeholder={
            id === "us"
              ? "Any US listing, such as COST"
              : id === "india"
                ? "Any NSE or BSE listing, such as TATASTEEL"
                : id === "gas"
                  ? "A gas listing, such as EQT or GAIL"
                  : id === "crude"
                    ? "A crude listing, such as XOM or RELIANCE"
                    : "Any Yahoo symbol, such as NEM"
          }
          onPick={(hit) => {
            setSymbol(hit.symbol);
            setAlias(hit.name);
          }}
        />
      </div>
      <p className="mt-3 border-l-2 border-accent bg-surface px-4 py-3 text-sm text-muted">{seg.caveat}</p>
      <p className="mt-3 text-xs text-faint">
        {printsQ.data?.source ?? board.source} · board pulled {board.fetchedAtLabel}
        {series?.adjusted ? " · chart is split- and dividend-adjusted where Yahoo provides an adjusted close" : ""}
      </p>
      <LiveMark checkedAt={printsQ.data?.fetchedAt} fetching={printsQ.isFetching} failed={printFailed} />
      <div className="mt-4">
        <FeedErrors rows={board.errors} />
      </div>

      <section className="mt-6 rounded-lg border border-line bg-bg-elev">
        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium">{meta?.name ?? quote?.name ?? symbol}</h2>
              <p className="text-xs text-faint">
                {symbol}
                {quote?.exchange ? ` · ${quote.exchange}` : ""}
                {quote?.currency ? ` · ${quote.currency}` : ""}
                {meta?.note ? ` · ${meta.note}` : ""}
              </p>
              <div className="mt-3 flex items-baseline gap-3">
                <LivePrice price={quote?.price} className="text-3xl font-medium tabular-nums">
                  {quote ? formatPx(quote.price, quote.currency, meta?.digits) : "—"}
                  {meta?.percent ? "%" : ""}
                </LivePrice>
                <span className="text-lg">
                  <Change value={quote?.changePct ?? null} />
                </span>
              </div>
              <p className="mt-1 text-xs text-faint">{quote ? quote.asOfLabel : "Waiting on a print"}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {RANGES.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRange(key)}
                  className={
                    "min-h-11 rounded-md px-3 text-sm " +
                    (range === key ? "bg-accent text-accent-ink" : "bg-surface text-muted")
                  }
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
          {seriesQ.data && !seriesQ.data.ok ? (
            <p className="text-sm text-down">{seriesQ.data.message}</p>
          ) : series && frame ? (
            <PriceChart bars={series.bars} file={symbol} />
          ) : (
            <div className="h-72 rounded-md bg-surface" />
          )}
          <p className="text-xs text-faint">Close, 50-session average, 200-session average. Averages appear once the loaded window is long enough.</p>
        </div>
        {snap && quote ? (
          <div className="grid grid-cols-2 border-t border-line md:grid-cols-4 xl:grid-cols-8">
            <Stat label="RSI 14" value={num(snap.rsi, 1)} hint="Wilder" />
            <Stat label="MACD" value={num(snap.macd, 2)} hint={snap.macdHist == null ? "12, 26, 9" : `Hist ${num(snap.macdHist, 2)}`} />
            <Stat label="Bollinger %b" value={num(snap.pctB, 2)} hint="20, 2σ" />
            <Stat label="ATR 14" value={snap.atrPct == null ? "—" : `${num(snap.atrPct, 2)}%`} hint="of price" />
            <Stat label="Realized vol" value={snap.rv20 == null ? "—" : `${num(snap.rv20, 1)}%`} hint="20d, ann." />
            <Stat
              label="Drawdown"
              value={snap.drawdown == null ? "—" : `${num(snap.drawdown, 1)}%`}
              tone={snap.drawdown != null && snap.drawdown < -1 ? "down" : "flat"}
              hint={snap.maxDrawdown == null ? "from peak in window" : `Max ${num(snap.maxDrawdown, 1)}%`}
            />
            <Stat
              label="1 month"
              value={snap.ret21 == null ? "—" : `${snap.ret21 > 0 ? "+" : ""}${num(snap.ret21, 1)}%`}
              tone={signTone(snap.ret21)}
              hint="21 sessions"
            />
            <Stat
              label="1 year"
              value={snap.ret252 == null ? "—" : `${snap.ret252 > 0 ? "+" : ""}${num(snap.ret252, 1)}%`}
              tone={signTone(snap.ret252)}
              hint={snap.ret252Sessions == null ? "Needs a longer window" : `${snap.ret252Sessions} sessions`}
            />
          </div>
        ) : null}
        {snap ? (
          <div className="grid grid-cols-1 gap-px border-t border-line bg-line sm:grid-cols-3">
            <Dist label="vs 20-session" value={snap.distSma20} level={snap.sma20} currency={quote?.currency} />
            <Dist label="vs 50-session" value={snap.distSma50} level={snap.sma50} currency={quote?.currency} />
            <Dist label="vs 200-session" value={snap.distSma200} level={snap.sma200} currency={quote?.currency} />
          </div>
        ) : null}
      </section>

      <CrossPanel id={id} bySymbol={bySymbol} />
      {id === "gas" || id === "crude" ? <EnergyPanel kind={id} /> : null}

      {seg.context.length ? (
        <section className="mt-6">
          <h2 className="text-sm font-medium text-muted">Around this tape</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {seg.context.map((item) => {
              const q = bySymbol.get(item.symbol);
              return (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() => setSymbol(item.symbol)}
                  className="rounded-md border border-line bg-surface px-3 py-3 text-left"
                >
                  <div className="text-xs text-muted">{item.name}</div>
                  <div className="mt-1 text-lg font-medium tabular-nums">
                    {q ? formatPx(q.price, q.currency, item.digits) : "—"}
                    {item.percent ? "%" : ""}
                  </div>
                  <div className="text-sm">
                    <Change value={q?.changePct ?? null} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="text-sm font-medium text-muted">Tape</h2>
        <p className="mt-1 text-xs text-faint">
          Select a row to load its chart. RSI, distance from the 50-session average, and beta use the one-year daily
          closes already on the board. Beta is against {instrumentOf(seg.benchmark)?.name ?? seg.benchmark}.
        </p>
        <TableExport file="segment-tape">
        <div className="mt-3 hidden overflow-hidden rounded-md border border-line md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs text-muted">
              <tr>
                <th className="px-3 py-3 font-medium">Name</th>
                <th className="px-3 py-3 font-medium">Last</th>
                <th className="px-3 py-3 font-medium">Day</th>
                <th className="px-3 py-3 font-medium">Volume</th>
                <th className="px-3 py-3 font-medium">RSI</th>
                <th className="px-3 py-3 font-medium">vs 50d</th>
                <th className="px-3 py-3 font-medium">β 1y</th>
                <th className="px-3 py-3 font-medium">52-week</th>
              </tr>
            </thead>
            <tbody>
              {tape.map((item) => {
                const q = bySymbol.get(item.symbol);
                const st = rowStats.get(item.symbol);
                const active = symbol === item.symbol;
                return (
                  <tr
                    key={item.symbol}
                    className={active ? "bg-surface" : "border-t border-line"}
                  >
                    <td className="px-3 py-3">
                      <button type="button" onClick={() => setSymbol(item.symbol)} className="text-left">
                        <span className="block font-medium">{item.name}</span>
                        <span className="text-xs text-faint">
                          {item.symbol}
                          {item.note ? ` · ${item.note}` : ""}
                        </span>
                      </button>
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      <LivePrice price={q?.price}>
                        {q ? formatPx(q.price, q.currency, item.digits) : "—"}
                        {item.percent ? "%" : ""}
                      </LivePrice>
                    </td>
                    <td className="px-3 py-3">
                      <Change value={q?.changePct ?? null} />
                    </td>
                    <td className="px-3 py-3 tabular-nums text-muted">{formatVol(q?.volume)}</td>
                    <td className="px-3 py-3 tabular-nums">{st?.rsi == null ? "—" : st.rsi.toFixed(1)}</td>
                    <td className={`px-3 py-3 tabular-nums ${pctClass(st?.dist50)}`}>
                      {st?.dist50 == null ? "—" : `${st.dist50 > 0 ? "+" : ""}${st.dist50.toFixed(1)}%`}
                    </td>
                    <td className="px-3 py-3 tabular-nums">{st?.beta == null ? "—" : st.beta.toFixed(2)}</td>
                    <td className="w-36 px-3 py-3">
                      {q ? <RangeMark low={q.low52} high={q.high52} price={q.price} /> : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </TableExport>
        <ul className="mt-3 flex flex-col gap-2 md:hidden">
          {tape.map((item) => {
            const q = bySymbol.get(item.symbol);
            const st = rowStats.get(item.symbol);
            const active = symbol === item.symbol;
            return (
              <li key={item.symbol}>
                <button
                  type="button"
                  onClick={() => setSymbol(item.symbol)}
                  className={
                    "w-full rounded-md border px-3 py-3 text-left " +
                    (active ? "border-accent bg-surface" : "border-line bg-bg-elev")
                  }
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium">{item.name}</span>
                    <span className="tabular-nums">
                      <LivePrice price={q?.price}>
                        {q ? formatPx(q.price, q.currency, item.digits) : "—"}
                        {item.percent ? "%" : ""}
                      </LivePrice>
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between text-sm">
                    <span className="text-faint">{item.symbol}</span>
                    <Change value={q?.changePct ?? null} />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted">
                    <span>RSI {st?.rsi == null ? "—" : st.rsi.toFixed(0)}</span>
                    <span className={pctClass(st?.dist50)}>
                      50d {st?.dist50 == null ? "—" : `${st.dist50 > 0 ? "+" : ""}${st.dist50.toFixed(1)}%`}
                    </span>
                    <span>β {st?.beta == null ? "—" : st.beta.toFixed(2)}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function quoteFromSeries(series: Series): Quote {
  return {
    symbol: series.symbol,
    name: series.name,
    currency: series.currency,
    exchange: series.exchange,
    tz: series.tz,
    price: series.price,
    changePct: series.changePct,
    volume: null,
    dayHigh: null,
    dayLow: null,
    high52: null,
    low52: null,
    asOf: series.asOf,
    asOfLabel: series.asOfLabel,
    spark: series.bars.slice(-210).map((bar) => ({ d: bar.d, c: bar.c })),
  };
}

function num(n: number | null, digits: number): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return formatNum(n, digits);
}

function signTone(n: number | null): "up" | "down" | "flat" {
  if (n == null || n === 0) return "flat";
  return n > 0 ? "up" : "down";
}

function Dist({
  label,
  value,
  level,
  currency,
}: {
  label: string;
  value: number | null;
  level: number | null;
  currency?: string;
}) {
  return (
    <div className="bg-bg-elev px-4 py-3">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-1 text-base font-medium tabular-nums ${pctClass(value)}`}>
        {value == null ? "—" : `${value > 0 ? "+" : ""}${value.toFixed(1)}%`}
      </div>
      <div className="text-xs text-faint">{level == null ? "Not enough sessions" : `Average ${formatPx(level, currency)}`}</div>
    </div>
  );
}

function buildRowStats(symbols: string[], bySymbol: Map<string, Quote>, bench: Quote | undefined) {
  const map = new Map<string, { rsi: number | null; dist50: number | null; beta: number | null }>();
  for (const symbol of symbols) {
    const q = bySymbol.get(symbol);
    if (!q || q.spark.length < 20) {
      map.set(symbol, { rsi: null, dist50: null, beta: null });
      continue;
    }
    const closes = q.spark.map((p) => p.c);
    const avg = lastNum(sma(closes, 50));
    const last = closes[closes.length - 1];
    const beta =
      bench && symbol !== bench.symbol && bench.spark.length > 30 ? betaCorr(q.spark, bench.spark).beta : null;
    map.set(symbol, {
      rsi: lastNum(rsi(closes, 14)),
      dist50: avg && last ? (last / avg - 1) * 100 : null,
      beta,
    });
  }
  return map;
}

function CrossPanel({ id, bySymbol }: { id: SegmentId; bySymbol: Map<string, Quote> }) {
  if (id !== "gold" && id !== "silver") return null;
  const metal = bySymbol.get(id === "gold" ? "GC=F" : "SI=F");
  const fx = bySymbol.get("INR=X");
  const gold = bySymbol.get("GC=F");
  const silver = bySymbol.get("SI=F");
  const cross = metal && fx ? inrBullion(metal.price, fx.price) : null;
  const ratio = gold && silver && silver.price > 0 ? gold.price / silver.price : null;
  if (!cross && ratio == null) return null;
  return (
    <section className="mt-6 rounded-md border border-line bg-surface px-4 py-4">
      <h2 className="text-sm font-medium">Calculated cross</h2>
      <p className="mt-1 text-xs text-faint">
        COMEX future × Yahoo USD/INR ÷ {GRAMS_PER_TROY_OZ} grams per troy ounce. Not an MCX settlement. Duty, GST, and
        local premium are not in the number.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cross ? (
          <>
            <div>
              <div className="text-xs text-muted">INR per troy oz</div>
              <div className="mt-1 text-lg font-medium tabular-nums">{formatPx(cross.inrPerOz, "INR", 0)}</div>
            </div>
            <div>
              <div className="text-xs text-muted">{id === "gold" ? "INR per 10 grams" : "INR per kg"}</div>
              <div className="mt-1 text-lg font-medium tabular-nums">
                {formatPx(id === "gold" ? cross.inrPer10g : cross.inrPerKg, "INR", 0)}
              </div>
            </div>
          </>
        ) : null}
        {ratio != null ? (
          <div>
            <div className="text-xs text-muted">COMEX gold / silver</div>
            <div className="mt-1 text-lg font-medium tabular-nums">{ratio.toFixed(2)}</div>
          </div>
        ) : null}
        <div>
          <div className="text-xs text-muted">Inputs</div>
          <div className="mt-1 text-xs text-faint">
            {metal ? `${metal.symbol} ${formatPx(metal.price, metal.currency, 2)}` : "Future missing"}
            {fx ? ` · USDINR ${formatPx(fx.price, "INR", 2)}` : ""}
          </div>
        </div>
      </div>
    </section>
  );
}
