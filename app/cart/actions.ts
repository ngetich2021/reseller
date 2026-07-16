"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { isValidPhone } from "@/lib/validation";

const cartItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().trim().min(1),
  price: z.coerce.number().int().nonnegative(),
  quantity: z.coerce.number().int().positive(),
});

const placeOrderSchema = z.object({
  customer: z.string().trim().min(2, "Please enter your name."),
  location: z.string().trim().min(3, "Please enter a delivery location."),
  tel: z.string().trim().refine(isValidPhone, "Please enter a valid phone number."),
  deliveryMessage: z.string().trim().optional(),
  items: z.array(cartItemSchema).min(1),
});

export async function placeOrder(input: z.infer<typeof placeOrderSchema>) {
  const data = placeOrderSchema.parse(input);

  const order = await prisma.order.create({
    data: {
      customer: data.customer,
      location: data.location,
      tel: data.tel,
      deliveryMessage: data.deliveryMessage,
      commMeans: "WHATSAPP",
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    },
  });

  revalidatePath("/admin/orders");

  return { orderId: order.id };
}
