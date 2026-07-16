import { prisma } from "@/lib/prisma";

export async function expireDueOffers() {
  const result = await prisma.product.updateMany({
    where: { onOffer: true, offerEndsAt: { lte: new Date() } },
    data: { onOffer: false, offerPrice: null },
  });

  return result.count;
}

export async function endProductOfferNow(productId: string) {
  const result = await prisma.product.updateMany({
    where: { id: productId, onOffer: true },
    data: { onOffer: false, offerPrice: null },
  });

  return result.count > 0;
}
