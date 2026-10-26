import { useEffect, useMemo, useRef, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Heatmap } from "@/components/heat";
import { CsvRecords, TableExport } from "@/components/download";
import { SymbolSearch } from "@/components/symbol-search";
import { Split } from "@/components/frame";
import { getDesk, saveBook } from "@/lib/desk/api";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { formatNum } from "@/lib/format";
import { mixPortfolio, suggestWeights, type WeightMethod } from "@/lib/market/math";
import { PORTFOLIO_SEED } from "@/lib/market/markets";
import { useBasketQuery } from "@/lib/market/queries";
import type { Basket } from "@/lib/market/types";

const RANGES = ["6mo", "1y", "2y", "5y"] as const;

function equalWeights(symbols: string[]): Record<string, string> {
  const value = (100 / symbols.length).toFixed(2);
  return Object.fromEntries(symbols.map((symbol) => [symbol, value]));
}

export function PortfolioPage({ initial }: { initial: Basket }) {
  const [symbols, setSymbols] = useState<string[]>([...PORTFOLIO_SEED]);
  const [weights, setWeights] = useState<Record<string, string>>(() => equalWeights([...PORTFOLIO_SEED]));
  const [range, setRange] = useState<(typeof RANGES)[number]>("1y");
  const [ready, setReady] = useState(false);
  const serverReady = useRef(false);
  const { user, isPending } = useCurrentUserState();
  const query = useBasketQuery(symbols, range, initial);
  useEffect(() => setReady(true), []);
  useEffect(() => {
    if (!ready || isPending) return;
    if (!user?.id) {
      serverReady.current = true;
      return;
    }
    let cancel = false;
    serverReady.current = false;
    getDesk()
      .then((desk) => {
        if (cancel) return;
        if (desk.symbols.length < 2) {
          saveBook({ data: { symbols, weights } }).catch(() => {});
          return;
        }
        setSymbols(desk.symbols);
        setWeights({ ...equalWeights(desk.symbols), ...desk.weights });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancel) serverReady.current = true;
      });
    return () => {
      cancel = true;
    };
  }, [ready, isPending, user?.id]);
  useEffect(() => {
    if (!ready || !user?.id || !serverReady.current || symbols.length < 2) return;
    const handle = window.setTimeout(() => {
      saveBook({ data: { symbols, weights } }).catch(() => {});
    }, 500);
    return () => window.clearTimeout(handle);
  }, [ready, user?.id, symbols, weights]);
  const loaded = (query.data?.results ?? []).filter((row) => row.ok);
  const parsed = symbols.map((symbol) => Number(weights[symbol]));
  const sum = parsed.reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0);
  const aligned = loaded.filter((row) => symbols.includes(row.series.symbol));
  const weightVector = aligned.map((row) => Number(weights[row.series.symbol]) / 100);
  const weightOk = aligned.length >= 2 && weightVector.every((value) => value >= 0) && Math.abs(weightVector.reduce((a, b) => a + b, 0) - 1) < 0.005;
  const report = useMemo(() => {
    if (!weightOk) return null;
    return mixPortfolio(
      aligned.map((row) => ({ symbol: row.series.symbol, bars: row.series.bars })),
      weightVector,
    );
  }, [query.data, weights, symbols, weightOk]);

  function replaceSymbols(next: string[]) {
    setSymbols(next);
    setWeights(equalWeights(next));
  }

  function apply(method: WeightMethod) {
    const suggested = suggestWeights(
      aligned.map((row) => ({ symbol: row.series.symbol, bars: row.series.bars })),
      method,
    );
    if (!suggested) return;
    setWeights(Object.fromEntries(suggested.map((row) => [row.symbol, (row.weight * 100).toFixed(2)])));
  }

  return (
    <Split title="Portfolio" symbol={symbols[0] ?? "SPY"}>
      <div className="mt-4 flex flex-wrap gap-2">
        {RANGES.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={range === item}
            onClick={() => setRange(item)}
            className={"min-h-11 rounded-md px-3 text-sm " + (range === item ? "bg-accent text-accent-ink" : "border border-line text-muted")}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-3 max-w-xl">
        <SymbolSearch
          scope="any"
          placeholder="Add a listing"
          onPick={(hit) => {
            if (symbols.includes(hit.symbol) || symbols.length >= 8) return;
            replaceSymbols([...symbols, hit.symbol]);
          }}
        />
      </div>
      <TableExport file="portfolio">
      <div className="mt-4 overflow-x-auto rounded-md border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Symbol</th>
              <th className="px-3 py-2 font-medium">Weight %</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {symbols.map((symbol) => (
              <tr key={symbol} className="border-t border-line">
                <td className="px-3 py-2 font-mono text-fg">{symbol}</td>
                <td className="px-3 py-2">
                  <input
                    value={weights[symbol] ?? ""}
                    onChange={(event) => setWeights((prev) => ({ ...prev, [symbol]: event.target.value }))}
                    inputMode="decimal"
                    className="min-h-11 w-24 rounded-md border border-line bg-surface px-2 font-mono text-fg"
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    className="min-h-11 text-sm text-muted"
                    onClick={() => replaceSymbols(symbols.filter((item) => item !== symbol))}
                    disabled={symbols.length <= 2}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </TableExport>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {(
          [
            ["equal", "Equal"],
            ["invvol", "Inverse vol"],
            ["invvar", "Inverse variance"],
            ["minvar", "Min variance"],
            ["sharpe", "Max Sharpe"],
            ["risk", "Risk parity"],
          ] as const
        ).map(([method, label]) => (
          <button key={method} type="button" className="min-h-11 rounded-md border border-line px-3 text-sm" onClick={() => apply(method)}>
            {label}
          </button>
        ))}
        <span className="font-mono text-sm text-muted">Sum {sum.toFixed(2)}</span>
      </div>
      <p className="mt-2 text-xs text-faint">Constructors use this sample only. Long-only. Sharpe uses a zero rate.</p>
      {!weightOk ? <p className="mt-2 text-xs text-faint">Weights need to sum to 100 before the curve is drawn.</p> : null}
      {query.isPending ? <p className="mt-3 text-sm text-muted">Loading</p> : null}
      {(query.data?.results ?? [])
        .filter((row) => !row.ok)
        .map((row) => (
          <p key={row.symbol} className="mt-2 text-sm text-down">
            {row.symbol}: {row.message}
          </p>
        ))}
      {report ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Return" value={`${report.totalReturn.toFixed(2)}%`} />
            <Stat label="Vol" value={report.vol == null ? "—" : `${report.vol.toFixed(2)}%`} />
            <Stat label="Max DD" value={report.maxDrawdown == null ? "—" : `${report.maxDrawdown.toFixed(2)}%`} />
            <Stat label="Sharpe" value={report.sharpe == null ? "—" : report.sharpe.toFixed(2)} />
          </div>
          <p className="mt-2 text-xs text-faint">
            Constant mix on daily closes, {report.start} to {report.end}. Sharpe uses a zero rate.
          </p>
          {ready ? (
            <div className="mt-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={report.equity} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-line)" vertical={false} />
                  <XAxis dataKey="d" minTickGap={40} tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} width={48} domain={["auto", "auto"]} />
                  <Tooltip
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <div className="rounded-md border border-line bg-bg-elev px-3 py-2 text-xs">
                          <div className="text-muted">{label}</div>
                          <div className="font-mono">{formatNum(Number(payload[0].value), 2)}</div>
                        </div>
                      ) : null
                    }
                  />
                  <Line dataKey="v" name="Book" stroke="var(--color-accent)" dot={false} strokeWidth={1.7} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-3 h-64 rounded-md bg-bg-elev" />
          )}
          <CsvRecords file="portfolio-equity" rows={report.equity} />
          <h2 className="mt-4 text-sm font-medium">Correlation</h2>
          <p className="mt-1 text-xs text-faint">Pearson correlation of daily returns over the same window as the book.</p>
          <div className="mt-3">
            <Heatmap
              file="portfolio-correlation"
              columns={report.names}
              rows={report.names.map((name, index) => ({
                label: name,
                cells: report.corr[index].map((value) => (Number.isFinite(value) ? value : null)),
              }))}
              scale="diverge"
              format={(value) => value.toFixed(2)}
            />
          </div>
        </>
      ) : null}
    </Split>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line px-3 py-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 font-mono text-lg text-fg">{value}</div>
    </div>
  );
}
