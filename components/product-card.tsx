"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/lib/cart-context";
import { ProductImage } from "@/components/product-image";
import { OfferCountdown } from "@/components/offer-countdown";

type ProductCardData = {
  id: string;
  name: string;
  description: string;
  location: string;
  price: number;
  originalPrice?: number | null;
  imageUrl: string;
  onOffer?: boolean;
  offerPrice?: number | null;
  offerEndsAt?: Date | null;
};

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" className="shrink-0">
      <path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="shrink-0">
      <path d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.44c-.16.28-.25.61-.25.97 0 1.1.9 2 2 2h12v-2h-11.58c-.13 0-.24-.11-.24-.24 0-.03.01-.06.02-.09l.94-1.67h7.45c.75 0 1.41-.42 1.75-1.03l3.24-5.88c.09-.16.14-.35.14-.55 0-.55-.45-1-1-1h-14.42l-.94-2zm2.36 15c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );
}

export function ProductCard({
  product,
  priority,
}: {
  product: ProductCardData;
  priority?: boolean;
}) {
  const { items, addItem, openCart } = useCart();
  const [expanded, setExpanded] = useState(false);

  const features = product.description
    .split(/\n|,/)
    .map((f) => f.trim())
    .filter(Boolean);

  const inCart = items.find((i) => i.productId === product.id);
  const offerActive =
    Boolean(product.onOffer) &&
    Boolean(product.offerEndsAt) &&
    product.offerEndsAt!.getTime() > Date.now();
  const effectivePrice =
    offerActive && product.offerPrice != null ? product.offerPrice : product.price;
  const discount = product.originalPrice
    ? Math.round((1 - effectivePrice / product.originalPrice) * 100)
    : null;

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: effectivePrice,
      imageUrl: product.imageUrl,
    });
  }

  function handleAdjustInCart(e: React.MouseEvent) {
    e.stopPropagation();
    openCart();
  }

  return (
    <>
      <div
        onClick={() => setExpanded(true)}
        className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="relative aspect-square overflow-hidden bg-white dark:bg-zinc-950">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
          />
          {discount != null && discount > 0 && (
            <span className="absolute right-2 top-2 z-10 rounded-md bg-orange-100 px-1.5 py-0.5 text-[11px] font-bold text-orange-800">
              -{discount}%
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <p className="line-clamp-1 text-sm text-zinc-500 dark:text-zinc-400">
            {product.name}
          </p>
          <p className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            KSh {effectivePrice.toLocaleString()}
          </p>
          {product.originalPrice && (
            <p className="-mt-1 text-xs text-zinc-400 line-through">
              KSh {product.originalPrice.toLocaleString()}
            </p>
          )}
          {product.onOffer && product.offerEndsAt && (
            <OfferCountdown
              endsAt={product.offerEndsAt.toISOString()}
              className="text-xs font-semibold text-red-600"
            />
          )}
          {features.length > 0 && (
            <p className="line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
              {features.join(" • ")}
            </p>
          )}
          <p className="flex items-center gap-1 text-xs text-zinc-500">
            <PinIcon />
            <span className="line-clamp-1">{product.location}</span>
          </p>
          {inCart ? (
            <button
              type="button"
              onClick={handleAdjustInCart}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              In cart ({inCart.quantity})
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-900 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <CartIcon />
              Add to Cart
            </button>
          )}
        </div>
      </div>

      {expanded &&
        createPortal(
          <div
            onClick={() => setExpanded(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[90vh] w-full max-w-sm flex-col overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-zinc-900"
            >
              <div className="relative aspect-square shrink-0 bg-white dark:bg-zinc-950">
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  sizes="384px"
                />
                {discount != null && discount > 0 && (
                  <span className="absolute left-2 top-2 z-10 rounded-md bg-orange-100 px-2 py-1 text-xs font-bold text-orange-800">
                    -{discount}%
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  aria-label="Close"
                  className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-lg text-white"
                >
                  ×
                </button>
              </div>
              <div className="flex flex-col gap-1 p-4">
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {product.name}
                </p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  KSh {effectivePrice.toLocaleString()}
                </p>
                {product.originalPrice && (
                  <p className="-mt-1 text-sm text-zinc-400 line-through">
                    KSh {product.originalPrice.toLocaleString()}
                  </p>
                )}
                {features.length > 0 && (
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    <p className="font-medium text-zinc-800 dark:text-zinc-200">
                      Key Features
                    </p>
                    <ul className="list-disc pl-4">
                      {features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="flex items-center gap-1 pt-3 text-sm font-medium text-zinc-500">
                  <PinIcon />
                  {product.location}
                </p>
                {inCart ? (
                  <button
                    type="button"
                    onClick={handleAdjustInCart}
                    className="mt-3 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                  >
                    In cart ({inCart.quantity}) · adjust in cart
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    <CartIcon />
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
