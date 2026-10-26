import { createFileRoute } from "@tanstack/react-router";
import { MacroPage } from "@/components/macro-page";
import { LoadingNote } from "@/components/bits";
import { getMacro } from "@/lib/market/api";

export const Route = createFileRoute("/macro")({
  head: () => ({ meta: [{ title: "Macro — Yieldroll" }] }),
  loader: () => getMacro({ data: {} }),
  pendingComponent: () => <LoadingNote label="Loading" />,
  pendingMs: 200,
  component: function MacroRoute() {
    return <MacroPage initial={Route.useLoaderData()} />;
  },
});
