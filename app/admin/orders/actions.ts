"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/dal";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const SHIPPING_FEE = 100;
const MAX_OVERAGE = 500;

const orderSchema = z.object({
  customer: z.string().trim().min(1),
  location: z.string().trim().min(1),
  deliveryMessage: z.string().trim().optional(),
  status: z.enum(["PENDING", "DELIVERED", "CANCELLED"]),
  paid: z.coerce.number().int().nonnegative(),
  tel: z.string().trim().min(1),
  commMeans: z.enum(["SMS", "CALL", "WHATSAPP"]),
});

function parseOrder(formData: FormData) {
  return orderSchema.parse({
    customer: formData.get("customer"),
    location: formData.get("location"),
    deliveryMessage: formData.get("deliveryMessage") || undefined,
    status: formData.get("status"),
    paid: formData.get("paid"),
    tel: formData.get("tel"),
    commMeans: formData.get("commMeans"),
  });
}

function assertPaidInRange(paid: number, itemsTotal: number) {
  const min = itemsTotal + SHIPPING_FEE;
  const max = min + MAX_OVERAGE;
  if (paid < min || paid > max) {
    throw new Error(
      `Paid must be between ${min} and ${max} (items total ${itemsTotal} + ${SHIPPING_FEE} shipping, up to ${MAX_OVERAGE} over).`,
    );
  }
}

export async function createOrder(formData: FormData) {
  await assertPermission("ORDERS");
  const data = parseOrder(formData);
  assertPaidInRange(data.paid, 0);
  await prisma.order.create({ data });
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

export async function updateOrder(id: string, formData: FormData) {
  await assertPermission("ORDERS");
  const data = parseOrder(formData);
  const existing = await prisma.order.findUniqueOrThrow({
    where: { id },
    include: { items: true },
  });
  const itemsTotal = existing.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  assertPaidInRange(data.paid, itemsTotal);
  await prisma.order.update({ where: { id }, data });
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

export async function deleteOrder(id: string, _formData: FormData) {
  await assertPermission("ORDERS");
  await prisma.order.delete({ where: { id } });
  revalidatePath("/admin/orders");
}
