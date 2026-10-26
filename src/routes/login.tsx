import { createFileRoute } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Yieldroll" }] }),
  component: Login,
});

function Login() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-medium tracking-tight">Yieldroll</h1>
        <p className="mt-2 text-sm text-muted">Sign in. The screen, the book, and the pings stay on the account.</p>
        <div className="mt-6 space-y-2">
          {authEnabled ? (
            GROK_PROVIDERS.map((provider) => (
              <button
                key={provider.providerId}
                type="button"
                onClick={() => signIn(provider.providerId, { callbackURL: "/" })}
                className="min-h-11 w-full rounded-md border border-line px-4 text-sm text-fg"
              >
                Continue with {provider.label}
              </button>
            ))
          ) : (
            <p className="text-sm text-muted">Sign-in is off.</p>
          )}
        </div>
      </div>
    </main>
  );
}
