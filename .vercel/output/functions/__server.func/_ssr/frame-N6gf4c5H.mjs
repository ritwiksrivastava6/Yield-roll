import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { F as realizedVols, M as monthVolGrid, X as volRank, j as monthGrid } from "./universe-B-8f2Y6c.mjs";
import { d as Change, g as formatNum, m as LivePrice, p as LiveMark } from "./router-O2oiJSQ5.mjs";
import { r as TableExport } from "./download-CGNcFT4o.mjs";
import { l as useNewsQuery } from "./queries-CWEEDy6U.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/frame-N6gf4c5H.js
var import_jsx_runtime = require_jsx_runtime();
function paint(value, max, scale) {
	if (scale === "level") return `color-mix(in oklab, var(--color-accent) ${Math.round(Math.min(Math.max(value, 0), max) / max * 55)}%, var(--color-surface))`;
	const mix = Math.round(Math.min(Math.abs(value), max) / max * 55);
	return `color-mix(in oklab, ${value >= 0 ? "var(--color-up)" : "var(--color-down)"} ${mix}%, var(--color-surface))`;
}
function Heatmap({ columns, rows, format, scale, file = "heatmap" }) {
	const values = rows.flatMap((row) => row.cells).filter((value) => value != null && Number.isFinite(value));
	const max = Math.max(scale === "diverge" ? .2 : .05, ...values.map((value) => Math.abs(value)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableExport, {
		file,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "border-collapse text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-2 py-1" }), columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "px-1 py-1 text-center font-medium text-muted",
					children: column
				}, column))] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "whitespace-nowrap px-2 py-1 text-left font-mono font-medium text-fg",
					children: row.label
				}), row.cells.map((cell, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "p-0.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-9 min-w-12 items-center justify-center rounded-sm font-mono text-fg",
						style: { background: cell == null ? "var(--color-surface)" : paint(cell, max, scale) },
						children: cell == null ? "—" : format(cell)
					})
				}, `${row.label}-${columns[index]}`))] }, row.label)) })]
			})
		})
	});
}
var MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];
function MonthHeat({ bars, history }) {
	if (bars.length < 40) return null;
	const rows = monthGrid(bars).map((row) => ({
		label: row.year,
		cells: row.cells
	}));
	const vols = realizedVols(bars.map((bar) => bar.c));
	const volRows = monthVolGrid(bars).map((row) => ({
		label: row.year,
		cells: row.cells
	}));
	const rank = history === null ? null : volRank(history ?? bars.map((bar) => bar.c), 21);
	const where = history && history.length ? "the last two years" : "this window";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium",
				children: "Monthly returns"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-faint",
				children: "Compounded from daily closes. Realized vol is the sample standard deviation of daily changes, annualized."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4",
				children: vols.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-line px-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted",
						children: [row.label, " realized"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 font-mono text-lg text-fg",
						children: row.vol == null ? "—" : `${row.vol.toFixed(1)}%`
					})]
				}, row.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heatmap, {
					file: "monthly-returns",
					columns: MONTHS,
					rows,
					scale: "diverge",
					format: (value) => `${value.toFixed(1)}`
				})
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium",
				children: "Realized-vol calendar"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-faint",
				children: "Annualized sample deviation of daily log returns inside each month. Blank if the month has fewer than eight sessions."
			}),
			rank != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-fg",
				children: [
					"21-day realized vol is at percentile ",
					rank.toFixed(0),
					" of ",
					where,
					"."
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heatmap, {
					file: "monthly-vol",
					columns: MONTHS,
					rows: volRows,
					scale: "level",
					format: (value) => value.toFixed(0)
				})
			})
		]
	})] });
}
var UP = [
	"record high",
	"upgrade",
	"beats",
	"beat",
	"surge",
	"surges",
	"rally",
	"rallies",
	"jumps",
	"jump",
	"gains",
	"gain",
	"rises",
	"rise",
	"rose",
	"approved",
	"approval",
	"surplus",
	"stimulus",
	"dovish"
];
var DOWN = [
	"downgrade",
	"misses",
	"miss",
	"plunge",
	"plunges",
	"falls",
	"fall",
	"fell",
	"drops",
	"drop",
	"dropped",
	"default",
	"glut",
	"lawsuit",
	"investigation",
	"recession",
	"hawkish",
	"ban"
];
function headlineTone(title) {
	const text = ` ${title.toLowerCase()} `;
	const has = (word) => text.includes(word);
	const up = UP.find(has) ?? "";
	const down = DOWN.find(has) ?? "";
	if (up && down) return {
		tone: "mixed",
		word: `${up}, ${down}`
	};
	if (up) return {
		tone: "positive",
		word: up
	};
	if (down) return {
		tone: "negative",
		word: down
	};
	return {
		tone: "none",
		word: ""
	};
}
function Split({ title, symbol, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-4 py-4 sm:px-5 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-medium",
				children: title
			}), children]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewsRail, { symbol })]
	});
}
function Choice({ label, value, options, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block min-w-0 text-xs text-muted",
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
			value,
			onChange: (event) => onChange(event.target.value),
			className: "mt-1 min-h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-fg",
			children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: option.id,
				children: option.label
			}, option.id))
		})]
	});
}
var RANGES = [
	{
		id: "6mo",
		label: "6mo"
	},
	{
		id: "1y",
		label: "1y"
	},
	{
		id: "2y",
		label: "2y"
	},
	{
		id: "5y",
		label: "5y"
	}
];
function RangePick({ value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-1",
		role: "group",
		"aria-label": "Range",
		children: RANGES.map((range) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-pressed": value === range.id,
			onClick: () => onChange(range.id),
			className: "min-h-11 rounded-md px-3 text-sm " + (value === range.id ? "bg-accent text-accent-ink" : "border border-line text-muted"),
			children: range.label
		}, range.id))
	});
}
function QuoteHead({ name, symbol, price, change, digits = 2, checkedAt, fetching, failed }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm text-fg",
				children: name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-faint",
				children: symbol
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-right",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LivePrice, {
					price,
					className: "block font-mono text-3xl text-accent",
					children: price == null ? "—" : formatNum(price, digits)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Change, { value: change })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveMark, {
			checkedAt,
			fetching,
			failed
		})]
	});
}
function Tape({ rows, active, onPick }) {
	const file = `tape-${active.replace(/[^\w.=-]+/g, "_")}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableExport, {
		file,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 overflow-x-auto rounded-md border border-line",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[24rem] text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-surface text-xs text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-2 font-medium",
							children: "Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-2 text-right font-medium",
							children: "Last"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-2 text-right font-medium",
							children: "Chg"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: row.symbol === active ? "bg-surface" : void 0,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onPick(row.symbol, row.name),
							className: "min-h-11 w-full px-3 py-2 text-left",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-fg",
								children: row.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-faint",
								children: [row.symbol, row.note ? ` · ${row.note}` : ""]
							})]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 text-right font-mono tabular-nums text-accent",
							children: row.price == null ? "—" : formatNum(row.price, row.digits ?? 2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Change, { value: row.changePct })
						})
					]
				}, row.symbol)) })]
			})
		})
	});
}
function toneClass(tone) {
	if (tone === "positive") return "text-up";
	if (tone === "negative") return "text-down";
	if (tone === "mixed") return "text-accent";
	return "text-faint";
}
function NewsRail({ symbol }) {
	const query = useNewsQuery(symbol);
	const items = (query.data?.items ?? []).filter((item) => item.symbol === symbol).slice(0, 6);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
		className: "mt-6 lg:mt-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-md border border-line bg-bg-elev lg:sticky lg:top-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-b border-line px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xs font-medium text-accent",
						children: "Headlines"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-faint",
						children: symbol
					})]
				}),
				query.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-3 py-3 text-sm text-muted",
					children: "Loading"
				}) : null,
				query.isError || query.data?.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-3 py-3 text-sm text-down",
					children: query.data?.error || "Headlines did not load"
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: items.map((item) => {
					const tone = headlineTone(item.title);
					const label = tone.tone === "none" ? "—" : tone.tone === "positive" ? "Positive" : tone.tone === "negative" ? "Negative" : "Mixed";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "border-t border-line px-3 py-3 first:border-t-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: item.link,
							target: "_blank",
							rel: "noreferrer",
							className: "text-sm text-fg hover:text-accent",
							children: item.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 flex items-center justify-between gap-2 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-faint",
								children: item.publishedLabel
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: toneClass(tone.tone),
								title: tone.word ? `Matched: ${tone.word}` : "No directional word",
								children: label
							})]
						})]
					}, item.link);
				}) }),
				!query.isPending && !items.length && !query.data?.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-3 py-3 text-sm text-muted",
					children: "No headlines"
				}) : null
			]
		})
	});
}
//#endregion
export { RangePick as a, QuoteHead as i, Heatmap as n, Split as o, MonthHeat as r, Tape as s, Choice as t };
