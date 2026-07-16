import { Skeleton } from "@/components/skeleton";
import { AdminTableSkeleton } from "@/components/admin-table-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:flex-row">
      <div className="flex-1 space-y-6">
        <div className="rounded border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-4 py-3">
            <Skeleton className="h-5 w-20" />
          </div>
          <AdminTableSkeleton columns={4} rows={3} bare />
        </div>

        <div className="rounded border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-4 py-3">
            <Skeleton className="h-5 w-32" />
          </div>
          <AdminTableSkeleton columns={3} rows={2} bare />
        </div>
      </div>

      <div className="w-full shrink-0 rounded border border-rose-100 bg-rose-50 p-6 lg:w-80">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-1 h-4 w-2/3" />
        <Skeleton className="mt-4 h-9 w-full" />
        <Skeleton className="mt-4 h-24 w-full" />
        <Skeleton className="mt-4 h-9 w-full" />
      </div>
    </div>
  );
}
