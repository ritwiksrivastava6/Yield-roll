import { o as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { Y as suggestWeights, k as mixPortfolio, l as PORTFOLIO_SEED } from "./universe-B-8f2Y6c.mjs";
import { g as formatNum, r as Route$3, u as useCurrentUserState } from "./router-O2oiJSQ5.mjs";
import { n as CsvRecords, r as TableExport } from "./download-CGNcFT4o.mjs";
import { n as useBasketQuery } from "./queries-CWEEDy6U.mjs";
import { n as Heatmap, o as Split } from "./frame-N6gf4c5H.mjs";
import { a as Line, i as XAxis, l as ResponsiveContainer, n as LineChart, o as CartesianGrid, r as YAxis, u as Tooltip } from "../_libs/recharts+[...].mjs";
import { t as SymbolSearch } from "./symbol-search-DvgXaeB3.mjs";
import { c as saveBook, r as getDesk } from "./api-DcS-2aLZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/portfolio-BsHzqqlA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var RANGES = [
	"6mo",
	"1y",
	"2y",
	"5y"
];
function equalWeights(symbols) {
	const value = (100 / symbols.length).toFixed(2);
	return Object.fromEntries(symbols.map((symbol) => [symbol, value]));
}
function PortfolioPage({ initial }) {
	const [symbols, setSymbols] = (0, import_react.useState)([...PORTFOLIO_SEED]);
	const [weights, setWeights] = (0, import_react.useState)(() => equalWeights([...PORTFOLIO_SEED]));
	const [range, setRange] = (0, import_react.useState)("1y");
	const [ready, setReady] = (0, import_react.useState)(false);
	const serverReady = (0, import_react.useRef)(false);
	const { user, isPending } = useCurrentUserState();
	const query = useBasketQuery(symbols, range, initial);
	(0, import_react.useEffect)(() => setReady(true), []);
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
			if (desk.symbols.length < 2) {
				saveBook({ data: {
					symbols,
					weights
				} }).catch(() => {});
				return;
			}
			setSymbols(desk.symbols);
			setWeights({
				...equalWeights(desk.symbols),
				...desk.weights
			});
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
		if (!ready || !user?.id || !serverReady.current || symbols.length < 2) return;
		const handle = window.setTimeout(() => {
			saveBook({ data: {
				symbols,
				weights
			} }).catch(() => {});
		}, 500);
		return () => window.clearTimeout(handle);
	}, [
		ready,
		user?.id,
		symbols,
		weights
	]);
	const loaded = (query.data?.results ?? []).filter((row) => row.ok);
	const sum = symbols.map((symbol) => Number(weights[symbol])).reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0);
	const aligned = loaded.filter((row) => symbols.includes(row.series.symbol));
	const weightVector = aligned.map((row) => Number(weights[row.series.symbol]) / 100);
	const weightOk = aligned.length >= 2 && weightVector.every((value) => value >= 0) && Math.abs(weightVector.reduce((a, b) => a + b, 0) - 1) < .005;
	const report = (0, import_react.useMemo)(() => {
		if (!weightOk) return null;
		return mixPortfolio(aligned.map((row) => ({
			symbol: row.series.symbol,
			bars: row.series.bars
		})), weightVector);
	}, [
		query.data,
		weights,
		symbols,
		weightOk
	]);
	function replaceSymbols(next) {
		setSymbols(next);
		setWeights(equalWeights(next));
	}
	function apply(method) {
		const suggested = suggestWeights(aligned.map((row) => ({
			symbol: row.series.symbol,
			bars: row.series.bars
		})), method);
		if (!suggested) return;
		setWeights(Object.fromEntries(suggested.map((row) => [row.symbol, (row.weight * 100).toFixed(2)])));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Split, {
		title: "Portfolio",
		symbol: symbols[0] ?? "SPY",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: RANGES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": range === item,
					onClick: () => setRange(item),
					className: "min-h-11 rounded-md px-3 text-sm " + (range === item ? "bg-accent text-accent-ink" : "border border-line text-muted"),
					children: item
				}, item))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 max-w-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SymbolSearch, {
					scope: "any",
					placeholder: "Add a listing",
					onPick: (hit) => {
						if (symbols.includes(hit.symbol) || symbols.length >= 8) return;
						replaceSymbols([...symbols, hit.symbol]);
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableExport, {
				file: "portfolio",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 overflow-x-auto rounded-md border border-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-surface text-xs text-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-medium",
									children: "Symbol"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-medium",
									children: "Weight %"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-3 py-2 font-medium" })
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: symbols.map((symbol) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-line",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 font-mono text-fg",
									children: symbol
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: weights[symbol] ?? "",
										onChange: (event) => setWeights((prev) => ({
											...prev,
											[symbol]: event.target.value
										})),
										inputMode: "decimal",
										className: "min-h-11 w-24 rounded-md border border-line bg-surface px-2 font-mono text-fg"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-right",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "min-h-11 text-sm text-muted",
										onClick: () => replaceSymbols(symbols.filter((item) => item !== symbol)),
										disabled: symbols.length <= 2,
										children: "Remove"
									})
								})
							]
						}, symbol)) })]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-2",
				children: [[
					["equal", "Equal"],
					["invvol", "Inverse vol"],
					["invvar", "Inverse variance"],
					["minvar", "Min variance"],
					["sharpe", "Max Sharpe"],
					["risk", "Risk parity"]
				].map(([method, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-md border border-line px-3 text-sm",
					onClick: () => apply(method),
					children: label
				}, method)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono text-sm text-muted",
					children: ["Sum ", sum.toFixed(2)]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-faint",
				children: "Constructors use this sample only. Long-only. Sharpe uses a zero rate."
			}),
			!weightOk ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-faint",
				children: "Weights need to sum to 100 before the curve is drawn."
			}) : null,
			query.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "Loading"
			}) : null,
			(query.data?.results ?? []).filter((row) => !row.ok).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-down",
				children: [
					row.symbol,
					": ",
					row.message
				]
			}, row.symbol)),
			report ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Return",
							value: `${report.totalReturn.toFixed(2)}%`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Vol",
							value: report.vol == null ? "—" : `${report.vol.toFixed(2)}%`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Max DD",
							value: report.maxDrawdown == null ? "—" : `${report.maxDrawdown.toFixed(2)}%`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Sharpe",
							value: report.sharpe == null ? "—" : report.sharpe.toFixed(2)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs text-faint",
					children: [
						"Constant mix on daily closes, ",
						report.start,
						" to ",
						report.end,
						". Sharpe uses a zero rate."
					]
				}),
				ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 h-64",
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
									minTickGap: 40,
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
									name: "Book",
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
					file: "portfolio-equity",
					rows: report.equity
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-sm font-medium",
					children: "Correlation"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-faint",
					children: "Pearson correlation of daily returns over the same window as the book."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heatmap, {
						file: "portfolio-correlation",
						columns: report.names,
						rows: report.names.map((name, index) => ({
							label: name,
							cells: report.corr[index].map((value) => Number.isFinite(value) ? value : null)
						})),
						scale: "diverge",
						format: (value) => value.toFixed(2)
					})
				})
			] }) : null
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-line px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 font-mono text-lg text-fg",
			children: value
		})]
	});
}
var SplitComponent = function PortfolioRoute() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortfolioPage, { initial: Route$3.useLoaderData() });
};
//#endregion
export { SplitComponent as component };
