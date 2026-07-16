"use client";

import { useCart } from "@/lib/cart-context";

export function CartLink() {
  const { count, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label="Cart"
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition-colors hover:bg-zinc-900 hover:text-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-white dark:hover:text-black"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.44c-.16.28-.25.61-.25.97 0 1.1.9 2 2 2h12v-2h-11.58c-.13 0-.24-.11-.24-.24 0-.03.01-.06.02-.09l.94-1.67h7.45c.75 0 1.41-.42 1.75-1.03l3.24-5.88c.09-.16.14-.35.14-.55 0-.55-.45-1-1-1h-14.42l-.94-2zm2.36 15c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );
}
