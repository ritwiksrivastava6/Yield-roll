import { loadSeries } from "./load.server-C9qTXotF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/eod.server-BCH_hEIo.js
var YEAR = Math.sqrt(252);
function sampleVol(closes, end, n) {
	if (end < n || end >= closes.length) return null;
	const rets = [];
	for (let i = end - n + 1; i <= end; i++) {
		const prev = closes[i - 1];
		const next = closes[i];
		if (!(prev > 0 && next > 0)) return null;
		rets.push(Math.log(next / prev));
	}
	const mean = rets.reduce((sum, value) => sum + value, 0) / rets.length;
	const variance = rets.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (rets.length - 1);
	const sd = Math.sqrt(variance);
	return sd > 0 ? sd * YEAR : null;
}
function rank(vols, index) {
	if (index < 40 || index >= vols.length) return null;
	const last = vols[index];
	let below = 0;
	for (let i = 0; i <= index; i++) if (vols[i] <= last) below += 1;
	return below / (index + 1) * 100;
}
function volSnapshot(closes, n = 21) {
	if (closes.length < n + 50) return null;
	const vols = [];
	for (let end = n; end < closes.length; end++) {
		const vol = sampleVol(closes, end, n);
		if (vol == null) return null;
		vols.push(vol);
	}
	const last = vols.length - 1;
	const pct = rank(vols, last);
	if (pct == null) return null;
	const then = last - 21;
	const prev = then >= 40 ? rank(vols, then) : null;
	return {
		rv: vols[last] * 100,
		pct,
		prev,
		delta: prev == null ? null : pct - prev
	};
}
function volState(pct, delta) {
	if (delta != null && delta >= 15) return "awake";
	if (pct != null && pct <= 25) return "quiet";
	return "steady";
}
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
var VOL_SPECS = [
	{
		symbol: "SPY",
		name: "S&P 500",
		group: "US",
		nasdaq: "SPY",
		klass: "etf"
	},
	{
		symbol: "QQQ",
		name: "Nasdaq 100",
		group: "US",
		nasdaq: "QQQ",
		klass: "etf"
	},
	{
		symbol: "IWM",
		name: "Russell 2000",
		group: "US",
		nasdaq: "IWM",
		klass: "etf"
	},
	{
		symbol: "AAPL",
		name: "Apple",
		group: "US",
		nasdaq: "AAPL",
		klass: "stocks"
	},
	{
		symbol: "NVDA",
		name: "Nvidia",
		group: "US",
		nasdaq: "NVDA",
		klass: "stocks"
	},
	{
		symbol: "EFA",
		name: "Europe",
		group: "World",
		nasdaq: "EFA",
		klass: "etf"
	},
	{
		symbol: "EWJ",
		name: "Japan",
		group: "World",
		nasdaq: "EWJ",
		klass: "etf"
	},
	{
		symbol: "INDA",
		name: "India",
		group: "India",
		nasdaq: "INDA",
		klass: "etf"
	},
	{
		symbol: "TLT",
		name: "US 20-year",
		group: "Rates",
		nasdaq: "TLT",
		klass: "etf"
	},
	{
		symbol: "UUP",
		name: "Dollar",
		group: "FX",
		nasdaq: "UUP",
		klass: "etf"
	},
	{
		symbol: "GLD",
		name: "Gold",
		group: "Commodity",
		nasdaq: "GLD",
		klass: "etf"
	},
	{
		symbol: "USO",
		name: "Crude",
		group: "Commodity",
		nasdaq: "USO",
		klass: "etf"
	},
	{
		symbol: "^NSEI",
		name: "Nifty 50",
		group: "India",
		yahoo: "^NSEI"
	},
	{
		symbol: "RELIANCE.NS",
		name: "Reliance",
		group: "India",
		yahoo: "RELIANCE.NS"
	},
	{
		symbol: "TCS.NS",
		name: "TCS",
		group: "India",
		yahoo: "TCS.NS"
	},
	{
		symbol: "HDFCBANK.NS",
		name: "HDFC Bank",
		group: "India",
		yahoo: "HDFCBANK.NS"
	}
];
var cache = /* @__PURE__ */ new Map();
function cached(key, ttl, load) {
	const hit = cache.get(key);
	if (hit && hit.exp > Date.now()) return Promise.resolve(hit.val);
	return load().then((val) => {
		cache.set(key, {
			exp: Date.now() + ttl,
			val
		});
		return val;
	});
}
function price(text) {
	const value = Number(String(text ?? "").replace(/[$,]/g, ""));
	return Number.isFinite(value) && value > 0 ? value : null;
}
async function nasdaqCloses(symbol, klass) {
	const url = `https://api.nasdaq.com/api/quote/${encodeURIComponent(symbol)}/historical?assetclass=${klass}&fromdate=2022-01-01&limit=800`;
	const res = await fetch(url, { headers: {
		"user-agent": UA,
		accept: "application/json"
	} });
	if (!res.ok) throw new Error(`Nasdaq ${res.status}`);
	const closes = ((await res.json()).data?.tradesTable?.rows ?? []).map((row) => price(row.close)).filter((value) => value != null).reverse();
	if (closes.length < 80) throw new Error("Short Nasdaq history");
	return closes;
}
async function yahooCloses(symbol) {
	const closes = (await loadSeries(symbol, "2y")).bars.map((bar) => bar.c).filter((value) => value > 0);
	if (closes.length < 80) throw new Error("Short history");
	return closes;
}
async function nseNote() {
	return cached("nse:bhav", 36e5, async () => {
		try {
			const res = await fetch("https://nsearchives.nseindia.com/content/cm/BhavCopy_NSE_CM_0_0_0_20261023_F_0000.csv.zip", { headers: {
				"user-agent": UA,
				accept: "*/*"
			} });
			if (res.ok) return "NSE bhavcopy answered.";
			return `NSE bhavcopy refused this network (${res.status}). Indian single names use the quote feed.`;
		} catch {
			return "NSE bhavcopy did not answer. Indian single names use the quote feed.";
		}
	});
}
async function one(spec) {
	const base = {
		symbol: spec.symbol,
		name: spec.name,
		group: spec.group,
		source: "",
		last: null,
		rv: null,
		pct: null,
		prev: null,
		delta: null,
		state: "blank"
	};
	try {
		const closes = spec.nasdaq && spec.klass ? await nasdaqCloses(spec.nasdaq, spec.klass) : await yahooCloses(spec.yahoo || spec.symbol);
		const snap = volSnapshot(closes);
		if (!snap) return {
			...base,
			source: spec.nasdaq ? "Nasdaq end-of-day" : "Quote feed",
			error: "Not enough history"
		};
		return {
			...base,
			source: spec.nasdaq ? "Nasdaq end-of-day" : "Quote feed",
			last: closes[closes.length - 1],
			rv: snap.rv,
			pct: snap.pct,
			prev: snap.prev,
			delta: snap.delta,
			state: volState(snap.pct, snap.delta)
		};
	} catch (error) {
		return {
			...base,
			error: error instanceof Error ? error.message : "No history"
		};
	}
}
async function pool(items, limit, fn) {
	const out = new Array(items.length);
	let next = 0;
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
		while (next < items.length) {
			const index = next++;
			out[index] = await fn(items[index]);
		}
	}));
	return out;
}
async function loadVolBoard() {
	return cached("vol:board", 18e5, async () => {
		const [nse, rows] = await Promise.all([nseNote(), pool(VOL_SPECS, 4, one)]);
		return {
			updated: (/* @__PURE__ */ new Date()).toISOString(),
			nse,
			rows
		};
	});
}
async function loadVolSymbol(symbol) {
	const spec = VOL_SPECS.find((row) => row.symbol === symbol);
	if (!spec) return null;
	return one(spec);
}
//#endregion
export { loadVolBoard, loadVolSymbol };
