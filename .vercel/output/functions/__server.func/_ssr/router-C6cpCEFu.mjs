import { o as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { i as require_react, n as QueryClientProvider, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, p as useRouterState, v as createFileRoute, x as useRouter, y as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { C as equityBook, G as searchSymbol, c as METALS, g as WB_COUNTRIES, h as SEARCH_EXCHANGES, i as FX_PAIRS, l as PORTFOLIO_SEED, n as ENERGY, u as RATES_BOOKS } from "./universe-B-8f2Y6c.mjs";
import { L as string, N as number, P as object, R as union, j as literal } from "../_libs/@better-auth/core+[...].mjs";
import { i as signOut, t as authClient } from "./client-IWHfIGH2.mjs";
import { a as hasGateSessionMarker, n as auth } from "./server-ClJU1xeI.mjs";
import { t as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-CcqKae5M.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cell(value) {
	if (value == null || value === "") return "";
	const text = String(value);
	if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, "\"\"")}"`;
	return text;
}
function fileName(file) {
	const base = file.trim().replace(/[^\w.-]+/g, "_").replace(/^_+|_+$/g, "") || "export";
	return base.toLowerCase().endsWith(".csv") ? base : `${base}.csv`;
}
function csvText(columns, rows) {
	return [columns, ...rows].map((row) => row.map(cell).join(",")).join("\r\n");
}
function framed() {
	try {
		return window.parent !== window;
	} catch {
		return true;
	}
}
function saveInDocument(doc, csv, name) {
	const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = doc.createElement("a");
	link.href = url;
	link.download = name;
	(doc.body ?? doc.documentElement).appendChild(link);
	link.click();
	window.setTimeout(() => {
		link.remove();
		URL.revokeObjectURL(url);
	}, 1500);
}
/**
* The live preview is a sandboxed frame. Chrome drops `<a download>` there
* unless the frame has `allow-downloads`, so the click looks dead. A blank
* popup is a top-level document and the save is allowed from it.
*/
function saveViaPopup(csv, name) {
	const popup = window.open("", "_blank");
	if (!popup) return false;
	try {
		if (!popup.document.body) {
			popup.document.open();
			popup.document.write("<!doctype html><title></title><body></body>");
			popup.document.close();
		}
		popup.document.title = name;
		const note = popup.document.createElement("p");
		note.textContent = `Saving ${name}…`;
		popup.document.body.appendChild(note);
		saveInDocument(popup.document, csv, name);
		window.setTimeout(() => {
			try {
				popup.close();
			} catch {}
		}, 1200);
		return true;
	} catch {
		try {
			popup.close();
		} catch {}
		return false;
	}
}
var CSV_EVENT = "fathom-csv";
function downloadCsv(file, columns, rows) {
	const name = fileName(file);
	const csv = csvText(columns, rows);
	if (!framed()) {
		saveInDocument(document, csv, name);
		return;
	}
	if (saveViaPopup(csv, name)) return;
	window.dispatchEvent(new CustomEvent(CSV_EVENT, { detail: {
		name,
		csv
	} }));
}
function CsvFallback() {
	const [file, setFile] = (0, import_react.useState)(null);
	const [copied, setCopied] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const onFile = (event) => {
			const detail = event.detail;
			if (!detail?.csv) return;
			setCopied(false);
			setFile(detail);
		};
		window.addEventListener(CSV_EVENT, onFile);
		return () => window.removeEventListener(CSV_EVENT, onFile);
	}, []);
	if (!file) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-x-0 bottom-0 z-50 border-t border-line bg-bg-elev p-4 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-[28rem] sm:rounded-md sm:border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium text-fg",
					children: file.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 text-xs text-muted",
					onClick: () => setFile(null),
					children: "Close"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: "This view blocked the file save. Copy the CSV instead."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				readOnly: true,
				value: file.csv,
				className: "mt-3 h-36 w-full rounded-md border border-line bg-surface p-2 font-mono text-xs text-fg"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: `${csvButtonClass} mt-3`,
				onClick: () => {
					const done = () => {
						setCopied(true);
					};
					if (navigator.clipboard?.writeText) {
						navigator.clipboard.writeText(file.csv).then(done).catch(done);
						return;
					}
					done();
				},
				children: copied ? "Copied" : "Copy CSV"
			})
		]
	});
}
var csvButtonClass = "min-h-11 rounded-md border border-line px-3 text-xs text-muted";
function CsvButton({ file, columns, rows }) {
	if (!rows.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: csvButtonClass,
		onClick: () => downloadCsv(file, columns, rows),
		children: "Download CSV"
	});
}
function CsvRecords({ file, rows, columns }) {
	if (!rows.length) return null;
	const cols = columns ?? Object.keys(rows[0]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-2 flex justify-end",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CsvButton, {
			file,
			columns: cols,
			rows: rows.map((row) => cols.map((column) => row[column] ?? ""))
		})
	});
}
function TableExport({ file, children }) {
	const ref = (0, import_react.useRef)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 flex justify-end",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: csvButtonClass,
				onClick: () => {
					const table = ref.current?.querySelector("table");
					if (!table) return;
					downloadCsv(file, [...table.querySelectorAll("thead th")].map((node) => (node.textContent ?? "").replace(/\s+/g, " ").trim()), [...table.querySelectorAll("tbody tr")].map((tr) => [...tr.querySelectorAll("th,td")].map((node) => (node.innerText ?? "").replace(/\s+/g, " ").trim())));
				},
				children: "Download CSV"
			})
		})]
	});
}
function formatNum(n, digits = 2, group = "us") {
	if (n == null || !Number.isFinite(n)) return "—";
	const sign = n < 0 ? "-" : "";
	const [whole, frac] = Math.abs(n).toFixed(digits).split(".");
	const grouped = group === "in" ? groupIn(whole) : whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return digits > 0 ? `${sign}${grouped}.${frac}` : `${sign}${grouped}`;
}
function groupIn(whole) {
	if (whole.length <= 3) return whole;
	const head = whole.slice(0, -3);
	const tail = whole.slice(-3);
	return `${head.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${tail}`;
}
function formatPx(n, currency, digits) {
	const group = currency === "INR" ? "in" : "us";
	return formatNum(n, digits ?? (n == null || !Number.isFinite(n) ? 2 : Math.abs(n) >= 100 ? 2 : Math.abs(n) >= 1 ? 2 : 4), group);
}
function formatPct(n, digits = 2) {
	if (n == null || !Number.isFinite(n)) return "—";
	return `${n > 0 ? "+" : ""}${n.toFixed(digits)}%`;
}
function formatVol(n) {
	if (n == null || !Number.isFinite(n) || n <= 0) return "—";
	if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
	if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
	if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
	return String(Math.round(n));
}
function pctClass(n) {
	if (n == null || !Number.isFinite(n) || n === 0) return "text-muted";
	return n > 0 ? "text-up" : "text-down";
}
function Change({ value, digits = 2 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `tabular-nums ${pctClass(value)}`,
		children: formatPct(value, digits)
	});
}
function LiveMark({ checkedAt, fetching, failed }) {
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setNow(Date.now()), 1e3);
		return () => window.clearInterval(id);
	}, []);
	const age = checkedAt && Number.isFinite(Date.parse(checkedAt)) ? Math.max(0, Math.round((now - Date.parse(checkedAt)) / 1e3)) : null;
	const label = failed ? "Print check failed" : fetching && age == null ? "Checking" : age == null ? "Waiting" : `${age}s`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "mt-2 flex items-center gap-2 text-xs text-faint",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `live-dot inline-block h-1.5 w-1.5 rounded-full ${failed ? "bg-down" : "bg-up"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label })]
	});
}
function LivePrice({ price, className, children }) {
	const prev = (0, import_react.useRef)(null);
	const [flash, setFlash] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (price == null || !Number.isFinite(price)) return;
		const before = prev.current;
		prev.current = price;
		if (before == null || before === price) return;
		setFlash(price > before ? "up" : "down");
		const id = window.setTimeout(() => setFlash(null), 900);
		return () => window.clearTimeout(id);
	}, [price]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `${className ?? ""} ${flash === "up" ? "text-up" : flash === "down" ? "text-down" : ""}`.trim(),
		children
	});
}
function LoadingNote({ label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-4 py-8 sm:px-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4",
			children: Array.from({ length: 8 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-28 rounded-md border border-line bg-surface" }, i))
		})]
	});
}
function FeedErrors({ rows }) {
	if (!rows.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-line bg-down-dim px-4 py-3 text-sm text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-medium",
			children: "No print"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 space-y-1 text-muted",
			children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-fg",
					children: row.symbol
				}),
				" — ",
				row.message
			] }, row.symbol))
		})]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var RANGES = /* @__PURE__ */ new Set([
	"3mo",
	"6mo",
	"1y",
	"2y",
	"5y",
	"10y"
]);
var SYMBOL = /^[A-Z0-9.^=-]{1,18}$/;
function cleanSymbol(value) {
	if (typeof value !== "string") throw new Error("Symbol is required");
	const sym = value.trim().toUpperCase();
	if (!SYMBOL.test(sym)) throw new Error("That ticker format is not accepted");
	return sym;
}
var getBoard = createServerFn({ method: "POST" }).validator((input) => {
	if (!input || !Array.isArray(input.symbols)) throw new Error("Missing symbols");
	const symbols = input.symbols.map((s) => cleanSymbol(s));
	if (symbols.length < 1 || symbols.length > 32) throw new Error("Ask for 1–32 symbols");
	return { symbols };
}).handler(createSsrRpc("01fc9dcf0b69425c14220166aa0777f34785b45897e4f7c73287c630313ee427"));
var getPrints = createServerFn({ method: "POST" }).validator((input) => {
	if (!input || !Array.isArray(input.symbols)) throw new Error("Missing symbols");
	const symbols = input.symbols.map((s) => cleanSymbol(s));
	if (symbols.length < 1 || symbols.length > 32) throw new Error("Ask for 1–32 symbols");
	return { symbols };
}).handler(createSsrRpc("81003d14deae88614e66851e7482a7199168c2a809db138321d73dc68771c41a"));
var getSeries = createServerFn({ method: "POST" }).validator((input) => {
	const symbol = cleanSymbol(input?.symbol);
	const range = typeof input?.range === "string" ? input.range : "";
	if (!RANGES.has(range)) throw new Error("Unsupported range");
	return {
		symbol,
		range
	};
}).handler(createSsrRpc("bc4511cad5053b89a51693feef0bb6165ff8bd9b411f99c334b3bf5e2115d2e0"));
var getMacro = createServerFn({ method: "POST" }).validator(() => ({})).handler(createSsrRpc("57c28f1271b6a1d7aa0775945a943e28f5657a45c3de1347bfb3ba78706e33bb"));
var WB_IDS = new Set(WB_COUNTRIES.map((row) => row.id));
var getWorldBank = createServerFn({ method: "POST" }).validator((input) => {
	if (!input || !Array.isArray(input.countries)) throw new Error("Missing countries");
	const countries = [];
	for (const raw of input.countries) {
		if (typeof raw !== "string") continue;
		const id = raw.trim().toUpperCase();
		if (!WB_IDS.has(id) || countries.includes(id)) continue;
		countries.push(id);
	}
	if (countries.length < 1 || countries.length > 6) throw new Error("Pick 1–6 countries");
	return { countries };
}).handler(createSsrRpc("a1f5f702e012089eb26ef8d6ec816bda4c332cef11895fc6e205fa69d6f3ff8a"));
var SCOPES = /* @__PURE__ */ new Set([
	"any",
	"equity",
	"rates",
	"commodity",
	"fx",
	...Object.keys(SEARCH_EXCHANGES)
]);
var searchSymbols = createServerFn({ method: "POST" }).validator((input) => {
	const q = typeof input?.q === "string" ? input.q.trim() : "";
	if (q.length < 1 || q.length > 40) throw new Error("Type a ticker or name");
	return {
		q,
		scope: typeof input?.scope === "string" && SCOPES.has(input.scope) ? input.scope : "any"
	};
}).handler(createSsrRpc("065ec62f1c6b40de8220d7bca65b7ac01990b6219d07ac868fd7eddfc28c6b67"));
var getNews = createServerFn({ method: "POST" }).validator((input) => {
	const raw = typeof input?.symbol === "string" ? input.symbol.trim().toUpperCase() : "";
	if (raw && !/^[A-Z0-9.^=-]{1,18}$/.test(raw)) throw new Error("That ticker format is not accepted");
	return { symbol: raw };
}).handler(createSsrRpc("5416d3964d644c3e79c533fd3bf9ef1127f1e46cb479bc60c571cdd177427aa9"));
var getEnergy = createServerFn({ method: "POST" }).validator(() => ({})).handler(createSsrRpc("d118f70071943f61eb227a8b570cfde23b4e6f048fd8cb5d3f32ca491226f38e"));
var getOptions = createServerFn({ method: "POST" }).validator((input) => {
	return {
		symbol: cleanSymbol(input?.symbol),
		expiry: typeof input?.expiry === "string" && /^\d{9,12}$/.test(input.expiry) ? input.expiry : ""
	};
}).handler(createSsrRpc("b79e28691e3a05a5b341826ce3b36fd5bb2b03ec19fdc1a5f9c738c6cfdd0777"));
var getSurface = createServerFn({ method: "POST" }).validator((input) => ({ symbol: cleanSymbol(input?.symbol) })).handler(createSsrRpc("7034746e14e8242e6bc96b5616b460acedda41ca5575ea7beaa986509ec92b5b"));
var getReference = createServerFn({ method: "POST" }).validator(() => ({})).handler(createSsrRpc("5fc47fe828e422825fec57ebb090a225ae99fa5a7824d200a58e3504f6095df9"));
var getOfficialRates = createServerFn({ method: "POST" }).validator(() => ({})).handler(createSsrRpc("d60c1daddeed89d366e485ce9e8fe9aafe5cfb3a50722e748b592497afd3df95"));
var getFilings = createServerFn({ method: "POST" }).validator((input) => ({ symbol: cleanSymbol(input?.symbol) })).handler(createSsrRpc("bba008c2a1b1c7cb5cb5f3dacd3f85e71cb5ae7128f438bec61ca72a7d704893"));
var getVolBoard = createServerFn({ method: "GET" }).handler(createSsrRpc("42e5ba24c102778a6e1e69efc82ce3a67fb4fc7532abd6d0e72c270504f73419"));
var getCot = createServerFn({ method: "POST" }).validator(() => ({})).handler(createSsrRpc("2cbde238809017bbda8060ab773a7802168457ed8f1e74a77d4e6ca9da737d52"));
var ECB_SYMBOLS = /* @__PURE__ */ new Set([
	"DX-Y.NYB",
	"EURUSD=X",
	"GBPUSD=X",
	"USDJPY=X",
	"AUDUSD=X",
	"USDCAD=X",
	"USDCHF=X",
	"NZDUSD=X",
	"USDSEK=X",
	"USDNOK=X",
	"USDINR=X",
	"CNH=X",
	"USDHKD=X",
	"USDSGD=X",
	"USDKRW=X",
	"EURJPY=X",
	"GBPJPY=X"
]);
var getEcbHistory = createServerFn({ method: "POST" }).validator((input) => {
	const symbol = cleanSymbol(input?.symbol);
	if (!ECB_SYMBOLS.has(symbol)) throw new Error("No ECB series for that pair");
	return { symbol };
}).handler(createSsrRpc("52447ce45384a40eb0acb09801b1caaa53b7c9fa624291a7863412c57eaa1c20"));
var getBasket = createServerFn({ method: "POST" }).validator((input) => {
	if (!input || !Array.isArray(input.symbols)) throw new Error("Missing symbols");
	const symbols = [...new Set(input.symbols.map((symbol) => cleanSymbol(symbol)))];
	if (symbols.length < 2 || symbols.length > 8) throw new Error("Use 2–8 symbols");
	const range = typeof input.range === "string" ? input.range : "";
	if (!RANGES.has(range)) throw new Error("Unsupported range");
	return {
		symbols,
		range
	};
}).handler(createSsrRpc("e8de93df98f5aa0e7eeb0da18271fdd01fc3feeb8c237308f858c4a8e661dfac"));
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-C6cpCEFu.js
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-down",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-muted",
				children: errorMessage(error)
			})
		]
	});
}
/**
* Path-based preview hosts serve the dev server under `/{port_id}/` and strip
* that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
* prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
* client routing and generated links aligned with the public URL.
*/
var PATH_BASED_PREVIEW_HOSTS = /* @__PURE__ */ new Set([
	"preview.grok.genai.mil",
	"preview.grok.mil",
	"preview.grokgsac.com"
]);
var PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;
function previewPathPrefix(hostname, pathname) {
	if (!PATH_BASED_PREVIEW_HOSTS.has(hostname.toLowerCase())) return void 0;
	return PORT_ID_PREFIX.exec(pathname)?.[0];
}
function prefixRewrite(prefix) {
	return {
		input: ({ url }) => {
			if (url.pathname === prefix) url.pathname = "/";
			else if (url.pathname.startsWith(`${prefix}/`)) url.pathname = url.pathname.slice(prefix.length);
			return url;
		},
		output: ({ url }) => {
			url.pathname = `${prefix}${url.pathname}`;
			return url;
		}
	};
}
function previewPathRewrite() {
	if (typeof window === "undefined") return void 0;
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
	return prefix ? prefixRewrite(prefix) : void 0;
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	return useSessionUserState();
}
function useSessionUserState() {
	const { data, isPending } = authClient.useSession();
	const id = data?.user.id;
	const displayName = data?.user.name ?? null;
	const primaryEmail = data?.user.email ?? null;
	const profileImageUrl = data?.user.image ?? null;
	const user = (0, import_react.useMemo)(() => id ? {
		id,
		displayName,
		primaryEmail,
		profileImageUrl,
		isDevFallback: false
	} : null, [
		id,
		displayName,
		primaryEmail,
		profileImageUrl
	]);
	return (0, import_react.useMemo)(() => ({
		user,
		isPending
	}), [user, isPending]);
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
var NAV = [
	{
		href: "/",
		label: "Vol"
	},
	{
		href: "/screener",
		label: "Screener"
	},
	{
		href: "/equities",
		label: "Equities"
	},
	{
		href: "/rates",
		label: "Rates"
	},
	{
		href: "/commodities",
		label: "Commodities"
	},
	{
		href: "/fx",
		label: "FX"
	},
	{
		href: "/macro",
		label: "Macro"
	},
	{
		href: "/lab",
		label: "Strategy lab"
	},
	{
		href: "/portfolio",
		label: "Portfolio"
	}
];
function Mark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className: "h-7 w-7 shrink-0",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "32",
				height: "32",
				rx: "8",
				className: "fill-accent"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M7 22c4-1 6-6 9-8 2.2-1.4 4.2-1.2 6 .4 1.2 1.1 1.6 2.2 1.2 3.2",
				fill: "none",
				className: "stroke-accent-ink",
				strokeWidth: "2.2",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "7",
				cy: "22",
				r: "1.35",
				className: "fill-accent-ink"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16",
				cy: "14",
				r: "1.35",
				className: "fill-accent-ink"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "23.2",
				cy: "17.6",
				r: "1.35",
				className: "fill-accent-ink"
			})
		]
	});
}
function NavLinks({ path, stacked }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: stacked ? "flex flex-col gap-1" : "flex w-max flex-nowrap gap-1",
		children: NAV.map((item) => {
			const active = item.href === "/" ? path === "/" : path === item.href;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: item.href,
				"aria-current": active ? "page" : void 0,
				className: "min-h-11 shrink-0 rounded-md px-3 py-2 text-sm " + (active ? "bg-surface text-fg" : "text-muted hover:bg-surface hover:text-fg"),
				children: item.label
			}, item.href);
		})
	});
}
function AccountSlot() {
	const { user, isPending } = useCurrentUserState();
	const [live, setLive] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setLive(true), []);
	if (!live || isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-11 w-24 rounded-md bg-surface",
		"aria-hidden": "true"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/login",
		className: "inline-flex min-h-11 items-center text-sm text-muted",
		children: "Sign in"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {});
}
function ThemeSwitch() {
	const [theme, setTheme] = (0, import_react.useState)("dark");
	(0, import_react.useEffect)(() => {
		setTheme(document.documentElement.dataset.theme === "day" ? "day" : "dark");
	}, []);
	function choose(next) {
		document.documentElement.dataset.theme = next;
		try {
			localStorage.setItem("fathom-theme", next);
		} catch {}
		const meta = document.querySelector("meta[name=\"theme-color\"]");
		if (meta) meta.setAttribute("content", next === "day" ? "#F4F4F2" : "#000000");
		setTheme(next);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex rounded-md border border-line p-1",
		role: "group",
		"aria-label": "Appearance",
		children: ["day", "dark"].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-pressed": theme === key,
			onClick: () => choose(key),
			className: "min-h-11 flex-1 rounded-sm px-3 text-sm " + (theme === key ? "bg-accent text-accent-ink" : "text-muted hover:text-fg"),
			children: key === "day" ? "Day" : "Dark"
		}, key))
	});
}
function Shell({ children }) {
	const path = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "lg:flex lg:min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "hidden w-56 shrink-0 flex-col border-r border-line lg:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex items-center gap-3 px-4 py-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-display text-lg font-medium leading-none tracking-tight text-fg",
							children: "Yieldroll"
						}) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLinks, {
							path,
							stacked: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto space-y-3 px-4 py-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountSlot, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeSwitch, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs leading-relaxed text-faint",
								children: "Nasdaq end-of-day, quote feed, ECB, EDGAR."
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "border-b border-line lg:hidden",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3 px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/",
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-display text-lg font-medium leading-none tracking-tight",
										children: "Yieldroll"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-36 shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeSwitch, {})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center gap-3 px-2 pb-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountSlot, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-x-auto px-2 pb-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLinks, { path })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						id: "content",
						children
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
						className: "border-t border-line px-4 py-4 text-xs text-faint sm:px-6",
						children: "Prices from Nasdaq end-of-day where that table exists, otherwise the quote feed. NSE bhavcopy is requested and named when it answers. Bond funds are prices, not yields, unless the row says yield. Greeks are Black–Scholes–Merton on the listed implied volatility. ECB rates via Frankfurter. EIA storage and Open-Meteo weather on energy contracts. Not advice."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CsvFallback, {})
		]
	});
}
var styles_default = "/assets/styles-BEK3OJky.css";
var THEME_BOOT = "try{var t=localStorage.getItem('fathom-theme');document.documentElement.dataset.theme=t==='day'?'day':'dark';}catch(e){document.documentElement.dataset.theme='dark';}";
/** Same host gate the injector uses for og:image: public hostname only. */
function shareHost(raw) {
	const host = String(raw ?? "").split(",")[0]?.trim().split(":")[0]?.toLowerCase();
	if (!host || !/^[a-z0-9.-]+$/.test(host) || !host.includes(".")) return "";
	if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return "";
	if (host === "vercel.app" || host.endsWith(".vercel.app") || host === "vercel.com" || host.endsWith(".vercel.com")) return "";
	return host;
}
function resolveShareHost() {
	const fromEnv = shareHost(void 0);
	if (fromEnv) return fromEnv;
	if (typeof window !== "undefined") return shareHost(window.location.host);
	return "";
}
var Route$11 = createRootRoute({
	head: () => {
		const host = resolveShareHost();
		const meta = [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Yieldroll" },
			{
				name: "description",
				content: "Yieldroll. Cross-asset vol, rates, and equity screens from public market feeds."
			},
			{
				name: "theme-color",
				content: "#000000"
			}
		];
		if (host) {
			const xBanner = `https://${host}/x-banner.jpg`;
			meta.push({
				property: "x:game:image",
				content: xBanner
			});
		}
		return {
			meta,
			links: [
				{
					rel: "icon",
					type: "image/svg+xml",
					href: "/favicon.svg"
				},
				{
					rel: "preconnect",
					href: "https://fonts.googleapis.com"
				},
				{
					rel: "preconnect",
					href: "https://fonts.gstatic.com",
					crossOrigin: "anonymous"
				},
				{
					rel: "stylesheet",
					href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
				},
				{
					rel: "stylesheet",
					href: styles_default
				},
				{
					rel: "manifest",
					href: "/__grok/manifest.webmanifest"
				},
				{
					rel: "apple-touch-icon",
					href: "/__grok/icon-180.png"
				}
			]
		};
	},
	component: Root
});
function Root() {
	const [client] = (0, import_react.useState)(() => new QueryClient({ defaultOptions: { queries: {
		retry: 1,
		refetchOnWindowFocus: false,
		staleTime: 6e4
	} } }));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: THEME_BOOT } }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
				client,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) })
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	});
}
var $$splitComponentImporter$9 = () => import("./routes-DnH3nMuG.mjs");
var Route$10 = createFileRoute("/")({
	head: () => ({ meta: [{ title: "Vol — Yieldroll" }] }),
	loader: () => getVolBoard(),
	pendingComponent: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNote, { label: "Loading the vol board" }),
	pendingMs: 200,
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./commodities-BwMLHz1z.mjs");
var SYMBOLS$2 = [...METALS, ...ENERGY].map((row) => row.symbol);
var Route$9 = createFileRoute("/commodities")({
	head: () => ({ meta: [{ title: "Commodities — Yieldroll" }] }),
	loader: () => getBoard({ data: { symbols: SYMBOLS$2 } }),
	pendingComponent: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNote, { label: "Loading" }),
	pendingMs: 200,
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./equities-BFzDZKvC.mjs");
var SYMBOLS$1 = equityBook("global", "stock").map((row) => row.symbol);
var Route$8 = createFileRoute("/equities")({
	validateSearch: (search) => {
		const symbol = searchSymbol(search.symbol);
		return symbol ? { symbol } : {};
	},
	head: () => ({ meta: [{ title: "Equities — Yieldroll" }] }),
	loader: () => getBoard({ data: { symbols: SYMBOLS$1 } }),
	pendingComponent: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNote, { label: "Loading" }),
	pendingMs: 200,
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./fx-C_5jXJ65.mjs");
var Route$7 = createFileRoute("/fx")({
	head: () => ({ meta: [{ title: "FX — Yieldroll" }] }),
	loader: () => Promise.all([getBoard({ data: { symbols: FX_PAIRS.map((row) => row.symbol) } }), getReference({ data: {} })]).then(([board, reference]) => ({
		board,
		reference
	})),
	pendingComponent: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNote, { label: "Loading" }),
	pendingMs: 200,
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./lab-BBD1CS8m.mjs");
var Route$6 = createFileRoute("/lab")({
	validateSearch: (search) => {
		const symbol = searchSymbol(search.symbol);
		return symbol ? { symbol } : {};
	},
	head: () => ({ meta: [{ title: "Strategy lab — Yieldroll" }] }),
	loader: () => getSeries({ data: {
		symbol: "^GSPC",
		range: "5y"
	} }),
	pendingComponent: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNote, { label: "Loading" }),
	pendingMs: 200,
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./login-P6GbpVSV.mjs");
var Route$5 = createFileRoute("/login")({
	head: () => ({ meta: [{ title: "Sign in — Yieldroll" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./macro-9wFboz83.mjs");
var Route$4 = createFileRoute("/macro")({
	head: () => ({ meta: [{ title: "Macro — Yieldroll" }] }),
	loader: () => getMacro({ data: {} }),
	pendingComponent: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNote, { label: "Loading" }),
	pendingMs: 200,
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./portfolio-CVLY1E9t.mjs");
var Route$3 = createFileRoute("/portfolio")({
	head: () => ({ meta: [{ title: "Portfolio — Yieldroll" }] }),
	loader: () => getBasket({ data: {
		symbols: [...PORTFOLIO_SEED],
		range: "1y"
	} }),
	pendingComponent: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNote, { label: "Loading" }),
	pendingMs: 200,
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./rates-BfPIuwcS.mjs");
var SYMBOLS = RATES_BOOKS.global.map((row) => row.symbol);
var Route$2 = createFileRoute("/rates")({
	head: () => ({ meta: [{ title: "Rates — Yieldroll" }] }),
	loader: () => Promise.all([getBoard({ data: { symbols: SYMBOLS } }), getOfficialRates({ data: {} })]).then(([board, official]) => ({
		board,
		official
	})),
	pendingComponent: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNote, { label: "Loading" }),
	pendingMs: 200,
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./screener-qaTsz-Kf.mjs");
var Route$1 = createFileRoute("/screener")({
	head: () => ({ meta: [{ title: "Screener — Yieldroll" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var Route = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
var rootRouteChildren = {
	IndexRoute: Route$10.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$11
	}),
	CommoditiesRoute: Route$9.update({
		id: "/commodities",
		path: "/commodities",
		getParentRoute: () => Route$11
	}),
	EquitiesRoute: Route$8.update({
		id: "/equities",
		path: "/equities",
		getParentRoute: () => Route$11
	}),
	FxRoute: Route$7.update({
		id: "/fx",
		path: "/fx",
		getParentRoute: () => Route$11
	}),
	LabRoute: Route$6.update({
		id: "/lab",
		path: "/lab",
		getParentRoute: () => Route$11
	}),
	LoginRoute: Route$5.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$11
	}),
	MacroRoute: Route$4.update({
		id: "/macro",
		path: "/macro",
		getParentRoute: () => Route$11
	}),
	PortfolioRoute: Route$3.update({
		id: "/portfolio",
		path: "/portfolio",
		getParentRoute: () => Route$11
	}),
	RatesRoute: Route$2.update({
		id: "/rates",
		path: "/rates",
		getParentRoute: () => Route$11
	}),
	ScreenerRoute: Route$1.update({
		id: "/screener",
		path: "/screener",
		getParentRoute: () => Route$11
	}),
	ApiAuthSplatRoute: Route.update({
		id: "/api/auth/$",
		path: "/api/auth/$",
		getParentRoute: () => Route$11
	})
};
var routeTree = Route$11._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		rewrite: previewPathRewrite(),
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { getOfficialRates as A, getBoard as C, getFilings as D, getEnergy as E, getSurface as F, getWorldBank as I, searchSymbols as L, getPrints as M, getReference as N, getMacro as O, getSeries as P, getBasket as S, getEcbHistory as T, TableExport as _, Route$6 as a, formatPx as b, Route$9 as c, Change as d, CsvButton as f, LivePrice as g, LiveMark as h, Route$4 as i, getOptions as j, getNews as k, Route$10 as l, FeedErrors as m, Route$2 as n, Route$7 as o, CsvRecords as p, Route$3 as r, Route$8 as s, router_exports as t, useCurrentUserState as u, createSsrRpc as v, getCot as w, formatVol as x, formatNum as y };
