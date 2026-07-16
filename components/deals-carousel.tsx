import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { OfferCountdown } from "@/components/offer-countdown";

type DealProduct = {
  id: string;
  name: string;
  offerPrice: number;
  originalPrice: number;
  imageUrl: string;
  offerEndsAt: Date;
};

export function DealsCarousel({ products }: { products: DealProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section className="border-b border-zinc-200 bg-white px-6 py-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          Today&apos;s Deals
        </h2>
        <Link
          href="/?deals=1"
          className="flex items-center gap-1 text-sm font-semibold text-amber-600 hover:underline"
        >
          See All <span aria-hidden>&rarr;</span>
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map((product, index) => {
          const discount = Math.round(
            (1 - product.offerPrice / product.originalPrice) * 100
          );
          return (
            <Link
              key={product.id}
              href="/?deals=1"
              className="w-36 shrink-0 rounded-xl border border-zinc-200 bg-white p-2 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 sm:w-44"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-white dark:bg-zinc-950">
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  sizes="176px"
                  priority={index === 0}
                />
                {discount > 0 && (
                  <span className="absolute right-1.5 top-1.5 z-10 rounded-md bg-orange-100 px-1.5 py-0.5 text-[11px] font-bold text-orange-800">
                    -{discount}%
                  </span>
                )}
              </div>
              <p className="mt-2 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
                {product.name}
              </p>
              <p className="font-bold text-zinc-900 dark:text-zinc-50">
                KSh {product.offerPrice.toLocaleString()}
              </p>
              <p className="-mt-0.5 text-xs text-zinc-400 line-through">
                KSh {product.originalPrice.toLocaleString()}
              </p>
              <OfferCountdown
                endsAt={product.offerEndsAt.toISOString()}
                className="mt-0.5 block text-[11px] font-semibold text-red-600"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
