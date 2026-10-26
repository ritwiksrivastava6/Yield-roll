import { o as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { g as formatNum, l as Route$10, u as useCurrentUserState } from "./router-O2oiJSQ5.mjs";
import { n as CsvRecords } from "./download-CGNcFT4o.mjs";
import { a as markPings, i as listAlerts, n as dropAlert, r as getDesk, s as pullPings, t as armAlert } from "./api-DcS-2aLZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D3net7Iv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function tone(state) {
	if (state === "awake") return "text-up";
	if (state === "quiet") return "text-accent";
	return "text-muted";
}
function Card({ row }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/equities",
		search: { symbol: row.symbol },
		className: "block rounded-md border border-line px-3 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-fg",
					children: row.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `text-xs ${tone(row.state)}`,
					children: row.state === "awake" ? "Woke up" : "Quiet"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 font-mono text-2xl tabular-nums",
				children: row.pct == null ? "—" : row.pct.toFixed(0)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1 text-xs text-faint",
				children: [row.rv == null ? "—" : `${row.rv.toFixed(1)}% realized`, row.delta == null ? "" : ` · ${row.delta > 0 ? "+" : ""}${row.delta.toFixed(0)} vs 21 sessions ago`]
			})
		]
	});
}
function VolPage({ initial }) {
	const rows = initial.rows;
	const awake = rows.filter((row) => row.state === "awake");
	const quiet = rows.filter((row) => row.state === "quiet");
	const { user, isPending } = useCurrentUserState();
	const [live, setLive] = (0, import_react.useState)(false);
	const [alerts, setAlerts] = (0, import_react.useState)([]);
	const [pings, setPings] = (0, import_react.useState)([]);
	const signedIn = live && !isPending && !!user;
	const signedOut = live && !isPending && !user;
	(0, import_react.useEffect)(() => {
		if (!user?.id) return;
		let cancel = false;
		Promise.all([listAlerts(), pullPings()]).then(([armed, fired]) => {
			if (cancel) return;
			setAlerts(armed);
			setPings(fired);
		}).catch(() => {});
		return () => {
			cancel = true;
		};
	}, [user?.id]);
	(0, import_react.useEffect)(() => {
		setLive(true);
	}, []);
	function armed(symbol, side, kind = "vol") {
		return alerts.some((alert) => alert.kind === kind && alert.symbol === symbol && (kind === "filing" || alert.side === side));
	}
	async function arm(symbol, side, level) {
		await armAlert({ data: {
			kind: "vol",
			symbol,
			side,
			level
		} });
		setAlerts(await listAlerts());
	}
	async function armFilings() {
		const symbols = (await getDesk()).symbols.filter((symbol) => /^[A-Z]{1,6}$/.test(symbol));
		await Promise.all(symbols.map((symbol) => armAlert({ data: {
			kind: "filing",
			symbol,
			side: "above"
		} })));
		setAlerts(await listAlerts());
		setPings(await pullPings());
	}
	const unseen = pings.filter((ping) => !ping.seen).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-4 py-4 sm:px-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-medium",
					children: "Vol"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-faint",
					children: "21-session realized vol, as a percentile of its own history. Woke up means that percentile rose 15 points or more over 21 sessions. Quiet means it is at 25 or below."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-11",
					children: signedOut ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						className: "inline-flex min-h-11 items-center text-sm text-muted",
						children: "Sign in to keep screens and pings"
					}) : null
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-faint",
				children: ["US, world ETFs, gold, crude, the long bond and the dollar are Nasdaq end-of-day. ", initial.nse]
			}),
			unseen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-md border border-line px-3 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-sm font-medium",
						children: [unseen, " new"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 text-xs text-muted",
						onClick: () => markPings().then(() => setPings((list) => list.map((ping) => ({
							...ping,
							seen: true
						})))),
						children: "Mark read"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-1 text-sm text-fg",
					children: pings.filter((ping) => !ping.seen).map((ping) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: ping.body }, ping.id))
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Woke up"
				}), awake.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
					children: awake.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { row }, row.symbol))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Nothing jumped."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Quiet"
				}), quiet.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
					children: quiet.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { row }, row.symbol))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Nothing is in the bottom quartile."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Board"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 overflow-x-auto rounded-md border border-line",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full min-w-[40rem] text-left text-sm",
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
										children: "RV 21"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 text-right font-medium",
										children: "Percentile"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 text-right font-medium",
										children: "21s ago"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 font-medium",
										children: "Ping"
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-line",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-3 py-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/equities",
											search: { symbol: row.symbol },
											className: "text-fg",
											children: row.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-xs text-faint",
											children: [
												row.symbol,
												" · ",
												row.group,
												row.error ? ` · ${row.error}` : ` · ${row.source}`
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 text-right font-mono tabular-nums",
										children: row.last == null ? "—" : formatNum(row.last, row.last >= 100 ? 0 : 2)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 text-right font-mono tabular-nums",
										children: row.rv == null ? "—" : row.rv.toFixed(1)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: `px-3 py-2 text-right font-mono tabular-nums ${tone(row.state)}`,
										children: row.pct == null ? "—" : row.pct.toFixed(0)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 text-right font-mono tabular-nums text-muted",
										children: row.delta == null ? "—" : `${row.delta > 0 ? "+" : ""}${row.delta.toFixed(0)}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2",
										children: signedIn && row.pct != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex flex-wrap gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													disabled: armed(row.symbol, "below"),
													className: "min-h-11 text-xs text-muted disabled:text-faint",
													onClick: () => arm(row.symbol, "below", 20),
													children: armed(row.symbol, "below") ? "Under 20 on" : "Under 20"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													disabled: armed(row.symbol, "above"),
													className: "min-h-11 text-xs text-muted disabled:text-faint",
													onClick: () => arm(row.symbol, "above", 80),
													children: armed(row.symbol, "above") ? "Over 80 on" : "Over 80"
												}),
												/^[A-Z]{1,5}$/.test(row.symbol) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													disabled: armed(row.symbol, "above", "filing"),
													className: "min-h-11 text-xs text-muted disabled:text-faint",
													onClick: () => armAlert({ data: {
														kind: "filing",
														symbol: row.symbol,
														side: "above"
													} }).then(() => listAlerts().then(setAlerts)),
													children: armed(row.symbol, "above", "filing") ? "8-K on" : "8-K"
												}) : null
											]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-faint",
											children: signedOut ? "Sign in" : ""
										})
									})
								]
							}, row.symbol)) })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CsvRecords, {
						file: "vol-board",
						rows: rows.map((row) => ({
							symbol: row.symbol,
							name: row.name,
							group: row.group,
							last: row.last,
							rv21: row.rv,
							percentile: row.pct,
							delta21: row.delta,
							state: row.state,
							source: row.source
						}))
					})
				]
			}),
			signedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Armed"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 rounded-md border border-line px-3 text-xs text-muted",
						onClick: armFilings,
						children: "8-K on the book"
					})]
				}), alerts.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 divide-y divide-line rounded-md border border-line text-sm",
					children: alerts.map((alert) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-3 px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: alert.kind === "screen" ? "Screen hit" : alert.kind === "filing" ? `${alert.symbol} 8-K` : alert.side === "below" ? `${alert.symbol} vol under 20` : `${alert.symbol} vol over 80` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 text-xs text-muted",
							onClick: () => dropAlert({ data: { id: alert.id } }).then(() => setAlerts((list) => list.filter((item) => item.id !== alert.id))),
							children: "Remove"
						})]
					}, alert.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "None yet."
				})]
			}) : null
		]
	});
}
var SplitComponent = function VolRoute() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolPage, { initial: Route$10.useLoaderData() });
};
//#endregion
export { SplitComponent as component };
