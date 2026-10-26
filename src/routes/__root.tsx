import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Shell } from "@/components/shell";
import appCss from "../styles.css?url";

const THEME_BOOT =
  "try{var t=localStorage.getItem('fathom-theme');document.documentElement.dataset.theme=t==='day'?'day':'dark';}catch(e){document.documentElement.dataset.theme='dark';}";

/** Same host gate the injector uses for og:image: public hostname only. */
function shareHost(raw: string | undefined | null): string {
  const host = String(raw ?? "")
    .split(",")[0]
    ?.trim()
    .split(":")[0]
    ?.toLowerCase();
  if (!host || !/^[a-z0-9.-]+$/.test(host) || !host.includes(".")) return "";
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return "";
  if (
    host === "vercel.app" ||
    host.endsWith(".vercel.app") ||
    host === "vercel.com" ||
    host.endsWith(".vercel.com")
  ) {
    return "";
  }
  return host;
}

function resolveShareHost(): string {
  const fromEnv = shareHost(
    (import.meta.env as ImportMetaEnv & { VITE_PUBLIC_HOSTNAME?: string }).VITE_PUBLIC_HOSTNAME,
  );
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return shareHost(window.location.host);
  return "";
}

export const Route = createRootRoute({
  head: () => {
    const host = resolveShareHost();
    const meta: Array<
      | { charSet: string }
      | { name: string; content: string }
      | { title: string }
      | { property: string; content: string }
    > = [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Yieldroll" },
      {
        name: "description",
        content: "Yieldroll. Cross-asset vol, rates, and equity screens from public market feeds.",
      },
      { name: "theme-color", content: "#000000" },
    ];
    if (host) {
      const xBanner = `https://${host}/x-banner.jpg`;
      meta.push({ property: "x:game:image", content: xBanner });
    }
    return {
      meta,
      links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
    };
  },
  component: Root,
});

function Root() {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 60_000 },
        },
      }),
  );
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <QueryClientProvider client={client}>
            <Shell>
              <Outlet />
            </Shell>
          </QueryClientProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
