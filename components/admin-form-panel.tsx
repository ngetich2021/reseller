"use client";

import { useState } from "react";
import Link from "next/link";

export function AdminFormPanel({
  title,
  toggleLabel,
  isEditing,
  children,
}: {
  title: string;
  toggleLabel: string;
  isEditing: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(isEditing);
  const [prevIsEditing, setPrevIsEditing] = useState(isEditing);

  if (isEditing !== prevIsEditing) {
    setPrevIsEditing(isEditing);
    setOpen(isEditing);
  }

  return (
    <div className="relative z-30">
      {isEditing ? (
        <Link
          href="/admin/products"
          className="inline-block rounded bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Close
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
        >
          {open ? "Close" : toggleLabel}
        </button>
      )}

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 max-h-[75vh] w-80 overflow-y-auto rounded border border-rose-100 bg-rose-50 p-6 shadow-2xl">
          <h2 className="mb-4 text-lg font-semibold">{title}</h2>
          {children}
        </div>
      )}
    </div>
  );
}
