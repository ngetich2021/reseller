import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded border border-zinc-200 bg-white p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-7 w-16" />
          </div>
        ))}
      </div>
      <div className="rounded border border-zinc-200 bg-white p-4">
        <Skeleton className="mb-4 h-4 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="rounded border border-zinc-200 bg-white p-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-24 w-full" />
      </div>
    </div>
  );
}
