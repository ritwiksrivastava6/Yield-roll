import { o as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/download-CGNcFT4o.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cell(value) {
	if (value == null) return "";
	const text = String(value);
	if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, "\"\"")}"`;
	return text;
}
function downloadCsv(file, columns, rows) {
	const lines = [columns, ...rows].map((row) => row.map(cell).join(",")).join("\r\n");
	const blob = new Blob([lines], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = file.toLowerCase().endsWith(".csv") ? file : `${file}.csv`;
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
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
//#endregion
export { CsvRecords as n, TableExport as r, CsvButton as t };
