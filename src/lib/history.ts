// Weekly buckets (UTC, weeks start Monday) of when items were added, for the
// profile's progress chart.
export type WeekBucket = { start: string; count: number };

const DAY = 86_400_000;

function startOfWeekUtc(t: number): number {
  const d = new Date(t);
  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - day * DAY;
}

export function weeklyCounts(dates: string[], weeks = 12, now = Date.now()): WeekBucket[] {
  const thisWeek = startOfWeekUtc(now);
  const first = thisWeek - (weeks - 1) * 7 * DAY;
  const counts = new Array<number>(weeks).fill(0);
  for (const iso of dates) {
    const t = Date.parse(iso);
    if (Number.isNaN(t) || t < first) continue;
    const idx = Math.floor((startOfWeekUtc(t) - first) / (7 * DAY));
    if (idx >= 0 && idx < weeks) counts[idx]++;
  }
  return counts.map((count, i) => ({
    start: new Date(first + i * 7 * DAY).toISOString().slice(0, 10),
    count,
  }));
}
