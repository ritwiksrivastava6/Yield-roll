export function formatNum(n: number | null | undefined, digits = 2, group: "us" | "in" = "us"): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const sign = n < 0 ? "-" : "";
  const [whole, frac] = Math.abs(n).toFixed(digits).split(".");
  const grouped = group === "in" ? groupIn(whole) : whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return digits > 0 ? `${sign}${grouped}.${frac}` : `${sign}${grouped}`;
}

function groupIn(whole: string): string {
  if (whole.length <= 3) return whole;
  const head = whole.slice(0, -3);
  const tail = whole.slice(-3);
  return `${head.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${tail}`;
}

export function formatPx(n: number | null | undefined, currency?: string, digits?: number): string {
  const group = currency === "INR" ? "in" : "us";
  const d =
    digits ??
    (n == null || !Number.isFinite(n) ? 2 : Math.abs(n) >= 100 ? 2 : Math.abs(n) >= 1 ? 2 : 4);
  return formatNum(n, d, group);
}

export function formatPct(n: number | null | undefined, digits = 2): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

export function formatVol(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(Math.round(n));
}

export function pctClass(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n) || n === 0) return "text-muted";
  return n > 0 ? "text-up" : "text-down";
}
