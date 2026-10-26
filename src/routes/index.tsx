import { createFileRoute } from "@tanstack/react-router";
import { VolPage } from "@/components/vol-page";
import { LoadingNote } from "@/components/bits";
import { getVolBoard } from "@/lib/market/api";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Vol — Yieldroll" }] }),
  loader: () => getVolBoard(),
  pendingComponent: () => <LoadingNote label="Loading the vol board" />,
  pendingMs: 200,
  component: function VolRoute() {
    return <VolPage initial={Route.useLoaderData()} />;
  },
});
