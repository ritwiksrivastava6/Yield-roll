import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Choice, Split } from "@/components/frame";
import { TableExport } from "@/components/download";
import { armAlert, dropAlert, getDesk, listAlerts, noteScreen, saveScreen } from "@/lib/desk/api";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Heatmap } from "@/components/heat";
import { useBasketQuery } from "@/lib/market/queries";
import { COUNTRY_OPTIONS, countryMeta, countryNames, REGIONS, regionNames, regionNews, screenerChunks, screenStats, type CountryId, type RegionId, type ScreenStats } from "@/lib/market/screen";

const KEY = "fathom-screener-v1";

const PRESETS = [
  { id: "momentum", group: "Price", label: "Momentum", rule: "12–1 return is positive and the close is above the 50-session average." },
  { id: "breakout", group: "Price", label: "Nearing breakout", rule: "Within 2% of the prior 20-session high, with RSI between 45 and 70." },
  { id: "low52", group: "Price", label: "Near 52-week low", rule: "In the bottom quarter of the 52-week range, and not a 200-session breakdown." },
  { id: "washout", group: "Price", label: "Washout", rule: "RSI under 30, or a 60-session price z-score at or below −2." },
  { id: "quiet", group: "Volatility", label: "Quiet", rule: "21-day realized vol at or below the median of this book." },
  { id: "dispersion", group: "Volatility", label: "Dispersion", rule: "Residual vol versus the home index in the top quarter of this book." },
  { id: "custom", group: "Yours", label: "Custom", rule: "Your RSI band, distance from the 52-week high, and realized-vol band." },
] as const;

type PresetId = (typeof PRESETS)[number]["id"];
type Horizon = "5" | "21" | "63" | "mom";
type SortKey = "horizon" | "beta" | "idio" | "rsi" | "rv" | "volp" | "low52";

const HORIZONS: { id: Horizon; label: string }[] = [
  { id: "5", label: "5 sessions" },
  { id: "21", label: "1 month" },
  { id: "63", label: "3 months" },
  { id: "mom", label: "12–1" },
];

const SORTS: { id: SortKey; label: string }[] = [
  { id: "horizon", label: "Horizon return" },
  { id: "beta", label: "Beta" },
  { id: "idio", label: "Residual vol" },
  { id: "rsi", label: "RSI" },
  { id: "rv", label: "Realized vol" },
  { id: "volp", label: "Vol percentile" },
  { id: "low52", label: "52-week location" },
];

function horizonOf(row: ScreenStats, horizon: Horizon): number | null {
  if (horizon === "5") return row.ret5;
  if (horizon === "21") return row.ret21;
  if (horizon === "63") return row.ret63;
  return row.mom;
}

function sortValue(row: ScreenStats, sort: SortKey, horizon: Horizon): number | null {
  if (sort === "horizon") return horizonOf(row, horizon);
  if (sort === "beta") return row.beta;
  if (sort === "idio") return row.idio;
  if (sort === "rsi") return row.rsi;
  if (sort === "rv") return row.rv21;
  if (sort === "volp") return row.volPct;
  return row.range52;
}

function pct(value: number | null, digits = 1): string {
  return value == null ? "—" : `${(value * 100).toFixed(digits)}%`;
}

function num(value: number | null, digits = 2): string {
  return value == null ? "—" : value.toFixed(digits);
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function cutoff(values: number[], p: number): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
  return sorted[index];
}

function bound(raw: string): number | null {
  if (raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

type Row = ScreenStats & { vs: string };

export function ScreenerPage() {
  const [mode, setMode] = useState<"region" | "country">("region");
  const [region, setRegion] = useState<RegionId>("us");
  const [country, setCountry] = useState<CountryId>("gb");
  const [preset, setPreset] = useState<PresetId>("momentum");
  const [horizon, setHorizon] = useState<Horizon>("mom");
  const [sort, setSort] = useState<SortKey>("horizon");
  const [minRet, setMinRet] = useState("");
  const [maxRet, setMaxRet] = useState("");
  const [rsiMin, setRsiMin] = useState("");
  const [rsiMax, setRsiMax] = useState("");
  const [offHigh, setOffHigh] = useState("");
  const [rvMin, setRvMin] = useState("");
  const [rvMax, setRvMax] = useState("");
  const [ready, setReady] = useState(false);
  const [live, setLive] = useState(false);
  const [screenAlert, setScreenAlert] = useState<number | null>(null);
  const [screenHits, setScreenHits] = useState<string[]>([]);
  const serverReady = useRef(false);
  const { user, isPending } = useCurrentUserState();
  const names = mode === "country" ? countryNames(country) : regionNames(region);
  const meta = countryMeta(country);
  const news = mode === "country" ? meta.news : regionNews(region);
  const chunks = screenerChunks(names);
  const q0 = useBasketQuery(chunks[0] ?? [], "2y");
  const q1 = useBasketQuery(chunks[1] ?? [], "2y");
  const q2 = useBasketQuery(chunks[2] ?? [], "2y");
  const q3 = useBasketQuery(chunks[3] ?? [], "2y");
  const q4 = useBasketQuery(chunks[4] ?? [], "2y");
  const q5 = useBasketQuery(chunks[5] ?? [], "2y");
  const q6 = useBasketQuery(chunks[6] ?? [], "2y");
  const q7 = useBasketQuery(chunks[7] ?? [], "2y");
  const queries = [q0, q1, q2, q3, q4, q5, q6, q7];

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<{
          region: string;
          country: CountryId;
          mode: "region" | "country";
          preset: PresetId;
          horizon: Horizon;
          sort: SortKey;
          minRet: string;
          maxRet: string;
          rsiMin: string;
          rsiMax: string;
          offHigh: string;
          rvMin: string;
          rvMax: string;
        }>;
        if (saved.mode === "country" || saved.mode === "region") setMode(saved.mode);
        if (saved.region === "g10") setRegion("emea");
        else if (saved.region === "us" || saved.region === "emea" || saved.region === "apac") setRegion(saved.region);
        if (saved.country && COUNTRY_OPTIONS.some((row) => row.id === saved.country)) setCountry(saved.country);
        if (saved.preset && PRESETS.some((row) => row.id === saved.preset)) setPreset(saved.preset);
        if (saved.horizon && HORIZONS.some((row) => row.id === saved.horizon)) setHorizon(saved.horizon);
        if (saved.sort && SORTS.some((row) => row.id === saved.sort)) setSort(saved.sort);
        if (typeof saved.minRet === "string") setMinRet(saved.minRet);
        if (typeof saved.maxRet === "string") setMaxRet(saved.maxRet);
        if (typeof saved.rsiMin === "string") setRsiMin(saved.rsiMin);
        if (typeof saved.rsiMax === "string") setRsiMax(saved.rsiMax);
        if (typeof saved.offHigh === "string") setOffHigh(saved.offHigh);
        if (typeof saved.rvMin === "string") setRvMin(saved.rvMin);
        if (typeof saved.rvMax === "string") setRvMax(saved.rvMax);
      }
    } catch {
      /* ignore a bad save */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    setLive(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ mode, region, country, preset, horizon, sort, minRet, maxRet, rsiMin, rsiMax, offHigh, rvMin, rvMax }));
    } catch {
      /* private mode */
    }
  }, [ready, mode, region, country, preset, horizon, sort, minRet, maxRet, rsiMin, rsiMax, offHigh, rvMin, rvMax]);

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
        const saved = desk.screen;
        if (saved.mode === "country" || saved.mode === "region") setMode(saved.mode);
        if (saved.region === "us" || saved.region === "emea" || saved.region === "apac") setRegion(saved.region);
        if (saved.country && COUNTRY_OPTIONS.some((row) => row.id === saved.country)) setCountry(saved.country as CountryId);
        if (saved.preset && PRESETS.some((row) => row.id === saved.preset)) setPreset(saved.preset as PresetId);
        if (saved.horizon && HORIZONS.some((row) => row.id === saved.horizon)) setHorizon(saved.horizon as Horizon);
        if (saved.sort && SORTS.some((row) => row.id === saved.sort)) setSort(saved.sort as SortKey);
        if (typeof saved.minRet === "string") setMinRet(saved.minRet);
        if (typeof saved.maxRet === "string") setMaxRet(saved.maxRet);
        if (typeof saved.rsiMin === "string") setRsiMin(saved.rsiMin);
        if (typeof saved.rsiMax === "string") setRsiMax(saved.rsiMax);
        if (typeof saved.offHigh === "string") setOffHigh(saved.offHigh);
        if (typeof saved.rvMin === "string") setRvMin(saved.rvMin);
        if (typeof saved.rvMax === "string") setRvMax(saved.rvMax);
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
    if (!ready || !user?.id || !serverReady.current) return;
    const handle = window.setTimeout(() => {
      saveScreen({ data: { mode, region, country, preset, horizon, sort, minRet, maxRet, rsiMin, rsiMax, offHigh, rvMin, rvMax } }).catch(() => {});
    }, 500);
    return () => window.clearTimeout(handle);
  }, [ready, user?.id, mode, region, country, preset, horizon, sort, minRet, maxRet, rsiMin, rsiMax, offHigh, rvMin, rvMax]);

  useEffect(() => {
    if (!user?.id) {
      setScreenAlert(null);
      return;
    }
    let cancel = false;
    listAlerts()
      .then((rows) => {
        if (cancel) return;
        const hit = rows.find((row) => row.kind === "screen");
        setScreenAlert(hit ? hit.id : null);
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, [user?.id]);

  const loaded = useMemo(() => {
    const results = queries.flatMap((query) => query.data?.results ?? []);
    const bySymbol = new Map(results.filter((row) => row.ok).map((row) => [row.series.symbol, row]));
    const pending = chunks.some((symbols, index) => symbols.length >= 2 && !queries[index]?.data && (queries[index]?.isPending || queries[index]?.isFetching));
    const rows: Row[] = [];
    let failed = 0;
    for (const name of names) {
      const row = bySymbol.get(name.symbol);
      const bench = bySymbol.get(name.bench);
      if (!row?.ok || !bench?.ok) {
        if (!pending) failed += 1;
        continue;
      }
      const stats = screenStats(name.symbol, name.name, row.series.bars, bench.series.bars);
      if (stats) rows.push({ ...stats, vs: name.vs });
      else if (!pending) failed += 1;
    }
    return { rows, failed, pending };
  }, [q0.data, q1.data, q2.data, q3.data, q4.data, q5.data, q6.data, q7.data, q0.isPending, q1.isPending, q2.isPending, q3.isPending, q4.isPending, q5.isPending, q6.isPending, q7.isPending, q0.isFetching, q1.isFetching, q2.isFetching, q3.isFetching, q4.isFetching, q5.isFetching, q6.isFetching, q7.isFetching, mode, region, country]);

  const rvCut = median(loaded.rows.map((row) => row.rv21).filter((value): value is number => value != null));
  const idioCut = cutoff(loaded.rows.map((row) => row.idio).filter((value): value is number => value != null), 0.75);

  function matches(row: ScreenStats, id: PresetId): boolean {
    if (id === "momentum") return row.mom != null && row.mom > 0 && row.above50;
    if (id === "breakout") return row.distHigh20 != null && row.distHigh20 >= -0.02 && row.distHigh20 <= 0.01 && row.rsi != null && row.rsi >= 45 && row.rsi <= 70;
    if (id === "low52") return row.range52 != null && row.range52 <= 0.25 && !(row.below200 && (row.ret63 ?? 0) < -0.15);
    if (id === "washout") return (row.rsi != null && row.rsi < 30) || (row.z != null && row.z <= -2);
    if (id === "quiet") return rvCut != null && row.rv21 != null && row.rv21 <= rvCut;
    if (id === "dispersion") return idioCut != null && row.idio != null && row.idio >= idioCut;
    const rsiLo = bound(rsiMin);
    const rsiHi = bound(rsiMax);
    const high = bound(offHigh);
    const volLo = bound(rvMin);
    const volHi = bound(rvMax);
    if (rsiLo != null && (row.rsi == null || row.rsi < rsiLo)) return false;
    if (rsiHi != null && (row.rsi == null || row.rsi > rsiHi)) return false;
    if (high != null && (row.offHigh == null || row.offHigh * 100 > high)) return false;
    if (volLo != null && (row.rv21 == null || row.rv21 * 100 < volLo)) return false;
    if (volHi != null && (row.rv21 == null || row.rv21 * 100 > volHi)) return false;
    return true;
  }

  const counts = Object.fromEntries(PRESETS.map((item) => [item.id, loaded.rows.filter((row) => matches(row, item.id)).length])) as Record<PresetId, number>;
  const floor = bound(minRet);
  const cap = bound(maxRet);
  const shown = loaded.rows
    .filter((row) => matches(row, preset))
    .filter((row) => {
      const value = horizonOf(row, horizon);
      if (floor == null && cap == null) return true;
      if (value == null) return false;
      const pctValue = value * 100;
      if (floor != null && pctValue < floor) return false;
      if (cap != null && pctValue > cap) return false;
      return true;
    })
    .sort((left, right) => {
      const aValue = sortValue(left, sort, horizon);
      const bValue = sortValue(right, sort, horizon);
      if (aValue == null && bValue == null) return left.symbol.localeCompare(right.symbol);
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      const ascending = sort === "rsi" || sort === "rv" || sort === "low52";
      return ascending ? aValue - bValue : bValue - aValue;
    });

  const hitKey = shown.map((row) => row.symbol).join(",");
  const scope = mode === "country" ? `c:${country}` : `r:${region}`;

  useEffect(() => {
    if (!live || !user?.id || screenAlert == null || loaded.pending) return;
    const symbols = hitKey ? hitKey.split(",") : [];
    const handle = window.setTimeout(() => {
      noteScreen({ data: { preset, scope, symbols } })
        .then((result) => {
          if (result.added.length) setScreenHits(result.added);
        })
        .catch(() => {});
    }, 800);
    return () => window.clearTimeout(handle);
  }, [live, user?.id, screenAlert, loaded.pending, preset, scope, hitKey]);

  const heat = [...loaded.rows].sort((left, right) => (right.ret21 ?? -99) - (left.ret21 ?? -99));
  const regionNote = REGIONS.find((item) => item.id === region)?.note ?? "";
  const note = mode === "country"
    ? country === "sa"
      ? "Saudi Arabia. Prices are in riyals. The Tadawul series is a single print, so beta and residual vol stay blank."
      : `${meta.label}. Beta is versus ${meta.vs}, in local currency.`
    : regionNote;

  return (
    <Split title="Screener" symbol={news}>
      <div className="mt-4 flex flex-wrap gap-1" role="group" aria-label="Book">
        {REGIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={mode === "region" && region === item.id}
            onClick={() => {
              setMode("region");
              setRegion(item.id);
            }}
            className={"min-h-11 rounded-md px-3 text-sm " + (mode === "region" && region === item.id ? "bg-accent text-accent-ink" : "border border-line text-muted")}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={mode === "country"}
          onClick={() => setMode("country")}
          className={"min-h-11 rounded-md px-3 text-sm " + (mode === "country" ? "bg-accent text-accent-ink" : "border border-line text-muted")}
        >
          Country
        </button>
      </div>
      {mode === "country" ? (
        <div className="mt-3 max-w-xs">
          <Choice label="Country" value={country} options={COUNTRY_OPTIONS} onChange={setCountry} />
        </div>
      ) : null}
      <p className="mt-3 max-w-2xl text-sm text-muted">
        {names.length} names, two years of closes. {note} A row opens the chart or the strategy lab. This is price and volatility, not a fundamental screen.
      </p>
      <p className="mt-1 max-w-2xl text-xs text-faint">
        EMEA is Europe, South Africa, and Saudi Arabia. APAC is Asia-Pacific. Country screens one market, and it is the only place Canada appears. Returns stay in local currency.
      </p>
      {(["Price", "Volatility", "Yours"] as const).map((group) => (
        <section key={group} className="mt-5">
          <h2 className="text-xs font-medium text-muted">{group}</h2>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PRESETS.filter((item) => item.group === group).map((item) => {
              const active = preset === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setPreset(item.id);
                    if (item.id === "momentum") {
                      setHorizon("mom");
                      setSort("horizon");
                    } else if (item.id === "low52") setSort("low52");
                    else if (item.id === "washout") setSort("rsi");
                    else if (item.id === "quiet") setSort("rv");
                    else if (item.id === "dispersion") setSort("idio");
                    else setSort("horizon");
                  }}
                  className={"rounded-md border px-3 py-3 text-left " + (active ? "border-accent bg-surface" : "border-line")}
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-fg">{item.label}</span>
                    <span className="font-mono text-sm text-fg">{loaded.rows.length ? counts[item.id] : "—"}</span>
                  </span>
                  <span className="mt-1 block text-xs text-muted">{item.rule}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Choice label="Horizon" value={horizon} options={HORIZONS} onChange={setHorizon} />
        <Field label="Min return %" value={minRet} onChange={setMinRet} />
        <Field label="Max return %" value={maxRet} onChange={setMaxRet} />
        <Choice label="Sort" value={sort} options={SORTS} onChange={setSort} />
      </div>
      {preset === "custom" ? (
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Field label="RSI min" value={rsiMin} onChange={setRsiMin} />
          <Field label="RSI max" value={rsiMax} onChange={setRsiMax} />
          <Field label="Max % off high" value={offHigh} onChange={setOffHigh} />
          <Field label="RV min %" value={rvMin} onChange={setRvMin} />
          <Field label="RV max %" value={rvMax} onChange={setRvMax} />
        </div>
      ) : null}
      {loaded.pending && !loaded.rows.length ? <p className="mt-4 text-sm text-muted">Loading the book</p> : null}
      {loaded.failed ? <p className="mt-3 text-xs text-down">{loaded.failed} names did not load</p> : null}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-faint">
          {shown.length} of {counts[preset] ?? 0} on this screen pass the return band. Beta and residual vol use the last year of daily returns against the home index named under each ticker. Residual vol is what is left after that beta, annualized.
        </p>
        {live && user ? (
          <button
            type="button"
            className="min-h-11 shrink-0 rounded-md border border-line px-3 text-xs text-muted"
            onClick={() => {
              if (screenAlert != null) {
                dropAlert({ data: { id: screenAlert } }).then(() => {
                  setScreenAlert(null);
                  setScreenHits([]);
                }).catch(() => {});
                return;
              }
              armAlert({ data: { kind: "screen", symbol: "SCREEN", side: "above" } })
                .then(() => listAlerts())
                .then((rows) => {
                  const hit = rows.find((row) => row.kind === "screen");
                  setScreenAlert(hit ? hit.id : null);
                })
                .catch(() => {});
            }}
          >
            {screenAlert != null ? "Screen ping on" : "Ping new names"}
          </button>
        ) : null}
      </div>
      {screenHits.length ? <p className="mt-2 text-sm text-fg">New on this screen: {screenHits.join(", ")}. Also on the Vol page.</p> : null}
      <TableExport file="screener">
      <div className="mt-3 overflow-x-auto rounded-md border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 text-right font-medium">12–1</th>
              <th className="px-3 py-2 text-right font-medium">RSI</th>
              <th className="px-3 py-2 text-right font-medium">Beta</th>
              <th className="px-3 py-2 text-right font-medium">Idio</th>
              <th className="px-3 py-2 text-right font-medium">RV 21</th>
              <th className="px-3 py-2 text-right font-medium">Vol %ile</th>
              <th className="px-3 py-2 text-right font-medium">52w</th>
              <th className="px-3 py-2 font-medium">Open</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.symbol} className="border-t border-line">
                <td className="px-3 py-2">
                  <Link to="/equities" search={{ symbol: row.symbol }} className="block min-h-11 py-1">
                    <span className="font-mono text-fg">{row.symbol}</span>
                    <span className="mt-0.5 block text-xs text-faint">{row.name}</span>
                    <span className="block text-xs text-faint">vs {row.vs.replace(/^the /, "")}</span>
                  </Link>
                </td>
                <td className="px-3 py-2 text-right font-mono">{pct(row.mom)}</td>
                <td className="px-3 py-2 text-right font-mono">{num(row.rsi, 0)}</td>
                <td className="px-3 py-2 text-right font-mono">{num(row.beta)}</td>
                <td className="px-3 py-2 text-right font-mono">{pct(row.idio, 0)}</td>
                <td className="px-3 py-2 text-right font-mono">{pct(row.rv21, 0)}</td>
                <td className="px-3 py-2 text-right font-mono">{row.volPct == null ? "—" : row.volPct.toFixed(0)}</td>
                <td className="px-3 py-2 text-right font-mono">{row.range52 == null ? "—" : `${(row.range52 * 100).toFixed(0)}`}</td>
                <td className="px-3 py-2">
                  <span className="flex gap-3">
                    <Link to="/equities" search={{ symbol: row.symbol }} className="inline-flex min-h-11 items-center text-sm text-accent">
                      Chart
                    </Link>
                    <Link to="/lab" search={{ symbol: row.symbol }} className="inline-flex min-h-11 items-center text-sm text-fg">
                      Lab
                    </Link>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </TableExport>
      {!loaded.pending && !shown.length ? <p className="mt-3 text-sm text-muted">Nothing matches. Widen the band or pick another screen.</p> : null}
      {heat.length ? (
        <section className="mt-6">
          <h2 className="text-sm font-medium">Book returns</h2>
          <p className="mt-1 text-xs text-faint">Percent, local currency, sorted by the last month. The whole book, not only the screen.</p>
          <div className="mt-3">
            <Heatmap
              file="screener-returns"
              columns={["1w", "1m", "3m", "12m"]}
              rows={heat.map((row) => ({
                label: row.symbol,
                cells: [row.ret5, row.ret21, row.ret63, row.ret252].map((value) => (value == null ? null : value * 100)),
              }))}
              scale="diverge"
              format={(value) => value.toFixed(1)}
            />
          </div>
        </section>
      ) : null}
    </Split>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-xs text-muted">
      {label}
      <input
        value={value}
        inputMode="decimal"
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 min-h-11 w-full rounded-md border border-line bg-surface px-3 font-mono text-sm text-fg"
      />
    </label>
  );
}
