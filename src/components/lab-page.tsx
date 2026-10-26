import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Choice, Split } from "@/components/frame";
import { CsvRecords, TableExport } from "@/components/download";
import { Heatmap } from "@/components/heat";
import { OptionBoard } from "@/components/option-board";
import { SurfacePanel } from "@/components/surface-panel";
import { SymbolSearch } from "@/components/symbol-search";
import { formatNum } from "@/lib/format";
import { corrMatrix, momentumBook, residualPair, rsiBook, runLab, shareBook, walkForward, type LabReport, type Perf, type WalkReport } from "@/lib/market/math";
import { LAB_PRESETS } from "@/lib/market/markets";
import { screenName } from "@/lib/market/screen";
import { buildStructure, STRUCTURES, type BookLeg, type StructureId } from "@/lib/market/structures";
import { runVolBook, walkVol, type VolReport, type VolStyle } from "@/lib/market/volbook";
import { useBasketQuery, useOptionsQuery, useSeriesQuery } from "@/lib/market/queries";
import type { OptionContract, SeriesResult } from "@/lib/market/types";

const STRATEGIES = [
  { id: "stationarity", label: "Stationarity" },
  { id: "fade", label: "Z-score fade" },
  { id: "trend", label: "SMA cross" },
  { id: "breakout", label: "Donchian" },
  { id: "rsi", label: "RSI reversal" },
  { id: "momentum", label: "12-1 momentum" },
  { id: "long-vol", label: "Long vol" },
  { id: "short-vol", label: "Short vol" },
  { id: "long-gamma", label: "Long gamma" },
  { id: "short-gamma", label: "Short gamma" },
  { id: "shares", label: "Share ratio" },
  { id: "residual", label: "Residual pair" },
  { id: "book", label: "Option book" },
  { id: "delta", label: "Delta hedge" },
] as const;

type StrategyId = (typeof STRATEGIES)[number]["id"];
type Leg = { symbol: string; name: string; qty: string };

function isVol(id: string): id is VolStyle {
  return id === "long-vol" || id === "short-vol" || id === "long-gamma" || id === "short-gamma";
}

function volCopy(style: VolStyle): string {
  const book =
    style === "long-vol"
      ? "Buy an at-the-money straddle and hold it to expiry, unhedged."
      : style === "short-vol"
        ? "Sell an at-the-money straddle and hold it to expiry, unhedged."
        : style === "long-gamma"
          ? "Buy an at-the-money straddle and hedge the delta every session."
          : "Sell an at-the-money straddle and hedge the delta every session.";
  return `${book} Implied vol is the trailing realized vol of the same tenor, times one plus the variance premium, using only closes known that day. Marks are Black–Scholes at that entry vol until expiry. Rates and dividends are zero. This is not a listed-option tape.`;
}

const RANGES = ["1y", "2y", "5y"] as const;

export function LabPage({ initial, focus }: { initial: SeriesResult; focus?: string }) {
  const focusName = focus ? screenName(focus) ?? focus : "S&P 500";
  const [symbol, setSymbol] = useState(focus ?? "^GSPC");
  const [name, setName] = useState(focusName);
  const [range, setRange] = useState<(typeof RANGES)[number]>("5y");
  const [strategy, setStrategy] = useState<StrategyId>(focus ? "momentum" : "shares");
  const [window, setWindow] = useState(60);
  const [entryZ, setEntryZ] = useState(1.5);
  const [exitZ, setExitZ] = useState(0.25);
  const [costBps, setCostBps] = useState(5);
  const [contracts, setContracts] = useState(1);
  const [structure, setStructure] = useState<StructureId>("long-straddle");
  const [tenor, setTenor] = useState(21);
  const [vrp, setVrp] = useState(0.12);
  const [picked, setPicked] = useState<OptionContract | null>(null);
  const [expiry, setExpiry] = useState("");
  const [legs, setLegs] = useState<Leg[]>([
    { symbol: "AAPL", name: "Apple", qty: "2" },
    { symbol: "NVDA", name: "NVIDIA", qty: "-1" },
  ]);
  const [ready, setReady] = useState(false);
  const volStyle = isVol(strategy) ? strategy : null;
  const multi = strategy === "shares" || strategy === "residual";
  const optionMode = strategy === "delta" || strategy === "book";
  const query = useSeriesQuery(symbol, range, { symbol: "^GSPC", range: "5y", result: initial });
  const basket = useBasketQuery(
    multi ? legs.map((leg) => leg.symbol) : [],
    range,
  );
  const optionsQ = useOptionsQuery(symbol, expiry, optionMode);
  const report = useMemo(() => {
    if (!query.data?.ok || multi) return null;
    if (strategy !== "stationarity" && strategy !== "fade" && strategy !== "trend" && strategy !== "breakout") return null;
    return runLab(query.data.series.bars, { window, entryZ, exitZ, costBps });
  }, [query.data, window, entryZ, exitZ, costBps, multi, strategy]);
  useEffect(() => setReady(true), []);
  useEffect(() => {
    if (!focus) return;
    const hit = screenName(focus);
    setSymbol(focus);
    setName(hit ?? focus);
    setStrategy("momentum");
  }, [focus]);
  useEffect(() => {
    setPicked(null);
    setExpiry("");
  }, [symbol]);

  const loaded = (basket.data?.results ?? []).filter((row) => row.ok);
  const ordered = legs
    .map((leg) => loaded.find((row) => row.series.symbol === leg.symbol))
    .filter((row): row is Extract<(typeof loaded)[number], { ok: true }> => Boolean(row));
  const qty = legs.map((leg) => Number(leg.qty));
  const share = strategy === "shares" && ordered.length === legs.length && qty.every((value) => Number.isFinite(value))
    ? shareBook(ordered.map((row) => ({ symbol: row.series.symbol, bars: row.series.bars })), qty)
    : null;
  const pair = strategy === "residual" && ordered.length >= 2
    ? residualPair(ordered[0].series.bars, ordered[1].series.bars, window, entryZ, exitZ, costBps / 10000)
    : null;
  const singleBars = query.data?.ok ? query.data.series.bars : null;
  const rsi = strategy === "rsi" && singleBars ? rsiBook(singleBars, costBps / 10000) : null;
  const momentum = strategy === "momentum" && singleBars ? momentumBook(singleBars, costBps / 10000) : null;
  const chain = optionsQ.data;
  const contract = picked && chain?.rows.some((row) => row.contract === picked.contract) ? picked : chain?.rows.find((row) => row.delta != null) ?? null;
  const hedgeShares = contract?.delta == null ? null : -contract.delta * 100 * contracts;
  const optionBook = useMemo(
    () => (strategy === "book" ? buildStructure(chain?.rows ?? [], chain?.spot ?? null, structure) : null),
    [strategy, chain, structure],
  );
  const vol = useMemo(
    () => (volStyle && singleBars ? runVolBook(singleBars, volStyle, tenor, vrp, costBps) : null),
    [volStyle, singleBars, tenor, vrp, costBps],
  );
  const volWalk = useMemo(() => (volStyle && singleBars ? walkVol(singleBars, volStyle, costBps) : null), [volStyle, singleBars, costBps]);
  const walk = useMemo(() => {
    if (!singleBars) return null;
    if (strategy !== "fade" && strategy !== "trend" && strategy !== "breakout" && strategy !== "rsi" && strategy !== "momentum") return null;
    return walkForward(singleBars, strategy, costBps);
  }, [singleBars, strategy, costBps]);
  const legCorr = useMemo(() => {
    if (!multi || ordered.length < 2) return null;
    const series = ordered.map((row) => ({ symbol: row.series.symbol, bars: row.series.bars }));
    const full = corrMatrix(series);
    const short = corrMatrix(series, 63);
    if (!full) return null;
    return { full, short: short && full.sessions > short.sessions + 5 ? short : null };
  }, [multi, ordered]);

  return (
    <Split title="Strategy lab" symbol={multi ? legs[0]?.symbol ?? symbol : symbol}>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Choice label="Strategy" value={strategy} options={STRATEGIES} onChange={setStrategy} />
        {multi ? null : (
          <Choice
            label="Symbol"
            value={symbol}
            options={[
              ...LAB_PRESETS.map((row) => ({ id: row.symbol, label: row.name })),
              ...(LAB_PRESETS.some((row) => row.symbol === symbol) ? [] : [{ id: symbol, label: name }]),
            ]}
            onChange={(next) => {
              const preset = LAB_PRESETS.find((row) => row.symbol === next);
              setSymbol(next);
              setName(preset?.name ?? next);
            }}
          />
        )}
      </div>
      {multi ? (
        <LegEditor
          legs={legs}
          residual={strategy === "residual"}
          onChange={setLegs}
        />
      ) : (
        <div className="mt-3 max-w-xl">
          <SymbolSearch
            scope="any"
            placeholder="Any listing"
            onPick={(hit) => {
              setSymbol(hit.symbol);
              setName(hit.name);
            }}
          />
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-1">
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
      {strategy === "fade" || strategy === "residual" ? (
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Num label="Window" value={window} onChange={setWindow} />
          <Num label="Entry z" value={entryZ} step={0.1} onChange={setEntryZ} />
          <Num label="Exit z" value={exitZ} step={0.05} onChange={setExitZ} />
          <Num label="Cost bps" value={costBps} onChange={setCostBps} />
        </div>
      ) : null}
      {strategy === "trend" || strategy === "breakout" || strategy === "rsi" || strategy === "momentum" ? (
        <div className="mt-4 max-w-xs">
          <Num label="Cost bps" value={costBps} onChange={setCostBps} />
          <p className="mt-2 text-xs text-faint">
            {strategy === "trend"
              ? "Long when the 20-session average is above the 50, otherwise short"
              : strategy === "breakout"
                ? "20-session channel, held until the other side breaks"
                : strategy === "rsi"
                  ? "RSI 14. Long below 30, short above 70, flat back at 50"
                  : "Long only when the close 21 sessions ago is above the close 252 sessions ago"}
          </p>
        </div>
      ) : null}
      {volStyle ? (
        <div className="mt-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Choice
              label="Tenor"
              value={String(tenor)}
              options={[
                { id: "10", label: "10 sessions" },
                { id: "21", label: "21 sessions" },
                { id: "42", label: "42 sessions" },
              ]}
              onChange={(next) => setTenor(Number(next))}
            />
            <Num label="Variance premium" value={vrp} step={0.01} onChange={setVrp} />
            <Num label="Cost bps" value={costBps} onChange={setCostBps} />
          </div>
          <p className="mt-2 text-xs text-faint">{volCopy(volStyle)}</p>
        </div>
      ) : null}
      {strategy === "delta" ? (
        <div className="mt-4 max-w-xs">
          <Num label="Contracts" value={contracts} onChange={setContracts} />
        </div>
      ) : null}
      {strategy === "book" ? (
        <div className="mt-4 max-w-sm">
          <Choice label="Structure" value={structure} options={STRUCTURES} onChange={setStructure} />
        </div>
      ) : null}
      {query.isPending && !multi ? <p className="mt-4 text-sm text-muted">Loading</p> : null}
      {basket.isPending && multi ? <p className="mt-4 text-sm text-muted">Loading</p> : null}
      {query.data && !query.data.ok && !multi ? <p className="mt-4 text-sm text-down">{query.data.message}</p> : null}
      {strategy === "shares" && share ? (
        <Block title={`${qty.map((value, index) => `${value} ${legs[index]?.symbol}`).join("  ")}`}>
          <Stats
            items={[
              ["P&L", formatNum(share.pnl, 2)],
              ["Return", `${share.ret.toFixed(2)}%`],
              ["Vol", share.vol == null ? "—" : `${share.vol.toFixed(2)}%`],
              ["Max DD", share.maxDrawdown == null ? "—" : `${share.maxDrawdown.toFixed(2)}%`],
            ]}
          />
          <p className="mt-2 text-xs text-faint">Dollar P&L of the share counts. Return is that P&L over the opening gross.</p>
          <Curve ready={ready} data={share.equity} />
        </Block>
      ) : null}
      {strategy === "residual" && pair ? (
        <Block title="Residual">
          <Stats
            items={[
              ["Beta", pair.beta == null ? "—" : pair.beta.toFixed(2)],
              ["z", pair.z == null ? "—" : pair.z.toFixed(2)],
              ["Stance", pair.stance],
              ["Return", `${pair.ret.toFixed(2)}%`],
              ["Sharpe", pair.sharpe == null ? "—" : pair.sharpe.toFixed(2)],
              ["Max DD", pair.maxDrawdown == null ? "—" : `${pair.maxDrawdown.toFixed(2)}%`],
            ]}
          />
          <p className="mt-2 text-xs text-faint">Rolling OLS of log {legs[0]?.symbol} on log {legs[1]?.symbol}. Hedge uses past closes only.</p>
          <Curve ready={ready} data={pair.equity} />
        </Block>
      ) : null}
      {rsi ? <SignalView label={rsi.last} ret={rsi.ret} sharpe={rsi.sharpe} dd={rsi.maxDrawdown} equity={rsi.equity} ready={ready} /> : null}
      {momentum ? <SignalView label={momentum.last} ret={momentum.ret} sharpe={momentum.sharpe} dd={momentum.maxDrawdown} equity={momentum.equity} ready={ready} /> : null}
      {volStyle ? (
        vol ? <VolView report={vol} ready={ready} /> : singleBars ? <p className="mt-4 text-sm text-muted">Not enough sessions for this tenor. Use 2y or 5y.</p> : null
      ) : null}
      {report && (strategy === "stationarity" || strategy === "fade" || strategy === "trend" || strategy === "breakout") ? (
        <Single strategy={strategy} report={report} ready={ready} />
      ) : null}
      {strategy === "delta" ? (
        <div>
          <OptionBoard
            loading={optionsQ.isPending}
            error={optionsQ.isError ? "Option chain did not load" : chain?.error}
            rate={chain?.rate ?? null}
            dividend={chain?.dividendYield ?? null}
            expiries={chain?.expiries ?? []}
            expiry={expiry || chain?.expiry || ""}
            onExpiry={setExpiry}
            rows={chain?.rows ?? []}
            selected={contract?.contract}
            onSelect={setPicked}
          />
          {contract ? (
            <div className="mt-4">
              <Stats
                items={[
                  ["Contract", contract.contract],
                  ["Delta", contract.delta == null ? "—" : contract.delta.toFixed(3)],
                  ["Share hedge", hedgeShares == null ? "—" : hedgeShares.toFixed(1)],
                  ["Position gamma", contract.gamma == null ? "—" : (contract.gamma * 100 * contracts).toFixed(4)],
                  ["Position vega", contract.vega == null ? "—" : (contract.vega * 100 * contracts).toFixed(2)],
                  ["Position theta", contract.theta == null ? "—" : (contract.theta * 100 * contracts).toFixed(2)],
                ]}
              />
              <p className="mt-2 text-xs text-faint">Share hedge = −delta × 100 × contracts. No historical option marks on this feed, so this is today’s hedge, not a backtest.</p>
            </div>
          ) : null}
        </div>
      ) : null}
      {strategy === "book" ? (
        <div className="mt-4">
          {optionsQ.isPending ? <p className="text-sm text-muted">Loading chain</p> : null}
          {chain?.error ? <p className="text-sm text-down">{chain.error}</p> : null}
          {optionBook ? (
            <>
              <Stats
                items={[
                  ["Vol", optionBook.vol],
                  ["Gamma", optionBook.gamma],
                  ["Debit", optionBook.debit == null ? "—" : formatNum(optionBook.debit, 2)],
                  ["Delta", optionBook.delta == null ? "—" : optionBook.delta.toFixed(1)],
                  ["Vega", optionBook.vega == null ? "—" : optionBook.vega.toFixed(2)],
                  ["Theta", optionBook.theta == null ? "—" : optionBook.theta.toFixed(2)],
                ]}
              />
              <TableExport file="option-book">
              <div className="mt-3 overflow-x-auto rounded-md border border-line">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface text-xs text-muted">
                    <tr>
                      <th className="px-3 py-2 font-medium">Contract</th>
                      <th className="px-3 py-2 text-right font-medium">Qty</th>
                      <th className="px-3 py-2 text-right font-medium">Mid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optionBook.legs.map((leg) => (
                      <tr key={`${leg.contract}-${leg.qty}`} className="border-t border-line">
                        <td className="px-3 py-2 font-mono text-fg">{leg.contract}</td>
                        <td className="px-3 py-2 text-right font-mono">{leg.qty}</td>
                        <td className="px-3 py-2 text-right font-mono">{leg.mid == null ? "—" : formatNum(leg.mid, 2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </TableExport>
              <p className="mt-2 text-xs text-faint">One combo, multiplier 100. Debit is the marked premium. A negative debit is a credit. Vega and gamma can disagree on a fly or a risk reversal, so read both. The payoff is at expiry, marked from today's mids. There is no listed-option history on this feed.</p>
              <Payoff legs={optionBook.legs} spot={chain?.spot ?? null} />
            </>
          ) : chain && !chain.error ? (
            <p className="text-sm text-muted">This structure is not on the listed strikes.</p>
          ) : null}
        </div>
      ) : null}
      {optionMode || volStyle ? <SurfacePanel symbol={symbol} /> : null}
      {legCorr ? (
        <section className="mt-6">
          <h2 className="text-sm font-medium">Correlation</h2>
          <div className="mt-3">
            <Heatmap
              file="leg-correlation"
              columns={legCorr.full.names}
              rows={legCorr.full.names.map((name, index) => ({ label: name, cells: legCorr.full.values[index] }))}
              scale="diverge"
              format={(value) => value.toFixed(2)}
            />
          </div>
          {legCorr.short ? (
            <>
              <h3 className="mt-4 text-xs font-medium text-muted">Last 63 sessions</h3>
              <div className="mt-2">
                <Heatmap
                  columns={legCorr.short.names}
                  rows={legCorr.short.names.map((name, index) => ({ label: name, cells: legCorr.short?.values[index] ?? [] }))}
                  scale="diverge"
                  format={(value) => value.toFixed(2)}
                />
              </div>
            </>
          ) : null}
        </section>
      ) : null}
      {volWalk ? (
        <WalkView
          report={volWalk}
          ready={ready}
          note="Each quarter picks the tenor and variance premium with the best in-sample Sharpe, then opens a new book on the next quarter. The training position is not carried in. Flat or unfinished windows are skipped."
        />
      ) : null}
      {walk ? <WalkView report={walk} ready={ready} /> : null}
      {!walk && !volWalk && singleBars && (strategy === "fade" || strategy === "trend" || strategy === "breakout" || strategy === "rsi" || strategy === "momentum" || volStyle != null) ? (
        <p className="mt-4 text-xs text-faint">Walk-forward needs a longer history. Use 2y or 5y.</p>
      ) : null}
    </Split>
  );
}

function WalkView({ report, ready, note }: { report: WalkReport; ready: boolean; note?: string }) {
  return (
    <section className="mt-6">
      <h2 className="text-sm font-medium">Walk-forward</h2>
      <p className="mt-1 text-xs text-faint">
        {note ??
          "Each block picks the rule with the best Sharpe on the prior year, including a rule that stays long or short. A rule that was flat is ignored. That rule is then run on the next quarter, and the curve stitches those out-of-sample days."}
      </p>
      <Stats
        items={[
          ["OOS return", `${report.oosReturn.toFixed(2)}%`],
          ["OOS Sharpe", report.oosSharpe == null ? "—" : report.oosSharpe.toFixed(2)],
          ["OOS max DD", report.oosMaxDd == null ? "—" : `${report.oosMaxDd.toFixed(2)}%`],
          ["Folds", String(report.folds.length)],
        ]}
      />
      <TableExport file="walk-forward">
      <div className="mt-3 overflow-x-auto rounded-md border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Test</th>
              <th className="px-3 py-2 font-medium">Rule</th>
              <th className="px-3 py-2 text-right font-medium">Train Sharpe</th>
              <th className="px-3 py-2 text-right font-medium">OOS</th>
            </tr>
          </thead>
          <tbody>
            {report.folds.map((fold) => (
              <tr key={`${fold.start}-${fold.rule}`} className="border-t border-line">
                <td className="px-3 py-2 font-mono text-xs text-fg">{fold.start} – {fold.end}</td>
                <td className="px-3 py-2">{fold.rule}</td>
                <td className="px-3 py-2 text-right font-mono">{fold.isSharpe == null ? "—" : fold.isSharpe.toFixed(2)}</td>
                <td className="px-3 py-2 text-right font-mono">{fold.oosReturn.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </TableExport>
      <Curve ready={ready} data={report.equity} />
    </section>
  );
}

function LegEditor({ legs, residual, onChange }: { legs: Leg[]; residual: boolean; onChange: (legs: Leg[]) => void }) {
  return (
    <div className="mt-4">
      <SymbolSearch
        scope="any"
        placeholder="Add a leg"
        onPick={(hit) => {
          if (legs.some((leg) => leg.symbol === hit.symbol) || legs.length >= 6) return;
          onChange([...legs, { symbol: hit.symbol, name: hit.name, qty: residual ? "1" : "1" }]);
        }}
      />
      <TableExport file="legs">
      <div className="mt-3 overflow-x-auto rounded-md border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">{residual ? "Y then X" : "Symbol"}</th>
              <th className="px-3 py-2 font-medium">Shares</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {legs.map((leg, index) => (
              <tr key={leg.symbol} className="border-t border-line">
                <td className="px-3 py-2">
                  <span className="font-mono text-fg">{leg.symbol}</span>
                  <span className="ml-2 text-xs text-faint">{residual ? (index === 0 ? "Y" : index === 1 ? "X" : "") : leg.name}</span>
                </td>
                <td className="px-3 py-2">
                  {residual ? (
                    <span className="font-mono text-faint">OLS</span>
                  ) : (
                    <input
                      value={leg.qty}
                      onChange={(event) => onChange(legs.map((row, i) => (i === index ? { ...row, qty: event.target.value } : row)))}
                      className="min-h-11 w-24 rounded-md border border-line bg-surface px-2 font-mono text-fg"
                    />
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <button type="button" className="min-h-11 text-sm text-muted" disabled={legs.length <= 2} onClick={() => onChange(legs.filter((row) => row.symbol !== leg.symbol))}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </TableExport>
    </div>
  );
}

function Num({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (value: number) => void; step?: number }) {
  return (
    <label className="block text-xs text-muted">
      {label}
      <input
        type="number"
        value={value}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1 min-h-11 w-full rounded-md border border-line bg-surface px-3 font-mono text-sm text-fg"
      />
    </label>
  );
}

function Stats({ items }: { items: [string, string][] }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-md border border-line px-3 py-3">
          <div className="text-xs text-muted">{label}</div>
          <div className="mt-1 break-all font-mono text-lg text-fg">{value}</div>
        </div>
      ))}
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-4">
      <h2 className="text-sm text-fg">{title}</h2>
      {children}
    </section>
  );
}

function Curve({ ready, data }: { ready: boolean; data: { d: string; v: number }[] }) {
  if (!ready) return <div className="mt-4 h-64 rounded-md bg-bg-elev" />;
  return (
    <>
    <div className="mt-4 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-line)" vertical={false} />
          <XAxis dataKey="d" minTickGap={48} tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
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
          <Line dataKey="v" stroke="var(--color-accent)" dot={false} strokeWidth={1.7} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <CsvRecords file="equity-curve" rows={data} columns={["d", "v"]} />
    </>
  );
}

function VolView({ report, ready }: { report: VolReport; ready: boolean }) {
  const gap = report.avgIv != null && report.avgRv != null ? (report.avgRv - report.avgIv) * 100 : null;
  const marks = report.rolls.map((roll) => ({
    d: roll.exit,
    iv: roll.iv * 100,
    rv: roll.rv == null ? null : roll.rv * 100,
  }));
  const recent = [...report.rolls].slice(-8).reverse();
  return (
    <section className="mt-4">
      <Stats
        items={[
          ["Return", `${report.ret.toFixed(2)}%`],
          ["Sharpe", report.sharpe == null ? "—" : report.sharpe.toFixed(2)],
          ["Max DD", report.maxDrawdown == null ? "—" : `${report.maxDrawdown.toFixed(2)}%`],
          ["Rolls", String(report.trades)],
          ["Win rate", report.winRate == null ? "—" : `${report.winRate.toFixed(0)}%`],
          ["Avg IV", report.avgIv == null ? "—" : `${(report.avgIv * 100).toFixed(1)}%`],
          ["Avg realized", report.avgRv == null ? "—" : `${(report.avgRv * 100).toFixed(1)}%`],
          ["Realized − IV", gap == null ? "—" : gap.toFixed(1)],
        ]}
      />
      <p className="mt-2 text-xs text-faint">
        Return is on spot notional, compounded from daily marks. Realized − IV is in volatility points over completed rolls.
        {report.open ? " One roll is still open and marked on the model." : ""}
      </p>
      {ready ? (
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={report.equity} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-line)" vertical={false} />
              <XAxis dataKey="d" minTickGap={48} tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} width={48} domain={["auto", "auto"]} />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="rounded-md border border-line bg-bg-elev px-3 py-2 text-xs">
                      <div className="text-muted">{label}</div>
                      {payload.map((item) => (
                        <div key={String(item.dataKey)} className="font-mono text-fg">
                          {item.name} {formatNum(Number(item.value), 2)}
                        </div>
                      ))}
                    </div>
                  ) : null
                }
              />
              <Line dataKey="v" name="Book" stroke="var(--color-accent)" dot={false} strokeWidth={1.7} isAnimationActive={false} />
              <Line dataKey="hold" name="Spot" stroke="var(--color-muted)" dot={false} strokeWidth={1.4} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-4 h-64 rounded-md bg-bg-elev" />
      )}
      <CsvRecords file="vol-book" rows={report.equity} />
      {marks.length ? (
        <>
          <h2 className="mt-4 text-sm font-medium">Entry vol versus what realized</h2>
          <p className="mt-1 text-xs text-faint">Each point is one completed roll. Realized is the annualized log-return deviation over the holding window.</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marks} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey="d" minTickGap={48} tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} unit="%" />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="rounded-md border border-line bg-bg-elev px-3 py-2 text-xs">
                        <div className="text-muted">{label}</div>
                        {payload.map((item) => (
                          <div key={String(item.dataKey)} className="font-mono text-fg">
                            {item.name} {Number(item.value).toFixed(1)}%
                          </div>
                        ))}
                      </div>
                    ) : null
                  }
                />
                <Line dataKey="iv" name="Entry IV" stroke="var(--color-accent)" dot={false} strokeWidth={1.7} isAnimationActive={false} />
                <Line dataKey="rv" name="Realized" stroke="var(--color-muted)" dot={false} strokeWidth={1.4} connectNulls isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <CsvRecords file="vol-rolls" rows={marks} />
          <TableExport file="vol-roll-table">
          <div className="mt-3 overflow-x-auto rounded-md border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Roll</th>
                  <th className="px-3 py-2 text-right font-medium">IV</th>
                  <th className="px-3 py-2 text-right font-medium">Realized</th>
                  <th className="px-3 py-2 text-right font-medium">P&L</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((roll) => (
                  <tr key={`${roll.entry}-${roll.exit}`} className="border-t border-line">
                    <td className="px-3 py-2 font-mono text-xs text-fg">{roll.entry} – {roll.exit}</td>
                    <td className="px-3 py-2 text-right font-mono">{(roll.iv * 100).toFixed(1)}%</td>
                    <td className="px-3 py-2 text-right font-mono">{roll.rv == null ? "—" : `${(roll.rv * 100).toFixed(1)}%`}</td>
                    <td className="px-3 py-2 text-right font-mono">{roll.pnl.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </TableExport>
        </>
      ) : (
        <p className="mt-3 text-xs text-faint">No completed roll in this window yet.</p>
      )}
    </section>
  );
}

function Payoff({ legs, spot }: { legs: BookLeg[]; spot: number | null }) {
  if (spot == null || !(spot > 0) || legs.some((leg) => leg.mid == null)) return null;
  const data = Array.from({ length: 25 }, (_, index) => {
    const price = spot * (0.7 + (0.6 * index) / 24);
    const pnl = legs.reduce((total, leg) => {
      const intrinsic = leg.type === "call" ? Math.max(price - leg.strike, 0) : Math.max(leg.strike - price, 0);
      return total + leg.qty * 100 * (intrinsic - (leg.mid as number));
    }, 0);
    return { price, pnl };
  });
  return (
    <div className="mt-4">
      <h2 className="text-sm font-medium">Expiry payoff</h2>
      <p className="mt-1 text-xs text-faint">Profit at expiration versus spot, from 70% to 130% of the spot used to build the book. Premium is today's mid.</p>
      <div className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis dataKey="price" tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => formatNum(Number(value), 0)} />
            <YAxis tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} width={56} />
            <ReferenceLine y={0} stroke="var(--color-line)" />
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <div className="rounded-md border border-line bg-bg-elev px-3 py-2 text-xs">
                    <div className="text-muted">Spot {formatNum(Number(payload[0].payload.price), 2)}</div>
                    <div className="font-mono text-fg">{formatNum(Number(payload[0].value), 2)}</div>
                  </div>
                ) : null
              }
            />
            <Line dataKey="pnl" stroke="var(--color-accent)" dot={false} strokeWidth={1.7} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <CsvRecords file="expiry-payoff" rows={data} columns={["price", "pnl"]} />
    </div>
  );
}

function SignalView({ label, ret, sharpe, dd, equity, ready }: { label: string; ret: number; sharpe: number | null; dd: number | null; equity: { d: string; v: number }[]; ready: boolean }) {
  return (
    <Block title={label}>
      <Stats
        items={[
          ["Return", `${ret.toFixed(2)}%`],
          ["Sharpe", sharpe == null ? "—" : sharpe.toFixed(2)],
          ["Max DD", dd == null ? "—" : `${dd.toFixed(2)}%`],
        ]}
      />
      <Curve ready={ready} data={equity} />
    </Block>
  );
}

function perfStats(perf: Perf) {
  return (
    <Stats
      items={[
        ["Return", `${perf.totalReturn.toFixed(2)}%`],
        ["Sharpe", perf.sharpe == null ? "—" : perf.sharpe.toFixed(2)],
        ["Max DD", perf.maxDrawdown == null ? "—" : `${perf.maxDrawdown.toFixed(2)}%`],
        ["Turns", String(perf.turns)],
      ]}
    />
  );
}

function Single({ strategy, report, ready }: { strategy: StrategyId; report: LabReport; ready: boolean }) {
  if (strategy === "stationarity") {
    return (
      <div>
        <Stats
          items={[
            ["ADF level", report.adfLevel ? report.adfLevel.tStat.toFixed(2) : "—"],
            ["ADF return", report.adfReturn ? report.adfReturn.tStat.toFixed(2) : "—"],
            ["Half-life", report.halfLife?.halfLife == null ? "—" : report.halfLife.halfLife.toFixed(1)],
            ["Hurst", report.hurst == null ? "—" : report.hurst.toFixed(2)],
            ["VR 10", report.vr.find((row) => row.q === 10)?.value.toFixed(2) ?? "—"],
            ["Latest z", report.latestZ == null ? "—" : report.latestZ.toFixed(2)],
          ]}
        />
        <Research report={report} />
      </div>
    );
  }
  const backtest = report.backtest;
  if (!backtest) return <p className="mt-4 text-sm text-muted">Not enough bars</p>;
  const key = strategy === "fade" ? "fade" : strategy === "trend" ? "trend" : "channel";
  return (
    <div>
      {strategy === "fade" ? <p className="mt-4 text-sm text-fg">{report.stance}</p> : null}
      {strategy === "breakout" ? <p className="mt-4 text-sm text-fg">{report.channelState}</p> : null}
      {perfStats(backtest[key])}
      <h2 className="mt-4 text-xs text-muted">Hold</h2>
      {perfStats(backtest.hold)}
      {ready ? (
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={backtest.equity} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-line)" vertical={false} />
              <XAxis dataKey="d" minTickGap={48} tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} width={48} domain={["auto", "auto"]} />
              <Line dataKey={key} name="Strategy" stroke="var(--color-accent)" dot={false} strokeWidth={1.7} isAnimationActive={false} />
              <Line dataKey="hold" name="Hold" stroke="var(--color-muted)" dot={false} strokeWidth={1.4} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-4 h-64 rounded-md bg-bg-elev" />
      )}
      <CsvRecords file="strategy-equity" rows={backtest.equity} />
      {strategy === "fade" ? <Research report={report} /> : null}
    </div>
  );
}

function Research({ report }: { report: LabReport }) {
  return (
    <section className="mt-6">
      <h2 className="text-sm font-medium">Read</h2>
      <div className="mt-2 space-y-2">
        {report.lines.map((line) => (
          <p key={line} className="text-sm text-muted">{line}</p>
        ))}
      </div>
      <h3 className="mt-4 text-xs font-medium text-muted">Five-session forward return by z bucket</h3>
      <div className="mt-2">
        <Heatmap
          file="z-buckets"
          columns={report.buckets.map((row) => row.label)}
          rows={[
            { label: "Mean %", cells: report.buckets.map((row) => (row.n ? row.mean : null)) },
            { label: "Median", cells: report.buckets.map((row) => (row.n ? row.median : null)) },
          ]}
          scale="diverge"
          format={(value) => value.toFixed(2)}
        />
      </div>
      {report.sensitivity.length ? (
        <TableExport file="fade-sensitivity">
        <div className="mt-4 overflow-x-auto rounded-md border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Fade entry</th>
                <th className="px-3 py-2 text-right font-medium">Sharpe</th>
                <th className="px-3 py-2 text-right font-medium">Return</th>
              </tr>
            </thead>
            <tbody>
              {report.sensitivity.map((row) => (
                <tr key={row.entry} className="border-t border-line">
                  <td className="px-3 py-2 font-mono">{row.entry.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right font-mono">{row.sharpe == null ? "—" : row.sharpe.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-mono">{row.total.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </TableExport>
      ) : null}
    </section>
  );
}
