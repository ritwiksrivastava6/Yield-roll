import { createFileRoute } from "@tanstack/react-router";
import { RatesPage } from "@/components/rates-page";
import { LoadingNote } from "@/components/bits";
import { getBoard, getOfficialRates } from "@/lib/market/api";
import { RATES_BOOKS } from "@/lib/market/markets";

const SYMBOLS = RATES_BOOKS.global.map((row) => row.symbol);

export const Route = createFileRoute("/rates")({
  head: () => ({ meta: [{ title: "Rates — Yieldroll" }] }),
  loader: () =>
    Promise.all([getBoard({ data: { symbols: SYMBOLS } }), getOfficialRates({ data: {} })]).then(([board, official]) => ({ board, official })),
  pendingComponent: () => <LoadingNote label="Loading" />,
  pendingMs: 200,
  component: function RatesRoute() {
    const data = Route.useLoaderData();
    return <RatesPage initial={data.board} official={data.official} />;
  },
});
