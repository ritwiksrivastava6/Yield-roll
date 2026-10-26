import { o as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { D as listingDigits, d as RATES_MARKETS, f as RATES_OPTIONABLE, p as RATE_IMPLIED, u as RATES_BOOKS } from "./universe-B-8f2Y6c.mjs";
import { n as Route$2, y as formatNum } from "./router-C6cpCEFu.mjs";
import { d as useOptionsQuery, f as usePrintQuery, m as useSeriesQuery, r as useBoardQuery, t as mergePrints, u as useOfficialRatesQuery } from "./queries-BjZCBJay.mjs";
import { a as RangePick, i as QuoteHead, o as Split, r as MonthHeat, s as Tape, t as Choice } from "./frame-D35s7vbo.mjs";
import { n as PriceChart, t as CrossPanel } from "./price-chart-CmzrpTjl.mjs";
import { t as SymbolSearch } from "./symbol-search-Ca4zHxbE.mjs";
import { n as SurfacePanel, t as OptionBoard } from "./surface-panel-RTcQeCl9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rates-BfPIuwcS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RatesPage({ initial, official }) {
	const [market, setMarket] = (0, import_react.useState)("global");
	const [symbol, setSymbol] = (0, import_react.useState)("^TNX");
	const [alias, setAlias] = (0, import_react.useState)("US 10-year");
	const [range, setRange] = (0, import_react.useState)("1y");
	const book = RATES_BOOKS[market];
	const symbols = book.map((row) => row.symbol);
	const boardQ = useBoardQuery(symbols, market === "global" ? initial : void 0);
	const printsQ = usePrintQuery(symbols);
	const quotes = mergePrints(boardQ.data?.quotes ?? [], printsQ.data?.prints);
	const bySymbol = new Map(quotes.map((quote) => [quote.symbol, quote]));
	const seriesQ = useSeriesQuery(symbol, range);
	const optionable = RATES_OPTIONABLE.has(symbol);
	const [expiry, setExpiry] = (0, import_react.useState)("");
	const optionsQ = useOptionsQuery(symbol, expiry, optionable);
	const fixes = useOfficialRatesQuery(official).data ?? official;
	const quote = bySymbol.get(symbol);
	const digits = listingDigits(symbol);
	const price = quote?.price ?? (seriesQ.data?.ok ? seriesQ.data.series.price : null);
	const implied = RATE_IMPLIED.has(symbol) && price != null && price > 80 && price < 100 ? 100 - price : null;
	const chain = optionsQ.data;
	const sections = [
		{
			label: "Yields",
			rows: book.filter((row) => row.kind === "yield"),
			note: "Yield index"
		},
		{
			label: "Bond futures",
			rows: book.filter((row) => row.kind === "future" && !RATE_IMPLIED.has(row.symbol)),
			note: "Future"
		},
		{
			label: "IR futures",
			rows: book.filter((row) => RATE_IMPLIED.has(row.symbol)),
			note: "100 − price"
		},
		{
			label: "Bonds and credit",
			rows: book.filter((row) => row.kind === "fund"),
			note: "Fund price"
		}
	].filter((section) => section.rows.length > 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Split, {
		title: "Rates",
		symbol,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 max-w-xs",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
					label: "Market",
					value: market,
					options: RATES_MARKETS,
					onChange: (next) => {
						setMarket(next);
						const first = RATES_BOOKS[next][0];
						if (first) {
							setSymbol(first.symbol);
							setAlias(first.name);
						}
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 max-w-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SymbolSearch, {
					scope: "rates",
					placeholder: "Search a bond, future, or yield",
					onPick: (hit) => {
						setSymbol(hit.symbol);
						setAlias(hit.name);
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteHead, {
				name: alias || symbol,
				symbol,
				price,
				change: quote?.changePct ?? (seriesQ.data?.ok ? seriesQ.data.series.changePct : null),
				digits,
				checkedAt: printsQ.data?.fetchedAt,
				fetching: printsQ.isFetching,
				failed: printsQ.isError
			}),
			implied != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 font-mono text-xs text-accent",
				children: [
					"Implied ",
					formatNum(implied, 3),
					" · 100 − price"
				]
			}) : null,
			market === "global" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfficialStrip, { data: fixes }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-faint",
				children: market === "global" ? "The row above is the Treasury par curve and the New York Fed overnight prints. OTC swaps and CDS are still not on a keyless feed. Futures below are listed contracts. Credit rows are bond-fund prices." : "OTC swap fixings and CDS are not on a keyless feed. Credit rows are bond-fund prices."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RangePick, {
					value: range,
					onChange: setRange
				})
			}),
			optionable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionBoard, {
				loading: optionsQ.isPending,
				error: optionsQ.isError ? "Option chain did not load" : chain?.error,
				rate: chain?.rate ?? null,
				dividend: chain?.dividendYield ?? null,
				expiries: chain?.expiries ?? [],
				expiry: expiry || chain?.expiry || "",
				onExpiry: setExpiry,
				rows: chain?.rows ?? []
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-faint",
				children: "No Yahoo equity-style chain on this contract. Chains load for the Treasury and credit ETFs."
			}),
			optionable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SurfacePanel, { symbol }) : null,
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
			sections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-6 text-xs font-medium text-accent",
				children: section.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tape, {
				active: symbol,
				onPick: (next, label) => {
					setSymbol(next);
					setAlias(label);
					setExpiry("");
				},
				rows: section.rows.map((row) => ({
					symbol: row.symbol,
					name: row.name,
					price: bySymbol.get(row.symbol)?.price ?? null,
					changePct: bySymbol.get(row.symbol)?.changePct ?? null,
					note: section.note,
					digits: row.digits
				}))
			})] }, section.label)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrossPanel, {
				title: "Correlation of daily changes",
				symbols: book.filter((row) => row.kind === "yield" || row.symbol === "TLT" || row.symbol === "HYG" || row.symbol === "SR3=F").slice(0, 6).map((row) => row.symbol)
			})
		]
	});
}
function OfficialStrip({ data }) {
	const cells = [
		...data.curve.map((row) => ({
			label: row.label,
			value: row.yield,
			hint: data.date ? `Par yield ${data.date}` : "Treasury par yield"
		})),
		{
			label: "SOFR",
			value: data.sofr?.rate ?? null,
			hint: data.sofr ? `NY Fed ${data.sofr.date}` : "NY Fed"
		},
		{
			label: "EFFR",
			value: data.effr?.rate ?? null,
			hint: data.effr ? `NY Fed ${data.effr.date}` : "NY Fed"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xs font-medium text-accent",
				children: "Official fixes"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-faint",
				children: "Not the Yahoo yield index on the chart. SOFR and EFFR are overnight prints, not swap rates."
			}),
			data.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-down",
				children: data.error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid grid-cols-2 gap-3 lg:grid-cols-6",
				children: cells.map((cell) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-line bg-surface px-3 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted",
							children: cell.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-xl font-medium tabular-nums",
							children: cell.value == null ? "—" : `${formatNum(cell.value, 2)}%`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-xs text-faint",
							children: cell.hint
						})
					]
				}, cell.label))
			})
		]
	});
}
var SplitComponent = function RatesRoute() {
	const data = Route$2.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RatesPage, {
		initial: data.board,
		official: data.official
	});
};
//#endregion
export { SplitComponent as component };
