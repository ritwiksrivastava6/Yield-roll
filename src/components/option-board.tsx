import { formatNum, formatVol } from "@/lib/format";
import { TableExport } from "@/components/download";
import type { OptionContract } from "@/lib/market/types";

function day(sec: string): string {
  const parsed = Number(sec);
  if (!Number.isFinite(parsed)) return sec;
  return new Date(parsed * 1000).toISOString().slice(0, 10);
}

function greek(value: number | null, digits: number): string {
  return value == null || !Number.isFinite(value) ? "—" : value.toFixed(digits);
}

export function OptionBoard({
  loading,
  error,
  rate,
  dividend,
  expiries,
  expiry,
  onExpiry,
  rows,
  selected,
  onSelect,
}: {
  loading: boolean;
  error?: string;
  rate: number | null;
  dividend: number | null;
  expiries: string[];
  expiry: string;
  onExpiry: (value: string) => void;
  rows: OptionContract[];
  selected?: string;
  onSelect?: (row: OptionContract) => void;
}) {
  return (
    <section className="mt-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-sm font-medium">Option chain</h2>
        {expiries.length ? (
          <label className="text-xs text-muted">
            Expiry
            <select
              value={expiry}
              onChange={(event) => onExpiry(event.target.value)}
              className="mt-1 min-h-11 rounded-md border border-line bg-surface px-3 text-sm text-fg"
            >
              {expiries.map((value) => (
                <option key={value} value={value}>
                  {day(value)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-faint">
        {rate == null ? "13-week yield unavailable, greeks blank." : `r ${(rate * 100).toFixed(2)}%`}
        {dividend == null ? " · q = 0" : ` · q ${(dividend * 100).toFixed(2)}%`}
        {" · Yahoo chain · nearest strikes"}
      </p>
      {loading ? <p className="mt-3 text-sm text-muted">Loading chain</p> : null}
      {error ? <p className="mt-3 text-sm text-down">{error}</p> : null}
      {rows.length ? (
        <TableExport file="option-chain">
        <div className="mt-3 overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[52rem] text-right text-xs">
            <thead className="bg-surface text-muted">
              <tr>
                {["Type", "Strike", "Bid", "Ask", "Last", "IV", "Vol", "OI", "Delta", "Gamma", "Vega", "Theta"].map((label) => (
                  <th key={label} className="px-2 py-2 text-right font-medium first:text-left">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.contract}
                  className={"border-t border-line " + (selected === row.contract ? "bg-surface" : "")}
                  onClick={onSelect ? () => onSelect(row) : undefined}
                >
                  <td className="px-2 py-2 text-left uppercase text-fg">{row.type}</td>
                  <td className="px-2 py-2 font-mono">{formatNum(row.strike, 2)}</td>
                  <td className="px-2 py-2 font-mono">{row.bid == null ? "—" : formatNum(row.bid, 2)}</td>
                  <td className="px-2 py-2 font-mono">{row.ask == null ? "—" : formatNum(row.ask, 2)}</td>
                  <td className="px-2 py-2 font-mono">{row.last == null ? "—" : formatNum(row.last, 2)}</td>
                  <td className="px-2 py-2 font-mono">{row.iv == null ? "—" : `${(row.iv * 100).toFixed(1)}%`}</td>
                  <td className="px-2 py-2 font-mono">{formatVol(row.volume)}</td>
                  <td className="px-2 py-2 font-mono">{formatVol(row.openInterest)}</td>
                  <td className="px-2 py-2 font-mono">{greek(row.delta, 2)}</td>
                  <td className="px-2 py-2 font-mono">{greek(row.gamma, 4)}</td>
                  <td className="px-2 py-2 font-mono">{greek(row.vega, 3)}</td>
                  <td className="px-2 py-2 font-mono">{greek(row.theta, 3)}</td>
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
