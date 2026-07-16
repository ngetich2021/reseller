"use client";

import Image from "next/image";

type ProductDetailsData = {
  name: string;
  description: string;
  location: string;
  price: number;
  originalPrice: number | null;
  onOffer: boolean;
  offerPrice: number | null;
  offerEndsAt: Date | null;
  imageUrl: string;
  category: { name: string } | null;
  subCategory: { name: string } | null;
};

export function ProductDetailsModal({
  product,
  onClose,
}: {
  product: ProductDetailsData;
  onClose: () => void;
}) {
  const now = new Date();
  const offerActive =
    product.onOffer &&
    product.offerEndsAt != null &&
    product.offerEndsAt.getTime() > now.getTime();
  const effectivePrice =
    offerActive && product.offerPrice != null ? product.offerPrice : product.price;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-sm flex-col overflow-y-auto rounded-xl bg-white shadow-2xl"
      >
        <div className="relative aspect-square shrink-0 bg-zinc-100">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="384px"
            className="object-cover"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-lg text-white"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-3 p-4 text-sm">
          <p className="text-lg font-semibold text-zinc-900">{product.name}</p>

          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-zinc-900">
              KSh {effectivePrice.toLocaleString()}
            </p>
            {product.originalPrice != null && (
              <p className="text-sm text-zinc-400 line-through">
                KSh {product.originalPrice.toLocaleString()}
              </p>
            )}
          </div>

          <div>
            <p className="font-semibold text-zinc-700">Description</p>
            <p className="whitespace-pre-line text-zinc-600">
              {product.description}
            </p>
          </div>

          <div>
            <p className="font-semibold text-zinc-700">Location</p>
            <p className="text-zinc-600">{product.location}</p>
          </div>

          <div>
            <p className="font-semibold text-zinc-700">Category</p>
            <p className="text-zinc-600">
              {product.category?.name ?? "—"}
              {product.subCategory && ` › ${product.subCategory.name}`}
            </p>
          </div>

          <div>
            <p className="font-semibold text-zinc-700">Offer</p>
            {product.onOffer ? (
              <p className="text-zinc-600">
                KSh {product.offerPrice?.toLocaleString()} until{" "}
                {product.offerEndsAt?.toLocaleString()}
                {!offerActive && " (expired)"}
              </p>
            ) : (
              <p className="text-zinc-400">Not on offer</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
