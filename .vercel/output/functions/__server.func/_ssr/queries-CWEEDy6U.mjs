import { o as __toESM } from "../_runtime.mjs";
import { i as require_react, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { A as getReference, C as getEnergy, D as getOfficialRates, E as getNews, M as getSurface, N as getWorldBank, O as getOptions, S as getEcbHistory, T as getMacro, b as getBoard, j as getSeries, k as getPrints, w as getFilings, x as getCot, y as getBasket } from "./router-O2oiJSQ5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/queries-CWEEDy6U.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var PRINT_REFRESH_MS = 2e4;
function mergePrints(quotes, prints) {
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
			asOfLabel: print.asOfLabel ?? quote.asOfLabel
		};
	});
}
function usePrintQuery(symbols) {
	const key = [...symbols].sort().join("|");
	return useQuery({
		queryKey: ["prints", key],
		queryFn: () => getPrints({ data: { symbols } }),
		enabled: symbols.length > 0,
		staleTime: 0,
		refetchInterval: PRINT_REFRESH_MS,
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: true
	});
}
function useBoardQuery(symbols, initial) {
	const [at] = (0, import_react.useState)(() => Date.now());
	return useQuery({
		queryKey: ["board", symbols.join("|")],
		queryFn: () => getBoard({ data: { symbols } }),
		initialData: initial,
		initialDataUpdatedAt: initial ? at : void 0,
		staleTime: 9e4
	});
}
function useSeriesQuery(symbol, range, seed) {
	const [at] = (0, import_react.useState)(() => Date.now());
	const seeded = Boolean(seed && seed.symbol === symbol && seed.range === range);
	return useQuery({
		queryKey: [
			"series",
			symbol,
			range
		],
		queryFn: () => getSeries({ data: {
			symbol,
			range
		} }),
		initialData: seeded ? seed?.result : void 0,
		initialDataUpdatedAt: seeded ? at : void 0,
		staleTime: 9e4
	});
}
function useMacroQuery(initial) {
	const [at] = (0, import_react.useState)(() => Date.now());
	return useQuery({
		queryKey: ["macro"],
		queryFn: () => getMacro({ data: {} }),
		initialData: initial,
		initialDataUpdatedAt: initial ? at : void 0,
		staleTime: 6e5
	});
}
function useWorldBankQuery(countries, seed) {
	const key = countries.join("|");
	const [at] = (0, import_react.useState)(() => Date.now());
	const seeded = Boolean(seed && seed.countries.join("|") === key);
	return useQuery({
		queryKey: ["worldbank", key],
		queryFn: () => getWorldBank({ data: { countries } }),
		initialData: seeded ? seed : void 0,
		initialDataUpdatedAt: seeded ? at : void 0,
		enabled: countries.length >= 1 && countries.length <= 6,
		staleTime: 216e5
	});
}
function useNewsQuery(symbol, initial) {
	const [at] = (0, import_react.useState)(() => Date.now());
	const seeded = Boolean(initial && initial.query && !symbol);
	return useQuery({
		queryKey: ["news", symbol],
		queryFn: () => getNews({ data: { symbol } }),
		initialData: seeded ? initial : void 0,
		initialDataUpdatedAt: seeded ? at : void 0,
		staleTime: 3e5
	});
}
function useEnergyQuery() {
	return useQuery({
		queryKey: ["energy"],
		queryFn: () => getEnergy({ data: {} }),
		staleTime: 9e5
	});
}
function useSurfaceQuery(symbol, enabled) {
	return useQuery({
		queryKey: ["surface", symbol],
		queryFn: () => getSurface({ data: { symbol } }),
		enabled: enabled && symbol.length > 0,
		staleTime: 6e5,
		retry: 1
	});
}
function useOptionsQuery(symbol, expiry, enabled) {
	return useQuery({
		queryKey: [
			"options",
			symbol,
			expiry
		],
		queryFn: () => getOptions({ data: {
			symbol,
			expiry
		} }),
		enabled: enabled && symbol.length > 0,
		staleTime: 6e4
	});
}
function useReferenceQuery(initial) {
	const [at] = (0, import_react.useState)(() => Date.now());
	return useQuery({
		queryKey: ["reference-fx"],
		queryFn: () => getReference({ data: {} }),
		initialData: initial,
		initialDataUpdatedAt: initial ? at : void 0,
		staleTime: 18e5
	});
}
function useOfficialRatesQuery(initial) {
	const [at] = (0, import_react.useState)(() => Date.now());
	return useQuery({
		queryKey: ["official-rates"],
		queryFn: () => getOfficialRates({ data: {} }),
		initialData: initial,
		initialDataUpdatedAt: initial ? at : void 0,
		staleTime: 216e5
	});
}
function useFilingsQuery(symbol, enabled) {
	return useQuery({
		queryKey: ["filings", symbol],
		queryFn: () => getFilings({ data: { symbol } }),
		enabled,
		staleTime: 36e5
	});
}
function useCotQuery() {
	return useQuery({
		queryKey: ["cot"],
		queryFn: () => getCot({ data: {} }),
		staleTime: 432e5
	});
}
function useEcbHistoryQuery(symbol, enabled) {
	return useQuery({
		queryKey: ["ecb-history", symbol],
		queryFn: () => getEcbHistory({ data: { symbol } }),
		enabled,
		staleTime: 432e5
	});
}
function useBasketQuery(symbols, range, initial) {
	const [at] = (0, import_react.useState)(() => Date.now());
	const key = `${range}:${symbols.join("|")}`;
	const seeded = Boolean(initial && initial.range === range && initial.results.length === symbols.length);
	return useQuery({
		queryKey: ["basket", key],
		queryFn: () => getBasket({ data: {
			symbols,
			range
		} }),
		initialData: seeded ? initial : void 0,
		initialDataUpdatedAt: seeded ? at : void 0,
		enabled: symbols.length >= 2,
		staleTime: 3e5
	});
}
//#endregion
export { useEcbHistoryQuery as a, useMacroQuery as c, useOptionsQuery as d, usePrintQuery as f, useWorldBankQuery as g, useSurfaceQuery as h, useCotQuery as i, useNewsQuery as l, useSeriesQuery as m, useBasketQuery as n, useEnergyQuery as o, useReferenceQuery as p, useBoardQuery as r, useFilingsQuery as s, mergePrints as t, useOfficialRatesQuery as u };
