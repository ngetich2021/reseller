"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/dal";
import { revalidatePath } from "next/cache";

const categorySchema = z.object({ name: z.string().trim().min(1) });
const subCategorySchema = z.object({
  name: z.string().trim().min(1),
  categoryId: z.string().min(1),
});

export async function createCategory(formData: FormData) {
  await assertPermission("CATEGORIES");
  const { name } = categorySchema.parse({ name: formData.get("name") });
  await prisma.category.create({ data: { name } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function deleteCategory(id: string, _formData: FormData) {
  await assertPermission("CATEGORIES");
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function createSubCategory(formData: FormData) {
  await assertPermission("CATEGORIES");
  const { name, categoryId } = subCategorySchema.parse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
  });
  await prisma.subCategory.create({ data: { name, categoryId } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function deleteSubCategory(id: string, _formData: FormData) {
  await assertPermission("CATEGORIES");
  await prisma.subCategory.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}
