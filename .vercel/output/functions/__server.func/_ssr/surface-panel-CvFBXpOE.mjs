import { o as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { g as formatNum, v as formatVol } from "./router-O2oiJSQ5.mjs";
import { n as CsvRecords, r as TableExport } from "./download-CGNcFT4o.mjs";
import { h as useSurfaceQuery } from "./queries-CWEEDy6U.mjs";
import { n as Heatmap } from "./frame-N6gf4c5H.mjs";
import { a as Line, i as XAxis, l as ResponsiveContainer, n as LineChart, o as CartesianGrid, r as YAxis, u as Tooltip } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/surface-panel-CvFBXpOE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function day(sec) {
	const parsed = Number(sec);
	if (!Number.isFinite(parsed)) return sec;
	return (/* @__PURE__ */ new Date(parsed * 1e3)).toISOString().slice(0, 10);
}
function greek(value, digits) {
	return value == null || !Number.isFinite(value) ? "—" : value.toFixed(digits);
}
function OptionBoard({ loading, error, rate, dividend, expiries, expiry, onExpiry, rows, selected, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Option chain"
				}), expiries.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-xs text-muted",
					children: ["Expiry", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: expiry,
						onChange: (event) => onExpiry(event.target.value),
						className: "mt-1 min-h-11 rounded-md border border-line bg-surface px-3 text-sm text-fg",
						children: expiries.map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value,
							children: day(value)
						}, value))
					})]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-faint",
				children: [
					rate == null ? "13-week yield unavailable, greeks blank." : `r ${(rate * 100).toFixed(2)}%`,
					dividend == null ? " · q = 0" : ` · q ${(dividend * 100).toFixed(2)}%`,
					" · Yahoo chain · nearest strikes"
				]
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "Loading chain"
			}) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-down",
				children: error
			}) : null,
			rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableExport, {
				file: "option-chain",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 overflow-x-auto rounded-md border border-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[52rem] text-right text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-surface text-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
								"Type",
								"Strike",
								"Bid",
								"Ask",
								"Last",
								"IV",
								"Vol",
								"OI",
								"Delta",
								"Gamma",
								"Vega",
								"Theta"
							].map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-2 text-right font-medium first:text-left",
								children: label
							}, label)) })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-line " + (selected === row.contract ? "bg-surface" : ""),
							onClick: onSelect ? () => onSelect(row) : void 0,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 text-left uppercase text-fg",
									children: row.type
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 font-mono",
									children: formatNum(row.strike, 2)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 font-mono",
									children: row.bid == null ? "—" : formatNum(row.bid, 2)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 font-mono",
									children: row.ask == null ? "—" : formatNum(row.ask, 2)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 font-mono",
									children: row.last == null ? "—" : formatNum(row.last, 2)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 font-mono",
									children: row.iv == null ? "—" : `${(row.iv * 100).toFixed(1)}%`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 font-mono",
									children: formatVol(row.volume)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 font-mono",
									children: formatVol(row.openInterest)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 font-mono",
									children: greek(row.delta, 2)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 font-mono",
									children: greek(row.gamma, 4)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 font-mono",
									children: greek(row.vega, 3)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 font-mono",
									children: greek(row.theta, 3)
								})
							]
						}, row.contract)) })]
					})
				})
			}) : null
		]
	});
}
var WINGS = [
	.9,
	.95,
	1,
	1.05,
	1.1
];
function ivAt(points, expiry, spot, moneyness) {
	let best = null;
	for (const point of points) {
		if (point.expiry !== expiry || !(point.iv > 0) || !(point.strike > 0)) continue;
		const distance = Math.abs(point.strike / spot - moneyness);
		if (distance > .03) continue;
		if (!best || distance < best.distance) best = {
			iv: point.iv,
			distance
		};
	}
	return best ? best.iv : null;
}
function skewSurface(points, spot) {
	if (!(spot > 0) || points.length < 3) return null;
	const expiries = [...new Set(points.map((point) => point.expiry))].sort();
	const term = [];
	const rows = [];
	for (const expiry of expiries) {
		const vols = WINGS.map((wing) => ivAt(points, expiry, spot, wing));
		const atm = vols[2];
		const put = vols[1];
		const call = vols[3];
		const rr = put != null && call != null ? (call - put) * 100 : null;
		const fly = put != null && call != null && atm != null ? ((put + call) / 2 - atm) * 100 : null;
		term.push({
			expiry,
			label: expiry.slice(5),
			atm: atm == null ? null : atm * 100,
			rr,
			fly
		});
		rows.push({
			label: expiry.slice(5),
			cells: vols.map((vol) => vol == null || atm == null ? null : (vol - atm) * 100)
		});
	}
	if (!rows.some((row) => row.cells.some((cell) => cell != null))) return null;
	return {
		columns: [
			"90",
			"95",
			"ATM",
			"105",
			"110"
		],
		rows,
		term
	};
}
var BUCKETS = [
	.85,
	.9,
	.95,
	1,
	1.05,
	1.1,
	1.15
];
function curvesOf(points, spot) {
	const byExpiry = /* @__PURE__ */ new Map();
	for (const point of points) {
		const list = byExpiry.get(point.expiry) ?? [];
		list.push(point);
		byExpiry.set(point.expiry, list);
	}
	const expiries = [...byExpiry.keys()].sort();
	const picked = [
		0,
		Math.floor(expiries.length / 2),
		expiries.length - 1
	].map((index) => expiries[index]).filter((value, index, all) => value && all.indexOf(value) === index);
	const rows = /* @__PURE__ */ new Map();
	for (const expiry of picked) for (const point of byExpiry.get(expiry) ?? []) {
		const moneyness = Math.round(point.strike / spot * 100);
		const row = rows.get(moneyness) ?? { m: moneyness };
		row[expiry] = point.iv * 100;
		rows.set(moneyness, row);
	}
	return {
		expiries: picked,
		data: [...rows.values()].sort((a, b) => Number(a.m) - Number(b.m))
	};
}
function gridOf(points, spot) {
	return [...new Set(points.map((point) => point.expiry))].sort().map((expiry) => ({
		label: expiry.slice(5),
		cells: BUCKETS.map((bucket) => {
			const near = points.filter((point) => point.expiry === expiry).map((point) => ({
				iv: point.iv,
				distance: Math.abs(point.strike / spot - bucket)
			})).filter((point) => point.distance <= .025).sort((a, b) => a.distance - b.distance)[0];
			return near ? near.iv * 100 : null;
		})
	}));
}
function SurfacePanel({ symbol }) {
	const query = useSurfaceQuery(symbol, true);
	const spot = query.data?.spot ?? null;
	const points = query.data?.points ?? [];
	const skew = (0, import_react.useMemo)(() => spot ? curvesOf(points, spot) : {
		expiries: [],
		data: []
	}, [points, spot]);
	const grid = (0, import_react.useMemo)(() => spot ? gridOf(points, spot) : [], [points, spot]);
	const skewGrid = (0, import_react.useMemo)(() => spot ? skewSurface(points, spot) : null, [points, spot]);
	const front = skewGrid?.term.find((row) => row.rr != null) ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium",
				children: "Implied vol"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-faint",
				children: "OTM quotes from the live chain. Puts below spot, calls at and above. This is today's surface, not a history."
			}),
			query.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "Loading surface"
			}) : null,
			query.data?.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-down",
				children: query.data.error
			}) : null,
			skew.data.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 h-64",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
						data: skew.data,
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
								dataKey: "m",
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
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-muted",
									children: [label, "% of spot"]
								}), payload.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-mono text-fg",
									children: [
										item.dataKey,
										" ",
										Number(item.value).toFixed(1),
										"%"
									]
								}, String(item.dataKey)))]
							}) : null }),
							skew.expiries.map((expiry, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								dataKey: expiry,
								name: expiry,
								stroke: index === 0 ? "var(--color-accent)" : index === 1 ? "var(--color-up)" : "var(--color-muted)",
								dot: false,
								strokeWidth: 1.7,
								connectNulls: true,
								isAnimationActive: false
							}, expiry))
						]
					})
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CsvRecords, {
				file: `${symbol}-skew`,
				rows: skew.data
			})] }) : null,
			grid.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-xs font-medium text-muted",
					children: "Vol surface, percent"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heatmap, {
						file: `${symbol}-vol-surface`,
						columns: BUCKETS.map((bucket) => `${Math.round(bucket * 100)}`),
						rows: grid,
						scale: "level",
						format: (value) => value.toFixed(0)
					})
				})]
			}) : null,
			skewGrid ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-xs font-medium text-muted",
						children: "Skew surface, vol points versus ATM"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-faint",
						children: ["Each cell is that moneyness minus at-the-money. Risk reversal is the 105 call vol minus the 95 put vol. Butterfly is the average of those wings minus ATM.", front?.rr != null ? ` Front ${front.expiry}: risk reversal ${front.rr.toFixed(1)}, butterfly ${front.fly == null ? "—" : front.fly.toFixed(1)}.` : ""]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heatmap, {
							file: `${symbol}-skew-surface`,
							columns: skewGrid.columns,
							rows: skewGrid.rows,
							scale: "diverge",
							format: (value) => value.toFixed(1)
						})
					}),
					skewGrid.term.some((row) => row.rr != null || row.fly != null) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 h-64",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
								data: skewGrid.term,
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
										dataKey: "label",
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
										width: 40
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
												Number(item.value).toFixed(1)
											]
										}, String(item.dataKey)))]
									}) : null }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
										dataKey: "rr",
										name: "Risk reversal",
										stroke: "var(--color-accent)",
										dot: false,
										strokeWidth: 1.7,
										connectNulls: true,
										isAnimationActive: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
										dataKey: "fly",
										name: "Butterfly",
										stroke: "var(--color-muted)",
										dot: false,
										strokeWidth: 1.7,
										connectNulls: true,
										isAnimationActive: false
									})
								]
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CsvRecords, {
						file: `${symbol}-risk-reversal`,
						rows: skewGrid.term
					})] }) : null
				]
			}) : null
		]
	});
}
//#endregion
export { SurfacePanel as n, OptionBoard as t };
