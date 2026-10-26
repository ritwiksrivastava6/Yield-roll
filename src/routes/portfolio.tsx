import { createFileRoute } from "@tanstack/react-router";
import { PortfolioPage } from "@/components/portfolio-page";
import { LoadingNote } from "@/components/bits";
import { getBasket } from "@/lib/market/api";
import { PORTFOLIO_SEED } from "@/lib/market/markets";

export const Route = createFileRoute("/portfolio")({
  head: () => ({ meta: [{ title: "Portfolio — Yieldroll" }] }),
  loader: () => getBasket({ data: { symbols: [...PORTFOLIO_SEED], range: "1y" } }),
  pendingComponent: () => <LoadingNote label="Loading" />,
  pendingMs: 200,
  component: function PortfolioRoute() {
    return <PortfolioPage initial={Route.useLoaderData()} />;
  },
});
