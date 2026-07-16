import { prisma } from "@/lib/prisma";
import { ProductRow } from "@/components/product-row";
import { AdminFormPanel } from "@/components/admin-form-panel";
import { AdminSearchInput } from "@/components/admin-search-input";
import { NoAccess } from "@/components/no-access";
import { ProductForm } from "@/components/product-form";
import { getSessionUser } from "@/lib/dal";
import { expireDueOffers } from "@/lib/offers";
import { deleteProduct, endOffer } from "./actions";

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
          <ProductForm
            key={editing?.id ?? "new"}
            editing={editing}
            offerEndsAt={editing?.offerEndsAt}
            categories={categories}
            inputClass={inputClass}
          />
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
