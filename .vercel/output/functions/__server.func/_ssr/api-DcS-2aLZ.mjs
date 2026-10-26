import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-K0Uo91xt.mjs";
import { h as createSsrRpc } from "./router-O2oiJSQ5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-DcS-2aLZ.js
var SCREEN_KEYS = [
	"mode",
	"region",
	"country",
	"preset",
	"horizon",
	"sort",
	"minRet",
	"maxRet",
	"rsiMin",
	"rsiMax",
	"offHigh",
	"rvMin",
	"rvMax"
];
var SYMBOL = /^[A-Z0-9.^=-]{1,18}$/;
function asRecord(value) {
	if (!value || typeof value !== "object") return {};
	const out = {};
	for (const key of SCREEN_KEYS) {
		const item = value[key];
		if (typeof item === "string" && item.length < 40) out[key] = item;
	}
	return out;
}
var getDesk = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("af873d8ea92d52c8b1a52c6e0a9a43ab935c1729288377a5cbb9c8127834f434"));
var saveScreen = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => asRecord(input)).handler(createSsrRpc("de66d4c738f9b8759541793165a7fc57d5e3cbcd23cf26c5b9d5ced0c2564e2f"));
var saveBook = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const symbols = Array.isArray(input?.symbols) ? [...new Set(input.symbols.map((symbol) => String(symbol).trim().toUpperCase()))].filter((symbol) => SYMBOL.test(symbol)).slice(0, 8) : [];
	if (symbols.length < 2) throw new Error("The book needs two names");
	const raw = input?.weights && typeof input.weights === "object" ? input.weights : {};
	const weights = {};
	for (const symbol of symbols) {
		const value = raw[symbol];
		weights[symbol] = typeof value === "string" && value.length < 12 ? value : "";
	}
	return {
		symbols,
		weights
	};
}).handler(createSsrRpc("c075ae8ffa5f3db5e7741f89e548f07d75691a0f639e95fee2bda0a1656ad20c"));
var listAlerts = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("59c17942429d83a63d76209fdec8112ac80d2310e1dd18be039f4efacc0ad7e9"));
var armAlert = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const kind = input?.kind === "filing" ? "filing" : input?.kind === "vol" ? "vol" : input?.kind === "screen" ? "screen" : "";
	if (!kind) throw new Error("Unknown alert");
	if (kind === "screen") return {
		kind,
		symbol: "SCREEN",
		side: "above",
		level: null
	};
	const symbol = String(input?.symbol ?? "").trim().toUpperCase();
	if (!SYMBOL.test(symbol)) throw new Error("Bad symbol");
	const side = input?.side === "below" ? "below" : "above";
	const level = kind === "vol" ? Number(input?.level) : null;
	if (kind === "vol" && !(level === 20 || level === 80)) throw new Error("Level is 20 or 80");
	return {
		kind,
		symbol,
		side,
		level
	};
}).handler(createSsrRpc("06ce242737478e9126f4d40377d2a9aecaa12ca10d27ba45cb41f918b55909d7"));
var noteScreen = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const preset = String(input?.preset ?? "");
	if (!/^[a-z0-9]{1,16}$/.test(preset)) throw new Error("Bad screen");
	const scope = String(input?.scope ?? "");
	if (!/^[a-z0-9:-]{1,24}$/.test(scope)) throw new Error("Bad scope");
	return {
		preset,
		scope,
		symbols: Array.isArray(input?.symbols) ? [...new Set(input.symbols.map((symbol) => String(symbol).trim().toUpperCase()))].filter((symbol) => SYMBOL.test(symbol)).sort().slice(0, 80) : []
	};
}).handler(createSsrRpc("8bb72648a6db9da6cd1fe5b4fa56d8813fd6aae46773851a9ab23fa809d571df"));
var dropAlert = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const id = Number(input?.id);
	if (!Number.isInteger(id) || id < 1) throw new Error("Bad alert");
	return { id };
}).handler(createSsrRpc("54118212d3ceae4b7864c3be065b5d2209ffe5457981cba4aef556d77e933795"));
var pullPings = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("b3e4af99c111b57f9bd4346a885d70901ca31a388ebcfeb1bb7555d6c6f665f3"));
var markPings = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("fc48ac534157e80499bddce38534a2f80586634e23cd7b62c613fcf84829afdc"));
//#endregion
export { markPings as a, saveBook as c, listAlerts as i, saveScreen as l, dropAlert as n, noteScreen as o, getDesk as r, pullPings as s, armAlert as t };
