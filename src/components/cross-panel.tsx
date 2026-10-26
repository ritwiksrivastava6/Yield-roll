import { useMemo } from "react";
import { Heatmap } from "@/components/heat";
import { corrMatrix } from "@/lib/market/math";
import { factorShare } from "@/lib/market/screen";
import { useBasketQuery } from "@/lib/market/queries";

export function CrossPanel({ symbols, title }: { symbols: string[]; title: string }) {
  const unique = [...new Set(symbols)].slice(0, 8);
  const query = useBasketQuery(unique, "1y");
  const matrix = useMemo(() => {
    const rows = (query.data?.results ?? []).filter((row) => row.ok);
    if (rows.length < 2) return null;
    const series = rows.map((row) => ({ symbol: row.series.symbol, bars: row.series.bars }));
    const full = corrMatrix(series);
    const short = corrMatrix(series, 63);
    if (!full) return null;
    const showShort = short != null && full.sessions > short.sessions + 5;
    const drift = showShort && short
      ? full.names.map((_, index) =>
          full.values[index].map((value, cell) => {
            const recent = short.values[index]?.[cell];
            if (index === cell) return 0;
            if (value == null || recent == null) return null;
            return recent - value;
          }),
        )
      : null;
    return { full, short: showShort ? short : null, drift };
  }, [query.data]);
  const share = matrix ? factorShare(matrix.full.values) : null;
  if (unique.length < 2) return null;
  return (
    <section className="mt-6">
      <h2 className="text-sm font-medium">{title}</h2>
      <p className="mt-1 text-xs text-faint">Pearson correlation of daily changes. The first matrix is the full loaded year. The second is the last 63 sessions, then the change from the year to those 63 sessions.</p>
      {query.isPending ? <p className="mt-3 text-sm text-muted">Loading</p> : null}
      {matrix ? (
        <div className="mt-3">
          <h3 className="text-xs font-medium text-muted">One year</h3>
          <div className="mt-2">
            <Heatmap
              file="corr-1y"
              columns={matrix.full.names}
              rows={matrix.full.names.map((name, index) => ({ label: name, cells: matrix.full.values[index] }))}
              scale="diverge"
              format={(value) => value.toFixed(2)}
            />
          </div>
          {matrix.short ? (
            <>
              <h3 className="mt-4 text-xs font-medium text-muted">63 sessions</h3>
              <div className="mt-2">
                <Heatmap
                  file="corr-63"
                  columns={matrix.short.names}
                  rows={matrix.short.names.map((name, index) => ({ label: name, cells: matrix.short?.values[index] ?? [] }))}
                  scale="diverge"
                  format={(value) => value.toFixed(2)}
                />
              </div>
            </>
          ) : null}
          {matrix.drift ? (
            <>
              <h3 className="mt-4 text-xs font-medium text-muted">63-day minus one-year</h3>
              <p className="mt-1 text-xs text-faint">Positive means the pair's correlation rose in the recent window.</p>
              <div className="mt-2">
                <Heatmap
                  file="corr-drift"
                  columns={matrix.full.names}
                  rows={matrix.full.names.map((name, index) => ({ label: name, cells: matrix.drift?.[index] ?? [] }))}
                  scale="diverge"
                  format={(value) => value.toFixed(2)}
                />
              </div>
            </>
          ) : null}
          {share != null ? (
            <p className="mt-3 text-sm text-muted">
              The first factor is {(share * 100).toFixed(0)}% of this correlation.
              {share >= 0.55 ? " At that level, picking names is mostly a bet on the market." : " Names are not one trade."}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
