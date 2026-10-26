// Recovered from the last production bundle after a bad edit truncated this file.
// @ts-nocheck
import { bsGreeks, pearson } from "./math";
import { FX_PAIRS, SEARCH_EXCHANGES } from "./markets";
import { MACRO_MARKET_SYMBOLS, WB_COUNTRIES, WB_INDICATORS } from "./universe";

var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
var YAHOO_SOURCE = "Yahoo Finance chart API";
var YAHOO_PRINT_SOURCE = "Yahoo Finance last price";
var FX_SOURCE = "European Central Bank via Frankfurter";
var cache = /* @__PURE__ */ new Map();
function fromCache(key) {
	const hit = cache.get(key);
	if (!hit) return void 0;
	if (hit.exp < Date.now()) {
		cache.delete(key);
		return;
	}
	return hit.val;
}
function toCache(key, val, ttlMs) {
	if (cache.size > 80) cache.clear();
	cache.set(key, {
		exp: Date.now() + ttlMs,
		val
	});
}
async function mapPool(items, limit, fn) {
	const out = new Array(items.length);
	let next = 0;
	const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
		while (next < items.length) {
			const i = next++;
			out[i] = await fn(items[i]);
		}
	});
	await Promise.all(runners);
	return out;
}
var MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];
function utcLabel(date) {
	const dd = String(date.getUTCDate()).padStart(2, "0");
	const hh = String(date.getUTCHours()).padStart(2, "0");
	const mm = String(date.getUTCMinutes()).padStart(2, "0");
	return `${dd} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}, ${hh}:${mm} UTC`;
}
function formatInZone(epochSec, timeZone) {
	const date = /* @__PURE__ */ new Date(epochSec * 1e3);
	try {
		return new Intl.DateTimeFormat("en-GB", {
			timeZone: timeZone || "UTC",
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hourCycle: "h23",
			timeZoneName: "short"
		}).format(date);
	} catch {
		return utcLabel(date);
	}
}
function ymd(epochSec, offsetSec) {
	const dt = /* @__PURE__ */ new Date((epochSec + offsetSec) * 1e3);
	return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}
async function fetchText(url, timeoutMs, headers) {
	let last = "network error";
	for (let attempt = 0; attempt < 2; attempt++) try {
		const res = await fetch(url, {
			headers: {
				"User-Agent": UA,
				Accept: "application/json,text/csv,*/*",
				...headers
			},
			signal: AbortSignal.timeout(timeoutMs)
		});
		const body = await res.text();
		if (res.status >= 500 && attempt === 0) {
			last = `HTTP ${res.status}`;
			continue;
		}
		return {
			status: res.status,
			body
		};
	} catch (err) {
		last = err instanceof Error ? err.message : "network error";
	}
	throw new Error(last);
}
async function yahooChart(symbol, range) {
	const path = `/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=${encodeURIComponent(range)}&events=div%2Csplit&includePrePost=false`;
	const hosts = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];
	let last = `${symbol}: no response`;
	for (const host of hosts) try {
		const { status, body } = await fetchText(`https://${host}${path}`, 15e3);
		if (status === 404) throw new Error(`${symbol}: not found`);
		if (status !== 200) {
			last = `${symbol}: HTTP ${status}`;
			continue;
		}
		const json = JSON.parse(body);
		const result = json.chart?.result?.[0];
		if (!result) {
			last = json.chart?.error?.description || `${symbol}: empty chart`;
			continue;
		}
		return result;
	} catch (err) {
		last = err instanceof Error ? err.message : last;
		if (last.includes("not found")) throw new Error(last);
	}
	throw new Error(last);
}
function parseBars(result) {
	const ts = result.timestamp ?? [];
	const q = result.indicators?.quote?.[0];
	const adj = result.indicators?.adjclose?.[0]?.adjclose;
	const offset = result.meta.gmtoffset ?? 0;
	const bars = [];
	let adjusted = false;
	for (let i = 0; i < ts.length; i++) {
		const raw = q?.close?.[i];
		const adjC = adj?.[i];
		const close = adjC != null && Number.isFinite(adjC) && adjC > 0 ? adjC : raw;
		if (close == null || !Number.isFinite(close) || close <= 0) continue;
		if (raw != null && adjC != null && Math.abs(adjC - raw) / raw > .001) adjusted = true;
		const factor = raw != null && raw > 0 && adjC != null && Number.isFinite(adjC) ? adjC / raw : 1;
		const o0 = q?.open?.[i];
		const h0 = q?.high?.[i];
		const l0 = q?.low?.[i];
		let o = o0 != null && Number.isFinite(o0) ? o0 * factor : close;
		let h = h0 != null && Number.isFinite(h0) ? h0 * factor : close;
		let l = l0 != null && Number.isFinite(l0) ? l0 * factor : close;
		if (h < close) h = close;
		if (l > close) l = close;
		if (!(h >= l)) {
			h = close;
			l = close;
		}
		if (o <= 0) o = close;
		const vol = q?.volume?.[i];
		bars.push({
			d: ymd(ts[i], offset),
			o,
			h,
			l,
			c: close,
			v: vol != null && Number.isFinite(vol) ? vol : null
		});
	}
	return {
		bars,
		adjusted
	};
}
export async function loadSeries(symbol, range) {
	const key = `yh:${symbol}:${range}`;
	const hit = fromCache(key);
	if (hit) return hit;
	const result = await yahooChart(symbol, range);
	const meta = result.meta;
	const { bars, adjusted } = parseBars(result);
	if (!bars.length) throw new Error(`${symbol}: no closes in the response`);
	const last = bars[bars.length - 1].c;
	const prev = bars.length > 1 ? bars[bars.length - 2].c : null;
	const barChg = prev && prev > 0 ? (last / prev - 1) * 100 : null;
	let changePct = meta.regularMarketChangePercent ?? null;
	if (changePct == null || !Number.isFinite(changePct)) changePct = barChg;
	else if (barChg != null && Math.abs(barChg) > .05 && Math.abs(changePct) > 0 && Math.abs(changePct / barChg) > 50) changePct = barChg;
	const price = meta.regularMarketPrice != null && Number.isFinite(meta.regularMarketPrice) && meta.regularMarketPrice > 0 ? meta.regularMarketPrice : last;
	const asOfSec = meta.regularMarketTime ?? Math.floor(Date.now() / 1e3);
	const tz = meta.exchangeTimezoneName || "UTC";
	const loaded = {
		symbol: meta.symbol || symbol,
		name: meta.shortName || meta.longName || symbol,
		currency: meta.currency || "",
		exchange: meta.fullExchangeName || meta.exchangeName || "",
		tz,
		price,
		changePct,
		asOf: (/* @__PURE__ */ new Date(asOfSec * 1e3)).toISOString(),
		asOfLabel: formatInZone(asOfSec, tz),
		bars,
		adjusted,
		volume: meta.regularMarketVolume ?? null,
		dayHigh: meta.regularMarketDayHigh ?? null,
		dayLow: meta.regularMarketDayLow ?? null,
		high52: meta.fiftyTwoWeekHigh ?? null,
		low52: meta.fiftyTwoWeekLow ?? null
	};
	toCache(key, loaded, 9e4);
	return loaded;
}
function chunk(items, size) {
	const out = [];
	for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
	return out;
}
async function yahooSpark(symbols) {
	const path = `/v8/finance/spark?symbols=${symbols.map((s) => encodeURIComponent(s)).join(",")}&range=1d&interval=1m`;
	const hosts = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];
	let last = "spark: no response";
	for (const host of hosts) try {
		const { status, body } = await fetchText(`https://${host}${path}`, 12e3);
		if (status !== 200) {
			last = `spark: HTTP ${status}`;
			continue;
		}
		const json = JSON.parse(body);
		const finance = json.finance;
		if (finance?.error) {
			last = finance.error.description || "spark rejected";
			continue;
		}
		const rows = {};
		for (const [key, value] of Object.entries(json)) if (value && typeof value === "object" && "fulldayPrice" in value) rows[key] = value;
		return rows;
	} catch (err) {
		last = err instanceof Error ? err.message : last;
	}
	throw new Error(last);
}
function sparkPrint(symbol, row) {
	const closes = (row.close ?? []).filter((c) => c != null && Number.isFinite(c) && c > 0);
	const price = row.fulldayPrice != null && Number.isFinite(row.fulldayPrice) && row.fulldayPrice > 0 ? row.fulldayPrice : closes.length ? closes[closes.length - 1] : null;
	if (price == null) return null;
	let changePct = null;
	if (row.fulldayChangePercent != null && Number.isFinite(row.fulldayChangePercent)) changePct = row.fulldayChangePercent;
	else if (row.previousClose != null && row.previousClose > 0) changePct = (price / row.previousClose - 1) * 100;
	const stamps = (row.timestamp ?? []).filter((n) => Number.isFinite(n) && n > 0);
	const sec = stamps.length ? stamps[stamps.length - 1] : row.end && row.end > 0 ? row.end : null;
	return {
		symbol: row.symbol || symbol,
		price,
		changePct,
		asOf: sec ? (/* @__PURE__ */ new Date(sec * 1e3)).toISOString() : null,
		asOfLabel: sec ? formatInZone(sec, "UTC") : null
	};
}
var PRINT_TTL_MS = 12e3;
export async function loadPrints(symbols) {
	const unique = [...new Set(symbols)];
	const prints = [];
	const errors = [];
	const missing = [];
	for (const symbol of unique) {
		const hit = fromCache(`print:${symbol}`);
		if (hit) prints.push(hit);
		else missing.push(symbol);
	}
	if (missing.length) {
		const settled = await mapPool(chunk(missing, 16), 2, async (batch) => {
			try {
				return {
					batch,
					rows: await yahooSpark(batch),
					error: null
				};
			} catch (err) {
				return {
					batch,
					rows: {},
					error: err instanceof Error ? err.message : "request failed"
				};
			}
		});
		for (const part of settled) {
			if (part.error) {
				for (const symbol of part.batch) errors.push({
					symbol,
					message: part.error
				});
				continue;
			}
			for (const symbol of part.batch) {
				const row = part.rows[symbol];
				const print = row ? sparkPrint(symbol, row) : null;
				if (!print) {
					errors.push({
						symbol,
						message: "no last price in the response"
					});
					continue;
				}
				toCache(`print:${symbol}`, print, PRINT_TTL_MS);
				prints.push(print);
			}
		}
	}
	const now = /* @__PURE__ */ new Date();
	return {
		fetchedAt: now.toISOString(),
		fetchedAtLabel: utcLabel(now),
		source: YAHOO_PRINT_SOURCE,
		prints,
		errors
	};
}
function toQuote(row) {
	const spark = row.bars.slice(-210).map((b) => ({
		d: b.d,
		c: b.c
	}));
	return {
		symbol: row.symbol,
		name: row.name,
		currency: row.currency,
		exchange: row.exchange,
		tz: row.tz,
		price: row.price,
		changePct: row.changePct,
		volume: row.volume,
		dayHigh: row.dayHigh,
		dayLow: row.dayLow,
		high52: row.high52,
		low52: row.low52,
		asOf: row.asOf,
		asOfLabel: row.asOfLabel,
		spark
	};
}
export async function loadBoard(symbols) {
	const settled = await mapPool([...new Set(symbols)], 6, async (symbol) => {
		try {
			return {
				quote: toQuote(await loadSeries(symbol, "1y")),
				error: null
			};
		} catch (err) {
			return {
				quote: null,
				error: {
					symbol,
					message: err instanceof Error ? err.message : "request failed"
				}
			};
		}
	});
	const now = /* @__PURE__ */ new Date();
	return {
		fetchedAt: now.toISOString(),
		fetchedAtLabel: utcLabel(now),
		source: YAHOO_SOURCE,
		quotes: settled.flatMap((s) => s.quote ? [s.quote] : []),
		errors: settled.flatMap((s) => s.error ? [s.error] : [])
	};
}
var FX_NAMES = {
	INR: "Indian rupee",
	EUR: "Euro",
	GBP: "Sterling",
	JPY: "Yen",
	CNY: "Yuan"
};
export async function loadMacro() {
	const now = /* @__PURE__ */ new Date();
	const [wb, market] = await Promise.all([loadWorldBank(["US", "IN"]), loadBoard(MACRO_MARKET_SYMBOLS)]);
	return {
		fetchedAt: now.toISOString(),
		fetchedAtLabel: utcLabel(now),
		wbUpdated: wb.updated,
		wbCountries: wb.countries,
		wb: wb.series,
		market: market.quotes,
		marketErrors: market.errors,
		marketSource: YAHOO_SOURCE
	};
}
var MACRO_SAFE = [
	"^IRX",
	"^FVX",
	"^TNX",
	"^TYX",
	"^VIX",
	"DX-Y.NYB",
	"INR=X"
];
function wbSpecs(ids) {
	const specs = [];
	const seen = /* @__PURE__ */ new Set();
	const list = Array.isArray(ids) ? ids : [];
	for (const raw of list) {
		const id = String(raw || "").trim().toUpperCase();
		if (!id || seen.has(id)) continue;
		const row = WB_COUNTRIES.find((country) => country.id === id);
		if (!row) continue;
		seen.add(id);
		specs.push(row);
		if (specs.length === 6) break;
	}
	if (!specs.length) specs.push(WB_COUNTRIES.find((country) => country.id === "US") || WB_COUNTRIES[0]);
	return specs;
}
export async function loadWorldBank(ids) {
	const specs = wbSpecs(ids);
	const countries = specs.map((row) => row.id);
	const key = "wb:" + specs.map((row) => row.iso3).slice().sort().join(",");
	const hit = fromCache(key);
	if (hit) return {
		...hit,
		countries
	};
	const isoToId = new Map(specs.map((row) => [row.iso3, row.id]));
	for (const row of specs) isoToId.set(row.id, row.id);
	const iso3 = specs.map((row) => row.iso3).join(";");
	const perPage = Math.max(80, specs.length * 30);
	let updated = null;
	const series = await mapPool(WB_INDICATORS, 5, async (spec) => {
		const emptyLatest = {};
		for (const id of countries) emptyLatest[id] = null;
		try {
			const { status, body } = await fetchText(`https://api.worldbank.org/v2/country/${iso3}/indicator/${encodeURIComponent(spec.id)}?format=json&per_page=${perPage}&mrv=25`, 2e4);
			if (status !== 200) throw new Error(`HTTP ${status}`);
			const json = JSON.parse(body);
			if (json?.[0]?.lastupdated) updated = json[0].lastupdated;
			const rows = Array.isArray(json?.[1]) ? json[1] : [];
			const byYear = /* @__PURE__ */ new Map();
			for (const row of rows) {
				const year = row.date;
				if (!year) continue;
				const code = isoToId.get(row.countryiso3code) || isoToId.get(row.country?.id);
				if (!code) continue;
				const point = byYear.get(year) ?? {
					year,
					values: Object.fromEntries(countries.map((id) => [id, null]))
				};
				const value = row.value == null || !Number.isFinite(row.value) ? null : row.value;
				point.values[code] = value;
				byYear.set(year, point);
			}
			const points = [...byYear.values()].sort((a, b) => a.year.localeCompare(b.year));
			const latest = { ...emptyLatest };
			for (const id of countries) {
				for (let i = points.length - 1; i >= 0; i--) {
					const value = points[i].values[id];
					if (value != null) {
						latest[id] = {
							year: points[i].year,
							value
						};
						break;
					}
				}
			}
			return {
				id: spec.id,
				name: spec.name,
				unit: spec.unit,
				digits: spec.digits,
				points,
				latest
			};
		} catch (err) {
			return {
				id: spec.id,
				name: spec.name,
				unit: spec.unit,
				digits: spec.digits,
				points: [],
				latest: emptyLatest,
				error: err instanceof Error ? err.message : "World Bank request failed"
			};
		}
	});
	const bundle = {
		countries,
		updated,
		series
	};
	if (series.some((row) => row.points.length)) toCache(key, bundle, 432e5);
	return bundle;
}
async function loadFx() {
	const key = "fx:bundle";
	const hit = fromCache(key);
	if (hit) return hit;
	try {
		const start = (/* @__PURE__ */ new Date(Date.now() - 3456e7)).toISOString().slice(0, 10);
		const [latestRes, histRes] = await Promise.all([fetchText("https://api.frankfurter.dev/v1/latest?from=USD&to=INR,EUR,GBP,JPY,CNY", 15e3), fetchText(`https://api.frankfurter.dev/v1/${start}..?from=USD&to=INR`, 15e3)]);
		if (latestRes.status !== 200) throw new Error(`FX reference HTTP ${latestRes.status}`);
		const latest = JSON.parse(latestRes.body);
		const rates = Object.entries(latest.rates ?? {}).filter(([, v]) => Number.isFinite(v)).map(([code, rate]) => ({
			code,
			name: FX_NAMES[code] || code,
			rate
		}));
		let history = [];
		if (histRes.status === 200) {
			const hist = JSON.parse(histRes.body);
			history = Object.entries(hist.rates ?? {}).map(([d, row]) => ({
				d,
				inr: row.INR ?? NaN
			})).filter((row) => Number.isFinite(row.inr)).sort((a, b) => a.d.localeCompare(b.d));
		}
		const fx = {
			date: latest.date || "",
			rates,
			history,
			source: FX_SOURCE
		};
		toCache(key, fx, 18e5);
		return fx;
	} catch (err) {
		return {
			date: "",
			rates: [],
			history: [],
			source: FX_SOURCE,
			error: err instanceof Error ? err.message : "FX reference failed"
		};
	}
}
var QUOTE_TYPES = /* @__PURE__ */ new Set([
	"EQUITY",
	"ETF",
	"INDEX",
	"MUTUALFUND",
	"FUTURE"
]);
function searchText(row, symbol) {
	return `${symbol} ${row.shortname || ""} ${row.longname || ""} ${row.industry || ""} ${row.sector || ""}`.toLowerCase().replace(/—/g, " ");
}
function dispKey(value) {
	return value.toLowerCase().replace(/[^a-z]/g, "");
}
function listedEquity(type) {
	return !type || type === "EQUITY" || type === "ETF" || type === "INDEX";
}
function onExchange(row, scope) {
	const spec = SEARCH_EXCHANGES[scope];
	if (!spec) return false;
	const exchange = row.exchange || "";
	const disp = dispKey(row.exchDisp || exchange);
	return spec.codes.includes(exchange) || spec.disp.includes(disp);
}
var COMMODITY_SYMBOLS = /* @__PURE__ */ new Set([
	"GC=F",
	"SI=F",
	"HG=F",
	"PL=F",
	"PA=F",
	"CL=F",
	"BZ=F",
	"NG=F",
	"HO=F",
	"RB=F",
	"GLD",
	"SLV",
	"CPER",
	"USO",
	"UNG"
]);
var RATES_SYMBOLS = /* @__PURE__ */ new Set([
	"^IRX",
	"^FVX",
	"^TNX",
	"^TYX",
	"ZT=F",
	"ZF=F",
	"ZN=F",
	"ZB=F",
	"SHY",
	"IEF",
	"TLT",
	"TIP",
	"AGG",
	"LQD",
	"HYG",
	"EMB",
	"BND",
	"IGLT.L",
	"VGOV.L",
	"EXX6.DE",
	"SYBB.DE",
	"IBCX.L",
	"IBGS.MI",
	"612A.T",
	"XBB.TO",
	"ZAG.TO",
	"IAF.AX",
	"VGB.AX",
	"GSEC10ADD.NS"
]);
function keepHit(scope, row, symbol, type) {
	if (scope === "any") return !type || QUOTE_TYPES.has(type) || type === "CURRENCY";
	if (scope === "equity") return listedEquity(type);
	if (scope in SEARCH_EXCHANGES) return listedEquity(type) && onExchange(row, scope);
	if (scope === "fx") return type === "CURRENCY" || symbol.endsWith("=X") || symbol === "DX-Y.NYB";
	const text = searchText(row, symbol);
	if (scope === "commodity") {
		if (COMMODITY_SYMBOLS.has(symbol)) return true;
		if (type !== "FUTURE" && type !== "ETF" && type !== "INDEX") return false;
		return /gold|silver|copper|platinum|palladium|crude|brent|natural gas|heating oil|gasoline|rbob/.test(text);
	}
	if (scope === "rates") {
		if (RATES_SYMBOLS.has(symbol)) return true;
		return /treasury|yield|gilt|\bbond\b|t-note|tips|g-sec|gsec|\bjgb\b|\bbund\b|high yield|investment grade/.test(text);
	}
	return false;
}
export async function loadSearch(query, scope) {
	const q = query.trim().slice(0, 40);
	if (q.length < 1) return [];
	const key = `search:${scope}:${q.toUpperCase()}`;
	const hit = fromCache(key);
	if (hit) return hit;
	const { status, body } = await fetchText(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=${scope === "any" ? 12 : 20}&newsCount=0&enableFuzzyQuery=false`, 12e3);
	if (status !== 200) throw new Error(`Search HTTP ${status}`);
	const json = JSON.parse(body);
	const hits = [];
	for (const row of json.quotes ?? []) {
		const symbol = (row.symbol || "").trim().toUpperCase();
		if (!/^[A-Z0-9.^=-]{1,18}$/.test(symbol)) continue;
		const type = row.quoteType || "";
		if (type && !QUOTE_TYPES.has(type) && type !== "CURRENCY") continue;
		if (!keepHit(scope, row, symbol, type)) continue;
		const exchange = row.exchange || "";
		const exchDisp = row.exchDisp || exchange;
		hits.push({
			symbol,
			name: row.shortname || row.longname || symbol,
			exchange,
			exchDisp,
			type: type || "—"
		});
		if (hits.length >= 8) break;
	}
	toCache(key, hits, 6e4);
	return hits;
}
var NEWS_DEFAULTS = [
	"^GSPC",
	"^NSEI",
	"GC=F",
	"NG=F",
	"CL=F"
];
function xmlTag(block, name) {
	const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
	return match ? match[1].trim() : "";
}
function decodeXml(value) {
	return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, "\"").replace(/&#39;|'/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/\s+/g, " ").trim();
}
function hostOf(link) {
	try {
		return new URL(link).hostname.replace(/^www\./, "");
	} catch {
		return "Yahoo Finance";
	}
}
function parseRss(xml, symbol) {
	const items = [];
	for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
		const block = match[1];
		const title = decodeXml(xmlTag(block, "title"));
		const link = decodeXml(xmlTag(block, "link"));
		if (!title || !link.startsWith("http")) continue;
		const published = decodeXml(xmlTag(block, "pubDate"));
		const parsed = Date.parse(published);
		items.push({
			title,
			link,
			published,
			publishedLabel: Number.isFinite(parsed) ? utcLabel(new Date(parsed)) : published,
			source: hostOf(link),
			symbol,
			summary: decodeXml(xmlTag(block, "description")).slice(0, 280)
		});
	}
	return items;
}
async function newsForSymbol(symbol) {
	const key = `news:${symbol}`;
	const hit = fromCache(key);
	if (hit) return hit;
	const { status, body } = await fetchText(`https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbol)}&region=US&lang=en-US`, 12e3);
	if (status !== 200) throw new Error(`${symbol}: HTTP ${status}`);
	const items = parseRss(body, symbol).slice(0, 8);
	toCache(key, items, 3e5);
	return items;
}
export async function loadNews(symbol) {
	const now = /* @__PURE__ */ new Date();
	const query = symbol || NEWS_DEFAULTS.join(", ");
	try {
		const settled = await mapPool(symbol ? [symbol] : NEWS_DEFAULTS, 3, async (item) => {
			try {
				return {
					items: await newsForSymbol(item),
					error: null
				};
			} catch (err) {
				return {
					items: [],
					error: err instanceof Error ? err.message : "request failed"
				};
			}
		});
		const items = settled.flatMap((row) => row.items).sort((a, b) => Date.parse(b.published) - Date.parse(a.published)).slice(0, 30);
		const errors = settled.flatMap((row) => row.error ? [row.error] : []);
		return {
			fetchedAtLabel: utcLabel(now),
			source: "Yahoo Finance headlines",
			query,
			items,
			error: items.length ? void 0 : errors[0] || "No headlines returned"
		};
	} catch (err) {
		return {
			fetchedAtLabel: utcLabel(now),
			source: "Yahoo Finance headlines",
			query,
			items: [],
			error: err instanceof Error ? err.message : "Headlines failed"
		};
	}
}
var WEATHER_CITIES = [
	{
		name: "Chicago",
		lat: 41.8781,
		lon: -87.6298,
		kind: "hdd"
	},
	{
		name: "New York",
		lat: 40.7128,
		lon: -74.006,
		kind: "hdd"
	},
	{
		name: "Houston",
		lat: 29.7604,
		lon: -95.3698,
		kind: "hdd"
	},
	{
		name: "Erath",
		lat: 29.958,
		lon: -91.814,
		kind: "wind"
	}
];
function nyToday() {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/New_York",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).format(/* @__PURE__ */ new Date());
}
function cityTemp(daily, index, derived) {
	const mean = daily.temperature_2m_mean?.[index];
	if (mean != null && Number.isFinite(mean)) return mean;
	const hi = daily.temperature_2m_max?.[index];
	const lo = daily.temperature_2m_min?.[index];
	if (hi != null && lo != null && Number.isFinite(hi) && Number.isFinite(lo)) {
		derived.n += 1;
		return (hi + lo) / 2;
	}
	return null;
}
function hddF(tempC) {
	const f = tempC * 9 / 5 + 32;
	return Math.max(0, 65 - f);
}
async function loadCityWeather(city) {
	const { status, body } = await fetchText(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,wind_speed_10m_max&past_days=92&forecast_days=8&timezone=America%2FNew_York`, 15e3);
	if (status !== 200) throw new Error(`${city.name}: HTTP ${status}`);
	const json = JSON.parse(body);
	if (json.error || !json.daily?.time?.length) throw new Error(json.reason || `${city.name}: empty weather`);
	return json.daily;
}
function parseCsvLine(line) {
	const out = [];
	let cur = "";
	let quoted = false;
	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (quoted) {
			if (ch === "\"") {
				if (line[i + 1] === "\"") {
					cur += "\"";
					i += 1;
				} else quoted = false;
			} else cur += ch;
		} else if (ch === "\"") quoted = true;
		else if (ch === ",") {
			out.push(cur);
			cur = "";
		} else cur += ch;
	}
	out.push(cur);
	return out;
}
function numCell(value) {
	if (!value) return null;
	const n = Number(value.replace(/,/g, "").trim());
	return Number.isFinite(n) ? n : null;
}
function mdyLabel(value) {
	const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
	if (!match) return value;
	return `${match[2]} ${[
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	][Number(match[1]) - 1]} ${2e3 + Number(match[3])}`;
}
async function loadPetroleum() {
	const keep = [
		"Commercial (Excluding SPR)",
		"Strategic Petroleum Reserve (SPR)",
		"Total Motor Gasoline",
		"Distillate Fuel Oil"
	];
	const { status, body } = await fetchText("https://ir.eia.gov/wpsr/table1.csv", 15e3);
	if (status !== 200) throw new Error(`EIA petroleum HTTP ${status}`);
	const lines = body.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
	const header = parseCsvLine(lines[0] || "");
	const week = header[1] ? mdyLabel(header[1]) : "";
	const rows = [];
	for (const line of lines.slice(1)) {
		const cells = parseCsvLine(line);
		const name = cells[0]?.trim();
		if (!keep.includes(name)) continue;
		const latest = numCell(cells[1]);
		if (latest == null) continue;
		rows.push({
			name,
			latest,
			weekAgo: numCell(cells[2]),
			change: numCell(cells[3]),
			yearAgo: numCell(cells[5])
		});
	}
	if (!rows.length) throw new Error("EIA petroleum table had no stock rows");
	return {
		week,
		rows,
		unit: "million barrels"
	};
}
async function loadStorage() {
	const { status, body } = await fetchText("https://ir.eia.gov/ngs/wngsr.json", 15e3);
	if (status !== 200) throw new Error(`EIA storage HTTP ${status}`);
	const json = JSON.parse(body.replace(/^\uFEFF/, ""));
	const regions = [];
	for (const series of json.series ?? []) {
		const latest = series.data?.[0];
		if (!series.name || !latest || !Number.isFinite(latest[1])) continue;
		const weekAgo = series.data?.[1]?.[1];
		const yearAgo = series.data?.[2]?.[1];
		regions.push({
			name: series.name,
			latest: latest[1],
			weekAgo: weekAgo != null && Number.isFinite(weekAgo) ? weekAgo : null,
			yearAgo: yearAgo != null && Number.isFinite(yearAgo) ? yearAgo : null,
			change: series.calculated?.net_change ?? null,
			avg5: series.calculated?.["5yr-avg"] ?? null,
			unit: series.unitsshort || "bcf"
		});
	}
	if (!regions.length) throw new Error("EIA storage report had no regions");
	return {
		release: json.release_date || "",
		week: json.current_week || "",
		regions
	};
}
async function loadFreight() {
	const notes = {
		BDRY: "Share price of the dry-bulk shipping ETF. Not the Baltic Dry Index.",
		BWET: "Share price of the tanker shipping ETF. Not a freight assessment."
	};
	return await mapPool(["BDRY", "BWET"], 2, async (symbol) => {
		const meta = (await yahooChart(symbol, "5d")).meta;
		const price = meta.regularMarketPrice;
		if (price == null || !(price > 0)) throw new Error(`${symbol}: no price`);
		const asOfSec = meta.regularMarketTime ?? Math.floor(Date.now() / 1e3);
		return {
			symbol: meta.symbol || symbol,
			name: meta.shortName || meta.longName || symbol,
			price,
			changePct: meta.regularMarketChangePercent ?? null,
			asOfLabel: formatInZone(asOfSec, meta.exchangeTimezoneName || "UTC"),
			note: notes[symbol] || "Listed fund, not a freight assessment."
		};
	});
}
function alignCorr(bars, series, field) {
	const xs = [];
	const ys = [];
	for (let i = field === "return" ? 1 : 0; i < bars.length; i++) {
		const x = series.get(bars[i].d);
		if (x == null) continue;
		const y = field === "return" ? bars[i].c / bars[i - 1].c - 1 : bars[i].c;
		if (!Number.isFinite(y)) continue;
		xs.push(x);
		ys.push(y);
	}
	return {
		n: xs.length,
		value: pearson(xs, ys)
	};
}
export async function loadEnergy() {
	const key = "energy:bundle";
	const cached = fromCache(key);
	if (cached) return cached;
	const today = nyToday();
	const derived = { n: 0 };
	const [weatherSettled, storageSettled, petroleumSettled, freightSettled, ngSettled, clSettled] = await Promise.all([
		mapPool(WEATHER_CITIES, 4, async (city) => ({
			city,
			daily: await loadCityWeather(city)
		})).then((rows) => ({
			ok: true,
			rows
		}), (err) => ({
			ok: false,
			error: err instanceof Error ? err.message : "weather failed"
		})),
		loadStorage().then((storage) => ({
			ok: true,
			storage
		}), (err) => ({
			ok: false,
			error: err instanceof Error ? err.message : "storage failed"
		})),
		loadPetroleum().then((petroleum) => ({
			ok: true,
			petroleum
		}), (err) => ({
			ok: false,
			error: err instanceof Error ? err.message : "petroleum failed"
		})),
		loadFreight().then((freight) => ({
			ok: true,
			freight
		}), (err) => ({
			ok: false,
			error: err instanceof Error ? err.message : "freight quotes failed"
		})),
		loadSeries("NG=F", "6mo").then((row) => ({
			ok: true,
			bars: row.bars
		}), () => ({
			ok: false,
			bars: []
		})),
		loadSeries("CL=F", "6mo").then((row) => ({
			ok: true,
			bars: row.bars
		}), () => ({
			ok: false,
			bars: []
		}))
	]);
	const history = [];
	const forecast = [];
	let weatherError;
	if (!weatherSettled.ok) weatherError = weatherSettled.error;
	else {
		const byCity = new Map(weatherSettled.rows.map((row) => [row.city.name, row.daily]));
		const dates = byCity.get("Chicago")?.time ?? [];
		for (const d of dates) {
			const temps = [];
			for (const name of [
				"Chicago",
				"New York",
				"Houston"
			]) {
				const daily = byCity.get(name);
				const index = daily?.time?.indexOf(d) ?? -1;
				if (!daily || index < 0) continue;
				const temp = cityTemp(daily, index, derived);
				if (temp != null) temps.push(temp);
			}
			const hdd = temps.length >= 2 ? temps.reduce((sum, temp) => sum + hddF(temp), 0) / temps.length : null;
			const windDaily = byCity.get("Erath");
			const windIndex = windDaily?.time?.indexOf(d) ?? -1;
			const windRaw = windIndex >= 0 ? windDaily?.wind_speed_10m_max?.[windIndex] : null;
			const wind = windRaw != null && Number.isFinite(windRaw) ? windRaw : null;
			if (d > today) forecast.push({
				d,
				hdd,
				wind
			});
			else history.push({
				d,
				hdd,
				wind,
				ng: null,
				cl: null
			});
		}
	}
	const ngBars = ngSettled.bars;
	const clBars = clSettled.bars;
	const ngByDate = new Map(ngBars.map((bar) => [bar.d, bar.c]));
	const clByDate = new Map(clBars.map((bar) => [bar.d, bar.c]));
	for (const row of history) {
		row.ng = ngByDate.get(row.d) ?? null;
		row.cl = clByDate.get(row.d) ?? null;
	}
	const hddMap = new Map(history.filter((row) => row.hdd != null).map((row) => [row.d, row.hdd]));
	const windMap = new Map(history.filter((row) => row.wind != null).map((row) => [row.d, row.wind]));
	const gasRet = ngBars.length ? alignCorr(ngBars, hddMap, "return") : {
		n: 0,
		value: null
	};
	const gasLevel = ngBars.length ? alignCorr(ngBars, hddMap, "level") : {
		n: 0,
		value: null
	};
	const windRet = clBars.length ? alignCorr(clBars, windMap, "return") : {
		n: 0,
		value: null
	};
	const bundle = {
		fetchedAtLabel: utcLabel(/* @__PURE__ */ new Date()),
		today,
		formula: "Heating degree days use a 65°F base on the daily mean temperature, then an unweighted average of Chicago, New York, and Houston. Wind is the daily maximum at 10 meters near Erath, Louisiana, beside Henry Hub.",
		weatherSource: "Open-Meteo",
		weatherError,
		derivedMeanDays: derived.n,
		history,
		forecast,
		gasCorr: {
			n: gasRet.n,
			ret: gasRet.value,
			level: gasLevel.value,
			symbol: "NG=F"
		},
		windCorr: {
			n: windRet.n,
			ret: windRet.value,
			symbol: "CL=F"
		},
		storage: storageSettled.ok ? storageSettled.storage : {
			release: "",
			week: "",
			regions: [],
			error: storageSettled.error
		},
		petroleum: petroleumSettled.ok ? petroleumSettled.petroleum : {
			week: "",
			rows: [],
			unit: "million barrels",
			error: petroleumSettled.error
		},
		freight: freightSettled.ok ? freightSettled.freight : [],
		freightNote: freightSettled.ok ? "Baltic Dry, Freightos Baltic, and Drewry assessments are not on a keyless feed, so they are omitted. The figures above are Yahoo prices of listed shipping ETFs." : `Shipping ETFs did not load (${freightSettled.error}). Baltic-style freight assessments are not on a keyless feed, so none are shown.`
	};
	if (!weatherError && bundle.storage.regions.length) toCache(key, bundle, 12e5);
	return bundle;
}
var REF_CODES = [
	"EUR",
	"GBP",
	"JPY",
	"AUD",
	"CAD",
	"CHF",
	"NZD",
	"SEK",
	"NOK",
	"CNY",
	"INR",
	"HKD",
	"SGD",
	"KRW"
];
export async function loadReference() {
	const key = "fx:reference";
	const hit = fromCache(key);
	if (hit) return hit;
	try {
		const { status, body } = await fetchText(`https://api.frankfurter.dev/v1/latest?from=USD&to=${REF_CODES.join(",")}`, 15e3);
		if (status !== 200) throw new Error(`ECB reference HTTP ${status}`);
		const json = JSON.parse(body);
		const rates = Object.entries(json.rates ?? {}).filter(([, value]) => Number.isFinite(value)).map(([code, perUsd]) => ({
			code,
			perUsd
		}));
		const fx = {
			date: json.date || "",
			rates,
			source: FX_SOURCE
		};
		if (rates.length) toCache(key, fx, 18e5);
		return fx;
	} catch (err) {
		return {
			date: "",
			rates: [],
			source: FX_SOURCE,
			error: err instanceof Error ? err.message : "ECB reference failed"
		};
	}
}
export async function loadBasket(symbols, range) {
	return {
		range,
		results: await mapPool(symbols, 3, async (symbol) => {
			try {
				const row = await loadSeries(symbol, range);
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
					symbol,
					message: err instanceof Error ? err.message : "request failed"
				};
			}
		})
	};
}
function finite(value) {
	return typeof value === "number" && Number.isFinite(value) ? value : null;
}
async function yahooSession() {
	const cached = fromCache("yahoo:session");
	if (cached) return cached;
	const fc = await fetch("https://fc.yahoo.com", {
		headers: { "User-Agent": UA },
		redirect: "manual",
		signal: AbortSignal.timeout(12e3)
	});
	const cookie = (typeof fc.headers.getSetCookie === "function" ? fc.headers.getSetCookie() : []).map((row) => row.split(";")[0]).filter(Boolean).join("; ");
	const crumb = (await (await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
		headers: {
			"User-Agent": UA,
			Cookie: cookie,
			Accept: "text/plain"
		},
		signal: AbortSignal.timeout(12e3)
	})).text()).trim();
	if (!crumb || crumb.startsWith("<") || crumb.startsWith("{")) throw new Error("Yahoo options session was refused");
	const session = {
		cookie,
		crumb
	};
	toCache("yahoo:session", session, 9e5);
	return session;
}
function mapOptionRows(rows, type, spot, rate, dividend, expirySec) {
	const years = (expirySec * 1e3 - Date.now()) / 31536e6;
	return rows.map((row) => {
		const strike = finite(row.strike) ?? NaN;
		const iv = finite(row.impliedVolatility);
		const greeks = spot != null && rate != null && Number.isFinite(strike) ? bsGreeks({
			spot,
			strike,
			years,
			rate,
			dividend,
			iv: iv ?? NaN,
			type
		}) : null;
		return {
			contract: row.contractSymbol || "",
			type,
			strike,
			bid: finite(row.bid),
			ask: finite(row.ask),
			last: finite(row.lastPrice),
			iv,
			volume: finite(row.volume),
			openInterest: finite(row.openInterest),
			delta: greeks?.delta ?? null,
			gamma: greeks?.gamma ?? null,
			vega: greeks?.vega ?? null,
			theta: greeks?.theta ?? null
		};
	}).filter((row) => row.contract && Number.isFinite(row.strike));
}
function nearMoney(rows, spot) {
	if (spot == null || !(spot > 0)) return rows.slice(0, 24);
	const band = rows.filter((row) => Math.abs(row.strike / spot - 1) <= .12);
	if (band.length >= 8) return band.sort((a, b) => a.strike - b.strike || a.type.localeCompare(b.type));
	return [...rows].sort((a, b) => Math.abs(a.strike - spot) - Math.abs(b.strike - spot)).slice(0, 16).sort((a, b) => a.strike - b.strike || a.type.localeCompare(b.type));
}
async function fetchOptionChain(symbol, date, session) {
	const suffix = /^\d{9,12}$/.test(date) ? `&date=${date}` : "";
	const url = `https://query1.finance.yahoo.com/v7/finance/options/${encodeURIComponent(symbol)}?crumb=${encodeURIComponent(session.crumb)}${suffix}`;
	const res = await fetch(url, {
		headers: {
			"User-Agent": UA,
			Cookie: session.cookie,
			Accept: "application/json"
		},
		signal: AbortSignal.timeout(15e3)
	});
	if (res.status === 401 || res.status === 403) {
		cache.delete("yahoo:session");
		throw new Error("Yahoo refused the option chain");
	}
	if (res.status !== 200) throw new Error(`Option chain HTTP ${res.status}`);
	return await res.json();
}
export async function loadOptions(symbol, expiry) {
	const blank = (error) => ({
		symbol,
		spot: null,
		dividendYield: null,
		rate: null,
		expiry: "",
		expiries: [],
		rows: [],
		source: "Yahoo Finance option chain",
		error
	});
	const pull = (date, session) => fetchOptionChain(symbol, date, session);
	try {
		const session = await yahooSession();
		const ratePromise = loadSeries("^IRX", "5d").then((row) => row.price > 0 ? row.price / 100 : null).catch(() => null);
		let result = (await pull(expiry, session)).optionChain?.result?.[0];
		if (!result) return blank("No listed chain on Yahoo for this symbol");
		const expiries = (result.expirationDates ?? []).map((value) => String(value));
		const soon = expiries.find((value) => Number(value) * 1e3 >= Date.now() + 5184e5);
		const countOf = (row) => (row?.options?.[0]?.calls?.length ?? 0) + (row?.options?.[0]?.puts?.length ?? 0);
		if (!expiry && soon && String(result.options?.[0]?.expirationDate ?? "") !== soon) {
			const candidate = (await pull(soon, session)).optionChain?.result?.[0];
			if (candidate && countOf(candidate) > 0) result = candidate;
		}
		if (countOf(result) === 0) return blank("No listed chain on Yahoo for this symbol");
		const chosen = String(result.options?.[0]?.expirationDate ?? soon ?? expiries[0] ?? "");
		const spot = finite(result.quote?.regularMarketPrice);
		let dividend = finite(result.quote?.trailingAnnualDividendYield);
		if (dividend != null && dividend > .25) dividend = dividend / 100;
		const rate = await ratePromise;
		const chain = result.options?.[0];
		const rows = nearMoney([...mapOptionRows(chain?.calls ?? [], "call", spot, rate, dividend ?? 0, Number(chosen)), ...mapOptionRows(chain?.puts ?? [], "put", spot, rate, dividend ?? 0, Number(chosen))], spot);
		if (!rows.length) return {
			...blank("Yahoo returned no contracts for this expiry"),
			spot,
			rate,
			expiries,
			expiry: chosen
		};
		return {
			symbol,
			spot,
			dividendYield: dividend,
			rate,
			expiry: chosen,
			expiries,
			rows,
			source: "Yahoo Finance option chain. Greeks are Black–Scholes–Merton from that chain's implied volatility."
		};
	} catch (err) {
		return blank(err instanceof Error ? err.message : "Option chain failed");
	}
}
function pickExpiries(dates) {
	const now = Date.now() / 1e3;
	const live = dates.filter((date) => date > now + 432e3 && date < now + 36288e3);
	if (live.length <= 6) return live;
	const out = [];
	for (let i = 0; i < 6; i++) out.push(live[Math.round(i * (live.length - 1) / 5)]);
	return [...new Set(out)];
}
export async function loadSurface(symbol) {
	const key = `surface:${symbol}`;
	const cached = fromCache(key);
	if (cached) return cached;
	const blank = (error) => ({
		symbol,
		spot: null,
		points: [],
		source: "Yahoo Finance option chain",
		error
	});
	try {
		const session = await yahooSession();
		const root = (await fetchOptionChain(symbol, "", session)).optionChain?.result?.[0];
		if (!root) return blank("No listed chain on Yahoo for this symbol");
		const spot = finite(root.quote?.regularMarketPrice);
		const dates = pickExpiries(root.expirationDates ?? []);
		if (!dates.length || spot == null) return blank("No expiries on this chain");
		const packs = await mapPool(dates, 3, async (date) => {
			try {
				return (await fetchOptionChain(symbol, String(date), session)).optionChain?.result?.[0] ?? null;
			} catch {
				return null;
			}
		});
		const points = [];
		for (const pack of packs) {
			const chain = pack?.options?.[0];
			if (!chain?.expirationDate) continue;
			const expiry = (/* @__PURE__ */ new Date(chain.expirationDate * 1e3)).toISOString().slice(0, 10);
			const calls = chain.calls ?? [];
			const puts = chain.puts ?? [];
			const strikes = [...new Set([...calls, ...puts].map((row) => row.strike).filter((strike) => typeof strike === "number"))];
			for (const strike of strikes) {
				if (Math.abs(strike / spot - 1) > .2) continue;
				const side = strike < spot ? "put" : "call";
				const iv = finite((side === "put" ? puts : calls).find((item) => item.strike === strike)?.impliedVolatility);
				if (iv == null || iv < .01 || iv > 3) continue;
				points.push({
					expiry,
					strike,
					iv,
					side
				});
			}
		}
		const surface = points.length ? {
			symbol,
			spot,
			points,
			source: "Yahoo Finance. OTM implied vol: puts below spot, calls at and above."
		} : blank("No implied vols on this chain");
		if (points.length) toCache(key, surface, 6e5);
		return surface;
	} catch (err) {
		return blank(err instanceof Error ? err.message : "Vol surface failed");
	}
}

const TREASURY_SOURCE = "US Treasury par yield curve";
const FED_SOURCE = "Federal Reserve Bank of New York";
const SEC_SOURCE = "SEC EDGAR";
const COT_SOURCE = "CFTC disaggregated commitments of traders, futures only";
const SEC_UA = "Yieldroll Desk research@yieldroll.app";

function parseCsv(text) {
	const rows = [];
	let row = [];
	let cell = "";
	let quoted = false;
	const src = text.replace(/^\uFEFF/, "");
	for (let i = 0; i < src.length; i++) {
		const ch = src[i];
		if (quoted) {
			if (ch === '"') {
				if (src[i + 1] === '"') {
					cell += '"';
					i++;
				} else quoted = false;
			} else cell += ch;
		} else if (ch === '"') quoted = true;
		else if (ch === ",") {
			row.push(cell);
			cell = "";
		} else if (ch === "\n") {
			row.push(cell);
			rows.push(row);
			row = [];
			cell = "";
		} else if (ch !== "\r") cell += ch;
	}
	if (cell.length || row.length) {
		row.push(cell);
		rows.push(row);
	}
	return rows.filter((line) => line.some((value) => value.trim() !== ""));
}

function isoFromUs(mdy) {
	const [month, day, year] = mdy.split("/");
	if (!year || !month || !day) return mdy;
	return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

async function treasuryRow(year) {
	const url = `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/${year}/all?type=daily_treasury_yield_curve&field_tdr_date_value=${year}&page&_format=csv`;
	const { status, body } = await fetchText(url, 20000);
	if (status !== 200) throw new Error(`Treasury curve HTTP ${status}`);
	const rows = parseCsv(body);
	if (rows.length < 2) return null;
	const header = rows[0].map((cell) => cell.trim());
	const latest = rows[1];
	const values = {};
	for (let i = 1; i < header.length; i++) {
		const raw = (latest[i] || "").trim();
		const value = Number(raw);
		values[header[i]] = raw && Number.isFinite(value) ? value : null;
	}
	return { date: isoFromUs((latest[0] || "").trim()), values };
}

export async function loadOfficialRates() {
	const key = "rates:official";
	const hit = fromCache(key);
	if (hit) return hit;
	const year = new Date().getUTCFullYear();
	const curveSpec = [
		{ label: "3-month", tenor: "3 Mo" },
		{ label: "2-year", tenor: "2 Yr" },
		{ label: "10-year", tenor: "10 Yr" },
		{ label: "30-year", tenor: "30 Yr" },
	];
	let date = "";
	let curve = curveSpec.map((row) => ({ label: row.label, yield: null }));
	let curveError;
	let fedError;
	try {
		const picked = (await treasuryRow(year)) ?? (await treasuryRow(year - 1));
		if (!picked) throw new Error("Treasury curve did not return a row");
		date = picked.date;
		curve = curveSpec.map((row) => ({ label: row.label, yield: picked.values[row.tenor] ?? null }));
	} catch (err) {
		curveError = err instanceof Error ? err.message : "Treasury curve failed";
	}
	let sofr = null;
	let effr = null;
	try {
		const { status, body } = await fetchText("https://markets.newyorkfed.org/api/rates/all/latest.json", 15000);
		if (status !== 200) throw new Error(`NY Fed HTTP ${status}`);
		const json = JSON.parse(body);
		const find = (type) => (json.refRates || []).find((row) => row.type === type && Number.isFinite(row.percentRate));
		const sofrRow = find("SOFR");
		const effrRow = find("EFFR");
		if (sofrRow) sofr = { date: sofrRow.effectiveDate || "", rate: sofrRow.percentRate };
		if (effrRow) effr = { date: effrRow.effectiveDate || "", rate: effrRow.percentRate };
		if (!sofr && !effr) throw new Error("NY Fed rates were empty");
	} catch (err) {
		fedError = err instanceof Error ? err.message : "NY Fed rates failed";
	}
	const error = [curveError, fedError].filter(Boolean).join(" · ") || undefined;
	const bundle = { date, curve, sofr, effr, source: `${TREASURY_SOURCE}. ${FED_SOURCE}.`, error };
	if (curve.some((row) => row.yield != null) || sofr || effr) toCache(key, bundle, 6 * 60 * 60 * 1000);
	return bundle;
}

const FILING_FORMS = new Set(["10-K", "10-K/A", "10-Q", "10-Q/A", "8-K", "8-K/A"]);

async function cikMap() {
	const key = "sec:cik";
	const hit = fromCache(key);
	if (hit) return hit;
	const { status, body } = await fetchText("https://www.sec.gov/files/company_tickers.json", 20000, {
		"User-Agent": SEC_UA,
		Accept: "application/json",
	});
	if (status !== 200) throw new Error(`SEC ticker list HTTP ${status}`);
	const json = JSON.parse(body);
	const map = new Map();
	for (const row of Object.values(json)) {
		const ticker = String(row?.ticker || "").toUpperCase();
		const cik = Number(row?.cik_str);
		if (ticker && Number.isFinite(cik)) map.set(ticker, { cik, title: String(row.title || ticker) });
	}
	if (map.size) toCache(key, map, 24 * 60 * 60 * 1000);
	return map;
}

export async function loadFilings(symbol) {
	const key = `sec:filings:${symbol}`;
	const hit = fromCache(key);
	if (hit) return hit;
	try {
		const map = await cikMap();
		const company = map.get(symbol);
		if (!company) return { symbol, name: "", filings: [], source: SEC_SOURCE, error: "No EDGAR company for this ticker" };
		const padded = String(company.cik).padStart(10, "0");
		const { status, body } = await fetchText(`https://data.sec.gov/submissions/CIK${padded}.json`, 20000, {
			"User-Agent": SEC_UA,
			Accept: "application/json",
		});
		if (status !== 200) throw new Error(`SEC submissions HTTP ${status}`);
		const json = JSON.parse(body);
		const recent = json.filings?.recent;
		const forms = recent?.form || [];
		const filings = [];
		for (let i = 0; i < forms.length && filings.length < 3; i++) {
			const form = forms[i];
			if (!FILING_FORMS.has(form)) continue;
			const accession = recent.accessionNumber?.[i] || "";
			const doc = recent.primaryDocument?.[i] || "";
			if (!accession) continue;
			const folder = accession.replace(/-/g, "");
			const file = doc || `${accession}-index.html`;
			filings.push({
				form,
				filed: recent.filingDate?.[i] || "",
				url: `https://www.sec.gov/Archives/edgar/data/${company.cik}/${folder}/${file}`,
			});
		}
		const strip = { symbol, name: company.title, filings, source: SEC_SOURCE };
		toCache(key, strip, 60 * 60 * 1000);
		return strip;
	} catch (err) {
		return { symbol, name: "", filings: [], source: SEC_SOURCE, error: err instanceof Error ? err.message : "EDGAR request failed" };
	}
}

const COT_MARKETS = {
	"GC=F": "GOLD - COMMODITY EXCHANGE INC.",
	"SI=F": "SILVER - COMMODITY EXCHANGE INC.",
	"HG=F": "COPPER- #1 - COMMODITY EXCHANGE INC.",
	"CL=F": "WTI-PHYSICAL - NEW YORK MERCANTILE EXCHANGE",
	"BZ=F": "BRENT LAST DAY - NEW YORK MERCANTILE EXCHANGE",
	"NG=F": "NAT GAS NYME - NEW YORK MERCANTILE EXCHANGE",
};

export async function loadCot() {
	const key = "cftc:cot";
	const hit = fromCache(key);
	if (hit) return hit;
	try {
		const { status, body } = await fetchText("https://www.cftc.gov/dea/newcot/f_disagg.txt", 25000);
		if (status !== 200) throw new Error(`CFTC HTTP ${status}`);
		const wanted = new Map(Object.entries(COT_MARKETS).map(([symbol, market]) => [market, symbol]));
		const rows = [];
		for (const cells of parseCsv(body)) {
			const market = (cells[0] || "").trim();
			const symbol = wanted.get(market);
			if (!symbol) continue;
			const long = Number(cells[13]);
			const short = Number(cells[14]);
			const spread = Number(cells[15]);
			const openInterest = Number(cells[7]);
			if (![long, short, spread, openInterest].every((value) => Number.isFinite(value))) continue;
			rows.push({ symbol, market, reportDate: (cells[2] || "").trim(), openInterest, long, short, spread });
		}
		if (!rows.length) throw new Error("CFTC file did not list the contracts on this desk");
		const book = { rows, source: COT_SOURCE };
		toCache(key, book, 12 * 60 * 60 * 1000);
		return book;
	} catch (err) {
		return { rows: [], source: COT_SOURCE, error: err instanceof Error ? err.message : "CFTC request failed" };
	}
}

const ECB_CROSS = {
	"EURJPY=X": ["JPY", "EUR"],
	"GBPJPY=X": ["JPY", "GBP"],
};

export async function loadEcbHistory(symbol) {
	const key = `fx:ecb:${symbol}`;
	const hit = fromCache(key);
	if (hit) return hit;
	const pair = FX_PAIRS.find((row) => row.symbol === symbol);
	const codes = pair?.ecbCode ? [pair.ecbCode] : ECB_CROSS[symbol];
	if (!pair || !codes) return { symbol, points: [], source: FX_SOURCE, error: "No ECB reference for this instrument" };
	try {
		const start = new Date(Date.now() - 3700 * 86400000).toISOString().slice(0, 10);
		const { status, body } = await fetchText(`https://api.frankfurter.dev/v1/${start}..?from=USD&to=${codes.join(",")}`, 20000);
		if (status !== 200) throw new Error(`ECB history HTTP ${status}`);
		const json = JSON.parse(body);
		const points = Object.entries(json.rates || {})
			.map(([d, row]) => {
				let rate = null;
				if (pair.ecbCode) {
					const perUsd = row[pair.ecbCode];
					if (Number.isFinite(perUsd) && perUsd > 0) rate = pair.ecb === "invert" ? 1 / perUsd : perUsd;
				} else {
					const num = row[codes[0]];
					const den = row[codes[1]];
					if (Number.isFinite(num) && Number.isFinite(den) && num > 0 && den > 0) rate = num / den;
				}
				return rate == null ? null : { d, rate };
			})
			.filter(Boolean)
			.sort((a, b) => a.d.localeCompare(b.d));
		const history = { symbol, points, source: FX_SOURCE };
		if (points.length) toCache(key, history, 12 * 60 * 60 * 1000);
		return history;
	} catch (err) {
		return { symbol, points: [], source: FX_SOURCE, error: err instanceof Error ? err.message : "ECB history failed" };
	}
}

export async function loadLatest8k(symbol) {
	const key = `sec:8k:${symbol}`;
	const hit = fromCache(key);
	if (hit) return hit;
	try {
		const map = await cikMap();
		const company = map.get(symbol);
		if (!company) return { url: "", filed: "", form: "" };
		const padded = String(company.cik).padStart(10, "0");
		const { status, body } = await fetchText(`https://data.sec.gov/submissions/CIK${padded}.json`, 20000, {
			"User-Agent": SEC_UA,
			Accept: "application/json",
		});
		if (status !== 200) return { url: "", filed: "", form: "" };
		const recent = JSON.parse(body).filings?.recent;
		const forms = recent?.form || [];
		for (let i = 0; i < forms.length; i++) {
			const form = forms[i];
			if (form !== "8-K" && form !== "8-K/A") continue;
			const accession = recent.accessionNumber?.[i] || "";
			if (!accession) continue;
			const doc = recent.primaryDocument?.[i] || `${accession}-index.html`;
			const folder = accession.replace(/-/g, "");
			const found = {
				form,
				filed: recent.filingDate?.[i] || "",
				url: `https://www.sec.gov/Archives/edgar/data/${company.cik}/${folder}/${doc}`,
			};
			toCache(key, found, 30 * 60 * 1000);
			return found;
		}
		const empty = { url: "", filed: "", form: "" };
		toCache(key, empty, 30 * 60 * 1000);
		return empty;
	} catch {
		return { url: "", filed: "", form: "" };
	}
}
