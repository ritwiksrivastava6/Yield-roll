import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

const SCREEN_KEYS = ["mode", "region", "country", "preset", "horizon", "sort", "minRet", "maxRet", "rsiMin", "rsiMax", "offHigh", "rvMin", "rvMax"] as const;
const SYMBOL = /^[A-Z0-9.^=-]{1,18}$/;

export type DeskState = {
  screen: Record<string, string>;
  symbols: string[];
  weights: Record<string, string>;
};

export type DeskAlert = {
  id: number;
  kind: string;
  symbol: string;
  side: string;
  level: number | null;
};

export type DeskPing = { id: number; body: string; seen: boolean; created: string };

function asRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, string> = {};
  for (const key of SCREEN_KEYS) {
    const item = (value as Record<string, unknown>)[key];
    if (typeof item === "string" && item.length < 40) out[key] = item;
  }
  return out;
}

function parseJson<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export const getDesk = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<DeskState> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ screen: string; symbols: string; weights: string }>`
      select screen, symbols, weights from desk_state where user_id = ${context.userId}
    `;
    const row = rows[0];
    if (!row) return { screen: {}, symbols: [], weights: {} };
    return {
      screen: parseJson(row.screen, {}),
      symbols: parseJson<string[]>(row.symbols, []).filter((symbol) => SYMBOL.test(symbol)).slice(0, 8),
      weights: parseJson<Record<string, string>>(row.weights, {}),
    };
  });

export const saveScreen = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => asRecord(input))
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const payload = JSON.stringify(data);
    await sql`
      insert into desk_state (user_id, screen)
      values (${context.userId}, ${payload})
      on conflict (user_id) do update set screen = ${payload}, updated_at = now()
    `;
    return { ok: true };
  });

export const saveBook = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { symbols?: unknown; weights?: unknown }) => {
    const symbols = Array.isArray(input?.symbols)
      ? [...new Set(input.symbols.map((symbol) => String(symbol).trim().toUpperCase()))].filter((symbol) => SYMBOL.test(symbol)).slice(0, 8)
      : [];
    if (symbols.length < 2) throw new Error("The book needs two names");
    const raw = input?.weights && typeof input.weights === "object" ? (input.weights as Record<string, unknown>) : {};
    const weights: Record<string, string> = {};
    for (const symbol of symbols) {
      const value = raw[symbol];
      weights[symbol] = typeof value === "string" && value.length < 12 ? value : "";
    }
    return { symbols, weights };
  })
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const symbols = JSON.stringify(data.symbols);
    const weights = JSON.stringify(data.weights);
    await sql`
      insert into desk_state (user_id, symbols, weights)
      values (${context.userId}, ${symbols}, ${weights})
      on conflict (user_id) do update set symbols = ${symbols}, weights = ${weights}, updated_at = now()
    `;
    return { ok: true };
  });

export const listAlerts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<DeskAlert[]> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ id: number; kind: string; symbol: string; side: string; level: string | null }>`
      select id, kind, symbol, side, level from desk_alert where user_id = ${context.userId} order by id desc
    `;
    return rows.map((row) => ({ ...row, level: row.level == null ? null : Number(row.level) }));
  });

export const armAlert = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { kind?: unknown; symbol?: unknown; side?: unknown; level?: unknown }) => {
    const kind = input?.kind === "filing" ? "filing" : input?.kind === "vol" ? "vol" : input?.kind === "screen" ? "screen" : "";
    if (!kind) throw new Error("Unknown alert");
    if (kind === "screen") return { kind, symbol: "SCREEN", side: "above" as const, level: null as number | null };
    const symbol = String(input?.symbol ?? "").trim().toUpperCase();
    if (!SYMBOL.test(symbol)) throw new Error("Bad symbol");
    const side = input?.side === "below" ? "below" : "above";
    const level = kind === "vol" ? Number(input?.level) : null;
    if (kind === "vol" && !(level === 20 || level === 80)) throw new Error("Level is 20 or 80");
    return { kind, symbol, side, level };
  })
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      insert into desk_alert (user_id, kind, symbol, side, level)
      values (${context.userId}, ${data.kind}, ${data.symbol}, ${data.side}, ${data.level})
      on conflict (user_id, kind, symbol, side) do nothing
    `;
    return { ok: true };
  });

export const noteScreen = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { preset?: unknown; scope?: unknown; symbols?: unknown }) => {
    const preset = String(input?.preset ?? "");
    if (!/^[a-z0-9]{1,16}$/.test(preset)) throw new Error("Bad screen");
    const scope = String(input?.scope ?? "");
    if (!/^[a-z0-9:-]{1,24}$/.test(scope)) throw new Error("Bad scope");
    const symbols = Array.isArray(input?.symbols)
      ? [...new Set(input.symbols.map((symbol) => String(symbol).trim().toUpperCase()))].filter((symbol) => SYMBOL.test(symbol)).sort().slice(0, 80)
      : [];
    return { preset, scope, symbols };
  })
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ id: number; last_key: string }>`
      select id, last_key from desk_alert where user_id = ${context.userId} and kind = 'screen' and symbol = 'SCREEN' limit 1
    `;
    const alert = rows[0];
    if (!alert) return { armed: false, added: [] as string[] };
    const prefix = `${data.preset}|${data.scope}|`;
    const prior = alert.last_key.startsWith(prefix) ? alert.last_key.slice(prefix.length).split(",").filter(Boolean) : null;
    const added = prior ? data.symbols.filter((symbol) => !prior.includes(symbol)) : [];
    if (added.length) {
      const listed = added.slice(0, 8).join(", ");
      const extra = added.length > 8 ? ` +${added.length - 8}` : "";
      const body = `New on ${data.preset}: ${listed}${extra}.`;
      await sql`insert into desk_ping (user_id, body) values (${context.userId}, ${body})`;
    }
    const nextKey = prefix + data.symbols.join(",");
    if (nextKey !== alert.last_key) {
      await sql`update desk_alert set last_key = ${nextKey} where id = ${alert.id} and user_id = ${context.userId}`;
    }
    return { armed: true, added };
  });

export const dropAlert = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: unknown }) => {
    const id = Number(input?.id);
    if (!Number.isInteger(id) || id < 1) throw new Error("Bad alert");
    return { id };
  })
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`delete from desk_alert where id = ${data.id} and user_id = ${context.userId}`;
    return { ok: true };
  });

export const pullPings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<DeskPing[]> => {
    const { getSql } = await import("@/lib/db");
    const { loadVolSymbol } = await import("@/lib/market/eod.server");
    const { loadLatest8k } = await import("@/lib/market/load.server");
    const sql = await getSql();
    const alerts = await sql<{ id: number; kind: string; symbol: string; side: string; level: string | null; last_value: string | null; last_key: string }>`
      select id, kind, symbol, side, level, last_value, last_key from desk_alert where user_id = ${context.userId} order by id
    `;
    for (const alert of alerts.slice(0, 24)) {
      if (alert.kind === "vol") {
        const row = await loadVolSymbol(alert.symbol);
        const now = row?.pct ?? null;
        const level = alert.level == null ? null : Number(alert.level);
        const prev = alert.last_value == null ? null : Number(alert.last_value);
        if (now != null && level != null && prev != null) {
          const crossed = alert.side === "below" ? prev > level && now <= level : prev < level && now >= level;
          if (crossed) {
            const body = `${alert.symbol} 21-day vol percentile is ${now.toFixed(0)}, through ${level.toFixed(0)}.`;
            await sql`insert into desk_ping (user_id, body) values (${context.userId}, ${body})`;
          }
        }
        if (now != null) await sql`update desk_alert set last_value = ${now} where id = ${alert.id} and user_id = ${context.userId}`;
      }
      if (alert.kind === "filing") {
        const filing = await loadLatest8k(alert.symbol);
        if (filing.url && alert.last_key && filing.url !== alert.last_key) {
          const body = `${alert.symbol} filed ${filing.form || "8-K"} on ${filing.filed}.`;
          await sql`insert into desk_ping (user_id, body) values (${context.userId}, ${body})`;
        }
        if (filing.url) await sql`update desk_alert set last_key = ${filing.url} where id = ${alert.id} and user_id = ${context.userId}`;
      }
    }
    const pings = await sql<{ id: number; body: string; seen: boolean; created_at: string }>`
      select id, body, seen, created_at from desk_ping where user_id = ${context.userId} order by id desc limit 12
    `;
    return pings.map((row) => ({ id: row.id, body: row.body, seen: row.seen, created: String(row.created_at).slice(0, 16) }));
  });

export const markPings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`update desk_ping set seen = true where user_id = ${context.userId} and seen = false`;
    return { ok: true };
  });
