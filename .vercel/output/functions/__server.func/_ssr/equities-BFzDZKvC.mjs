import { o as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { C as equityBook, E as homeBench, N as optionBook, r as EQUITY_MARKETS, w as equitySearchScope, z as rollingBeta } from "./universe-B-8f2Y6c.mjs";
import { p as CsvRecords, s as Route$8 } from "./router-C6cpCEFu.mjs";
import { d as useOptionsQuery, f as usePrintQuery, m as useSeriesQuery, r as useBoardQuery, s as useFilingsQuery, t as mergePrints } from "./queries-BjZCBJay.mjs";
import { a as RangePick, i as QuoteHead, o as Split, r as MonthHeat, s as Tape, t as Choice } from "./frame-D35s7vbo.mjs";
import { a as Line, i as XAxis, l as ResponsiveContainer, n as LineChart, o as CartesianGrid, r as YAxis, s as ReferenceLine, u as Tooltip } from "../_libs/recharts+[...].mjs";
import { n as PriceChart, t as CrossPanel } from "./price-chart-CmzrpTjl.mjs";
import { t as SymbolSearch } from "./symbol-search-Ca4zHxbE.mjs";
import { n as SurfacePanel, t as OptionBoard } from "./surface-panel-RTcQeCl9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/equities-BFzDZKvC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BetaLine({ data, against }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setReady(true), []);
	if (data.length < 2) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium",
				children: "Rolling beta"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-faint",
				children: [
					"63-session beta versus ",
					against,
					". One means it moved with that index. Each point uses closes only through that day."
				]
			}),
			ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
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
								domain: ["auto", "auto"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
								y: 1,
								stroke: "var(--color-line)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: ({ active, payload, label }) => active && payload?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md border border-line bg-bg-elev px-3 py-2 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-muted",
									children: label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-fg",
									children: Number(payload[0].value).toFixed(2)
								})]
							}) : null }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								dataKey: "beta",
								name: "Beta",
								stroke: "var(--color-accent)",
								dot: false,
								strokeWidth: 1.7,
								isAnimationActive: false
							})
						]
					})
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 h-64 rounded-md bg-bg-elev" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CsvRecords, {
				file: "rolling-beta",
				rows: data,
				columns: ["d", "beta"]
			})
		]
	});
}
var KINDS = [
	{
		id: "stock",
		label: "Stocks"
	},
	{
		id: "etf",
		label: "ETFs"
	},
	{
		id: "option",
		label: "Options"
	}
];
function place(symbol) {
	for (const market of EQUITY_MARKETS) for (const kind of ["stock", "etf"]) {
		const hit = equityBook(market.id, kind).find((row) => row.symbol === symbol);
		if (hit) return {
			market: market.id,
			kind,
			name: hit.name
		};
	}
	return null;
}
function EquitiesPage({ initial, focus }) {
	const located = focus ? place(focus) : null;
	const [market, setMarket] = (0, import_react.useState)(located?.market ?? "global");
	const [kind, setKind] = (0, import_react.useState)(located?.kind ?? "stock");
	const [symbol, setSymbol] = (0, import_react.useState)(focus || "^GSPC");
	const [alias, setAlias] = (0, import_react.useState)(located?.name ?? (focus ? focus : "S&P 500"));
	const [range, setRange] = (0, import_react.useState)("1y");
	const [expiry, setExpiry] = (0, import_react.useState)("");
	const book = kind === "option" ? optionBook(market) : equityBook(market, kind);
	const symbols = book.map((row) => row.symbol);
	const boardQ = useBoardQuery(symbols, market === "global" && kind === "stock" ? initial : void 0);
	const printsQ = usePrintQuery(symbols);
	const quotes = mergePrints(boardQ.data?.quotes ?? [], printsQ.data?.prints);
	const bySymbol = new Map(quotes.map((quote) => [quote.symbol, quote]));
	const seriesQ = useSeriesQuery(symbol, range);
	const home = homeBench(symbol);
	const benchQ = useSeriesQuery(home.symbol, range);
	const historyQ = useSeriesQuery(symbol, "2y");
	const optionsQ = useOptionsQuery(symbol, expiry, kind === "option");
	(0, import_react.useEffect)(() => {
		setExpiry("");
	}, [symbol]);
	(0, import_react.useEffect)(() => {
		if (!focus) return;
		const hit = place(focus);
		setSymbol(focus);
		setAlias(hit?.name ?? focus);
		if (hit) {
			setMarket(hit.market);
			setKind(hit.kind);
		}
	}, [focus]);
	function onMarket(next) {
		setMarket(next);
		if (kind === "option") {
			if (symbol.startsWith("^")) {
				setSymbol("SPY");
				setAlias("SPDR S&P 500");
			}
			return;
		}
		const first = equityBook(next, kind)[0];
		if (!first) return;
		setSymbol(first.symbol);
		setAlias(first.name);
	}
	function onKind(next) {
		setKind(next);
		if (next === "option") {
			if (symbol.startsWith("^")) {
				setSymbol("SPY");
				setAlias("SPDR S&P 500");
			}
			return;
		}
		const first = equityBook(market, next)[0];
		if (!first) return;
		setSymbol(first.symbol);
		setAlias(first.name);
	}
	const beta = (0, import_react.useMemo)(() => {
		if (symbol === home.symbol || symbol.startsWith("^") || !seriesQ.data?.ok || !benchQ.data?.ok) return [];
		return rollingBeta(seriesQ.data.series.bars, benchQ.data.series.bars, 63);
	}, [
		symbol,
		home.symbol,
		seriesQ.data,
		benchQ.data
	]);
	const quote = bySymbol.get(symbol);
	const filingName = book.find((row) => row.symbol === symbol);
	const showFilings = market === "us" && filingName?.kind === "stock";
	const filingsQ = useFilingsQuery(symbol, showFilings);
	const live = quote?.price ?? (seriesQ.data?.ok ? seriesQ.data.series.price : null);
	const change = quote?.changePct ?? (seriesQ.data?.ok ? seriesQ.data.series.changePct : null);
	const name = alias || book.find((row) => row.symbol === symbol)?.name || (seriesQ.data?.ok ? seriesQ.data.series.name : symbol);
	const chain = optionsQ.data;
	const shownExpiry = expiry || chain?.expiry || "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Split, {
		title: "Equities",
		symbol,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
					label: "Market",
					value: market,
					options: EQUITY_MARKETS,
					onChange: onMarket
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
					label: "Instrument",
					value: kind,
					options: KINDS,
					onChange: onKind
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 max-w-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SymbolSearch, {
					scope: equitySearchScope(market),
					placeholder: market === "global" ? "Search a listing" : "Search this market",
					onPick: (hit) => {
						setSymbol(hit.symbol);
						setAlias(hit.name);
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteHead, {
				name,
				symbol,
				price: live,
				change,
				checkedAt: printsQ.data?.fetchedAt,
				fetching: printsQ.isFetching,
				failed: printsQ.isError
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RangePick, {
					value: range,
					onChange: setRange
				})
			}),
			kind === "option" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionBoard, {
				loading: optionsQ.isPending || optionsQ.isFetching,
				error: optionsQ.isError ? "Option chain did not load" : chain?.error,
				rate: chain?.rate ?? null,
				dividend: chain?.dividendYield ?? null,
				expiries: chain?.expiries ?? [],
				expiry: shownExpiry,
				onExpiry: setExpiry,
				rows: chain?.rows ?? []
			}) : null,
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BetaLine, {
				data: beta,
				against: home.vs
			}),
			seriesQ.data?.ok && benchQ.data && !symbol.startsWith("^") && symbol !== home.symbol && beta.length < 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-faint",
				children: [
					"No rolling beta. ",
					home.vs.charAt(0).toUpperCase() + home.vs.slice(1),
					" did not return enough history to line up with this name."
				]
			}) : null,
			seriesQ.data?.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthHeat, {
				bars: seriesQ.data.series.bars,
				history: historyQ.data?.ok ? historyQ.data.series.bars.map((bar) => bar.c) : null
			}) : null,
			showFilings ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Filings, {
				filings: filingsQ.data,
				loading: filingsQ.isPending
			}) : null,
			kind === "option" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SurfacePanel, { symbol }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tape, {
				active: symbol,
				onPick: (next, label) => {
					setSymbol(next);
					setAlias(label);
				},
				rows: book.map((row) => {
					const print = bySymbol.get(row.symbol);
					return {
						symbol: row.symbol,
						name: row.name,
						price: print?.price ?? null,
						changePct: print?.changePct ?? null,
						note: row.kind === "index" ? "Index" : row.kind === "etf" ? "ETF" : void 0
					};
				})
			}),
			boardQ.data?.errors?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-down",
				children: [boardQ.data.errors.map((row) => row.symbol).join(", "), " did not print"]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrossPanel, {
				title: "Return correlation",
				symbols: book.filter((row) => row.kind !== "index").slice(0, 6).map((row) => row.symbol)
			})
		]
	});
}
function Filings({ filings, loading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xs font-medium text-accent",
				children: "Filings"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-faint",
				children: "Latest 10-K, 10-Q, and 8-K on EDGAR. Insider Forms 4 are left out. Not a ratio."
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "Loading filings"
			}) : null,
			!loading && filings?.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-down",
				children: filings.error
			}) : null,
			!loading && filings && !filings.error && !filings.filings.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "No 10-K, 10-Q, or 8-K in the recent list."
			}) : null,
			filings?.filings.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 divide-y divide-line rounded-md border border-line",
				children: filings.filings.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-baseline justify-between gap-2 px-3 py-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: row.url,
						target: "_blank",
						rel: "noreferrer",
						className: "font-medium text-fg",
						children: row.form
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-xs text-muted",
						children: row.filed
					})]
				}, row.url))
			}) : null
		]
	});
}
var SplitComponent = function EquitiesRoute() {
	const { symbol } = Route$8.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EquitiesPage, {
		initial: Route$8.useLoaderData(),
		focus: symbol
	});
};
//#endregion
export { SplitComponent as component };
