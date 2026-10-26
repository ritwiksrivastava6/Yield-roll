import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as authMiddleware } from "./middleware-K0Uo91xt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-0Alc2Tnm.js
var SCREEN_KEYS = [
	"mode",
	"region",
	"country",
	"preset",
	"horizon",
	"sort",
	"minRet",
	"maxRet",
	"rsiMin",
	"rsiMax",
	"offHigh",
	"rvMin",
	"rvMax"
];
var SYMBOL = /^[A-Z0-9.^=-]{1,18}$/;
function asRecord(value) {
	if (!value || typeof value !== "object") return {};
	const out = {};
	for (const key of SCREEN_KEYS) {
		const item = value[key];
		if (typeof item === "string" && item.length < 40) out[key] = item;
	}
	return out;
}
function parseJson(text, fallback) {
	try {
		return JSON.parse(text);
	} catch {
		return fallback;
	}
}
var getDesk_createServerFn_handler = createServerRpc({
	id: "af873d8ea92d52c8b1a52c6e0a9a43ab935c1729288377a5cbb9c8127834f434",
	name: "getDesk",
	filename: "src/lib/desk/api.ts"
}, (opts) => getDesk.__executeServer(opts));
var getDesk = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getDesk_createServerFn_handler, async ({ context }) => {
	const { getSql } = await import("./db-COimJ07D.mjs").then((n) => n.t).then((n) => n.t);
	const row = (await (await getSql())`
      select screen, symbols, weights from desk_state where user_id = ${context.userId}
    `)[0];
	if (!row) return {
		screen: {},
		symbols: [],
		weights: {}
	};
	return {
		screen: parseJson(row.screen, {}),
		symbols: parseJson(row.symbols, []).filter((symbol) => SYMBOL.test(symbol)).slice(0, 8),
		weights: parseJson(row.weights, {})
	};
});
var saveScreen_createServerFn_handler = createServerRpc({
	id: "de66d4c738f9b8759541793165a7fc57d5e3cbcd23cf26c5b9d5ced0c2564e2f",
	name: "saveScreen",
	filename: "src/lib/desk/api.ts"
}, (opts) => saveScreen.__executeServer(opts));
var saveScreen = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => asRecord(input)).handler(saveScreen_createServerFn_handler, async ({ context, data }) => {
	const { getSql } = await import("./db-COimJ07D.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const payload = JSON.stringify(data);
	await sql`
      insert into desk_state (user_id, screen)
      values (${context.userId}, ${payload})
      on conflict (user_id) do update set screen = ${payload}, updated_at = now()
    `;
	return { ok: true };
});
var saveBook_createServerFn_handler = createServerRpc({
	id: "c075ae8ffa5f3db5e7741f89e548f07d75691a0f639e95fee2bda0a1656ad20c",
	name: "saveBook",
	filename: "src/lib/desk/api.ts"
}, (opts) => saveBook.__executeServer(opts));
var saveBook = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const symbols = Array.isArray(input?.symbols) ? [...new Set(input.symbols.map((symbol) => String(symbol).trim().toUpperCase()))].filter((symbol) => SYMBOL.test(symbol)).slice(0, 8) : [];
	if (symbols.length < 2) throw new Error("The book needs two names");
	const raw = input?.weights && typeof input.weights === "object" ? input.weights : {};
	const weights = {};
	for (const symbol of symbols) {
		const value = raw[symbol];
		weights[symbol] = typeof value === "string" && value.length < 12 ? value : "";
	}
	return {
		symbols,
		weights
	};
}).handler(saveBook_createServerFn_handler, async ({ context, data }) => {
	const { getSql } = await import("./db-COimJ07D.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const symbols = JSON.stringify(data.symbols);
	const weights = JSON.stringify(data.weights);
	await sql`
      insert into desk_state (user_id, symbols, weights)
      values (${context.userId}, ${symbols}, ${weights})
      on conflict (user_id) do update set symbols = ${symbols}, weights = ${weights}, updated_at = now()
    `;
	return { ok: true };
});
var listAlerts_createServerFn_handler = createServerRpc({
	id: "59c17942429d83a63d76209fdec8112ac80d2310e1dd18be039f4efacc0ad7e9",
	name: "listAlerts",
	filename: "src/lib/desk/api.ts"
}, (opts) => listAlerts.__executeServer(opts));
var listAlerts = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listAlerts_createServerFn_handler, async ({ context }) => {
	const { getSql } = await import("./db-COimJ07D.mjs").then((n) => n.t).then((n) => n.t);
	return (await (await getSql())`
      select id, kind, symbol, side, level from desk_alert where user_id = ${context.userId} order by id desc
    `).map((row) => ({
		...row,
		level: row.level == null ? null : Number(row.level)
	}));
});
var armAlert_createServerFn_handler = createServerRpc({
	id: "06ce242737478e9126f4d40377d2a9aecaa12ca10d27ba45cb41f918b55909d7",
	name: "armAlert",
	filename: "src/lib/desk/api.ts"
}, (opts) => armAlert.__executeServer(opts));
var armAlert = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const kind = input?.kind === "filing" ? "filing" : input?.kind === "vol" ? "vol" : input?.kind === "screen" ? "screen" : "";
	if (!kind) throw new Error("Unknown alert");
	if (kind === "screen") return {
		kind,
		symbol: "SCREEN",
		side: "above",
		level: null
	};
	const symbol = String(input?.symbol ?? "").trim().toUpperCase();
	if (!SYMBOL.test(symbol)) throw new Error("Bad symbol");
	const side = input?.side === "below" ? "below" : "above";
	const level = kind === "vol" ? Number(input?.level) : null;
	if (kind === "vol" && !(level === 20 || level === 80)) throw new Error("Level is 20 or 80");
	return {
		kind,
		symbol,
		side,
		level
	};
}).handler(armAlert_createServerFn_handler, async ({ context, data }) => {
	const { getSql } = await import("./db-COimJ07D.mjs").then((n) => n.t).then((n) => n.t);
	await (await getSql())`
      insert into desk_alert (user_id, kind, symbol, side, level)
      values (${context.userId}, ${data.kind}, ${data.symbol}, ${data.side}, ${data.level})
      on conflict (user_id, kind, symbol, side) do nothing
    `;
	return { ok: true };
});
var noteScreen_createServerFn_handler = createServerRpc({
	id: "8bb72648a6db9da6cd1fe5b4fa56d8813fd6aae46773851a9ab23fa809d571df",
	name: "noteScreen",
	filename: "src/lib/desk/api.ts"
}, (opts) => noteScreen.__executeServer(opts));
var noteScreen = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const preset = String(input?.preset ?? "");
	if (!/^[a-z0-9]{1,16}$/.test(preset)) throw new Error("Bad screen");
	const scope = String(input?.scope ?? "");
	if (!/^[a-z0-9:-]{1,24}$/.test(scope)) throw new Error("Bad scope");
	return {
		preset,
		scope,
		symbols: Array.isArray(input?.symbols) ? [...new Set(input.symbols.map((symbol) => String(symbol).trim().toUpperCase()))].filter((symbol) => SYMBOL.test(symbol)).sort().slice(0, 80) : []
	};
}).handler(noteScreen_createServerFn_handler, async ({ context, data }) => {
	const { getSql } = await import("./db-COimJ07D.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const alert = (await sql`
      select id, last_key from desk_alert where user_id = ${context.userId} and kind = 'screen' and symbol = 'SCREEN' limit 1
    `)[0];
	if (!alert) return {
		armed: false,
		added: []
	};
	const prefix = `${data.preset}|${data.scope}|`;
	const prior = alert.last_key.startsWith(prefix) ? alert.last_key.slice(prefix.length).split(",").filter(Boolean) : null;
	const added = prior ? data.symbols.filter((symbol) => !prior.includes(symbol)) : [];
	if (added.length) {
		const listed = added.slice(0, 8).join(", ");
		const extra = added.length > 8 ? ` +${added.length - 8}` : "";
		const body = `New on ${data.preset}: ${listed}${extra}.`;
		await sql`insert into desk_ping (user_id, body) values (${context.userId}, ${body})`;
	}
	const nextKey = prefix + data.symbols.join(",");
	if (nextKey !== alert.last_key) await sql`update desk_alert set last_key = ${nextKey} where id = ${alert.id} and user_id = ${context.userId}`;
	return {
		armed: true,
		added
	};
});
var dropAlert_createServerFn_handler = createServerRpc({
	id: "54118212d3ceae4b7864c3be065b5d2209ffe5457981cba4aef556d77e933795",
	name: "dropAlert",
	filename: "src/lib/desk/api.ts"
}, (opts) => dropAlert.__executeServer(opts));
var dropAlert = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const id = Number(input?.id);
	if (!Number.isInteger(id) || id < 1) throw new Error("Bad alert");
	return { id };
}).handler(dropAlert_createServerFn_handler, async ({ context, data }) => {
	const { getSql } = await import("./db-COimJ07D.mjs").then((n) => n.t).then((n) => n.t);
	await (await getSql())`delete from desk_alert where id = ${data.id} and user_id = ${context.userId}`;
	return { ok: true };
});
var pullPings_createServerFn_handler = createServerRpc({
	id: "b3e4af99c111b57f9bd4346a885d70901ca31a388ebcfeb1bb7555d6c6f665f3",
	name: "pullPings",
	filename: "src/lib/desk/api.ts"
}, (opts) => pullPings.__executeServer(opts));
var pullPings = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(pullPings_createServerFn_handler, async ({ context }) => {
	const { getSql } = await import("./db-COimJ07D.mjs").then((n) => n.t).then((n) => n.t);
	const { loadVolSymbol } = await import("./eod.server-BaztjvvJ.mjs");
	const { loadLatest8k } = await import("./load.server-CcFyc4oW.mjs");
	const sql = await getSql();
	const alerts = await sql`
      select id, kind, symbol, side, level, last_value, last_key from desk_alert where user_id = ${context.userId} order by id
    `;
	for (const alert of alerts.slice(0, 24)) {
		if (alert.kind === "vol") {
			const now = (await loadVolSymbol(alert.symbol))?.pct ?? null;
			const level = alert.level == null ? null : Number(alert.level);
			const prev = alert.last_value == null ? null : Number(alert.last_value);
			if (now != null && level != null && prev != null) {
				if (alert.side === "below" ? prev > level && now <= level : prev < level && now >= level) {
					const body = `${alert.symbol} 21-day vol percentile is ${now.toFixed(0)}, through ${level.toFixed(0)}.`;
					await sql`insert into desk_ping (user_id, body) values (${context.userId}, ${body})`;
				}
			}
			if (now != null) await sql`update desk_alert set last_value = ${now} where id = ${alert.id} and user_id = ${context.userId}`;
		}
		if (alert.kind === "filing") {
			const filing = await loadLatest8k(alert.symbol);
			if (filing.url && alert.last_key && filing.url !== alert.last_key) {
				const body = `${alert.symbol} filed ${filing.form || "8-K"} on ${filing.filed}.`;
				await sql`insert into desk_ping (user_id, body) values (${context.userId}, ${body})`;
			}
			if (filing.url) await sql`update desk_alert set last_key = ${filing.url} where id = ${alert.id} and user_id = ${context.userId}`;
		}
	}
	return (await sql`
      select id, body, seen, created_at from desk_ping where user_id = ${context.userId} order by id desc limit 12
    `).map((row) => ({
		id: row.id,
		body: row.body,
		seen: row.seen,
		created: String(row.created_at).slice(0, 16)
	}));
});
var markPings_createServerFn_handler = createServerRpc({
	id: "fc48ac534157e80499bddce38534a2f80586634e23cd7b62c613fcf84829afdc",
	name: "markPings",
	filename: "src/lib/desk/api.ts"
}, (opts) => markPings.__executeServer(opts));
var markPings = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(markPings_createServerFn_handler, async ({ context }) => {
	const { getSql } = await import("./db-COimJ07D.mjs").then((n) => n.t).then((n) => n.t);
	await (await getSql())`update desk_ping set seen = true where user_id = ${context.userId} and seen = false`;
	return { ok: true };
});
//#endregion
export { armAlert_createServerFn_handler, dropAlert_createServerFn_handler, getDesk_createServerFn_handler, listAlerts_createServerFn_handler, markPings_createServerFn_handler, noteScreen_createServerFn_handler, pullPings_createServerFn_handler, saveBook_createServerFn_handler, saveScreen_createServerFn_handler };
