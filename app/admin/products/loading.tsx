import { Skeleton } from "@/components/skeleton";
import { AdminTableSkeleton } from "@/components/admin-table-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <Skeleton className="h-9 w-full max-w-sm" />
        <Skeleton className="h-9 w-32 shrink-0 rounded" />
      </div>

      <AdminTableSkeleton columns={7} />
    </div>
  );
}
