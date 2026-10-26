import { o as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { T as factorShare, b as corrMatrix, q as sma } from "./universe-B-8f2Y6c.mjs";
import { f as CsvButton, y as formatNum } from "./router-C6cpCEFu.mjs";
import { n as useBasketQuery } from "./queries-BjZCBJay.mjs";
import { n as Heatmap } from "./frame-D35s7vbo.mjs";
import { a as Line, c as Bar, i as XAxis, l as ResponsiveContainer, o as CartesianGrid, r as YAxis, t as ComposedChart, u as Tooltip } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/price-chart-CmzrpTjl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CrossPanel({ symbols, title }) {
	const unique = [...new Set(symbols)].slice(0, 8);
	const query = useBasketQuery(unique, "1y");
	const matrix = (0, import_react.useMemo)(() => {
		const rows = (query.data?.results ?? []).filter((row) => row.ok);
		if (rows.length < 2) return null;
		const series = rows.map((row) => ({
			symbol: row.series.symbol,
			bars: row.series.bars
		}));
		const full = corrMatrix(series);
		const short = corrMatrix(series, 63);
		if (!full) return null;
		const showShort = short != null && full.sessions > short.sessions + 5;
		const drift = showShort && short ? full.names.map((_, index) => full.values[index].map((value, cell) => {
			const recent = short.values[index]?.[cell];
			if (index === cell) return 0;
			if (value == null || recent == null) return null;
			return recent - value;
		})) : null;
		return {
			full,
			short: showShort ? short : null,
			drift
		};
	}, [query.data]);
	const share = matrix ? factorShare(matrix.full.values) : null;
	if (unique.length < 2) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-faint",
				children: "Pearson correlation of daily changes. The first matrix is the full loaded year. The second is the last 63 sessions, then the change from the year to those 63 sessions."
			}),
			query.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "Loading"
			}) : null,
			matrix ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-xs font-medium text-muted",
						children: "One year"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heatmap, {
							file: "corr-1y",
							columns: matrix.full.names,
							rows: matrix.full.names.map((name, index) => ({
								label: name,
								cells: matrix.full.values[index]
							})),
							scale: "diverge",
							format: (value) => value.toFixed(2)
						})
					}),
					matrix.short ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-4 text-xs font-medium text-muted",
						children: "63 sessions"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heatmap, {
							file: "corr-63",
							columns: matrix.short.names,
							rows: matrix.short.names.map((name, index) => ({
								label: name,
								cells: matrix.short?.values[index] ?? []
							})),
							scale: "diverge",
							format: (value) => value.toFixed(2)
						})
					})] }) : null,
					matrix.drift ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-4 text-xs font-medium text-muted",
							children: "63-day minus one-year"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-faint",
							children: "Positive means the pair's correlation rose in the recent window."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heatmap, {
								file: "corr-drift",
								columns: matrix.full.names,
								rows: matrix.full.names.map((name, index) => ({
									label: name,
									cells: matrix.drift?.[index] ?? []
								})),
								scale: "diverge",
								format: (value) => value.toFixed(2)
							})
						})
					] }) : null,
					share != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-muted",
						children: [
							"The first factor is ",
							(share * 100).toFixed(0),
							"% of this correlation.",
							share >= .55 ? " At that level, picking names is mostly a bet on the market." : " Names are not one trade."
						]
					}) : null
				]
			}) : null
		]
	});
}
function Tip({ active, payload, label }) {
	const rows = payload?.filter((item) => typeof item.value === "number") ?? [];
	if (!active || !rows.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-line bg-bg-elev px-3 py-2 text-xs",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-1 text-muted",
			children: label
		}), rows.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-4 tabular-nums",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted",
				children: item.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatNum(Number(item.value), 2) })]
		}, String(item.name)))]
	});
}
function Candle(props) {
	const { x = 0, y = 0, width = 0, height = 0, payload } = props;
	if (!payload) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {});
	const top = height >= 0 ? y : y + height;
	const span = Math.abs(height);
	const color = payload.c >= payload.o ? "var(--color-up)" : "var(--color-down)";
	const priceY = (price) => {
		const range = payload.h - payload.l;
		if (!(range > 0) || !(span > 0)) return top;
		return top + (payload.h - price) / range * span;
	};
	const openY = priceY(payload.o);
	const closeY = priceY(payload.c);
	const bodyY = Math.min(openY, closeY);
	const bodyH = Math.max(1, Math.abs(closeY - openY));
	const cx = x + width / 2;
	const bodyW = Math.max(1, width * .62);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: cx,
		x2: cx,
		y1: top,
		y2: top + Math.max(span, 1),
		stroke: color,
		strokeWidth: 1
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		x: x + (width - bodyW) / 2,
		y: bodyY,
		width: bodyW,
		height: bodyH,
		fill: color
	})] });
}
function PriceChart({ bars, file = "prices" }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	const [mode, setMode] = (0, import_react.useState)("line");
	(0, import_react.useEffect)(() => setReady(true), []);
	const data = (0, import_react.useMemo)(() => {
		const closes = bars.map((bar) => bar.c);
		const fast = sma(closes, 50);
		const slow = sma(closes, 200);
		return bars.map((bar, index) => ({
			d: bar.d,
			o: bar.o,
			h: bar.h,
			l: bar.l,
			c: bar.c,
			v: bar.v,
			sma50: fast[index],
			sma200: slow[index],
			wick: [bar.l, bar.h]
		}));
	}, [bars]);
	const name = file.replace(/[^\w.=-]+/g, "_").slice(0, 48) || "prices";
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-72 rounded-md bg-bg-elev" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-72 w-full min-w-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComposedChart, {
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
						width: 72,
						tickFormatter: (value) => formatNum(value, value >= 100 ? 0 : 2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {}) }),
					mode === "candle" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
						dataKey: "wick",
						name: "Range",
						fill: "transparent",
						isAnimationActive: false,
						shape: Candle
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
						type: "monotone",
						dataKey: "c",
						name: "Close",
						stroke: "var(--color-accent)",
						strokeWidth: 1.75,
						dot: false,
						isAnimationActive: false,
						connectNulls: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
						type: "monotone",
						dataKey: "sma50",
						name: "SMA 50",
						stroke: "var(--color-muted)",
						strokeWidth: 1.25,
						dot: false,
						isAnimationActive: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
						type: "monotone",
						dataKey: "sma200",
						name: "SMA 200",
						stroke: "var(--color-faint)",
						strokeWidth: 1.25,
						dot: false,
						isAnimationActive: false
					})
				]
			})
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 flex flex-wrap items-center justify-between gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-1",
			role: "group",
			"aria-label": "Chart type",
			children: ["line", "candle"].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-pressed": mode === item,
				onClick: () => setMode(item),
				className: "min-h-11 rounded-md px-3 text-sm " + (mode === item ? "bg-accent text-accent-ink" : "border border-line text-muted"),
				children: item === "line" ? "Line" : "Candles"
			}, item))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CsvButton, {
			file: name,
			columns: [
				"date",
				"open",
				"high",
				"low",
				"close",
				"volume",
				"sma50",
				"sma200"
			],
			rows: data.map((row) => [
				row.d,
				row.o,
				row.h,
				row.l,
				row.c,
				row.v,
				row.sma50,
				row.sma200
			])
		})]
	})] });
}
//#endregion
export { PriceChart as n, CrossPanel as t };
