import { Skeleton } from "@/components/skeleton";

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="mt-2 h-8 w-full rounded-lg" />
      </div>
    </div>
  );
}

function DealCardSkeleton() {
  return (
    <div className="w-36 shrink-0 rounded-xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900 sm:w-44">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <Skeleton className="mt-2 h-3 w-4/5" />
      <Skeleton className="mt-1.5 h-4 w-1/2" />
      <Skeleton className="mt-1 h-3 w-1/3" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-5 w-32" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </header>

      <div className="border-y-2 border-emerald-500 bg-black px-4 py-3 text-center">
        <Skeleton className="mx-auto h-4 w-72 max-w-full bg-zinc-700" />
        <Skeleton className="mx-auto mt-2 h-3 w-56 max-w-full bg-zinc-700" />
      </div>

      <section className="border-b border-zinc-200 bg-white px-6 py-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex gap-4 overflow-hidden pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <DealCardSkeleton key={i} />
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4 border-y border-zinc-200 bg-zinc-100 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900 lg:gap-6">
        <Skeleton className="h-8 w-full max-w-sm sm:w-64" />
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-8 w-40 sm:ml-auto" />
      </div>

      <main className="flex-1 px-6 py-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
          {Array.from({ length: 14 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
