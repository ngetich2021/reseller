"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function AdminSearchInput({
  placeholder = "Search",
}: {
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(urlQuery);

  // Keep the input in sync when the URL query changes from elsewhere,
  // without fighting the debounce below. Adjusted during render rather
  // than in an effect to avoid an extra render pass.
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setSearch(urlQuery);
  }

  useEffect(() => {
    if (search === urlQuery) return;
    const timeout = setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (search) next.set("q", search);
      else next.delete("q");
      const url = next.size ? `${pathname}?${next.toString()}` : pathname;
      router.replace(url);
    }, 150);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <input
      type="search"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded border border-zinc-300 px-3 py-2"
    />
  );
}
