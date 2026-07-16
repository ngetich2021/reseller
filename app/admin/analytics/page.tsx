import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Skeleton } from "@/components/skeleton";

const DAYS = 14;
const BAR_ZONE_PX = 120;
const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

const RANGE_TABS = [
  { key: "day", label: "Last 14 days" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
] as const;
type Range = (typeof RANGE_TABS)[number]["key"];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function parseMonthParam(raw: string | undefined, now: Date) {
  if (raw && /^\d{4}-(0[1-9]|1[0-2])$/.test(raw)) {
    const [y, m] = raw.split("-").map(Number);
    return { year: y, month: m - 1 };
  }
  return { year: now.getFullYear(), month: now.getMonth() };
}

function parseYearParam(raw: string | undefined, now: Date) {
  if (raw && /^\d{4}$/.test(raw)) return Number(raw);
  return now.getFullYear();
}

function periodBarCount(range: Range, rawMonth: string | undefined) {
  if (range === "day") return DAYS;
  if (range === "year") return 12;
  const { year, month } = parseMonthParam(rawMonth, new Date());
  return new Date(year, month + 1, 0).getDate();
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-zinc-200 bg-white p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function BarChart({
  bars,
}: {
  bars: { key: string; count: number; tooltip: string; label: string; emphasize: boolean }[];
}) {
  const maxCount = Math.max(1, ...bars.map((b) => b.count));
  return (
    <>
      <div className="flex items-end gap-1.5" style={{ height: BAR_ZONE_PX }}>
        {bars.map((b) => {
          const barPx =
            b.count === 0
              ? 0
              : Math.max(4, Math.round((b.count / maxCount) * BAR_ZONE_PX));
          return (
            <div key={b.key} className="flex flex-1 justify-center">
              <div
                title={b.tooltip}
                className={`w-full rounded-t ${
                  b.emphasize ? "bg-blue-600" : "bg-blue-300"
                }`}
                style={{ height: barPx }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-1.5 border-t border-zinc-100 pt-1.5">
        {bars.map((b) => (
          <div key={b.key} className="flex-1 text-center text-[10px] text-zinc-400">
            {b.label}
          </div>
        ))}
      </div>
    </>
  );
}

async function Overview() {
  const today = startOfDay(new Date());
  const [totalViews, uniqueVisitorRows, todayViews, todayVisitorRows] =
    await Promise.all([
      prisma.pageView.count(),
      prisma.pageView.groupBy({ by: ["visitorId"] }),
      prisma.pageView.count({ where: { createdAt: { gte: today } } }),
      prisma.pageView.groupBy({
        by: ["visitorId"],
        where: { createdAt: { gte: today } },
      }),
    ]);

  const tiles = [
    { label: "Total visits", value: totalViews },
    { label: "Unique visitors", value: uniqueVisitorRows.length },
    { label: "Visits today", value: todayViews },
    { label: "Unique visitors today", value: todayVisitorRows.length },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {tiles.map((t) => (
        <StatTile key={t.label} label={t.label} value={t.value} />
      ))}
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded border border-zinc-200 bg-white p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-7 w-16" />
        </div>
      ))}
    </div>
  );
}

async function TopPagesTable() {
  const topPaths = await prisma.pageView.groupBy({
    by: ["path"],
    _count: { path: true },
    orderBy: { _count: { path: "desc" } },
    take: 5,
  });

  return (
    <table className="w-full text-left text-sm">
      <tbody>
        {topPaths.map((p) => (
          <tr key={p.path} className="border-b last:border-0">
            <td className="px-4 py-3 text-zinc-700">{p.path}</td>
            <td className="px-4 py-3 text-right text-zinc-500">
              {p._count.path.toLocaleString()}
            </td>
          </tr>
        ))}
        {topPaths.length === 0 && (
          <tr>
            <td colSpan={2} className="px-4 py-8 text-center text-zinc-400">
              No visits recorded yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function TopPagesSkeleton() {
  return (
    <div className="p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-8" />
        </div>
      ))}
    </div>
  );
}

async function PeriodSection({
  range,
  rawMonth,
  rawYear,
}: {
  range: Range;
  rawMonth: string | undefined;
  rawYear: string | undefined;
}) {
  const now = new Date();
  const today = startOfDay(now);
  const todayKey = dayKey(today);

  let heading: string;
  let periodTiles: { label: string; value: number }[];
  let bars: { key: string; count: number; tooltip: string; label: string; emphasize: boolean }[];
  let prevHref: string | null = null;
  let nextHref: string | null = null;

  if (range === "day") {
    const rangeStart = new Date(today);
    rangeStart.setDate(rangeStart.getDate() - (DAYS - 1));

    const [periodTotal, periodUniqueRows, dailyRows] = await Promise.all([
      prisma.pageView.count({ where: { createdAt: { gte: rangeStart } } }),
      prisma.pageView.groupBy({
        by: ["visitorId"],
        where: { createdAt: { gte: rangeStart } },
      }),
      prisma.$queryRaw<{ day: string; count: number | bigint }[]>`
        SELECT strftime('%Y-%m-%d', "createdAt") as day, COUNT(*) as count
        FROM "PageView"
        WHERE "createdAt" >= ${rangeStart.toISOString()}
        GROUP BY day
        ORDER BY day ASC
      `,
    ]);

    const countsByDay = new Map(dailyRows.map((r) => [r.day, Number(r.count)]));
    heading = `Visits — last ${DAYS} days`;
    periodTiles = [
      { label: `Visits (${DAYS} days)`, value: periodTotal },
      { label: `Unique visitors (${DAYS} days)`, value: periodUniqueRows.length },
    ];
    bars = Array.from({ length: DAYS }, (_, i) => {
      const d = new Date(rangeStart);
      d.setDate(d.getDate() + i);
      const key = dayKey(d);
      const count = countsByDay.get(key) ?? 0;
      return {
        key,
        count,
        emphasize: key === todayKey,
        label: String(d.getDate()),
        tooltip: `${d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })}: ${count.toLocaleString()} visit${count === 1 ? "" : "s"}`,
      };
    });
  } else if (range === "month") {
    const { year: selYear, month: selMonth } = parseMonthParam(rawMonth, now);
    const monthStart = new Date(selYear, selMonth, 1);
    const monthEnd = new Date(selYear, selMonth + 1, 1);
    const isCurrentMonth = selYear === now.getFullYear() && selMonth === now.getMonth();

    const [periodTotal, periodUniqueRows, monthDailyRows] = await Promise.all([
      prisma.pageView.count({
        where: { createdAt: { gte: monthStart, lt: monthEnd } },
      }),
      prisma.pageView.groupBy({
        by: ["visitorId"],
        where: { createdAt: { gte: monthStart, lt: monthEnd } },
      }),
      prisma.$queryRaw<{ day: string; count: number | bigint }[]>`
        SELECT strftime('%Y-%m-%d', "createdAt") as day, COUNT(*) as count
        FROM "PageView"
        WHERE "createdAt" >= ${monthStart.toISOString()} AND "createdAt" < ${monthEnd.toISOString()}
        GROUP BY day
        ORDER BY day ASC
      `,
    ]);

    const countsByDay = new Map(monthDailyRows.map((r) => [r.day, Number(r.count)]));
    heading = monthStart.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    periodTiles = [
      { label: "Visits this month", value: periodTotal },
      { label: "Unique visitors this month", value: periodUniqueRows.length },
    ];
    bars = Array.from({ length: new Date(selYear, selMonth + 1, 0).getDate() }, (_, i) => {
      const d = new Date(selYear, selMonth, i + 1);
      const key = dayKey(d);
      const count = countsByDay.get(key) ?? 0;
      return {
        key,
        count,
        emphasize: key === todayKey,
        label: String(i + 1),
        tooltip: `${d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })}: ${count.toLocaleString()} visit${count === 1 ? "" : "s"}`,
      };
    });

    const prev = new Date(selYear, selMonth - 1, 1);
    const next = new Date(selYear, selMonth + 1, 1);
    prevHref = `/admin/analytics?range=month&month=${monthKey(prev.getFullYear(), prev.getMonth())}`;
    nextHref = isCurrentMonth
      ? null
      : `/admin/analytics?range=month&month=${monthKey(next.getFullYear(), next.getMonth())}`;
  } else {
    const selYear = parseYearParam(rawYear, now);
    const yearStart = new Date(selYear, 0, 1);
    const yearEnd = new Date(selYear + 1, 0, 1);
    const isCurrentYear = selYear === now.getFullYear();

    const [periodTotal, periodUniqueRows, yearMonthlyRows] = await Promise.all([
      prisma.pageView.count({
        where: { createdAt: { gte: yearStart, lt: yearEnd } },
      }),
      prisma.pageView.groupBy({
        by: ["visitorId"],
        where: { createdAt: { gte: yearStart, lt: yearEnd } },
      }),
      prisma.$queryRaw<{ month: string; count: number | bigint }[]>`
        SELECT strftime('%Y-%m', "createdAt") as month, COUNT(*) as count
        FROM "PageView"
        WHERE "createdAt" >= ${yearStart.toISOString()} AND "createdAt" < ${yearEnd.toISOString()}
        GROUP BY month
        ORDER BY month ASC
      `,
    ]);

    const countsByMonth = new Map(yearMonthlyRows.map((r) => [r.month, Number(r.count)]));
    heading = String(selYear);
    periodTiles = [
      { label: "Visits this year", value: periodTotal },
      { label: "Unique visitors this year", value: periodUniqueRows.length },
    ];
    bars = MONTH_ABBR.map((abbr, i) => {
      const key = monthKey(selYear, i);
      const count = countsByMonth.get(key) ?? 0;
      return {
        key,
        count,
        emphasize: isCurrentYear && i === now.getMonth(),
        label: abbr,
        tooltip: `${abbr} ${selYear}: ${count.toLocaleString()} visit${count === 1 ? "" : "s"}`,
      };
    });

    prevHref = `/admin/analytics?range=year&year=${selYear - 1}`;
    nextHref = isCurrentYear ? null : `/admin/analytics?range=year&year=${selYear + 1}`;
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-zinc-900">{heading}</p>
        {(prevHref || nextHref) && (
          <div className="flex items-center gap-3 text-sm">
            <Link href={prevHref ?? "#"} className="text-zinc-500 hover:text-zinc-900">
              ← Prev
            </Link>
            {nextHref ? (
              <Link href={nextHref} className="text-zinc-500 hover:text-zinc-900">
                Next →
              </Link>
            ) : (
              <span className="text-zinc-300">Next →</span>
            )}
          </div>
        )}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        {periodTiles.map((t) => (
          <StatTile key={t.label} label={t.label} value={t.value} />
        ))}
      </div>

      <BarChart bars={bars} />
    </>
  );
}

function PeriodSkeleton({
  range,
  rawMonth,
  rawYear,
}: {
  range: Range;
  rawMonth: string | undefined;
  rawYear: string | undefined;
}) {
  const barCount = periodBarCount(range, rawMonth);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <Skeleton className="h-15 w-full" />
        <Skeleton className="h-15 w-full" />
      </div>
      <div className="flex items-end gap-1.5" style={{ height: BAR_ZONE_PX }}>
        {Array.from({ length: barCount }).map((_, i) => (
          <div key={i} className="flex flex-1 justify-center">
            <Skeleton
              className="w-full"
              style={{ height: `${20 + ((i * 37) % 70)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5 border-t border-zinc-100 pt-1.5">
        {Array.from({ length: barCount }).map((_, i) => (
          <Skeleton key={i} className="h-2.5 flex-1" />
        ))}
      </div>
    </div>
  );
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; month?: string; year?: string }>;
}) {
  const { range: rawRange, month: rawMonth, year: rawYear } = await searchParams;
  const range: Range =
    rawRange === "month" || rawRange === "year" ? rawRange : "day";
  const periodKey = `${range}:${rawMonth ?? ""}:${rawYear ?? ""}`;

  return (
    <div className="flex flex-col gap-6 p-6">
      <Suspense fallback={<OverviewSkeleton />}>
        <Overview />
      </Suspense>

      <div className="rounded border border-zinc-200 bg-white">
        <nav className="flex items-center gap-6 border-b border-zinc-200 px-4 font-semibold">
          {RANGE_TABS.map((t) => {
            const active = range === t.key;
            return (
              <Link
                key={t.key}
                href={`/admin/analytics?range=${t.key}`}
                className={`-mb-px border-b-2 px-1 py-3 text-sm ${
                  active
                    ? "border-zinc-900 text-zinc-900"
                    : "border-transparent text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4">
          <Suspense
            key={periodKey}
            fallback={
              <PeriodSkeleton range={range} rawMonth={rawMonth} rawYear={rawYear} />
            }
          >
            <PeriodSection range={range} rawMonth={rawMonth} rawYear={rawYear} />
          </Suspense>
        </div>
      </div>

      <div className="rounded border border-zinc-200 bg-white">
        <p className="border-b border-zinc-200 p-4 text-sm font-semibold text-zinc-900">
          Top pages
        </p>
        <Suspense fallback={<TopPagesSkeleton />}>
          <TopPagesTable />
        </Suspense>
      </div>
    </div>
  );
}
