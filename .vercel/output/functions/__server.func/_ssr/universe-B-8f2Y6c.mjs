//#region node_modules/.nitro/vite/services/ssr/assets/universe-B-8f2Y6c.js
function mean(xs) {
	let s = 0;
	for (const x of xs) s += x;
	return s / xs.length;
}
function pearson(xs, ys) {
	if (xs.length !== ys.length || xs.length < 20) return null;
	const mx = mean(xs);
	const my = mean(ys);
	let num = 0;
	let dx = 0;
	let dy = 0;
	for (let i = 0; i < xs.length; i++) {
		const a = xs[i] - mx;
		const b = ys[i] - my;
		num += a * b;
		dx += a * a;
		dy += b * b;
	}
	if (dx === 0 || dy === 0) return null;
	return num / Math.sqrt(dx * dy);
}
function stdevSample(xs) {
	if (xs.length < 2) return 0;
	const m = mean(xs);
	let v = 0;
	for (const x of xs) v += (x - m) * (x - m);
	return Math.sqrt(v / (xs.length - 1));
}
function sma(values, n) {
	const out = Array(values.length).fill(null);
	if (n <= 0) return out;
	let sum = 0;
	for (let i = 0; i < values.length; i++) {
		sum += values[i];
		if (i >= n) sum -= values[i - n];
		if (i >= n - 1) out[i] = sum / n;
	}
	return out;
}
function rsi(values, n = 14) {
	const out = Array(values.length).fill(null);
	if (values.length <= n) return out;
	let gain = 0;
	let loss = 0;
	for (let i = 1; i <= n; i++) {
		const d = values[i] - values[i - 1];
		if (d >= 0) gain += d;
		else loss -= d;
	}
	gain /= n;
	loss /= n;
	out[n] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
	for (let i = n + 1; i < values.length; i++) {
		const d = values[i] - values[i - 1];
		const g = d > 0 ? d : 0;
		const l = d < 0 ? -d : 0;
		gain = (gain * (n - 1) + g) / n;
		loss = (loss * (n - 1) + l) / n;
		out[i] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
	}
	return out;
}
function solveLinear(matrix, vector) {
	const n = matrix.length;
	const m = matrix.map((row, i) => [...row, vector[i]]);
	for (let col = 0; col < n; col++) {
		let pivot = col;
		let max = Math.abs(m[col][col]);
		for (let r = col + 1; r < n; r++) {
			const v = Math.abs(m[r][col]);
			if (v > max) {
				max = v;
				pivot = r;
			}
		}
		if (max < 1e-12) return null;
		if (pivot !== col) {
			const tmp = m[col];
			m[col] = m[pivot];
			m[pivot] = tmp;
		}
		const div = m[col][col];
		for (let c = col; c <= n; c++) m[col][c] /= div;
		for (let r = 0; r < n; r++) {
			if (r === col) continue;
			const f = m[r][col];
			if (f === 0) continue;
			for (let c = col; c <= n; c++) m[r][c] -= f * m[col][c];
		}
	}
	return m.map((row) => row[n]);
}
function ols(y, x) {
	const n = y.length;
	const k = x[0]?.length ?? 0;
	if (n <= k + 2 || k === 0) return null;
	const xtx = Array.from({ length: k }, () => Array(k).fill(0));
	const xty = Array(k).fill(0);
	for (let i = 0; i < n; i++) for (let a = 0; a < k; a++) {
		xty[a] += x[i][a] * y[i];
		for (let b = a; b < k; b++) xtx[a][b] += x[i][a] * x[i][b];
	}
	for (let a = 0; a < k; a++) for (let b = 0; b < a; b++) xtx[a][b] = xtx[b][a];
	const beta = solveLinear(xtx, xty);
	if (!beta) return null;
	let sse = 0;
	for (let i = 0; i < n; i++) {
		let yhat = 0;
		for (let a = 0; a < k; a++) yhat += x[i][a] * beta[a];
		const e = y[i] - yhat;
		sse += e * e;
	}
	const sigma2 = sse / (n - k);
	const se = beta.map((_, j) => {
		const eye = Array(k).fill(0);
		eye[j] = 1;
		const col = solveLinear(xtx, eye);
		if (!col) return NaN;
		return Math.sqrt(Math.max(0, sigma2 * col[j]));
	});
	if (se.some((s) => !Number.isFinite(s))) return null;
	return {
		beta,
		t: beta.map((b, i) => se[i] > 0 ? b / se[i] : 0),
		n,
		k
	};
}
/** Augmented Dickey–Fuller with a constant, no trend. Critical values are the large-sample MacKinnon approximations. */
function adf(series) {
	const n = series.length;
	if (n < 40) return null;
	const lags = Math.min(12, Math.max(1, Math.floor(12 * Math.pow((n - 1) / 100, .25))));
	const diffs = [];
	for (let i = 1; i < n; i++) diffs.push(series[i] - series[i - 1]);
	const y = [];
	const x = [];
	for (let t = lags + 1; t < n; t++) {
		const row = [1, series[t - 1]];
		for (let j = 1; j <= lags; j++) row.push(diffs[t - j - 1]);
		y.push(diffs[t - 1]);
		x.push(row);
	}
	const fit = ols(y, x);
	if (!fit) return null;
	const tStat = fit.t[1];
	const crit = {
		p1: -3.43,
		p5: -2.86,
		p10: -2.57
	};
	let rejectAt = null;
	if (tStat < crit.p1) rejectAt = "1%";
	else if (tStat < crit.p5) rejectAt = "5%";
	else if (tStat < crit.p10) rejectAt = "10%";
	return {
		tStat,
		beta: fit.beta[1],
		lags,
		n: fit.n,
		crit,
		rejectAt,
		stationaryAt5: tStat < crit.p5
	};
}
function halfLife(series) {
	if (series.length < 30) return null;
	const y = [];
	const x = [];
	for (let t = 1; t < series.length; t++) {
		y.push(series[t] - series[t - 1]);
		x.push([1, series[t - 1]]);
	}
	const fit = ols(y, x);
	if (!fit) return null;
	const b = fit.beta[1];
	return {
		beta: b,
		halfLife: b < -1e-8 ? -Math.log(2) / b : null,
		tStat: fit.t[1],
		n: fit.n
	};
}
function hurstRS(returns) {
	if (returns.length < 64) return null;
	const xs = [];
	const ys = [];
	for (let n = 16; n <= returns.length / 2; n = Math.floor(n * 1.5)) {
		const chunks = Math.floor(returns.length / n);
		if (chunks < 1) break;
		let acc = 0;
		let used = 0;
		for (let c = 0; c < chunks; c++) {
			const slice = returns.slice(c * n, (c + 1) * n);
			const m = mean(slice);
			let cum = 0;
			let hi = -Infinity;
			let lo = Infinity;
			for (const v of slice) {
				cum += v - m;
				if (cum > hi) hi = cum;
				if (cum < lo) lo = cum;
			}
			const s = stdevSample(slice);
			if (s > 0 && hi > lo) {
				acc += (hi - lo) / s;
				used++;
			}
		}
		if (used === 0) continue;
		xs.push(Math.log(n));
		ys.push(Math.log(acc / used));
	}
	if (xs.length < 3) return null;
	const fit = ols(ys, xs.map((v) => [1, v]));
	if (!fit) return null;
	const h = fit.beta[1];
	return Number.isFinite(h) ? h : null;
}
function varianceRatio(returns, q) {
	const n = returns.length;
	if (q < 2 || n < q * 4) return null;
	const mu = mean(returns);
	let v1 = 0;
	for (const r of returns) v1 += (r - mu) * (r - mu);
	v1 /= n - 1;
	if (v1 === 0) return null;
	const qrets = [];
	for (let i = q - 1; i < n; i++) {
		let s = 0;
		for (let j = 0; j < q; j++) s += returns[i - j];
		qrets.push(s);
	}
	const muq = mean(qrets);
	let vq = 0;
	for (const r of qrets) vq += (r - muq) * (r - muq);
	vq /= qrets.length - 1;
	return vq / (q * v1);
}
function acf(values, lag) {
	if (values.length <= lag + 5) return null;
	const m = mean(values);
	let den = 0;
	for (const v of values) den += (v - m) * (v - m);
	if (den === 0) return null;
	let num = 0;
	for (let i = lag; i < values.length; i++) num += (values[i] - m) * (values[i - lag] - m);
	return num / den;
}
function logReturns(closes) {
	const out = [];
	for (let i = 1; i < closes.length; i++) out.push(Math.log(closes[i] / closes[i - 1]));
	return out;
}
function rollingZ(closes, i, window) {
	if (i < window - 1) return null;
	const slice = closes.slice(i - window + 1, i + 1);
	const sd = stdevSample(slice);
	if (sd === 0) return null;
	return (closes[i] - mean(slice)) / sd;
}
function median(xs) {
	const s = [...xs].sort((a, b) => a - b);
	const m = Math.floor(s.length / 2);
	return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function sharpe(daily) {
	if (daily.length < 10) return null;
	const sd = stdevSample(daily);
	if (sd === 0) return null;
	return mean(daily) / sd * Math.sqrt(252);
}
function maxDrawdownPct(equity) {
	if (!equity.length) return null;
	let peak = equity[0];
	let max = 0;
	for (const e of equity) {
		if (e > peak) peak = e;
		const dd = e / peak - 1;
		if (dd < max) max = dd;
	}
	return max * 100;
}
function summarize(daily, turns, active, equity) {
	let grossWin = 0;
	let grossLoss = 0;
	let equityEnd = 1;
	for (const p of daily) {
		if (p > 0) grossWin += p;
		else grossLoss -= p;
		equityEnd *= 1 + p;
	}
	const days = daily.length;
	return {
		totalReturn: (equityEnd - 1) * 100,
		cagr: days > 5 && equityEnd > 0 ? (Math.pow(equityEnd, 252 / days) - 1) * 100 : null,
		sharpe: sharpe(daily),
		maxDrawdown: maxDrawdownPct(equity),
		turns,
		exposure: days ? active / days * 100 : 0,
		profitFactor: grossLoss > 0 ? grossWin / grossLoss : null
	};
}
function fadeDesired(closes, i, window, entry, exit, prev) {
	const z = rollingZ(closes, i, window);
	if (z == null) return prev;
	if (z >= entry) return -1;
	if (z <= -entry) return 1;
	if (Math.abs(z) <= exit) return 0;
	return prev;
}
function runPath(closes, dates, start, decide, cost) {
	const daily = [];
	const equity = [1];
	let held = 0;
	let turns = 0;
	let active = 0;
	let eq = 1;
	for (let i = start; i < closes.length - 1; i++) {
		const desired = decide(i, held);
		if (desired !== held) turns += 1;
		const pnl = desired * (closes[i + 1] / closes[i] - 1) - Math.abs(desired - held) * cost;
		daily.push(pnl);
		if (desired !== 0) active += 1;
		eq *= 1 + pnl;
		equity.push(eq);
		held = desired;
	}
	const lastPos = fadeSafeLast(closes, start, decide, held);
	return {
		daily,
		equity,
		turns,
		active,
		lastPos
	};
}
function fadeSafeLast(closes, start, decide, heldAfterLoop) {
	if (closes.length - 1 > start) return decide(closes.length - 1, heldAfterLoop);
	return heldAfterLoop;
}
function priorBand(bars, i, n) {
	if (i < n) return null;
	let hi = -Infinity;
	let lo = Infinity;
	for (let k = i - n; k < i; k++) {
		if (bars[k].h > hi) hi = bars[k].h;
		if (bars[k].l < lo) lo = bars[k].l;
	}
	if (!(hi >= lo) || !Number.isFinite(hi) || !Number.isFinite(lo)) return null;
	return {
		hi,
		lo
	};
}
function channelDesired(bars, i, n, prev) {
	const band = priorBand(bars, i, n);
	if (!band) return prev;
	if (bars[i].c > band.hi) return 1;
	if (bars[i].c < band.lo) return -1;
	return prev;
}
function bandState(bars, n) {
	const i = bars.length - 1;
	const band = priorBand(bars, i, n);
	if (!band) return {
		text: `Not enough sessions for a ${n}-day range`,
		location: null
	};
	const close = bars[i].c;
	const span = band.hi - band.lo;
	const location = span > 0 ? (close - band.lo) / span * 100 : null;
	return {
		text: close > band.hi ? `Close is above the prior ${n}-session high` : close < band.lo ? `Close is below the prior ${n}-session low` : `Close is inside the prior ${n}-session range`,
		location
	};
}
function buildTape(bars) {
	const i = bars.length - 1;
	const b20 = bandState(bars, 20);
	const b50 = bandState(bars, 50);
	let nr7 = false;
	if (i >= 6) {
		const range = bars[i].h - bars[i].l;
		nr7 = range >= 0;
		for (let k = i - 6; k < i; k++) if (bars[k].h - bars[k].l <= range) nr7 = false;
	}
	const prev = i > 0 ? bars[i - 1].c : null;
	const gapPct = prev && prev > 0 ? (bars[i].o / prev - 1) * 100 : null;
	let streak = 0;
	for (let k = i; k > 0; k--) {
		const step = Math.sign(bars[k].c - bars[k - 1].c);
		if (step === 0) break;
		if (streak === 0) streak = step;
		else if (Math.sign(streak) !== step) break;
		else streak += step;
	}
	return {
		date: bars[i].d,
		breakout20: b20.text,
		breakout50: b50.text,
		location20: b20.location,
		nr7,
		gapPct,
		streak
	};
}
function fmtSharpe(n) {
	return n == null || !Number.isFinite(n) ? "n/a" : n.toFixed(2);
}
function runLab(bars, params) {
	const closes = bars.map((b) => b.c).filter((c) => c > 0);
	if (closes.length !== bars.length) return null;
	if (bars.length < 80) return null;
	const window = Math.min(120, Math.max(10, Math.round(params.window)));
	const entryZ = Math.min(3.5, Math.max(.5, params.entryZ));
	const exitZ = Math.min(entryZ - .05, Math.max(0, params.exitZ));
	const cost = Math.min(100, Math.max(0, params.costBps)) / 1e4;
	const slow = 50;
	const smaFast = sma(closes, 20);
	const smaSlow = sma(closes, slow);
	const logs = bars.map((b) => Math.log(b.c));
	const rets = logReturns(closes);
	const adfLevel = adf(logs);
	const adfReturn = adf(rets);
	const hl = halfLife(logs);
	const hurst = hurstRS(rets);
	const vr = [
		2,
		5,
		10
	].map((q) => {
		const value = varianceRatio(rets, q);
		return value == null ? null : {
			q,
			value
		};
	}).filter((v) => v != null);
	const acfRows = [
		1,
		5,
		10
	].map((lag) => {
		const value = acf(rets, lag);
		return value == null ? null : {
			lag,
			value
		};
	}).filter((v) => v != null);
	const acfAbs1 = acf(rets.map((r) => Math.abs(r)), 1);
	const start = Math.max(window, slow) - 1;
	const horizon = 5;
	const bucketDefs = [
		{
			label: "z ≤ −2",
			test: (z) => z <= -2
		},
		{
			label: "−2 < z ≤ −1",
			test: (z) => z > -2 && z <= -1
		},
		{
			label: "−1 < z ≤ 0",
			test: (z) => z > -1 && z <= 0
		},
		{
			label: "0 < z ≤ 1",
			test: (z) => z > 0 && z <= 1
		},
		{
			label: "1 < z ≤ 2",
			test: (z) => z > 1 && z <= 2
		},
		{
			label: "z > 2",
			test: (z) => z > 2
		}
	];
	const bucketVals = bucketDefs.map(() => []);
	for (let i = start; i < closes.length - horizon; i++) {
		const z = rollingZ(closes, i, window);
		if (z == null) continue;
		const fwd = (closes[i + horizon] / closes[i] - 1) * 100;
		const idx = bucketDefs.findIndex((b) => b.test(z));
		if (idx >= 0) bucketVals[idx].push(fwd);
	}
	const buckets = bucketDefs.map((b, i) => ({
		label: b.label,
		n: bucketVals[i].length,
		mean: bucketVals[i].length ? mean(bucketVals[i]) : 0,
		median: bucketVals[i].length ? median(bucketVals[i]) : 0
	}));
	let backtest = null;
	if (closes.length >= start + 30) {
		const dates = bars.map((b) => b.d);
		const fade = runPath(closes, dates, start, (i, prev) => fadeDesired(closes, i, window, entryZ, exitZ, prev), cost);
		const trend = runPath(closes, dates, start, (i, prev) => {
			const fast = smaFast[i];
			const slowMa = smaSlow[i];
			if (fast == null || slowMa == null) return prev;
			return fast > slowMa ? 1 : -1;
		}, cost);
		const hold = runPath(closes, dates, start, () => 1, cost);
		const channelRun = runPath(closes, dates, start, (i, prev) => channelDesired(bars, i, 20, prev), cost);
		backtest = {
			equity: fade.equity.map((eq, idx) => ({
				d: dates[start + idx] ?? dates[dates.length - 1],
				fade: eq,
				trend: trend.equity[idx] ?? trend.equity[trend.equity.length - 1],
				hold: hold.equity[idx] ?? hold.equity[hold.equity.length - 1],
				channel: channelRun.equity[idx] ?? channelRun.equity[channelRun.equity.length - 1]
			})),
			fade: summarize(fade.daily, fade.turns, fade.active, fade.equity),
			trend: summarize(trend.daily, trend.turns, trend.active, trend.equity),
			hold: summarize(hold.daily, hold.turns, hold.active, hold.equity),
			channel: summarize(channelRun.daily, channelRun.turns, channelRun.active, channelRun.equity)
		};
	}
	const sensitivity = [
		1,
		1.5,
		2
	].filter((e) => e > exitZ + .05).map((entry) => {
		if (closes.length < start + 30) return {
			entry,
			sharpe: null,
			total: 0
		};
		const run = runPath(closes, bars.map((b) => b.d), start, (i, prev) => fadeDesired(closes, i, window, entry, exitZ, prev), cost);
		const perf = summarize(run.daily, run.turns, run.active, run.equity);
		return {
			entry,
			sharpe: perf.sharpe,
			total: perf.totalReturn
		};
	});
	const latestZ = rollingZ(closes, closes.length - 1, window);
	let stance = "Flat";
	if (backtest) {
		let held = 0;
		for (let i = start; i < closes.length; i++) held = fadeDesired(closes, i, window, entryZ, exitZ, held);
		stance = held > 0 ? "Long" : held < 0 ? "Short" : "Flat";
	}
	let channelHeld = 0;
	let upBreaks = 0;
	let downBreaks = 0;
	for (let i = 20; i < bars.length; i++) {
		const prior = priorBand(bars, i, 20);
		if (!prior) continue;
		if (bars[i].c > prior.hi && channelHeld !== 1) upBreaks += 1;
		if (bars[i].c < prior.lo && channelHeld !== -1) downBreaks += 1;
		channelHeld = channelDesired(bars, i, 20, channelHeld);
	}
	const channelState = channelHeld > 0 ? "Long" : channelHeld < 0 ? "Short" : "Flat";
	const tape = buildTape(bars);
	const lines = [];
	if (adfLevel) lines.push(adfLevel.stationaryAt5 ? `ADF on the log price: t = ${adfLevel.tStat.toFixed(2)}, against a 5% critical value of ${adfLevel.crit.p5}. The unit-root null is rejected at 5% on this sample, so the level looks stationary around a constant.` : `ADF on the log price: t = ${adfLevel.tStat.toFixed(2)}, against a 5% critical value of ${adfLevel.crit.p5}. The unit-root null is not rejected at 5%. A constant-mean fade of the level is not supported here.`);
	if (adfReturn) lines.push(adfReturn.stationaryAt5 ? `ADF on log returns rejects a unit root at 5% (t = ${adfReturn.tStat.toFixed(2)}). That is the usual result for returns and a sanity check that the test is running on this series.` : `ADF on log returns does not reject a unit root at 5% (t = ${adfReturn.tStat.toFixed(2)}). That is unusual for daily returns and worth treating the rest of the sheet cautiously.`);
	if (hl) {
		if (hl.halfLife != null && hl.halfLife > 0 && hl.halfLife < 252) lines.push(`Ornstein–Uhlenbeck half-life of the log price is ${hl.halfLife.toFixed(1)} trading sessions (AR slope ${hl.beta.toFixed(3)}, t = ${hl.tStat.toFixed(2)}).`);
		else if (hl.beta >= 0) lines.push(`The AR(1) slope on the log price is ${hl.beta.toFixed(3)} (t = ${hl.tStat.toFixed(2)}). It is not negative, so this sample does not pull back to a constant mean.`);
		else if (hl.halfLife != null) lines.push(`The estimated half-life is ${hl.halfLife.toFixed(0)} sessions — a pullback, but too slow to treat as a practical fade inside a year.`);
	}
	if (hurst != null) {
		const side = hurst < .45 ? "on the mean-reverting side of 0.5" : hurst > .55 ? "on the trending side of 0.5" : "close to 0.5, the random-walk neighborhood";
		lines.push(`Hurst exponent of log returns, from rescaled range, is ${hurst.toFixed(2)} — ${side}. It is a descriptive slope, not a significance test.`);
	}
	const vr10 = vr.find((v) => v.q === 10);
	if (vr10) lines.push(`Variance ratio at 10 sessions is ${vr10.value.toFixed(2)}. Under 1, ten-day moves were smaller than a random walk would scale; over 1, they were larger.`);
	const low = buckets[0];
	const high = buckets[buckets.length - 1];
	if (low && high && low.n >= 8 && high.n >= 8) lines.push(low.mean > high.mean ? `Five-session forward returns averaged ${low.mean.toFixed(2)}% after z ≤ −2 (n=${low.n}) and ${high.mean.toFixed(2)}% after z > 2 (n=${high.n}). The tails lean the mean-reversion way on this sample.` : `Five-session forward returns averaged ${low.mean.toFixed(2)}% after z ≤ −2 (n=${low.n}) and ${high.mean.toFixed(2)}% after z > 2 (n=${high.n}). The tails do not lean mean-reversion on this sample.`);
	if (backtest) {
		lines.push(`After ${params.costBps} bps on each position change, the z-score fade returned ${backtest.fade.totalReturn.toFixed(1)}% versus ${backtest.hold.totalReturn.toFixed(1)}% for buy-and-hold, ${backtest.trend.totalReturn.toFixed(1)}% for a 20/50 trend rule, and ${backtest.channel.totalReturn.toFixed(1)}% for a 20-session channel, on the same sessions. Sharpe with a 0% risk-free rate: fade ${fmtSharpe(backtest.fade.sharpe)}, trend ${fmtSharpe(backtest.trend.sharpe)}, channel ${fmtSharpe(backtest.channel.sharpe)}, hold ${fmtSharpe(backtest.hold.sharpe)}.`);
		lines.push("Those figures describe this window only. They are not a forecast. The entry-threshold row underneath is there so a single lucky setting is harder to mistake for an edge.");
		lines.push(`The channel is long when the close is above the prior 20 sessions' high, short when it is below their low, and otherwise unchanged. It would be ${channelState.toLowerCase()} into the next session. Up-breaks in the sample: ${upBreaks}. Down-breaks: ${downBreaks}.`);
	}
	lines.push(`Latest bar ${tape.date}: ${tape.breakout20}. ${tape.breakout50}. ${tape.nr7 ? "The high-low range is the narrowest of the last seven sessions (NR7)." : "The latest range is not an NR7."}${tape.gapPct == null ? "" : ` Open versus the prior close: ${tape.gapPct > 0 ? "+" : ""}${tape.gapPct.toFixed(2)}%.`} Close streak: ${tape.streak > 0 ? `${tape.streak} up` : tape.streak < 0 ? `${Math.abs(tape.streak)} down` : "unchanged"}.`);
	return {
		sessions: bars.length,
		start: bars[0].d,
		end: bars[bars.length - 1].d,
		latestZ,
		stance,
		adfLevel,
		adfReturn,
		halfLife: hl,
		hurst,
		vr,
		acf: acfRows,
		acfAbs1,
		buckets,
		horizon,
		backtest,
		channelState,
		upBreaks,
		downBreaks,
		tape,
		sensitivity,
		lines
	};
}
function normalCdf(x) {
	const sign = x < 0 ? -1 : 1;
	const a = Math.abs(x) / Math.SQRT2;
	const t = 1 / (1 + .3275911 * a);
	return .5 * (1 + sign * (1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - .284496736) * t + .254829592) * t * Math.exp(-a * a)));
}
function normalPdf(x) {
	return Math.exp(-.5 * x * x) / Math.sqrt(2 * Math.PI);
}
function bsGreeks(input) {
	const { spot, strike, years, rate, dividend, iv, type } = input;
	if (!(spot > 0 && strike > 0 && years > 1 / 365 && iv > .01 && iv < 5 && rate > -.02 && rate < .25)) return null;
	const sqrtT = Math.sqrt(years);
	const d1 = (Math.log(spot / strike) + (rate - dividend + .5 * iv * iv) * years) / (iv * sqrtT);
	const d2 = d1 - iv * sqrtT;
	const discQ = Math.exp(-dividend * years);
	const discR = Math.exp(-rate * years);
	const pdf = normalPdf(d1);
	return {
		delta: type === "call" ? discQ * normalCdf(d1) : discQ * (normalCdf(d1) - 1),
		gamma: discQ * pdf / (spot * iv * sqrtT),
		vega: spot * discQ * pdf * sqrtT / 100,
		theta: (type === "call" ? -spot * discQ * pdf * iv / (2 * sqrtT) - rate * strike * discR * normalCdf(d2) + dividend * spot * discQ * normalCdf(d1) : -spot * discQ * pdf * iv / (2 * sqrtT) + rate * strike * discR * normalCdf(-d2) - dividend * spot * discQ * normalCdf(-d1)) / 365
	};
}
function mixPortfolio(series, weights) {
	if (series.length < 2 || series.length !== weights.length) return null;
	if (weights.some((w) => !Number.isFinite(w) || w < 0)) return null;
	const sum = weights.reduce((a, b) => a + b, 0);
	if (!(sum > .99 && sum < 1.01)) return null;
	const maps = series.map((row) => new Map(row.bars.filter((bar) => bar.c > 0).map((bar) => [bar.d, bar.c])));
	const dates = [...maps[0].keys()].filter((d) => maps.every((map) => (map.get(d) ?? 0) > 0)).sort();
	if (dates.length < 30) return null;
	const assetRets = series.map(() => []);
	const equity = [{
		d: dates[0],
		v: 100
	}];
	let level = 100;
	const portRets = [];
	for (let i = 1; i < dates.length; i++) {
		let port = 0;
		for (let k = 0; k < series.length; k++) {
			const ret = maps[k].get(dates[i]) / maps[k].get(dates[i - 1]) - 1;
			assetRets[k].push(ret);
			port += weights[k] * ret;
		}
		portRets.push(port);
		level *= 1 + port;
		equity.push({
			d: dates[i],
			v: level
		});
	}
	const sd = stdevSample(portRets);
	const corr = assetRets.map((left) => assetRets.map((right) => pearson(left, right) ?? NaN));
	return {
		sessions: dates.length,
		start: dates[0],
		end: dates[dates.length - 1],
		totalReturn: (level / 100 - 1) * 100,
		vol: sd == null || sd === 0 ? null : sd * Math.sqrt(252) * 100,
		maxDrawdown: maxDrawdownPct(equity.map((row) => row.v)),
		sharpe: sd == null || sd === 0 ? null : mean(portRets) / sd * Math.sqrt(252),
		equity,
		corr,
		names: series.map((row) => row.symbol)
	};
}
function alignedCloses(series) {
	if (series.length < 1) return null;
	const maps = series.map((row) => new Map(row.bars.filter((bar) => bar.c > 0).map((bar) => [bar.d, bar.c])));
	const dates = [...maps[0].keys()].filter((date) => maps.every((map) => (map.get(date) ?? 0) > 0)).sort();
	if (dates.length < 30) return null;
	return {
		dates,
		closes: maps.map((map) => dates.map((date) => map.get(date)))
	};
}
function returnsOf(closes) {
	const out = [];
	for (let i = 1; i < closes.length; i++) out.push(closes[i] / closes[i - 1] - 1);
	return out;
}
function covMatrix(rets) {
	rets.length;
	const t = rets[0].length;
	const means = rets.map((row) => mean(row));
	return rets.map((left, i) => rets.map((right, j) => {
		let sum = 0;
		for (let k = 0; k < t; k++) sum += (left[k] - means[i]) * (right[k] - means[j]);
		return sum / (t - 1);
	}));
}
function longOnly(weights, fallback) {
	const n = fallback;
	if (!weights || weights.length !== n) return Array.from({ length: n }, () => 1 / n);
	const clipped = weights.map((weight) => weight > 0 ? weight : 0);
	const sum = clipped.reduce((total, weight) => total + weight, 0);
	if (!(sum > 0)) return Array.from({ length: n }, () => 1 / n);
	return clipped.map((weight) => weight / sum);
}
function suggestWeights(series, method) {
	const aligned = alignedCloses(series);
	if (!aligned) return null;
	const rets = aligned.closes.map(returnsOf);
	if (rets.some((row) => row.length < 20)) return null;
	const n = series.length;
	if (method === "equal") return series.map((row) => ({
		symbol: row.symbol,
		weight: 1 / n
	}));
	const vols = rets.map((row) => stdevSample(row));
	if (vols.some((vol) => !(vol > 0))) return null;
	if (method === "invvol" || method === "invvar") {
		const raw = vols.map((vol) => method === "invvol" ? 1 / vol : 1 / (vol * vol));
		const sum = raw.reduce((total, value) => total + value, 0);
		return series.map((row, index) => ({
			symbol: row.symbol,
			weight: raw[index] / sum
		}));
	}
	const cov = covMatrix(rets);
	if (method === "minvar") {
		const solved = longOnly(solveLinear(cov, Array(n).fill(1)), n);
		return series.map((row, index) => ({
			symbol: row.symbol,
			weight: solved[index]
		}));
	}
	if (method === "sharpe") {
		const solved = longOnly(solveLinear(cov, rets.map((row) => mean(row))), n);
		return series.map((row, index) => ({
			symbol: row.symbol,
			weight: solved[index]
		}));
	}
	let weights = vols.map((vol) => 1 / vol);
	let sum = weights.reduce((total, value) => total + value, 0);
	weights = weights.map((weight) => weight / sum);
	for (let iter = 0; iter < 40; iter++) {
		const marginal = weights.map((_, index) => cov[index].reduce((total, value, col) => total + value * weights[col], 0));
		const next = weights.map((weight, index) => marginal[index] > 0 ? weight / marginal[index] : 0);
		sum = next.reduce((total, value) => total + value, 0);
		if (!(sum > 0)) break;
		weights = next.map((weight) => weight / sum);
	}
	return series.map((row, index) => ({
		symbol: row.symbol,
		weight: weights[index]
	}));
}
function shareBook(series, qty) {
	const aligned = alignedCloses(series);
	if (!aligned || qty.length !== series.length || qty.every((value) => value === 0)) return null;
	const { dates, closes } = aligned;
	const gross = qty.reduce((total, shares, index) => total + Math.abs(shares) * closes[index][0], 0);
	if (!(gross > 0)) return null;
	const equity = [];
	const daily = [];
	for (let i = 0; i < dates.length; i++) {
		const pnl = qty.reduce((total, shares, index) => total + shares * (closes[index][i] - closes[index][0]), 0);
		equity.push({
			d: dates[i],
			v: pnl / gross * 100
		});
		if (i > 0) {
			const day = qty.reduce((total, shares, index) => total + shares * (closes[index][i] - closes[index][i - 1]), 0);
			daily.push(day / gross);
		}
	}
	const sd = stdevSample(daily);
	return {
		start: dates[0],
		end: dates[dates.length - 1],
		pnl: equity[equity.length - 1].v / 100 * gross,
		ret: equity[equity.length - 1].v,
		vol: sd > 0 ? sd * Math.sqrt(252) * 100 : null,
		maxDrawdown: maxDrawdownPct(equity.map((point) => 100 + point.v)),
		equity
	};
}
function residualPair(y, x, window, entry, exit, cost) {
	const aligned = alignedCloses([{
		symbol: "y",
		bars: y
	}, {
		symbol: "x",
		bars: x
	}]);
	if (!aligned) return null;
	const span = Math.min(120, Math.max(20, Math.round(window)));
	const entryZ = Math.min(3.5, Math.max(.5, entry));
	const exitZ = Math.min(entryZ - .05, Math.max(0, exit));
	const { dates, closes } = aligned;
	const ly = closes[0].map(Math.log);
	const lx = closes[1].map(Math.log);
	const equity = [{
		d: dates[span],
		v: 100
	}];
	const daily = [];
	let held = 0;
	let lastBeta = null;
	let lastZ = null;
	let level = 100;
	for (let i = span; i < dates.length - 1; i++) {
		let sumX = 0;
		let sumY = 0;
		let sumXX = 0;
		let sumXY = 0;
		for (let k = i - span + 1; k <= i; k++) {
			sumX += lx[k];
			sumY += ly[k];
			sumXX += lx[k] * lx[k];
			sumXY += lx[k] * ly[k];
		}
		const denom = span * sumXX - sumX * sumX;
		const beta = denom === 0 ? 0 : (span * sumXY - sumX * sumY) / denom;
		const alpha = (sumY - beta * sumX) / span;
		const residual = [];
		for (let k = i - span + 1; k <= i; k++) residual.push(ly[k] - alpha - beta * lx[k]);
		const z = stdevSample(residual) > 0 ? (residual[residual.length - 1] - mean(residual)) / stdevSample(residual) : 0;
		let desired = held;
		if (z >= entryZ) desired = -1;
		else if (z <= -entryZ) desired = 1;
		else if (Math.abs(z) <= exitZ) desired = 0;
		const yRet = closes[0][i + 1] / closes[0][i] - 1;
		const xRet = closes[1][i + 1] / closes[1][i] - 1;
		const pnl = desired * (yRet - beta * xRet) - Math.abs(desired - held) * cost;
		daily.push(pnl);
		level *= 1 + pnl;
		equity.push({
			d: dates[i + 1],
			v: level
		});
		held = desired;
		lastBeta = beta;
		lastZ = z;
	}
	const last = dates.length - 1;
	if (last >= span) {
		let sumX = 0;
		let sumY = 0;
		let sumXX = 0;
		let sumXY = 0;
		for (let k = last - span + 1; k <= last; k++) {
			sumX += lx[k];
			sumY += ly[k];
			sumXX += lx[k] * lx[k];
			sumXY += lx[k] * ly[k];
		}
		const denom = span * sumXX - sumX * sumX;
		const beta = denom === 0 ? 0 : (span * sumXY - sumX * sumY) / denom;
		const alpha = (sumY - beta * sumX) / span;
		const residual = [];
		for (let k = last - span + 1; k <= last; k++) residual.push(ly[k] - alpha - beta * lx[k]);
		const sd = stdevSample(residual);
		lastBeta = beta;
		lastZ = sd > 0 ? (residual[residual.length - 1] - mean(residual)) / sd : 0;
		if (lastZ >= entryZ) held = -1;
		else if (lastZ <= -entryZ) held = 1;
		else if (Math.abs(lastZ) <= exitZ) held = 0;
	}
	if (daily.length < 20) return null;
	const sd = stdevSample(daily);
	return {
		beta: lastBeta,
		z: lastZ,
		stance: held === 1 ? "Long residual" : held === -1 ? "Short residual" : "Flat",
		ret: (level / 100 - 1) * 100,
		sharpe: sd > 0 ? mean(daily) / sd * Math.sqrt(252) : null,
		maxDrawdown: maxDrawdownPct(equity.map((point) => point.v)),
		equity
	};
}
function signalBook(bars, start, decide, cost) {
	if (bars.length < start + 30) return null;
	const closes = bars.map((bar) => bar.c);
	const equity = [{
		d: bars[start].d,
		v: 100
	}];
	const daily = [];
	let held = 0;
	let level = 100;
	for (let i = start; i < bars.length - 1; i++) {
		const desired = decide(i);
		const pnl = desired * (closes[i + 1] / closes[i] - 1) - Math.abs(desired - held) * cost;
		daily.push(pnl);
		level *= 1 + pnl;
		equity.push({
			d: bars[i + 1].d,
			v: level
		});
		held = desired;
	}
	const sd = stdevSample(daily);
	return {
		ret: (level / 100 - 1) * 100,
		sharpe: sd > 0 ? mean(daily) / sd * Math.sqrt(252) : null,
		maxDrawdown: maxDrawdownPct(equity.map((point) => point.v)),
		last: decide(bars.length - 1),
		equity
	};
}
function rsiBook(bars, cost) {
	const values = rsi(bars.map((bar) => bar.c), 14);
	if (bars.length < 50) return null;
	const closes = bars.map((bar) => bar.c);
	const equity = [{
		d: bars[20].d,
		v: 100
	}];
	const daily = [];
	let held = 0;
	let level = 100;
	for (let i = 20; i < bars.length - 1; i++) {
		const value = values[i];
		let desired = held;
		if (value != null) {
			if (value < 30) desired = 1;
			else if (value > 70) desired = -1;
			else if (held > 0 && value >= 50 || held < 0 && value <= 50) desired = 0;
		}
		const pnl = desired * (closes[i + 1] / closes[i] - 1) - Math.abs(desired - held) * cost;
		daily.push(pnl);
		level *= 1 + pnl;
		equity.push({
			d: bars[i + 1].d,
			v: level
		});
		held = desired;
	}
	const sd = stdevSample(daily);
	const lastValue = values[values.length - 1];
	let last = held;
	if (lastValue != null) {
		if (lastValue < 30) last = 1;
		else if (lastValue > 70) last = -1;
		else if (held > 0 && lastValue >= 50 || held < 0 && lastValue <= 50) last = 0;
	}
	return {
		ret: (level / 100 - 1) * 100,
		sharpe: sd > 0 ? mean(daily) / sd * Math.sqrt(252) : null,
		maxDrawdown: maxDrawdownPct(equity.map((point) => point.v)),
		last: last === 1 ? "Long" : last === -1 ? "Short" : "Flat",
		equity
	};
}
function momentumBook(bars, cost) {
	const closes = bars.map((bar) => bar.c);
	const book = signalBook(bars, 252, (index) => {
		if (index < 252) return 0;
		return closes[index - 21] > closes[index - 252] ? 1 : 0;
	}, cost);
	if (!book) return null;
	return {
		...book,
		last: book.last === 1 ? "Long" : "Flat"
	};
}
function monthGrid(bars) {
	const compounded = /* @__PURE__ */ new Map();
	let prev = 0;
	for (const bar of bars) {
		if (!(bar.c > 0)) continue;
		const key = bar.d.slice(0, 7);
		if (prev > 0) {
			const held = compounded.get(key);
			compounded.set(key, held == null ? bar.c / prev - 1 : (1 + held) * (bar.c / prev) - 1);
		}
		prev = bar.c;
	}
	return [...new Set([...compounded.keys()].map((key) => key.slice(0, 4)))].sort().map((year) => ({
		year,
		cells: Array.from({ length: 12 }, (_, month) => {
			const value = compounded.get(`${year}-${String(month + 1).padStart(2, "0")}`);
			return value == null ? null : value * 100;
		})
	}));
}
function realizedVols(closes) {
	return [
		10,
		21,
		63,
		126
	].map((n) => {
		if (closes.length < n + 2) return {
			label: `${n}d`,
			vol: null
		};
		const slice = closes.slice(-(n + 1));
		const rets = [];
		for (let i = 1; i < slice.length; i++) rets.push(slice[i] / slice[i - 1] - 1);
		const sd = stdevSample(rets);
		return {
			label: `${n}d`,
			vol: sd > 0 ? sd * Math.sqrt(252) * 100 : null
		};
	});
}
function monthVolGrid(bars) {
	const groups = /* @__PURE__ */ new Map();
	let prev = 0;
	for (const bar of bars) {
		if (!(bar.c > 0)) continue;
		if (prev > 0) {
			const key = bar.d.slice(0, 7);
			const list = groups.get(key) ?? [];
			list.push(Math.log(bar.c / prev));
			groups.set(key, list);
		}
		prev = bar.c;
	}
	return [...new Set([...groups.keys()].map((key) => key.slice(0, 4)))].sort().map((year) => ({
		year,
		cells: Array.from({ length: 12 }, (_, month) => {
			const list = groups.get(`${year}-${String(month + 1).padStart(2, "0")}`);
			if (!list || list.length < 8) return null;
			const sd = stdevSample(list);
			return sd > 0 ? sd * Math.sqrt(252) * 100 : null;
		})
	}));
}
function corrMatrix(series, tail) {
	const aligned = alignedCloses(series);
	if (!aligned) return null;
	const width = tail && tail > 0 ? tail + 1 : aligned.dates.length;
	const rets = aligned.closes.map((column) => column.length > width ? column.slice(-width) : column).map(returnsOf);
	if (rets[0].length < 30) return null;
	const values = rets.map((left, i) => rets.map((right, j) => {
		if (i === j) return 1;
		const a = mean(left);
		const b = mean(right);
		let cov = 0;
		let va = 0;
		let vb = 0;
		for (let k = 0; k < left.length; k++) {
			const da = left[k] - a;
			const db = right[k] - b;
			cov += da * db;
			va += da * da;
			vb += db * db;
		}
		if (va === 0 || vb === 0) return null;
		return cov / Math.sqrt(va * vb);
	}));
	return {
		names: series.map((row) => row.symbol),
		values,
		sessions: rets[0].length
	};
}
function scoreWindow(closes, decide, cost, from, end) {
	if (end - from < 12) return null;
	const daily = [];
	let held = 0;
	let turns = 0;
	let active = 0;
	let equity = 1;
	for (let i = from; i < end - 1; i++) {
		const desired = decide(i, held);
		if (desired !== held) turns += 1;
		const pnl = desired * (closes[i + 1] / closes[i] - 1) - Math.abs(desired - held) * cost;
		daily.push(pnl);
		if (desired !== 0) active += 1;
		equity *= 1 + pnl;
		held = desired;
	}
	if (daily.length < 10) return null;
	const sd = stdevSample(daily);
	return {
		daily,
		sharpe: sd > 0 ? mean(daily) / sd * Math.sqrt(252) : null,
		ret: (equity - 1) * 100,
		turns,
		active
	};
}
function walkForward(bars, family, costBps) {
	const closes = bars.map((bar) => bar.c);
	if (closes.some((price) => !(price > 0))) return null;
	const cost = Math.min(100, Math.max(0, costBps)) / 1e4;
	const rsiValues = family === "rsi" ? rsi(closes, 14) : [];
	const fastCache = /* @__PURE__ */ new Map();
	const slowCache = /* @__PURE__ */ new Map();
	const ma = (n, cache) => {
		const hit = cache.get(n);
		if (hit) return hit;
		const row = sma(closes, n);
		cache.set(n, row);
		return row;
	};
	const rules = [];
	if (family === "fade") for (const window of [
		20,
		40,
		60
	]) for (const entry of [
		1,
		1.5,
		2
	]) rules.push({
		label: `${window}d z${entry}`,
		warm: window,
		decide: (i, prev) => fadeDesired(closes, i, window, entry, .25, prev)
	});
	else if (family === "trend") for (const [fast, slow] of [
		[10, 40],
		[20, 50],
		[20, 100]
	]) rules.push({
		label: `${fast}/${slow}`,
		warm: slow,
		decide: (i, prev) => {
			const a = ma(fast, fastCache)[i];
			const b = ma(slow, slowCache)[i];
			if (a == null || b == null) return prev;
			return a > b ? 1 : -1;
		}
	});
	else if (family === "breakout") for (const n of [
		10,
		20,
		55
	]) rules.push({
		label: `${n}d channel`,
		warm: n,
		decide: (i, prev) => channelDesired(bars, i, n, prev)
	});
	else if (family === "rsi") for (const [low, high] of [
		[30, 70],
		[25, 75],
		[20, 80]
	]) rules.push({
		label: `${low}/${high}`,
		warm: 20,
		decide: (i, prev) => {
			const value = rsiValues[i];
			if (value == null) return prev;
			if (value < low) return 1;
			if (value > high) return -1;
			if (prev > 0 && value >= 50 || prev < 0 && value <= 50) return 0;
			return prev;
		}
	});
	else for (const look of [
		126,
		189,
		252
	]) rules.push({
		label: `${Math.round(look / 21)}-1`,
		warm: look,
		decide: (i) => i < look ? 0 : closes[i - 21] > closes[i - look] ? 1 : 0
	});
	const train = family === "momentum" ? 378 : 252;
	const test = 63;
	const warm = Math.max(...rules.map((rule) => rule.warm));
	if (closes.length < warm + train + test) return null;
	const folds = [];
	const stitched = [];
	const equity = [];
	let level = 100;
	for (let origin = warm + train; origin + 21 < closes.length - 1; origin += test) {
		const trainFrom = Math.max(warm, origin - train);
		const testFrom = origin;
		const testTo = Math.min(closes.length, origin + test);
		let best = null;
		for (const rule of rules) {
			if (trainFrom < rule.warm) continue;
			const scored = scoreWindow(closes, rule.decide, cost, trainFrom, testFrom);
			if (!scored || scored.active < 8) continue;
			const score = scored.sharpe ?? -99;
			if (!best || score > (best.sharpe ?? -99)) best = {
				rule,
				sharpe: scored.sharpe
			};
		}
		if (!best) continue;
		const oos = scoreWindow(closes, best.rule.decide, cost, testFrom, testTo);
		if (!oos) continue;
		stitched.push(...oos.daily);
		let cursor = testFrom;
		for (const pnl of oos.daily) {
			level *= 1 + pnl;
			equity.push({
				d: bars[cursor + 1]?.d ?? bars[bars.length - 1].d,
				v: level
			});
			cursor += 1;
		}
		folds.push({
			start: bars[testFrom].d,
			end: bars[Math.min(bars.length - 1, testTo - 1)].d,
			rule: best.rule.label,
			isSharpe: best.sharpe,
			oosReturn: oos.ret
		});
	}
	if (!folds.length || stitched.length < 20) return null;
	const sd = stdevSample(stitched);
	return {
		folds,
		oosReturn: (level / 100 - 1) * 100,
		oosSharpe: sd > 0 ? mean(stitched) / sd * Math.sqrt(252) : null,
		oosMaxDd: maxDrawdownPct(equity.map((point) => point.v)),
		equity
	};
}
function listed(flagships, extra = []) {
	return [...flagships.map(([symbol, name]) => ({
		symbol,
		name,
		flagship: true
	})), ...extra.map(([symbol, name]) => ({
		symbol,
		name
	}))];
}
var COUNTRIES = [
	{
		id: "us",
		label: "United States",
		region: "us",
		bench: "^GSPC",
		vs: "the S&P 500",
		news: "^GSPC",
		names: listed([
			["AAPL", "Apple"],
			["MSFT", "Microsoft"],
			["NVDA", "NVIDIA"],
			["AMZN", "Amazon"],
			["GOOGL", "Alphabet"],
			["META", "Meta"],
			["AVGO", "Broadcom"],
			["JPM", "JPMorgan"],
			["V", "Visa"],
			["MA", "Mastercard"],
			["BAC", "Bank of America"],
			["UNH", "UnitedHealth"],
			["JNJ", "Johnson & Johnson"],
			["LLY", "Eli Lilly"],
			["XOM", "Exxon Mobil"],
			["CVX", "Chevron"],
			["HD", "Home Depot"],
			["COST", "Costco"],
			["WMT", "Walmart"],
			["PG", "Procter & Gamble"],
			["KO", "Coca-Cola"],
			["DIS", "Disney"],
			["NFLX", "Netflix"],
			["TSLA", "Tesla"],
			["BRK-B", "Berkshire Hathaway"],
			["ORCL", "Oracle"],
			["CRM", "Salesforce"],
			["AMD", "AMD"],
			["ADBE", "Adobe"],
			["CSCO", "Cisco"],
			["PEP", "PepsiCo"],
			["ABT", "Abbott"],
			["MRK", "Merck"],
			["TMO", "Thermo Fisher"],
			["ABBV", "AbbVie"],
			["PFE", "Pfizer"],
			["MCD", "McDonald's"],
			["NKE", "Nike"],
			["SBUX", "Starbucks"],
			["BA", "Boeing"],
			["CAT", "Caterpillar"],
			["GE", "GE Aerospace"],
			["IBM", "IBM"],
			["GS", "Goldman Sachs"],
			["MS", "Morgan Stanley"],
			["AXP", "American Express"],
			["BLK", "BlackRock"],
			["SPGI", "S&P Global"],
			["INTU", "Intuit"],
			["QCOM", "Qualcomm"]
		])
	},
	{
		id: "ca",
		label: "Canada",
		region: "americas",
		bench: "^GSPTSE",
		vs: "the TSX",
		news: "^GSPTSE",
		names: listed([
			["RY.TO", "Royal Bank"],
			["TD.TO", "TD"],
			["SHOP.TO", "Shopify"],
			["ENB.TO", "Enbridge"]
		])
	},
	{
		id: "gb",
		label: "United Kingdom",
		region: "emea",
		bench: "^FTSE",
		vs: "the FTSE 100",
		news: "^FTSE",
		names: listed([
			["HSBA.L", "HSBC"],
			["SHEL.L", "Shell"],
			["AZN.L", "AstraZeneca"],
			["ULVR.L", "Unilever"]
		], [
			["BP.L", "BP"],
			["GSK.L", "GSK"],
			["DGE.L", "Diageo"],
			["RIO.L", "Rio Tinto"]
		])
	},
	{
		id: "de",
		label: "Germany",
		region: "emea",
		bench: "^GDAXI",
		vs: "the DAX",
		news: "^GDAXI",
		names: listed([
			["SAP.DE", "SAP"],
			["SIE.DE", "Siemens"],
			["ALV.DE", "Allianz"]
		], [
			["DTE.DE", "Deutsche Telekom"],
			["BMW.DE", "BMW"],
			["MBG.DE", "Mercedes-Benz"]
		])
	},
	{
		id: "fr",
		label: "France",
		region: "emea",
		bench: "^FCHI",
		vs: "the CAC 40",
		news: "^FCHI",
		names: listed([
			["MC.PA", "LVMH"],
			["OR.PA", "L'Oréal"],
			["TTE.PA", "TotalEnergies"]
		], [["AIR.PA", "Airbus"], ["SAN.PA", "Sanofi"]])
	},
	{
		id: "nl",
		label: "Netherlands",
		region: "emea",
		bench: "^AEX",
		vs: "the AEX",
		news: "^AEX",
		names: listed([["ASML.AS", "ASML"]], [
			["PHIA.AS", "Philips"],
			["INGA.AS", "ING"],
			["HEIA.AS", "Heineken"]
		])
	},
	{
		id: "ch",
		label: "Switzerland",
		region: "emea",
		bench: "^SSMI",
		vs: "the SMI",
		news: "^SSMI",
		names: listed([["NESN.SW", "Nestlé"], ["NOVN.SW", "Novartis"]], [["RO.SW", "Roche"], ["UBSG.SW", "UBS"]])
	},
	{
		id: "it",
		label: "Italy",
		region: "emea",
		bench: "FTSEMIB.MI",
		vs: "the FTSE MIB",
		news: "FTSEMIB.MI",
		names: listed([["ENI.MI", "ENI"], ["ENEL.MI", "Enel"]], [["ISP.MI", "Intesa Sanpaolo"], ["RACE.MI", "Ferrari"]])
	},
	{
		id: "se",
		label: "Sweden",
		region: "emea",
		bench: "^OMXS30",
		vs: "the OMX 30",
		news: "^OMXS30",
		names: listed([["VOLV-B.ST", "Volvo"]], [["ERIC-B.ST", "Ericsson"], ["HM-B.ST", "H&M"]])
	},
	{
		id: "be",
		label: "Belgium",
		region: "emea",
		bench: "^BFX",
		vs: "the BEL 20",
		news: "^BFX",
		names: listed([["ABI.BR", "AB InBev"]], [["KBC.BR", "KBC"]])
	},
	{
		id: "za",
		label: "South Africa",
		region: "emea",
		bench: "^J200.JO",
		vs: "the JSE Top 40",
		news: "^J200.JO",
		names: listed([["NPN.JO", "Naspers"]], [["SBK.JO", "Standard Bank"]])
	},
	{
		id: "sa",
		label: "Saudi Arabia",
		region: "emea",
		bench: "^TASI.SR",
		vs: "the Tadawul",
		news: "^TASI.SR",
		names: listed([["2222.SR", "Saudi Aramco"]], [["1120.SR", "Al Rajhi"]])
	},
	{
		id: "jp",
		label: "Japan",
		region: "apac",
		bench: "^N225",
		vs: "the Nikkei 225",
		news: "^N225",
		names: listed([
			["7203.T", "Toyota"],
			["6758.T", "Sony"],
			["9984.T", "SoftBank"]
		], [["8306.T", "Mitsubishi UFJ"], ["8035.T", "Tokyo Electron"]])
	},
	{
		id: "au",
		label: "Australia",
		region: "apac",
		bench: "^AXJO",
		vs: "the ASX 200",
		news: "^AXJO",
		names: listed([["BHP.AX", "BHP"], ["CBA.AX", "Commonwealth Bank"]], [["CSL.AX", "CSL"]])
	},
	{
		id: "hk",
		label: "Hong Kong",
		region: "apac",
		bench: "^HSI",
		vs: "the Hang Seng",
		news: "^HSI",
		names: listed([
			["0700.HK", "Tencent"],
			["0005.HK", "HSBC HK"],
			["9988.HK", "Alibaba"],
			["3690.HK", "Meituan"]
		], [["0941.HK", "China Mobile"]])
	},
	{
		id: "cn",
		label: "China",
		region: "apac",
		bench: "000001.SS",
		vs: "the Shanghai composite",
		news: "000001.SS",
		names: listed([["600519.SS", "Kweichow Moutai"]], [["601318.SS", "Ping An"]])
	},
	{
		id: "in",
		label: "India",
		region: "apac",
		bench: "^NSEI",
		vs: "the Nifty 50",
		news: "^NSEI",
		names: listed([
			["RELIANCE.NS", "Reliance"],
			["TCS.NS", "TCS"],
			["HDFCBANK.NS", "HDFC Bank"],
			["INFY.NS", "Infosys"]
		], [
			["ICICIBANK.NS", "ICICI Bank"],
			["BHARTIARTL.NS", "Bharti Airtel"],
			["SBIN.NS", "SBI"],
			["LT.NS", "Larsen & Toubro"],
			["ITC.NS", "ITC"],
			["HINDUNILVR.NS", "Hindustan Unilever"],
			["BAJFINANCE.NS", "Bajaj Finance"],
			["HCLTECH.NS", "HCL Tech"],
			["MARUTI.NS", "Maruti Suzuki"],
			["SUNPHARMA.NS", "Sun Pharma"],
			["KOTAKBANK.NS", "Kotak Mahindra"],
			["AXISBANK.NS", "Axis Bank"],
			["TITAN.NS", "Titan"],
			["ULTRACEMCO.NS", "UltraTech"],
			["NTPC.NS", "NTPC"],
			["ONGC.NS", "ONGC"],
			["POWERGRID.NS", "Power Grid"],
			["TMPV.NS", "Tata Motors"],
			["TATASTEEL.NS", "Tata Steel"],
			["ADANIENT.NS", "Adani Enterprises"],
			["ADANIPORTS.NS", "Adani Ports"],
			["WIPRO.NS", "Wipro"],
			["TECHM.NS", "Tech Mahindra"],
			["NESTLEIND.NS", "Nestle India"],
			["ASIANPAINT.NS", "Asian Paints"],
			["BAJAJFINSV.NS", "Bajaj Finserv"],
			["GRASIM.NS", "Grasim"],
			["JSWSTEEL.NS", "JSW Steel"],
			["HINDALCO.NS", "Hindalco"],
			["COALINDIA.NS", "Coal India"],
			["BPCL.NS", "BPCL"],
			["BRITANNIA.NS", "Britannia"],
			["CIPLA.NS", "Cipla"],
			["DRREDDY.NS", "Dr Reddy's"],
			["EICHERMOT.NS", "Eicher Motors"],
			["HEROMOTOCO.NS", "Hero MotoCorp"],
			["DIVISLAB.NS", "Divi's Labs"],
			["APOLLOHOSP.NS", "Apollo Hospitals"],
			["SBILIFE.NS", "SBI Life"],
			["HDFCLIFE.NS", "HDFC Life"],
			["INDUSINDBK.NS", "IndusInd Bank"],
			["TRENT.NS", "Trent"],
			["BEL.NS", "Bharat Electronics"],
			["SHRIRAMFIN.NS", "Shriram Finance"],
			["BAJAJ-AUTO.NS", "Bajaj Auto"],
			["DMART.NS", "DMart"],
			["TATACONSUM.NS", "Tata Consumer"]
		])
	},
	{
		id: "kr",
		label: "Korea",
		region: "apac",
		bench: "^KS11",
		vs: "the KOSPI",
		news: "^KS11",
		names: listed([["005930.KS", "Samsung"], ["000660.KS", "SK hynix"]], [["005380.KS", "Hyundai Motor"]])
	},
	{
		id: "sg",
		label: "Singapore",
		region: "apac",
		bench: "^STI",
		vs: "the Straits Times",
		news: "^STI",
		names: listed([["D05.SI", "DBS"]], [["O39.SI", "OCBC"]])
	},
	{
		id: "tw",
		label: "Taiwan",
		region: "apac",
		bench: "^TWII",
		vs: "the Taiwan weighted",
		news: "^TWII",
		names: listed([["2330.TW", "TSMC"], ["2317.TW", "Hon Hai"]], [["2454.TW", "MediaTek"]])
	}
];
var REGIONS = [
	{
		id: "us",
		label: "US",
		note: "Beta is versus the S&P 500."
	},
	{
		id: "emea",
		label: "EMEA",
		note: "United Kingdom, euro area, Switzerland, Sweden, Belgium, South Africa, and Saudi Arabia. Beta is versus each home index, in local currency. Saudi beta stays blank: the Tadawul history feed is one print."
	},
	{
		id: "apac",
		label: "APAC",
		note: "Japan, Australia, Hong Kong, China, India, Korea, Singapore, and Taiwan. Beta is versus each home index, in local currency."
	}
];
var COUNTRY_OPTIONS = COUNTRIES.map((row) => ({
	id: row.id,
	label: row.label
}));
function asScreen(country, onlyFlagship) {
	return (onlyFlagship ? country.names.filter((row) => row.flagship) : country.names).map((row) => ({
		symbol: row.symbol,
		name: row.name,
		bench: country.bench,
		vs: country.vs
	}));
}
function regionNames(region) {
	return COUNTRIES.filter((row) => row.region === region).flatMap((row) => asScreen(row, region !== "us"));
}
function countryNames(id) {
	const country = COUNTRIES.find((row) => row.id === id);
	return country ? asScreen(country, false) : [];
}
function countryMeta(id) {
	const country = COUNTRIES.find((row) => row.id === id) ?? COUNTRIES[0];
	return {
		label: country.label,
		news: country.news,
		vs: country.vs
	};
}
function regionNews(region) {
	if (region === "emea") return "^STOXX50E";
	if (region === "apac") return "^N225";
	return "^GSPC";
}
var BENCHMARK = "^GSPC";
var SCREENER = countryNames("us").map(({ symbol, name }) => ({
	symbol,
	name
}));
function screenerChunks(names) {
	const symbols = [.../* @__PURE__ */ new Set([...names.map((row) => row.symbol), ...names.map((row) => row.bench)])];
	const chunks = [];
	for (let i = 0; i < symbols.length; i += 8) chunks.push(symbols.slice(i, i + 8));
	if (chunks.length > 1 && chunks[chunks.length - 1].length < 2) {
		const last = chunks.pop();
		const prev = chunks[chunks.length - 1];
		if (last && prev?.length) {
			const moved = prev.pop();
			if (moved) last.unshift(moved);
			chunks.push(last);
		}
	}
	return chunks;
}
function screenName(symbol) {
	for (const country of COUNTRIES) {
		const hit = country.names.find((row) => row.symbol === symbol);
		if (hit) return hit.name;
	}
}
function homeBench(symbol) {
	for (const country of COUNTRIES) if (country.names.find((row) => row.symbol === symbol)) return {
		symbol: country.bench,
		vs: country.vs
	};
	return {
		symbol: BENCHMARK,
		vs: "the S&P 500"
	};
}
function trail(closes, n) {
	if (closes.length <= n) return null;
	const prev = closes[closes.length - 1 - n];
	const last = closes[closes.length - 1];
	if (!(prev > 0 && last > 0)) return null;
	return last / prev - 1;
}
function realized(closes, n) {
	if (closes.length < n + 1) return null;
	const rets = [];
	for (let i = closes.length - n; i < closes.length; i++) {
		const prev = closes[i - 1];
		const next = closes[i];
		if (!(prev > 0 && next > 0)) return null;
		rets.push(Math.log(next / prev));
	}
	const sd = stdevSample(rets);
	return sd > 0 ? sd * Math.sqrt(252) : null;
}
function volRank(closes, n = 21) {
	if (closes.length < n + 40) return null;
	const vols = [];
	for (let i = n; i < closes.length; i++) {
		const vol = realized(closes.slice(0, i + 1), n);
		if (vol != null) vols.push(vol);
	}
	if (vols.length < 40) return null;
	const last = vols[vols.length - 1];
	return vols.filter((vol) => vol <= last).length / vols.length * 100;
}
function pairReturns(stock, bench) {
	const aligned = alignedCloses([{
		symbol: "y",
		bars: stock
	}, {
		symbol: "x",
		bars: bench
	}]);
	if (!aligned) return null;
	const y = [];
	const x = [];
	const dates = [];
	for (let i = 1; i < aligned.dates.length; i++) {
		const y0 = aligned.closes[0][i - 1];
		const y1 = aligned.closes[0][i];
		const x0 = aligned.closes[1][i - 1];
		const x1 = aligned.closes[1][i];
		if (!(y0 > 0 && y1 > 0 && x0 > 0 && x1 > 0)) continue;
		y.push(y1 / y0 - 1);
		x.push(x1 / x0 - 1);
		dates.push(aligned.dates[i]);
	}
	if (y.length < 60) return null;
	return {
		dates,
		y,
		x
	};
}
function fit(y, x) {
	if (y.length < 40 || y.length !== x.length) return null;
	const mx = mean(x);
	const my = mean(y);
	let varx = 0;
	let cov = 0;
	for (let i = 0; i < x.length; i++) {
		const dx = x[i] - mx;
		varx += dx * dx;
		cov += dx * (y[i] - my);
	}
	if (!(varx > 0)) return null;
	const beta = cov / varx;
	const resid = [];
	for (let i = 0; i < y.length; i++) resid.push(y[i] - my - beta * (x[i] - mx));
	return {
		beta,
		idio: stdevSample(resid) * Math.sqrt(252)
	};
}
function screenStats(symbol, name, bars, bench) {
	const closes = bars.map((bar) => bar.c).filter((price) => price > 0);
	if (closes.length !== bars.length || closes.length < 80) return null;
	const last = closes.length - 1;
	const fast = sma(closes, 50);
	const slow = sma(closes, 200);
	const rsiLine = rsi(closes, 14);
	let hi = -Infinity;
	let lo = Infinity;
	const from = Math.max(0, bars.length - 252);
	for (let i = from; i < bars.length; i++) {
		if (bars[i].h > hi) hi = bars[i].h;
		if (bars[i].l < lo) lo = bars[i].l;
	}
	const span = hi - lo;
	const close = bars[last].c;
	let priorHi = -Infinity;
	if (last >= 20) {
		for (let k = last - 20; k < last; k++) if (bars[k].h > priorHi) priorHi = bars[k].h;
	}
	const slice = closes.slice(last - 59, last + 1);
	const sd = slice.length >= 60 ? stdevSample(slice) : 0;
	const z = sd > 0 ? (closes[last] - mean(slice)) / sd : null;
	const mom = closes.length > 252 ? trail(closes.slice(0, closes.length - 21), 231) : null;
	const paired = pairReturns(bars, bench);
	const sample = paired ? fit(paired.y.slice(-252), paired.x.slice(-252)) : null;
	const sma50 = fast[last];
	const sma200 = slow[last];
	return {
		symbol,
		name,
		ret5: trail(closes, 5),
		ret21: trail(closes, 21),
		ret63: trail(closes, 63),
		ret252: trail(closes, 252),
		mom,
		rsi: rsiLine[last] ?? null,
		z,
		above50: sma50 != null && close > sma50,
		below200: sma200 != null && close < sma200,
		distHigh20: priorHi > 0 ? close / priorHi - 1 : null,
		range52: span > 0 ? (close - lo) / span : null,
		offHigh: hi > 0 ? (hi - close) / hi : null,
		rv21: realized(closes, 21),
		volPct: volRank(closes, 21),
		beta: sample?.beta ?? null,
		idio: sample?.idio ?? null
	};
}
function rollingBeta(stock, bench, window = 63) {
	const paired = pairReturns(stock, bench);
	if (!paired || paired.y.length < window) return [];
	const out = [];
	for (let i = window; i <= paired.y.length; i++) {
		const fitRow = fit(paired.y.slice(i - window, i), paired.x.slice(i - window, i));
		if (fitRow) out.push({
			d: paired.dates[i - 1],
			beta: fitRow.beta
		});
	}
	return out;
}
function searchSymbol(value) {
	if (typeof value !== "string") return void 0;
	const symbol = value.trim().toUpperCase();
	if (!/^[A-Z0-9.^=-]{1,18}$/.test(symbol)) return void 0;
	return symbol;
}
function factorShare(values) {
	const n = values.length;
	if (n < 2) return null;
	const matrix = [];
	for (let i = 0; i < n; i++) {
		const row = [];
		for (let j = 0; j < n; j++) if (i === j) row.push(1);
		else {
			const value = values[i]?.[j];
			if (value == null || !Number.isFinite(value)) return null;
			row.push(value);
		}
		matrix.push(row);
	}
	let vec = Array.from({ length: n }, () => 1 / Math.sqrt(n));
	let eigenvalue = 0;
	for (let k = 0; k < 48; k++) {
		const next = vec.map((_, i) => matrix[i].reduce((sum, value, j) => sum + value * vec[j], 0));
		eigenvalue = next.reduce((sum, value, i) => sum + value * vec[i], 0);
		const norm = Math.hypot(...next);
		if (!(norm > 0)) return null;
		vec = next.map((value) => value / norm);
	}
	if (!(eigenvalue > 0)) return null;
	return Math.min(1, eigenvalue / n);
}
var EQUITY_MARKETS = [
	{
		"id": "global",
		"label": "Global"
	},
	{
		"id": "us",
		"label": "United States"
	},
	{
		"id": "gb",
		"label": "United Kingdom"
	},
	{
		"id": "jp",
		"label": "Japan"
	},
	{
		"id": "de",
		"label": "Germany"
	},
	{
		"id": "fr",
		"label": "France"
	},
	{
		"id": "it",
		"label": "Italy"
	},
	{
		"id": "ca",
		"label": "Canada"
	},
	{
		"id": "ch",
		"label": "Switzerland"
	},
	{
		"id": "se",
		"label": "Sweden"
	},
	{
		"id": "nl",
		"label": "Netherlands"
	},
	{
		"id": "be",
		"label": "Belgium"
	},
	{
		"id": "au",
		"label": "Australia"
	},
	{
		"id": "cn",
		"label": "China"
	},
	{
		"id": "hk",
		"label": "Hong Kong"
	},
	{
		"id": "in",
		"label": "India"
	},
	{
		"id": "kr",
		"label": "Korea"
	},
	{
		"id": "sg",
		"label": "Singapore"
	},
	{
		"id": "tw",
		"label": "Taiwan"
	},
	{
		"id": "za",
		"label": "South Africa"
	},
	{
		"id": "sa",
		"label": "Saudi Arabia"
	}
];
var EQUITY_BOOKS = {
	"global": {
		"stock": [
			{
				"symbol": "^GSPC",
				"name": "S&P 500",
				"kind": "index"
			},
			{
				"symbol": "^DJI",
				"name": "Dow Jones",
				"kind": "index"
			},
			{
				"symbol": "^IXIC",
				"name": "Nasdaq",
				"kind": "index"
			},
			{
				"symbol": "^FTSE",
				"name": "FTSE 100",
				"kind": "index"
			},
			{
				"symbol": "^GDAXI",
				"name": "DAX",
				"kind": "index"
			},
			{
				"symbol": "^FCHI",
				"name": "CAC 40",
				"kind": "index"
			},
			{
				"symbol": "^STOXX50E",
				"name": "Euro Stoxx 50",
				"kind": "index"
			},
			{
				"symbol": "^N225",
				"name": "Nikkei 225",
				"kind": "index"
			},
			{
				"symbol": "^HSI",
				"name": "Hang Seng",
				"kind": "index"
			},
			{
				"symbol": "000001.SS",
				"name": "SSE Composite",
				"kind": "index"
			},
			{
				"symbol": "^NSEI",
				"name": "Nifty 50",
				"kind": "index"
			},
			{
				"symbol": "^KS11",
				"name": "KOSPI",
				"kind": "index"
			},
			{
				"symbol": "^AXJO",
				"name": "ASX 200",
				"kind": "index"
			},
			{
				"symbol": "^TWII",
				"name": "Taiwan weighted",
				"kind": "index"
			},
			{
				"symbol": "^STI",
				"name": "Straits Times",
				"kind": "index"
			},
			{
				"symbol": "^GSPTSE",
				"name": "TSX",
				"kind": "index"
			},
			{
				"symbol": "^SSMI",
				"name": "SMI",
				"kind": "index"
			},
			{
				"symbol": "^OMXS30",
				"name": "OMX 30",
				"kind": "index"
			},
			{
				"symbol": "^AEX",
				"name": "AEX",
				"kind": "index"
			},
			{
				"symbol": "^BFX",
				"name": "BEL 20",
				"kind": "index"
			}
		],
		"etf": [
			{
				"symbol": "SPY",
				"name": "SPDR S&P 500",
				"kind": "etf"
			},
			{
				"symbol": "QQQ",
				"name": "Invesco QQQ",
				"kind": "etf"
			},
			{
				"symbol": "EFA",
				"name": "iShares EAFE",
				"kind": "etf"
			},
			{
				"symbol": "VEA",
				"name": "Vanguard developed",
				"kind": "etf"
			},
			{
				"symbol": "VWO",
				"name": "Vanguard emerging",
				"kind": "etf"
			},
			{
				"symbol": "EWJ",
				"name": "iShares Japan",
				"kind": "etf"
			},
			{
				"symbol": "FXI",
				"name": "iShares China large cap",
				"kind": "etf"
			},
			{
				"symbol": "INDA",
				"name": "iShares India",
				"kind": "etf"
			},
			{
				"symbol": "EWA",
				"name": "iShares Australia",
				"kind": "etf"
			}
		]
	},
	"us": {
		"stock": [
			{
				"symbol": "^GSPC",
				"name": "S&P 500",
				"kind": "index"
			},
			{
				"symbol": "^DJI",
				"name": "Dow Jones",
				"kind": "index"
			},
			{
				"symbol": "^IXIC",
				"name": "Nasdaq",
				"kind": "index"
			},
			{
				"symbol": "AAPL",
				"name": "Apple",
				"kind": "stock"
			},
			{
				"symbol": "MSFT",
				"name": "Microsoft",
				"kind": "stock"
			},
			{
				"symbol": "NVDA",
				"name": "NVIDIA",
				"kind": "stock"
			},
			{
				"symbol": "AMZN",
				"name": "Amazon",
				"kind": "stock"
			},
			{
				"symbol": "GOOGL",
				"name": "Alphabet",
				"kind": "stock"
			},
			{
				"symbol": "META",
				"name": "Meta",
				"kind": "stock"
			},
			{
				"symbol": "AVGO",
				"name": "Broadcom",
				"kind": "stock"
			},
			{
				"symbol": "JPM",
				"name": "JPMorgan",
				"kind": "stock"
			},
			{
				"symbol": "V",
				"name": "Visa",
				"kind": "stock"
			},
			{
				"symbol": "MA",
				"name": "Mastercard",
				"kind": "stock"
			},
			{
				"symbol": "BAC",
				"name": "Bank of America",
				"kind": "stock"
			},
			{
				"symbol": "UNH",
				"name": "UnitedHealth",
				"kind": "stock"
			},
			{
				"symbol": "JNJ",
				"name": "Johnson & Johnson",
				"kind": "stock"
			},
			{
				"symbol": "LLY",
				"name": "Eli Lilly",
				"kind": "stock"
			},
			{
				"symbol": "XOM",
				"name": "Exxon Mobil",
				"kind": "stock"
			},
			{
				"symbol": "CVX",
				"name": "Chevron",
				"kind": "stock"
			},
			{
				"symbol": "HD",
				"name": "Home Depot",
				"kind": "stock"
			},
			{
				"symbol": "COST",
				"name": "Costco",
				"kind": "stock"
			},
			{
				"symbol": "WMT",
				"name": "Walmart",
				"kind": "stock"
			},
			{
				"symbol": "PG",
				"name": "Procter & Gamble",
				"kind": "stock"
			},
			{
				"symbol": "KO",
				"name": "Coca-Cola",
				"kind": "stock"
			},
			{
				"symbol": "DIS",
				"name": "Disney",
				"kind": "stock"
			},
			{
				"symbol": "NFLX",
				"name": "Netflix",
				"kind": "stock"
			}
		],
		"etf": [
			{
				"symbol": "SPY",
				"name": "SPDR S&P 500",
				"kind": "etf"
			},
			{
				"symbol": "QQQ",
				"name": "Invesco QQQ",
				"kind": "etf"
			},
			{
				"symbol": "IWM",
				"name": "iShares Russell 2000",
				"kind": "etf"
			}
		]
	},
	"gb": {
		"stock": [
			{
				"symbol": "^FTSE",
				"name": "FTSE 100",
				"kind": "index"
			},
			{
				"symbol": "HSBA.L",
				"name": "HSBC",
				"kind": "stock"
			},
			{
				"symbol": "SHEL.L",
				"name": "Shell",
				"kind": "stock"
			},
			{
				"symbol": "AZN.L",
				"name": "AstraZeneca",
				"kind": "stock"
			}
		],
		"etf": [{
			"symbol": "EWU",
			"name": "iShares MSCI UK",
			"kind": "etf"
		}]
	},
	"jp": {
		"stock": [
			{
				"symbol": "^N225",
				"name": "Nikkei 225",
				"kind": "index"
			},
			{
				"symbol": "7203.T",
				"name": "Toyota",
				"kind": "stock"
			},
			{
				"symbol": "6758.T",
				"name": "Sony",
				"kind": "stock"
			},
			{
				"symbol": "9984.T",
				"name": "SoftBank",
				"kind": "stock"
			}
		],
		"etf": [{
			"symbol": "EWJ",
			"name": "iShares MSCI Japan",
			"kind": "etf"
		}]
	},
	"de": {
		"stock": [
			{
				"symbol": "^GDAXI",
				"name": "DAX",
				"kind": "index"
			},
			{
				"symbol": "SAP.DE",
				"name": "SAP",
				"kind": "stock"
			},
			{
				"symbol": "SIE.DE",
				"name": "Siemens",
				"kind": "stock"
			}
		],
		"etf": [{
			"symbol": "EWG",
			"name": "iShares MSCI Germany",
			"kind": "etf"
		}]
	},
	"fr": {
		"stock": [
			{
				"symbol": "^FCHI",
				"name": "CAC 40",
				"kind": "index"
			},
			{
				"symbol": "MC.PA",
				"name": "LVMH",
				"kind": "stock"
			},
			{
				"symbol": "OR.PA",
				"name": "L'Oréal",
				"kind": "stock"
			}
		],
		"etf": [{
			"symbol": "EWQ",
			"name": "iShares MSCI France",
			"kind": "etf"
		}]
	},
	"it": {
		"stock": [{
			"symbol": "ENI.MI",
			"name": "ENI",
			"kind": "stock"
		}, {
			"symbol": "ENEL.MI",
			"name": "Enel",
			"kind": "stock"
		}],
		"etf": [{
			"symbol": "EWI",
			"name": "iShares MSCI Italy",
			"kind": "etf"
		}]
	},
	"ca": {
		"stock": [
			{
				"symbol": "^GSPTSE",
				"name": "TSX",
				"kind": "index"
			},
			{
				"symbol": "RY.TO",
				"name": "Royal Bank of Canada",
				"kind": "stock"
			},
			{
				"symbol": "TD.TO",
				"name": "TD Bank",
				"kind": "stock"
			}
		],
		"etf": [{
			"symbol": "EWC",
			"name": "iShares MSCI Canada",
			"kind": "etf"
		}]
	},
	"ch": {
		"stock": [
			{
				"symbol": "^SSMI",
				"name": "SMI",
				"kind": "index"
			},
			{
				"symbol": "NESN.SW",
				"name": "Nestlé",
				"kind": "stock"
			},
			{
				"symbol": "NOVN.SW",
				"name": "Novartis",
				"kind": "stock"
			}
		],
		"etf": [{
			"symbol": "EWL",
			"name": "iShares MSCI Switzerland",
			"kind": "etf"
		}]
	},
	"se": {
		"stock": [{
			"symbol": "^OMXS30",
			"name": "OMX 30",
			"kind": "index"
		}, {
			"symbol": "VOLV-B.ST",
			"name": "Volvo B",
			"kind": "stock"
		}],
		"etf": [{
			"symbol": "EWD",
			"name": "iShares MSCI Sweden",
			"kind": "etf"
		}]
	},
	"nl": {
		"stock": [{
			"symbol": "^AEX",
			"name": "AEX",
			"kind": "index"
		}, {
			"symbol": "ASML.AS",
			"name": "ASML",
			"kind": "stock"
		}],
		"etf": [{
			"symbol": "EWN",
			"name": "iShares MSCI Netherlands",
			"kind": "etf"
		}]
	},
	"be": {
		"stock": [{
			"symbol": "^BFX",
			"name": "BEL 20",
			"kind": "index"
		}, {
			"symbol": "ABI.BR",
			"name": "AB InBev",
			"kind": "stock"
		}],
		"etf": [{
			"symbol": "EWK",
			"name": "iShares MSCI Belgium",
			"kind": "etf"
		}]
	},
	"au": {
		"stock": [
			{
				"symbol": "^AXJO",
				"name": "ASX 200",
				"kind": "index"
			},
			{
				"symbol": "BHP.AX",
				"name": "BHP",
				"kind": "stock"
			},
			{
				"symbol": "CBA.AX",
				"name": "Commonwealth Bank",
				"kind": "stock"
			}
		],
		"etf": [{
			"symbol": "EWA",
			"name": "iShares MSCI Australia",
			"kind": "etf"
		}]
	},
	"cn": {
		"stock": [{
			"symbol": "000001.SS",
			"name": "SSE Composite",
			"kind": "index"
		}, {
			"symbol": "600519.SS",
			"name": "Kweichow Moutai",
			"kind": "stock"
		}],
		"etf": [{
			"symbol": "FXI",
			"name": "iShares China large cap",
			"kind": "etf"
		}]
	},
	"hk": {
		"stock": [
			{
				"symbol": "^HSI",
				"name": "Hang Seng",
				"kind": "index"
			},
			{
				"symbol": "0700.HK",
				"name": "Tencent",
				"kind": "stock"
			},
			{
				"symbol": "0005.HK",
				"name": "HSBC",
				"kind": "stock"
			}
		],
		"etf": [{
			"symbol": "EWH",
			"name": "iShares MSCI Hong Kong",
			"kind": "etf"
		}]
	},
	"in": {
		"stock": [
			{
				"symbol": "^NSEI",
				"name": "Nifty 50",
				"kind": "index"
			},
			{
				"symbol": "^BSESN",
				"name": "Sensex",
				"kind": "index"
			},
			{
				"symbol": "RELIANCE.NS",
				"name": "Reliance",
				"kind": "stock"
			},
			{
				"symbol": "TCS.NS",
				"name": "TCS",
				"kind": "stock"
			}
		],
		"etf": [{
			"symbol": "INDA",
			"name": "iShares MSCI India",
			"kind": "etf"
		}]
	},
	"kr": {
		"stock": [
			{
				"symbol": "^KS11",
				"name": "KOSPI",
				"kind": "index"
			},
			{
				"symbol": "005930.KS",
				"name": "Samsung Electronics",
				"kind": "stock"
			},
			{
				"symbol": "000660.KS",
				"name": "SK hynix",
				"kind": "stock"
			}
		],
		"etf": [{
			"symbol": "EWY",
			"name": "iShares MSCI Korea",
			"kind": "etf"
		}]
	},
	"sg": {
		"stock": [{
			"symbol": "^STI",
			"name": "Straits Times",
			"kind": "index"
		}, {
			"symbol": "D05.SI",
			"name": "DBS",
			"kind": "stock"
		}],
		"etf": [{
			"symbol": "EWS",
			"name": "iShares MSCI Singapore",
			"kind": "etf"
		}]
	},
	"tw": {
		"stock": [{
			"symbol": "^TWII",
			"name": "Taiwan weighted",
			"kind": "index"
		}, {
			"symbol": "2330.TW",
			"name": "TSMC",
			"kind": "stock"
		}],
		"etf": [{
			"symbol": "EWT",
			"name": "iShares MSCI Taiwan",
			"kind": "etf"
		}]
	},
	"za": {
		"stock": [
			{
				"symbol": "^J200.JO",
				"name": "JSE Top 40",
				"kind": "index"
			},
			{
				"symbol": "NPN.JO",
				"name": "Naspers",
				"kind": "stock"
			},
			{
				"symbol": "SBK.JO",
				"name": "Standard Bank",
				"kind": "stock"
			}
		],
		"etf": []
	},
	"sa": {
		"stock": [
			{
				"symbol": "^TASI.SR",
				"name": "Tadawul",
				"kind": "index"
			},
			{
				"symbol": "2222.SR",
				"name": "Saudi Aramco",
				"kind": "stock"
			},
			{
				"symbol": "1120.SR",
				"name": "Al Rajhi",
				"kind": "stock"
			}
		],
		"etf": []
	}
};
var OPTION_UNDERLYINGS = [
	{
		"symbol": "SPY",
		"name": "SPDR S&P 500",
		"kind": "etf"
	},
	{
		"symbol": "QQQ",
		"name": "Invesco QQQ",
		"kind": "etf"
	},
	{
		"symbol": "IWM",
		"name": "iShares Russell 2000",
		"kind": "etf"
	},
	{
		"symbol": "AAPL",
		"name": "Apple",
		"kind": "stock"
	},
	{
		"symbol": "MSFT",
		"name": "Microsoft",
		"kind": "stock"
	},
	{
		"symbol": "NVDA",
		"name": "NVIDIA",
		"kind": "stock"
	},
	{
		"symbol": "AMZN",
		"name": "Amazon",
		"kind": "stock"
	},
	{
		"symbol": "META",
		"name": "Meta",
		"kind": "stock"
	},
	{
		"symbol": "JPM",
		"name": "JPMorgan",
		"kind": "stock"
	},
	{
		"symbol": "GLD",
		"name": "SPDR Gold",
		"kind": "etf"
	},
	{
		"symbol": "TLT",
		"name": "20+y Treasury",
		"kind": "etf"
	},
	{
		"symbol": "HYG",
		"name": "High yield",
		"kind": "etf"
	}
];
function optionBook(market) {
	if (market === "global" || market === "us") return OPTION_UNDERLYINGS;
	return EQUITY_BOOKS[market].stock.filter((row) => row.kind !== "index");
}
function equityBook(market, kind) {
	const book = EQUITY_BOOKS[market];
	if (kind === "etf") return book.etf;
	return book.stock;
}
function equitySearchScope(market) {
	return market === "global" ? "equity" : market;
}
var SEARCH_EXCHANGES = {
	"us": {
		"codes": [
			"NMS",
			"NGM",
			"NCM",
			"NYQ",
			"PCX",
			"ASE",
			"BTS",
			"NYS",
			"NIM"
		],
		"disp": [
			"nasdaq",
			"nyse",
			"nysearca",
			"nyseamerican",
			"bats",
			"amex"
		]
	},
	"gb": {
		"codes": ["LSE"],
		"disp": ["london"]
	},
	"jp": {
		"codes": ["JPX", "OSA"],
		"disp": ["tokyo", "osaka"]
	},
	"de": {
		"codes": ["GER"],
		"disp": ["xetra", "frankfurt"]
	},
	"fr": {
		"codes": ["PAR"],
		"disp": ["paris"]
	},
	"it": {
		"codes": ["MIL"],
		"disp": ["milan"]
	},
	"ca": {
		"codes": ["TOR", "VAN"],
		"disp": [
			"toronto",
			"tsx",
			"tsxv"
		]
	},
	"ch": {
		"codes": ["EBS"],
		"disp": ["swiss"]
	},
	"se": {
		"codes": ["STO"],
		"disp": ["stockholm"]
	},
	"nl": {
		"codes": ["AMS"],
		"disp": ["amsterdam"]
	},
	"be": {
		"codes": ["BRU"],
		"disp": ["brussels"]
	},
	"au": {
		"codes": ["ASX"],
		"disp": ["asx"]
	},
	"cn": {
		"codes": ["SHH", "SHZ"],
		"disp": ["shanghai", "shenzhen"]
	},
	"hk": {
		"codes": ["HKG"],
		"disp": ["hkse", "hongkong"]
	},
	"in": {
		"codes": [
			"NSI",
			"BOM",
			"BSE"
		],
		"disp": ["nse", "bse"]
	},
	"kr": {
		"codes": ["KSC", "KOE"],
		"disp": ["korea", "kosdaq"]
	},
	"sg": {
		"codes": ["SES"],
		"disp": ["singapore"]
	},
	"tw": {
		"codes": ["TAI", "TWO"],
		"disp": ["taiwan"]
	}
};
var RATES_MARKETS = [
	{
		"id": "global",
		"label": "Global"
	},
	{
		"id": "us",
		"label": "United States"
	},
	{
		"id": "gb",
		"label": "United Kingdom"
	},
	{
		"id": "de",
		"label": "Germany"
	},
	{
		"id": "eu",
		"label": "Euro area"
	},
	{
		"id": "jp",
		"label": "Japan"
	},
	{
		"id": "ca",
		"label": "Canada"
	},
	{
		"id": "au",
		"label": "Australia"
	},
	{
		"id": "in",
		"label": "India"
	}
];
var RATES_BOOKS = {
	"global": [
		{
			"symbol": "^IRX",
			"name": "US 13-week",
			"kind": "yield",
			"digits": 3
		},
		{
			"symbol": "^FVX",
			"name": "US 5-year",
			"kind": "yield",
			"digits": 3
		},
		{
			"symbol": "^TNX",
			"name": "US 10-year",
			"kind": "yield",
			"digits": 3
		},
		{
			"symbol": "^TYX",
			"name": "US 30-year",
			"kind": "yield",
			"digits": 3
		},
		{
			"symbol": "TLT",
			"name": "20+y Treasury ETF",
			"kind": "fund"
		},
		{
			"symbol": "LQD",
			"name": "USD investment grade",
			"kind": "fund"
		},
		{
			"symbol": "HYG",
			"name": "USD high yield",
			"kind": "fund"
		},
		{
			"symbol": "EMB",
			"name": "USD emerging bonds",
			"kind": "fund"
		},
		{
			"symbol": "SR3=F",
			"name": "3-month SOFR",
			"kind": "future",
			"digits": 3
		},
		{
			"symbol": "ZQ=F",
			"name": "30-day fed funds",
			"kind": "future",
			"digits": 3
		},
		{
			"symbol": "IGLT.L",
			"name": "iShares UK gilts",
			"kind": "fund"
		},
		{
			"symbol": "EXX6.DE",
			"name": "iShares Germany 10.5y+",
			"kind": "fund"
		},
		{
			"symbol": "SYBB.DE",
			"name": "SPDR euro government",
			"kind": "fund"
		},
		{
			"symbol": "612A.T",
			"name": "ONE JGB ETF",
			"kind": "fund"
		},
		{
			"symbol": "XBB.TO",
			"name": "iShares Canada universe",
			"kind": "fund"
		},
		{
			"symbol": "IAF.AX",
			"name": "iShares Australia composite",
			"kind": "fund"
		},
		{
			"symbol": "GSEC10ADD.NS",
			"name": "DSP Nifty 10y G-Sec",
			"kind": "fund"
		}
	],
	"us": [
		{
			"symbol": "^IRX",
			"name": "US 13-week",
			"kind": "yield",
			"digits": 3
		},
		{
			"symbol": "^FVX",
			"name": "US 5-year",
			"kind": "yield",
			"digits": 3
		},
		{
			"symbol": "^TNX",
			"name": "US 10-year",
			"kind": "yield",
			"digits": 3
		},
		{
			"symbol": "^TYX",
			"name": "US 30-year",
			"kind": "yield",
			"digits": 3
		},
		{
			"symbol": "ZT=F",
			"name": "2-year note",
			"kind": "future"
		},
		{
			"symbol": "ZF=F",
			"name": "5-year note",
			"kind": "future"
		},
		{
			"symbol": "ZN=F",
			"name": "10-year note",
			"kind": "future"
		},
		{
			"symbol": "ZB=F",
			"name": "US bond future",
			"kind": "future"
		},
		{
			"symbol": "SR3=F",
			"name": "3-month SOFR",
			"kind": "future",
			"digits": 3
		},
		{
			"symbol": "ZQ=F",
			"name": "30-day fed funds",
			"kind": "future",
			"digits": 3
		},
		{
			"symbol": "SHY",
			"name": "1–3y Treasury",
			"kind": "fund"
		},
		{
			"symbol": "IEF",
			"name": "7–10y Treasury",
			"kind": "fund"
		},
		{
			"symbol": "TLT",
			"name": "20+y Treasury",
			"kind": "fund"
		},
		{
			"symbol": "TIP",
			"name": "TIPS",
			"kind": "fund"
		},
		{
			"symbol": "AGG",
			"name": "US aggregate",
			"kind": "fund"
		},
		{
			"symbol": "LQD",
			"name": "Investment grade",
			"kind": "fund"
		},
		{
			"symbol": "HYG",
			"name": "High yield",
			"kind": "fund"
		},
		{
			"symbol": "EMB",
			"name": "USD emerging",
			"kind": "fund"
		}
	],
	"gb": [{
		"symbol": "IGLT.L",
		"name": "iShares Core UK Gilts",
		"kind": "fund"
	}, {
		"symbol": "VGOV.L",
		"name": "Vanguard UK Gilt",
		"kind": "fund"
	}],
	"de": [{
		"symbol": "EXX6.DE",
		"name": "iShares Germany Govt 10.5+",
		"kind": "fund"
	}],
	"eu": [
		{
			"symbol": "SYBB.DE",
			"name": "SPDR Bloomberg Euro Govt",
			"kind": "fund"
		},
		{
			"symbol": "IBCX.L",
			"name": "iShares Core Euro Govt",
			"kind": "fund"
		},
		{
			"symbol": "IBGS.MI",
			"name": "iShares Euro Govt 1–3y",
			"kind": "fund"
		}
	],
	"jp": [{
		"symbol": "612A.T",
		"name": "ONE JGB ETF",
		"kind": "fund"
	}],
	"ca": [{
		"symbol": "XBB.TO",
		"name": "iShares Core Canada Universe",
		"kind": "fund"
	}, {
		"symbol": "ZAG.TO",
		"name": "BMO Aggregate Bond",
		"kind": "fund"
	}],
	"au": [{
		"symbol": "IAF.AX",
		"name": "iShares Core Composite Bond",
		"kind": "fund"
	}, {
		"symbol": "VGB.AX",
		"name": "Vanguard Australian Govt Bond",
		"kind": "fund"
	}],
	"in": [{
		"symbol": "GSEC10ADD.NS",
		"name": "DSP Nifty 10y G-Sec ETF",
		"kind": "fund"
	}]
};
var RATE_IMPLIED = /* @__PURE__ */ new Set(["SR3=F", "ZQ=F"]);
var RATES_OPTIONABLE = /* @__PURE__ */ new Set([
	"TLT",
	"IEF",
	"SHY",
	"LQD",
	"HYG",
	"TIP",
	"AGG",
	"EMB",
	"BND"
]);
var METALS = [
	{
		"symbol": "GC=F",
		"name": "Gold",
		"kind": "metal"
	},
	{
		"symbol": "SI=F",
		"name": "Silver",
		"kind": "metal"
	},
	{
		"symbol": "HG=F",
		"name": "Copper",
		"kind": "metal"
	},
	{
		"symbol": "PL=F",
		"name": "Platinum",
		"kind": "metal"
	},
	{
		"symbol": "PA=F",
		"name": "Palladium",
		"kind": "metal"
	},
	{
		"symbol": "GLD",
		"name": "SPDR Gold",
		"kind": "etf"
	},
	{
		"symbol": "SLV",
		"name": "iShares Silver",
		"kind": "etf"
	},
	{
		"symbol": "CPER",
		"name": "US Copper",
		"kind": "etf"
	}
];
var ENERGY = [
	{
		"symbol": "CL=F",
		"name": "WTI crude",
		"kind": "energy"
	},
	{
		"symbol": "BZ=F",
		"name": "Brent",
		"kind": "energy"
	},
	{
		"symbol": "NG=F",
		"name": "Henry Hub gas",
		"kind": "energy",
		"digits": 3
	},
	{
		"symbol": "HO=F",
		"name": "Heating oil",
		"kind": "energy"
	},
	{
		"symbol": "RB=F",
		"name": "RBOB gasoline",
		"kind": "energy"
	},
	{
		"symbol": "USO",
		"name": "US Oil Fund",
		"kind": "etf"
	},
	{
		"symbol": "UNG",
		"name": "US Natural Gas Fund",
		"kind": "etf"
	}
];
var FX_PAIRS = [
	{
		"symbol": "DX-Y.NYB",
		"name": "Dollar index",
		"kind": "fx",
		"digits": 3,
		"group": "g10"
	},
	{
		"symbol": "EURUSD=X",
		"name": "EUR/USD",
		"kind": "fx",
		"digits": 4,
		"group": "g10",
		"ecb": "invert",
		"ecbCode": "EUR"
	},
	{
		"symbol": "GBPUSD=X",
		"name": "GBP/USD",
		"kind": "fx",
		"digits": 4,
		"group": "g10",
		"ecb": "invert",
		"ecbCode": "GBP"
	},
	{
		"symbol": "USDJPY=X",
		"name": "USD/JPY",
		"kind": "fx",
		"digits": 2,
		"group": "g10",
		"ecb": "direct",
		"ecbCode": "JPY"
	},
	{
		"symbol": "AUDUSD=X",
		"name": "AUD/USD",
		"kind": "fx",
		"digits": 4,
		"group": "g10",
		"ecb": "invert",
		"ecbCode": "AUD"
	},
	{
		"symbol": "USDCAD=X",
		"name": "USD/CAD",
		"kind": "fx",
		"digits": 4,
		"group": "g10",
		"ecb": "direct",
		"ecbCode": "CAD"
	},
	{
		"symbol": "USDCHF=X",
		"name": "USD/CHF",
		"kind": "fx",
		"digits": 4,
		"group": "g10",
		"ecb": "direct",
		"ecbCode": "CHF"
	},
	{
		"symbol": "NZDUSD=X",
		"name": "NZD/USD",
		"kind": "fx",
		"digits": 4,
		"group": "g10",
		"ecb": "invert",
		"ecbCode": "NZD"
	},
	{
		"symbol": "USDSEK=X",
		"name": "USD/SEK",
		"kind": "fx",
		"digits": 4,
		"group": "g10",
		"ecb": "direct",
		"ecbCode": "SEK"
	},
	{
		"symbol": "USDNOK=X",
		"name": "USD/NOK",
		"kind": "fx",
		"digits": 4,
		"group": "g10",
		"ecb": "direct",
		"ecbCode": "NOK"
	},
	{
		"symbol": "USDINR=X",
		"name": "USD/INR",
		"kind": "fx",
		"digits": 4,
		"group": "asia",
		"ecb": "direct",
		"ecbCode": "INR"
	},
	{
		"symbol": "CNH=X",
		"name": "USD/CNH",
		"kind": "fx",
		"digits": 4,
		"group": "asia"
	},
	{
		"symbol": "USDHKD=X",
		"name": "USD/HKD",
		"kind": "fx",
		"digits": 4,
		"group": "asia",
		"ecb": "direct",
		"ecbCode": "HKD"
	},
	{
		"symbol": "USDSGD=X",
		"name": "USD/SGD",
		"kind": "fx",
		"digits": 4,
		"group": "asia",
		"ecb": "direct",
		"ecbCode": "SGD"
	},
	{
		"symbol": "USDKRW=X",
		"name": "USD/KRW",
		"kind": "fx",
		"digits": 2,
		"group": "asia",
		"ecb": "direct",
		"ecbCode": "KRW"
	},
	{
		"symbol": "EURJPY=X",
		"name": "EUR/JPY",
		"kind": "fx",
		"digits": 2,
		"group": "cross"
	},
	{
		"symbol": "GBPJPY=X",
		"name": "GBP/JPY",
		"kind": "fx",
		"digits": 2,
		"group": "cross"
	}
];
var LAB_PRESETS = [
	{
		"symbol": "^GSPC",
		"name": "S&P 500"
	},
	{
		"symbol": "^FTSE",
		"name": "FTSE 100"
	},
	{
		"symbol": "^N225",
		"name": "Nikkei 225"
	},
	{
		"symbol": "^GDAXI",
		"name": "DAX"
	},
	{
		"symbol": "^NSEI",
		"name": "Nifty 50"
	},
	{
		"symbol": "^HSI",
		"name": "Hang Seng"
	},
	{
		"symbol": "EURUSD=X",
		"name": "EUR/USD"
	},
	{
		"symbol": "^TNX",
		"name": "US 10-year"
	},
	{
		"symbol": "GC=F",
		"name": "Gold"
	},
	{
		"symbol": "CL=F",
		"name": "WTI"
	}
];
var PORTFOLIO_SEED = [
	"SPY",
	"EFA",
	"GLD",
	"TLT"
];
EQUITY_BOOKS.us.stock = [...EQUITY_BOOKS.us.stock.filter((row) => row.kind === "index"), ...SCREENER.slice(0, 29).map((row) => ({
	symbol: row.symbol,
	name: row.name,
	kind: "stock"
}))];
function addStocks(market, rows) {
	const book = EQUITY_BOOKS[market].stock;
	for (const row of rows) if (!book.some((item) => item.symbol === row.symbol)) book.push({
		symbol: row.symbol,
		name: row.name,
		kind: "stock"
	});
}
addStocks("gb", [
	{
		symbol: "ULVR.L",
		name: "Unilever"
	},
	{
		symbol: "BP.L",
		name: "BP"
	},
	{
		symbol: "GSK.L",
		name: "GSK"
	},
	{
		symbol: "DGE.L",
		name: "Diageo"
	},
	{
		symbol: "RIO.L",
		name: "Rio Tinto"
	}
]);
addStocks("de", [
	{
		symbol: "ALV.DE",
		name: "Allianz"
	},
	{
		symbol: "DTE.DE",
		name: "Deutsche Telekom"
	},
	{
		symbol: "BMW.DE",
		name: "BMW"
	},
	{
		symbol: "MBG.DE",
		name: "Mercedes-Benz"
	}
]);
addStocks("fr", [
	{
		symbol: "TTE.PA",
		name: "TotalEnergies"
	},
	{
		symbol: "AIR.PA",
		name: "Airbus"
	},
	{
		symbol: "SAN.PA",
		name: "Sanofi"
	}
]);
addStocks("nl", [
	{
		symbol: "PHIA.AS",
		name: "Philips"
	},
	{
		symbol: "INGA.AS",
		name: "ING"
	},
	{
		symbol: "HEIA.AS",
		name: "Heineken"
	}
]);
addStocks("ch", [{
	symbol: "RO.SW",
	name: "Roche"
}, {
	symbol: "UBSG.SW",
	name: "UBS"
}]);
addStocks("it", [{
	symbol: "ISP.MI",
	name: "Intesa Sanpaolo"
}, {
	symbol: "RACE.MI",
	name: "Ferrari"
}]);
addStocks("se", [{
	symbol: "ERIC-B.ST",
	name: "Ericsson"
}, {
	symbol: "HM-B.ST",
	name: "H&M"
}]);
addStocks("be", [{
	symbol: "KBC.BR",
	name: "KBC"
}]);
addStocks("ca", [{
	symbol: "SHOP.TO",
	name: "Shopify"
}, {
	symbol: "ENB.TO",
	name: "Enbridge"
}]);
addStocks("jp", [{
	symbol: "8306.T",
	name: "Mitsubishi UFJ"
}, {
	symbol: "8035.T",
	name: "Tokyo Electron"
}]);
addStocks("au", [{
	symbol: "CSL.AX",
	name: "CSL"
}]);
addStocks("hk", [
	{
		symbol: "9988.HK",
		name: "Alibaba"
	},
	{
		symbol: "3690.HK",
		name: "Meituan"
	},
	{
		symbol: "0941.HK",
		name: "China Mobile"
	}
]);
addStocks("cn", [{
	symbol: "601318.SS",
	name: "Ping An"
}]);
addStocks("in", [
	{
		symbol: "HDFCBANK.NS",
		name: "HDFC Bank"
	},
	{
		symbol: "INFY.NS",
		name: "Infosys"
	},
	{
		symbol: "ICICIBANK.NS",
		name: "ICICI Bank"
	}
]);
addStocks("kr", [{
	symbol: "005380.KS",
	name: "Hyundai Motor"
}]);
addStocks("sg", [{
	symbol: "O39.SI",
	name: "OCBC"
}]);
addStocks("tw", [{
	symbol: "2317.TW",
	name: "Hon Hai"
}, {
	symbol: "2454.TW",
	name: "MediaTek"
}]);
function listingDigits(symbol) {
	return [
		...Object.values(RATES_BOOKS).flat(),
		...METALS,
		...ENERGY,
		...FX_PAIRS
	].find((item) => item.symbol === symbol)?.digits ?? (symbol.endsWith("=X") ? 4 : 2);
}
var usStocks = [
	{
		symbol: "^GSPC",
		name: "S&P 500",
		role: "index"
	},
	{
		symbol: "^DJI",
		name: "Dow Jones",
		role: "index"
	},
	{
		symbol: "^IXIC",
		name: "Nasdaq Composite",
		role: "index"
	},
	{
		symbol: "^RUT",
		name: "Russell 2000",
		role: "index"
	},
	{
		symbol: "^VIX",
		name: "CBOE VIX",
		role: "vol",
		digits: 2
	},
	{
		symbol: "SPY",
		name: "SPDR S&P 500",
		role: "etf",
		note: "ETF"
	},
	{
		symbol: "QQQ",
		name: "Invesco QQQ",
		role: "etf",
		note: "ETF"
	},
	{
		symbol: "IWM",
		name: "iShares Russell 2000",
		role: "etf",
		note: "ETF"
	},
	{
		symbol: "XLF",
		name: "Financials Select",
		role: "etf",
		note: "Sector ETF"
	},
	{
		symbol: "XLE",
		name: "Energy Select",
		role: "etf",
		note: "Sector ETF"
	},
	{
		symbol: "XLK",
		name: "Technology Select",
		role: "etf",
		note: "Sector ETF"
	},
	{
		symbol: "AAPL",
		name: "Apple",
		role: "stock"
	},
	{
		symbol: "MSFT",
		name: "Microsoft",
		role: "stock"
	},
	{
		symbol: "NVDA",
		name: "NVIDIA",
		role: "stock"
	},
	{
		symbol: "AMZN",
		name: "Amazon",
		role: "stock"
	},
	{
		symbol: "GOOGL",
		name: "Alphabet",
		role: "stock"
	},
	{
		symbol: "META",
		name: "Meta",
		role: "stock"
	},
	{
		symbol: "BRK-B",
		name: "Berkshire Hathaway",
		role: "stock"
	},
	{
		symbol: "JPM",
		name: "JPMorgan",
		role: "stock"
	},
	{
		symbol: "XOM",
		name: "Exxon Mobil",
		role: "stock"
	},
	{
		symbol: "UNH",
		name: "UnitedHealth",
		role: "stock"
	}
];
var indiaStocks = [
	{
		symbol: "^NSEI",
		name: "Nifty 50",
		role: "index"
	},
	{
		symbol: "^BSESN",
		name: "BSE Sensex",
		role: "index"
	},
	{
		symbol: "^NSEBANK",
		name: "Nifty Bank",
		role: "index"
	},
	{
		symbol: "NIFTYBEES.NS",
		name: "Nippon Nifty BeES",
		role: "etf",
		note: "NSE ETF"
	},
	{
		symbol: "BANKBEES.NS",
		name: "Nippon Bank BeES",
		role: "etf",
		note: "NSE ETF"
	},
	{
		symbol: "RELIANCE.NS",
		name: "Reliance Industries",
		role: "stock"
	},
	{
		symbol: "TCS.NS",
		name: "TCS",
		role: "stock"
	},
	{
		symbol: "HDFCBANK.NS",
		name: "HDFC Bank",
		role: "stock"
	},
	{
		symbol: "ICICIBANK.NS",
		name: "ICICI Bank",
		role: "stock"
	},
	{
		symbol: "INFY.NS",
		name: "Infosys",
		role: "stock"
	},
	{
		symbol: "BHARTIARTL.NS",
		name: "Bharti Airtel",
		role: "stock"
	},
	{
		symbol: "SBIN.NS",
		name: "State Bank of India",
		role: "stock"
	},
	{
		symbol: "LT.NS",
		name: "Larsen & Toubro",
		role: "stock"
	},
	{
		symbol: "ITC.NS",
		name: "ITC",
		role: "stock"
	},
	{
		symbol: "HINDUNILVR.NS",
		name: "Hindustan Unilever",
		role: "stock"
	},
	{
		symbol: "BAJFINANCE.NS",
		name: "Bajaj Finance",
		role: "stock"
	},
	{
		symbol: "SUNPHARMA.NS",
		name: "Sun Pharma",
		role: "stock"
	}
];
var rates = [
	{
		symbol: "^IRX",
		name: "13-week Treasury",
		role: "rate",
		digits: 3,
		percent: true,
		note: "CBOE yield index"
	},
	{
		symbol: "^FVX",
		name: "5-year Treasury",
		role: "rate",
		digits: 3,
		percent: true,
		note: "CBOE yield index"
	},
	{
		symbol: "^TNX",
		name: "10-year Treasury",
		role: "rate",
		digits: 3,
		percent: true,
		note: "CBOE yield index"
	},
	{
		symbol: "^TYX",
		name: "30-year Treasury",
		role: "rate",
		digits: 3,
		percent: true,
		note: "CBOE yield index"
	}
];
var dxy = {
	symbol: "DX-Y.NYB",
	name: "US Dollar Index",
	role: "fx",
	digits: 3,
	note: "ICE"
};
var inr = {
	symbol: "INR=X",
	name: "USD / INR",
	role: "fx",
	digits: 4,
	note: "Yahoo FX"
};
var vix = {
	symbol: "^VIX",
	name: "CBOE VIX",
	role: "vol",
	digits: 2
};
function seg(partial) {
	const symbols = [...partial.symbols, ...partial.context].map((s) => s.symbol);
	return {
		...partial,
		fetch: [...new Set(symbols)]
	};
}
var SEGMENTS = {
	us: seg({
		id: "us",
		path: "/us",
		nav: "US equities",
		kicker: "Cash equities",
		title: "United States",
		lede: "Indices, sector ETFs, and large-cap names. Daily bars and the latest print come from Yahoo Finance. RSI, moving averages, MACD, Bollinger, ATR, and realized volatility are calculated here from those bars.",
		caveat: "Headline prices are the latest Yahoo print. Charts use split- and dividend-adjusted closes when Yahoo supplies them, so a long history is not distorted by a split. Nothing on this page is a model fill.",
		benchmark: "^GSPC",
		symbols: usStocks,
		context: [
			rates[0],
			rates[2],
			rates[3],
			dxy
		]
	}),
	india: seg({
		id: "india",
		path: "/india",
		nav: "India equities",
		kicker: "NSE and BSE",
		title: "Indian equities",
		lede: "Nifty, Sensex, Bank Nifty, and liquid NSE names via Yahoo’s India listings. There is no keyless official NSE feed, so a symbol that Yahoo does not carry is left blank rather than estimated.",
		caveat: "These are exchange-listed prices as Yahoo reports them, not a broker’s depth-of-book. ETF rows are funds, not the index itself. Adjusted closes are used on the chart when Yahoo provides them.",
		benchmark: "^NSEI",
		symbols: indiaStocks,
		context: [
			inr,
			rates[2],
			vix
		]
	}),
	gold: seg({
		id: "gold",
		path: "/gold",
		nav: "Gold",
		kicker: "Bullion",
		title: "Gold",
		lede: "COMEX gold futures (GC=F), US bullion ETFs, and Nippon Gold BeES on the NSE. An INR-per-10g cross is shown only as arithmetic on those two live inputs, and it is labeled as a cross — not an MCX print.",
		caveat: "GC=F is a futures contract, GLD and IAU are US funds, and GOLDBEES.NS is an Indian ETF. None of them is the LBMA spot fix. The INR cross ignores duty, GST, and local premium.",
		benchmark: "GC=F",
		symbols: [
			{
				symbol: "GC=F",
				name: "COMEX gold",
				role: "future",
				digits: 2,
				note: "USD / troy oz"
			},
			{
				symbol: "GLD",
				name: "SPDR Gold Shares",
				role: "etf",
				note: "US ETF"
			},
			{
				symbol: "IAU",
				name: "iShares Gold Trust",
				role: "etf",
				note: "US ETF"
			},
			{
				symbol: "GOLDBEES.NS",
				name: "Nippon Gold BeES",
				role: "etf",
				note: "NSE gold ETF, INR"
			}
		],
		context: [
			{
				symbol: "SI=F",
				name: "COMEX silver",
				role: "future",
				digits: 3,
				note: "For the gold/silver ratio"
			},
			inr,
			rates[2],
			dxy
		]
	}),
	silver: seg({
		id: "silver",
		path: "/silver",
		nav: "Indian silver",
		kicker: "Bullion",
		title: "Indian silver",
		lede: "Nippon Silver BeES is the India-listed series. COMEX silver (SI=F) and the US SLV fund sit beside it so the domestic ETF can be read against the global contract. The INR-per-kg figure is a labeled cross, not an MCX settlement.",
		caveat: "MCX silver does not publish a keyless official quote, so it is not shown. Silver BeES can trade at a premium or discount to bullion. The cross ignores duty, GST, and that premium.",
		benchmark: "SILVERBEES.NS",
		symbols: [
			{
				symbol: "SILVERBEES.NS",
				name: "Nippon Silver BeES",
				role: "etf",
				note: "NSE silver ETF, INR"
			},
			{
				symbol: "SI=F",
				name: "COMEX silver",
				role: "future",
				digits: 3,
				note: "USD / troy oz"
			},
			{
				symbol: "SLV",
				name: "iShares Silver Trust",
				role: "etf",
				note: "US ETF"
			}
		],
		context: [
			{
				symbol: "GC=F",
				name: "COMEX gold",
				role: "future",
				digits: 2,
				note: "For the gold/silver ratio"
			},
			inr,
			rates[2]
		]
	}),
	gas: seg({
		id: "gas",
		path: "/gas",
		nav: "Natural gas",
		kicker: "Energy",
		title: "Natural gas",
		lede: "NYMEX Henry Hub futures (NG=F) are the liquid public benchmark. UNG is the US futures ETF, not the hub price. GAIL is an Indian gas utility equity, not a gas molecule.",
		caveat: "No keyless MCX natural-gas print is available, so none is invented. UNG’s long-run path diverges from the hub because the fund rolls futures. GAIL’s share price is a company, not a commodity.",
		benchmark: "NG=F",
		symbols: [
			{
				symbol: "NG=F",
				name: "NYMEX Henry Hub",
				role: "future",
				digits: 3,
				note: "USD / mmBtu"
			},
			{
				symbol: "UNG",
				name: "US Natural Gas Fund",
				role: "etf",
				note: "ETF, not the hub"
			},
			{
				symbol: "GAIL.NS",
				name: "GAIL India",
				role: "stock",
				note: "Gas utility equity"
			}
		],
		context: [{
			symbol: "CL=F",
			name: "WTI crude",
			role: "future",
			digits: 2,
			note: "Energy complex"
		}, vix]
	}),
	crude: seg({
		id: "crude",
		path: "/crude",
		nav: "Crude oil",
		kicker: "Energy",
		title: "Crude oil",
		lede: "Brent (BZ=F) is the benchmark most Indian cargoes reference. WTI (CL=F) is the NYMEX contract. USO is an ETF. ONGC and Reliance are equities with oil exposure, not a barrel price and not the PPAC Indian basket.",
		caveat: "The Indian crude basket is not published on a keyless API, so it is omitted. Futures are contracts with expiry; the Yahoo series is the front continuation as they publish it.",
		benchmark: "BZ=F",
		symbols: [
			{
				symbol: "BZ=F",
				name: "Brent crude",
				role: "future",
				digits: 2,
				note: "USD / barrel"
			},
			{
				symbol: "CL=F",
				name: "WTI crude",
				role: "future",
				digits: 2,
				note: "USD / barrel"
			},
			{
				symbol: "USO",
				name: "US Oil Fund",
				role: "etf",
				note: "ETF, not the barrel"
			},
			{
				symbol: "ONGC.NS",
				name: "ONGC",
				role: "stock",
				note: "Upstream equity"
			},
			{
				symbol: "RELIANCE.NS",
				name: "Reliance Industries",
				role: "stock",
				note: "Conglomerate, not a barrel"
			}
		],
		context: [
			dxy,
			inr,
			vix
		]
	})
};
var SEGMENT_LIST = [
	SEGMENTS.us,
	SEGMENTS.india,
	SEGMENTS.gold,
	SEGMENTS.silver,
	SEGMENTS.gas,
	SEGMENTS.crude
];
var MACRO_PRINTS = [
	{
		symbol: "^GSPC",
		label: "US",
		name: "S&P 500",
		digits: 2
	},
	{
		symbol: "^STOXX50E",
		label: "EMEA",
		name: "Euro Stoxx 50",
		digits: 2
	},
	{
		symbol: "^NSEI",
		label: "India",
		name: "Nifty 50",
		digits: 2
	},
	{
		symbol: "^N225",
		label: "APAC",
		name: "Nikkei 225",
		digits: 2
	}
];
var MACRO_MARKET_SYMBOLS = MACRO_PRINTS.map((row) => row.symbol);
var WB_COUNTRIES = [
	{
		id: "US",
		iso3: "USA",
		label: "United States"
	},
	{
		id: "CN",
		iso3: "CHN",
		label: "China"
	},
	{
		id: "JP",
		iso3: "JPN",
		label: "Japan"
	},
	{
		id: "IN",
		iso3: "IND",
		label: "India"
	},
	{
		id: "DE",
		iso3: "DEU",
		label: "Germany"
	},
	{
		id: "GB",
		iso3: "GBR",
		label: "United Kingdom"
	},
	{
		id: "FR",
		iso3: "FRA",
		label: "France"
	},
	{
		id: "KR",
		iso3: "KOR",
		label: "Korea"
	},
	{
		id: "AU",
		iso3: "AUS",
		label: "Australia"
	},
	{
		id: "CA",
		iso3: "CAN",
		label: "Canada"
	},
	{
		id: "BR",
		iso3: "BRA",
		label: "Brazil"
	},
	{
		id: "ZA",
		iso3: "ZAF",
		label: "South Africa"
	},
	{
		id: "SA",
		iso3: "SAU",
		label: "Saudi Arabia"
	},
	{
		id: "ID",
		iso3: "IDN",
		label: "Indonesia"
	},
	{
		id: "MX",
		iso3: "MEX",
		label: "Mexico"
	}
];
var WB_DEFAULT = ["US", "IN"];
var bySymbol = /* @__PURE__ */ new Map();
for (const segment of SEGMENT_LIST) for (const item of [...segment.symbols, ...segment.context]) if (!bySymbol.has(item.symbol)) bySymbol.set(item.symbol, item);
for (const item of rates) if (!bySymbol.has(item.symbol)) bySymbol.set(item.symbol, item);
[...new Set([
	{
		title: "Equities",
		items: [
			{
				symbol: "^GSPC",
				href: "/us"
			},
			{
				symbol: "^IXIC",
				href: "/us"
			},
			{
				symbol: "^NSEI",
				href: "/india"
			},
			{
				symbol: "^BSESN",
				href: "/india"
			},
			{
				symbol: "^NSEBANK",
				href: "/india"
			}
		]
	},
	{
		title: "Bullion and energy",
		items: [
			{
				symbol: "GC=F",
				href: "/gold"
			},
			{
				symbol: "GOLDBEES.NS",
				href: "/gold"
			},
			{
				symbol: "SI=F",
				href: "/silver"
			},
			{
				symbol: "SILVERBEES.NS",
				href: "/silver"
			},
			{
				symbol: "NG=F",
				href: "/gas"
			},
			{
				symbol: "BZ=F",
				href: "/crude"
			},
			{
				symbol: "CL=F",
				href: "/crude"
			}
		]
	},
	{
		title: "Rates and FX",
		items: [
			{
				symbol: "^TNX",
				href: "/rates"
			},
			{
				symbol: "^IRX",
				href: "/rates"
			},
			{
				symbol: "^VIX",
				href: "/equities"
			},
			{
				symbol: "DX-Y.NYB",
				href: "/fx"
			},
			{
				symbol: "INR=X",
				href: "/fx"
			}
		]
	}
].flatMap((g) => g.items.map((i) => i.symbol)))];
SEGMENT_LIST.map((segment) => ({
	label: segment.nav,
	symbols: segment.symbols.map((s) => ({
		symbol: s.symbol,
		name: s.name
	}))
}));
var WB_INDICATORS = [
	{
		id: "NY.GDP.MKTP.KD.ZG",
		name: "Real GDP growth",
		unit: "%",
		digits: 2
	},
	{
		id: "FP.CPI.TOTL.ZG",
		name: "Inflation, consumer prices",
		unit: "%",
		digits: 2
	},
	{
		id: "SL.UEM.TOTL.ZS",
		name: "Unemployment",
		unit: "% of labor force",
		digits: 2
	},
	{
		id: "BN.CAB.XOKA.GD.ZS",
		name: "Current account balance",
		unit: "% of GDP",
		digits: 2
	},
	{
		id: "NE.EXP.GNFS.ZS",
		name: "Exports of goods and services",
		unit: "% of GDP",
		digits: 2
	},
	{
		id: "NE.IMP.GNFS.ZS",
		name: "Imports of goods and services",
		unit: "% of GDP",
		digits: 2
	},
	{
		id: "BX.KLT.DINV.WD.GD.ZS",
		name: "FDI, net inflows",
		unit: "% of GDP",
		digits: 2
	},
	{
		id: "FM.LBL.BMNY.GD.ZS",
		name: "Broad money",
		unit: "% of GDP",
		digits: 2
	},
	{
		id: "CM.MKT.LCAP.GD.ZS",
		name: "Stock market capitalization",
		unit: "% of GDP",
		digits: 2
	},
	{
		id: "GC.DOD.TOTL.GD.ZS",
		name: "Central government debt",
		unit: "% of GDP",
		digits: 2
	},
	{
		id: "GC.BAL.CASH.GD.ZS",
		name: "Cash surplus or deficit",
		unit: "% of GDP",
		digits: 2
	},
	{
		id: "FR.INR.RINR",
		name: "Real interest rate",
		unit: "%",
		digits: 2
	},
	{
		id: "NY.GDP.PCAP.CD",
		name: "GDP per capita",
		unit: "current US$",
		digits: 0
	},
	{
		id: "PA.NUS.FCRF",
		name: "Official exchange rate",
		unit: "local currency per USD",
		digits: 2
	}
];
//#endregion
export { momentumBook as A, rsiBook as B, equityBook as C, listingDigits as D, homeBench as E, realizedVols as F, searchSymbol as G, screenName as H, regionNames as I, stdevSample as J, shareBook as K, regionNews as L, monthVolGrid as M, optionBook as N, mean as O, pearson as P, residualPair as R, countryNames as S, factorShare as T, screenStats as U, runLab as V, screenerChunks as W, volRank as X, suggestWeights as Y, walkForward as Z, WB_DEFAULT as _, LAB_PRESETS as a, corrMatrix as b, METALS as c, RATES_MARKETS as d, RATES_OPTIONABLE as f, WB_COUNTRIES as g, SEARCH_EXCHANGES as h, FX_PAIRS as i, monthGrid as j, mixPortfolio as k, PORTFOLIO_SEED as l, REGIONS as m, ENERGY as n, MACRO_MARKET_SYMBOLS as o, RATE_IMPLIED as p, sma as q, EQUITY_MARKETS as r, MACRO_PRINTS as s, COUNTRY_OPTIONS as t, RATES_BOOKS as u, WB_INDICATORS as v, equitySearchScope as w, countryMeta as x, bsGreeks as y, rollingBeta as z };
