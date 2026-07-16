"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CategorySubCategorySelect } from "@/components/category-subcategory-select";
import { SubmitButton } from "@/components/submit-button";
import { OfferFields } from "@/components/offer-fields";
import {
  createProduct,
  updateProduct,
  type ProductFormState,
} from "@/app/admin/products/actions";

type CategoryWithSub = {
  id: string;
  name: string;
  subCategories: { id: string; name: string }[];
};

type EditingProduct = {
  id: string;
  name: string;
  description: string;
  location: string;
  price: number;
  originalPrice: number | null;
  onOffer: boolean;
  offerPrice: number | null;
  categoryId: string | null;
  subCategoryId: string | null;
};

const initialState: ProductFormState = {};

function toDatetimeLocalValue(date: Date | null | undefined) {
  if (!date) return undefined;
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function ProductForm({
  editing,
  offerEndsAt,
  categories,
  inputClass,
}: {
  editing?: EditingProduct | null;
  offerEndsAt?: Date | null;
  categories: CategoryWithSub[];
  inputClass: string;
}) {
  const action = editing ? updateProduct.bind(null, editing.id) : createProduct;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-semibold">name</label>
        <input
          name="name"
          defaultValue={editing?.name}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold">description</label>
        <textarea
          name="description"
          defaultValue={editing?.description}
          required
          rows={3}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold">location</label>
        <input
          name="location"
          defaultValue={editing?.location}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold">price (ksh)</label>
        <input
          type="number"
          name="price"
          defaultValue={editing?.price}
          required
          min={0}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold">
          original price (ksh){" "}
          <span className="font-normal text-zinc-500">
            optional, permanent &quot;was&quot; price shown struck through
            regardless of any offer
          </span>
        </label>
        <input
          type="number"
          name="originalPrice"
          defaultValue={editing?.originalPrice ?? undefined}
          min={0}
          className={inputClass}
        />
      </div>
      <OfferFields
        defaultChecked={editing?.onOffer ?? false}
        defaultOfferPrice={editing?.offerPrice ?? undefined}
        defaultOfferEndsAt={toDatetimeLocalValue(offerEndsAt)}
        inputClass={inputClass}
      />
      <CategorySubCategorySelect
        categories={categories}
        defaultCategoryId={editing?.categoryId ?? undefined}
        defaultSubCategoryId={editing?.subCategoryId ?? undefined}
      />
      <div>
        <label className="block text-sm font-semibold">
          image {editing && "(leave blank to keep current)"}
        </label>
        <input
          type="file"
          name="image"
          accept="image/*"
          required={!editing}
          className="w-full"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <SubmitButton
        pendingLabel={editing ? "Saving…" : "Adding…"}
        className="flex items-center justify-center gap-2 rounded bg-zinc-900 py-2 font-semibold text-white disabled:opacity-60"
      >
        {editing ? "Save" : "Add"}
      </SubmitButton>
      {editing && (
        <Link
          href="/admin/products"
          className="text-center text-sm text-zinc-500 underline"
        >
          Cancel
        </Link>
      )}
    </form>
  );
}
