import { createFileRoute } from "@tanstack/react-router";
import { FxPage } from "@/components/fx-page";
import { LoadingNote } from "@/components/bits";
import { getBoard, getReference } from "@/lib/market/api";
import { FX_PAIRS } from "@/lib/market/markets";

export const Route = createFileRoute("/fx")({
  head: () => ({ meta: [{ title: "FX — Yieldroll" }] }),
  loader: () =>
    Promise.all([
      getBoard({ data: { symbols: FX_PAIRS.map((row) => row.symbol) } }),
      getReference({ data: {} }),
    ]).then(([board, reference]) => ({ board, reference })),
  pendingComponent: () => <LoadingNote label="Loading" />,
  pendingMs: 200,
  component: function FxRoute() {
    const data = Route.useLoaderData();
    return <FxPage initial={data.board} reference={data.reference} />;
  },
});
