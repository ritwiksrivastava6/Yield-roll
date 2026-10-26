import { Change, LiveMark, LivePrice } from "@/components/bits";
import { TableExport } from "@/components/download";
import { formatNum } from "@/lib/format";
import { headlineTone } from "@/lib/market/tone";
import { useNewsQuery } from "@/lib/market/queries";
import type { ReactNode } from "react";

export function Split({ title, symbol, children }: { title: string; symbol: string; children: ReactNode }) {
  return (
    <div className="px-4 py-4 sm:px-5 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-medium">{title}</h1>
        {children}
      </div>
      <NewsRail symbol={symbol} />
    </div>
  );
}

export function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="block min-w-0 text-xs text-muted">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="mt-1 min-h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-fg"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const RANGES = [
  { id: "6mo", label: "6mo" },
  { id: "1y", label: "1y" },
  { id: "2y", label: "2y" },
  { id: "5y", label: "5y" },
] as const;

export function RangePick({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label="Range">
      {RANGES.map((range) => (
        <button
          key={range.id}
          type="button"
          aria-pressed={value === range.id}
          onClick={() => onChange(range.id)}
          className={"min-h-11 rounded-md px-3 text-sm " + (value === range.id ? "bg-accent text-accent-ink" : "border border-line text-muted")}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}

export function QuoteHead({
  name,
  symbol,
  price,
  change,
  digits = 2,
  checkedAt,
  fetching,
  failed,
}: {
  name: string;
  symbol: string;
  price: number | null;
  change: number | null;
  digits?: number;
  checkedAt?: string | null;
  fetching: boolean;
  failed?: boolean;
}) {
  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm text-fg">{name}</div>
          <div className="text-xs text-faint">{symbol}</div>
        </div>
        <div className="text-right">
          <LivePrice price={price} className="block font-mono text-3xl text-accent">
            {price == null ? "—" : formatNum(price, digits)}
          </LivePrice>
          <Change value={change} />
        </div>
      </div>
      <LiveMark checkedAt={checkedAt} fetching={fetching} failed={failed} />
    </div>
  );
}

export function Tape({
  rows,
  active,
  onPick,
}: {
  rows: { symbol: string; name: string; price: number | null; changePct: number | null; note?: string; digits?: number }[];
  active: string;
  onPick: (symbol: string, name: string) => void;
}) {
  const file = `tape-${active.replace(/[^\w.=-]+/g, "_")}`;
  return (
    <TableExport file={file}>
      <div className="mt-4 overflow-x-auto rounded-md border border-line">
        <table className="w-full min-w-[24rem] text-left text-sm">
          <thead className="bg-surface text-xs text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 text-right font-medium">Last</th>
              <th className="px-3 py-2 text-right font-medium">Chg</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.symbol} className={row.symbol === active ? "bg-surface" : undefined}>
                <td>
                  <button type="button" onClick={() => onPick(row.symbol, row.name)} className="min-h-11 w-full px-3 py-2 text-left">
                    <span className="block text-fg">{row.name}</span>
                    <span className="text-xs text-faint">
                      {row.symbol}
                      {row.note ? ` · ${row.note}` : ""}
                    </span>
                  </button>
                </td>
                <td className="px-3 text-right font-mono tabular-nums text-accent">
                  {row.price == null ? "—" : formatNum(row.price, row.digits ?? 2)}
                </td>
                <td className="px-3 text-right">
                  <Change value={row.changePct} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TableExport>
  );
}

function toneClass(tone: string): string {
  if (tone === "positive") return "text-up";
  if (tone === "negative") return "text-down";
  if (tone === "mixed") return "text-accent";
  return "text-faint";
}

export function NewsRail({ symbol }: { symbol: string }) {
  const query = useNewsQuery(symbol);
  const items = (query.data?.items ?? []).filter((item) => item.symbol === symbol).slice(0, 6);
  return (
    <aside className="mt-6 lg:mt-0">
      <div className="rounded-md border border-line bg-bg-elev lg:sticky lg:top-4">
        <div className="border-b border-line px-3 py-2">
          <h2 className="text-xs font-medium text-accent">Headlines</h2>
          <p className="text-xs text-faint">{symbol}</p>
        </div>
        {query.isPending ? <p className="px-3 py-3 text-sm text-muted">Loading</p> : null}
        {query.isError || query.data?.error ? <p className="px-3 py-3 text-sm text-down">{query.data?.error || "Headlines did not load"}</p> : null}
        <ul>
          {items.map((item) => {
            const tone = headlineTone(item.title);
            const label = tone.tone === "none" ? "—" : tone.tone === "positive" ? "Positive" : tone.tone === "negative" ? "Negative" : "Mixed";
            return (
              <li key={item.link} className="border-t border-line px-3 py-3 first:border-t-0">
                <a href={item.link} target="_blank" rel="noreferrer" className="text-sm text-fg hover:text-accent">
                  {item.title}
                </a>
                <div className="mt-1 flex items-center justify-between gap-2 text-xs">
                  <span className="text-faint">{item.publishedLabel}</span>
                  <span className={toneClass(tone.tone)} title={tone.word ? `Matched: ${tone.word}` : "No directional word"}>
                    {label}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
        {!query.isPending && !items.length && !query.data?.error ? <p className="px-3 py-3 text-sm text-muted">No headlines</p> : null}
      </div>
    </aside>
  );
}
