import { useState } from "react";
import { SymbolSearch } from "@/components/symbol-search";
import { useNewsQuery } from "@/lib/market/queries";
import type { NewsBundle } from "@/lib/market/types";

export function NewsPage({ initial }: { initial: NewsBundle }) {
  const [symbol, setSymbol] = useState("");
  const [label, setLabel] = useState("Desk headlines");
  const query = useNewsQuery(symbol, initial);
  const data = query.data ?? initial;

  return (
    <div className="px-4 py-6 sm:px-6">
      <p className="text-xs tracking-wide text-accent">Wire</p>
      <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-4xl leading-tight">News</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            Headlines as Yahoo publishes them for a symbol. Titles and blurbs are the feed’s words, not a rewrite. The
            opening set is the S&P 500, Nifty, gold, Henry Hub, and WTI.
          </p>
        </div>
        <div className="w-full lg:max-w-md">
          <SymbolSearch
            scope="any"
            placeholder="Headline search, such as RELIANCE.NS"
            onPick={(hit) => {
              setSymbol(hit.symbol);
              setLabel(hit.name);
            }}
          />
        </div>
      </div>
      <p className="mt-3 text-xs text-faint">
        {data.source} · {label} · pulled {data.fetchedAtLabel}
        {query.isFetching ? " · refreshing" : ""}
      </p>
      {data.error ? <p className="mt-4 text-sm text-down">{data.error}</p> : null}
      <ul className="mt-4 divide-y divide-line rounded-md border border-line">
        {data.items.map((item) => (
          <li key={`${item.symbol}-${item.link}`} className="px-4 py-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-faint">
              <span className="text-accent">{item.symbol}</span>
              <span>{item.publishedLabel}</span>
              <span>{item.source}</span>
            </div>
            <a href={item.link} target="_blank" rel="noreferrer" className="mt-1 block text-base font-medium text-fg hover:text-accent">
              {item.title}
            </a>
            {item.summary ? <p className="mt-2 max-w-3xl text-sm text-muted">{item.summary}</p> : null}
          </li>
        ))}
      </ul>
      {!data.items.length && !data.error ? <p className="mt-4 text-sm text-muted">No headlines in this response.</p> : null}
    </div>
  );
}
