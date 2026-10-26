import { o as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { i as FX_PAIRS } from "./universe-B-8f2Y6c.mjs";
import { g as formatNum, o as Route$7 } from "./router-O2oiJSQ5.mjs";
import { n as CsvRecords } from "./download-CGNcFT4o.mjs";
import { a as useEcbHistoryQuery, f as usePrintQuery, m as useSeriesQuery, p as useReferenceQuery, r as useBoardQuery, t as mergePrints } from "./queries-CWEEDy6U.mjs";
import { a as RangePick, i as QuoteHead, o as Split, r as MonthHeat, s as Tape } from "./frame-N6gf4c5H.mjs";
import { a as Line, i as XAxis, l as ResponsiveContainer, n as LineChart, o as CartesianGrid, r as YAxis, u as Tooltip } from "../_libs/recharts+[...].mjs";
import { n as PriceChart, t as CrossPanel } from "./price-chart-BZPWZOQi.mjs";
import { t as SymbolSearch } from "./symbol-search-DvgXaeB3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fx-KyLTy2U7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var GROUPS = [
	{
		id: "g10",
		label: "G10"
	},
	{
		id: "asia",
		label: "Asia"
	},
	{
		id: "cross",
		label: "Crosses"
	}
];
function perUsd(code, ref) {
	const row = ref?.rates.find((rate) => rate.code === code);
	return row && row.perUsd > 0 ? row.perUsd : null;
}
function ecbQuote(symbol, ref) {
	const pair = FX_PAIRS.find((row) => row.symbol === symbol);
	if (pair?.ecbCode) {
		const raw = perUsd(pair.ecbCode, ref);
		if (raw == null) return null;
		return pair.ecb === "invert" ? 1 / raw : raw;
	}
	if (symbol === "EURJPY=X") {
		const jpy = perUsd("JPY", ref);
		const eur = perUsd("EUR", ref);
		return jpy != null && eur != null ? jpy / eur : null;
	}
	if (symbol === "GBPJPY=X") {
		const jpy = perUsd("JPY", ref);
		const gbp = perUsd("GBP", ref);
		return jpy != null && gbp != null ? jpy / gbp : null;
	}
	return null;
}
function FxPage({ initial, reference }) {
	const [symbol, setSymbol] = (0, import_react.useState)("EURUSD=X");
	const [alias, setAlias] = (0, import_react.useState)("EUR/USD");
	const [range, setRange] = (0, import_react.useState)("1y");
	const book = FX_PAIRS;
	const symbols = FX_PAIRS.map((row) => row.symbol);
	const boardQ = useBoardQuery(symbols, initial);
	const printsQ = usePrintQuery(symbols);
	const refQ = useReferenceQuery(reference);
	const ecb = ecbQuote(symbol, refQ.data);
	const histQ = useEcbHistoryQuery(symbol, ecb != null);
	const quotes = mergePrints(boardQ.data?.quotes ?? [], printsQ.data?.prints);
	const bySymbol = new Map(quotes.map((quote) => [quote.symbol, quote]));
	const seriesQ = useSeriesQuery(symbol, range);
	const quote = bySymbol.get(symbol);
	const meta = FX_PAIRS.find((row) => row.symbol === symbol);
	const overlay = (0, import_react.useMemo)(() => {
		const points = histQ.data?.points;
		if (!seriesQ.data?.ok || !points?.length) return [];
		const byDate = new Map(points.map((point) => [point.d, point.rate]));
		return seriesQ.data.series.bars.filter((bar) => byDate.has(bar.d)).map((bar) => ({
			d: bar.d,
			yahoo: bar.c,
			ecb: byDate.get(bar.d) ?? null
		}));
	}, [seriesQ.data, histQ.data]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Split, {
		title: "FX",
		symbol,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 max-w-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SymbolSearch, {
					scope: "fx",
					placeholder: "Search a currency pair",
					onPick: (hit) => {
						setSymbol(hit.symbol);
						setAlias(hit.name);
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteHead, {
				name: alias,
				symbol,
				price: quote?.price ?? (seriesQ.data?.ok ? seriesQ.data.series.price : null),
				change: quote?.changePct ?? (seriesQ.data?.ok ? seriesQ.data.series.changePct : null),
				digits: meta?.digits ?? 4,
				checkedAt: printsQ.data?.fetchedAt,
				fetching: printsQ.isFetching,
				failed: printsQ.isError
			}),
			ecb != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 font-mono text-xs text-muted",
				children: [
					"ECB ",
					formatNum(ecb, meta?.digits ?? 4),
					refQ.data?.date ? ` · ${refQ.data.date}` : ""
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RangePick, {
					value: range,
					onChange: setRange
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: seriesQ.data?.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceChart, {
					bars: seriesQ.data.series.bars,
					file: symbol
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: seriesQ.isPending ? "Loading" : "No bars"
				})
			}),
			seriesQ.data?.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthHeat, { bars: seriesQ.data.series.bars }) : null,
			overlay.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EcbChart, {
				rows: overlay,
				digits: meta?.digits ?? 4
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-6 text-xs text-faint",
				children: [
					"Tape notes are the ECB reference",
					refQ.data?.date ? ` for ${refQ.data.date}` : "",
					", not the live Yahoo quote. A cross is shown only when both legs have a reference rate."
				]
			}),
			GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-6 text-xs font-medium text-accent",
				children: group.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tape, {
				active: symbol,
				onPick: (next, label) => {
					setSymbol(next);
					setAlias(label);
				},
				rows: book.filter((row) => row.group === group.id).map((row) => ({
					symbol: row.symbol,
					name: row.name,
					price: bySymbol.get(row.symbol)?.price ?? null,
					changePct: bySymbol.get(row.symbol)?.changePct ?? null,
					digits: row.digits,
					note: tapeNote(row, refQ.data)
				}))
			})] }, group.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrossPanel, {
				title: "G10 correlation",
				symbols: FX_PAIRS.filter((row) => row.group === "g10").slice(0, 6).map((row) => row.symbol)
			})
		]
	});
}
function tapeNote(row, ref) {
	const value = ecbQuote(row.symbol, ref);
	if (value == null) return void 0;
	return `ECB ${formatNum(value, row.digits)}`;
}
function EcbChart({ rows, digits }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setReady(true), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xs font-medium text-accent",
				children: "Yahoo close and ECB reference"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-faint",
				children: "Same quote convention as the chart above. The ECB line is the daily fix, not a tradable price."
			}),
			ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 h-64 w-full min-w-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
						data: rows,
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
								minTickGap: 40,
								tick: {
									fill: "var(--color-faint)",
									fontSize: 11
								},
								axisLine: false,
								tickLine: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								domain: ["auto", "auto"],
								tick: {
									fill: "var(--color-faint)",
									fontSize: 11
								},
								axisLine: false,
								tickLine: false,
								width: 56
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: ({ active, payload, label }) => active && payload?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md border border-line bg-bg px-3 py-2 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-muted",
									children: label
								}), payload.map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "tabular-nums",
									children: [
										point.name,
										": ",
										point.value == null ? "—" : formatNum(Number(point.value), digits)
									]
								}, String(point.name)))]
							}) : null }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								dataKey: "yahoo",
								name: "Yahoo",
								stroke: "var(--color-accent)",
								dot: false,
								strokeWidth: 1.6,
								isAnimationActive: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								dataKey: "ecb",
								name: "ECB",
								stroke: "var(--color-muted)",
								dot: false,
								strokeWidth: 1.4,
								isAnimationActive: false,
								connectNulls: true
							})
						]
					})
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 h-64 rounded-md bg-surface" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CsvRecords, {
				file: "ecb-history",
				rows,
				columns: [
					"d",
					"yahoo",
					"ecb"
				]
			})
		]
	});
}
var SplitComponent = function FxRoute() {
	const data = Route$7.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FxPage, {
		initial: data.board,
		reference: data.reference
	});
};
//#endregion
export { SplitComponent as component };
