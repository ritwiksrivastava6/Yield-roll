import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { CsvRecords } from "@/components/download";
import { formatNum } from "@/lib/format";
import { armAlert, dropAlert, getDesk, listAlerts, markPings, pullPings, type DeskAlert, type DeskPing } from "@/lib/desk/api";
import type { VolBoard, VolRow } from "@/lib/market/eod.server";

function tone(state: VolRow["state"]): string {
  if (state === "awake") return "text-up";
  if (state === "quiet") return "text-accent";
  return "text-muted";
}

function Card({ row }: { row: VolRow }) {
  return (
    <Link to="/equities" search={{ symbol: row.symbol }} className="block rounded-md border border-line px-3 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-fg">{row.name}</span>
        <span className={`text-xs ${tone(row.state)}`}>{row.state === "awake" ? "Woke up" : "Quiet"}</span>
      </div>
      <div className="mt-2 font-mono text-2xl tabular-nums">{row.pct == null ? "—" : row.pct.toFixed(0)}</div>
      <div className="mt-1 text-xs text-faint">
        {row.rv == null ? "—" : `${row.rv.toFixed(1)}% realized`}
        {row.delta == null ? "" : ` · ${row.delta > 0 ? "+" : ""}${row.delta.toFixed(0)} vs 21 sessions ago`}
      </div>
    </Link>
  );
}

export function VolPage({ initial }: { initial: VolBoard }) {
  const rows = initial.rows;
  const awake = rows.filter((row) => row.state === "awake");
  const quiet = rows.filter((row) => row.state === "quiet");
  const { user, isPending } = useCurrentUserState();
  const [live, setLive] = useState(false);
  const [alerts, setAlerts] = useState<DeskAlert[]>([]);
  const [pings, setPings] = useState<DeskPing[]>([]);
  const signedIn = live && !isPending && !!user;
  const signedOut = live && !isPending && !user;

  useEffect(() => {
    if (!user?.id) return;
    let cancel = false;
    Promise.all([listAlerts(), pullPings()])
      .then(([armed, fired]) => {
        if (cancel) return;
        setAlerts(armed);
        setPings(fired);
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, [user?.id]);

  useEffect(() => {
    setLive(true);
  }, []);

  function armed(symbol: string, side: string, kind = "vol") {
    return alerts.some((alert) => alert.kind === kind && alert.symbol === symbol && (kind === "filing" || alert.side === side));
  }

  async function arm(symbol: string, side: "above" | "below", level: number) {
    await armAlert({ data: { kind: "vol", symbol, side, level } });
    setAlerts(await listAlerts());
  }

  async function armFilings() {
    const desk = await getDesk();
    const symbols = desk.symbols.filter((symbol) => /^[A-Z]{1,6}$/.test(symbol));
    await Promise.all(symbols.map((symbol) => armAlert({ data: { kind: "filing", symbol, side: "above" } })));
    setAlerts(await listAlerts());
    setPings(await pullPings());
  }

  const unseen = pings.filter((ping) => !ping.seen).length;

  return (
    <div className="px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium">Vol</h1>
          <p className="mt-1 text-xs text-faint">21-session realized vol, as a percentile of its own history. Woke up means that percentile rose 15 points or more over 21 sessions. Quiet means it is at 25 or below.</p>
        </div>
        <div className="min-h-11">
          {signedOut ? (
            <Link to="/login" className="inline-flex min-h-11 items-center text-sm text-muted">
              Sign in to keep screens and pings
            </Link>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-xs text-faint">
        US, world ETFs, gold, crude, the long bond and the dollar are Nasdaq end-of-day. {initial.nse}
      </p>
      {unseen ? (
        <div className="mt-4 rounded-md border border-line px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium">{unseen} new</h2>
            <button type="button" className="min-h-11 text-xs text-muted" onClick={() => markPings().then(() => setPings((list) => list.map((ping) => ({ ...ping, seen: true }))))}>
              Mark read
            </button>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-fg">
            {pings.filter((ping) => !ping.seen).map((ping) => (
              <li key={ping.id}>{ping.body}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <section className="mt-6">
        <h2 className="text-sm font-medium">Woke up</h2>
        {awake.length ? (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {awake.map((row) => (
              <Card key={row.symbol} row={row} />
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">Nothing jumped.</p>
        )}
      </section>
      <section className="mt-6">
        <h2 className="text-sm font-medium">Quiet</h2>
        {quiet.length ? (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quiet.map((row) => (
              <Card key={row.symbol} row={row} />
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">Nothing is in the bottom quartile.</p>
        )}
      </section>
      <section className="mt-6">
        <h2 className="text-sm font-medium">Board</h2>
        <div className="mt-3 overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-surface text-xs text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 text-right font-medium">Last</th>
                <th className="px-3 py-2 text-right font-medium">RV 21</th>
                <th className="px-3 py-2 text-right font-medium">Percentile</th>
                <th className="px-3 py-2 text-right font-medium">21s ago</th>
                <th className="px-3 py-2 font-medium">Ping</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.symbol} className="border-t border-line">
                  <td className="px-3 py-2">
                    <Link to="/equities" search={{ symbol: row.symbol }} className="text-fg">
                      {row.name}
                    </Link>
                    <div className="text-xs text-faint">
                      {row.symbol} · {row.group}
                      {row.error ? ` · ${row.error}` : ` · ${row.source}`}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{row.last == null ? "—" : formatNum(row.last, row.last >= 100 ? 0 : 2)}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{row.rv == null ? "—" : row.rv.toFixed(1)}</td>
                  <td className={`px-3 py-2 text-right font-mono tabular-nums ${tone(row.state)}`}>{row.pct == null ? "—" : row.pct.toFixed(0)}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-muted">
                    {row.delta == null ? "—" : `${row.delta > 0 ? "+" : ""}${row.delta.toFixed(0)}`}
                  </td>
                  <td className="px-3 py-2">
                    {signedIn && row.pct != null ? (
                      <span className="flex flex-wrap gap-2">
                        <button type="button" disabled={armed(row.symbol, "below")} className="min-h-11 text-xs text-muted disabled:text-faint" onClick={() => arm(row.symbol, "below", 20)}>
                          {armed(row.symbol, "below") ? "Under 20 on" : "Under 20"}
                        </button>
                        <button type="button" disabled={armed(row.symbol, "above")} className="min-h-11 text-xs text-muted disabled:text-faint" onClick={() => arm(row.symbol, "above", 80)}>
                          {armed(row.symbol, "above") ? "Over 80 on" : "Over 80"}
                        </button>
                        {/^[A-Z]{1,5}$/.test(row.symbol) ? (
                          <button type="button" disabled={armed(row.symbol, "above", "filing")} className="min-h-11 text-xs text-muted disabled:text-faint" onClick={() => armAlert({ data: { kind: "filing", symbol: row.symbol, side: "above" } }).then(() => listAlerts().then(setAlerts))}>
                            {armed(row.symbol, "above", "filing") ? "8-K on" : "8-K"}
                          </button>
                        ) : null}
                      </span>
                    ) : (
                      <span className="text-xs text-faint">{signedOut ? "Sign in" : ""}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CsvRecords
          file="vol-board"
          rows={rows.map((row) => ({
            symbol: row.symbol,
            name: row.name,
            group: row.group,
            last: row.last,
            rv21: row.rv,
            percentile: row.pct,
            delta21: row.delta,
            state: row.state,
            source: row.source,
          }))}
        />
      </section>
      {signedIn ? (
        <section className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-medium">Armed</h2>
            <button type="button" className="min-h-11 rounded-md border border-line px-3 text-xs text-muted" onClick={armFilings}>
              8-K on the book
            </button>
          </div>
          {alerts.length ? (
            <ul className="mt-2 divide-y divide-line rounded-md border border-line text-sm">
              {alerts.map((alert) => (
                <li key={alert.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span>
                    {alert.kind === "screen" ? "Screen hit" : alert.kind === "filing" ? `${alert.symbol} 8-K` : alert.side === "below" ? `${alert.symbol} vol under 20` : `${alert.symbol} vol over 80`}
                  </span>
                  <button type="button" className="min-h-11 text-xs text-muted" onClick={() => dropAlert({ data: { id: alert.id } }).then(() => setAlerts((list) => list.filter((item) => item.id !== alert.id)))}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">None yet.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
