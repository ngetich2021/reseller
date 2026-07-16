"use client";

import { useState } from "react";

type CategoryWithSub = {
  id: string;
  name: string;
  subCategories: { id: string; name: string }[];
};

export function CategorySubCategorySelect({
  categories,
  defaultCategoryId,
  defaultSubCategoryId,
}: {
  categories: CategoryWithSub[];
  defaultCategoryId?: string;
  defaultSubCategoryId?: string;
}) {
  const [categoryId, setCategoryId] = useState(defaultCategoryId ?? "");
  const selected = categories.find((c) => c.id === categoryId);
  const inputClass = "w-full rounded border border-zinc-300 px-3 py-1.5";

  return (
    <>
      <div>
        <label className="block text-sm font-semibold">category</label>
        <select
          name="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={inputClass}
        >
          <option value="">None</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold">subCategory</label>
        <select
          name="subCategoryId"
          defaultValue={defaultSubCategoryId ?? ""}
          disabled={!selected}
          className={inputClass}
        >
          <option value="">None</option>
          {selected?.subCategories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
