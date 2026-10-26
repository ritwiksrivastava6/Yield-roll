import { createServerFn } from "@tanstack/react-start";
import type { Basket, Board, CotBook, EcbHistory, EnergyContext, FilingStrip, MacroBundle, NewsBundle, OfficialRates, OptionChain, PrintBoard, ReferenceFx, SearchHit, SeriesResult, VolSurface, WbBundle } from "./types";
import type { VolBoard } from "./eod.server";
import { SEARCH_EXCHANGES } from "./markets";
import { WB_COUNTRIES } from "./universe";

const RANGES = new Set(["3mo", "6mo", "1y", "2y", "5y", "10y"]);
const SYMBOL = /^[A-Z0-9.^=-]{1,18}$/;

function cleanSymbol(value: unknown): string {
  if (typeof value !== "string") throw new Error("Symbol is required");
  const sym = value.trim().toUpperCase();
  if (!SYMBOL.test(sym)) throw new Error("That ticker format is not accepted");
  return sym;
}

export const getBoard = createServerFn({ method: "POST" })
  .validator((input: { symbols: string[] }) => {
    if (!input || !Array.isArray(input.symbols)) throw new Error("Missing symbols");
    const symbols = input.symbols.map((s) => cleanSymbol(s));
    if (symbols.length < 1 || symbols.length > 32) throw new Error("Ask for 1–32 symbols");
    return { symbols };
  })
  .handler(async ({ data }): Promise<Board> => {
    const { loadBoard } = await import("./load.server");
    return loadBoard(data.symbols);
  });

export const getPrints = createServerFn({ method: "POST" })
  .validator((input: { symbols: string[] }) => {
    if (!input || !Array.isArray(input.symbols)) throw new Error("Missing symbols");
    const symbols = input.symbols.map((s) => cleanSymbol(s));
    if (symbols.length < 1 || symbols.length > 32) throw new Error("Ask for 1–32 symbols");
    return { symbols };
  })
  .handler(async ({ data }): Promise<PrintBoard> => {
    const { loadPrints } = await import("./load.server");
    return loadPrints(data.symbols);
  });

export const getSeries = createServerFn({ method: "POST" })
  .validator((input: { symbol: string; range: string }) => {
    const symbol = cleanSymbol(input?.symbol);
    const range = typeof input?.range === "string" ? input.range : "";
    if (!RANGES.has(range)) throw new Error("Unsupported range");
    return { symbol, range };
  })
  .handler(async ({ data }): Promise<SeriesResult> => {
    const { loadSeries } = await import("./load.server");
    try {
      const row = await loadSeries(data.symbol, data.range);
      return {
        ok: true,
        series: {
          symbol: row.symbol,
          name: row.name,
          currency: row.currency,
          exchange: row.exchange,
          tz: row.tz,
          price: row.price,
          changePct: row.changePct,
          asOf: row.asOf,
          asOfLabel: row.asOfLabel,
          bars: row.bars,
          adjusted: row.adjusted,
        },
      };
    } catch (err) {
      return { ok: false, symbol: data.symbol, message: err instanceof Error ? err.message : "request failed" };
    }
  });

export const getMacro = createServerFn({ method: "POST" })
  .validator(() => ({}))
  .handler(async (): Promise<MacroBundle> => {
    const { loadMacro } = await import("./load.server");
    return loadMacro();
  });

const WB_IDS = new Set<string>(WB_COUNTRIES.map((row) => row.id));

export const getWorldBank = createServerFn({ method: "POST" })
  .validator((input: { countries: string[] }) => {
    if (!input || !Array.isArray(input.countries)) throw new Error("Missing countries");
    const countries: string[] = [];
    for (const raw of input.countries) {
      if (typeof raw !== "string") continue;
      const id = raw.trim().toUpperCase();
      if (!WB_IDS.has(id) || countries.includes(id)) continue;
      countries.push(id);
    }
    if (countries.length < 1 || countries.length > 6) throw new Error("Pick 1–6 countries");
    return { countries };
  })
  .handler(async ({ data }): Promise<WbBundle> => {
    const { loadWorldBank } = await import("./load.server");
    return loadWorldBank(data.countries);
  });

const SCOPES = new Set(["any", "equity", "rates", "commodity", "fx", ...Object.keys(SEARCH_EXCHANGES)]);

export const searchSymbols = createServerFn({ method: "POST" })
  .validator((input: { q: string; scope: string }) => {
    const q = typeof input?.q === "string" ? input.q.trim() : "";
    if (q.length < 1 || q.length > 40) throw new Error("Type a ticker or name");
    const scope = typeof input?.scope === "string" && SCOPES.has(input.scope) ? input.scope : "any";
    return { q, scope: scope as "any" | "equity" | "rates" | "commodity" | "fx" | keyof typeof SEARCH_EXCHANGES };
  })
  .handler(async ({ data }): Promise<SearchHit[]> => {
    const { loadSearch } = await import("./load.server");
    return loadSearch(data.q, data.scope);
  });

export const getNews = createServerFn({ method: "POST" })
  .validator((input: { symbol?: string }) => {
    const raw = typeof input?.symbol === "string" ? input.symbol.trim().toUpperCase() : "";
    if (raw && !/^[A-Z0-9.^=-]{1,18}$/.test(raw)) throw new Error("That ticker format is not accepted");
    return { symbol: raw };
  })
  .handler(async ({ data }): Promise<NewsBundle> => {
    const { loadNews } = await import("./load.server");
    return loadNews(data.symbol);
  });

export const getEnergy = createServerFn({ method: "POST" })
  .validator(() => ({}))
  .handler(async (): Promise<EnergyContext> => {
    const { loadEnergy } = await import("./load.server");
    return loadEnergy();
  });

export const getOptions = createServerFn({ method: "POST" })
  .validator((input: { symbol: string; expiry?: string }) => {
    const symbol = cleanSymbol(input?.symbol);
    const expiry = typeof input?.expiry === "string" && /^\d{9,12}$/.test(input.expiry) ? input.expiry : "";
    return { symbol, expiry };
  })
  .handler(async ({ data }): Promise<OptionChain> => {
    const { loadOptions } = await import("./load.server");
    return loadOptions(data.symbol, data.expiry);
  });

export const getSurface = createServerFn({ method: "POST" })
  .validator((input: { symbol: string }) => ({ symbol: cleanSymbol(input?.symbol) }))
  .handler(async ({ data }): Promise<VolSurface> => {
    const { loadSurface } = await import("./load.server");
    return loadSurface(data.symbol);
  });

export const getReference = createServerFn({ method: "POST" })
  .validator(() => ({}))
  .handler(async (): Promise<ReferenceFx> => {
    const { loadReference } = await import("./load.server");
    return loadReference();
  });

export const getOfficialRates = createServerFn({ method: "POST" })
  .validator(() => ({}))
  .handler(async (): Promise<OfficialRates> => {
    const { loadOfficialRates } = await import("./load.server");
    return loadOfficialRates();
  });

export const getFilings = createServerFn({ method: "POST" })
  .validator((input: { symbol: string }) => ({ symbol: cleanSymbol(input?.symbol) }))
  .handler(async ({ data }): Promise<FilingStrip> => {
    const { loadFilings } = await import("./load.server");
    return loadFilings(data.symbol);
  });

export const getVolBoard = createServerFn({ method: "GET" }).handler(async (): Promise<VolBoard> => {
  const { loadVolBoard } = await import("./eod.server");
  return loadVolBoard();
});

export const getCot = createServerFn({ method: "POST" })
  .validator(() => ({}))
  .handler(async (): Promise<CotBook> => {
    const { loadCot } = await import("./load.server");
    return loadCot();
  });

const ECB_SYMBOLS = new Set(["DX-Y.NYB", "EURUSD=X", "GBPUSD=X", "USDJPY=X", "AUDUSD=X", "USDCAD=X", "USDCHF=X", "NZDUSD=X", "USDSEK=X", "USDNOK=X", "USDINR=X", "CNH=X", "USDHKD=X", "USDSGD=X", "USDKRW=X", "EURJPY=X", "GBPJPY=X"]);

export const getEcbHistory = createServerFn({ method: "POST" })
  .validator((input: { symbol: string }) => {
    const symbol = cleanSymbol(input?.symbol);
    if (!ECB_SYMBOLS.has(symbol)) throw new Error("No ECB series for that pair");
    return { symbol };
  })
  .handler(async ({ data }): Promise<EcbHistory> => {
    const { loadEcbHistory } = await import("./load.server");
    return loadEcbHistory(data.symbol);
  });

export const getBasket = createServerFn({ method: "POST" })
  .validator((input: { symbols: string[]; range: string }) => {
    if (!input || !Array.isArray(input.symbols)) throw new Error("Missing symbols");
    const symbols = [...new Set(input.symbols.map((symbol) => cleanSymbol(symbol)))];
    if (symbols.length < 2 || symbols.length > 8) throw new Error("Use 2–8 symbols");
    const range = typeof input.range === "string" ? input.range : "";
    if (!RANGES.has(range)) throw new Error("Unsupported range");
    return { symbols, range };
  })
  .handler(async ({ data }): Promise<Basket> => {
    const { loadBasket } = await import("./load.server");
    return loadBasket(data.symbols, data.range);
  });

