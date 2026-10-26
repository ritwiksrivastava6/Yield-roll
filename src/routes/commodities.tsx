import { createFileRoute } from "@tanstack/react-router";
import { CommoditiesPage } from "@/components/commodities-page";
import { LoadingNote } from "@/components/bits";
import { getBoard } from "@/lib/market/api";
import { ENERGY, METALS } from "@/lib/market/markets";

const SYMBOLS = [...METALS, ...ENERGY].map((row) => row.symbol);

export const Route = createFileRoute("/commodities")({
  head: () => ({ meta: [{ title: "Commodities — Yieldroll" }] }),
  loader: () => getBoard({ data: { symbols: SYMBOLS } }),
  pendingComponent: () => <LoadingNote label="Loading" />,
  pendingMs: 200,
  component: function CommoditiesRoute() {
    return <CommoditiesPage initial={Route.useLoaderData()} />;
  },
});
