"use client";

import { useState } from "react";
import type { WeekBucket } from "@/lib/history";

const fmtWeek = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });

// Auras added per week (last 12 weeks): one series, so no legend; a hover
// tooltip per column and a hidden table for screen readers.
export function ProgressHistory({ weeks }: { weeks: WeekBucket[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...weeks.map((w) => w.count));
  const total = weeks.reduce((n, w) => n + w.count, 0);
  const thisWeek = weeks[weeks.length - 1]?.count ?? 0;
  const labelIdx = new Set([0, Math.floor((weeks.length - 1) / 2), weeks.length - 1]);

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Progress</h2>
          <p className="text-xs text-[var(--foreground-muted)]">Auras added to the checklist per week</p>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-2xl font-bold tabular-nums">{thisWeek}</p>
            <p className="text-[11px] uppercase tracking-wider text-[var(--foreground-muted)]">This week</p>
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">{total}</p>
            <p className="text-[11px] uppercase tracking-wider text-[var(--foreground-muted)]">Last 12 weeks</p>
          </div>
        </div>
      </div>

      {total === 0 ? (
        <p className="text-sm text-[var(--foreground-faint)]">No auras added in the last 12 weeks.</p>
      ) : (
        <div aria-hidden>
          <div className="relative h-36 flex items-end gap-0.5 border-b border-[var(--border)]">
            <span className="absolute -top-1 left-0 text-[10px] font-mono text-[var(--foreground-faint)]">{max}</span>
            {weeks.map((w, i) => (
              <div
                key={w.start}
                className="relative flex-1 h-full flex items-end justify-center cursor-default"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <div
                  className={`w-full max-w-6 rounded-t transition-opacity ${hover === null || hover === i ? "opacity-100" : "opacity-50"}`}
                  style={{
                    height: w.count === 0 ? 0 : `max(3px, ${(w.count / max) * 100}%)`,
                    background: "var(--accent)",
                  }}
                />
                {hover === i && (
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-1 text-xs shadow-lg">
                    <span className="text-[var(--foreground-muted)]">Week of {fmtWeek(w.start)}: </span>
                    <span className="font-semibold tabular-nums">{w.count}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-0.5 mt-1.5">
            {weeks.map((w, i) => (
              <span key={w.start} className="flex-1 text-center text-[10px] text-[var(--foreground-faint)] whitespace-nowrap">
                {labelIdx.has(i) ? fmtWeek(w.start) : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      <table className="sr-only">
        <caption>Auras added per week</caption>
        <thead>
          <tr>
            <th>Week of</th>
            <th>Auras added</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((w) => (
            <tr key={w.start}>
              <td>{fmtWeek(w.start)}</td>
              <td>{w.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
