import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CsvRecords } from "@/components/download";

export function BetaLine({ data, against }: { data: { d: string; beta: number }[]; against: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (data.length < 2) return null;
  return (
    <section className="mt-6">
      <h2 className="text-sm font-medium">Rolling beta</h2>
      <p className="mt-1 text-xs text-faint">63-session beta versus {against}. One means it moved with that index. Each point uses closes only through that day.</p>
      {ready ? (
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-line)" vertical={false} />
              <XAxis dataKey="d" minTickGap={48} tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} domain={["auto", "auto"]} />
              <ReferenceLine y={1} stroke="var(--color-line)" />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="rounded-md border border-line bg-bg-elev px-3 py-2 text-xs">
                      <div className="text-muted">{label}</div>
                      <div className="font-mono text-fg">{Number(payload[0].value).toFixed(2)}</div>
                    </div>
                  ) : null
                }
              />
              <Line dataKey="beta" name="Beta" stroke="var(--color-accent)" dot={false} strokeWidth={1.7} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-3 h-64 rounded-md bg-bg-elev" />
      )}
      <CsvRecords file="rolling-beta" rows={data} columns={["d", "beta"]} />
    </section>
  );
}
