import type { Bar } from "./types";

export const GRAMS_PER_TROY_OZ = 31.1034768;

export function inrBullion(usdPerOz: number, usdInr: number) {
  const inrPerOz = usdPerOz * usdInr;
  const inrPerGram = inrPerOz / GRAMS_PER_TROY_OZ;
  return {
    inrPerOz,
    inrPerGram,
    inrPer10g: inrPerGram * 10,
    inrPerKg: inrPerGram * 1000,
  };
}

export function mean(xs: number[]): number {
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

export function pearson(xs: number[], ys: number[]): number | null {
  if (xs.length !== ys.length || xs.length < 20) return null;
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < xs.length; i++) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  if (dx === 0 || dy === 0) return null;
  return num / Math.sqrt(dx * dy);
}

export function stdevSample(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  let v = 0;
  for (const x of xs) v += (x - m) * (x - m);
  return Math.sqrt(v / (xs.length - 1));
}

function stdevPop(xs: number[]): number {
  if (!xs.length) return 0;
  const m = mean(xs);
  let v = 0;
  for (const x of xs) v += (x - m) * (x - m);
  return Math.sqrt(v / xs.length);
}

export function lastNum(xs: (number | null)[]): number | null {
  for (let i = xs.length - 1; i >= 0; i--) {
    if (xs[i] != null && Number.isFinite(xs[i] as number)) return xs[i] as number;
  }
  return null;
}

export function sma(values: number[], n: number): (number | null)[] {
  const out: (number | null)[] = Array(values.length).fill(null);
  if (n <= 0) return out;
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= n) sum -= values[i - n];
    if (i >= n - 1) out[i] = sum / n;
  }
  return out;
}

export function ema(values: number[], n: number): (number | null)[] {
  const out: (number | null)[] = Array(values.length).fill(null);
  if (n <= 0 || values.length < n) return out;
  const k = 2 / (n + 1);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += values[i];
  let prev = sum / n;
  out[n - 1] = prev;
  for (let i = n; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

function emaNullable(values: (number | null)[], n: number): (number | null)[] {
  const out: (number | null)[] = Array(values.length).fill(null);
  const k = 2 / (n + 1);
  const seed: number[] = [];
  let prev: number | null = null;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v == null || !Number.isFinite(v)) continue;
    if (prev == null) {
      seed.push(v);
      if (seed.length === n) {
        prev = mean(seed);
        out[i] = prev;
      }
    } else {
      prev = v * k + prev * (1 - k);
      out[i] = prev;
    }
  }
  return out;
}

export function rsi(values: number[], n = 14): (number | null)[] {
  const out: (number | null)[] = Array(values.length).fill(null);
  if (values.length <= n) return out;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= n; i++) {
    const d = values[i] - values[i - 1];
    if (d >= 0) gain += d;
    else loss -= d;
  }
  gain /= n;
  loss /= n;
  out[n] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
  for (let i = n + 1; i < values.length; i++) {
    const d = values[i] - values[i - 1];
    const g = d > 0 ? d : 0;
    const l = d < 0 ? -d : 0;
    gain = (gain * (n - 1) + g) / n;
    loss = (loss * (n - 1) + l) / n;
    out[i] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
  }
  return out;
}

export function atr(bars: { h: number; l: number; c: number }[], n = 14): (number | null)[] {
  const out: (number | null)[] = Array(bars.length).fill(null);
  if (bars.length < n) return out;
  const tr: number[] = [];
  for (let i = 0; i < bars.length; i++) {
    if (i === 0) tr.push(bars[i].h - bars[i].l);
    else {
      const prev = bars[i - 1].c;
      tr.push(Math.max(bars[i].h - bars[i].l, Math.abs(bars[i].h - prev), Math.abs(bars[i].l - prev)));
    }
  }
  let prev = mean(tr.slice(0, n));
  out[n - 1] = prev;
  for (let i = n; i < tr.length; i++) {
    prev = (prev * (n - 1) + tr[i]) / n;
    out[i] = prev;
  }
  return out;
}

export function bollinger(values: number[], n = 20, k = 2) {
  const mid = sma(values, n);
  const up: (number | null)[] = Array(values.length).fill(null);
  const lo: (number | null)[] = Array(values.length).fill(null);
  for (let i = n - 1; i < values.length; i++) {
    const slice = values.slice(i - n + 1, i + 1);
    const sd = stdevPop(slice);
    const m = mid[i];
    if (m == null) continue;
    up[i] = m + k * sd;
    lo[i] = m - k * sd;
  }
  return { mid, up, lo };
}

export type Snapshot = {
  price: number;
  rsi: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHist: number | null;
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  distSma20: number | null;
  distSma50: number | null;
  distSma200: number | null;
  bbUp: number | null;
  bbMid: number | null;
  bbLo: number | null;
  pctB: number | null;
  atr: number | null;
  atrPct: number | null;
  rv20: number | null;
  ret21: number | null;
  ret63: number | null;
  ret252: number | null;
  ret252Sessions: number | null;
  drawdown: number | null;
  maxDrawdown: number | null;
};

export type Frame = {
  sma20: (number | null)[];
  sma50: (number | null)[];
  sma200: (number | null)[];
  rsi: (number | null)[];
  bbUp: (number | null)[];
  bbLo: (number | null)[];
  snapshot: Snapshot;
};

function dist(price: number, avg: number | null): number | null {
  if (avg == null || avg === 0) return null;
  return (price / avg - 1) * 100;
}

function retOver(closes: number[], sessions: number): number | null {
  if (closes.length <= sessions) return null;
  const prev = closes[closes.length - 1 - sessions];
  const last = closes[closes.length - 1];
  if (prev <= 0) return null;
  return (last / prev - 1) * 100;
}

export function indicatorFrame(bars: Bar[]): Frame | null {
  if (bars.length < 5) return null;
  const closes = bars.map((b) => b.c);
  const sma20 = sma(closes, 20);
  const sma50 = sma(closes, 50);
  const sma200 = sma(closes, 200);
  const rsi14 = rsi(closes, 14);
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const macdLine: (number | null)[] = closes.map((_, i) =>
    ema12[i] != null && ema26[i] != null ? (ema12[i] as number) - (ema26[i] as number) : null,
  );
  const signal = emaNullable(macdLine, 9);
  const bb = bollinger(closes, 20, 2);
  const atr14 = atr(bars, 14);
  const price = closes[closes.length - 1];
  const bbUp = lastNum(bb.up);
  const bbLo = lastNum(bb.lo);
  const bbMid = lastNum(bb.mid);
  const pctB = bbUp != null && bbLo != null && bbUp !== bbLo ? (price - bbLo) / (bbUp - bbLo) : null;
  const atrLast = lastNum(atr14);
  const logR: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > 0 && closes[i - 1] > 0) logR.push(Math.log(closes[i] / closes[i - 1]));
  }
  const tail = logR.slice(-20);
  const rv20 = tail.length >= 10 ? stdevSample(tail) * Math.sqrt(252) * 100 : null;
  let peak = closes[0];
  let maxDd = 0;
  for (const c of closes) {
    if (c > peak) peak = c;
    const dd = c / peak - 1;
    if (dd < maxDd) maxDd = dd;
  }
  const yearSessions = closes.length > 252 ? 252 : closes.length > 180 ? closes.length - 1 : 0;
  const macd = lastNum(macdLine);
  const macdSignal = lastNum(signal);
  return {
    sma20,
    sma50,
    sma200,
    rsi: rsi14,
    bbUp: bb.up,
    bbLo: bb.lo,
    snapshot: {
      price,
      rsi: lastNum(rsi14),
      macd,
      macdSignal,
      macdHist: macd != null && macdSignal != null ? macd - macdSignal : null,
      sma20: lastNum(sma20),
      sma50: lastNum(sma50),
      sma200: lastNum(sma200),
      distSma20: dist(price, lastNum(sma20)),
      distSma50: dist(price, lastNum(sma50)),
      distSma200: dist(price, lastNum(sma200)),
      bbUp,
      bbMid,
      bbLo,
      pctB,
      atr: atrLast,
      atrPct: atrLast != null && price !== 0 ? (atrLast / price) * 100 : null,
      rv20,
      ret21: retOver(closes, 21),
      ret63: retOver(closes, 63),
      ret252: yearSessions ? retOver(closes, yearSessions) : null,
      ret252Sessions: yearSessions || null,
      drawdown: peak > 0 ? (price / peak - 1) * 100 : null,
      maxDrawdown: maxDd * 100,
    },
  };
}

export function betaCorr(
  asset: { d: string; c: number }[],
  bench: { d: string; c: number }[],
): { beta: number | null; corr: number | null; n: number } {
  const bm = new Map(bench.map((b) => [b.d, b.c]));
  const rows = asset.filter((a) => bm.has(a.d));
  const ar: number[] = [];
  const br: number[] = [];
  for (let i = 1; i < rows.length; i++) {
    const a0 = rows[i - 1].c;
    const a1 = rows[i].c;
    const b0 = bm.get(rows[i - 1].d)!;
    const b1 = bm.get(rows[i].d)!;
    if (a0 > 0 && a1 > 0 && b0 > 0 && b1 > 0) {
      ar.push(Math.log(a1 / a0));
      br.push(Math.log(b1 / b0));
    }
  }
  const n = ar.length;
  if (n < 20) return { beta: null, corr: null, n };
  const ma = mean(ar);
  const mb = mean(br);
  let cov = 0;
  let va = 0;
  let vb = 0;
  for (let i = 0; i < n; i++) {
    const da = ar[i] - ma;
    const db = br[i] - mb;
    cov += da * db;
    va += da * da;
    vb += db * db;
  }
  const den = n - 1;
  cov /= den;
  va /= den;
  vb /= den;
  return {
    beta: vb === 0 ? null : cov / vb,
    corr: va === 0 || vb === 0 ? null : cov / Math.sqrt(va * vb),
    n,
  };
}

function solveLinear(matrix: number[][], vector: number[]): number[] | null {
  const n = matrix.length;
  const m = matrix.map((row, i) => [...row, vector[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    let max = Math.abs(m[col][col]);
    for (let r = col + 1; r < n; r++) {
      const v = Math.abs(m[r][col]);
      if (v > max) {
        max = v;
        pivot = r;
      }
    }
    if (max < 1e-12) return null;
    if (pivot !== col) {
      const tmp = m[col];
      m[col] = m[pivot];
      m[pivot] = tmp;
    }
    const div = m[col][col];
    for (let c = col; c <= n; c++) m[col][c] /= div;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = m[r][col];
      if (f === 0) continue;
      for (let c = col; c <= n; c++) m[r][c] -= f * m[col][c];
    }
  }
  return m.map((row) => row[n]);
}

type Ols = { beta: number[]; t: number[]; n: number; k: number };

function ols(y: number[], x: number[][]): Ols | null {
  const n = y.length;
  const k = x[0]?.length ?? 0;
  if (n <= k + 2 || k === 0) return null;
  const xtx = Array.from({ length: k }, () => Array(k).fill(0));
  const xty = Array(k).fill(0);
  for (let i = 0; i < n; i++) {
    for (let a = 0; a < k; a++) {
      xty[a] += x[i][a] * y[i];
      for (let b = a; b < k; b++) xtx[a][b] += x[i][a] * x[i][b];
    }
  }
  for (let a = 0; a < k; a++) {
    for (let b = 0; b < a; b++) xtx[a][b] = xtx[b][a];
  }
  const beta = solveLinear(xtx, xty);
  if (!beta) return null;
  let sse = 0;
  for (let i = 0; i < n; i++) {
    let yhat = 0;
    for (let a = 0; a < k; a++) yhat += x[i][a] * beta[a];
    const e = y[i] - yhat;
    sse += e * e;
  }
  const sigma2 = sse / (n - k);
  const se = beta.map((_, j) => {
    const eye = Array(k).fill(0);
    eye[j] = 1;
    const col = solveLinear(xtx, eye);
    if (!col) return Number.NaN;
    return Math.sqrt(Math.max(0, sigma2 * col[j]));
  });
  if (se.some((s) => !Number.isFinite(s))) return null;
  return { beta, t: beta.map((b, i) => (se[i] > 0 ? b / se[i] : 0)), n, k };
}

export type Adf = {
  tStat: number;
  beta: number;
  lags: number;
  n: number;
  crit: { p1: number; p5: number; p10: number };
  rejectAt: "1%" | "5%" | "10%" | null;
  stationaryAt5: boolean;
};

/** Augmented Dickey–Fuller with a constant, no trend. Critical values are the large-sample MacKinnon approximations. */
export function adf(series: number[]): Adf | null {
  const n = series.length;
  if (n < 40) return null;
  const lags = Math.min(12, Math.max(1, Math.floor(12 * Math.pow((n - 1) / 100, 0.25))));
  const diffs: number[] = [];
  for (let i = 1; i < n; i++) diffs.push(series[i] - series[i - 1]);
  const y: number[] = [];
  const x: number[][] = [];
  for (let t = lags + 1; t < n; t++) {
    const row = [1, series[t - 1]];
    for (let j = 1; j <= lags; j++) row.push(diffs[t - j - 1]);
    y.push(diffs[t - 1]);
    x.push(row);
  }
  const fit = ols(y, x);
  if (!fit) return null;
  const tStat = fit.t[1];
  const crit = { p1: -3.43, p5: -2.86, p10: -2.57 };
  let rejectAt: Adf["rejectAt"] = null;
  if (tStat < crit.p1) rejectAt = "1%";
  else if (tStat < crit.p5) rejectAt = "5%";
  else if (tStat < crit.p10) rejectAt = "10%";
  return { tStat, beta: fit.beta[1], lags, n: fit.n, crit, rejectAt, stationaryAt5: tStat < crit.p5 };
}

export function halfLife(series: number[]): { beta: number; halfLife: number | null; tStat: number; n: number } | null {
  if (series.length < 30) return null;
  const y: number[] = [];
  const x: number[][] = [];
  for (let t = 1; t < series.length; t++) {
    y.push(series[t] - series[t - 1]);
    x.push([1, series[t - 1]]);
  }
  const fit = ols(y, x);
  if (!fit) return null;
  const b = fit.beta[1];
  return { beta: b, halfLife: b < -1e-8 ? -Math.log(2) / b : null, tStat: fit.t[1], n: fit.n };
}

export function hurstRS(returns: number[]): number | null {
  if (returns.length < 64) return null;
  const xs: number[] = [];
  const ys: number[] = [];
  for (let n = 16; n <= returns.length / 2; n = Math.floor(n * 1.5)) {
    const chunks = Math.floor(returns.length / n);
    if (chunks < 1) break;
    let acc = 0;
    let used = 0;
    for (let c = 0; c < chunks; c++) {
      const slice = returns.slice(c * n, (c + 1) * n);
      const m = mean(slice);
      let cum = 0;
      let hi = -Infinity;
      let lo = Infinity;
      for (const v of slice) {
        cum += v - m;
        if (cum > hi) hi = cum;
        if (cum < lo) lo = cum;
      }
      const s = stdevSample(slice);
      if (s > 0 && hi > lo) {
        acc += (hi - lo) / s;
        used++;
      }
    }
    if (used === 0) continue;
    xs.push(Math.log(n));
    ys.push(Math.log(acc / used));
  }
  if (xs.length < 3) return null;
  const fit = ols(
    ys,
    xs.map((v) => [1, v]),
  );
  if (!fit) return null;
  const h = fit.beta[1];
  return Number.isFinite(h) ? h : null;
}

export function varianceRatio(returns: number[], q: number): number | null {
  const n = returns.length;
  if (q < 2 || n < q * 4) return null;
  const mu = mean(returns);
  let v1 = 0;
  for (const r of returns) v1 += (r - mu) * (r - mu);
  v1 /= n - 1;
  if (v1 === 0) return null;
  const qrets: number[] = [];
  for (let i = q - 1; i < n; i++) {
    let s = 0;
    for (let j = 0; j < q; j++) s += returns[i - j];
    qrets.push(s);
  }
  const muq = mean(qrets);
  let vq = 0;
  for (const r of qrets) vq += (r - muq) * (r - muq);
  vq /= qrets.length - 1;
  return vq / (q * v1);
}

export function acf(values: number[], lag: number): number | null {
  if (values.length <= lag + 5) return null;
  const m = mean(values);
  let den = 0;
  for (const v of values) den += (v - m) * (v - m);
  if (den === 0) return null;
  let num = 0;
  for (let i = lag; i < values.length; i++) num += (values[i] - m) * (values[i - lag] - m);
  return num / den;
}

function logReturns(closes: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < closes.length; i++) out.push(Math.log(closes[i] / closes[i - 1]));
  return out;
}

export function rollingZ(closes: number[], i: number, window: number): number | null {
  if (i < window - 1) return null;
  const slice = closes.slice(i - window + 1, i + 1);
  const sd = stdevSample(slice);
  if (sd === 0) return null;
  return (closes[i] - mean(slice)) / sd;
}

export type Perf = {
  totalReturn: number;
  cagr: number | null;
  sharpe: number | null;
  maxDrawdown: number | null;
  turns: number;
  exposure: number;
  profitFactor: number | null;
};

export type LabParams = {
  window: number;
  entryZ: number;
  exitZ: number;
  costBps: number;
};

export type LabReport = {
  sessions: number;
  start: string;
  end: string;
  latestZ: number | null;
  stance: "Long" | "Short" | "Flat";
  adfLevel: Adf | null;
  adfReturn: Adf | null;
  halfLife: { beta: number; halfLife: number | null; tStat: number; n: number } | null;
  hurst: number | null;
  vr: { q: number; value: number }[];
  acf: { lag: number; value: number }[];
  acfAbs1: number | null;
  buckets: { label: string; n: number; mean: number; median: number }[];
  horizon: number;
  backtest: {
    equity: { d: string; fade: number; trend: number; hold: number; channel: number }[];
    fade: Perf;
    trend: Perf;
    hold: Perf;
    channel: Perf;
  } | null;
  channelState: "Long" | "Short" | "Flat";
  upBreaks: number;
  downBreaks: number;
  tape: {
    date: string;
    breakout20: string;
    breakout50: string;
    location20: number | null;
    nr7: boolean;
    gapPct: number | null;
    streak: number;
  };
  sensitivity: { entry: number; sharpe: number | null; total: number }[];
  lines: string[];
};

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function sharpe(daily: number[]): number | null {
  if (daily.length < 10) return null;
  const sd = stdevSample(daily);
  if (sd === 0) return null;
  return (mean(daily) / sd) * Math.sqrt(252);
}

function maxDrawdownPct(equity: number[]): number | null {
  if (!equity.length) return null;
  let peak = equity[0];
  let max = 0;
  for (const e of equity) {
    if (e > peak) peak = e;
    const dd = e / peak - 1;
    if (dd < max) max = dd;
  }
  return max * 100;
}

function summarize(daily: number[], turns: number, active: number, equity: number[]): Perf {
  let grossWin = 0;
  let grossLoss = 0;
  let equityEnd = 1;
  for (const p of daily) {
    if (p > 0) grossWin += p;
    else grossLoss -= p;
    equityEnd *= 1 + p;
  }
  const days = daily.length;
  return {
    totalReturn: (equityEnd - 1) * 100,
    cagr: days > 5 && equityEnd > 0 ? (Math.pow(equityEnd, 252 / days) - 1) * 100 : null,
    sharpe: sharpe(daily),
    maxDrawdown: maxDrawdownPct(equity),
    turns,
    exposure: days ? (active / days) * 100 : 0,
    profitFactor: grossLoss > 0 ? grossWin / grossLoss : null,
  };
}

function fadeDesired(closes: number[], i: number, window: number, entry: number, exit: number, prev: number): number {
  const z = rollingZ(closes, i, window);
  if (z == null) return prev;
  if (z >= entry) return -1;
  if (z <= -entry) return 1;
  if (Math.abs(z) <= exit) return 0;
  return prev;
}

type Run = { daily: number[]; equity: number[]; turns: number; active: number; lastPos: number };

function runPath(
  closes: number[],
  dates: string[],
  start: number,
  decide: (i: number, prev: number) => number,
  cost: number,
): Run {
  const daily: number[] = [];
  const equity: number[] = [1];
  let held = 0;
  let turns = 0;
  let active = 0;
  let eq = 1;
  for (let i = start; i < closes.length - 1; i++) {
    const desired = decide(i, held);
    if (desired !== held) turns += 1;
    const ret = closes[i + 1] / closes[i] - 1;
    const pnl = desired * ret - Math.abs(desired - held) * cost;
    daily.push(pnl);
    if (desired !== 0) active += 1;
    eq *= 1 + pnl;
    equity.push(eq);
    held = desired;
    void dates;
  }
  const lastPos = fadeSafeLast(closes, start, decide, held);
  return { daily, equity, turns, active, lastPos };
}

function fadeSafeLast(
  closes: number[],
  start: number,
  decide: (i: number, prev: number) => number,
  heldAfterLoop: number,
): number {
  if (closes.length - 1 > start) return decide(closes.length - 1, heldAfterLoop);
  return heldAfterLoop;
}

function priorBand(bars: Bar[], i: number, n: number): { hi: number; lo: number } | null {
  if (i < n) return null;
  let hi = -Infinity;
  let lo = Infinity;
  for (let k = i - n; k < i; k++) {
    if (bars[k].h > hi) hi = bars[k].h;
    if (bars[k].l < lo) lo = bars[k].l;
  }
  if (!(hi >= lo) || !Number.isFinite(hi) || !Number.isFinite(lo)) return null;
  return { hi, lo };
}

function channelDesired(bars: Bar[], i: number, n: number, prev: number): number {
  const band = priorBand(bars, i, n);
  if (!band) return prev;
  if (bars[i].c > band.hi) return 1;
  if (bars[i].c < band.lo) return -1;
  return prev;
}

function bandState(bars: Bar[], n: number): { text: string; location: number | null } {
  const i = bars.length - 1;
  const band = priorBand(bars, i, n);
  if (!band) return { text: `Not enough sessions for a ${n}-day range`, location: null };
  const close = bars[i].c;
  const span = band.hi - band.lo;
  const location = span > 0 ? ((close - band.lo) / span) * 100 : null;
  const text =
    close > band.hi
      ? `Close is above the prior ${n}-session high`
      : close < band.lo
        ? `Close is below the prior ${n}-session low`
        : `Close is inside the prior ${n}-session range`;
  return { text, location };
}

function buildTape(bars: Bar[]): LabReport["tape"] {
  const i = bars.length - 1;
  const b20 = bandState(bars, 20);
  const b50 = bandState(bars, 50);
  let nr7 = false;
  if (i >= 6) {
    const range = bars[i].h - bars[i].l;
    nr7 = range >= 0;
    for (let k = i - 6; k < i; k++) {
      if (bars[k].h - bars[k].l <= range) nr7 = false;
    }
  }
  const prev = i > 0 ? bars[i - 1].c : null;
  const gapPct = prev && prev > 0 ? (bars[i].o / prev - 1) * 100 : null;
  let streak = 0;
  for (let k = i; k > 0; k--) {
    const step = Math.sign(bars[k].c - bars[k - 1].c);
    if (step === 0) break;
    if (streak === 0) streak = step;
    else if (Math.sign(streak) !== step) break;
    else streak += step;
  }
  return {
    date: bars[i].d,
    breakout20: b20.text,
    breakout50: b50.text,
    location20: b20.location,
    nr7,
    gapPct,
    streak,
  };
}

function fmtSharpe(n: number | null): string {
  return n == null || !Number.isFinite(n) ? "n/a" : n.toFixed(2);
}

export function runLab(bars: Bar[], params: LabParams): LabReport | null {
  const closes = bars.map((b) => b.c).filter((c) => c > 0);
  if (closes.length !== bars.length) return null;
  if (bars.length < 80) return null;
  const window = Math.min(120, Math.max(10, Math.round(params.window)));
  const entryZ = Math.min(3.5, Math.max(0.5, params.entryZ));
  const exitZ = Math.min(entryZ - 0.05, Math.max(0, params.exitZ));
  const cost = Math.min(100, Math.max(0, params.costBps)) / 10000;
  const slow = 50;
  const fast = 20;
  const smaFast = sma(closes, fast);
  const smaSlow = sma(closes, slow);
  const logs = bars.map((b) => Math.log(b.c));
  const rets = logReturns(closes);
  const adfLevel = adf(logs);
  const adfReturn = adf(rets);
  const hl = halfLife(logs);
  const hurst = hurstRS(rets);
  const vr = [2, 5, 10]
    .map((q) => {
      const value = varianceRatio(rets, q);
      return value == null ? null : { q, value };
    })
    .filter((v): v is { q: number; value: number } => v != null);
  const acfRows = [1, 5, 10]
    .map((lag) => {
      const value = acf(rets, lag);
      return value == null ? null : { lag, value };
    })
    .filter((v): v is { lag: number; value: number } => v != null);
  const absR = rets.map((r) => Math.abs(r));
  const acfAbs1 = acf(absR, 1);

  const start = Math.max(window, slow) - 1;
  const horizon = 5;
  const bucketDefs = [
    { label: "z ≤ −2", test: (z: number) => z <= -2 },
    { label: "−2 < z ≤ −1", test: (z: number) => z > -2 && z <= -1 },
    { label: "−1 < z ≤ 0", test: (z: number) => z > -1 && z <= 0 },
    { label: "0 < z ≤ 1", test: (z: number) => z > 0 && z <= 1 },
    { label: "1 < z ≤ 2", test: (z: number) => z > 1 && z <= 2 },
    { label: "z > 2", test: (z: number) => z > 2 },
  ];
  const bucketVals = bucketDefs.map(() => [] as number[]);
  for (let i = start; i < closes.length - horizon; i++) {
    const z = rollingZ(closes, i, window);
    if (z == null) continue;
    const fwd = (closes[i + horizon] / closes[i] - 1) * 100;
    const idx = bucketDefs.findIndex((b) => b.test(z));
    if (idx >= 0) bucketVals[idx].push(fwd);
  }
  const buckets = bucketDefs.map((b, i) => ({
    label: b.label,
    n: bucketVals[i].length,
    mean: bucketVals[i].length ? mean(bucketVals[i]) : 0,
    median: bucketVals[i].length ? median(bucketVals[i]) : 0,
  }));

  let backtest: LabReport["backtest"] = null;
  if (closes.length >= start + 30) {
    const dates = bars.map((b) => b.d);
    const fade = runPath(closes, dates, start, (i, prev) => fadeDesired(closes, i, window, entryZ, exitZ, prev), cost);
    const trend = runPath(
      closes,
      dates,
      start,
      (i, prev) => {
        const fast = smaFast[i];
        const slowMa = smaSlow[i];
        if (fast == null || slowMa == null) return prev;
        return fast > slowMa ? 1 : -1;
      },
      cost,
    );
    const hold = runPath(closes, dates, start, () => 1, cost);
    const channelRun = runPath(closes, dates, start, (i, prev) => channelDesired(bars, i, 20, prev), cost);
    const equity = fade.equity.map((eq, idx) => ({
      d: dates[start + idx] ?? dates[dates.length - 1],
      fade: eq,
      trend: trend.equity[idx] ?? trend.equity[trend.equity.length - 1],
      hold: hold.equity[idx] ?? hold.equity[hold.equity.length - 1],
      channel: channelRun.equity[idx] ?? channelRun.equity[channelRun.equity.length - 1],
    }));
    backtest = {
      equity,
      fade: summarize(fade.daily, fade.turns, fade.active, fade.equity),
      trend: summarize(trend.daily, trend.turns, trend.active, trend.equity),
      hold: summarize(hold.daily, hold.turns, hold.active, hold.equity),
      channel: summarize(channelRun.daily, channelRun.turns, channelRun.active, channelRun.equity),
    };
  }

  const sensitivityEntries = [1, 1.5, 2].filter((e) => e > exitZ + 0.05);
  const sensitivity = sensitivityEntries.map((entry) => {
    if (closes.length < start + 30) return { entry, sharpe: null, total: 0 };
    const run = runPath(
      closes,
      bars.map((b) => b.d),
      start,
      (i, prev) => fadeDesired(closes, i, window, entry, exitZ, prev),
      cost,
    );
    const perf = summarize(run.daily, run.turns, run.active, run.equity);
    return { entry, sharpe: perf.sharpe, total: perf.totalReturn };
  });

  const latestZ = rollingZ(closes, closes.length - 1, window);
  let stance: LabReport["stance"] = "Flat";
  if (backtest) {
    let held = 0;
    for (let i = start; i < closes.length; i++) held = fadeDesired(closes, i, window, entryZ, exitZ, held);
    stance = held > 0 ? "Long" : held < 0 ? "Short" : "Flat";
  }
  let channelHeld = 0;
  let upBreaks = 0;
  let downBreaks = 0;
  for (let i = 20; i < bars.length; i++) {
    const prior = priorBand(bars, i, 20);
    if (!prior) continue;
    if (bars[i].c > prior.hi && channelHeld !== 1) upBreaks += 1;
    if (bars[i].c < prior.lo && channelHeld !== -1) downBreaks += 1;
    channelHeld = channelDesired(bars, i, 20, channelHeld);
  }
  const channelState: LabReport["channelState"] = channelHeld > 0 ? "Long" : channelHeld < 0 ? "Short" : "Flat";
  const tape = buildTape(bars);

  const lines: string[] = [];
  if (adfLevel) {
    lines.push(
      adfLevel.stationaryAt5
        ? `ADF on the log price: t = ${adfLevel.tStat.toFixed(2)}, against a 5% critical value of ${adfLevel.crit.p5}. The unit-root null is rejected at 5% on this sample, so the level looks stationary around a constant.`
        : `ADF on the log price: t = ${adfLevel.tStat.toFixed(2)}, against a 5% critical value of ${adfLevel.crit.p5}. The unit-root null is not rejected at 5%. A constant-mean fade of the level is not supported here.`,
    );
  }
  if (adfReturn) {
    lines.push(
      adfReturn.stationaryAt5
        ? `ADF on log returns rejects a unit root at 5% (t = ${adfReturn.tStat.toFixed(2)}). That is the usual result for returns and a sanity check that the test is running on this series.`
        : `ADF on log returns does not reject a unit root at 5% (t = ${adfReturn.tStat.toFixed(2)}). That is unusual for daily returns and worth treating the rest of the sheet cautiously.`,
    );
  }
  if (hl) {
    if (hl.halfLife != null && hl.halfLife > 0 && hl.halfLife < 252) {
      lines.push(
        `Ornstein–Uhlenbeck half-life of the log price is ${hl.halfLife.toFixed(1)} trading sessions (AR slope ${hl.beta.toFixed(3)}, t = ${hl.tStat.toFixed(2)}).`,
      );
    } else if (hl.beta >= 0) {
      lines.push(
        `The AR(1) slope on the log price is ${hl.beta.toFixed(3)} (t = ${hl.tStat.toFixed(2)}). It is not negative, so this sample does not pull back to a constant mean.`,
      );
    } else if (hl.halfLife != null) {
      lines.push(
        `The estimated half-life is ${hl.halfLife.toFixed(0)} sessions — a pullback, but too slow to treat as a practical fade inside a year.`,
      );
    }
  }
  if (hurst != null) {
    const side =
      hurst < 0.45
        ? "on the mean-reverting side of 0.5"
        : hurst > 0.55
          ? "on the trending side of 0.5"
          : "close to 0.5, the random-walk neighborhood";
    lines.push(
      `Hurst exponent of log returns, from rescaled range, is ${hurst.toFixed(2)} — ${side}. It is a descriptive slope, not a significance test.`,
    );
  }
  const vr10 = vr.find((v) => v.q === 10);
  if (vr10) {
    lines.push(
      `Variance ratio at 10 sessions is ${vr10.value.toFixed(2)}. Under 1, ten-day moves were smaller than a random walk would scale; over 1, they were larger.`,
    );
  }
  const low = buckets[0];
  const high = buckets[buckets.length - 1];
  if (low && high && low.n >= 8 && high.n >= 8) {
    lines.push(
      low.mean > high.mean
        ? `Five-session forward returns averaged ${low.mean.toFixed(2)}% after z ≤ −2 (n=${low.n}) and ${high.mean.toFixed(2)}% after z > 2 (n=${high.n}). The tails lean the mean-reversion way on this sample.`
        : `Five-session forward returns averaged ${low.mean.toFixed(2)}% after z ≤ −2 (n=${low.n}) and ${high.mean.toFixed(2)}% after z > 2 (n=${high.n}). The tails do not lean mean-reversion on this sample.`,
    );
  }
  if (backtest) {
    lines.push(
      `After ${params.costBps} bps on each position change, the z-score fade returned ${backtest.fade.totalReturn.toFixed(1)}% versus ${backtest.hold.totalReturn.toFixed(1)}% for buy-and-hold, ${backtest.trend.totalReturn.toFixed(1)}% for a 20/50 trend rule, and ${backtest.channel.totalReturn.toFixed(1)}% for a 20-session channel, on the same sessions. Sharpe with a 0% risk-free rate: fade ${fmtSharpe(backtest.fade.sharpe)}, trend ${fmtSharpe(backtest.trend.sharpe)}, channel ${fmtSharpe(backtest.channel.sharpe)}, hold ${fmtSharpe(backtest.hold.sharpe)}.`,
    );
    lines.push(
      "Those figures describe this window only. They are not a forecast. The entry-threshold row underneath is there so a single lucky setting is harder to mistake for an edge.",
    );
    lines.push(
      `The channel is long when the close is above the prior 20 sessions' high, short when it is below their low, and otherwise unchanged. It would be ${channelState.toLowerCase()} into the next session. Up-breaks in the sample: ${upBreaks}. Down-breaks: ${downBreaks}.`,
    );
  }
  lines.push(
    `Latest bar ${tape.date}: ${tape.breakout20}. ${tape.breakout50}. ${tape.nr7 ? "The high-low range is the narrowest of the last seven sessions (NR7)." : "The latest range is not an NR7."}${tape.gapPct == null ? "" : ` Open versus the prior close: ${tape.gapPct > 0 ? "+" : ""}${tape.gapPct.toFixed(2)}%.`} Close streak: ${tape.streak > 0 ? `${tape.streak} up` : tape.streak < 0 ? `${Math.abs(tape.streak)} down` : "unchanged"}.`,
  );

  return {
    sessions: bars.length,
    start: bars[0].d,
    end: bars[bars.length - 1].d,
    latestZ,
    stance,
    adfLevel,
    adfReturn,
    halfLife: hl,
    hurst,
    vr,
    acf: acfRows,
    acfAbs1,
    buckets,
    horizon,
    backtest,
    channelState,
    upBreaks,
    downBreaks,
    tape,
    sensitivity,
    lines,
  };
}

function normalCdf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const a = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * a);
  const erf = 1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-a * a);
  return 0.5 * (1 + sign * erf);
}

function normalPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

export function bsGreeks(input: {
  spot: number;
  strike: number;
  years: number;
  rate: number;
  dividend: number;
  iv: number;
  type: "call" | "put";
}): { delta: number; gamma: number; vega: number; theta: number } | null {
  const { spot, strike, years, rate, dividend, iv, type } = input;
  if (!(spot > 0 && strike > 0 && years > 1 / 365 && iv > 0.01 && iv < 5 && rate > -0.02 && rate < 0.25)) return null;
  const sqrtT = Math.sqrt(years);
  const d1 = (Math.log(spot / strike) + (rate - dividend + 0.5 * iv * iv) * years) / (iv * sqrtT);
  const d2 = d1 - iv * sqrtT;
  const discQ = Math.exp(-dividend * years);
  const discR = Math.exp(-rate * years);
  const pdf = normalPdf(d1);
  const delta = type === "call" ? discQ * normalCdf(d1) : discQ * (normalCdf(d1) - 1);
  const gamma = (discQ * pdf) / (spot * iv * sqrtT);
  const vega = (spot * discQ * pdf * sqrtT) / 100;
  const thetaAnnual =
    type === "call"
      ? (-spot * discQ * pdf * iv) / (2 * sqrtT) - rate * strike * discR * normalCdf(d2) + dividend * spot * discQ * normalCdf(d1)
      : (-spot * discQ * pdf * iv) / (2 * sqrtT) + rate * strike * discR * normalCdf(-d2) - dividend * spot * discQ * normalCdf(-d1);
  return { delta, gamma, vega, theta: thetaAnnual / 365 };
}

export type MixResult = {
  sessions: number;
  start: string;
  end: string;
  totalReturn: number;
  vol: number | null;
  maxDrawdown: number | null;
  sharpe: number | null;
  equity: { d: string; v: number }[];
  corr: number[][];
  names: string[];
};

export function mixPortfolio(
  series: { symbol: string; bars: { d: string; c: number }[] }[],
  weights: number[],
): MixResult | null {
  if (series.length < 2 || series.length !== weights.length) return null;
  if (weights.some((w) => !Number.isFinite(w) || w < 0)) return null;
  const sum = weights.reduce((a, b) => a + b, 0);
  if (!(sum > 0.99 && sum < 1.01)) return null;
  const maps = series.map((row) => new Map(row.bars.filter((bar) => bar.c > 0).map((bar) => [bar.d, bar.c])));
  const dates = [...maps[0].keys()].filter((d) => maps.every((map) => (map.get(d) ?? 0) > 0)).sort();
  if (dates.length < 30) return null;
  const assetRets = series.map(() => [] as number[]);
  const equity: { d: string; v: number }[] = [{ d: dates[0], v: 100 }];
  let level = 100;
  const portRets: number[] = [];
  for (let i = 1; i < dates.length; i++) {
    let port = 0;
    for (let k = 0; k < series.length; k++) {
      const ret = (maps[k].get(dates[i]) as number) / (maps[k].get(dates[i - 1]) as number) - 1;
      assetRets[k].push(ret);
      port += weights[k] * ret;
    }
    portRets.push(port);
    level *= 1 + port;
    equity.push({ d: dates[i], v: level });
  }
  const sd = stdevSample(portRets);
  const corr = assetRets.map((left) => assetRets.map((right) => pearson(left, right) ?? Number.NaN));
  return {
    sessions: dates.length,
    start: dates[0],
    end: dates[dates.length - 1],
    totalReturn: (level / 100 - 1) * 100,
    vol: sd == null || sd === 0 ? null : sd * Math.sqrt(252) * 100,
    maxDrawdown: maxDrawdownPct(equity.map((row) => row.v)),
    sharpe: sd == null || sd === 0 ? null : (mean(portRets) / sd) * Math.sqrt(252),
    equity,
    corr,
    names: series.map((row) => row.symbol),
  };
}

export function alignedCloses(series: { symbol: string; bars: { d: string; c: number }[] }[]): { dates: string[]; closes: number[][] } | null {
  if (series.length < 1) return null;
  const maps = series.map((row) => new Map(row.bars.filter((bar) => bar.c > 0).map((bar) => [bar.d, bar.c])));
  const dates = [...maps[0].keys()].filter((date) => maps.every((map) => (map.get(date) ?? 0) > 0)).sort();
  if (dates.length < 30) return null;
  return { dates, closes: maps.map((map) => dates.map((date) => map.get(date) as number)) };
}

function returnsOf(closes: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < closes.length; i++) out.push(closes[i] / closes[i - 1] - 1);
  return out;
}

function covMatrix(rets: number[][]): number[][] {
  const n = rets.length;
  const t = rets[0].length;
  const means = rets.map((row) => mean(row));
  return rets.map((left, i) =>
    rets.map((right, j) => {
      let sum = 0;
      for (let k = 0; k < t; k++) sum += (left[k] - means[i]) * (right[k] - means[j]);
      return sum / (t - 1);
    }),
  );
}

function longOnly(weights: number[] | null, fallback: number): number[] {
  const n = fallback;
  if (!weights || weights.length !== n) return Array.from({ length: n }, () => 1 / n);
  const clipped = weights.map((weight) => (weight > 0 ? weight : 0));
  const sum = clipped.reduce((total, weight) => total + weight, 0);
  if (!(sum > 0)) return Array.from({ length: n }, () => 1 / n);
  return clipped.map((weight) => weight / sum);
}

export type WeightMethod = "equal" | "invvol" | "invvar" | "minvar" | "sharpe" | "risk";

export function suggestWeights(
  series: { symbol: string; bars: { d: string; c: number }[] }[],
  method: WeightMethod,
): { symbol: string; weight: number }[] | null {
  const aligned = alignedCloses(series);
  if (!aligned) return null;
  const rets = aligned.closes.map(returnsOf);
  if (rets.some((row) => row.length < 20)) return null;
  const n = series.length;
  if (method === "equal") return series.map((row) => ({ symbol: row.symbol, weight: 1 / n }));
  const vols = rets.map((row) => stdevSample(row));
  if (vols.some((vol) => !(vol > 0))) return null;
  if (method === "invvol" || method === "invvar") {
    const raw = vols.map((vol) => (method === "invvol" ? 1 / vol : 1 / (vol * vol)));
    const sum = raw.reduce((total, value) => total + value, 0);
    return series.map((row, index) => ({ symbol: row.symbol, weight: raw[index] / sum }));
  }
  const cov = covMatrix(rets);
  if (method === "minvar") {
    const solved = longOnly(solveLinear(cov, Array(n).fill(1)), n);
    return series.map((row, index) => ({ symbol: row.symbol, weight: solved[index] }));
  }
  if (method === "sharpe") {
    const mu = rets.map((row) => mean(row));
    const solved = longOnly(solveLinear(cov, mu), n);
    return series.map((row, index) => ({ symbol: row.symbol, weight: solved[index] }));
  }
  let weights = vols.map((vol) => 1 / vol);
  let sum = weights.reduce((total, value) => total + value, 0);
  weights = weights.map((weight) => weight / sum);
  for (let iter = 0; iter < 40; iter++) {
    const marginal = weights.map((_, index) => cov[index].reduce((total, value, col) => total + value * weights[col], 0));
    const next = weights.map((weight, index) => (marginal[index] > 0 ? weight / marginal[index] : 0));
    sum = next.reduce((total, value) => total + value, 0);
    if (!(sum > 0)) break;
    weights = next.map((weight) => weight / sum);
  }
  return series.map((row, index) => ({ symbol: row.symbol, weight: weights[index] }));
}

export type BookPoint = { d: string; v: number };

export function shareBook(
  series: { symbol: string; bars: { d: string; c: number }[] }[],
  qty: number[],
): { start: string; end: string; pnl: number; ret: number; vol: number | null; maxDrawdown: number | null; equity: BookPoint[] } | null {
  const aligned = alignedCloses(series);
  if (!aligned || qty.length !== series.length || qty.every((value) => value === 0)) return null;
  const { dates, closes } = aligned;
  const gross = qty.reduce((total, shares, index) => total + Math.abs(shares) * closes[index][0], 0);
  if (!(gross > 0)) return null;
  const equity: BookPoint[] = [];
  const daily: number[] = [];
  for (let i = 0; i < dates.length; i++) {
    const pnl = qty.reduce((total, shares, index) => total + shares * (closes[index][i] - closes[index][0]), 0);
    equity.push({ d: dates[i], v: (pnl / gross) * 100 });
    if (i > 0) {
      const day = qty.reduce((total, shares, index) => total + shares * (closes[index][i] - closes[index][i - 1]), 0);
      daily.push(day / gross);
    }
  }
  const sd = stdevSample(daily);
  return {
    start: dates[0],
    end: dates[dates.length - 1],
    pnl: (equity[equity.length - 1].v / 100) * gross,
    ret: equity[equity.length - 1].v,
    vol: sd > 0 ? sd * Math.sqrt(252) * 100 : null,
    maxDrawdown: maxDrawdownPct(equity.map((point) => 100 + point.v)),
    equity,
  };
}

export function residualPair(
  y: { d: string; c: number }[],
  x: { d: string; c: number }[],
  window: number,
  entry: number,
  exit: number,
  cost: number,
): { beta: number | null; z: number | null; stance: string; ret: number; sharpe: number | null; maxDrawdown: number | null; equity: BookPoint[] } | null {
  const aligned = alignedCloses([
    { symbol: "y", bars: y },
    { symbol: "x", bars: x },
  ]);
  if (!aligned) return null;
  const span = Math.min(120, Math.max(20, Math.round(window)));
  const entryZ = Math.min(3.5, Math.max(0.5, entry));
  const exitZ = Math.min(entryZ - 0.05, Math.max(0, exit));
  const { dates, closes } = aligned;
  const ly = closes[0].map(Math.log);
  const lx = closes[1].map(Math.log);
  const equity: BookPoint[] = [{ d: dates[span], v: 100 }];
  const daily: number[] = [];
  let held = 0;
  let lastBeta: number | null = null;
  let lastZ: number | null = null;
  let level = 100;
  for (let i = span; i < dates.length - 1; i++) {
    let sumX = 0;
    let sumY = 0;
    let sumXX = 0;
    let sumXY = 0;
    for (let k = i - span + 1; k <= i; k++) {
      sumX += lx[k];
      sumY += ly[k];
      sumXX += lx[k] * lx[k];
      sumXY += lx[k] * ly[k];
    }
    const denom = span * sumXX - sumX * sumX;
    const beta = denom === 0 ? 0 : (span * sumXY - sumX * sumY) / denom;
    const alpha = (sumY - beta * sumX) / span;
    const residual: number[] = [];
    for (let k = i - span + 1; k <= i; k++) residual.push(ly[k] - alpha - beta * lx[k]);
    const z = stdevSample(residual) > 0 ? (residual[residual.length - 1] - mean(residual)) / stdevSample(residual) : 0;
    let desired = held;
    if (z >= entryZ) desired = -1;
    else if (z <= -entryZ) desired = 1;
    else if (Math.abs(z) <= exitZ) desired = 0;
    const yRet = closes[0][i + 1] / closes[0][i] - 1;
    const xRet = closes[1][i + 1] / closes[1][i] - 1;
    const pnl = desired * (yRet - beta * xRet) - Math.abs(desired - held) * cost;
    daily.push(pnl);
    level *= 1 + pnl;
    equity.push({ d: dates[i + 1], v: level });
    held = desired;
    lastBeta = beta;
    lastZ = z;
  }
  const last = dates.length - 1;
  if (last >= span) {
    let sumX = 0;
    let sumY = 0;
    let sumXX = 0;
    let sumXY = 0;
    for (let k = last - span + 1; k <= last; k++) {
      sumX += lx[k];
      sumY += ly[k];
      sumXX += lx[k] * lx[k];
      sumXY += lx[k] * ly[k];
    }
    const denom = span * sumXX - sumX * sumX;
    const beta = denom === 0 ? 0 : (span * sumXY - sumX * sumY) / denom;
    const alpha = (sumY - beta * sumX) / span;
    const residual: number[] = [];
    for (let k = last - span + 1; k <= last; k++) residual.push(ly[k] - alpha - beta * lx[k]);
    const sd = stdevSample(residual);
    lastBeta = beta;
    lastZ = sd > 0 ? (residual[residual.length - 1] - mean(residual)) / sd : 0;
    if (lastZ >= entryZ) held = -1;
    else if (lastZ <= -entryZ) held = 1;
    else if (Math.abs(lastZ) <= exitZ) held = 0;
  }
  if (daily.length < 20) return null;
  const sd = stdevSample(daily);
  return {
    beta: lastBeta,
    z: lastZ,
    stance: held === 1 ? "Long residual" : held === -1 ? "Short residual" : "Flat",
    ret: (level / 100 - 1) * 100,
    sharpe: sd > 0 ? (mean(daily) / sd) * Math.sqrt(252) : null,
    maxDrawdown: maxDrawdownPct(equity.map((point) => point.v)),
    equity,
  };
}

function signalBook(bars: Bar[], start: number, decide: (index: number) => number, cost: number): { ret: number; sharpe: number | null; maxDrawdown: number | null; last: number; equity: BookPoint[] } | null {
  if (bars.length < start + 30) return null;
  const closes = bars.map((bar) => bar.c);
  const equity: BookPoint[] = [{ d: bars[start].d, v: 100 }];
  const daily: number[] = [];
  let held = 0;
  let level = 100;
  for (let i = start; i < bars.length - 1; i++) {
    const desired = decide(i);
    const pnl = desired * (closes[i + 1] / closes[i] - 1) - Math.abs(desired - held) * cost;
    daily.push(pnl);
    level *= 1 + pnl;
    equity.push({ d: bars[i + 1].d, v: level });
    held = desired;
  }
  const sd = stdevSample(daily);
  return {
    ret: (level / 100 - 1) * 100,
    sharpe: sd > 0 ? (mean(daily) / sd) * Math.sqrt(252) : null,
    maxDrawdown: maxDrawdownPct(equity.map((point) => point.v)),
    last: decide(bars.length - 1),
    equity,
  };
}

export function rsiBook(bars: Bar[], cost: number): { ret: number; sharpe: number | null; maxDrawdown: number | null; last: string; equity: BookPoint[] } | null {
  const values = rsi(bars.map((bar) => bar.c), 14);
  if (bars.length < 50) return null;
  const closes = bars.map((bar) => bar.c);
  const equity: BookPoint[] = [{ d: bars[20].d, v: 100 }];
  const daily: number[] = [];
  let held = 0;
  let level = 100;
  for (let i = 20; i < bars.length - 1; i++) {
    const value = values[i];
    let desired = held;
    if (value != null) {
      if (value < 30) desired = 1;
      else if (value > 70) desired = -1;
      else if ((held > 0 && value >= 50) || (held < 0 && value <= 50)) desired = 0;
    }
    const pnl = desired * (closes[i + 1] / closes[i] - 1) - Math.abs(desired - held) * cost;
    daily.push(pnl);
    level *= 1 + pnl;
    equity.push({ d: bars[i + 1].d, v: level });
    held = desired;
  }
  const sd = stdevSample(daily);
  const lastValue = values[values.length - 1];
  let last = held;
  if (lastValue != null) {
    if (lastValue < 30) last = 1;
    else if (lastValue > 70) last = -1;
    else if ((held > 0 && lastValue >= 50) || (held < 0 && lastValue <= 50)) last = 0;
  }
  return {
    ret: (level / 100 - 1) * 100,
    sharpe: sd > 0 ? (mean(daily) / sd) * Math.sqrt(252) : null,
    maxDrawdown: maxDrawdownPct(equity.map((point) => point.v)),
    last: last === 1 ? "Long" : last === -1 ? "Short" : "Flat",
    equity,
  };
}

export function momentumBook(bars: Bar[], cost: number): { ret: number; sharpe: number | null; maxDrawdown: number | null; last: string; equity: BookPoint[] } | null {
  const closes = bars.map((bar) => bar.c);
  const book = signalBook(bars, 252, (index) => {
    if (index < 252) return 0;
    return closes[index - 21] > closes[index - 252] ? 1 : 0;
  }, cost);
  if (!book) return null;
  return { ...book, last: book.last === 1 ? "Long" : "Flat" };
}

export function monthGrid(bars: Bar[]): { year: string; cells: (number | null)[] }[] {
  const compounded = new Map<string, number>();
  let prev = 0;
  for (const bar of bars) {
    if (!(bar.c > 0)) continue;
    const key = bar.d.slice(0, 7);
    if (prev > 0) {
      const held = compounded.get(key);
      compounded.set(key, held == null ? bar.c / prev - 1 : (1 + held) * (bar.c / prev) - 1);
    }
    prev = bar.c;
  }
  const years = [...new Set([...compounded.keys()].map((key) => key.slice(0, 4)))].sort();
  return years.map((year) => ({
    year,
    cells: Array.from({ length: 12 }, (_, month) => {
      const value = compounded.get(`${year}-${String(month + 1).padStart(2, "0")}`);
      return value == null ? null : value * 100;
    }),
  }));
}

export function realizedVols(closes: number[]): { label: string; vol: number | null }[] {
  return [10, 21, 63, 126].map((n) => {
    if (closes.length < n + 2) return { label: `${n}d`, vol: null };
    const slice = closes.slice(-(n + 1));
    const rets: number[] = [];
    for (let i = 1; i < slice.length; i++) rets.push(slice[i] / slice[i - 1] - 1);
    const sd = stdevSample(rets);
    return { label: `${n}d`, vol: sd > 0 ? sd * Math.sqrt(252) * 100 : null };
  });
}

export function monthVolGrid(bars: Bar[]): { year: string; cells: (number | null)[] }[] {
  const groups = new Map<string, number[]>();
  let prev = 0;
  for (const bar of bars) {
    if (!(bar.c > 0)) continue;
    if (prev > 0) {
      const key = bar.d.slice(0, 7);
      const list = groups.get(key) ?? [];
      list.push(Math.log(bar.c / prev));
      groups.set(key, list);
    }
    prev = bar.c;
  }
  const years = [...new Set([...groups.keys()].map((key) => key.slice(0, 4)))].sort();
  return years.map((year) => ({
    year,
    cells: Array.from({ length: 12 }, (_, month) => {
      const list = groups.get(`${year}-${String(month + 1).padStart(2, "0")}`);
      if (!list || list.length < 8) return null;
      const sd = stdevSample(list);
      return sd > 0 ? sd * Math.sqrt(252) * 100 : null;
    }),
  }));
}

export function corrMatrix(
  series: { symbol: string; bars: { d: string; c: number }[] }[],
  tail?: number,
): { names: string[]; values: (number | null)[][]; sessions: number } | null {
  const aligned = alignedCloses(series);
  if (!aligned) return null;
  const width = tail && tail > 0 ? tail + 1 : aligned.dates.length;
  const closes = aligned.closes.map((column) => (column.length > width ? column.slice(-width) : column));
  const rets = closes.map(returnsOf);
  if (rets[0].length < 30) return null;
  const values = rets.map((left, i) =>
    rets.map((right, j) => {
      if (i === j) return 1;
      const a = mean(left);
      const b = mean(right);
      let cov = 0;
      let va = 0;
      let vb = 0;
      for (let k = 0; k < left.length; k++) {
        const da = left[k] - a;
        const db = right[k] - b;
        cov += da * db;
        va += da * da;
        vb += db * db;
      }
      if (va === 0 || vb === 0) return null;
      return cov / Math.sqrt(va * vb);
    }),
  );
  return { names: series.map((row) => row.symbol), values, sessions: rets[0].length };
}

export type WalkFold = { start: string; end: string; rule: string; isSharpe: number | null; oosReturn: number };
export type WalkReport = { folds: WalkFold[]; oosReturn: number; oosSharpe: number | null; oosMaxDd: number | null; equity: BookPoint[] };

function scoreWindow(
  closes: number[],
  decide: (i: number, prev: number) => number,
  cost: number,
  from: number,
  end: number,
): { daily: number[]; sharpe: number | null; ret: number; turns: number; active: number } | null {
  if (end - from < 12) return null;
  const daily: number[] = [];
  let held = 0;
  let turns = 0;
  let active = 0;
  let equity = 1;
  for (let i = from; i < end - 1; i++) {
    const desired = decide(i, held);
    if (desired !== held) turns += 1;
    const pnl = desired * (closes[i + 1] / closes[i] - 1) - Math.abs(desired - held) * cost;
    daily.push(pnl);
    if (desired !== 0) active += 1;
    equity *= 1 + pnl;
    held = desired;
  }
  if (daily.length < 10) return null;
  const sd = stdevSample(daily);
  return { daily, sharpe: sd > 0 ? (mean(daily) / sd) * Math.sqrt(252) : null, ret: (equity - 1) * 100, turns, active };
}

export function walkForward(bars: Bar[], family: "fade" | "trend" | "breakout" | "rsi" | "momentum", costBps: number): WalkReport | null {
  const closes = bars.map((bar) => bar.c);
  if (closes.some((price) => !(price > 0))) return null;
  const cost = Math.min(100, Math.max(0, costBps)) / 10000;
  const rsiValues = family === "rsi" ? rsi(closes, 14) : [];
  const fastCache = new Map<number, (number | null)[]>();
  const slowCache = new Map<number, (number | null)[]>();
  const ma = (n: number, cache: Map<number, (number | null)[]>) => {
    const hit = cache.get(n);
    if (hit) return hit;
    const row = sma(closes, n);
    cache.set(n, row);
    return row;
  };
  type Rule = { label: string; warm: number; decide: (i: number, prev: number) => number };
  const rules: Rule[] = [];
  if (family === "fade") {
    for (const window of [20, 40, 60]) {
      for (const entry of [1, 1.5, 2]) {
        rules.push({
          label: `${window}d z${entry}`,
          warm: window,
          decide: (i, prev) => fadeDesired(closes, i, window, entry, 0.25, prev),
        });
      }
    }
  } else if (family === "trend") {
    for (const [fast, slow] of [[10, 40], [20, 50], [20, 100]] as const) {
      rules.push({
        label: `${fast}/${slow}`,
        warm: slow,
        decide: (i, prev) => {
          const a = ma(fast, fastCache)[i];
          const b = ma(slow, slowCache)[i];
          if (a == null || b == null) return prev;
          return a > b ? 1 : -1;
        },
      });
    }
  } else if (family === "breakout") {
    for (const n of [10, 20, 55]) {
      rules.push({
        label: `${n}d channel`,
        warm: n,
        decide: (i, prev) => channelDesired(bars, i, n, prev),
      });
    }
  } else if (family === "rsi") {
    for (const [low, high] of [[30, 70], [25, 75], [20, 80]] as const) {
      rules.push({
        label: `${low}/${high}`,
        warm: 20,
        decide: (i, prev) => {
          const value = rsiValues[i];
          if (value == null) return prev;
          if (value < low) return 1;
          if (value > high) return -1;
          if ((prev > 0 && value >= 50) || (prev < 0 && value <= 50)) return 0;
          return prev;
        },
      });
    }
  } else {
    for (const look of [126, 189, 252]) {
      rules.push({
        label: `${Math.round(look / 21)}-1`,
        warm: look,
        decide: (i) => (i < look ? 0 : closes[i - 21] > closes[i - look] ? 1 : 0),
      });
    }
  }
  const train = family === "momentum" ? 378 : 252;
  const test = 63;
  const warm = Math.max(...rules.map((rule) => rule.warm));
  if (closes.length < warm + train + test) return null;
  const folds: WalkFold[] = [];
  const stitched: number[] = [];
  const equity: BookPoint[] = [];
  let level = 100;
  for (let origin = warm + train; origin + 21 < closes.length - 1; origin += test) {
    const trainFrom = Math.max(warm, origin - train);
    const testFrom = origin;
    const testTo = Math.min(closes.length, origin + test);
    let best: { rule: Rule; sharpe: number | null } | null = null;
    for (const rule of rules) {
      if (trainFrom < rule.warm) continue;
      const scored = scoreWindow(closes, rule.decide, cost, trainFrom, testFrom);
      if (!scored || scored.active < 8) continue;
      const score = scored.sharpe ?? -99;
      if (!best || score > (best.sharpe ?? -99)) best = { rule, sharpe: scored.sharpe };
    }
    if (!best) continue;
    const oos = scoreWindow(closes, best.rule.decide, cost, testFrom, testTo);
    if (!oos) continue;
    stitched.push(...oos.daily);
    let cursor = testFrom;
    for (const pnl of oos.daily) {
      level *= 1 + pnl;
      equity.push({ d: bars[cursor + 1]?.d ?? bars[bars.length - 1].d, v: level });
      cursor += 1;
    }
    folds.push({
      start: bars[testFrom].d,
      end: bars[Math.min(bars.length - 1, testTo - 1)].d,
      rule: best.rule.label,
      isSharpe: best.sharpe,
      oosReturn: oos.ret,
    });
  }
  if (!folds.length || stitched.length < 20) return null;
  const sd = stdevSample(stitched);
  return {
    folds,
    oosReturn: (level / 100 - 1) * 100,
    oosSharpe: sd > 0 ? (mean(stitched) / sd) * Math.sqrt(252) : null,
    oosMaxDd: maxDrawdownPct(equity.map((point) => point.v)),
    equity,
  };
}



