import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { g as WB_COUNTRIES, h as SEARCH_EXCHANGES } from "./universe-B-8f2Y6c.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-xFeb5UFV.js
var RANGES = /* @__PURE__ */ new Set([
	"3mo",
	"6mo",
	"1y",
	"2y",
	"5y",
	"10y"
]);
var SYMBOL = /^[A-Z0-9.^=-]{1,18}$/;
function cleanSymbol(value) {
	if (typeof value !== "string") throw new Error("Symbol is required");
	const sym = value.trim().toUpperCase();
	if (!SYMBOL.test(sym)) throw new Error("That ticker format is not accepted");
	return sym;
}
var getBoard_createServerFn_handler = createServerRpc({
	id: "01fc9dcf0b69425c14220166aa0777f34785b45897e4f7c73287c630313ee427",
	name: "getBoard",
	filename: "src/lib/market/api.ts"
}, (opts) => getBoard.__executeServer(opts));
var getBoard = createServerFn({ method: "POST" }).validator((input) => {
	if (!input || !Array.isArray(input.symbols)) throw new Error("Missing symbols");
	const symbols = input.symbols.map((s) => cleanSymbol(s));
	if (symbols.length < 1 || symbols.length > 32) throw new Error("Ask for 1–32 symbols");
	return { symbols };
}).handler(getBoard_createServerFn_handler, async ({ data }) => {
	const { loadBoard } = await import("./load.server-CcFyc4oW.mjs");
	return loadBoard(data.symbols);
});
var getPrints_createServerFn_handler = createServerRpc({
	id: "81003d14deae88614e66851e7482a7199168c2a809db138321d73dc68771c41a",
	name: "getPrints",
	filename: "src/lib/market/api.ts"
}, (opts) => getPrints.__executeServer(opts));
var getPrints = createServerFn({ method: "POST" }).validator((input) => {
	if (!input || !Array.isArray(input.symbols)) throw new Error("Missing symbols");
	const symbols = input.symbols.map((s) => cleanSymbol(s));
	if (symbols.length < 1 || symbols.length > 32) throw new Error("Ask for 1–32 symbols");
	return { symbols };
}).handler(getPrints_createServerFn_handler, async ({ data }) => {
	const { loadPrints } = await import("./load.server-CcFyc4oW.mjs");
	return loadPrints(data.symbols);
});
var getSeries_createServerFn_handler = createServerRpc({
	id: "bc4511cad5053b89a51693feef0bb6165ff8bd9b411f99c334b3bf5e2115d2e0",
	name: "getSeries",
	filename: "src/lib/market/api.ts"
}, (opts) => getSeries.__executeServer(opts));
var getSeries = createServerFn({ method: "POST" }).validator((input) => {
	const symbol = cleanSymbol(input?.symbol);
	const range = typeof input?.range === "string" ? input.range : "";
	if (!RANGES.has(range)) throw new Error("Unsupported range");
	return {
		symbol,
		range
	};
}).handler(getSeries_createServerFn_handler, async ({ data }) => {
	const { loadSeries } = await import("./load.server-CcFyc4oW.mjs");
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
				adjusted: row.adjusted
			}
		};
	} catch (err) {
		return {
			ok: false,
			symbol: data.symbol,
			message: err instanceof Error ? err.message : "request failed"
		};
	}
});
var getMacro_createServerFn_handler = createServerRpc({
	id: "57c28f1271b6a1d7aa0775945a943e28f5657a45c3de1347bfb3ba78706e33bb",
	name: "getMacro",
	filename: "src/lib/market/api.ts"
}, (opts) => getMacro.__executeServer(opts));
var getMacro = createServerFn({ method: "POST" }).validator(() => ({})).handler(getMacro_createServerFn_handler, async () => {
	const { loadMacro } = await import("./load.server-CcFyc4oW.mjs");
	return loadMacro();
});
var WB_IDS = new Set(WB_COUNTRIES.map((row) => row.id));
var getWorldBank_createServerFn_handler = createServerRpc({
	id: "a1f5f702e012089eb26ef8d6ec816bda4c332cef11895fc6e205fa69d6f3ff8a",
	name: "getWorldBank",
	filename: "src/lib/market/api.ts"
}, (opts) => getWorldBank.__executeServer(opts));
var getWorldBank = createServerFn({ method: "POST" }).validator((input) => {
	if (!input || !Array.isArray(input.countries)) throw new Error("Missing countries");
	const countries = [];
	for (const raw of input.countries) {
		if (typeof raw !== "string") continue;
		const id = raw.trim().toUpperCase();
		if (!WB_IDS.has(id) || countries.includes(id)) continue;
		countries.push(id);
	}
	if (countries.length < 1 || countries.length > 6) throw new Error("Pick 1–6 countries");
	return { countries };
}).handler(getWorldBank_createServerFn_handler, async ({ data }) => {
	const { loadWorldBank } = await import("./load.server-CcFyc4oW.mjs");
	return loadWorldBank(data.countries);
});
var SCOPES = /* @__PURE__ */ new Set([
	"any",
	"equity",
	"rates",
	"commodity",
	"fx",
	...Object.keys(SEARCH_EXCHANGES)
]);
var searchSymbols_createServerFn_handler = createServerRpc({
	id: "065ec62f1c6b40de8220d7bca65b7ac01990b6219d07ac868fd7eddfc28c6b67",
	name: "searchSymbols",
	filename: "src/lib/market/api.ts"
}, (opts) => searchSymbols.__executeServer(opts));
var searchSymbols = createServerFn({ method: "POST" }).validator((input) => {
	const q = typeof input?.q === "string" ? input.q.trim() : "";
	if (q.length < 1 || q.length > 40) throw new Error("Type a ticker or name");
	return {
		q,
		scope: typeof input?.scope === "string" && SCOPES.has(input.scope) ? input.scope : "any"
	};
}).handler(searchSymbols_createServerFn_handler, async ({ data }) => {
	const { loadSearch } = await import("./load.server-CcFyc4oW.mjs");
	return loadSearch(data.q, data.scope);
});
var getNews_createServerFn_handler = createServerRpc({
	id: "5416d3964d644c3e79c533fd3bf9ef1127f1e46cb479bc60c571cdd177427aa9",
	name: "getNews",
	filename: "src/lib/market/api.ts"
}, (opts) => getNews.__executeServer(opts));
var getNews = createServerFn({ method: "POST" }).validator((input) => {
	const raw = typeof input?.symbol === "string" ? input.symbol.trim().toUpperCase() : "";
	if (raw && !/^[A-Z0-9.^=-]{1,18}$/.test(raw)) throw new Error("That ticker format is not accepted");
	return { symbol: raw };
}).handler(getNews_createServerFn_handler, async ({ data }) => {
	const { loadNews } = await import("./load.server-CcFyc4oW.mjs");
	return loadNews(data.symbol);
});
var getEnergy_createServerFn_handler = createServerRpc({
	id: "d118f70071943f61eb227a8b570cfde23b4e6f048fd8cb5d3f32ca491226f38e",
	name: "getEnergy",
	filename: "src/lib/market/api.ts"
}, (opts) => getEnergy.__executeServer(opts));
var getEnergy = createServerFn({ method: "POST" }).validator(() => ({})).handler(getEnergy_createServerFn_handler, async () => {
	const { loadEnergy } = await import("./load.server-CcFyc4oW.mjs");
	return loadEnergy();
});
var getOptions_createServerFn_handler = createServerRpc({
	id: "b79e28691e3a05a5b341826ce3b36fd5bb2b03ec19fdc1a5f9c738c6cfdd0777",
	name: "getOptions",
	filename: "src/lib/market/api.ts"
}, (opts) => getOptions.__executeServer(opts));
var getOptions = createServerFn({ method: "POST" }).validator((input) => {
	return {
		symbol: cleanSymbol(input?.symbol),
		expiry: typeof input?.expiry === "string" && /^\d{9,12}$/.test(input.expiry) ? input.expiry : ""
	};
}).handler(getOptions_createServerFn_handler, async ({ data }) => {
	const { loadOptions } = await import("./load.server-CcFyc4oW.mjs");
	return loadOptions(data.symbol, data.expiry);
});
var getSurface_createServerFn_handler = createServerRpc({
	id: "7034746e14e8242e6bc96b5616b460acedda41ca5575ea7beaa986509ec92b5b",
	name: "getSurface",
	filename: "src/lib/market/api.ts"
}, (opts) => getSurface.__executeServer(opts));
var getSurface = createServerFn({ method: "POST" }).validator((input) => ({ symbol: cleanSymbol(input?.symbol) })).handler(getSurface_createServerFn_handler, async ({ data }) => {
	const { loadSurface } = await import("./load.server-CcFyc4oW.mjs");
	return loadSurface(data.symbol);
});
var getReference_createServerFn_handler = createServerRpc({
	id: "5fc47fe828e422825fec57ebb090a225ae99fa5a7824d200a58e3504f6095df9",
	name: "getReference",
	filename: "src/lib/market/api.ts"
}, (opts) => getReference.__executeServer(opts));
var getReference = createServerFn({ method: "POST" }).validator(() => ({})).handler(getReference_createServerFn_handler, async () => {
	const { loadReference } = await import("./load.server-CcFyc4oW.mjs");
	return loadReference();
});
var getOfficialRates_createServerFn_handler = createServerRpc({
	id: "d60c1daddeed89d366e485ce9e8fe9aafe5cfb3a50722e748b592497afd3df95",
	name: "getOfficialRates",
	filename: "src/lib/market/api.ts"
}, (opts) => getOfficialRates.__executeServer(opts));
var getOfficialRates = createServerFn({ method: "POST" }).validator(() => ({})).handler(getOfficialRates_createServerFn_handler, async () => {
	const { loadOfficialRates } = await import("./load.server-CcFyc4oW.mjs");
	return loadOfficialRates();
});
var getFilings_createServerFn_handler = createServerRpc({
	id: "bba008c2a1b1c7cb5cb5f3dacd3f85e71cb5ae7128f438bec61ca72a7d704893",
	name: "getFilings",
	filename: "src/lib/market/api.ts"
}, (opts) => getFilings.__executeServer(opts));
var getFilings = createServerFn({ method: "POST" }).validator((input) => ({ symbol: cleanSymbol(input?.symbol) })).handler(getFilings_createServerFn_handler, async ({ data }) => {
	const { loadFilings } = await import("./load.server-CcFyc4oW.mjs");
	return loadFilings(data.symbol);
});
var getVolBoard_createServerFn_handler = createServerRpc({
	id: "42e5ba24c102778a6e1e69efc82ce3a67fb4fc7532abd6d0e72c270504f73419",
	name: "getVolBoard",
	filename: "src/lib/market/api.ts"
}, (opts) => getVolBoard.__executeServer(opts));
var getVolBoard = createServerFn({ method: "GET" }).handler(getVolBoard_createServerFn_handler, async () => {
	const { loadVolBoard } = await import("./eod.server-BaztjvvJ.mjs");
	return loadVolBoard();
});
var getCot_createServerFn_handler = createServerRpc({
	id: "2cbde238809017bbda8060ab773a7802168457ed8f1e74a77d4e6ca9da737d52",
	name: "getCot",
	filename: "src/lib/market/api.ts"
}, (opts) => getCot.__executeServer(opts));
var getCot = createServerFn({ method: "POST" }).validator(() => ({})).handler(getCot_createServerFn_handler, async () => {
	const { loadCot } = await import("./load.server-CcFyc4oW.mjs");
	return loadCot();
});
var ECB_SYMBOLS = /* @__PURE__ */ new Set([
	"DX-Y.NYB",
	"EURUSD=X",
	"GBPUSD=X",
	"USDJPY=X",
	"AUDUSD=X",
	"USDCAD=X",
	"USDCHF=X",
	"NZDUSD=X",
	"USDSEK=X",
	"USDNOK=X",
	"USDINR=X",
	"CNH=X",
	"USDHKD=X",
	"USDSGD=X",
	"USDKRW=X",
	"EURJPY=X",
	"GBPJPY=X"
]);
var getEcbHistory_createServerFn_handler = createServerRpc({
	id: "52447ce45384a40eb0acb09801b1caaa53b7c9fa624291a7863412c57eaa1c20",
	name: "getEcbHistory",
	filename: "src/lib/market/api.ts"
}, (opts) => getEcbHistory.__executeServer(opts));
var getEcbHistory = createServerFn({ method: "POST" }).validator((input) => {
	const symbol = cleanSymbol(input?.symbol);
	if (!ECB_SYMBOLS.has(symbol)) throw new Error("No ECB series for that pair");
	return { symbol };
}).handler(getEcbHistory_createServerFn_handler, async ({ data }) => {
	const { loadEcbHistory } = await import("./load.server-CcFyc4oW.mjs");
	return loadEcbHistory(data.symbol);
});
var getBasket_createServerFn_handler = createServerRpc({
	id: "e8de93df98f5aa0e7eeb0da18271fdd01fc3feeb8c237308f858c4a8e661dfac",
	name: "getBasket",
	filename: "src/lib/market/api.ts"
}, (opts) => getBasket.__executeServer(opts));
var getBasket = createServerFn({ method: "POST" }).validator((input) => {
	if (!input || !Array.isArray(input.symbols)) throw new Error("Missing symbols");
	const symbols = [...new Set(input.symbols.map((symbol) => cleanSymbol(symbol)))];
	if (symbols.length < 2 || symbols.length > 8) throw new Error("Use 2–8 symbols");
	const range = typeof input.range === "string" ? input.range : "";
	if (!RANGES.has(range)) throw new Error("Unsupported range");
	return {
		symbols,
		range
	};
}).handler(getBasket_createServerFn_handler, async ({ data }) => {
	const { loadBasket } = await import("./load.server-CcFyc4oW.mjs");
	return loadBasket(data.symbols, data.range);
});
//#endregion
export { getBasket_createServerFn_handler, getBoard_createServerFn_handler, getCot_createServerFn_handler, getEcbHistory_createServerFn_handler, getEnergy_createServerFn_handler, getFilings_createServerFn_handler, getMacro_createServerFn_handler, getNews_createServerFn_handler, getOfficialRates_createServerFn_handler, getOptions_createServerFn_handler, getPrints_createServerFn_handler, getReference_createServerFn_handler, getSeries_createServerFn_handler, getSurface_createServerFn_handler, getVolBoard_createServerFn_handler, getWorldBank_createServerFn_handler, searchSymbols_createServerFn_handler };
