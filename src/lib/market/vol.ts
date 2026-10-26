const YEAR = Math.sqrt(252);

function sampleVol(closes: number[], end: number, n: number): number | null {
  if (end < n || end >= closes.length) return null;
  const rets: number[] = [];
  for (let i = end - n + 1; i <= end; i++) {
    const prev = closes[i - 1];
    const next = closes[i];
    if (!(prev > 0 && next > 0)) return null;
    rets.push(Math.log(next / prev));
  }
  const mean = rets.reduce((sum, value) => sum + value, 0) / rets.length;
  const variance = rets.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (rets.length - 1);
  const sd = Math.sqrt(variance);
  return sd > 0 ? sd * YEAR : null;
}

function rank(vols: number[], index: number): number | null {
  if (index < 40 || index >= vols.length) return null;
  const last = vols[index];
  let below = 0;
  for (let i = 0; i <= index; i++) if (vols[i] <= last) below += 1;
  return (below / (index + 1)) * 100;
}

export function volSnapshot(closes: number[], n = 21): { rv: number; pct: number; prev: number | null; delta: number | null } | null {
  if (closes.length < n + 50) return null;
  const vols: number[] = [];
  for (let end = n; end < closes.length; end++) {
    const vol = sampleVol(closes, end, n);
    if (vol == null) return null;
    vols.push(vol);
  }
  const last = vols.length - 1;
  const pct = rank(vols, last);
  if (pct == null) return null;
  const then = last - 21;
  const prev = then >= 40 ? rank(vols, then) : null;
  return {
    rv: vols[last] * 100,
    pct,
    prev,
    delta: prev == null ? null : pct - prev,
  };
}

export function volState(pct: number | null, delta: number | null): "quiet" | "awake" | "steady" {
  if (delta != null && delta >= 15) return "awake";
  if (pct != null && pct <= 25) return "quiet";
  return "steady";
}
