import { prisma } from "@/lib/prisma";
import { AdminFormPanel } from "@/components/admin-form-panel";
import { AdminSearchInput } from "@/components/admin-search-input";
import { NoAccess } from "@/components/no-access";
import { CategoryCard } from "@/components/category-card";
import { SubmitButton } from "@/components/submit-button";
import { getSessionUser } from "@/lib/dal";
import { createCategory } from "./actions";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getSessionUser();
  if (!user?.permissions.includes("CATEGORIES")) {
    return <NoAccess section="categories" />;
  }

  const { q } = await searchParams;

  const categories = await prisma.category.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { subCategories: { some: { name: { contains: q } } } },
          ],
        }
      : undefined,
    include: { subCategories: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });

  const inputClass = "w-full rounded border border-zinc-300 px-3 py-1.5";

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-sm flex-1">
          <AdminSearchInput placeholder="Search categories" />
        </div>

        <AdminFormPanel
          title="Add category"
          toggleLabel="+ Add category"
          isEditing={false}
        >
          <form action={createCategory} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold">name</label>
              <input name="name" required className={inputClass} />
            </div>
            <SubmitButton
              pendingLabel="Adding…"
              className="flex items-center justify-center gap-2 rounded bg-zinc-900 py-2 font-semibold text-white disabled:opacity-60"
            >
              Add
            </SubmitButton>
          </form>
        </AdminFormPanel>
      </div>

      <div className="flex-1 space-y-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            inputClass={inputClass}
          />
        ))}

        {categories.length === 0 && (
          <p className="text-zinc-400">No categories yet.</p>
        )}
      </div>
    </div>
  );
}
