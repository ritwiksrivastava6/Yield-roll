import type { SurfacePoint } from "./types";

const WINGS = [0.9, 0.95, 1, 1.05, 1.1] as const;

function ivAt(points: SurfacePoint[], expiry: string, spot: number, moneyness: number): number | null {
  let best: { iv: number; distance: number } | null = null;
  for (const point of points) {
    if (point.expiry !== expiry || !(point.iv > 0) || !(point.strike > 0)) continue;
    const distance = Math.abs(point.strike / spot - moneyness);
    if (distance > 0.03) continue;
    if (!best || distance < best.distance) best = { iv: point.iv, distance };
  }
  return best ? best.iv : null;
}

export type SkewTerm = {
  expiry: string;
  label: string;
  atm: number | null;
  rr: number | null;
  fly: number | null;
};

export function skewSurface(points: SurfacePoint[], spot: number): {
  columns: string[];
  rows: { label: string; cells: (number | null)[] }[];
  term: SkewTerm[];
} | null {
  if (!(spot > 0) || points.length < 3) return null;
  const expiries = [...new Set(points.map((point) => point.expiry))].sort();
  const term: SkewTerm[] = [];
  const rows: { label: string; cells: (number | null)[] }[] = [];
  for (const expiry of expiries) {
    const vols = WINGS.map((wing) => ivAt(points, expiry, spot, wing));
    const atm = vols[2];
    const put = vols[1];
    const call = vols[3];
    const rr = put != null && call != null ? (call - put) * 100 : null;
    const fly = put != null && call != null && atm != null ? ((put + call) / 2 - atm) * 100 : null;
    term.push({
      expiry,
      label: expiry.slice(5),
      atm: atm == null ? null : atm * 100,
      rr,
      fly,
    });
    rows.push({
      label: expiry.slice(5),
      cells: vols.map((vol) => (vol == null || atm == null ? null : (vol - atm) * 100)),
    });
  }
  if (!rows.some((row) => row.cells.some((cell) => cell != null))) return null;
  return { columns: ["90", "95", "ATM", "105", "110"], rows, term };
}
