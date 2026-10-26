import { o as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { A as momentumBook, B as rsiBook, H as screenName, J as stdevSample, K as shareBook, O as mean, R as residualPair, V as runLab, Z as walkForward, a as LAB_PRESETS, b as corrMatrix } from "./universe-B-8f2Y6c.mjs";
import { _ as TableExport, a as Route$6, p as CsvRecords, y as formatNum } from "./router-C6cpCEFu.mjs";
import { d as useOptionsQuery, m as useSeriesQuery, n as useBasketQuery } from "./queries-BjZCBJay.mjs";
import { n as Heatmap, o as Split, t as Choice } from "./frame-D35s7vbo.mjs";
import { a as Line, i as XAxis, l as ResponsiveContainer, n as LineChart, o as CartesianGrid, r as YAxis, s as ReferenceLine, u as Tooltip } from "../_libs/recharts+[...].mjs";
import { t as SymbolSearch } from "./symbol-search-Ca4zHxbE.mjs";
import { n as SurfacePanel, t as OptionBoard } from "./surface-panel-RTcQeCl9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lab-BBD1CS8m.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STRUCTURES = [
	{
		id: "long-straddle",
		label: "Long straddle"
	},
	{
		id: "short-straddle",
		label: "Short straddle"
	},
	{
		id: "long-strangle",
		label: "Long strangle"
	},
	{
		id: "short-strangle",
		label: "Short strangle"
	},
	{
		id: "long-call",
		label: "Long call"
	},
	{
		id: "long-put",
		label: "Long put"
	},
	{
		id: "call-spread",
		label: "Call spread"
	},
	{
		id: "put-spread",
		label: "Put spread"
	},
	{
		id: "risk-call",
		label: "Risk reversal, calls"
	},
	{
		id: "risk-put",
		label: "Risk reversal, puts"
	},
	{
		id: "butterfly",
		label: "Call butterfly"
	}
];
function mid(row) {
	if (row.bid != null && row.ask != null && row.ask >= row.bid && row.ask > 0) return (row.bid + row.ask) / 2;
	return row.last != null && row.last > 0 ? row.last : null;
}
function nearest(rows, type, strike) {
	const side = rows.filter((row) => row.type === type && Number.isFinite(row.strike));
	if (!side.length) return null;
	return side.reduce((best, row) => Math.abs(row.strike - strike) < Math.abs(best.strike - strike) ? row : best);
}
function sideLabel(value, longName, shortName) {
	if (value == null || Math.abs(value) < 1e-4) return "Flat";
	return value > 0 ? longName : shortName;
}
function sumGreek(legs, key) {
	let total = 0;
	for (const leg of legs) {
		const value = leg.row[key];
		if (value == null || !Number.isFinite(value)) return null;
		total += leg.qty * value * 100;
	}
	return total;
}
function buildStructure(rows, spot, id) {
	if (spot == null || !(spot > 0) || rows.length < 2) return null;
	const call = nearest(rows, "call", spot);
	const put = nearest(rows, "put", spot);
	if (!call || !put) return null;
	const wing = Math.max(spot * .05, 1);
	const upper = nearest(rows, "call", call.strike + wing);
	const lower = nearest(rows, "put", put.strike - wing);
	const lowCall = nearest(rows, "call", call.strike - wing);
	const picked = [];
	const push = (row, qty) => {
		if (row) picked.push({
			row,
			qty
		});
	};
	if (id === "long-straddle") {
		push(call, 1);
		push(put, 1);
	} else if (id === "short-straddle") {
		push(call, -1);
		push(put, -1);
	} else if (id === "long-strangle") {
		if (!upper || !lower || upper.strike === call.strike || lower.strike === put.strike) return null;
		push(upper, 1);
		push(lower, 1);
	} else if (id === "short-strangle") {
		if (!upper || !lower || upper.strike === call.strike || lower.strike === put.strike) return null;
		push(upper, -1);
		push(lower, -1);
	} else if (id === "long-call") push(call, 1);
	else if (id === "long-put") push(put, 1);
	else if (id === "call-spread") {
		if (!upper || upper.contract === call.contract) return null;
		push(call, 1);
		push(upper, -1);
	} else if (id === "put-spread") {
		if (!lower || lower.contract === put.contract) return null;
		push(put, 1);
		push(lower, -1);
	} else if (id === "risk-call") {
		if (!upper || !lower) return null;
		push(upper, 1);
		push(lower, -1);
	} else if (id === "risk-put") {
		if (!upper || !lower) return null;
		push(lower, 1);
		push(upper, -1);
	} else {
		if (!lowCall || !upper || lowCall.contract === call.contract || upper.contract === call.contract) return null;
		push(lowCall, 1);
		push(call, -2);
		push(upper, 1);
	}
	if (!picked.length) return null;
	let debit = 0;
	let priced = true;
	const legs = picked.map(({ row, qty }) => {
		const mark = mid(row);
		if (mark == null) priced = false;
		else debit += qty * mark * 100;
		return {
			contract: row.contract,
			type: row.type,
			strike: row.strike,
			qty,
			mid: mark
		};
	});
	const vega = sumGreek(picked, "vega");
	const gamma = sumGreek(picked, "gamma");
	return {
		name: STRUCTURES.find((row) => row.id === id)?.label ?? id,
		vol: sideLabel(vega, "Long vol", "Short vol"),
		gamma: sideLabel(gamma, "Long gamma", "Short gamma"),
		debit: priced ? debit : null,
		delta: sumGreek(picked, "delta"),
		gammaN: gamma,
		vega,
		theta: sumGreek(picked, "theta"),
		legs
	};
}
function clamp(value, lo, hi, fallback) {
	if (!Number.isFinite(value)) return fallback;
	return Math.min(hi, Math.max(lo, value));
}
function normalCdf(x) {
	const sign = x < 0 ? -1 : 1;
	const a = Math.abs(x) / Math.SQRT2;
	const t = 1 / (1 + .3275911 * a);
	return .5 * (1 + sign * (1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - .284496736) * t + .254829592) * t * Math.exp(-a * a)));
}
function straddle(spot, strike, days, iv) {
	if (!(spot > 0 && strike > 0)) return {
		price: 0,
		delta: 0
	};
	if (!(days > 0) || !(iv > 0)) {
		const call = Math.max(spot - strike, 0);
		const put = Math.max(strike - spot, 0);
		const callDelta = spot > strike ? 1 : spot < strike ? 0 : .5;
		return {
			price: call + put,
			delta: callDelta + (callDelta - 1)
		};
	}
	const years = days / 252;
	const sqrtT = Math.sqrt(years);
	const d1 = (Math.log(spot / strike) + .5 * iv * iv * years) / (iv * sqrtT);
	const d2 = d1 - iv * sqrtT;
	const call = spot * normalCdf(d1) - strike * normalCdf(d2);
	return {
		price: call + (call - spot + strike),
		delta: 2 * normalCdf(d1) - 1
	};
}
function realized(closes, end, look) {
	if (end < look || look < 2) return null;
	const rets = [];
	for (let k = end - look + 1; k <= end; k++) {
		const prev = closes[k - 1];
		const next = closes[k];
		if (!(prev > 0 && next > 0)) return null;
		rets.push(Math.log(next / prev));
	}
	const sd = stdevSample(rets);
	return sd > 0 ? sd * Math.sqrt(252) : null;
}
function styleOf(style) {
	if (style === "long-vol") return {
		sign: 1,
		hedge: false
	};
	if (style === "short-vol") return {
		sign: -1,
		hedge: false
	};
	if (style === "long-gamma") return {
		sign: 1,
		hedge: true
	};
	return {
		sign: -1,
		hedge: true
	};
}
function maxDrawdown(equity) {
	if (!equity.length) return null;
	let peak = equity[0];
	let worst = 0;
	for (const value of equity) {
		if (value > peak) peak = value;
		const drop = value / peak - 1;
		if (drop < worst) worst = drop;
	}
	return worst * 100;
}
function simulate(closes, dates, style, tenor, vrp, cost, from, to) {
	const { sign, hedge } = styleOf(style);
	const end = Math.min(to, closes.length);
	if (from < tenor || end - from < 12) return null;
	let book = null;
	let anchor = "";
	let tradeLevel = 1;
	let tradeEntry = "";
	let tradeIv = 0;
	const days = [];
	const rolls = [];
	for (let i = from; i < end - 1; i++) {
		const spot = closes[i];
		const next = closes[i + 1];
		if (!(spot > 0 && next > 0)) continue;
		let premiumCost = 0;
		let shareCost = 0;
		if (!book) {
			const vol = realized(closes, i, tenor);
			if (vol == null) continue;
			const iv = Math.min(2.5, Math.max(.05, vol * (1 + vrp)));
			const quote = straddle(spot, spot, tenor, iv);
			if (!(quote.price > 0)) continue;
			book = {
				strike: spot,
				iv,
				born: i,
				value: quote.price,
				delta: quote.delta
			};
			if (!anchor) anchor = dates[i];
			tradeLevel = 1;
			tradeEntry = dates[i];
			tradeIv = iv;
			premiumCost += quote.price;
			if (hedge) shareCost += Math.abs(quote.delta) * spot;
		}
		const heldNext = i + 1 - book.born;
		const expiring = heldNext >= tenor;
		const marked = straddle(next, book.strike, expiring ? 0 : tenor - heldNext, book.iv);
		const optionPnl = sign * (marked.price - book.value);
		const hedgePnl = hedge ? -sign * book.delta * (next - spot) : 0;
		if (hedge) {
			const nextDelta = expiring ? 0 : marked.delta;
			shareCost += Math.abs(-sign * nextDelta - -sign * book.delta) * next;
		}
		if (expiring) premiumCost += marked.price;
		const raw = (optionPnl + hedgePnl - cost * premiumCost - cost * shareCost) / spot;
		const ret = Math.max(-.99, Math.min(5, raw));
		if (Number.isFinite(ret)) {
			days.push({
				d: dates[i + 1],
				ret,
				hold: next / spot - 1
			});
			tradeLevel *= 1 + ret;
		}
		if (expiring) {
			const rv = realized(closes, i + 1, tenor);
			rolls.push({
				entry: tradeEntry,
				exit: dates[i + 1],
				iv: tradeIv,
				rv,
				pnl: (tradeLevel - 1) * 100
			});
			book = null;
		} else book = {
			...book,
			value: marked.price,
			delta: marked.delta
		};
	}
	if (!anchor || days.length < 8) return null;
	return {
		anchor,
		days,
		rolls,
		open: book != null
	};
}
function pack(sim) {
	let level = 100;
	let hold = 100;
	const equity = [{
		d: sim.anchor,
		v: 100,
		hold: 100
	}];
	const rets = [];
	for (const day of sim.days) {
		level *= 1 + day.ret;
		hold *= 1 + day.hold;
		if (!(level > 0) || !Number.isFinite(level)) return null;
		equity.push({
			d: day.d,
			v: level,
			hold
		});
		rets.push(day.ret);
	}
	if (rets.length < 20) return null;
	const sd = stdevSample(rets);
	const ivs = sim.rolls.map((roll) => roll.iv);
	const rvs = sim.rolls.map((roll) => roll.rv).filter((value) => value != null);
	const wins = sim.rolls.filter((roll) => roll.pnl > 0).length;
	return {
		ret: (level / 100 - 1) * 100,
		sharpe: sd > 0 ? mean(rets) / sd * Math.sqrt(252) : null,
		maxDrawdown: maxDrawdown(equity.map((point) => point.v)),
		trades: sim.rolls.length,
		winRate: sim.rolls.length ? wins / sim.rolls.length * 100 : null,
		avgIv: ivs.length ? mean(ivs) : null,
		avgRv: rvs.length ? mean(rvs) : null,
		open: sim.open,
		equity,
		rolls: sim.rolls
	};
}
function runVolBook(bars, style, tenorIn, vrpIn, costBps) {
	const closes = bars.map((bar) => bar.c);
	if (closes.some((price) => !(price > 0))) return null;
	const tenor = Math.round(clamp(tenorIn, 5, 63, 21));
	const vrp = clamp(vrpIn, -.5, 1.5, .12);
	const cost = clamp(costBps, 0, 100, 5) / 1e4;
	const sim = simulate(closes, bars.map((bar) => bar.d), style, tenor, vrp, cost, tenor, closes.length);
	return sim ? pack(sim) : null;
}
function walkVol(bars, style, costBps) {
	const closes = bars.map((bar) => bar.c);
	if (closes.some((price) => !(price > 0)) || closes.length < 420) return null;
	const dates = bars.map((bar) => bar.d);
	const cost = clamp(costBps, 0, 100, 5) / 1e4;
	const rules = [
		10,
		21,
		42
	].flatMap((tenor) => [0, .15].map((vrp) => ({
		tenor,
		vrp,
		label: `${tenor}d · ${(vrp * 100).toFixed(0)}% vrp`
	})));
	const train = 252;
	const test = 63;
	const folds = [];
	const stitched = [];
	const equity = [];
	let level = 100;
	for (let origin = 294; origin + 21 < closes.length; origin += test) {
		let best = null;
		for (const rule of rules) {
			const trainFrom = Math.max(rule.tenor, origin - train);
			const sim = simulate(closes, dates, style, rule.tenor, rule.vrp, cost, trainFrom, origin);
			if (!sim || sim.rolls.length < 1) continue;
			const scored = pack(sim);
			if (!scored) continue;
			const score = scored.sharpe ?? -99;
			if (!best || score > (best.sharpe ?? -99)) best = {
				label: rule.label,
				sharpe: scored.sharpe,
				tenor: rule.tenor,
				vrp: rule.vrp
			};
		}
		if (!best) continue;
		const testTo = Math.min(closes.length, origin + test);
		const oos = simulate(closes, dates, style, best.tenor, best.vrp, cost, Math.max(best.tenor, origin), testTo);
		if (!oos) continue;
		const scored = pack(oos);
		if (!scored) continue;
		for (const day of oos.days) {
			stitched.push(day.ret);
			level *= 1 + day.ret;
			equity.push({
				d: day.d,
				v: level
			});
		}
		folds.push({
			start: dates[origin],
			end: dates[Math.min(closes.length - 1, testTo - 1)],
			rule: best.label,
			isSharpe: best.sharpe,
			oosReturn: scored.ret
		});
	}
	if (!folds.length || stitched.length < 20) return null;
	const sd = stdevSample(stitched);
	return {
		folds,
		oosReturn: (level / 100 - 1) * 100,
		oosSharpe: sd > 0 ? mean(stitched) / sd * Math.sqrt(252) : null,
		oosMaxDd: maxDrawdown(equity.map((point) => point.v)),
		equity
	};
}
var STRATEGIES = [
	{
		id: "stationarity",
		label: "Stationarity"
	},
	{
		id: "fade",
		label: "Z-score fade"
	},
	{
		id: "trend",
		label: "SMA cross"
	},
	{
		id: "breakout",
		label: "Donchian"
	},
	{
		id: "rsi",
		label: "RSI reversal"
	},
	{
		id: "momentum",
		label: "12-1 momentum"
	},
	{
		id: "long-vol",
		label: "Long vol"
	},
	{
		id: "short-vol",
		label: "Short vol"
	},
	{
		id: "long-gamma",
		label: "Long gamma"
	},
	{
		id: "short-gamma",
		label: "Short gamma"
	},
	{
		id: "shares",
		label: "Share ratio"
	},
	{
		id: "residual",
		label: "Residual pair"
	},
	{
		id: "book",
		label: "Option book"
	},
	{
		id: "delta",
		label: "Delta hedge"
	}
];
function isVol(id) {
	return id === "long-vol" || id === "short-vol" || id === "long-gamma" || id === "short-gamma";
}
function volCopy(style) {
	return `${style === "long-vol" ? "Buy an at-the-money straddle and hold it to expiry, unhedged." : style === "short-vol" ? "Sell an at-the-money straddle and hold it to expiry, unhedged." : style === "long-gamma" ? "Buy an at-the-money straddle and hedge the delta every session." : "Sell an at-the-money straddle and hedge the delta every session."} Implied vol is the trailing realized vol of the same tenor, times one plus the variance premium, using only closes known that day. Marks are Black–Scholes at that entry vol until expiry. Rates and dividends are zero. This is not a listed-option tape.`;
}
var RANGES = [
	"1y",
	"2y",
	"5y"
];
function LabPage({ initial, focus }) {
	const focusName = focus ? screenName(focus) ?? focus : "S&P 500";
	const [symbol, setSymbol] = (0, import_react.useState)(focus ?? "^GSPC");
	const [name, setName] = (0, import_react.useState)(focusName);
	const [range, setRange] = (0, import_react.useState)("5y");
	const [strategy, setStrategy] = (0, import_react.useState)(focus ? "momentum" : "shares");
	const [window, setWindow] = (0, import_react.useState)(60);
	const [entryZ, setEntryZ] = (0, import_react.useState)(1.5);
	const [exitZ, setExitZ] = (0, import_react.useState)(.25);
	const [costBps, setCostBps] = (0, import_react.useState)(5);
	const [contracts, setContracts] = (0, import_react.useState)(1);
	const [structure, setStructure] = (0, import_react.useState)("long-straddle");
	const [tenor, setTenor] = (0, import_react.useState)(21);
	const [vrp, setVrp] = (0, import_react.useState)(.12);
	const [picked, setPicked] = (0, import_react.useState)(null);
	const [expiry, setExpiry] = (0, import_react.useState)("");
	const [legs, setLegs] = (0, import_react.useState)([{
		symbol: "AAPL",
		name: "Apple",
		qty: "2"
	}, {
		symbol: "NVDA",
		name: "NVIDIA",
		qty: "-1"
	}]);
	const [ready, setReady] = (0, import_react.useState)(false);
	const volStyle = isVol(strategy) ? strategy : null;
	const multi = strategy === "shares" || strategy === "residual";
	const optionMode = strategy === "delta" || strategy === "book";
	const query = useSeriesQuery(symbol, range, {
		symbol: "^GSPC",
		range: "5y",
		result: initial
	});
	const basket = useBasketQuery(multi ? legs.map((leg) => leg.symbol) : [], range);
	const optionsQ = useOptionsQuery(symbol, expiry, optionMode);
	const report = (0, import_react.useMemo)(() => {
		if (!query.data?.ok || multi) return null;
		if (strategy !== "stationarity" && strategy !== "fade" && strategy !== "trend" && strategy !== "breakout") return null;
		return runLab(query.data.series.bars, {
			window,
			entryZ,
			exitZ,
			costBps
		});
	}, [
		query.data,
		window,
		entryZ,
		exitZ,
		costBps,
		multi,
		strategy
	]);
	(0, import_react.useEffect)(() => setReady(true), []);
	(0, import_react.useEffect)(() => {
		if (!focus) return;
		const hit = screenName(focus);
		setSymbol(focus);
		setName(hit ?? focus);
		setStrategy("momentum");
	}, [focus]);
	(0, import_react.useEffect)(() => {
		setPicked(null);
		setExpiry("");
	}, [symbol]);
	const loaded = (basket.data?.results ?? []).filter((row) => row.ok);
	const ordered = legs.map((leg) => loaded.find((row) => row.series.symbol === leg.symbol)).filter((row) => Boolean(row));
	const qty = legs.map((leg) => Number(leg.qty));
	const share = strategy === "shares" && ordered.length === legs.length && qty.every((value) => Number.isFinite(value)) ? shareBook(ordered.map((row) => ({
		symbol: row.series.symbol,
		bars: row.series.bars
	})), qty) : null;
	const pair = strategy === "residual" && ordered.length >= 2 ? residualPair(ordered[0].series.bars, ordered[1].series.bars, window, entryZ, exitZ, costBps / 1e4) : null;
	const singleBars = query.data?.ok ? query.data.series.bars : null;
	const rsi = strategy === "rsi" && singleBars ? rsiBook(singleBars, costBps / 1e4) : null;
	const momentum = strategy === "momentum" && singleBars ? momentumBook(singleBars, costBps / 1e4) : null;
	const chain = optionsQ.data;
	const contract = picked && chain?.rows.some((row) => row.contract === picked.contract) ? picked : chain?.rows.find((row) => row.delta != null) ?? null;
	const hedgeShares = contract?.delta == null ? null : -contract.delta * 100 * contracts;
	const optionBook = (0, import_react.useMemo)(() => strategy === "book" ? buildStructure(chain?.rows ?? [], chain?.spot ?? null, structure) : null, [
		strategy,
		chain,
		structure
	]);
	const vol = (0, import_react.useMemo)(() => volStyle && singleBars ? runVolBook(singleBars, volStyle, tenor, vrp, costBps) : null, [
		volStyle,
		singleBars,
		tenor,
		vrp,
		costBps
	]);
	const volWalk = (0, import_react.useMemo)(() => volStyle && singleBars ? walkVol(singleBars, volStyle, costBps) : null, [
		volStyle,
		singleBars,
		costBps
	]);
	const walk = (0, import_react.useMemo)(() => {
		if (!singleBars) return null;
		if (strategy !== "fade" && strategy !== "trend" && strategy !== "breakout" && strategy !== "rsi" && strategy !== "momentum") return null;
		return walkForward(singleBars, strategy, costBps);
	}, [
		singleBars,
		strategy,
		costBps
	]);
	const legCorr = (0, import_react.useMemo)(() => {
		if (!multi || ordered.length < 2) return null;
		const series = ordered.map((row) => ({
			symbol: row.series.symbol,
			bars: row.series.bars
		}));
		const full = corrMatrix(series);
		const short = corrMatrix(series, 63);
		if (!full) return null;
		return {
			full,
			short: short && full.sessions > short.sessions + 5 ? short : null
		};
	}, [multi, ordered]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Split, {
		title: "Strategy lab",
		symbol: multi ? legs[0]?.symbol ?? symbol : symbol,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
					label: "Strategy",
					value: strategy,
					options: STRATEGIES,
					onChange: setStrategy
				}), multi ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
					label: "Symbol",
					value: symbol,
					options: [...LAB_PRESETS.map((row) => ({
						id: row.symbol,
						label: row.name
					})), ...LAB_PRESETS.some((row) => row.symbol === symbol) ? [] : [{
						id: symbol,
						label: name
					}]],
					onChange: (next) => {
						const preset = LAB_PRESETS.find((row) => row.symbol === next);
						setSymbol(next);
						setName(preset?.name ?? next);
					}
				})]
			}),
			multi ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegEditor, {
				legs,
				residual: strategy === "residual",
				onChange: setLegs
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 max-w-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SymbolSearch, {
					scope: "any",
					placeholder: "Any listing",
					onPick: (hit) => {
						setSymbol(hit.symbol);
						setName(hit.name);
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-1",
				children: RANGES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": range === item,
					onClick: () => setRange(item),
					className: "min-h-11 rounded-md px-3 text-sm " + (range === item ? "bg-accent text-accent-ink" : "border border-line text-muted"),
					children: item
				}, item))
			}),
			strategy === "fade" || strategy === "residual" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
						label: "Window",
						value: window,
						onChange: setWindow
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
						label: "Entry z",
						value: entryZ,
						step: .1,
						onChange: setEntryZ
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
						label: "Exit z",
						value: exitZ,
						step: .05,
						onChange: setExitZ
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
						label: "Cost bps",
						value: costBps,
						onChange: setCostBps
					})
				]
			}) : null,
			strategy === "trend" || strategy === "breakout" || strategy === "rsi" || strategy === "momentum" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 max-w-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
					label: "Cost bps",
					value: costBps,
					onChange: setCostBps
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-faint",
					children: strategy === "trend" ? "Long when the 20-session average is above the 50, otherwise short" : strategy === "breakout" ? "20-session channel, held until the other side breaks" : strategy === "rsi" ? "RSI 14. Long below 30, short above 70, flat back at 50" : "Long only when the close 21 sessions ago is above the close 252 sessions ago"
				})]
			}) : null,
			volStyle ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
							label: "Tenor",
							value: String(tenor),
							options: [
								{
									id: "10",
									label: "10 sessions"
								},
								{
									id: "21",
									label: "21 sessions"
								},
								{
									id: "42",
									label: "42 sessions"
								}
							],
							onChange: (next) => setTenor(Number(next))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
							label: "Variance premium",
							value: vrp,
							step: .01,
							onChange: setVrp
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
							label: "Cost bps",
							value: costBps,
							onChange: setCostBps
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-faint",
					children: volCopy(volStyle)
				})]
			}) : null,
			strategy === "delta" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 max-w-xs",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
					label: "Contracts",
					value: contracts,
					onChange: setContracts
				})
			}) : null,
			strategy === "book" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 max-w-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
					label: "Structure",
					value: structure,
					options: STRUCTURES,
					onChange: setStructure
				})
			}) : null,
			query.isPending && !multi ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: "Loading"
			}) : null,
			basket.isPending && multi ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: "Loading"
			}) : null,
			query.data && !query.data.ok && !multi ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-down",
				children: query.data.message
			}) : null,
			strategy === "shares" && share ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
				title: `${qty.map((value, index) => `${value} ${legs[index]?.symbol}`).join("  ")}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stats, { items: [
						["P&L", formatNum(share.pnl, 2)],
						["Return", `${share.ret.toFixed(2)}%`],
						["Vol", share.vol == null ? "—" : `${share.vol.toFixed(2)}%`],
						["Max DD", share.maxDrawdown == null ? "—" : `${share.maxDrawdown.toFixed(2)}%`]
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-faint",
						children: "Dollar P&L of the share counts. Return is that P&L over the opening gross."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Curve, {
						ready,
						data: share.equity
					})
				]
			}) : null,
			strategy === "residual" && pair ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
				title: "Residual",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stats, { items: [
						["Beta", pair.beta == null ? "—" : pair.beta.toFixed(2)],
						["z", pair.z == null ? "—" : pair.z.toFixed(2)],
						["Stance", pair.stance],
						["Return", `${pair.ret.toFixed(2)}%`],
						["Sharpe", pair.sharpe == null ? "—" : pair.sharpe.toFixed(2)],
						["Max DD", pair.maxDrawdown == null ? "—" : `${pair.maxDrawdown.toFixed(2)}%`]
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-faint",
						children: [
							"Rolling OLS of log ",
							legs[0]?.symbol,
							" on log ",
							legs[1]?.symbol,
							". Hedge uses past closes only."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Curve, {
						ready,
						data: pair.equity
					})
				]
			}) : null,
			rsi ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalView, {
				label: rsi.last,
				ret: rsi.ret,
				sharpe: rsi.sharpe,
				dd: rsi.maxDrawdown,
				equity: rsi.equity,
				ready
			}) : null,
			momentum ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalView, {
				label: momentum.last,
				ret: momentum.ret,
				sharpe: momentum.sharpe,
				dd: momentum.maxDrawdown,
				equity: momentum.equity,
				ready
			}) : null,
			volStyle ? vol ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolView, {
				report: vol,
				ready
			}) : singleBars ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: "Not enough sessions for this tenor. Use 2y or 5y."
			}) : null : null,
			report && (strategy === "stationarity" || strategy === "fade" || strategy === "trend" || strategy === "breakout") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Single, {
				strategy,
				report,
				ready
			}) : null,
			strategy === "delta" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionBoard, {
				loading: optionsQ.isPending,
				error: optionsQ.isError ? "Option chain did not load" : chain?.error,
				rate: chain?.rate ?? null,
				dividend: chain?.dividendYield ?? null,
				expiries: chain?.expiries ?? [],
				expiry: expiry || chain?.expiry || "",
				onExpiry: setExpiry,
				rows: chain?.rows ?? [],
				selected: contract?.contract,
				onSelect: setPicked
			}), contract ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stats, { items: [
					["Contract", contract.contract],
					["Delta", contract.delta == null ? "—" : contract.delta.toFixed(3)],
					["Share hedge", hedgeShares == null ? "—" : hedgeShares.toFixed(1)],
					["Position gamma", contract.gamma == null ? "—" : (contract.gamma * 100 * contracts).toFixed(4)],
					["Position vega", contract.vega == null ? "—" : (contract.vega * 100 * contracts).toFixed(2)],
					["Position theta", contract.theta == null ? "—" : (contract.theta * 100 * contracts).toFixed(2)]
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-faint",
					children: "Share hedge = −delta × 100 × contracts. No historical option marks on this feed, so this is today’s hedge, not a backtest."
				})]
			}) : null] }) : null,
			strategy === "book" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [
					optionsQ.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Loading chain"
					}) : null,
					chain?.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-down",
						children: chain.error
					}) : null,
					optionBook ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stats, { items: [
							["Vol", optionBook.vol],
							["Gamma", optionBook.gamma],
							["Debit", optionBook.debit == null ? "—" : formatNum(optionBook.debit, 2)],
							["Delta", optionBook.delta == null ? "—" : optionBook.delta.toFixed(1)],
							["Vega", optionBook.vega == null ? "—" : optionBook.vega.toFixed(2)],
							["Theta", optionBook.theta == null ? "—" : optionBook.theta.toFixed(2)]
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableExport, {
							file: "option-book",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 overflow-x-auto rounded-md border border-line",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-left text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
										className: "bg-surface text-xs text-muted",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-3 py-2 font-medium",
												children: "Contract"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-3 py-2 text-right font-medium",
												children: "Qty"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-3 py-2 text-right font-medium",
												children: "Mid"
											})
										] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: optionBook.legs.map((leg) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-t border-line",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-3 py-2 font-mono text-fg",
												children: leg.contract
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-3 py-2 text-right font-mono",
												children: leg.qty
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-3 py-2 text-right font-mono",
												children: leg.mid == null ? "—" : formatNum(leg.mid, 2)
											})
										]
									}, `${leg.contract}-${leg.qty}`)) })]
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-faint",
							children: "One combo, multiplier 100. Debit is the marked premium. A negative debit is a credit. Vega and gamma can disagree on a fly or a risk reversal, so read both. The payoff is at expiry, marked from today's mids. There is no listed-option history on this feed."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Payoff, {
							legs: optionBook.legs,
							spot: chain?.spot ?? null
						})
					] }) : chain && !chain.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "This structure is not on the listed strikes."
					}) : null
				]
			}) : null,
			optionMode || volStyle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SurfacePanel, { symbol }) : null,
			legCorr ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Correlation"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heatmap, {
							file: "leg-correlation",
							columns: legCorr.full.names,
							rows: legCorr.full.names.map((name, index) => ({
								label: name,
								cells: legCorr.full.values[index]
							})),
							scale: "diverge",
							format: (value) => value.toFixed(2)
						})
					}),
					legCorr.short ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-4 text-xs font-medium text-muted",
						children: "Last 63 sessions"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heatmap, {
							columns: legCorr.short.names,
							rows: legCorr.short.names.map((name, index) => ({
								label: name,
								cells: legCorr.short?.values[index] ?? []
							})),
							scale: "diverge",
							format: (value) => value.toFixed(2)
						})
					})] }) : null
				]
			}) : null,
			volWalk ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalkView, {
				report: volWalk,
				ready,
				note: "Each quarter picks the tenor and variance premium with the best in-sample Sharpe, then opens a new book on the next quarter. The training position is not carried in. Flat or unfinished windows are skipped."
			}) : null,
			walk ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalkView, {
				report: walk,
				ready
			}) : null,
			!walk && !volWalk && singleBars && (strategy === "fade" || strategy === "trend" || strategy === "breakout" || strategy === "rsi" || strategy === "momentum" || volStyle != null) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-xs text-faint",
				children: "Walk-forward needs a longer history. Use 2y or 5y."
			}) : null
		]
	});
}
function WalkView({ report, ready, note }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium",
				children: "Walk-forward"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-faint",
				children: note ?? "Each block picks the rule with the best Sharpe on the prior year, including a rule that stays long or short. A rule that was flat is ignored. That rule is then run on the next quarter, and the curve stitches those out-of-sample days."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stats, { items: [
				["OOS return", `${report.oosReturn.toFixed(2)}%`],
				["OOS Sharpe", report.oosSharpe == null ? "—" : report.oosSharpe.toFixed(2)],
				["OOS max DD", report.oosMaxDd == null ? "—" : `${report.oosMaxDd.toFixed(2)}%`],
				["Folds", String(report.folds.length)]
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableExport, {
				file: "walk-forward",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 overflow-x-auto rounded-md border border-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-surface text-xs text-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-medium",
									children: "Test"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-medium",
									children: "Rule"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right font-medium",
									children: "Train Sharpe"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right font-medium",
									children: "OOS"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: report.folds.map((fold) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-line",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-2 font-mono text-xs text-fg",
									children: [
										fold.start,
										" – ",
										fold.end
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2",
									children: fold.rule
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-right font-mono",
									children: fold.isSharpe == null ? "—" : fold.isSharpe.toFixed(2)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-2 text-right font-mono",
									children: [fold.oosReturn.toFixed(2), "%"]
								})
							]
						}, `${fold.start}-${fold.rule}`)) })]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Curve, {
				ready,
				data: report.equity
			})
		]
	});
}
function LegEditor({ legs, residual, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SymbolSearch, {
			scope: "any",
			placeholder: "Add a leg",
			onPick: (hit) => {
				if (legs.some((leg) => leg.symbol === hit.symbol) || legs.length >= 6) return;
				onChange([...legs, {
					symbol: hit.symbol,
					name: hit.name,
					qty: residual ? "1" : "1"
				}]);
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableExport, {
			file: "legs",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 overflow-x-auto rounded-md border border-line",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-surface text-xs text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: residual ? "Y then X" : "Symbol"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "Shares"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: legs.map((leg, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-line",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-fg",
									children: leg.symbol
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 text-xs text-faint",
									children: residual ? index === 0 ? "Y" : index === 1 ? "X" : "" : leg.name
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2",
								children: residual ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-faint",
									children: "OLS"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: leg.qty,
									onChange: (event) => onChange(legs.map((row, i) => i === index ? {
										...row,
										qty: event.target.value
									} : row)),
									className: "min-h-11 w-24 rounded-md border border-line bg-surface px-2 font-mono text-fg"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "min-h-11 text-sm text-muted",
									disabled: legs.length <= 2,
									onClick: () => onChange(legs.filter((row) => row.symbol !== leg.symbol)),
									children: "Remove"
								})
							})
						]
					}, leg.symbol)) })]
				})
			})
		})]
	});
}
function Num({ label, value, onChange, step = 1 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block text-xs text-muted",
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "number",
			value,
			step,
			onChange: (event) => onChange(Number(event.target.value)),
			className: "mt-1 min-h-11 w-full rounded-md border border-line bg-surface px-3 font-mono text-sm text-fg"
		})]
	});
}
function Stats({ items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4",
		children: items.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-md border border-line px-3 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 break-all font-mono text-lg text-fg",
				children: value
			})]
		}, label))
	});
}
function Block({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-sm text-fg",
			children: title
		}), children]
	});
}
function Curve({ ready, data }) {
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-4 h-64 rounded-md bg-bg-elev" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4 h-64",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
				data,
				margin: {
					top: 8,
					right: 8,
					left: 0,
					bottom: 0
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						stroke: "var(--color-line)",
						vertical: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "d",
						minTickGap: 48,
						tick: {
							fill: "var(--color-faint)",
							fontSize: 11
						},
						axisLine: false,
						tickLine: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						tick: {
							fill: "var(--color-faint)",
							fontSize: 11
						},
						axisLine: false,
						tickLine: false,
						width: 48,
						domain: ["auto", "auto"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: ({ active, payload, label }) => active && payload?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-md border border-line bg-bg-elev px-3 py-2 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-muted",
							children: label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono",
							children: formatNum(Number(payload[0].value), 2)
						})]
					}) : null }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
						dataKey: "v",
						stroke: "var(--color-accent)",
						dot: false,
						strokeWidth: 1.7,
						isAnimationActive: false
					})
				]
			})
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CsvRecords, {
		file: "equity-curve",
		rows: data,
		columns: ["d", "v"]
	})] });
}
function VolView({ report, ready }) {
	const gap = report.avgIv != null && report.avgRv != null ? (report.avgRv - report.avgIv) * 100 : null;
	const marks = report.rolls.map((roll) => ({
		d: roll.exit,
		iv: roll.iv * 100,
		rv: roll.rv == null ? null : roll.rv * 100
	}));
	const recent = [...report.rolls].slice(-8).reverse();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stats, { items: [
				["Return", `${report.ret.toFixed(2)}%`],
				["Sharpe", report.sharpe == null ? "—" : report.sharpe.toFixed(2)],
				["Max DD", report.maxDrawdown == null ? "—" : `${report.maxDrawdown.toFixed(2)}%`],
				["Rolls", String(report.trades)],
				["Win rate", report.winRate == null ? "—" : `${report.winRate.toFixed(0)}%`],
				["Avg IV", report.avgIv == null ? "—" : `${(report.avgIv * 100).toFixed(1)}%`],
				["Avg realized", report.avgRv == null ? "—" : `${(report.avgRv * 100).toFixed(1)}%`],
				["Realized − IV", gap == null ? "—" : gap.toFixed(1)]
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-faint",
				children: ["Return is on spot notional, compounded from daily marks. Realized − IV is in volatility points over completed rolls.", report.open ? " One roll is still open and marked on the model." : ""]
			}),
			ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 h-64",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
						data: report.equity,
						margin: {
							top: 8,
							right: 8,
							left: 0,
							bottom: 0
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								stroke: "var(--color-line)",
								vertical: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "d",
								minTickGap: 48,
								tick: {
									fill: "var(--color-faint)",
									fontSize: 11
								},
								axisLine: false,
								tickLine: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								tick: {
									fill: "var(--color-faint)",
									fontSize: 11
								},
								axisLine: false,
								tickLine: false,
								width: 48,
								domain: ["auto", "auto"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: ({ active, payload, label }) => active && payload?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md border border-line bg-bg-elev px-3 py-2 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-muted",
									children: label
								}), payload.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-mono text-fg",
									children: [
										item.name,
										" ",
										formatNum(Number(item.value), 2)
									]
								}, String(item.dataKey)))]
							}) : null }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								dataKey: "v",
								name: "Book",
								stroke: "var(--color-accent)",
								dot: false,
								strokeWidth: 1.7,
								isAnimationActive: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								dataKey: "hold",
								name: "Spot",
								stroke: "var(--color-muted)",
								dot: false,
								strokeWidth: 1.4,
								isAnimationActive: false
							})
						]
					})
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-4 h-64 rounded-md bg-bg-elev" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CsvRecords, {
				file: "vol-book",
				rows: report.equity
			}),
			marks.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-sm font-medium",
					children: "Entry vol versus what realized"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-faint",
					children: "Each point is one completed roll. Realized is the annualized log-return deviation over the holding window."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 h-64",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
							data: marks,
							margin: {
								top: 8,
								right: 8,
								left: 0,
								bottom: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "var(--color-line)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "d",
									minTickGap: 48,
									tick: {
										fill: "var(--color-faint)",
										fontSize: 11
									},
									axisLine: false,
									tickLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tick: {
										fill: "var(--color-faint)",
										fontSize: 11
									},
									axisLine: false,
									tickLine: false,
									width: 40,
									unit: "%"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: ({ active, payload, label }) => active && payload?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-md border border-line bg-bg-elev px-3 py-2 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-muted",
										children: label
									}), payload.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "font-mono text-fg",
										children: [
											item.name,
											" ",
											Number(item.value).toFixed(1),
											"%"
										]
									}, String(item.dataKey)))]
								}) : null }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									dataKey: "iv",
									name: "Entry IV",
									stroke: "var(--color-accent)",
									dot: false,
									strokeWidth: 1.7,
									isAnimationActive: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									dataKey: "rv",
									name: "Realized",
									stroke: "var(--color-muted)",
									dot: false,
									strokeWidth: 1.4,
									connectNulls: true,
									isAnimationActive: false
								})
							]
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CsvRecords, {
					file: "vol-rolls",
					rows: marks
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableExport, {
					file: "vol-roll-table",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 overflow-x-auto rounded-md border border-line",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-left text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "bg-surface text-xs text-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 font-medium",
										children: "Roll"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 text-right font-medium",
										children: "IV"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 text-right font-medium",
										children: "Realized"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 text-right font-medium",
										children: "P&L"
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: recent.map((roll) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-line",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-3 py-2 font-mono text-xs text-fg",
										children: [
											roll.entry,
											" – ",
											roll.exit
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-3 py-2 text-right font-mono",
										children: [(roll.iv * 100).toFixed(1), "%"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 text-right font-mono",
										children: roll.rv == null ? "—" : `${(roll.rv * 100).toFixed(1)}%`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-3 py-2 text-right font-mono",
										children: [roll.pnl.toFixed(2), "%"]
									})
								]
							}, `${roll.entry}-${roll.exit}`)) })]
						})
					})
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-faint",
				children: "No completed roll in this window yet."
			})
		]
	});
}
function Payoff({ legs, spot }) {
	if (spot == null || !(spot > 0) || legs.some((leg) => leg.mid == null)) return null;
	const data = Array.from({ length: 25 }, (_, index) => {
		const price = spot * (.7 + .6 * index / 24);
		return {
			price,
			pnl: legs.reduce((total, leg) => {
				const intrinsic = leg.type === "call" ? Math.max(price - leg.strike, 0) : Math.max(leg.strike - price, 0);
				return total + leg.qty * 100 * (intrinsic - leg.mid);
			}, 0)
		};
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium",
				children: "Expiry payoff"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-faint",
				children: "Profit at expiration versus spot, from 70% to 130% of the spot used to build the book. Premium is today's mid."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 h-64",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
						data,
						margin: {
							top: 8,
							right: 8,
							left: 0,
							bottom: 0
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								stroke: "var(--color-line)",
								vertical: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "price",
								tick: {
									fill: "var(--color-faint)",
									fontSize: 11
								},
								axisLine: false,
								tickLine: false,
								tickFormatter: (value) => formatNum(Number(value), 0)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								tick: {
									fill: "var(--color-faint)",
									fontSize: 11
								},
								axisLine: false,
								tickLine: false,
								width: 56
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
								y: 0,
								stroke: "var(--color-line)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: ({ active, payload }) => active && payload?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md border border-line bg-bg-elev px-3 py-2 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-muted",
									children: ["Spot ", formatNum(Number(payload[0].payload.price), 2)]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-fg",
									children: formatNum(Number(payload[0].value), 2)
								})]
							}) : null }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								dataKey: "pnl",
								stroke: "var(--color-accent)",
								dot: false,
								strokeWidth: 1.7,
								isAnimationActive: false
							})
						]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CsvRecords, {
				file: "expiry-payoff",
				rows: data,
				columns: ["price", "pnl"]
			})
		]
	});
}
function SignalView({ label, ret, sharpe, dd, equity, ready }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
		title: label,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stats, { items: [
			["Return", `${ret.toFixed(2)}%`],
			["Sharpe", sharpe == null ? "—" : sharpe.toFixed(2)],
			["Max DD", dd == null ? "—" : `${dd.toFixed(2)}%`]
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Curve, {
			ready,
			data: equity
		})]
	});
}
function perfStats(perf) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stats, { items: [
		["Return", `${perf.totalReturn.toFixed(2)}%`],
		["Sharpe", perf.sharpe == null ? "—" : perf.sharpe.toFixed(2)],
		["Max DD", perf.maxDrawdown == null ? "—" : `${perf.maxDrawdown.toFixed(2)}%`],
		["Turns", String(perf.turns)]
	] });
}
function Single({ strategy, report, ready }) {
	if (strategy === "stationarity") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stats, { items: [
		["ADF level", report.adfLevel ? report.adfLevel.tStat.toFixed(2) : "—"],
		["ADF return", report.adfReturn ? report.adfReturn.tStat.toFixed(2) : "—"],
		["Half-life", report.halfLife?.halfLife == null ? "—" : report.halfLife.halfLife.toFixed(1)],
		["Hurst", report.hurst == null ? "—" : report.hurst.toFixed(2)],
		["VR 10", report.vr.find((row) => row.q === 10)?.value.toFixed(2) ?? "—"],
		["Latest z", report.latestZ == null ? "—" : report.latestZ.toFixed(2)]
	] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Research, { report })] });
	const backtest = report.backtest;
	if (!backtest) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-4 text-sm text-muted",
		children: "Not enough bars"
	});
	const key = strategy === "fade" ? "fade" : strategy === "trend" ? "trend" : "channel";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		strategy === "fade" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-fg",
			children: report.stance
		}) : null,
		strategy === "breakout" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-fg",
			children: report.channelState
		}) : null,
		perfStats(backtest[key]),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-4 text-xs text-muted",
			children: "Hold"
		}),
		perfStats(backtest.hold),
		ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 h-64",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
				width: "100%",
				height: "100%",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
					data: backtest.equity,
					margin: {
						top: 8,
						right: 8,
						left: 0,
						bottom: 0
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
							stroke: "var(--color-line)",
							vertical: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
							dataKey: "d",
							minTickGap: 48,
							tick: {
								fill: "var(--color-faint)",
								fontSize: 11
							},
							axisLine: false,
							tickLine: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
							tick: {
								fill: "var(--color-faint)",
								fontSize: 11
							},
							axisLine: false,
							tickLine: false,
							width: 48,
							domain: ["auto", "auto"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							dataKey: key,
							name: "Strategy",
							stroke: "var(--color-accent)",
							dot: false,
							strokeWidth: 1.7,
							isAnimationActive: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							dataKey: "hold",
							name: "Hold",
							stroke: "var(--color-muted)",
							dot: false,
							strokeWidth: 1.4,
							isAnimationActive: false
						})
					]
				})
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-4 h-64 rounded-md bg-bg-elev" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CsvRecords, {
			file: "strategy-equity",
			rows: backtest.equity
		}),
		strategy === "fade" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Research, { report }) : null
	] });
}
function Research({ report }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium",
				children: "Read"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 space-y-2",
				children: report.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: line
				}, line))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 text-xs font-medium text-muted",
				children: "Five-session forward return by z bucket"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heatmap, {
					file: "z-buckets",
					columns: report.buckets.map((row) => row.label),
					rows: [{
						label: "Mean %",
						cells: report.buckets.map((row) => row.n ? row.mean : null)
					}, {
						label: "Median",
						cells: report.buckets.map((row) => row.n ? row.median : null)
					}],
					scale: "diverge",
					format: (value) => value.toFixed(2)
				})
			}),
			report.sensitivity.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableExport, {
				file: "fade-sensitivity",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 overflow-x-auto rounded-md border border-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-surface text-xs text-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-medium",
									children: "Fade entry"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right font-medium",
									children: "Sharpe"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right font-medium",
									children: "Return"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: report.sensitivity.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-line",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 font-mono",
									children: row.entry.toFixed(1)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-right font-mono",
									children: row.sharpe == null ? "—" : row.sharpe.toFixed(2)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-2 text-right font-mono",
									children: [row.total.toFixed(2), "%"]
								})
							]
						}, row.entry)) })]
					})
				})
			}) : null
		]
	});
}
var SplitComponent = function LabRoute() {
	const { symbol } = Route$6.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LabPage, {
		initial: Route$6.useLoaderData(),
		focus: symbol
	});
};
//#endregion
export { SplitComponent as component };
