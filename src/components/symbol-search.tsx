import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchSymbols } from "@/lib/market/api";
import type { SearchHit } from "@/lib/market/types";

export function SymbolSearch({
  scope,
  placeholder,
  onPick,
}: {
  scope: string;
  placeholder: string;
  onPick: (hit: SearchHit) => void;
}) {
  const [raw, setRaw] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setQ(raw.trim()), 250);
    return () => window.clearTimeout(id);
  }, [raw]);
  const query = useQuery({
    queryKey: ["symbol-search", scope, q],
    queryFn: () => searchSymbols({ data: { q, scope } }),
    enabled: q.length >= 1,
    staleTime: 60_000,
  });
  const hits = query.data ?? [];

  return (
    <div className="relative">
      <label className="block text-sm">
        <span className="text-xs text-muted">Find a listing</span>
        <input
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="mt-1 min-h-11 w-full rounded-md border border-line bg-surface px-3 text-fg"
        />
      </label>
      {open && q ? (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-64 overflow-auto rounded-md border border-line bg-bg-elev">
          {query.isFetching && !hits.length ? <p className="px-3 py-3 text-sm text-muted">Searching Yahoo…</p> : null}
          {query.isError ? <p className="px-3 py-3 text-sm text-down">Search did not return.</p> : null}
          {!query.isFetching && !query.isError && !hits.length ? (
            <p className="px-3 py-3 text-sm text-muted">
              {scope === "rates"
                ? "No bond, future, or yield matched."
                : scope === "commodity"
                  ? "No metal or energy contract matched."
                  : scope === "fx"
                    ? "No currency pair matched."
                    : scope === "any" || scope === "equity"
                      ? "No listing matched."
                      : "No listing matched that market."}
            </p>
          ) : null}
          {hits.map((hit) => (
            <button
              key={hit.symbol}
              type="button"
              onClick={() => {
                onPick(hit);
                setRaw("");
                setQ("");
                setOpen(false);
              }}
              className="flex min-h-11 w-full items-baseline justify-between gap-3 border-t border-line px-3 py-2 text-left first:border-t-0 hover:bg-surface"
            >
              <span>
                <span className="block text-sm text-fg">{hit.name}</span>
                <span className="text-xs text-faint">
                  {hit.symbol} · {hit.exchDisp || hit.exchange} · {hit.type}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
