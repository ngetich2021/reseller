"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type CategoryWithSub = {
  id: string;
  name: string;
  subCategories: { id: string; name: string }[];
};

export function StorefrontFilters({
  categories,
}: {
  categories: CategoryWithSub[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categoryId = searchParams.get("category") ?? "";
  const subCategoryId = searchParams.get("subCategory") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const urlQuery = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(urlQuery);

  // Keep the input in sync when the URL query changes from elsewhere (e.g.
  // the "Clear search" link), without fighting the debounce below. Adjusted
  // during render rather than in an effect to avoid an extra render pass.
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setSearch(urlQuery);
  }

  const selectedCategory = categories.find((c) => c.id === categoryId);

  function update(params: Record<string, string>, replace = false) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const url = next.size ? `${pathname}?${next.toString()}` : pathname;
    if (replace) router.replace(url);
    else router.push(url);
  }

  useEffect(() => {
    if (search === urlQuery) return;
    const timeout = setTimeout(() => {
      update({ q: search }, true);
    }, 150);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    update({ q: search });
  }

  const selectClass =
    "rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

  return (
    <div className="flex flex-wrap items-center gap-4 border-y border-zinc-200 bg-zinc-100 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900 lg:gap-6">
      <form
        onSubmit={handleSearchSubmit}
        className="w-full max-w-sm sm:w-auto sm:flex-1"
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products, brands, locations..."
          className="w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </form>

      <label className="flex items-center gap-2 font-semibold">
        Category:
        <select
          className={selectClass}
          value={categoryId}
          onChange={(e) =>
            update({ category: e.target.value, subCategory: "" })
          }
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 font-semibold">
        subCategory:
        <select
          className={selectClass}
          value={subCategoryId}
          disabled={!selectedCategory}
          onChange={(e) => update({ subCategory: e.target.value })}
        >
          <option value="">All</option>
          {selectedCategory?.subCategories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 font-semibold sm:ml-auto">
        Filter:
        <select
          className={selectClass}
          value={sort}
          onChange={(e) => update({ sort: e.target.value })}
        >
          <option value="">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </label>
    </div>
  );
}
