import { createFileRoute } from "@tanstack/react-router";
import { LoadingNote } from "@/components/bits";
import { LabPage } from "@/components/lab-page";
import { getSeries } from "@/lib/market/api";
import { searchSymbol } from "@/lib/market/screen";

export const Route = createFileRoute("/lab")({
  validateSearch: (search: Record<string, unknown>): { symbol?: string } => {
    const symbol = searchSymbol(search.symbol);
    return symbol ? { symbol } : {};
  },
  head: () => ({ meta: [{ title: "Strategy lab — Yieldroll" }] }),
  loader: () => getSeries({ data: { symbol: "^GSPC", range: "5y" } }),
  pendingComponent: () => <LoadingNote label="Loading" />,
  pendingMs: 200,
  component: function LabRoute() {
    const { symbol } = Route.useSearch();
    return <LabPage initial={Route.useLoaderData()} focus={symbol} />;
  },
});
