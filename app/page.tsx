import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";
import { ProductCard } from "@/components/product-card";
import { StorefrontFilters } from "@/components/storefront-filters";
import { ContactBar } from "@/components/contact-bar";
import { CartLink } from "@/components/cart-link";
import { DealsCarousel } from "@/components/deals-carousel";
import { InstallPwaButton } from "@/components/install-pwa-button";
import { expireDueOffers } from "@/lib/offers";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    subCategory?: string;
    sort?: string;
    deals?: string;
    q?: string;
  }>;
}) {
  const { category, subCategory, sort, deals, q } = await searchParams;
  const dealsOnly = deals === "1";
  const now = new Date();

  await expireDueOffers();

  const [categories, products, dealProducts] = await Promise.all([
    prisma.category.findMany({
      include: { subCategories: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: {
        categoryId: category || undefined,
        subCategoryId: subCategory || undefined,
        ...(dealsOnly ? { onOffer: true, offerEndsAt: { gt: now } } : {}),
        OR: q
          ? [
              { name: { contains: q } },
              { description: { contains: q } },
              { location: { contains: q } },
              { category: { name: { contains: q } } },
              { subCategory: { name: { contains: q } } },
            ]
          : undefined,
      },
      orderBy:
        sort === "price-asc"
          ? { price: "asc" }
          : sort === "price-desc"
            ? { price: "desc" }
            : { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { onOffer: true, offerEndsAt: { gt: now } },
      orderBy: { offerEndsAt: "asc" },
      take: 10,
    }),
  ]);

  const showCarousel = !dealsOnly && dealProducts.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-3">
          <Image
            src="/image.png"
            alt={`${siteConfig.name} logo`}
            width={225}
            height={185}
            className="h-10 w-auto"
            priority
          />
          <h1 className="text-2xl font-serif font-semibold text-zinc-900 dark:text-zinc-50">
            {siteConfig.tagline}
          </h1>
        </div>
        <p className="font-medium text-zinc-800 dark:text-zinc-200">
          {siteConfig.deliveryFee}
        </p>
        <div className="flex items-center gap-3">
          <ContactBar />
          <CartLink />
        </div>
      </header>

      <div className="border-y-2 border-emerald-500 bg-black px-4 py-3 text-center text-white">
        <p className="font-bold">
          Ask us anything(even if not here), call or sms
        </p>
        <p className="text-sm">{siteConfig.deliveryNote}</p>
      </div>

      {showCarousel && (
        <DealsCarousel
          products={dealProducts.filter(
            (p): p is typeof p & {
              originalPrice: number;
              offerPrice: number;
              offerEndsAt: Date;
            } =>
              p.originalPrice != null &&
              p.offerPrice != null &&
              p.offerEndsAt != null
          )}
        />
      )}

      <StorefrontFilters categories={categories} />

      <main className="flex-1 px-6 py-8">
        {q && (
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">
              Search results for &quot;{q}&quot;
            </p>
            <Link href="/" className="text-sm text-zinc-500 hover:underline">
              Clear search
            </Link>
          </div>
        )}
        {dealsOnly && (
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">
              Showing deals only
            </p>
            <Link href="/" className="text-sm text-zinc-500 hover:underline">
              Clear filter
            </Link>
          </div>
        )}
        {products.length === 0 ? (
          <p className="py-16 text-center text-zinc-500">
            No products found.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={!showCarousel && index === 0}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-200 py-4 text-center text-sm text-zinc-500 dark:border-zinc-800">
        <p>
          developed with love by {siteConfig.developer} . copy right @
          {siteConfig.copyrightYear} call {siteConfig.callNumber}
        </p>
        <div className="mt-1 flex items-center justify-center gap-4">
          <Link
            href="/admin"
            className="text-xs text-zinc-400 hover:text-zinc-600 hover:underline dark:hover:text-zinc-300"
          >
            Admin login
          </Link>
          <InstallPwaButton />
        </div>
      </footer>
    </div>
  );
}
