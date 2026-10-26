import { realizedVols, monthGrid, monthVolGrid } from "@/lib/market/math";
import { volRank } from "@/lib/market/screen";
import { TableExport } from "@/components/download";
import type { Bar } from "@/lib/market/types";

function paint(value: number, max: number, scale: "diverge" | "level"): string {
  if (scale === "level") {
    const mix = Math.round((Math.min(Math.max(value, 0), max) / max) * 55);
    return `color-mix(in oklab, var(--color-accent) ${mix}%, var(--color-surface))`;
  }
  const mix = Math.round((Math.min(Math.abs(value), max) / max) * 55);
  const tone = value >= 0 ? "var(--color-up)" : "var(--color-down)";
  return `color-mix(in oklab, ${tone} ${mix}%, var(--color-surface))`;
}

export function Heatmap({
  columns,
  rows,
  format,
  scale,
  file = "heatmap",
}: {
  columns: string[];
  rows: { label: string; cells: (number | null)[] }[];
  format: (value: number) => string;
  scale: "diverge" | "level";
  file?: string;
}) {
  const values = rows.flatMap((row) => row.cells).filter((value): value is number => value != null && Number.isFinite(value));
  const max = Math.max(scale === "diverge" ? 0.2 : 0.05, ...values.map((value) => Math.abs(value)));
  return (
    <TableExport file={file}>
    <div className="overflow-x-auto">
      <table className="border-collapse text-xs">
        <thead>
          <tr>
            <th className="px-2 py-1" />
            {columns.map((column) => (
              <th key={column} className="px-1 py-1 text-center font-medium text-muted">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th className="whitespace-nowrap px-2 py-1 text-left font-mono font-medium text-fg">{row.label}</th>
              {row.cells.map((cell, index) => (
                <td key={`${row.label}-${columns[index]}`} className="p-0.5">
                  <div
                    className="flex h-9 min-w-12 items-center justify-center rounded-sm font-mono text-fg"
                    style={{ background: cell == null ? "var(--color-surface)" : paint(cell, max, scale) }}
                  >
                    {cell == null ? "—" : format(cell)}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </TableExport>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function MonthHeat({ bars, history }: { bars: Bar[]; history?: number[] | null }) {
  if (bars.length < 40) return null;
  const rows = monthGrid(bars).map((row) => ({ label: row.year, cells: row.cells }));
  const vols = realizedVols(bars.map((bar) => bar.c));
  const volRows = monthVolGrid(bars).map((row) => ({ label: row.year, cells: row.cells }));
  const rank = history === null ? null : volRank(history ?? bars.map((bar) => bar.c), 21);
  const where = history && history.length ? "the last two years" : "this window";
  return (
    <>
      <section className="mt-6">
        <h2 className="text-sm font-medium">Monthly returns</h2>
        <p className="mt-1 text-xs text-faint">Compounded from daily closes. Realized vol is the sample standard deviation of daily changes, annualized.</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {vols.map((row) => (
            <div key={row.label} className="rounded-md border border-line px-3 py-3">
              <div className="text-xs text-muted">{row.label} realized</div>
              <div className="mt-1 font-mono text-lg text-fg">{row.vol == null ? "—" : `${row.vol.toFixed(1)}%`}</div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <Heatmap file="monthly-returns" columns={MONTHS} rows={rows} scale="diverge" format={(value) => `${value.toFixed(1)}`} />
        </div>
      </section>
      <section className="mt-6">
        <h2 className="text-sm font-medium">Realized-vol calendar</h2>
        <p className="mt-1 text-xs text-faint">Annualized sample deviation of daily log returns inside each month. Blank if the month has fewer than eight sessions.</p>
        {rank != null ? <p className="mt-2 text-sm text-fg">21-day realized vol is at percentile {rank.toFixed(0)} of {where}.</p> : null}
        <div className="mt-3">
          <Heatmap file="monthly-vol" columns={MONTHS} rows={volRows} scale="level" format={(value) => value.toFixed(0)} />
        </div>
      </section>
    </>
  );
}
