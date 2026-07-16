"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/dal";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { endProductOfferNow } from "@/lib/offers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const productSchema = z
  .object({
    name: z.string().trim().min(1),
    description: z.string().trim().min(1),
    location: z.string().trim().min(1),
    price: z.coerce.number().int().nonnegative(),
    originalPrice: z.coerce.number().int().nonnegative().optional(),
    onOffer: z.boolean().default(false),
    offerPrice: z.coerce.number().int().nonnegative().optional(),
    offerEndsAt: z
      .string()
      .optional()
      .transform((v) => (v ? new Date(v) : undefined)),
    categoryId: z.string().optional(),
    subCategoryId: z.string().optional(),
  })
  .refine(
    (data) => !data.originalPrice || data.originalPrice > data.price,
    { message: "Original price must be higher than price", path: ["originalPrice"] }
  )
  .refine((data) => !data.onOffer || data.offerPrice != null, {
    message: "Offer price is required for an on-offer product",
    path: ["offerPrice"],
  })
  .refine(
    (data) =>
      !data.onOffer || (data.offerPrice != null && data.offerPrice < data.price),
    {
      message: "Offer price must be lower than the regular price",
      path: ["offerPrice"],
    }
  )
  .refine(
    (data) =>
      !data.onOffer ||
      (data.offerEndsAt && data.offerEndsAt.getTime() > Date.now()),
    {
      message: "Offer end date/time must be set in the future",
      path: ["offerEndsAt"],
    }
  )
  .transform((data) => ({
    ...data,
    offerPrice: data.onOffer ? data.offerPrice! : null,
  }));

export type ProductFormState = { error?: string };

function parseProduct(formData: FormData) {
  return productSchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
    location: formData.get("location"),
    price: formData.get("price"),
    originalPrice: formData.get("originalPrice") || undefined,
    onOffer: formData.get("onOffer") === "on",
    offerPrice: formData.get("offerPrice") || undefined,
    offerEndsAt: formData.get("offerEndsAt") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    subCategoryId: formData.get("subCategoryId") || undefined,
  });
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await assertPermission("PRODUCTS");

  try {
    const data = parseProduct(formData);

    const image = formData.get("image");
    if (!(image instanceof File) || image.size === 0) {
      return { error: "Image is required" };
    }
    const uploaded = await uploadImage(image);

    await prisma.product.create({
      data: {
        ...data,
        imageUrl: uploaded.url,
        imagePublicId: uploaded.publicId,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { error: err.issues[0]?.message ?? "Invalid input" };
    }
    throw err;
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateProduct(
  id: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await assertPermission("PRODUCTS");

  try {
    const data = parseProduct(formData);

    const image = formData.get("image");
    let imageFields: { imageUrl: string; imagePublicId: string } | undefined;

    if (image instanceof File && image.size > 0) {
      const existing = await prisma.product.findUnique({
        where: { id },
        select: { imagePublicId: true },
      });
      const uploaded = await uploadImage(image);
      imageFields = { imageUrl: uploaded.url, imagePublicId: uploaded.publicId };
      if (existing?.imagePublicId) {
        await deleteImage(existing.imagePublicId).catch(() => {});
      }
    }

    await prisma.product.update({
      where: { id },
      data: { ...data, ...imageFields },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { error: err.issues[0]?.message ?? "Invalid input" };
    }
    throw err;
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function endOffer(id: string, _formData: FormData) {
  await assertPermission("PRODUCTS");
  await endProductOfferNow(id);
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function deleteProduct(id: string, _formData: FormData) {
  await assertPermission("PRODUCTS");
  const existing = await prisma.product.findUnique({
    where: { id },
    select: { imagePublicId: true },
  });
  await prisma.product.delete({ where: { id } });
  if (existing?.imagePublicId) {
    await deleteImage(existing.imagePublicId).catch(() => {});
  }
  revalidatePath("/admin/products");
  revalidatePath("/");
}
