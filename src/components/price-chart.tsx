import { useEffect, useMemo, useState } from "react";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CsvButton, CsvRecords } from "@/components/download";
import { formatNum } from "@/lib/format";
import { sma } from "@/lib/market/math";
import type { Bar as PriceBar } from "@/lib/market/types";

type Point = {
  d: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number | null;
  sma50: number | null;
  sma200: number | null;
  wick: [number, number];
};

function Tip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number | number[]; color?: string }[];
  label?: string;
}) {
  const rows = payload?.filter((item) => typeof item.value === "number") ?? [];
  if (!active || !rows.length) return null;
  return (
    <div className="rounded-md border border-line bg-bg-elev px-3 py-2 text-xs">
      <div className="mb-1 text-muted">{label}</div>
      {rows.map((item) => (
        <div key={String(item.name)} className="flex items-center justify-between gap-4 tabular-nums">
          <span className="text-muted">{item.name}</span>
          <span>{formatNum(Number(item.value), 2)}</span>
        </div>
      ))}
    </div>
  );
}

function Candle(props: { x?: number; y?: number; width?: number; height?: number; payload?: Point }) {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props;
  if (!payload) return <g />;
  const top = height >= 0 ? y : y + height;
  const span = Math.abs(height);
  const color = payload.c >= payload.o ? "var(--color-up)" : "var(--color-down)";
  const priceY = (price: number) => {
    const range = payload.h - payload.l;
    if (!(range > 0) || !(span > 0)) return top;
    return top + ((payload.h - price) / range) * span;
  };
  const openY = priceY(payload.o);
  const closeY = priceY(payload.c);
  const bodyY = Math.min(openY, closeY);
  const bodyH = Math.max(1, Math.abs(closeY - openY));
  const cx = x + width / 2;
  const bodyW = Math.max(1, width * 0.62);
  return (
    <g>
      <line x1={cx} x2={cx} y1={top} y2={top + Math.max(span, 1)} stroke={color} strokeWidth={1} />
      <rect x={x + (width - bodyW) / 2} y={bodyY} width={bodyW} height={bodyH} fill={color} />
    </g>
  );
}

export function PriceChart({ bars, file = "prices" }: { bars: PriceBar[]; file?: string }) {
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"line" | "candle">("line");
  useEffect(() => setReady(true), []);
  const data = useMemo<Point[]>(() => {
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
      wick: [bar.l, bar.h],
    }));
  }, [bars]);
  const name = file.replace(/[^\w.=-]+/g, "_").slice(0, 48) || "prices";
  if (!ready) return <div className="h-72 rounded-md bg-bg-elev" />;
  return (
    <div>
      <div className="h-72 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis dataKey="d" minTickGap={40} tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "var(--color-faint)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={72}
              tickFormatter={(value: number) => formatNum(value, value >= 100 ? 0 : 2)}
            />
            <Tooltip content={<Tip />} />
            {mode === "candle" ? (
              <Bar dataKey="wick" name="Range" fill="transparent" isAnimationActive={false} shape={Candle} />
            ) : (
              <Line type="monotone" dataKey="c" name="Close" stroke="var(--color-accent)" strokeWidth={1.75} dot={false} isAnimationActive={false} connectNulls />
            )}
            <Line type="monotone" dataKey="sma50" name="SMA 50" stroke="var(--color-muted)" strokeWidth={1.25} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="sma200" name="SMA 200" stroke="var(--color-faint)" strokeWidth={1.25} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1" role="group" aria-label="Chart type">
          {(["line", "candle"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={mode === item}
              onClick={() => setMode(item)}
              className={"min-h-11 rounded-md px-3 text-sm " + (mode === item ? "bg-accent text-accent-ink" : "border border-line text-muted")}
            >
              {item === "line" ? "Line" : "Candles"}
            </button>
          ))}
        </div>
        <CsvButton
          file={name}
          columns={["date", "open", "high", "low", "close", "volume", "sma50", "sma200"]}
          rows={data.map((row) => [row.d, row.o, row.h, row.l, row.c, row.v, row.sma50, row.sma200])}
        />
      </div>
    </div>
  );
}

export function DualChart({
  data,
  aKey,
  bKey,
  aName,
  bName,
}: {
  data: { d: string; a: number | null; b: number | null }[];
  aKey?: string;
  bKey?: string;
  aName: string;
  bName: string;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  void aKey;
  void bKey;
  if (!ready) return <div className="h-64 rounded-md bg-bg-elev" />;
  return (
    <div>
      <div className="h-64 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis dataKey="d" minTickGap={36} tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="l" tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} width={56} domain={["auto", "auto"]} />
            <YAxis yAxisId="r" orientation="right" tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} width={48} domain={["auto", "auto"]} />
            <Tooltip content={<Tip />} />
            <Line yAxisId="l" type="monotone" dataKey="a" name={aName} stroke="var(--color-accent)" strokeWidth={1.6} dot={false} isAnimationActive={false} />
            <Line yAxisId="r" type="monotone" dataKey="b" name={bName} stroke="var(--color-muted)" strokeWidth={1.4} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <CsvRecords file="dual" rows={data.map((row) => ({ date: row.d, [aName]: row.a, [bName]: row.b }))} />
    </div>
  );
}
