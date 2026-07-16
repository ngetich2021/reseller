import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductRow } from "@/components/product-row";
import { CategorySubCategorySelect } from "@/components/category-subcategory-select";
import { AdminFormPanel } from "@/components/admin-form-panel";
import { AdminSearchInput } from "@/components/admin-search-input";
import { NoAccess } from "@/components/no-access";
import { SubmitButton } from "@/components/submit-button";
import { OfferFields } from "@/components/offer-fields";
import { getSessionUser } from "@/lib/dal";
import { expireDueOffers } from "@/lib/offers";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  endOffer,
} from "./actions";

function toDatetimeLocalValue(date: Date | null | undefined) {
  if (!date) return undefined;
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; edit?: string }>;
}) {
  const user = await getSessionUser();
  if (!user?.permissions.includes("PRODUCTS")) {
    return <NoAccess section="products" />;
  }

  const { q, edit } = await searchParams;

  await expireDueOffers();

  const now = new Date();

  const [products, categories, editing] = await Promise.all([
    prisma.product.findMany({
      where: q ? { name: { contains: q } } : undefined,
      include: { category: true, subCategory: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      include: { subCategories: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    }),
    edit ? prisma.product.findUnique({ where: { id: edit } }) : null,
  ]);

  const inputClass = "w-full rounded border border-zinc-300 px-3 py-1.5";

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-sm flex-1">
          <AdminSearchInput />
        </div>

        <AdminFormPanel
          title={editing ? "Edit product" : "Add product"}
          toggleLabel="+ Add product"
          isEditing={Boolean(editing)}
        >
          <form
            key={editing?.id ?? "new"}
            action={
              editing ? updateProduct.bind(null, editing.id) : createProduct
            }
            className="flex flex-col gap-4"
          >
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
              <label className="block text-sm font-semibold">
                description
              </label>
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
              <label className="block text-sm font-semibold">
                price (ksh)
              </label>
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
                  optional, permanent &quot;was&quot; price shown struck
                  through regardless of any offer
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
              defaultOfferEndsAt={toDatetimeLocalValue(editing?.offerEndsAt)}
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
        </AdminFormPanel>
      </div>

      <div>
        <div className="overflow-x-auto rounded border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-zinc-50 font-semibold">
              <tr>
                <th className="sticky left-0 z-20 w-12 min-w-12 bg-zinc-50 px-4 py-3">
                  s/no
                </th>
                <th className="sticky left-12 z-20 w-20 min-w-20 bg-zinc-50 px-4 py-3 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]">
                  image
                </th>
                <th className="sticky left-32 z-20 w-32 min-w-32 bg-zinc-50 px-4 py-3 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]">
                  name
                </th>
                <th className="relative z-0 px-4 py-3">location</th>
                <th className="relative z-0 px-4 py-3">description</th>
                <th className="relative z-0 px-4 py-3">offer</th>
                <th className="relative z-0 px-4 py-3 text-right">actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => {
                const isActiveOffer =
                  p.onOffer && p.offerEndsAt && p.offerEndsAt.getTime() > now.getTime();
                const isExpiredOffer =
                  p.onOffer && p.offerEndsAt && p.offerEndsAt.getTime() <= now.getTime();
                return (
                  <ProductRow
                    key={p.id}
                    product={p}
                    index={i + 1}
                    isActiveOffer={Boolean(isActiveOffer)}
                    isExpiredOffer={Boolean(isExpiredOffer)}
                    editHref={`/admin/products?edit=${p.id}`}
                    deleteAction={deleteProduct.bind(null, p.id)}
                    extraActions={
                      isActiveOffer
                        ? [{ label: "End offer now", action: endOffer.bind(null, p.id) }]
                        : []
                    }
                  />
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
