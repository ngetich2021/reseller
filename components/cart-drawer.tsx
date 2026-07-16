"use client";

import { useCart } from "@/lib/cart-context";
import { CartPanel } from "@/components/cart-panel";

export function CartDrawer() {
  const { isOpen, closeCart } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/50"
      />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-zinc-50 shadow-2xl dark:bg-black">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Your Cart
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <CartPanel />
        </div>
      </div>
    </div>
  );
}
