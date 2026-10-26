import type { OptionContract } from "./types";

export const STRUCTURES = [
  { id: "long-straddle", label: "Long straddle" },
  { id: "short-straddle", label: "Short straddle" },
  { id: "long-strangle", label: "Long strangle" },
  { id: "short-strangle", label: "Short strangle" },
  { id: "long-call", label: "Long call" },
  { id: "long-put", label: "Long put" },
  { id: "call-spread", label: "Call spread" },
  { id: "put-spread", label: "Put spread" },
  { id: "risk-call", label: "Risk reversal, calls" },
  { id: "risk-put", label: "Risk reversal, puts" },
  { id: "butterfly", label: "Call butterfly" },
] as const;

export type StructureId = (typeof STRUCTURES)[number]["id"];

export type BookLeg = {
  contract: string;
  type: "call" | "put";
  strike: number;
  qty: number;
  mid: number | null;
};

export type OptionBook = {
  name: string;
  vol: string;
  gamma: string;
  debit: number | null;
  delta: number | null;
  gammaN: number | null;
  vega: number | null;
  theta: number | null;
  legs: BookLeg[];
};

function mid(row: OptionContract): number | null {
  if (row.bid != null && row.ask != null && row.ask >= row.bid && row.ask > 0) return (row.bid + row.ask) / 2;
  return row.last != null && row.last > 0 ? row.last : null;
}

function nearest(rows: OptionContract[], type: "call" | "put", strike: number): OptionContract | null {
  const side = rows.filter((row) => row.type === type && Number.isFinite(row.strike));
  if (!side.length) return null;
  return side.reduce((best, row) => (Math.abs(row.strike - strike) < Math.abs(best.strike - strike) ? row : best));
}

function sideLabel(value: number | null, longName: string, shortName: string): string {
  if (value == null || Math.abs(value) < 1e-4) return "Flat";
  return value > 0 ? longName : shortName;
}

function sumGreek(legs: { row: OptionContract; qty: number }[], key: "delta" | "gamma" | "vega" | "theta"): number | null {
  let total = 0;
  for (const leg of legs) {
    const value = leg.row[key];
    if (value == null || !Number.isFinite(value)) return null;
    total += leg.qty * value * 100;
  }
  return total;
}

export function buildStructure(rows: OptionContract[], spot: number | null, id: StructureId): OptionBook | null {
  if (spot == null || !(spot > 0) || rows.length < 2) return null;
  const call = nearest(rows, "call", spot);
  const put = nearest(rows, "put", spot);
  if (!call || !put) return null;
  const wing = Math.max(spot * 0.05, 1);
  const upper = nearest(rows, "call", call.strike + wing);
  const lower = nearest(rows, "put", put.strike - wing);
  const lowCall = nearest(rows, "call", call.strike - wing);
  const picked: { row: OptionContract; qty: number }[] = [];
  const push = (row: OptionContract | null, qty: number) => {
    if (row) picked.push({ row, qty });
  };
  if (id === "long-straddle") {
    push(call, 1);
    push(put, 1);
  } else if (id === "short-straddle") {
    push(call, -1);
    push(put, -1);
  } else if (id === "long-strangle") {
    if (!upper || !lower || upper.strike === call.strike || lower.strike === put.strike) return null;
    push(upper, 1);
    push(lower, 1);
  } else if (id === "short-strangle") {
    if (!upper || !lower || upper.strike === call.strike || lower.strike === put.strike) return null;
    push(upper, -1);
    push(lower, -1);
  } else if (id === "long-call") push(call, 1);
  else if (id === "long-put") push(put, 1);
  else if (id === "call-spread") {
    if (!upper || upper.contract === call.contract) return null;
    push(call, 1);
    push(upper, -1);
  } else if (id === "put-spread") {
    if (!lower || lower.contract === put.contract) return null;
    push(put, 1);
    push(lower, -1);
  } else if (id === "risk-call") {
    if (!upper || !lower) return null;
    push(upper, 1);
    push(lower, -1);
  } else if (id === "risk-put") {
    if (!upper || !lower) return null;
    push(lower, 1);
    push(upper, -1);
  } else {
    if (!lowCall || !upper || lowCall.contract === call.contract || upper.contract === call.contract) return null;
    push(lowCall, 1);
    push(call, -2);
    push(upper, 1);
  }
  if (!picked.length) return null;
  let debit = 0;
  let priced = true;
  const legs: BookLeg[] = picked.map(({ row, qty }) => {
    const mark = mid(row);
    if (mark == null) priced = false;
    else debit += qty * mark * 100;
    return { contract: row.contract, type: row.type, strike: row.strike, qty, mid: mark };
  });
  const vega = sumGreek(picked, "vega");
  const gamma = sumGreek(picked, "gamma");
  return {
    name: STRUCTURES.find((row) => row.id === id)?.label ?? id,
    vol: sideLabel(vega, "Long vol", "Short vol"),
    gamma: sideLabel(gamma, "Long gamma", "Short gamma"),
    debit: priced ? debit : null,
    delta: sumGreek(picked, "delta"),
    gammaN: gamma,
    vega,
    theta: sumGreek(picked, "theta"),
    legs,
  };
}
