import { o as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { L as searchSymbols } from "./router-C6cpCEFu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/symbol-search-Ca4zHxbE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SymbolSearch({ scope, placeholder, onPick }) {
	const [raw, setRaw] = (0, import_react.useState)("");
	const [q, setQ] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const id = window.setTimeout(() => setQ(raw.trim()), 250);
		return () => window.clearTimeout(id);
	}, [raw]);
	const query = useQuery({
		queryKey: [
			"symbol-search",
			scope,
			q
		],
		queryFn: () => searchSymbols({ data: {
			q,
			scope
		} }),
		enabled: q.length >= 1,
		staleTime: 6e4
	});
	const hits = query.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "block text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted",
				children: "Find a listing"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: raw,
				onChange: (e) => {
					setRaw(e.target.value);
					setOpen(true);
				},
				onFocus: () => setOpen(true),
				placeholder,
				className: "mt-1 min-h-11 w-full rounded-md border border-line bg-surface px-3 text-fg"
			})]
		}), open && q ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute left-0 right-0 top-full z-10 mt-1 max-h-64 overflow-auto rounded-md border border-line bg-bg-elev",
			children: [
				query.isFetching && !hits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-3 py-3 text-sm text-muted",
					children: "Searching Yahoo…"
				}) : null,
				query.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-3 py-3 text-sm text-down",
					children: "Search did not return."
				}) : null,
				!query.isFetching && !query.isError && !hits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-3 py-3 text-sm text-muted",
					children: scope === "rates" ? "No bond, future, or yield matched." : scope === "commodity" ? "No metal or energy contract matched." : scope === "fx" ? "No currency pair matched." : scope === "any" || scope === "equity" ? "No listing matched." : "No listing matched that market."
				}) : null,
				hits.map((hit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						onPick(hit);
						setRaw("");
						setQ("");
						setOpen(false);
					},
					className: "flex min-h-11 w-full items-baseline justify-between gap-3 border-t border-line px-3 py-2 text-left first:border-t-0 hover:bg-surface",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm text-fg",
						children: hit.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-faint",
						children: [
							hit.symbol,
							" · ",
							hit.exchDisp || hit.exchange,
							" · ",
							hit.type
						]
					})] })
				}, hit.symbol))
			]
		}) : null]
	});
}
//#endregion
export { SymbolSearch as t };
