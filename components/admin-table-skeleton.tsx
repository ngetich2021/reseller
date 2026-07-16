import { Skeleton } from "@/components/skeleton";

export function AdminTableSkeleton({
  columns,
  rows = 6,
  bare = false,
}: {
  columns: number;
  rows?: number;
  bare?: boolean;
}) {
  const table = (
    <table className="w-full text-left text-sm">
      <thead className="border-b bg-zinc-50">
        <tr>
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i} className="px-4 py-3">
              <Skeleton className="h-4 w-16" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r} className="border-b last:border-0">
            {Array.from({ length: columns }).map((_, c) => (
              <td key={c} className="px-4 py-3">
                <Skeleton className="h-4 w-full max-w-32" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (bare) return table;

  return (
    <div className="overflow-x-auto rounded border border-zinc-200 bg-white">
      {table}
    </div>
  );
}
