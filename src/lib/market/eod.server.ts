import { loadSeries } from "./load.server";
import { volSnapshot, volState } from "./vol";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

type Spec = {
  symbol: string;
  name: string;
  group: string;
  nasdaq?: string;
  klass?: "stocks" | "etf";
  yahoo?: string;
};

export const VOL_SPECS: Spec[] = [
  { symbol: "SPY", name: "S&P 500", group: "US", nasdaq: "SPY", klass: "etf" },
  { symbol: "QQQ", name: "Nasdaq 100", group: "US", nasdaq: "QQQ", klass: "etf" },
  { symbol: "IWM", name: "Russell 2000", group: "US", nasdaq: "IWM", klass: "etf" },
  { symbol: "AAPL", name: "Apple", group: "US", nasdaq: "AAPL", klass: "stocks" },
  { symbol: "NVDA", name: "Nvidia", group: "US", nasdaq: "NVDA", klass: "stocks" },
  { symbol: "EFA", name: "Europe", group: "World", nasdaq: "EFA", klass: "etf" },
  { symbol: "EWJ", name: "Japan", group: "World", nasdaq: "EWJ", klass: "etf" },
  { symbol: "INDA", name: "India", group: "India", nasdaq: "INDA", klass: "etf" },
  { symbol: "TLT", name: "US 20-year", group: "Rates", nasdaq: "TLT", klass: "etf" },
  { symbol: "UUP", name: "Dollar", group: "FX", nasdaq: "UUP", klass: "etf" },
  { symbol: "GLD", name: "Gold", group: "Commodity", nasdaq: "GLD", klass: "etf" },
  { symbol: "USO", name: "Crude", group: "Commodity", nasdaq: "USO", klass: "etf" },
  { symbol: "^NSEI", name: "Nifty 50", group: "India", yahoo: "^NSEI" },
  { symbol: "RELIANCE.NS", name: "Reliance", group: "India", yahoo: "RELIANCE.NS" },
  { symbol: "TCS.NS", name: "TCS", group: "India", yahoo: "TCS.NS" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank", group: "India", yahoo: "HDFCBANK.NS" },
];

export type VolRow = {
  symbol: string;
  name: string;
  group: string;
  source: string;
  last: number | null;
  rv: number | null;
  pct: number | null;
  prev: number | null;
  delta: number | null;
  state: "quiet" | "awake" | "steady" | "blank";
  error?: string;
};

export type VolBoard = {
  updated: string;
  nse: string;
  rows: VolRow[];
};

const cache = new Map<string, { exp: number; val: unknown }>();

function cached<T>(key: string, ttl: number, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return Promise.resolve(hit.val as T);
  return load().then((val) => {
    cache.set(key, { exp: Date.now() + ttl, val });
    return val;
  });
}

function price(text: unknown): number | null {
  const value = Number(String(text ?? "").replace(/[$,]/g, ""));
  return Number.isFinite(value) && value > 0 ? value : null;
}

async function nasdaqCloses(symbol: string, klass: string): Promise<number[]> {
  const url = `https://api.nasdaq.com/api/quote/${encodeURIComponent(symbol)}/historical?assetclass=${klass}&fromdate=2022-01-01&limit=800`;
  const res = await fetch(url, { headers: { "user-agent": UA, accept: "application/json" } });
  if (!res.ok) throw new Error(`Nasdaq ${res.status}`);
  const body = (await res.json()) as { data?: { tradesTable?: { rows?: { close?: string }[] } } };
  const rows = body.data?.tradesTable?.rows ?? [];
  const closes = rows.map((row) => price(row.close)).filter((value): value is number => value != null).reverse();
  if (closes.length < 80) throw new Error("Short Nasdaq history");
  return closes;
}

async function yahooCloses(symbol: string): Promise<number[]> {
  const loaded = await loadSeries(symbol, "2y");
  const closes = (loaded.bars as { c: number }[]).map((bar) => bar.c).filter((value) => value > 0);
  if (closes.length < 80) throw new Error("Short history");
  return closes;
}

async function nseNote(): Promise<string> {
  return cached("nse:bhav", 60 * 60_000, async () => {
    try {
      const res = await fetch("https://nsearchives.nseindia.com/content/cm/BhavCopy_NSE_CM_0_0_0_20261023_F_0000.csv.zip", {
        headers: { "user-agent": UA, accept: "*/*" },
      });
      if (res.ok) return "NSE bhavcopy answered.";
      return `NSE bhavcopy refused this network (${res.status}). Indian single names use the quote feed.`;
    } catch {
      return "NSE bhavcopy did not answer. Indian single names use the quote feed.";
    }
  });
}

async function one(spec: Spec): Promise<VolRow> {
  const base = { symbol: spec.symbol, name: spec.name, group: spec.group, source: "", last: null, rv: null, pct: null, prev: null, delta: null, state: "blank" as const };
  try {
    const closes = spec.nasdaq && spec.klass ? await nasdaqCloses(spec.nasdaq, spec.klass) : await yahooCloses(spec.yahoo || spec.symbol);
    const snap = volSnapshot(closes);
    if (!snap) return { ...base, source: spec.nasdaq ? "Nasdaq end-of-day" : "Quote feed", error: "Not enough history" };
    return {
      ...base,
      source: spec.nasdaq ? "Nasdaq end-of-day" : "Quote feed",
      last: closes[closes.length - 1],
      rv: snap.rv,
      pct: snap.pct,
      prev: snap.prev,
      delta: snap.delta,
      state: volState(snap.pct, snap.delta),
    };
  } catch (error) {
    return { ...base, error: error instanceof Error ? error.message : "No history" };
  }
}

async function pool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;
        out[index] = await fn(items[index]);
      }
    }),
  );
  return out;
}

export async function loadVolBoard(): Promise<VolBoard> {
  return cached("vol:board", 30 * 60_000, async () => {
    const [nse, rows] = await Promise.all([nseNote(), pool(VOL_SPECS, 4, one)]);
    return { updated: new Date().toISOString(), nse, rows };
  });
}

export async function loadVolSymbol(symbol: string): Promise<VolRow | null> {
  const spec = VOL_SPECS.find((row) => row.symbol === symbol);
  if (!spec) return null;
  return one(spec);
}
