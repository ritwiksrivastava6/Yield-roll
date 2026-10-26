import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getBasket, getBoard, getCot, getEcbHistory, getEnergy, getFilings, getMacro, getNews, getOfficialRates, getOptions, getPrints, getReference, getSeries, getSurface, getWorldBank } from "./api";
import type { Basket, Board, EnergyContext, MacroBundle, NewsBundle, OfficialRates, OptionChain, Print, Quote, ReferenceFx, SeriesResult, WbBundle } from "./types";

export const PRINT_REFRESH_MS = 20_000;

export function mergePrints(quotes: Quote[], prints: Print[] | undefined): Quote[] {
  if (!prints?.length) return quotes;
  const bySymbol = new Map(prints.map((p) => [p.symbol, p]));
  return quotes.map((quote) => {
    const print = bySymbol.get(quote.symbol);
    if (!print || !(print.price > 0)) return quote;
    return {
      ...quote,
      price: print.price,
      changePct: print.changePct ?? quote.changePct,
      asOf: print.asOf ?? quote.asOf,
      asOfLabel: print.asOfLabel ?? quote.asOfLabel,
    };
  });
}

export function usePrintQuery(symbols: string[]) {
  const key = [...symbols].sort().join("|");
  return useQuery({
    queryKey: ["prints", key],
    queryFn: () => getPrints({ data: { symbols } }),
    enabled: symbols.length > 0,
    staleTime: 0,
    refetchInterval: PRINT_REFRESH_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

export function useBoardQuery(symbols: string[], initial?: Board) {
  const [at] = useState(() => Date.now());
  return useQuery({
    queryKey: ["board", symbols.join("|")],
    queryFn: () => getBoard({ data: { symbols } }),
    initialData: initial,
    initialDataUpdatedAt: initial ? at : undefined,
    staleTime: 90_000,
  });
}

export function useSeriesQuery(
  symbol: string,
  range: string,
  seed?: { symbol: string; range: string; result: SeriesResult },
) {
  const [at] = useState(() => Date.now());
  const seeded = Boolean(seed && seed.symbol === symbol && seed.range === range);
  return useQuery({
    queryKey: ["series", symbol, range],
    queryFn: () => getSeries({ data: { symbol, range } }),
    initialData: seeded ? seed?.result : undefined,
    initialDataUpdatedAt: seeded ? at : undefined,
    staleTime: 90_000,
  });
}

export function useMacroQuery(initial?: MacroBundle) {
  const [at] = useState(() => Date.now());
  return useQuery({
    queryKey: ["macro"],
    queryFn: () => getMacro({ data: {} }),
    initialData: initial,
    initialDataUpdatedAt: initial ? at : undefined,
    staleTime: 10 * 60_000,
  });
}

export function useWorldBankQuery(countries: string[], seed?: WbBundle) {
  const key = countries.join("|");
  const [at] = useState(() => Date.now());
  const seeded = Boolean(seed && seed.countries.join("|") === key);
  return useQuery({
    queryKey: ["worldbank", key],
    queryFn: () => getWorldBank({ data: { countries } }),
    initialData: seeded ? seed : undefined,
    initialDataUpdatedAt: seeded ? at : undefined,
    enabled: countries.length >= 1 && countries.length <= 6,
    staleTime: 6 * 60 * 60_000,
  });
}

export function useNewsQuery(symbol: string, initial?: NewsBundle) {
  const [at] = useState(() => Date.now());
  const seeded = Boolean(initial && initial.query && !symbol);
  return useQuery({
    queryKey: ["news", symbol],
    queryFn: () => getNews({ data: { symbol } }),
    initialData: seeded ? initial : undefined,
    initialDataUpdatedAt: seeded ? at : undefined,
    staleTime: 5 * 60_000,
  });
}

export function useEnergyQuery() {
  return useQuery({
    queryKey: ["energy"],
    queryFn: () => getEnergy({ data: {} }),
    staleTime: 15 * 60_000,
  });
}

export function useSurfaceQuery(symbol: string, enabled: boolean) {
  return useQuery({
    queryKey: ["surface", symbol],
    queryFn: () => getSurface({ data: { symbol } }),
    enabled: enabled && symbol.length > 0,
    staleTime: 10 * 60_000,
    retry: 1,
  });
}

export function useOptionsQuery(symbol: string, expiry: string, enabled: boolean) {
  return useQuery({
    queryKey: ["options", symbol, expiry],
    queryFn: () => getOptions({ data: { symbol, expiry } }),
    enabled: enabled && symbol.length > 0,
    staleTime: 60_000,
  });
}

export function useReferenceQuery(initial?: ReferenceFx) {
  const [at] = useState(() => Date.now());
  return useQuery({
    queryKey: ["reference-fx"],
    queryFn: () => getReference({ data: {} }),
    initialData: initial,
    initialDataUpdatedAt: initial ? at : undefined,
    staleTime: 30 * 60_000,
  });
}

export function useOfficialRatesQuery(initial?: OfficialRates) {
  const [at] = useState(() => Date.now());
  return useQuery({
    queryKey: ["official-rates"],
    queryFn: () => getOfficialRates({ data: {} }),
    initialData: initial,
    initialDataUpdatedAt: initial ? at : undefined,
    staleTime: 6 * 60 * 60_000,
  });
}

export function useFilingsQuery(symbol: string, enabled: boolean) {
  return useQuery({
    queryKey: ["filings", symbol],
    queryFn: () => getFilings({ data: { symbol } }),
    enabled,
    staleTime: 60 * 60_000,
  });
}

export function useCotQuery() {
  return useQuery({
    queryKey: ["cot"],
    queryFn: () => getCot({ data: {} }),
    staleTime: 12 * 60 * 60_000,
  });
}

export function useEcbHistoryQuery(symbol: string, enabled: boolean) {
  return useQuery({
    queryKey: ["ecb-history", symbol],
    queryFn: () => getEcbHistory({ data: { symbol } }),
    enabled,
    staleTime: 12 * 60 * 60_000,
  });
}

export function useBasketQuery(symbols: string[], range: string, initial?: Basket) {
  const [at] = useState(() => Date.now());
  const key = `${range}:${symbols.join("|")}`;
  const seeded = Boolean(initial && initial.range === range && initial.results.length === symbols.length);
  return useQuery({
    queryKey: ["basket", key],
    queryFn: () => getBasket({ data: { symbols, range } }),
    initialData: seeded ? initial : undefined,
    initialDataUpdatedAt: seeded ? at : undefined,
    enabled: symbols.length >= 2,
    staleTime: 5 * 60_000,
  });
}

export type { OptionChain };

