import { o as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { D as listingDigits, c as METALS, n as ENERGY } from "./universe-B-8f2Y6c.mjs";
import { _ as formatPx, c as Route$9, d as Change, g as formatNum } from "./router-O2oiJSQ5.mjs";
import { r as TableExport, t as CsvButton } from "./download-CGNcFT4o.mjs";
import { f as usePrintQuery, i as useCotQuery, m as useSeriesQuery, o as useEnergyQuery, r as useBoardQuery, t as mergePrints } from "./queries-CWEEDy6U.mjs";
import { a as RangePick, i as QuoteHead, o as Split, r as MonthHeat, s as Tape } from "./frame-N6gf4c5H.mjs";
import { a as Line, i as XAxis, l as ResponsiveContainer, n as LineChart, o as CartesianGrid, r as YAxis, u as Tooltip } from "../_libs/recharts+[...].mjs";
import { n as PriceChart, t as CrossPanel } from "./price-chart-BZPWZOQi.mjs";
import { t as SymbolSearch } from "./symbol-search-DvgXaeB3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/commodities-DMJ5Lh-k.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function EnergyPanel({ kind }) {
	const query = useEnergyQuery();
	if (query.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-6 text-sm text-muted",
		children: "Pulling EIA reports and Open-Meteo weather…"
	});
	if (query.isError || !query.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-6 text-sm text-down",
		children: "The physical feeds did not return."
	});
	return kind === "gas" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GasPhysical, { data: query.data }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrudePhysical, { data: query.data });
}
function GasPhysical({ data }) {
	const total = data.storage.regions.find((row) => row.name.startsWith("total"));
	const rows = data.history.filter((row) => row.hdd != null && row.ng != null).map((row) => ({
		d: row.d,
		hdd: row.hdd,
		ng: row.ng
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium text-muted",
				children: "Physical gas"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-faint",
				children: "EIA storage · Open-Meteo"
			}),
			data.storage.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-down",
				children: data.storage.error
			}) : null,
			total ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
						label: "Lower 48 storage",
						value: `${formatNum(total.latest, 0)} ${total.unit}`,
						hint: `Week of ${data.storage.week}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
						label: "Weekly change",
						value: signed(total.change, 0),
						hint: "EIA net change, Bcf"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
						label: "5-year average",
						value: total.avg5 == null ? "—" : formatNum(total.avg5, 0),
						hint: "Same week, EIA"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
						label: "Year ago",
						value: total.yearAgo == null ? "—" : formatNum(total.yearAgo, 0),
						hint: data.storage.release || "EIA release"
					})
				]
			}) : null,
			data.storage.regions.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableExport, {
				file: "gas-storage",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 overflow-x-auto rounded-md border border-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-surface text-xs text-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-3 font-medium",
									children: "Region"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-3 font-medium",
									children: "Stocks"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-3 font-medium",
									children: "Change"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-3 font-medium",
									children: "5-year"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-3 font-medium",
									children: "Year ago"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: data.storage.regions.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-line",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 capitalize",
									children: row.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 tabular-nums",
									children: formatNum(row.latest, 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 tabular-nums",
									children: signed(row.change, 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 tabular-nums",
									children: row.avg5 == null ? "—" : formatNum(row.avg5, 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 tabular-nums",
									children: row.yearAgo == null ? "—" : formatNum(row.yearAgo, 0)
								})
							]
						}, row.name)) })]
					})
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
						label: "HDD vs NG=F return",
						value: corr(data.gasCorr?.ret),
						hint: data.gasCorr ? `n = ${data.gasCorr.n} overlapping sessions` : "No overlap"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
						label: "HDD vs NG=F level",
						value: corr(data.gasCorr?.level),
						hint: "Pearson on the same dates. Not a causal claim."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
						label: "Gulf wind, latest",
						value: latestWind(data),
						hint: "km/h max, Erath. Dates after today are forecast."
					})
				]
			}),
			data.weatherError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-down",
				children: data.weatherError
			}) : null,
			data.derivedMeanDays > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-faint",
				children: [
					"On ",
					data.derivedMeanDays,
					" city-days Open-Meteo omitted the mean, so the average of that day’s high and low was used."
				]
			}) : null,
			rows.length > 5 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DualChart, {
				rows,
				left: "hdd",
				right: "ng",
				leftName: "HDD °F",
				rightName: "NG=F"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Forecast, { data }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Freight, { data })
		]
	});
}
function CrudePhysical({ data }) {
	const rows = data.history.filter((row) => row.wind != null && row.cl != null).map((row) => ({
		d: row.d,
		hdd: row.wind,
		ng: row.cl
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium text-muted",
				children: "Physical crude"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-faint",
				children: "EIA weekly stocks · Open-Meteo wind"
			}),
			data.petroleum.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-down",
				children: data.petroleum.error
			}) : null,
			data.petroleum.rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableExport, {
				file: "crude-stocks",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 overflow-x-auto rounded-md border border-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-surface text-xs text-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-3 font-medium",
									children: "Stock"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-3 font-medium",
									children: "Latest"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-3 font-medium",
									children: "Week change"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-3 font-medium",
									children: "Week ago"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-3 font-medium",
									children: "Year ago"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: data.petroleum.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-line",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3",
									children: row.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 tabular-nums",
									children: formatNum(row.latest, 1)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 tabular-nums",
									children: signed(row.change, 1)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 tabular-nums",
									children: row.weekAgo == null ? "—" : formatNum(row.weekAgo, 1)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 tabular-nums",
									children: row.yearAgo == null ? "—" : formatNum(row.yearAgo, 1)
								})
							]
						}, row.name)) })]
					})
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-faint",
				children: [
					"Week ending ",
					data.petroleum.week || "—",
					". Unit: ",
					data.petroleum.unit,
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
					label: "Wind vs CL=F return",
					value: corr(data.windCorr?.ret),
					hint: data.windCorr ? `n = ${data.windCorr.n} overlapping sessions` : "No overlap"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
					label: "Latest Gulf wind",
					value: latestWind(data),
					hint: "Open-Meteo, km/h. Forecast dates are marked below."
				})]
			}),
			data.weatherError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-down",
				children: data.weatherError
			}) : null,
			rows.length > 5 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DualChart, {
				rows,
				left: "hdd",
				right: "ng",
				leftName: "Wind km/h",
				rightName: "CL=F"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Forecast, {
				data,
				windOnly: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Freight, { data })
		]
	});
}
function Forecast({ data, windOnly }) {
	if (!data.forecast.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "text-sm font-medium",
				children: ["Open-Meteo, after ", data.today]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-faint",
				children: "Forecast weather only. No price is implied."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7",
				children: data.forecast.slice(0, 7).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-line bg-surface px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-faint",
						children: row.d.slice(5)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 text-sm tabular-nums",
						children: windOnly ? `${row.wind == null ? "—" : formatNum(row.wind, 0)} km/h` : `${row.hdd == null ? "—" : formatNum(row.hdd, 1)} HDD`
					})]
				}, row.d))
			})
		]
	});
}
function Freight({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-medium",
				children: "Listed shipping prices"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-faint",
				children: "ETF prices. Not a freight index."
			}),
			data.freight.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2",
				children: data.freight.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-line bg-surface px-3 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted",
							children: row.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 flex items-baseline gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xl font-medium tabular-nums",
								children: formatPx(row.price, "USD", 2)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Change, { value: row.changePct })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-faint",
							children: [
								row.symbol,
								" · ",
								row.asOfLabel
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: row.note
						})
					]
				}, row.symbol))
			}) : null
		]
	});
}
function Stat$1({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-line bg-surface px-3 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-lg font-medium tabular-nums",
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-xs text-faint",
				children: hint
			}) : null
		]
	});
}
function DualChart({ rows, left, right, leftName, rightName }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setReady(true), []);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-4 h-64 rounded-md bg-surface" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4 h-64 w-full min-w-0",
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
						minTickGap: 36,
						tick: {
							fill: "var(--color-faint)",
							fontSize: 11
						},
						axisLine: false,
						tickLine: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						yAxisId: "l",
						tick: {
							fill: "var(--color-faint)",
							fontSize: 11
						},
						axisLine: false,
						tickLine: false,
						width: 40
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						yAxisId: "r",
						orientation: "right",
						tick: {
							fill: "var(--color-faint)",
							fontSize: 11
						},
						axisLine: false,
						tickLine: false,
						width: 48
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: ({ active, payload, label }) => active && payload?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-md border border-line bg-bg-elev px-3 py-2 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-1 text-muted",
							children: label
						}), payload.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between gap-4 tabular-nums",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted",
								children: item.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatNum(Number(item.value), 2) })]
						}, String(item.name)))]
					}) : null }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
						yAxisId: "l",
						dataKey: left,
						name: leftName,
						stroke: "var(--color-accent)",
						dot: false,
						strokeWidth: 1.6,
						isAnimationActive: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
						yAxisId: "r",
						dataKey: right,
						name: rightName,
						stroke: "var(--color-muted)",
						dot: false,
						strokeWidth: 1.4,
						isAnimationActive: false
					})
				]
			})
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-2 flex justify-end",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CsvButton, {
			file: leftName.includes("HDD") ? "hdd-ng" : "wind-cl",
			columns: [
				"date",
				leftName,
				rightName
			],
			rows: rows.map((row) => [
				row.d,
				row.hdd,
				row.ng
			])
		})
	})] });
}
function signed(n, digits) {
	if (n == null || !Number.isFinite(n)) return "—";
	return `${n > 0 ? "+" : ""}${formatNum(n, digits)}`;
}
function corr(n) {
	if (n == null || !Number.isFinite(n)) return "—";
	return (Math.round(n * 100) / 100 === 0 ? 0 : n).toFixed(2);
}
function latestWind(data) {
	const past = [...data.history].reverse().find((row) => row.wind != null);
	if (!past || past.wind == null) return "—";
	return `${formatNum(past.wind, 0)} km/h`;
}
function energyKind(symbol) {
	if (symbol === "NG=F" || symbol === "UNG") return "gas";
	if (symbol === "CL=F" || symbol === "BZ=F" || symbol === "HO=F" || symbol === "RB=F" || symbol === "USO") return "crude";
	return null;
}
function CommoditiesPage({ initial }) {
	const [symbol, setSymbol] = (0, import_react.useState)("GC=F");
	const [alias, setAlias] = (0, import_react.useState)("Gold");
	const [range, setRange] = (0, import_react.useState)("1y");
	const symbols = [...METALS, ...ENERGY].map((row) => row.symbol);
	const boardQ = useBoardQuery(symbols, initial);
	const printsQ = usePrintQuery(symbols);
	const quotes = mergePrints(boardQ.data?.quotes ?? [], printsQ.data?.prints);
	const bySymbol = new Map(quotes.map((quote) => [quote.symbol, quote]));
	const seriesQ = useSeriesQuery(symbol, range);
	const cotQ = useCotQuery();
	const quote = bySymbol.get(symbol);
	const physical = energyKind(symbol);
	const pick = (next, label) => {
		setSymbol(next);
		setAlias(label);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Split, {
		title: "Commodities",
		symbol,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 max-w-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SymbolSearch, {
					scope: "commodity",
					placeholder: "Search a metal or energy contract",
					onPick: (hit) => pick(hit.symbol, hit.name)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteHead, {
				name: alias,
				symbol,
				price: quote?.price ?? (seriesQ.data?.ok ? seriesQ.data.series.price : null),
				change: quote?.changePct ?? (seriesQ.data?.ok ? seriesQ.data.series.changePct : null),
				digits: listingDigits(symbol),
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CotPanel, {
				row: cotQ.data?.rows.find((item) => item.symbol === symbol),
				loading: cotQ.isPending,
				error: cotQ.data?.error,
				active: symbol
			}),
			physical ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnergyPanel, { kind: physical }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Metals",
				rows: METALS,
				active: symbol,
				onPick: pick,
				bySymbol
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Energy",
				rows: ENERGY,
				active: symbol,
				onPick: pick,
				bySymbol
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrossPanel, {
				title: "Return correlation",
				symbols: [
					"GC=F",
					"SI=F",
					"HG=F",
					"CL=F",
					"NG=F",
					"BZ=F"
				]
			})
		]
	});
}
function Section({ title, rows, active, onPick, bySymbol }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "mt-6 text-xs font-medium text-accent",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tape, {
		active,
		onPick,
		rows: rows.map((row) => ({
			symbol: row.symbol,
			name: row.name,
			price: bySymbol.get(row.symbol)?.price ?? null,
			changePct: bySymbol.get(row.symbol)?.changePct ?? null,
			note: row.kind === "etf" ? "ETF" : row.kind === "metal" ? "Metal" : "Energy",
			digits: row.digits
		}))
	})] });
}
var COT_SYMBOLS = /* @__PURE__ */ new Set([
	"GC=F",
	"SI=F",
	"HG=F",
	"CL=F",
	"BZ=F",
	"NG=F"
]);
function CotPanel({ row, loading, error, active }) {
	if (!COT_SYMBOLS.has(active)) return null;
	const net = row ? row.long - row.short : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium text-muted",
				children: "Managed money"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-faint",
				children: "CFTC disaggregated futures only. Net is long minus short. Spreading is a separate bucket and is not in the net. Not the ETF."
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "Loading the commitments report"
			}) : null,
			!loading && error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-down",
				children: error
			}) : null,
			!loading && !error && !row ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "This contract was not in the latest futures file."
			}) : null,
			row ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Long",
						value: formatNum(row.long, 0),
						hint: `Report ${row.reportDate}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Short",
						value: formatNum(row.short, 0),
						hint: "Managed money"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Spreading",
						value: formatNum(row.spread, 0),
						hint: "Not in the net"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Net",
						value: net == null ? "—" : formatNum(net, 0),
						hint: "Long − short"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Open interest",
						value: formatNum(row.openInterest, 0),
						hint: row.market
					})
				]
			}) : null
		]
	});
}
function Stat({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-line bg-surface px-3 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-xl font-medium tabular-nums",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-xs text-faint",
				children: hint
			})
		]
	});
}
var SplitComponent = function CommoditiesRoute() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommoditiesPage, { initial: Route$9.useLoaderData() });
};
//#endregion
export { SplitComponent as component };
