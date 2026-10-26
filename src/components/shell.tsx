import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { CsvFallback } from "@/components/download";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

const NAV = [
  { href: "/", label: "Vol" },
  { href: "/screener", label: "Screener" },
  { href: "/equities", label: "Equities" },
  { href: "/rates", label: "Rates" },
  { href: "/commodities", label: "Commodities" },
  { href: "/fx", label: "FX" },
  { href: "/macro", label: "Macro" },
  { href: "/lab", label: "Strategy lab" },
  { href: "/portfolio", label: "Portfolio" },
] as const;

function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0" aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-accent" />
      <path
        d="M7 22c4-1 6-6 9-8 2.2-1.4 4.2-1.2 6 .4 1.2 1.1 1.6 2.2 1.2 3.2"
        fill="none"
        className="stroke-accent-ink"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="22" r="1.35" className="fill-accent-ink" />
      <circle cx="16" cy="14" r="1.35" className="fill-accent-ink" />
      <circle cx="23.2" cy="17.6" r="1.35" className="fill-accent-ink" />
    </svg>
  );
}

function NavLinks({ path, stacked }: { path: string; stacked?: boolean }) {
  return (
    <nav className={stacked ? "flex flex-col gap-1" : "flex w-max flex-nowrap gap-1"}>
      {NAV.map((item) => {
        const active = item.href === "/" ? path === "/" : path === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            aria-current={active ? "page" : undefined}
            className={
              "min-h-11 shrink-0 rounded-md px-3 py-2 text-sm " +
              (active ? "bg-surface text-fg" : "text-muted hover:bg-surface hover:text-fg")
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountSlot() {
  const { user, isPending } = useCurrentUserState();
  const [live, setLive] = useState(false);
  useEffect(() => setLive(true), []);
  if (!live || isPending) return <div className="h-11 w-24 rounded-md bg-surface" aria-hidden="true" />;
  if (!user) {
    return (
      <Link to="/login" className="inline-flex min-h-11 items-center text-sm text-muted">
        Sign in
      </Link>
    );
  }
  return <UserButton />;
}

function ThemeSwitch() {
  const [theme, setTheme] = useState<"dark" | "day">("dark");
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "day" ? "day" : "dark");
  }, []);
  function choose(next: "dark" | "day") {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("fathom-theme", next);
    } catch {
      /* private mode */
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "day" ? "#F4F4F2" : "#000000");
    setTheme(next);
  }
  return (
    <div className="flex rounded-md border border-line p-1" role="group" aria-label="Appearance">
      {(["day", "dark"] as const).map((key) => (
        <button
          key={key}
          type="button"
          aria-pressed={theme === key}
          onClick={() => choose(key)}
          className={
            "min-h-11 flex-1 rounded-sm px-3 text-sm " +
            (theme === key ? "bg-accent text-accent-ink" : "text-muted hover:text-fg")
          }
        >
          {key === "day" ? "Day" : "Dark"}
        </button>
      ))}
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="lg:flex lg:min-h-screen">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-line lg:flex">
        <Link to="/" className="flex items-center gap-3 px-4 py-5">
          <Mark />
          <span>
            <span className="block font-display text-lg font-medium leading-none tracking-tight text-fg">Yieldroll</span>
          </span>
        </Link>
        <div className="px-2">
          <NavLinks path={path} stacked />
        </div>
        <div className="mt-auto space-y-3 px-4 py-4">
          <AccountSlot />
          <ThemeSwitch />
          <p className="text-xs leading-relaxed text-faint">Nasdaq end-of-day, quote feed, ECB, EDGAR.</p>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="border-b border-line lg:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <Link to="/" className="flex items-center gap-3">
              <Mark />
              <span className="font-display text-lg font-medium leading-none tracking-tight">Yieldroll</span>
            </Link>
            <div className="w-36 shrink-0">
              <ThemeSwitch />
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 pb-2">
            <AccountSlot />
          </div>
          <div className="overflow-x-auto px-2 pb-2">
            <NavLinks path={path} />
          </div>
        </header>
        <main id="content">{children}</main>
        <footer className="border-t border-line px-4 py-4 text-xs text-faint sm:px-6">
          Prices from Nasdaq end-of-day where that table exists, otherwise the quote feed. NSE bhavcopy is requested and named when it answers. Bond funds are prices, not yields, unless the row says yield. Greeks
          are Black–Scholes–Merton on the listed implied volatility. ECB rates via Frankfurter. EIA storage and
          Open-Meteo weather on energy contracts. Not advice.
        </footer>
      </div>
      <CsvFallback />
    </div>
  );
}
