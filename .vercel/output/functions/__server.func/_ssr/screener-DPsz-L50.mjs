import { o as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { I as regionNames, L as regionNews, S as countryNames, U as screenStats, W as screenerChunks, m as REGIONS, t as COUNTRY_OPTIONS, x as countryMeta } from "./universe-B-8f2Y6c.mjs";
import { u as useCurrentUserState } from "./router-O2oiJSQ5.mjs";
import { r as TableExport } from "./download-CGNcFT4o.mjs";
import { n as useBasketQuery } from "./queries-CWEEDy6U.mjs";
import { n as Heatmap, o as Split, t as Choice } from "./frame-N6gf4c5H.mjs";
import { i as listAlerts, l as saveScreen, n as dropAlert, o as noteScreen, r as getDesk, t as armAlert } from "./api-DcS-2aLZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/screener-DPsz-L50.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KEY = "fathom-screener-v1";
var PRESETS = [
	{
		id: "momentum",
		group: "Price",
		label: "Momentum",
		rule: "12–1 return is positive and the close is above the 50-session average."
	},
	{
		id: "breakout",
		group: "Price",
		label: "Nearing breakout",
		rule: "Within 2% of the prior 20-session high, with RSI between 45 and 70."
	},
	{
		id: "low52",
		group: "Price",
		label: "Near 52-week low",
		rule: "In the bottom quarter of the 52-week range, and not a 200-session breakdown."
	},
	{
		id: "washout",
		group: "Price",
		label: "Washout",
		rule: "RSI under 30, or a 60-session price z-score at or below −2."
	},
	{
		id: "quiet",
		group: "Volatility",
		label: "Quiet",
		rule: "21-day realized vol at or below the median of this book."
	},
	{
		id: "dispersion",
		group: "Volatility",
		label: "Dispersion",
		rule: "Residual vol versus the home index in the top quarter of this book."
	},
	{
		id: "custom",
		group: "Yours",
		label: "Custom",
		rule: "Your RSI band, distance from the 52-week high, and realized-vol band."
	}
];
var HORIZONS = [
	{
		id: "5",
		label: "5 sessions"
	},
	{
		id: "21",
		label: "1 month"
	},
	{
		id: "63",
		label: "3 months"
	},
	{
		id: "mom",
		label: "12–1"
	}
];
var SORTS = [
	{
		id: "horizon",
		label: "Horizon return"
	},
	{
		id: "beta",
		label: "Beta"
	},
	{
		id: "idio",
		label: "Residual vol"
	},
	{
		id: "rsi",
		label: "RSI"
	},
	{
		id: "rv",
		label: "Realized vol"
	},
	{
		id: "volp",
		label: "Vol percentile"
	},
	{
		id: "low52",
		label: "52-week location"
	}
];
function horizonOf(row, horizon) {
	if (horizon === "5") return row.ret5;
	if (horizon === "21") return row.ret21;
	if (horizon === "63") return row.ret63;
	return row.mom;
}
function sortValue(row, sort, horizon) {
	if (sort === "horizon") return horizonOf(row, horizon);
	if (sort === "beta") return row.beta;
	if (sort === "idio") return row.idio;
	if (sort === "rsi") return row.rsi;
	if (sort === "rv") return row.rv21;
	if (sort === "volp") return row.volPct;
	return row.range52;
}
function pct(value, digits = 1) {
	return value == null ? "—" : `${(value * 100).toFixed(digits)}%`;
}
function num(value, digits = 2) {
	return value == null ? "—" : value.toFixed(digits);
}
function median(values) {
	if (!values.length) return null;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
function cutoff(values, p) {
	if (!values.length) return null;
	const sorted = [...values].sort((a, b) => a - b);
	return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1))];
}
function bound(raw) {
	if (raw.trim() === "") return null;
	const value = Number(raw);
	return Number.isFinite(value) ? value : null;
}
function ScreenerPage() {
	const [mode, setMode] = (0, import_react.useState)("region");
	const [region, setRegion] = (0, import_react.useState)("us");
	const [country, setCountry] = (0, import_react.useState)("gb");
	const [preset, setPreset] = (0, import_react.useState)("momentum");
	const [horizon, setHorizon] = (0, import_react.useState)("mom");
	const [sort, setSort] = (0, import_react.useState)("horizon");
	const [minRet, setMinRet] = (0, import_react.useState)("");
	const [maxRet, setMaxRet] = (0, import_react.useState)("");
	const [rsiMin, setRsiMin] = (0, import_react.useState)("");
	const [rsiMax, setRsiMax] = (0, import_react.useState)("");
	const [offHigh, setOffHigh] = (0, import_react.useState)("");
	const [rvMin, setRvMin] = (0, import_react.useState)("");
	const [rvMax, setRvMax] = (0, import_react.useState)("");
	const [ready, setReady] = (0, import_react.useState)(false);
	const [live, setLive] = (0, import_react.useState)(false);
	const [screenAlert, setScreenAlert] = (0, import_react.useState)(null);
	const [screenHits, setScreenHits] = (0, import_react.useState)([]);
	const serverReady = (0, import_react.useRef)(false);
	const { user, isPending } = useCurrentUserState();
	const names = mode === "country" ? countryNames(country) : regionNames(region);
	const meta = countryMeta(country);
	const news = mode === "country" ? meta.news : regionNews(region);
	const chunks = screenerChunks(names);
	const q0 = useBasketQuery(chunks[0] ?? [], "2y");
	const q1 = useBasketQuery(chunks[1] ?? [], "2y");
	const q2 = useBasketQuery(chunks[2] ?? [], "2y");
	const q3 = useBasketQuery(chunks[3] ?? [], "2y");
	const q4 = useBasketQuery(chunks[4] ?? [], "2y");
	const q5 = useBasketQuery(chunks[5] ?? [], "2y");
	const q6 = useBasketQuery(chunks[6] ?? [], "2y");
	const q7 = useBasketQuery(chunks[7] ?? [], "2y");
	const queries = [
		q0,
		q1,
		q2,
		q3,
		q4,
		q5,
		q6,
		q7
	];
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(KEY);
			if (raw) {
				const saved = JSON.parse(raw);
				if (saved.mode === "country" || saved.mode === "region") setMode(saved.mode);
				if (saved.region === "g10") setRegion("emea");
				else if (saved.region === "us" || saved.region === "emea" || saved.region === "apac") setRegion(saved.region);
				if (saved.country && COUNTRY_OPTIONS.some((row) => row.id === saved.country)) setCountry(saved.country);
				if (saved.preset && PRESETS.some((row) => row.id === saved.preset)) setPreset(saved.preset);
				if (saved.horizon && HORIZONS.some((row) => row.id === saved.horizon)) setHorizon(saved.horizon);
				if (saved.sort && SORTS.some((row) => row.id === saved.sort)) setSort(saved.sort);
				if (typeof saved.minRet === "string") setMinRet(saved.minRet);
				if (typeof saved.maxRet === "string") setMaxRet(saved.maxRet);
				if (typeof saved.rsiMin === "string") setRsiMin(saved.rsiMin);
				if (typeof saved.rsiMax === "string") setRsiMax(saved.rsiMax);
				if (typeof saved.offHigh === "string") setOffHigh(saved.offHigh);
				if (typeof saved.rvMin === "string") setRvMin(saved.rvMin);
				if (typeof saved.rvMax === "string") setRvMax(saved.rvMax);
			}
		} catch {}
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		setLive(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		try {
			localStorage.setItem(KEY, JSON.stringify({
				mode,
				region,
				country,
				preset,
				horizon,
				sort,
				minRet,
				maxRet,
				rsiMin,
				rsiMax,
				offHigh,
				rvMin,
				rvMax
			}));
		} catch {}
	}, [
		ready,
		mode,
		region,
		country,
		preset,
		horizon,
		sort,
		minRet,
		maxRet,
		rsiMin,
		rsiMax,
		offHigh,
		rvMin,
		rvMax
	]);
	(0, import_react.useEffect)(() => {
		if (!ready || isPending) return;
		if (!user?.id) {
			serverReady.current = true;
			return;
		}
		let cancel = false;
		serverReady.current = false;
		getDesk().then((desk) => {
			if (cancel) return;
			const saved = desk.screen;
			if (saved.mode === "country" || saved.mode === "region") setMode(saved.mode);
			if (saved.region === "us" || saved.region === "emea" || saved.region === "apac") setRegion(saved.region);
			if (saved.country && COUNTRY_OPTIONS.some((row) => row.id === saved.country)) setCountry(saved.country);
			if (saved.preset && PRESETS.some((row) => row.id === saved.preset)) setPreset(saved.preset);
			if (saved.horizon && HORIZONS.some((row) => row.id === saved.horizon)) setHorizon(saved.horizon);
			if (saved.sort && SORTS.some((row) => row.id === saved.sort)) setSort(saved.sort);
			if (typeof saved.minRet === "string") setMinRet(saved.minRet);
			if (typeof saved.maxRet === "string") setMaxRet(saved.maxRet);
			if (typeof saved.rsiMin === "string") setRsiMin(saved.rsiMin);
			if (typeof saved.rsiMax === "string") setRsiMax(saved.rsiMax);
			if (typeof saved.offHigh === "string") setOffHigh(saved.offHigh);
			if (typeof saved.rvMin === "string") setRvMin(saved.rvMin);
			if (typeof saved.rvMax === "string") setRvMax(saved.rvMax);
		}).catch(() => {}).finally(() => {
			if (!cancel) serverReady.current = true;
		});
		return () => {
			cancel = true;
		};
	}, [
		ready,
		isPending,
		user?.id
	]);
	(0, import_react.useEffect)(() => {
		if (!ready || !user?.id || !serverReady.current) return;
		const handle = window.setTimeout(() => {
			saveScreen({ data: {
				mode,
				region,
				country,
				preset,
				horizon,
				sort,
				minRet,
				maxRet,
				rsiMin,
				rsiMax,
				offHigh,
				rvMin,
				rvMax
			} }).catch(() => {});
		}, 500);
		return () => window.clearTimeout(handle);
	}, [
		ready,
		user?.id,
		mode,
		region,
		country,
		preset,
		horizon,
		sort,
		minRet,
		maxRet,
		rsiMin,
		rsiMax,
		offHigh,
		rvMin,
		rvMax
	]);
	(0, import_react.useEffect)(() => {
		if (!user?.id) {
			setScreenAlert(null);
			return;
		}
		let cancel = false;
		listAlerts().then((rows) => {
			if (cancel) return;
			const hit = rows.find((row) => row.kind === "screen");
			setScreenAlert(hit ? hit.id : null);
		}).catch(() => {});
		return () => {
			cancel = true;
		};
	}, [user?.id]);
	const loaded = (0, import_react.useMemo)(() => {
		const results = queries.flatMap((query) => query.data?.results ?? []);
		const bySymbol = new Map(results.filter((row) => row.ok).map((row) => [row.series.symbol, row]));
		const pending = chunks.some((symbols, index) => symbols.length >= 2 && !queries[index]?.data && (queries[index]?.isPending || queries[index]?.isFetching));
		const rows = [];
		let failed = 0;
		for (const name of names) {
			const row = bySymbol.get(name.symbol);
			const bench = bySymbol.get(name.bench);
			if (!row?.ok || !bench?.ok) {
				if (!pending) failed += 1;
				continue;
			}
			const stats = screenStats(name.symbol, name.name, row.series.bars, bench.series.bars);
			if (stats) rows.push({
				...stats,
				vs: name.vs
			});
			else if (!pending) failed += 1;
		}
		return {
			rows,
			failed,
			pending
		};
	}, [
		q0.data,
		q1.data,
		q2.data,
		q3.data,
		q4.data,
		q5.data,
		q6.data,
		q7.data,
		q0.isPending,
		q1.isPending,
		q2.isPending,
		q3.isPending,
		q4.isPending,
		q5.isPending,
		q6.isPending,
		q7.isPending,
		q0.isFetching,
		q1.isFetching,
		q2.isFetching,
		q3.isFetching,
		q4.isFetching,
		q5.isFetching,
		q6.isFetching,
		q7.isFetching,
		mode,
		region,
		country
	]);
	const rvCut = median(loaded.rows.map((row) => row.rv21).filter((value) => value != null));
	const idioCut = cutoff(loaded.rows.map((row) => row.idio).filter((value) => value != null), .75);
	function matches(row, id) {
		if (id === "momentum") return row.mom != null && row.mom > 0 && row.above50;
		if (id === "breakout") return row.distHigh20 != null && row.distHigh20 >= -.02 && row.distHigh20 <= .01 && row.rsi != null && row.rsi >= 45 && row.rsi <= 70;
		if (id === "low52") return row.range52 != null && row.range52 <= .25 && !(row.below200 && (row.ret63 ?? 0) < -.15);
		if (id === "washout") return row.rsi != null && row.rsi < 30 || row.z != null && row.z <= -2;
		if (id === "quiet") return rvCut != null && row.rv21 != null && row.rv21 <= rvCut;
		if (id === "dispersion") return idioCut != null && row.idio != null && row.idio >= idioCut;
		const rsiLo = bound(rsiMin);
		const rsiHi = bound(rsiMax);
		const high = bound(offHigh);
		const volLo = bound(rvMin);
		const volHi = bound(rvMax);
		if (rsiLo != null && (row.rsi == null || row.rsi < rsiLo)) return false;
		if (rsiHi != null && (row.rsi == null || row.rsi > rsiHi)) return false;
		if (high != null && (row.offHigh == null || row.offHigh * 100 > high)) return false;
		if (volLo != null && (row.rv21 == null || row.rv21 * 100 < volLo)) return false;
		if (volHi != null && (row.rv21 == null || row.rv21 * 100 > volHi)) return false;
		return true;
	}
	const counts = Object.fromEntries(PRESETS.map((item) => [item.id, loaded.rows.filter((row) => matches(row, item.id)).length]));
	const floor = bound(minRet);
	const cap = bound(maxRet);
	const shown = loaded.rows.filter((row) => matches(row, preset)).filter((row) => {
		const value = horizonOf(row, horizon);
		if (floor == null && cap == null) return true;
		if (value == null) return false;
		const pctValue = value * 100;
		if (floor != null && pctValue < floor) return false;
		if (cap != null && pctValue > cap) return false;
		return true;
	}).sort((left, right) => {
		const aValue = sortValue(left, sort, horizon);
		const bValue = sortValue(right, sort, horizon);
		if (aValue == null && bValue == null) return left.symbol.localeCompare(right.symbol);
		if (aValue == null) return 1;
		if (bValue == null) return -1;
		return sort === "rsi" || sort === "rv" || sort === "low52" ? aValue - bValue : bValue - aValue;
	});
	const hitKey = shown.map((row) => row.symbol).join(",");
	const scope = mode === "country" ? `c:${country}` : `r:${region}`;
	(0, import_react.useEffect)(() => {
		if (!live || !user?.id || screenAlert == null || loaded.pending) return;
		const symbols = hitKey ? hitKey.split(",") : [];
		const handle = window.setTimeout(() => {
			noteScreen({ data: {
				preset,
				scope,
				symbols
			} }).then((result) => {
				if (result.added.length) setScreenHits(result.added);
			}).catch(() => {});
		}, 800);
		return () => window.clearTimeout(handle);
	}, [
		live,
		user?.id,
		screenAlert,
		loaded.pending,
		preset,
		scope,
		hitKey
	]);
	const heat = [...loaded.rows].sort((left, right) => (right.ret21 ?? -99) - (left.ret21 ?? -99));
	const regionNote = REGIONS.find((item) => item.id === region)?.note ?? "";
	const note = mode === "country" ? country === "sa" ? "Saudi Arabia. Prices are in riyals. The Tadawul series is a single print, so beta and residual vol stay blank." : `${meta.label}. Beta is versus ${meta.vs}, in local currency.` : regionNote;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Split, {
		title: "Screener",
		symbol: news,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-1",
				role: "group",
				"aria-label": "Book",
				children: [REGIONS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": mode === "region" && region === item.id,
					onClick: () => {
						setMode("region");
						setRegion(item.id);
					},
					className: "min-h-11 rounded-md px-3 text-sm " + (mode === "region" && region === item.id ? "bg-accent text-accent-ink" : "border border-line text-muted"),
					children: item.label
				}, item.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": mode === "country",
					onClick: () => setMode("country"),
					className: "min-h-11 rounded-md px-3 text-sm " + (mode === "country" ? "bg-accent text-accent-ink" : "border border-line text-muted"),
					children: "Country"
				})]
			}),
			mode === "country" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 max-w-xs",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
					label: "Country",
					value: country,
					options: COUNTRY_OPTIONS,
					onChange: setCountry
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 max-w-2xl text-sm text-muted",
				children: [
					names.length,
					" names, two years of closes. ",
					note,
					" A row opens the chart or the strategy lab. This is price and volatility, not a fundamental screen."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-2xl text-xs text-faint",
				children: "EMEA is Europe, South Africa, and Saudi Arabia. APAC is Asia-Pacific. Country screens one market, and it is the only place Canada appears. Returns stay in local currency."
			}),
			[
				"Price",
				"Volatility",
				"Yours"
			].map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xs font-medium text-muted",
					children: group
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2",
					children: PRESETS.filter((item) => item.group === group).map((item) => {
						const active = preset === item.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-pressed": active,
							onClick: () => {
								setPreset(item.id);
								if (item.id === "momentum") {
									setHorizon("mom");
									setSort("horizon");
								} else if (item.id === "low52") setSort("low52");
								else if (item.id === "washout") setSort("rsi");
								else if (item.id === "quiet") setSort("rv");
								else if (item.id === "dispersion") setSort("idio");
								else setSort("horizon");
							},
							className: "rounded-md border px-3 py-3 text-left " + (active ? "border-accent bg-surface" : "border-line"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-baseline justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium text-fg",
									children: item.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-sm text-fg",
									children: loaded.rows.length ? counts[item.id] : "—"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block text-xs text-muted",
								children: item.rule
							})]
						}, item.id);
					})
				})]
			}, group)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
						label: "Horizon",
						value: horizon,
						options: HORIZONS,
						onChange: setHorizon
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Min return %",
						value: minRet,
						onChange: setMinRet
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Max return %",
						value: maxRet,
						onChange: setMaxRet
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
						label: "Sort",
						value: sort,
						options: SORTS,
						onChange: setSort
					})
				]
			}),
			preset === "custom" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-3 lg:grid-cols-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "RSI min",
						value: rsiMin,
						onChange: setRsiMin
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "RSI max",
						value: rsiMax,
						onChange: setRsiMax
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Max % off high",
						value: offHigh,
						onChange: setOffHigh
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "RV min %",
						value: rvMin,
						onChange: setRvMin
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "RV max %",
						value: rvMax,
						onChange: setRvMax
					})
				]
			}) : null,
			loaded.pending && !loaded.rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: "Loading the book"
			}) : null,
			loaded.failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-down",
				children: [loaded.failed, " names did not load"]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-faint",
					children: [
						shown.length,
						" of ",
						counts[preset] ?? 0,
						" on this screen pass the return band. Beta and residual vol use the last year of daily returns against the home index named under each ticker. Residual vol is what is left after that beta, annualized."
					]
				}), live && user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 shrink-0 rounded-md border border-line px-3 text-xs text-muted",
					onClick: () => {
						if (screenAlert != null) {
							dropAlert({ data: { id: screenAlert } }).then(() => {
								setScreenAlert(null);
								setScreenHits([]);
							}).catch(() => {});
							return;
						}
						armAlert({ data: {
							kind: "screen",
							symbol: "SCREEN",
							side: "above"
						} }).then(() => listAlerts()).then((rows) => {
							const hit = rows.find((row) => row.kind === "screen");
							setScreenAlert(hit ? hit.id : null);
						}).catch(() => {});
					},
					children: screenAlert != null ? "Screen ping on" : "Ping new names"
				}) : null]
			}),
			screenHits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-fg",
				children: [
					"New on this screen: ",
					screenHits.join(", "),
					". Also on the Vol page."
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableExport, {
				file: "screener",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 overflow-x-auto rounded-md border border-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-surface text-xs text-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-medium",
									children: "Name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right font-medium",
									children: "12–1"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right font-medium",
									children: "RSI"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right font-medium",
									children: "Beta"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right font-medium",
									children: "Idio"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right font-medium",
									children: "RV 21"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right font-medium",
									children: "Vol %ile"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-right font-medium",
									children: "52w"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-medium",
									children: "Open"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: shown.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-line",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/equities",
										search: { symbol: row.symbol },
										className: "block min-h-11 py-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-fg",
												children: row.symbol
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-0.5 block text-xs text-faint",
												children: row.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "block text-xs text-faint",
												children: ["vs ", row.vs.replace(/^the /, "")]
											})
										]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-right font-mono",
									children: pct(row.mom)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-right font-mono",
									children: num(row.rsi, 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-right font-mono",
									children: num(row.beta)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-right font-mono",
									children: pct(row.idio, 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-right font-mono",
									children: pct(row.rv21, 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-right font-mono",
									children: row.volPct == null ? "—" : row.volPct.toFixed(0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-right font-mono",
									children: row.range52 == null ? "—" : `${(row.range52 * 100).toFixed(0)}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/equities",
											search: { symbol: row.symbol },
											className: "inline-flex min-h-11 items-center text-sm text-accent",
											children: "Chart"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/lab",
											search: { symbol: row.symbol },
											className: "inline-flex min-h-11 items-center text-sm text-fg",
											children: "Lab"
										})]
									})
								})
							]
						}, row.symbol)) })]
					})
				})
			}),
			!loaded.pending && !shown.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "Nothing matches. Widen the band or pick another screen."
			}) : null,
			heat.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Book returns"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-faint",
						children: "Percent, local currency, sorted by the last month. The whole book, not only the screen."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heatmap, {
							file: "screener-returns",
							columns: [
								"1w",
								"1m",
								"3m",
								"12m"
							],
							rows: heat.map((row) => ({
								label: row.symbol,
								cells: [
									row.ret5,
									row.ret21,
									row.ret63,
									row.ret252
								].map((value) => value == null ? null : value * 100)
							})),
							scale: "diverge",
							format: (value) => value.toFixed(1)
						})
					})
				]
			}) : null
		]
	});
}
function Field({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block text-xs text-muted",
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			value,
			inputMode: "decimal",
			onChange: (event) => onChange(event.target.value),
			className: "mt-1 min-h-11 w-full rounded-md border border-line bg-surface px-3 font-mono text-sm text-fg"
		})]
	});
}
var SplitComponent = ScreenerPage;
//#endregion
export { SplitComponent as component };
