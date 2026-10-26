import { mean, stdevSample, type BookPoint, type WalkReport } from "./math";
import type { Bar } from "./types";

export type VolStyle = "long-vol" | "short-vol" | "long-gamma" | "short-gamma";

export type VolRoll = {
  entry: string;
  exit: string;
  iv: number;
  rv: number | null;
  pnl: number;
};

export type VolReport = {
  ret: number;
  sharpe: number | null;
  maxDrawdown: number | null;
  trades: number;
  winRate: number | null;
  avgIv: number | null;
  avgRv: number | null;
  open: boolean;
  equity: { d: string; v: number; hold: number }[];
  rolls: VolRoll[];
};

type Day = { d: string; ret: number; hold: number };
type Sim = { anchor: string; days: Day[]; rolls: VolRoll[]; open: boolean };

function clamp(value: number, lo: number, hi: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(hi, Math.max(lo, value));
}

function normalCdf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const a = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * a);
  const erf = 1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-a * a);
  return 0.5 * (1 + sign * erf);
}

function straddle(spot: number, strike: number, days: number, iv: number): { price: number; delta: number } {
  if (!(spot > 0 && strike > 0)) return { price: 0, delta: 0 };
  if (!(days > 0) || !(iv > 0)) {
    const call = Math.max(spot - strike, 0);
    const put = Math.max(strike - spot, 0);
    const callDelta = spot > strike ? 1 : spot < strike ? 0 : 0.5;
    return { price: call + put, delta: callDelta + (callDelta - 1) };
  }
  const years = days / 252;
  const sqrtT = Math.sqrt(years);
  const d1 = (Math.log(spot / strike) + 0.5 * iv * iv * years) / (iv * sqrtT);
  const d2 = d1 - iv * sqrtT;
  const call = spot * normalCdf(d1) - strike * normalCdf(d2);
  const put = call - spot + strike;
  return { price: call + put, delta: 2 * normalCdf(d1) - 1 };
}

function realized(closes: number[], end: number, look: number): number | null {
  if (end < look || look < 2) return null;
  const rets: number[] = [];
  for (let k = end - look + 1; k <= end; k++) {
    const prev = closes[k - 1];
    const next = closes[k];
    if (!(prev > 0 && next > 0)) return null;
    rets.push(Math.log(next / prev));
  }
  const sd = stdevSample(rets);
  return sd > 0 ? sd * Math.sqrt(252) : null;
}

function styleOf(style: VolStyle): { sign: number; hedge: boolean } {
  if (style === "long-vol") return { sign: 1, hedge: false };
  if (style === "short-vol") return { sign: -1, hedge: false };
  if (style === "long-gamma") return { sign: 1, hedge: true };
  return { sign: -1, hedge: true };
}

function maxDrawdown(equity: number[]): number | null {
  if (!equity.length) return null;
  let peak = equity[0];
  let worst = 0;
  for (const value of equity) {
    if (value > peak) peak = value;
    const drop = value / peak - 1;
    if (drop < worst) worst = drop;
  }
  return worst * 100;
}

function simulate(
  closes: number[],
  dates: string[],
  style: VolStyle,
  tenor: number,
  vrp: number,
  cost: number,
  from: number,
  to: number,
): Sim | null {
  const { sign, hedge } = styleOf(style);
  const end = Math.min(to, closes.length);
  if (from < tenor || end - from < 12) return null;
  let book: { strike: number; iv: number; born: number; value: number; delta: number } | null = null;
  let anchor = "";
  let tradeLevel = 1;
  let tradeEntry = "";
  let tradeIv = 0;
  const days: Day[] = [];
  const rolls: VolRoll[] = [];

  for (let i = from; i < end - 1; i++) {
    const spot = closes[i];
    const next = closes[i + 1];
    if (!(spot > 0 && next > 0)) continue;
    let premiumCost = 0;
    let shareCost = 0;
    if (!book) {
      const vol = realized(closes, i, tenor);
      if (vol == null) continue;
      const iv = Math.min(2.5, Math.max(0.05, vol * (1 + vrp)));
      const quote = straddle(spot, spot, tenor, iv);
      if (!(quote.price > 0)) continue;
      book = { strike: spot, iv, born: i, value: quote.price, delta: quote.delta };
      if (!anchor) anchor = dates[i];
      tradeLevel = 1;
      tradeEntry = dates[i];
      tradeIv = iv;
      premiumCost += quote.price;
      if (hedge) shareCost += Math.abs(quote.delta) * spot;
    }
    const heldNext = i + 1 - book.born;
    const expiring = heldNext >= tenor;
    const marked = straddle(next, book.strike, expiring ? 0 : tenor - heldNext, book.iv);
    const optionPnl = sign * (marked.price - book.value);
    const hedgePnl = hedge ? -sign * book.delta * (next - spot) : 0;
    if (hedge) {
      const nextDelta = expiring ? 0 : marked.delta;
      shareCost += Math.abs(-sign * nextDelta - -sign * book.delta) * next;
    }
    if (expiring) premiumCost += marked.price;
    const pnl = optionPnl + hedgePnl - cost * premiumCost - cost * shareCost;
    const raw = pnl / spot;
    const ret = Math.max(-0.99, Math.min(5, raw));
    if (Number.isFinite(ret)) {
      days.push({ d: dates[i + 1], ret, hold: next / spot - 1 });
      tradeLevel *= 1 + ret;
    }
    if (expiring) {
      const rv = realized(closes, i + 1, tenor);
      rolls.push({ entry: tradeEntry, exit: dates[i + 1], iv: tradeIv, rv, pnl: (tradeLevel - 1) * 100 });
      book = null;
    } else {
      book = { ...book, value: marked.price, delta: marked.delta };
    }
  }
  if (!anchor || days.length < 8) return null;
  return { anchor, days, rolls, open: book != null };
}

function pack(sim: Sim): VolReport | null {
  let level = 100;
  let hold = 100;
  const equity: { d: string; v: number; hold: number }[] = [{ d: sim.anchor, v: 100, hold: 100 }];
  const rets: number[] = [];
  for (const day of sim.days) {
    level *= 1 + day.ret;
    hold *= 1 + day.hold;
    if (!(level > 0) || !Number.isFinite(level)) return null;
    equity.push({ d: day.d, v: level, hold });
    rets.push(day.ret);
  }
  if (rets.length < 20) return null;
  const sd = stdevSample(rets);
  const ivs = sim.rolls.map((roll) => roll.iv);
  const rvs = sim.rolls.map((roll) => roll.rv).filter((value): value is number => value != null);
  const wins = sim.rolls.filter((roll) => roll.pnl > 0).length;
  return {
    ret: (level / 100 - 1) * 100,
    sharpe: sd > 0 ? (mean(rets) / sd) * Math.sqrt(252) : null,
    maxDrawdown: maxDrawdown(equity.map((point) => point.v)),
    trades: sim.rolls.length,
    winRate: sim.rolls.length ? (wins / sim.rolls.length) * 100 : null,
    avgIv: ivs.length ? mean(ivs) : null,
    avgRv: rvs.length ? mean(rvs) : null,
    open: sim.open,
    equity,
    rolls: sim.rolls,
  };
}

export function runVolBook(bars: Bar[], style: VolStyle, tenorIn: number, vrpIn: number, costBps: number): VolReport | null {
  const closes = bars.map((bar) => bar.c);
  if (closes.some((price) => !(price > 0))) return null;
  const tenor = Math.round(clamp(tenorIn, 5, 63, 21));
  const vrp = clamp(vrpIn, -0.5, 1.5, 0.12);
  const cost = clamp(costBps, 0, 100, 5) / 10000;
  const sim = simulate(closes, bars.map((bar) => bar.d), style, tenor, vrp, cost, tenor, closes.length);
  return sim ? pack(sim) : null;
}

export function walkVol(bars: Bar[], style: VolStyle, costBps: number): WalkReport | null {
  const closes = bars.map((bar) => bar.c);
  if (closes.some((price) => !(price > 0)) || closes.length < 420) return null;
  const dates = bars.map((bar) => bar.d);
  const cost = clamp(costBps, 0, 100, 5) / 10000;
  const rules = [10, 21, 42].flatMap((tenor) =>
    [0, 0.15].map((vrp) => ({
      tenor,
      vrp,
      label: `${tenor}d · ${(vrp * 100).toFixed(0)}% vrp`,
    })),
  );
  const train = 252;
  const test = 63;
  const folds: WalkReport["folds"] = [];
  const stitched: number[] = [];
  const equity: BookPoint[] = [];
  let level = 100;
  for (let origin = train + 42; origin + 21 < closes.length; origin += test) {
    let best: { label: string; sharpe: number | null; tenor: number; vrp: number } | null = null;
    for (const rule of rules) {
      const trainFrom = Math.max(rule.tenor, origin - train);
      const sim = simulate(closes, dates, style, rule.tenor, rule.vrp, cost, trainFrom, origin);
      if (!sim || sim.rolls.length < 1) continue;
      const scored = pack(sim);
      if (!scored) continue;
      const score = scored.sharpe ?? -99;
      if (!best || score > (best.sharpe ?? -99)) best = { label: rule.label, sharpe: scored.sharpe, tenor: rule.tenor, vrp: rule.vrp };
    }
    if (!best) continue;
    const testTo = Math.min(closes.length, origin + test);
    const oos = simulate(closes, dates, style, best.tenor, best.vrp, cost, Math.max(best.tenor, origin), testTo);
    if (!oos) continue;
    const scored = pack(oos);
    if (!scored) continue;
    for (const day of oos.days) {
      stitched.push(day.ret);
      level *= 1 + day.ret;
      equity.push({ d: day.d, v: level });
    }
    folds.push({
      start: dates[origin],
      end: dates[Math.min(closes.length - 1, testTo - 1)],
      rule: best.label,
      isSharpe: best.sharpe,
      oosReturn: scored.ret,
    });
  }
  if (!folds.length || stitched.length < 20) return null;
  const sd = stdevSample(stitched);
  return {
    folds,
    oosReturn: (level / 100 - 1) * 100,
    oosSharpe: sd > 0 ? (mean(stitched) / sd) * Math.sqrt(252) : null,
    oosMaxDd: maxDrawdown(equity.map((point) => point.v)),
    equity,
  };
}
