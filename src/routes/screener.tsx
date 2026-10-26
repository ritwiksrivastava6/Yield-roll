import { createFileRoute } from "@tanstack/react-router";
import { ScreenerPage } from "@/components/screener-page";

export const Route = createFileRoute("/screener")({
  head: () => ({ meta: [{ title: "Screener — Yieldroll" }] }),
  component: ScreenerPage,
});
