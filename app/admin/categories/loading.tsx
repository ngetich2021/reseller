import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <Skeleton className="h-9 w-full max-w-sm" />
        <Skeleton className="h-9 w-36 shrink-0 rounded" />
      </div>

      <div className="flex-1 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded border border-zinc-200 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="mt-3 space-y-1.5">
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-full" />
            </div>
            <Skeleton className="mt-3 h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
