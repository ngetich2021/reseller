import Link from "next/link";
import { CartPanel } from "@/components/cart-panel";

export default function CartPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 bg-zinc-50 px-4 py-8 dark:bg-black">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Your Cart
        </h1>
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          Continue shopping
        </Link>
      </div>

      <CartPanel />
    </div>
  );
}
