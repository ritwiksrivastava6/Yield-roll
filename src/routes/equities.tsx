import { createFileRoute } from "@tanstack/react-router";
import { EquitiesPage } from "@/components/equities-page";
import { LoadingNote } from "@/components/bits";
import { getBoard } from "@/lib/market/api";
import { equityBook } from "@/lib/market/markets";
import { searchSymbol } from "@/lib/market/screen";

const SYMBOLS = equityBook("global", "stock").map((row) => row.symbol);

export const Route = createFileRoute("/equities")({
  validateSearch: (search: Record<string, unknown>): { symbol?: string } => {
    const symbol = searchSymbol(search.symbol);
    return symbol ? { symbol } : {};
  },
  head: () => ({ meta: [{ title: "Equities — Yieldroll" }] }),
  loader: () => getBoard({ data: { symbols: SYMBOLS } }),
  pendingComponent: () => <LoadingNote label="Loading" />,
  pendingMs: 200,
  component: function EquitiesRoute() {
    const { symbol } = Route.useSearch();
    return <EquitiesPage initial={Route.useLoaderData()} focus={symbol} />;
  },
});
