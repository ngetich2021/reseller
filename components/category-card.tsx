"use client";

import { useState } from "react";
import {
  deleteCategory,
  createSubCategory,
  deleteSubCategory,
} from "@/app/admin/categories/actions";
import { SubmitButton } from "@/components/submit-button";

type SubCategory = { id: string; name: string };
type Category = { id: string; name: string; subCategories: SubCategory[] };

export function CategoryCard({
  category,
  inputClass,
}: {
  category: Category;
  inputClass: string;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 font-semibold"
          aria-expanded={open}
        >
          <span
            className={`inline-block transition-transform ${open ? "rotate-90" : ""}`}
          >
            ▶
          </span>
          {category.name}
          <span className="text-sm font-normal text-zinc-400">
            ({category.subCategories.length})
          </span>
        </button>
        <form
          action={
            deleteCategory.bind(null, category.id) as (
              formData: FormData,
            ) => void
          }
        >
          <SubmitButton
            pendingLabel="Deleting…"
            className="flex items-center gap-2 text-sm text-red-600 hover:underline disabled:opacity-60"
          >
            Delete
          </SubmitButton>
        </form>
      </div>

      {open && (
        <>
          <ul className="mt-3 space-y-1">
            {category.subCategories.map((sub) => (
              <li
                key={sub.id}
                className="flex items-center justify-between rounded bg-zinc-50 px-3 py-1.5 text-sm"
              >
                {sub.name}
                <form
                  action={
                    deleteSubCategory.bind(null, sub.id) as (
                      formData: FormData,
                    ) => void
                  }
                >
                  <SubmitButton
                    pendingLabel="Deleting…"
                    className="flex items-center gap-2 text-red-600 hover:underline disabled:opacity-60"
                  >
                    Delete
                  </SubmitButton>
                </form>
              </li>
            ))}
            {category.subCategories.length === 0 && (
              <li className="text-sm text-zinc-400">No subcategories yet.</li>
            )}
          </ul>

          <form action={createSubCategory} className="mt-3 flex gap-2">
            <input type="hidden" name="categoryId" value={category.id} />
            <input
              name="name"
              placeholder="New subcategory"
              required
              className={inputClass}
            />
            <SubmitButton
              pendingLabel="Adding…"
              className="flex shrink-0 items-center gap-2 rounded bg-zinc-900 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              Add
            </SubmitButton>
          </form>
        </>
      )}
    </div>
  );
}
