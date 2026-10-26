import { o as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as WB_DEFAULT, g as WB_COUNTRIES, s as MACRO_PRINTS } from "./universe-B-8f2Y6c.mjs";
import { _ as TableExport, b as formatPx, d as Change, g as LivePrice, h as LiveMark, i as Route$4, m as FeedErrors, p as CsvRecords, y as formatNum } from "./router-C6cpCEFu.mjs";
import { c as useMacroQuery, f as usePrintQuery, g as useWorldBankQuery, t as mergePrints } from "./queries-BjZCBJay.mjs";
import { a as Line, i as XAxis, l as ResponsiveContainer, n as LineChart, o as CartesianGrid, r as YAxis, u as Tooltip } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/macro-9wFboz83.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STROKES = [
	"var(--color-accent)",
	"var(--color-fg)",
	"var(--color-up)",
	"var(--color-down)",
	"var(--color-muted)",
	"var(--color-faint)"
];
var MAX_COUNTRIES = 6;
function MacroPage({ initial }) {
	const query = useMacroQuery(initial);
	const printsQ = usePrintQuery(MACRO_PRINTS.map((row) => row.symbol));
	const data = query.data ?? initial;
	const market = mergePrints(data.market, printsQ.data?.prints);
	const bySymbol = new Map(market.map((quote) => [quote.symbol, quote]));
	const printFailed = Boolean(printsQ.isError || printsQ.data && printsQ.data.prints.length === 0 && printsQ.data.errors.length > 0);
	const [picked, setPicked] = (0, import_react.useState)(() => initial.wbCountries?.length ? [...initial.wbCountries] : [...WB_DEFAULT]);
	const [wbId, setWbId] = (0, import_react.useState)("FP.CPI.TOTL.ZG");
	const pickedKey = picked.join("|");
	const macroCountries = data.wbCountries?.length ? data.wbCountries : [...WB_DEFAULT];
	const fromMacro = macroCountries.join("|") === pickedKey ? {
		countries: macroCountries,
		updated: data.wbUpdated,
		series: data.wb
	} : void 0;
	const wbQ = useWorldBankQuery(picked, fromMacro);
	const bundle = wbQ.data && wbQ.data.countries.join("|") === pickedKey ? wbQ.data : fromMacro ?? null;
	const selected = bundle?.series.find((row) => row.id === wbId) ?? bundle?.series[0];
	const labels = new Map(WB_COUNTRIES.map((row) => [row.id, row.label]));
	function toggle(id) {
		setPicked((current) => {
			if (current.includes(id)) {
				if (current.length === 1) return current;
				return current.filter((item) => item !== id);
			}
			if (current.length >= MAX_COUNTRIES) return current;
			return [...current, id];
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-4 py-6 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl leading-tight",
				children: "Macro"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveMark, {
				checkedAt: printsQ.data?.fetchedAt,
				fetching: printsQ.isFetching,
				failed: printFailed
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium text-muted",
						children: "Market prints"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4",
						children: MACRO_PRINTS.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
							label: row.label,
							name: row.name,
							quote: bySymbol.get(row.symbol),
							digits: row.digits
						}, row.symbol))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedErrors, { rows: [...data.marketErrors, ...printsQ.data?.errors ?? []] })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium text-muted",
						children: "World Bank"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-1",
						role: "group",
						"aria-label": "Countries",
						children: WB_COUNTRIES.map((country) => {
							const on = picked.includes(country.id);
							const locked = on && picked.length === 1 || !on && picked.length >= MAX_COUNTRIES;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": on,
								disabled: locked,
								onClick: () => toggle(country.id),
								className: "min-h-11 rounded-md px-3 text-sm " + (on ? "bg-accent text-accent-ink" : "border border-line text-muted") + (locked && !on ? " opacity-40" : ""),
								children: country.label
							}, country.id);
						})
					}),
					!bundle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted",
						children: wbQ.isError ? wbQ.error instanceof Error ? wbQ.error.message : "World Bank request failed" : "Loading"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableExport, {
						file: "world-bank",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 overflow-x-auto rounded-md border border-line",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full min-w-[36rem] text-left text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "bg-surface text-xs text-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-3 font-medium",
										children: "Indicator"
									}), bundle.countries.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "whitespace-nowrap px-3 py-3 font-medium",
										children: labels.get(id) ?? id
									}, id))] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: bundle.series.map((row) => {
									const active = selected?.id === row.id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: active ? "bg-surface" : "border-t border-line",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => setWbId(row.id),
												className: "text-left",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block font-medium",
													children: row.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-xs text-faint",
													children: [row.unit, row.error ? ` · ${row.error}` : ""]
												})]
											})
										}), bundle.countries.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "whitespace-nowrap px-3 py-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block tabular-nums",
												children: cell(row.latest[id]?.value, row.digits)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block text-xs text-faint",
												children: row.latest[id]?.year ?? "—"
											})]
										}, id))]
									}, row.id);
								}) })]
							})
						})
					}), selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-md border border-line bg-bg-elev p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "text-sm font-medium",
								children: [selected.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 text-xs font-normal text-faint",
									children: selected.unit
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted",
								children: bundle.countries.map((id, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "inline-block h-1.5 w-3 rounded-sm",
										style: { background: STROKES[index] ?? STROKES[0] }
									}), labels.get(id) ?? id]
								}, id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WbChart, {
								series: selected,
								countries: bundle.countries,
								labels
							})
						]
					}) : null] })
				]
			})
		]
	});
}
function cell(value, digits) {
	if (value == null || !Number.isFinite(value)) return "—";
	return formatNum(value, digits);
}
function Mini({ label, name, quote, digits }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-line bg-bg-elev px-3 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-faint",
				children: name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-xl font-medium tabular-nums",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LivePrice, {
					price: quote?.price,
					children: quote ? formatPx(quote.price, quote.currency, digits) : "—"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Change, { value: quote?.changePct ?? null })
		]
	});
}
function ChartFrame({ children }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setReady(true), []);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 h-64 rounded-md bg-surface" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-3 h-64 w-full min-w-0",
		children
	});
}
function WbChart({ series, countries, labels }) {
	const rows = series.points.filter((point) => countries.some((id) => point.values[id] != null)).map((point) => {
		const row = { d: point.year };
		for (const id of countries) row[id] = point.values[id] ?? null;
		return row;
	});
	if (rows.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-3 text-sm text-muted",
		children: "No plottable history."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartFrame, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
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
					minTickGap: 28,
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
					width: 56,
					domain: ["auto", "auto"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: ({ active, payload, label }) => active && payload?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-line bg-bg px-3 py-2 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-muted",
						children: label
					}), payload.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "tabular-nums",
						children: [
							labels.get(String(item.dataKey)) ?? item.name,
							": ",
							item.value == null ? "—" : formatNum(Number(item.value), series.digits)
						]
					}, String(item.dataKey)))]
				}) : null }),
				countries.map((id, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
					dataKey: id,
					name: labels.get(id) ?? id,
					stroke: STROKES[index] ?? STROKES[0],
					dot: false,
					strokeWidth: 1.6,
					isAnimationActive: false,
					connectNulls: false
				}, id))
			]
		})
	}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CsvRecords, {
		file: `wb-${series.id}`,
		rows
	})] });
}
var SplitComponent = function MacroRoute() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MacroPage, { initial: Route$4.useLoaderData() });
};
//#endregion
export { SplitComponent as component };
